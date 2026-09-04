const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const functions = source.slice(source.indexOf('function mapEventHitsPoint('), source.indexOf('function ensureMapDetailCloseButton('))
  + source.slice(source.indexOf('function bindMapLibreLayerHandlers('), source.indexOf('function addMapLibreFillLayer('));
const callbacks = new Map();
const adminLayers = ['country-click-fill', 'visited-regions-fill', 'visited-subadmin-fill'];
let hits = [];
let calls = 0;
const context = {
  mapAddMode: false, mapPathMode: false, mapLibreLayerHandlersBound: {},
  mapLibreMap: {
    getLayer: (id) => adminLayers.includes(id) || id === 'us-nps-fill',
    queryRenderedFeatures: () => hits,
    on: (event, id, callback) => { if (event === 'click') callbacks.set(id, callback); },
  },
  markMapEventHandled: (event) => { event.originalEvent._travelMapHandled = true; },
  handleCountryClick: () => { calls++; },
  handleAdminRegionClick: () => { calls++; },
};
vm.createContext(context);
vm.runInContext(functions + '\nbindMapLibreLayerHandlers();', context);
for (const layer of adminLayers) {
  const click = callbacks.get(layer);
  assert.equal(typeof click, 'function');
  // Administrative listeners may run before the NPS listener.
  hits = [{ properties: { itemId: 'preserves:BITH' } }];
  let event = { point: { x: 100, y: 100 }, originalEvent: {}, features: [{}] };
  const before = calls;
  click(event);
  assert.equal(calls, before, layer + ' must yield to Big Thicket');
  assert.equal(event.originalEvent._travelMapHandled, undefined);
  // A non-selectable boundary must not swallow ordinary admin clicks.
  hits = [{ properties: {} }];
  event = { point: { x: 100, y: 100 }, originalEvent: {}, features: [{}] };
  click(event);
  assert.equal(calls, before + 1);
  assert.equal(event.originalEvent._travelMapHandled, true);
  // Drawing still belongs to the canvas handler, not either polygon.
  context.mapPathMode = true;
  click({ point: {}, originalEvent: {}, features: [{}] });
  assert.equal(calls, before + 1);
  context.mapPathMode = false;
}
console.log('PASS: NPS click priority across country, province, and city layers');
