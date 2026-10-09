const assert=require('node:assert/strict'),fs=require('node:fs'),H=require('../historical-periods.js');
const d=require('../data/china-ancient-capitals.json'),g=JSON.parse(fs.readFileSync('data/ancient-capital-research-extents.geojson'));
assert.equal(d.items.length,155);assert.equal(d.recordItems.length,309);
for(const r of d.recordItems){const s=d.items.find(s=>s.siteKey===r.siteKey);assert(s,r.name);assert(s.records.some(raw=>raw.sourceOrder===r.sourceOrder));assert(r.siteReference?.name);for(const b of r.boundaryRelations||[]){assert(b.kind);assert(!['汉魏','六朝','南唐','宋辽金'].includes(b.control));const f=g.features.find(f=>f.properties.sourceId===b.id);if(f)assert((f.properties.periods||[f.properties.period]).includes(H.capitalPeriod(r)),r.name+' selector');}}
for(const order of [40,192,197,218,234,240,261,272])assert(d.recordItems.find(r=>r.sourceOrder===order).legacySiteKeys.length);
const get=n=>d.recordItems.find(r=>r.sourceOrder===n);
assert.equal(get(272).parentName,'南京');assert(get(272).boundaryRelations.some(b=>b.period==='明清'));
assert(get(63).siteReference.coordinates[0]>112.6);assert(get(17).siteReference.coordinates[0]<112.42);assert(get(132).siteReference.coordinates[0]>112.45&&get(132).siteReference.coordinates[0]<112.47);
assert.match(get(125).siteReference.name,/邺南/);assert.match(get(68).siteReference.name,/邺北/);
assert.equal(get(10).boundaryRelations.length,0);assert.match(get(295).siteReference.kind,/待核/);
assert(get(63).boundaryRelations.every(b=>!b.id.includes('northernwei')));
assert(!fs.readFileSync('app.js','utf8').includes('mergedSiteByCoordinate.get'));
console.log('PASS: all record owners, preserved legacy identities, period selectors, split-site references and unverified locations');
