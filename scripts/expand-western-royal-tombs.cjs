// Western regional rulers: geography, burial attribution and modern buildings are separate evidence.
module.exports=({items,add,group,source})=>{
 const geo=require('../data/imperial-tombs/western-royal-wikidata.json');
 source('west-national6','第六批全国重点文物保护单位名单','国务院（国家民委公布）','https://www.neac.gov.cn/seac/xxgk/200606/1073187.shtml');
 source('west-tughluq','秃黑鲁克帖木尔汗麻扎','伊犁哈萨克自治州政府','https://www.xjyl.gov.cn/xjylz/c112876/200509/a0430c7f93ad4d4783603e37bd91b702.shtml');
 source('west-wais','速檀·歪思汗麻扎','伊犁哈萨克自治州政府','https://www.xjyl.gov.cn/xjylz/c112876/200911/49f509d61ca14e1cb1cd1b6092f8ca95.shtml');
 source('west-yarkand','叶尔羌汗国王陵景区名称调整','莎车县政府','https://www.shache.gov.cn/scx/c108015/202101/62f9758693cf4fa488aee2870fe2bb8a.shtml');
 source('west-satuq','苏里坦·苏突课·博格拉汗麻扎','克孜勒苏柯尔克孜自治州政府','https://www.xjkz.gov.cn/xjkz/c124087/202412/ed35719159a544a099f6bb0dd9e33a68.shtml');
 source('west-satuq-boundary','克政办发〔2012〕95号：保护范围及GPS四至','克州政府公开文件（法搜镜像）','https://fsou.com/html/text/lar/174085/17408516.html','原文镜像存output/western-mausoleum-protection.html；GPS坐标未明确基准，只作区域估计，不视为实测WGS84。');
 source('west-hami','哈密回王墓','哈密市政府','https://www.hami.gov.cn/hami/xhtml/mlhm/tswh_hwf.html');
 source('west-jiaohe','再论交河沟西、沟北墓地——兼谈吐鲁番地区战国至西汉墓葬','宁夏文物考古研究所','https://www.nxkg.org.cn/silukaogu/996.html');
 source('west-jiaohe-field','王炳华考古手记：交河城历史文化故实','发掘参与者王炳华（澎湃刊载）','https://www.thepaper.cn/newsDetail_forward_27836506');
 source('west-xuewei','都兰热水墓群2018血渭一号墓出土鋬指金杯考','故宫博物院《故宫博物院院刊》','https://img.dpm.org.cn/Uploads/File/2024/01/17/u65a7353525966.pdf');
 source('west-xuewei-identity','考古成果专家论证：外甥阿柴王之印与墓主推定','青海文物部门及项目负责人（重庆科技报刊载）','https://epaper.cqrb.cn/kjb/2021-02/23/13/cqkjb2021022313.pdf','墓主莫贺吐浑可汗为推定；树轮744±35年不是确切卒年。');
 source('west-wuwei','武威吐谷浑王族墓葬及大可汗陵线索','甘肃省文化博览局','https://www.gswbj.gov.cn/a/2022/04/08/13199.html');
 source('west-wuwei-inventory','甘肃省第九批省级文物保护单位：吐谷浑王族墓群','甘肃省政府（张掖政府公布）','https://www.zhangye.gov.cn/zyszfxxgk/zfwj_5652/szfwj/202506/t20250612_1412925_ghb.html');
 function estimate(x,lat,lng,sid,target,basis,extent,original,resolution=0.00001,explicit=false){
  x.coordinates={lat,lng,crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target,original,
   method:basis,sourceDatumExplicit:explicit,verificationScope:'机构资料核对地理实体；区域浏览参考',
   precision:{sourceUnit:'degree',resolutionDegrees:resolution,horizontalAccuracyMeters:null},
   estimate:{basis,extent,confidence:'regional',reviewedAt:'2026-10-03'},
   limitation:`估计位置：${basis}。参考范围：${extent}；非墓室中心或现场测绘点。`};
  x.sourceIds.push(sid);x.mapEligible=true;x.mapReason='有来源的陵址或陵区估计点，归属与位置精度另见说明';
 }
 function wiki(x,q,target,extent){
  const claim=geo.entities[q]?.claims.P625?.find(c=>c.mainsnak.datavalue?.value.globe==='http://www.wikidata.org/entity/Q2');
  if(!claim)throw Error('Missing western Earth coordinate '+q);
  const v=claim.mainsnak.datavalue.value,sid='geo-west-'+q;
  source(sid,target+'：区域地理坐标','Wikidata P625 Earth','https://www.wikidata.org/wiki/'+q,'原始声明存western-royal-wikidata.json；地理索引不是墓主认定依据。');
  estimate(x,v.latitude,v.longitude,sid,target,'机构所述地望与P625 Earth地理实体交叉核对',extent,`${v.latitude}, ${v.longitude}; ${claim.id}`,v.precision,true);
 }
 const tug=add('moghul-tughluq','秃黑鲁克帖木尔汗麻扎','元','东察合台汗国（蒙兀儿斯坦）','秃黑鲁克帖木尔汗','新疆维吾尔自治区伊犁州霍城县','west-tughluq',{
  aliases:['吐虎鲁克·铁木尔汗麻扎','秃黑鲁帖木儿汗麻扎'],evidence:'伊犁州政府记载汗王卒于1363年，葬于阿里马勒城东郊大麻扎。',
  chronology:{sortYear:1363,basis:'机构记载墓主卒年；元仅表示同期年代，不表示该汗国隶属元朝'},
  disputes:['汗国名称保留东察合台／蒙兀儿斯坦；不因同期颜色归类而改写其政治归属。','附属小麻扎不另作一位君主陵统计。']});
 wiki(tug,'Q1455687','大麻扎秃黑鲁克帖木尔汗麻扎陵区','霍城县大麻扎村陵院及周边，独立墓室中心待核');
 const wais=add('moghul-wais','速檀·歪思汗麻扎','明','东察合台汗国','歪思汗','新疆维吾尔自治区伊犁州伊宁县麻扎乡麻扎村','west-wais,west-national6',{
  nature:'unknown',recognition:'traditional',chronology:{sortYear:1420,basis:'国六明代登记及所纪念汗王时代的大致排序；现存建筑属19世纪后叶，非确切卒年'},
  evidence:'国六名单列为明代遗存；伊犁州政府说明现存麻扎由后人于19世纪后叶为纪念歪思所建。',
  disputes:['现存纪念建筑不等于已确认原葬遗骨；实际墓葬、改建与祭祀关系待核。','年代颜色按所纪念汗王时代；不按现存建筑年代误归清代。']});
 wiki(wais,'Q2364732','速檀·歪思汗麻扎陵院','伊宁县麻扎乡麻扎村陵院；原葬地与重建范围待核');
 const yarkand=group('yarkand-khans','叶尔羌汗国王陵','明','叶尔羌汗国','新疆维吾尔自治区喀什地区莎车县','west-national6,west-yarkand',{
  nature:'actual_burial',evidence:'国务院国六名单列叶尔羌汗国王陵为明代古墓葬；莎车政府确认王陵景区所在。',
  chronology:{sortYear:1550,basis:'16世纪王陵的大致排序参照，不作为单陵始建年'},
  disputes:['跨明清时期，逐墓墓主和年代待核；先保留陵群，不将每位汗王复制成同一点。','阿曼尼莎汗纪念陵与汗王墓群邻近；其POI不能替代王陵位置，后妃不单独新增。']});
 source('geo-west-yarkand','叶尔羌汗国王陵POI','高德地图','https://www.amap.com/place/B03E60MW6L','原坐标GCJ-02；与国保实体、阿勒屯路地望核对，非阿曼尼莎汗纪念陵POI。');
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ctx={};vm.createContext(ctx);
 const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
 vm.runInContext(app.slice(app.indexOf('function isCoordinateInChina('),app.indexOf('function ',app.indexOf('function gcjToWgs(')+10)),ctx);
 const p=ctx.gcjToWgs(77.260067,38.416879);
 estimate(yarkand,p[1],p[0],'geo-west-yarkand','莎车阿勒屯路叶尔羌汗国王陵区域','王陵POI原GCJ-02坐标反解为WGS84区域参考','王陵园区域；不对应任何一座汗王墓中心','77.260067,38.416879; GCJ-02');
 const satuq=add('karakhanid-satuq','苏里唐麻扎','五代十国','喀喇汗国','苏突克·博格拉汗','新疆维吾尔自治区克州阿图什市松他克镇买谢提村','west-satuq,west-satuq-boundary',{
  aliases:['苏里坦·苏突克·博格拉汗麻扎','苏里坦·苏突课·博格拉汗麻扎'],
  chronology:{sortYear:955,basis:'机构记载墓主卒年；五代十国只是同期年代，非政治归属'},
  evidence:'克州政府列为古墓葬，记墓主卒于955年、其继承人为父建墓。',
  disputes:['现存主要建筑分别重建于1959、1996年，不因此作为两座君主墓重复统计。','保护登记年代为宋至现代，与墓主卒年955分开保存；原葬遗骨仍需专门考古核验。']});
 // Mean of four published GPS corners, not a guessed Artux city centre.
 const corners=[[39,41,16.1,76,10,28.3],[39,41,15,76,10,29.2],[39,41,17.7,76,10,32.5],[39,41,17,76,10,33.4]];
 const avg=(offset)=>corners.reduce((s,c)=>s+c[offset]+c[offset+1]/60+c[offset+2]/3600,0)/4;
 estimate(satuq,avg(0),avg(3),'west-satuq-boundary','买谢提村苏里唐麻扎保护范围参考','2012年文保通知GPS四至均值，坐标基准未明，按WGS84作区域估计','通知所列陵院围墙、栅栏保护范围及周边，非独立墓冢中心',JSON.stringify(corners)+'; GPS datum unspecified',0.1/3600);
 const hami=group('hami-hui-kings','哈密回王墓','清','清代哈密回王','新疆维吾尔自治区哈密市伊州区','west-hami,west-national6',{
  nature:'actual_burial',ownerRole:'regional_ruler',scopeBasis:'哈密地方世袭统治者陵园；按地方王陵纳入，不扩展到普通宗室王公墓。',
  chronology:{sortYear:1800,basis:'清代世袭统治者陵园的概略排序；跨至民国，非某墓主卒年'},
  evidence:'哈密政府记载为清代地方藩王及王室成员墓群，列七世伯锡尔拱拜及九世回王墓；国保年代清至民国。',
  disputes:['王室亲属与附葬不单独新增。','哈密回王府和回王墓是不同地点，地图指向墓园。']});
 wiki(hami,'Q1551275','哈密回王墓陵园','阿勒屯村回王墓园范围，非回王府或哈密市中心');
 const jiaohe=group('cheshi-goubei','交河沟北王族墓地（车师／匈奴归属待核）','秦汉','车师／匈奴（族属争议）','新疆维吾尔自治区吐鲁番市高昌区','west-jiaohe,west-jiaohe-field',{
  recognition:'attributed',siteRole:'royal_burial_search_area',nature:'unknown',
  chronology:{sortYear:-100,basis:'战国至西汉墓葬的概略排序，以主要汉代材料作同期分类'},
  evidence:'发掘参与者认为交河北侧大型竖穴墓群属于最高统治层；墓地研究讨论车师及匈奴族属异说。',
  disputes:['大型高等级墓不等于墓主已经逐位确认；保留王族候选性质。','沟西麹氏、张氏官员墓不并作车师王陵；地图参考故城—北侧台地区域，故城坐标不是墓地中心。']});
 wiki(jiaohe,'Q1330939','交河故城—北侧沟北墓地区域参考','交河故城与隔沟北台地墓地区域，千米级参考；该锚点在故城，不在已确认单墓');
 jiaohe.coordinates.estimate.basis+='；已知墓地在故城北侧隔沟台地，借故城锚点表示整体探索区域';
 jiaohe.coordinates.limitation+=' 故城锚点不能用于单墓导航。';
 const reshui=group('tuyuhun-reshui','热水墓群（吐谷浑王族墓区）','隋唐','吐蕃时期吐谷浑','青海省海西州都兰县热水乡','west-xuewei,west-xuewei-identity',{
  recognition:'archaeological',evidence:'联合考古队发掘2018血渭一号墓；王印为墓主王族身份提供依据。',
  chronology:{sortYear:744,basis:'墓地内2018血渭一号墓树轮测年744±35年的区域排序参照'},
  disputes:['墓群内并非每座都是君主墓；以已发现王族证据纳入陵区，普通墓不拆分收录。','1982血渭一号与2018血渭一号是两座不同墓，不能将前者俗称“九层妖塔”套给后者。']});
 wiki(reshui,'Q2145631','都兰热水墓群王族墓地区域','热水墓群血渭墓地区域，非2018血渭一号单墓中心');
 add('tuyuhun-xuewei-2018','2018血渭一号墓','隋唐','吐蕃时期吐谷浑','莫贺吐浑可汗（推测）','青海省海西州都兰县热水乡','west-xuewei,west-xuewei-identity',{
  parentId:reshui.id,recognition:'attributed',chronology:{sortYear:744,basis:'树轮测年744±35年，非确切卒年'},
  evidence:'出土古藏文“外甥阿柴王之印”，结合敦煌文书初步推定墓主可能是莫贺吐浑可汗。',
  disputes:['王族身份有考古证据，具体姓名仍为推定。','独立单墓中心待核；仅关联热水墓群，不复制陵区坐标增加点位。']});
 group('tuyuhun-wuwei','武威吐谷浑王族墓群（大可汗陵线索）','隋唐','唐代吐谷浑王族','甘肃省武威市凉州区','west-wuwei,west-wuwei-inventory',{
  recognition:'attributed',siteRole:'royal_burial_search_area',nature:'unknown',
  chronology:{sortYear:700,basis:'唐代吐谷浑王族墓群的概略排序，不等于大可汗墓已被找到'},
  evidence:'省级文保名录列分散墓群；慕容智墓志“大可汗陵”提供王族陵区线索。',
  disputes:['喜王慕容智属于王族成员，其墓志用于寻找大可汗陵，不将喜王直接等同可汗。','青咀湾、喇嘛湾、岔山村、马场滩和长岭墓区分散，不能随意取一处或武威中心代表全部。'],
  reviewTasks:['核对大可汗陵地望与墓号','取得各分区保护范围后分别定位；当前不造单一中心点']});
};
