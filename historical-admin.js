globalThis.HistoricalAdmin = (() => {
  let context, catalog, catalogPending, revision = 0, leafletGroup, leafletFill, activeMap, hoverPopup, pinnedPopup, error = '';
  const data = new Map(), pending = new Map(), leafletBound = new WeakSet(), mapBound = new WeakSet();
  const layers = ['historical-admin-fill','historical-admin-line','historical-admin-label','historical-admin-population'];
  const densityBreaks = [5,20,50,100,200,500];
  const densityColors = ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#e34a33','#b30000'];
  const empty = () => ({type:'FeatureCollection',features:[]});
  const en = () => context.language() === 'en';
  const options = () => context.state().mapOverlays || {};
  const enabled = () => Boolean(options().historicalAdmin);
  const year = () => String(options().historicalAdminPeriod || '1820');
  const level = () => options().historicalAdminLevel === 'prefecture' ? 'prefecture' : 'upper';
  const metric = () => ['density','population'].includes(options().historicalAdminMetric) ? options().historicalAdminMetric : 'regions';
  const radiusFactor = () => level()==='upper' ? .004 : .01;
  const populationPoints = d => ({type:'FeatureCollection',features:d.features.filter(f=>f.properties.population>0&&f.properties.labelCoordinates).map(f=>({...f,geometry:{type:'Point',coordinates:f.properties.labelCoordinates}}))});
  const densityColor = n => n == null ? '#c4c9c6' : densityColors[densityBreaks.filter(x=>n>=x).length];
  const fillColor = () => metric()==='density' ? ['case',['==',['get','populationDensity'],null],'#c4c9c6',['step',['get','populationDensity'],densityColors[0],...densityBreaks.flatMap((x,i)=>[x,densityColors[i+1]])]] : metric()==='population' ? '#e3e7df' : ['get','color'];
  const opacityPercent = () => options().historicalAdminOpacity == null || !Number.isFinite(Number(options().historicalAdminOpacity)) ? 13 : Math.max(0,Math.min(100,Number(options().historicalAdminOpacity)));
  function applyOpacity() {
    if(activeMap?.getLayer('historical-admin-fill')) {
      activeMap.setPaintProperty?.('historical-admin-fill','fill-opacity',opacityPercent()/100);
      activeMap.setPaintProperty?.('historical-admin-fill','fill-color',fillColor());
    }
    if(activeMap?.getLayer('historical-admin-population')) {
      activeMap.setLayoutProperty?.('historical-admin-population','visibility',metric()==='population'?'visible':'none');
      activeMap.setPaintProperty?.('historical-admin-population','circle-radius',['*',radiusFactor(),['sqrt',['get','population']]]);
      activeMap.setPaintProperty?.('historical-admin-population','circle-opacity',opacityPercent()/100);
    }
    if(activeMap?.getLayer('historical-admin-label')) {
      activeMap.setLayoutProperty?.('historical-admin-label','text-variable-anchor',metric()==='population'?['top','bottom','left','right']:null);
      activeMap.setLayoutProperty?.('historical-admin-label','text-radial-offset',metric()==='population'?['+',.6,['/', ['*',radiusFactor(),['sqrt',['coalesce',['get','population'],0]]],12]]:0);
    }
    leafletFill?.setStyle(f=>({fillColor:metric()==='density'?densityColor(f.properties.populationDensity):metric()==='population'?'#e3e7df':f.properties.color,fillOpacity:opacityPercent()/100}));
    leafletGroup?.eachLayer?.(layer=>{if(layer._historicalPopulationCircle)layer.setStyle({fillOpacity:opacityPercent()/100});});
  }
  const labelCollection = d => ({type:'FeatureCollection',features:d.features.filter(f=>!f.properties.suppressLabel&&f.properties.labelCoordinates).map(f=>({...f,geometry:{type:'Point',coordinates:f.properties.labelCoordinates}}))});
  const esc = x => String(x ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const populationText = n => n == null ? (en()?'No data':'暂无记录') : en() ? Number(n).toLocaleString('en-US') : n>=1e8 ? (n/1e8).toFixed(2)+'亿人' : n>=1e4 ? (n/1e4).toFixed(2)+'万人' : Number(n).toLocaleString('zh-CN')+'人';
  const methodName = key => ({recorded:en()?'Population records':'人口记录',household_conversion:en()?'Households × 5':'户数 × 5 换算',historical_estimate:en()?'Historical estimate':'史家估算',neighbor_estimate:en()?'Neighbor-based estimate':'邻区推算',missing:en()?'No records':'无记录'})[key]||key;
  function populationPopup(p) {
    let methods=p.populationMethods||{};if(typeof methods==='string'){try{methods=JSON.parse(methods);}catch{methods={};}}
    const density=p.populationDensity==null?(en()?'No data':'暂无记录'):Number(p.populationDensity).toLocaleString(en()?'en-US':'zh-CN',{maximumFractionDigits:1})+(en()?' people/km²':' 人/km²');
    const area=p.populationKnownAreaKm2==null?'—':Number(p.populationKnownAreaKm2).toLocaleString(en()?'en-US':'zh-CN',{maximumFractionDigits:0})+' km²';
    return `<div class="historical-population-popup"><strong>${esc(p.displayName||p.nameZh||p.name)}</strong><div>${esc(year())}${en()?' AD':'年'} · ${esc(en()?p.parent:p.parentZh)}</div><dl><dt>${en()?'Population':'人口'}</dt><dd>${esc(populationText(p.population))}</dd><dt>${p.populationMethod==='aggregate'?(en()?'Mean density (known area)':'平均密度（有数据区）'):(en()?'Density (source)':'密度（原表）')}</dt><dd>${esc(density)}</dd><dt>${en()?'Original statistical area':'原统计面积（有数据部分）'}</dt><dd>${esc(area)}</dd></dl><small>${Object.entries(methods).map(([k,n])=>esc(methodName(k))+(p.populationMethod==='aggregate'?' '+n+(en()?' units':'条'):'')).join(' · ')}${p.populationRecordStatus==='Estimated'&&!['historical_estimate','neighbor_estimate','missing'].includes(p.populationMethod)?(en()?' · Source flags this as estimated':' · 原表标记为估算'):''}${p.populationDensityNote?'<br>'+(en()?'Source density differs slightly from population ÷ area; original density retained.':'原表密度与人口÷面积有差异，此处保留原表密度。'):''}${p.populationMissingUnits>0?`<br>${en()?'Missing units excluded from population and density: ':'缺失区未计入人口与密度：'}${p.populationMissingUnits}`:''}</small><a href="https://www.nature.com/articles/s41597-026-07086-6" target="_blank" rel="noopener">${en()?'Population source':'人口文献'} ↗</a></div>`;
  }
  function clearPopups(){hoverPopup?.remove();pinnedPopup?.remove();hoverPopup=pinnedPopup=null;}
  function bindMap(map) {
    if(mapBound.has(map)||!globalThis.maplibregl?.Popup)return;mapBound.add(map);
    for(const id of ['historical-admin-fill','historical-admin-population']) {
      map.on('mousemove',id,e=>{if(metric()==='regions'||!enabled())return;const p=e.features?.[0]?.properties;if(!p)return;map.getCanvas().style.cursor='pointer';hoverPopup?.remove();hoverPopup=new maplibregl.Popup({closeButton:false,closeOnClick:false,maxWidth:'300px'}).setLngLat(e.lngLat).setHTML(populationPopup(p)).addTo(map);});
      map.on('mouseleave',id,()=>{hoverPopup?.remove();hoverPopup=null;map.getCanvas().style.cursor='';});
      map.on('click',id,e=>{if(metric()==='regions'||!enabled()||!e.features?.[0])return;clearPopups();pinnedPopup=new maplibregl.Popup({maxWidth:'300px'}).setLngLat(e.lngLat).setHTML(populationPopup(e.features[0].properties)).addTo(map);});
    }
  }
  async function loadCatalog() {
    if(catalog)return catalog;
    if(!catalogPending)catalogPending=context.fetch('data/historical-admin/catalog.json?v=6').then(d=>catalog=d).finally(()=>catalogPending=null);
    return catalogPending;
  }
  async function collection() {
    const c=await loadCatalog(),period=c.periods.find(p=>p.id===year())||c.periods.at(-1);
    if(!data.has(period.id)) {
      if(!pending.has(period.id))pending.set(period.id,context.fetch(period.file+'?v=6').then(d=>data.set(period.id,d)).finally(()=>pending.delete(period.id)));
      await pending.get(period.id);
    }
    const colors=['#59886b','#ba8a52','#7d78a1','#b76c6d','#578a9d','#939751','#ac7296'];
    const regions=[...new Set(data.get(period.id).features.map(f=>f.properties.parent))].sort();
    return {type:'FeatureCollection',features:data.get(period.id).features.filter(f=>f.properties.level===level()).map(f=>({...f,properties:{...f.properties,displayName:en()?f.properties.name:(f.properties.nameZh||f.properties.name),color:colors[regions.indexOf(f.properties.parent)%colors.length]}}))};
  }
  function populationLegend() {
    if(metric()==='regions')return '';
    const summary=catalog?.periods.find(p=>p.id===year())?.populationSummary;
    const converted=(summary?.methods.household_conversion||0)>0,estimated=(summary?.methods.historical_estimate||0)+(summary?.methods.neighbor_estimate||0)>0;
    const basis=converted&&estimated?(en()?'Includes household conversions and estimates':'含户数换算与估算'):converted?(en()?'Includes household conversions':'含户数换算'):estimated?(en()?'Includes estimates':'含估算数据'):(en()?'Source population records':'原表人口记录');
    const scale=metric()==='density'
      ? `<div class="historical-density-scale">${densityColors.map((color,i)=>`<span><i style="background:${color}"></i>${['<5','5–20','20–50','50–100','100–200','200–500','≥500'][i].replace('<','&lt;')}</span>`).join('')}</div><small>${en()?'People/km² · Same scale across years · Gray: no data':'人/km² · 各时期固定色阶 · 灰色：无记录'}</small>`
      : `<div class="historical-population-scale">${(level()==='upper'?[1e6,1e7,3e7]:[1e5,1e6,5e6]).map(n=>`<span><svg width="50" height="50" viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="${radiusFactor()*Math.sqrt(n)}" fill="#bf623e" fill-opacity=".45" stroke="#8d4328"/></svg>${esc(populationText(n))}</span>`).join('')}</div><small>${en()?'Circle area represents population':'圆面积表示人口总数'}</small>`;
    return `<div class="historical-population-legend">${scale}${summary?`<small>${en()?'Covered-area population: ':'覆盖区人口：'}<b>${esc(populationText(summary.population))}</b>${summary.missingUnits?` · ${summary.missingUnits}${en()?' missing units excluded':'条缺失未计'}`:''}<br>${basis}${en()?'. Hover or click regions for sources.':'；悬停或点击查看口径。'}</small>`:''}</div>`;
  }
  function legend() {
    const el=document.getElementById('historicalAdminLegend');if(!el)return;
    el.hidden=!enabled();if(el.hidden)return;
    const periods=catalog?.periods||[{id:'1820',name:'清 · 1820年',enName:'Qing · AD 1820'}];
    el.innerHTML=`<strong>${en()?'Historical administrative divisions':'历史政区'}</strong><label>${en()?'Period':'时期'} <select data-history-period aria-label="${en()?'Historical period':'历史区划时期'}">${periods.map(p=>`<option value="${p.id}" ${p.id===year()?'selected':''}>${esc(en()?p.enName:p.name)}</option>`).join('')}</select></label><label>${en()?'Level':'层级'} <select data-history-level aria-label="${en()?'Administrative level':'历史区划层级'}"><option value="upper" ${level()==='upper'?'selected':''}>${en()?'Upper regions':'上级分区（州／道／路／省）'}</option><option value="prefecture" ${level()==='prefecture'?'selected':''}>${en()?'Prefectural regions':'郡国／府州'}</option></select></label><label>${en()?'Display':'显示'} <select data-history-metric aria-label="${en()?'Historical display mode':'历史显示模式'}">${[['regions','政区','Regions'],['density','人口密度','Population density'],['population','人口总数','Population totals']].map(([value,zh,english])=>`<option value="${value}" ${metric()===value?'selected':''}>${en()?english:zh}</option>`).join('')}</select></label><label class="historical-admin-opacity"><span>${en()?'Opacity':'透明度'}</span><input type="range" min="0" max="100" step="1" value="${opacityPercent()}" data-history-opacity aria-label="${en()?'Historical fill opacity':'历史填色透明度'}" title="${en()?'0% transparent, 100% opaque':'0%全透明，100%不透明'}"><output data-history-opacity-value>${opacityPercent()}%</output></label>${populationLegend()}<small role="status">${error?esc(error):(en()?'Overview regions omit small fragments and close narrow gaps. Small labels appear when zoomed in. Research coverage only; some names span dates.':'中文历史政区；上级分区已归并细碎图形、填平窄缝。小区域放大后标名。仅限研究覆盖区，部分地名跨期。')}</small><a href="https://doi.org/10.6084/m9.figshare.30518417" target="_blank" rel="noopener">${en()?'Source dataset':'原始数据'} ↗</a> · <a href="https://www.nature.com/articles/s41597-026-07086-6" target="_blank" rel="noopener">${en()?'Research article':'文献'} ↗</a> · <a href="https://yugong.fudan.edu.cn/CHGIS/sjxz.htm" target="_blank" rel="noopener">${en()?'CHGIS names':'CHGIS地名'} ↗</a>`;
  }
  async function sync(map) {
    if(!map)return;activeMap=map;const token=++revision;
    if(!enabled()) {clearPopups();layers.slice().reverse().forEach(id=>{if(map.getLayer(id))map.removeLayer(id);});for(const id of ['historical-admin-population','historical-admin-labels','historical-admin'])if(map.getSource(id))map.removeSource(id);legend();return;}
    try {
      const current=year()+':'+level(),source=map.getSource('historical-admin');
      if(source&&source._historySelection!==current){source.setData(empty());map.getSource('historical-admin-labels')?.setData(empty());}
      const d=await collection();if(token!==revision||!enabled())return;error='';
      if(map.getSource('historical-admin'))map.getSource('historical-admin').setData(d);
      else map.addSource('historical-admin',{type:'geojson',data:d,attribution:'Historical admin: Zheng & Wu (2026) · CC BY 4.0'});
      const labels=labelCollection(d);
      if(map.getSource('historical-admin-labels'))map.getSource('historical-admin-labels').setData(labels);
      else map.addSource('historical-admin-labels',{type:'geojson',data:labels});
      const circles=populationPoints(d);
      if(map.getSource('historical-admin-population'))map.getSource('historical-admin-population').setData(circles);
      else map.addSource('historical-admin-population',{type:'geojson',data:circles});
      map.getSource('historical-admin')._historySelection=current;
      const before=['map-points-shadow','imperial-tomb-point','ancient-capital-point'].find(id=>map.getLayer(id));
      if(!map.getLayer(layers[0]))map.addLayer({id:layers[0],type:'fill',source:'historical-admin',paint:{'fill-color':fillColor(),'fill-opacity':opacityPercent()/100}},before);
      if(!map.getLayer(layers[1]))map.addLayer({id:layers[1],type:'line',source:'historical-admin',paint:{'line-color':['get','color'],'line-width':1,'line-opacity':.8}},before);
      if(!map.getLayer(layers[2]))map.addLayer({id:layers[2],type:'symbol',source:'historical-admin-labels',minzoom:4,filter:['<=',['get','labelMinZoom'],['zoom']],layout:{'text-field':['get','displayName'],'text-font':['Open Sans Regular','Arial Unicode MS Regular'],'text-size':12,'text-max-width':12,'text-padding':3,'text-allow-overlap':false,'text-optional':true},paint:{'text-color':'#4a493e','text-halo-color':'#fff','text-halo-width':1.5}},before);
      if(!map.getLayer(layers[3]))map.addLayer({id:layers[3],type:'circle',source:'historical-admin-population',layout:{visibility:metric()==='population'?'visible':'none'},paint:{'circle-color':'#bf623e','circle-opacity':opacityPercent()/100,'circle-stroke-color':'#8d4328','circle-stroke-opacity':.85,'circle-stroke-width':1,'circle-radius':['*',radiusFactor(),['sqrt',['get','population']]]}},before);
      bindMap(map);applyOpacity();legend();
    }catch(e){if(token===revision){error=en()?'Historical boundaries could not load; toggle to retry.':'历史区划加载失败，请重新开启重试。';legend();console.warn('Historical admin',e);}}
  }
  async function leaflet(map) {
    leafletGroup?.remove();leafletGroup=null;leafletFill=null;
    const token=++revision;if(!map||!enabled()){clearPopups();legend();return;}
    try {
      const d=await collection();if(token!==revision||!enabled())return;error='';activeMap=null;clearPopups();
      leafletGroup=L.featureGroup().addTo(map);
      leafletFill=L.geoJSON(d,{interactive:metric()!=='regions',bubblingMouseEvents:false,
        style:f=>({color:f.properties.color,weight:1,fillColor:metric()==='density'?densityColor(f.properties.populationDensity):metric()==='population'?'#e3e7df':f.properties.color,fillOpacity:opacityPercent()/100}),
        onEachFeature:(f,layer)=>{if(metric()!=='regions')layer.bindTooltip(populationPopup(f.properties),{sticky:true}).bindPopup(populationPopup(f.properties),{maxWidth:300});}
      }).addTo(leafletGroup);
      if(metric()==='population')for(const f of populationPoints(d).features) {
        const [lng,lat]=f.geometry.coordinates,marker=L.circleMarker([lat,lng],{radius:radiusFactor()*Math.sqrt(f.properties.population),color:'#8d4328',weight:1,opacity:.85,fillColor:'#bf623e',fillOpacity:opacityPercent()/100,bubblingMouseEvents:false}).bindTooltip(populationPopup(f.properties),{sticky:true}).bindPopup(populationPopup(f.properties),{maxWidth:300}).addTo(leafletGroup);marker._historicalPopulationCircle=true;
      }
      for(const f of labelCollection(d).features){if(f.properties.labelMinZoom>map.getZoom())continue;const [lng,lat]=f.geometry.coordinates;L.marker([lat,lng],{interactive:false,icon:L.divIcon({className:'historical-admin-label',html:esc(f.properties.displayName),iconSize:[140,18],iconAnchor:[70,metric()==='population'?radiusFactor()*Math.sqrt(f.properties.population||0)+24:9]})}).addTo(leafletGroup);}
      if(!leafletBound.has(map)){leafletBound.add(map);map.on('zoomend',()=>{if(enabled())leaflet(map);});}legend();
    }
    catch(e){if(token===revision){error=en()?'Historical data unavailable':'历史区划加载失败，请重试';legend();}}
  }
  function init(c) {
    context=c;const parent=document.getElementById('mapOverlayLegends');if(!parent)return;
    const el=document.createElement('section');el.id='historicalAdminLegend';el.className='great-wall-legend historical-admin-legend';el.hidden=true;parent.appendChild(el);
    el.addEventListener('input',e=>{if(!e.target.hasAttribute('data-history-opacity'))return;options().historicalAdminOpacity=Math.max(0,Math.min(100,Number(e.target.value)));const value=el.querySelector('[data-history-opacity-value]');if(value)value.textContent=opacityPercent()+'%';applyOpacity();context.save();});
    el.addEventListener('change',e=>{if(e.target.hasAttribute('data-history-period'))options().historicalAdminPeriod=e.target.value;else if(e.target.hasAttribute('data-history-level'))options().historicalAdminLevel=e.target.value;else if(e.target.hasAttribute('data-history-metric'))options().historicalAdminMetric=e.target.value;else return;clearPopups();context.save();context.render();});
    document.getElementById('showHistoricalAdminOnMap')?.addEventListener('change',e=>{options().historicalAdmin=e.target.checked;context.save();context.render();});
  }
  return {init,sync,leaflet,legend,collection,loadCatalog};
})();
