// Public archaeological photographs and display plans are transcribed in image
// pixels. These transforms provide approximate map placement, not survey points.
const fs=require('node:fs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const output='data/qin-xianyang-palace.geojson',d=read(output);
const R=6378137,rad=Math.PI/180,merc=([x,y])=>[R*x*rad,R*Math.log(Math.tan(Math.PI/4+y*rad/2))],geo=([x,y])=>[+(x/R/rad).toFixed(8),+((2*Math.atan(Math.exp(y/R))-Math.PI/2)/rad).toFixed(8)];
const sourceURLs={western:'https://imgpai.thepaper.cn/newpai/image/20250617/bc945677-ed8f-4a52-8df9-e7a7e7aa313c.jpg',sixProject:'https://imgpai.thepaper.cn/newpai/image/20250617/67f4db0e-3012-4065-99c5-c9d4b9fc6bf8.jpg',sixTop:'https://p9.itc.cn/images03/20210119/7fd589e6c9394f798904561b693a70c7.jpeg',sixAnnex:'https://p0.itc.cn/images03/20210119/945be4bdf52b4bf8a3747b4ef05119ca.jpeg'};
const official='https://www.xixianxinqu.gov.cn/xwzx/xcdt/1836229489188204546.html',archaeology='https://www.sohu.com/a/445410925_120244154',project='https://www.thepaper.cn/newsDetail_forward_30995090';
function affine3(src,dst){const [a,b,c]=src,[A,B,C]=dst,det=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);return p=>{const u=((p[0]-a[0])*(c[1]-a[1])-(p[1]-a[1])*(c[0]-a[0]))/det,v=((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]))/det;return [A[0]+u*(B[0]-A[0])+v*(C[0]-A[0]),A[1]+u*(B[1]-A[1])+v*(C[1]-A[1])];};}
const westOrigin=[108.85535,34.41472],westScale=40/110;
const western=p=>[+(westOrigin[0]+(p[0]-262)*westScale/(111320*Math.cos(westOrigin[1]*rad))).toFixed(8),+(westOrigin[1]-(p[1]-375)*westScale/111320).toFixed(8)];
const projectTies={pixels:[[348,171],[580,116],[638,399]],coordinates:[[108.861166,34.4170604],[108.863555,34.417489],[108.8640097,34.4145715]]};
const sixProjectMerc=affine3(projectTies.pixels,projectTies.coordinates.map(merc)),sixProject=p=>geo(sixProjectMerc(p));
// These four corners identify the same pre-existing dark rectangular ground
// feature in the published vertical aerial and the older satellite image.
const topTies={pixels:[[149,179],[197,167],[231,269],[174,284]],satellitePixels:[[1358,467],[1381,460],[1395,514],[1372,520]]};
const sat={xmin:12117349.211829415,ymin:4084365.48118646,xmax:12118907.68470052,ymax:4085231.2994481856,width:1800,height:1000};
const satMerc=([x,y])=>[sat.xmin+x*(sat.xmax-sat.xmin)/sat.width,sat.ymax-y*(sat.ymax-sat.ymin)/sat.height];
function similarity(a,b){const mean=ps=>[0,1].map(k=>ps.reduce((s,p)=>s+p[k],0)/ps.length),ma=mean(a),mb=mean(b);let aa=0,bb=0,den=0;for(let i=0;i<a.length;i++){const x=a[i][0]-ma[0],y=a[i][1]-ma[1],u=b[i][0]-mb[0],v=b[i][1]-mb[1];aa+=x*u+y*v;bb+=x*v-y*u;den+=x*x+y*y;}aa/=den;bb/=den;return {scale:Math.hypot(aa,bb),map:p=>[mb[0]+aa*(p[0]-ma[0])-bb*(p[1]-ma[1]),mb[1]+bb*(p[0]-ma[0])+aa*(p[1]-ma[1])]};}
const topSimilarity=similarity(topTies.pixels,topTies.satellitePixels),sixTop=p=>geo(satMerc(topSimilarity.map(p)));
const courtPixels=[[134,126],[278,100],[328,321],[146,368]],area=ps=>Math.abs(ps.reduce((s,p,i)=>{const q=ps[(i+1)%ps.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2);
const annexScale=Math.sqrt(1000/area(courtPixels)),annexOrigin=sixProject([430,205]);
const sixAnnex=p=>[+(annexOrigin[0]+(p[0]-211)*annexScale/(111320*Math.cos(annexOrigin[1]*rad))).toFixed(8),+(annexOrigin[1]-(p[1]-254)*annexScale/111320).toFixed(8)];
const transforms={western,sixProject,sixTop,sixAnnex},traces=[],features=[];
const siteKey='ancient-site:咸阳:34.32960,108.70930';
function add(id,name,enName,source,type,pixels,extra={}){
 const tf=transforms[source],multi=type==='MultiLineString',cs=multi?pixels.map(line=>line.map(tf)):pixels.map(tf),isPoint=type==='Point';
 const coords=isPoint?cs[0]:type==='Polygon'?[cs.concat(JSON.stringify(cs[0])===JSON.stringify(cs.at(-1))?[]:[cs[0]])]:cs;
 const ps=multi?cs.flat():cs,labelCoordinates=extra.labelPixels?tf(extra.labelPixels):isPoint?cs[0]:[0,1].map(k=>ps.reduce((s,p)=>s+p[k],0)/ps.length);
 const archaeologySource=source==='sixTop'||source==='sixAnnex';
 const sourceNote=source==='western'?'按2025年一、二、三、五号宫殿保护展示图转绘可辨遗址位置，以40米图示比例尺和博物馆位置定位；图中现代展示设计与秦代原始遗存不等同。':source==='sixTop'?'依陕西省考古研究院发掘成果报道的带北向、20米比例尺垂直航拍转绘；仅画可辨考古标线及遗迹。':source==='sixAnnex'?'依陕西省考古研究院成果航拍转绘F1—F4等已揭露部分；当地理位置缺乏独立控制点，采用约1000平方米庭院尺寸和展示总图相对位置作概略定位，内部相对格局比绝对坐标可靠，非实测配准精度。':'按2025年六号宫殿及殿前古道路展示方案转绘遗址所在段；不将现代展厅、广场或游客连廊作为秦代建筑。';
 const props={research:true,city:'咸阳',family:'qin-xianyang-palace',period:'秦汉',periods:['秦汉','周'],capitalSiteKey:siteKey,capitalSiteName:'咸阳',qinXianyangHistoricalDetail:true,qinComponentDetail:true,sourceId:'qin-detail-'+id,sourceName:name,label:name,enSourceName:enName,enLabel:enName,sourceUrl:'./sources/qin-xianyang.html#details',referenceUrl:archaeologySource?archaeology:project,sourceImage:sourceURLs[source],sourceTitle:'宫殿群、发掘图与定位依据',status:archaeologySource?'考古航拍转绘 · 地理位置为图示参考':'遗址展示图位置参考 · 不作实测墙界',enStatus:archaeologySource?'Archaeological image transcription; approximate map placement':'Site positions from a display plan, not surveyed walls',note:sourceNote,enNote:'Source-based image transcription with approximate geographic placement. Archaeological remains, surveyed-but-unexcavated areas and modern display designs are distinguished in the linked source notes; no independent survey accuracy is claimed.',inferredBoundary:true,sourceDiagramLine:archaeologySource,sitePoint:false,fillOpacity:type==='Polygon'?.04:0,lineOpacity:.85,lineWidth:1.1,labelMinZoom:16,labelCoordinates,calibrationAudit:'docs/qin-xianyang-palace-details.json',...extra};
 props.sourceUrl=archaeologySource?archaeology:project;
 props.sourceTitle=archaeologySource?'文汇报（2021）：秦咸阳城考古发现':'文物陕西／澎湃新闻（2025）：咸阳宫遗址公园保护展示方案';
 props.referenceUrl=sourceURLs[source];props.referenceTitle='原始图：'+({western:'一、二、三、五号宫殿展示工程图',sixProject:'六号宫殿展示工程图',sixTop:'六号宫殿发掘航拍及墙基标注',sixAnnex:'六号宫殿西北附属建筑F1—F4发掘航拍'}[source]);
 props.calibrationUrl='./sources/qin-xianyang.html#details';
 delete props.labelPixels;if(extra.note)props.note=sourceNote+' '+extra.note;
 props.periodNotes={'周':'作为战国秦国至秦代宫区的综合遗迹参照，不表示所有构件均已在前221年建成。'};
 if(id.startsWith('six-annex-')&&!name.startsWith('六号'))props.sourceName='六号宫殿附属区·'+name;
 features.push({type:'Feature',properties:props,geometry:{type,coordinates:coords}});traces.push({id:props.sourceId,source,type,pixels});
}
add('palace-1','一号宫殿（已揭露西部）','Palace 1, excavated western part','western','Polygon',[[640,432],[773,413],[786,500],[650,519]],{qinComponentDetail:false,labelMinZoom:14,sourceDiagramLine:false,note:'只表达展示图中西部遗址；官方资料记载整组东西179米，不将这里的小范围当作179米全殿。已发现凌阴冷藏窖，但缺乏可辨窖址坐标，不另造窖址点。'});
add('palace-2','二号宫殿（已揭露部分）','Palace 2, excavated part','western','Polygon',[[311,351],[441,332],[455,422],[324,441]],{qinComponentDetail:false,labelMinZoom:14,sourceDiagramLine:false,note:'位于一号西北；图示只是已揭露与展示部分，不代表文献所述整组建筑范围。'});
add('palace-3','三号宫殿（已揭露部分）','Palace 3, excavated part','western','Polygon',[[426,558],[565,539],[563,526],[610,519],[614,540],[636,536],[653,636],[632,640],[634,654],[451,680],[447,663],[429,667],[411,585],[426,580]],{qinComponentDetail:false,labelMinZoom:14,sourceDiagramLine:false,note:'官方资料记载三号在一号西南近百米，建造稍晚，保存有壁画；已揭露部分与未明确的勘探部分分开理解。'});
add('palace-5-survey','五号宫殿（勘探范围参考）','Palace 5, survey reference','western','Polygon',[[448,201],[686,177],[710,340],[478,368]],{qinComponentDetail:false,labelMinZoom:14,fillOpacity:0,lineOpacity:.65,note:'地表以下的勘探遗址，现状为农耕地或林地；边线为展示图概略范围，不作已发掘房间或宫墙。'});
add('palace-3-gallery','三号宫殿壁画廊位置参考','Palace 3 mural gallery reference','western','LineString',[[620,553],[635,632]],{labelMinZoom:16.5,note:'依第三号遗址出土壁画廊位于东侧的考古记载，在展示图东侧廊段标示地望；没有转绘完整壁画墙面或将展示铺装当作原墙。'});
add('six-platform','六号宫殿夯土台基分布','Palace 6 rammed-earth platform','sixTop','Polygon',[[149,355],[514,267],[569,534],[201,594]],{qinComponentDetail:false,labelMinZoom:14.5,fillOpacity:.055,note:'边线来自航拍明确标注的夯土台基分布，不是以144×145米概括尺寸套画正方形。'});
add('six-north-wall','六号宫殿北墙','Palace 6 north wall','sixTop','MultiLineString',[[[0,228],[497,112]],[[0,247],[500,134]]],{labelMinZoom:16,labelPixels:[407,136],note:'照片左侧墙线出框，保持开放，不补全北墙。'});
add('six-cross-wall','六号宫殿隔墙夯土基础','Palace 6 dividing-wall foundations','sixTop','MultiLineString',[[[0,294],[503,163]],[[0,314],[505,183]]],{labelMinZoom:16,labelPixels:[414,196],note:'五米左右的东西向分隔夯墙是南、北区分界；只取图上可辨标线。'});
add('six-high-platform-walls','六号高台已揭露墙基','Exposed walls on the elevated platform','sixTop','MultiLineString',[[[267,343],[289,455],[371,438]],[[293,455],[313,534],[370,519]],[[211,488],[269,474]],[[322,492],[367,480]]],{labelMinZoom:17,label:'',enLabel:'',note:'据航拍可辨墙基分段转绘，未清楚显示的房间和台阶不补齐。'});
add('six-annex-court','六号宫殿西北附属建筑·庭院','Palace 6 northwest annex courtyard','sixAnnex','Point',[[211,254]],{qinComponentDetail:false,labelMinZoom:15,sitePoint:false,note:'庭院约1000平方米是公布的考古概括数据，不把本图的示意面积当作测量结果；西侧尚有待发掘区，不绘虚构闭合院墙。'});
add('six-annex-walls','附属建筑北墙、东墙及庭院分界','Annex north/east walls and courtyard division','sixAnnex','MultiLineString',[[[63,107],[403,22]],[[498,46],[587,520]],[[77,414],[418,329],[352,49]],[[142,563],[492,477]]],{label:'',enLabel:'',note:'保留航拍图中断续墙线，不把西侧待发掘区强补为完整四合院。'});
const rooms=[['F1',[[205,88],[237,76],[242,102],[209,113]]],['F2',[[241,80],[285,68],[291,96],[246,106]]],['F3-1',[[279,100],[325,87],[336,134],[290,146]]],['F3-2',[[293,152],[338,140],[347,169],[301,182]]],['F3-3',[[302,185],[349,173],[358,205],[311,217]]],['F3-4',[[312,220],[360,207],[371,248],[321,260]]],['F3-5',[[324,264],[372,252],[383,293],[335,305]]],['F3-6',[[326,309],[374,296],[385,326],[337,338]]],['F3-7',[[287,329],[325,319],[333,346],[295,356]]]];
for(const [name,ps]of rooms)add('six-annex-'+name.toLowerCase(),name,'Annex '+name,'sixAnnex','LineString',ps.slice(0,3),{labelMinZoom:17,lineWidth:.9,note:'保留发掘图编号及可辨墙段；没有据此补成完整房间。'});
add('six-annex-f3-8','F3-8·密集础石区','F3-8 column-base area','sixAnnex','Point',[[194,350]],{labelMinZoom:17,note:'公开资料记载密集础石为南北6排、东西13列。本图只标区位，不生成规则网格冒充逐个础石实测位置。'});
add('six-annex-f3-9','F3-9','Annex F3-9','sixAnnex','LineString',[[113,379],[143,369],[155,403]],{labelMinZoom:17,note:'仅画可辨墙段，未接回出土不清的一侧。'});
add('six-annex-f4','F4·曲尺形夯土基础','F4 L-shaped rammed-earth foundation','sixAnnex','Point',[[336,487]],{labelMinZoom:16.5});
add('six-annex-f4-1','F4-1','Annex F4-1','sixAnnex','LineString',[[382,75],[471,51],[491,142],[399,166]],{labelMinZoom:17,note:'只保留照片可辨的建筑与铺地边缘，不把白色图注线解释为所有原墙。'});
for(const [name,pt]of [['F4-2',[528,392]],['F4-3',[568,509]],['F4-4',[487,513]]])add('six-annex-'+name.toLowerCase(),name,'Annex '+name,'sixAnnex','Point',[pt],{labelMinZoom:17,note:'可核对的发掘编号位置参照，未取得清晰墙界，因此不补矩形房间。'});
add('six-annex-brick-drains','附属建筑砖铺通道','Brick-paved passages in the annex','sixAnnex','MultiLineString',[[[378,77],[398,163]],[[487,43],[510,141]]],{labelMinZoom:17,labelPixels:[442,100]});
add('six-annex-pipe','附属建筑陶水管道','Annex ceramic drain reference','sixAnnex','Point',[[182,410]],{labelMinZoom:17,note:'照片标注只支持该位置，未延长管道走向。'});
add('six-ramp','六号宫殿秦代踏道地段','Qin ramp/stairway segment, Palace 6','sixProject','MultiLineString',[[[490,343],[506,422]],[[511,339],[529,419]]],{qinComponentDetail:false,labelMinZoom:15.5,labelPixels:[501,389],note:'踏道地段有考古依据，线位取展示方案。现代登临电梯、展厅与殿前广场不绘为古代建筑。'});
add('six-southern-road','六号宫殿殿前古道路展示段','Ancient avenue display segment south of Palace 6','sixProject','MultiLineString',[[[561,664],[603,854]],[[583,657],[627,848]]],{qinComponentDetail:false,labelMinZoom:14.5,labelPixels:[588,755],note:'仅画方案中明确的古道路标识展示段；与北部踏道之间标为“未明遗址区连接段”的现代连接段不画作已探明秦道路，也不包括现代入口广场。'});
const conciseLabels={'palace-1':['一号宫殿·西部','Palace 1 (west)'],'palace-2':['二号宫殿','Palace 2'],'palace-3':['三号宫殿','Palace 3'],'palace-5-survey':['五号宫殿·勘探范围','Palace 5 (survey)'],'palace-3-gallery':['壁画廊地望','Mural gallery reference'],'six-platform':['六号宫殿夯土台基','Palace 6 platform'],'six-north-wall':['六号宫殿北墙','Palace 6 north wall'],'six-cross-wall':['隔墙夯土基础','Dividing-wall foundations'],'six-annex-court':['西北附属建筑·庭院','Northwest annex courtyard'],'six-annex-f4':['F4·夯土基础','F4 foundation'],'six-annex-brick-drains':['砖铺通道','Brick-paved passages'],'six-annex-pipe':['陶水管道','Ceramic drain'],'six-ramp':['秦代踏道地段','Qin ramp segment'],'six-southern-road':['殿前古道路展示段','Ancient avenue display segment']};
for(const f of features){const l=conciseLabels[f.properties.sourceId.replace('qin-detail-','')];if(l)[f.properties.label,f.properties.enLabel]=l;}
// Source-image detail is not necessarily georeferenced detail. Preserve the
// transcriptions for inspection, but do not draw room walls from an area-only
// scale estimate and a guessed origin on the geographic map.
const deferred=features.filter(f=>f.properties.sourceId.startsWith('qin-detail-six-annex-')&&f.properties.sourceId!=='qin-detail-six-annex-court');
const displayed=features.filter(f=>!deferred.includes(f));
d.unlocatedSourceDetails=deferred.map(f=>({sourceId:f.properties.sourceId,name:f.properties.sourceName,sourceArticle:'https://www.sxdaily.com.cn/2021-01/17/content_8850744.html',sourceImage:sourceURLs.sixAnnex,reason:'缺乏独立共同控制点；面积估算和展示方案原点不足以定位房间墙线。仅保留原图像素转绘，不发布旧估算地理坐标。',trace:traces.find(t=>t.id===f.properties.sourceId)}));
for(const f of displayed){
 f.properties.sourceDiagramLine=false;
 if(f.properties.sourceId==='qin-detail-six-annex-court')Object.assign(f.properties,{sourceName:'六号宫殿西北附属区（地望待核）',label:'西北附属区·地望待核',sourceUrl:'https://www.sxdaily.com.cn/2021-01/17/content_8850744.html',sourceTitle:'三秦都市报（2021）：秦咸阳城遗址北区布局渐露“真容”',status:'区域地望参考；F1—F4细部未完成地理配准',note:'庭院约1000平方米有原文依据，但概括面积不能代替影像比例尺和地面控制点。F1—F4编号与墙线只在原始发掘航拍中查看；旧估算细线已撤下。该点不表示庭院实测中心。'});
 if(f.properties.sourceId==='qin-detail-palace-5-survey'){
  f.geometry={type:'Point',coordinates:f.properties.labelCoordinates};
  Object.assign(f.properties,{label:'五号宫殿·地望参考',sourceName:'五号宫殿地望（展示方案参考）',note:'官方证实位于一号宫殿北侧、地表以下。展示方案着色区不能直接当作已勘探遗址边界，故撤下旧矩形范围，仅保留概略地望。'});
 }
}
d.features=d.features.filter(f=>!f.properties.sourceId.startsWith('qin-detail-')).concat(displayed);
const precinct=d.features.find(f=>f.properties.sourceId==='qin-xianyang-palace-core-2021');Object.assign(precinct.properties,{sourceName:'秦咸阳宫殿群范围（总图参考）',label:'秦咸阳宫殿群',labelMinZoom:12,fillOpacity:0,lineOpacity:.38});
const east=d.features.find(f=>f.properties.sourceId==='qin-xianyang-eastern-protection-2021');east.properties.lineOpacity=.3;
Object.assign(d.displayCorrections['osm-way-1263385448'].properties,{fillOpacity:0,lineOpacity:.35});
d.displayCorrections['osm-way-1236884831']={properties:{sourceName:'六号宫殿遗址区（OSM概略标绘）',label:'',fillOpacity:0,lineOpacity:.25,note:'保留原始OSM遗址区几何作概略位置参照；该多边形明显大于单座高台基址，不将它称为六号宫殿实测建筑外墙。内部另以发掘航拍与展示图分绘夯土台基、北墙、隔墙、西北附属建筑及道路。'}};
const inventory=[{number:1,status:'已绘已揭露西部；不冒充东西179米全殿',source:official},{number:2,status:'已绘已揭露部分',source:official},{number:3,status:'已绘已揭露部分与壁画廊地望',source:official},{number:4,status:'2004年考古报告第五章第四节（第567页）确有记录；公开预览仅目录，未取得正文位置图，未落点',source:'https://www.ecsponline.com/goods.php?id=95373'},{number:5,status:'已绘勘探范围参考；不作已发掘房间',source:official},{number:6,status:'已绘台基、墙基、北墙、隔墙、附属区F1—F4和古道路/踏道地段',source:archaeology},{name:'其他编号宫殿及刘家沟建筑',status:'官方称已发现7处宫殿；现有资料不足以逐一对应其他编号，刘家沟建筑不擅自等同七号。地方志目录线索另有一至十三号，但未取得原文核验，不生成坐标。',source:official}];
const audit={checkedDate:'2026-10-23',sourceURLs,sourceArticles:{official,archaeology,project,museum:'https://www.bmy.com.cn/jingtai/ptx/public/pages/unity-talkOut.html',report:'https://www.ecsponline.com/yz/B99EEE6B7579A4D02A12B6F1EB8E5DA2D000.pdf'},transforms:{western:{originPixel:[262,375],originCoordinate:westOrigin,metresPerPixel:westScale,method:'展示图40米比例尺与OSM博物馆地望，北向按图；非独立实测控制'},sixProject:{...projectTies,method:'展示图遗址区轮廓三个对应点，采用OSM原区域作仿射地望参照；不是古建筑实测控制'},sixTop:{...topTies,satelliteExtent:sat,method:'同一地表矩形地物四角的相似变换，来源20米比例尺辅助检查；控制点集中，不能推为全区地面精度',sourceGroundScaleReference:20/62,satellitePixelsPerSourcePixel:topSimilarity.scale},sixAnnex:{originPixel:[211,254],originCoordinate:annexOrigin,courtAreaReferenceM2:1000,courtPixels,approximateMetresPerPixel:annexScale,method:'约1000平方米庭院概括面积约束图像比例，工程总图约束附属区相对位置；低置信地理定位，不当作测量成果'}},inventory,traces,excluded:[{name:'航拍蓝框汉代房址',reason:'后期遗迹，不绘为秦代宫殿房间'},{name:'六号踏道与古道路之间“未明遗址区连接段”',reason:'没有连续秦道路考古依据，不把现代连接线画成古道路'},{name:'现代展厅、电梯、停车场、入口广场',reason:'展示设计，非秦建筑'},{name:'规则础石网格',reason:'不以排数和列数生成假实测点'},{name:'待发掘区西墙、四号及其他编号坐标',reason:'位置或墙界不足，不补绘'}],limitations:'所有新增几何均为图示参考；摄影、展示方案和概略地望存在不同精度，不以视觉复杂度或测试通过替代考古测绘。'};
audit.satelliteReview={checkedDate:'2026-10-23',provider:'Google Satellite',tileTemplate:'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',coordinateGrid:'WGS84; no GCJ shift applied to Google satellite',scenes:['western','six','annex','road'],evidence:'output/qin-google-browser.json',result:'实际加载Google卫星并目视查看叠图，六号台基地表位置大体对应；西部已揭露范围及附属房间仍为近似定位。影像年代和可见地表覆盖不足以独立验证地下墙线，未据此声称测量级配准。'};
audit.geographicReview={checkedDate:'2026-10-23',deferredGeographicFeatures:deferred.map(f=>f.properties.sourceId),reason:'庭院面积有三秦都市报原文依据，但不是影像比例尺。无独立控制点的房间地理细线撤下，原图像素转绘保留。',newPrimarySource:'https://www.sxdaily.com.cn/2021-01/17/content_8850744.html',protectionComplete:false};audit.transforms.sixAnnex.withdrawnFromGeographicMap=true;
inventory.find(x=>x.number===6).status='台基和墙线保留虚线参考；附属区仅保留概略地望，F1—F4细部见发掘原图，旧估算地理细线撤下';inventory.find(x=>x.number===5).status='仅保留北侧概略地望；撤下展示方案着色矩形冒充勘探范围的表达';
d.researchInventory=inventory;
fs.writeFileSync(output,JSON.stringify(d,null,2)+'\n');fs.writeFileSync('docs/qin-xianyang-palace-details.json',JSON.stringify(audit,null,2)+'\n');console.log('Qin palace displayed details: '+displayed.length+'; source-only details: '+deferred.length);
