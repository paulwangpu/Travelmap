const fs=require('node:fs'),H=require('../historical-periods.js');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const path='data/china-ancient-capitals.json',d=read(path),research=read('data/ancient-capital-research-extents.geojson').features;
const extents=new Map(research.map(f=>[f.properties.sourceId,f]));
const owners=new Map(d.items.flatMap(s=>s.records.map(r=>[r.sourceOrder,s])));
const controls={六朝:'魏晋南北朝',汉魏:'魏晋南北朝',南唐:'五代十国',宋辽金:'宋辽金西夏'};
const previous=fs.existsSync('docs/capital-site-organization.json')?read('docs/capital-site-organization.json'):{};
const migrations=[...(previous.migrations||[])];
for(const r of d.recordItems){const s=owners.get(r.sourceOrder);if(!s)throw Error('Missing owner '+r.sourceOrder);
 if(r.siteKey!==s.siteKey){migrations.push({sourceOrder:r.sourceOrder,name:r.name,oldKey:r.siteKey,newKey:s.siteKey});r.legacySiteKeys=[...new Set([...(r.legacySiteKeys||[]),r.siteKey])];r.siteKey=s.siteKey;r.currentKey=s.currentKey;r.currentPlace=s.currentPlace||s.name;}
 if(r.sourceOrder===234){r.siteName='亳州';r.currentPlace='亳州';r.name='亳州 · 亳州';}
}
function kind(r){const f=extents.get(r.id),n=r.name||'';
 if(r.id.startsWith('ccwad-'))return '明清重建城界';
 if(/保护|埋藏|四至/.test(n))return '保护或地望参考';
 if(/公园|展示|修缮|重建|现寺院|现存建筑/.test(n)||f?.properties.osm&&/现代|展示/.test(f.properties.note||''))return '遗址或现代展示';
 if(/宫|宮|殿|府库|寺|仓|建筑|池苑/.test(n))return '宫区或遗址构件';
 if(/推测|推定|图示|图件|复原|测绘参考/.test(n))return '研究参考城界';
 return '城垣或遗址标绘';
}
for(const item of [...d.items,...d.recordItems])for(const r of item.boundaryRelations||[]){r.control=['明','清'].includes(r.period)?'明清':controls[r.control]||r.control;r.kind=kind(r);}
// Recover a record's own period links from its explicitly assigned parent, never another city at the same coordinates.
for(const r of d.recordItems){const s=owners.get(r.sourceOrder),period=H.capitalPeriod(r);
 if(migrations.some(m=>m.sourceOrder===r.sourceOrder))r.boundaryRelations=(s.boundaryRelations||[]).filter(b=>b.period===period||b.period==='明清'&&['明','清'].includes(period)).map(b=>({...b}));
}
// Existing East Han links identify old-city wall traces, excluding Northern Wei palace/outer additions.
for(const r of d.recordItems.filter(r=>r.parentName==='洛阳'&&H.capitalPeriod(r)==='秦汉'))for(const b of r.boundaryRelations||[]){const f=extents.get(b.id);if(f){f.properties.periods=[...new Set([f.properties.period,...(f.properties.periods||[]),'秦汉'])];f.properties.periodNotes={...(f.properties.periodNotes||{}),'秦汉':'汉晋旧城城垣位置参照；原始标绘不是东汉城墙分期实测，不含北魏外郭扩建。'};}}
for(const s of d.items){const all=[...(s.boundaryRelations||[]),...d.recordItems.filter(r=>r.siteKey===s.siteKey).flatMap(r=>r.boundaryRelations||[])];s.boundaryRelations=[...new Map(all.map(b=>[b.id+'|'+b.period,b])).values()];}
fs.writeFileSync('data/ancient-capital-research-extents.geojson',JSON.stringify({type:'FeatureCollection',...read('data/ancient-capital-research-extents.geojson'),features:research},null,2)+'\n');
const luo=read('data/luoyang-capital-evolution.json').stages;
function reference(r){const s=owners.get(r.sourceOrder),p=H.capitalPeriod(r);
 if(s.name==='邯郸')return {name:'赵邯郸故城·赵王城西城区域参照',coordinates:[s.lng,s.lat],kind:'文献图示城址区域参照',note:s.coordinatePrecision+' '+s.boundaryRelationNote};
 if(s.name==='洛阳'){
  const id=p==='周'?'zhou':p==='秦汉'?'han':r.dynasty==='北魏'?'northernwei':p==='魏晋南北朝'?'weijin':p==='隋唐'?'suitang':null;
  const stage=luo.find(s=>s.id===id);
  if(stage)return {name:stage.siteName,coordinates:stage.coordinates,kind:stage.coordinateKind||'分期城址参照点',note:stage.boundaryStatus};
  return {name:'洛阳后期城址（分期位置待核）',kind:'待核参照',note:'五代、宋代城址不能直接沿用完整隋唐外郭；本条尚未接入独立分期城界。'};
 }
 if(s.name==='南京')return {name:p==='魏晋南北朝'?'六朝建业／建康':p==='五代十国'?'杨吴／南唐金陵':p==='明'?'明南京':p==='清'?'天京（明清南京城区域）':p==='近现代'?'近现代南京（城市参照）':'南宋建康（行在参照）',kind:'城市内分期城址',note:'城市列表合并，六朝、南唐、明宫城及明清城界分别对应，不将它们视为同一城界。'};
 if(s.name==='邺城')return {name:['东魏','北齐'].includes(r.dynasty)?'邺南城（兼列邺北遗址）':'邺北城',kind:'分期城址参照',note:['东魏','北齐'].includes(r.dynasty)?'东魏、北齐关联邺南城残墙；铜雀三台是邺北城参照，不是邺南宫城中心。':'铜雀三台作为邺北城参照；不套用邺南城残墙。'};
 if(s.name==='扬州')return p==='宋辽金西夏'?{name:'宋扬州大城（北门遗址参照）',coordinates:[119.4295766,32.4123993],kind:'分期城址参照',note:'高宗1128—1129年行在关联宋大城概略城圈及北门定位；后建的宝祐城、夹城不关联该记录。北门不是高宗行宫。'}:{name:p==='五代十国'?'杨吴／南唐扬州（唐城沿革参照）':'隋江都宫／唐子城区域参照',coordinates:[s.lng,s.lat],kind:'分期城址区域参照',note:p==='五代十国'?'唐子城、罗城轮廓作为五代城址沿革参照；不能与后周小城或宋大城混同。':'隋江都宫在蜀冈古城区域；唐代汇总轮廓不作为隋代江都宫精确宫界。'};
 if(s.name==='苏州')return {name:p==='元'?'张吴平江（子城区域参照）':'吴国姑苏（子城地区文献参照）',coordinates:[s.lng,s.lat],kind:'文献地望参照',note:p==='元'?'子城道路四至与王府基地望来自地方志，元末完整宫界尚未确定；盘门为多期遗构现状，不以明清城界代替1363—1367年实测城圈。':'金城新村考古表明子城地区有早期遗存；吴都具体范围仍存在研究争议，此点不是发掘坑或吴王宫中心，不以宋元子城四至面或明清城界确定春秋都城。'};
 if(s.name==='雍城'&&p==='五代十国')return {name:'岐国凤翔（与秦雍城分期区分）',kind:'分期位置待核',note:'现有粗略点位不能证明岐国凤翔与秦雍城重合；暂保留原记录，需有出处的分期定位后拆点。'};
 if(s.name==='张北'&&r.sourceOrder===295)return {name:'桑根达来（原表位置待核）',kind:'位置待核',note:'原表古称为桑根达来，却沿用张北点位；不应与元中都自动对应，待核地望及政权记录。'};
 if(s.name==='安阳殷墟'&&r.sourceOrder===10)return {name:'商代相（地望待核）',kind:'地望待核',note:'不以晚商殷墟展示区或洹北商城确定“相”的城界。'};
 return {name:s.currentPlace||s.name,kind:s.coordinatePrecision?'有说明的参照点':'城市／城址区域参照',note:s.coordinatePrecision||'现有坐标为区域参照；未逐一核实宫城或各朝都城中心。'};
}
for(const r of d.recordItems){r.siteReference=reference(r);const rel=r.boundaryRelations||[];r.boundaryAudit={...(r.boundaryAudit||{}),status:rel.length?'已按本条朝代建立对应；范围性质见各条说明':'本条朝代暂无已接入的对应范围',pointKind:r.siteReference.kind,note:r.siteReference.note};}
const special={
 洛阳:'城市列表合并；东周王城、汉魏城、隋唐城分期定位；五代宋城不得自动套隋唐外郭。',
 南京:'城市列表合并；六朝、杨吴南唐、明代宫城及明清京城分别对应。',
 北京:'明清及近现代记录合并；蓟城幽州辽南京、金中都、元大都保持独立城址。',
 幽州:'蓟城／幽州／辽南京保留共同区域参照；唐四至推定轮廓仅对应隋唐，不证明蓟城与辽城墙完全重合。',
 汉长安城:'汉魏诸政权沿用地区保留合并；秦汉宫区范围仅对应秦汉，不套用各后期政权。',
 大兴城:'隋大兴与唐长安合并；与汉长安、秦咸阳、明西安分别保留。',
 邺城:'城市列表合并；按邺北、邺南分期对应，与安阳殷墟分开。',
 安阳殷墟:'晚商殷墟、洹北商城及商相地望分别说明；商相待核，不共用已知展示区作城界。',
 开封:'唐汴州、五代、宋金在城市层面合并；魏大梁另列，金城界未确定，不套用北宋完整外城。',
 大梁:'与唐宋开封分开，地望推定轮廓不等于发掘确认城界。',
 杭州:'吴越钱塘与南宋临安同城列表；海塘、宫苑和府治分别对应，非两朝完整城界。',
 成都:'成家、蜀汉、成汉、前后蜀等同城列表；古蜀三星堆、金沙、郫邑分开；现代展示面不能代替各朝全城。',
 平城遗址:'北魏平城与辽金西京分开；明堂现代公园不是北魏完整城界。',
 西京大同:'辽金西京合并，现寺院范围单独说明，不以明清大同城墙确定辽金城界。',
 雍城:'秦雍城与岐国凤翔应区分；现阶段分期位置待核，不生成无依据的新坐标。',
 张北:'元中都与原表桑根达来记录不应按同一点判断同城；后者位置和身份待核。'
 ,扬州:'城市列表合并，蜀冈江都宫／唐子城、唐罗城与宋堡城／宝祐城、夹城、大城分期对应；南宋行在不套用后建城圈。'
 ,苏州:'吴国姑苏与张吴平江保留同城记录，分期参照分别说明；子城四至仅作宋元地望，明清城界与现存／重建城门独立，不套为春秋城界。'
 ,邯郸:'保留原地点编号，点移至赵王城西城区域参照；赵王城西、东、北三城与大北城分区对应。文献轮廓、地下墙址、现状土基、现代展示区分别说明，不将大北城与王城北小城混同。'
};
for(const s of d.items){s.siteOrganization={decision:special[s.name]||'保留现有城市／遗址归组；朝代记录分别保留',verification:special[s.name]?'已有分期依据或明确待核事项':'全量数据关系检查；未完成逐城考古定位复核'};s.records.sort((a,b)=>H.keys.indexOf(H.capitalPeriod(a))-H.keys.indexOf(H.capitalPeriod(b))||(H.yearOf(a)??Infinity)-(H.yearOf(b)??Infinity)||a.sourceOrder-b.sourceOrder);}
fs.writeFileSync(path,JSON.stringify(d,null,2)+'\n');
const report={checkedDate:'2026-10-09',scope:{sites:d.items.length,records:d.recordItems.length},migrations,sites:d.items.map(s=>({name:s.name,coordinates:[s.lng,s.lat],decision:s.siteOrganization.decision,verification:s.siteOrganization.verification,records:d.recordItems.filter(r=>r.siteKey===s.siteKey).map(r=>({sourceOrder:r.sourceOrder,dynasty:r.dynasty,period:H.capitalPeriod(r),years:r.capitalYears,reference:r.siteReference,boundaries:r.boundaryRelations||[]}))})),limitations:'完成全量归属、朝代、范围类型检查；保留所有政权记录与现有地点编号。分期参照坐标用于说明，不自动搬动共同城市点。未完成155城逐一考古测绘核验，明确待核记录不据猜测拆点。'};
fs.writeFileSync('docs/capital-site-organization.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync('docs/capital-site-organization.md','# 古都朝代、点位与城址对应整理\n\n'+report.limitations+'\n\n## 重点城市的合并与拆分\n\n| 地点 | 处理 |\n|---|---|\n'+Object.entries(special).map(([n,v])=>'| '+n+' | '+v+' |').join('\n')+'\n\n## 全部地点逐条结果\n\n| 地点 | 朝代记录 | 坐标性质与范围对应 |\n|---|---|\n'+report.sites.map(s=>'| '+s.name+' | '+s.records.map(r=>r.dynasty+'（'+r.period+'）').join('、')+' | '+s.records.map(r=>r.reference.name+'：'+r.boundaries.length+'项范围').join('；')+' |').join('\n')+'\n\n## 主要分期依据\n\n- [洛阳市政府：历史沿革](https://www.ly.gov.cn/2013/06-24/74500.html)\n- [南京官方规划：分期都城与宫城](https://ghj.nanjing.gov.cn/pqgs/ghbzpqgs/202603/P020260309306736868178.pdf)\n- [北京政府：金中都与元大都](https://www.beijing.gov.cn/renwen/rwzyd/qgzdwwbhdw/yddcqyz/202210/t20221031_2848744.html)\n- [河北考古：邺北与邺南](https://www.cssn.cn/lsx/lsx_kgx/202210/t20221024_5552623.shtml)\n\n逐条范围来源保留于JSON及地图点击详情。\n');
console.log('Organized '+d.items.length+' sites / '+d.recordItems.length+' records; repaired '+migrations.length+' legacy record associations.');
