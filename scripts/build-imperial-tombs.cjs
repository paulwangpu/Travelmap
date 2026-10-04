/* Research catalog only: does not modify the map or existing catalogs. */
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, '..', 'data', 'imperial-tombs');
const date = '2026-10-03';
const sources = [];
function source(id, title, publisher, url, note = '') {
  sources.push({ id, title, publisher, url, accessedAt: date, note });
  return id;
}
source('qin-map','秦始皇陵遗产组成与坐标','UNESCO','https://whc.unesco.org/fr/list/441/cartes/','441-001为陵区，441-002为兵马俑坑；不可混用。');
source('ming-qing-map','明清皇家陵寝组成与坐标','UNESCO','https://whc.unesco.org/fr/list/1004/cartes/','明显陵坐标与湖北文旅厅公布范围冲突；本目录不采用该点。');
source('ming-qing','明清皇家陵寝概况','UNESCO','https://whc.unesco.org/en/list/1004/');
source('xixia-map','西夏陵遗产代表坐标','UNESCO','https://whc.unesco.org/fr/list/1736/cartes/');
source('xixia-plan','西夏陵保护规划（2019—2035）','宁夏文化和旅游厅','https://whhlyt.nx.gov.cn/zwgk/fdzdgknr/tzgg/202405/P020250609549636060930.pdf','确认九座帝陵；不据此强行指定各陵墓主。');
source('han-table','汉代雄风：西汉帝陵一览表','陕西省地方志','https://dfz.shaanxi.gov.cn/zslm/fzzlk/dqcs/201706/P020240924681697197239.pdf','行政区为书中概略地点，需补现代行政区；霸陵另据新考古结论修正。');
source('baling','江村大墓确认为汉文帝霸陵','新华网','https://www.xinhuanet.com/2021-12/17/c_1128171734.htm');
source('national-8','第八批全国重点文物保护单位','国务院','https://www.gov.cn/gbgl/75e17ff291dd418f8f758d508087cd8b/files/6250670fc770465787b85d705d4b12f9.pdf');
source('mangshan','邙山陵墓群基本概况','洛阳市考古研究院','https://lykgyjy.cn/wenwubaohu/368.html','陵群及历史陵号有据，不意味着逐陵对应的墓址已确认。');
source('caowei','曹魏时期墓葬研究','中国历史研究院','https://hrczh.cass.cn/sxqy/kgx/202502/t20250228_5852523.shtml','西朱村M2墓主可能为曹魏皇帝；不能直接定为曹叡高平陵。');
source('gaoling','曹操高陵陵园考古资料','河南省文物考古研究院','https://m.hnswwkgyjy.cn/ueditor/php/upload/file/20180828/1535424893825134.pdf');
source('zhou-xiao','北周武帝遗骨与孝陵考古','新华社','https://jp.xinhuanet.com/20240330/3ae62c76888d40d2836707a93cd20a74/c.html');
source('southern','丹阳齐梁陵墓考古工作','南京博物院','https://www.njmuseum.org.cn/files/nb/news/files/2021/02/22/0041c24645c9488e5e5d4aa1eb6f5bd1.pdf');
source('southern-dispute','南朝陵墓石刻归属研究','南京博物院《东南文化》','https://dnwh.njmuseum.org.cn/file/pdf/2015/201504/20150406.pdf','若干传统墓主认定存在异说。');
source('sui-yang','扬州隋炀帝陵遗址公园','江苏省文化和旅游厅','https://wlt.jiangsu.gov.cn/art/2024/2/22/art_695_11156089.html');
source('tang','唐十八陵简介','西安理工大学数字唐陵项目','https://ysdh-ysxy.xaut.edu.cn/lmjj/tsbljj.htm','只摘录陵名、墓主与地点等事实，不转载简介正文。');
source('song8','北宋皇陵保护答复','郑州市政府','https://public.zhengzhou.gov.cn/D1102X/4346450.jhtml');
source('song-owners','北宋七帝八陵','郑州市政协','https://zzzxy.gov.cn/dcyj/czyz/1776.html');
source('song6','宋六陵','柯桥区政府','https://wz.kq.gov.cn/art/2011/6/30/art_1605522_28782048.html','2011年资料，只用作历史陵名来源，逐陵定位需更新考古资料。');
source('liao','辽代帝陵综述','北京市文物局','https://wwj.beijing.gov.cn/bjww/wwjzzcslm/1737418/1738090/wwgs/326075177/index.html');
source('jin-confirmed','金陵展示方案核准意见','北京市文物局','https://wwj.beijing.gov.cn/bjww/362679/362680/482911/743882940/index.html','仅太祖睿陵经考古确认；道陵、裕陵等位置为推测。');
source('jin','金陵历史概况','北京市房山区政府','https://www.bjfsh.gov.cn/zjfs/lswh/wwbh/201905/t20190515_39963135.shtml?type=computer');
source('shu','前蜀王建永陵文物','香港教育局','https://www.edb.gov.hk/attachment/sc/curriculum-development/kla/pshe/references-and-resources/chinese-history/ancient_artifacts/Chapter10_sc.pdf');
source('nantang','南唐二陵','牛首山官方景区','https://tchinese.niushoushan.net/TangTomb.html','钦陵为李昪、顺陵为李璟；不采用通表的错误陵号。');
source('nanhan','南汉二陵保护规划公告','广州市文化广电旅游局','https://wglj.gz.gov.cn/xxgk/gzdt/tzgsgg/content/post_9632016.html');
source('ming13','明十三陵陵名与墓主','北京市政府','https://japanese.beijing.gov.cn/travellinginbeijing/attractions/202604/t20260409_4577643.html');
source('qing-ew','清东陵与清西陵帝陵名单','河北省文物局','https://wenwu.hebei.gov.cn/system/2023/09/26/030253453.shtml','东陵顺治陵名在页面中漏字，另列待补直接来源；不照抄错误面积。');
source('qing-west','清西陵四帝陵','河北省文化和旅游厅','https://whly.hebei.gov.cn/c/2018-07-16/556514.html');
source('xianling','明显陵与经纬度范围','湖北省文化和旅游厅','https://wlt.hubei.gov.cn/bmdt/ztzl/lszt/sjwhyc/sjyzcd/mxl/201911/t20191121_1366118.shtml','原文坐标系未标明，不将范围中心直接认作WGS84。');
source('ming-ancestor','明朝陵山之祭','故宫博物院','https://www.dpm.org.cn/court/talk/205711.html','祖陵衣冠冢与祖父实葬地说法需区分。');
source('huangdi','黄帝陵志与古柏祭祀传统','陕西省公祭轩辕黄帝网','https://huangdi.shaanxi.gov.cn/hdwh/gbai/201908/t20190820_2716577.html');
source('yandi','炎帝陵志','湖南省地方志编纂院','https://dfz.hunan.gov.cn/dfz/dqsj/202211/t20221122_29134398.html');
source('taihao','太昊陵祭祀性质','周口市政府','https://www.zhoukou.gov.cn/page_pc/zjzk/zkyx/lyjd/articleddca023879b24667beef9bb44add29a1.html');
source('shun-north','运城舜帝陵','运城市政府','https://www.yuncheng.gov.cn/doc/2020/09/22/71127.shtml');
source('shun-south','九疑山舜帝陵','湖南省政府','https://www.hunan.gov.cn/hnszf/c101484/202108/t20210830_20409592.html');
source('yu','大禹陵纪念性墓地','绍兴市政府','https://www.sx.gov.cn/art/2025/4/25/art_1229354839_59565806.html');
source('genghis','成吉思汗祭典与英灵祭祀','鄂尔多斯文化资源平台','https://www.ordoswh.cn/project/Info/index/id-7');
source('yin','殷墟王陵遗址','国家发展改革委','https://www.ndrc.gov.cn/xwdt/ztzl/dyhgjwhgy/202209/t20220920_1335798.html');
source('qin-gong','秦公陵园一号大墓','陕西师范大学','https://lishiwenhua.snnu.edu.cn/info/1644/9165.htm');
source('zhao','赵王陵与唐祖陵','河北省文物局','https://wenwu.hebei.gov.cn/system/2023/10/16/030257948.shtml');
source('wu-dun','武王墩墓主候选','寿县政府','https://www.shouxian.gov.cn/content/article/8130479','2024年的候选判断，需复核较新发表，不作为最终墓主定论。');
source('wu-dun-confirmed','武王墩一号墓考古最新认定','淮南市文化和旅游局','https://wlj.huainan.gov.cn/xwzx/xwtt/551802939.html','2025年1月公布墓主为楚考烈王，覆盖早期候选判断。');
source('sui-tai','陕西省志建设志：隋文帝泰陵','陕西省地方志','https://dfz.shaanxi.gov.cn/zslm/fzzlk/xbsxsz/szdylpdf/201404/P020240923623109161543.pdf');
source('sui-tai-local','王上村与隋文帝陵墓','杨陵区政府','https://www.ylq.gov.cn/ztzl/lszt/xczx/1906912264333094914.html');
source('qing-three','清永陵与盛京三陵墓主','辽宁省文化和旅游厅','https://whly.ln.gov.cn/whly/wlzt/lnww/sjwhycd/2BC112E80B8A4541B406312D1F0856F4/index.shtml');
source('zhongshan','中山王厝墓片区保护进展','平山县政府','https://www.sjzps.gov.cn/columns/f681bde1-734b-4659-82a3-9feee5a002e3/202606/15/8ab39634-819c-4fe7-a48a-a6fc42d5bb91.html');
const items = [];
function add(id, name, era, dynasty, occupants, admin, sourceIds, options = {}) {
  const item = { id, name, aliases: [], era, dynasty, occupants: occupants ? occupants.split('、') : [],
    admin, adminStatus: '来源概略行政区，未逐项核验现行区划', recordType: 'single', parentId: null,
    nature: 'actual_burial', recognition: 'documented', evidence: '机构资料记载陵名、墓主或陵区归属；未据此声称墓室已发掘。',
    disputes: [], sourceIds: sourceIds.split(','), coordinates: null, mapEligible: false,
    mapReason: '缺少经核实的WGS84点位', reviewTasks: ['补核单陵WGS84坐标、指向对象与精度'], ...options };
  items.push(item); return item;
}
function group(id,name,era,dynasty,admin,sourceIds,options={}) {
  return add(id,name,era,dynasty,'',admin,sourceIds,{recordType:'group',nature:'mixed',reviewTasks:['补核陵区边界或代表点；单陵未知时仅显示陵群'],...options});
}
function batch(parentId, era, dynasty, src, rows) {
  for (const row of rows) {
    const [id,name,owner,admin] = row.split('|');
    add(id,name,era,dynasty,owner,admin,src,{parentId});
  }
}
function officialPoint(id, dmsLat, dmsLng, src, externalId) {
  const decimal = dms => { const [d,m,s] = dms.split(' ').map(Number); return Number((d+m/60+s/3600).toFixed(8)); };
  const item = items.find(x=>x.id===id);
  item.coordinates = {lat:decimal(dmsLat),lng:decimal(dmsLng),crs:'WGS84',status:'datum_pending',
    target:'陵区代表点',sourceId:src,sourceRecordId:externalId,original:`N${dmsLat} E${dmsLng}`,
    method:'官方遗产地理表DMS转十进制度；采用全球遗产地理数据的WGS84约定，非现场测量',
    sourceDatumExplicit:false,precision:{sourceUnit:'arcsecond',horizontalAccuracyMeters:null},
    limitation:'已核对来源记录与地点；不代表墓室、封土中心或入口，来源未提供测量误差。'};
  item.mapEligible=false;item.mapReason='官方点值已核对，但来源未明示基准，WGS84暂为标准化假设；未完成坐标核验，不进入候选集';
  item.reviewTasks=['若需陵体级展示，补核陵体坐标；复核原始申报图坐标基准'];
}
const legendary = [
  ['legend-huangdi','桥山黄帝陵','黄帝（传说人物）','陕西省延安市黄陵县','huangdi'],
  ['legend-yandi','炎陵炎帝陵','炎帝（传说人物）','湖南省株洲市炎陵县','yandi'],
  ['legend-taihao','淮阳太昊陵','伏羲（传说人物）','河南省周口市淮阳区','taihao'],
  ['legend-shun-yuncheng','运城舜帝陵','舜（传说人物）','山西省运城市盐湖区','shun-north'],
  ['legend-shun-ningyuan','九疑山舜帝陵','舜（传说人物）','湖南省永州市宁远县','shun-south'],
  ['legend-yu','大禹陵','禹（传说时代人物）','浙江省绍兴市','yu']
];
for(const [id,name,owner,admin,src] of legendary) add(id,name,'传说时代','传说时代',owner,admin,src,{
  nature:'commemorative',recognition:'traditional',evidence:'祭祀、陵庙与地方传统有资料支持；未据此确认传说人物遗体墓葬。',
  disputes:['祭祀遗址存在不等于墓主与遗体归属得到考古确认。'],reviewTasks:['核实陵庙位置与WGS84坐标','补充同一传说人物的异地陵庙，分别建档，不按墓主去重']});
group('yin-kings','殷墟王陵区','先秦','商','河南省安阳市','yin',{nature:'actual_burial',recognition:'archaeological',disputes:['不能将各大墓强行对应具体商王；不收录后妃墓为独立帝陵。']});
group('qin-gong-group','秦公陵园','先秦','秦国','陕西省宝鸡市凤翔区','qin-gong');
add('qin-gong-1','秦公一号大墓','先秦','秦国','秦景公（推定）','陕西省宝鸡市凤翔区','qin-gong',{parentId:'qin-gong-group',recognition:'attributed',evidence:'发掘与出土石磬等材料支持秦景公认定，保留推定表述。'});
group('zhao-kings','赵王陵','先秦','赵国','河北省邯郸市','zhao',{nature:'actual_burial',disputes:['逐墓墓主需考古资料确认，先保留陵群。']});
add('chu-wuwangdun','武王墩一号墓','先秦','楚国','楚考烈王熊元','安徽省淮南市','wu-dun-confirmed,wu-dun',{recognition:'archaeological',evidence:'2025年安徽省文物局发布综合分析认定墓主为楚考烈王，市文旅局公布该结论。',disputes:['2024年早期候选信息已由2025年认定更新；旧称武王墩不表示墓主为楚武王。']});
add('zhongshan-cuo','中山王厝墓','先秦','中山国','中山王厝','河北省石家庄市平山县','zhongshan',{recognition:'documented',evidence:'政府保护进展明确王厝墓片区；需补原始发掘报告解释墓主证据。'});
add('qin-first','秦始皇陵','秦汉','秦','秦始皇嬴政','陕西省西安市临潼区','qin-map',{aliases:['秦始皇帝陵'],recognition:'archaeological',disputes:['主墓室未发掘；兵马俑坑是陵园组成，不能当作陵体点位。']});
officialPoint('qin-first','34 22 53.1','109 15 13.2','qin-map','441-001');
group('han-west','西汉帝陵','秦汉','西汉','陕西省西安市、咸阳市','han-table');
batch('han-west','秦汉','西汉','han-table',[
  'han-chang|汉长陵|汉高祖刘邦|陕西省咸阳市东北塬',
  'han-an|汉安陵|汉惠帝刘盈|陕西省咸阳市东北塬',
  'han-ba|汉霸陵（江村大墓）|汉文帝刘恒|陕西省西安市灞桥区白鹿原',
  'han-yang|汉阳陵|汉景帝刘启|陕西省咸阳市东北塬',
  'han-mao|汉茂陵|汉武帝刘彻|陕西省咸阳市兴平市',
  'han-ping|汉平陵|汉昭帝刘弗陵|陕西省咸阳市西北塬',
  'han-du|汉杜陵|汉宣帝刘询|陕西省西安市',
  'han-wei|汉渭陵|汉元帝刘奭|陕西省咸阳市东北塬',
  'han-yan|汉延陵|汉成帝刘骜|陕西省咸阳市西北塬',
  'han-yi|汉义陵|汉哀帝刘欣|陕西省咸阳市西北塬',
  'han-kang|汉康陵|汉平帝刘衎|陕西省咸阳市西北塬'
]);
Object.assign(items.find(x=>x.id==='han-ba'),{aliases:['霸陵','江村大墓'],sourceIds:['baling','national-8','han-table'],recognition:'archaeological',evidence:'2021年考古公布江村大墓为汉文帝霸陵。',disputes:['凤凰嘴是旧误认地点，不作为别名点位。','帝后同茔异穴，窦皇后陵不能作为文帝墓室坐标。']});
group('mangshan','邙山帝陵群','秦汉至五代','多政权','河南省洛阳市','mangshan',{disputes:['包括东周、东汉、曹魏、西晋、北魏、后唐等时期；仅收帝陵部分，不将整个古墓群作为皇陵计数。']});
batch('mangshan','秦汉','东汉','mangshan',[
  'han-yuan|东汉原陵|汉光武帝刘秀|河南省洛阳市',
  'han-gong|东汉恭陵|汉安帝刘祜|河南省洛阳市',
  'han-xian|东汉宪陵|汉顺帝刘保|河南省洛阳市',
  'han-huai|东汉怀陵|汉冲帝刘炳|河南省洛阳市',
  'han-wen|东汉文陵|汉灵帝刘宏|河南省洛阳市'
]);
for(const x of items.filter(x=>x.parentId==='mangshan')) x.disputes.push('历史陵号与现代墓址对应须另核，不采用传统挂牌位置作为已确认坐标。');
add('wei-gao','曹操高陵','魏晋南北朝','曹魏（追尊）','曹操','河南省安阳市','gaoling,caowei',{aliases:['安阳高陵','西高穴M2'],nature:'posthumous',recognition:'archaeological',evidence:'陵园及墓葬考古认定；曹操生前为魏王，身后追尊为魏武帝。'});
add('wei-xizhu-m2','西朱村曹魏墓M2','魏晋南北朝','曹魏','曹魏皇帝（推测，或为曹叡）','河南省洛阳市','caowei',{recognition:'attributed',disputes:['不直接命名为高平陵，墓主未确定。']});
batch('mangshan','魏晋南北朝','曹魏','mangshan',['wei-shouyang|曹魏首阳陵|魏文帝曹丕|河南省洛阳市']);
batch('mangshan','魏晋南北朝','西晋','mangshan',[
  'jin-gaoyuan|晋高原陵|晋宣帝司马懿（追尊）|河南省洛阳市',
  'jin-junping|晋峻平陵|晋景帝司马师（追尊）|河南省洛阳市',
  'jin-chongyang|晋崇阳陵|晋文帝司马昭（追尊）|河南省洛阳市',
  'jin-junyang|晋峻阳陵|晋武帝司马炎|河南省洛阳市',
  'jin-taiyang|晋太阳陵|晋惠帝司马衷|河南省洛阳市'
]);
for(const id of ['jin-gaoyuan','jin-junping','jin-chongyang']) items.find(x=>x.id===id).nature='posthumous';
batch('mangshan','魏晋南北朝','北魏','mangshan',[
  'wei-chang|北魏长陵|北魏孝文帝元宏|河南省洛阳市',
  'wei-jing|北魏景陵|北魏宣武帝元恪|河南省洛阳市',
  'wei-ding|北魏定陵|北魏孝明帝元诩|河南省洛阳市',
  'wei-jing2|北魏静陵|北魏孝庄帝元子攸|河南省洛阳市'
]);
for(const x of items.filter(x=>x.parentId==='mangshan')) if(!x.disputes.length) x.disputes.push('陵号、墓主来自机构概述；逐陵墓址与认定程度待核。');
add('zhou-xiao','北周孝陵','魏晋南北朝','北周','北周武帝宇文邕、阿史那皇后','陕西省咸阳市','zhou-xiao',{recognition:'archaeological',evidence:'1994—1995年考古发掘及帝后遗骨、印玺等材料。',disputes:['同一帝后合葬陵只计一条，不按人数拆分。']});
group('southern-danyang','丹阳南朝齐梁帝陵遗存','魏晋南北朝','南齐、南梁','江苏省镇江市丹阳市','southern,southern-dispute',{disputes:['不能将十二处石刻全部当作十二座帝陵；王侯墓排除，传统归属保留争议。']});
add('liang-jian','梁建陵','魏晋南北朝','南梁','梁文帝萧顺之（追尊）','江苏省镇江市丹阳市','southern',{nature:'posthumous',parentId:'southern-danyang',recognition:'attributed',disputes:['石刻、神道与墓室位置需区分；补核墓主认定依据。']});
add('sui-yang','隋炀帝墓（曹庄）','隋唐','隋','隋炀帝杨广、萧皇后','江苏省扬州市邗江区','sui-yang',{aliases:['曹庄隋炀帝墓'],recognition:'archaeological',evidence:'2013年抢救性考古发掘确认的帝后墓葬。',disputes:['与槐泗旧称隋炀帝陵及洛宁衣冠冢分开，不能沿用旧景区点位。']});
add('sui-tai','隋泰陵','隋唐','隋','隋文帝杨坚','陕西省杨陵区王上村','sui-tai,sui-tai-local',{disputes:['旧行政区资料常写扶风，不能由扶风县城代替陵址。']});
group('tang18','唐十八陵','隋唐','唐','陕西省咸阳市、渭南市','tang');
batch('tang18','隋唐','唐','tang',[
  'tang-xian|唐献陵|唐高祖李渊|陕西省咸阳市三原县',
  'tang-zhao|唐昭陵|唐太宗李世民|陕西省咸阳市礼泉县',
  'tang-qian|唐乾陵|唐高宗李治、武周皇帝武则天|陕西省咸阳市乾县',
  'tang-ding|唐定陵|唐中宗李显|陕西省渭南市富平县',
  'tang-qiao|唐桥陵|唐睿宗李旦|陕西省渭南市蒲城县',
  'tang-tai|唐泰陵|唐玄宗李隆基|陕西省渭南市蒲城县',
  'tang-jian|唐建陵|唐肃宗李亨|陕西省咸阳市礼泉县',
  'tang-yuan|唐元陵|唐代宗李豫|陕西省渭南市富平县',
  'tang-chong|唐崇陵|唐德宗李适|陕西省咸阳市泾阳县',
  'tang-feng|唐丰陵|唐顺宗李诵|陕西省渭南市富平县',
  'tang-jing|唐景陵|唐宪宗李纯|陕西省渭南市蒲城县',
  'tang-guang|唐光陵|唐穆宗李恒|陕西省渭南市蒲城县',
  'tang-zhuang|唐庄陵|唐敬宗李湛|陕西省咸阳市三原县',
  'tang-zhang|唐章陵|唐文宗李昂|陕西省渭南市富平县',
  'tang-duan|唐端陵|唐武宗李炎|陕西省咸阳市三原县',
  'tang-zhen|唐贞陵|唐宣宗李忱|陕西省咸阳市泾阳县',
  'tang-jian2|唐简陵|唐懿宗李漼|陕西省渭南市富平县',
  'tang-jing2|唐靖陵|唐僖宗李儇|陕西省咸阳市乾县'
]);
items.find(x=>x.id==='tang-qian').disputes.push('两位在位君主共用一陵，按陵计一条；武则天不另建重复记录。');
add('shu-yong','前蜀永陵','五代十国','前蜀','前蜀高祖王建','四川省成都市','shu',{aliases:['王建墓','成都永陵'],recognition:'archaeological'});
group('nantang2','南唐二陵','五代十国','南唐','江苏省南京市江宁区','nantang');
batch('nantang2','五代十国','南唐','nantang',[
  'nantang-qin|南唐钦陵|南唐烈祖李昪、宋皇后|江苏省南京市江宁区',
  'nantang-shun|南唐顺陵|南唐中主李璟、钟皇后|江苏省南京市江宁区'
]);
for(const x of items.filter(x=>x.parentId==='nantang2')) {x.recognition='archaeological';x.evidence='发掘出土哀册等材料支持墓主认定。';}
group('nanhan2','南汉二陵','五代十国','南汉','广东省广州市番禺区','nanhan');
batch('nanhan2','五代十国','南汉','nanhan',[
  'nanhan-de|南汉德陵|南汉烈宗刘隐（追尊）|广东省广州市番禺区小谷围岛',
  'nanhan-kang|南汉康陵|南汉高祖刘龑|广东省广州市番禺区小谷围岛'
]);
items.find(x=>x.id==='nanhan-de').nature='posthumous';
add('later-tang-hui','后唐徽陵','五代十国','后唐','后唐明宗李嗣源','河南省洛阳市','mangshan',{parentId:'mangshan',disputes:['机构资料确认历史归属；墓址未核。']});
group('song8','北宋皇陵','宋辽金西夏','北宋','河南省郑州市巩义市','song8,song-owners');
batch('song8','宋辽金西夏','北宋','song8,song-owners',[
  'song-an|宋永安陵|宋宣祖赵弘殷（追尊）|河南省郑州市巩义市',
  'song-chang|宋永昌陵|宋太祖赵匡胤|河南省郑州市巩义市',
  'song-xi|宋永熙陵|宋太宗赵炅|河南省郑州市巩义市',
  'song-ding|宋永定陵|宋真宗赵恒|河南省郑州市巩义市',
  'song-zhao|宋永昭陵|宋仁宗赵祯|河南省郑州市巩义市',
  'song-hou|宋永厚陵|宋英宗赵曙|河南省郑州市巩义市',
  'song-yu|宋永裕陵|宋神宗赵顼|河南省郑州市巩义市',
  'song-tai|宋永泰陵|宋哲宗赵煦|河南省郑州市巩义市'
]);
items.find(x=>x.id==='song-an').nature='posthumous';
group('song6','南宋六陵','宋辽金西夏','南宋','浙江省绍兴市','song6',{disputes:['“六陵”指六位南宋皇帝，来源另提北宋徽宗陵；不能由名称推断整个陵区只有六座帝陵。']});
batch('song6','宋辽金西夏','南宋','song6',[
  'song-si|宋永思陵|宋高宗赵构|浙江省绍兴市',
  'song-fu|宋永阜陵|宋孝宗赵昚|浙江省绍兴市',
  'song-chong|宋永崇陵|宋光宗赵惇|浙江省绍兴市',
  'song-mao|宋永茂陵|宋宁宗赵扩|浙江省绍兴市',
  'song-mu|宋永穆陵|宋理宗赵昀|浙江省绍兴市',
  'song-shao|宋永绍陵|宋度宗赵禥|浙江省绍兴市'
]);
for(const x of items.filter(x=>x.parentId==='song6')) x.disputes.push('历史陵名明确，逐陵考古对应及后期迁葬情况待核；不将陵区中心复制为六个坐标。');
add('liao-zu','辽祖陵','宋辽金西夏','辽','辽太祖耶律阿保机','内蒙古自治区赤峰市','liao',{recognition:'attributed',disputes:['尚未正式发掘，认定不等同于墓室出土确认。']});
group('liao-huai','辽怀陵','宋辽金西夏','辽','内蒙古自治区赤峰市','liao',{occupants:['辽太宗耶律德光','辽穆宗耶律璟'],nature:'actual_burial',disputes:['两帝分墓，先保留陵群而非一座合葬陵。']});
group('liao-qing','辽庆陵','宋辽金西夏','辽','内蒙古自治区赤峰市','liao',{occupants:['辽圣宗耶律隆绪','辽兴宗耶律宗真','辽道宗耶律洪基'],nature:'actual_burial',disputes:['需核东中西三陵对应，不按墓主猜测坐标。']});
group('jin-group','金陵（大房山陵区）','宋辽金西夏','金','北京市房山区','jin,jin-confirmed');
add('jin-rui','金太祖睿陵','宋辽金西夏','金','金太祖完颜阿骨打','北京市房山区','jin,jin-confirmed',{parentId:'jin-group',recognition:'archaeological',evidence:'北京市文物局核准意见明确此陵经考古发掘确认。',disputes:['有迁葬历史，不能将上京初葬地点与房山陵址合并。']});
group('xixia9','西夏陵','宋辽金西夏','西夏','宁夏回族自治区银川市','xixia-plan,xixia-map',{nature:'actual_burial',recognition:'archaeological',disputes:['九座帝陵的具体墓主不全部确定；不将编号等同于帝王世次。']});
officialPoint('xixia9','38 24 57','105 58 16','xixia-map','1736');
for(let n=1;n<=9;n++) add(`xixia-${n}`,`西夏陵${n}号陵`,'宋辽金西夏','西夏','未确定','宁夏回族自治区银川市','xixia-plan',{parentId:'xixia9',recognition:'archaeological',evidence:'官方保护规划列九座帝陵；以编号保留实体。',disputes:['墓主待核，不照传统候选直接赋名。']});
add('yuan-genghis','成吉思汗陵（祭祀陵）','元','蒙古、元（追尊）','成吉思汗铁木真','内蒙古自治区鄂尔多斯市伊金霍洛旗','genghis',{nature:'commemorative',recognition:'traditional',evidence:'资料明确为英灵供奉与传统祭祀场所。',disputes:['不以现有祭祀陵定位实际遗体墓；“衣冠冢”与祭祀陵措辞需补专门文献。']});
group('ming13','明十三陵','明清','明','北京市昌平区','ming13,ming-qing-map');
batch('ming13','明清','明','ming13',[
  'ming-chang|明长陵|明成祖朱棣|北京市昌平区',
  'ming-xian|明献陵|明仁宗朱高炽|北京市昌平区',
  'ming-jing|明景陵|明宣宗朱瞻基|北京市昌平区',
  'ming-yu|明裕陵|明英宗朱祁镇|北京市昌平区',
  'ming-mao|明茂陵|明宪宗朱见深|北京市昌平区',
  'ming-tai|明泰陵|明孝宗朱祐樘|北京市昌平区',
  'ming-kang|明康陵|明武宗朱厚照|北京市昌平区',
  'ming-yong|明永陵|明世宗朱厚熜|北京市昌平区',
  'ming-zhao|明昭陵|明穆宗朱载坖|北京市昌平区',
  'ming-ding|明定陵|明神宗朱翊钧|北京市昌平区',
  'ming-qing|明庆陵|明光宗朱常洛|北京市昌平区',
  'ming-de|明德陵|明熹宗朱由校|北京市昌平区',
  'ming-si|明思陵|明思宗朱由检|北京市昌平区'
]);
officialPoint('ming13','40 16 10.40','116 14 40.60','ming-qing-map','1004-004');
add('ming-xiao','明孝陵','明清','明','明太祖朱元璋','江苏省南京市','ming-qing,ming-qing-map');
officialPoint('ming-xiao','32 3 30.00','118 51 7.00','ming-qing-map','1004-005');
add('ming-xianling','明显陵','明清','明','明睿宗朱祐杬（追尊）、蒋皇后','湖北省荆门市钟祥市','xianling,ming-qing-map',{nature:'posthumous',disputes:['UNESCO表N31°01′、E112°39′与湖北文旅厅N31°12′20″—13′00″、E112°37′50″—38′09″冲突，暂不采用任一点。','湖北原始坐标范围未明确基准，不能直接转换成已确认WGS84。'],reviewTasks:['核查原始申报图解决坐标冲突','核实陵体或陵区代表点的WGS84基准']});
add('ming-zu','明祖陵','明清','明（追尊）','朱百六、朱四九、朱初一','江苏省淮安市盱眙县','ming-ancestor',{nature:'cenotaph',recognition:'documented',disputes:['故宫研究称三代衣冠冢；另有祖父实葬地说法，须进一步核对，nature仅表示当前所引研究的分类。'],reviewTasks:['补核衣冠与实葬说法、迁葬历史','核实WGS84点位']});
add('ming-huang','明皇陵','明清','明（追尊）','明仁祖朱世珍、陈皇后','安徽省滁州市凤阳县','ming-ancestor',{nature:'posthumous'});
group('qing-east','清东陵','明清','清','河北省唐山市遵化市','qing-ew,ming-qing-map');
batch('qing-east','明清','清','qing-ew',[
  'qing-xiao|清孝陵|顺治帝福临|河北省唐山市遵化市',
  'qing-jing|清景陵|康熙帝玄烨|河北省唐山市遵化市',
  'qing-yu|清裕陵|乾隆帝弘历|河北省唐山市遵化市',
  'qing-ding|清定陵|咸丰帝奕詝|河北省唐山市遵化市',
  'qing-hui|清惠陵|同治帝载淳|河北省唐山市遵化市'
]);
items.find(x=>x.id==='qing-xiao').reviewTasks.push('补核顺治孝陵名称直接来源，当前河北页面漏字');
officialPoint('qing-east','40 11 9.28','117 38 22.31','ming-qing-map','1004-002');
group('qing-west','清西陵','明清','清','河北省保定市易县','qing-west,ming-qing-map');
batch('qing-west','明清','清','qing-west',[
  'qing-tai|清泰陵|雍正帝胤禛|河北省保定市易县',
  'qing-chang|清昌陵|嘉庆帝颙琰|河北省保定市易县',
  'qing-mu|清慕陵|道光帝旻宁|河北省保定市易县',
  'qing-chong|清崇陵|光绪帝载湉|河北省保定市易县'
]);
officialPoint('qing-west','39 19 60.00','115 13 0.00','ming-qing-map','1004-003');
add('qing-yong','清永陵','明清','清（追尊）','清代追尊先祖（逐位待核）','辽宁省抚顺市新宾满族自治县','qing-three,ming-qing-map',{nature:'posthumous',reviewTasks:['补核各追尊先祖与实体墓冢及衣冠冢关系','补核陵体级WGS84坐标']});
add('qing-fu','清福陵','明清','清','清太祖努尔哈赤','辽宁省沈阳市','qing-three,ming-qing-map');
add('qing-zhao','清昭陵','明清','清','清太宗皇太极','辽宁省沈阳市','qing-three,ming-qing-map');
officialPoint('qing-yong','41 20 37.00','124 49 18.00','ming-qing-map','1004-012');
officialPoint('qing-fu','41 49 34.00','123 34 49.00','ming-qing-map','1004-013');
officialPoint('qing-zhao','41 50 29.00','123 25 4.00','ming-qing-map','1004-014');
const coverageGaps = [
  {era:'跨时代西域及地方政权',targets:'乌孙、龟兹、于阗、楼兰、焉耆、疏勒、高昌及其他地方政权君主墓；武威吐谷浑大可汗陵',reason:'已增新疆汗王陵、回王墓及车师王族候选；各政权需继续反查文保名录与发掘报告。阿斯塔那等公共墓地不能整体认作王陵；没有直接王族依据的普通古墓不批量添加。'},
  {era:'传说时代',targets:'尧陵、女娲陵及异地黄帝炎帝陵',reason:'逐地补官方依据；传统祭祀地与实际墓址分开。'},
  {era:'先秦',targets:'夏王陵、中山及楚国其他王陵、曾国其他国君墓；胡庄、虚粮冢、鲁九公墓、蔡侯墓独立位置',reason:'有记录但部分缺原址坐标；墓主推定与确认分开，不能以城市中心造点。'},
  {era:'秦汉',targets:'东汉慎陵、康陵、静陵的实体对应与独立位置',reason:'已收历史陵名，具体考古墓号尚未可靠对应，不把洛阳陵区点复制为三座陵。'},
  {era:'魏晋南北朝',targets:'首阳陵、高原陵、峻平陵、太阳陵、西朱村M2、南齐泰安陵独立位置及十六国其他帝陵',reason:'已有条目继续核对原址及归属；陵区概述不能代替逐陵坐标。'},
  {era:'隋唐',targets:'唐建陵独立位置、唐和陵、唐温陵、隋恭帝陵与其他追尊祖陵',reason:'唐建陵已有记录，独立坐标仍待核；唐和陵、温陵仍需实体与原址核对；唐恭陵已补。'},
  {era:'五代十国',targets:'后梁、吴、吴越、闽、北汉、荆南等遗漏君主陵及后晋、后汉逐陵位置',reason:'按君主工作名单和文保名录反查；后晋显陵、后汉睿陵颍陵已补，不能据各一两条认定政权覆盖完整。'},
  {era:'宋辽金西夏',targets:'金太祖睿陵独立位置、南宋六陵逐陵对应及西夏墓号与墓主关系',reason:'辽显陵、乾陵已补陵前遗址估计点；其墓室归属和原保护附件坐标仍待进一步核对。'},
  {era:'元',targets:'其余元帝实际葬地及大不儿罕山与起辇谷的对应',reason:'已补传说葬地区域；实际墓室仍未确认，不以圣地参考坐标证明元帝墓址。'},
  {era:'明清',targets:'慈安定东陵独立位置、建文帝陵址线索、其他南明陵与溥仪迁葬关系',reason:'清永陵先祖已补姓名及衣冠冢说明；个人生卒继续核对，传说不能代替实际墓址。'}
];
require('./expand-imperial-tombs.cjs')({items,add,group,source});
require('./expand-preqin-tombs.cjs')({items,add,group,source});
require('./expand-royal-tombs.cjs')({add,group,source});
require('./expand-shang-tombs.cjs')({items,add,source});
require('./expand-eastern-han-tombs.cjs')({items,add,source});
require('./expand-royal-tombs-ten-rounds.cjs')({items,add,group,source});
require('./expand-beijing-royal-tombs.cjs')({items,add,group,source});
require('./expand-inventory-tombs.cjs')({items,add,group,source});
require('./expand-archaeological-royal-tombs.cjs')({items,add,group,source});
require('./expand-early-royal-sites.cjs')({add,group,source});
require('./expand-western-royal-tombs.cjs')({items,add,group,source});
require('./expand-jin-migration-sites.cjs')({items,add,group,source});
require('./complete-jin-tombs.cjs')({items,add,source});
require('./review-recent-tomb-archaeology.cjs')({items,add,source});
require('./enrich-imperial-tombs.cjs')({items,sources,add,group,batch,source,dir});
require('./complete-missing-tomb-locations.cjs')({items,source});
for (const item of items) if (item.era === '明清') item.era = item.dynasty.startsWith('清') ? '清' : '明';
require('./imperial-tomb-chronology.cjs')(items);
require('./enrich-imperial-tomb-lifetimes.cjs')({items,source,sources});
require('./classify-preqin-tombs.cjs')(items);
require('./classify-preqin-periods.cjs')(items);
require('./review-western-zhou-tombs.cjs')({items,source});
const disturbanceLabels=require('./enrich-imperial-tomb-disturbance.cjs')({items,source});
for(const x of items.filter(x=>x.locationReference)) {
 const p=items.find(p=>p.id===x.locationReference.parentId);
 if(p?.coordinates)x.locationReference.coordinates={lat:p.coordinates.lat,lng:p.coordinates.lng,crs:'WGS84',sourceId:p.coordinates.sourceId};
}
const recentM27=items.find(x=>x.id==='shang-m27');
recentM27.disturbance={status:'archaeological_evidence',label:disturbanceLabels.archaeological_evidence,evidence:'2025年度发掘记录H335、H348早期盗坑直达墓底，椁室被盗一空；保留2026年公开报告。',scope:'M27墓室',sourceIds:['recent-yin-2025'],reviewedAt:date};
const mapCandidateIds = items.filter(x=>x.mapEligible).map(x=>x.id);
const summary = {};
for(const x of items) {
  const s=summary[x.era] ||= {records:0,singles:0,groups:0,mapCandidates:0,sourcePointsPendingDatum:0,missingCoordinates:0};
  s.records++;s[x.recordType==='single'?'singles':'groups']++;s.mapCandidates+=Number(x.mapEligible);s.sourcePointsPendingDatum+=Number(x.coordinates?.status==='datum_pending');s.missingCoordinates+=Number(!x.coordinates);
}
const catalog = {schemaVersion:1,researchedAt:date,status:'research_catalog_not_exhaustive',
  scope:'中国历代君主陵、先秦王陵、地方政权及地方世袭统治者王陵、传说祭祀陵与有王权文化依据的王陵探索区；单陵优先、陵群兜底。探索区不表示已确认墓葬，不以现代民族名称替代历史政权归属。',
  countPolicy:'记录数不是实际陵墓总数：陵群与子陵不能相加；单陵按实体而非墓主人数统计；同名异陵以稳定ID区分。siteRole=royal_burial_search_area为探索线索，不计已发现王陵。',
  natureLabels:{actual_burial:'实际墓葬',posthumous:'追尊陵（实葬性质另见证据）',cenotaph:'衣冠冢',commemorative:'祭祀纪念陵',mixed:'陵群或混合性质',unknown:'性质未明'},
  recognitionLabels:{archaeological:'有考古支持（程度见证据）',documented:'机构文献记载',attributed:'归属推定',traditional:'传统或祭祀认定'},
  coordinatePolicy:'WGS84为目标坐标系。verified_wgs84为已核对地理实体及坐标系的区域参考点，非现场测绘；estimated_wgs84须保存估计依据和参考范围，地图明确标估；datum_pending禁止入图。locationReference仅关联所属陵区，不生成重复单陵点。未知点为null，不以0或城中心补齐；精度小数位不等于测量准确度。',
  disturbanceLabels,totalRecords:items.length,summary,mapCandidateIds,coverageGaps,sources,items};
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'catalog.json'),JSON.stringify(catalog,null,2)+'\n');
require('./write-imperial-tomb-reports.cjs');
require('./audit-imperial-tomb-coverage.cjs');
console.log(JSON.stringify({records:items.length,mapCandidates:mapCandidateIds.length,summary},null,2));
