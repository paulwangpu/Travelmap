// Keep burial stages as distinct sites; an emperor's identity is not a coordinate.
module.exports=({items,add,group,source})=>{
 source('jin-acheng-history','金太祖完颜阿骨打及太祖陵','黑龙江省政协','https://www.hljzx.gov.cn/contents/68/7388.html','初葬地与1999年现存建筑修复资料，不作为地宫发掘证明。');
 source('jin-acheng-stages','谒金太祖陵：初葬、两次迁葬与陵址公园复建','哈尔滨日报','https://harbin.joyhua.cn/hebrb/20240903/mhtml/page_07_content_20240903008003.htm','1123年初葬、1135年和陵、1144年改号、1155年迁房山；1999年复建。');
 source('jin-hekai-response','哈尔滨回应金代皇陵被盗：墓主身份待确认','中国新闻网（阿城区文体局回应与现场采访）','https://www.chinanews.com/shipin/2011/11-04/news46460.html','2011年回应：未发现标识墓主身份遗物；盗坑有旧扰，不据报道确认太祖、太宗地宫。');
 source('jin-acheng-osm','金太祖陵址公园：OSM实体参考点','OpenStreetMap贡献者','https://www.openstreetmap.org/node/10980638687','OSM WGS84节点，原始API核对资料见jin-acheng-osm.json；非墓室中心或入口实测。');
 const initial=add('jin-taizu-acheng','金太祖陵（阿城初葬陵址）','宋辽金西夏','金','金太祖完颜阿骨打','黑龙江省哈尔滨市阿城区金上京会宁府遗址西侧、金太祖陵址公园','jin-acheng-history,jin-acheng-stages,jin-acheng-osm',{
  aliases:['阿城金太祖陵','金太祖完颜阿骨打初葬陵址','金太祖陵址公园','太祖庙（阿城）','阿骨打庙'],nature:'unknown',recognition:'documented',siteRole:'former_burial_site',
  mapLabel:'金太祖陵（阿城初葬）',periodText:'金：1123年初葬；现存主要建筑1999年复建',
  evidence:'省政协与地方党报资料记载上京宫城西南初葬陵及后续迁葬；现存陵址公园可定位，不据旅游介绍认定遗骸仍在或地宫已考古确认。',
  disputes:['现存玉带桥、神道、宁神殿等有1999年复建或修复，不将景点地宫等同于确认的1123年墓室。','阿城初葬陵址、胡凯山和陵与北京房山睿陵为不同地点；不能将北京考古确认结论移用于阿城。'],
  chronology:{sortYear:1123,basis:'初葬年份排序；现代建筑复建另记'},reviewTasks:['补核原始墓室与宁神殿基址对应、陵园边界和入口实测坐标']
 });
 initial.coordinates={lat:45.4929386,lng:126.9592318,crs:'WGS84',status:'estimated_wgs84',sourceId:'jin-acheng-osm',target:'阿城金太祖陵址公园区域参考点（非墓室中心）',original:'OSM node 10980638687: 45.4929386, 126.9592318',method:'读取OSM官方API，核对公园节点及附近金太祖陵节点，与机构所述上京遗址西侧交叉检查',sourceDatumExplicit:true,verificationScope:'公园地理实体及WGS84约定；非历史墓室测绘',precision:{sourceUnit:'degree',resolutionDegrees:0.0000001,horizontalAccuracyMeters:null},estimate:{basis:'OSM公园标注与机构所在地相符；邻近金太祖陵标注约67米北侧',extent:'现存陵址公园及其附近，公园点位不表示古代墓室范围',confidence:'site',reviewedAt:'2026-10-03'},limitation:'陵址公园参考定位；未测绘墓室中心，现存建筑含现代复建，不代表遗骸仍在此处。'};
 initial.mapEligible=true;initial.mapReason='初葬陵址公园有可复核地理实体，区域估计点单独显示';
 const hekai=group('jin-hekai','金和陵旧址（胡凯山，疑似）','宋辽金西夏','金','黑龙江省哈尔滨市阿城区老母顶子山南麓（三清屯附近；现行区划待核）','jin-acheng-stages,jin-hekai-response,beijing-jin-history',{
  aliases:['胡凯山和陵','阿城和陵旧址','老母顶子山金代墓区'],occupants:['金太祖完颜阿骨打','金太宗完颜晟'],nature:'unknown',recognition:'attributed',siteRole:'former_burial_site',
  periodText:'金：1135年迁葬／初葬，1144年分别定名睿陵、恭陵，1155年迁房山',
  evidence:'文献记载胡凯山和陵及太祖、太宗迁葬关系；现存老母顶子山墓区传统对应尚未以墓主身份遗物证实。',
  disputes:['2024年地方报道使用山河镇，2011年现场与主管部门回应使用松峰山镇三清屯；保持地点线索，不强行据镇名定位墓室。','墓区有石人、石羊及旧盗坑，但不据雕刻或盗掘推定墓主；目前不拆成两个虚构的单陵点。'],chronology:{sortYear:1135,basis:'历史和陵营建与迁葬年；非现存墓区年代确证'},reviewTasks:['核对老母顶子山、三清屯及现行保护区划，补有依据的区域坐标','查找2011年后考古勘测结果与墓主认定，不能引用早期报道作为最新确证']
 });
 for(const id of ['qing-zhaoxi','qing-cixi','qing-xiaodong']){const tomb=items.find(x=>x.id===id);tomb.parentId='qing-east';}
 const rui=items.find(x=>x.id==='jin-rui'),gong=items.find(x=>x.id==='jin-gong');
 rui.mapLabel='金太祖睿陵（北京迁葬）';rui.aliases.push('北京金太祖睿陵','房山阿骨打陵');rui.sourceIds.push('jin-acheng-stages');rui.periodText='金：1155年迁葬北京；墓主卒于1123年';
 gong.mapLabel='金太宗恭陵（北京迁葬）';gong.sourceIds.push('jin-acheng-stages','beijing-jin-history');gong.periodText='金：1135年初葬和陵，1155年迁葬北京';
 const stages=[{year:1123,siteId:initial.id,label:'阿城初葬陵址',status:'documented'},{year:1135,siteId:hekai.id,label:'胡凯山和陵（现址疑似）',status:'attributed'},{year:1155,siteId:rui.id,label:'北京房山睿陵（迁葬）',status:'archaeological'}];
 for(const x of [initial,hekai,rui]){x.migrationHistory={person:'金太祖完颜阿骨打',stages:structuredClone(stages),sourceIds:['jin-acheng-stages','jin-hekai-response','jin-confirmed']};}
 gong.migrationHistory={person:'金太宗完颜晟',stages:[{year:1135,siteId:hekai.id,label:'胡凯山和陵（现址疑似）',status:'attributed'},{year:1155,siteId:gong.id,label:'北京房山恭陵（迁葬，墓室对应未定）',status:'documented'}],sourceIds:['beijing-jin-history','jin-hekai-response']};
 const area=items.find(x=>x.id==='jin-group');area.mapLabel='金陵（含阿骨打睿陵）';area.disputes.push('阿骨打1123年阿城初葬陵与1135年胡凯山和陵另立记录；此处为北京迁葬陵区，不是阿城景点。');
};
