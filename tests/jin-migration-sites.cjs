const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=require('../data/imperial-tombs/catalog.json'),api=require('../imperial-tombs.js');
const initial=c.items.find(x=>x.id==='jin-taizu-acheng'),hekai=c.items.find(x=>x.id==='jin-hekai'),rui=c.items.find(x=>x.id==='jin-rui');
assert(initial.mapEligible);assert.equal(initial.coordinates.crs,'WGS84');assert.equal(initial.coordinates.sourceId,'jin-acheng-osm');assert(initial.coordinates.target.includes('公园'));assert(initial.periodText.includes('1999'));assert(initial.disputes.some(s=>s.includes('现代')||s.includes('复建')));
assert(initial.coordinates.lat>45 && initial.coordinates.lng>126);assert.equal(initial.parentId,null);assert.notEqual(initial.recognition,'archaeological');
assert.equal(hekai.recognition,'attributed');assert.equal(hekai.mapEligible,false);assert.equal(hekai.coordinates,null);assert.equal(hekai.occupants.length,2);
assert.equal(rui.name,'金太祖睿陵','existing check-in identity preserved');assert.equal(rui.coordinates,null);assert.equal(rui.parentId,'jin-group');
for(const x of [initial,hekai,rui]){assert.deepEqual(x.migrationHistory.stages.map(s=>s.year),[1123,1135,1155]);for(const stage of x.migrationHistory.stages)assert(c.items.some(i=>i.id===stage.siteId));}
assert(api.geojson(c).features.some(f=>f.id===initial.id));assert(!api.geojson(c).features.some(f=>f.id===hekai.id));
const el={classList:{remove(){},add(){}},innerHTML:'',querySelectorAll:()=>[]};
const source=fs.readFileSync(require.resolve('../imperial-tombs.js'),'utf8');const a=source.indexOf('  function showDetail('),b=source.indexOf('  async function sync(',a);
const ctx={data:c,selectedId:null,config:{isVisited:()=>false},document:{getElementById:()=>el},en:()=>false,esc:x=>String(x??'').replaceAll('&','&amp;').replaceAll('"','&quot;'),visitMembers:(catalog,x)=>[x]};vm.createContext(ctx);vm.runInContext(source.slice(a,b),ctx);ctx.showDetail(initial.id);assert(el.innerHTML.includes('初葬与迁葬'));assert(el.innerHTML.includes('data-tomb-related="jin-rui"'));assert(el.innerHTML.includes('1999'));assert(el.innerHTML.includes('金太祖陵（阿城初葬）'));
console.log('PASS: initial burial, uncertain relocation, Beijing relocation, distinct coordinates and detail stages');
