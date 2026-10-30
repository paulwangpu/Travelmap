(function(root) {
  'use strict';
  const Geometry=root.ImperialTombGeometry||(typeof require==='function'?require('./imperial-tomb-geometry.js'):null);
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
  function nameFor(x){const name=en()?(x.enMapLabel||x.enName||x.mapLabel||x.name):(x.mapLabel||x.name);return name+(/墓地位置未单独配准/.test(x.coordinates?.target||'')?(en()?' (regional reference)':'（区域参考）'):'');}
  function chinesePeriodLabel(x){return en()?(x.enCorrespondingChinesePeriodLabel||x.correspondingChinesePeriod):(x.correspondingChinesePeriodLabel||x.correspondingChinesePeriod);}
  function hoverContent(x,displayName=nameFor(x)){return '<strong>'+esc(displayName)+'</strong>'+(x.correspondingChinesePeriod?'<small>'+esc(en()?x.enDynasty||x.dynasty:x.dynasty)+'</small><small>'+(en()?'Corresponding Chinese period':'中国对应朝代')+'：'+esc(chinesePeriodLabel(x))+'</small>':'');}
  function geojson(catalog,era='',zoom=10,natures={},preqin={},isVisited=()=>false,includeFeudalKings=true,onlyVisitableChambers=false) {return {type:'FeatureCollection',features:mappedItems(catalog,era,zoom,natures,preqin,includeFeudalKings,onlyVisitableChambers).map(x=>{const members=visitMembers(catalog,x),visited=members.filter(isVisited).length,done=visited===members.length;return {type:'Feature',id:x.id,geometry:{type:'Point',coordinates:[x.coordinates.lng,x.coordinates.lat]},properties:{id:x.id,name:(done?'✓ ':'')+nameFor(x)+(x.coordinates.status==='estimated_wgs84'?'（估）':''),done,visitedCount:visited,visitTotal:members.length,partlyVisited:visited>0&&!done,color:dynastyTheme(x).color,dynastyColorKey:dynastyTheme(x).key,icon:dynastyTheme(x).icon+(visited>0?'-visited':''),group:x.recordType==='group',memorial:['commemorative','cenotaph'].includes(x.nature)}};})};}
  let config,data,pending,error='',revision=0,hover,pinned,leafletGroup,selectedId;
  const bound=new WeakSet();
  const en=()=>config?.language?.()==='en';
  const enabled=()=>Boolean(config.state().mapOverlays?.imperialTombs && config.state().mapOverlays?.chinaAncientCapitals!==false);
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
  const isItemVisible=(item,zoom=10)=>enabled()&&mappedItems(data||{items:[item]},eraSelection(),zoom,natureSelection(),preqinSelection(),includeFeudalKings(),onlyVisitableChambers()).some(x=>x.id===item.id);
  async function load() {
    if(data)return data;if(pending)return pending;
    pending=config.fetch('data/imperial-tombs/catalog.json?v=77').then(c=>{
      if(!Array.isArray(c.items)||!Array.isArray(c.sources))throw new Error('invalid tomb catalog');
      data=c;error='';return c;
    }).catch(e=>{error=en()?'Tomb data could not be loaded. Retry.':'皇陵资料加载失败，点击重试。';throw e;}).finally(()=>{pending=null;});
    return pending;
  }
  function geometryOptions(){return {era:eraSelection(),natures:natureSelection(),preqin:preqinSelection(),includeFeudalKings:includeFeudalKings(),onlyVisitableChambers:onlyVisitableChambers(),isVisited:x=>config.isVisited?.(x),en:en()};}
  function geometryCollection(c,g){return Geometry?Geometry.collection(c,g,geometryOptions()):{type:'FeatureCollection',features:[]};}
  function legend() {
    const el=document.getElementById('imperialTombsLegend');if(!el)return;
    el.hidden=!config.state().mapOverlays?.chinaAncientCapitals;if(el.hidden)return;
    const scopeItems=(data?.items||[]).filter(x=>(includeFeudalKings()||!isFeudalKing(x))&&(!onlyVisitableChambers()||hasVisitableChamber(x)));
    const count=scopeItems.filter(x=>x.mapEligible).length;
    const layerOpen=el.querySelector('.capital-tomb-section')?.open??enabled();
    el.innerHTML=`<details class="great-wall-section capital-tomb-section" data-tomb-section="layer" ${layerOpen?'open':''}><summary><input type="checkbox" data-tomb-visible data-tomb-all="era" ${enabled()?'checked':''} aria-label="${en()?'Tombs':'陵墓'}"><i class="wall-disclosure" aria-hidden="true"></i><span>${en()?'Tombs':'陵墓'}</span></summary><div class="tomb-legend-options">${root.HistoricalPeriods.keys.map(k=>`<label><input type="checkbox" data-tomb-era="${esc(k)}" ${eraKeys().includes(k)&&eraChecked(k)?'checked':''} ${!eraKeys().includes(k)?'disabled':''}>${root.HistoricalPeriods.legendIcon(markerSvg('#fff'),dynastyTheme({era:k}).color)}<span>${esc(k==='传说'?(en()?'Legendary / Pre-Xia':'传说／夏以前'):k)}</span></label>`).join('')}</div>${error?`<small role="status">${esc(error)}</small>`:""}<div class="tomb-legend-scope"><label><input type="checkbox" data-tomb-feudal ${includeFeudalKings()?'checked':''}><span>${en()?'Include vassal kings':'包含诸侯王'}</span></label><label><input type="checkbox" data-tomb-chambers ${onlyVisitableChambers()?'checked':''}><span>${en()?'Only visitable burial chambers':'仅显示可参观地宫'}</span></label></div></details>`;

    for(const [kind,keys,checked] of [['era',eraKeys(),eraChecked]]) {
      const all=el.querySelector(`[data-tomb-all="${kind}"]`),selected=keys.filter(checked).length;
      all.checked=enabled()&&(!data||keys.length>0&&selected===keys.length);all.indeterminate=enabled()&&selected>0&&selected<keys.length;all.disabled=false;
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
    el.innerHTML=`<button type="button" class="map-detail-close" data-close-detail aria-label="${en()?'Close':'关闭'}">×</button><p class="eyebrow">${en()?'Imperial tombs':'皇陵'}</p><h3>${esc(nameFor(x))}</h3>${root.HistoricalEvidence?.html(x,{type:"Point"},en())||""}
      ${members.length===1&&members[0].id===x.id?action(x):section(en()?'Tombs in this cemetery':'陵区内陵墓',`<ul class="tomb-detail-sources">${members.map(item=>`<li><button type="button" class="popup-action" data-tomb-related="${esc(item.id)}">${esc(nameFor(item))}</button>${action(item)}</li>`).join('')}</ul>`)}
      ${section(en()?'Overview':'基本信息',`<dl>${row(en()?'Dynasty':'朝代 / 政权',en()?x.enDynasty||x.dynasty:x.dynasty)}${x.correspondingChinesePeriod?row(en()?'Corresponding Chinese period':'中国对应朝代',chinesePeriodLabel(x)):''}${row(en()?'Occupants / dedication':'墓主 / 祭祀对象',(en()?x.enOccupants||x.occupants:x.occupants).join('、'))}${row(en()?'Lifespan':'生卒时间',en()?x.enLifespanText||x.lifespanText:x.lifespanText)}${row(en()?'Location':'所在地',en()?x.enAdmin||x.admin:x.admin)}${row(en()?'Burial chamber visits':'地宫参观',en()?x.visitorAccess?.enNote||x.visitorAccess?.note:x.visitorAccess?.note)}${row(en()?'Nature':'性质',en()?x.enNatureLabel||data.natureLabels[x.nature]:x.natureLabel||data.natureLabels[x.nature])}</dl>`)}
      ${section(en()?'Evidence and uncertainty':'认定与争议',`<dl>${row(en()?'Dating':'年代范围',(en()?x.enPeriodText:null)||x.periodText||x.preqinPeriod||x.era)}${row(en()?'Period evidence':'分期依据',x.preqinPeriodBasis)}${row(en()?'Recognition':'认定依据',en()?x.enEvidence||x.evidence:x.evidence)}${row(en()?'Disturbance record':'盗掘记录',x.disturbance?.label)}${x.disturbance?.evidence?row(en()?'Disturbance evidence':'盗掘依据',x.disturbance.evidence):''}</dl>${x.disputes.length?`<div class="tomb-detail-note">${esc((en()?x.enDisputes||x.disputes:x.disputes).map(note=>note.trim().replace(/[。；;]+$/,'')).filter(Boolean).join('；')+'。')}</div>`:''}`)}
      ${x.researchUpdates?.length?section(en()?'Recent research':'近年考古进展',`<ul>${x.researchUpdates.map(update=>`<li>${esc(update.note)}</li>`).join('')}</ul>`):''}
      ${x.migrationHistory?section(en()?'Burial and relocation':'初葬与迁葬',`<ol>${x.migrationHistory.stages.map(stage=>`<li>${esc(stage.year)}年 · <button type="button" class="popup-action" data-tomb-related="${esc(stage.siteId)}">${esc(stage.label)}</button>${stage.siteId===x.id?'（本条目）':''}</li>`).join('')}</ol>`):''}
      ${section(en()?'Map location':'地图位置',`<dl>${row(en()?'Reference point':'地图点位',x.coordinates?.target||x.locationReference?.target)}${row(en()?'Location evidence':'定位资料',x.coordinates?.limitation||x.locationReference?.limitation||x.locationReference?.basis)}${row(en()?'Location review':'位置核查',en()?x.locationReview?.enReason||x.locationReview?.reason:x.locationReview?.reason)}${row(en()?'Remaining evidence':'待核资料',en()?x.locationReview?.enNextStep||x.locationReview?.nextStep:x.locationReview?.nextStep)}</dl>`)}
      ${(typeof Geometry==='undefined'?[]:Geometry?.records()||[]).some(f=>f.properties.tombId===x.id)?section(en()?'Footprints and approaches':'墓道与范围',`<ul>${Geometry.records().filter(f=>f.properties.tombId===x.id).map(f=>`<li>${esc(en()?f.properties.enName:f.properties.name)}：${esc(en()?f.properties.enNote:f.properties.note)} <a href="${esc(f.properties.sourceUrl)}" target="_blank" rel="noopener noreferrer">${en()?'Sources':'依据'}</a></li>`).join('')}</ul>`):''}
      ${section(en()?'Sources':'资料来源',`<ul class="tomb-detail-sources">${links.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><small>${esc(s.publisher||'')}</small></li>`).join('')}</ul>`)}`;
    el.querySelectorAll('[data-tomb-related]').forEach(button=>button.addEventListener('click',()=>showDetail(button.dataset.tombRelated)));

  }
  async function sync(map) {
    const token=++revision;removePopups();
    if(!enabled()) {for(const id of [...(Geometry?.layerIds||[]),'imperial-tomb-label-full','imperial-tomb-label','imperial-tomb-point'])if(map.getLayer(id))map.removeLayer(id);if(map.getSource('imperial-tombs'))map.removeSource('imperial-tombs');map.getCanvas().style.cursor='';legend();return;}
    legend();
    try {
      const [c,g]=await Promise.all([load(),Geometry?Geometry.load(config.fetch):Promise.resolve(null)]);if(token!==revision||!enabled()||!map.getStyle()?.layers)return;
      const features=geojson(c,eraSelection(),map.getZoom(),natureSelection(),preqinSelection(),x=>config.isVisited?.(x),includeFeudalKings(),onlyVisitableChambers());
      features.features.push(...geometryCollection(c,g).features);
      if(map.getSource('imperial-tombs'))map.getSource('imperial-tombs').setData(features);else map.addSource('imperial-tombs',{type:'geojson',data:features});
      Geometry?.layers(map);
      for(const [key,color] of Object.entries(dynastyColors)){const id='imperial-mausoleum-'+key;if(!map.hasImage(id))map.addImage(id,markerImage(color),{pixelRatio:2});if(!map.hasImage(id+'-visited'))map.addImage(id+'-visited',root.HistoricalPeriods.visitedImage(markerImage(color)),{pixelRatio:2});}
      if(!map.getLayer('imperial-tomb-point'))map.addLayer({id:'imperial-tomb-point',type:'symbol',source:'imperial-tombs',filter:['!=',['get','tombGeometry'],true],layout:{'icon-image':['get','icon'],'icon-size':['interpolate',['linear'],['zoom'],2,.5,5,.65,10,.85,14,1],'icon-allow-overlap':true,'icon-ignore-placement':true}});
      const paint={'text-color':['get','color'],'text-halo-color':'#fff','text-halo-width':1.5};
      const layout={'text-field':['get','name'],'text-offset':[0,1.2],'text-variable-anchor':['top','bottom','left','right'],'text-padding':4,'text-allow-overlap':false,'symbol-sort-key':['case',['get','group'],0,1]};
      if(!map.getLayer('imperial-tomb-label'))map.addLayer({id:'imperial-tomb-label',type:'symbol',source:'imperial-tombs',filter:['!=',['get','tombGeometry'],true],minzoom:5,maxzoom:11,layout:{...layout,'text-size':12},paint});
      if(!map.getLayer('imperial-tomb-label-full'))map.addLayer({id:'imperial-tomb-label-full',type:'symbol',source:'imperial-tombs',filter:['!=',['get','tombGeometry'],true],minzoom:11,layout:{...layout,'text-size':12},paint});
      legend();config.front?.();
      const detail=document.getElementById('mapDetail');
      if(selectedId&&detail?.classList.contains('imperial-tomb-detail')&&!detail.classList.contains('hidden'))showDetail(selectedId);
      if(!bound.has(map)){bound.add(map);
        const hit=e=>{const layers=['imperial-tomb-point','imperial-tomb-label','imperial-tomb-label-full',...(Geometry?.layerIds||[])].filter(id=>map.getLayer(id));return layers.length?map.queryRenderedFeatures([[e.point.x-7,e.point.y-7],[e.point.x+7,e.point.y+7]],{layers})[0]:null;};
        map.on('mousemove',e=>{if(!enabled()||pinned?.isOpen())return;const f=hit(e);hover?.remove();hover=null;if(f){map.getCanvas().style.cursor='pointer';hover=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:10,maxWidth:'220px',className:'ancient-capital-hover'}).setLngLat(f.properties.tombGeometry?e.lngLat:f.geometry.coordinates).setHTML(f.properties.tombGeometry?'<strong>'+esc(f.properties.name)+'</strong><small>'+esc(f.properties.status)+'</small>':hoverContent(c.items.find(x=>x.id===f.properties.id),f.properties.name)).addTo(map);}else if(map.getCanvas().style.cursor==='pointer')map.getCanvas().style.cursor='';});
        map.on('zoomend',()=>{if(enabled())sync(map);});
      }
    }catch(e){if(token===revision){legend();console.warn('Imperial tomb overlay',e);}}
  }
  async function leaflet(map) {
    const token=++revision;if(leafletGroup){map.removeLayer(leafletGroup);leafletGroup=null;}
    if(!enabled()){legend();return;}legend();
    try{const [c,g]=await Promise.all([load(),Geometry?Geometry.load(config.fetch):Promise.resolve(null)]);if(token!==revision||!enabled())return;leafletGroup=L.layerGroup().addTo(map);
      if(map.getZoom()>=13)for(const f of geometryCollection(c,g).features.filter(f=>!f.properties.tombGeometryLabel)){const p=f.properties,x=c.items.find(x=>x.id===p.id);L.geoJSON(f,{style:{color:p.color,weight:p.visited?2.3:1.2,opacity:.8,fillOpacity:p.visited?.17:p.fillOpacity||.04,dashArray:p.lineStyle==='solid'?null:'4 2'}}).bindTooltip(esc(p.name),{permanent:map.getZoom()>=16&&f.geometry.type==='Polygon',direction:'center'}).bindPopup(geometryPopup(p,x)).on('click',e=>{L.DomEvent.stopPropagation(e.originalEvent);showDetail(x.id);}).addTo(leafletGroup);}
      for(const x of mappedItems(c,eraSelection(),map.getZoom(),natureSelection(),preqinSelection(),includeFeudalKings(),onlyVisitableChambers())) {const members=visitMembers(c,x),count=members.filter(item=>config.isVisited?.(item)).length,done=count===members.length;L.marker([x.coordinates.lat,x.coordinates.lng],{zIndexOffset:1000,icon:L.divIcon({className:'imperial-tomb-marker',html:root.HistoricalPeriods.visitedSvg(markerSvg(dynastyTheme(x).color),count>0),iconSize:[18,18],iconAnchor:[9,9]})}).bindTooltip(x.correspondingChinesePeriod?hoverContent(x,(done?'✓ ':'')+nameFor(x)):esc((done?'✓ ':'')+nameFor(x))).bindPopup(config.popupHtml(popupContent(c,x,item=>config.isVisited?.(item))),{closeButton:false,maxWidth:300}).on('click',e=>{L.DomEvent.stopPropagation(e.originalEvent);showDetail(x.id);}).addTo(leafletGroup);}
      legend();if(!bound.has(map)){bound.add(map);map.on('zoomend',()=>{if(enabled())leaflet(map);});}
    }catch(e){if(token===revision){legend();console.warn('Imperial tomb overlay',e);}}
  }
  function init(options){config=options;
    const container=document.getElementById('mapOverlayLegends');if(container){const el=document.createElement('section');el.id='imperialTombsLegend';el.className='great-wall-legend imperial-tombs-legend';el.hidden=true;container.appendChild(el);
      el.addEventListener('change',e=>{
        const t=e.target;
        if(t.hasAttribute("data-tomb-visible")){config.state().mapOverlays.imperialTombs=t.checked;config.state().mapOverlays.imperialTombsEras=Object.fromEntries(root.HistoricalPeriods.keys.map(k=>[k,t.checked]));config.state().mapOverlays.imperialTombsEra="";revision++;removePopups();config.save();config.render();return;}
        if(t.hasAttribute('data-tomb-chambers')){config.state().mapOverlays.imperialTombsOnlyVisitableChambers=t.checked;revision++;removePopups();config.save();config.render();return;}
        if(t.hasAttribute('data-tomb-feudal')){config.state().mapOverlays.imperialTombsIncludeFeudalKings=t.checked;revision++;removePopups();config.save();config.render();return;}
        const kind=t.dataset.tombAll||(t.hasAttribute('data-tomb-era')?'era':t.hasAttribute('data-tomb-preqin')?'preqin':t.hasAttribute('data-tomb-nature')?'nature':'');if(!kind)return;
        if(t.checked)config.state().mapOverlays.imperialTombs=true;
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
    const body=members.length===1&&members[0].id===x.id?`<div class="tomb-popup-single">${action(x)}</div>`:`<div class="tomb-popup-list">${members.sort(compareChecklistItems).map(item=>`<div class="tomb-popup-row"><span>${esc(nameFor(item))}</span>${action(item)}</div>`).join('')}</div>`;
    return `<div class="tomb-popup"><strong>${esc(nameFor(x))}</strong><p class="tomb-popup-location">${esc(en()?x.enAdmin||x.admin:x.admin)}</p>${x.correspondingChinesePeriod?'<p>'+(en()?'Corresponding Chinese period':'中国对应朝代')+'：'+esc(chinesePeriodLabel(x))+'</p>':''}${body}${x.id==='qin-first'?'<p>世界遗产 · 秦始皇陵及兵马俑</p><button type="button" class="popup-action" data-checklist-map="worldHeritage" data-item="秦始皇陵及兵马俑">世界遗产打卡</button>':''}</div>`;
  }
  function geometryPopup(p,x){return '<div class="tomb-popup"><strong>'+esc(p.name)+'</strong><p>'+esc(p.status)+'</p><p>'+esc(p.note)+'</p><p><a href="'+esc(p.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+(en()?'Geometry sources':'范围依据')+'</a></p>'+(p.tombOutline?popupContent(data,x,item=>config.isVisited?.(item)):'')+'</div>';}
  function showPopup(map,x,at,geometry) {
    removePopups();
    const content=geometry?geometryPopup(geometry,x):popupContent(data,x,item=>config.isVisited?.(item));
    const html=config.popupHtml?config.popupHtml(content):content;
    pinned=new maplibregl.Popup({offset:12,closeButton:false,maxWidth:'310px',className:'tomb-click-popup'}).setLngLat(at||[x.coordinates.lng,x.coordinates.lat]).setHTML(html).addTo(map);
  }
  function handleClick(map,e) {
    if(!enabled()||!map.getLayer('imperial-tomb-point'))return false;
    const f=map.queryRenderedFeatures([[e.point.x-7,e.point.y-7],[e.point.x+7,e.point.y+7]],{layers:['imperial-tomb-point',...(Geometry?.layerIds||[]).filter(id=>map.getLayer(id))]})[0];
    if(!f)return false;if(e.originalEvent)e.originalEvent._travelMapHandled=true;const x=data?.items.find(item=>item.id===f.properties.id);if(!x)return false;showDetail(x.id);showPopup(map,x,f.properties.tombGeometry?e.lngLat:null,f.properties.tombGeometry?f.properties:null);return true;
  }
  root.ImperialTombs={init,openDetail:async id=>{await load();showDetail(id);},legend,sync,leaflet,mappedItems,geojson,handleClick,compareChecklistItems,dynastyTheme,markerSvg,markerImage,dynastyColors,isFeudalKing,isItemVisible,catalogItems:()=>data?.items||[]};
  if(typeof module!=='undefined')module.exports={mappedItems,geojson,compareChecklistItems,dynastyTheme,markerSvg,markerImage,dynastyColors,popupContent,isFeudalKing,hasVisitableChamber,nameFor,chinesePeriodLabel,hoverContent};
})(globalThis);
