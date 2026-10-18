/* Gallup 2025 report / 2024 survey. Country statistics, not local risk estimates. */
(function(root) {
  const sourceUrl = 'https://www.gallup.com/analytics/356996/gallup-global-safety-research-center.aspx';
  const dataUrl = 'data/gallup-safety-2025.geojson?v=1';
  const colors = ['#a63649','#df8b52','#e8c66b','#91bcb3','#388b83','#176452'];
  const muted = '#d1d5db';
  let config = {}, cached = null, loading = null, revision = 0, hover = null, leaflet = null;
  const maps = new WeakMap();
  const active = id => ['gallupSafety','gallupLawOrder'].includes(id);
  const metric = id => id === 'gallupSafety' ? 'safety' : 'lawOrder';
  const provider = () => config.provider?.() || '';
  const en = () => config.language?.() === 'en';
  const opacity = () => (config.opacity?.() ?? 100) / 100;
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function color(value) {
    if (!Number.isFinite(value)) return muted;
    return colors[value<60?0:value<70?1:value<80?2:value<85?3:value<90?4:5];
  }
  function expression(key) {
    return ['case',['==',['get',key],null],muted,['step',['get',key],colors[0],60,colors[1],70,colors[2],80,colors[3],85,colors[4],90,colors[5]]];
  }
  function title(id=provider()) {
    return id==='gallupSafety' ? (en()?'Gallup · Feeling safe at night':'Gallup · 夜间独行安全感') : (en()?'Gallup · Law and Order Index':'Gallup · 法律与秩序指数');
  }
  function name(p) {
    if(en()) return p.sourceName || p.name;
    if(p.name==='Northern Cyprus') return '塞浦路斯北部';
    if(p.name==='Kosovo') return '科索沃';
    try { return new Intl.DisplayNames(['zh-CN'],{type:'region'}).of(p.iso2) || p.name; } catch { return p.name; }
  }
  function tooltip(p) {
    const value = v => Number.isFinite(v) ? String(v) : (en()?'No data':'无数据');
    return '<strong>'+esc(name(p))+'</strong><br>'+ (en()?'Law and Order Index: ':'法律与秩序指数：')+value(p.lawOrder)+(Number.isFinite(p.lawOrder)?' / 100':'')+'<br>'+(en()?'Feel safe at night: ':'夜间独行感到安全：')+value(p.safety)+(Number.isFinite(p.safety)?'%':'')+'<br><small>'+(en()?'2024 survey · 2025 report':'2024 年调查 · 2025 年报告')+'</small>';
  }
  function labelText(p,id=provider()) {
    const value=p[metric(id)];
    return Number.isFinite(value)?String(value)+(metric(id)==='safety'?'%':''):'';
  }
  function ringArea(r) {
    return Math.abs(r.reduce((sum,p,i)=>{const q=r[(i+1)%r.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;
  }
  function labelPoints(data,valueKeys=['lawOrder','safety']) {
    return {type:'FeatureCollection',features:data.features.filter(f=>valueKeys.some(key=>Number.isFinite(f.properties[key]))).flatMap(f=>{
      const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
      const polygon=polygons.reduce((best,p)=>ringArea(p[0])>ringArea(best[0])?p:best,polygons[0]);
      const ys=polygon[0].map(p=>p[1]),low=Math.min(...ys),high=Math.max(...ys);
      let anchor=null,width=-1;
      for(const fraction of [0.5,0.4,0.6]){
        const y=low+(high-low)*fraction,xs=[];
        for(const r of polygon)for(let i=1;i<r.length;i++){
          const a=r[i-1],b=r[i];
          if((a[1]>y)!==(b[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
        }
        xs.sort((a,b)=>a-b);
        for(let i=0;i+1<xs.length;i+=2)if(xs[i+1]-xs[i]>width){width=xs[i+1]-xs[i];anchor=[(xs[i]+xs[i+1])/2,y];}
        if(anchor)break;
      }
      if(!anchor)return [];
      const area=ringArea(polygon[0]);
      return [{type:'Feature',...(f.id!==undefined?{id:f.id}:{}),properties:{...f.properties,labelMinZoom:area>10?0:area>1?3:area>0.1?5:7},geometry:{type:'Point',coordinates:anchor}}];
    })};
  }
  function textExpression(id) {
    return ['concat',['to-string',['get',metric(id)]],metric(id)==='safety'?'%':''];
  }
  function load() {
    if(cached) return Promise.resolve(cached);
    if(!loading) loading=fetch(dataUrl).then(r=>{if(!r.ok)throw Error('Gallup HTTP '+r.status);return r.json();}).then(data=>cached=data).finally(()=>{loading=null;});
    return loading;
  }
  function legend(status='') {
    const el=typeof document!=='undefined'&&document.getElementById('gallupSafetyLegend');
    if(!el)return;
    el.hidden=!active(provider());
    if(el.hidden)return;
    el.innerHTML='<strong>'+title()+'</strong><small>'+(en()?'2024 survey · 2025 report · 144 areas':'2024 年调查 · 2025 年报告 · 144 个国家和地区')+'</small><div class="gallup-scale" style="background:linear-gradient(to right,'+colors.join(',')+')"></div><div class="gallup-scale-labels"><span>0</span><span>60</span><span>70</span><span>80</span><span>85</span><span>90</span><span>100'+(metric(provider())==='safety'?'%':'')+'</span></div><small><i class="gallup-no-data"></i> '+(en()?'No data · higher = stronger perceived safety':'灰色：无数据；数值越高，安全感越强')+'</small><small>'+(en()?'National survey results; no city-level estimates.':'国家／地区调查结果，不代表城市或景点的安全程度。')+'</small><a target="_blank" rel="noopener" href="'+sourceUrl+'">© Gallup · '+(en()?'Source and methodology':'来源与方法')+' ↗</a>'+(status?'<small role="status">'+esc(status)+'</small>':'');
  }
  function mapState(map) {
    let state=maps.get(map);
    if(!state){state={bound:false};maps.set(map,state);}
    return state;
  }
  function clearHover(){hover?.remove();hover=null;}
  async function sync(map,group) {
    const token=++revision,id=provider(),enabled=active(id);
    legend();clearHover();
    if(!enabled){
      if(map){for(const l of ['gallup-safety-label','gallup-safety-line','gallup-safety-fill'])if(map.getLayer(l))map.removeLayer(l);for(const s of ['gallup-safety-labels','gallup-safety'])if(map.getSource(s))map.removeSource(s);}
      if(leaflet){leaflet.remove();leaflet=null;}
      return;
    }
    try{
      const data=await load();if(token!==revision||provider()!==id)return;
      if(map){
        const state=mapState(map);
        if(!map.getSource('gallup-safety'))map.addSource('gallup-safety',{type:'geojson',data,attribution:'© Gallup, Inc. · 2025 Global Safety Report; boundaries: Natural Earth',tolerance:0.1,maxzoom:6});
        const before=map.getStyle().layers.find(l=>l.id!=='basemap'&&!l.id.startsWith('esri-relief-')&&!l.id.startsWith('gallup-safety-'))?.id;
        if(!map.getLayer('gallup-safety-fill'))map.addLayer({id:'gallup-safety-fill',type:'fill',source:'gallup-safety',paint:{'fill-antialias':false,'fill-color':expression(metric(id)),'fill-opacity':0.83*opacity()}},before);
        else {map.setPaintProperty('gallup-safety-fill','fill-color',expression(metric(id)));map.setPaintProperty('gallup-safety-fill','fill-opacity',0.83*opacity());}
        if(!map.getLayer('gallup-safety-line'))map.addLayer({id:'gallup-safety-line',type:'line',source:'gallup-safety',paint:{'line-color':'#657b80','line-width':0.5,'line-opacity':0.5*opacity()}},before);
        else map.setPaintProperty('gallup-safety-line','line-opacity',0.5*opacity());
        if(!map.getSource('gallup-safety-labels'))map.addSource('gallup-safety-labels',{type:'geojson',data:labelPoints(data)});
        if(!map.getLayer('gallup-safety-label'))map.addLayer({id:'gallup-safety-label',type:'symbol',source:'gallup-safety-labels',filter:['!=',['get',metric(id)],null],layout:{'text-field':textExpression(id),'text-font':['Arial Bold'],'text-size':['interpolate',['linear'],['zoom'],0,13,4,14,8,15],'text-padding':5,'text-allow-overlap':false},paint:{'text-color':'#101820','text-halo-color':'#ffffff','text-halo-width':1.8,'text-halo-blur':0.2,'text-opacity':1}},before);
        else {map.setLayoutProperty('gallup-safety-label','text-field',textExpression(id));map.setFilter('gallup-safety-label',['!=',['get',metric(id)],null]);map.setPaintProperty('gallup-safety-label','text-opacity',1);}
        if(!state.bound){
          state.bound=true;
          map.on('mousemove',event=>{
            if(!active(provider())||!map.getLayer('gallup-safety-fill'))return;
            const features=map.queryRenderedFeatures(event.point,{layers:['gallup-safety-fill']});
            if(!features.length){clearHover();return;}
            const p=features[0].properties;
            if(!hover)hover=new root.maplibregl.Popup({closeButton:false,closeOnClick:false,offset:12,className:'gallup-tooltip'});
            hover.setLngLat(event.lngLat).setHTML(tooltip(p)).addTo(map);
          });
          map.on('mouseout',clearHover);
        }
      }else if(root.L&&config.leaflet?.()){
        const target=config.leaflet();
        if(!target.getPane('gallupSafetyPane'))target.createPane('gallupSafetyPane').style.zIndex='250';
        leaflet?.remove();
        leaflet=root.L.geoJSON(data,{pane:'gallupSafetyPane',style:f=>({color:'#657b80',weight:0.5,opacity:0.5*opacity(),fillColor:color(f.properties[metric(id)]),fillOpacity:0.83*opacity()}),onEachFeature:(f,l)=>l.bindTooltip(tooltip(f.properties),{sticky:true})}).addTo(group||target);
        if(root.L.marker){for(const f of labelPoints(data).features){
          const text=labelText(f.properties,id);if(!text)continue;
          const marker=root.L.marker([f.geometry.coordinates[1],f.geometry.coordinates[0]],{pane:'gallupSafetyPane',interactive:false,opacity:1,gallupMinZoom:f.properties.labelMinZoom,icon:root.L.divIcon({className:'gallup-value-label',html:esc(text),iconSize:[42,20],iconAnchor:[21,10]})});
          marker.addTo(leaflet);
        }
        const update=()=>leaflet?.eachLayer(l=>{if(l.options?.gallupMinZoom!==undefined&&l.getElement?.())l.getElement().hidden=target.getZoom()<l.options.gallupMinZoom;});
        if(!target._gallupLabelsBound){target.on('zoomend',()=>target._gallupLabelUpdate?.());target._gallupLabelsBound=true;}
        target._gallupLabelUpdate=update;update();}
      }
      legend();
    }catch(error){if(token===revision)legend(en()?'Data could not load; reselect to retry.':'数据加载失败；重新选择可重试。');console.warn('Gallup safety basemap',error);}
  }
  function init(options){config=options;}
  const api={init,active,metric,color,expression,tooltip,labelText,labelPoints,load,sync,legend,dataUrl};
  root.GallupSafety=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
