/* Public Safeture / Riskline country base + Regional overrides; original levels/geometries. */
(function(root){
  const dataUrl='data/safeture-regional-risk-20261017.geojson?v=1';
  const countryUrl='data/safeture-country-risk-20261017.geojson?v=1';
  const displayUrl='data/safeture-display-20261017.geojson?v=1';
  const summaryUrl='data/safeture-regional-summaries-20261017.json?v=1';
  const colors={1:'#9fc9b7',2:'#c7d8a5',3:'#f2d695',4:'#e9a174',5:'#c96b78'},missing='#d1d5db';
  const levels={zh:['无数据','极低','低','中','高','极高'],en:['No data','Negligible','Low','Medium','High','Critical']};
  let config={},cached=null,pending=null,revision=0,hover=null,leaflet=null;
  let summaries=null,summaryPending=null,summaryError=false,selection=null;
  let hoverTimer=null,hovered=null;
  let countryData=null,basePending=null,displayData=null,displayPending=null;
  let selectionMap=null,selectedFeature=null,selectionLeaflet=null,selectionLeafletHalo=null;
  const bound=new WeakSet();
  const pointCache=new WeakMap();
  const active=id=>id==='safetureRisk',en=()=>config.language?.()==='en',enabled=()=>active(config.provider?.());
  const opacity=()=>Math.max(0,Math.min(100,config.opacity?.()??100))/100;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const valid=n=>Number.isInteger(n)&&n>=1&&n<=5;
  const color=n=>valid(n)?colors[n]:missing;
  function label(n){return levels[en()?'en':'zh'][valid(n)?n:0];}
  function summaryPreview(p){
    const text=summaries?.items?.['safeture-regional-'+p.sourceIndex];if(!text)return '';
    const plain=text.replace(/\s+/g,' ').trim();if(plain.length<=280)return plain;
    const cut=plain.slice(0,277),space=cut.lastIndexOf(' ');return cut.slice(0,space>200?space:277)+'…';
  }
  function countryName(p){if(en())return p.name;try{return new Intl.DisplayNames(['zh-CN'],{type:'region'}).of(p.iso2)||p.name;}catch{return p.name;}}
  function tooltip(p){if(p.riskScope==='country')return '<strong>'+esc(countryName(p))+'</strong><br>'+(en()?'Overall country level: ':'国家总体等级：')+label(p.risklevelid)+'<br><small>© Safeture / Riskline</small>';
    const n=p.risklevelid;let countries=p.countries||[];if(typeof countries==='string'){try{countries=JSON.parse(countries);}catch{countries=[];}}
    const countryNames=countries.map(c=>{if(en())return c.name;try{return new Intl.DisplayNames(['zh-CN'],{type:'region'}).of(c.iso2)||c.name;}catch{return c.name;}}).join(' / ');
    const preview=summaryPreview(p),summary=preview?'<div class="safeture-hover-summary"><b>Summary</b><p>'+esc(preview)+'</p></div>':'<small>'+(summaryError?(en()?'Click to retry Summary':'点击可重试加载摘要'):summaryPending?(en()?'Loading Summary…':'正在加载摘要…'):(en()?'Pause to preview Summary':'停留可预览摘要'))+'</small>';
    return (countryNames?'<strong>'+esc(countryNames)+'</strong><br>':'')+'<div class="safeture-hover-title">'+esc(p.title||p.name)+'</div>'+(en()?'Regional level: ':'区域等级：')+label(n)+summary+'<small>'+(en()?'Click for full details':'点击查看完整详情')+'<br>© Safeture / Riskline</small>';}
  function queueHoverSummary(p,update,kind){
    if(p.riskScope==='country'){hovered={key:'country:'+p.iso2,kind,update};if(hoverTimer!==null)clearTimeout(hoverTimer);hoverTimer=null;return;}
    if(summaries){hovered={key:String(p.sourceIndex),kind,update};return;}
    const key=String(p.sourceIndex);
    if(hovered?.key===key&&hovered.kind===kind){hovered.update=update;return;}
    if(hoverTimer!==null)clearTimeout(hoverTimer);
    const record={key,kind,update};hovered=record;
    hoverTimer=setTimeout(()=>{hoverTimer=null;if(hovered!==record||!enabled())return;const request=loadSummaries();record.update();request.then(()=>{if(hovered===record&&enabled())record.update();}).catch(()=>{if(hovered===record&&enabled())record.update();});},180);
  }
  function inRing(point,ring){let inside=false;const [x,y]=point;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
  function contains(point,geometry){const polys=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;return polys.some(p=>inRing(point,p[0])&&!p.slice(1).some(h=>inRing(point,h)));}
  function labelPoints(data){
    if(!pointCache.has(data)){
      const points=root.GallupSafety.labelPoints(data,['risklevelid']);
      points.features=points.features.filter(f=>!data.features.some(other=>other.properties.risklevelid>f.properties.risklevelid&&contains(f.geometry.coordinates,other.geometry)));
      pointCache.set(data,points);
    }
    return pointCache.get(data);
  }
  function load(){if(cached)return Promise.resolve(cached);if(!pending)pending=fetch(dataUrl).then(r=>{if(!r.ok)throw Error('Safeture HTTP '+r.status);return r.json();}).then(d=>cached=d).finally(()=>{pending=null;});return pending;}
  function loadBase(){if(countryData)return Promise.resolve(countryData);if(!basePending)basePending=fetch(countryUrl).then(r=>{if(!r.ok)throw Error('Safeture country HTTP '+r.status);return r.json();}).then(d=>countryData={...d,features:d.features.map(f=>({...f,properties:{...f.properties,riskScope:'country'}}))}).finally(()=>{basePending=null;});return basePending;}
  function loadDisplay(){if(displayData)return Promise.resolve(displayData);if(!displayPending)displayPending=fetch(displayUrl).then(r=>{if(!r.ok)throw Error('Safeture display HTTP '+r.status);return r.json();}).then(d=>displayData=d).finally(()=>{displayPending=null;});return displayPending;}
  function countryLabelPoints(countries,regions){return {...labelPoints(countries),features:labelPoints(countries).features.filter(f=>valid(f.properties.risklevelid)&&!regions.features.some(r=>contains(f.geometry.coordinates,r.geometry)))};}
  function preferredHits(map,point){const regional=map.getLayer('safeture-risk-fill')?map.queryRenderedFeatures(point,{layers:['safeture-risk-fill']}):[];return regional.length?regional:map.getLayer('safeture-risk-country-fill')?map.queryRenderedFeatures(point,{layers:['safeture-risk-country-fill']}):[];}
  function loadSummaries(){if(summaries)return Promise.resolve(summaries);if(!summaryPending){summaryError=false;summaryPending=fetch(summaryUrl).then(r=>{if(!r.ok)throw Error('Safeture Summary HTTP '+r.status);return r.json();}).then(d=>summaries=d).catch(error=>{summaryError=true;throw error;}).finally(()=>{summaryPending=null;});}return summaryPending;}
  function detailIsOpen(){return typeof document!=='undefined'&&document.getElementById('mapDetail')?.querySelector('[data-safeture-detail]');}
  function clearSelection(){
    selection=null;selectedFeature=null;
    if(selectionMap){for(const id of ['safeture-risk-selected-line','safeture-risk-selected-halo'])if(selectionMap.getLayer(id))selectionMap.removeLayer(id);if(selectionMap.getSource('safeture-risk-selected'))selectionMap.removeSource('safeture-risk-selected');}
    selectionLeaflet?.remove();selectionLeafletHalo?.remove();selectionLeaflet=selectionLeafletHalo=null;
  }
  function highlightSelection(){
    const feature=selection?.features[selection.index];if(!feature)return;
    const changed=selectedFeature!==feature;selectedFeature=feature;
    if(selectionMap?.addSource){
      const data={type:'FeatureCollection',features:[feature]},source=selectionMap.getSource('safeture-risk-selected');
      if(!source)selectionMap.addSource('safeture-risk-selected',{type:'geojson',data,tolerance:0});else if(changed)source.setData(data);
      const before=selectionMap.getStyle().layers.find(l=>l.id!=='basemap'&&!l.id.startsWith('esri-relief-')&&!l.id.startsWith('safeture-risk-'))?.id;
      for(const [id,color,width] of [['safeture-risk-selected-halo','#ffffff',5],['safeture-risk-selected-line','#173e55',2.5]])if(!selectionMap.getLayer(id))selectionMap.addLayer({id,type:'line',source:'safeture-risk-selected',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':color,'line-width':width,'line-opacity':1}},before);
    }else if(root.L&&config.leaflet?.()&&(changed||!selectionLeaflet)){
      selectionLeaflet?.remove();selectionLeafletHalo?.remove();
      const target=config.leaflet();
      selectionLeafletHalo=root.L.geoJSON(feature,{pane:'safetureRiskPane',interactive:false,style:{color:'#fff',weight:5,opacity:1,fill:false}}).addTo(target);
      selectionLeaflet=root.L.geoJSON(feature,{pane:'safetureRiskPane',interactive:false,style:{color:'#173e55',weight:2.5,opacity:1,fill:false}}).addTo(target);
    }
  }
  function renderDetail(){
    if(!selection)return;
    highlightSelection();
    const {features,index}=selection,f=features[index],p=f.properties;
    if(p.riskScope==='country')return config.detail?.('<section data-safeture-detail><p class="eyebrow">Safeture / Riskline</p><h3>'+esc(countryName(p))+'</h3>'+tooltip(p)+'<p><a href="https://www.safeture.com/globe/" target="_blank" rel="noopener">'+(en()?'Official source':'官方来源')+' ↗</a></p></section>');
    const text=summaries?.items?.[f.id];
    const summary=text?'<div class="safeture-detail-summary"><p>'+esc(text).replace(/\n\s*\n/g,'</p><p>').replace(/\n/g,'<br>')+'</p></div>':summaries?'<p>'+(en()?'No Summary was provided.':'原站未提供摘要。')+'</p>':summaryError?'<p role="status">'+(en()?'Summary could not load.':'摘要暂时无法加载。')+'</p><button type="button" data-safeture-retry>'+(en()?'Retry':'重试')+'</button>':'<p role="status">'+(en()?'Loading Summary…':'正在加载摘要…')+'</p>';
    const countries=(p.countries||[]).map(c=>{if(en())return c.name;try{return new Intl.DisplayNames(['zh-CN'],{type:'region'}).of(c.iso2)||c.name;}catch{return c.name;}}).join(' / ');
    const nav=features.length>1?'<div class="safeture-detail-nav"><button type="button" data-safeture-nav="prev" '+(index===0?'disabled':'')+'>'+(en()?'Previous':'上一条')+'</button><span>'+(index+1)+' / '+features.length+'</span><button type="button" data-safeture-nav="next" '+(index===features.length-1?'disabled':'')+'>'+(en()?'Next':'下一条')+'</button></div>':'';
    const html='<section data-safeture-detail><p class="eyebrow">Safeture / Riskline · Regional</p><h3 class="safeture-detail-heading">'+esc(p.title||p.name)+'</h3><span class="safeture-detail-level" style="background:'+color(p.risklevelid)+'">'+label(p.risklevelid)+'</span><dl><div><dt>'+(en()?'Affected areas':'受影响地区')+'</dt><dd>'+esc(countries)+'</dd></div><div><dt>'+(en()?'Source updated':'来源更新')+'</dt><dd>'+esc(String(p.created||'').slice(0,10))+'</dd></div><div><dt>'+(en()?'Snapshot retrieved':'数据读取')+'</dt><dd>2026-10-17</dd></div></dl><h4>'+(en()?'Summary':'摘要 · Summary')+'</h4><p class="muted small">'+(en()?'Original public Riskline excerpt':'Riskline 公开摘要 · 英文原文')+'</p>'+summary+nav+'<p class="small"><a href="https://www.safeture.com/globe/" target="_blank" rel="noopener">© Safeture / Riskline · '+(en()?'Official source':'官方来源')+' ↗</a></p></section>';
    const el=config.detail?.(html);
    el?.querySelectorAll('[data-safeture-nav]').forEach(button=>button.addEventListener('click',()=>{selection.index+=button.dataset.safetureNav==='next'?1:-1;selection.index=Math.max(0,Math.min(selection.features.length-1,selection.index));renderDetail();}));
    el?.querySelector('[data-safeture-retry]')?.addEventListener('click',()=>{loadSummaries().then(()=>{if(detailIsOpen())renderDetail();}).catch(()=>{if(detailIsOpen())renderDetail();});renderDetail();});
    return html;
  }
  function openDetails(hits){
    const byIndex=new Map();
    for(const hit of hits){const f=cached?.features.find(f=>f.id===hit.id||hit.properties?.sourceIndex!==undefined&&f.properties.sourceIndex===hit.properties.sourceIndex);if(f)byIndex.set(f.properties.sourceIndex,f);}
    const features=[...byIndex.values()].sort((a,b)=>b.properties.risklevelid-a.properties.risklevelid||String(b.properties.created).localeCompare(String(a.properties.created))||a.properties.sourceIndex-b.properties.sourceIndex);
    if(!features.length){const hit=hits.find(f=>f.properties?.riskScope==='country');if(!hit)return false;const country=countryData?.features.find(f=>f.properties.name===hit.properties.name&&f.properties.iso3===hit.properties.iso3)||hit;clearHover();selection={features:[country],index:0};renderDetail();return true;}
    clearHover();selection={features,index:0};renderDetail();
    if(!summaries)loadSummaries().then(()=>{if(enabled()&&detailIsOpen())renderDetail();}).catch(()=>{if(enabled()&&detailIsOpen())renderDetail();});
    return true;
  }
  function handleClick(map,event){
    if(!enabled()||config.canSelect?.()===false||event.originalEvent?._travelMapHandled||!map?.getLayer('safeture-risk-fill'))return false;
    const hits=preferredHits(map,event.point);if(!openDetails(hits))return false;
    if(event.originalEvent)event.originalEvent._travelMapHandled=true;config.handled?.(event);return true;
  }
  function handleLeafletClick(event){
    if(!enabled()||!cached||config.canSelect?.()===false||event.originalEvent?._travelMapHandled||!event.latlng)return false;
    const point=[event.latlng.lng,event.latlng.lat],regions=cached.features.filter(f=>contains(point,f.geometry));if(!openDetails(regions.length?regions:countryData?.features.filter(f=>contains(point,f.geometry))||[]))return false;
    if(event.originalEvent)event.originalEvent._travelMapHandled=true;config.handled?.(event);return true;
  }
  function countryCounts(data=countryData){
    if(!data)return null;
    const levels=[0,0,0,0,0,0],seen=new Set();
    for(const {properties:p} of data.features){
      const key=/^[A-Z]{3}$/.test(p.iso3)?p.iso3:/^[A-Z]{2}$/.test(p.iso2)?p.iso2:p.name;
      if(seen.has(key))continue;seen.add(key);levels[valid(p.risklevelid)?p.risklevelid:0]++;
    }
    return {levels,total:seen.size,rated:seen.size-levels[0],missing:levels[0]};
  }
  function legend(status=''){
    const el=typeof document!=='undefined'&&document.getElementById('safetureRiskLegend');if(!el)return;el.hidden=!enabled();if(el.hidden)return;
    const counts=countryCounts();
    el.innerHTML='<strong>Safeture / Riskline · '+(en()?'Travel risk':'旅游风险')+'</strong><small>'+(en()?'Country + Regional · retrieved 2026-10-17':'国家总体 + Regional · 读取于 2026-10-17')+'</small><div class="safeture-risk-keys">'+[1,2,3,4,5,...(counts?[0]:[])].map(n=>'<span><i style="background:'+color(n)+'"></i>'+label(n)+(counts?' '+counts.levels[n]:'')+'</span>').join('')+'</div>'+(counts?'<small>'+(en()?'Overall country ratings · '+counts.total+' countries/territories in source':'国家总体评级 · 源数据覆盖 '+counts.total+' 个国家／地区')+'</small>':'')+'<small>'+(en()?'Grey: no assessment available':'灰色：无评级数据')+'</small><small>'+(en()?'Regional overrides country · highest overlapping Regional level wins':'区域等级优先于国家 · 区域重叠时取较高等级')+'</small><a href="https://www.safeture.com/globe/" target="_blank" rel="noopener">© Safeture / Riskline · '+(en()?'Official map & methodology':'官方地图与方法')+' ↗</a>'+(status?'<small role="status">'+esc(status)+'</small>':'');
  }
  function clearHover(){hover?.remove();hover=null;hovered=null;if(hoverTimer!==null)clearTimeout(hoverTimer);hoverTimer=null;}
  async function sync(map,group){
    if(selectionMap!==map){clearSelection();selectionMap=map;}
    const token=++revision;legend();if(!map||!enabled()||config.canSelect?.()===false)clearHover();
    if(!enabled()){
      if(detailIsOpen())config.closeDetail?.();clearSelection();
      if(map){for(const id of ['safeture-risk-label','safeture-risk-line','safeture-risk-fill','safeture-risk-country-label','safeture-risk-country-line','safeture-risk-country-fill','safeture-risk-display-line','safeture-risk-display-fill'])if(map.getLayer(id))map.removeLayer(id);for(const id of ['safeture-risk-labels','safeture-risk','safeture-risk-country-labels','safeture-risk-country','safeture-risk-display'])if(map.getSource(id))map.removeSource(id);}
      leaflet?.remove();leaflet=null;return;
    }
    try{
      const [data,countries,display]=await Promise.all([load(),loadBase(),loadDisplay()]);if(token!==revision||!enabled())return;
      if(map){
        const before=map.getStyle().layers.find(l=>l.id!=='basemap'&&!l.id.startsWith('esri-relief-')&&!l.id.startsWith('safeture-risk-'))?.id;
        if(!map.getSource('safeture-risk'))map.addSource('safeture-risk',{type:'geojson',data,tolerance:0.1,attribution:'Regional risk data © Safeture / Riskline · retrieved 2026-10-17'});
        const fill=['match',['get','risklevelid'],1,colors[1],2,colors[2],3,colors[3],4,colors[4],5,colors[5],missing];
        if(!map.getSource('safeture-risk-display'))map.addSource('safeture-risk-display',{type:'geojson',data:display,tolerance:0,attribution:'Risk data © Safeture / Riskline · Natural Earth land geometry'});
        if(!map.getSource('safeture-risk-country'))map.addSource('safeture-risk-country',{type:'geojson',data:countries,tolerance:0.1,attribution:'Country risk data © Safeture / Riskline · retrieved 2026-10-17'});
        // Only the exclusive mosaic paints colour. Original fills stay queryable for all overlapping advisories.
        const baseLayers=[{id:'safeture-risk-display-fill',type:'fill',source:'safeture-risk-display',filter:['==',['get','riskScope'],'display'],paint:{'fill-antialias':false,'fill-color':fill,'fill-opacity':opacity()}},{id:'safeture-risk-display-line',type:'line',source:'safeture-risk-display',filter:['==',['get','riskScope'],'boundary'],paint:{'line-color':'#7d8388','line-width':0.6,'line-opacity':0.6*opacity()}},{id:'safeture-risk-country-fill',type:'fill',source:'safeture-risk-country',paint:{'fill-antialias':false,'fill-color':fill,'fill-opacity':0}},{id:'safeture-risk-country-line',type:'line',source:'safeture-risk-country',paint:{'line-color':'#7d8388','line-width':0.6,'line-opacity':0}}];
        for(const layer of baseLayers){if(!map.getLayer(layer.id))map.addLayer(layer,map.getLayer('safeture-risk-fill')?'safeture-risk-fill':before);else map.setPaintProperty(layer.id,layer.type==='fill'?'fill-opacity':'line-opacity',layer.id.startsWith('safeture-risk-display-')?(layer.type==='fill'?1:0.6)*opacity():0);}
        if(!map.getLayer('safeture-risk-fill'))map.addLayer({id:'safeture-risk-fill',type:'fill',source:'safeture-risk',layout:{'fill-sort-key':['get','risklevelid']},paint:{'fill-antialias':false,'fill-color':fill,'fill-opacity':0}},before);
        else map.setPaintProperty('safeture-risk-fill','fill-opacity',0);
        if(!map.getLayer('safeture-risk-line'))map.addLayer({id:'safeture-risk-line',type:'line',source:'safeture-risk',layout:{'line-sort-key':['get','risklevelid']},paint:{'line-color':'#7d8388','line-width':0.6,'line-opacity':0}},before);
        else map.setPaintProperty('safeture-risk-line','line-opacity',0);
        if(!bound.has(map)){bound.add(map);map.on('mousemove',e=>{if(!enabled()||config.canSelect?.()===false||!map.getLayer('safeture-risk-fill')){clearHover();return;}const f=preferredHits(map,e.point).sort((a,b)=>b.properties.risklevelid-a.properties.risklevelid)[0];if(!f){clearHover();return;}if(!hover)hover=new root.maplibregl.Popup({closeButton:false,closeOnClick:false,offset:12,maxWidth:'340px',className:'gallup-tooltip safeture-hover'});hover.setLngLat(e.lngLat).setHTML(tooltip(f.properties)).addTo(map);queueHoverSummary(f.properties,()=>hover?.setHTML(tooltip(f.properties)),'maplibre');});map.on('mouseout',clearHover);}
      }else if(root.L&&config.leaflet?.()){
        selectionLeaflet?.remove();selectionLeafletHalo?.remove();selectionLeaflet=selectionLeafletHalo=null;
        const target=config.leaflet();if(!target.getPane('safetureRiskPane'))target.createPane('safetureRiskPane').style.zIndex='250';leaflet?.remove();
        const ordered={...data,features:[...display.features,...countries.features,...[...data.features].sort((a,b)=>a.properties.risklevelid-b.properties.risklevelid)]};
        leaflet=root.L.geoJSON(ordered,{pane:'safetureRiskPane',style:f=>({color:'#7d8388',weight:0.6,stroke:f.properties.riskScope==='boundary',opacity:f.properties.riskScope==='boundary'?0.6*opacity():0,fill:f.properties.riskScope!=='boundary',fillColor:color(f.properties.risklevelid),fillOpacity:f.properties.riskScope==='display'?opacity():0}),onEachFeature:(f,l)=>{if(['display','boundary'].includes(f.properties.riskScope))return;l.bindTooltip(()=>tooltip(f.properties),{sticky:true,className:'safeture-leaflet-hover'});l.on('mouseover',()=>{if(config.canSelect?.()!==false)queueHoverSummary(f.properties,()=>l.setTooltipContent(tooltip(f.properties)),'leaflet');});l.on('mouseout',clearHover);l.on('click',handleLeafletClick);}}).addTo(group||target);

      }
      legend();
      if(detailIsOpen())renderDetail();
      if(map&&hovered)hovered.update();
    }catch(error){if(token===revision)legend(en()?'Data unavailable; reselect to retry.':'数据加载失败；重新选择可重试。');console.warn('Safeture country risk',error);}
  }
  const api={init:c=>config=c,active,color,label,tooltip,summaryPreview,labelPoints,countryLabelPoints,countryCounts,contains,load,loadBase,loadDisplay,preferredHits,loadSummaries,openDetails,clearSelection,handleClick,handleLeafletClick,sync,legend,dataUrl,countryUrl,displayUrl,summaryUrl};root.SafetureRisk=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
