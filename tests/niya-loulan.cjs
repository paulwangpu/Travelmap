const fs=require('fs'),assert=require('node:assert/strict'),g=JSON.parse(fs.readFileSync('data/ancient-capital-research-extents.geojson')),d=require('../docs/niya-loulan-supplement.json'),s=require('../data/western-regions-36.json'),a=g.features.filter(f=>String(f.properties.sourceId).startsWith('niya-loulan-')||f.properties.sourceId==='niya-dsr-0756');
assert.equal(a.length,20);assert.equal(new Set(a.map(f=>f.properties.sourceId)).size,20);
for(const f of a){assert.deepEqual(f.geometry,d.added.find(x=>x.properties.sourceId===f.properties.sourceId).geometry);assert(f.properties.sourceUrl.startsWith('https://'));if(f.geometry.type==='Polygon')assert.deepEqual(f.geometry.coordinates[0][0],f.geometry.coordinates[0].at(-1));}
const walls=a.filter(f=>f.properties.sourceName==='楼兰 · 城墙遗迹');assert.equal(walls.length,8);assert(walls.every(f=>f.geometry.type==='Polygon'),'Preserve actual wall footprint faces');
assert(a.find(f=>f.properties.sourceId==='niya-loulan-way-977283249').properties.inferredBoundary);
assert(a.find(f=>f.properties.sourceName==='楼兰 · 古水道').properties.waterFeature);
assert.equal(a.filter(f=>f.properties.sourceName==='楼兰佛塔').length,1);assert(!a.some(f=>f.properties.sourceId.endsWith('9043029982')),'Avoid duplicate stupa node/footprint');
const niya=s.entries.find(e=>e.id==='jingjue'),shanshan=s.entries.find(e=>e.id==='shanshan');assert.deepEqual([niya.lng,niya.lat],d.niyaAnchor);assert.deepEqual([shanshan.lng,shanshan.lat],[88.17,39.03],'Do not move Wuni royal-seat reference to Loulan LA');
assert(!a.some(f=>f.properties.city==='尼雅遗址'&&f.geometry.type==='Polygon'),'Do not fabricate rectangular Niya enclosure');
const ref=s.entries.find(e=>e.id==='jingjue');assert.match(ref.note,/分散/);
console.log('PASS: Loulan wall footprints, protected-area distinction, single stupa, waterway, Niya anchor and separate Wuni reference');
