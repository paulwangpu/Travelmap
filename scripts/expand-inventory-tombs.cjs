// Proactive comparison against published protection inventories, not user examples.
module.exports=({items,add,group,source})=>{
 source('henan-protection-2018','第七批国保及第六、七批省保保护范围（豫文物〔2018〕278号）','河南省文物局、河南省住建厅（开封文旅局公开）','https://wgl.kaifeng.gov.cn/kfswhgdhlyj/swgljwbdw/1805436537969889280/M71CbQHO.pdf','国保古墓葬第7项后汉皇陵、第13项汝阳高平陵、第14项后晋显陵；网页直接访问受限，公布附件可索引核对。');
 source('henan-huanghe-plan','黄河国家文化公园（河南段）建设保护规划','河南省人民政府公开规划','https://oss.henan.gov.cn/typtfile/20240327/29099b3e9c374770814306ef7329ff3f.pdf','帝陵保护工程列汝阳高平陵、许昌后汉睿陵、唐恭陵。');
 source('houjin-xian-institution','宜阳后晋显陵文保资料','洛阳日报（当地文物部门资料）','https://lyrb.lyd.com.cn/images/2013-05/08/1367969590921lyrb20130508009.pdf','宜阳县城北12.5公里；陵名、文保现址与墓主身份分开核对。');
 add('houjin-xian','后晋显陵','五代十国','后晋','后晋高祖石敬瑭','河南省洛阳市宜阳县盐镇镇石陵村西','henan-protection-2018,houjin-xian-institution',{evidence:'省文物局保护范围文件列为国保古墓葬；文物部门报道记宜阳石陵村遗址。',chronology:{sortYear:942,basis:'历史卒年排序，非墓室发掘纪年'}});
 group('houhan-group','后汉皇陵','五代十国','后汉','河南省许昌市禹州市苌庄镇柏村柏嘴山一带','henan-protection-2018,henan-huanghe-plan',{evidence:'保护范围文件分别列皇陵主体、隐帝颍陵与昭圣皇后陵；后妃记录在陵群说明，不单独新增。',chronology:{sortYear:948,basis:'后汉高祖卒年排序'}});
 const shared={parentId:'houhan-group',status:'shared_region_estimate',target:'后汉皇陵区域参考（非单陵墓室中心）',limitation:'保护名单列多处分区；总体参考点不能证明颍陵与睿陵重合。'};
 add('houhan-rui','后汉睿陵','五代十国','后汉','后汉高祖刘知远','河南省许昌市禹州市苌庄镇柏村一带','henan-protection-2018,henan-huanghe-plan',{parentId:'houhan-group',locationReference:{...shared},evidence:'省建设保护规划明确列许昌后汉睿陵；独立坐标尚未核实。',chronology:{sortYear:948,basis:'历史卒年排序'}});
 add('houhan-ying','后汉颍陵','五代十国','后汉','后汉隐帝刘承祐','河南省许昌市禹州市苌庄镇后汉皇陵保护分区','henan-protection-2018',{parentId:'houhan-group',locationReference:{...shared},evidence:'省文物局文件明确列后汉隐帝颍陵及以墓中心外扩的独立保护范围。',chronology:{sortYear:950,basis:'历史卒年排序'}});
 add('wei-gaoping-rudian','魏明帝高平陵（汝阳茹店传统认定）','魏晋南北朝','曹魏','魏明帝曹叡（传统归属）','河南省洛阳市汝阳县大安工业区茹店村','henan-protection-2018,henan-huanghe-plan,houjin-xian-institution',{recognition:'traditional',nature:'unknown',evidence:'国保公布及保护范围沿用魏明帝高平陵名称；墓主实际对应还须与西朱村M2的考古候选区分。',disputes:['同一魏明帝存在不同候选葬址；国保名称不等于考古确认墓主，不与西朱村M2合并，不统计为两座确认的曹叡墓。'],chronology:{sortYear:239,basis:'传统墓主卒年，非实体认定'}});
 const x=items.find(x=>x.id==='wei-westzhu-m2')||items.find(x=>x.name==='西朱村曹魏墓M2');if(x){x.relatedSiteIds=['wei-gaoping-rudian'];x.disputes.push('另有汝阳茹店国保高平陵传统认定；两处是候选关系，不能计作两座已确认的魏明帝墓。');}items.find(x=>x.id==='wei-gaoping-rudian').relatedSiteIds=x?[x.id]:[];
 source('tang-gong-institution','唐恭陵（孝敬皇帝陵）位置与保护区资料','偃师市政府公开建设项目资料','https://www.yanshi.gov.cn/ueditor/php/upload/file/20191216/1576481412427735.pdf','缑氏镇东北2.5公里滹沱岭；项目中心坐标不是陵墓坐标，禁止误抄。');
 add('tang-gong','唐恭陵（孝敬皇帝李弘）','隋唐','唐（追尊）','孝敬皇帝李弘（追尊）','河南省洛阳市偃师区缑氏镇滹沱岭','tang-gong-institution,henan-huanghe-plan',{nature:'posthumous',evidence:'机构文件明确唐恭陵即孝敬皇帝陵、太子弘墓及石刻；作为追尊帝陵收录，未在位不写作唐朝在位皇帝。',chronology:{sortYear:675,basis:'历史卒年排序'}});
 source('jincun-palace','金村：八座大墓及东周王室墓群资料','故宫博物院','https://www.dpm.org.cn/lemmas/243492.html','机构记载1928年暴露八座大墓；不将旧盗掘记录中的八墓直接指定给八位周王。');
 source('jincun-survey','金村东周陵区地望与GPS调查','洛阳市考古研究院','https://www.lykgyjy.cn/wenwubaohu/371.html','白马寺镇金村附近、汉魏故城内北部；文字称做过GPS定位，但未在文字中公布金村坐标，不误抄后文东汉墓坐标。');
 source('jincun-identity','东周王城研究：三处王陵区及墓主范围研究','全国哲学社会科学工作办公室','https://www.nopss.gov.cn/n1/2021/1026/c373410-32264810.html','金村为敬王至慎靓王陵区是一项研究结论，不构成每座盗掘大墓墓主的独立证明。');
 source('jincun-looting','金村墓群盗掘及文物流散','故宫博物院《紫禁城》','https://www.dpm.org.cn/Uploads/File/2019/04/30/u5cc8258e48f79.pdf','1928年发现东周墓群，古董商组织盗掘，文物流散海外；逐墓器物出处仍须核查。');
 group('zhou-jincun','金村大墓（东周王陵区）','先秦','东周','河南省洛阳市瀍河回族区白马寺镇金村、汉魏洛阳故城北部','jincun-palace,jincun-survey,jincun-identity,jincun-looting',{aliases:['金村东周王陵区','金村王陵','洛阳金村大墓','金村东周墓群'],occupants:['东周王室成员（各墓墓主未定）'],recognition:'attributed',evidence:'故宫记载八座大型东周王室墓葬，考古研究院确认金村陵区地望。以陵群收录，单墓编号、边界及具体王名未可靠对应。',disputes:['王室陵区的研究认定与逐墓墓主确定分开，不直接生成敬王等十一位周王的单陵。','盗掘及古董流通破坏出土关系，不能将所有传称金村器物都对应到某一已知墓。','不同于周山王陵区、王城王陵区，也不同于汝阳县靳村乡。'],chronology:{sortYear:-400,basis:'战国陵区约略排序，非某位墓主的卒年'},reviewTasks:['取得新一轮调查勘测范围和各大墓编号、坐标','复核原书历史坐标及旧金村与迁建新村的区别']});
 group('zhou-zhoushan','周山王陵区','先秦','东周','河南省洛阳市涧西区周山','jincun-identity',{recognition:'attributed',evidence:'东周王城研究区分周山、王城和金村三处王陵区；所属具体周王对应仍有讨论。',chronology:{sortYear:-544,basis:'传统陵区年代排序参照'}});
 for(const id of ['zhou-ling','zhou-three'])items.find(x=>x.id===id).parentId='zhou-zhoushan';
 group('zhou-wangcheng','王城王陵区（春秋）','先秦','东周','河南省洛阳市西工区王城广场、体育场路一带','jincun-identity',{aliases:['东周王城王陵区','春秋王陵区'],recognition:'attributed',evidence:'机构研究提出体育场路及王城广场一带为春秋王陵区，并列出二十七中大墓及甲字形大墓等王陵候选；陵区不等于附近所有东周墓均为王陵。',disputes:['天子驾六是车马坑展示，不能自动作为某位周王墓室位置。','具体君主、墓号和独立经纬度尚待逐墓对应。'],chronology:{sortYear:-770,basis:'春秋陵区约略起始年代，非某墓主卒年'}});
};
