// Reviewed supplements are preserved independently of the discovery fetch.
module.exports=({items,source})=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 // Use the application's existing iterative GCJ-02 inverse, not a second formula.
 const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
 const conversion=app.slice(app.indexOf('function isCoordinateInChina('),app.indexOf('function ',app.indexOf('function gcjToWgs(')+10));
 const ctx={};vm.createContext(ctx);vm.runInContext(conversion,ctx);
 source('geo-hantang-table','西安帝陵空间研究：表4坐标','长安大学等研究团队','https://www.frontiersin.org/journals/ecology-and-evolution/articles/10.3389/fevo.2023.1158563/full','表4原始点来自高德API；方法段的WGS84分析投影不能证明表4已转换。按GCJ-02原始点转换，与已有秦陵、茂陵点位作交叉检查。');
 const rows=[['han-ping',108.644864,34.360372],['han-kang',108.717025,34.396624],['han-yi',108.76939,34.399325],['tang-jing2',108.270794,34.569488],['tang-zhen',108.650549,34.687794],['tang-chong',108.832369,34.701701],['tang-zhuang',109.022902,34.705617],['tang-duan',109.091627,34.695447],['tang-jian2',109.070168,34.893165],['tang-yuan',109.087468,34.873891],['tang-zhang',109.122487,34.880791],['tang-feng',109.207191,34.929528],['tang-jing',109.515651,35.006175],['tang-guang',109.552546,35.032494],['tang-tai',109.673298,35.036945]];
 function set(id,lng,lat,sid,target,original,method,resolution){
  const x=items.find(x=>x.id===id);if(!x)throw Error('Unknown supplement '+id);
  if(x.coordinates)x.coordinateAlternatives=[...(x.coordinateAlternatives||[]),x.coordinates];
  x.coordinates={lat,lng,crs:'WGS84',status:'verified_wgs84',sourceId:sid,target,original,method,verificationScope:'名称、行政区及坐标基准核对；区域参考定位',sourceDatumExplicit:true,precision:{sourceUnit:'degree',resolutionDegrees:resolution,horizontalAccuracyMeters:null},limitation:'区域参考点，未提供实测误差；不作为墓室中心或入口导航。'};
  x.mapEligible=true;x.mapReason='区域参考坐标已核';x.reviewTasks=['补核陵体中心、入口与实测误差',...x.reviewTasks.filter(t=>!t.includes('WGS84'))];
 }
 for(const [id,lng,lat] of rows){const p=ctx.gcjToWgs(lng,lat);set(id,p[0],p[1],'geo-hantang-table','陵址参考点（原高德POI，非墓室）',`${lng}, ${lat}; GCJ-02; Table 4`,'高德API原始坐标采用项目GCJ-02迭代反解为WGS84；表中同名景陵/靖陵按行政区区别',0.000001);}
 for(const [id,way,lng,lat,target] of [
  ['wu-jiang',791617219,118.8353,32.056,'梅花山传统陵址区域参考点（非已确认墓室）'],
  ['shu-hui',1203841496,104.04581,30.64769,'惠陵大门参考点（非封土中心）'],
  ['legend-huangdi',549391815,109.26969,35.58508,'桥山祭祀陵区域参考点'],
  ['legend-yandi',527139704,113.66691,26.41636,'炎帝陵景区参考点']]){
  const sid='geo-osm-'+way;
  source(sid,'区域坐标：OSM way '+way,'OpenStreetMap地理数据（Mapcarta索引）','https://mapcarta.com/W'+way,'转录索引展示的OSM经纬度；OSM为WGS84，未直接下载原始几何，非测绘成果。');
  set(id,lng,lat,sid,target,`${lat}, ${lng}; OSM way ${way}`,'OSM索引区域点，结合目录机构资料核对地点',0.00001);
 }
 const wu=items.find(x=>x.id==='wu-jiang');wu.mapLabel='孙权墓（蒋陵）';
 require('./supplement-royal-tomb-coordinates.cjs')({items,source,set,gcjToWgs:ctx.gcjToWgs});
 require('./estimate-imperial-tomb-coordinates.cjs')({items,source,set,gcjToWgs:ctx.gcjToWgs});
 require('./supplement-xixia-tomb-coordinates.cjs')({items,source,set});
 source('geo-wu-memorial','东吴大帝孙权纪念馆位置','高德地图','https://www.amap.com/place/B001911OPO','原始GCJ-02坐标：118.839703,32.050204；使用项目迭代反解转换WGS84。');
 const memorial=ctx.gcjToWgs(118.839703,32.050204);
 set('wu-jiang',memorial[0],memorial[1],'geo-wu-memorial','孙权纪念馆位置（非孙权墓室）','118.839703,32.050204; GCJ-02; B001911OPO','高德纪念馆POI按GCJ-02迭代反解为WGS84；按用户要求作为孙权墓参观点',0.000001);
 wu.coordinates.limitation='地图点指向孙权纪念馆，不代表孙权墓室确切位置。';
 wu.mapReason='使用孙权纪念馆作为参观点';wu.reviewTasks=['补核纪念馆入口与实测精度'];
 wu.disputes.push('地图使用孙权纪念馆位置作为参观点；孙权墓室确切位置尚未确认。');
 items.find(x=>x.id==='tang-jian').reviewTasks.push('论文表4此行英文仅为Mausoleums，未明确对应建陵；须补独立坐标来源，暂不入图。');
};
