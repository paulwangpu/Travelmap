const fs=require('fs'),clip=require('polygon-clipping');
require('../ethnic-regions.js');
const d=JSON.parse(fs.readFileSync('data/language-areas.geojson')),byId=new Map(d.features.map(f=>[f.properties.languageId,f]));
const polygons=f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
let count=0;
for(const f of d.features){
 const p=f.properties;delete p.dialectResidualGeometry;
 if(p.entryKind!=='dialect-area')continue;
 const parents=(p.kinPath||[]).slice(0,-1).map(id=>byId.get(id)).filter(g=>g&&g.properties.entryKind!=='family-area'&&EthnicRegions.color(g.properties,'affinity')===EthnicRegions.color(p,'affinity'));
 if(!parents.length)continue;
 p.dialectResidualGeometry={type:'MultiPolygon',coordinates:clip.difference(polygons(f),...parents.map(polygons))};count++;
}
fs.writeFileSync('data/language-areas.geojson',JSON.stringify(d));console.log('Prepared dialect residuals:',count);
