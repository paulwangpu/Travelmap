(function(root) {
  'use strict';
  const colors={actual_burial:'#9d4b20',posthumous:'#9d4b20',cenotaph:'#8469aa',commemorative:'#377c9b',mixed:'#9d4b20',unknown:'#75818b'};

  const dynastyColors=(root.HistoricalPeriods||(typeof require==='function'?require('./historical-periods.js'):{})).colors;
  function dynastyTheme(x){const key=(root.HistoricalPeriods||(typeof require==='function'?require('./historical-periods.js'):{})).tombPeriod(x);return {key,color:dynastyColors[key]||'#64748b',icon:'imperial-mausoleum-'+key};}
  const markerSvg=color=>`<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="${color}" stroke="#26313a" stroke-width=".7" stroke-linejoin="round"><path d="M6 11V9a4 4 0 0 1 8 0v2Z"/><path d="M4 12h12v2H4zM2 15h16v2H2zM2 6h2v5H2zM16 6h2v5h-2zM1 4h4v2H1zM15 4h4v2h-4z"/></g></svg>`;
  function markerImage(color){const size=40,data=new Uint8Array(size*size*4),rgb=color.slice(1).match(/../g).map(v=>parseInt(v,16));
    const inside=(x,y)=>((y>=5&&y<=11&&x>=6&&x<=14&&((y>=9)||(x-10)**2+(y-9)**2<=16))||(x>=4&&x<=16&&y>=12&&y<=14)||(x>=2&&x<=18&&y>=15&&y<=17)||((x>=2&&x<=4||x>=16&&x<=18)&&y>=6&&y<=11)||((x>=1&&x<=5||x>=15&&x<=19)&&y>=4&&y<=6));
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){const xx=(x+.5)/2,yy=(y+.5)/2,on=inside(xx,yy),near=[[-.6,0],[.6,0],[0,-.6],[0,.6]].map(([a,b])=>inside(xx+a,yy+b));let c=on?(near.every(Boolean)?rgb:[38,49,58]):near.some(Boolean)?[255,255,255]:null;if(c){const i=(y*size+x)*4;data.set([...c,255],i);}}
    return {width:size,height:size,data};
  }
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function compareChecklistItems(a,b) {
    if(a.era==='先秦'&&b.era==='先秦'){
      const ca=a.preqinClassification||{},cb=b.preqinClassification||{};
      const category=(ca.sectionOrder??99)-(cb.sectionOrder??99)||(ca.countryOrder??99)-(cb.countryOrder??99)||(ca.areaOrder??0)-(cb.areaOrder??0);
      if(category)return category;
      if(ca.section==='商王室'){
        const rank=x=>x.id==='shang-m1567'?2:x.id.startsWith('shang-m')?0:x.id==='shang-fuhao'?1:3;
        const kind=rank(a)-rank(b);if(kind)return kind;
        if(a.id.startsWith('shang-m')&&b.id.startsWith('shang-m'))return Number(a.id.slice(7))-Number(b.id.slice(7));
      }
    }
    return (a.chronology?.sortYear??Infinity)-(b.chronology?.sortYear??Infinity)||a.name.localeCompare(b.name,'zh-CN');
  }
  function isFeudalKing(x){return x.rulerCategory==='feudal_king'||x.preqinClassification?.section==='诸侯国';}
  function hasVisitableChamber(x) {return x.visitorAccess?.originalChamber===true&&x.visitorAccess?.status==='documented_visitable';}
  function mappedItems(catalog,era='',zoom=10,natures={},preqin={},includeFeudalKings=true,onlyVisitableChambers=false) {
    const valid=(catalog?.items||[]).filter(x=>(includeFeudalKings||!isFeudalKing(x))&&(!onlyVisitableChambers||hasVisitableChamber(x))&&x.mapEligible&&(x.coordinates?.status==='verified_wgs84'||x.coordinates?.status==='estimated_wgs84'&&x.coordinates.estimate?.basis&&x.coordinates.estimate?.extent)&&Number.isFinite(x.coordinates.lat)&&Number.isFinite(x.coordinates.lng)&&(typeof era==='object'?(era[dynastyTheme(x).key]??era[x.era])!==false:!era||x.era===era||dynastyTheme(x).key===era)&&natures[x.nature]!==false&&(x.era!=='先秦'||preqin[x.preqinClassification?.country]!==false));
    const ids=new Set(valid.map(x=>x.id)),parents=new Set(valid.map(x=>x.parentId).filter(Boolean));
    return valid.filter(x=>zoom<7 ? !x.parentId||!ids.has(x.parentId) : x.recordType!=='group'||!parents.has(x.id));
  }
  function visitMembers(catalog,x) {
    if(x.recordType!=='group')return [x];
    const descendants=(catalog.items||[]).filter(item=>{let current=item;const seen=new Set();while(current.parentId&&!seen.has(current.id)){seen.add(current.id);if(current.parentId===x.id)return true;current=catalog.items.find(parent=>parent.id===current.parentId);if(!current)break;}return false;});
    const parents=new Set(descendants.map(item=>item.parentId).filter(Boolean));
    return descendants.length?descendants.filter(item=>item.recordType==='single'||!parents.has(item.id)):[x];
  }
  function geojson(catalog,era='',zoom=10,natures={},preqin={},isVisited=()=>false,includeFeudalKings=true,onlyVisitableChambers=false) {return {type:'FeatureCollection',features:mappedItems(catalog,era,zoom,natures,preqin,includeFeudalKings,onlyVisitableChambers).map(x=>{const members=visitMembers(catalog,x),visited=members.filter(isVisited).length,done=visited===members.length;return {type:'Feature',id:x.id,geometry:{type:'Point',coordinates:[x.coordinates.lng,x.coordinates.lat]},properties:{id:x.id,name:(done?'✓ ':'')+(x.mapLabel||x.name)+(x.coordinates.status==='estimated_wgs84'?'（估）':''),done,visitedCount:visited,visitTotal:members.length,partlyVisited:visited>0&&!done,color:dynastyTheme(x).color,dynastyColorKey:dynastyTheme(x).key,icon:dynastyTheme(x).icon+(visited>0?'-visited':''),group:x.recordType==='group',memorial:['commemorative','cenotaph'].includes(x.nature)}};})};}
  let config,data,pending,error='',revision=0,hover,pinned,leafletGroup,selectedId;
  const bound=new WeakSet();
  const en=()=>config?.language?.()==='en';
  const enabled=()=>Boolean(config.state().mapOverlays?.imperialTombs);
  const era=()=>config.state().mapOverlays?.imperialTombsEra||'';
  const eraSelection=()=>{const saved=config.state().mapOverlays?.imperialTombsEras;if(saved)return {...root.HistoricalPeriods.periodSelection(saved),明:saved.明??saved['明清'],清:saved.清??saved['明清']};return era()==='明清'?{明:true,清:true,...Object.fromEntries(eraKeys().filter(k=>!['明','清'].includes(k)).map(k=>[k,false]))}:root.HistoricalPeriods.displayPeriod(era());};
  const natureSelection=()=>({});
  const onlyVisitableChambers=()=>config.state().mapOverlays?.imperialTombsOnlyVisitableChambers===true;
  const includeFeudalKings=()=>config.state().mapOverlays?.imperialTombsIncludeFeudalKings!==false;
  const preqinSelection=()=>({});
  const preqinKeys=()=>[...new Set((data?.items||[]).filter(x=>x.era==='先秦').sort(compareChecklistItems).map(x=>x.preqinClassification?.country).filter(Boolean))];
  const preqinChecked=k=>preqinSelection()[k]!==false;
  const eraKeys=()=>root.HistoricalPeriods.keys.filter(k=>(data?.items||[]).some(x=>dynastyTheme(x).key===k));
  const natureKeys=()=>Object.keys(colors);
  const eraChecked=k=>typeof eraSelection()==='object'?(eraSelection()[k]??(['夏商','周'].includes(k)?eraSelection()['先秦']:['明','清'].includes(k)?eraSelection()['明清']:undefined))!==false:!era()||root.HistoricalPeriods.displayPeriod(era())===k||(era()==='先秦'&&['传说','夏商','周'].includes(k))||(era()==='明清'&&['明','清'].includes(k));
  const removePopups=()=>{hover?.remove();pinned?.remove();hover=pinned=null;};
  async function load() {
    if(data)return data;if(pending)return pending;
    pending=config.fetch('data/imperial-tombs/catalog.json?v=59').then(c=>{
      if(!Array.isArray(c.items)||!Array.isArray(c.sources))throw new Error('invalid tomb catalog');
      data=c;error='';return c;
    }).catch(e=>{error=en()?'Tomb data could not be loaded. Retry.':'皇陵资料加载失败，点击重试。';throw e;}).finally(()=>{pending=null;});
    return pending;
  }
  function legend() {
    const toggle=document.getElementById('showImperialTombsOnMap');if(toggle)toggle.checked=enabled();
    const el=document.getElementById('imperialTombsLegend');if(!el)return;
    el.hidden=!enabled();if(!enabled())return;
    const scopeItems=(data?.items||[]).filter(x=>(includeFeudalKings()||!isFeudalKing(x))&&(!onlyVisitableChambers()||hasVisitableChamber(x)));
    const count=scopeItems.filter(x=>x.mapEligible).length;
    const open=Object.fromEntries(Array.from(el.querySelectorAll('details[data-tomb-section]')).map(d=>[d.dataset.tombSection,d.open]));
    const natureEnglish={actual_burial:'Burial',posthumous:'Posthumous',cenotaph:'Cenotaph',commemorative:'Memorial',mixed:'Group / mixed',unknown:'Uncertain'};
    const natureChinese={actual_burial:'实际墓葬',posthumous:'追尊陵',cenotaph:'衣冠冢',commemorative:'祭祀纪念陵',mixed:'陵群 / 混合',unknown:'性质未明'};
    const section=(kind,title,keys,checked,label)=>`<details class="great-wall-section" data-tomb-section="${kind}" ${open[kind]!==false?'open':''}><summary><input type="checkbox" data-tomb-all="${kind}" aria-label="${esc((en()?'Select all ':'全选')+title)}"><i class="wall-disclosure" aria-hidden="true"></i><span>${title} · ${en()?'Select all':'全选'}</span></summary><div class="tomb-legend-options">${keys.map(k=>`<label><input type="checkbox" data-tomb-${kind}="${esc(k)}" ${checked(k)?'checked':''} ${kind==='era'&&!eraKeys().includes(k)?'disabled title="暂无条目"':''}>${kind==='era'?root.HistoricalPeriods.legendIcon(markerSvg('#fff'),dynastyTheme({era:k}).color):''}${kind==='nature'?`<i class="tomb-swatch ${['commemorative','cenotaph'].includes(k)?'memorial':''}" style="--tomb-color:${colors[k]}" aria-hidden="true"></i>`:''}<span>${esc(label(k))}</span></label>`).join('')}</div></details>`;
    el.innerHTML=`<strong>${en()?'Imperial tombs':'皇陵'}</strong><div class="tomb-legend-scope"><label><input type="checkbox" data-tomb-feudal ${includeFeudalKings()?'checked':''}><span>${en()?'Include vassal kings':'包含诸侯王'}</span></label><label><input type="checkbox" data-tomb-chambers ${onlyVisitableChambers()?'checked':''}><span>${en()?'Only visitable burial chambers':'仅显示可参观地宫'}</span></label></div>${section('era',en()?'Dynasties':'朝代',root.HistoricalPeriods.keys,k=>eraKeys().includes(k)&&eraChecked(k),k=>k)}<small role="status">${error?esc(error):data?(en()?`${count} located; ${scopeItems.length-count} pending`:`${count} 条区域点，${scopeItems.filter(x=>!x.coordinates&&x.locationReference?.coordinates).length} 条关联陵区，${scopeItems.filter(x=>!x.coordinates&&!x.locationReference?.coordinates).length} 条位置待核`):(en()?'Loading…':'正在加载…')}</small>${error?`<button type="button" data-tomb-retry>${en()?'Retry':'重试'}</button>`:''}`;
    for(const [kind,keys,checked] of [['era',eraKeys(),eraChecked]]) {
      const all=el.querySelector(`[data-tomb-all="${kind}"]`),selected=keys.filter(checked).length;
      all.checked=keys.length>0&&selected===keys.length;all.indeterminate=selected>0&&selected<keys.length;all.disabled=!data;
    }
  }
  function showDetail(id) {
    const x=data?.items.find(x=>x.id===id),el=document.getElementById('mapDetail');if(!x||!el)return;
    selectedId=id;
    config.resetDetail?.();el.classList.remove('hidden');el.classList.add('imperial-tomb-detail');
    const sources=new Map(data.sources.map(s=>[s.id,s]));
    const row=(label,value)=>`<div><dt>${label}</dt><dd>${esc(value||'—')}</dd></div>`;
    const section=(title,content)=>`<section class="tomb-detail-section"><h4>${title}</h4>${content}</section>`;
    const links=[...new Set([...x.sourceIds,...(x.migrationHistory?.sourceIds||[]),...(x.researchUpdates||[]).flatMap(update=>update.sourceIds),...(x.biographies||[]).flatMap(p=>p.sourceIds||[]),...(x.disturbance?.sourceIds||[]),x.coordinates?.sourceId,x.locationReference?.coordinates?.sourceId].filter(Boolean))].map(k=>sources.get(k)).filter(s=>s&&/^https:\/\//.test(s.url));
    const members=visitMembers(data,x);
    const action=item=>`<button type="button" class="detail-action" data-checklist-map="imperialTombs" data-item="${esc(item.name)}">${config.isVisited?.(item)?(en()?'Mark unvisited':'取消去过'):(en()?'Mark visited':'标记去过')}</button>`;
    el.innerHTML=`<button type="button" class="map-detail-close" data-close-detail aria-label="${en()?'Close':'关闭'}">×</button><p class="eyebrow">${en()?'Imperial tombs':'皇陵'}</p><h3>${esc(x.mapLabel||x.name)}</h3>
      ${members.length===1&&members[0].id===x.id?action(x):section(en()?'Tombs in this cemetery':'陵区内陵墓',`<ul class="tomb-detail-sources">${members.map(item=>`<li><button type="button" class="popup-action" data-tomb-related="${esc(item.id)}">${esc(item.mapLabel||item.name)}</button>${action(item)}</li>`).join('')}</ul>`)}
      ${section(en()?'Overview':'基本信息',`<dl>${row(en()?'Dynasty':'朝代 / 政权',x.dynasty)}${row(en()?'Occupants / dedication':'墓主 / 祭祀对象',x.occupants.join('、'))}${row(en()?'Lifespan':'生卒时间',x.lifespanText)}${row(en()?'Location':'所在地',x.admin)}${row(en()?'Burial chamber visits':'地宫参观',x.visitorAccess?.note)}${row(en()?'Nature':'性质',data.natureLabels[x.nature])}</dl>`)}
      ${section(en()?'Evidence and uncertainty':'认定与争议',`<dl>${row(en()?'Dating':'年代范围',x.periodText||x.preqinPeriod||x.era)}${row(en()?'Period evidence':'分期依据',x.preqinPeriodBasis)}${row(en()?'Recognition':'认定依据',x.evidence)}${row(en()?'Disturbance record':'盗掘记录',x.disturbance?.label)}${x.disturbance?.evidence?row(en()?'Disturbance evidence':'盗掘依据',x.disturbance.evidence):''}</dl>${x.disputes.length?`<div class="tomb-detail-note">${esc(x.disputes.map(note=>note.trim().replace(/[。；;]+$/,'')).filter(Boolean).join('；')+'。')}</div>`:''}`)}
      ${x.researchUpdates?.length?section(en()?'Recent research':'近年考古进展',`<ul>${x.researchUpdates.map(update=>`<li>${esc(update.note)}</li>`).join('')}</ul>`):''}
      ${x.migrationHistory?section(en()?'Burial and relocation':'初葬与迁葬',`<ol>${x.migrationHistory.stages.map(stage=>`<li>${esc(stage.year)}年 · <button type="button" class="popup-action" data-tomb-related="${esc(stage.siteId)}">${esc(stage.label)}</button>${stage.siteId===x.id?'（本条目）':''}</li>`).join('')}</ol>`):''}
      ${section(en()?'Map location':'地图位置',`<dl>${row(en()?'Reference point':'地图点位',x.coordinates?.target||x.locationReference?.target)}${row(en()?'Location evidence':'定位资料',x.coordinates?.limitation||x.locationReference?.limitation||x.locationReference?.basis)}${row(en()?'Location review':'位置核查',x.locationReview?.reason)}${row(en()?'Remaining evidence':'待核资料',x.locationReview?.nextStep)}</dl>`)}
      ${section(en()?'Sources':'资料来源',`<ul class="tomb-detail-sources">${links.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><small>${esc(s.publisher||'')}</small></li>`).join('')}</ul>`)}`;
    el.querySelectorAll('[data-tomb-related]').forEach(button=>button.addEventListener('click',()=>showDetail(button.dataset.tombRelated)));

  }
  async function sync(map) {
    const token=++revision;removePopups();
    if(!enabled()) {for(const id of ['imperial-tomb-label-full','imperial-tomb-label','imperial-tomb-point'])if(map.getLayer(id))map.removeLayer(id);if(map.getSource('imperial-tombs'))map.removeSource('imperial-tombs');map.getCanvas().style.cursor='';legend();return;}
    legend();
    try {
      const c=await load();if(token!==revision||!enabled()||!map.getStyle()?.layers)return;
      const features=geojson(c,eraSelection(),map.getZoom(),natureSelection(),preqinSelection(),x=>config.isVisited?.(x),includeFeudalKings(),onlyVisitableChambers());
      if(map.getSource('imperial-tombs'))map.getSource('imperial-tombs').setData(features);else map.addSource('imperial-tombs',{type:'geojson',data:features});
      for(const [key,color] of Object.entries(dynastyColors)){const id='imperial-mausoleum-'+key;if(!map.hasImage(id))map.addImage(id,markerImage(color),{pixelRatio:2});if(!map.hasImage(id+'-visited'))map.addImage(id+'-visited',root.HistoricalPeriods.visitedImage(markerImage(color)),{pixelRatio:2});}
      if(!map.getLayer('imperial-tomb-point'))map.addLayer({id:'imperial-tomb-point',type:'symbol',source:'imperial-tombs',layout:{'icon-image':['get','icon'],'icon-size':['interpolate',['linear'],['zoom'],2,.5,5,.65,10,.85,14,1],'icon-allow-overlap':true,'icon-ignore-placement':true}});
      const paint={'text-color':['get','color'],'text-halo-color':'#fff','text-halo-width':1.5};
      const layout={'text-field':['get','name'],'text-offset':[0,1.2],'text-variable-anchor':['top','bottom','left','right'],'text-padding':4,'text-allow-overlap':false,'symbol-sort-key':['case',['get','group'],0,1]};
      if(!map.getLayer('imperial-tomb-label'))map.addLayer({id:'imperial-tomb-label',type:'symbol',source:'imperial-tombs',minzoom:5,maxzoom:11,layout:{...layout,'text-size':12},paint});
      if(!map.getLayer('imperial-tomb-label-full'))map.addLayer({id:'imperial-tomb-label-full',type:'symbol',source:'imperial-tombs',minzoom:11,layout:{...layout,'text-size':12},paint});
      legend();config.front?.();
      if(selectedId&&document.getElementById('mapDetail')?.classList.contains('imperial-tomb-detail'))showDetail(selectedId);
      if(!bound.has(map)){bound.add(map);
        const hit=e=>{const layers=['imperial-tomb-point','imperial-tomb-label','imperial-tomb-label-full'].filter(id=>map.getLayer(id));return layers.length?map.queryRenderedFeatures([[e.point.x-7,e.point.y-7],[e.point.x+7,e.point.y+7]],{layers})[0]:null;};
        map.on('mousemove',e=>{if(!enabled()||pinned?.isOpen())return;const f=hit(e);hover?.remove();hover=null;if(f){map.getCanvas().style.cursor='pointer';hover=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:10,maxWidth:'220px',className:'ancient-capital-hover'}).setLngLat(f.geometry.coordinates).setHTML(`<b>${esc(f.properties.name)}</b>`).addTo(map);}else if(map.getCanvas().style.cursor==='pointer')map.getCanvas().style.cursor='';});
        map.on('zoomend',()=>{if(enabled())sync(map);});
      }
    }catch(e){if(token===revision){legend();console.warn('Imperial tomb overlay',e);}}
  }
  async function leaflet(map) {
    const token=++revision;if(leafletGroup){map.removeLayer(leafletGroup);leafletGroup=null;}
    if(!enabled()){legend();return;}legend();
    try{const c=await load();if(token!==revision||!enabled())return;leafletGroup=L.layerGroup().addTo(map);
      for(const x of mappedItems(c,eraSelection(),map.getZoom(),natureSelection(),preqinSelection(),includeFeudalKings(),onlyVisitableChambers())) {const members=visitMembers(c,x),count=members.filter(item=>config.isVisited?.(item)).length,done=count===members.length;L.marker([x.coordinates.lat,x.coordinates.lng],{icon:L.divIcon({className:'imperial-tomb-marker',html:root.HistoricalPeriods.visitedSvg(markerSvg(dynastyTheme(x).color),count>0),iconSize:[18,18],iconAnchor:[9,9]})}).bindTooltip(esc((done?'✓ ':'')+(x.mapLabel||x.name))).bindPopup(config.popupHtml(popupContent(c,x,item=>config.isVisited?.(item))),{closeButton:false,maxWidth:300}).on('click',e=>{L.DomEvent.stopPropagation(e.originalEvent);showDetail(x.id);}).addTo(leafletGroup);}
      legend();if(!bound.has(map)){bound.add(map);map.on('zoomend',()=>{if(enabled())leaflet(map);});}
    }catch(e){if(token===revision){legend();console.warn('Imperial tomb overlay',e);}}
  }
  function init(options){config=options;
    document.getElementById('showImperialTombsOnMap')?.addEventListener('change',e=>{config.state().mapOverlays= config.state().mapOverlays||{};config.state().mapOverlays.imperialTombs=e.target.checked;revision++;removePopups();config.save();config.render();});
    const container=document.getElementById('mapOverlayLegends');if(container){const el=document.createElement('section');el.id='imperialTombsLegend';el.className='great-wall-legend imperial-tombs-legend';el.hidden=true;container.appendChild(el);
      el.addEventListener('change',e=>{
        const t=e.target;
        if(t.hasAttribute('data-tomb-chambers')){config.state().mapOverlays.imperialTombsOnlyVisitableChambers=t.checked;revision++;removePopups();config.save();config.render();return;}
        if(t.hasAttribute('data-tomb-feudal')){config.state().mapOverlays.imperialTombsIncludeFeudalKings=t.checked;revision++;removePopups();config.save();config.render();return;}
        const kind=t.dataset.tombAll||(t.hasAttribute('data-tomb-era')?'era':t.hasAttribute('data-tomb-preqin')?'preqin':t.hasAttribute('data-tomb-nature')?'nature':'');if(!kind)return;
        const keys=kind==='era'?eraKeys():kind==='preqin'?preqinKeys():natureKeys(),checked=kind==='era'?eraChecked:kind==='preqin'?preqinChecked:k=>natureSelection()[k]!==false;
        const selection=Object.fromEntries(keys.map(k=>[k,t.dataset.tombAll?t.checked:k===t.dataset[kind==='era'?'tombEra':kind==='preqin'?'tombPreqin':'tombNature']?t.checked:checked(k)]));
        config.state().mapOverlays[kind==='era'?'imperialTombsEras':kind==='preqin'?'imperialTombsPreqin':'imperialTombsNatures']=selection;
        if(kind==='era')config.state().mapOverlays.imperialTombsEra='';
        revision++;removePopups();config.save();config.render();
      });
      el.addEventListener('click',e=>{if(e.target.closest('[data-tomb-all]'))e.stopPropagation();if(e.target.closest('[data-tomb-retry]')){error='';config.render();}});
    }
  }
  function popupContent(catalog,x,isVisited=()=>false) {
    const members=visitMembers(catalog,x);
    const action=item=>`<button class="popup-action" aria-pressed="${Boolean(isVisited(item))}" data-checklist-map="imperialTombs" data-item="${esc(item.name)}" type="button">${isVisited(item)?(en()?'Visited':'已去过'):(en()?'Mark visited':'标记去过')}</button>`;
    const body=members.length===1&&members[0].id===x.id?`<div class="tomb-popup-single">${action(x)}</div>`:`<div class="tomb-popup-list">${members.sort(compareChecklistItems).map(item=>`<div class="tomb-popup-row"><span>${esc(item.mapLabel||item.name)}</span>${action(item)}</div>`).join('')}</div>`;
    return `<div class="tomb-popup"><strong>${esc(x.mapLabel||x.name)}</strong><p class="tomb-popup-location">${esc(x.admin)}</p>${body}</div>`;
  }
  function showPopup(map,x) {
    removePopups();
    const content=popupContent(data,x,item=>config.isVisited?.(item));
    const html=config.popupHtml?config.popupHtml(content):content;
    pinned=new maplibregl.Popup({offset:12,closeButton:false,maxWidth:'310px',className:'tomb-click-popup'}).setLngLat([x.coordinates.lng,x.coordinates.lat]).setHTML(html).addTo(map);
  }
  function handleClick(map,e) {
    if(!enabled()||!map.getLayer('imperial-tomb-point'))return false;
    const f=map.queryRenderedFeatures([[e.point.x-7,e.point.y-7],[e.point.x+7,e.point.y+7]],{layers:['imperial-tomb-point']})[0];
    if(!f)return false;if(e.originalEvent)e.originalEvent._travelMapHandled=true;const x=data?.items.find(item=>item.id===f.properties.id);if(!x)return false;showDetail(x.id);showPopup(map,x);return true;
  }
  root.ImperialTombs={init,legend,sync,leaflet,mappedItems,geojson,handleClick,compareChecklistItems,dynastyTheme,markerSvg,markerImage,dynastyColors,isFeudalKing,catalogItems:()=>data?.items||[]};
  if(typeof module!=='undefined')module.exports={mappedItems,geojson,compareChecklistItems,dynastyTheme,markerSvg,markerImage,dynastyColors,popupContent,isFeudalKing,hasVisitableChamber};
})(globalThis);
