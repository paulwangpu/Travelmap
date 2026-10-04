const assert=require('node:assert/strict');
const c=require('../data/imperial-tombs/catalog.json');
const {mappedItems,hasVisitableChamber}=require('../imperial-tombs.js');
const g=c.items.find(x=>x.id==='ming-chu-cemetery');
const children=c.items.filter(x=>x.parentId===g.id);
assert.equal(children.length,9);
assert.equal(children.filter(x=>x.mapEligible).length,4);
assert.equal(children.filter(x=>x.locationReference?.coordinates).length,5);
assert.equal(children.find(x=>x.id==='ming-chu-ding').nature,'unknown');
assert(children.find(x=>x.id==='ming-chu-kang').disputes.some(s=>s.includes('同名')));
assert(children.every(x=>!hasVisitableChamber(x)));
const low=mappedItems(c,'',5,{}, {},true),high=mappedItems(c,'',10,{}, {},true);
assert(low.some(x=>x.id===g.id));assert(!low.some(x=>x.parentId===g.id));
assert(!high.some(x=>x.id===g.id));assert.equal(high.filter(x=>x.parentId===g.id).length,4);
assert(!mappedItems(c,'',10,{}, {},false).some(x=>x.id===g.id||x.parentId===g.id));
for(const x of children.filter(x=>x.mapEligible)){
 assert(x.coordinates.lat>30.400&&x.coordinates.lat<30.415);
 assert(x.coordinates.lng>114.510&&x.coordinates.lng<114.530);
}
console.log('Longquan nine royal gardens, regional points, shared references, uncertain burial and filters passed.');
