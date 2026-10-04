const assert=require('node:assert/strict');
const c=require('../data/imperial-tombs/catalog.json');
const {mappedItems,hasVisitableChamber}=require('../imperial-tombs.js');
const get=id=>c.items.find(x=>x.id===id);
const ids=['ming-shu-cemetery','ming-shu-xi','ming-shu-zhao','ming-lujian'];
for(const id of ids){assert(get(id));assert.equal(get(id).era,'明');assert.equal(get(id).rulerCategory,'feudal_king');}
for(const id of ['ming-shu-cemetery','ming-shu-xi','ming-lujian'])assert(get(id).mapEligible);
assert.equal(get('ming-shu-xi').lifespanText,'1409—1434年');
assert.equal(get('ming-lujian').lifespanText,'1568—1614年');
const z=get('ming-shu-zhao');assert.equal(z.coordinates,null);assert.equal(z.locationReference.parentId,'ming-shu-cemetery');assert(!hasVisitableChamber(z));assert(z.evidence.includes('1992年迁'));
assert(hasVisitableChamber(get('ming-shu-xi')));
for(const zoom of [5,10])assert(mappedItems(c,'',zoom,{}, {},false).every(x=>!ids.includes(x.id)));
assert(mappedItems(c,'',5,{}, {},true,true).some(x=>x.id==='ming-shu-xi'),'original chamber remains accessible under low zoom filtering');
assert(get('ming-lujian').disputes.some(s=>s.includes('朱以海')));
console.log('Ming prince locations, relocation, scope and chamber filtering passed.');
