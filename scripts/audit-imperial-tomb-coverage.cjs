const fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'../data/imperial-tombs'),c=JSON.parse(fs.readFileSync(path.join(dir,'catalog.json'),'utf8'));
// This is an audit seed, not an assertion that every ruler or regime has a known grave.
const eras=[
 ['传说时代','传说时代'],['先秦','夏 商 西周 东周 齐 田齐 晋 楚 秦国 燕 赵国 韩 魏国 吴 越 鲁 蔡 虢 曾 中山国 陈国 宋国 郑国 卫国 许国 邾国 滕国 薛国 芮 霸 倗 古蜀 巴 西戎'],
 ['秦汉','秦 西汉 新 东汉 南越 闽越 西楚'],['魏晋南北朝','曹魏 蜀汉 东吴 西晋 东晋 刘宋 南齐 南梁 陈 北魏 东魏 西魏 北齐 北周 成汉 前赵 后赵 前凉 后凉 南凉 北凉 西凉 前燕 后燕 南燕 北燕 前秦 后秦 西秦 夏（赫连）'],
 ['隋唐','隋 唐 武周'],['五代十国','后梁 后唐 后晋 后汉 后周 吴 南唐 吴越 闽 前蜀 后蜀 南汉 北汉 荆南'],['宋辽金西夏','北宋 南宋 辽 北辽 金 西夏 西辽 大理 南诏'],['元','蒙古 元'],['明清','明 南明 清']
];
const aliases={'西周':['西周／秦（归属争议）'],'东周':['东周'],'秦国':['秦国'],'赵国':['赵国'],'魏国':['魏国'],'楚':['楚','楚国'],'蒙古':['蒙古、元（追尊）'],'元':['元','蒙古、元（追尊）'],'武周':['唐、武周'],'唐':['唐','唐、武周','唐（追尊）'],'明':['明','明（追尊）'],'清':['清','清（追尊）'],'南齐':['南齐','南齐、南梁'],'南梁':['南梁','南齐、南梁'],'曹魏':['曹魏','曹魏（追尊）']};
const matrix=eras.flatMap(([era,ds])=>ds.split(' ').map(d=>{const rows=c.items.filter(x=>(aliases[d]||[d]).includes(x.dynasty));return {era,dynasty:d,records:rows.length,singleRecords:rows.filter(x=>x.recordType==='single').length,mapCandidates:rows.filter(x=>x.mapEligible).length,sharedLocations:rows.filter(x=>x.locationReference?.coordinates).length,unlocated:rows.filter(x=>!x.mapEligible&&!x.locationReference?.coordinates).length,status:rows.length?'已有条目，君主及遗址覆盖未判定完整':'目录空白，需查君主与考古名录',recordIds:rows.map(x=>x.id)};}));
const rosters={
 '后梁':'朱温 朱友珪 朱友贞','后唐':'李存勖 李嗣源 李从厚 李从珂','后晋':'石敬瑭 石重贵','后汉':'刘知远 刘承祐','后周':'郭威 柴荣 柴宗训',
 '吴':'杨行密 杨渥 杨隆演 杨溥','南唐':'李昪 李璟 李煜','吴越':'钱镠 钱元瓘 钱弘佐 钱弘倧 钱弘俶','闽':'王审知 王延翰 王延钧 王昶 王曦 朱文进 王延政','前蜀':'王建 王衍','后蜀':'孟知祥 孟昶','南汉':'刘龑 刘玢 刘晟 刘鋹','北汉':'刘崇 刘钧 刘继恩 刘继元','荆南':'高季兴 高从诲 高保融 高保勖 高继冲',
 '元':'忽必烈 铁穆耳 海山 爱育黎拔力八达 硕德八剌 也孙铁木儿 阿速吉八 图帖睦尔 和世㻋 懿璘质班 妥懽帖睦尔',
 '东晋':'司马睿 司马绍 司马衍 司马岳 司马聃 司马丕 司马奕 司马昱 司马曜 司马德宗 司马德文',
 '南明':'朱由崧 朱聿键 朱聿鐭 朱由榔 朱以海'
};
const rulerChecks=Object.entries(rosters).flatMap(([d,names])=>names.split(' ').map(name=>{const hits=c.items.filter(x=>x.recordType==='single'&&x.occupants.some(y=>y.includes(name)));return {dynasty:d,name,rosterStatus:'工作核查名单，世系及异名继续核对；含监国，非全国君主全集',matchedRecordIds:hits.map(x=>x.id),status:!hits.length?'未匹配陵墓记录，主动查葬地文献':hits.some(x=>x.mapEligible)?'有独立或区域地图参考':hits.some(x=>x.locationReference?.coordinates)?'有所属陵区参考，单墓待核':'已有陵名或候选条目，位置待核'};}));
const leads=[
 ['传说时代','尧陵、女娲陵及异地黄帝炎帝陵','逐地辨别传统祭祀与墓葬'],['先秦','魏国王陵、宋国公陵、陈胡公墓、郑韩国君墓','现有目录政权空白；先查国保、省保与考古报告'],['先秦','晋侯墓地其他国君墓号、叶家山及文峰塔曾侯墓','已收一墓不等于整个君主墓地已覆盖'],['先秦','中山灵寿王陵其他大型墓与三汲墓区','同墓异名、墓主及墓号对应'],['先秦','周原与周公庙高等级墓群','身份争议保留，不把都城遗址自动当王陵'],['秦汉','新莽王莽及更始、赤眉政权君主葬地','历史君主与实际葬地分开查'],['魏晋南北朝','东晋各帝陵、刘宋其余帝陵、南齐梁陈帝陵','零散石刻、传统陵址与科学发掘分开'],['魏晋南北朝','北齐义平陵、武宁陵与响堂山陵址线索','优先高氏君主墓，不将王公墓自动纳入'],['魏晋南北朝','十六国君主、统万城赫连氏陵墓、前后凉及燕国墓','不能以城市遗址中心替代墓区'],['隋唐','唐和陵、唐温陵及追尊祖陵','核查十八陵以外的在位及追尊者'],['五代十国','后梁宣陵、后唐雍陵、闵帝与末帝葬地','完整五代君主名单反查'],['五代十国','吴越钱元瓘康陵、钱弘佐等陵及迁葬','钱镠一墓不能代表吴越诸王'],['五代十国','吴杨行密及杨氏陵墓、闽王延政墓','分清君主、夫人和普通贵族墓'],['五代十国','南唐李煜墓、后蜀孟昶墓、南汉刘晟昭陵','先核现存地点，再处理史载陵名'],['五代十国','北汉和荆南历代君主葬地','目前目录空白'],['宋辽金西夏','宋钦宗永献陵、宋恭帝与辽穆宗归葬','被俘、异地和迁葬情形不能漏'],['宋辽金西夏','西辽、大理国、南诏君主陵墓','地方政权不能因不在中原而跳过'],['元','起辇谷与元代历帝葬地；元顺帝葬地异说','秘密葬不等于所有元帝只有同一传说点'],['明清','南明弘光、隆武、永历陵址及贵州都匀桂王坟','同名异地及传统认定逐项核查'],['明清','建文帝与溥仪迁葬','不以未找到确切陵址删除人物缺口']
].map(([era,target,task],i)=>({id:'coverage-lead-'+(i+1),era,target,task,status:'待检索与核实',mapEligible:false}));
const out={reviewedAt:c.researchedAt,policy:'政权目录空白不等于无陵；人物无匹配不等于无墓；有一条不等于完整。先用君主工作名单和公布文保名录反查，再据原址证据定位。',totalRecords:c.totalRecords,totalMapCandidates:c.mapCandidateIds.length,matrix,rulerChecks,leads};
fs.writeFileSync(path.join(dir,'coverage-audit.json'),JSON.stringify(out,null,2)+'\n');
const omitted=rulerChecks.filter(x=>!x.matchedRecordIds.length);
fs.writeFileSync(path.join(dir,'coverage-audit.md'),`# 皇陵主动查漏底表\n\n${c.researchedAt}。覆盖核查分为政权、君主、已发表遗址三层。底表是研究任务清单，不把未核线索塞进地图，也不把条目数称为全国覆盖率。\n\n当前${c.totalRecords}条资料、${c.mapCandidateIds.length}处地图候选。${matrix.length}个政权或时期核查单元中，${matrix.filter(x=>!x.records).length}个尚无匹配记录；君主工作名单${rulerChecks.length}人，其中${omitted.length}人尚无单陵条目匹配。工作名单含监国，仍需世系、异名及完整性复核，不是全国君主全集。\n\n## 政权与位置覆盖\n\n| 时代 | 政权 | 资料条目 | 地图候选 | 共享陵区参考 | 无位置 |\n|---|---|---:|---:|---:|---:|\n${matrix.map(x=>`| ${x.era} | ${x.dynasty} | ${x.records} | ${x.mapCandidates} | ${x.sharedLocations} | ${x.unlocated} |`).join('\n')}\n\n## 君主反查\n\n同一人可有迁葬或候选陵址；此表只核匹配，不能据匹配判定墓主已确认。异名可能造成漏匹配，须人工复核。\n\n| 政权 | 君主／监国 | 目录匹配 | 下一步 |\n|---|---|---|---|\n${rulerChecks.map(x=>`| ${x.dynasty} | ${x.name} | ${x.matchedRecordIds.join('、')||'无'} | ${x.status} |`).join('\n')}\n\n## 主动待查线索\n\n${leads.map(x=>`- ${x.era}：${x.target}。${x.task}。`).join('\n')}\n\n## 名录反查本次补入\n\n后晋显陵、后汉皇陵及睿陵和颍陵、汝阳茹店传统高平陵、唐恭陵。保护名录名称与考古墓主认定分开；高平陵另与西朱村M2候选关联。\n`);
console.log(`Coverage audit: ${matrix.length} regime units, ${rulerChecks.length} ruler checks, ${leads.length} proactive research leads`);
