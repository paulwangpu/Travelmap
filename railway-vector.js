/* OpenRailwayMap style adapter. Upstream style © Hidde Wieringa and contributors,
 * GPL-3.0-or-later: https://github.com/hiddewie/OpenRailwayMap-vector
 * Tiles are requested on demand, never bulk downloaded. */
const RailwayVector = (() => {
  const origin = 'https://openrailwaymap.app';
  let stylePromise;
  const installed = new WeakMap();
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
    return { sources, layers, sprites: style.sprite.map(sprite => ({ ...sprite, url: new URL(sprite.url, origin).href })) };
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
    const features = map.queryRenderedFeatures([[point.x - 12, point.y - 12], [point.x + 12, point.y + 12]], { layers });
    // Prefer a named line over its casing or an unrelated nearby label.
    const distances = new Map(features.map(feature => [feature, featureDistance(map, point, feature)]));
    features.sort((a, b) => distances.get(a) - distances.get(b) || Number(Boolean(b.properties?.name)) - Number(Boolean(a.properties?.name)));
    return features.find(feature => distances.get(feature) <= 12) || null;
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
  async function legend(container) {
    if (container.dataset.ready) return;
    container.dataset.ready = 'loading';
    try {
      const [style, catalog] = await Promise.all([loadStyle(), fetch('./vendor/openrailwaymap/legend.json?v=1').then(response => response.json())]);
      const adapted = adaptStyle(style, 'en');
      const rows = [];
      const groups = new Set(['usage', 'stations', 'switches', 'pois', 'platforms', 'turntables']);
      for (const [sourceLayer, definitions] of Object.entries(catalog.sourceLayers)) {
        if (!/^(high-|openrailwaymap_standard-|openrailwaymap_points_of_interest-)/.test(sourceLayer)) continue;
        for (const [key, definition] of Object.entries(definitions)) if (groups.has(key)) {
          for (const feature of definition.features) rows.push({ ...feature, sourceLayer });
        }
      }
      const canvas = document.createElement('div');
      canvas.className = 'railway-vector-legend-canvas';
      canvas.style.height = `${rows.length * 34}px`;
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
      const scale = 360 / (512 * 2 ** 18);
      const latitude = pixel => Math.atan(Math.sinh(-pixel * scale * Math.PI / 180)) * 180 / Math.PI;
      rows.forEach((row, index) => {
        const dash = row.sourceLayer.indexOf('-');
        const sourceId = 'orm-' + row.sourceLayer.slice(0, dash) + '__' + row.sourceLayer.slice(dash + 1);
        sources[sourceId] ||= { type: 'geojson', data: { type: 'FeatureCollection', features: [] } };
        const y = (index + 0.5) * 34 - rows.length * 17;
        const a = [-32 * scale, latitude(y)], b = [32 * scale, latitude(y)];
        const geometry = row.type === 'line' ? { type: 'LineString', coordinates: [a, b] }
          : row.type === 'polygon' ? { type: 'Polygon', coordinates: [[[-25 * scale, latitude(y - 8)], [25 * scale, latitude(y - 8)], [25 * scale, latitude(y + 8)], [-25 * scale, latitude(y + 8)], [-25 * scale, latitude(y - 8)]]] }
          : { type: 'Point', coordinates: [0, latitude(y)] };
        sources[sourceId].data.features.push({ type: 'Feature', properties: row.properties, geometry });
      });
      const layers = adapted.layers.filter(layer => sources[layer.source + '__' + layer['source-layer']] && (layer.minzoom ?? 0) <= 18 && (layer.maxzoom ?? 24) > 18).map(layer => {
        const result = structuredClone(layer);
        result.source += '__' + result['source-layer'];
        delete result['source-layer']; delete result.minzoom; delete result.maxzoom;
        return result;
      });
      const map = new maplibregl.Map({ container: canvas, interactive: false, attributionControl: false, center: [0, 0], zoom: 18, style: { version: 8, glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf', sprite: adapted.sprites, sources, layers } });
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
  return { install, remove, query, adaptStyle, constant, origin, legend, translateLegend, featureDistance };
})();
