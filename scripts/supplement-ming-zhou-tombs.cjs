module.exports=({add,source})=>{
 source('ming-zhou-protection','明周王墓保护范围（豫文物〔2018〕278号）','河南省文物局、河南省住房和城乡建设厅','https://wgl.kaifeng.gov.cn/kfswhgdhlyj/swgljwbdw/1805436537969889280/M71CbQHO.pdf','明确无梁镇王家行政村西北部明山东坡，分别规定定、恭、端王墓及妃子墓保护范围。');
 source('ming-zhou-entity','明周定王陵地理实体 Q15939949','Wikimedia Commons／Wikidata','https://commons.wikimedia.org/wiki/Category:Mausoleum_of_the_Prince_Ding_of_Zhou','实体坐标34°18′15.3″N、113°35′02.33″E；仅作区域估计，与官方地望核对，不是实测地宫坐标。');
 const admin='河南省许昌市禹州市无梁镇王家行政村西北部明山东坡';
 const g=add('ming-zhou-cemetery','明周王墓群','明','明（周藩）','',admin,'ming-zhou-protection,ming-zhou-entity',{recordType:'group',nature:'mixed',rulerCategory:'feudal_king',evidence:'官方保护文件分别列周定王、周恭王、周端王墓；群与子墓建立所属关系，妃子墓只在群说明中记录。',disputes:['旧地图缓存34.142065,113.482199且称周悼王，与本次官方地望及周定王实体冲突，不采用。'],reviewTasks:['配准恭王、端王独立墓址及完整保护边界']});
 const p={lat:34.304,lng:113.584,crs:'WGS84',status:'estimated_wgs84',sourceId:'ming-zhou-entity',target:'明周定王陵园所在区域',original:'34°18′15.3″N、113°35′02.33″E',method:'官方明山东坡地望与同名陵墓实体交叉核对，采用三位小数区域锚点',sourceDatumExplicit:false,precision:{sourceUnit:'degree',resolutionDegrees:.001,horizontalAccuracyMeters:null},limitation:'公开实体坐标未获实测坐标基准说明；仅作陵园区域估计，不能视作地宫入口或恭、端王墓中心。',estimate:{basis:'官方保护范围地望与周定王陵实体',extent:'周定王陵园及附近区域参考，非完整陵群边界',confidence:'regional',reviewedAt:'2026-10-04'}};
 g.coordinates={...p,target:'明周王墓群，以周定王陵园为区域锚点'};g.mapEligible=true;g.mapReason=g.coordinates.target;
 for(const [key,title,name] of [['ding','定','周定王朱橚'],['gong','恭','周恭王'],['duan','端','周端王']]){
  const x=add('ming-zhou-'+key,'明周'+title+'王墓','明','明（周藩）',name,admin,'ming-zhou-protection'+(key==='ding'?',ming-zhou-entity':''),{parentId:g.id,rulerCategory:'feudal_king',evidence:'官方保护范围单列此王墓；明代周藩，与先秦周天子陵墓分别收录。',reviewTasks:['核对墓志生卒及当期开放情况']});
  if(key==='ding'){x.coordinates=JSON.parse(JSON.stringify(p));x.mapEligible=true;x.mapReason=p.target;}
  else{x.locationReference={parentId:g.id,target:'明周王墓群共同参考，单墓中心待配准',reason:'官方确认属于同一保护项目，关联陵群区域点',limitation:'周定王陵园锚点不是本墓中心'};x.mapReason=x.locationReference.reason;x.reviewTasks.push('配准本墓独立位置');}
 }
};
