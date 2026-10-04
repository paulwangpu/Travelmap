const fs=require('node:fs'),path=require('node:path'),dir=path.join(__dirname,'../data/imperial-tombs');
const c=require(path.join(dir,'catalog.json'));
const priorities={
 'han-huzhuang':'已有抢救性发掘和南水北调位置资料；需将胡庄西北岗地及陵园平面对应现代地理点。',
 'yan-xuliang':'需将燕下都东城西北墓区平面与现代地形对应，不能用都城遗址中心。',
 'yan-jiunutai':'需核对虚粮冢以南的墓区边界；M16在所属墓区内，不复制成独立精确点。',
 'han-qi-dawu':'反查原窝托村旧址及齐王墓封土；村庄迁建后的新社区不能代替墓址。',
 'han-king-changyi':'反查红土山异名禹梁山的东侧半山腰；不能用金山大洞或外省同名公墓。',
 'han-chu-nandong':'反查段山异名及两座汉墓；不能用东洞山点代替。',
 'han-zhongshan-dingzhou':'分别核对北庄子、北陵头等墓区；定州博物馆不是原址。',
 'shu-majia':'核对原马家乡普东村原址及发掘平面，不能直接采用马家地铁站。',
 'rong-yimen':'核对1992年宝鸡益门村二号墓施工地与原墓区，不能用藏品所在博物馆。',
 'jin-chenglin-memorial':'可按完颜村东沟芮王坪纪念冢继续核对；与簸箕湾传统故址、仿金地宫分别标注。'
};
function mappedDescendants(id,seen=new Set()){
 if(seen.has(id))return [];seen.add(id);
 return c.items.filter(x=>x.parentId===id).flatMap(x=>[...(x.mapEligible?[x.id]:[]),...mappedDescendants(x.id,seen)]);
}
const unlocated=c.items.filter(x=>!x.coordinates&&!x.locationReference).map(x=>{
 const mappedChildren=mappedDescendants(x.id);
 return {id:x.id,name:x.name,admin:x.admin,category:mappedChildren.length?'overview_with_mapped_children':priorities[x.id]?'locatable_site_needs_georeference':'unresolved_site_or_entity',mappedChildren,reason:x.locationReview?.reason||null,nextStep:mappedChildren.length?(x.locationReview?.reason||'保留总览及所属关系；用已有子陵位置浏览，不任取一个子陵作为整体中心。'):[x.locationReview?.reason,x.locationReview?.nextStep].filter(Boolean).map(s=>s.trim().replace(/[。；;]+$/,'')).join('；')||priorities[x.id]||x.reviewTasks.join('；')};
});
const report={reviewedAt:c.researchedAt,totalRecords:c.totalRecords,mapCandidates:c.mapCandidateIds.length,missingIndependentCoordinates:unlocated.length,overviewsWithMappedChildren:unlocated.filter(x=>x.category==='overview_with_mapped_children').length,sharedCemeteryReferences:c.items.filter(x=>!x.coordinates&&x.locationReference).length,unlocated};
fs.writeFileSync(path.join(dir,'remaining-locations.json'),JSON.stringify(report,null,2)+'\n');
const rows=xs=>xs.map(x=>`| ${x.name} | ${x.admin} | ${x.nextStep} |`).join('\n');
fs.writeFileSync(path.join(dir,'remaining-locations.md'),`# 皇陵位置核查清单\n\n核查日期：${report.reviewedAt}。${report.totalRecords}条资料记录，${report.mapCandidates}条地图代表点。${report.missingIndependentCoordinates}条既无坐标也无陵区关联，其中${report.overviewsWithMappedChildren}条为已有定位子陵的总览。另有${report.sharedCemeteryReferences}条共用所属陵区，不生成重复单陵点。\n\n## 有明确遗址线索、优先补核\n\n| 记录 | 地点 | 下一步 |\n|---|---|---|\n${rows(unlocated.filter(x=>x.category==='locatable_site_needs_georeference'))}\n\n## 子陵已定位的总览\n\n| 记录 | 地点 | 处理 |\n|---|---|---|\n${rows(unlocated.filter(x=>x.category==='overview_with_mapped_children'))}\n\n## 墓址或实体对应仍待核\n\n| 记录 | 地点 | 下一步 |\n|---|---|---|\n${rows(unlocated.filter(x=>x.category==='unresolved_site_or_entity'))}\n\n地图估计点仅用于区域浏览，须保留依据、范围和基准限制；不能把城市中心、车站或藏品馆当作原陵址。\n`);
