module.exports=({items,add,source})=>{
 source('ming-shu-local','东山风物：东山上的王坟','龙泉驿地方文化政务发布','https://www.thepaper.cn/newsDetail_forward_14540389','僖王圹志与发掘、昭王陵1992年迁建、成王陵未发掘；昭王生卒与其他资料矛盾，本轮不采用。');
 source('ming-shu-research','明藩王墓考证','故宫博物院《故宫学刊》2009','https://www.dpm.org.cn/Uploads/File/2019/12/15/u5df5eae7554e5.pdf','藩王墓考古与形制研究；不把所有俗称皇坟视为帝陵。');
 source('ming-shu-map','明蜀王陵博物馆地理实体','OpenStreetMap／Mapcarta','https://mapcarta.com/W595411414','OSM way595411414，馆区代表点30.64618,104.18675；不是整个分散陵群边界。');
 source('ming-shu-xi-map','僖王陵地宫地理实体','OpenStreetMap／Mapcarta','https://mapcarta.com/N5674752491','OSM node5674752491，historic=tomb，30.64646,104.18753；非测绘坐标。');
 source('ming-shu-photo','明蜀王陵博物馆现场照片与拍摄坐标','Nekitarc／Wikimedia Commons','https://commons.wikimedia.org/wiki/File:明蜀王陵博物馆.JPG','作者2014年实拍EXIF位置30.645506,104.186649，用于交叉核对馆区，拍摄位置不是墓室中心。');
 source('ming-lujian-official','潞王陵：墓主与生卒','新乡纪检监察政务网站','https://www.nydi.gov.cn/sitesources/xxjjjcw/page_pc/zmmy/article3ae978d37069405cb4d18f0ca68e49f6.html','朱翊镠1568—1614；王墓、次妃墓与神道共同组成景区。');
 source('ming-lujian-heritage','潞简王墓世界遗产预备名单申报','国家文物局／UNESCO','https://whc.unesco.org/en/tentativelists/5351/','2008年提交的预备名单，非已列入世界遗产；墓主、1615年建成与陵区地望。');
 source('ming-lujian-map','潞简王墓地理实体坐标','Wikidata地理实体Q17033385／Wikimedia Commons','https://commons.wikimedia.org/wiki/Category:Mausoleum_of_the_Prince_Jian_of_Lu','结构化地理实体坐标35°25′09.16″N、113°55′13.26″E；仅作为陵区参考，墓主据官方与申报资料。');
 const point=(x,lat,lng,sid,target,original,extent)=>{
  x.coordinates={lat,lng,crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target,original,method:'官方地望与公开地理实体交叉核对，保留为区域参考点',sourceDatumExplicit:false,precision:{sourceUnit:'degree',resolutionDegrees:.001,horizontalAccuracyMeters:null},limitation:extent+'；非测绘误差、保护边界或精确墓室中心。',estimate:{basis:'机构资料确认陵名与地望，公开地理实体提供区域锚点',extent,confidence:'regional',reviewedAt:'2026-10-04'}};x.mapEligible=true;x.mapReason=target;
 };
 const g=add('ming-shu-cemetery','明蜀王陵','明','明（蜀藩）','','四川省成都市龙泉驿区十陵街道','ming-shu-local,ming-shu-research,ming-shu-map,ming-shu-photo',{recordType:'group',nature:'mixed',rulerCategory:'feudal_king',evidence:'明蜀藩王家族分散墓区；博物馆以僖王陵为中心，含迁建昭王陵展示。',chronology:{sortYear:1434,basis:'馆区主陵墓主卒年'},disputes:['地图点指向博物馆核心园区，不代表各代蜀王墓均在馆内；王妃墓不单列。'],reviewTasks:['继续逐陵配准成王、惠王、黔江王等分散墓址']});
 point(g,30.646,104.187,'ming-shu-map','明蜀王陵博物馆核心园区参考','OSM way595411414：30.64618,104.18675；现场照片位置交叉核对','核心馆区约500米范围');
 const xi=add('ming-shu-xi','蜀僖王陵','明','明（蜀藩）','蜀僖王朱友壎','四川省成都市龙泉驿区十陵街道大梁山','ming-shu-local,ming-shu-research,ming-shu-xi-map',{parentId:g.id,rulerCategory:'feudal_king',recognition:'archaeological',aliases:['明蜀僖王墓','朱友埙墓'],evidence:'清理发掘及原地宫《大明蜀僖王圹志》支持墓主认定；不是蜀汉帝陵。',chronology:{sortYear:1434,basis:'卒年；次年入葬'},reviewTasks:['核对地宫临时开放公告与测绘位置']});
 point(xi,30.646,104.188,'ming-shu-xi-map','僖王陵原址地宫所在区域','OSM node5674752491：30.64646,104.18753','原地宫附近约200米范围');
 xi.visitorAccess={status:'documented_visitable',originalChamber:true,mode:'original_chamber',note:'原址僖王陵地宫有参观记录；具体开放、修缮与限流以馆方公告为准。',sourceIds:['ming-shu-local'],reviewedAt:'2026-10-04'};
 const z=add('ming-shu-zhao','蜀昭王陵（迁建展示）','明','明（蜀藩）','蜀昭王朱宾瀚','四川省成都市龙泉驿区十陵街道明蜀王陵博物馆（展示地）；原址大面白鹤村','ming-shu-local,ming-shu-research',{parentId:g.id,rulerCategory:'feudal_king',recognition:'archaeological',evidence:'1991年建设工程中发现，1992年迁至僖王陵园区复原展示；原址与现展示地分开说明。',disputes:['地方文章生卒1480—1508与其他年表有差异，暂不填精确生卒。'],reviewTasks:['取得白鹤村原址发掘平面及搬迁档案，配准原墓址']});
 z.locationReference={parentId:g.id,target:'博物馆内迁建展示区域',reason:'共享现展示园区位置；不把迁建点当作原墓址'};z.mapReason=z.locationReference.reason;
 z.visitorAccess={status:'not_qualified',originalChamber:false,mode:'relocated_display',note:'可参观迁建复原展示，按原址地宫口径不纳入仅显示可参观地宫。',sourceIds:['ming-shu-local'],reviewedAt:'2026-10-04'};
 const lu=add('ming-lujian','潞简王陵','明','明（潞藩）','潞简王朱翊镠','河南省新乡市凤泉区凤凰山南麓','ming-lujian-official,ming-lujian-heritage,ming-lujian-map',{rulerCategory:'feudal_king',aliases:['潞王陵','潞简王墓'],evidence:'官方及国家文物局预备名单申报确认墓主；陵区包括王墓、次妃墓与神道，不将次妃墓另计王陵。',chronology:{sortYear:1614,basis:'墓主卒年；1615年建成'},disputes:['与金门南明监国鲁王朱以海墓为不同人物和陵址。'],reviewTasks:['配准东陵王墓本体；核查地宫开放，景区开放不等同地宫开放']});
 point(lu,35.419,113.920,'ming-lujian-map','潞简王陵园区域参考','Q17033385：35°25′09.16″N、113°55′13.26″E','潞王陵园约500米范围');
};
