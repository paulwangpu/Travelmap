const assert=require('node:assert/strict'),c=require('../data/imperial-tombs/catalog.json');
const {mappedItems,isFeudalKing}=require('../imperial-tombs.js');
const p=c.items.find(x=>x.id==='han-zhongshan-dingzhou');assert(!p.coordinates);assert.equal(p.locationReview.status,'partly_georeferenced');
for(const id of ['han-zhongshan-jian','han-zhongshan-mu','han-zhongshan-huai']){const x=c.items.find(x=>x.id===id);assert.equal(x.parentId,p.id);assert(isFeudalKing(x));assert.equal(x.coordinates.status,'estimated_wgs84');assert.equal(x.coordinates.precision.horizontalAccuracyMeters,null);assert(x.coordinates.limitation.includes('村域'));assert(!mappedItems(c,'',10,{}, {},false).some(y=>y.id===id));assert(mappedItems(c,'',10,{}, {},true).some(y=>y.id===id));}
const huai=c.items.find(x=>x.id==='han-zhongshan-huai');assert.equal(huai.biographies[0].deathYear,-55);assert.equal(huai.coordinates.lat,38.490);assert.equal(huai.coordinates.lng,114.953);
const n=c.items.find(x=>x.id==='han-chu-nandong');assert(n.admin.includes('段山南坡'));assert.equal(n.coordinates.lat,34.212);assert.equal(n.coordinates.lng,117.228);assert(n.coordinates.original.includes('非精确POI点'));assert.equal(n.coordinates.precision.horizontalAccuracyMeters,null);assert(mappedItems(c,'',10,{}, {},true).some(x=>x.id===n.id));assert(!mappedItems(c,'',10,{}, {},false).some(x=>x.id===n.id));
const {baiduRegionToWgs}=require('../scripts/complete-original-tomb-followup.cjs');assert.throws(()=>baiduRegionToWgs(13051253,100),RangeError);
assert(Math.abs(c.items.find(x=>x.id==='han-zhongshan-jian').coordinates.lat-c.items.find(x=>x.id==='han-zhongshan-mu').coordinates.lat)>.04);
console.log('Original cemetery separation and feudal filter passed');
