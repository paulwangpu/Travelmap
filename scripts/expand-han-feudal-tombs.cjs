// Han territorial kings: membership is explicit, never inferred from a name containing 王.
module.exports=({items,add,group,source,locationsOnly=false})=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const research=require('../data/imperial-tombs/han-feudal-research.json');
 if(!locationsOnly){
  for(const s of research.sources)source(s.id,s.title,s.publisher,s.url,s.note||'');
  for(const r of research.sites){
   const options={rulerCategory:'feudal_king',scopeBasis:'汉代诸侯国统治者王陵；普通宗室王公、列侯及王后墓不单独扩展',recognition:r.recognition||'archaeological',evidence:r.evidence,disputes:r.disputes||[],aliases:r.aliases||[],parentId:r.parentId||null,periodText:r.periodText||'西汉',chronology:{sortYear:r.sortYear,basis:r.sortBasis||'所属时代的大致排序参照，非精确建陵年'},reviewTasks:r.reviewTasks||['补核墓室、入口及实测精度']};
   if(r.type==='group')group(r.id,r.name,'秦汉',r.state,r.admin,r.source,options);
   else add(r.id,r.name,'秦汉',r.state,r.owner||'墓主未确定',r.admin,r.source,options);
  }
  return;
 }
 const app=fs.readFileSync(require.resolve('../app.js'),'utf8');
 const conversion=app.slice(app.indexOf('function isCoordinateInChina('),app.indexOf('function ',app.indexOf('function gcjToWgs(')+10));
 const ctx={};vm.createContext(ctx);vm.runInContext(conversion,ctx);
 for(const r of research.sites){
  const x=items.find(x=>x.id===r.id),p=r.point;if(!p)continue;
  const [lng,lat]=p.crs==='GCJ-02'?ctx.gcjToWgs(p.lng,p.lat):[p.lng,p.lat];
  const sid='geo-'+r.id;source(sid,r.name+'：'+p.target,p.publisher,p.url,'原始点值与基准存于han-feudal-research.json；位置来源不作墓主身份认定依据。');
  x.coordinates={lat,lng,crs:'WGS84',status:p.estimated?'estimated_wgs84':'verified_wgs84',sourceId:sid,target:p.target,original:`${p.lng}, ${p.lat}; ${p.crs}`,method:p.crs==='GCJ-02'?'高德POI使用项目迭代反解转换WGS84；与机构所述地址核对':'WGS84地理实体区域参考点，与机构所述地点核对',sourceDatumExplicit:true,precision:{sourceUnit:'degree',resolutionDegrees:p.resolution||0.000001,horizontalAccuracyMeters:null},limitation:p.limitation||'陵址或景区区域参考点，不表示墓室实测中心或入口。'};
  if(p.estimated)x.coordinates.estimate={basis:p.basis,extent:p.target,confidence:'regional',reviewedAt:research.reviewedAt};
  x.sourceIds.push(sid);x.mapEligible=true;x.mapReason=p.target;
 }
};
