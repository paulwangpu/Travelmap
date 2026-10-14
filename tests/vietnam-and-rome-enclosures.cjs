const fs=require('fs'),assert=require('node:assert/strict');
const read=p=>JSON.parse(fs.readFileSync(p));
const c=read('data/china-ancient-capitals.json'),g=read('data/classical-sites/sites.geojson'),r=read('data/ancient-capital-research-extents.geojson'),report=read('docs/vietnam-four-capitals-review.json'),rome=read('docs/rome-wall-segments-review.json');
for(const key of ['coloa','ho-citadel']){const s=c.items.find(s=>s.classicalSiteKey===key);assert(s);assert.equal(s.records.length,2);assert(s.relatedMapViews.length);}
for(const f of report.addedClassical){const live=g.features.find(x=>x.properties.id===f.properties.id);assert(live);if(!f.properties.id.includes('namgiao'))assert.deepEqual(live.geometry,f.geometry);}
for(const f of report.addedResearch)assert.deepEqual(r.features.find(x=>x.properties.sourceId===f.properties.sourceId),f);
assert.equal(r.features.find(x=>x.properties.sourceId==='coloa-middle-rampart-reference').geometry.type,'MultiLineString');assert.equal(r.features.find(x=>x.properties.sourceId==='ho-la-thanh-outer-wall-plan').geometry.type,'LineString');
assert.equal(rome.added.length,37);for(const f of rome.added){assert.equal(f.geometry.type,'LineString');assert.deepEqual(g.features.find(x=>x.properties.id===f.properties.id),f);assert.match(f.properties.note,/不是整圈/);}
const p=g.features.find(x=>x.properties.id==='ho-citadel-namgiao-official-plan-point');assert.match(p.properties.sourceUrl,/maps/);assert(Math.abs(p.geometry.coordinates[1]-(20+2/60+44/3600))<1e-8);
console.log('PASS: Vietnam roots, original geometry, open ramparts, official altar coordinate and Rome wall periods');
