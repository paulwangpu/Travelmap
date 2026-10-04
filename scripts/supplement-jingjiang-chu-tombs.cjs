module.exports=({items,add,source})=>{
 source('jingjiang-layout','靖江王陵概况：十一陵分区与营建次序','桂林市靖江王陵文物管理处','https://guilinjjwl.cn/col.jsp?id=106','南区九陵同兆域；宪定、荣穆二陵另辟北部山坡，不能套用南区位置。营建年份不当作墓主卒年。');
 source('jingjiang-remains','靖江王陵考古遗存','桂林市靖江王陵文物管理处','https://guilinjjwl.cn/col.jsp?id=115','陵区有石刻、圹志与发掘资料；未据陵群概述断言每座墓均经发掘或可进入地宫。');
 source('jingjiang-museum-map','靖江王陵博物馆地理实体','OpenStreetMap／Mapcarta','https://mapcarta.com/N13624320360','OSM node13624320360：25.2944,110.3595；馆区锚点，不是桂林市中心王府。');
 source('jingjiang-ansu-map','靖江安肃王陵地理实体','OpenStreetMap／Mapcarta','https://mapcarta.com/W1246289474','OSM way1246289474：25.29607,110.34886，landuse=cemetery。');
 source('jingjiang-zhaohe-map','靖江昭和王陵地理实体','OpenStreetMap／Mapcarta','https://mapcarta.com/W1246289471','OSM way1246289471：25.29301,110.35224，landuse=cemetery；不同于楚昭王、蜀昭王墓。');
 source('jingjiang-closure-2026','靖江王陵闭园公告（2026年7月28日）','桂林市靖江王陵文物管理处／广西新闻网','https://www.gxnews.com.cn/staticpages/20260729/newgx6a69be39-21975401.shtml','景区2026年7月28日至11月30日全域暂停开放，修缮及安防升级；恢复另行公告，不能由结束日期推断已经恢复。');
 source('chu-zhao-official','龙泉山昭王寝：朱桢生卒与安葬','武汉东湖新技术开发区管委会','https://www.wehdz.gov.cn/2022/ztzl_75799/gggzh/lqsfjq/ywtj/202407/t20240723_2432574.shtml','朱桢生于1364年，卒于1424年；同年葬龙泉山天马峰下。');
 source('chu-zhao-map','明楚昭王墓地理实体','OpenStreetMap／Mapcarta','https://mapcarta.com/W1092797641','OSM way1092797641：30.41115,114.51463；陵园区域，不是邻近现代龙泉山孝恩园或樊哙墓。');
 const point=(x,lat,lng,sid,target,raw,extent)=>{
  x.coordinates={lat,lng,crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target,original:raw,method:'核对管理机构地望及同名公开地理实体，取三位小数区域锚点',sourceDatumExplicit:false,precision:{sourceUnit:'degree',resolutionDegrees:.001,horizontalAccuracyMeters:null},limitation:extent+'；非实测墓室中心、保护边界或测量误差。',estimate:{basis:'管理机构确认陵区位置与公开地理实体交叉核对',extent,confidence:'regional',reviewedAt:'2026-10-04'}};x.mapEligible=true;x.mapReason=target;
 };
 const g=add('ming-jingjiang-south','靖江王陵南区（九陵）','明','明（靖江藩）','','广西壮族自治区桂林市尧山西麓靖江王陵南区','jingjiang-layout,jingjiang-remains,jingjiang-museum-map,jingjiang-closure-2026',{recordType:'group',nature:'mixed',rulerCategory:'feudal_king',mapLabel:'靖江王陵',evidence:'管理处将南区九座王陵列为同兆域紧密分布墓区；北面的宪定、荣穆二陵不包含在此点。',chronology:{sortYear:1408,basis:'南区首陵营建年，非墓主卒年'},disputes:['只覆盖南区九陵；不将整个百余平方公里宗室墓区或市中心靖江王府混作同一坐标。'],reviewTasks:['继续配准南区各单陵及北部宪定、荣穆二陵；核对墓主圹志与生卒']});
 point(g,25.294,110.360,'jingjiang-museum-map','靖江王陵南区，以博物馆为参访锚点','OSM node13624320360：25.2944,110.3595','馆区及西北、西侧南区九陵约1.5公里参考范围');
 const rows=[['daoxi','悼僖',1408],['huaishun','怀顺',1458],['zhuangjian','庄简',1471],['zhaohe','昭和',1489],['duanyi','端懿',1516],['ansu','安肃',1525],['gonghui','恭惠',1572],['kangxi','康僖',1582],['wenyu','温裕',1590]];
 for(const [key,title,year] of rows){
  const x=add('ming-jingjiang-'+key,'靖江'+title+'王陵','明','明（靖江藩）','靖江'+title+'王','广西壮族自治区桂林市尧山西麓靖江王陵南区','jingjiang-layout,jingjiang-remains,jingjiang-closure-2026',{parentId:g.id,rulerCategory:'feudal_king',evidence:'陵名和南区所属关系据陵墓管理机构记录；墓主人名、生卒及各陵发掘程度待逐一核对圹志。',chronology:{sortYear:year,basis:'管理机构记载营建年份，仅用于排序，不作为卒年'},reviewTasks:['核对单陵圹志、生卒及原墓室平面']});
  if(key==='ansu'||key==='zhaohe'){
   const isAnsu=key==='ansu',sid=isAnsu?'jingjiang-ansu-map':'jingjiang-zhaohe-map';x.sourceIds.push(sid);
   point(x,isAnsu?25.296:25.293,isAnsu?110.349:110.352,sid,'靖江'+title+'王陵遗址所在区域',isAnsu?'OSM way1246289474：25.29607,110.34886':'OSM way1246289471：25.29301,110.35224','该陵遗址附近约300米范围');
  }else{
   x.locationReference={parentId:g.id,target:'靖江王陵南区共同参考；单陵中心尚未配准',reason:'管理机构确认同一南区兆域，关联陵区点，不生成重叠单陵点',limitation:'不是单陵墓室中心；不用于指引进入未开放墓葬'};x.mapReason=x.locationReference.reason;
  }
  x.visitorAccess={status:'closure_reported',originalChamber:false,note:'2026年7月28日至11月30日全域暂停开放，恢复另行公告；陵园或遗址展示不等于可进入原地宫。',sourceIds:['jingjiang-closure-2026'],reviewedAt:'2026-10-04'};
 }
 g.visitorAccess={status:'closure_reported',originalChamber:false,note:'2026年7月28日至11月30日闭园实施文保工程，恢复另行公告；不纳入原址地宫参观筛选。',sourceIds:['jingjiang-closure-2026'],reviewedAt:'2026-10-04'};
 const chu=add('ming-chu-zhao','楚昭王墓','明','明（楚藩）','楚昭王朱桢','湖北省武汉市龙泉山天马峰下','chu-zhao-official,chu-zhao-map',{rulerCategory:'feudal_king',aliases:['昭王寝','明楚昭王墓'],evidence:'地方管理机构记载第一代楚王朱桢1424年葬于龙泉山；与战国楚王墓及成都蜀昭王陵区分。',chronology:{sortYear:1424,basis:'墓主卒年'},reviewTasks:['核查原地宫游客开放范围及测绘位置']});
 point(chu,30.411,114.515,'chu-zhao-map','楚昭王陵园遗址区域','OSM way1092797641：30.41115,114.51463','楚昭王陵园约500米参考范围');
};
