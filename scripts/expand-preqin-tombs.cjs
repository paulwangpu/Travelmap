module.exports=({items,add,group,source})=>{
 const rows=[
 ['zhou-ling','周灵王陵（传统归属）','东周','周灵王姬泄心','河南省洛阳市涧西区周山','灵王陵','https://ytsc.rootinhenan.gov.cn/sitesources/ytsc/page_pc/hnly/zywh/article0cc863cfa2004537a1dc624b2191dbef.html','河南省文化和旅游厅','周山西端现存封土及清代碑名；不能将碑名视作墓主考古确认。'],
 ['zhou-three','周三王陵（墓主有争议）','东周','','河南省洛阳市涧西区周山东部','周三王陵','https://www.nopss.gov.cn/n1/2021/1026/c373410-32264810.html','全国哲学社会科学工作办公室','保留三个相邻墓冢的陵群；景、敬、悼、定等墓主对应有异说，不强行拆为三位已确认周王。'],
 ['zhou-xianyang','周陵（周文武王传统陵址）','西周／秦（归属争议）','','陕西省咸阳市渭城区周陵街道','周陵','https://www.dpm.org.cn/Uploads/File/2022/07/22/u62da4dd4ade3e.pdf','故宫博物院','祭祀周文王、周武王的传统陵址；考古研究指向秦王陵归属。按实体陵群一条记录，不能另以秦王之名重复计数。'],
 ['yue-yinshan','印山越国王陵（疑似允常墓）','越','越王允常（疑似）','浙江省绍兴市柯桥区兰亭街道里木栅村','印山越国王陵','https://wz.kq.gov.cn/art/2013/12/18/art_1605113_28805892.html','绍兴市柯桥区政府','春秋晚期越国王陵的等级认定有据，允常归属为推定。'],
 ['wu-helv','吴王阖闾墓（虎丘剑池疑似陵址）','吴','吴王阖闾（传统归属）','江苏省苏州市姑苏区虎丘剑池','虎丘','https://dfzb.suzhou.gov.cn/dfzb/fzxh/201006/f5719b3322b04e6b9bed7337d6b70c38.shtml','苏州市地方志办公室','剑池洞穴与疑似墓门未进行试掘；以虎丘区域参考点显示，不声称确认墓室或墓主。'],
 ['chu-xiongjia','熊家冢楚王陵（墓主未定）','楚','','湖北省荆州市荆州区川店镇张场村','熊家冢墓地','https://wwj.chengde.gov.cn/art/2024/12/4/art_962_1034397.html','承德市文物局','楚王陵区等级有考古资料支持，具体楚王未定；以陵区一条记录，陪葬墓不另计。'],
 ['chu-you','李三孤堆（疑似楚幽王墓）','楚','楚幽王熊悍（疑似）','安徽省淮南市谢家集区朱家集南双庙村','楚幽王墓','https://www.shouxian.gov.cn/ztbd/ztzl/cjahswmcsgzzl/8186131.html','寿县政府','1933年遭盗掘；出土楚器及墓主归属仍有研究争议，不将流散器铭直接等同墓志。'],
 ['qi-tian','田齐王陵（二王冢、四王冢）','田齐','','山东省淄博市临淄区齐陵街道及青州市交界','田齐王陵','https://www.tup.com.cn/upload/books/yz/107837-01.pdf','清华大学出版社','保留田齐王陵群，二王冢、四王冢具体王名对应不作定论；参考点不代表每座陵体。'],
 ['han-huzhuang','胡庄韩王陵（墓主未定）','韩','','河南省郑州市新郑市胡庄','韩王陵','https://wwj.henan.gov.cn/2023/11-20/2850334.html','河南省文物局','2008年韩王陵发掘项目入选十大考古发现；以陵区记录，不能用郑韩故城城址中心替代。'],
 ['yan-xuliang','燕下都虚粮冢（疑似燕王陵区）','燕','','河北省保定市易县燕下都东城西北部','虚粮冢','https://wenwu.hebei.gov.cn/system/2023/11/01/030261130.shtml','河北省文物局','王室墓地归属为研究线索；国君与高等级贵族范围需继续区分，不把整个燕下都城址当陵址。'],
 ['qin-east','秦东陵（芷阳陵区）','秦','','陕西省西安市临潼区骊山北麓','秦东陵','https://wwj.shaanxi.gov.cn/sy/dtyw/djgz/202207/t20220708_2228174.html','陕西省文物局','秦王陵区实地考古项目；各陵号、秦王及宣太后对应待核，群内后妃不单独计入。'],
 ['jin-hou','北赵晋侯墓地','晋','','山西省临汾市曲沃县曲村镇北赵村','晋侯墓地','https://www.jinguomuseum.com/newsinfo/807057.html?templateId=1133604','曲沃县晋国博物馆','科学发掘的西周晋国国君墓地；国君与夫人墓的墓号、争议对应待补，先按陵群。'],
 ['lu-nine','鲁九公墓（鲁诸公墓）','鲁','','山东省济宁市汶上、梁山、嘉祥交界','鲁九公墓','https://shandong-chorography.org/database/c87/section/1/article/562/','山东省地方史志资料：汶上县志','地方志实地访查所记鲁君陵区；传统九位鲁君对应不等于逐墓考古确认。'],
 ['lu-fangshan','防山墓群（鲁国早期君主陵区）','鲁','','山东省济宁市曲阜市防山镇','防山墓群','https://whhly.shandong.gov.cn/module/download/downfile.jsp?classid=0&filename=084393c5b66043d6a2f338efdc526ca1.pdf','山东省文化和旅游厅','第七批全国重点文物保护单位简介定年为周、汉，记载春秋玉磬、玉璜及汉代墓葬；具体墓主未定。']
 ];
 for(const [id,name,dynasty,owner,admin,alias,url,publisher,note] of rows){
  const sid='preqin-'+id;source(sid,name+'：地点与认定依据',publisher,url);
  const opts={aliases:[alias],recognition:'attributed',disputes:[note],evidence:note};
  if(owner)add(id,name,'先秦',dynasty,owner,admin,sid,opts);else group(id,name,'先秦',dynasty,admin,sid,opts);
 }
};
