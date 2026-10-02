/* Load the original Esri style on demand; do not mirror or bulk-fetch tiles. */
(function (root) {
  const styleUrl = 'https://www.arcgis.com/sharing/rest/content/items/2475bfbe9b13460a8095c905db799cf7/resources/styles/root.json';
  const service = 'https://basemaps.arcgis.com/arcgis/rest/services/OpenBasemap_v2/VectorTileServer';
  const attribution = '© OpenStreetMap contributors, Microsoft, Esri Community Maps contributors · Map layer by Esri';
  let pending, cached;
  function scale(value, opacity) {
    if (typeof value === 'number') return value * opacity;
    if (value && !Array.isArray(value) && typeof value === 'object' && Array.isArray(value.stops)) {
      return { ...value, stops: value.stops.map(([input, output]) => [input, scale(output, opacity)]) };
    }
    if (Array.isArray(value) && ['interpolate', 'interpolate-hcl', 'interpolate-lab', 'step'].includes(value[0])) {
      const result = structuredClone(value);
      const start = value[0] === 'step' ? 2 : 4;
      for (let i = start; i < result.length; i += 2) result[i] = scale(result[i], opacity);
      return result;
    }
    return ['*', value, opacity];
  }
  async function load() {
    if (cached) return cached;
    if (!pending) pending = fetch(styleUrl, { signal: AbortSignal.timeout(20000) }).then(response => {
      if (!response.ok) throw new Error('Esri style HTTP ' + response.status);
      return response.json();
    }).then(style => {
      if (style.version !== 8 || !style.layers?.length) throw new Error('Invalid Esri basemap style');
      cached = style;
      return cached;
    }).catch(error => { pending = null; throw error; });
    return pending;
  }
  function build(style, opacity, projection) {
    const sources = {};
    for (const [id, source] of Object.entries(style.sources)) {
      sources['esri-relief-' + id] = { ...source, url: undefined, tiles: [service + '/tile/{z}/{y}/{x}.pbf'], minzoom: 0, maxzoom: 22, attribution };
      delete sources['esri-relief-' + id].url;
    }
    sources.basemap = { type: 'raster', tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 16, attribution: 'Terrain © Esri, USGS' };
    const layers = [{ id: 'basemap', type: 'raster', source: 'basemap', paint: { 'raster-opacity': opacity } }];
    for (const original of style.layers) {
      const layer = structuredClone(original);
      layer.id = 'esri-relief-' + layer.id;
      if (layer.source) layer.source = 'esri-relief-' + layer.source;
      layer.paint ||= {};
      const properties = { fill: ['fill-opacity'], line: ['line-opacity'], symbol: ['text-opacity', 'icon-opacity'], background: ['background-opacity'], circle: ['circle-opacity', 'circle-stroke-opacity'] }[layer.type] || [];
      for (const property of properties) layer.paint[property] = scale(layer.paint[property] ?? 1, opacity);
      layers.push(layer);
    }
    return { version: 8, projection, sources, layers, glyphs: style.glyphs, sprite: new URL(style.sprite, styleUrl).href };
  }
  const api = { load, build, scale, get cached() { return cached; } };
  root.EsriRelief = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
