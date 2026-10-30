// Incremental evidence/registration review. It never rebuilds the site catalog.
const fs=require('node:fs'),crypto=require('node:crypto');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n'),hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const date='2026-10-28',dir='output/four-sites-calibration-20261028/',reportPath='docs/four-sites-calibration-20261028.json';
if(fs.existsSync(reportPath))throw Error('Review already applied; inspect the audit before running again.');
const q=read('data/qin-xianyang-palace.geojson'),qa=read('docs/qin-xianyang-palace-calibration.json'),d=read('data/datong-historic-sites.geojson'),da=read('docs/datong-archaeology.json'),c=read('data/imperial-tombs/catalog.json');
const inputHashes=Object.fromEntries(['data/qin-xianyang-palace.geojson','docs/qin-xianyang-palace-calibration.json','data/datong-historic-sites.geojson','docs/datong-archaeology.json','data/imperial-tombs/catalog.json'].map(p=>[p,hash(fs.readFileSync(p,'utf8'))]));
const before=structuredClone(c),beforeQ=read(dir+'qin-xianyang-palace.geojson'),beforeD=read(dir+'datong-historic-sites.geojson');
const sources={
 'song6-2018-report':{title:'浙江绍兴宋六陵陵园遗址2018年考古发掘简报',publisher:'浙江省文物考古研究所等，《考古与文物》2021年第1期',url:'https://yangtze.silkroadinfo.org.cn/2021/8/20210825153441258%E6%B5%99%E6%B1%9F%E7%BB%8D%E5%85%B4%E5%AE%8B%E5%85%AD%E9%99%B5%E9%99%B5%E5%9B%AD%E9%81%97%E5%9D%802018%E5%B9%B4%E8%80%83%E5%8F%A4%E5%8F%91%E6%8E%98%E7%AE%80%E6%8A%A5.pdf',note:'原高宗陵保护区暂编一号陵园；编号不是帝陵年代顺序，不能由原保护区名称认定墓主。本次原文镜像下载失败，未据其中图件新增坐标。'},
 'song6-identity-study':{title:'宋六陵一号陵园遗址性质及诸陵位置蠡测',publisher:'雷长胜，绍兴市文物考古研究所；《绍兴文博》2021，2022年出版，第146—151页',url:'https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3000/site/attach/0/f3ee2b8a49014b56acd2ec3f6abc49a0.pdf',note:'已读取原文。提出一号陵园为高宗吴皇后陵等推测，作者明确并非已定论的逐陵身份、绝对位置。'},
 'song6-lower-palace-review':{title:'宋六陵二号陵园考古又有新成果',publisher:'杭州亚运会官方门户，2022-01-08；考古领队李晖达说明',url:'https://www.hangzhou2022.cn/sqzc/sxsq/202201/t20120108_43261.shtml'.replace('t20120108','t20220108'),note:'二号陵园判断为下宫，不能等同原宁宗陵标牌，也不是第二座帝陵。'},
 'song6-2023-correspondence':{title:'宋六陵考古是中国帝陵考古重大突破',publisher:'浙江党建网，2023-09-28；浙江省文物考古研究所考古领队李晖达报告',url:'https://www.zjdj.com.cn/zjcf/xcwhfamily/202309/t20230928_26278988.shtml',note:'一、三、四号为上宫，二号可能与四号合属上下宫；具体帝后身份及位次仍待明确。'},
 'jin-2025-official-attribution':{title:'北京市文物局关于金陵主陵区环境整治与展示项目设计方案核准的复函',publisher:'北京市文物局，京文物〔2025〕1624号，2025-12-15公开',url:'https://wwj.beijing.gov.cn/bjww/362679/362680/482911/743882940/index.html',note:'明确仅太祖睿陵经考古发掘确认；道陵、裕陵等位置属推测，未确认陵寝宜用数字编号。法定区划以2007年公布的区划为依据。'},
 'jin-official-site-confirmation':{title:'金陵',publisher:'北京市文物局，全国重点文物保护单位介绍',url:'https://wwj.beijing.gov.cn/bjww/wwjzzcslm/1737418/1738088/1742737/523439/index.html',note:'确认房山区金陵历史陵区及已发掘太祖睿陵，不提供各陵可直接采用的实测坐标。'}
};
for(const [id,s]of Object.entries(sources)){const old=c.sources.find(x=>x.id===id);if(old)throw Error('Source id already exists: '+id);c.sources.push({id,...s,accessedAt:date});}
const report={date,policy:'核对图件、考古编号与陵名；没有独立定位依据时不移动遗址、不生成单陵坐标。',baseline:read(dir+'baseline-hashes.json'),qin:{originalGeometryHashes:Object.fromEntries(beforeQ.features.map(f=>[f.properties.sourceId,hash(f.geometry)])),completeCurrentLegalBoundary:false,geometryChanged:false},pingcheng:{},song:[],jin:[],sources};
for(const f of q.features){const p=f.properties;p.calibrationReviewedAt=date;
 if(p.sourceId==='qin-xianyang-palace-core-2021'){
  p.sourceName='秦咸阳宫区（2021考古总图参考）';p.label='秦咸阳宫区';p.boundaryNature='archaeological_synthesis_reference';
  p.status='2021考古总图宫区参考外缘 · 非全城墙界或现行保护区';
  p.enStatus='Palace-precinct reference from the 2021 archaeological synthesis; neither city walls nor current legal protection boundary';
  p.note+=' 2026-10-28复核：图中数字1—15是图例索引，不是宫殿编号。总图宫区与一、二、三、五、六号宫殿的逐建筑几何分别保留；不以703公顷现代公园规划或旧OSM保护区反推宫区。现有影像配准缺独立测量检核，本轮不作无依据平移，不能称为已完成实测校准。';
  p.enNote+=' Reviewed 2026-10-28: numbers 1–15 are legend indices, not palace numbers. Individual palace geometries remain separate. Neither the 703-ha modern park nor an old OSM protection outline establishes the ancient precinct. No unsupported translation is applied; independent survey validation remains unavailable.';
 }else if(/protection-2021$/.test(p.sourceId)){
  p.boundaryNature='historical_protection_diagram_reference';p.legalBoundaryVerified=false;
  p.status='2021旧图保护线参考 · 非2022规划现行法定区划';
  p.enStatus='Reference protection line on a 2021 diagram, not the current legal boundary under the 2022-approved plan';
  p.note+=' 本轮复核仍未取得2022年批准规划的完整公开区划图及坐标；2021紫线不能升级为现行法定界线，703公顷遗址公园规划也不能替代。';
  p.enNote+=' The complete current zoning map/coordinates of the plan approved in 2022 remain unavailable; neither this older purple line nor the 703-ha archaeological park is substituted for that legal boundary.';
 }
}
qa.review20261028={geometryChanged:false,legendNumbering:'数字1—15是图例索引，非宫殿编号',currentLegalBoundaryVerified:false,registrationStatus:'原影像配准保留，缺独立测绘检核，不报告地面精度',sourceYear:2021,approvedPlanYear:2022,modernParkAreaHectares:703,parkIsLegalBoundary:false};
q.protectionReview={...q.protectionReview,reviewedAt:date,completeLegalBoundaryVerified:false,currentPlanApprovedIn:2022,modernParkNotSubstituted:true};
const guo=d.features.find(f=>f.properties.sourceId==='datong-northern-wei-guo-circuit'),gr=da.guoClosureReview;
const shifted=structuredClone(guo.geometry),original=structuredClone(gr.northEastCorrection?.priorGeometry);
if(!original)throw Error('Original source-based registration missing');
guo.geometry=original;
Object.assign(guo.properties,{label:'北魏平城郭城（待考）',sourceName:'北魏平城郭城（研究候选）',enSourceName:'Pingcheng outer enclosure (research hypothesis)',enLabel:'Pingcheng outer enclosure (unconfirmed)',status:'学术示意图候选范围 · 四至待考，非考古实测城墙',enStatus:'Candidate circuit from an academic schematic; limits unconfirmed, not surveyed archaeological walls',fillOpacity:.015,lineOpacity:.6,calibrationReviewedAt:date,calibrationQuality:'schematic_not_independently_georeferenced',note:'复核武彤2024年第50页图3：图题为“四郊礼制空间示意图”，黑色虚线圈只能作为研究候选，不能将四郊空间和已确认郭城墙混同。恢复原相似变换转绘的闭合几何，撤销2026-10-23为贴合宫城及现状御河而人工北移约200米、东移约550米的改动；古河与现代河道不能未经证据强制重合。原图内四个府城参照点残差约32米，独立明堂点偏差约694米，说明示意图不能提供精确绝对范围。平城区政府2026年3月资料仍说明四至尚未确定，后续须取得分期考古总图与控制点。现存OSM墙体、宫城、外城及明堂点均不移动。',enNote:'Figure 3 on p.50 of Wu Tong (2024) is explicitly a schematic of suburban ritual space; its dashed enclosure is only a research hypothesis, not a confirmed archaeological circuit. Restore the original similarity-transformed outline and reject the unsupported north/east shifts made on 2026-10-23 to match the palace and present river. Modern and ancient river courses cannot be forced to coincide. About 32 m contextual residuals coexist with a 694 m independent Mingtang discrepancy, demonstrating major schematic distortion. The Pingcheng government stated in March 2026 that the city limits remain undetermined. Original OSM walls, palace/city references and the Mingtang point remain unchanged.'});
gr.review20261028={sourceYear:2024,governmentSource:'https://www.pingcheng.gov.cn/pcqrmzfz/sqglcyjj/202009/cae6a468831648afaa98662286b5667b.shtml',sourceFigureTitle:'北魏平城四郊礼制空间示意图',priorDisplayedGeometry:shifted,restoredGeometry:original,rejectedManualShift:gr.northEastCorrection,conclusion:'恢复可复算的源图转绘；不宣称范围已完成精确地理校准。'};
gr.geometry=structuredClone(original);gr.northEastCorrection.status='rejected_20261028';
da.features=structuredClone(d.features);
report.pingcheng={source:gr.source,featureId:guo.properties.sourceId,priorGeometry:shifted,currentGeometry:original,manualShiftRejected:true,independentCheckMeters:gr.independentMingtangCheck.distanceMeters,surveyBoundaryConfirmed:false,otherGeometriesUnchanged:true};
for(const stage of Object.values(d.capitalStagesByKey||{}).flat())if(/郭城/.test(JSON.stringify(stage))){stage.boundaryStatus='郭城闭合研究候选，四至待考；本轮撤销无控制点的人工平移';stage.summary+=' 2026-10-28复核仅恢复源图可复算转绘，保留694米独立检验偏差，不称为精确考古城界。';}
da.capitalStagesByKey=structuredClone(d.capitalStagesByKey);
const addSources=(x,ids)=>{x.sourceIds=[...new Set([...(x.sourceIds||[]),...ids])];};
const songDescriptions={
 'song-si':['永思陵','一号陵园原处于“高宗陵”保护区，但原标牌不是墓主鉴定；雷长胜研究提出一号为吴皇后陵的另一解释。一号不能直接绑定宋高宗，亦不能据此认定吴后身份已定论。'],
 'song-fu':['永阜陵','历史陵名与孝宗墓主有据，尚未获得可将一、三、四等考古编号唯一对应永阜陵的最终确认资料。'],
 'song-chong':['永崇陵','位置及南片区位次有文献复原方案，但缺唯一考古对应；不得把北宋徽宗永祐陵与光宗永崇陵因名称相近或排序混同。'],
 'song-mao':['永茂陵','原“宁宗陵”保护区暂编二号陵园；二号发掘后判断为下宫，不能因此将其等同宁宗墓穴，也不按“二号”理解为第二位帝王。'],
 'song-mu':['永穆陵','理宗顶骨归葬、明代碑刻及传统地名是寻找线索，不能单独确定原南宋石藏或把后世碑位当墓室坐标。'],
 'song-shao':['永绍陵','度宗陵名有史料记录；未取得可与具体考古编号唯一对应的原位证据与WGS84定位成果。']
};
const ss=['song6-identity-study','song6-lower-palace-review','song6-2023-correspondence'];
for(const [id,[name,reason]]of Object.entries(songDescriptions)){
 const x=c.items.find(x=>x.id===id);if(!x||x.coordinates!==null)throw Error('Unexpected independently located Song tomb '+id);
 addSources(x,ss);x.archaeologicalCorrespondence={reviewedAt:date,status:'unresolved',historicalName:name,excavationUnit:null,identityConfirmed:false,georeferenced:false,sourceIds:ss};
 x.locationReview={...x.locationReview,status:'historical_name_not_matched_to_excavation',reason,nextStep:'需正式考古编号—陵名对应结论及带独立控制点的总平面；保留陵区参照，不生成单陵点。',sourceIds:ss,reviewedAt:date};
 x.mapReason='历史陵名已建档，考古单位与单陵坐标未唯一对应；不复制陵区点。';
 report.song.push({id,name:x.name,status:'unresolved',excavationUnit:null,reason});
}
const sg=c.items.find(x=>x.id==='song6');addSources(sg,ss);
sg.locationReview={status:'group_location_only',reason:'宋六陵为包括北宋徽宗永祐陵在内的七帝七后历史陵区。考古编号不按帝王次序排列；二号为下宫，二、四号或有上下宫关系。一、三、四等主体身份仍待确认，不能把历史六陵名单与六个编号机械配对。',nextStep:'原区域参照点保留；仍需完整保护区划和最新发掘总图。',sourceIds:ss,reviewedAt:date};
sg.coordinates={...sg.coordinates,status:'estimated_wgs84',target:'宋六陵区域参照（非单陵、墓室或入口）',limitation:'原社区点的分辨率约0.0104度，不能作为米级准确度；原OSM小面只是一处局部标绘，不是七帝七后完整陵区。',estimate:{basis:'原有社区地理点与宋六陵所在地相符；只作为陵区区域参照，未据此确定单陵位置。',extent:'宋六陵及周边陵区；公开资料提及约2.24平方公里，不将面积当作误差半径或反推矩形。',confidence:'regional',reviewedAt:date}};
const js=['jin-2025-official-attribution','jin-official-site-confirmation'];
for(const x of c.items.filter(x=>x.parentId==='jin-group')){
 const confirmed=x.id==='jin-rui';addSources(x,js);
 const reason=confirmed?'北京市文物局2025年复函明确太祖睿陵经考古发掘确认。但本项目尚未取得已发掘墓穴与独立地理控制点的对应成果；“身份确认”不等于“坐标已核”。':'北京市文物局2025年复函指出仅太祖睿陵经考古发掘确认。该历史陵名与现存编号陵寝的对应未获考古确认，不据旅游牌、神道构件或同一主陵区推定具体墓穴。';
 x.archaeologicalCorrespondence={reviewedAt:date,status:confirmed?'identity_confirmed_location_pending':'unresolved',identityConfirmed:confirmed,excavationUnit:confirmed?'太祖睿陵（已发掘确认）':null,georeferenced:false,sourceIds:js};
 x.locationReview={...x.locationReview,status:confirmed?'identity_confirmed_location_pending':'historical_name_not_matched_to_excavation',reason,nextStep:confirmed?'需睿陵发掘总图、现状可识别控制点或机构定位成果；不能用整个金陵OSM多边形中心代替地宫。':'维持历史陵名记录；有正式编号与可靠定位后再关联，暂不生成独立单陵坐标。',sourceIds:js,reviewedAt:date};
 x.mapReason=confirmed?'考古身份已确认，独立墓穴地理定位待核；保留陵区关联。':'历史陵名不等于已确认墓穴；考古对应及独立定位待核。';
 report.jin.push({id:x.id,name:x.name,status:x.archaeologicalCorrespondence.status,reason});
}
const jg=c.items.find(x=>x.id==='jin-group');addSources(jg,js);jg.locationReview={status:'group_location_only',reason:'主陵区与约60平方公里的历史兆域不是同一范围；现有OSM“北京金代皇陵”多边形只定位主陵区现状地段，不能拆分为睿、兴、道、裕等单陵，更不能代替2007年法定区划。',nextStep:'取得法定区划图及考古编号分布；当前点仍作区域参照。',sourceIds:js,reviewedAt:date};
report.preservation={capitalRootIdentifiersUnchanged:true,tombIdentifiersUnchanged:JSON.stringify(c.items.map(x=>x.id))===JSON.stringify(before.items.map(x=>x.id)),tombCoordinatesUnchanged:c.items.every((x,i)=>JSON.stringify(x.coordinates&&[x.coordinates.lng,x.coordinates.lat])===JSON.stringify(before.items[i].coordinates&&[before.items[i].coordinates.lng,before.items[i].coordinates.lat])),allTombGeometriesUnchanged:true,palaceDetailGeometriesUnchanged:q.features.every((f,i)=>hash(f.geometry)===hash(beforeQ.features[i].geometry)),datongOtherGeometriesUnchanged:d.features.every((f,i)=>f.properties.sourceId===guo.properties.sourceId||hash(f.geometry)===hash(beforeD.features[i].geometry)),tombCount:c.items.length};
for(const [p,h]of Object.entries(inputHashes))if(hash(fs.readFileSync(p,'utf8'))!==h)throw Error('Concurrent modification detected: '+p);
write('data/qin-xianyang-palace.geojson',q);write('docs/qin-xianyang-palace-calibration.json',qa);write('data/datong-historic-sites.geojson',d);write('docs/datong-archaeology.json',da);write('data/imperial-tombs/catalog.json',c);write(reportPath,report);
console.log(JSON.stringify({qinGeometriesPreserved:q.features.length,guoManualShiftRejected:true,songReviewed:report.song.length,jinReviewed:report.jin.length,preservation:report.preservation}));
