/* OpenRailwayMap style adapter. Upstream style © Hidde Wieringa and contributors,
 * GPL-3.0-or-later: https://github.com/hiddewie/OpenRailwayMap-vector
 * Tiles are requested on demand, never bulk downloaded. */
const RailwayVector = (() => {
  const origin = 'https://openrailwaymap.app';
  let stylePromise;
  const installed = new WeakMap();
  const legendMaps = new WeakMap();
  let catalogPromise;
  function rewrite(value, defaults) {
    if (Array.isArray(value)) {
      if (value[0] === 'global-state') {
        const result = defaults[value[1]];
        return Array.isArray(result) ? ['literal', result] : result;
      }
      return value.map(item => rewrite(item, defaults));
    }
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewrite(item, defaults)]));
    return typeof value === 'string' && /^OpenRailwayMap-/.test(value) ? 'Noto Sans Regular' : value;
  }
  function constant(value) {
    if (!Array.isArray(value)) return value;
    const [op, ...args] = value;
    if (op === 'literal') return args[0];
    const a = args.map(constant);
    if (op === 'case') { for (let i = 0; i < a.length - 1; i += 2) if (a[i]) return a[i + 1]; return a.at(-1); }
    if (op === 'all') return a.every(Boolean);
    if (op === 'any') return a.some(Boolean);
    if (op === '!') return !a[0];
    if (op === '==') return a[0] === a[1];
    if (op === '!=') return a[0] !== a[1];
    if (op === '<') return a[0] < a[1];
    if (op === '>') return a[0] > a[1];
    if (op === '<=') return a[0] <= a[1];
    if (op === '>=') return a[0] >= a[1];
    if (op === 'in') return a[1].includes(a[0]);
    if (op === 'length') return a[0].length;
    throw new Error('Unsupported constant railway expression: ' + op);
  }
  async function loadStyle() {
    if (!stylePromise) stylePromise = fetch('./vendor/openrailwaymap/style.json?v=1').then(response => {
      if (!response.ok) throw new Error('Railway style HTTP ' + response.status);
      return response.json();
    }).catch(error => { stylePromise = null; throw error; });
    return stylePromise;
  }
  function adaptStyle(style, language) {
    const defaults = Object.fromEntries(Object.entries(style.state || {}).map(([key, item]) => [key, item.default]));
    Object.assign(defaults, { theme: 'light', tracks: 'usage', openHistoricalMap: false, stationLowZoomLabel: 'name', bearing: 0, pitched: false });
    const layers = style.layers.filter(layer => layer.source && !['dem', 'search', 'route', 'route_stops', 'openhistoricalmap'].includes(layer.source)).map(layer => {
      const result = rewrite(layer, defaults);
      if (Array.isArray(result.layout?.visibility)) result.layout.visibility = constant(result.layout.visibility);
      result.id = 'orm-' + result.id;
      result.source = 'orm-' + result.source;
      if (result.layout?.['text-font']) result.layout['text-font'] = ['Noto Sans Regular'];
      return result;
    }).filter(layer => layer.layout?.visibility !== 'none');
    const sourceIds = new Set(layers.map(layer => layer.source.slice(4)));
    const sources = Object.fromEntries([...sourceIds].map(id => {
      const source = structuredClone(style.sources[id]);
      if (source.url) {
        const url = new URL(source.url, origin);
        if (source.metadata?.supports?.includes('language')) url.searchParams.set('lang', language);
        source.url = url.href;
      }
      source.attribution = '© OpenStreetMap contributors · <a href="https://openrailwaymap.app/" target="_blank">OpenRailwayMap</a>';
      return ['orm-' + id, source];
    }));
    return { sources, layers, state: defaults, sprites: style.sprite.map(sprite => ({ ...sprite, url: new URL(sprite.url, origin).href })) };
  }
  function remove(map) {
    const record = installed.get(map);
    if (record) record.cancelled = true;
    for (const layer of [...(map.getStyle()?.layers || [])].reverse()) if (layer.id.startsWith('orm-')) map.removeLayer(layer.id);
    for (const id of Object.keys(map.getStyle()?.sources || {})) if (id.startsWith('orm-')) map.removeSource(id);
    installed.delete(map);
  }
  async function install(map, language) {
    remove(map);
    const record = { cancelled: false };
    installed.set(map, record);
    const adapted = adaptStyle(await loadStyle(), language);
    if (record.cancelled) return;
    // Use the existing glyph service; upstream fonts have no cross-origin support.
    for (const sprite of adapted.sprites) {
      if (!map.getStyle().sprite?.some?.(item => item.id === sprite.id)) map.addSprite(sprite.id, sprite.url);
    }
    if (!map._travelRailwayImageHandler) {
      const compose = railwayCompositeImages(map);
      const pending = new Set();
      const handler = async event => {
        const id = event.id;
        const raw = id.replace(/^sdf:/, '');
        if (!raw.includes('|') && !raw.includes('@')) return;
        if (pending.has(raw)) return;
        pending.add(raw);
        try {
          const result = await compose(raw.split('|'));
          for (const [name, data, sdf] of [[raw, result.imageData, false], ['sdf:' + raw, result.sdfImageData, true]]) {
            if (!map.hasImage(name)) map.addImage(name, { width: result.width, height: result.height, data }, { pixelRatio: result.pixelRatio, sdf });
          }
        } catch (error) { console.warn('Railway composite icon unavailable', id, error.message); }
        finally { pending.delete(raw); }
      };
      map._travelRailwayImageHandler = handler;
      map.on('styleimagemissing', handler);
    }
    for (const [id, source] of Object.entries(adapted.sources)) map.addSource(id, source);
    for (const layer of adapted.layers) map.addLayer(layer);
    record.layers = adapted.layers.map(layer => layer.id);
    return record;
  }
  function query(map, point) {
    const layers = (installed.get(map)?.layers || []).filter(id => map.getLayer(id));
    if (!layers.length) return null;
    const namedStation = feature => {
      const p = feature.properties || {};
      return feature.layer?.type === 'symbol' &&
        (/station|halt|tram_stop/.test(feature.sourceLayer || feature.layer?.['source-layer'] || '') || ['station', 'halt', 'tram_stop'].includes(p.feature)) &&
        Boolean(p.localized_name || p.name || p['name:zh'] || p['name:en'] || p.label);
    };
    // Rendered labels may be offset from their Point geometry. An exact hit on
    // a station label must win over an unnamed track underneath the text.
    const station = map.queryRenderedFeatures(point, { layers }).find(namedStation);
    if (station) return station;
    const features = map.queryRenderedFeatures([[point.x - 12, point.y - 12], [point.x + 12, point.y + 12]], { layers });
    // Prefer a named line over its casing or an unrelated nearby label.
    const distances = new Map(features.map(feature => [feature, featureDistance(map, point, feature)]));
    features.sort((a, b) => distances.get(a) - distances.get(b) || Number(Boolean(b.properties?.localized_name || b.properties?.name || b.properties?.label)) - Number(Boolean(a.properties?.localized_name || a.properties?.name || a.properties?.label)));
    const hit = features.find(feature => distances.get(feature) <= 12) || null;
    return resolveStationName(map, hit);
  }
  function resolveStationName(map, feature) {
    if (!feature || !['station', 'halt', 'tram_stop'].includes(feature.properties?.feature)) return feature;
    const properties = feature.properties;
    if (properties.localized_name || properties.name || properties.label || !map.querySourceFeatures) return feature;
    const source = feature.source || feature.layer?.source;
    if (!source || !map.getSource?.(source)) return feature;
    const identity = value => String(value ?? '').match(/(?:node|way|relation)-\d+/)?.[0] || String(value ?? '');
    const id = identity(properties.id || feature.id);
    const labels = map.querySourceFeatures(source, {sourceLayer:'standard_railway_text_stations'}).filter(item => item.properties?.localized_name || item.properties?.name || item.properties?.label);
    let label = id && labels.find(item => identity(item.properties?.id || item.id) === id);
    // Grouped station areas can reference an area/group ID instead of the label
    // node. Only use a uniquely named station point inside the actual polygon.
    if (!label && /Polygon/.test(feature.geometry?.type)) {
      const insideRing = (point, ring) => {
        let inside = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const a = ring[i], b = ring[j];
          if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0]) inside = !inside;
        }
        return inside;
      };
      const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      const contained = labels.filter(item => item.geometry?.type === 'Point' && polygons.some(rings => insideRing(item.geometry.coordinates, rings[0]) && !rings.slice(1).some(ring=>insideRing(item.geometry.coordinates,ring))));
      const names = new Set(contained.map(item=>item.properties.localized_name || item.properties.name || item.properties.label));
      if (names.size === 1) label = contained[0];
    }
    if (!label) return feature;
    const resolved = {...properties};
    for (const key of ['localized_name','name','name:zh','name:en','label']) if (label.properties[key]) resolved[key] = label.properties[key];
    resolved.name_source_layer = 'standard_railway_text_stations';
    return {type:feature.type, id:feature.id, source:feature.source, sourceLayer:feature.sourceLayer, layer:feature.layer, geometry:feature.geometry, properties:resolved};
  }
  function featureDistance(map, point, feature) {
    let distance = Infinity;
    const visit = coordinates => {
      if (typeof coordinates[0] === 'number') {
        const p = map.project(coordinates);
        distance = Math.min(distance, Math.hypot(p.x - point.x, p.y - point.y));
      } else if (typeof coordinates[0]?.[0] === 'number') {
        for (let i = 1; i < coordinates.length; i++) {
          const a = map.project(coordinates[i - 1]), b = map.project(coordinates[i]);
          const dx = b.x - a.x, dy = b.y - a.y;
          const length = dx * dx + dy * dy;
          const t = length ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length)) : 0;
          distance = Math.min(distance, Math.hypot(point.x - a.x - dx * t, point.y - a.y - dy * t));
        }
      } else coordinates.forEach(visit);
    };
    visit(feature.geometry.coordinates);
    if (/Polygon/.test(feature.geometry.type)) {
      const exact = map.queryRenderedFeatures(point, { layers: [feature.layer.id] });
      if (exact.some(item => item.id === feature.id)) return 0;
    }
    return distance;
  }
  const legendChinese = {
    'Under construction': '建设中铁路', 'Proposed railway': '规划铁路', 'Disused railway': '停用铁路', 'Milestone': '里程标', 'Interlocking': '联锁设施', 'Platform edge': '站台边缘', 'Stop position': '停车位置', 'Subway entrance': '地铁入口',
    'Highspeed main line': '高速铁路', 'Main line': '铁路干线', 'Branch line': '支线铁路', 'Industrial line': '工业铁路', 'Narrow gauge line': '窄轨铁路',
    'Subway': '地铁', 'Light rail': '轻轨', 'Tram': '有轨电车', 'Monorail': '单轨铁路', 'Test railway': '试验铁路', 'Military railway': '军事铁路', 'Miniature railway': '微型铁路',
    'Yard': '站场', 'Spur': '专用支线', 'Siding': '侧线', 'Crossover': '渡线', 'Tourism (preserved)': '观光／保留铁路', 'Ferry': '铁路轮渡',
    'Station': '车站', 'Station: large': '大型车站', 'Station: small': '小型车站', 'Station: disused, abandoned, preserved': '停用／废弃／保留车站', 'Station: construction': '在建车站', 'Station: proposed': '规划车站',
    'Halt': '乘降所', 'Tram stop': '电车站', 'Service station': '作业站', 'Railway yard': '铁路站场', 'Junction': '线路分岔点', 'Spur junction': '支线分岔点', 'Railway site': '铁路设施', 'Stop area group': '站点组', 'Platform': '站台',
    'Switch': '道岔', 'Wye switch': '对称道岔', 'Three-way switch': '三开道岔', 'Four-way switch': '四开道岔', 'Abt switch': '阿布特道岔', 'Single slip switch': '单式交分道岔', 'Double slip switch': '复式交分道岔', 'Railway crossing': '轨道交叉',
    'Border crossing': '国界交界', 'Owner change': '产权交界', 'Radio mast': '无线电塔', 'Container terminal': '集装箱场站', 'Ferry terminal': '轮渡码头', 'Lubricator': '润滑设施', 'Fuel': '加油设施', 'Sand store': '储砂设施', 'Defect detector': '故障探测器', 'Automatic equipment identification': '车辆自动识别',
    'Hump': '驼峰', 'Loading gauge': '限界架', 'Preheating': '预热设施', 'Compressed air supply': '压缩空气设施', 'Waste disposal': '废物处理', 'Coaling facility': '加煤设施', 'Wash': '洗车设施', 'Water tower': '水塔', 'Workshop': '维修车间', 'Engine shed': '机车库', 'Railway museum': '铁路博物馆', 'Power supply': '供电设施',
    'Rolling highway': '公铁联运', 'Pit': '检修坑', 'Loading rack': '装卸架', 'Loading ramp': '装卸坡道', 'Loading tower': '装卸塔', 'Unloading hole': '卸货坑', 'Weigh bridge': '轨道衡', 'Transporter car': '运输车', 'Bogie exchange': '转向架更换', 'Car shuttle': '汽车摆渡', 'Rotary car dumper': '翻车机',
    'Vacancy detection': '轨道占用检测', 'Isolated track section': '绝缘轨道段', 'Crossing': '平交道口', 'Hi-rail vehicle access point': '公铁两用车入口', 'Phone': '铁路电话', 'Buffer stop': '挡车器', 'Derailer': '脱轨器', 'Retarder': '减速器', 'Turntable': '转车台'
  };
  function translateLegend(container, language) {
    for (const caption of container.querySelectorAll('[data-legend-label]')) {
      const label = caption.dataset.legendLabel;
      caption.textContent = language === 'en' ? label : legendChinese[label] || label;
    }
  }
  // Adapted from the upstream LegendControl matching rules (GPL-3.0-or-later).
  function legendRows(adapted, catalog, zoom, features = null) {
    const matchesState = item => Object.entries(item.mapState || {}).every(([key, value]) =>
      Array.isArray(adapted.state[key]) ? adapted.state[key].includes(value) : adapted.state[key] === value);
    const atZoom = item => (item.minzoom ?? 0) <= zoom && zoom < (item.maxzoom ?? 24);
    const active = adapted.layers.filter(atZoom);
    const done = new Set(), rows = [];
    const keyOf = (properties, keys) => keys.map(key => String(properties[key] ?? '').replace(/\{[^}]+}/, '{}').replace(/@([^|]+|$)/g, '')).join('\u001e');
    for (const layer of active) {
      const sourceLayer = layer.source.slice(4) + '-' + layer['source-layer'];
      if (done.has(sourceLayer)) continue;
      done.add(sourceLayer);
      const visible = features?.filter(feature => feature.source === layer.source && feature.sourceLayer === layer['source-layer']);
      for (const [section, definition] of Object.entries(catalog.sourceLayers[sourceLayer] || {})) {
        if (!matchesState(definition)) continue;
        const keys = visible && new Set(visible.flatMap(feature => [definition.key || [], ...(definition.matchKeys || [])].map(key => keyOf(feature.properties || {}, key))));
        for (const item of definition.features || []) {
          if (!atZoom(item) || !matchesState(item) || (keys && (!visible.length || (item.keys?.length && !item.keys.some(key => keys.has(key)))))) continue;
          const samples = [item, ...(item.variants || []).map(variant => ({ ...item, ...variant, properties: { ...item.properties, ...variant.properties } }))].filter(sample => atZoom(sample) && matchesState(sample));
          rows.push({ ...item, sourceLayer, section, samples });
        }
      }
    }
    return rows;
  }
  async function legend(container, mainMap, mode = 'inView') {
    if (!mainMap || !installed.get(mainMap)?.layers) return;
    const revision = (Number(container.dataset.revision) || 0) + 1;
    container.dataset.revision = String(revision);
    try {
      catalogPromise ||= fetch('./vendor/openrailwaymap/legend.json?v=1').then(response => { if (!response.ok) throw new Error('Legend HTTP ' + response.status); return response.json(); }).catch(error => { catalogPromise = null; throw error; });
      const [style, catalog] = await Promise.all([loadStyle(), catalogPromise]);
      if (Number(container.dataset.revision) !== revision) return;
      const adapted = adaptStyle(style, 'en');
      const zoom = Math.floor(mainMap.getZoom());
      adapted.layers = adapted.layers.filter(layer => mainMap.getLayer(layer.id) && mainMap.getLayoutProperty(layer.id, 'visibility') !== 'none');
      const features = mode === 'inView' ? mainMap.queryRenderedFeatures({ layers: adapted.layers.map(layer => layer.id) }) : null;
      const rows = legendRows(adapted, catalog, zoom, features);
      const signature = JSON.stringify([zoom, mode, rows.map(row => [row.sourceLayer, row.legend, row.samples.map(sample => sample.properties)])]);
      if (container.dataset.signature === signature) { translateLegend(container, document.documentElement.lang.startsWith('zh') ? 'zh' : 'en'); return; }
      container.dataset.signature = signature;
      const scroll = container.parentElement.scrollTop;
      legendMaps.get(container)?.remove();
      legendMaps.delete(container);
      if (!rows.length) { container.textContent = document.documentElement.lang.startsWith('zh') ? '当前视野暂无铁路类型' : 'No railway types in this view'; return; }
      const canvas = document.createElement('div');
      canvas.className = 'railway-vector-legend-canvas';
      const rowHeight = 20;
      canvas.style.height = `${rows.length * rowHeight}px`;
      const captions = document.createElement('div');
      captions.className = 'railway-vector-legend-captions';
      for (const row of rows) {
        const caption = document.createElement('span');
        caption.textContent = row.legend;
        caption.dataset.legendLabel = row.legend;
        caption.title = row.legend;
        captions.append(caption);
      }
      container.replaceChildren(canvas, captions);
      translateLegend(container, document.documentElement.lang.startsWith('zh') ? 'zh' : 'en');
      const sources = {};
      const scale = 360 / (512 * 2 ** zoom);
      const latitude = pixel => Math.atan(Math.sinh(-pixel * scale * Math.PI / 180)) * 180 / Math.PI;
      rows.forEach((row, index) => {
        const dash = row.sourceLayer.indexOf('-');
        const sourceId = 'orm-' + row.sourceLayer.slice(0, dash) + '__' + row.sourceLayer.slice(dash + 1);
        sources[sourceId] ||= { type: 'geojson', data: { type: 'FeatureCollection', features: [] } };
        const y = (index + 0.5) * rowHeight - rows.length * rowHeight / 2;
        row.samples.forEach((sample, sampleIndex) => {
        const left = -32 + sampleIndex / row.samples.length * 64;
        const right = -32 + (sampleIndex + 1) / row.samples.length * 64;
        const center = (left + right) / 2;
        const a = [left * scale, latitude(y)], b = [right * scale, latitude(y)];
        const geometry = sample.type === 'line' ? { type: 'LineString', coordinates: [a, b] }
          : sample.type === 'polygon' ? { type: 'Polygon', coordinates: [[[left * scale, latitude(y - 5)], [right * scale, latitude(y - 5)], [right * scale, latitude(y + 5)], [left * scale, latitude(y + 5)], [left * scale, latitude(y - 5)]]] }
          : { type: 'Point', coordinates: [center * scale, latitude(y)] };
        sources[sourceId].data.features.push({ type: 'Feature', properties: { ...sample.properties, localized_name: sample.properties.localized_name ?? sample.properties.name }, geometry });
        });
      });
      const layers = adapted.layers.filter(layer => sources[layer.source + '__' + layer['source-layer']] && (layer.minzoom ?? 0) <= zoom && (layer.maxzoom ?? 24) > zoom).map(layer => {
        const result = structuredClone(layer);
        result.source += '__' + result['source-layer'];
        delete result['source-layer']; delete result.minzoom; delete result.maxzoom;
        if (result.layout) {
          if (result.layout['text-size']) result.layout['text-size'] = 9;
          delete result.layout['text-padding']; delete result.layout['text-offset']; delete result.layout['symbol-spacing']; delete result.layout['icon-offset'];
          if (result.layout['symbol-placement'] === 'line') result.layout['symbol-placement'] = 'line-center';
        }
        return result;
      });
      const map = new maplibregl.Map({ container: canvas, interactive: false, attributionControl: false, maxCanvasSize: [Infinity, Infinity], center: [0, 0], zoom, style: { version: 8, glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf', sprite: adapted.sprites, sources, layers } });
      legendMaps.set(container, map);
      container.parentElement.scrollTop = scroll;
      const compose = railwayCompositeImages(map);
      map.on('styleimagemissing', async ({ id }) => {
        const raw = id.replace(/^sdf:/, '');
        if (!raw.includes('|') && !raw.includes('@')) return;
        try {
          const image = await compose(raw.split('|'));
          if (!map.hasImage(id)) map.addImage(id, { width: image.width, height: image.height, data: id.startsWith('sdf:') ? image.sdfImageData : image.imageData }, { sdf: id.startsWith('sdf:'), pixelRatio: image.pixelRatio });
        } catch { /* Missing parts are reported by the main map. */ }
      });
      container.dataset.ready = 'true';
    } catch (error) {
      container.dataset.ready = '';
      container.textContent = '图例加载失败 / Legend unavailable';
      console.warn('Vector railway legend unavailable', error);
    }
  }
  return { install, remove, query, resolveStationName, adaptStyle, constant, origin, legend, legendRows, translateLegend, featureDistance };
})();
