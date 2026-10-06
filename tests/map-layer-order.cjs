const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync(require.resolve('../app.js'),'utf8');
let layers=[{id:'basemap',type:'raster'},{id:'arcgis-water-area',type:'fill'},{id:'arcgis-water-line',type:'line'},{id:'imperial-tomb-point',type:'symbol'},{id:'imperial-tomb-label',type:'symbol'},{id:'ancient-capital-point',type:'symbol'},{id:'ancient-capital-label',type:'symbol'},{id:'orm-track',type:'line'},{id:'imported-shapes-path-line',source:'imported-paths',type:'line'},{id:'great-wall-point',type:'symbol'},{id:'great-wall-label',type:'symbol'},{id:'visited-subadmin-fill',type:'fill'},{id:'admin-country-context-fill',type:'fill'},{id:'population-density',type:'raster'}];
let moves=0;const ctx={mapLibreMap:{getStyle:()=>({layers:layers.slice()}),moveLayer:id=>{moves++;const i=layers.findIndex(x=>x.id===id);layers.push(...layers.splice(i,1));}}};vm.createContext(ctx);
for(const name of ['mapLayerOrder','bringMapLibrePointLayersToFront']){const a=app.indexOf('function '+name+'('),b=app.indexOf('\nfunction ',a+10);vm.runInContext(app.slice(a,b),ctx);}
const before=(a,b)=>assert(layers.findIndex(x=>x.id===a)<layers.findIndex(x=>x.id===b),a+' must be below '+b);
layers.push({id:'geology',type:'raster'},{id:'geology-overview',type:'fill'});
ctx.bringMapLibrePointLayersToFront();before('basemap','population-density');before('population-density','geology-overview');before('geology-overview','geology');before('geology','visited-subadmin-fill');before('population-density','visited-subadmin-fill');before('admin-country-context-fill','visited-subadmin-fill');before('visited-subadmin-fill','arcgis-water-area');before('arcgis-water-area','arcgis-water-line');before('arcgis-water-line','orm-track');before('orm-track','imported-shapes-path-line');
for(const id of ['imperial-tomb-point','imperial-tomb-label','ancient-capital-point','ancient-capital-label','great-wall-point','great-wall-label'])before('imported-shapes-path-line',id);
const firstMoves=moves;ctx.bringMapLibrePointLayersToFront();assert.equal(moves,firstMoves,'unchanged ordering must not trigger moves');
layers.push({id:'map-points-circle',type:'circle'},{id:'map-points-label',type:'symbol'});ctx.bringMapLibrePointLayersToFront();
for(const id of ['imperial-tomb-point','ancient-capital-point','great-wall-point'])before('map-points-label',id);
layers.push({id:'visited-regions-fill',type:'fill'},{id:'arcgis-water-late-label',type:'symbol'});ctx.bringMapLibrePointLayersToFront();before('visited-regions-fill','arcgis-water-area');before('arcgis-water-late-label','imperial-tomb-label');
assert(app.includes('createPane("coveragePane").style.zIndex = "300"'));assert(app.includes('pane.style.zIndex = "450"'));
console.log('PASS: boundary redraws, async water, historic markers, stable overlay order and Leaflet panes');
