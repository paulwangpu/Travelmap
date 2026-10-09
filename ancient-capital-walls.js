globalThis.AncientCapitalWalls=(()=>{
 let context,data,pending,earlyData,earlyPending,researchData,researchPending,detailData,detailPending,revision=0,leafletGroup;
 async function loadResearch(){if(researchData)return;researchPending||=fetch("data/ancient-capital-research-extents.geojson?v=58").then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(d=>{if(d.type!=="FeatureCollection")throw Error("Invalid research geometry");researchData=d.features.filter(f=>f.properties.research===true).map(f=>({...f,properties:{...f.properties,color:f.properties.waterFeature?"#277caa":f.properties.fixedLandmark?"#111111":HistoricalPeriods.colors[f.properties.period]}}));}).catch(e=>console.warn("Historical research extents",e)).finally(()=>researchPending=null);await researchPending;}
 const tangUrl="https://services6.arcgis.com/m26ewK0eTXpBl4kM/arcgis/rest/services/"+encodeURIComponent("02唐長安數位線條")+"/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson";
 function tangWallGeometry(f){
  // This specific eight-vertex U-shaped strip is sub-metre wide, not a palace footprint.
  if(f.properties.Name!=='含光殿線'||f.geometry?.type!=='Polygon')return f.geometry;
  const ring=f.geometry.coordinates[0];
  if(f.geometry.coordinates.length!==1||ring.length!==9)return f.geometry;
  return {type:'LineString',coordinates:[[0,7],[1,6],[2,5],[3,4]].map(([a,b])=>[(ring[a][0]+ring[b][0])/2,(ring[a][1]+ring[b][1])/2])};
 }
 async function loadEarly(){if(earlyData)return;earlyPending||=fetch(tangUrl).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(d=>{if(d.type!=="FeatureCollection")throw Error("Invalid Tang geometry");earlyData=d.features.filter(f=>f.geometry&&/^fx-[123]/.test(f.properties.layer)).map(f=>({...f,geometry:tangWallGeometry(f),properties:{early:true,city:"唐长安",sourceName:f.properties.Name,color:HistoricalPeriods.colors["隋唐"]}}));}).catch(e=>console.warn("Tang Chang’an online walls",e)).finally(()=>earlyPending=null);await earlyPending;}

 const detailServices=[['03城門名、宮苑名','城门与宫苑'],['04坊線','坊界'],['05坊里名','坊里名称'],['10長安相關河川及池','河流与池'],['09唐長安研究相關地名(點)','研究参照点'],['09唐長安研究相關地名(線)','研究参照线'],['09唐長安研究相關地名(面)','研究参照面']];
 const simplified=t=>globalThis.toSimplifiedChineseText?toSimplifiedChineseText(t):t;
 async function loadDetails(){if(detailData)return;detailPending||=(async()=>{const results=await Promise.allSettled(detailServices.map(async([name,kind])=>{const url='https://services6.arcgis.com/m26ewK0eTXpBl4kM/arcgis/rest/services/'+encodeURIComponent(name)+'/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson';const response=await fetch(url);if(!response.ok)throw Error(response.status);const d=await response.json();if(d.type!=='FeatureCollection'||d.exceededTransferLimit)throw Error('Incomplete Tang details');return d.features.filter(f=>f.geometry&&!(kind==='研究参照线'&&String(f.properties.Name||'').trim()==='隴海鐵路西安站以西')).map(f=>{const note=String(f.properties.descriptio||'').trim(),raw=String(f.properties.Name||'');const label=kind==='坊里名称'?(note||raw.replace(/^[A-Za-z]\d+-\d+/,'')).replace('脩','修'):raw;return {...f,properties:{early:true,tangDetail:true,city:'唐长安',sourceName:simplified(label),originalName:raw,note:simplified(note),detailKind:kind,color:kind==='河流与池'?'#277caa':kind==='研究参照点'&&!/推算|推測|推测|假想/.test(raw)&&/宅|塔|寺|陵|遺址|遗址|公園|公园|鐘樓|钟楼|橋|桥|廣場|广场|景區|景区|^今興慶宮|^今兴庆宫/.test(raw)?'#111111':HistoricalPeriods.colors['隋唐']}};});}));detailData=[];results.forEach((r,i)=>{if(r.status==='fulfilled')detailData.push(...r.value);else console.warn(detailServices[i][0],r.reason);});const names=new Map(detailData.filter(f=>f.properties.detailKind==='坊里名称').map(f=>[f.properties.originalName.match(/^[A-Za-z]\d+-\d+/)?.[0],f.properties.sourceName]));for(const f of detailData)if(f.properties.detailKind==='坊界'){const code=f.properties.originalName.match(/^[A-Za-z]\d+-\d+/)?.[0];f.properties.sourceName=names.get(code)||('坊界 · '+f.properties.originalName);}})().finally(()=>detailPending=null);await detailPending;}
 const wallLayers=['ancient-capital-wall-fill','ancient-capital-wall-line','ancient-capital-wall-detail-fill','ancient-capital-wall-detail-line','ancient-capital-wall-detail-points','ancient-capital-wall-detail-labels','ancient-capital-wall-city-labels','ancient-capital-wall-research-labels','ancient-capital-wall-inferred-line','ancient-capital-wall-ward-labels'];
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const years=[1400,1537,1648,1708,1787,1866];
 const year=()=>years.includes(Number(context.state().mapOverlays.ancientCapitalWallYear))?Number(context.state().mapOverlays.ancientCapitalWallYear):1866;
 const labelPositions=new WeakMap();
 function labelPosition(geometry){
  if(labelPositions.has(geometry))return labelPositions.get(geometry);
  const polygons=geometry.type==='MultiPolygon'?geometry.coordinates:geometry.type==='Polygon'?[geometry.coordinates]:null;
  let position;
  if(polygons){
   const area=ring=>Math.abs(ring.reduce((sum,p,i)=>{const q=ring[(i+1)%ring.length];return sum+p[0]*q[1]-q[0]*p[1];},0));
   const rings=polygons.reduce((best,p)=>area(p[0])>area(best[0])?p:best,polygons[0]);
   const ys=rings[0].map(p=>p[1]),lo=Math.min(...ys),hi=Math.max(...ys);let best=-1;
   // Choose an interior horizontal span; paired intersections also exclude holes.
   for(let row=1;row<20;row++){const y=lo+(hi-lo)*row/20,xs=[];for(const ring of rings)for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];if((a[1]>y)!==(b[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2){const score=(xs[i+1]-xs[i])*Math.sin(Math.PI*row/20);if(score>best){best=score;position=[(xs[i]+xs[i+1])/2,y];}}}
   position||=rings[0][0];
  }else{const points=geometry.type==='Point'?[geometry.coordinates]:geometry.coordinates;const bounds=points.reduce((a,p)=>[Math.min(a[0],p[0]),Math.min(a[1],p[1]),Math.max(a[2],p[0]),Math.max(a[3],p[1])],[Infinity,Infinity,-Infinity,-Infinity]);position=[(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2];}
  labelPositions.set(geometry,position);return position;
 }
 const boundaryPositions=new WeakMap();
 function boundaryLabelPosition(geometry){
  if(boundaryPositions.has(geometry))return boundaryPositions.get(geometry);
  const polygons=geometry.type==='MultiPolygon'?geometry.coordinates:geometry.type==='Polygon'?[geometry.coordinates]:null;
  if(!polygons)return labelPosition(geometry);
  const area=r=>Math.abs(r.reduce((n,a,i)=>{const b=r[(i+1)%r.length];return n+a[0]*b[1]-b[0]*a[1];},0));
  const rings=polygons.reduce((a,b)=>area(a[0])>=area(b[0])?a:b),ring=rings[0];
  const inside=(p,r)=>{let hit=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
  const lo=Math.min(...ring.map(p=>p[1])),hi=Math.max(...ring.map(p=>p[1]));
  const scale=Math.cos((lo+hi)*Math.PI/360),xmin=Math.min(...ring.map(p=>p[0])),xmax=Math.max(...ring.map(p=>p[0])),center=(xmin+xmax)/2;
  const runs=[];let run=[];
  // Centre on a continuous straight-ish wall run, not one arbitrary digitised edge.
  for(let i=0;i<ring.length-1;i++){
   const a=ring[i],b=ring[i+1],dx=(b[0]-a[0])*scale,dy=b[1]-a[1],length=Math.hypot(dx,dy),y=(a[1]+b[1])/2;
   const inward=[(a[0]+b[0])/2,y-Math.max((hi-lo)*.0001,1e-9)];
   const good=length>0&&y>=lo+(hi-lo)*.55&&Math.abs(dy)<=Math.abs(dx)*.45&&inside(inward,ring)&&!rings.slice(1).some(h=>inside(inward,h));
   if(good){if(run.length&&Math.sign(dx)!==Math.sign(run.at(-1).b[0]-run.at(-1).a[0])){runs.push(run);run=[];}run.push({a,b,length});}
   else if(run.length){runs.push(run);run=[];}
  }
  if(run.length)runs.push(run);
  if(runs.length>1&&runs[0][0].a===ring[0]&&runs.at(-1).at(-1).b===ring.at(-1))runs[0]=runs.pop().concat(runs[0]);
  let best=-1,point;
  for(const edges of runs){const length=edges.reduce((n,e)=>n+e.length,0);let remaining=length/2,p;
   for(const e of edges){if(remaining<=e.length){const t=remaining/e.length;p=[e.a[0]+(e.b[0]-e.a[0])*t,e.a[1]+(e.b[1]-e.a[1])*t];break;}remaining-=e.length;}
   const centered=1-Math.min(1,Math.abs(p[0]-center)/(Math.max(xmax-xmin,1e-9)/2));
   const score=length*(.7+.3*centered);if(score>best){best=score;point=p;}
  }
  // Irregular outlines with no suitable run: use the upper wall above the central interior anchor.
  if(!point){const x=labelPosition(geometry)[0],ys=[];for(let i=0;i<ring.length-1;i++){const a=ring[i],b=ring[i+1];if((a[0]>x)!==(b[0]>x))ys.push(a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0]));}point=ys.length?[x,Math.max(...ys)]:ring[0];}
  boundaryPositions.set(geometry,point);return point;
 }
 function wallLabelOnBoundary(f){
  if(f.properties.labelInsideBoundary)return true;
  if(!/Polygon$/.test(f.geometry.type))return false;
  const p=f.properties;
  if(!p.research&&!p.early)return true;
  const name=p.sourceName||p.label||'';
  return !/宫|宮|寺|庙|殿|建筑|基址|公园|展示|埋藏|保护/.test(name)&&/城|郭|城垣/.test(name);
 }
 function labelFeature(f){const boundary=wallLabelOnBoundary(f);return {type:'Feature',properties:{...f.properties,boundaryLabel:boundary},geometry:{type:'Point',coordinates:f.properties.labelCoordinates||(boundary?boundaryLabelPosition(f.geometry):labelPosition(f.geometry))}};}
 const periodControls={'夏商':'ancientCapitalShangWalls','周':'ancientCapitalZhouWalls','秦汉':'ancientCapitalQinHanWalls','魏晋南北朝':'ancientCapitalHanWeiWalls','隋唐':'ancientCapitalTangWalls','五代十国':'ancientCapitalSouthernTangWalls','宋辽金西夏':'ancientCapitalLiaoJinWalls','元':'ancientCapitalYuanWalls','明':'ancientCapitalMingQingWalls','清':'ancientCapitalMingQingWalls'};
 function selectedResearch(){const o=context.state().mapOverlays;return (researchData||[]).flatMap(f=>{
  const p=f.properties,periods=p.periods||[p.period],mingQingPair=periods.includes('明')&&periods.includes('清');
  const period=periods.filter(k=>!mingQingPair||!['明','清'].includes(k)||k===(year()<1644?'明':'清')).find(k=>periodControls[k]&&o[periodControls[k]]!==false);
  if(!period)return [];
  // Shared archaeological/display geometry is drawn once, using an enabled period.
  const note=p.periodNotes?.[period];
  return [{...f,properties:{...p,period,color:p.waterFeature?'#277caa':p.fixedLandmark?'#111111':HistoricalPeriods.colors[period],label:p.periodNames?.[period]||p.label,note:note?p.note+' '+note:p.note}}];
 });}
 function collection(){const y=year(),period=y<1644?'明':'清';return {type:'FeatureCollection',features:data.features.filter(f=>context.state().mapOverlays.ancientCapitalMingQingWalls!==false&&f.properties.begin<=y&&f.properties.end>=y).map(f=>({...f,properties:{...f.properties,color:HistoricalPeriods.colors[period],label:f.properties.city+'（明清）',labelCoordinates:boundaryLabelPosition(f.geometry)}})).concat(context.state().mapOverlays.ancientCapitalTangWalls!==false?[...(earlyData||[]),...(detailData||[])]:[]).concat(selectedResearch())};}
 const placeTypes={"Capital":"都城","Fu":"府城","County":"县城","Provincial Capital":"省会","Zhou(shuzhou)":"属州","Zhou(zhili)":"直隶州","Suo":"所城","Wei":"卫城","Manchus Garrisoned":"满洲驻防城","Ting":"厅城"};
 const references={"BIAM":"《古今图书集成》城池资料汇编","LC":"地方志城池资料汇编","ACM":"中国行政区划通史·明代卷","ACQ":"中国行政区划通史·清代卷","CTW":"台湾古城","URQ":"《大清一统志》城池资料汇编"};
 function html(p){if(p.capitalSiteKey){const copy={...p};delete copy.capitalSiteKey;return html(copy)+'<p><button type="button" class="popup-action" data-capital-related-site="'+escape(p.capitalSiteName)+'">查看'+escape(p.capitalSiteName)+'古都记录</button></p>';} if(p.osm)return '<b>'+escape(p.city)+' · '+escape(p.sourceName)+'</b><p>'+escape(p.status)+'</p><p>'+escape(p.note)+'</p><small>© OpenStreetMap contributors · ODbL</small><br><a href="'+escape(p.sourceUrl)+'" target="_blank" rel="noopener">原始几何与记录 ↗</a><br><a href="'+escape(p.referenceUrl)+'" target="_blank" rel="noopener">遗址背景资料 ↗</a>';if(p.research)return '<b>'+escape(p.city)+' · '+escape(p.sourceName)+'</b><p>'+escape(p.status)+'</p><p>'+escape(p.note)+'</p><a href="'+escape(p.sourceUrl)+'" target="_blank" rel="noopener">'+escape(p.sourceTitle||'范围来源资料')+' ↗</a>'+(p.referenceUrl?'<br><a href="'+escape(p.referenceUrl)+'" target="_blank" rel="noopener">补充资料 ↗</a>':'');if(p.tangDetail)return '<b>唐长安 · '+escape(p.sourceName)+'</b><p>'+escape(p.detailKind)+'</p>'+(p.note?'<p>'+escape(p.note)+'</p>':'')+'<small>研究平台原始图层；研究参照地点可能含现代地标、复原方案，并非均为唐代确址。</small><br><a href="https://sinica.maps.arcgis.com/apps/webappviewer/index.html?id=61abf0934c964550bebc1278536a6070" target="_blank" rel="noopener">原始研究地图 ↗</a>';if(p.early)return '<b>唐长安 · '+escape(p.sourceName)+'</b><p>唐长安城数位新图：已配准的城墙、宫城构件。不是完整外郭面，也不表示唐代各阶段城界完全相同。</p><small>简锦松、廖泫铭等（2023）· 中研院 GIS 公开在线图层</small><br><a href="https://sinica.maps.arcgis.com/apps/webappviewer/index.html?id=61abf0934c964550bebc1278536a6070" target="_blank" rel="noopener">研究地图与图层 ↗</a>';return '<b>'+escape(p.city==='凤阳'?'凤阳府城范围（CCWAD）':p.city)+' · '+(context.language()==='en'?'Ming/Qing city wall extent':'明清城墙范围')+'</b><br>'+year()+' 年<br>'+p.begin+'—'+p.end+' 年范围记录<br>名称：'+escape(/[\u3400-\u9fff]/u.test(p.city)?p.city:p.sourceName)+' · '+escape(placeTypes[p.placeType]||p.placeType)+'<br>可靠性：'+escape(p.reliability)+' · 参考资料：'+escape(references[p.reference]||p.reference)+'<br>'+p.areaKm2.toFixed(2)+' km²<br>'+(p.city==='凤阳'?'<p>此范围对应凤阳府城区域，不是完整明中都城界；古都点表示明中都，不能据此要求它落在该范围内。</p><a href="https://wlj.nanjing.gov.cn/ztzl/mcq/syyj/202309/t20230906_4003763.html" target="_blank" rel="noopener">明中都与凤阳府城沿革 ↗</a><br>':'')+'<small>CCWAD · Xue et al. (2021) · CC BY 4.0<br>这是明清时期重建城界，不代表其他朝代城址，也不是现代行政边界。</small><br><a href="https://doi.org/10.6084/m9.figshare.14112968.v3" target="_blank" rel="noopener">数据来源 ↗</a>';}
 async function sync(map,group){const token=++revision,o=context.state().mapOverlays;const enabled=Boolean(o.chinaAncientCapitals&&o.ancientCapitalWalls);
  leafletGroup?.remove();leafletGroup=null;
  if(!enabled){if(map)for(const id of wallLayers)if(map.getLayer(id))map.setLayoutProperty(id,'visibility','none');return;}
  try{if(!data){pending||=fetch('data/ancient-capital-walls.geojson?v=6').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(d=>{if(d.type!=='FeatureCollection')throw Error('Invalid wall data');return data=d}).finally(()=>pending=null);await pending;}if(o.ancientCapitalTangWalls!==false)await Promise.all([loadEarly(),loadDetails()]);await loadResearch();if(token!==revision)return;
   const d=collection();if(map){const source='ancient-capital-walls';if(map.getSource(source))map.getSource(source).setData(d);else map.addSource(source,{type:'geojson',data:d,attribution:'CCWAD · Xue et al. (2021) · CC BY 4.0 | 唐长安城数位新图 · 简锦松、廖泫铭等 (2023) | © OpenStreetMap contributors · ODbL'});
    const before=map.getStyle().layers.find(l=>l.type==='symbol')?.id;
    if(!map.getLayer('ancient-capital-wall-fill'))map.addLayer({id:'ancient-capital-wall-fill',type:'fill',source,minzoom:7,filter:['all',['!', ['has','tangDetail']],['==',['geometry-type'],'Polygon']],paint:{'fill-color':['get','color'],'fill-opacity':.15}},before);
    if(!map.getLayer('ancient-capital-wall-line'))map.addLayer({id:'ancient-capital-wall-line',type:'line',source,minzoom:7,filter:['all',['!', ['has','tangDetail']],['!=',['get','inferredBoundary'],true]],paint:{'line-color':['get','color'],'line-width':1.6}},before);
    if(!map.getLayer(wallLayers[8]))map.addLayer({id:wallLayers[8],type:'line',source,minzoom:7,filter:['==',['get','inferredBoundary'],true],paint:{'line-color':['get','color'],'line-width':1.6,'line-dasharray':[4,3]}},before);
    const detail=['has','tangDetail'];
    if(!map.getLayer(wallLayers[2]))map.addLayer({id:wallLayers[2],type:'fill',source,minzoom:12,filter:['all',detail,['==',['geometry-type'],'Polygon']],paint:{'fill-color':['get','color'],'fill-opacity':.06}},before);
    if(!map.getLayer(wallLayers[3]))map.addLayer({id:wallLayers[3],type:'line',source,minzoom:12,filter:detail,paint:{'line-color':['get','color'],'line-width':1}},before);
    if(!map.getLayer(wallLayers[4]))map.addLayer({id:wallLayers[4],type:'circle',source,minzoom:12,filter:['all',detail,['==',['geometry-type'],'Point'],['==',['get','color'],'#111111']],paint:{'circle-radius':3,'circle-color':['get','color'],'circle-stroke-color':'white','circle-stroke-width':1}},before);
    if(!map.getLayer(wallLayers[5]))map.addLayer({id:wallLayers[5],type:'symbol',source,minzoom:12,filter:['all',detail,['==',['geometry-type'],'Point'],['!=',['get','detailKind'],'坊里名称']],layout:{'text-field':['get','sourceName'],'text-font':['Open Sans Regular','Arial Unicode MS Regular'],'text-size':12,'text-variable-anchor':['top','bottom','left','right'],'text-radial-offset':.5,'text-max-width':12,'text-padding':2},paint:{'text-color':['get','color'],'text-halo-color':'white','text-halo-width':1.4}},before);
    const wardSource=source+'-ward-labels',wardAreas=new Map(d.features.filter(f=>f.properties.detailKind==='坊界').map(f=>[f.properties.originalName.match(/^[A-Za-z]\d+-\d+/)?.[0],f.geometry]));
    const wardLabels={type:'FeatureCollection',features:d.features.filter(f=>f.properties.detailKind==='坊里名称').map(f=>{const area=wardAreas.get(f.properties.originalName.match(/^[A-Za-z]\d+-\d+/)?.[0]);return {...f,geometry:area?{type:'Point',coordinates:labelPosition(area)}:f.geometry};})};
    if(map.getSource(wardSource))map.getSource(wardSource).setData(wardLabels);else map.addSource(wardSource,{type:'geojson',data:wardLabels});
    if(!map.getLayer(wallLayers[9]))map.addLayer({id:wallLayers[9],type:'symbol',source:wardSource,minzoom:12,layout:{'text-field':['get','sourceName'],'text-font':['Open Sans Regular','Arial Unicode MS Regular'],'text-size':12,'text-anchor':'center','text-justify':'center','text-offset':[0,0],'text-max-width':0,'text-allow-overlap':true,'text-ignore-placement':true,'text-padding':2},paint:{'text-color':['get','color'],'text-halo-color':'white','text-halo-width':1.4}},before);
    const labelData={type:'FeatureCollection',features:d.features.filter(f=>f.properties.label&&f.properties.family!=='suitangluo').map(labelFeature)};
    const labelSource=source+'-labels';if(map.getSource(labelSource))map.getSource(labelSource).setData(labelData);else map.addSource(labelSource,{type:'geojson',data:labelData});
    const luoyangLabels=source+'-luoyang-labels',luoyangData={type:'FeatureCollection',features:d.features.filter(f=>f.properties.label&&f.properties.family==='suitangluo').map(labelFeature)};
    if(map.getSource(luoyangLabels))map.getSource(luoyangLabels).setData(luoyangData);else map.addSource(luoyangLabels,{type:'geojson',data:luoyangData});
    if(!map.getLayer(wallLayers[6]))map.addLayer({id:wallLayers[6],type:'symbol',source:luoyangLabels,minzoom:12,layout:{'text-field':['get','label'],'text-justify':'center','text-font':['Open Sans Regular','Arial Unicode MS Regular'],'text-size':12,'text-max-width':12,'text-padding':3,'text-anchor':['case',['==',['get','labelSouthWall'],true],'bottom',['==',['get','boundaryLabel'],true],'top','center'],'text-offset':['case',['==',['get','labelSouthWall'],true],['literal',[0,-.4]],['==',['get','boundaryLabel'],true],['literal',[0,.4]],['literal',[0,0]]]},paint:{'text-color':['get','color'],'text-halo-color':'white','text-halo-width':1.4}},before);
    if(!map.getLayer(wallLayers[7]))map.addLayer({id:wallLayers[7],type:'symbol',source:labelSource,minzoom:11,layout:{'text-field':['get','label'],'text-justify':'center','text-font':['Open Sans Regular','Arial Unicode MS Regular'],'text-size':12,'text-max-width':10,'text-padding':5,'text-anchor':['case',['==',['get','labelSouthWall'],true],'bottom',['==',['get','boundaryLabel'],true],'top','center'],'text-offset':['case',['==',['get','labelSouthWall'],true],['literal',[0,-.4]],['==',['get','boundaryLabel'],true],['literal',[0,.4]],['literal',[0,0]]]},paint:{'text-color':['get','color'],'text-halo-color':'white','text-halo-width':1.4}},before);
    for(const id of wallLayers)map.setLayoutProperty(id,'visibility','visible');context.front?.();
   }else if(group){leafletGroup=L.geoJSON(d,{pointToLayer:(f,latlng)=>L.circleMarker(latlng,{radius:f.properties.color==='#111111'?3:0,color:'white',weight:f.properties.color==='#111111'?1:0,fillColor:f.properties.color,fillOpacity:f.properties.color==='#111111'?1:0}),style:f=>({color:f.properties.color,weight:f.properties.tangDetail?1:1.6,dashArray:f.properties.inferredBoundary?'6 5':undefined,fill:/Polygon$/.test(f.geometry.type),fillOpacity:f.properties.tangDetail?.06:.15}),onEachFeature:(f,l)=>{l.bindPopup(()=>html(f.properties));if(f.properties.tangDetail||f.properties.label)l.bindTooltip('<span style="color:'+escape(f.properties.color)+'">'+escape(f.properties.label||f.properties.sourceName)+'</span>',{permanent:Boolean(f.properties.label)||f.geometry.type==='Point',direction:f.properties.detailKind==='坊里名称'?'center':f.properties.labelSouthWall?'top':wallLabelOnBoundary(f)?'bottom':'auto'});if(f.properties.label&&wallLabelOnBoundary(f)){const p=f.properties.labelCoordinates||boundaryLabelPosition(f.geometry);l.openTooltip([p[1],p[0]]);}}}).addTo(group);}
  }catch(error){console.warn('Ancient capital walls',error);context.error?.();}
 }
 function click(map,event){
  if(!context.state().mapOverlays.chinaAncientCapitals||!context.state().mapOverlays.ancientCapitalWalls)return false;
  const p=event.point,padding=6;
  // Thin wall polygons need a screen-space tolerance; test outlines before enclosing fills.
  const detailLayers=wallLayers.slice(3).filter(id=>map.getLayer(id));
  const detail=detailLayers.length?map.queryRenderedFeatures([[p.x-padding,p.y-padding],[p.x+padding,p.y+padding]],{layers:detailLayers})[0]:null;
  const outline=map.getLayer('ancient-capital-wall-line')?map.queryRenderedFeatures([[p.x-padding,p.y-padding],[p.x+padding,p.y+padding]],{layers:['ancient-capital-wall-line']})[0]:null;
  const f=detail||outline||(map.getLayer('ancient-capital-wall-fill')?map.queryRenderedFeatures(p,{layers:['ancient-capital-wall-fill']})[0]:null);
  if(!f)return false;
  new maplibregl.Popup().setLngLat(event.lngLat).setHTML(html(f.properties)).addTo(map);return true;
 }
 return {init:c=>context=c,sync,click,collection,years,boundaryLabelPosition};
})();
