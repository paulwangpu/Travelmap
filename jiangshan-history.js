/* Independent adapter for the schematic administrative snapshots; see data/jiangshan/NOTICE.md. */
globalThis.JiangshanHistory=(()=>{
 let context,catalog,pending;
 const opts=()=>context.state().mapOverlays,en=()=>context.language()==='en';
 const year=()=>{const n=Number(opts().jiangshanYear??1820);return Number.isInteger(n)&&n>=-403&&n<=1948&&n!==0?n:1820;};
 const level=()=>opts().jiangshanLevel==='province'?'province':'prefecture';
 const date=n=>`${n}${en()?'':'年'}`,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const phase=()=>catalog?.periods.find(p=>p.from<=year()&&p.to>=year());
 async function load(){if(!catalog){pending??=context.fetch('data/jiangshan/catalog.json?v=2').then(d=>catalog=d).finally(()=>pending=null);await pending;}return catalog;}
 function scheme(n=year()){
  if(n<=-222)return {upper:'诸侯国／封国',lower:'郡（局部）',upperSource:'polity',lowerAvailable:true,note:'封国为政治实体，不等同于后世省级政区；郡界仅有局部数据。'};
  if(n<=-203)return {upper:'上层郡级参考（原图）',lower:'下层郡级参考（原图）',upperSource:'province',lowerAvailable:true,note:'保留原图两层；两份图层均含郡级参考，不将二级标作县界。'};
  if(n<-106)return {upper:'州部参考（原图）',lower:'郡／国',upperSource:'province',lowerAvailable:true,note:'保留原图州部参考层和郡国层；早期州部界是原图沿用参考，并非当年已设置的行政区。'};
  if(n<=189)return {upper:'州部／刺史部（监察区）',lower:'郡／国',upperSource:'province',lowerAvailable:true,note:'州部起初主要为监察区；郡、国之下另有县，本源未提供完整县界。'};
  if(n<=580)return {upper:'州',lower:'郡／国',upperSource:'province',lowerAvailable:true,note:'汉末州逐步行政化；魏晋南北朝主要为州—郡（国）—县，兼有侨州、侨郡。'};
  if(n<=617)return {upper:'上层参考分区（原图）',lower:'州／郡（原图）',upperSource:'province',lowerAvailable:true,note:'保留原图两层参考分区；不将下层州郡界改标为县界。'};
  if(n<627)return {upper:'道级参考分区（原图）',lower:'州／府（原图）',upperSource:'province',lowerAvailable:true,note:'保留原图上、下两层及独立名称查询；道级分区为原图参考，不能视为618年当年的完整独立考订。'};
  if(n<=906)return {upper:'道（监察／军政区）',lower:'州／府／郡',upperSource:'province',lowerAvailable:true,note:'唐初道主要为监察区，后期军政职能增强；州与郡名称随时期变化，下另辖县。'};
  if(n<=959)return {upper:'道／军政区',lower:'府／州／军',upperSource:'province',lowerAvailable:true,note:'五代十国制度因政权而异；不将原图的道、军政区一律视为同质的一级行政区。'};
  if(n<=1278)return {upper:'路／道（各政权）',lower:'府／州／军／监',upperSource:'province',lowerAvailable:true,note:'宋的路具有监察、财政等职能；辽、金制度不同，按原图政权归属和类型显示。'};
  if(n<=1367)return {upper:'中书省／行省／宣政院',lower:'路／府／州',upperSource:'province',lowerAvailable:true,note:'元代实际层级可多于两级；这里展示上级区域和路、府、州等下级政区，非固定两级制。'};
  if(n<=1643)return {upper:'两京直隶／布政使司',lower:'府／州／卫所等',upperSource:'province',lowerAvailable:true,note:'明代民政与都司卫所等军政系统并存；原图包含部分军政、土司单位。'};
  if(n<=1911)return {upper:'省／将军等辖区',lower:'府／直隶州／直隶厅',upperSource:'province',lowerAvailable:true,note:'清代各类辖区制度不同；府、直隶州厅以下另有州厅县，不强行压成严格两级。'};
  return {upper:'省／地方',lower:n<=1913?'府／州／厅（过渡）':n<=1927?'道等下级政区（原图）':'下级政区（原图参考）',upperSource:'province',lowerAvailable:true,note:'民国先废府，后设道、废道；本源部分沿用旧府州界，不将其改名为完整当年县界。'};
 }
 function resolve(lvl,suffix){if(suffix)return null;const p=phase(),s=scheme(),sourceLevel=lvl==='province'?s.upperSource:lvl;if(lvl==='prefecture'&&!s.lowerAvailable)return null;return p?{id:'jiangshan-'+p.snapshot+'-'+lvl+'-'+sourceLevel,file:p.file,kind:'area',level:lvl,sourceLevel,name:en()?p.dynastyEn:p.dynasty,source:catalog.source,jiangshan:true,from:p.from,to:p.to,overview:p.overview}:null;}
 const representativeYears=[-403,-221,-121,140,262,300,382,497,609,742,907,1102,1200,1290,1415,1582,1662,1820,1911,1937,1948];
 function periodOptions(){return representativeYears.map(n=>{const p=catalog?.periods.find(p=>p.from<=n&&p.to>=n);return `<option value="${n}" ${year()===n?'selected':''}>${esc(en()?p?.dynastyEn:p?.dynasty)} · ${date(n)}</option>`;}).join('');}
 const boxes=new WeakMap();
 function contains(geometry,point){
  let box=boxes.get(geometry);if(!box){box=[Infinity,Infinity,-Infinity,-Infinity];const walk=c=>{if(typeof c[0]==='number'){box[0]=Math.min(box[0],c[0]);box[1]=Math.min(box[1],c[1]);box[2]=Math.max(box[2],c[0]);box[3]=Math.max(box[3],c[1]);}else c.forEach(walk);};walk(geometry.coordinates);boxes.set(geometry,box);}const [x,y]=point;if(x<box[0]||x>box[2]||y<box[1]||y>box[3])return false;
  const ring=r=>{let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [a,b]=r[i],[c,d]=r[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside;};
  return (geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[]).some(p=>ring(p[0])&&!p.slice(1).some(ring));
 }
 function resolveHover(data,point,currentLevel,zoom=6){
  const find=fs=>(fs||[]).find(f=>contains(f.geometry,point));
  const polity=()=>find(data.backgroundAreas?.features.filter(f=>f.properties.level==='polity').slice().reverse())||find(data.borders?.features.filter(f=>f.properties.polityRole!=='neighbor').slice().reverse());
  const complete=p=>{const country=p.level==='polity'?p:polity()?.properties;const unique=xs=>[...new Set(xs.filter(Boolean))];return {...p,hoverPathZh:unique([country?.nameZh,p.level==='prefecture'?p.parentZh:null,p.nameZh]).join('－'),hoverPathEn:unique([country?.nameRoman,p.level==='prefecture'?p.parentEn:null,p.nameRoman||p.nameZh]).join(' – ')};};
  let f=find(data.hoverAreas?.features);if(f)return complete(f.properties);
  f=find(data.areas?.features);if(f)return complete(f.properties);
  if(currentLevel==='prefecture'){f=find(data.upperAreas?.features);if(f)return complete({...f.properties,hoverReason:'fallback'});}
  f=polity();return f?complete({...f.properties,hoverReason:'fallback'}):null;
 }
 function hover(p){return `<strong>${esc((en()?p.hoverPathEn:p.hoverPathZh)||p.displayName||(en()?p.nameRoman:p.nameZh))}</strong>${p.level==='prefecture'&&!p.hoverPathZh?`<div>${en()?'Upper division':'一级政区'}：${esc(en()?p.parentEn||'Unresolved':p.parentZh||'待核')}</div><small>${en()?'Spatial correspondence in schematic boundaries':'示意边界的空间对应'}</small>`:''}`;}
 function color(p,regions){if(p.colorKey==='unmatched')return '#94958f';const names=[...new Set(regions.map(f=>f.properties.nameZh))].sort(),i=names.indexOf(p.colorKey||p.nameZh);return i<0?'#94958f':`hsl(${Math.round(i*137.508)%360}, 42%, 53%)`;}
 function uniqueLabels(features){const seen=new Set();return features.filter(f=>{const p=f.properties,key=p.originalLayer==='polity'||p.sourceAdministrativeLevel==='polity'||p.polityRole?'polity:'+p.nameZh:'feature:'+String(p.sourceId||p.id||f.id);if(seen.has(key))return false;seen.add(key);return true;});}
 function upperReferences(data){const regions=(data?.features||[]).filter(f=>f.properties.level==='province');return {type:'FeatureCollection',features:(data?.features||[]).filter(f=>f.properties.level==='prefecture'&&/直隶州|直隶厅/.test(f.properties.typeZh)&&f.properties.parentZh&&f.properties.parentOverlap>0&&f.properties.parentOverlap<.95).map(f=>({...f,id:'upper-reference-'+f.id,properties:{...f.properties,historyBackground:true,historyReference:true,backgroundTier:'lowerReference',color:color(f.properties,regions)}}))};}
 function popup(p){return `<strong>${esc(p.displayName||p.nameZh)}</strong><div>${date(year())} · ${esc(p.typeZh)}</div>${p.level==='prefecture'?hover({...p,displayName:'',nameZh:''}):''}<small>${en()?'Schematic snapshot applied to':'示意快照适用阶段'}：${date(p.start)}–${date(p.end)}<br>${esc(p.stageOverview||'')}<br>${esc(p.sourceBasis||'')}<br>${en()?'Schematic approximation; reused divisions may span several phases. Not surveyed boundaries.':'边界为示意近似；部分政区沿用同一份几何，非逐年实测或考证。'}</small><a href="https://github.com/DeanChensj/jiangshan-map" target="_blank" rel="noopener">${en()?'Original data':'原始数据'} ↗</a> · <a href="https://github.com/DeanChensj/jiangshan-map/blob/main/README_ZH.md#致谢与开源协议" target="_blank" rel="noopener">${en()?'Sources and terms':'来源与使用条款'} ↗</a>`;}
 function legend(el,{opacity,error,loading,count}){
  el.hidden=!opts().historicalAdmin;if(el.hidden)return;
  const signature=JSON.stringify(['jiangshan',opts().jiangshanYearStep,year(),level(),en(),opacity,error,loading,count,catalog?.periods.length]);if(el._chgisSignature===signature)return;
  if(el.contains(document.activeElement)&&document.activeElement?.type==='range')return;el._chgisSignature=signature;
  const p=phase();el.innerHTML=`<strong>${en()?'History · Jiangshan':'历史 · 江山时序'}</strong>${globalThis.TwhaHistory?.selector('jiangshan')||''}<label>${en()?'Period':'时期'} <select data-jiangshan-phase>${representativeYears.includes(year())?'':`<option value="${year()}" selected>${en()?'Manual':'手动'} · ${date(year())}</option>`}${periodOptions()}</select></label><label class="chgis-year-control"><span>${en()?'Year':'年份'}</span><input data-jiangshan-year type="range" min="-403" max="1947" step="1" value="${year()>0?year()-1:year()}" aria-label="${en()?'Historical year':'历史年份'}"><output data-jiangshan-year-value>${date(year())}</output></label><label>${en()?'Level':'层级'} <select data-jiangshan-level><option value="province" ${level()==='province'?'selected':''}>${en()?'First-level divisions':'一级政区'}</option><option value="prefecture" ${level()==='prefecture'?'selected':''} ${scheme().lowerAvailable?'':'disabled'}>${en()?'Second-level divisions':'二级政区'}</option></select></label><label class="historical-admin-opacity">${en()?'Opacity':'透明度'} <input data-chgis-opacity type="range" min="0" max="100" value="${opacity}"><output data-chgis-opacity-value>${opacity}%</output></label><small role="status">${error?esc(error):loading?(en()?'Loading…':'正在加载…'):(en()?`${count} divisions`:`${count}个政区`)}<br>${esc(p?.overview||'')}<br>${esc(scheme().note)}<br>${en()?'Schematic boundaries; several stages reuse administrative geometry. No county boundaries or seat points.':'示意边界，部分分期复用政区几何；不含县界和治所点。'}</small><a href="https://github.com/DeanChensj/jiangshan-map" target="_blank" rel="noopener">${en()?'Source repository':'数据来源'} ↗</a> · <a href="https://github.com/DeanChensj/jiangshan-map/blob/main/README_ZH.md#致谢与开源协议" target="_blank" rel="noopener">${en()?'Sources and terms':'来源与使用条款'} ↗</a>`;
  globalThis.HistoryMenu?.format(el,{source:'jiangshan',year:year(),english:en()});
 }
 function change(e){const target=e.target;if(target.hasAttribute('data-jiangshan-phase'))opts().jiangshanYear=Number(target.value);else if(target.hasAttribute('data-jiangshan-year')){const raw=Number(target.value),n=raw>=0?raw+1:raw;if(!Number.isInteger(n)||n<-403||n>1948)return true;opts().jiangshanYear=n;}else if(target.hasAttribute('data-jiangshan-level'))opts().jiangshanLevel=target.value==='province'?'province':'prefecture';else return false;context.save();context.render();return true;}
 function input(e,el){if(!e.target.hasAttribute('data-jiangshan-year'))return false;const raw=Number(e.target.value),n=raw>=0?raw+1:raw;el.querySelector('[data-jiangshan-year-value]').textContent=date(n);const select=el.querySelector('[data-jiangshan-phase]');if(select){if(!representativeYears.includes(n)){let option=select.querySelector('[data-jiangshan-manual]');if(!option){option=document.createElement('option');option.setAttribute('data-jiangshan-manual','');select.prepend(option);}option.value=String(n);option.textContent=(en()?'Manual':'手动')+' · '+date(n);}select.value=String(n);}return true;}
 return {init:c=>context=c,load,year,level,phase,resolve,popup,hover,resolveHover,scheme,color,uniqueLabels,upperReferences,legend,change,input,representativeYears};
})();
