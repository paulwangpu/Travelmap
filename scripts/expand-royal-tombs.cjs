module.exports=({add,group,source})=>{
 source('xiang-dongping','东平项羽墓保护建设规划','泰安市政府','https://www.taian.gov.cn/module/download/downfile.jsp?classid=0&filename=32d48c54a0ab4760a04b997e0b2f36d5.pdf');
 source('xiang-dongping-place','旧县三村遗址与霸王墓位置','山东省地方史志资料库','https://shandong-chorography.org/database/b9/section/13/article/175/');
 source('xiang-wujiang','乌江霸王祠的纪念性质与位置','南京大学历史学院','https://history.nju.edu.cn/06/22/c28497a460322/page.htm');
 source('xiang-wujiang-study','项羽祠墓传统研究','江苏省哲学社会科学界联合会','https://www.js-skl.org.cn/uploads/Files/2018-03/12/1-1520846596-672.pdf');
 source('xiang-life','项羽生卒与西楚霸王身份','中国哲学书电子化计划','https://ctext.org/dictionary.pl?did=4016&if=gb&remap=gb');
 add('xichu-xiang-dongping','项羽墓（东平）','秦汉','西楚','西楚霸王项羽','山东省泰安市东平县旧县乡旧县三村','xiang-dongping,xiang-dongping-place',{ownerRole:'ruler',recognition:'traditional',nature:'unknown',aliases:['楚霸王项羽墓','项籍墓','西楚霸王墓'],evidence:'政府规划列项羽墓保护建设，地方志记霸王墓周围旧县三村遗址；传统认为是头葬地。',disputes:['传统墓主归属尚无本目录所引考古证据确认，不把头葬传说写成已确认遗体墓。','与安徽乌江祠墓是异地实体，不能合并坐标或统计为两位君主。']});
 add('xichu-xiang-wujiang','项羽祠墓（乌江）','秦汉','西楚','西楚霸王项羽','安徽省马鞍山市和县乌江镇凤凰山','xiang-wujiang,xiang-wujiang-study',{ownerRole:'ruler',recognition:'traditional',nature:'commemorative',aliases:['霸王祠','乌江项羽衣冠冢'],evidence:'南京大学资料明确霸王祠为纪念项羽而建；研究记衣冠与残骸传统，本条作为祠墓纪念实体收录。',disputes:['衣冠冢及残骸说属于传统叙述，不代表考古确认项羽遗体。','地图采用祠园区域参考点，墓冢中心待核；与东平传统墓址分别记录。']});
 source('royal-tang-shun','顺陵文物保护规划（2021—2035）','陕西省文物局','https://wwj.shaanxi.gov.cn/zfxxgk/fdzdgknr/ghxx/202209/P020220929530106551721.pdf');
 source('royal-tang-shun-archaeology','顺陵陵园石刻布局考古调查','陕西历史博物馆','https://www.sxhm.com/info/news/detail/13002.html');
 add('tang-shun','唐顺陵（杨氏墓）','隋唐','唐、武周','武则天母亲杨氏','陕西省咸阳市渭城区底张街道','royal-tang-shun,royal-tang-shun-archaeology',{ownerRole:'royal_mother',nature:'posthumous',recognition:'archaeological',aliases:['杨氏墓','明义陵'],evidence:'武则天母亲杨氏墓，曾追尊并改陵号，后撤尊号；保护规划和考古调查记录陵园与石刻，不按历史陵号重复计数。',disputes:['属于皇家外戚陵园，不是另一位实际在位皇帝的帝陵；按重要王室女性墓纳入。']});
 source('nanyue-history','南越文王墓保护规划解读','广州市文化广电旅游局','https://wglj.gz.gov.cn/gkmlpt/content/10/10682/post_10682313.html');
 add('nanyue-wen','南越文王墓（赵眜墓）','秦汉','南越','赵眜','广东省广州市越秀区象岗山','nanyue-history',{recognition:'archaeological',ownerRole:'ruler',aliases:['南越王墓'],evidence:'王墓原址保护展示，王墓展区与南越王宫展区是两个地点。'});
 const rows=[
 ['shang-fuhao','妇好墓','先秦','商','妇好','河南省安阳市殷都区小屯宫殿宗庙区','妇好墓','https://capitalmuseum.org.cn/exhibition/195433359fe24960be82c5fad40cd43d','首都博物馆','商王武丁王后及将领，1976年发掘的殷墟M5；依用户新增要求将重要王室女性墓单独纳入。','royal_consort'],
 ['zeng-yi','曾侯乙墓','先秦','曾','曾侯乙','湖北省随州市曾都区擂鼓墩东团坡','曾侯乙墓','https://www.cppcc.gov.cn/zxww/2018/09/21/ARTI1537491271568103.shtml','全国政协','铭文与发掘确认曾国国君乙；不是普通列侯。','ruler'],
 ['cai-hou','寿县蔡侯墓','先秦','蔡','蔡昭侯申（推定）','安徽省淮南市寿县寿春镇西门内','蔡侯墓','https://www.ahm.cn/Collection/Details/?nid=142&t=nd','安徽博物院','1955年出土蔡侯器的墓址；蔡昭侯对应为学术认定，不把馆藏器现址当墓址。','ruler'],
 ['guo-kings','虢国国君墓地','先秦','虢','','河南省三门峡市湖滨区上村岭','虢国墓地','https://www.smx.gov.cn/4042/2025/10/2143489.html','三门峡市政府','国君及贵族墓地先以遗址区记录；非国君普通贵族墓不单列，后续墓号拆分需防止群与单墓重复。','ruler_group'],
 ['qi-jing','齐景公墓（河崖头疑似陵址）','先秦','齐','齐景公杵臼（推定）','山东省淄博市临淄区齐都镇河崖头村','齐景公墓','https://wh.zibo.gov.cn/art/2018/3/15/art_265_1365783.html','淄博市文化和旅游局','殉马坑及墓地遗存有据；地图指向陵区，不将殉马坑解释为君主墓室。','ruler'],
 ['qing-zhaoxi','昭西陵（孝庄）','清','清','孝庄文皇后博尔济吉特氏','河北省唐山市遵化市清东陵大红门东侧','昭西陵','https://www.dpm.org.cn/court/system/236376.html','故宫博物院','后妃陵：1725年由暂安奉殿改建；不属于沈阳昭陵，不混用两个地点。','royal_consort'],
 ['qing-cixi','菩陀峪定东陵（慈禧）','清','清','慈禧太后叶赫那拉氏','河北省唐山市遵化市清东陵菩陀峪','菩陀峪定东陵','https://www.dpm.org.cn/lemmas/245310.html','故宫博物院','后妃陵：慈禧，不与普祥峪慈安陵或咸丰定陵混同。','royal_consort'],
 ['qing-cian','普祥峪定东陵（慈安）','清','清','慈安太后钮祜禄氏','河北省唐山市遵化市清东陵普祥峪','普祥峪定东陵','https://www.dpm.org.cn/lemmas/245310.html','故宫博物院','后妃陵：慈安；定东陵二陵须独立地点，不复制共同陵群点。','royal_consort'],
 ['qing-xiaodong','孝东陵（孝惠）','清','清','孝惠章皇后博尔济吉特氏','河北省唐山市遵化市清东陵孝陵东侧','孝东陵','https://www.dpm.org.cn/lemmas/245310.html','故宫博物院','后妃陵：孝惠章皇后与妃嫔园寝；主后陵一条记录，不逐个纳入妃墓。','royal_consort'],
 ['ming-luwang','南明监国鲁王墓（迁葬新墓）','明','南明','朱以海','福建省金门县金湖镇小径','明鲁王墓','https://www.kinmen.gov.tw/News_Content2.aspx?Create=1&n=98E3CA7358C89100&s=3D6E6B19144483E6&sms=BF7D6D478B935644','金门县政府','1959年发现真墓与圹志，现小径新墓1963年安葬；只列现墓，旧墓作为迁葬说明，不同于普通明鲁藩王墓。','regent'],
 ['ming-shaowu','绍武君臣冢','明','南明','绍武帝朱聿鐭','广东省广州市越秀区越秀公园南秀湖畔','绍武君臣冢','https://wglj.gz.gov.cn/zwpd/2.5.6/201904/8f2cc8ddb1764ea78283ee4f0c84601c/files/cbdf2782b10e49478acf3c2fd51b3cde.pdf','广州市文化广电旅游局','君臣合葬及迁葬墓，以现址一条记录；臣属不单独纳入。','ruler']
 ];
 // Museum excavation records identify these occupants independently of tradition.
 const archaeological=new Set(['shang-fuhao','zeng-yi','guo-kings']);
 for(const [id,name,era,dynasty,owner,admin,alias,url,publisher,note,ownerRole] of rows){const sid='royal-'+id;source(sid,name+'：地点与历史',publisher,url);const opts={aliases:[alias],ownerRole,recognition:archaeological.has(id)?'archaeological':ownerRole==='royal_consort'?'documented':'attributed',evidence:note,disputes:[note]};if(owner)add(id,name,era,dynasty,owner,admin,sid,opts);else group(id,name,era,dynasty,admin,sid,opts);}
};
