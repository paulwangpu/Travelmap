const assert=require('node:assert/strict'),c=require('../data/imperial-tombs/catalog.json');
const {mappedItems}=require('../imperial-tombs.js'),get=id=>c.items.find(x=>x.id===id);
const g=get('qi-shizi-zhaojia-region'),y=get('qi-xuan-yongan'),t=get('qi-taian');
assert.equal(g.recordType,'group');assert.equal(g.coordinates.status,'estimated_wgs84');assert.equal(g.coordinates.precision.horizontalAccuracyMeters,null);
assert.equal(g.coordinates.lat,32.082);assert.equal(g.coordinates.lng,119.661);
assert(Math.abs(g.coordinates.lng-119.805)>.1,'exclude the unrelated northern Zhaojiawan village');
for(const x of [y,t]){assert.equal(x.parentId,g.id);assert.equal(x.coordinates,null);assert.equal(x.locationReference.parentId,g.id);assert(x.locationReference.coordinates);assert(x.disputes.length);}
assert.equal(y.nature,'posthumous');assert.equal(y.biographies[0].deathYear,447);
for(const z of [5,10]){const points=mappedItems(c,'',z);assert(points.some(x=>x.id===g.id));assert(!points.some(x=>[y.id,t.id].includes(x.id)));}
assert(!mappedItems(c,'',10,{}, {},true,true).some(x=>x.id===g.id),'stone sculptures do not establish visitable chambers');
console.log('PASS: adjacent disputed tombs share regional reference without duplicate points or unrelated village');
