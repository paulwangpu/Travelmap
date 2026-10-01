const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = vm.createContext({ URL, structuredClone, console });
vm.runInContext(fs.readFileSync('railway-vector.js', 'utf8') + '\nthis.adapter = RailwayVector;', context);
const upstream = JSON.parse(fs.readFileSync('vendor/openrailwaymap/style.json', 'utf8'));
const app = fs.readFileSync('app.js','utf8');
vm.runInContext(app.slice(app.indexOf('function defaultMapOverlays()'), app.indexOf('function isLightOverlayEnabled()')),context);
assert.equal(context.normalizeMapOverlays({}).railwayMode,'vector');
assert.equal(context.normalizeMapOverlays({railways:true}).railwayMode,'vector');
assert.equal(context.normalizeMapOverlays({railwayMode:'raster'}).railwayMode,'raster');
assert.equal(context.normalizeMapOverlays({railwayMode:'unknown'}).railwayMode,'vector');
const adapted = context.adapter.adaptStyle(upstream, 'zh');
assert(adapted.layers.length > 30);
assert(adapted.layers.every(layer => layer.id.startsWith('orm-') && adapted.sources[layer.source]));
assert(!JSON.stringify(adapted).includes('global-state'));
assert(!Object.keys(adapted.sources).some(id => /historical|dem|search|route_stops/.test(id)));
assert(adapted.layers.every(layer => !layer.layout?.visibility || layer.layout.visibility === 'visible'));
assert(Object.values(adapted.sources).every(source => source.url.startsWith('https://openrailwaymap.app/')));
const map = { project: ([x,y]) => ({x,y}) };
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
