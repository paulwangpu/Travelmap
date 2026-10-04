const assert=require('node:assert/strict'),c=require('../data/imperial-tombs/catalog.json'),audit=require('../data/imperial-tombs/coverage-audit.json');
const get=id=>c.items.find(x=>x.id===id);
assert.equal(audit.totalRecords,c.totalRecords);
assert(audit.matrix.find(x=>x.dynasty==='北齐').records===0);
assert(audit.rulerChecks.find(x=>x.name==='刘知远').matchedRecordIds.includes('houhan-rui'));
assert(audit.rulerChecks.find(x=>x.name==='刘承祐').matchedRecordIds.includes('houhan-ying'));
assert(audit.rulerChecks.find(x=>x.name==='李煜').matchedRecordIds.length===0);
assert(audit.leads.every(x=>!x.mapEligible));
assert.equal(get('tang-gong').nature,'posthumous');
const other=c.items.find(x=>x.name==='西朱村曹魏墓M2');assert(other);assert(get('wei-gaoping-rudian').relatedSiteIds.includes(other.id));assert(other.relatedSiteIds.includes('wei-gaoping-rudian'));
const h=get('houhan-group');assert(h.mapEligible);assert.equal(h.coordinates.status,'estimated_wgs84');assert(h.coordinates.estimate.derivation.sourceDatumConfirmed===false);assert(Math.abs(h.coordinates.lat-34.33893)<.01);assert(Math.abs(h.coordinates.lng-113.30361)<.01);
for(const id of ['houhan-rui','houhan-ying']){assert(!get(id).mapEligible);assert(get(id).locationReference.coordinates);}
console.log('PASS: proactive coverage audit, ruler gaps, competing sites, shared locations and estimate provenance');
