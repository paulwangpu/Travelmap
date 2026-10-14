const fs=require('fs'),assert=require('node:assert/strict'),g=JSON.parse(fs.readFileSync('data/ancient-capital-research-extents.geojson')),d=JSON.parse(fs.readFileSync('docs/shache-kashgar-supplement.json')),a=g.features.filter(f=>String(f.properties.sourceId).startsWith('shache-kashgar-osm-')),s=require('../data/western-regions-36.json'),base=require('../data/china-ancient-capitals.json'),merged=require('../western-regions.js').merge(base,s);
assert.equal(a.length,8);assert.equal(new Set(a.map(f=>f.properties.sourceId)).size,8);
for(const f of a){assert.equal(f.geometry.type,'Polygon');assert.deepEqual(f.geometry.coordinates[0][0],f.geometry.coordinates[0].at(-1));assert.deepEqual(f.geometry,d.added.find(x=>x.properties.sourceId===f.properties.sourceId).geometry);assert(f.properties.label);assert(f.properties.referenceUrl.startsWith('https://'));}
assert.equal(merged.items.filter(i=>i.siteKey==='western-region:shache').length,1);
assert.equal(merged.items.filter(i=>i.name==='喀什').length,1);
assert.deepEqual(merged.items.find(i=>i.name==='喀什').siteKey,base.items.find(i=>i.name==='喀什').siteKey);
const palace=a.find(f=>f.properties.sourceId.endsWith('1445636707'));assert(palace.properties.fixedLandmark);assert.match(palace.properties.note,/重建/);
const pantu=a.find(f=>f.properties.sourceId.endsWith('1535117460'));assert(pantu.properties.inferredBoundary);assert.match(pantu.properties.note,/1994/);assert.equal(pantu.properties.period,'秦汉');
assert(a.find(f=>f.properties.sourceId.endsWith('1279200258')).properties.inferredBoundary);
assert.match(s.entries.find(x=>x.id==='shache').note,/不将/);
console.log('PASS: Shache/Kashgar eight source polygons, stable capital identities, modern reconstruction and park distinction');
