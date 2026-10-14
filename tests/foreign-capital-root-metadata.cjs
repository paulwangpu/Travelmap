const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),HistoricalPeriods=require('../historical-periods.js');
const capitals=require('../data/china-ancient-capitals.json');
const catalog=require('../data/classical-sites/catalog.json');
const foreign=capitals.items.filter(item=>(item.classicalSiteKey&&item.country!=='中国')||['平壤','鄂尔浑河谷','斡耳朵八里','哈拉和林'].includes(item.currentPlace));
assert.equal(foreign.length,187);
for(const item of foreign){
  assert(item.coordinatePrecision,`${item.currentPlace}: missing coordinatePrecision`);
  assert.match(item.coordinatePrecision,/不表示|不能解释/);
  assert(item.boundaryRelations?.length||item.boundaryAudit?.status,`${item.currentPlace}: missing boundary scope audit`);
  assert(!JSON.stringify(item).match(/[传夏商周秦汉魏晋唐宋辽金元明清]代城墙/),`${item.currentPlace}: misleading Chinese-period wall label`);
  for(const record of item.records||[])assert(record['时代'],`${item.currentPlace}: missing corresponding Chinese period`);
}
for(const site of catalog.sites.filter(site=>site.historicalIdentity==='capital')){
  assert(site.period,`${site.name}: missing period`);
  assert(site.identityLabel,`${site.name}: missing identity label`);
  assert(site.identitySourceUrl,`${site.name}: missing identity source`);
}
const app=fs.readFileSync('app.js','utf8'),start=app.indexOf('function ancientCapitalBoundaryRelations('),end=app.indexOf('\nfunction focusAncientCapitalRelatedPlace(',start),ctx={escapeHtml:String};vm.createContext(ctx);vm.runInContext(app.slice(start,end),ctx);
const html=ctx.ancientCapitalBoundaryRelations({boundaryRelations:[{control:'元代城墙',city:'测试城',kind:'开放墙线',name:'测试墙'}]});
assert.match(html,/中国对应朝代：元/);assert(!html.includes('元代城墙'));assert(!html.includes('undefined'));
const hoverStart=app.indexOf('function foreignCapitalHoverMeta('),hoverEnd=app.indexOf('\nfunction ensureHistoricalCheckinCatalogs(',hoverStart),hoverCtx={HistoricalPeriods,state:{mapOverlays:{ancientCapitalPeriods:{}}}};vm.createContext(hoverCtx);vm.runInContext(app.slice(hoverStart,hoverEnd),hoverCtx);for(const item of foreign){const hover=hoverCtx.foreignCapitalHoverMeta(item);assert(hover?.identity,`${item.currentPlace}: missing local capital identity`);assert(HistoricalPeriods.keys.includes(hover.period),`${item.currentPlace}: invalid corresponding period`);assert(!/皇家城址皇家城址|宫都都城|政权都城/.test(hover.identity),`${item.currentPlace}: duplicated identity wording`);}
console.log(`PASS: ${foreign.length} foreign capital roots have explicit point precision, boundary scope and corresponding Chinese periods`);
