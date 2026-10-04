const assert=require('node:assert/strict'),fs=require('node:fs');const api=require('../imperial-tombs.js'),c=require('../data/imperial-tombs/catalog.json');
const f=api.geojson(c).features;const by=id=>f.find(x=>x.properties.id===id);
assert.notEqual(by('ming-xiao').properties.color,by('qing-yong').properties.color);assert.equal(new Set(['song-zhao','liao-zu','jin-group','xixia-1'].map(id=>by(id).properties.color)).size,1);for(const era of Object.keys(c.summary).filter(k=>k!=='先秦')){const rows=f.filter(x=>c.items.find(y=>y.id===x.id).era===era);if(rows.length)assert.equal(new Set(rows.map(x=>x.properties.color)).size,1);}
assert.equal(new Set(['shang-fuhao','jin-hou','zhou-three','zhou-jincun'].map(id=>by(id).properties.color)).size,2);
assert(c.items.filter(x=>x.era==='先秦').every(x=>Object.hasOwn(api.dynastyColors,api.dynastyTheme(x).key)));
const preqinOnly=Object.fromEntries(Object.keys(c.summary).map(k=>[k,k==='先秦']));
assert(api.mappedItems(c,preqinOnly).every(x=>x.era==='先秦'));
assert(api.mappedItems(c,{...preqinOnly,周:false}).every(x=>!['西周','春秋','战国'].includes(x.preqinPeriod)));
for(const id of ['shu-sanxingdui-search','shu-jinsha-search']){const x=c.items.find(x=>x.id===id);assert.equal(x.siteRole,'royal_burial_search_area');assert.equal(x.nature,'unknown');assert(x.mapEligible);assert(x.coordinates.target.includes('王陵位置未知'));}
for(const id of ['early-liangzhu','early-taosi','early-shimao','early-erlitou-search','early-panlongcheng-search']){const x=c.items.find(x=>x.id===id);assert(x.mapEligible);assert.equal(x.coordinates.status,'estimated_wgs84');assert(x.coordinates.target.includes('参考'));assert(x.disputes.length);}
assert.equal(c.items.find(x=>x.id==='early-shimao').disturbance.status,'archaeological_evidence');
assert.equal(c.items.find(x=>x.id==='early-erlitou-search').nature,'unknown');
assert.equal(c.items.find(x=>x.id==='early-taosi').preqinPeriod,'史前');
assert.equal(api.dynastyTheme({era:'魏晋南北朝',dynasty:'刘宋'}).key,'魏晋南北朝');assert.equal(api.dynastyTheme({era:'五代十国',dynasty:'后汉'}).key,'五代十国');
assert(f.every(x=>x.properties.icon==='imperial-mausoleum-'+x.properties.dynastyColorKey));
for(const color of Object.values(api.dynastyColors)){const image=api.markerImage(color);assert.equal(image.data.length,image.width*image.height*4);const pixel=(18*image.width+20)*4;assert.deepEqual(Array.from(image.data.slice(pixel,pixel+3)),color.slice(1).match(/../g).map(x=>parseInt(x,16)));assert.equal(image.data[3],0);}
console.log('PASS: era colors, Ming/Qing separation and shared Song/Liao/Jin/Xixia color, icon RGBA colors and transparency');


assert(!fs.readFileSync(require.resolve('../imperial-tombs.js'),'utf8').includes('tomb-color-key'));

assert(!c.items.some(x=>x.preqinPeriod==='先秦跨期／未定'));
for(const [id,period] of Object.entries({'qin-gong-group':'春秋','zhao-kings':'战国','lu-nine':'春秋','shu-jinsha-search':'西周','rui-liangdaicun':'春秋'}))assert.equal(c.items.find(x=>x.id===id).preqinPeriod,period);
