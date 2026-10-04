// Reviewed regional estimates; cemetery anchors never become individual tomb centres.
module.exports = ({items, source}) => {
  const fs=require('node:fs'),path=require('node:path');
  const research=require('../data/imperial-tombs/missing-location-wikidata.json');
  const byId=new Map(items.map(x=>[x.id,x]));
  function estimate(id,lng,lat,sid,target,basis,extent,original,resolution=0.00001) {
    const x=byId.get(id);if(!x||x.coordinates)throw Error('Unexpected location replacement: '+id);
    x.coordinates={lat,lng,crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target,original,
      method:basis,verificationScope:'机构所述地点与地理实体对应；仅区域浏览',sourceDatumExplicit:false,
      precision:{sourceUnit:'degree',resolutionDegrees:resolution,horizontalAccuracyMeters:null},
      estimate:{basis,extent,confidence:'regional',reviewedAt:'2026-10-03'},
      limitation:`估计位置：${basis}。参考范围：${extent}；并非实测墓室中心或入口。`};
    x.mapEligible=true;x.mapReason='已补有地点依据的区域估计，保留墓主与墓址争议';
    x.reviewTasks.unshift('补核墓室、入口、坐标基准与现场精度');
    if(!x.sourceIds.includes(sid))x.sourceIds.push(sid);
  }
  for(const [id,q,target,extent] of [
    ['wei-xizhu-m2','Q131522427','西朱村曹魏墓遗址区域（M2独立中心待核）','西朱村曹魏墓遗址范围；M1、M2等墓号不能共用为精确中心'],
    ['ba-dahekou','Q133309238','大河口遗址国君墓地区域','大河口村北台地墓地及遗址范围，非霸伯单墓中心'],
    ['rui-liujiawa','Q133309358','刘家洼遗址区域（芮国国君墓区待细化）','约2公里×1.5公里遗址范围；不是新建博物馆点，也未对应M1/M2中心'],
    ['early-xingan','Q400087','大洋洲程家商代大墓遗址区域','程家村涝背沙丘原址周边，社区坐标精度约0.01度，仅千米级参考'],
    ['zhou-lingpo','Q991847','周公庙遗址区域（陵坡墓地参考）','周公庙考古遗址与陵坡墓地区域；不将周公庙建筑或遗址中心认作王陵中心'],
    ['houjin-xian','Q10566151','后晋显陵遗址区域参考点','宜阳县盐镇镇石陵村西陵址；封土中心与入口待测']
  ]) {
    const claim=research.entities[q]?.claims?.P625?.find(c=>c.mainsnak.datavalue?.value.globe==='http://www.wikidata.org/entity/Q2');
    if(!claim)throw Error('Missing Earth coordinate '+q);
    const v=claim.mainsnak.datavalue.value,sid='geo-missing-'+q;
    source(sid,target+'：WGS84地理声明','Wikidata P625 Earth','https://www.wikidata.org/wiki/'+q,'原始坐标语句保存于missing-location-wikidata.json；社区地理资料不证明墓主或测绘精度。');
    estimate(id,v.longitude,v.latitude,sid,target,'已有考古或文保来源确定地点，P625 Earth仅提供对应遗址区域参考位置',extent,`${v.latitude}, ${v.longitude}; ${claim.id}`,v.precision);
    byId.get(id).coordinates.sourceDatumExplicit=true;
  }
  source('geo-missing-gong','唐恭陵遗址地理点','OpenStreetMap（Mapcarta索引）','https://mapcarta.com/W1181733471','OSM WGS84坐标；与河南省帝陵保护规划所列唐恭陵交叉核对，索引误写郑州不作为行政区依据。');
  estimate('tang-gong',112.81102,34.63326,'geo-missing-gong','偃师唐恭陵遗址区域','OSM陵墓实体坐标与河南省保护规划交叉核对，行政区采用偃师缑氏镇','唐恭陵陵址，非唐昭宗和陵；墓室中心与入口待测','34.63326,112.81102; OSM way 1181733471');
  source('geo-missing-zhoushan','周山森林公园区域位置','OpenStreetMap（Mapcarta索引）','https://mapcarta.com/W911813223','只作周山王陵区域参考；不是昆明同名周山，不是已确认某王墓室。');
  estimate('zhou-zhoushan',112.37832,34.6285,'geo-missing-zhoushan','洛阳周山王陵区区域参考','东周王城研究提出周山王陵区，采用周山森林公园地理范围作区域参考','周山森林公园及周边王陵区域，约千米级；不证明各王陵同处一点','34.6285,112.37832; OSM way 911813223');
  const vm=require('node:vm'),ctx={};vm.createContext(ctx);
  const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
  const conversion=app.slice(app.indexOf('function isCoordinateInChina('),app.indexOf('function ',app.indexOf('function gcjToWgs(')+10));
  vm.runInContext(conversion,ctx);
  const wangcheng=ctx.gcjToWgs(112.444618,34.671369);
  source('geo-missing-wangcheng','周王城广场区域位置','高德地图','https://www.amap.com/place/B017B02G5U','原GCJ-02坐标转换为WGS84；仅指王城广场、体育场路春秋王陵区参考区域，非单墓中心。');
  estimate('zhou-wangcheng',wangcheng[0],wangcheng[1],'geo-missing-wangcheng','王城广场—体育场路王陵区域参考','东周王城研究明确春秋王陵区地望，以广场POI经GCJ-02反解作区域参考','王城广场至体育场路约千米级范围；不把广场车马坑认作某一周王墓室','112.444618,34.671369; GCJ-02');
  source('geo-missing-majiayuan','马家塬墓地地理环境与位置','甘肃省文物局公开文章（搜狐政务转载）','https://www.sohu.com/a/521455216_121106869','文物局所述北纬35°04′58″、东经106°17′15″；原文未标坐标基准，保留区域估计。');
  estimate('rong-majiayuan',106+17/60+15/3600,35+4/60+58/3600,'geo-missing-majiayuan','桃园村北马家塬墓地区域','文物局公开墓地经纬度按WGS84作区域估计，原坐标基准尚待核','桃园村北约200米、约3万平方米墓地及周边；基准不明不声称实测误差','35°04′58″N,106°17′15″E; datum unspecified',1/3600);
  byId.get('rong-majiayuan').disputes.push('网络另有35.046173,106.167438的遗址索引，距文物局所述地点较远；本次采用文物局地理描述作区域估计，保留冲突待核。');
  // Add only supported membership references. Wide, discontinuous umbrella groups are excluded.
  for(const x of items.filter(x=>!x.coordinates&&!x.locationReference&&x.parentId)) {
    const p=byId.get(x.parentId);if(!p?.coordinates)continue;
    x.locationReference={parentId:p.id,status:'shared_region_estimate',target:p.name+'所属陵区参考（非独立单墓位置）',
      basis:'目录考古或文保资料明确所属陵群；仅关联已定位陵区，不生成复制的单陵地图点。',
      limitation:p.coordinates.limitation};
  }
  const report={reviewedAt:'2026-10-03',newRegionalPoints:items.filter(x=>x.coordinates?.sourceId?.startsWith('geo-missing-')).map(x=>x.id),
    withIndependentOrRegionalPoint:items.filter(x=>x.coordinates).length,
    sharedCemeteryReferences:items.filter(x=>!x.coordinates&&x.locationReference).map(x=>x.id),
    unresolved:items.filter(x=>!x.coordinates&&!x.locationReference).map(x=>({id:x.id,name:x.name,admin:x.admin,reason:x.recordType==='group'?'广域陵群不应任取一座陵或城市中心代表':x.reviewTasks.join('；')}))};
  fs.writeFileSync(path.join(__dirname,'../data/imperial-tombs/location-completion-audit.json'),JSON.stringify(report,null,2)+'\n');
  const decisionsPath=path.join(__dirname,'../data/imperial-tombs/coordinate-decisions.json');
  const decisions=JSON.parse(fs.readFileSync(decisionsPath,'utf8'));
  decisions.approved=items.filter(x=>x.mapEligible).map(x=>x.id);
  decisions.supplementalApproved=items.filter(x=>x.mapEligible&&!decisions.wikidataApproved.includes(x.id)).map(x=>({id:x.id,sourceId:x.coordinates.sourceId,method:x.coordinates.method}));
  fs.writeFileSync(decisionsPath,JSON.stringify(decisions,null,2)+'\n');
};
