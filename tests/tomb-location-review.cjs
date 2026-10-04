const assert=require('node:assert/strict');
const catalog=require('../data/imperial-tombs/catalog.json');
const audit=require('../data/imperial-tombs/full-location-review.json');
const {mappedItems}=require('../imperial-tombs.js');
const ids=['han-huzhuang','yan-xuliang','yan-jiunutai','yan-jiunutai-m16','shu-majia','rong-yimen','han-shen','han-kang-east','han-jing-zhi','han-chu-nandong','han-qi-dawu','han-king-changyi','han-zhongshan-dingzhou','wei-shouyang','jin-gaoyuan','jin-junping','jin-taiyang','qi-taian','tuyuhun-wuwei','jin-hailing','jin-hekai','jin-huizong-xing','jin-de','jin-ai-rushui','jin-chenglin-boji','jin-chenglin-memorial'];
assert.deepEqual(audit.items.map(x=>x.id).sort(),ids.sort(),'all original 26 must have a decision');
const get=id=>catalog.items.find(x=>x.id===id);
assert.equal(audit.newMapPoints.length,10);
assert.equal(audit.resolvedOrPartlyResolved,9);
assert.equal(audit.stillWithoutUsableLocation,17);
for(const row of audit.items){
 const x=get(row.id);assert(row.sourceIds.every(id=>x.locationReview.sourceIds.includes(id)),'original audit sources survive later supplements');
 assert(x.locationReview.reason.length>25&&x.locationReview.nextStep.length>10);
 assert(row.sourceIds.every(id=>catalog.sources.some(s=>s.id===id)));
 if(!x.coordinates&&!x.locationReference&&!row.mappedChildren.length)assert(!x.mapEligible);
}
for(const id of audit.newMapPoints){const x=get(id);assert(x.mapEligible);assert.equal(x.coordinates.status,'estimated_wgs84');assert(x.coordinates.estimate.basis&&x.coordinates.estimate.extent);}
const shen=get('han-shen'),kang=get('han-kang-east');
assert(kang.coordinates.lat<shen.coordinates.lat&&kang.coordinates.lng>shen.coordinates.lng);
assert(shen.coordinates.original.includes('800m')&&kang.coordinates.original.includes('2700m'));
assert(kang.disputes.some(x=>x.includes('庚地')));
assert.equal(get('han-jing-zhi').coordinates,null);
assert.equal(get('han-jing-zhi').locationReference.parentId,'han-yanlou-cemetery');
assert(get('han-jing-zhi').locationReference.coordinates,'reference coordinates populated by final build');
assert.equal(get('tuyuhun-wuwei').coordinates,null,'discontinuous group gets no artificial centre');
assert(get('tuyuhun-wuwei').admin.includes('天祝'));
assert(get('tuyuhun-murongzhi').rulerCategory==='feudal_king');
assert(!mappedItems(catalog,'',10,{}, {},false).some(x=>x.id==='tuyuhun-murongzhi'));
assert.equal(get('jin-chenglin-memorial').nature,'commemorative');
assert.equal(get('jin-chenglin-boji').coordinates,null,'original site must not inherit modern memorial point');
assert(get('yan-jiunutai-m16').name.includes('高等级贵族'));
console.log('PASS: all 26 decisions, regional estimate limits, candidate identity, disjoint cemeteries and feudal king visibility');
