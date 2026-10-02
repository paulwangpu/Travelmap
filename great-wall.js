(function(root) {
  const categories = { wall:['墙体','Wall'],lost:['消失走势','Lost / approximate'],pass:['关口','Pass'],fortress:['军堡','Fortress'],town:['营城','Garrison town'],guard:['卫所','Guard post'],city:['古城','Historic city'],tower:['敌楼','Watchtower'],beacon:['墩台烽燧','Beacon'],museum:['博物馆','Museum'],landmark:['其他地标','Landmark'],unknown:['未分类','Unclassified'] };
  const colors = {wall:'#8e4829',lost:'#a97650',pass:'#ab342d',fortress:'#776041',town:'#776041',guard:'#776041',city:'#776041',tower:'#ab342d',beacon:'#b57921',museum:'#536e88',landmark:'#637b65',unknown:'#747474'};
  // One icon definition shared by MapLibre, Leaflet and the legend.
  const iconPaths = {
    wall:'M4 19V7H7V10H10V7H14V10H17V7H20V19Z M4 15H20 M10 10V15 M14 15V19',
    lost:'M4 18L8 13 M11 12L14 9 M17 8L20 5',
    pass:'M4 20V6H8V9H16V6H20V20H15V15A3 3 0 0 0 9 15V20Z',
    fortress:'M4 20V6H7V9H10V6H14V9H17V6H20V20Z M9 20V15H15V20 M8 12H9 M15 12H16',
    town:'M3 20V11L8 7L13 11V20Z M13 20V8L17 5L21 8V20Z M7 20V15H10V20 M16 12H18 M16 16H18',
    guard:'M7 20V8H17V20Z M5 8L12 3L19 8Z M11 20V15H13V20 M10 11H14',
    city:'M3 20V11H7V7H10V11H14V4H18V11H21V20Z M7 15H8 M11 15H12 M16 14H18 M16 17H18',
    tower:'M7 20L9 8H15L17 20Z M6 8V4H9V6H11V4H13V6H15V4H18V8Z M11 12H13 M11 16H13',
    beacon:'M6 21L8 13H16L18 21Z M12 12C5 9 12 7 10 3C18 7 18 10 12 12Z',
    museum:'M3 9L12 3L21 9Z M5 11V18 M10 11V18 M14 11V18 M19 11V18 M3 21H21 M4 18H20',
    landmark:'M12 21C10 18 5 13 5 9A7 7 0 0 1 19 9C19 13 14 18 12 21Z M10 9A2 2 0 1 0 14 9A2 2 0 1 0 10 9',
    unknown:'M12 3L21 12L12 21L3 12Z M10 9C10 6 15 6 15 9C15 11 12 11 12 14 M12 17H12.1'
  };
  function iconSvg(key) { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPaths[key] || iconPaths.unknown}" fill="white" stroke="${colors[key] || colors.unknown}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  function legendSymbol(key) {return key==='wall'||key==='lost'?`<i class="wall-line${key==='lost'?' approximate':''}" aria-hidden="true"></i>`:iconSvg(key);}
  function installIcons(map) {
    for(const key of Object.keys(categories)) {
      const id='great-wall-icon-'+key;if(map.hasImage(id))continue;
      const canvas=document.createElement('canvas');canvas.width=canvas.height=48;
      const ctx=canvas.getContext('2d');ctx.scale(2,2);const path=new Path2D(iconPaths[key]);
      ctx.fillStyle='white';ctx.strokeStyle=colors[key];ctx.lineWidth=1.7;ctx.lineCap=ctx.lineJoin='round';
      ctx.fill(path);ctx.stroke(path);map.addImage(id,ctx.getImageData(0,0,48,48),{pixelRatio:2});
    }
  }
  const eras={'spring-autumn':['春秋战国','Spring / Warring States','#795548'],qin:['秦代','Qin','#a45a32'],han:['汉代','Han','#ba7530'],'northern-wei':['北魏','Northern Wei','#805fa5'],'liao-jin':['辽金','Liao / Jin','#367d83'],ming:['明代','Ming','#bf8d16']};
  let data, pending, historyData, historyPending, historyError='', config, revision=0, hover, pinned, leafletGroup;
  const bound = new WeakSet();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const en = () => config.language() === 'en';
  const label = key => categories[key]?.[en()?1:0] || key;
  function filtered() { const hidden = config.state().mapOverlays?.greatWallCategories || {}; return {type:'FeatureCollection',features:(data?.features||[]).filter(f=>hidden[f.properties.category] !== false)}; }
  async function load() {
    if (data) return data;
    if (!pending) pending = fetch('./data/great-wall/features.geojson?v=20261002b').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(d=>data=d).finally(()=>pending=null);
    return pending;
  }
  async function loadView() {
    await load();
    if(config.state().mapOverlays?.greatWallHistory&&!historyData) {
      if(!historyPending)historyPending=fetch('./data/great-wall/history.geojson?v=1').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(d=>{historyData=d;historyError='';}).catch(()=>{historyError=en()?'Historical overview failed to load — toggle to retry':'历代概览加载失败，请重新开启重试';}).finally(()=>historyPending=null);
      await historyPending;
    }
  }
  function historyFeatures() {return {type:'FeatureCollection',features:config.state().mapOverlays?.greatWallHistory?(historyData?.features||[]).filter(f=>f.properties.dynasty!=='ming'):[]};}
  function html(f, full) {
    if(f.properties.source==='wikipedia-kmz') {
      const p=f.properties;return `<div class="great-wall-info"><strong>${esc(en()?p.nameEn:p.name)}</strong><small>${esc(en()?p.dynastyEn:p.dynastyZh)} · ${en()?'Approximate route':'概略线路'}</small>${full?`<dl><dt>${en()?'Source':'来源'}</dt><dd>${en()?'User-provided Wikipedia KMZ':'用户提供的 Wikipedia KMZ'}</dd><dt>${en()?'Original name':'原名称'}</dt><dd>${esc(p.originalName)}</dd><dt>${en()?'Original folder':'原目录'}</dt><dd>${esc(p.originalPath)}</dd><dt>ID</dt><dd>${esc(p.originalId)}</dd>${p.comment?`<dt>${en()?'Note':'备注'}</dt><dd>${esc(p.comment)}</dd>`:''}</dl>`:''}</div>`;
    }
    const p = f.properties, source = p.source==='ovital' ? (en()?'Local original data':'本地原始数据') : p.source==='greatwall-station'?(en()?'Great Wall Station original collection':'长城小站原版专栏'):(en()?'Public GeoJSON collection':'公开 GeoJSON');
    return `<div class="great-wall-info"><strong>${esc(p.name)}</strong><small>${esc(label(p.category))}${p.approximate?' · '+(en()?'Approximate':'概略／消失段'):''}</small>${full?`<dl><dt>${en()?'Source':'来源'}</dt><dd>${esc(source)}</dd>${p.comment?`<dt>${en()?'Note':'备注'}</dt><dd>${esc(p.comment)}</dd>`:''}${p.originalPath?`<dt>${en()?'Original folder':'原目录'}</dt><dd>${esc(p.originalPath)}</dd>`:''}<dt>ID</dt><dd>${esc(p.originalId)}</dd></dl>`:''}</div>`;
  }
  function clear() { hover?.remove();pinned?.remove();hover=pinned=null; }
  function legend() {
    const enabled=Boolean(config.state().mapOverlays?.greatWall), box=document.getElementById('greatWallLegend');
    box.hidden=!enabled; document.getElementById('showGreatWallOnMap').checked=enabled;
    document.getElementById('greatWallLegendTitle').textContent=en()?'Great Wall':'长城';
    document.getElementById('greatWallCategorySummaryText').textContent=en()?'Detail · site types':'详细线路与遗址 · 类型';
    document.getElementById('showGreatWallHistory').checked=Boolean(config.state().mapOverlays?.greatWallHistory);
    document.getElementById('greatWallHistoryText').textContent=en()?'Other dynasties · overview':'其他朝代概览';
    const historyLegend=document.getElementById('greatWallHistoryEras');
    historyLegend.innerHTML=Object.entries(eras).filter(([key])=>key!=='ming').map(([,e])=>`<span><i style="border-color:${e[2]}"></i>${esc(e[en()?1:0])}</span>`).join('');
    const keys=Object.keys(categories).filter(k=>k!=='unknown'||!data||data.features.some(f=>f.properties.category==='unknown'));
    const selected=keys.filter(k=>config.state().mapOverlays?.greatWallCategories?.[k]!==false).length;
    const categoryBox=document.getElementById('greatWallCategories');
    categoryBox.innerHTML=keys.map(k=>`<label><input type="checkbox" data-wall-category="${k}" ${config.state().mapOverlays?.greatWallCategories?.[k]===false?'':'checked'}>${legendSymbol(k)}<span>${esc(label(k))}</span></label>`).join('');
    const selectAll=document.getElementById('greatWallSelectAll');
    selectAll.checked=selected===keys.length;
    selectAll.indeterminate=selected>0&&selected<keys.length;
    selectAll.title=en()?'Select / deselect all detail types':'全选／取消全部详细类型';
    selectAll.setAttribute('aria-label',selectAll.title);
    document.getElementById('greatWallNote').textContent=en()?'Detail mainly covers Ming, with earlier remains. Overview omits Ming; dashed supplements are approximate.':'详细数据以明代为主，含早期遗址；概览不显示明代。补充虚线为概略走向。';
  }
  function status(text) {document.getElementById('greatWallStatus').textContent=text;}
  function sync(map) {
    const token=++revision; clear();
    if(!map)return;
    const enabled=config.state().mapOverlays?.greatWall;
    if(!enabled){map.getCanvas().style.cursor='';for(const l of [...(map.getStyle()?.layers||[])].reverse())if(l.id.startsWith('great-wall-'))map.removeLayer(l.id);for(const id of ['great-wall-geometry','great-wall-points','great-wall-history'])if(map.getSource(id))map.removeSource(id);return;}
    const apply=()=>{
      if(token!==revision||!config.state().mapOverlays?.greatWall||map!==config.map())return;
      if(!map.isStyleLoaded()){map.once('idle',apply);return;}
      const all=filtered(), points={type:'FeatureCollection',features:all.features.filter(f=>f.geometry.type==='Point')}, shapes={type:'FeatureCollection',features:all.features.filter(f=>f.geometry.type!=='Point')};
      installIcons(map);
      for(const [id,d] of [['great-wall-geometry',shapes],['great-wall-points',points]]) {if(map.getSource(id))map.getSource(id).setData(d);else map.addSource(id,{type:'geojson',data:d});}
      const before=(map.getStyle().layers||[]).find(l=>l.source==='imported-paths'||l.id.startsWith('map-points-'))?.id;
      const add=l=>{if(!map.getLayer(l.id))map.addLayer(l,before);};
      if(map.getSource('great-wall-history'))map.getSource('great-wall-history').setData(historyFeatures());else map.addSource('great-wall-history',{type:'geojson',data:historyFeatures()});
      if(!map.getLayer('great-wall-history-line'))map.addLayer({id:'great-wall-history-line',source:'great-wall-history',type:'line',paint:{'line-color':['match',['get','dynasty'],...Object.entries(eras).flatMap(([k,v])=>[k,v[2]]),'#795548'],'line-width':['interpolate',['linear'],['zoom'],3,1,12,1.5],'line-dasharray':[3,3]}},map.getLayer('great-wall-area')?'great-wall-area':before);
      const color=['match',['get','category'],...Object.entries(colors).flat(), '#747474'];
      add({id:'great-wall-area',source:'great-wall-geometry',type:'fill',filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':'#8e4829','fill-opacity':.08}});
      for(const approximate of [false,true])add({id:'great-wall-'+(approximate?'approximate':'line'),source:'great-wall-geometry',type:'line',filter:['==',['boolean',['get','approximate'],false],approximate],paint:{'line-color':color,'line-width':['interpolate',['linear'],['zoom'],3,1,12,2.2,19,3.2],...(approximate?{'line-dasharray':[3,2]}:{})}});
      add({id:'great-wall-point',source:'great-wall-points',type:'symbol',layout:{'icon-image':['concat','great-wall-icon-',['get','category']],'icon-size':['interpolate',['linear'],['zoom'],3,.5,9,.7,14,.9],'icon-allow-overlap':true,'icon-ignore-placement':true}});
      add({id:'great-wall-label',source:'great-wall-points',type:'symbol',minzoom:11,layout:{'text-field':['get','name'],'text-size':12,'text-offset':[0,1],'text-anchor':'top'},paint:{'text-color':'#65371f','text-halo-color':'#fff','text-halo-width':1.5}});
      status(historyError); legend(); config.front();
      if(!bound.has(map)) {bound.add(map);const hits=e=>{const ids=['great-wall-point','great-wall-label','great-wall-line','great-wall-approximate','great-wall-area','great-wall-history-line'].filter(id=>map.getLayer(id));const found=ids.length?map.queryRenderedFeatures([[e.point.x-12,e.point.y-12],[e.point.x+12,e.point.y+12]],{layers:ids}):[];return found.sort((a,b)=>Number(a.properties.source==='wikipedia-kmz')-Number(b.properties.source==='wikipedia-kmz'));};
        map.on('mousemove',e=>{if(!config.state().mapOverlays?.greatWall)return;const f=hits(e)[0];hover?.remove();hover=null;if(f){map.getCanvas().style.cursor='pointer';hover=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:10,maxWidth:'220px',className:'great-wall-hover'}).setLngLat(e.lngLat).setHTML(html(f,false)).addTo(map);}else if(map.getCanvas().style.cursor==='pointer')map.getCanvas().style.cursor='';});
        map.on('mouseout',()=>{hover?.remove();hover=null;});
        map.on('click',e=>{if(!config.state().mapOverlays?.greatWall)return;const f=hits(e)[0];if(!f)return;pinned?.remove();hover?.remove();pinned=new maplibregl.Popup({offset:10,maxWidth:'340px',className:'great-wall-pinned'}).setLngLat(e.lngLat).setHTML(html(f,true)).addTo(map);});
      }
    };
    if(data&&(!config.state().mapOverlays?.greatWallHistory||historyData))apply();else {status(en()?'Loading…':'加载中…');loadView().then(apply).catch(()=>{if(token===revision)status(en()?'Load failed — toggle to retry':'加载失败，请重新开启重试');});}
  }
  function leaflet(map,group) {
    leafletGroup?.remove();leafletGroup=null;if(!config.state().mapOverlays?.greatWall)return;
    const apply=()=>{if(!config.state().mapOverlays?.greatWall||group!==config.leafletGroup())return;
      if(!map.getPane('greatWallPane'))map.createPane('greatWallPane').style.zIndex='390';
      if(!map.getPane('greatWallHistoryPane'))map.createPane('greatWallHistoryPane').style.zIndex='389';
      leafletGroup=L.layerGroup().addTo(group);
      L.geoJSON(historyFeatures(),{pane:'greatWallHistoryPane',style:f=>({color:eras[f.properties.dynasty]?.[2]||'#795548',weight:1.5,dashArray:'3 3'}),onEachFeature:(f,l)=>l.bindTooltip(html(f,false)).bindPopup(html(f,true),{maxWidth:340})}).addTo(leafletGroup);
L.geoJSON(filtered(),{pane:'greatWallPane',style:f=>({color:colors[f.properties.category],weight:2,dashArray:f.properties.approximate?'6 4':null,fillOpacity:.08}),pointToLayer:(f,ll)=>L.marker(ll,{pane:'greatWallPane',icon:L.divIcon({className:'great-wall-marker',html:iconSvg(f.properties.category),iconSize:[20,20],iconAnchor:[10,10]})}),onEachFeature:(f,l)=>l.bindTooltip(html(f,false)).bindPopup(html(f,true),{maxWidth:340})}).addTo(leafletGroup);status(historyError);legend();};
    if(data&&(!config.state().mapOverlays?.greatWallHistory||historyData))apply();else loadView().then(apply).catch(()=>status(en()?'Load failed — toggle to retry':'加载失败，请重新开启重试'));
  }
  function init(options) {config=options;document.getElementById('showGreatWallOnMap').addEventListener('change',e=>{config.state().mapOverlays.greatWall=e.target.checked;clear();config.save();config.render();});document.getElementById('greatWallCategories').addEventListener('change',e=>{const k=e.target.dataset.wallCategory,all=e.target.hasAttribute('data-wall-all');if(!k&&!all)return;const o=config.state().mapOverlays;o.greatWallCategories=all?Object.fromEntries(Object.keys(categories).map(key=>[key,e.target.checked])):{...o.greatWallCategories,[k]:e.target.checked};clear();config.save();config.render();});}
  const originalInit=init;
  init=function(options){originalInit(options);const selectAll=document.getElementById('greatWallSelectAll');selectAll.addEventListener('click',e=>e.stopPropagation());selectAll.addEventListener('change',e=>{config.state().mapOverlays.greatWallCategories=Object.fromEntries(Object.keys(categories).map(key=>[key,e.target.checked]));clear();config.save();config.render();});const historyToggle=document.getElementById('showGreatWallHistory');historyToggle.addEventListener('click',e=>e.stopPropagation());historyToggle.addEventListener('change',e=>{config.state().mapOverlays.greatWallHistory=e.target.checked;historyError='';clear();config.save();config.render();});};
  root.GreatWall={init,legend,sync,leaflet,categories};
})(globalThis);
