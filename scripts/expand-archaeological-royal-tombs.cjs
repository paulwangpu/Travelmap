// Royal burials and explicitly labelled search areas, not a general archaeology layer.
module.exports=({items,add,group,source})=>{
 source('shu-tentative','古蜀文明遗址预备名单：三星堆、金沙及船棺合葬墓坐标','UNESCO（中国提交资料）','https://whc.unesco.org/en/tentativelists/5816/','三处坐标均指遗址；不能证明三星堆、金沙王陵位置。');
 source('shu-royal-search','考古领队谈三星堆与金沙王陵寻找','新华社（冉宏林访谈）','https://www.xinhuanet.com/politics/2021-05/02/c_1127403924.htm','2021年访谈未发现大型王陵；不据此断言其后没有新发现。');
 source('shu-boat-museum','商业街船棺合葬墓及蜀王族归属推定','成都博物馆','https://www.cdmuseum.com/xinwen/201903/582.html');
 source('shu-majia-museum','新都战国木椁墓与古蜀王族遗珍','四川博物院（川观新闻发布）','https://cbgc.scol.com.cn/news/5640214','王族级别不等于已确认某位蜀王。');
 source('rui-national-museum','周风遗韵：梁带村与刘家洼芮国考古','中国国家博物馆','https://m.chnmuseum.cn/portals/0/web/zt/20191213zfyy/');
 source('rui-shanghai-museum','金玉华年：陕西韩城出土周代芮国文物珍品','上海博物馆','https://www.shanghaimuseum.net/mu/frontend/pg/m/article/id/R00003006');
 source('ba-dahekou-study','大河口西周墓地考古发现与综合研究','全国哲学社会科学工作办公室（课题组）','https://www.nopss.gov.cn/n1/2019/1212/c417361-31503279.html');
 source('ba-xiaotianxi-excavation','重庆涪陵小田溪墓群M15发掘收获','重庆市文物考古研究院','https://www.cqkaogu.cn/web/article/1420168865999982592/web/content_1420168865999982592.html','部分高等级墓可能晚于巴国灭亡，不能一律命名巴王陵。');
 source('ba-xiaotianxi-place','涪陵小田溪墓群地望','重庆市民政局','https://mzj.cq.gov.cn/sy_218/bmdt/mzyw/202403/t20240326_13082780.html');
 source('peng-research','倗伯、霸伯诸器与西周政权结构问题','《青铜器与金文》（张海，北京大学期刊平台）','https://ccj.pku.edu.cn/article/info?id=331094838','墓地国族归属与每一墓主身份分别核查。');
 source('rong-majiayuan','马家塬墓地与西戎首领墓研究','宁夏文物考古研究所','https://www.nxkg.org.cn/silukaogu/161.html','首领和贵族不能全部计为王；益门村戎王说为推定。');
 source('zhou-lingpo-study','晚商与西周时期墓道形制初识','中国社会科学网（考古研究论文）','https://www.cssn.cn/lsx/lsx_kgx/202210/t20221024_5552596.shtml','四墓道并非王陵的充分条件；周公及继承者享天子礼制是一种解释。');
 for(const [id,name,admin,period,year,lat,lng] of [
  ['shu-sanxingdui-search','三星堆（古蜀王陵探索区）','四川省德阳市广汉市三星堆遗址','夏商',-1200,30+59/60+38/3600,104+11/60+58/3600],
  ['shu-jinsha-search','金沙（古蜀王陵探索区）','四川省成都市青羊区金沙遗址','先秦跨期／未定',-1000,30+41/60+1/3600,104+41/3600]
 ]){
  const x=group(id,name,'先秦','古蜀',admin,'shu-tentative,shu-royal-search',{occupants:['古蜀王室（王陵尚未确认）'],nature:'unknown',recognition:'attributed',siteRole:'royal_burial_search_area',preqinPeriod:period,chronology:{sortYear:year,basis:'遗址文化年代约略排序，不是王陵建造年代'},evidence:'古蜀都邑及王权文化遗址，按王陵寻找线索收录；不是已经发现的王室墓地。',disputes:['尚未取得可确认王陵墓室及具体位置的资料；遗址坐标只供区域探索。','祭祀坑、器物埋藏坑不得当作王陵；不能据王都必有王陵的推测确定墓址。']});
  // Coordinates identify a known site, while the royal burial location remains unknown.
  point(x,lat,lng,'遗址区域参考（王陵位置未知）','遗址代表坐标，不限定潜在王陵搜索边界；周边数公里亦可能有墓地。');
 }
 const boat=add('shu-commercial-boat','商业街古蜀船棺合葬墓','先秦','古蜀','开明王族或蜀王（推定）','四川省成都市青羊区商业街58号','shu-boat-museum,shu-tentative',{recognition:'attributed',preqinPeriod:'战国',chronology:{sortYear:-400,basis:'战国早期约略年代'},evidence:'成都考古所发掘的大型多棺合葬墓；成都博物馆认为可能为开明王族甚至蜀王家族墓地。',disputes:['规模、葬具与随葬品支持王族级别推定，但没有确认具体蜀王姓名。','合葬棺具与陪葬人员不拆为多座蜀王陵。']});
 point(boat,30+40/60,104+3/60+19/3600,'商业街船棺墓遗址区域参考','区域约数百米，非单棺中心或现时入口。');
 add('shu-majia','新都马家战国大墓（疑似蜀王族墓）','先秦','古蜀','古蜀王族（墓主未定）','四川省成都市新都区原马家乡普东村一带','shu-majia-museum,shu-boat-museum',{recognition:'attributed',preqinPeriod:'战国',chronology:{sortYear:-350,basis:'战国早中期约略年代'},evidence:'四川博物院介绍战国最高规格木椁墓；成都博物馆将其列为古蜀王侯级别墓葬。',disputes:['不能凭王族级别确定具体蜀王；旧地名与现址尚须核对。']});
 group('rui-liangdaicun','梁带村芮国国君墓地','先秦','芮','陕西省韩城市梁带村、黄河西岸台塬','rui-national-museum,rui-shanghai-museum',{occupants:['芮国国君及王室成员（逐墓待核）'],recognition:'archaeological',preqinPeriod:'先秦跨期／未定',chronology:{sortYear:-800,basis:'西周晚期至春秋早期墓地约略排序'},evidence:'国家博物馆明确包括芮国国君墓；以国君陵区收录，不将全部贵族墓算作国君墓。',disputes:['跨西周、春秋；器物铭文、国君级别与具体历史人名的比定分别核查。']});
 group('rui-liujiawa','刘家洼芮国国君墓地','先秦','芮','陕西省渭南市澄城县王庄镇刘家洼、鲁家河东岸','rui-national-museum',{occupants:['芮国后期国君（姓名未定）'],recognition:'archaeological',preqinPeriod:'春秋',chronology:{sortYear:-700,basis:'春秋早期墓地约略年代'},evidence:'国家博物馆展示芮国后期都邑及严整墓地；国君墓、普通贵族墓和聚落分开看待。',disputes:['与韩城梁带村为不同遗址；不能把新建博物馆位置直接当作墓地位置。']});
 group('ba-dahekou','大河口霸国国君墓地','先秦','霸','山西省临汾市翼城县隆化镇大河口村','ba-dahekou-study',{occupants:['霸伯等国君（各墓对应待核）'],recognition:'archaeological',preqinPeriod:'西周',chronology:{sortYear:-900,basis:'西周墓地约略年代'},evidence:'课题组据大型墓葬及铭文认定霸伯为霸国国君，独立国族具有政治、军事、外交权利。',disputes:['霸仲为国君之弟，不能自动按国君单墓纳入；M1017、M2002逐墓身份需对应。']});
 group('peng-hengshui','横北倗国国君墓地（横水）','先秦','倗','山西省运城市绛县横水镇横北村北','peng-research',{occupants:['倗国国君及家族（身份对应待核）'],recognition:'attributed',preqinPeriod:'西周',chronology:{sortYear:-900,basis:'西周中期墓地约略年代'},evidence:'横水大型墓及倗伯铭文提供国族线索；倗国政治身份与逐墓对应仍须复核发掘简报。',disputes:['倗伯铭文不能证明所有大墓均为国君墓，毕姬墓只列陵群说明。']});
 group('ba-xiaotianxi','小田溪巴王族墓群（归属有争议）','先秦','巴','重庆市涪陵区白涛街道小田溪村、乌江西岸','ba-xiaotianxi-excavation,ba-xiaotianxi-place',{occupants:['巴族上层统治人物（逐墓身份未定）'],recognition:'attributed',preqinPeriod:'战国',chronology:{sortYear:-300,basis:'战国墓群主要时代；部分墓可能至秦汉'},evidence:'文物考古院确认巴文化高等级墓葬；旧称巴王墓群，部分墓可能属巴国灭亡后的上层统治人物。',disputes:['不能把群内所有墓都认定为在位巴王；M15检测年代跨度大，群内存在跨期。']});
 group('rong-majiayuan','马家塬西戎首领墓地（疑似王级墓）','先秦','西戎','甘肃省天水市张家川回族自治县木河乡桃园村马家塬','rong-majiayuan',{recognition:'attributed',preqinPeriod:'战国',chronology:{sortYear:-250,basis:'战国晚期至秦初墓地约略排序'},evidence:'考古研究所研究指出西戎首领及贵族墓地，高等级主墓按疑似君主级线索收录。',disputes:['未知具体国名、王号；一般贵族墓不单独纳入，战国晚期与秦初分期尚需逐墓处理。']});
 add('rong-yimen','益门村二号墓（疑似戎王墓）','先秦','西戎','西戎国君（学术推定，姓名未定）','陕西省宝鸡市渭滨区益门村','rong-majiayuan',{recognition:'attributed',preqinPeriod:'春秋',chronology:{sortYear:-650,basis:'春秋时期约略年代'},evidence:'考古研究所论文介绍因大量金器等高等级遗物而提出被秦灭西戎国君的认定。',disputes:['戎王说属于学术推定；不能从器物财富直接确定国君姓名或被秦灭国的具体事件。']});
 group('zhou-lingpo','周公庙陵坡墓地（王陵级别，墓主有争议）','先秦','西周','陕西省宝鸡市岐山县周公庙遗址陵坡','zhou-lingpo-study',{recognition:'attributed',preqinPeriod:'西周',chronology:{sortYear:-1000,basis:'西周墓地约略排序'},evidence:'考古研究讨论四墓道大墓及其等级；按周王室候选线索纳入。',disputes:['四墓道不能单独证明周天子陵；周公及继承者享天子礼制也是解释。','不与咸阳周陵或洛阳东周三处陵区合并。']});
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),ctx={};vm.createContext(ctx);
 vm.runInContext(app.slice(app.indexOf('function isCoordinateInChina('),app.indexOf('function ',app.indexOf('function gcjToWgs(')+10)),ctx);
 for(const [id,lat,lng,url,label,extent] of [
  ['rui-liangdaicun',35.511174,110.495511,'https://www.amap.com/place/B0FFITA0RW','梁带村芮国遗址博物馆','以原址博物馆为参考，周边约1公里陵区；非M27墓室中心。'],
  ['ba-xiaotianxi',29.553854,107.484306,'https://www.amap.com/place/B001793Q4H','小田溪巴王墓群','墓群区域约数百米；部分墓地环境已变化，不作为单墓或入口导航。']
 ]){
  const sid='geo-'+id;source(sid,label+'区域参考点','高德地图',url,'GCJ-02转换WGS84，区域参考位置标估。');
  const x=items.find(x=>x.id===id),p=ctx.gcjToWgs(lng,lat);
  point(x,p[1],p[0],label+'区域参考（估计）',extent);
  Object.assign(x.coordinates,{sourceId:sid,sourceDatumExplicit:true,original:`${lng}, ${lat}; GCJ-02`,method:'沿用项目GCJ-02迭代反解为WGS84；机构地望交叉核对，仅区域参考',estimate:{basis:'公开高德地理实体与机构考古地点相符；转换坐标并保留陵区范围不确定性',extent},limitation:extent});
 }
 function point(x,lat,lng,target,extent){
  x.coordinates={lat,lng,crs:'WGS84',status:'estimated_wgs84',sourceId:'shu-tentative',original:'UNESCO预备名单公布的度分秒遗址坐标',target,sourceDatumExplicit:false,method:'度分秒转换，作为WGS84近似区域参考；提交页未明示坐标基准',precision:{sourceUnit:'arcsecond',horizontalAccuracyMeters:null},estimate:{basis:'UNESCO中国提交资料中的明确遗址代表坐标与机构地望交叉核对，未测量墓室',extent},limitation:extent+' 原坐标基准未明示，因此标估；不是已核实王陵墓室位置。'};x.mapEligible=true;x.mapReason='有依据的遗址区域估计点，王陵探索区与实际墓址分别说明';
 }
};
