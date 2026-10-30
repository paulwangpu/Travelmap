const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const el={hidden:true,innerHTML:'',classList:{add(){}},querySelector(){return null;}};
const state={mapOverlays:{populationDensity:true,populationPeriod:'2020',historicalAdminPeriod:'742',historicalAdminMetric:'population',historicalAdminLevel:'upper',populationOpacity:42}};
const ctx={console,document:{getElementById:id=>id==='historicalAdminLegend'?el:null}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('historical-admin.js','utf8'),ctx);
ctx.HistoricalAdmin.init({state:()=>state,language:()=> 'zh',fetch:async path=>JSON.parse(fs.readFileSync(path.split('?')[0],'utf8'))});
(async()=>{
 await ctx.HistoricalAdmin.loadCatalog();ctx.HistoricalAdmin.legend();
 assert.equal(el.hidden,false);
 assert(el.innerHTML.includes('现代栅格'));
 assert.equal((el.innerHTML.match(/data-history-period/g)||[]).length,1);
 assert.equal((el.innerHTML.match(/data-history-opacity/g)||[]).length,2); // input and output
 assert(/data-history-metric[^>]*disabled/.test(el.innerHTML));
 assert(/data-history-level[^>]*disabled/.test(el.innerHTML));
 assert(el.innerHTML.includes('ghs_pop2023.php'));
 const modern=el.innerHTML;ctx.HistoricalAdmin.legend();assert.equal(el.innerHTML,modern,'Avoid rebuilding unchanged controls during async render');
 state.mapOverlays.populationPeriod='742';ctx.HistoricalAdmin.legend();
 assert(el.innerHTML.includes('历史统计'));
 assert(!/data-history-metric[^>]*disabled/.test(el.innerHTML));
 assert(el.innerHTML.includes('value="42"'));
 assert(el.innerHTML.includes('value="population" selected'));
 assert(el.innerHTML.includes('s41597-026-07086-6'));
 assert(!fs.readFileSync('index.html','utf8').includes('id="populationDensityLegend"'),'Only one population menu');
 state.mapOverlays.populationDensity=false;ctx.HistoricalAdmin.legend();assert.equal(el.hidden,true);
 console.log('PASS: unified modern/ancient population controls, capabilities, opacity, sources and stable DOM');
})().catch(error=>{console.error(error);process.exitCode=1;});
