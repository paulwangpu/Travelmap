module.exports=({items,add,source})=>{
 source('east-han-layout','东汉洛阳帝陵的布局与归属辨析','河南博物院《中原文物》','https://www.chnmus.net/zyww/research/details.html?id=1026087114267960480','帝陵实体有考古支持；逐陵墓主与陵号是作者推定，不能视为已无争议。');
 source('east-han-layout-text','东汉洛阳帝陵布局研究全文','万安山下（研究文章发布）','https://m.thepaper.cn/baijiahao_4940644','大汉冢M066、二汉冢M561分别推定原陵、恭陵；保留其他陵号对应观点。');
 source('east-han-yuan-dispute','原陵与铁谢村刘秀坟的辨析','北京市文物局','https://wwj.beijing.gov.cn/bjww/362679/362688/651713/index.html');
 for(const [id,name,alias] of [['han-yuan','东汉原陵（大汉冢，推定）','大汉冢'],['han-gong','东汉恭陵（二汉冢，推定）','二汉冢']]){
  const x=items.find(x=>x.id===id);x.name=name;x.mapLabel=name;x.aliases.push(alias);x.recognition='attributed';
  x.sourceIds.push('east-han-layout','east-han-layout-text','east-han-yuan-dispute');
  x.evidence='大型东汉墓葬实体经考古调查，依帝陵布局研究采用陵号推定。';
  x.disputes.push('大汉冢、二汉冢的具体陵号存在不同对应方案，本条采用研究者推定，不声称墓主已由出土铭文独立确认。');
 }
 const yuan=items.find(x=>x.id==='han-yuan');yuan.admin='河南省洛阳市孟津区邙山东汉陵区';yuan.disputes.push('与铁谢村传统刘秀坟分开记录；旧景区点位不能代表考古推定原陵。');
 add('han-yuan-tiexie','刘秀坟（铁谢村传统陵园）','秦汉','东汉（传统祭祀）','汉光武帝刘秀','河南省洛阳市孟津区会盟镇铁谢村','east-han-yuan-dispute',{nature:'commemorative',recognition:'traditional',aliases:['汉光武帝陵景区'],evidence:'宋代以来以光武帝陵祭祀，现代考古研究不支持其为原陵。',disputes:['祭祀景区不是已经确认的刘秀遗体葬地；亦有北魏方泽坛说，遗址原始性质待进一步核验。']});
 const rows=[['han-xianjie','东汉显节陵','汉明帝刘庄'],['han-jing-east','东汉敬陵','汉章帝刘炟'],['han-shen','东汉慎陵','汉和帝刘肇'],['han-kang-east','东汉康陵','汉殇帝刘隆'],['han-jing-zhi','东汉静陵','汉质帝刘缵'],['han-xuan','东汉宣陵','汉桓帝刘志']];
 for(const [id,name,owner] of rows)add(id,name,'秦汉','东汉',owner,'河南省洛阳市洛南万安山北麓陵区','east-han-layout,east-han-layout-text',{recognition:'attributed',evidence:'文献所记洛南六帝陵，具体实体对应须逐条结合最新发掘复核。',disputes:['陵名及墓主有文献依据；暂未获得逐陵独立经纬度，不复制陵区中心作为单陵坐标。']});
 require('./refine-eastern-han-tombs.cjs')({items,add,source});
};
