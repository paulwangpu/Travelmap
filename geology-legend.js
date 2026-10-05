/* Current-view legend from the same Macrostrat carto compilation as the tiles. */
(function (root) {
  const ages = { Quaternary: "第四纪", Neogene: "新近纪", Paleogene: "古近纪", Cretaceous: "白垩纪", Jurassic: "侏罗纪", Triassic: "三叠纪", Permian: "二叠纪", Carboniferous: "石炭纪", Devonian: "泥盆纪", Silurian: "志留纪", Ordovician: "奥陶纪", Cambrian: "寒武纪", Precambrian: "前寒武纪", Proterozoic: "元古宙", Archean: "太古宙", Hadean: "冥古宙", Cenozoic: "新生代", Mesozoic: "中生代", Paleozoic: "古生代", Holocene: "全新世", Pleistocene: "更新世", Pliocene: "上新世", Miocene: "中新世", Oligocene: "渐新世", Eocene: "始新世", Paleocene: "古新世", Paleoproterozoic: "古元古代", Mesoproterozoic: "中元古代", Neoproterozoic: "新元古代", Eoarchean: "始太古代", Paleoarchean: "古太古代", Mesoarchean: "中太古代", Neoarchean: "新太古代", Ediacaran: "埃迪卡拉纪", Cryogenian: "成冰纪", Tonian: "拉伸纪" };
  function translateAge(value, en) {
    if (en) return value || "Unspecified age";
    let text = value || "年代未定";
    for (const [key, label] of Object.entries(ages).sort((a, b) => b[0].length - a[0].length)) text = text.replace(new RegExp(`\\b${key}\\b`, "gi"), label);
    return text.replace(/\bPhanerozoic\b/gi, "显生宙").replace(/\bTertiary\b/gi, "第三纪").replace(/\bMississippian\b/gi, "密西西比亚纪").replace(/\bPennsylvanian\b/gi, "宾夕法尼亚纪").replace(/\bEarly\b/gi, "早").replace(/\bMiddle\b/gi, "中").replace(/\bLate\b/gi, "晚").replace(/\bLower\b/gi, "下").replace(/\bUpper\b/gi, "上").replace(/([早中晚下上])\s+(?=[\u4e00-\u9fff])/g, "$1");
  }
  function windows(west, south, east, north) {
    south = Math.max(-85, south); north = Math.min(85, north);
    if (east - west >= 360) return [[-180, south, 180, north]];
    const width = east - west;
    west = ((west + 180) % 360 + 360) % 360 - 180;
    east = west + width;
    return east > 180 ? [[west, south, 180, north], [-180, south, east - 360, north]] : [[west, south, east, north]];
  }
  function units(records) {
    const seen = new Set();
    return records.filter(unit => {
      const key = unit.legend_id ?? JSON.stringify([unit.source_id, unit.map_unit_name, unit.age, unit.color, unit.lith]);
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).sort((a, b) => (a.t_age == null ? Infinity : Number(a.t_age)) - (b.t_age == null ? Infinity : Number(b.t_age)) || (Number(a.b_age) || 0) - (Number(b.b_age) || 0));
  }
  let controller, timer, key = "", records = [], language = "", revision = 0;
  const node = (tag, text, className) => {
    const el = document.createElement(tag); if (text != null) el.textContent = text; if (className) el.className = className; return el;
  };
  function swatch(unit) {
    const el = node("i", null, "geology-swatch");
    el.style.backgroundColor = /^#[\da-f]{6}$/i.test(unit.color || "") ? unit.color : "#bcbcbc";
    el.setAttribute("aria-hidden", "true"); return el;
  }
  function render(en) {
    const groups = new Map();
    for (const unit of records) {
      const groupKey = `${unit.age}|${unit.t_age}|${unit.b_age}`;
      if (!groups.has(groupKey)) groups.set(groupKey, { ...unit, colors: new Set() });
      groups.get(groupKey).colors.add(unit.color);
    }
    const ageList = document.getElementById("geologyAgeList"); ageList.replaceChildren();
    for (const unit of groups.values()) {
      const row = node("div", null, "geology-age-row");
      const label = node("span", translateAge(unit.age, en)); label.title = unit.age || "";
      const range = unit.t_age != null && unit.b_age != null ? `${Number(unit.t_age).toLocaleString()}–${Number(unit.b_age).toLocaleString()}` : "—";
      const colors = node("span", null, "geology-age-swatches");
      for (const color of unit.colors) colors.append(swatch({ color }));
      row.append(colors, label, node("span", range, "geology-age-range")); ageList.append(row);
    }
    document.getElementById("geologyLegendStatus").textContent = records.length ? (en ? "Colors follow map units · ages in Ma" : "颜色对应地质单元 · 年代单位：百万年前") : (en ? "No mapped units in this view" : "当前视野无地质单元");
  }
  async function update(map, enabled, en) {
    clearTimeout(timer);
    if (!enabled || !map) { controller?.abort(); key = ""; revision++; return; }
    const bounds = map.getBounds();
    const boxes = windows(bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
    const zoom = Math.max(0, Math.min(14, Math.floor(map.getZoom())));
    const nextKey = JSON.stringify([boxes.map(box => box.map(n => Number(n.toFixed(3)))), zoom]);
    if (key === nextKey) { if (language !== String(en)) { language = String(en); render(en); } return; }
    controller?.abort(); const request = ++revision;
    timer = setTimeout(async () => {
      controller = new AbortController(); const active = controller;
      const timeout = setTimeout(() => active.abort(), 20000);
      document.getElementById("geologyLegendStatus").textContent = en ? "Loading current-view legend…" : "正在读取当前视野图例…";
      try {
        const results = await Promise.all(boxes.map(async box => {
          const url = new URL("https://macrostrat.org/api/v3/map/carto/legend");
          url.searchParams.set("bounds", box.join(",")); url.searchParams.set("zoom", zoom);
          const response = await fetch(url, { signal: active.signal });
          if (!response.ok) throw new Error(`Legend HTTP ${response.status}`);
          const data = await response.json(); if (!Array.isArray(data)) throw new Error("Invalid legend response"); return data;
        }));
        if (request !== revision) return;
        records = units(results.flat()); key = nextKey; language = String(en); render(en);
      } catch (error) {
        if (request !== revision) return;
        document.getElementById("geologyAgeList").replaceChildren();
        document.getElementById("geologyLegendStatus").textContent = en ? "Legend unavailable · retry" : "图例暂不可用 · 可重试";
      } finally { clearTimeout(timeout); }
    }, 250);
  }
  function rankRecords(records, sources) {
    const ranks = { large: 0, medium: 1, small: 2, tiny: 3 };
    const byId = new Map(sources.map(source => [Number(source.source_id), source]));
    return records.map((unit, index) => ({ unit, index, source: byId.get(Number(unit.source_id)) }))
      .sort((a, b) => (ranks[a.source?.scale] ?? 4) - (ranks[b.source?.scale] ?? 4) || a.index - b.index);
  }
  function ageHierarchy(age, en) {
    const paths = { Pliocene: ['Cenozoic', 'Neogene'], Miocene: ['Cenozoic', 'Neogene'], Neogene: ['Cenozoic'], Paleocene: ['Cenozoic', 'Paleogene'], Eocene: ['Cenozoic', 'Paleogene'], Oligocene: ['Cenozoic', 'Paleogene'], Paleogene: ['Cenozoic'], Holocene: ['Cenozoic', 'Quaternary'], Pleistocene: ['Cenozoic', 'Quaternary'], Quaternary: ['Cenozoic'], Cretaceous: ['Mesozoic'], Jurassic: ['Mesozoic'], Triassic: ['Mesozoic'], Permian: ['Paleozoic'], Carboniferous: ['Paleozoic'], Devonian: ['Paleozoic'], Silurian: ['Paleozoic'], Ordovician: ['Paleozoic'], Cambrian: ['Paleozoic'] };
    const base = String(age || '').replace(/^(Early|Middle|Late|Lower|Upper)\s+/i, '');
    return [...(paths[base] || []), ...(base !== age && paths[base] ? [base] : []), age].filter(Boolean).map(part => translateAge(part, en));
  }
  function lithologyParts(raw, en) {
    const names = { 'fine alluvium': '细粒冲积物', 'coarse alluvium': '粗粒冲积物', limestone: '石灰岩', silt: '粉砂', clay: '黏土', sand: '砂', gravel: '砾石', sandstone: '砂岩', siltstone: '粉砂岩', shale: '页岩', mudstone: '泥岩', conglomerate: '砾岩', sedimentary: '沉积岩', 'sedimentary rocks': '沉积岩', 'volcanic rocks': '火山岩', basalt: '玄武岩', granite: '花岗岩', gneiss: '片麻岩', schist: '片岩', dolomite: '白云岩', loess: '黄土' };
    const translate = value => en ? value.trim() : names[value.trim().toLowerCase()] || value.trim();
    const matches = [...String(raw || '').matchAll(/(Major|Minor):\s*\{([^}]+)\}/gi)];
    if (matches.length) return matches.map(match => ({ label: match[1].toLowerCase() === 'major' ? (en ? 'Main' : '主要') : (en ? 'Minor' : '次要'), text: match[2].split(',').map(translate).join(en ? ', ' : '、') }));
    return [{ label: '', text: raw ? translate(raw) : (en ? 'Unspecified' : '未注明') }];
  }
  const sourceCache = new Map();
  let detailRequest = 0, detailController, detailPopup;
  function closeDetail() {
    detailRequest++; detailController?.abort(); detailPopup?.remove(); detailPopup = null;
  }
  async function inspect(map, lng, lat, en, leaflet) {
    closeDetail(); const request = detailRequest;
    const content = node("section", null, "geology-detail");
    const header = node("header", null, "geology-detail-header");
    header.append(node("strong", en ? "Geology at this location" : "此处地质"), node("small", lat.toFixed(4) + ", " + lng.toFixed(4)));
    content.append(header);
    const body = node("div", en ? "Loading…" : "正在查询…"); content.append(body);
    const popup = leaflet ? L.popup({ maxWidth: 350, className: "geology-detail-popup" }).setLatLng([lat, lng]).setContent(content).openOn(map) : new maplibregl.Popup({ maxWidth: "350px", className: "geology-detail-popup" }).setLngLat([lng, lat]).setDOMContent(content).addTo(map);
    detailPopup = popup;
    let open = true;
    if (leaflet) popup.on("remove", () => { open = false; }); else popup.on("close", () => { open = false; });
    detailController = new AbortController(); const active = detailController;
    const timeout = setTimeout(() => active.abort(), 15000);
    try {
      const url = new URL("https://macrostrat.org/api/v2/geologic_units/map");
      url.searchParams.set("lng", ((lng + 180) % 360 + 360) % 360 - 180); url.searchParams.set("lat", lat);
      const response = await fetch(url, { signal: active.signal }); if (!response.ok) throw new Error("Geology query failed");
      const data = (await response.json()).success;
      if (!Array.isArray(data?.data)) throw new Error("Invalid geology response");
      const missing = [...new Set(data.data.map(unit => Number(unit.source_id)).filter(Number.isFinite))].filter(id => !sourceCache.has(id));
      if (missing.length) {
        try {
          const sourcesUrl = new URL("https://macrostrat.org/api/v2/defs/sources"); sourcesUrl.searchParams.set("source_id", missing.join(","));
          const sourcesResponse = await fetch(sourcesUrl, { signal: active.signal });
          if (sourcesResponse.ok) for (const source of (await sourcesResponse.json()).success?.data || []) sourceCache.set(Number(source.source_id), source);
        } catch (error) { /* Keep the point records usable when source metadata is unavailable. */ }
      }
      if (request !== detailRequest || !open) return;
      body.replaceChildren();
      if (!data.data.length) body.append(node("p", en ? "No mapped unit at this location" : "此处暂无地质单元数据"));
      const ranked = rankRecords(data.data, [...sourceCache.values()]);
      const alternatives = node("details", null, "geology-other-sources");
      alternatives.append(node("summary", en ? `Other map sources (${Math.max(0, ranked.length - 1)})` : `其他图源对照（${Math.max(0, ranked.length - 1)}）`));
      alternatives.append(node("small", en ? "Same location · different map scales" : "同一地点 · 不同比例尺的地图记录"));
      for (const [index, record] of ranked.entries()) {
        const { unit, source } = record;
        const item = node("article", null, index === 0 ? "geology-primary-record" : "geology-comparison-record");
        const scales = en ? { large: 'Local map', medium: 'Regional map', small: 'Continental map', tiny: 'Global map' } : { large: '局部详图', medium: '区域地质图', small: '洲际地质图', tiny: '全球概略图' };
        const badge = node("div", null, "geology-record-label");
        badge.append(node("span", index === 0 ? (en ? 'Primary record' : '主要记录') : (en ? 'Map comparison' : '图源对照')), node("span", scales[source?.scale] || (en ? 'Scale unspecified' : '比例尺未注明'))); item.append(badge);
        item.append(node("h3", unit.name || unit.strat_name || (en ? "Map unit" : "地质单元")));
        const facts = node("dl", null, "geology-facts");
        const age = node("dd", null, "geology-fact-age");
        const path = node("div", null, "geology-age-path");
        for (const [i, part] of ageHierarchy(unit.best_int_name || unit.t_int_name, en).entries()) { if (i) path.append(node("span", '›', 'geology-path-arrow')); path.append(node("span", part)); }
        age.append(path);
        if (unit.t_age != null && unit.b_age != null) age.append(node("small", unit.t_age + "–" + unit.b_age + (en ? " Ma" : " 百万年前")));
        const lithology = node("dd", null, "geology-fact-lithology"); lithology.title = unit.lith || '';
        for (const part of lithologyParts(unit.lith, en)) { const row = node("div"); if (part.label) row.append(node("span", part.label, "geology-lith-label")); row.append(node("span", part.text)); lithology.append(row); }
        facts.append(node("dt", en ? 'Age' : '年代'), age, node("dt", en ? 'Lithology' : '岩性'), lithology); item.append(facts);
        if (unit.descrip) { const description = node("details"); description.append(node("summary", en ? "Unit description" : "地层描述"), node("p", unit.descrip)); item.append(description); }
        if (unit.comments || data.refs?.[unit.source_id] || source?.name) { const refs = node("details"); refs.append(node("summary", en ? "Original map reference" : "原始图源")); if (source?.name) refs.append(node("p", source.name)); if (unit.comments) refs.append(node("p", unit.comments)); if (data.refs?.[unit.source_id]) refs.append(node("p", data.refs[unit.source_id])); item.append(refs); }
        if (index === 0) body.append(item); else alternatives.append(item);
      }
      if (ranked.length > 1) body.append(alternatives);
      body.append(node("small", "Macrostrat · CC BY 4.0"));
    } catch (error) {
      if (request === detailRequest && open) body.textContent = en ? "Query unavailable. Click to try again." : "查询暂不可用，请再次点击重试。";
    } finally { clearTimeout(timeout); }
  }
  root.GeologyLegend = { update, windows, units, translateAge, rankRecords, ageHierarchy, lithologyParts, inspect, closeDetail };
  if (typeof module !== "undefined") module.exports = root.GeologyLegend;
})(typeof window !== "undefined" ? window : globalThis);
