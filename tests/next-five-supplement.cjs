const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const report=read('docs/next-five-supplement.json'),cities=read('data/classical-sites/catalog.json'),cap=read('data/china-ancient-capitals.json'),geo=read('data/classical-sites/sites.geojson'),t=read('data/imperial-tombs/catalog.json'),g=read('data/imperial-tombs/geometry.geojson');
const evidence=require('../historical-evidence.js'),Tombs=require('../imperial-tombs.js');
assert.equal(report.addedCities.length,11);assert.equal(report.addedTombs.length,16);
for(const key of report.addedCities){assert.equal(cities.sites.filter(x=>x.key===key).length,1);assert.equal(cap.items.filter(x=>x.classicalSiteKey===key).length,1);}
const rows=t.items.filter(x=>report.addedTombs.includes(x.id));
assert.equal(new Set(t.items.map(x=>x.id)).size,t.items.length);
assert.equal(g.features.filter(x=>report.addedTombs.includes(x.properties.tombId)).length,12);
for(const x of rows){assert.equal(x.visitorAccess.originalChamber,false);assert(!Tombs.mappedItems(t,{[x.correspondingChinesePeriod]:false},16).some(y=>y.id===x.id));assert(x.sourceIds.every(id=>t.sources.some(s=>s.id===id)));}
assert.equal(rows.find(x=>x.id==='next-darius').recognition,'archaeological');
assert.equal(rows.find(x=>x.id==='next-xerxes').recognition,'attributed');
assert(rows.find(x=>x.id==='next-ibrahim-lodi').disputes.some(x=>x.includes('1867')));
const bagan=geo.features.find(x=>x.properties.id==='next-bagan-way-46715099');
assert.equal(bagan.geometry.type,'MultiLineString');assert.equal(bagan.geometry.coordinates.length,8);
assert(bagan.geometry.coordinates.every(line=>JSON.stringify(line[0])!==JSON.stringify(line.at(-1))));
const palace=geo.features.find(x=>x.properties.id==='next-bago-way-410092153');assert.equal(palace.properties.relicState,'reconstructed');
assert.deepEqual(evidence.describe({recognition:'attributed'},{type:'Point'}),['状态待核','定位点']);
assert.deepEqual(evidence.describe({inferredBoundary:true,role:'wall'},{type:'LineString'}),['推定范围','城墙线']);
assert.deepEqual(evidence.describe({relicState:'reconstructed',geometryKind:'building'},{type:'Polygon'}),['复原展示','建筑轮廓']);
console.log('PASS: next five regions, qualified royal attribution, wall gaps, geometry and evidence badges');
