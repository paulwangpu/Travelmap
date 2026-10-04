module.exports=({add,source})=>{
 source('ming-yi-archaeology','明益宣王及王妃合葬墓出土克拉克瓷盘新考','故宫博物院院刊','https://img.dpm.org.cn/Uploads/file/2026/03/31/1774949489ntoqUPGKC218985.pdf','表一按墓志与江西明代藩王墓报告列原址、合葬及迁葬；表中年份为安葬年份，不直接当作卒年。');
 source('ming-zhou-yi-excavation','荥阳明代周懿王墓学术考察','河南博物院','https://www.chnmus.net/sitesources/hnsbwy/page_pc/wbzx/yndt/article9e20317b7e674512b15d14b221da8af2.html','2016年墓志确认明代周懿王，鲁庄村原址；祔葬墓不单列为王陵。');
 for(const [key,title,person,place,year] of [
  ['duan','端','朱祐槟','原红湖公社红岭大队外源村北',1540],
  ['zhuang','庄','朱厚烨','县东南长塘村',1591],
  ['xuan','宣','朱翊鈏','原岳口公社游家巷大队',1603],
  ['ding','定','朱由木','原岳口公社游家巷大队女冠山麓',1634]
 ]){
  add('ming-yi-'+key,'益'+title+'王墓','明','明（益藩）','益'+title+'王'+person,'江西省抚州市南城县'+place,'ming-yi-archaeology',{rulerCategory:'feudal_king',recognition:'archaeological',evidence:'发掘报告汇表记载王与王妃合葬，按一座实体墓收录；文物展厅不是原墓地点。',chronology:{sortYear:year,basis:'考古汇表安葬年份，仅作墓葬年代排序，不是墓主卒年'},disputes:key==='zhuang'?['王原葬1557年，1591年更敛易棺；王妃另有原葬日期，按同一合葬墓记录，不重复增点。']:[],mapReason:'原址地望有考古依据，仍缺单墓测绘或可交叉核对的地理实体；不使用洪门镇或万坊镇中心',reviewTasks:['核对旧公社、大队与现行村名对应关系并配准原墓址','补核墓志生卒及当前开放情况']});
 }
 add('ming-zhou-yi','明周懿王墓','明','明（周藩）','明周懿王','河南省郑州市荥阳市贾峪镇鲁庄村','ming-zhou-yi-excavation',{rulerCategory:'feudal_king',recognition:'archaeological',evidence:'封门墙下汉白玉描金墓志确认墓主为明代周懿王；原址有壁画主墓及12座祔葬墓，祔葬墓不另增王陵。',disputes:['与西周天子周懿王同名，但此墓经墓志确认属于明周藩；不归入先秦，也不关联禹州明周定王陵点。'],mapReason:'鲁庄村考古原址待配准；规划中的博物馆建设项目不等于已开放地宫',reviewTasks:['配准鲁庄发掘总平面与保护范围','补核墓志人名、生卒和开放公告']});
};
