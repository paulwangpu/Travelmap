(function(root){
 'use strict';
 function describe(p={},geometry={},english=false){
  const states={mapped:['现状标绘','Mapped remains'],reconstructed:['复原展示','Reconstruction'],mixed:['遗址／后期复原','Remains / later reconstruction'],unverified:['状态待核','Condition unverified']};
  const state=p.inferredBoundary?['推定范围','Inferred extent']:(states[p.relicState]||states.unverified);
  let kind=['定位点','Reference point'];
  if(p.geometryKind==='building')kind=['建筑轮廓','Building footprint'];
  else if(p.geometryKind==='precinct')kind=['陵园／遗址范围','Site precinct'];
  else if(p.role==='wall')kind=/Line/.test(geometry.type||'')?['城墙线','Wall line']:['城垣范围','Enclosure'];
  else if(/Polygon/.test(geometry.type||''))kind=p.role==='area'?['遗址范围','Site extent']:['建筑／遗迹轮廓','Feature footprint'];
  else if(/Line/.test(geometry.type||''))kind=['遗迹线段','Mapped line'];
  return [state[english?1:0],kind[english?1:0]];
 }
 function html(p,g,en){return '<p class="historical-evidence">'+describe(p,g,en).map(text=>'<span>'+text+'</span>').join('')+'</p>';}
 const api={describe,html};root.HistoricalEvidence=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
