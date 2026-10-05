const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const data = require('../data/china-ancient-capitals.json');
const H = require('../historical-periods.js');
const {merge} = require('../western-regions.js');
assert.equal(data.recordCount, data.recordItems.length);
assert.equal(data.recordItemCount, data.recordItems.length);
assert.equal(data.siteCount, data.items.length);
assert.equal(data.recordCount, data.items.reduce((n,s)=>n+s.records.length,0));
assert.equal(new Set(data.recordItems.map(x=>x.sourceOrder)).size,data.recordCount);
assert.equal(new Set(data.items.map(x=>x.siteKey)).size,data.siteCount);
for (const record of data.recordItems) {
  const site = data.items.find(s=>s.siteKey===record.siteKey) || data.items.find(s=>s.name===record.parentName);
  assert(site,record.name);
  assert(site.records.some(r=>r.sourceOrder===record.sourceOrder && r['政权/国号']===record.dynasty),record.name);
  assert(H.keys.includes(H.capitalPeriod(record)),record.name);
}
const chengdu=data.items.find(x=>x.name==='成都');
assert.equal(chengdu.recordCount,8);
for (const dynasty of ['蜀（开明时期）','蜀汉','成汉','前蜀','后蜀']) assert(chengdu.dynasties.includes(dynasty));
assert(H.capitalPeriods(chengdu).includes('周'));
assert(data.items.find(x=>x.name==='重庆').dynasties.includes('巴'));
assert(data.items.find(x=>x.name==='江陵').records.some(x=>x['政权/国号']==='南梁' && x['都城年代（原文）']==='552—554'));
assert(data.items.find(x=>x.name==='建瓯').dynasties.includes('闽（王延政）'));
for (const site of data.items.filter(x=>x.coordinatePrecision)) {
  assert(Number.isFinite(site.lat)&&Number.isFinite(site.lng));
  assert.match(site.coordinatePrecision,/参照/);
  assert(site.records.every(x=>/^https:\/\//.test(x['来源URL'])));
}
// Every original key and original record remains intact, including saved check-ins.
const original=JSON.parse(execFileSync('git',['show','HEAD:data/china-ancient-capitals.json'],{cwd:require('node:path').resolve(__dirname,'..'),encoding:'utf8'}));
for(const record of original.recordItems) assert.deepEqual(data.recordItems.find(x=>x.sourceOrder===record.sourceOrder),record);
for(const site of original.items) {
  const retained=data.items.find(x=>x.siteKey===site.siteKey);
  for(const key of ['name','lat','lng','currentKey','currentPlace']) assert.equal(retained[key],site[key]);
  assert.deepEqual(retained.records.slice(0,site.records.length),site.records);
}
const merged=merge(data,require('../data/western-regions-36.json'));
assert.equal(merged.recordCount,339);
assert.equal(merged.siteCount,185);
assert.deepEqual(merge(merged,require('../data/western-regions-36.json')),merged);
const before=fs.readFileSync(require.resolve('../data/china-ancient-capitals.json'),'utf8');
execFileSync(process.execPath,['scripts/supplement-ancient-capitals.cjs'],{cwd:require('node:path').resolve(__dirname,'..')});
assert.equal(fs.readFileSync(require.resolve('../data/china-ancient-capitals.json'),'utf8'),before);
console.log('PASS: capital coverage, dynasty filters, original check-in preservation, western merge and repeat supplement');
