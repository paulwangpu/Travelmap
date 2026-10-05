module.exports=({add,source})=>{
 const vm=require('node:vm'),fs=require('node:fs'),app=fs.readFileSync(require.resolve('../app.js'),'utf8'),ctx={};
 vm.createContext(ctx);vm.runInContext(app.slice(app.indexOf('function isCoordinateInChina('),app.indexOf('function pathDisplayGeometry(')),ctx);
 const [lng,lat]=ctx.gcjToWgs(109.526053,34.972611);
 source('tang-hui-amap','唐惠陵博物馆实体点B0HA1KCLP9','高德地图','https://www.amap.com/place/B0HA1KCLP9','GCJ-02：109.526053,34.972611；地址金十路与三五路交叉口北340米，与三合村原址博物馆互核。');
 source('tang-hui-amap-datum','高德地图坐标基准说明','高德开放平台','https://developer.amap.com/faq/advisory/others/39838','明确高德服务采用GCJ-02，转换后写入WGS84。');
 source('tang-hui-national','第七批全国重点文物保护单位：唐惠陵','国务院','https://www.gov.cn/guoqing/2014-07/21/dqpqgzdwwbhdwmd.pdf','7-0675-2-159，唐，陕西省蒲城县；区别清同治帝惠陵。');
 source('tang-hui-operator','唐惠陵博物馆开馆及原地宫参观','华山风景名胜区／华山旅游集团运营方报道','https://www.sohu.com/a/168566269_155446','2017年8月30日开馆，明确走入地宫甬道；墓主为追谥让皇帝李宪及恭皇后元氏。');
 source('tang-hui-excavation','唐李宪墓考古发掘报告书摘','陕西省考古研究机构／科学出版社','https://www.ecsponline.com/yz/B312F9F851B214C9488CF4D3EBEAD0174000.pdf','发掘报告目录书摘；完整报告需持续复核。');
 source('tang-hui-map','唐惠陵地理索引及文保名称互核','国保地图（地理索引，非墓主认定依据）','https://guobao.org/zh/china/shaanxi/','拒绝旧点109.581486,34.956901：落在县城附近，与原址博物馆相差约5公里；保留作为错误地理索引审查记录，不用于定位。');
 const x=add('tang-hui-rang','唐让帝惠陵','隋唐','唐','唐让帝李宪（追谥）、恭皇后元氏','陕西省渭南市蒲城县桥陵镇三合村','tang-hui-national,tang-hui-operator,tang-hui-excavation,tang-hui-map,tang-hui-amap,tang-hui-amap-datum',{aliases:['唐惠陵','让皇帝陵','李宪墓','李成器墓','宁王李宪墓'],nature:'posthumous',rulerCategory:'posthumous_emperor',recognition:'archaeological',evidence:'原址墓葬已抢救性发掘，运营方记为李宪与元氏合葬墓；李宪死后追谥让皇帝，并非生前在位皇帝。',disputes:['属于桥陵陪葬体系，但追谥皇帝陵作为独立实体记录，不以桥陵坐标替代。','与清东陵同治帝惠陵同名异陵，不能合并。'],reviewTasks:['补核墓道入口实测坐标及当前开放公告']});
 x.coordinates={lat:Number(lat.toFixed(6)),lng:Number(lng.toFixed(6)),crs:'WGS84',status:'verified_wgs84',sourceId:'tang-hui-amap',sourceRecordId:'B0HA1KCLP9',target:'唐惠陵博物馆实体点（原址展示区）',original:'GCJ-02：109.526053,34.972611',method:'按高德官方基准说明，使用项目迭代反解将GCJ-02转换为WGS84；核对原址博物馆名称和地址',sourceDatumExplicit:true,precision:{sourceUnit:'degree',resolutionDegrees:0.000001,horizontalAccuracyMeters:null},limitation:'博物馆POI点，非测绘地宫中心或墓道入口；平台未提供测量误差。'};
 x.locationReview={reviewedAt:'2026-10-05',status:'located',reason:'改用高德原址博物馆实体点；旧国保地理索引落在县城附近，已拒绝。',nextStep:'补核墓道入口实测位置及当前开放公告',sourceIds:['tang-hui-amap','tang-hui-amap-datum','tang-hui-map']};
 x.mapEligible=true;x.mapReason='唐惠陵博物馆原址展示区实体点';
};
