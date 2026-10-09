const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'data/china-ancient-capitals.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const shu = 'https://www.nopss.gov.cn/n/2013/0419/c362367-21203630.html';
// Years describe the attested capital phase, not an invented exact founding date.
// New points are approximate geographic references; existing check-in keys stay intact.
const additions = [
  ['成都','蜀（开明时期）','春秋战国','成都','战国时期—前316年','先秦（始年未定）','中',shu,'开明迁都成都的具体年代有异说；补入先秦蜀国，不与蜀汉、前蜀、后蜀混同。'],
  ['三星堆遗址','古蜀（三星堆时期）','夏商','三星堆','商代（具体建都起讫未定）','先秦（始年未定）','高','https://www.ccdi.gov.cn/toutu/201505/t20150526_127143.html','古城遗址为商代古蜀都邑；不把遗址全部文化层年代当作连续建都年代。',30.995,104.2,'四川省德阳市广汉市三星堆遗址'],
  ['金沙遗址','古蜀（金沙时期）','夏商','古称未定','约前12世纪—前7世纪','先秦（始年未定）','高','https://wwj.sc.gov.cn/scwwj/newpic/2019/12/13/0938718cff8f4ef3ac77e0641e53268b.shtml','商末至西周古蜀都邑；年代为遗址文化阶段，不能认定某位蜀王在位年表；与三星堆的继承或并存关系仍在研究。',30.683,104.012,'四川省成都市青羊区金沙遗址'],
  ['郫邑（杜鹃城候选）','蜀（杜宇时期）','春秋战国','郫邑','西周至春秋时期（具体起讫未定）','先秦（始年未定）','低',shu,'文献与研究提出郫邑为都城或别都；都城性质、年代及城址对应未定。地图使用今郫都区域参照点。',30.81,103.887,'四川省成都市郫都区'],
  ['重庆','巴','春秋战国','江州','战国时期—前316年','先秦（始年未定）','中','https://www.gov.cn/gongbao/shuju/1986/gwyb198635.pdf','国务院历史文化名城介绍记载战国重庆为巴国国都；沿用现有重庆参照点，不表示已定位巴王宫。'],
  ['江陵','南梁','南北朝','江陵','552—554','502—557','高','https://wlt.hubei.gov.cn/bmdt/ztzl/zshb/201912/t20191226_1799529.shtml','梁元帝都江陵阶段；与555—587年的西梁/后梁分列。'],
  ['建瓯','闽（王延政）','五代十国','建州','945','909—945','高','https://tgaz.fudan.edu.cn/tgaz/placename/hvd_100001','王延政945年改殷号为闽，留都建州；不重复替代既有殷国记录。'],
  ['莒国故城','莒','春秋战国','莒','春秋至战国初期（具体起讫未定）','周代（起讫未定）','高','https://shandong-chorography.org/database/a/section/70/article/95/','故城位于今莒县县城；地图为县城区域参照点，不能等同新建旅游街区。',35.58,118.835,'山东省日照市莒县'],
  ['中山国灵寿故城','中山','春秋战国','灵寿','战国时期（具体起讫未定）','周代（起讫未定）','高','https://www.sjzps.gov.cn/columns/f681bde1-734b-4659-82a3-9feee5a002e3/202208/03/1e96205b-b5c2-4983-a7fa-c0f7c94698d6.html','遗址位于今平山、灵寿交界三汲一带，不是现代灵寿县城；地图为三汲遗址区域参照点。',38.333,114.207,'河北省石家庄市平山县三汲一带'],
  ['琅琊（越都说）','越（琅琊迁都说）','春秋战国','琅琊','战国初期（迁都起讫有争议）','先秦（始年未定）','中','https://www.xihaian.gov.cn/zwgk/jzgk/lyz/gkml/zdgz/202408/t20240801_8158035.shtml','文献与部分学者支持越迁都琅琊，也有异议；不填统一精确迁都年。地图为琅琊台区域参照点，不代表越王宫确址。',35.652,119.912,'山东省青岛市黄岛区琅琊台一带'],
  ['黄国故城','黄','春秋战国','黄','周代（具体建都起讫未定）','周代（起讫未定）','高','https://m.huangchuan.gov.cn/2019/04-15/410822.html','春秋黄国都城；地图为潢川隆古故城区域参照点，非宫殿精确坐标。',32.091,114.988,'河南省信阳市潢川县隆古乡'],
  ['薛国故城','薛','春秋战国','薛','西周至战国时期（具体建都起讫未定）','先秦（始年未定）','中','https://www.cssn.cn/dfpd/djbd/202506/t20250619_5880252.shtml','薛国都城遗址后为齐国孟尝君封邑；不把封邑时期全部计作独立国都。地图为张汪、官桥之间故城区域参照点。',34.898,117.164,'山东省枣庄市滕州市张汪镇、官桥镇之间']
];
let order = Math.max(...data.recordItems.map(x => x.sourceOrder || 0));
const added = [];
for (const [name,dynasty,era,ancient,years,regime,confidence,url,note,lat,lng,admin] of additions) {
  let site = data.items.find(x => x.name === name);
  if (site?.records.some(r => r['政权/国号'] === dynasty)) continue;
  if (!site) {
    const siteKey = `ancient-site:${name}:${lat.toFixed(5)},${lng.toFixed(5)}`;
    site = {name,lat,lng,admin,siteNames:[name],ancientNames:[],dynasties:[],eras:[],capitalTypes:[],categoryCodes:['P'],categoryLabels:['主要都城'],confidence,records:[],sourceOrder:order+1,sourceEra:era,sourceSite:name,sourceAncientName:ancient,currentPlace:name,currentKey:siteKey,siteKey,coordinatePrecision:'区域参照点，非宫殿确址'};
    data.items.push(site);
  }
  const type = confidence === '低' ? '都城或别都（地望待考）' : name.includes('越都说') ? '都城（迁都说有争议）' : name.includes('金沙') || name.includes('三星堆') ? '都邑（考古遗址）' : '正式都城';
  const raw = {'时代':era,'政权/国号':dynasty,'政权年代（原文）':regime,'都城性质':type,'都城年代（原文）':years,'古称':ancient,'今称/遗址名':name,'今属行政区':site.admin,'置信度':confidence,'备注/争议':note,'来源编号':'CAP-AUDIT-20261004','来源URL':url,'都城类别码':'P',sourceOrder:++order};
  site.records.push(raw);
  for (const [key,value] of [['siteNames',name],['ancientNames',ancient],['dynasties',dynasty],['eras',era],['capitalTypes',type]]) if (!site[key].includes(value)) site[key].push(value);
  site.recordCount = site.records.length;
  data.recordItems.push({name:`${name} · ${ancient} · ${dynasty}`,siteName:name,ancientName:ancient,dynasty,era,admin:site.admin,capitalType:type,capitalYears:years,regimeYears:regime,confidence,categoryCode:'P',sourceOrder:order,siteKey:site.siteKey,lat:site.lat,lng:site.lng,parentName:site.name,currentPlace:site.currentPlace,currentKey:site.currentKey,sourceUrl:url,note});
  added.push({name,dynasty,years,confidence,url,note});
}
// An already-complete supplement must preserve later audits, sources and migrations.
if (!added.length) {
  console.log(`Added 0 records; ${data.recordCount} records / ${data.siteCount} sites.`);
  process.exit(0);
}
data.recordCount = data.recordItemCount = data.recordItems.length;
data.siteCount = data.items.length;
data.coverageAudit = {date:'2026-10-04',basis:'在原历代政权都城目录上补查先秦方国、古蜀及已有地点的缺失建都阶段；不是仅限十大古都，也不声称穷尽所有诸侯国、封国和短期政权。',addedRecords:12,addedSites:8};
fs.writeFileSync(file, JSON.stringify(data,null,2)+'\n');
if (added.length) {
  const lines = ['# 古都查漏补缺（2026-10-04）','',`原目录295条记录、145个地点；本轮新增${added.length}条记录、8个地点。现有${data.recordCount}条记录、${data.siteCount}个地点（不含运行时西域补充）。`,'','成都原已有成家、蜀汉、谯蜀、成汉、前蜀、后蜀、大西7条记录；本轮补先秦开明时期。原记录名称、坐标、打卡键均保留。','',data.coverageAudit.basis,'','新地点坐标均为区域参照点；历史地望置信度与坐标精度分别说明。文化遗址年代不等同连续建都年表。','','|地点|补入政权／阶段|建都年代口径|置信度|依据与说明|','|---|---|---|---|---|',...added.map(x=>`|${x.name}|${x.dynasty}|${x.years}|${x.confidence}|[资料](${x.url})：${x.note}|`),'','本次重点查验先秦遗漏及南梁、闽的缺失都城阶段；未逐条重新考证原目录全部295条记录。'];
  fs.mkdirSync(path.join(root,'docs'),{recursive:true});
  fs.writeFileSync(path.join(root,'docs/ancient-capital-coverage-audit.md'),lines.join('\n')+'\n');
}
console.log(`Added ${added.length} records; ${data.recordCount} records / ${data.siteCount} sites.`);
