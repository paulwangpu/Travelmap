module.exports=({items,add,source})=>{
 source('shandong-prince-gazetteer','山东省志文物志：明代王墓','山东省志（山东地情档案存档）','https://shandong-chorography.org/database/g0/section/61/article/16/','省志原文存档；用于旧地望、墓志、合葬和考古事实，现行区划与开放情况须另核。');
 source('ming-de-official','第七批国保简介：明德王墓地','山东省文化和旅游厅','https://whhly.shandong.gov.cn/module/download/downfile.jsp?classid=0&filename=084393c5b66043d6a2f338efdc526ca1.pdf','七墓位于五峰山东、南麓；M4据两盒墓志确认为德庄王、刘妃及济宁安僖王合葬。');
 source('shandong-tomb-boundaries','山东国保保护范围：明德王墓地、明鲁王墓','山东省文化和旅游厅','https://whhly.shandong.gov.cn/module/download/downfile.jsp?classid=0&filename=7dfd1c59d14947558ead43458d35e1cf.pdf','德王墓地M1—M7、窑址与石桥分别保护；名称或保护范围不等于开放地宫。');
 for(const [id,place] of [['ming-lu-jing','山东省济宁市邹城市大束镇官厅村北云山南坡'],['ming-lu-juye','山东省济宁市邹城市凰翥村北凤凰山南坡（现行行政隶属待核）']]){
  const x=items.find(x=>x.id===id);x.admin=place;x.sourceIds.push('shandong-prince-gazetteer','shandong-tomb-boundaries');x.mapReason='省志已缩小到村北山体南坡，仍需墓室测绘与现代底图配准';x.reviewTasks=['核对山坡原墓室保护范围及测绘位置','复核现行村名与行政隶属','补核生卒及开放公告'];
  if(id==='ming-lu-juye')x.evidence+=' 省志记为朱泰墱与蔡氏、李氏合葬，按一座墓计。';
 }
 const g=add('ming-de-cemetery','明德王墓地','明','明（德藩）','','山东省济南市长清区五峰山街道五峰山（青崖寨山）东、南麓','ming-de-official,shandong-tomb-boundaries',{recordType:'group',nature:'mixed',rulerCategory:'feudal_king',aliases:['明德王墓群','十八王林'],evidence:'官方国保资料记七座墓葬，保护范围编号M1—M7；窑址及石桥为附属遗迹，不增加王陵数。',disputes:['旧位置缓存36.553378,116.746245与官方五峰山东、南麓地望不符，排除。','七座墓号与逐王墓主尚需墓志或发掘报告对应；不凭世系排序指定墓号。'],mapReason:'已确定五峰山陵区，但现有坐标线索未完成独立核对；百科点位仅保留为研究线索',reviewTasks:['配准M1—M7及陵园分布图','核对逐墓墓主和独立区域坐标']});
 add('ming-de-zhuang','德庄王墓（M4）','明','明（德藩）','德庄王朱见潾','山东省济南市长清区五峰山明德王墓地4号墓','ming-de-official,shandong-prince-gazetteer',{parentId:g.id,rulerCategory:'feudal_king',recognition:'archaeological',evidence:'两盒墓志确认德庄王、妃刘氏及其子济宁安僖王合葬；一座墓不按三位墓主拆为三个地图点。',disputes:['省志与国保简介、发掘介绍对发掘年份及济宁安僖王名字转录有差异，保留谥号，待原墓志核字。'],mapReason:'所属陵区尚未可靠定位，M4独立墓室位置待配准',reviewTasks:['配准M4发掘平面与保护边界','核对原墓志生卒、济宁安僖王名字及发掘年份','核当前地宫开放情况']});
};
