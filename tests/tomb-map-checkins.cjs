const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=require('../data/imperial-tombs/catalog.json'),api=require('../imperial-tombs.js'),app=fs.readFileSync(require.resolve('../app.js'),'utf8');
const low=api.mappedItems(c,'清',6),high=api.mappedItems(c,'清',8);
assert(low.some(x=>x.id==='qing-east'));assert(!low.some(x=>x.id==='qing-zhaoxi'));
assert(high.some(x=>x.id==='qing-zhaoxi'));assert(!high.some(x=>x.id==='qing-east'));
assert.equal(c.items.find(x=>x.id==='qing-zhaoxi').parentId,'qing-east');
let visited=new Set(['qing-zhaoxi']);
let feature=api.geojson(c,'清',6,{}, {},x=>visited.has(x.id)).features.find(f=>f.id==='qing-east');
assert.equal(feature.properties.done,false);assert(feature.properties.partlyVisited);assert(!feature.properties.name.includes('已去'));assert(!feature.properties.name.includes('1/8'));assert(feature.properties.icon.endsWith('-visited'));
visited.clear();feature=api.geojson(c,'清',6,{}, {},x=>visited.has(x.id)).features.find(f=>f.id==='qing-east');assert.equal(feature.properties.done,false);
const el={classList:{remove(){},add(){}},innerHTML:'',querySelectorAll:()=>[]};
const source=fs.readFileSync(require.resolve('../imperial-tombs.js'),'utf8');
const ctx={data:c,selectedId:null,config:{isVisited:x=>visited.has(x.id)},document:{getElementById:()=>el},en:()=>false,esc:x=>String(x??'')};vm.createContext(ctx);
for(const name of ['visitMembers','showDetail']){const a=source.indexOf('  function '+name+'('),b=source.indexOf('\n  ',a+10);const next=name==='visitMembers'?source.indexOf('  function geojson(',a):source.indexOf('  async function sync(',a);vm.runInContext(source.slice(a,next),ctx);}
ctx.showDetail('qing-zhaoxi');assert(el.innerHTML.includes('data-checklist-map="imperialTombs"'));assert(el.innerHTML.includes('data-item="昭西陵（孝庄）"'));assert(el.innerHTML.includes('标记去过'));
visited.add('qing-zhaoxi');ctx.showDetail('qing-zhaoxi');assert(el.innerHTML.includes('取消去过'));
ctx.showDetail('qing-east');assert(el.innerHTML.includes('陵区内陵墓'));assert(el.innerHTML.includes('昭西陵（孝庄）'));assert.equal((el.innerHTML.match(/data-checklist-map=/g)||[]).length,8);
assert(app.includes('if (key === "imperialTombs") await loadImperialTombChecklist();'),'map click must load checklist before saving coordinates');
console.log('PASS: map check-in buttons, cancellation, cemetery progress, and Zhaoxi low/high zoom membership');

const singlePopup=api.popupContent(c,c.items.find(x=>x.id==='qing-zhaoxi'),()=>false);assert(singlePopup.includes('class="popup-action"'));assert(singlePopup.includes('data-item="昭西陵（孝庄）"'));assert(singlePopup.includes('标记去过'));assert(api.popupContent(c,c.items.find(x=>x.id==='qing-zhaoxi'),()=>true).includes('取消去过'));const groupPopup=api.popupContent(c,c.items.find(x=>x.id==='qing-east'),x=>x.id==='qing-zhaoxi');assert.equal((groupPopup.match(/data-checklist-map=/g)||[]).length,8);assert(groupPopup.includes('取消去过'));assert(groupPopup.includes('标记去过'));console.log('PASS: shared popup actions and individual cemetery toggles');
