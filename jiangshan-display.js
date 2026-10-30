/* Zoom-dependent presentation; all geometry and dates remain source-defined. */
globalThis.JiangshanDisplay=(()=>{
 const layers=['jiangshan-polity-fill','jiangshan-polity-label','jiangshan-upper-label','jiangshan-background-fill','jiangshan-upper-reference'];
 function clear(map){for(const id of layers)if(map.getLayer(id))map.removeLayer(id);if(map.getSource('jiangshan-polity-labels'))map.removeSource('jiangshan-polity-labels');}
 function opacity(map,value){if(map.getLayer('jiangshan-background-fill'))map.setPaintProperty('jiangshan-background-fill','fill-opacity',value/100);if(map.getLayer('jiangshan-polity-fill'))map.setPaintProperty('jiangshan-polity-fill','fill-opacity',0);if(map.getLayer('chgis-history-fill'))map.setPaintProperty('chgis-history-fill','fill-opacity',value/100);}
 function apply(map,data,{opacity:value,level,english}){
  const add=(layer,before)=>{if(!map.getLayer(layer.id))map.addLayer(layer,before);};
  add({id:'jiangshan-background-fill',type:'fill',source:'chgis-history',filter:['all',['==',['get','historyBackground'],true],['!=',['get','historyReference'],true]],paint:{'fill-color':['get','color'],'fill-opacity':value/100}},'chgis-history-fill');
  add({id:'jiangshan-upper-reference',type:'line',source:'chgis-history',filter:['==',['get','historyReference'],true],paint:{'line-color':['get','color'],'line-width':1,'line-opacity':.8,'line-dasharray':[3,2]}},'chgis-history-line');
  add({id:layers[0],type:'fill',source:'jiangshan-borders',filter:['!=',['get','polityRole'],'neighbor'],paint:{'fill-color':['get','polityColor'],'fill-opacity':0}},'chgis-history-fill');
  map.setFilter?.('jiangshan-border-line',['!=',['get','polityRole'],'neighbor']);
  map.setPaintProperty('jiangshan-border-line','line-color',['case',['==',['get','polityRole'],'neighbor'],'#898176',['get','polityColor']]);
  map.setPaintProperty('jiangshan-border-line','line-width',['interpolate',['linear'],['zoom'],3,['case',['==',['get','polityRole'],'neighbor'],.5,1.2],6,['case',['==',['get','polityRole'],'neighbor'],.8,1.8]]);
  map.setPaintProperty('jiangshan-border-line','line-opacity',['case',['==',['get','polityRole'],'neighbor'],.3,.85]);
  map.setPaintProperty('chgis-history-line','line-width',['interpolate',['linear'],['zoom'],2,.3,4.3,.45,6,.8]);
  map.setPaintProperty('chgis-history-line','line-opacity',['interpolate',['linear'],['zoom'],2,.4,4.5,.45,6,.7]);
  const points={type:'FeatureCollection',features:data.borders.features.filter(f=>f.properties.labelCoordinates&&f.properties.polityRole!=='neighbor').map(f=>({...f,geometry:{type:'Point',coordinates:f.properties.labelCoordinates},properties:{...f.properties,displayName:english?f.properties.nameRoman:f.properties.nameZh}}))};
  if(map.getSource('jiangshan-polity-labels'))map.getSource('jiangshan-polity-labels').setData(points);else map.addSource('jiangshan-polity-labels',{type:'geojson',data:points});
  add({id:layers[1],type:'symbol',source:'jiangshan-polity-labels',minzoom:2,maxzoom:5.4,layout:{'text-field':['get','displayName'],'text-font':['Open Sans Semibold','Arial Unicode MS Regular'],'text-size':20,'text-padding':12,'text-letter-spacing':.15,'text-allow-overlap':false},paint:{'text-color':'#594f43','text-halo-color':'#faf8ef','text-halo-width':2}});
  add({id:layers[2],type:'symbol',source:'chgis-history',minzoom:4,filter:['all',['==',['geometry-type'],'Point'],['==',['get','jiangshan'],true],['==',['get','level'],'province'],['<=',['get','labelMinZoom'],['zoom']]],layout:{visibility:level==='prefecture'?'visible':'none','text-field':['get','displayName'],'text-font':['Open Sans Regular','Arial Unicode MS Regular'],'text-size':13,'text-padding':7,'text-variable-anchor':['center','top','bottom','left','right']},paint:{'text-color':'#696153','text-halo-color':'#fff','text-halo-width':1.5}});
  map.setLayoutProperty?.(layers[1],'visibility','none');
  map.setLayoutProperty?.(layers[2],'visibility',level==='prefecture'?'visible':'none');
  map.setFilter?.('chgis-history-label',['all',['==',['geometry-type'],'Point'],['!=',['get','displayName'],''],['<=',['get','labelMinZoom'],['zoom']],...(level==='prefecture'?[['any',['==',['get','historyBackground'],true],['!=',['get','level'],'province']]]:[])]);
  opacity(map,value);
 }
 return {apply,clear,opacity};
})();
