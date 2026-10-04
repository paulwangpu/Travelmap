const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync(require.resolve('../app.js'),'utf8'),catalog=require('../data/china-ancient-capitals.json');
const ctx={chinaAncientCapitals:catalog,chinaAncientCapitalMeta:{},HistoricalPeriods:require('../historical-periods.js'),currentLanguage:'zh',uniqueTextValues:x=>[...new Set(x)],ancientCapitalDisplayEra:x=>({'隋唐及同期':'隋唐','宋辽夏金及同期':'宋辽金西夏'}[x]||x)};vm.createContext(ctx);
for(const name of ['ancientCapitalMergedMeta','ancientCapitalDetailRecords','ancientCapitalRecordYears','ancientCapitalMapSubtitle']){const a=app.indexOf('function '+name+'('),b=app.indexOf('\nfunction ',a+1);vm.runInContext(app.slice(a,b),ctx);}
const original=catalog.recordItems.find(x=>x.name==='幽州');
// The normalized name index has already been overwritten by the individual record.
ctx.chinaAncientCapitalMeta['幽州']=original;
const merged=ctx.ancientCapitalMergedMeta(original),records=ctx.ancientCapitalDetailRecords(merged);
assert.equal(records.length,3);assert.deepEqual(Array.from(records,x=>x.dynasty),['大燕（安史）','燕（刘守光）','辽']);
assert.equal(ctx.ancientCapitalMapSubtitle(merged),'隋唐、五代十国、宋辽金西夏 · 3 条记录');
assert(app.includes('ancientCapitalMergedMeta(chinaAncientCapitalMeta[canonicalPlaceKey(item)])'));
for(const record of catalog.recordItems.filter(x=>x.siteKey)){const site=catalog.items.find(x=>x.siteKey===record.siteKey);if(site)assert.equal(ctx.ancientCapitalDetailRecords(ctx.ancientCapitalMergedMeta(record)).length,site.records.length);}
console.log('PASS: all merged capital records survive same-name index collisions and full eras are displayed');
