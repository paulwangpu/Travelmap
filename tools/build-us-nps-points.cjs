// Rebuild only missing map anchors. Existing coordinates and checklist IDs stay intact.
const fs = require('node:fs');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const catalog = read('data/us-nps-units.json');
const preserved = new Set(read('docs/us-nps-point-coverage.json').preservedUnitIds);
const missing = new Set(catalog.units.filter(u => !preserved.has(u.id)).map(u => u.id));
// Supply the complete GeoJSON response from the public query recorded in the audit.
if (!process.argv[2]) throw Error('Usage: node tools/build-us-nps-points.cjs <complete-nps-public-pois.geojson>');
const pois = read(process.argv[2]);
if (pois.exceededTransferLimit || !Array.isArray(pois.features)) throw Error('Incomplete POI response');
const boundaries = read('data/us-nps-boundaries.geojson').features;
const service = 'https://mapservices.nps.gov/arcgis/rest/services/NationalDatasets/NPS_Public_POIs_Geographic/FeatureServer/0';
const rank = p => ({'Visitor Center':0,'Visitor Contact Station':1,'Information Center':1,'Museum':2,'Ranger Station':3,'Memorial':4,'Monument':5,'Historic Building':6}[String(p.POITYPE).trim()] ?? 99);
function interior(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  let best = null, bestWidth = 0;
  for (const rings of polygons) {
    const ys = rings[0].map(p => p[1]), lo = Math.min(...ys), hi = Math.max(...ys);
    for (const t of [.25,.375,.5,.625,.75]) {
      const y = lo + (hi-lo)*t, xs = [];
      for (const ring of rings) for (let i=0,j=ring.length-1;i<ring.length;j=i++) {
        const a=ring[j],b=ring[i];
        if ((a[1]>y)!==(b[1]>y)) xs.push(a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]));
      }
      xs.sort((a,b)=>a-b);
      for(let i=0;i+1<xs.length;i+=2) if(xs[i+1]-xs[i]>bestWidth) {
        bestWidth=xs[i+1]-xs[i];best=[(xs[i]+xs[i+1])/2,y];
      }
    }
  }
  return best;
}
const special = {
  GREG: [39.3042,-74.6497,'河流地望（非入口）','https://www.recreation.gov/gateways/12723'],
  NATT: [34.33029,-88.71001,'官方步道导航参照点','https://www.recreation.gov/gateways/5448'],
  POHE: [39.150601,-77.523011,'官方行政联络地点（非步道入口）','https://www.recreation.gov/gateways/2862'],
};
const counts = {};
for (const unit of catalog.units) {
  if (!missing.has(unit.id)) continue;
  const candidates = pois.features.filter(f=>[unit.code,...unit.alternateCodes||[]].includes(String(f.properties.UNITCODE).toUpperCase()) && f.geometry?.type==='Point');
  candidates.sort((a,b)=>rank(a.properties)-rank(b.properties)||String(a.properties.POINAME).localeCompare(String(b.properties.POINAME)));
  const poi=candidates[0];
  if (poi) {
    const [lng,lat]=poi.geometry.coordinates;
    unit.mapPoint={lat,lng,kind:'official-poi',label:poi.properties.POINAME||poi.properties.POITYPE,sourceUrl:service,sourceUnitCode:poi.properties.UNITCODE,checked:'2026-10-23'};
  } else {
    const boundary=boundaries.find(f=>[unit.code,...unit.alternateCodes||[]].includes(f.properties.code)||f.properties.name===unit.name||unit.code==='NACE'&&f.properties.code==='NACA');
    const xy=boundary&&interior(boundary.geometry);
    if(xy) unit.mapPoint={lat:xy[1],lng:xy[0],kind:'boundary-reference',label:'园区范围代表点（非入口）',sourceUrl:'https://www.nps.gov/subjects/gisandmapping/tools-and-data.htm',sourceBoundaryCode:boundary.properties.code,checked:'2026-10-23'};
    else if(special[unit.code]) {
      const [lat,lng,label,sourceUrl]=special[unit.code];
      unit.mapPoint={lat,lng,label,sourceUrl,kind:'official-reference',checked:'2026-10-23'};
    } else throw Error('No source point: '+unit.code);
  }
  counts[unit.mapPoint.kind]=(counts[unit.mapPoint.kind]||0)+1;
}
catalog.mapPointsUpdated='2026-10-23';
fs.writeFileSync('data/us-nps-units.json',JSON.stringify(catalog,null,2)+'\n');
fs.writeFileSync('docs/us-nps-point-coverage.json',JSON.stringify({checked:'2026-10-23',existing:catalog.total-missing.size,added:missing.size,counts,source:service,preservedUnitIds:[...preserved],query:{where:"POITYPE IN ('Visitor Center','Visitor Contact Station','Ranger Station','Museum','Memorial','Monument','Historic Building','Information Center')",outFields:'UNITCODE,POINAME,POITYPE,FEATUREID',outSR:4326,f:'geojson',resultRecordCount:2000},notes:'保留已有点位。官方POI选游客中心优先；范围代表点仅用于园区地图定位，不作为入口或游客中心。所有清单身份保持。'},null,2)+'\n');
console.log(JSON.stringify({existing:catalog.total-missing.size,added:missing.size,counts}));
