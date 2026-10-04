module.exports=({add,source})=>{
 source('ming-jin-duan-excavation','太原东山晋端王陵园考古发掘','山西省考古研究院消息／国际自然与文化遗产空间技术中心','https://www.unesco-hist.org/index.php?id=2200&r=article/info','2019—2021年发掘；王与殷氏合葬M2，另有继妃及夫人墓，不将三墓均计王陵。');
 source('ming-liang-epitaph','梁庄王墓圹志','湖北省博物馆／Google艺术与文化','https://artsandculture.google.com/asset/prince-zhuang-s-epitaph/6QG_jMX9WB5MTA?hl=zh-cn','原墓出土圹志；博物馆展厅不是原墓地址。');
 source('ming-hubei-excavations','湖北地区明代藩王墓考古发现与研究','中国博物馆协会／湖北省博物馆研究员','https://www.chinamuseum.org.cn/detail.html?contentId=2177&id=13','明确湘献王衣冠冢、辽简王及郢靖王发掘；王妃单墓不扩充为王陵。');
 const pending=(id,name,dynasty,person,admin,sources,evidence,reason,extra={})=>add(id,name,'明',dynasty,person,admin,sources,{rulerCategory:'feudal_king',recognition:'archaeological',evidence,mapReason:reason,reviewTasks:[reason,'核对墓室原址测绘与游客开放公告'],...extra});
 pending('ming-jin-duan','晋端王墓','明（晋藩）','晋端王','山西省太原市小店区黄陵街道东峰村东北，山西财经大学东山新校区一期用地','ming-jin-duan-excavation','发掘及圹志确认王与殷氏合葬M2；继妃M1及夫人M3只在说明中记录。','需配准东山新校区原考古平面；旧校区图书馆东馆点已排除');
 pending('ming-liang-zhuang','梁庄王墓','明（梁藩）','梁庄王朱瞻垍','湖北省钟祥市长滩镇大洪村二组龙山坡','ming-liang-epitaph,ming-hubei-excavations','原墓圹志及考古发掘确认梁庄王与魏妃合葬；展厅与原址分开。','需要大洪村二组龙山坡原墓址测绘；不得使用湖北省博物馆位置',{chronology:{sortYear:1441,basis:'圹志记载卒年'}});
 pending('ming-lu-jing','鲁靖王墓','明（鲁藩）','鲁靖王朱肇煇','山东省邹城市大束镇官厅村','lu-huang-official','地方文物部门记录墓室、鲁王圹志及墓主；独立于九龙山鲁荒王陵。','官厅村内墓室中心尚未配准，不能套用鲁荒王陵坐标',{chronology:{sortYear:1466,basis:'地方文物部门记载卒年'}});
 pending('ming-lu-juye','鲁钜野王墓','明（鲁藩）','钜野王朱泰墱','山东省邹城市凰翥村（行政隶属待核）','lu-huang-official','地方文物部门记录墓志与王妃合葬墓；不以合葬人数扩充陵墓数。','需核对凰翥村现行区划及墓室位置；不能共用荒王或靖王墓点',{aliases:['鲁巨野王墓','钜野王墓'],chronology:{sortYear:1467,basis:'地方文物部门记载卒年'},disputes:['官方简介写大束镇凰翥村，其他资料写中心店镇皇翥村；待保护单位档案复核。']});
 for(const [key,title,person] of [['xianding','宪定','朱任晟'],['rongmu','荣穆','朱履祐']])pending('ming-jingjiang-'+key,'靖江'+title+'王陵','明（靖江藩）','靖江'+title+'王'+person,'广西壮族自治区桂林市尧山缓坡、靖江王陵南区以北','jingjiang-layout,jingjiang-remains','管理处记载另辟佳城、各自营葬；不属于南区九陵共同兆域。','北部独立王陵尚未配准，不关联南区博物馆锚点',{recognition:'documented'});
 pending('ming-xiang-xian','湘献王墓（衣冠冢）','明（湘藩）','湘献王朱柏','湖北省荆州市江陵太晖观旁','ming-hubei-excavations','机构记载朱柏与妃1399年自焚，永乐时营衣冠冢；1997年抢救性发掘。','需配准太晖观旁原墓址；不以观内建筑中心代替墓址',{nature:'cenotaph',chronology:{sortYear:1399,basis:'纪念对象卒年，不代表营冢年份'}});
 pending('ming-liao-jian','辽简王墓','明（辽藩）','辽简王朱植','湖北省荆州市八岭山陵区（单墓待配准）','ming-hubei-excavations','墓志和1987年清理确认墓主；1424年卒、1425年下葬。','需要八岭山单墓测绘位置，不使用整个山系中心',{chronology:{sortYear:1424,basis:'墓主卒年，次年下葬'}});
 pending('ming-ying-jing','郢靖王墓','明（郢藩）','郢靖王朱栋','湖北省钟祥市九里回族乡三岔河村四组','ming-hubei-excavations','2005—2006年发掘的王与妃合葬墓，墓址与博物馆藏品展厅分开。','需要三岔河村四组原墓址配准，不以钟祥博物馆位置代替');
};
