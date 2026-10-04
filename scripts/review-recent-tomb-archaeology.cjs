// Focused 2023–2026 review, not an exhaustive inventory of archaeological sites.
module.exports=({items,add,source})=>{
 source('recent-yin-2025','殷墟王陵遗址2025年度勘探发掘：M27与道路网络','殷都区人民政府（中国社会科学院考古研究所成果）','https://www.yindu.gov.cn/2026/04-20/3641341.html','2026年4月发布2025年度成果；M27为商晚期偏早甲字形大墓，未公布具体墓主。');
 source('recent-chu-2025','考古中国：安徽淮南武王墩发掘成果','湖北省文物考古研究院','https://m-hbsbwg.cjyun.org/gzkg/p/10519.html','2024年12月田野发掘结束，综合分析确定墓主为楚考烈王。');
 source('recent-shimao-2025','2024年度西北重要考古进展：石峁皇城台墓地','陕西省考古研究院（西北大学平台）','https://slkgycbh.nwu.edu.cn/info/1023/1010.htm','2025年4月发表2022—2024年发掘120余墓；高等级人群，不对应已知姓名王陵。');
 source('recent-shimao-dna','古DNA揭示石峁人群遗传来源与社会结构','中国科学院古脊椎动物与古人类研究所','https://www.ivpp.cas.cn/xwdt/kyjz/202511/t20251126_8017324.html','2025年家族谱系研究不等于确定君主姓名或每座墓的王陵身份。');
 source('recent-tubo-2026','藏王墓考古遗址公园立项与保护规划答复','山南市文化和旅游局','https://lyfzj.shannan.gov.cn/zwgk/xxgkml/202605/t20260529_170421.html','2026年答复确认2025年立项及规划编制；立项不是新增单墓墓主鉴定。');
 source('recent-song6-2026','寻找宋六陵：新发掘简报与陵园对应问题','浙江日报（考古人员采访）','https://zjnews.zjol.com.cn/zjnews/202609/t20260907_31893919.shtml','2026年9月报道；建筑编号与历史陵号继续分开。');
 const yin=items.find(x=>x.id==='yin-kings');
 const m27=add('shang-m27','殷墟王陵区M27（王室候选大墓）','先秦','商','商代高等级墓主（姓名与身份未定）','河南省安阳市殷都区殷墟王陵遗址','recent-yin-2025',{
  parentId:yin.id,nature:'actual_burial',recognition:'attributed',evidence:'2025年王陵区考古揭露甲字形M27；年代为商晚期偏早，上限不早于殷墟一期早段。墓葬存在经考古确认，但王室及个人归属不能据墓区名称直接确认。',
  disputes:['墓主未公布；不能指认为武丁或其他商王。','早期盗坑H335、H348直抵墓底，椁室被盗；祭祀遗存不是新增帝陵。'],
  locationReference:{parentId:yin.id,status:'shared_region_estimate',target:'殷墟王陵区参考位置（M27独立坐标待核）',limitation:'新增墓仅关联所属遗址，不复制陵区坐标生成另一个精确单墓点。'},chronology:{sortYear:-1250,basis:'商晚期偏早约略排序，非墓主卒年'},reviewTasks:['取得M27发掘区定位图及墓室WGS84坐标','核对墓主等级与王室关系后再细化认定']
 });
 yin.sourceIds.push('recent-yin-2025');yin.evidence+=' 2025年发掘新增M27大墓资料，王陵区道路网络与先商、西周遗存须分开解释。';
 const updates=[['chu-wuwangdun','recent-chu-2025','2024年底田野发掘完成，2025年机构成果明确综合分析认定楚考烈王；保留证据类型为综合考古分析。'],['early-shimao','recent-shimao-2025','2022—2024年发掘120余座墓，2025年公布；最高等级人群墓地不能批量拆成已确认君主墓。'],['early-shimao','recent-shimao-dna','2025年古DNA构建跨四代家族谱系；不以遗传亲缘替代王室身份与墓主姓名。'],['tubo-kings','recent-tubo-2026','2025年遗址公园立项、2026年保护规划编制进展，未据此新增确证墓主或单陵点。'],['song6','recent-song6-2026','2026年三、四号陵园发掘简报等进展补入；考古编号与历史陵号保持独立，未核定对应关系不造单陵坐标。']];
 for(const [id,sid,note] of updates){const x=items.find(x=>x.id===id);x.sourceIds.push(sid);(x.researchUpdates ||= []).push({publishedYear:Number(sid.includes('2026')?2026:2025),reviewedAt:'2026-10-03',note,sourceIds:[sid]});}
 m27.researchUpdates=[{publishedYear:2026,reviewedAt:'2026-10-03',note:'2025年度发掘、2026年公开成果；新增记录，未取得独立坐标。',sourceIds:['recent-yin-2025']}];
 return m27;
};
