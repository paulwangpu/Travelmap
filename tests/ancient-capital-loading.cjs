const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
const start=source.indexOf('function loadChinaAncientCapitals()'),end=source.indexOf('\nfunction getMapCountries()',start);
const base=require('../data/china-ancient-capitals.json'),supplement=require('../data/western-regions-36.json');
let failing=true;
const ctx={chinaAncientCapitalsPromise:null,chinaAncientCapitals:{},chinaAncientCapitalCoordinates:{},chinaAncientCapitalMeta:{},
  fixedChecklistTotals:{},checklistCatalog:{chinaAncientCapitals:{items:[]}},checklistOverlayCache:{signature:'old'},
  fetchJson:async url=>{if(failing)throw Error('server unavailable');return url.includes('western-regions')?supplement:base;},
  WesternRegions:require('../western-regions.js'),chinaAncientCapitalTotal:339,
  canonicalPlaceKey:x=>String(x),ancientCapitalCoordinateKey:(lng,lat)=>`${lng},${lat}`,
  ancientCapitalCurrentDisplayName:x=>x.currentPlace||x.name,isMapPageActive:()=>false,state:{},console:{warn:()=>{}}};
vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
(async()=>{
  await ctx.loadChinaAncientCapitals();
  assert.equal(ctx.chinaAncientCapitalsPromise,null,'failed requests can retry');
  failing=false;await ctx.loadChinaAncientCapitals();
  assert.equal(ctx.chinaAncientCapitals.recordCount,339);
  assert.equal(ctx.checklistCatalog.chinaAncientCapitals.items.length,339);
  assert.equal(Object.keys(ctx.chinaAncientCapitalMeta).length>0,true);
  const loaded=ctx.chinaAncientCapitals,names=ctx.checklistCatalog.chinaAncientCapitals.items;
  ctx.chinaAncientCapitalsPromise=null;failing=true;await ctx.loadChinaAncientCapitals();
  assert.equal(ctx.chinaAncientCapitals,loaded,'temporary failure retains last good catalog');
  assert.equal(ctx.checklistCatalog.chinaAncientCapitals.items,names);
  console.log('PASS: stopped server recovery, full capital load and last-good catalog preservation');
})().catch(error=>{console.error(error);process.exitCode=1;});
