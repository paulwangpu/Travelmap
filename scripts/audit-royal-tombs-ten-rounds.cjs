const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('../data/imperial-tombs/catalog.json');
const {mappedItems}=require('../imperial-tombs.js');
const get=id=>{const x=c.items.find(x=>x.id===id);assert(x,id);return x;};
const rounds=[];
function round(title,ids,result,check){check();rounds.push({round:rounds.length+1,title,ids,result,status:'passed',sources:[...new Set(ids.flatMap(id=>get(id).sourceIds))].map(id=>c.sources.find(s=>s.id===id)).filter(Boolean)});}
round('元代传说葬地与祭祀陵分开',['yuan-burkhan','yuan-genghis'],'新增大不儿罕山圣地代表点；墓址未确认，标区域估计。',()=>{assert.equal(get('yuan-burkhan').nature,'unknown');assert.equal(get('yuan-genghis').nature,'commemorative');assert(get('yuan-burkhan').coordinates.target.includes('区域'));});
round('叶家山曾侯墓地定位',['zeng-yejiashan'],'采用机构论文的墓地经纬度，原基准未明，保留估计及400×100米参考范围。',()=>{const p=get('zeng-yejiashan');assert.equal(p.coordinates.status,'estimated_wgs84');assert(p.coordinates.estimate.extent.includes('400'));});
round('曾侯犺单墓归属',['zeng-m111','zeng-yejiashan'],'M111单独建档，君主身份注明推定；共享墓地位置，不生成重复点。',()=>{const x=get('zeng-m111');assert(x.name.includes('推定'));assert.equal(x.coordinates,null);assert.equal(x.locationReference.parentId,'zeng-yejiashan');assert.equal(x.chronology.sortYear,-1000);});
round('虢国国君墓细分',['guo-m2001','guo-m2009','guo-kings'],'补虢季M2001、虢仲M2009；使用原墓地共享参考，普通贵族不另列。',()=>{for(const id of ['guo-m2001','guo-m2009']){assert.equal(get(id).parentId,'guo-kings');assert.equal(get(id).coordinates,null);assert(!get(id).mapEligible);}});
round('晋侯M114及盗扰证据',['jin-m114','jin-hou'],'新增鸟尊出土墓；燮父身份保留推定，盗洞及爆破作为考古证据记录。',()=>{assert.equal(get('jin-m114').disturbance.status,'archaeological_evidence');assert(get('jin-m114').disputes.some(s=>s.includes('燮父')));assert(!get('jin-m114').mapEligible);});
round('辽显陵与乾陵位置',['liao-xian','liao-qian'],'补琉璃寺、新立陵前建筑参考点；注明公文转录与基准待核，不指定帝王墓室。',()=>{for(const id of ['liao-xian','liao-qian']){const p=get(id).coordinates;assert.equal(p.status,'estimated_wgs84');assert(p.target.includes('陵前'));assert(p.estimate.basis.includes('转录'));}assert.notEqual(get('liao-xian').coordinates.lng,get('liao-qian').coordinates.lng);});
round('咸阳周陵身份与异名去重',['zhou-xianyang'],'补秦陵重新认定及墓主多种异说；不另按秦王姓名复制同一实体。',()=>{assert(get('zhou-xianyang').disputes.some(s=>s.includes('秦惠文王')));assert(get('zhou-xianyang').aliases.includes('咸阳原秦王陵（现周陵）'));});
round('霸陵旧址及帝后关系',['han-ba'],'加强江村大墓机构证据，纠正凤凰嘴旧址；帝后同茔异穴不混为一墓。',()=>{assert(get('han-ba').evidence.includes('同茔异穴'));assert(get('han-ba').coordinates.target.includes('江村'));assert(get('han-ba').coordinates.lat<34.3);});
round('清永陵葬者与衣冠冢',['qing-yong'],'补孟特穆、福满、觉昌安、塔克世；衣冠冢与实葬另作说明，附葬不单列。',()=>{assert.equal(get('qing-yong').occupants.length,4);assert(get('qing-yong').occupants[0].includes('衣冠冢'));assert.equal(get('qing-yong').nature,'posthumous');});
round('全目录位置、排序与重复审计',[],'修复新增年代被通用排序覆盖；更新过时缺项清单；验证来源、共享位置和地图过滤。',()=>{assert.equal(new Set(c.items.map(x=>x.id)).size,c.items.length);for(const x of c.items){for(const id of x.sourceIds)assert(c.sources.some(s=>s.id===id));if(x.mapEligible){assert(x.coordinates);if(x.coordinates.status==='estimated_wgs84'){assert(x.coordinates.estimate.basis);assert.equal(x.coordinates.precision.horizontalAccuracyMeters,null);}}if(x.locationReference)assert.equal(x.coordinates,null);}for(const zoom of [5,10]){const rows=mappedItems(c,'',zoom);for(const x of rows)assert(!rows.some(p=>p.id===x.parentId));}assert.equal(get('liao-xian').chronology.sortYear,947);});
const estimates=c.items.filter(x=>x.mapEligible&&x.coordinates.status==='estimated_wgs84').length;
const report={researchedAt:c.researchedAt,scope:'本次十轮专题补充与核验；不是全国王陵穷尽性目录',before:{records:211,mapCandidates:170},after:{records:c.totalRecords,mapCandidates:c.mapCandidateIds.length,estimatedCandidates:estimates},rounds};
fs.writeFileSync('data/imperial-tombs/ten-rounds-audit.json',JSON.stringify(report,null,2)+'\n');
let md=`# 王陵十轮补充与核验\n\n日期：${c.researchedAt}。本次是十个专题的实际补充与核验，仍有缺项；不是宣称全国陵墓已全部收录。\n\n新增8条目录记录和4个地图候选位置，目录共${c.totalRecords}条，地图候选${c.mapCandidateIds.length}个，其中${estimates}个为有来源的区域估计。候选包含陵群，随缩放层级避免与子陵重复显示。\n\n|轮次|专题|结果|\n|---|---|---|\n`;
for(const r of rounds)md+=`|${r.round}|${r.title}|${r.result}|\n`;
md+='\n## 各轮来源\n\n';for(const r of rounds){md+=`### ${r.round}. ${r.title}\n\n`;md+=r.sources.map(s=>`- [${s.publisher}：${s.title}](${s.url})`).join('\n')+'\n\n';}
md+='## 后续待核\n\n'+c.coverageGaps.map(g=>`- ${g.era}：${g.targets}。${g.reason}`).join('\n')+'\n\n待核条目及坐标限制见 [review.md](review.md)，完整目录见 [README.md](README.md) 与 [catalog.json](catalog.json)。\n';
fs.writeFileSync('data/imperial-tombs/ten-rounds-audit.md',md);
console.log(`PASS: ${rounds.length} rounds; ${c.totalRecords} records / ${c.mapCandidateIds.length} candidates / ${estimates} estimates`);
