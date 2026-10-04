// Source-based review; site IDs and checklist keys remain stable.
module.exports=({items,source})=>{
 const reviewedAt='2026-10-03';
 const definitions={
  'wz-jin':['晋侯墓地M114西周早期偏晚的墓制比较','中国社会科学网（考古研究论文）','https://www.cssn.cn/lsx/lsx_kgx/202210/t20221024_5552596.shtml'],
  'wz-zeng':['叶家山西周早期曾侯墓地及M111','湖北省文化和旅游厅','https://wlt.hubei.gov.cn/bmdt/mtjj/202601/t20260131_5867511.shtml'],
  'wz-guo':['虢国墓地跨西周与春秋','三门峡市政府','https://www.smx.gov.cn/4042/2025/10/2143489.html'],
  'wz-guoji':['M2001及虢季墓西周晚期认定','河南博物院','https://www.chnmus.net/sitesources/hnsbwy/page_pc/dzjp/mzyp/plwth/list1.html'],
  'wz-guozhong':['M2009虢仲墓西周晚期认定','河南博物院','https://www.chnmus.net/ch/collection/appraise/details.html?id=512157738423582660'],
  'wz-guo-debate':['虢季墓等春秋早期断代研究','全国哲学社会科学工作办公室','https://www.nopss.gov.cn/BIG5/219506/219508/219524/14640097.html'],
  'wz-yan':['琉璃河西周燕国墓地及M1193','北京大学考古文博学院','https://archaeology.pku.edu.cn/info/1030/3485.htm'],
  'wz-yan202':['燕侯一级M202发掘记述','北京市文物局','https://wwj.beijing.gov.cn/bjww/362760/362765/652798/index.html'],
  'wz-jinsha':['金沙主体文化遗存年代及都邑性质','四川省文物局／金沙遗址博物馆','https://wwj.sc.gov.cn/scwwj/newpic/2019/12/13/0938718cff8f4ef3ac77e0641e53268b.shtml'],
  'wz-ba':['大河口西周墓地综合研究','全国哲学社会科学工作办公室','https://www.nopss.gov.cn/n1/2019/1212/c417361-31503279.html'],
  'wz-peng':['横水M2与大河口M1017的西周中期墓葬比较','故宫博物院（研究论文）','https://www.dpm.org.cn/Uploads/File/2022/08/17/u62fcaa6551ac5.pdf'],
  'wz-lingpo':['周公庙陵坡西周高等级墓葬群','北京大学','https://news.pku.edu.cn/xwzh/129-73792.htm'],
  'wz-qin':['咸阳周陵镇陵园的秦王陵墓制研究','故宫博物院（研究论文）','https://www.dpm.org.cn/Uploads/File/2022/07/22/u62da4dd4ade3e.pdf'],
  'wz-qin-dating':['传统周王陵为战国秦王墓的年代讨论','陕西省地方志资料','https://dfz.shaanxi.gov.cn/zslm/fzzlk/dqcs/xas/201803/P020250630548327427771.pdf']
 };
 for(const [id,args] of Object.entries(definitions))source(id,...args);
 const rows={
  'zhou-xianyang':['战国','战国秦陵（归属仍有异说）；周文武王祭祀传统',['wz-qin','wz-qin-dating'],'改为战国；实体墓葬年代优先于后世祭祀对象，具体秦王不作定论。'],
  'jin-hou':['西周','西周晋侯墓地',['wz-jin'],'保留西周；国君及夫人墓组成的家族墓地，不是周天子陵。'],
  'jin-m114':['西周','西周早期偏晚',['wz-jin'],'保留西周；墓号及鸟尊出土对应可靠，个人墓主仍按推定处理。'],
  'guo-kings':['西周','西周至春秋（跨期）',['wz-guo','wz-guo-debate'],'保留西周代表分组，注明跨期；不能将全墓地全部墓葬断为西周。'],
  'guo-m2001':['西周','西周晚期／春秋早期（断代争议）',['wz-guoji','wz-guo-debate'],'按河南博物院的西周晚期认定保留西周；研究成果另主张东周初年，记录争议，不以器物时代机械代替下葬年代。'],
  'guo-m2009':['西周','西周晚期（馆方认定）；两周之际断代待核',['wz-guozhong','wz-guo-debate'],'馆方称M2009为西周大墓，保留西周；墓地整体有两周之际断代讨论，不将针对M2001的论证直接套到M2009。'],
  'zeng-yejiashan':['西周','西周早期',['wz-zeng'],'保留西周；铭文、形制及三代曾侯研究支持，群与单墓不重复统计。'],
  'zeng-m111':['西周','西周早期',['wz-zeng'],'保留西周；机构资料称曾侯犺墓，墓主对应仍保存推定标注。'],
  'yan-liulihe':['西周','西周',['wz-yan'],'保留西周燕侯墓地；仅收录国君级墓区，不将遗址全部墓葬视为王陵。'],
  'yan-liulihe-m1193':['西周','西周早期',['wz-yan'],'保留西周；克罍、克盉与燕侯关系有考古依据，但作器者与墓主不能自动等同。'],
  'yan-liulihe-m202':['西周','西周',['wz-yan','wz-yan202'],'保留西周；发掘者认定燕侯一级中字形大墓，个人姓名未定。'],
  'shu-jinsha-search':['西周','商晚期至西周为主体，延续至春秋',['wz-jinsha'],'保留西周代表分组；这是古蜀都邑及王陵探索线索，不是已发现的王陵。'],
  'ba-dahekou':['西周','西周墓地（跨期范围见研究）',['wz-ba','wz-peng'],'保留西周；霸伯铭文及国君级墓葬研究支持，不能把全部贵族墓算作国君墓。'],
  'peng-hengshui':['西周','西周，代表性倗伯墓为西周中期',['wz-peng'],'保留西周；倗氏首领墓地年代有据，倗氏与晋国、周王室的政治关系仍有讨论。'],
  'zhou-lingpo':['西周','西周高等级墓葬群',['wz-lingpo'],'保留西周；四墓道等级有考古依据，墓主及是否周天子陵未确认。']
 };
 for(const [id,[period,periodText,sids,decision]] of Object.entries(rows)){
  const x=items.find(x=>x.id===id);if(!x)throw Error('Missing Western Zhou review record: '+id);
  x.preqinPeriod=period;x.periodText=periodText;x.preqinPeriodBasis=decision;
  x.sourceIds=[...new Set([...x.sourceIds,...sids])];
  x.periodReview={reviewedAt,originalPeriod:'西周',period,periodText,decision,sourceIds:sids};
  const caution=id==='zhou-xianyang'? '传统文武王陵归属不等于西周墓葬；考古研究指向战国秦王陵，墓主有异说。'
   :id==='guo-kings'?'墓地跨西周至春秋，群记录代表分组不表示所有墓同代。'
   :id==='guo-m2001'?'河南博物院采用西周晚期断代；另有研究将M2001论证为东周初年，不能视为无争议。'
   :id==='guo-m2009'?'馆方采用西周断代；墓地整体存在两周之际的年代讨论，M2009精确断代需继续核对。'
   :id==='zhou-lingpo'?'西周高等级墓地不等于已确认的周天子陵；四墓道形制不能单独确认墓主。':null;
  if(caution&&!x.disputes.includes(caution))x.disputes.push(caution);
 }
 const z=items.find(x=>x.id==='zhou-xianyang');z.mapLabel='咸阳周陵（疑似战国秦陵）';
 z.preqinClassification.country='秦（归属争议）';z.preqinClassification.displayGroup='秦国（周陵归属争议）';
 items.find(x=>x.id==='zhou-lingpo').mapLabel='周公庙陵坡墓地（王室候选）';
};
