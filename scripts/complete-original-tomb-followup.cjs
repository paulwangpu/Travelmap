const fs=require('node:fs'),vm=require('node:vm');
// Baidu's 30–45 degree latitude band, not spherical Web Mercator.
// Polynomial provenance: https://gist.github.com/chao-he/7747495
function baiduRegionToWgs(x,y){
 if(y<3481989.83||y>=5591021)throw new RangeError('Unsupported Baidu latitude band');
 const c=[-1.981981304930552e-8,.000008983055099779535,.03278182852591,40.31678527705744,.65659298677277,-4.44255534477492,.85341911805263,.12923347998204,-.04625736007561,4482777.06];
 const lng=c[0]+c[1]*x,t=y/c[9],lat=c.slice(2,9).reduce((s,v,i)=>s+v*t**i,0);
 const a=lng-.0065,b=lat-.006,z=Math.hypot(a,b)-.00002*Math.sin(b*Math.PI*3000/180),theta=Math.atan2(b,a)-.000003*Math.cos(a*Math.PI*3000/180);
 const app=fs.readFileSync(require.resolve('../app.js'),'utf8'),ctx={};vm.createContext(ctx);
 vm.runInContext(app.slice(app.indexOf('function isCoordinateInChina('),app.indexOf('function pathDisplayGeometry(')),ctx);
 return ctx.gcjToWgs(z*Math.cos(theta),z*Math.sin(theta));
}
module.exports=({items,add,source})=>{
 source('bajiaolang-osm','八角郎村地理节点7367680969','OpenStreetMap','https://www.openstreetmap.org/node/7367680969','核对定州村名、行政代码130682001218及WGS84村域代表点38.4900638,114.9526394；非墓室测绘点。');
 source('nandong-nju-visit','历史学院徐州汉文化遗迹现场考察','南京大学历史学院','https://history.nju.edu.cn/01/73/c28502a459123/page.htm','现场考察南洞山，区别北洞山；不作为开放地宫依据。');
 source('nandong-field-2025','徐州市两汉文化研究会段山考察','徐州市两汉文化研究会（江苏之声发布）','https://m.jsrw.cn/h-nd-48762.html','2025年5月实地考察明确湘江路北侧段山南坡、东西两墓及通道；具体楚王归属未定。');
 source('nandong-baidu-region','南洞山汉墓地图区域参考','百度地图','https://j.map.baidu.com/t/SHKzrv','可见地图条目地址为云龙区湘江路南洞山半山腰，UID a4b79793ccd66cb907026f6f；使用17.37级视窗中心作为山坡区域参考，非POI精确坐标。忽略用户评论和开放时间。');
 const point=(x,lat,lng,sid,target,original,method,extent)=>{
  x.coordinates={lat:+lat.toFixed(3),lng:+lng.toFixed(3),crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target,original,method,sourceDatumExplicit:sid==='bajiaolang-osm',precision:{sourceUnit:'degree',resolutionDegrees:.001,horizontalAccuracyMeters:null},limitation:extent+'参考范围；不是墓室中心、入口或实测精度。',estimate:{basis:method,extent,confidence:'regional',reviewedAt:'2026-10-04'}};
  x.mapEligible=true;x.mapReason=target;x.locationReview={reviewedAt:'2026-10-04',status:'regional_estimate_added',reason:target+'；原址文字地望与现代地图已对应，仅取区域参考，墓坑或入口仍待配准',nextStep:'核对原始发掘平面或文保界址，配准墓坑与可达入口',sourceIds:x.sourceIds};x.reviewTasks=[x.locationReview.nextStep];
 };
 const parent=items.find(x=>x.id==='han-zhongshan-dingzhou');
 const liu=add('han-zhongshan-huai','中山怀王刘修墓','秦汉','西汉','中山怀王刘修','河北省定州市八角郎村西南','han-feudal-dingzhou,bajiaolang-osm',{aliases:['刘脩墓','八角廊M40','八角郎M40'],parentId:parent.id,rulerCategory:'feudal_king',scopeBasis:'汉代中山国诸侯王',recognition:'archaeological',evidence:'定州地方文化资料记载八角郎村西南M40，1973年发掘，墓主为五凤三年卒的中山怀王刘修。',periodText:'西汉',chronology:{sortYear:-55,basis:'地方资料所记墓主卒年'},disputes:['村名存在八角郎、八角廊等写法；地图点采用村域参考，不任意偏移成墓室中心。']});
 point(liu,38.4900638,114.9526394,'bajiaolang-osm','八角郎村西南原墓所在区域参考','OSM村节点：38.4900638,114.9526394（WGS84）','原墓资料的村名与现代地理节点一致；取村域代表点，覆盖村西南墓区，不推定具体墓坑','村域及西南周边约1.5公里');
 parent.locationReview.reason='已分别补北庄子刘焉墓、北陵头刘畅墓、八角郎刘修墓区域参考；陵群不连续，不设总中心。三盘山及陵北原墓区仍待配准。';parent.locationReview.nextStep='核对三盘山M120—122及陵北M137地望和墓主，避免使用城内展馆位置';parent.mapReason=parent.locationReview.reason;parent.reviewTasks=[parent.locationReview.nextStep];
 const n=items.find(x=>x.id==='han-chu-nandong');n.sourceIds.push('nandong-nju-visit','nandong-field-2025','nandong-baidu-region');n.admin='江苏省徐州市云龙区湘江路北侧段山南坡';
 const [lng,lat]=baiduRegionToWgs(13051253.602988899,4033737.589820666);
 point(n,lat,lng,'nandong-baidu-region','段山南坡南洞山楚王墓群区域参考','百度BD09MC视窗中心：13051253.602988899,4033737.589820666；17.37级；非精确POI点','现场考察的湘江路北侧段山南坡与地图条目吻合；BD09MC多项式转BD09LL，再转GCJ02并迭代转WGS84；视窗中心仅作区域参考','段山南坡周边约1公里');
 n.disputes.push('具体楚王归属未确定；东侧王墓与西侧合葬王后墓保留一个陵群点，不新增王后记录。');
 const d=items.find(x=>x.id==='han-qi-dawu');d.locationReview.reason=d.locationReview.reason.replace(/。；/g,'；');
};
module.exports.baiduRegionToWgs=baiduRegionToWgs;
