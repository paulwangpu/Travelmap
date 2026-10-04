// A closed review of the 26 genuinely unlocated records on 2026-10-04.
// Geographic estimates and archaeological identifications remain separate.
module.exports=({items,sources,add,group,source})=>{
 const fs=require('node:fs'),path=require('node:path'),dir=path.join(__dirname,'../data/imperial-tombs');
 const byId=new Map(items.map(x=>[x.id,x]));
 const audit=[];
 const get=id=>{const x=byId.get(id);if(!x)throw Error('Unknown review record '+id);return x;};
 const review=(id,status,reason,nextStep,extraSources=[])=>{
  const x=get(id);for(const sid of extraSources)if(!x.sourceIds.includes(sid))x.sourceIds.push(sid);
  x.locationReview={reviewedAt:'2026-10-04',status,reason,nextStep,sourceIds:[...x.sourceIds]};
  x.reviewTasks=x.reviewTasks.filter(t=>!/^补核单陵WGS84坐标|^补核陵区边界或代表点|^核对原始文献、独立陵址/.test(t));
  if(!x.reviewTasks.includes(nextStep))x.reviewTasks.push(nextStep);
  if(!x.coordinates&&!x.locationReference)x.mapReason=reason;
  audit.push({id,name:x.name,admin:x.admin,...x.locationReview});
 };
 const estimate=(x,lng,lat,sid,target,basis,extent,original)=>{
  if(x.coordinates)throw Error('Cannot replace reviewed location '+x.id);
  x.coordinates={lat,lng,crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target,original,method:basis,sourceDatumExplicit:false,
   precision:{sourceUnit:'degree',resolutionDegrees:0.001,horizontalAccuracyMeters:null},
   limitation:extent+'；区域估计，非实测墓室或入口。',estimate:{basis,extent,confidence:'regional',reviewedAt:'2026-10-04'}};
  x.mapEligible=true;x.mapReason=target;if(!x.sourceIds.includes(sid))x.sourceIds.push(sid);
 };
 source('wuwei-qingzui-survey-2024','文物影响评估：青咀喇嘛湾墓群位置及范围','甘肃省文物局公开考古调查资料','https://wwj.gansu.gov.cn/wwj/c105449/202401/173849530/files/1f61527e9a144e47ac45bd9863f5dcf7.pdf','原报告作青杠喇嘛湾，地点为新华乡青咀村；N37°46′49.7″、E102°29′23.7″，基准未说明。');
 source('murongzhi-excavation-2021','甘肃武周时期吐谷浑喜王慕容智墓发掘简报','甘肃省文物考古研究所等，《考古与文物》2021年第2期（公开转载）','https://www.sohu.com/a/986936290_121124392','采用署名发掘简报所载GPS位置，不采用转载账号的其他说法；原刊和坐标基准仍需复核。');
 source('han-huzhuang-interview-2024','韩王陵发掘者访谈','新华网（马俊才访谈）','https://www.xinhuanet.com/ci/20240419/f8e2be4076d946ce840ce02c397ce8f6/c.html','出土卅年左库蔡戈用于提出桓惠王候选，仍不唯一认定墓主。');
 source('yimen-original-report','宝鸡市益门村二号春秋墓发掘简报','宝鸡市考古工作队，田仁孝、雷兴山，《文物》（摘要转载）','https://wenku.baidu.com/view/e74db8631db91a37f111f18583d049649b660e4f.html','1992年5月村北电讯器材设备厂基建，距公路20米，茹家庄遗址保护区南端；不是氮肥厂。');
 source('majiatomb-procurement-2023','马家战国墓周边区域考古调查采购公告','新都区文化综合服务中心／中国政府采购网','https://www.ccgp.gov.cn/cggg/dfgg/gkzb/202307/t20230705_20202241.htm','公告确认调查项目，采购单位办公地址不是墓址，公开正文未给墓地坐标。');
 source('nandong-distribution-2016','徐州楚王墓分布图（图七）','故宫博物院院刊，胡进驻，2016年第2期','https://www.dpm.org.cn/Uploads/File/2018/06/01/u5b1123336de3d.pdf','分布图明确段山（南洞山）；示意图不能直接读取实测经纬度。');
 source('dawu-site-2017','窝托冢与汉齐王墓','淄博市文化和旅游局','https://wh.zibo.gov.cn/art/2017/3/24/art_260_1606311.html','官方介绍明确窝托村原址，未给坐标；与战国齐王陵分开。');
 source('taian-identity-review','丹阳南齐帝陵地望考证','丹阳日报／丹阳新闻网','https://www.dy001.cn/2021/0526/76273.shtml','关于石刻、陵号与地望的研究意见，不视为墓主考古确证。');
 source('wanyan-village-map','完颜村地理实体（区域参考）','Google Maps公开地理实体','https://www.google.com/maps/place/Wanyan+Village/data=!4m6!3m5!1s0x3667aaa4b4ce71f3:0x422cd1517d3b3ea6!8m2!3d35.36394!4d107.27485!16s%2Fg%2F11q2r6hhz8','可见页核对泾川县完颜村；仅提供村内纪念陵区参考，未提供冢体位置或明确坐标基准。');
 // Extend the measured M1038 -> M1052 alignment by the published intervals.
 const a=get('han-xianjie').coordinates,b=get('han-jing-east').coordinates;
 const dy=(b.lat-a.lat)*111320,dx=(b.lng-a.lng)*111320*Math.cos(b.lat*Math.PI/180),distance=Math.hypot(dx,dy);
 for(const [id,metres,tomb] of [['han-shen',800,'M1054'],['han-kang-east',2700,'M1079']]){
  const x=get(id),ratio=metres/distance;
  const lat=Math.round((b.lat+(b.lat-a.lat)*ratio)*1000)/1000,lng=Math.round((b.lng+(b.lng-a.lng)*ratio)*1000)/1000;
  x.name=x.name+'（'+tomb+'，推定）';x.mapLabel=x.name;if(!x.aliases.includes(tomb))x.aliases.push(tomb);
  x.disputes=x.disputes.filter(t=>!t.includes('暂未获得逐陵独立经纬度'));
  x.disputes.push('2019年布局研究的候选对应；陵号与墓主没有独立铭文确证，位置为按相对距离推算的区域估计。');
  if(id==='han-kang-east')x.disputes.push('M1079方案与文献所记康陵在慎陵茔内庚地仍有矛盾，不作唯一认定。');
  estimate(x,lng,lat,'east-han-layout-text',tomb+'候选墓冢区域（推算）','以保护规划M1038、M1052为锚点，沿两点向东南的方向延伸研究所述800米／后续1900米间隔；直线延伸是假设，不能代替墓冢测绘','候选点周围约1公里；包含示意排列、非严格共线及坐标基准不明的限制',`M1038 ${a.lng},${a.lat}; M1052 ${b.lng},${b.lat}; extend ${metres}m`);
  review(id,'regional_estimate_added','已补候选墓冢区域估计；墓主对应与点位精度分别保留争议。','取得M1054／M1079墓冢保护坐标，替换相对方位推算',['east-han-plan-coordinates']);
 }
 const yanlou=group('han-yanlou-cemetery','阎楼东汉陵园（静陵候选区）','秦汉','东汉','河南省洛阳市偃师区高龙镇阎楼村西','east-han-layout,east-han-layout-text',{recognition:'attributed',evidence:'已发现东汉陵园；研究提出M1108或M1129为静陵候选，不能确定是哪一座。',disputes:['不把两个候选墓号分别计为两座质帝静陵。']});byId.set(yanlou.id,yanlou);
 const xuan=get('han-xuan').coordinates,offset=2500/Math.sqrt(2);
 estimate(yanlou,Math.round((xuan.lng+offset/(111320*Math.cos(xuan.lat*Math.PI/180)))*1000)/1000,Math.round((xuan.lat+offset/111320)*1000)/1000,'east-han-layout-text','白草坡东北阎楼陵园区域参考','依研究所述白草坡陵园东北约2.5公里推算；东北采用45度为浏览估计，实际陵园边界待核','推算点周边约1公里；是阎楼陵园候选区，不是M1108或M1129的独立墓室坐标','白草坡M1030东北约2.5公里；原文无经纬度');
 const jing=get('han-jing-zhi');jing.parentId=yanlou.id;jing.locationReference={parentId:yanlou.id,status:'shared_region_estimate',target:'阎楼陵园静陵候选区参考',basis:'研究提出M1108或M1129为候选；关联候选陵园，不指定其中某墓。',limitation:yanlou.coordinates.limitation};
 jing.disputes=jing.disputes.filter(t=>!t.includes('暂未获得逐陵独立经纬度'));jing.disputes.push('静陵候选为阎楼M1108或M1129，未确定唯一墓号。');
 review(jing.id,'cemetery_reference_added','关联已补阎楼候选陵园区域；M1108与M1129的唯一对应尚未解决。','取得阎楼陵园边界和两候选墓独立坐标，复核静陵归属');
 // Wuwei is discontinuous: map subareas, never a city centre for the umbrella group.
 const wuwei=get('tuyuhun-wuwei');wuwei.admin='甘肃省武威市凉州区、天祝藏族自治县';
 const q=group('tuyuhun-qingzui-lamawan','青咀—喇嘛湾吐谷浑王族墓区','隋唐','唐代吐谷浑王族','甘肃省武威市凉州区新华乡青咀村','wuwei-qingzui-survey-2024,west-wuwei-inventory',{parentId:wuwei.id,recognition:'archaeological',evidence:'文物调查报告记录墓群参考坐标及范围；不拆出未定位的单墓。'});
 estimate(q,102+29/60+23.7/3600,37+46/60+49.7/3600,'wuwei-qingzui-survey-2024','青咀—喇嘛湾墓区参考点','公开文物调查报告经纬度换算；原表未明确基准，按WGS84区域估计','墓区东西约1公里、南北约2.8公里；不是全部武威王族墓群或可汗单陵','N37°46′49.7″ E102°29′23.7″; datum unspecified');
 const m=add('tuyuhun-murongzhi','吐谷浑喜王慕容智墓','隋唐','唐代吐谷浑王族','吐谷浑喜王慕容智','甘肃省武威市天祝藏族自治县祁连镇岔山村浩门组','murongzhi-excavation-2021,west-wuwei',{parentId:wuwei.id,rulerCategory:'feudal_king',recognition:'archaeological',evidence:'墓志确认喜王慕容智，691年入葬；墓志大可汗陵为周边陵区线索。',disputes:['喜王不是大可汗；本墓不能代替尚未发现的可汗单陵。'],chronology:{sortYear:691,basis:'发掘简报墓志入葬年'}});
 estimate(m,102+22/60+54.3/3600,37+40/60+51.7/3600,'murongzhi-excavation-2021','岔山村慕容智墓区域参考','署名发掘简报公开转载给出GPS位置；原刊和基准待复核，暂作区域估计','原墓周围约500米，非测绘精度保证','N37°40′51.7″ E102°22′54.3″ GPS; datum unspecified');
 review(wuwei.id,'mapped_subareas_added','已分出青咀—喇嘛湾和岔山慕容智墓两个定位子项；长岭、马场滩及可汗单陵仍待定位。','继续取得长岭和马场滩分区坐标；大可汗陵须独立考古认定',['wuwei-qingzui-survey-2024','murongzhi-excavation-2021']);
 const memorial=get('jin-chenglin-memorial');
 estimate(memorial,107.275,35.364,'wanyan-village-map','完颜村纪念陵区区域参考（冢体待测）','文旅资料确定纪念陵区在完颜村，以公开地理实体为村域参考；不把村域点称为已核实墓室','完颜村东沟、芮王坪纪念区域约3公里参考范围；地图村域点不是纪念冢入口','Google Maps village entity 35.36394,107.27485; rounded regional reference');
 review(memorial.id,'regional_estimate_added','补完颜村纪念陵区区域参考；性质仍为2003年取土纪念冢，非遗骸迁葬。','补东沟芮王坪纪念冢现场坐标及入口，缩小村域参考范围');
 source('yimenbao-place','益门堡村原址区域参考','Google Maps公开地理实体','https://www.google.com/maps/place/Yimenpucun/data=!4m6!3m5!1s0x3660e7e768ef6979:0x1b752bc76060bc2e!8m2!3d34.327371!4d107.108824!16s%2Fg%2F11c6188rtp','可见页核对宝鸡渭滨区益门堡村；村域参考，未给1992年二号墓实测位置。');
 source('yimenbao-1992-yearbook','1992年益门堡考古发现记录','陕西省地方志办公室（宝鸡地方志公开本）','https://dfz.shaanxi.gov.cn/zslm/fzzlk/xbsxsxz/xbsxz/bjs_16199/201405/P020240923616562478976.pdf','1992年5月记录市考古队在益门堡发现春秋墓葬；与原发掘简报益门村地名互核。');
 const yimen=get('rong-yimen');
 estimate(yimen,107.109,34.327,'yimenbao-place','益门堡村原墓所在区域参考（墓坑待配准）','地方志的益门堡与原发掘简报益门村互核，以村域地理实体提供原墓所在区域；不推定旧厂界或某个墓坑中心','益门堡村北及茹家庄保护区南端约2公里参考范围；原厂与公路旧址仍待配准','Google Maps village entity 34.327371,107.108824; rounded regional reference');
 review(yimen.id,'regional_estimate_added','补益门堡原墓所在区域参考；已纠正施工地点为电讯器材设备厂，旧厂界和二号墓坑仍需细化。','配准1992年发掘简报图一、旧厂地块与道路，替换村域参考点',['yimen-original-report','yimenbao-1992-yearbook']);
 source('huzhuang-place','新郑胡庄村地理实体','Google Maps公开地理实体','https://www.google.com/maps/place/Huzhuang/data=!4m6!3m5!1s0x35d719df5e01e9cd:0x45519636b6f81a0c!8m2!3d34.394158!4d113.696345!16s%2Fg%2F11c618504g','可见页核对新郑胡庄，不是同名外县村；仅用村西北陵区区域参考。');
 const huzhuang=get('han-huzhuang');
 estimate(huzhuang,113.696,34.394,'huzhuang-place','胡庄村西北韩王陵区区域参考（墓体待配准）','发掘资料确定胡庄村西北岗地，公开地图核对新郑胡庄村，取村域位置为周边陵区参考，不擅自设定两墓中心','胡庄村及西北岗地约2公里范围；两墓与干渠交点仍待配准','Google Maps Huzhuang 34.394158,113.696345; rounded regional reference');
 review(huzhuang.id,'regional_estimate_added','已补新郑胡庄及西北韩王陵区区域参考；保留墓主未定，桓惠王为发掘者提出的候选。','取得发掘总平面与南水北调桩号或保护图，细化到陵体',['han-huzhuang-interview-2024']);
 source('pudong-village-place','新都普东村地理实体','Google Maps公开地理实体','https://www.google.com/maps/place/Pudong+Village/data=!4m6!3m5!1s0x36f0283d1338e181:0xa1a1045975e5933!8m2!3d30.86173!4d104.12497!16s%2Fg%2F11q8tk3gcs','可见页核对新都普东村；不是马家地铁站或马超墓，旧墓体中心待核。');
 const majia=get('shu-majia');
 estimate(majia,104.125,30.862,'pudong-village-place','马家乡普东村战国大墓所在区域参考','博物馆资料记原马家乡普东村，公开地理实体核对新都普东村，作为原墓区域参考；升庵村现行组号和原墓中心另核','原普东村约2公里参考范围；不是地铁站，也不代表墓室坐标','Google Maps Pudong 30.86173,104.12497; rounded regional reference');
 review(majia.id,'regional_estimate_added','补原普东村战国大墓所在区域参考；蜀王族身份仍为推定，现行组号与墓坑中心需细化。','取得周边考古调查范围图，核升庵村组号和墓坑位置',['majiatomb-procurement-2023']);
 const unresolved=[
  ['yan-xuliang','known_site_not_georeferenced','已确认东城西北虚粮冢墓区；都城示意图缺可读取的墓区控制坐标，尚未完成与现代地形的配准。','取得墓区保护边界或带现代控制点的考古总平面'],
  ['yan-jiunutai','known_site_not_georeferenced','与虚粮冢是两处墓区；九女台墓区地望明确，但尚未取得能与现代底图配准的墓区边界。','配准燕下都墓区总平面，分别定位九女台与虚粮冢'],
  ['yan-jiunutai-m16','parent_site_not_georeferenced','M16所属九女台已明确，单墓不重复统计；所属墓区本身尚未定位，不能提供有效地图参考。公开研究称高等级贵族墓，国君身份未定。','先定位九女台墓区，再建立共享位置；单墓中心另核'],
  ['han-chu-nandong','known_site_not_georeferenced','学术分布图明确段山（南洞山），但无独立经纬度；地图同名段山地理实体在117.669°E，远于资料所述市区东南两山口地望，排除；北洞山、东洞山也不是本墓。','取得段山原墓保护点或将带比例尺分布图配准现代山体',['nandong-distribution-2016']],
  ['han-qi-dawu','known_site_not_georeferenced','窝托冢地点及陪葬坑发掘明确；原窝托村与迁建后的社区须分开，尚未确认原墓封土对应的现代地块。','查1978—1980年发掘图与旧村地籍，取得封土或陪葬坑原址参考点',['dawu-site-2017']],
  ['han-king-changyi','regional_estimate_added','补金山店子村及村东红土山原墓区域参考；村域点不是墓室入口，墓主刘髆仍为推定，不能与金山大洞混同。','取得红土山保护图或原墓现场控制点，将村域参考细化到山体和墓口'],
  ['han-zhongshan-dingzhou','discontinuous_cemetery','总项包含北庄子、北陵头等不连续墓地，无法以一个点代表；石刻馆或博物馆也不是这些原墓址。','按原墓号与保护单位拆分子项，取得各分区原址坐标'],
  ['wei-shouyang','unresolved_tomb_identity','曹丕首阳陵有文献和邙山陵群归属，但古首阳山地望及现代墓葬对应仍未落实；不能沿用现代同名山或任一魏墓。','取得能对应首阳陵的考古墓号、保护范围或可配准地望研究'],
  ['jin-gaoyuan','unresolved_tomb_identity','司马懿高原陵有陵号及邙山归属；机构概述没有唯一墓冢对应或窄区域，邙山总范围过大不能作为单陵估计。','取得高原陵候选墓号及其窄范围定位依据'],
  ['jin-junping','unresolved_tomb_identity','司马师峻平陵有文献记录，尚未取得与现代已发现墓葬的唯一对应；不能套用司马昭崇阳陵坐标。','取得峻平陵候选墓号、勘察平面或保护边界'],
  ['jin-taiyang','unresolved_tomb_identity','司马衷太阳陵的陵号存在，但未取得独立墓冢地理对应；不能套用司马炎峻阳陵或洛阳城市中心。','取得太阳陵墓冢候选与现代位置的考古证据'],
  ['qi-taian','conflicting_site_attribution','泰安陵陵号有文献依据；丹阳石刻与陵号归属存在不同意见，赵家湾传统石刻地点与墓葬实体对应未完成复核。','核赵家湾旧石刻原址及陵区考证，分别记录地理位置和陵号争议',['taian-identity-review']],
  ['jin-hailing','unresolved_tomb_identity','归葬地望仍未对应现代墓葬；曾被误指的长沟坟庄已由墓志确认为唐刘济墓，不能据旧说加入。','寻找完颜亮最终归葬墓址的独立考古对应'],
  ['jin-hekai','conflicting_place_names','老母顶子山南麓、三清屯线索保留；报道镇名不一致，未取得山体/墓区控制点及2011年后身份确认。不能采用现阿骨打纪念陵位置。','核三清屯旧地名与老母顶子山实体，再给区域估计；墓主认定另核'],
  ['jin-huizong-xing','unresolved_tomb_identity','宗峻兴陵仅能落实到金上京地望，尚未找到独立陵址；与房山金世宗兴陵同名异陵，不能共用坐标。','取得上京兴陵候选遗址与文献地望的对应'],
  ['jin-de','unresolved_tomb_identity','宣宗德陵只落实到开封附近，没有窄范围原陵址或候选地块；金南迁后陵寝不能归入房山金陵。','核金史与开封古地名，寻找原址考古或保护记录'],
  ['jin-ai-rushui','historical_geography_unresolved','汝水滨、张彦庄和葬颜冢为线索；河道、村址与合葬传统尚未配准，且遗骸去向有不同记载。','核古汝水/后龙亭河湾及旧张彦庄地籍；与蔡州死亡地分开'],
  ['jin-chenglin-boji','known_site_not_georeferenced','太平乡三星村岭背后簸箕湾、大湾林场是传统故址线索；尚无可复核山谷点位。完颜村纪念冢与此不同址，不能互相代替。','取得簸箕湾现场地理控制点；传统墓主归属保留未确证']
 ];
 source('jinshandianzi-place','巨野金山店子村地理实体','Google Maps公开地理实体','https://www.google.com/maps/place/Jinshan+Dianzi/data=!4m6!3m5!1s0x35c4ee289e362aad:0x41b385c4541d9f15!8m2!3d35.219223!4d116.226251!16s%2Fg%2F11g4fnt_lx','核对巨野县金山店子村，不是金山公园或金山崖墓；以村域作红土山周边参考。');
 estimate(get('han-king-changyi'),116.226,35.219,'jinshandianzi-place','金山店子村东红土山原墓区域参考（墓口待测）','博物馆资料确定红土山位于金山店子村东；公开地图核对巨野村址，以村域作周边原墓区域参考','金山店子村及东侧红土山约2公里参考范围；不代表墓室、山顶或金山大洞入口','Google Maps village entity 35.219223,116.226251; rounded regional reference');
 for(const row of unresolved)review(...row);
 get('yan-jiunutai-m16').name='九女台M16（高等级贵族墓，王室归属待考）';
 get('yan-jiunutai-m16').mapLabel=get('yan-jiunutai-m16').name;
 get('rong-yimen').admin='陕西省宝鸡市渭滨区益门村北、茹家庄遗址保护区南端（1992年原址）';
 if(audit.length!==26||new Set(audit.map(x=>x.id)).size!==26)throw Error('The location review must cover exactly 26 records');
 for(const row of audit){const x=get(row.id);row.name=x.name;row.admin=x.admin;row.coordinates=x.coordinates;row.locationReference=x.locationReference||null;row.mappedChildren=items.filter(y=>y.parentId===x.id&&y.mapEligible).map(y=>y.id);}
 const report={reviewedAt:'2026-10-04',scope:'上轮26条无独立坐标且无可用上级位置的记录；不重复计已有定位的总览',reviewedCount:26,newMapPoints:items.filter(x=>['han-king-changyi','han-shen','han-kang-east','han-yanlou-cemetery','tuyuhun-qingzui-lamawan','tuyuhun-murongzhi','jin-chenglin-memorial','rong-yimen','han-huzhuang','shu-majia'].includes(x.id)).map(x=>x.id),resolvedOrPartlyResolved:audit.filter(x=>x.status.endsWith('_added')).length,stillWithoutUsableLocation:audit.filter(x=>!x.coordinates&&!x.locationReference&&!x.mappedChildren.length).length,items:audit};
 fs.writeFileSync(path.join(dir,'full-location-review.json'),JSON.stringify(report,null,2)+'\n');
 const labels={regional_estimate_added:'已补区域估计',cemetery_reference_added:'已关联候选陵区',mapped_subareas_added:'已定位部分子墓区',known_site_not_georeferenced:'原址明确，尚未配准',parent_site_not_georeferenced:'所属墓区尚未定位',discontinuous_cemetery:'不连续陵群，需拆分',unresolved_tomb_identity:'墓葬实体对应未定',conflicting_site_attribution:'陵号归属待核',conflicting_place_names:'新旧地名对应待核',historical_geography_unresolved:'历史地望待配准'};
 fs.writeFileSync(path.join(dir,'full-location-review.md'),`# 26条皇陵位置逐项处理结果\n\n核查日期：${report.reviewedAt}。逐项处理26条，${report.resolvedOrPartlyResolved}条已增加区域位置、候选陵区关联或定位子项；${report.stillWithoutUsableLocation}条本轮仍未补成。新增${report.newMapPoints.length}个地图代表点，均为明确标注依据和限制的区域估计。\n\n“尚未配准”表示本轮没有完成地理核验，并不表示遗址不存在或无法定位。东汉候选点按公开相对距离推算；完颜村为村域纪念陵区参考；均不能用于导航到墓室。武威总项仅部分完善，长岭、马场滩等仍需补核。\n\n|序号|记录|本轮结果|依据或不能补成的具体原因|仍需的证据|来源|\n|---|---|---|---|---|---|\n${audit.map((x,i)=>`|${i+1}|${x.name}|${labels[x.status]}|${x.reason}|${x.nextStep}|${x.sourceIds.map(id=>{const s=sources.find(s=>s.id===id);if(!s)throw Error('Missing review source '+id);return '['+s.publisher+']('+s.url+')';}).join('、')}|`).join('\n')}\n\n结构化结果见 full-location-review.json；每条 catalog.json 记录保留 locationReview 与具体待核任务。\n`);
};
