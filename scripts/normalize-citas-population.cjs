// Run after prepare-citas-population.py. Original names remain available for audit.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const converter=process.argv[2]||path.join(root,'output/opencc-t2cn.cjs');
const simplify=require(path.resolve(converter)).Converter({from:'tw',to:'cn'});
const file=path.join(root,'output/chgis-research/derived/census-1990.geojson');
const data=JSON.parse(fs.readFileSync(file,'utf8'));
let changed=0;
for(const f of data.features){const p=f.properties;
  for(const key of ['nameZh','parentZh','parent']){
    const original=key+'Original';p[original]??=p[key];p[key]=simplify(p[original]||'');
  }
  if(p.nameZh!==p.nameZhOriginal)changed++;
  p.nameDisplayScript='Simplified Chinese (OpenCC tw-to-cn); original name retained';
}
fs.writeFileSync(file,JSON.stringify(data)+'\n');
const catalogPath=path.join(root,'data/history-boundaries/catalog.json');
const catalog=JSON.parse(fs.readFileSync(catalogPath,'utf8'));
for(const [from,level,typeZh] of [['upper','province','省级'],['prefecture','prefecture','地市级'],['county','county','县级']]){
  const features=data.features.filter(f=>f.properties.level===from).map(f=>{
    const p=f.properties;return {type:'Feature',id:p.id,geometry:f.geometry,properties:{sourceId:p.populationSourceId,nameZh:p.nameZh,nameZhOriginal:p.nameZhOriginal,nameRoman:p.name,parentZh:p.parentZh,parentZhOriginal:p.parentZhOriginal,start:1990,end:1990,typeZh,labelCoordinates:p.labelCoordinates,labelMinZoom:p.labelMinZoom,areaKm2:p.areaKm2}};
  });
  const target=`output/chgis-research/derived/1990-${level}.geojson`;
  fs.writeFileSync(path.join(root,target),JSON.stringify({type:'FeatureCollection',features})+'\n');
  const layer={id:`1990-${level}`,name:`1990年普查${typeZh}边界`,kind:'area',level,source:'https://doi.org/10.7910/DVN/T27RQO',snapshot:1990,interval:null,file:target,count:features.length};
  catalog.layers=catalog.layers.filter(l=>l.id!==layer.id);catalog.layers.push(layer);
}
catalog.maxYear=1990;catalog.timeSeriesMaxYear=1911;
catalog.notice='Partial coverage; time series ends in 1911. Snapshots (including 1990 census boundaries) apply only to their exact year. Local use only, not for redistribution.';
fs.writeFileSync(catalogPath,JSON.stringify(catalog,null,2)+'\n');
const periodPath=path.join(root,'data/historical-admin/census-1990.json'),period=JSON.parse(fs.readFileSync(periodPath));
period.nameScript='Simplified Chinese; original source names retained';
fs.writeFileSync(periodPath,JSON.stringify(period,null,2)+'\n');
console.log(JSON.stringify({features:data.features.length,simplifiedNames:changed,historySnapshots:['1990-province','1990-prefecture','1990-county']}));
