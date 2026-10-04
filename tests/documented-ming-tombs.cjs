const assert=require('node:assert/strict');
const c=require('../data/imperial-tombs/catalog.json');
const {hasVisitableChamber}=require('../imperial-tombs.js');
const ids=['ming-jin-duan','ming-liang-zhuang','ming-lu-jing','ming-lu-juye','ming-jingjiang-xianding','ming-jingjiang-rongmu','ming-xiang-xian','ming-liao-jian','ming-ying-jing'];
for(const id of ids){const x=c.items.find(x=>x.id===id);assert(x);assert.equal(x.rulerCategory,'feudal_king');assert.equal(x.coordinates,null);assert.equal(x.mapEligible,false);assert(!x.locationReference,'dispersed sites must not inherit unrelated cemetery points');assert(!hasVisitableChamber(x),'excavation alone does not prove visitor access');}
assert.equal(c.items.find(x=>x.id==='ming-xiang-xian').nature,'cenotaph');
assert(c.items.find(x=>x.id==='ming-jin-duan').evidence.includes('M2'));
assert(c.items.find(x=>x.id==='ming-liang-zhuang').mapReason.includes('博物馆'));
console.log('Documented Ming additions: original sites, disjoint references, cenotaph and access boundaries passed.');

const ning=c.items.find(x=>x.id==='ming-ning-xian'),lean=c.items.find(x=>x.id==='ming-ning-lean');
assert(ning.mapEligible&&ning.coordinates.lat>28.66&&ning.coordinates.lat<28.67);assert.equal(lean.coordinates,null);assert(!lean.locationReference);assert(!hasVisitableChamber(ning));

const zhou=c.items.find(x=>x.id==='ming-zhou-cemetery'),ding=c.items.find(x=>x.id==='ming-zhou-ding');
assert(zhou.mapEligible&&ding.mapEligible);assert.equal(ding.era,'明');assert.equal(ding.coordinates.status,'estimated_wgs84');assert(ding.coordinates.lat>34.30&&ding.coordinates.lat<34.31);assert(zhou.disputes.some(s=>s.includes('34.142065')));
for(const id of ['ming-zhou-gong','ming-zhou-duan']){const x=c.items.find(x=>x.id===id);assert.equal(x.parentId,zhou.id);assert.equal(x.coordinates,null);assert.equal(x.locationReference.parentId,zhou.id);assert(!x.mapEligible);assert(!hasVisitableChamber(x));}
assert(!hasVisitableChamber(ding));

for(const id of ['ming-yi-duan','ming-yi-zhuang','ming-yi-xuan','ming-yi-ding','ming-zhou-yi']){const x=c.items.find(x=>x.id===id);assert(x);assert.equal(x.era,'明');assert.equal(x.rulerCategory,'feudal_king');assert.equal(x.coordinates,null);assert(!x.locationReference);assert(!hasVisitableChamber(x));}
assert(c.items.find(x=>x.id==='ming-yi-zhuang').disputes.some(s=>s.includes('1591')));
assert.equal(c.items.find(x=>x.id==='ming-yi-xuan').disturbance.status,'archaeological_evidence');
assert(c.items.find(x=>x.id==='ming-yi-ding').disturbance.scope.includes('元妃'));
assert(c.items.find(x=>x.id==='ming-zhou-yi').disputes.some(s=>s.includes('西周')));

const de=c.items.find(x=>x.id==='ming-de-cemetery'),dez=c.items.find(x=>x.id==='ming-de-zhuang');assert.equal(de.recordType,'group');assert.equal(dez.parentId,de.id);assert.equal(dez.coordinates,null);assert(!de.mapEligible&&!dez.mapEligible);assert(!hasVisitableChamber(dez));assert(de.disputes.some(s=>s.includes('36.553378')));assert(c.items.find(x=>x.id==='ming-lu-jing').admin.includes('云山南坡'));assert(c.items.find(x=>x.id==='ming-lu-juye').admin.includes('凤凰山南坡'));
