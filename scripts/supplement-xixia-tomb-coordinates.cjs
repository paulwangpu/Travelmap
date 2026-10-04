module.exports=({items,source,set})=>{
 // Numbered geographic entities are kept separate from disputed imperial names.
 const points=[
  [1,'W497906293',105.97017,38.39881,'陵园遗址'],
  [2,'W497906294',105.96824,38.40211,'陵体地理实体'],
  [3,'W316192094',105.98718,38.43498,'陵园遗址'],
  [4,'W975528496',105.96286,38.43832,'陵园遗址'],
  [5,'W975528460',105.99194,38.45592,'陵体地理实体'],
  [6,'W975528474',105.98321,38.45517,'陵体地理实体'],
  [7,'W1456113661',105.99477,38.48171,'陵体地理实体（非南侧陵园代表点）'],
  [8,'N9027497884',105.99192,38.48597,'陵体地理实体'],
  [9,'N9027497885',105.99567,38.48528,'陵体地理实体']
 ];
 for(const [n,entity,lng,lat,target] of points){
  const sid='geo-reviewed-xixia-'+n;
  source(sid,'西夏陵'+n+'号陵地理实体','OpenStreetMap地理数据（Mapcarta索引）','https://mapcarta.com/'+entity,'核对编号、银川贺兰山东麓位置及九陵空间分布；WGS84社区数据，不作为墓室测绘成果。');
  const x=items.find(x=>x.id==='xixia-'+n);x.sourceIds.push(sid);
  set(x.id,lng,lat,sid,'西夏陵'+n+'号陵'+target+'区域参考点',`${lat}, ${lng}; OSM ${entity}`,'与官方保护规划的编号体系及南北分布核对；采用独立OSM地理实体，不赋予未经确认的墓主',0.00001);
  x.reviewTasks.push('以申遗测绘图复核单陵范围与点位；编号地理实体不构成墓主认定');
 }
 const sid='geo-reviewed-legend-two';
 source(sid,'颛顼帝喾陵祭祀园区地理实体','OpenStreetMap地理数据（Mapcarta索引）','https://mapcarta.com/W675568721','WGS84园区参考点；不能据地理实体证明传说人物实际埋葬。');
 set('legend-two',114.75434,35.73458,sid,'内黄颛顼帝喾陵祭祀园区参考点','35.73458, 114.75434; OSM way 675568721','核对内黄梁庄镇祭祀陵园位置，保留祭祀纪念陵认定',0.00001);
 for(const parentId of ['nantang2','song6']){
  const p=items.find(x=>x.id===parentId);
  for(const x of items.filter(x=>x.parentId===parentId&&!x.mapEligible)){
   x.locationReference={parentId,status:'shared_region_estimate',target:p.name+'陵区参考位置；单陵位置待核',basis:'机构资料明确所属陵区；参考点只指向陵区，未确认单陵与参考点的距离，不用于单陵导航。'};
   x.mapReason='关联已有陵区位置，不重复生成同坐标单陵点';
  }
 }
};
