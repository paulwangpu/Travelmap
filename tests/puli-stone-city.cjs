const fs=require('fs'),assert=require('node:assert/strict');
const g=JSON.parse(fs.readFileSync('data/ancient-capital-research-extents.geojson')),d=JSON.parse(fs.readFileSync('docs/puli-stone-city-supplement.json')),s=JSON.parse(fs.readFileSync('data/western-regions-36.json')),p=s.entries.find(e=>e.id==='puli'),a=g.features.filter(f=>f.properties.capitalSiteKey==='western-region:puli');
assert.equal(a.length,5);assert.equal(new Set(a.map(f=>f.properties.sourceId)).size,5);
const inside=(p,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const site=a.find(f=>f.properties.sourceId.endsWith('1429963577'));assert(inside([p.lng,p.lat],site.geometry.coordinates[0]),'Capital reference must fall within mapped site');
assert.equal(p.position,'region');assert.match(p.note,/不认定为汉代王治确址/);
assert.deepEqual(p.historicalStages.map(x=>x.period),['秦汉','魏晋南北朝','隋唐','清']);
for(const f of a){assert(!f.properties.periods.includes('秦汉'));assert(f.properties.osm);assert(f.properties.referenceUrl.startsWith('https://aah.bucea.edu.cn'));assert.deepEqual(f.geometry,d.added.find(x=>x.properties.sourceId===f.properties.sourceId).geometry);}
assert(a.find(f=>f.properties.sourceId.endsWith('785258129')).properties.inferredBoundary,'Park outline must be distinguished from ancient wall');
const lines=a.filter(f=>f.geometry.type==='LineString');assert.equal(lines.length,3);for(const f of lines)assert.notDeepEqual(f.geometry.coordinates[0],f.geometry.coordinates.at(-1));
assert(!a.some(f=>f.properties.sourceId.includes('1058544112')),'Exclude modern detention-center wall');
console.log('PASS: Puli reference inside Stone City, preserved source geometry, era distinction, open walls and excluded modern enclosure');
