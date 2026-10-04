const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const app = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const source = app.slice(app.indexOf('function mapLayerOrder('), app.indexOf('function refreshMapLibreDataOnly('));
for (const railway of [['orm-line', 'orm-station'], ['railway-network-raster']]) {
  const layers = [{ id: 'base' }, { id: 'path', source: 'imported-paths' }, { id: 'vertices', source: 'imported-paths' }, ...railway.map(id => ({ id })), { id: 'map-points-circle' }];
  const map = {
    getStyle: () => ({ layers: [...layers] }),
    getLayer: id => layers.find(layer => layer.id === id),
    moveLayer(id, before) {
      const [layer] = layers.splice(layers.findIndex(item => item.id === id), 1);
      layers.splice(before ? layers.findIndex(item => item.id === before) : layers.length, 0, layer);
    },
  };
  const context = { mapLibreMap: map };
  vm.runInNewContext(source, context);
  context.bringMapLibrePointLayersToFront();
  context.bringMapLibrePointLayersToFront();
  const ids = layers.map(layer => layer.id);
  assert.deepEqual(ids, ['base', ...railway, 'path', 'vertices', 'map-points-circle']);
}
console.log('PASS: vector and raster railways stay below personal paths; order remains stable');
