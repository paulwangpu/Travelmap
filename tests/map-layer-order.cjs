const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync(require.resolve('../app.js'),'utf8');
let layers=[{id:'basemap',type:'raster'},{id:'arcgis-water-area',type:'fill'},{id:'arcgis-water-line',type:'line'},{id:'imperial-tomb-point',type:'symbol'},{id:'imperial-tomb-label',type:'symbol'},{id:'ancient-capital-point',type:'symbol'},{id:'ancient-capital-label',type:'symbol'},{id:'orm-track',type:'line'},{id:'imported-shapes-path-line',source:'imported-paths',type:'line'},{id:'great-wall-point',type:'symbol'},{id:'great-wall-label',type:'symbol'},{id:'visited-subadmin-fill',type:'fill'},{id:'admin-country-context-fill',type:'fill'},{id:'population-density',type:'raster'}];
let moves=0;const ctx={mapLibreMap:{getStyle:()=>({layers:layers.slice()}),moveLayer:id=>{moves++;const i=layers.findIndex(x=>x.id===id);layers.push(...layers.splice(i,1));}}};vm.createContext(ctx);
for(const name of ['mapLayerOrder','bringMapLibrePointLayersToFront']){const a=app.indexOf('function '+name+'('),b=app.indexOf('\nfunction ',a+10);vm.runInContext(app.slice(a,b),ctx);}
const before=(a,b)=>assert(layers.findIndex(x=>x.id===a)<layers.findIndex(x=>x.id===b),a+' must be below '+b);
layers.push({id:'geology',type:'raster'},{id:'geology-overview',type:'fill'});
ctx.bringMapLibrePointLayersToFront();before('basemap','population-density');before('population-density','geology-overview');before('geology-overview','geology');before('geology','visited-subadmin-fill');before('population-density','visited-subadmin-fill');before('admin-country-context-fill','visited-subadmin-fill');before('visited-subadmin-fill','arcgis-water-area');before('arcgis-water-area','arcgis-water-line');before('arcgis-water-line','orm-track');before('orm-track','imported-shapes-path-line');
for(const id of ['imperial-tomb-point','imperial-tomb-label','ancient-capital-point','ancient-capital-label','great-wall-point','great-wall-label'])before('imported-shapes-path-line',id);
for(const id of ['angkor-capital-label','angkor-labels','pompeii-labels','classical-sites-labels'])layers.push({id,type:'symbol'});
layers.push({id:'country-borders-line',type:'line'});ctx.bringMapLibrePointLayersToFront();
for(const id of ['angkor-capital-label','angkor-labels','pompeii-labels','classical-sites-labels'])before('country-borders-line',id);
const firstMoves=moves;ctx.bringMapLibrePointLayersToFront();assert.equal(moves,firstMoves,'unchanged ordering must not trigger moves');
layers.push({id:'map-points-circle',type:'circle'},{id:'map-points-label',type:'symbol'});ctx.bringMapLibrePointLayersToFront();
for(const id of ['imperial-tomb-point','ancient-capital-point','great-wall-point'])before('map-points-label',id);
layers.push({id:'visited-regions-fill',type:'fill'},{id:'arcgis-water-late-label',type:'symbol'});ctx.bringMapLibrePointLayersToFront();before('visited-regions-fill','arcgis-water-area');before('arcgis-water-late-label','imperial-tomb-label');
assert(app.includes('createPane("coveragePane").style.zIndex = "300"'));assert(app.includes('pane.style.zIndex = "450"'));
layers.push({id:'gallup-safety-fill',type:'fill'},{id:'gallup-safety-line',type:'line'},{id:'visited-countries-fill',type:'fill'});
ctx.bringMapLibrePointLayersToFront();
for(const id of ['gallup-safety-fill','gallup-safety-line']){before('basemap',id);before(id,'population-density');before(id,'visited-countries-fill');before(id,'visited-regions-fill');before(id,'visited-subadmin-fill');}
layers=layers.filter(l=>l.id!=='visited-countries-fill');layers.push({id:'visited-countries-fill',type:'fill'});ctx.bringMapLibrePointLayersToFront();before('gallup-safety-line','visited-countries-fill');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),options=[...html.matchAll(/<option value="([^"]+)" data-i18n="provider/g)].map(m=>m[1]);
assert.deepEqual(options.slice(options.indexOf('dem')-3,options.indexOf('dem')),['safetureRisk','gallupSafety','gallupLawOrder']);
for(const type of ['fill','line','label'])layers.push({id:'safeture-risk-'+type,type:type==='label'?'symbol':type});ctx.bringMapLibrePointLayersToFront();
for(const type of ['fill','line','label']){before('basemap','safeture-risk-'+type);before('safeture-risk-'+type,'visited-countries-fill');before('safeture-risk-'+type,'visited-subadmin-fill');}
for(const id of ['safeture-risk-country-fill','safeture-risk-country-line','safeture-risk-country-label','safeture-risk-display-fill'])layers.push({id,type:id.endsWith('label')?'symbol':'fill'});ctx.bringMapLibrePointLayersToFront();before('safeture-risk-display-fill','safeture-risk-country-fill');for(const id of ['safeture-risk-country-fill','safeture-risk-country-line','safeture-risk-country-label']){before(id,'safeture-risk-fill');before(id,'visited-countries-fill');}layers.reverse();ctx.bringMapLibrePointLayersToFront();before('safeture-risk-display-fill','safeture-risk-country-fill');before('safeture-risk-country-fill','safeture-risk-fill');before('safeture-risk-label','visited-countries-fill');
console.log('PASS: boundary redraws, async water, historic markers, stable overlay order and Leaflet panes');
