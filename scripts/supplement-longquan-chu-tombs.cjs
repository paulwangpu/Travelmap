module.exports=({items,add,source})=>{
 source('chu-nine-official','龙泉山明楚王墓群：九座王寝','武汉东湖新技术开发区管委会','https://www.wehdz.gov.cn/2022/ztzl_75799/gggzh/lqsfjq/','列昭、庄、宪、康、靖、端、愍、恭、贺九寝；陵群存在不等于每座均已确认实葬或开放地宫。');
 source('chu-nine-history','龙泉胜地、楚藩陵寝','武汉出版社','https://www.whcbs.com/Upload/BookReadFile/202002/8b82d97fb9a04dc9bdbf809976ce63cd/ops/chapter008.html','龙泉山环山盆地内的楚藩九寝；采用陵区地望，不据概述编造单陵墓室中心。');
 const points={kang:[30.404,114.516,'1238798885','30.40424,114.51634'],duan:[30.403,114.522,'1227489694','30.40257,114.52214'],gong:[30.408,114.523,'1227489693','30.40776,114.52262']};
 for(const [key,p] of Object.entries(points))source('chu-'+key+'-map','明楚'+({kang:'康',duan:'端',gong:'恭'}[key])+'王墓地理实体','OpenStreetMap／Mapcarta','https://mapcarta.com/W'+p[2],'OSM way'+p[2]+'：'+p[3]+'；陵园区域参考，非实测墓室中心。');
 const zhao=items.find(x=>x.id==='ming-chu-zhao');
 const g=add('ming-chu-cemetery','明楚王墓群','明','明（楚藩）','','湖北省武汉市龙泉山天马峰、玉屏峰之间','chu-nine-official,chu-nine-history,chu-zhao-map',{recordType:'group',nature:'mixed',rulerCategory:'feudal_king',evidence:'地方管理机构列九座楚王寝园；单陵归属此群，群与子陵不相加统计。',chronology:{sortYear:1424,basis:'首代楚昭王卒年作为陵群排序参照'},reviewTasks:['核对九寝测绘图及尚无独立坐标的单陵；逐一核对圹志与生卒']});
 g.coordinates=JSON.parse(JSON.stringify(zhao.coordinates));g.coordinates.target='明楚王墓群，以楚昭王陵园为区域锚点';g.coordinates.limitation='锚点位于昭王寝；仅关联龙泉山九寝，不能当作全部单陵墓室中心或陵群保护边界。';g.coordinates.estimate.extent='天马峰、玉屏峰间九寝所在盆地，约3公里区域参考';g.mapEligible=true;g.mapReason=g.coordinates.target;
 zhao.parentId=g.id;zhao.sourceIds.push('chu-nine-official');
 for(const [key,title] of [['zhuang','庄'],['xian','宪'],['kang','康'],['jing','靖'],['duan','端'],['min','愍'],['gong','恭'],['ding','定']]){
  const last=key==='ding';
  const x=add('ming-chu-'+key,'楚'+title+'王'+(last?'寝园':'墓'),'明','明（楚藩）','楚'+title+'王','湖北省武汉市龙泉山明楚王墓群','chu-nine-official,chu-nine-history',{parentId:g.id,rulerCategory:'feudal_king',nature:last?'unknown':'actual_burial',aliases:last?['贺王寝','楚贺王墓']:['明楚'+title+'王墓'],evidence:'机构列名的楚藩王寝园；此条不据陵群概述判断墓室发掘、盗掘或开放情况。',disputes:last?['地方称贺王寝；寝园存在与末代楚王是否实际入葬须分别核查，不将建寝直接写成确认实葬。']:[],reviewTasks:['核对单陵圹志、墓主人名、生卒及地宫状况']});
  if(points[key]){
   const [lat,lng,way,raw]=points[key],sid='chu-'+key+'-map';x.sourceIds.push(sid);
   x.coordinates={lat,lng,crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target:'楚'+title+'王寝园所在区域',original:'OSM way'+way+'：'+raw,method:'机构确认陵区及陵名，交叉核对公开地理实体，采用三位小数区域锚点',sourceDatumExplicit:false,precision:{sourceUnit:'degree',resolutionDegrees:.001,horizontalAccuracyMeters:null},limitation:'陵园附近区域估计，非实测墓室中心；公开地图同名标注仍须保护单位测绘图复核。',estimate:{basis:'管理机构九寝名录与龙泉山内同名地理实体',extent:'对应寝园附近约500米参考范围',confidence:'regional',reviewedAt:'2026-10-04'}};x.mapEligible=true;x.mapReason=x.coordinates.target;
   if(key==='kang')x.disputes.push('公开地图在端王寝附近另有同名康王墓标注；暂采用九寝西部实体，仅作为区域估计，不认定另一标注为第二座康王墓。');
  }else{
   x.locationReference={parentId:g.id,target:'明楚王墓群共同参考，单陵中心待配准',reason:'机构确认所属九寝，关联陵群点，不复制为重叠单陵地图点',limitation:'昭王寝锚点不是本陵墓室中心'};x.mapReason=x.locationReference.reason;
  }
 }
};
