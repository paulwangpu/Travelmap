const assert=require('assert'),fs=require('fs'),g=JSON.parse(fs.readFileSync('data/ancient-capital-research-extents.geojson')),c=require('../data/china-ancient-capitals.json'),a=g.features.filter(f=>f.properties.sourceId.startsWith('goguryeo-'));
assert.equal(a.length,22);assert.equal(new Set(a.map(f=>f.properties.sourceId)).size,22);
assert.equal(a.filter(f=>f.properties.label==='国内城 · 城墙遗存').length,8);
assert(a.filter(f=>f.properties.label==='国内城 · 城墙遗存').every(f=>f.geometry.type==='LineString'));
assert.equal(a.find(f=>f.properties.label==='大城山城 · 城墙').geometry.type,'LineString');
for(const f of a){assert(f.properties.capitalSiteKey);assert(f.properties.sourceUrl);if(f.geometry.type==='Point')assert(f.properties.sitePoint);if(f.geometry.type==='Polygon')assert.deepEqual(f.geometry.coordinates[0][0],f.geometry.coordinates[0].at(-1));}
assert(!a.some(f=>f.properties.city==='集安丸都山城'&&f.geometry.type==='Polygon'));
const s=c.items.find(x=>x.name==='集安国内城');assert.deepEqual([s.lng,s.lat],[126.1777,41.1207]);assert(s.siteKey.includes('41.12500,126.19500'));
for(const name of ['五女山城','集安国内城','集安丸都山城','平壤'])assert(c.items.find(s=>s.name===name).historicalStages.some(x=>x.name.includes('高句丽')));
assert(a.find(f=>f.properties.label==='将军坟').properties.note.includes('不作为确定事实'));
console.log('PASS: 22 Goguryeo features, open walls, provenance, period distinctions and stable capital identities');
