const fs=require('node:fs'),assert=require('node:assert/strict');
require('../historical-periods.js');
const Tombs=require('../imperial-tombs.js'),Geometry=require('../imperial-tomb-geometry.js');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const report=read('docs/five-region-supplement.json'),cap=read('data/china-ancient-capitals.json'),catalog=read('data/classical-sites/catalog.json'),geo=read('data/classical-sites/sites.geojson'),t=read('data/imperial-tombs/catalog.json'),g=read('data/imperial-tombs/geometry.geojson');
assert.equal(report.addedCities.length,10);assert.equal(report.addedTombs.length,30);
assert.equal(new Set(t.items.map(x=>x.id)).size,t.items.length);
const ids=new Set(report.addedTombs),rows=t.items.filter(x=>ids.has(x.id));
for(const id of report.addedCities){assert.equal(catalog.sites.filter(x=>x.key===id).length,1);assert.equal(cap.items.filter(x=>x.classicalSiteKey===id).length,1);}
assert.equal(Tombs.mappedItems(t,{},16).filter(x=>ids.has(x.id)).length,25);
assert.equal(new Set([3,16].flatMap(zoom=>Tombs.mappedItems(t,{},zoom).filter(x=>ids.has(x.id)).map(x=>x.id))).size,30,'Groups and child tombs are visible at their intended zoom levels');
for(const item of rows){
 assert(!Tombs.mappedItems(t,{[item.correspondingChinesePeriod]:false},16).some(x=>x.id===item.id));
 assert(!Tombs.mappedItems(t,{},16,{}, {},true,true).some(x=>x.id===item.id),'Site opening never implies original chamber access');
 assert.equal(item.coordinates.precision.horizontalAccuracyMeters,null);
}
assert.equal(rows.find(x=>x.id==='five-nisanzai').coordinates.status,'estimated_wgs84');
assert(rows.find(x=>x.id==='five-daisen').occupants[0].includes('未考古确认'));
assert.equal(rows.find(x=>x.id==='five-cheonmachong').occupants.length,0);
assert.equal(rows.find(x=>x.id==='five-hwangnam').occupants.length,0);
const shapes=g.features.filter(f=>ids.has(f.properties.tombId));assert.equal(shapes.length,25);
assert(!shapes.some(f=>['five-mozu','five-furuichi','five-nguyen'].includes(f.properties.tombId)),'Representative group points must not duplicate a child footprint');
for(const f of shapes){assert(t.items.some(x=>x.id===f.properties.tombId));assert.match(f.properties.sourceUrl,/openstreetmap\.org\/(way|relation)\//);}
const maya=cap.items.find(x=>x.classicalSiteKey==='naranjo');assert(Math.abs(maya.lng+89.26217)<1e-6);
const dos=cap.items.find(x=>x.classicalSiteKey==='dos-pilas');assert(Math.abs(dos.lng+90.295833333333)<1e-6);assert(dos.records[0]['备注/争议'].includes('已拒用'));
assert.equal(geo.features.find(f=>f.properties.id==='gongju-way-558646580').properties.tombOwned,true);
assert.equal(geo.features.find(f=>f.properties.id==='gyeongju-way-42435919').properties.tombOwned,true);
const sultan=geo.features.find(f=>f.properties.name==='苏丹城及附郭现存墙段');
assert.equal(sultan.geometry.type,'MultiLineString');assert.equal(sultan.geometry.coordinates.length,8);
assert(sultan.geometry.coordinates.every(line=>JSON.stringify(line[0])!==JSON.stringify(line.at(-1))),'Preserve wall gaps instead of inventing a closed enclosure');
for(const original of read('docs/yinxu-royal-geometry.json').features)assert.deepEqual(g.features.find(f=>f.properties.sourceId===original.properties.sourceId),original,'Preserve earlier royal-cemetery geometry');
assert.equal(Geometry.collection(t,g,{era:Object.fromEntries(global.HistoricalPeriods.keys.map(k=>[k,false]))}).features.length,0);
console.log('PASS: five-region identities, qualified attribution, original geometry, period controls, chamber filtering and rejected coordinate conflicts');
