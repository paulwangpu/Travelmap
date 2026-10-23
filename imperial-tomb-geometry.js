// Supplementary footprints use the existing imperial-tomb identity and controls.
(function(root){
 'use strict';
 const layerIds=['imperial-tomb-shape-label','imperial-tomb-moat-bank-line','imperial-tomb-shape-line','imperial-tomb-shape-fill'];
 let data,pending;
 async function load(fetcher){
  if(data)return data;
  pending||=fetcher('data/imperial-tombs/geometry.geojson?v=3').then(d=>{
   data=d?.type==='FeatureCollection'&&Array.isArray(d.features)?d:{type:'FeatureCollection',features:[]};return data;
  }).catch(e=>{console.warn('Imperial tomb geometry',e);return {type:'FeatureCollection',features:[]};}).finally(()=>{pending=null;});
  return pending;
 }
 function selected(item,o){
  const period=root.HistoricalPeriods.tombPeriod(item),era=o.era;
  return (o.includeFeudalKings!==false||!(item.rulerCategory==='feudal_king'||item.preqinClassification?.section==='诸侯国'))&&(!o.onlyVisitableChambers||item.visitorAccess?.originalChamber===true&&item.visitorAccess?.status==='documented_visitable')&&(typeof era==='object'?(era[period]??era[item.era])!==false:!era||item.era===era||period===era)&&o.natures?.[item.nature]!==false&&(item.era!=='先秦'||o.preqin?.[item.preqinClassification?.country]!==false);
 }
 function collection(catalog,geometry,o={}){
  const items=new Map(catalog.items.map(x=>[x.id,x])),features=[];
  for(const f of geometry?.features||[]){
   const p=f.properties,item=items.get(p.tombId);if(!item||!selected(item,o))continue;
   const done=Boolean(o.isVisited?.(item)),name=o.en?p.enLabel||p.enName||p.name:p.label||p.name;
   const properties={...p,id:item.id,detailId:p.sourceId,tombGeometry:true,tombGeometryLabel:false,name:(done&&p.tombOutline?'✓ ':'')+name,note:o.en?p.enNote||p.note:p.note,status:o.en?p.enStatus||p.status:p.status,color:p.waterFeature?'#277caa':root.HistoricalPeriods.colors[root.HistoricalPeriods.tombPeriod(item)]||'#9d4b20',visited:done&&Boolean(p.tombOutline)};
   features.push({...f,id:p.sourceId,properties});
   if(p.labelCoordinates)features.push({type:'Feature',id:p.sourceId+'-label',geometry:{type:'Point',coordinates:p.labelCoordinates},properties:{...properties,tombGeometryLabel:true}});
  }
  return {type:'FeatureCollection',features};
 }
 function layers(map){
  const shape=['==',['get','tombGeometry'],true];
  if(!map.getLayer('imperial-tomb-shape-fill'))map.addLayer({id:'imperial-tomb-shape-fill',type:'fill',source:'imperial-tombs',minzoom:13,filter:['all',shape,['==',['geometry-type'],'Polygon']],paint:{'fill-color':['get','color'],'fill-opacity':['case',['get','visited'],.17,['coalesce',['get','fillOpacity'],.05]]}});
  if(!map.getLayer('imperial-tomb-shape-line'))map.addLayer({id:'imperial-tomb-shape-line',type:'line',source:'imperial-tombs',minzoom:13,filter:['all',shape,['!=',['geometry-type'],'Point'],['!=',['get','lineStyle'],'solid']],paint:{'line-color':['get','color'],'line-width':['case',['get','visited'],2.3,1.2],'line-opacity':.8,'line-dasharray':[4,2]}});
  if(!map.getLayer('imperial-tomb-moat-bank-line'))map.addLayer({id:'imperial-tomb-moat-bank-line',type:'line',source:'imperial-tombs',minzoom:13,filter:['all',shape,['==',['get','lineStyle'],'solid'],['==',['geometry-type'],'LineString']],paint:{'line-color':['get','color'],'line-width':['interpolate',['linear'],['zoom'],13,.7,17,1.1],'line-opacity':.8}});
  if(!map.getLayer('imperial-tomb-shape-label'))map.addLayer({id:'imperial-tomb-shape-label',type:'symbol',source:'imperial-tombs',minzoom:15,filter:['==',['get','tombGeometryLabel'],true],layout:{'text-field':['get','name'],'text-size':11,'text-max-width':10,'text-padding':3,'text-allow-overlap':false},paint:{'text-color':['get','color'],'text-halo-color':'#fff','text-halo-width':1.5}});
 }
 root.ImperialTombGeometry={load,collection,layers,layerIds,records:()=>data?.features||[]};
 if(typeof module!=='undefined')module.exports=root.ImperialTombGeometry;
})(globalThis);
