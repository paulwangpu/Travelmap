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
    const width = ((east - west) % 360 + 360) % 360;
    west = ((west + 180) % 360 + 360) % 360 - 180;
    east = west + width;
    return east > 180 ? [[west, south, 180, north], [-180, south, east - 360, north]] : [[west, south, east, north]];
  }
  function units(records) {
    const seen = new Set();
    return records.filter(unit => {
      const key = unit.legend_id ?? JSON.stringify([unit.source_id, unit.map_unit_name || unit.name, unit.age, unit.color, unit.lith]);
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).sort((a, b) => (a.t_age == null ? Infinity : Number(a.t_age)) - (b.t_age == null ? Infinity : Number(b.t_age)) || (Number(a.b_age) || 0) - (Number(b.b_age) || 0));
  }
  let controller, timer, key = "", records = [], language = "", revision = 0, currentMode = "auto";
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
      const groupKey = `${unit.name}|${unit.age}|${unit.t_age}|${unit.b_age}|${unit.color}`;
      if (!groups.has(groupKey)) groups.set(groupKey, { ...unit, colors: new Set() });
      groups.get(groupKey).colors.add(unit.color);
    }
    const ageList = document.getElementById("geologyAgeList"); ageList.replaceChildren();
    for (const unit of groups.values()) {
      const row = node("div", null, "geology-age-row");
      const label = node("span", unit.name || (unit.age ? translateAge(unit.age, en) : (en ? 'Map unit' : '地质单元') + (unit.legend_id != null ? ' '+unit.legend_id : ''))); label.title = unit.name || translateAge(unit.age, en);
      const range = unit.t_age != null && unit.b_age != null ? `${Number(unit.t_age).toLocaleString()}–${Number(unit.b_age).toLocaleString()}` : "—";
      const colors = node("span", null, "geology-age-swatches");
      for (const color of unit.colors) colors.append(swatch({ color }));
      row.append(colors, label, node("span", range, "geology-age-range")); ageList.append(row);
    }
    document.getElementById("geologyLegendStatus").textContent = records.length ? (en ? "Colors follow map units · ages in Ma" : "颜色对应地质单元 · 年代单位：百万年前") : (en ? (currentMode === "auto" || currentMode === "global" ? "No mapped units in this view" : "No drawable polygons at this scale in this view. Try Automatic or Global overview.") : (currentMode === "auto" || currentMode === "global" ? "当前视野无地质单元" : "当前视野没有该尺度的可绘制地质面，可切换自动选择或全球概略图"));
  }
  async function update(map, enabled, en, mode = "auto") {
    mode = root.GeologyProviders.normalizeMode(mode);
    const languageChanged = language !== String(en);
    if (languageChanged || currentMode !== mode) closeDetail();
    if (currentMode !== mode) { records = []; key = ""; document.getElementById("geologyAgeList").replaceChildren(); }
    language = String(en);
    currentMode = mode;
    const sourceStatus = document.getElementById("geologyProviderStatus");
    const asian=mode==='asia';
    const clickHint=document.querySelector?.('[data-i18n="geologyClickHint"]');if(clickHint)clickHint.hidden=asian;
    const heading=document.querySelector?.('.geology-age-heading');if(heading)heading.hidden=asian;
    const credits=document.getElementById('geologyAttribution');if(credits)credits.hidden=asian;
    if(asian){if(!enabled||!map)closeDetail();clearTimeout(timer);controller?.abort();revision++;key='';records=[];if(sourceStatus)sourceStatus.textContent=en?'Ren Jishun team · Asian map image':'任吉顺团队 · 亚洲地质影像图';const list=document.getElementById('geologyAgeList');list.replaceChildren();list.append(node('p',en?'Map image; point queries unavailable.':'影像图层，暂不支持点击查询。','geology-raster-note'));const legendLink=node('a',en?'Original legend (reference)':'原版图例（参考）');legendLink.setAttribute('href','https://www.researchgate.net/publication/304485539_Legend');legendLink.setAttribute('target','_blank');legendLink.setAttribute('rel','noopener');legendLink.setAttribute('title',en?'Compiler-published IGMA legend; matching to this tile service is not yet verified.':'编制团队公开的亚洲地质图图例，尚未核实与当前瓦片完全一致。');list.append(legendLink);const link=node('a',en?'View original source · IGEO/CAGS':'查看原始图源 · IGEO/CAGS');link.setAttribute('href','https://dde.igeodata.org/');link.setAttribute('target','_blank');link.setAttribute('rel','noopener');list.append(link);document.getElementById('geologyLegendStatus').textContent=en?'Asia image · zooming in does not increase source detail':'亚洲地质影像 · 放大不会增加原图精度';return;}

    if (sourceStatus) sourceStatus.textContent = en ? (mode === "auto" ? "Combines available local, regional, continental and global maps · finer detail depends on coverage and zoom" : ({large:"Local detailed map",medium:"Regional geological map",small:"Continental geological map",global:"Macrostrat · global overview"}[mode])) : (mode === "auto" ? "按可用数据拼合局部、区域、洲际和全球地质图；细图随覆盖与缩放显示，缺失处使用较粗图。" : ({large:"局部详图",medium:"区域地质图",small:"洲际地质图",global:"Macrostrat · 全球概略图"}[mode]));
    if (sourceStatus && mode === "large" && map && map.getZoom() < 10) sourceStatus.textContent = en ? "Zoom in to view local geological detail." : "请继续放大查看局部详图。";
    clearTimeout(timer);
    if (!enabled || !map) { closeDetail(); controller?.abort(); key = ""; revision++; return; }
    const bounds = map.getBounds();
    const boxes = windows(bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
    const zoom = Math.max(0, Math.min(14, Math.round(map.getZoom())));
    if (detailPopup && (detailMap !== map || detailZoom !== zoom)) closeDetail();
    const nextKey = JSON.stringify([mode, boxes.map(box => box.map(n => Number(n.toFixed(3)))), zoom]);
    if (key === nextKey) { if (languageChanged) { render(en); } return; }
    controller?.abort(); const request = ++revision;
    timer = setTimeout(async () => {
      controller = new AbortController(); const active = controller;
      const timeout = setTimeout(() => active.abort(), 20000);
      document.getElementById("geologyLegendStatus").textContent = en ? "Loading current-view legend…" : "正在读取当前视野图例…";
      try {
        const results = await root.GeologyProviders.chooseAt(null, mode).legend(boxes, zoom, active.signal);
        if (request !== revision) return;
        records = units(results); key = nextKey; language = String(en); render(en);
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
  function scaleLabel(source, en) {
    const categories = en ? {large:'Local map', medium:'Regional map', small:'Continental map', tiny:'Global overview'} : {large:'局部详图', medium:'区域地质图', small:'洲际地质图', tiny:'全球概略图'};
    const category = categories[source?.scale];
    const numeric = root.GeologyProviders.scale(source);
    return [category, numeric].filter(Boolean).join(' · ') || (en ? 'Scale unspecified' : '尺度未注明');
  }
  function scaleGroups(records, en, complete = false) {
    const ranks = {large:0, medium:1, small:2, tiny:3};
    const labels = en ? {large:'Local map',medium:'Regional geology',small:'Continental geology',tiny:'Global overview'} : {large:'局部详图',medium:'区域地质图',small:'洲际地质图',tiny:'全球概略图'};
    const groups = new Map();
    if (complete) for (const category of Object.keys(ranks)) groups.set(category,{key:category,rank:ranks[category],label:labels[category],records:[],current:false});
    for (const record of records) {
      const category = Object.hasOwn(ranks, record.source?.scale) ? record.source.scale : 'unknown';
      const numeric = root.GeologyProviders.scale(record.source);
      const key = complete ? category : numeric || category;
      if (!groups.has(key)) groups.set(key, {key, rank:ranks[category] ?? 4, label:numeric || labels[category] || (en ? 'Unspecified' : '尺度未定'), records:[], current:false});
      const group = groups.get(key); group.records.push(record); group.current ||= Boolean(record.primary);
    }
    return [...groups.values()].sort((a,b)=> {
      const na=Number(a.key.replace(/^1:/,'').replace(/,/g,'')), nb=Number(b.key.replace(/^1:/,'').replace(/,/g,''));
      return Number.isFinite(na) && Number.isFinite(nb) ? na-nb : a.rank-b.rank;
    });
  }
  const sourceCache = new Map();
  let detailRequest = 0, detailController, detailPopup, detailMap, detailZoom;
  function closeDetail() {
    detailRequest++; detailController?.abort(); detailPopup?.remove(); detailPopup = null;
  }
  async function inspect(map, lng, lat, en, leaflet) {
    closeDetail(); const request = detailRequest;
    detailMap = map; detailZoom = Math.max(0, Math.min(14, Math.round(map.getZoom())));
    const content = node("section", null, "geology-detail");
    const header = node("header", null, "geology-detail-header");
    header.append(node("strong", en ? "Geology at this location" : "此处地质"), node("small", lat.toFixed(4) + ", " + lng.toFixed(4)));
    content.append(header);
    const body = node("div", en ? "Loading…" : "正在查询…"); content.append(body);
    const popup = leaflet ? L.popup({ maxWidth: 350, className: "geology-detail-popup" }).setLatLng([lat, lng]).setContent(content).openOn(map) : new maplibregl.Popup({ maxWidth: "350px", className: "geology-detail-popup" }).setLngLat([lng, lat]).setDOMContent(content).addTo(map);
    detailPopup = popup;
    let open = true;
    const removed = () => { open = false; if (request === detailRequest) detailController?.abort(); }; if (leaflet) popup.on("remove", removed); else popup.on("close", removed);
    if(currentMode==='asia'){body.replaceChildren(node('p',en?'The Asian map is a raster image. This source has no verified point query; formation and lithology are unavailable here.':'当前显示亚洲地质影像图。该图源尚无已核实的位置查询，暂不能提供此处地层与岩性。'));const link=node('a',en?'Open original source':'打开原始图源');link.setAttribute('href','https://dde.igeodata.org/');link.setAttribute('target','_blank');link.setAttribute('rel','noopener');body.append(link);return;}
    detailController = new AbortController(); const active = detailController;
    const timeout = setTimeout(() => active.abort(), 15000);
    try {
      const displayed = await root.GeologyProviders.chooseAt({lng,lat}, currentMode).inspect(lng, lat, map.getZoom(), active.signal);
      if (request !== detailRequest || !open) return;
      const data = {data: displayed, refs: {}};
      let comparisons = [], comparisonFailed = false;
      const categories=['large','medium','small','tiny'],failedScales=new Set(),seen=new Set();
      await Promise.all(categories.map(async category=>{try{
        const url = new URL("https://macrostrat.org/api/v2/geologic_units/map");
        url.searchParams.set("lng", ((lng + 180) % 360 + 360) % 360 - 180); url.searchParams.set("lat", lat);url.searchParams.set('scale',category);
        const response = await fetch(url, {signal:active.signal}); if(!response.ok) throw Error("Comparison query failed");
        const payload = (await response.json()).success; if(!Array.isArray(payload?.data)) throw Error("Invalid comparison response");
        Object.assign(data.refs,payload.refs||{});for(const unit of payload.data){const id=unit.source_id+':'+unit.map_id;if(!seen.has(id)){seen.add(id);comparisons.push(unit);}}
      }catch(error){failedScales.add(category);comparisonFailed=true;}}));
      if (root.GeologyAuto) { try { for(const [id,source]of await root.GeologyAuto.sources(active.signal))sourceCache.set(id,source); } catch(error) { /* Point source lookup below can still supply metadata. */ } }
      const missing = [...new Set([...data.data, ...comparisons].map(unit => Number(unit.source_id)).filter(Number.isFinite))].filter(id => !sourceCache.has(id));
      if (missing.length) {
        try {
          const sourcesUrl = new URL("https://macrostrat.org/api/v2/defs/sources"); sourcesUrl.searchParams.set("source_id", missing.join(","));
          const sourcesResponse = await fetch(sourcesUrl, { signal: active.signal });
          if (sourcesResponse.ok) for (const source of (await sourcesResponse.json()).success?.data || []) sourceCache.set(Number(source.source_id), source);
        } catch (error) { /* Keep the point records usable when source metadata is unavailable. */ }
      }
      if (request !== detailRequest || !open) return;
      body.replaceChildren();
      const primaryIds = new Set(displayed.map(u => String(u.map_id)));
      const enriched = displayed.map(unit=>{const match=comparisons.find(u=>String(u.map_id)===String(unit.map_id)&&Number(u.source_id)===Number(unit.source_id));return {...match,...unit,name:unit.name||match?.name||match?.strat_name,t_int_name:unit.t_int_name||match?.t_int_name||match?.best_int_name,lith:unit.lith||match?.lith,descrip:unit.descrip||match?.descrip,comments:unit.comments||match?.comments};});
      const ranked = [...enriched.map(unit => ({unit, source:sourceCache.get(Number(unit.source_id)), primary:true})), ...rankRecords(comparisons.filter(u => !primaryIds.has(String(u.map_id))), [...sourceCache.values()])];
      const tabs = node("div", null, "geology-detail-tabs"); tabs.setAttribute("role", "tablist");
      const groups = scaleGroups(ranked, en, true);
      const panels = groups.map(() => node("div")); const buttons = [];
      const selectedScale = currentMode === "global" ? "tiny" : currentMode;
      const selectedIndex = groups.findIndex(group => group.key === selectedScale);
      if (!displayed.length) body.append(node("p", ranked.length
        ? (en ? "No geology is shown here. Other query records are listed below." : "此处所选显示模式没有可绘制地质面；其他尺度的查询记录可在对应 tab 查看。")
        : comparisonFailed
          ? (en ? "The displayed map has no geology data here." : "此处地图暂无地质数据。")
          : (en ? "No geology data is available here." : "此处暂无地质数据。")));
      if (displayed.length > 1) body.append(node("p", en ? "Overlapping displayed units / boundary." : "此处位于重叠地质单元或边界。"));
      for (const [i,group] of groups.entries()) {
        const button = node("button", group.label + (group.current ? (en ? ' · Current' : ' · 当前') : !displayed.length && i === selectedIndex ? (en ? ' · Selected mode' : ' · 已选模式') : '')); button.type="button"; button.setAttribute("role","tab"); button.id = 'geology-tab-'+request+'-'+i;
        panels[i].id='geology-panel-'+request+'-'+i; panels[i].setAttribute("role","tabpanel"); panels[i].setAttribute("aria-labelledby",button.id); button.setAttribute("aria-controls",panels[i].id);
        const select = () => { buttons.forEach((b,j)=>{b.setAttribute("aria-selected",String(i===j)); b.tabIndex=i===j?0:-1; panels[j].hidden=i!==j;}); if (leaflet) popup.update(); else popup.setDOMContent(content); };
        button.addEventListener("click",select);
        button.addEventListener("keydown",e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?groups.length-1:(i+(e.key==='ArrowRight'?1:-1)+groups.length)%groups.length;buttons[j].click();buttons[j].focus();}});
        buttons.push(button); tabs.append(button);
      }
      if (groups.length) {
        body.append(tabs,...panels);
        buttons[Math.max(0,selectedIndex >= 0 ? selectedIndex : groups.findIndex(group=>group.current))].click();
      }
      for (const [i,group] of groups.entries()) if (!group.records.length) panels[i].append(node("p",failedScales.has(group.key) ? (en ? "This scale query failed. Use Retry below." : "该尺度查询失败，可使用下方重试。") : (en ? "No records at this scale were returned for this location." : "此处未查询到该尺度的记录。")));
      if (comparisonFailed) { body.append(node("p",en ? "Other records could not be queried." : "其他记录查询失败。")); const retry=node("button",en ? "Retry" : "重试"); retry.type="button";retry.addEventListener("click",()=>inspect(map,lng,lat,en,leaflet));body.append(retry); }
      for (const record of ranked) {
        const { unit, source, primary } = record;
        const item = node("article", null, primary ? "geology-primary-record" : "geology-comparison-record");
        const badge = node("div", null, "geology-record-label");
        const scaleBadge = node("span", scaleLabel(source, en));
        scaleBadge.title = root.GeologyProviders.scale(source) || (en ? 'The source does not provide a numeric map scale; the label describes its scale category.' : '原始图源未提供数值比例尺；此处显示图源的尺度分类。');
        badge.append(node("span", primary ? (en ? 'Displayed map' : '地图所示') : (en ? 'Other query record' : '其他查询记录')), scaleBadge); item.append(badge);
        if (!primary) item.append(node("small", en ? "Not displayed on the current map." : "未显示在当前地图中。"));
        if (unit.overview) item.append(node("small", en ? "Global overview retained at this zoom; zooming does not improve precision." : "放大保留的全球概略图；放大不会提高数据精度。"));
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
        if (unit.comments || data.refs?.[unit.source_id] || source?.name || unit.ref_title) { const refs = node("details"); refs.append(node("summary", en ? "Original map reference" : "原始图源")); if (source?.name || unit.ref_title) refs.append(node("p", source?.name || unit.ref_title)); if (unit.comments) refs.append(node("p", unit.comments)); if (data.refs?.[unit.source_id]) refs.append(node("p", data.refs[unit.source_id])); item.append(refs); }
        panels[groups.findIndex(group=>group.records.includes(record))].append(item);
      }
      body.append(node("small", "Macrostrat · CC BY 4.0"));
    } catch (error) {
      if (request === detailRequest && open) { body.replaceChildren(node("p",en ? "Displayed map query failed." : "地图所示图源查询失败。")); const retry=node("button",en ? "Retry" : "重试"); retry.type="button"; retry.addEventListener("click",()=>inspect(map,lng,lat,en,leaflet));body.append(retry); }
    } finally { clearTimeout(timeout); if (request === detailRequest && open) { if (leaflet) popup.update(); else popup.setDOMContent(content); } }
  }
  root.GeologyLegend = { update, windows, units, translateAge, rankRecords, ageHierarchy, lithologyParts, scaleLabel, scaleGroups, inspect, closeDetail };
  if (typeof module !== "undefined") module.exports = root.GeologyLegend;
})(typeof window !== "undefined" ? window : globalThis);
