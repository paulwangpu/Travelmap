const assert=require('node:assert/strict');
const c=require('../data/imperial-tombs/catalog.json');
const {mappedItems,hasVisitableChamber}=require('../imperial-tombs.js');
const g=c.items.find(x=>x.id==='ming-jingjiang-south');
const children=c.items.filter(x=>x.parentId===g.id);
assert.equal(children.length,9);
assert.equal(children.filter(x=>x.mapEligible).length,2);
assert.equal(children.filter(x=>x.locationReference?.coordinates).length,7);
assert(g.evidence.includes('宪定、荣穆二陵不包含'),'northern tombs cannot share the southern cemetery point');
for(const x of [g,...children]){assert(!hasVisitableChamber(x));assert.equal(x.visitorAccess.status,'closure_reported');assert(x.visitorAccess.note.includes('2026年7月28日'));assert(x.visitorAccess.note.includes('恢复另行公告'));}
for(const zoom of [5,10]){
 assert(mappedItems(c,'',zoom,{}, {},false).every(x=>!x.id.startsWith('ming-jingjiang-')&&x.id!=='ming-chu-zhao'));
 assert(mappedItems(c,'',zoom,{}, {},true,true).every(x=>!x.id.startsWith('ming-jingjiang-')));
}
const chu=c.items.find(x=>x.id==='ming-chu-zhao');
assert.equal(chu.lifespanText,'1364—1424年');assert(chu.coordinates.lat>30.410&&chu.coordinates.lat<30.413);assert(chu.coordinates.lng>114.512&&chu.coordinates.lng<114.517);
assert(children.every(x=>x.chronology.basis.includes('营建')),'construction dates must not become death dates');
console.log('Jingjiang southern scope, independent sites, shared references, closure and prince filters passed.');
