module.exports=({items,source})=>{
 const fs=require('node:fs'),path=require('node:path');
 const r=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/imperial-tombs/modern-location-research.json'),'utf8').replace(/^\uFEFF/,''));
 for(const [id,q,target] of [['modern-zhongshan','Q1338405','中山陵陵寝建筑区域（非园区入口）'],['modern-mao-hall','Q1154819','毛主席纪念堂建筑区域（非瞻仰入口）'],['peng-hengshui','Q18165254','横北倗国墓地区域（非国君墓室中心）']]){
  const claim=r.entities[q].claims.P625.find(x=>x.mainsnak.datavalue?.value.globe==='http://www.wikidata.org/entity/Q2');if(!claim)throw Error('No Earth point: '+q);const v=claim.mainsnak.datavalue.value,x=items.find(x=>x.id===id),sid='geo-more-'+q;
  source(sid,target+'：WGS84参考点','Wikidata P625 Earth','https://www.wikidata.org/wiki/'+q,'原始声明存于modern-location-research.json；与机构地点描述核对，不作现场测绘精度声明。');
  x.coordinates={lat:v.latitude,lng:v.longitude,crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target,original:claim.id,method:'地理实体P625 Earth声明与机构所述所在地核对，采用区域参考位置',sourceDatumExplicit:true,precision:{sourceUnit:'degree',resolutionDegrees:v.precision,horizontalAccuracyMeters:null},estimate:{basis:'机构地点描述与独立地理实体交叉核对',extent:target,confidence:'site',reviewedAt:'2026-10-03'},limitation:'社区地理参考点，非入口、棺位或墓室实测中心，小数精度不等于测量准确度。'};x.mapEligible=true;x.mapReason='已补可复核WGS84区域参考点';x.sourceIds.push(sid);x.reviewTasks=['补核现场入口、陵体或墓室中心及实测精度'];
  if(id==='peng-hengshui')x.sourceIds.push('geo-modern-hengbei');
 }
};
