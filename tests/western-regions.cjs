const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {merge}=require('../western-regions.js');
const base=JSON.parse(fs.readFileSync(require.resolve('../data/china-ancient-capitals.json')));
const supplement=JSON.parse(fs.readFileSync(require.resolve('../data/western-regions-36.json')));
const before=JSON.stringify(base),data=merge(base,supplement);
assert.equal(JSON.stringify(base),before);
assert.equal(supplement.entries.length,36);
assert.equal(new Set(supplement.entries.map(e=>e.id)).size,36);
const newEntries=supplement.entries.filter(x=>x.position!=='existing').length;
assert.equal(data.recordItems.length,base.recordItems.length+newEntries);
assert.equal(data.items.length,base.items.length+newEntries);
assert.equal(data.westernRegions.mapped,36);
assert.equal(data.westernRegions.pending,0);
assert.equal(data.westernRegions.inferred,16);
for(const entry of supplement.entries.filter(e=>e.position==='inferred')) {
  assert.ok(Number.isFinite(entry.lat)&&Number.isFinite(entry.lng));
  assert.ok(entry.lat>=-90&&entry.lat<=90&&entry.lng>=-180&&entry.lng<=180);
  assert.ok(entry.note);
  assert.equal(data.items.filter(i=>i.westernRegion?.id===entry.id).length,1);
  assert.match(data.recordItems.find(i=>i.westernRegion?.id===entry.id).capitalType,/推测位置/);
}
assert.deepEqual(merge(data,supplement),data);
for(const item of base.items){const retained=data.items.find(i=>i.siteKey===item.siteKey);assert.equal(retained.lat,item.lat);assert.equal(retained.lng,item.lng);assert.equal(retained.name,item.name);assert.deepEqual(retained.records,item.records);}
for(const item of base.recordItems){const retained=data.recordItems.find(i=>i.name===item.name);assert.equal(retained.siteKey,item.siteKey);assert.equal(retained.lat,item.lat);assert.equal(retained.lng,item.lng);}
for(const entry of supplement.entries){const rows=data.recordItems.filter(i=>i.westernRegion?.id===entry.id);assert.equal(rows.length,1);if(entry.position==='pending'){assert.equal(rows[0].lat,undefined);assert.equal(rows[0].lng,undefined);assert.ok(!data.items.some(i=>i.westernRegion?.id===entry.id));}}
const app=fs.readFileSync(require.resolve('../app.js'),'utf8'),context={currentLanguage:'zh',escapeHtml:s=>String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])),ancientCapitalCurrentDisplayName:i=>i.currentPlace,compactMapLabelValues:a=>(a||[]).join(''),ancientCapitalDisplayEra:s=>s};
vm.createContext(context);
vm.runInContext(app.slice(app.indexOf('function ancientCapitalMapTitle('),app.indexOf('function ancientCapitalMetaForPlace(')),context);
const point=data.items.find(i=>i.westernRegion?.id==='shanshan');assert.equal(context.ancientCapitalMapTitle(point),'鄯善（楼兰）');assert.match(context.ancientCapitalMapSubtitle(point),/概略地望/);
context.currentLanguage='en';assert.equal(context.ancientCapitalMapTitle(point),'Shanshan (Loulan)');assert.match(context.ancientCapitalMapSubtitle(point),/Approximate/);
const inferred=data.items.find(i=>i.westernRegion?.id==='yumi');
assert.match(context.ancientCapitalMapSubtitle(inferred),/Inferred/);
context.currentLanguage='zh';assert.match(context.ancientCapitalMapSubtitle(inferred),/推测位置/);
assert.match(app,/fixedChecklistTotals.chinaAncientCapitals = data.recordItems/);
assert.match(app,/保留原古都目录/);
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');assert.ok(html.indexOf('western-regions.js')<html.indexOf('app.js?v='));
console.log(`PASS: 36 mapped kingdoms/16 inferred, ${data.recordCount} records/${data.siteCount} points, existing-key preservation, inference warnings, repeat merges, localized labels and fallback`);
