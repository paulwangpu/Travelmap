const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = vm.createContext({ URL, structuredClone, console, HistoricalPeriods: require("../historical-periods.js") });
vm.runInContext(fs.readFileSync('railway-vector.js', 'utf8') + '\nthis.adapter = RailwayVector;', context);
const upstream = JSON.parse(fs.readFileSync('vendor/openrailwaymap/style.json', 'utf8'));
const app = fs.readFileSync('app.js','utf8');
const css = fs.readFileSync('styles.css','utf8');
assert.match(css, /#railwayLegend\s*\{\s*pointer-events:\s*auto;/,
  'railway legend must receive real pointer clicks, not inherit decorative pointer-events:none');
vm.runInContext(app.slice(app.indexOf('function defaultMapOverlays()'), app.indexOf('function isLightOverlayEnabled()')),context);
assert.equal(context.normalizeMapOverlays({}).railwayMode,'vector');
assert.equal(context.normalizeMapOverlays({railways:true}).railwayMode,'vector');
assert.equal(context.normalizeMapOverlays({railwayMode:'raster'}).railwayMode,'raster');
assert.equal(context.normalizeMapOverlays({railwayMode:'unknown'}).railwayMode,'vector');
const adapted = context.adapter.adaptStyle(upstream, 'zh');
const catalog = JSON.parse(fs.readFileSync('vendor/openrailwaymap/legend.json','utf8'));
const overview = context.adapter.legendRows(adapted,catalog,4);
const detail = context.adapter.legendRows(adapted,catalog,18);
assert(overview.length && detail.length > overview.length, 'legend follows actual zoom source tiers');
assert.equal(context.adapter.legendRows(adapted,catalog,4,[]).length,0);
const mainLine = {source:'orm-standard_railway_line_low',sourceLayer:'standard_railway_line_low',properties:{highspeed:false,feature:'rail',state:'present',usage:'main',service:null}};
const viewRows = context.adapter.legendRows(adapted,catalog,4,[mainLine]);
assert(viewRows.some(row=>row.legend === 'Main line'));
assert(!viewRows.some(row=>row.legend === 'Highspeed main line'),'view keys exclude unobserved types');
assert(overview.some(row=>row.samples.length>1),'upstream variants are retained');
assert(adapted.layers.length > 30);
assert(adapted.layers.every(layer => layer.id.startsWith('orm-') && adapted.sources[layer.source]));
assert(!JSON.stringify(adapted).includes('global-state'));
assert(!Object.keys(adapted.sources).some(id => /historical|dem|search|route_stops/.test(id)));
assert(adapted.layers.every(layer => !layer.layout?.visibility || layer.layout.visibility === 'visible'));
assert(Object.values(adapted.sources).every(source => source.url.startsWith('https://openrailwaymap.app/')));
const map = { project: ([x,y]) => ({x,y}) };
const stationArea = {id:'node-6172173700-subway-station',source:'orm-openrailwaymap_standard',properties:{id:'node-6172173700-subway-station',feature:'station',station:'subway'},geometry:{type:'Polygon',coordinates:[[[0,0],[10,0],[10,10],[0,10],[0,0]]]}};
const stationMap = {getSource:()=>true,querySourceFeatures:()=>[{id:'node-6172173700',properties:{id:'node-6172173700',localized_name:'永定门外'},geometry:{type:'Point',coordinates:[5,5]}}]};
assert.equal(context.adapter.resolveStationName(stationMap,stationArea).properties.localized_name,'永定门外');
stationMap.querySourceFeatures = ()=>[{properties:{name:'Area station'},geometry:{type:'Point',coordinates:[5,5]}}];
assert.equal(context.adapter.resolveStationName(stationMap,stationArea).properties.name,'Area station');
stationMap.querySourceFeatures = ()=>[{properties:{name:'Outside'},geometry:{type:'Point',coordinates:[15,15]}}];
assert.equal(context.adapter.resolveStationName(stationMap,stationArea),stationArea,'must not borrow unrelated nearby station name');
const line = {geometry:{type:'LineString',coordinates:[[0,0],[100,0]]}};
assert.equal(context.adapter.featureDistance(map,{x:50,y:12},line),12);
assert.equal(context.adapter.featureDistance(map,{x:50,y:13},line),13);
assert.equal(context.adapter.featureDistance(map,{x:50,y:0},line),0);
assert.equal(context.adapter.featureDistance(map,{x:110,y:0},line),10);
assert.equal(context.adapter.featureDistance(map,{x:3,y:4},{geometry:{type:'Point',coordinates:[0,0]}}),5);
console.log('PASS: real upstream standard railway style adapts without losing sources or unresolved global parameters');
async function interactions() {
  context.fetch = async () => ({ ok: true, json: async () => upstream });
  context.railwayCompositeImages = () => () => {};
  const fake = {
    layers: [], sources: {}, sprites: [],
    getStyle() { return { layers: this.layers, sources: this.sources, sprite: this.sprites }; },
    getLayer(id) { return this.layers.find(layer => layer.id === id); },
    addSource(id, source) { this.sources[id] = source; },
    removeSource(id) { delete this.sources[id]; },
    addLayer(layer) { this.layers.push(layer); },
    removeLayer(id) { this.layers = this.layers.filter(layer => layer.id !== id); },
    addSprite(id,url) { this.sprites.push({id,url}); },
    project: map.project,
    on() {},
    queryRenderedFeatures() { return [{...line,layer:{id:this.layers[0].id,type:'line'},properties:{name:'Test railway'}}]; }
  };
  await context.adapter.install(fake,'zh');
  assert.equal(fake.layers.length,adapted.layers.length);
  assert(context.adapter.query(fake,{x:50,y:12}));
  assert.equal(context.adapter.query(fake,{x:50,y:13}),null);
  const originalQuery = fake.queryRenderedFeatures;
  const stationLabel = {geometry:{type:'Point',coordinates:[200,200]},sourceLayer:'standard_railway_text_stations',layer:{id:fake.layers[0].id,type:'symbol'},properties:{localized_name:'北京南',feature:'station'}};
  fake.queryRenderedFeatures = point => Array.isArray(point) ? originalQuery.call(fake) : [stationLabel];
  assert.equal(context.adapter.query(fake,{x:50,y:0}),stationLabel,'exact station label wins even when its anchor is outside the line tolerance');
  fake.queryRenderedFeatures = originalQuery;
  context.adapter.remove(fake);
  assert.equal(fake.layers.length,0);
  assert.equal(Object.keys(fake.sources).length,0);
  const pending = context.adapter.install(fake,'en');
  context.adapter.remove(fake);
  await pending;
  assert.equal(fake.layers.length,0,'disabled overlay must not reappear after async loading');
  const failedContext = vm.createContext({ URL, structuredClone, console,
    fetch: async () => ({ok:false,status:503}) });
  vm.runInContext(fs.readFileSync('railway-vector.js','utf8')+'\nthis.adapter = RailwayVector;',failedContext);
  await assert.rejects(failedContext.adapter.install(fake,'zh'), /Railway style HTTP 503/);
  assert.equal(fake.layers.length,0,'resource failure must not silently install raster layers');
  console.log('PASS: vector install/remove, 12px nearest hit, and asynchronous cancellation');
}
interactions().catch(error=>{console.error(error);process.exitCode=1});
