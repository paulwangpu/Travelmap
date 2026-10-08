/* Public GeoEPR 2021 ArcGIS snapshot; polygons describe research coverage. */
globalThis.EthnicRegions = (() => {
  const service = 'https://services3.arcgis.com/9nfxWATFamVUTTGb/arcgis/rest/services/Ethnicities/FeatureServer/0/query';
  let context, data, pending, popup, popupFeatures = [], revision = 0, renderedDataset = '';
  const cache = new Map(), requests = new Map();
  const dataset = () => context?.state().mapOverlays.ethnicRegionsSource === 'greg' ? 'greg' : 'geoepr';
  const gregService = 'https://services6.arcgis.com/C0HVLQJI37vYnazu/arcgis/rest/services/Global_Ethnic_Groups/FeatureServer/10/query';
  const labelLayers = [0,3,6,9].map(zoom => `ethnic-regions-label-${zoom}`);
  let activeMap = null;
  function labelProperties(feature) {
    const p = feature.properties;
    p.labelEn = p.group_;
    p.labelZh = p.dataset === 'greg' ? p.group_.split(' / ').map(n => GregTranslations.translate(n,p.countryCode)).join('／') : EthnicTranslations.group(p.group_,p.statename);
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    let area = 0;
    for (const polygon of polygons) {
      const ring = polygon[0]; let sum = 0;
      for (let i=1;i<ring.length;i++) {
        let delta = ring[i][0]-ring[i-1][0];
        if (delta>180) delta-=360; if (delta < -180) delta+=360;
        sum += delta*Math.PI/180*(2+Math.sin(ring[i-1][1]*Math.PI/180)+Math.sin(ring[i][1]*Math.PI/180));
      }
      area += Math.abs(sum)*6371*6371/2;
    }
    p.labelMinZoom = area >= 100000 ? 0 : area >= 10000 ? 3 : area >= 500 ? 6 : 9;
    p.labelOrder = -area;
  }
  // Explicit spelling variants only: mixed and religious groups remain distinct.
  const nameAliases = {
    mongolians:'mongols', uighur:'uyghur', kazakh:'kazakhs', kirghiz:'kyrgyz', dayaks:'dayak',
    anyuak:'anuak', azeri:'azerbaijanis', 'russian-speakers':'russian speakers',
    'bosniak/muslims':'bosniaks/muslims', gartfuna:'garifuna',
    'herero, mbanderu':'herero/mbanderu',
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const english = () => context.language() === 'en';
  function canonicalName(properties) {
    if (properties.dataset === 'greg') return `greg:${properties.groupIds}`;
    const kin = globalThis.EthnicKin?.byId[properties.gwgroupid];
    if (kin?.length === 1) return `tek:${kin[0]}`;
    // Several kin links denote an umbrella record, not one equivalent ethnicity.
    if (kin?.length > 1) return `tek-mixed:${kin.join(',')}`;
    const name = String(properties.group_ ?? '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
    // The African Yao people and the Chinese Yao ethnic group are unrelated.
    if (name === 'yao') return properties.statename === 'China' ? 'yao:china' : 'yao:africa';
    return nameAliases[name] || name || `unnamed:${properties.gwgroupid}`;
  }
  function color(properties) {
    let hash = 2166136261;
    for (const c of canonicalName(properties)) hash = Math.imul(hash ^ c.charCodeAt(0),16777619) >>> 0;
    // Derive a wider, stable palette from the name rather than country-specific IDs.
    return `hsl(${hash % 360}, ${58 + (hash >>> 9) % 20}%, ${42 + (hash >>> 17) % 15}%)`;
  }
  function html(features) {
    if (features[0]?.properties.dataset === 'greg') {
      const unique = [...new Map(features.map(f => [f.properties.gwgroupid,f])).values()];
      return '<strong>GREG · 1964</strong>' + unique.map(({properties:p}) => '<p><b title="' + escape(p.group_) + '">' + escape(english() ? p.group_ : p.group_.split(' / ').map(n => GregTranslations.translate(n,p.countryCode)).join('／')) + '</b></p>').join('') + '<small>' + (english() ? 'Historical ethnic settlement areas · 1964; mixed groups may share an area.' : '1964 年历史民族聚居范围；同一区域可能包含多个族群。') + '</small>';
    }
    const unique = [...new Map(features.map(f => [f.properties.gwgroupid, f])).values()];
    return `<strong>${english() ? 'Ethnic settlement areas · 2021' : '民族聚居区 · 2021'}</strong>` + unique.map(({properties:p}) => `<p><b title="${escape(p.group_)}">${escape(english() ? p.group_ : EthnicTranslations.group(p.group_,p.statename))}</b><br>${escape(english() ? p.statename : EthnicTranslations.country(p.statename))} · ${escape(english() ? p.type : EthnicTranslations.type(p.type))}<br>${escape(p.from_)}–${escape(p.to_)}${kinHtml(p)}</p>`).join('') + `<small>${english() ? 'GeoEPR research coverage; overlapping groups possible.' : 'GeoEPR 研究覆盖范围；多个族群可能重叠。'}</small>`;
  }
  function kinHtml(properties) {
    const ids = globalThis.EthnicKin?.byId[properties.gwgroupid] || [];
    if (!ids.length) return '';
    const lines = ids.map(id => {
      const records = globalThis.EthnicKin.groups[id];
      const sample = records.find(r => globalThis.EthnicKin.byId[r.id]?.length === 1) || records[0];
      const name = english() ? sample.name : EthnicTranslations.group(sample.name,sample.country);
      const countries = [...new Set(records.map(r => english() ? r.country : EthnicTranslations.country(r.country)))];
      const swatch = color({gwgroupid:sample.id,group_:sample.name,statename:sample.country});
      return `<span style="display:block"><i style="display:inline-block;width:9px;height:9px;background:${swatch};margin-right:4px"></i>${escape(name)}：${escape(countries.join('、'))}</span>`;
    });
    return `<br><small>${english() ? 'Cross-border kin (EPR-TEK)' : '跨境族群关联（EPR-TEK）'}${ids.length > 1 ? (english() ? ' · umbrella record' : ' · 合并记录，包含多个关联族群') : ''}${lines.join('')}</small>`;
  }
  async function load(mode = dataset()) {
    if (cache.has(mode)) return cache.get(mode);
    if (!requests.has(mode)) requests.set(mode, (async () => {
      const features = [];
      for (let offset = 0; ; offset += 1000) {
        const params = new URLSearchParams({f:'geojson', where:'from_ <= 2021 AND to_ >= 2021', outFields:'FID,group_,statename,from_,to_,type,gwgroupid', outSR:'4326', orderByFields:'FID', resultOffset:String(offset), resultRecordCount:'1000', maxAllowableOffset:'0.01'});
        if (mode === 'greg') {
          params.set('where','1=1'); params.set('outFields','OBJECTID,G1ID,G2ID,G3ID,G1SHORTNAM,G2SHORTNAM,G3SHORTNAM,FIPS_CNTRY'); params.set('orderByFields','OBJECTID');
        }
        const response = await fetch(`${mode === 'greg' ? gregService : service}?${params}`, {signal:AbortSignal.timeout(45000)});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (result.error || !Array.isArray(result.features)) throw new Error(result.error?.message || 'Invalid GeoJSON');
        for (const f of result.features) { if (f.geometry) {
          if (mode === 'greg') {
            const p = f.properties;
            f.properties = {dataset:'greg',group_:[1,2,3].map(i=>GregTranslations.clean(p['G'+i+'SHORTNAM'])).filter(Boolean).join(' / '),countryCode:p.FIPS_CNTRY,groupIds:[1,2,3].map(i=>p['G'+i+'ID']).filter(id=>id>0).sort((a,b)=>a-b).join(','),gwgroupid:p.OBJECTID};
          } else f.properties.dataset = 'geoepr';
          f.properties.color = color(f.properties); labelProperties(f); features.push(f);
        } }
        if (!result.exceededTransferLimit && result.features.length < 1000) break;
      }
      const result = {type:'FeatureCollection',features};
      cache.set(mode,result);
      return result;
    })().finally(() => { requests.delete(mode); }));
    pending = requests.get(mode);
    return pending;
  }
  function controls() {
    const overlays = context.state().mapOverlays;
    const mode = dataset();
    document.querySelector('#ethnicRegionsSource').value = mode;
    document.querySelector('#ethnicRegionsSourceLabel').textContent = english() ? 'Source' : '来源';
    document.querySelector('#ethnicRegionsNote').textContent = mode === 'greg' ? (english() ? 'Historical ethnic settlement areas from the 1964 Atlas of the Peoples of the World. Mixed groups can share an area; this is not present-day population distribution.' : '展示《世界民族地图集》（1964）的历史民族聚居范围，同一区域可能有多个族群，不代表当前人口分布。') : (english() ? 'Settlement areas of politically relevant ethnic groups covered by GeoEPR in 2021. Countries and groups outside its research scope may be missing; blank areas do not mean no inhabitants.' : '展示 GeoEPR 收录的 2021 年政治相关族群聚居范围，并非完整世界民族分布；部分国家和族群未收录，空白不表示无人居住。');
    document.querySelector('#ethnicKinSourceLink').hidden = mode !== 'geoepr';
    const link = document.querySelector('#ethnicRegionsSourceLink');
    link.href = mode === 'greg' ? 'https://icr.ethz.ch/data/greg/' : 'https://www.arcgis.com/home/item.html?id=c969daf5655c41fbbe9ae0140989efeb';
    link.textContent = (mode === 'greg' ? 'GREG' : 'GeoEPR') + (english() ? ' · Source / preview ↗' : ' · 来源与预览 ↗');
    document.querySelector('#ethnicRegionsRetry').textContent = english() ? 'Retry' : '重试';
    document.querySelector('#showEthnicRegionsOnMap').checked = !!overlays.ethnicRegions;
    document.querySelector('#ethnicRegionsLegend').hidden = !overlays.ethnicRegions;
    document.querySelector('#ethnicRegionsOpacity').value = overlays.ethnicRegionsOpacity ?? 45;
    document.querySelector('#ethnicRegionsOpacityValue').textContent = `${overlays.ethnicRegionsOpacity ?? 45}%`;
  }
  async function sync(map, leafletGroup) {
    const token = ++revision;
    const enabled = context.state().mapOverlays.ethnicRegions;
    activeMap = map || null;
    const mode = dataset();
    if (renderedDataset && renderedDataset !== mode) {
      popup?.remove();
      if (map) { for (const id of [...labelLayers,'ethnic-regions-line','ethnic-regions-fill']) if (map.getLayer(id)) map.removeLayer(id); if (map.getSource('ethnic-regions')) map.removeSource('ethnic-regions'); }
      renderedDataset = '';
    }
    controls();
    if (!enabled) popup?.remove();
    if (map?.getLayer('ethnic-regions-fill')) {
      for (const id of ['ethnic-regions-fill','ethnic-regions-line',...labelLayers]) if(map.getLayer(id)) map.setLayoutProperty(id,'visibility', enabled ? 'visible' : 'none');
      map.setPaintProperty('ethnic-regions-fill','fill-opacity',(context.state().mapOverlays.ethnicRegionsOpacity ?? 45)/100);
      return;
    }
    if (!enabled) return;
    const status = document.querySelector('#ethnicRegionsStatus');
    const retry = document.querySelector('#ethnicRegionsRetry');
    retry.hidden = true;
    status.textContent = english() ? 'Loading settlement areas…' : '正在加载聚居区…';
    try {
      const geojson = await load(mode);
      if (token !== revision || !context.state().mapOverlays.ethnicRegions) return;
      data = geojson;
      renderedDataset = mode;
      const opacity = (context.state().mapOverlays.ethnicRegionsOpacity ?? 45)/100;
      if (map) {
        map.addSource('ethnic-regions',{type:'geojson',data:geojson,attribution:mode === 'greg' ? 'GREG · Weidmann, Rød & Cederman (2010) · 1964' : 'GeoEPR 2021 · ETH Zürich'});
        const before = map.getStyle().layers.find(l => l.type === 'symbol')?.id;
        map.addLayer({id:'ethnic-regions-fill',type:'fill',source:'ethnic-regions',paint:{'fill-color':['get','color'],'fill-opacity':opacity}},before);
        map.addLayer({id:'ethnic-regions-line',type:'line',source:'ethnic-regions',paint:{'line-color':['get','color'],'line-width':0.7,'line-opacity':0.8}},before);
        [0,3,6,9].forEach((zoom,index) => map.addLayer({
          id:labelLayers[index],type:'symbol',source:'ethnic-regions',minzoom:zoom,...(index<3 ? {maxzoom:[3,6,9][index]} : {}),
          filter:['<=',['get','labelMinZoom'],zoom],
          layout:{'text-field':['get',english() ? 'labelEn' : 'labelZh'],'text-font':['Open Sans Regular','Arial Unicode MS Regular'],'text-size':12,'text-max-width':10,'text-padding':5,'symbol-sort-key':['get','labelOrder'],'text-allow-overlap':false},
          paint:{'text-color':'#24352d','text-halo-color':'rgba(255,255,255,0.95)','text-halo-width':1.5},
        }));
        context.front();
      } else if (leafletGroup) {
        const layer = L.geoJSON(geojson,{bubblingMouseEvents:false,style:f => ({color:f.properties.color,weight:0.7,fillOpacity:opacity}),onEachFeature:(f,l) => {
          l.bindPopup(html([f]));
          l.bindTooltip(escape(english() ? f.properties.labelEn : f.properties.labelZh),{permanent:true,direction:'center',className:'ethnic-region-label'});
        }}).addTo(leafletGroup);
        const leafletMap = leafletGroup._map;
        const update = () => layer.eachLayer(l => { if(leafletMap.getZoom() >= l.feature.properties.labelMinZoom) l.openTooltip(); else l.closeTooltip(); });
        if (leafletMap) { update(); leafletMap.on('zoomend',update); layer.on('remove',()=>leafletMap.off('zoomend',update)); }
      }
      status.textContent = english() ? `${geojson.features.length} settlement records · click an area` : `${geojson.features.length} 条聚居区记录 · 点击区域查看`;
    } catch (error) { if (token === revision) { retry.hidden = false; status.textContent = english() ? 'Loading failed. Use Retry.' : '加载失败，请点击重试。'; } }
  }
  function click(map,event) {
    if (!context.state().mapOverlays.ethnicRegions || !map?.getLayer('ethnic-regions-fill')) return false;
    const features = map.queryRenderedFeatures(event.point,{layers:['ethnic-regions-fill']});
    if (!features.length) return false;
    popup?.remove();
    popupFeatures = features;
    popup = new maplibregl.Popup({maxWidth:'320px'}).setLngLat(event.lngLat).setHTML(html(features)).addTo(map);
    const activePopup = popup;
    popup.on('close', () => { if (popup === activePopup) { popup = null; popupFeatures = []; } });
    return true;
  }
  function refreshLanguage() {
    if (!context) return;
    controls();
    if (activeMap) for (const id of labelLayers) if (activeMap.getLayer(id)) activeMap.setLayoutProperty(id,'text-field',['get',english() ? 'labelEn' : 'labelZh']);
    if (popup && popupFeatures.length) popup.setHTML(html(popupFeatures));
    const status = document.querySelector('#ethnicRegionsStatus');
    const currentData = cache.get(dataset());
    if (currentData) status.textContent = english() ? `${currentData.features.length} area records · click an area` : `${currentData.features.length} 条区域记录 · 点击区域查看`;
    else if (requests.has(dataset())) status.textContent = english() ? 'Loading settlement areas…' : '正在加载聚居区…';
    else if (!document.querySelector('#ethnicRegionsRetry').hidden) status.textContent = english() ? 'Loading failed. Use Retry.' : '加载失败，请点击重试。';
  }
  function init(ctx) {
    context = ctx;
    document.querySelector('#showEthnicRegionsOnMap').addEventListener('change',e => { context.state().mapOverlays.ethnicRegions = e.target.checked; context.save(); context.render(); });
    document.querySelector('#ethnicRegionsOpacity').addEventListener('input',e => { context.state().mapOverlays.ethnicRegionsOpacity = Number(e.target.value); context.save(); context.render(); });
    document.querySelector('#ethnicRegionsRetry').addEventListener('click',() => context.render());
    document.querySelector('#ethnicRegionsSource').addEventListener('change',e => { context.state().mapOverlays.ethnicRegionsSource = e.target.value; data = null; context.save(); context.render(); });
  }
  return {init,sync,click,controls,canonicalName,color,refreshLanguage,labelProperties};
})();
