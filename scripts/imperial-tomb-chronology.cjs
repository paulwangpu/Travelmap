// Historical ordering uses ruler death years, not an assertion of tomb construction dates.
module.exports=function(items){
 const years={
 'tang-shun':650,
 'shang-fuhao':-1200,'jin-hou':-900,'lu-fangshan':-900,'guo-kings':-800,'lu-nine':-600,'zhou-ling':-545,'zhou-three':-500,'qi-jing':-490,'wu-helv':-496,'yue-yinshan':-497,'zeng-yi':-433,'cai-hou':-491,'chu-xiongjia':-500,'qi-tian':-350,'han-huzhuang':-300,'yan-xuliang':-300,'qin-east':-250,'chu-you':-228,'zhou-xianyang':-300,'nanyue-wen':-122,'ming-luwang':1662,'ming-shaowu':1646,
 'qin-gong-1':-537,'chu-wuwangdun':-238,'zhongshan-cuo':-310,'qin-first':-210,'chu-yi':-206,
 'han-chang':-195,'han-an':-188,'han-ba':-157,'han-yang':-141,'han-mao':-87,'han-ping':-74,'han-du':-48,'han-wei':-33,'han-yan':-7,'han-yi':-1,'han-kang':6,'han-yuan':57,'han-gong':125,'han-xian':144,'han-huai':145,'han-wen':189,'han-chan':234,
 'wei-gao':220,'wei-shouyang':226,'wei-xizhu-m2':239,'shu-hui':223,'wu-jiang':252,'jin-gaoyuan':251,'jin-junping':255,'jin-chongyang':265,'jin-junyang':290,'jin-taiyang':307,'liang-jian':490,'wei-chang':499,'wei-jing':515,'wei-ding':528,'wei-jing2':531,'zhou-xiao':578,
 'sui-tai':604,'sui-yang':618,'tang-xian':635,'tang-zhao':649,'tang-qian':683,'tang-ding':710,'tang-qiao':716,'tang-tai':762,'tang-jian':762,'tang-yuan':779,'tang-chong':805,'tang-feng':806,'tang-jing':820,'tang-guang':824,'tang-zhuang':827,'tang-zhang':840,'tang-duan':846,'tang-zhen':859,'tang-jian2':873,'tang-jing2':888,
 'nanhan-de':911,'shu-yong':918,'later-tang-hui':933,'nantang-qin':943,'nanhan-kang':942,'zhou-song':954,'zhou-qing':959,'nantang-shun':961,'zhou-shun':973,
 'liao-zu':926,'liao-huai':947,'liao-qing':1031,'jin-rui':1123,'song-an':956,'song-chang':976,'song-xi':997,'song-ding':1022,'song-zhao':1063,'song-hou':1067,'song-yu':1085,'song-tai':1100,'song-si':1187,'song-fu':1194,'song-chong':1200,'song-mao':1224,'song-mu':1264,'song-shao':1274,
 'yuan-genghis':1227,'ming-zu':1344,'ming-huang':1344,'ming-xiao':1398,'ming-chang':1424,'ming-xian':1425,'ming-jing':1435,'ming-jingtai':1457,'ming-yu':1464,'ming-mao':1487,'ming-tai':1505,'ming-xianling':1519,'ming-kang':1521,'ming-yong':1567,'ming-zhao':1572,'ming-ding':1620,'ming-qing':1620,'ming-de':1627,'ming-si':1644,
 'qing-yong':1598,'qing-fu':1626,'qing-zhao':1643,'qing-xiao':1661,'qing-jing':1722,'qing-tai':1735,'qing-yu':1799,'qing-chang':1820,'qing-mu':1850,'qing-ding':1861,'qing-hui':1875,'qing-chong':1908
 };
 for(const x of items)if(x.id.startsWith('shang-m'))years[x.id]=-1200;
 for(const x of items)x.chronology=x.chronology??{sortYear:years[x.id]??null,basis:x.id==='qing-yong'?'陵寝始建年代（祖陵）':x.id==='ming-zu'?'先祖年代排序参照，不代表建陵年':years[x.id]!==undefined?'墓主卒年排序参照；合葬采用首位墓主，不代表建陵或迁葬年':'年代未确定；传说时代及未定墓主保留目录次序'};
 for(const id of [...items.filter(x=>x.id.startsWith('shang-m')).map(x=>x.id),'tang-shun','shang-fuhao','jin-hou','lu-fangshan','guo-kings','lu-nine','zhou-three','chu-xiongjia','qi-tian','han-huzhuang','yan-xuliang','qin-east','zhou-xianyang']){const x=items.find(x=>x.id===id);if(x)x.chronology.basis='所属墓群或墓制的大致年代排序参照，约到世纪；不作为墓主生卒或精确建陵年';}
};
