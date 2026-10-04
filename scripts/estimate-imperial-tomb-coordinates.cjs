// Estimates are explicit, reviewed records; never automatically accept search matches.
module.exports=({items,source,set,gcjToWgs})=>{
 for(const [id,lng,lat,node,target] of [
  ['han-yuan',112.58284,34.77524,'W1385126444','大汉冢M066遗址参考点（原陵归属推定）'],
  ['han-gong',112.58456,34.76635,'W1385126445','二汉冢M561遗址参考点（恭陵归属推定）'],
  ['han-wen',112.58753,34.78788,'W1385126449','刘家井大冢M067遗址参考点'],
  ['han-huai',112.60376,34.77627,'W1385126442','朱仓M707独立遗址参考点（怀陵归属推定）'],
  ['han-sanhan',112.58543,34.76171,'W1385126446','三汉冢M560独立遗址参考点（墓主有争议）'],
  ['wei-chang',112.41857,34.76651,'W994859873','北魏孝文帝长陵遗址区域参考点'],
  ['zhou-xiao',108.82044,34.46123,'N13848519719','北周孝陵遗址参考点（不是唐顺陵）'],
  ['legend-shun-yuncheng',110.90616,35.12015,'W473505925','运城舜帝陵庙景区参考点'],
  ['tang-shun',108.79931,34.46132,'W941766392','唐顺陵遗址公园参考点（非封土中心）']
 ]){const sid='geo-reviewed-'+id;source(sid,target,'OpenStreetMap地理数据（Mapcarta索引）','https://mapcarta.com/'+node,'公开OSM实体经纬度为WGS84，结合机构资料核对现址；未提供测绘误差。');set(id,lng,lat,sid,target,`${lat}, ${lng}; OSM ${node}`,'OSM独立陵墓实体参考坐标，核对名称与行政区，非墓室测绘',0.00001);}
 source('wei-chang-location','孟津北魏陵区保护与位置','洛阳市政府公开项目资料','https://oss.ly.gov.cn/luoyang_xigongqu/ueditor/upload/file/20251217/1765962562885032278.pdf','长陵重点保护区在官庄村东约800米。');
 items.find(x=>x.id==='wei-chang').sourceIds.push('wei-chang-location');
 const estimate=(id,lng,lat,sid,target,basis,extent)=>{
  set(id,lng,lat,sid,target,`${lat}, ${lng}; WGS84 regional reference`,basis,0.00001);
  const x=items.find(x=>x.id===id);
  x.coordinates.status='estimated_wgs84';x.coordinates.sourceDatumExplicit=false;
  x.coordinates.estimate={basis,extent,confidence:'regional',reviewedAt:'2026-10-03'};
  x.coordinates.limitation=`估计位置：${basis}。参考范围：${extent}；范围描述不是测绘误差，不能视为墓室坐标。`;
  x.mapReason='有地点依据的区域估计，地图与卡片明确标示';
 };
 source('geo-estimate-xiang-dongping','旧县三村遗址（霸王墓周围）经纬度','山东省地方史志资料库','https://shandong-chorography.org/database/b9/section/13/article/175/','原文东经116°15′、北纬36°05′；只精确到分，基准未明，作为墓周围区域估计。');
 estimate('xichu-xiang-dongping',116.25,36+5/60,'geo-estimate-xiang-dongping','东平霸王墓周围遗址区域（估计）','地方志明确遗址在霸王墓周围，以公布的分级经纬度按WGS84区域估计，不声称墓冢中心','分级坐标约1—2公里参考范围，原始基准未明；不用于墓冢精确导航');
 source('geo-estimate-xiang-wujiang','乌江霸王祠祠园地理实体','OpenStreetMap地理数据（Mapcarta索引）','https://mapcarta.com/W260713053','OSM祠园区域WGS84参考点，未单独定位墓冢。');
 estimate('xichu-xiang-wujiang',118.46602,31.8481,'geo-estimate-xiang-wujiang','乌江霸王祠祠园区域（墓冢位置估计）','OSM祠园坐标与南京大学所述凤凰山位置核对，以祠园代表点估计墓区','祠园级参考点；具体墓冢与参考点距离待核');
 for(const [id,latMinutes,lngMinutes,m] of [['han-xuan',37.315,39.597,'M1030'],['han-xianjie',36.499,39.865,'M1038'],['han-jing-east',35.972,39.984,'M1052'],['han-m1048',35.692,39.057,'M1048'],['han-m1055',35.429,39.499,'M1055'],['han-m1071',34.927,39.641,'M1071']]){
  const x=items.find(x=>x.id===id);x.sourceIds.push('east-han-plan-coordinates');
  estimate(id,112+lngMinutes/60,34+latMinutes/60,'east-han-plan-coordinates',m+'保护区参考中心（估计）','政府公开资料引用保护规划所列独立大墓中心经纬度，基准未明，按WGS84区域估计处理','公布中心各外扩500米的保护区；坐标基准偏移待核，500米不是测绘误差');
 }
 for(const [id,lng,lat,url,target] of [
  ['han-ba',109.11082,34.23809,'https://mapcarta.com/W1286149651','江村大墓考古遗址区域参考点（不是凤凰嘴旧址）'],
  ['qing-xiaodong',117.65431,40.19592,'https://mapcarta.com/W504653816','孝东陵石五供参考点（不是墓室中心）']
 ]){const sid='geo-reviewed-'+id;source(sid,target,'OpenStreetMap地理数据（Mapcarta索引）',url,'WGS84地理实体参考点；结合目录机构资料核对地点，非测绘。');set(id,lng,lat,sid,target,`${lat}, ${lng}; OSM WGS84`,'OSM实体坐标与机构所述现址交叉核对',0.00001);}
 for(const [id,lng,lat,url,target] of [
  ['legend-shun-ningyuan',111.984618,25.355002,'https://www.amap.com/place/B02EA002EY','九嶷山舜帝陵现祭祀景点参考点'],
  ['han-yuan-tiexie',112.594791,34.840609,'https://www.amap.com/place/B017B00WJD','铁谢村传统刘秀坟陵园景点参考点（非原陵）']
 ]){const sid='geo-reviewed-'+id;source(sid,target,'高德地图',url,'高德GCJ-02 POI经项目迭代反解WGS84；旅游参考点不改变墓主认定。');const p=gcjToWgs(lng,lat);set(id,p[0],p[1],sid,target,`${lat}, ${lng}; GCJ-02`,'高德POI经GCJ-02反解为WGS84，核对机构资料中的村址',0.000001);}
 source('geo-estimate-xianling','明显陵官方陵区经纬度范围','湖北省文化和旅游厅','https://wlt.hubei.gov.cn/bmdt/ztzl/lszt/sjwhyc/sjyzcd/mxl/','取公布范围中点；原文未明确坐标基准，按WGS84区域估计处理。');
 estimate('ming-xianling',(112+37/60+50/3600+112+38/60+9/3600)/2,(31+12/60+20/3600+31+13/60)/2,'geo-estimate-xianling','明显陵官方公布陵区范围中点（估计）','官方给出112°37′50″—112°38′09″、31°12′20″—31°13′00″，取范围中点，基准未明','约0.5 × 1.2公里的公布范围，另有基准偏移可能');
 source('geo-estimate-zhongshan','中山王墓陵区地理索引','Wikidata','https://www.wikidata.org/wiki/Q1500653','索引指向整个王墓区，作为一号墓区域估计，不声称单墓精确对应。');
 estimate('zhongshan-cuo',114.1972,38.32775,'geo-estimate-zhongshan','中山王墓陵区参考位置（一号墓估计）','采用中山王墓陵区WGS84索引，目录考古资料认定一号墓墓主，但索引未拆分各墓','陵区级；一号墓与索引点距离待核，不用于精确导航');
 source('geo-estimate-qijing','东周殉马坑原址地理索引','OpenStreetMap地理数据（Mapcarta索引）','https://mapcarta.com/W1247573797','原址附属遗迹参考点，不等同主墓中心。');
 source('qijing-location-evidence','齐文化：东周殉马坑与五号墓位置关系','临淄区政府','https://www.linzi.gov.cn/lz/files/app/20150402_083214.pdf','河崖头村西、齐国故城东北；五号墓周围殉马坑。墓主仍保留推定。');
 items.find(x=>x.id==='qi-jing').sourceIds.push('qijing-location-evidence');
 estimate('qi-jing',118.37021,36.88663,'geo-estimate-qijing','河崖头五号墓所在殉马坑原址区域（估计）','根据政府资料所述五号墓与殉马坑关系，用原址殉马坑坐标估计主墓区域，未用迁址博物馆','遗址级，殉马坑环绕范围约215米；主墓中心待核');
 source('geo-estimate-nanhan-kang','康陵原址保护展厅地理索引','OpenStreetMap地理数据（Mapcarta索引）','https://mapcarta.com/W1375055483','康陵保护展厅作为原址区域估计，不采用南汉二陵博物馆主馆坐标。');
 source('nanhan-kang-location-evidence','康陵保护设施规划核实意见','广州市规划和自然资源局','https://ghzyj.gz.gov.cn/attachment/7/7162/7162105/8569231.pdf','建设位置为小谷围岛华师一路、康陵路与中环西路之间地块。');
 items.find(x=>x.id==='nanhan-kang').sourceIds.push('nanhan-kang-location-evidence');
 estimate('nanhan-kang',113.37581,23.04977,'geo-estimate-nanhan-kang','南汉康陵原址保护展厅所在区域（估计）','原址保护展厅OSM索引与官方康陵保护设施地块核对，展厅参考点尚未直接对应玄宫中心','保护设施所在街区；玄宫与展厅坐标对应待核');
 require('./supplement-luoyang-tomb-coordinates.cjs')({items,source,estimate});
 source('geo-estimate-zhou-jue','北贺村地理参考点','GeoNames','https://www.geonames.org/search.html?q=Siam%2F&startRow=200','北贺村34.426868、108.742598；这是村庄参考点，不是M655墓室坐标。');
 estimate('zhou-jue',108.742598,34.426868,'geo-estimate-zhou-jue','北贺村村域参考点（静陵位置估计）','西咸新区公布宇文觉墓位于北贺村，结合GeoNames同名村地理记录作村域估计','北贺村及机场高速南侧村域，公里级参考；墓室与参考点的距离待核');
 source('chu-you-relative-location','李三孤堆与武王墩的位置关系','新华网（采访考古项目负责人）','https://www.xinhuanet.com/ci/20240419/f8e2be4076d946ce840ce02c397ce8f6/c.html','考古人员介绍武王墩位于李三孤堆正北14.6公里；相对距离用于区域估计，不是单墓测绘。');
 const anchor=items.find(x=>x.id==='chu-wuwangdun').coordinates;
 if(!anchor||anchor.status!=='verified_wgs84')throw new Error('李三孤堆估计需要已复核的武王墩参考点');
 const chuYou=items.find(x=>x.id==='chu-you');
 chuYou.sourceIds.push('chu-you-relative-location',anchor.sourceId);
 estimate('chu-you',anchor.lng,Number((anchor.lat-14.6/111.32).toFixed(5)),'chu-you-relative-location','李三孤堆遗址区域（相对位置估计）','根据考古人员所述武王墩位于李三孤堆正北14.6公里，从武王墩遗址代表点保持经度不变向南推算，纬度按每度约111.32公里换算','约1—2公里的区域浏览参考；报道距离、方位及武王墩参考点与主墓中心的差异均未测量，不用于墓室导航');
 chuYou.coordinates.estimate.derivation={anchorId:'chu-wuwangdun',anchorSourceId:anchor.sourceId,anchorStatus:anchor.status,anchorPoint:{lng:anchor.lng,lat:anchor.lat},distanceMeters:14600,direction:'south',method:'latitude_offset_111320_m_per_degree'};
 source('nanhan-relative-location','康陵与德陵的位置关系及遗址现状','广州日报·新花城（广州市文物考古研究院公布资料）','https://huacheng.gz-cmc.com/pages/2023/06/11/944782787ee844c8a7727da78dddbc93.html','康陵北与青岗德陵相距约800米；德陵在北亭村金斗里东侧约50米的青岗北坡，现华南师范大学校园内。');
 source('nanhan-distance-official','南汉二陵间距','广州市民政局地名保护名录','https://mzj.gz.gov.cn/attachment/7/7537/7537434/8753411.pdf','官方名录记两陵相距约800米；不提供测绘经纬度。');
 const kang=items.find(x=>x.id==='nanhan-kang').coordinates;
 if(!kang||kang.status!=='estimated_wgs84')throw new Error('德陵区域估计需要康陵原址展厅参考点');
 const de=items.find(x=>x.id==='nanhan-de');de.sourceIds.push('nanhan-relative-location','nanhan-distance-official',kang.sourceId);
 estimate('nanhan-de',kang.lng,Number((kang.lat+0.8/111.32).toFixed(5)),'nanhan-relative-location','北亭青岗德陵所在区域（相对位置估计）','官方名录记录两陵相距约800米，广州考古公布资料介绍德陵位于康陵以北的青岗北坡；从康陵原址展厅参考点向北推算','青岗北坡及华南师范大学校园相邻区域，约数百米级浏览参考；继承康陵展厅位置的不确定性，报道方位与距离均非精确测量');
 de.coordinates.estimate.derivation={anchorId:'nanhan-kang',anchorSourceId:kang.sourceId,anchorStatus:kang.status,anchorPoint:{lng:kang.lng,lat:kang.lat},distanceMeters:800,direction:'north',method:'latitude_offset_111320_m_per_degree',inheritsAnchorUncertainty:true};
 de.reviewTasks.push('以德陵保护范围图核对青岗北坡单墓位置；当前点由康陵展厅推算，仅为区域估计。');
 estimate('yuan-burkhan',109+33.58/3600,48+45/60+43.12/3600,'yuan-burkhan','大不儿罕山圣地遗产代表点（疑似葬地区域估计）','采用UNESCO公布的圣地代表经纬度作WGS84区域参考；资料只记传说葬地关联，未确认实际墓址','443739.2公顷遗产地；所示点不是墓冢、入口或其他元帝葬地，不用于墓葬导航');
 estimate('zeng-yejiashan',113+27/60+28/3600,31+45/60+22/3600,'yejiashan-location','叶家山曾侯墓地整体参考点（估计）','考古保护论文公布墓地经纬度，原始基准未明，按WGS84区域估计处理','约400×100米岗地及可能坐标基准偏移；不对应某座国君墓室');
 for(const [id,lng,lat,target,extent] of [
  ['liao-xian',121+41/60+47.66/3600,41+39/60+0.07/3600,'琉璃寺陵前建筑区域参考点（显陵区域估计）','琉璃寺遗址平台保护范围，东150米、南70米、西60米、北90米；范围不是测量误差'],
  ['liao-qian',121+44/60+17.4/3600,41+39/60+17.1/3600,'新立陵前建筑区域参考点（乾陵区域估计）','新立董家大园子整个山坡及外扩70米保护范围；非新立1号、2号墓中心']
 ])estimate(id,lng,lat,'liao-protection-transcript',target,'辽宁省政府保护范围通知附件转录的陵前遗址参考经纬度，原附件数值尚待再次直接核对且基准未明；作为WGS84区域估计',extent+'；另有转录及基准不确定性');
 source('geo-beijing-jin','大房山金陵主陵区地图参考点','Wikimapia公开地理标注','https://wikimapia.org/21300527/Imperial-mausoleums-of-Jin-dynasty-%E9%87%91%E9%99%B5%E9%81%97%E5%9D%80','39°44′55″N、115°54′46″E；与北京市政府所述龙门口村北、车厂村及九龙山位置核对，非单陵测绘。');
 estimate('jin-group',115+54/60+46/3600,39+44/60+55/3600,'geo-beijing-jin','九龙山金陵主陵区参考点（估计）','公开地理标注与官方主陵区所在村、山位置交叉核对；只定位遗址区域，不将陵名与单墓一一对应','主陵区及大房山历史陵区；整个历史陵区约60平方公里，其他祖陵不可视为与代表点重合');
 source('geo-beijing-liulihe','琉璃河遗址馆区地图参考位置','地球在线（Google卫星底图地理标注）','https://www.earthol.com/view-16970.html','页面当前坐标116.05691、39.61705，行政地址董家林村7区1号；原基准未明，结合官方墓葬区与館区规划作区域估计，不作WGS84精测。');
 estimate('yan-liulihe',116.05691,39.61705,'geo-beijing-liulihe','琉璃河遗址馆区与黄土坡Ⅱ区关联区域（估计）','网页实读原址馆区代表坐标，结合政府保护规划的黄土坡墓葬Ⅱ区与馆区对应，仅作WGS84区域估计；未直接测绘单墓，原网页坐标基准未明','馆区与相邻黄土坡墓地，约公里级参考；原始基准可能偏移数百米，不以此认定M1193或M202墓室中心');
 source('geo-beijing-shuangqing','双清别墅原始摄影地理位置','Wikimedia Commons摄影者N509FZ（原始地理标注）','https://commons.wikimedia.org/wiki/File:Shuangqing_Villa_(20190918142647).jpg','相机位置39°59′6.900″、116°11′17.707″；是参照地标而非陵址。');
 estimate('liao-yongan',116+11/60+17.707/3600,39+59/60+6.9/3600,'geo-beijing-shuangqing','双清西南上坡关联区域（以双清为锚的估计参考，非墓址）','机构文史记辽王坟在双清西南上坡、蟾蜍峰附近；以有原始摄影地理记录的双清作关联区域锚点，不任意偏移或声称找到了旧陵','双清西南上坡与蟾蜍峰周围，数百米至公里级范围；参考点在双清附近，不用于故址或墓道导航');
 source('houhan-survey-coordinate','后汉皇陵区域环境敏感目标坐标表','郑州市政府公开登封生活垃圾焚烧发电项目报告','https://public.zhengzhou.gov.cn/attachment/登封市生活垃圾焚烧发电项目（报批版）.pdf','敏感目标第72项：后汉皇陵712552、3802213；报告其他坐标使用UTM，但此表未单独标明带号与大地基准。');
 const hh=require('./utm-region-reference.cjs')(712552,3802213,49);
 estimate('houhan-group',hh.lng,hh.lat,'houhan-survey-coordinate','后汉皇陵环境敏感目标区域参考（估计）','原项目敏感目标表提供投影坐标，结合报告UTM记述和所在经度推断49N带，按WGS84逆算；带号与大地基准属推断，不作精测坐标','约公里级陵区参考；包括投影基准、原表指向与陵群分区不确定性，非刘知远或刘承祐墓室中心');
 items.find(x=>x.id==='houhan-group').coordinates.estimate.derivation={method:'inverse_utm',easting:712552,northing:3802213,inferredZone:49,hemisphere:'north',assumedDatum:'WGS84',sourceDatumConfirmed:false};
 source('jincun-old-coordinate','旧金村墓群历史坐标的转引线索','《洛阳故城古墓考》坐标的公开转引（原书待核）','https://www.danran1967.com/?p=60757','转引原书第三章金村东门外墓葬坐标34°45′N、112°37′E；不是新一轮调查的GPS成果，原大地基准未明。');
 estimate('zhou-jincun',112+37/60,34+45/60,'jincun-old-coordinate','旧金村东周墓群所在区域（历史坐标估计）','历史坐标转引到整角分，与洛阳考古研究院白马寺镇金村、汉魏故城北部的地望交叉核对；按WGS84区域估计展示。原书尚待直接校核，非现代GPS实测，也不指向某座墓','约1—2公里参考范围，包含整角分取整、原始基准和转引误差；不得用于单墓导航，不定位到迁建后的新金村');
 items.find(x=>x.id==='zhou-jincun').coordinates.estimate.derivation={method:'historical_dms_transcription',originalLatitude:'34°45′N',originalLongitude:'112°37′E',primaryBookDirectlyVerified:false,originalDatumConfirmed:false,crossCheckedSourceId:'jincun-survey'};
};
