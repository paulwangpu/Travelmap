const fs=require('node:fs'),path=require('node:path'),dir=path.join(__dirname,'../data/imperial-tombs');
const c=JSON.parse(fs.readFileSync(path.join(dir,'catalog.json'),'utf8'));
const {mappedItems,hasVisitableChamber}=require('../imperial-tombs.js');
const eligible=c.items.filter(hasVisitableChamber),points=mappedItems(c,'',10,{}, {},true,true);
const pending=c.items.filter(x=>['known_site_not_georeferenced','parent_site_not_georeferenced','discontinuous_cemetery','partly_georeferenced'].includes(x.locationReview?.status));
const leads=[
 ['钱元瓘墓','added','wuyue-yuanguan','机构地望与南山陵园互核，新增区域点；墓体待细化。'],
 ['洪洞女娲陵','added','legend-nuwa-hongtong','省保祭祀陵区，正陵与衣冠冢传统保留，不伪造遗骸确认。'],
 ['宝鸡、高平炎帝陵','added','legend-yan-baoji,legend-yan-gaoping','同名异址分别收录，与湖南炎陵分开。'],
 ['太康、少康陵','added_shared_region','legend-taikang-area,legend-taikang,legend-shaokang','王陵村传统陵区参考点；两单陵共享位置，不画两个重合点。'],
 ['成汉墓','added','chenghan-huaxi','博物馆遗存数据库支持成汉墓；李班身份保留推定。'],
 ['亳州汤王陵','added','shang-tang-bozhou','官方规划明确为衣冠冢，区别于商王实葬。'],
 ['孙坚高陵','added_traditional_site','wu-gao-danyang','已补丹阳高陵区域点；孙坚归属与商周土墩说并存，苏州等地异说另核。'],
 ['孙亮墓、孙休定陵','pending_primary_source',null,'当涂传统地点须核保护单位和墓主认定，不能以县中心定位。'],
 ['东晋各帝陵','pending_tomb_identity',null,'鸡笼山、钟山等文献地望不等于已确认单墓；须与考古墓号对应。'],
 ['南齐景安、修安、兴安等陵','pending_entity_split',null,'先核丹阳既有陵群包含关系及石刻归属，不能仅按名单生成重复点。'],
 ['苻坚长角冢','pending_primary_source',null,'须核彬州水口镇原冢及保护记录；传统归属单独标注。'],
 ['王衍墓','pending_primary_source',null,'须核西安三赵村原葬地与现存实体，不采用村名自动推定墓体。'],
 ['李煜墓','pending_site_attribution',null,'后李村等传统墓址须与文献北邙葬地互核。'],
 ['宋端宗永福陵','pending_site_attribution',null,'大屿山黄龙坑传统须核历史资料与現存陵址实体。'],
 ['元帝诸陵','unresolved_original_burials',null,'起辇谷具体地望及各帝墓室未确认，祭祀陵不能代替实际葬地。'],
 ['霸陵、南唐钦陵','existing_corrected','han-ba,nantang-qin','保留现考古与机构资料；不沿用列表的霸陵旧址或李昪永陵错误陵号。'],
];
const review={reviewedAt:'2026-10-04',policy:'可参观地宫=有资料支持原墓室可参观或原址墓室遗存可观看；迁建、模型、仅地面景区开放不自动入选。不是实时营业保证。',eligibleRecordIds:eligible.map(x=>x.id),detailMapPointIds:points.map(x=>x.id),chambers:eligible.map(x=>({id:x.id,name:x.name,...x.visitorAccess})),knownSitesStillUnregistered:pending.map(x=>({id:x.id,name:x.name,...x.locationReview})),sovereignListLeads:leads.map(([name,status,id,reason])=>({name,status,catalogIds:id?.split(',')||[],reason})),comparisonLimit:'对参考名单提取遗漏与冲突线索；仍有待核项，不能声称已穷尽中国全部君主陵墓。'};
fs.writeFileSync(path.join(dir,'visiting-and-supplement-review.json'),JSON.stringify(review,null,2)+'\n');
const links=ids=>ids.map(id=>{const s=c.sources.find(s=>s.id===id);return s?`[${s.publisher}](${s.url})`:id;}).join('、');
fs.writeFileSync(path.join(dir,'visiting-and-supplement-review.md'),`# 地宫参观与君主陵墓查漏核查\n\n${review.reviewedAt}。${review.policy}\n\n筛选标注${eligible.length}条（包含陵群及所属单陵，不能相加作为地宫总数），详细缩放显示${points.length}个地图点。\n\n|条目|参观方式与限制|依据|\n|---|---|---|\n${eligible.map(x=>`|${x.name}|${x.visitorAccess.note}|${links(x.visitorAccess.sourceIds)}|`).join('\n')}\n\n南唐钦陵保留封闭提示，未列为确认可参观单陵；南唐二陵总项提示只参观实际开放部分。秦始皇陵、仅开放地面景区的明景陵、扬州汉陵苑迁建展示均不按原址地宫纳入。未列入筛选的条目可能尚未核查，不等于不能参观。\n\n## 地点明确但仍需原址配准\n\n红土山已补金山店子村东侧区域参考；墓口仍待测。以下${pending.length}条仍需地理证据（M16属于九女台，不另算陵区）：\n\n|条目|尚缺什么|\n|---|---|\n${pending.map(x=>`|${x.name}|${x.locationReview.reason} 下一步：${x.locationReview.nextStep}|`).join('\n')}\n\n## 参考君主陵墓列表后的处理\n\n[中国君主陵墓列表](https://zh.wikipedia.org/wiki/中國君主陵墓列表)只作发现线索；分批补入有文献或现场访问依据的条目，陵群与所属单陵不重复计点。本轮补丹阳高陵、女娲陵、宝鸡与高平炎帝陵、太康少康传统陵区5个区域点，总目录${c.totalRecords}条、${c.mapCandidateIds.length}个地图候选。\n\n|线索|处理与剩余问题|\n|---|---|\n${leads.map(([name,status,id,reason])=>`|${name}|${reason}|`).join('\n')}\n\n${review.comparisonLimit}\n`);
console.log(`Visit review: ${eligible.length} records / ${points.length} detailed points; ${pending.length} clear-site records awaiting georeferencing`);
