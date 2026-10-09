globalThis.LuoyangCapitalEvolution=(()=>{
 let context,data,walls,pending,revision=0,leafletGroup;
 const ids=['zhou','han','weijin','northernwei','suitang','mingqing'];
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function selected(){const o=context.state().mapOverlays,s=o.luoyangCapitalStage||'all';return data.stages.filter(p=>(s==='all'||s===p.id)&&(p.period==='明清'?o.ancientCapitalPeriods?.[(o.ancientCapitalWallYear||1866)<1644?'明':'清']!==false:o.ancientCapitalPeriods?.[p.period]!==false));}
 // Use an interior label anchor, including holes, instead of a separately guessed city point.
 function interiorPoint(geometry){const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;let best=null;
  for(const rings of polygons){const ys=[...new Set(rings.flat().map(p=>p[1]))].sort((a,b)=>a-b);const candidates=[(ys[0]+ys.at(-1))/2,...ys.slice(1).map((y,i)=>(y+ys[i])/2)];
   for(const y of candidates){const xs=[];for(const ring of rings)for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[j],b=ring[i];if((a[1]>y)!==(b[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);
    for(let i=0;i+1<xs.length;i+=2){const width=xs[i+1]-xs[i];if(width>0&&(!best||width>best.width))best={width,point:[(xs[i]+xs[i+1])/2,y]};}
   }
  }return best?.point;
 }
 function collection(){const o=context.state().mapOverlays,year=o.ancientCapitalWallYear||1866,groups=new Map();for(const p of selected()){if(!groups.has(p.siteId))groups.set(p.siteId,[]);groups.get(p.siteId).push(p);}
 for(const p of selected())for(const site of p.additionalSites||[]){if(!groups.has(site.siteId))groups.set(site.siteId,[]);groups.get(site.siteId).push({...p,...site});}
 const wallFeatures=walls.features.filter(f=>f.properties.city==='洛阳'&&f.properties.year===year);
 const wallPoint=wallFeatures.map(f=>interiorPoint(f.geometry)).find(Boolean);
 if(groups.has('mingqing')){if(wallPoint)groups.set('mingqing',groups.get('mingqing').map(p=>({...p,coordinates:wallPoint})));else groups.delete('mingqing');}
 const features=[...groups].map(([siteId,stages])=>({type:'Feature',properties:{siteId,stageIds:stages.map(p=>p.id).join(','),...(siteId==='mingqing'?{year}:{}),capitalIcon:'ancient-capital-'+(stages[0].period==='明清'?(year<1644?'明':'清'):stages[0].period),label:stages[0].siteName+' · '+stages.map(p=>p.name).join('/'),color:HistoricalPeriods.colors[stages[0].period==='明清'?(year<1644?'明':'清'):stages[0].period]},geometry:{type:'Point',coordinates:stages[0].coordinates}}));
 return {type:'FeatureCollection',features};}
 function html(p){const stages=data.stages.filter(s=>String(p.stageIds).split(',').includes(s.id)).map(s=>({...s,...(s.additionalSites||[]).find(site=>site.siteId===p.siteId)}));return '<b>洛阳城址演变</b>'+stages.map(s=>'<p><b>'+esc(s.name)+' · '+esc(s.siteName)+'</b><br>'+esc(s.boundaryStatus)+' · '+esc(s.coordinateKind)+'<br>'+esc(s.summary)+'<br>'+s.sources.map(r=>'<a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+esc(r.title)+' ↗</a>').join('<br>')+'</p>').join('')+(p.year?'<small>'+p.year+' 年明清城界</small>':'');}
 async function sync(map,group){const token=++revision,o=context.state().mapOverlays,enabled=o.chinaAncientCapitals&&o.luoyangCapitalEvolution!==false;leafletGroup?.remove();leafletGroup=null;const layers=['luoyang-evolution-fill','luoyang-evolution-line','luoyang-evolution-points','luoyang-evolution-labels'];if(!enabled){if(map)for(const id of layers)if(map.getLayer(id))map.setLayoutProperty(id,'visibility','none');return;}
 try{if(!data){pending||=Promise.all(['data/luoyang-capital-evolution.json?v=12','data/ancient-capital-wall-snapshots.geojson?v=1'].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}))).then(([d,w])=>{data=d;walls=w}).finally(()=>pending=null);await pending;}if(token!==revision)return;const d=collection();
 if(map){const source='luoyang-capital-evolution';if(map.getSource(source))map.getSource(source).setData(d);else map.addSource(source,{type:'geojson',data:d,attribution:'洛阳考古分期参考 · CCWAD · UNESCO'});const before=map.getStyle().layers.find(l=>l.type==='symbol')?.id;const polygon=['==',['geometry-type'],'Polygon'],point=['==',['geometry-type'],'Point'];
 if(!map.getLayer(layers[0]))map.addLayer({id:layers[0],type:'fill',source,minzoom:7,filter:polygon,paint:{'fill-color':['get','color'],'fill-opacity':.15}},before);
 if(!map.getLayer(layers[1]))map.addLayer({id:layers[1],type:'line',source,minzoom:7,filter:polygon,paint:{'line-color':['get','color'],'line-width':1.6}},before);
 HistoricalPeriods.keys.forEach(key=>{const id='ancient-capital-'+key;if(!map.hasImage(id))map.addImage(id,HistoricalPeriods.capitalImage(HistoricalPeriods.colors[key]),{pixelRatio:2});});
 if(!map.getLayer(layers[2]))map.addLayer({id:layers[2],type:'symbol',source,minzoom:7,filter:point,layout:{'icon-image':['get','capitalIcon'],'icon-size':0.9,'icon-allow-overlap':true}},before);
 if(!map.getLayer(layers[3]))map.addLayer({id:layers[3],type:'symbol',source,minzoom:8,filter:point,layout:{'text-field':['get','label'],'text-font':['Open Sans Regular','Arial Unicode MS Regular'],'text-size':12,'text-offset':[0,1.2],'text-anchor':'top','text-max-width':16,'text-padding':6},paint:{'text-color':['get','color'],'text-halo-color':'white','text-halo-width':1.5}},before);
 for(const id of layers)map.setLayoutProperty(id,'visibility','visible');context.front?.();
 }else if(group){leafletGroup=L.geoJSON(d,{style:f=>({color:f.properties.color,weight:1.6,fillOpacity:.15}),pointToLayer:(f,ll)=>L.marker(ll,{icon:L.divIcon({className:'imperial-tomb-marker',html:HistoricalPeriods.capitalSvg(f.properties.color),iconSize:[18,18],iconAnchor:[9,9]})}),onEachFeature:(f,l)=>{l.bindPopup(()=>html(f.properties));if(f.geometry.type==='Point')l.bindTooltip('<span style="color:'+esc(f.properties.color)+'">'+esc(f.properties.label)+'</span>',{permanent:true,direction:'bottom'});}}).addTo(group);}
 }catch(e){console.warn('Luoyang evolution',e);context.error?.();}}
 function click(map,event){const layers=['luoyang-evolution-points','luoyang-evolution-fill'].filter(id=>map.getLayer(id));if(!layers.length)return false;const f=map.queryRenderedFeatures(event.point,{layers})[0];if(!f)return false;new maplibregl.Popup().setLngLat(event.lngLat).setHTML(html(f.properties)).addTo(map);return true;}
 return {init:c=>context=c,sync,click,collection,ids};
})();
