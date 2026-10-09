const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const H=require('../historical-periods.js');require('../ancient-capital-walls.js');
const catalog=read('data/china-ancient-capitals.json'),research=read('data/ancient-capital-research-extents.geojson'),doc=read('docs/five-capital-supplements.json');
const byId=id=>research.features.find(f=>f.properties.sourceId===id);
assert.equal(doc.addedFeatureIds.length,17);
for(const id of doc.addedFeatureIds){const f=byId(id);assert.ok(f&&f.properties.capitalSiteKey&&/^https:\/\//.test(f.properties.sourceUrl));assert.ok(f.geometry.coordinates.flat(Infinity).every(Number.isFinite));assert.ok(catalog.items.some(i=>i.siteKey===f.properties.capitalSiteKey));}
assert.equal(new Set(catalog.recordItems.map(r=>r.sourceOrder)).size,309);
assert.equal(catalog.recordItems.length,catalog.recordCount);
const datong=catalog.items.find(x=>x.name==='西京大同');assert.deepEqual(datong.records.map(x=>x['政权/国号']),['辽','金']);
const ye=catalog.items.find(x=>x.name==='邺城');assert.match(ye.admin,/河北.*临漳/);assert.ok(ye.lng>114.38&&ye.lng<114.43&&ye.lat>36.27&&ye.lat<36.34);
const chengdu=catalog.items.find(x=>x.name==='成都');assert.ok(chengdu.lat>30.65&&chengdu.lat<30.68,'Chengdu historical reference must not stay in Tianfu New Area');
const xiang=catalog.recordItems.find(x=>x.sourceOrder===10);assert.deepEqual(xiang.boundaryRelations,[],'Uncertain Xiang must not inherit late-Shang palace footprints');
const closed=read('docs/closed-capital-extents-fill.json').converted;
for(const record of closed){const f=byId(record.id);assert.equal(f.geometry.type,'Polygon');assert.deepEqual(f.geometry.coordinates[0],record.originalGeometry.coordinates,'Filling must preserve every original boundary coordinate');}
assert.equal(byId('beijing-youzhou-outline-reference').geometry.type,'Polygon');assert.equal(byId('beijing-youzhou-outline-reference').properties.inferredBoundary,true);
assert.equal(byId('hanwei-inner-south-inferred').geometry.type,'LineString');
assert.equal(byId('osm-way-1051814589').geometry.type,'LineString');
assert.notEqual(H.colors['宋辽金西夏'],H.colors['清']);assert.equal(H.colors['宋辽金西夏'],'#007f86');
const keys=['ancientCapitalShangWalls','ancientCapitalZhouWalls','ancientCapitalQinHanWalls','ancientCapitalHanWeiWalls','ancientCapitalSouthernTangWalls','ancientCapitalTangWalls','ancientCapitalLiaoJinWalls','ancientCapitalYuanWalls','ancientCapitalMingQingWalls'];
const state={mapOverlays:{chinaAncientCapitals:true,ancientCapitalWalls:true,...Object.fromEntries(keys.map(k=>[k,false]))}};
global.fetch=async url=>({ok:true,json:async()=>String(url).includes('research-extents')?research:{type:'FeatureCollection',features:[]}});
const map={getSource:()=>undefined,getLayer:()=>undefined,getStyle:()=>({layers:[]}),addSource:()=>{},addLayer:()=>{},setLayoutProperty:()=>{}};
(async()=>{
 AncientCapitalWalls.init({state:()=>state});await AncientCapitalWalls.sync(map);
 assert.equal(AncientCapitalWalls.collection().features.length,0);
 state.mapOverlays.ancientCapitalSouthernTangWalls=true;
 let f=AncientCapitalWalls.collection().features;
 assert.ok(f.some(x=>x.properties.family==='southerntang'));assert.ok(f.some(x=>x.properties.sourceId==='osm-way-516639265'));
 const inherited=f.find(x=>x.properties.sourceId==='kaifeng-song-inner');assert.equal(inherited.properties.period,'五代十国');assert.match(inherited.properties.label,/五代/);assert.equal(inherited.properties.color,H.colors['五代十国']);
 assert.equal(f.filter(x=>x.properties.sourceId==='osm-way-1204383950').length,1,'Shared Chengdu site must draw once');
 assert.ok(!f.some(x=>x.properties.sourceId==='osm-way-1060426556'),'Southern Song Deshou Palace must not be attributed to Wuyue');
 state.mapOverlays.ancientCapitalSouthernTangWalls=false;state.mapOverlays.ancientCapitalHanWeiWalls=true;
 f=AncientCapitalWalls.collection().features;assert.ok(f.some(x=>x.properties.family==='sixdynasties'));assert.ok(f.every(x=>x.properties.period==='魏晋南北朝'));
 for(const key of keys)state.mapOverlays[key]=true;
 f=AncientCapitalWalls.collection().features;assert.equal(f.filter(x=>x.properties.sourceId==='osm-way-1204383950').length,1);assert.equal(f.filter(x=>x.properties.sourceId==='kaifeng-song-inner').length,1);
 console.log('PASS: five-city provenance, geography, periods, shared geometry, preserved filled rings and independent era controls');
})().catch(e=>{console.error(e);process.exitCode=1});
