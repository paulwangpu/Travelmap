const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto'),read=p=>JSON.parse(fs.readFileSync(p));
require('../historical-periods.js');const Geometry=require('../imperial-tomb-geometry.js'),d=read('data/imperial-tombs/geometry.geojson'),a=read('docs/yinxu-royal-geometry.json'),catalog=read('data/imperial-tombs/catalog.json');
assert.equal(d.features.length,16);assert.deepEqual(d.features,a.features);assert.equal(d.features.filter(f=>f.properties.tombOutline).length,12);assert.equal(d.features.filter(f=>f.properties.kind==='protective-building').length,1);assert.equal(d.features.filter(f=>f.properties.kind==='moat').length,3);assert.equal(d.features.filter(f=>f.properties.kind==='sacrificial-distribution').length,0);
assert.equal(a.satelliteRefinement.traceCount,13);assert.equal(a.previousFeaturesBeforeSatelliteRefinement.length,17);
for(const [id,t]of Object.entries(a.satelliteRefinement.traces)){
 const f=d.features.find(f=>f.properties.sourceId===id);assert(f.properties.geometryBasis.startsWith('satellite-visible-'));assert.equal(f.geometry.coordinates[0].length,t.workPixels.length);
 const n=2**a.satellite.zoom,scale=a.workingScale;
 t.workPixels.forEach(([u,v],i)=>{const x=a.satellite.tileOrigin[0]+u*scale/256,y=a.satellite.tileOrigin[1]+v*scale/256;assert(Math.abs(f.geometry.coordinates[0][i][0]-(x/n*360-180))<1e-10);assert(Math.abs(f.geometry.coordinates[0][i][1]-Math.atan(Math.sinh(Math.PI*(1-2*y/n)))*180/Math.PI)<1e-10)});
}
const hall=d.features.find(f=>f.properties.sourceId==='yin-royal-260');assert.equal(hall.properties.tombOutline,false);assert(hall.properties.note.includes('不等于地下'));assert.equal(hall.geometry.coordinates[0].length,5);
for(const [p,h]of Object.entries(a.baseline))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),h,p+' preserved');
for(const f of d.features){assert(catalog.items.some(x=>x.id===f.properties.tombId));assert(f.geometry.coordinates.flat(Infinity).every(Number.isFinite));if(f.geometry.type==='Polygon')assert.deepEqual(f.geometry.coordinates[0][0],f.geometry.coordinates[0].at(-1));if(f.geometry.type==='MultiLineString')assert(f.geometry.coordinates.every(s=>JSON.stringify(s[0])!==JSON.stringify(s.at(-1))));}
assert(d.features.find(f=>f.properties.sourceId==='yin-royal-1567').properties.note.includes('未完成'));assert(!d.features.some(f=>f.properties.sourceId.includes('27')));
const rows=o=>Geometry.collection(catalog,d,{era:{夏商:true},...o}).features,shapes=o=>rows(o).filter(f=>!f.properties.tombGeometryLabel);
assert.equal(shapes({}).length,16);assert.equal(rows({era:{夏商:false}}).length,0);assert.equal(rows({onlyVisitableChambers:true}).length,0);assert(rows({en:true}).every(f=>!/[\u4e00-\u9fff]/.test(f.properties.name)));
const visited=rows({isVisited:x=>x.id==='shang-m1001'});assert(visited.filter(f=>f.properties.visited).every(f=>f.properties.id==='shang-m1001'));assert(visited.find(f=>f.properties.detailId==='yin-royal-1001').properties.name.startsWith('✓ '));assert(!visited.find(f=>f.properties.detailId==='yin-royal-1002').properties.visited,'visiting one tomb must not visit another or the cemetery');
assert(shapes({}).filter(f=>f.properties.tombOutline&&f.properties.id==='shang-m1001').length===1);assert(rows({}).filter(f=>f.geometry.type==='Point').every(f=>f.properties.tombGeometryLabel),'new points are label anchors, never duplicate tomb icons');
const layers=[];Geometry.layers({getLayer:()=>null,addLayer:l=>layers.push(l)});assert.equal(layers.length,4);assert(layers.every(l=>l.source==='imperial-tombs'));assert(layers.every(l=>l.minzoom>=13));
console.log('PASS: Yin Xu 16 royal details, original catalog/visit ids preserved, open moats, dynasty and chamber filters, shared imperial source, independent tomb visit styling, label-only anchors');

assert.equal(a.moatRefinement.removedDistributionPolygons.length,2);assert.equal(d.features.filter(f=>f.properties.bankEdges&&f.properties.lineStyle==='solid').length,2);assert.equal(d.features.filter(f=>f.properties.uncertainCourse).length,1);assert(d.features.filter(f=>f.properties.kind==='moat').every(f=>f.geometry.type==='MultiLineString'&&f.properties.bankEdges));
