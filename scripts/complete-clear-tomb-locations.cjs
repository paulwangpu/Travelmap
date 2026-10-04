// Explicit original coordinate systems; visitor/site points are not surveyed chamber centres.
module.exports=({items,source})=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const research=require('../data/imperial-tombs/clear-location-completion.json');
 const app=fs.readFileSync(require.resolve('../app.js'),'utf8'),ctx={};
 vm.createContext(ctx);vm.runInContext(app.slice(app.indexOf('function isCoordinateInChina('),app.indexOf('function ',app.indexOf('function gcjToWgs(')+10)),ctx);
 for(const p of research.locations){
  const x=items.find(x=>x.id===p.id);if(!x)throw Error('Unknown tomb '+p.id);
  if(x.coordinates)throw Error('Location already exists '+p.id);
  const [lng,lat]=p.crs==='GCJ-02'?ctx.gcjToWgs(p.lng,p.lat):[p.lng,p.lat];
  const sid='clear-location-'+p.id;
  source(sid,x.name+'：'+p.target,p.publisher,p.url,p.note);
  if(p.crs!=='GCJ-02'&&p.crs!=='WGS84'&&!p.estimated)throw Error('Unverified datum requires a regional estimate '+p.id);
  if(p.estimated&&(!p.basis||!p.extent))throw Error('Missing estimate provenance '+p.id);
  x.coordinates={lat,lng,crs:'WGS84',status:p.estimated?'estimated_wgs84':'verified_wgs84',sourceId:sid,target:p.target,original:`${p.lng}, ${p.lat}; ${p.crs}`,method:p.estimated?p.basis:p.crs==='GCJ-02'?'公开POI明确标注GCJ-02，使用项目迭代反解转换WGS84；核对遗址地址':'公开地理实体WGS84区域参考点；核对遗址地址',sourceDatumExplicit:p.crs==='GCJ-02'||p.crs==='WGS84',precision:{sourceUnit:'degree',resolutionDegrees:p.resolution||0.000001,horizontalAccuracyMeters:null},limitation:p.note};
  if(p.estimated)x.coordinates.estimate={basis:p.basis,extent:p.extent,confidence:'regional',reviewedAt:research.reviewedAt};
  for(const s of p.supportingSources||[]){source(s.id,s.title,s.publisher,s.url,s.note||'');if(!x.sourceIds.includes(s.id))x.sourceIds.push(s.id);}
  x.reviewTasks=x.reviewTasks.filter(t=>!/^补核单陵WGS84坐标|^补核陵区边界或代表点/.test(t));
  x.reviewTasks.push('补核墓室或入口的现场实测位置与精度');
  x.sourceIds.push(sid);x.mapEligible=true;x.mapReason=p.target;
 }
};
