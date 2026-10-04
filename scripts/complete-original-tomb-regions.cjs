module.exports=({items,add,source})=>{
 const parent=items.find(x=>x.id==='han-zhongshan-dingzhou');
 source('dingzhou-jian-national','玉猪：定县北庄中山简王刘焉墓出土','中国国家博物馆','https://www.chnmuseum.cn/zp/zpml/201812/t20181218_24568.shtml','确认1959年北庄刘焉墓出土，不使用藏品馆位置定位原墓。');
 const rows=[
 ['han-zhongshan-jian','中山简王刘焉墓','刘焉','北庄子村',38.5351399,114.99393,88,'dingzhou-jian-national','Beizhuangzi+Village','0x35e5d5d95ace0539:0x344ddead77076abd','11rg8vsydg','1959年发掘的北庄子墓；墓区地望与墓主由考古及机构藏品资料支持。'],
 ['han-zhongshan-mu','中山穆王刘畅墓','刘畅','北陵头村',38.4873799,114.9829,174,'han-feudal-dingzhou','Beilingtou+Village','0x35e67f3bde3bdd17:0xfb58cc39678224b6','11nnnnzt31','定州地方文化资料记载北陵头村刘畅夫妻合葬墓，1969年发掘；不另列王后墓。']
 ];
 for(const [id,name,owner,village,lat,lng,year,evidenceSource,place,entity,gid,evidence] of rows){
  const sid=id+'-region';
  source(sid,village+'原址区域地理参考','Google Maps公开地理实体',`https://www.google.com/maps/place/${place}/data=!4m6!3m5!1s${entity}!8m2!3d${lat}!4d${lng}!16s%2Fg%2F${gid}`,'可见页面核对定州市村名；村域代表点，非墓坑测绘点，来源未明示坐标基准。');
  const x=add(id,name,'秦汉','东汉',owner,'河北省定州市'+village,evidenceSource+','+sid,{parentId:parent.id,rulerCategory:'feudal_king',scopeBasis:'汉代中山国诸侯王；合葬王后仅在说明中记录',recognition:'archaeological',evidence,periodText:'东汉',chronology:{sortYear:year,basis:'墓主卒年排序参照'},disputes:['点位表示原墓所在地村域，墓坑中心和入口尚未配准；不用于墓室导航。','城内中山汉墓、石刻馆及迁移陈列的黄肠石不能替代本项原址。'],reviewTasks:['取得发掘平面或文保界址，配准原墓坑中心；核对现存遗迹与可达入口']});
  x.coordinates={lat:Math.round(lat*1000)/1000,lng:Math.round(lng*1000)/1000,crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target:village+'原墓所在区域参考',original:`Google Maps实体 ${lat},${lng}；基准未明示`,method:'机构资料确认原墓所在地村名，核对同名现代村域实体；取村域参考而非推定墓室中心',sourceDatumExplicit:false,precision:{sourceUnit:'degree',resolutionDegrees:0.001,horizontalAccuracyMeters:null},limitation:'村域及周边约1.5公里参考范围；不是墓坑中心、入口或实测精度，原墓相对村界位置仍待配准。',estimate:{basis:'原墓村名与定州市现代地图实体相符；不采用迁建展馆',extent:'村域及周边约1.5公里',confidence:'regional',reviewedAt:'2026-10-04'}};
  x.mapEligible=true;x.mapReason=x.coordinates.target;
 }
 parent.locationReview={reviewedAt:'2026-10-04',status:'partly_georeferenced',reason:'已分别补北庄子刘焉墓、北陵头刘畅墓村域参考；陵群不连续，不设总中心。八角廊、三盘山等其余墓区仍待逐区配准。',nextStep:'继续核对八角廊M40、三盘山M120—122及陵北M137原墓区，避免使用城内展馆位置',sourceIds:[...parent.sourceIds,'dingzhou-jian-national']};
 parent.sourceIds.push('dingzhou-jian-national');parent.mapReason=parent.locationReview.reason;parent.reviewTasks=[parent.locationReview.nextStep];
 const dawu=items.find(x=>x.id==='han-qi-dawu');dawu.locationReview.reason+='；本轮地图查询误匹配周村古商城，已排除，未采用该点。';
};
