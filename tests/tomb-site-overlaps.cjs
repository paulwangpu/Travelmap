const assert=require('node:assert/strict'),path=require('node:path'),{execFileSync}=require('node:child_process');
const catalog=require('../data/imperial-tombs/catalog.json');
const archive=require('../data/imperial-tombs/excluded-settlement-sites.json');
const api=require('../imperial-tombs.js');
const excluded=['shu-jinsha-search','shu-sanxingdui-search','early-erlitou-search','early-panlongcheng-search'];
for(const id of excluded){assert(!catalog.items.some(x=>x.id===id));assert(!catalog.mapCandidateIds.includes(id));assert(archive.items.some(x=>x.id===id&&x.record.id===id&&x.reason));}
for(const id of ['shu-commercial-boat','shu-majia','early-liangzhu','early-taosi','early-shimao','cheshi-goubei','tuyuhun-wuwei'])assert(catalog.items.some(x=>x.id===id),id);
for(const zoom of [4,10])assert(!api.mappedItems(catalog,'',zoom).some(x=>excluded.includes(x.id)||x.id==='cheshi-goubei'));
assert.equal(catalog.totalRecords,catalog.items.length);
assert.equal(catalog.mapCandidateIds.length,catalog.items.filter(x=>x.mapEligible).length);
const original=JSON.parse(execFileSync('git',['show','HEAD:data/imperial-tombs/catalog.json'],{cwd:path.resolve(__dirname,'..'),encoding:'utf8',maxBuffer:8*1024*1024}));
for(const record of original.items.filter(x=>!excluded.includes(x.id)&&x.id!=='cheshi-goubei')){
 const current=JSON.parse(JSON.stringify(catalog.items.find(x=>x.id===record.id))),previous=JSON.parse(JSON.stringify(record));
 if(['koguryo-jian-kings','koguryo-ym0541'].includes(record.id)){
  assert.equal(current.coordinates.sourceId,'koguryo-taewang-osm-outline');
  for(const key of ['coordinates','sourceIds','mapReason','previousLocationReference','boundaryReference']){delete current[key];delete previous[key];}
 }
 if(current.locationReference?.parentId==='koguryo-jian-kings'&&current.locationReference.coordinates){
  assert.equal(current.locationReference.coordinates.lng,catalog.items.find(x=>x.id==='koguryo-jian-kings').coordinates.lng);
  delete current.locationReference.coordinates;delete previous.locationReference.coordinates;
 }
 const review=require('../docs/four-sites-calibration-20261028.json'),reviewed=new Set(['song6','jin-group',...review.song.map(x=>x.id),...review.jin.map(x=>x.id)]);
 if(reviewed.has(record.id)){
  assert.equal(current.locationReview.reviewedAt,review.date);
  assert.deepEqual(current.coordinates&&[current.coordinates.lng,current.coordinates.lat],previous.coordinates&&[previous.coordinates.lng,previous.coordinates.lat],'geographic coordinates preserved');
  for(const field of ['locationReview','archaeologicalCorrespondence','mapReason','sourceIds']){delete current[field];delete previous[field];}
  if(record.id==='song6'){assert.equal(catalog.items.find(x=>x.id==='song6').coordinates.status,'estimated_wgs84');delete current.coordinates;delete previous.coordinates;}
 }
 assert.deepEqual(current,previous,record.id);
}
const copy=JSON.parse(JSON.stringify(catalog.items));require('../scripts/clean-tomb-site-overlaps.cjs')({items:copy,dir:path.dirname(require.resolve('../data/imperial-tombs/catalog.json'))});assert.deepEqual(copy,catalog.items);
const capitals=require('../data/china-ancient-capitals.json');
for(const name of ['金沙遗址','三星堆遗址','二里头遗址'])assert(capitals.items.some(x=>x.name===name));
console.log('PASS: settlement searches removed, actual burials preserved, borrowed city point hidden, archive and idempotency');
