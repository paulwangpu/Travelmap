module.exports=({items,add,group,source})=>{
 const point=(x,lat,lng,sid,original,target,extent='陵区周边约500米参考范围')=>{
  x.coordinates={lat:Math.round(lat*1000)/1000,lng:Math.round(lng*1000)/1000,crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target,original,method:'文献地望与公开地理实体互核，按WGS84约定取区域参考；非现场测绘',sourceDatumExplicit:false,precision:{sourceUnit:'degree',resolutionDegrees:0.001,horizontalAccuracyMeters:null},limitation:extent+'；不是已确认墓室中心或测绘入口。',estimate:{basis:'来源实体与行政区、具体地望相符；原始点及基准限制保留',extent,confidence:'regional',reviewedAt:'2026-10-04'}};x.mapEligible=true;x.mapReason=target;
 };
 source('follow-sunjian','丹阳高陵的地望、文保与传统归属','镇江报业／京江晚报','https://www.jsw.com.cn/2022/0702/1710173.shtml','记载谭巷行政村大坟自然村东北侧高陵，明确尚未考古确认孙坚身份。');
 source('follow-sunjian-dispute','寻踪东吴大墓：丹阳土墩的年代异说','中国江苏网','https://tour.jschina.com.cn/lyzx/202312/t20231215_3333839.shtml','考古研究者提出商周大型土墩墓说；不能将传统高陵名称等同墓主确认。');
 source('follow-sunjian-gps','丹阳高陵现场访古GPS点','孙氏家谱网／孙德鸣现场记录','https://www.sun2800.com/index.php?data_id=1304&pages=data_detail','现场记录给N32°01′00.24″ E119°30′20.78″；未说明大地基准，仅作区域估计，不采用作者的墓主结论。');
 const sun=add('wu-gao-danyang','丹阳高陵（传统孙坚墓）','魏晋南北朝','孙吴','孙坚（传统墓主）','江苏省镇江市丹阳市司徒镇谭巷村大坟自然村','follow-sunjian,follow-sunjian-dispute,follow-sunjian-gps',{nature:'posthumous',recognition:'traditional',evidence:'高陵作为传统孙坚陵址列入市级文物保护；孙权追尊父亲为武烈皇帝。现存土墩墓主尚未考古确认。',disputes:['南京江宁、苏州、富阳另有孙坚陵址说；本项只记录丹阳实体。','有研究认为该土墩可能属于商周时期，保留传统名称，按祭祀对象朝代展示，不作为孙吴墓葬断代。'],chronology:{sortYear:192,basis:'传统祭祀对象卒年参照；不证明土墩建造年代'},reviewTasks:['取得文保界址及现代地图墓冢点；继续核对土墩断代与墓主']});
 point(sun,32+1/60+.24/3600,119+30/60+20.78/3600,'follow-sunjian-gps','现场GPS N32°01′00.24″ E119°30′20.78″；datum未说明','丹阳高陵传统陵址区域参考','传统土墩及周边约1公里参考范围');
 const legends=[
 ['legend-nuwa-hongtong','洪洞女娲陵','女娲（传说人物）','山西省临汾市洪洞县赵城镇侯村','follow-nuwa','洪洞女娲陵现场采访与祭祀遗存','周口市人民政府／周口晚报','https://www.zhoukou.gov.cn/page_pc/zjzk/zkyx/zkwh/article41fb42f6948c400290bdfeda55907067.html',36.38161,111.71876,'https://www.google.com/maps/place/Nvwaling/data=!4m6!3m5!1s0x36768e8be2523e8f:0xc8fe6634b6f402c8!8m2!3d36.38161!4d111.71876!16s%2Fg%2F11q49b163z','记载侯村女娲陵及庙后正陵、衣冠冢传统，保留一个陵区记录，不拆出未核坐标的副陵。'],
 ['legend-yan-baoji','宝鸡炎帝陵','炎帝（传说人物）','陕西省宝鸡市渭滨区神农镇常羊山','follow-yan-baoji','常羊山炎帝陵与祭祖活动','宝鸡市林业局／宝鸡日报','https://lyj.baoji.gov.cn/col1188/202403/t20240319_741124.html',34.325565,107.113524,"https://www.google.com/maps/place/Emperor+Yan's+Tomb/data=!4m6!3m5!1s0x3660e7c2a92d2cff:0xfb96b97ba177b8c0!8m2!3d34.325565!4d107.113524!16s%2Fg%2F155qb136",'机构资料确认常羊山陵区的祭祖传统；不与市区炎帝园、炎帝祠或湖南炎帝陵合并。'],
 ['legend-yan-gaoping','高平炎帝陵','炎帝（传说人物）','山西省晋城市高平市神农镇庄里村','follow-yan-gaoping','高平庄里炎帝陵景区','晋城市人民政府','https://www.jcgov.gov.cn/dtxx/jcdt/201912/t20191225_820534.shtml',35.902635,113.0063264,"https://www.google.com/maps/place/Emperor+Yan's+Tomb/data=!4m6!3m5!1s0x35d8ed2bf3217c63:0x8ffe85857e785026!8m2!3d35.902635!4d113.0063264!16s%2Fg%2F1tff5qyn",'机构资料确认庄里村皇坟、陵后五谷庙与祭祖传统；不将陵碑当作炎帝遗骸或实葬确认。']
 ];
 for(const [id,name,owner,admin,sid,title,publisher,url,lat,lng,mapUrl,evidence] of legends){
  source(sid,title,publisher,url,'仅支持现存陵区和传统祭祀，不证明传说人物实葬。');source(sid+'-map',name+'地理实体','Google Maps公开地理实体',mapUrl,'核对所在地后取区域参考；地图未提供现场测绘误差。');
  const x=add(id,name,'传说时代','传说',owner,admin,sid+','+sid+'-map',{nature:'commemorative',recognition:'traditional',evidence,disputes:['传说祭祀陵，未取得墓主遗骸或实葬的考古确认；同名异址独立记录。'],chronology:{sortYear:-3000,basis:'仅为传说展示排序参照，不是生卒或建陵年代'},reviewTasks:['核对陵区入口与祭祀陵冢界址；不虚构传说人物生卒']});point(x,lat,lng,sid+'-map',`公开实体 lat${lat},lng${lng}`,'传统祭祀陵区参考');
 }
 source('follow-taikang','太康县文物保护调研：太康陵','太康县人民政府','https://www.taikang.gov.cn/sitesources/tkx/page_pc/zwdt/jrtk/article29b0834743a645519b9bbbe88ac9d148.html','2023年调研资料，原网页本轮未成功取回；维基保留来源引文，故不依此认定考古墓主。');
 source('follow-taikang-walk','太康、少康陵现场访问','中国作家网／鲍玉峰署名实地记述','https://tag.chinawriter.com.cn/member/baoyufeng/viewarchives_803424.html','署名作者记录王陵村两处陵碑与现状；证明传统地望，不证明夏王实葬。');
 source('follow-taikang-report','探访夏王陵寝——太康墓','周口晚报（原链接，本轮取回失败）','https://www.zhld.com/zkwb/html/2010-07/26/content_70220.htm','由维基发现的旧现场报道，访问失败；后续须核档案，不把采集汉瓦推成已确认夏王墓。');
 source('follow-taikang-map','王陵村太康墓地理实体','Google Maps公开地理实体','https://www.google.com/maps/place/Taikang+Tomb/data=!4m6!3m5!1s0x35d0ff32494ca60d:0x512e797efedee20a!8m2!3d34.060702!4d114.871144!16s%2Fg%2F1vc7_xv2','太康墓实体仅用于王陵村传统陵区参考，少康单陵位置未确认。');
 const g=group('legend-taikang-area','太康少康陵区','传说时代','夏（传说）','河南省周口市太康县王陵村','follow-taikang,follow-taikang-walk,follow-taikang-report,follow-taikang-map',{nature:'commemorative',recognition:'traditional',evidence:'王陵村保存两位夏王的传统陵名及祭祀遗存；现场访问确认太康、少康陵分别存在，不等于夏代墓主已获考古确认。',disputes:['太康墓图上实体作陵区参考，少康墓具体位置仍待核；不生成两个重合单陵点。','旧报道提及汉代建筑材料，不能据此确认夏代建墓，也不能仅凭地表材料断定墓室年代。'],chronology:{sortYear:-1900,basis:'夏代传说归类参照，不是实测建墓年'}});
 point(g,34.060702,114.871144,'follow-taikang-map','Google Maps太康墓 34.060702,114.871144','王陵村太康少康传统陵区参考','太康墓地图实体周边约1公里范围；未确认少康墓口');
 for(const [id,name,owner] of [['legend-taikang','太康陵','太康（传说人物）'],['legend-shaokang','少康陵','少康（传说人物）']]){
  const x=add(id,name,'传说时代','夏（传说）',owner,g.admin,'follow-taikang-walk,follow-taikang-report',{parentId:g.id,nature:'commemorative',recognition:'traditional',evidence:'署名现场访问记录王陵村传统陵碑及陵冢；不认定为已确认夏王墓。',disputes:['传统墓主未获考古确认；共享陵区位置，不用于单陵导航。'],chronology:{sortYear:id==='legend-taikang'?-1950:-1900,basis:'传说世次排序参照，不是生卒年份'}});
  x.locationReference={parentId:g.id,status:'shared_region_estimate',target:'王陵村传统陵区；单陵位置待核',basis:'两陵地望同属王陵村，使用陵区区域参考，不重复生成点'};x.mapReason='共享王陵村陵区参考，不重复生成单陵点';
 }
};
