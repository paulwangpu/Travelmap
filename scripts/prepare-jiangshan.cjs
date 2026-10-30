/* Run upstream scripts/export_geojson.js first; do not evaluate upstream code in the app. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const input='output/jiangshan-upstream',out='data/jiangshan',repo='https://github.com/DeanChensj/jiangshan-map';
fs.mkdirSync(out+'/snapshots',{recursive:true});
const index=JSON.parse(fs.readFileSync(input+'/geojson/index.json','utf8'));
const periods=index.dynasties.flatMap(d=>d.phases.map(p=>({...p,dynasty:d.title,dynastyEn:d.title_en||d.title,file:out+'/'+p.file})));
let total=0;
for(const file of new Set(periods.map(p=>p.file))){
 const raw=JSON.parse(fs.readFileSync(input+'/geojson/'+file.slice(out.length+1),'utf8'));
 const features=raw.features.filter(f=>['region','prefecture'].includes(f.properties.layer)).map((f,i)=>{
  const p=f.properties,b=f.bbox||raw.bbox,small=b&&(b[2]-b[0])*(b[3]-b[1])<.08;
  return {...f,id:raw.name+'-'+i,properties:{id:raw.name+'-'+i,sourceId:raw.name+'-'+i,nameZh:p.title,nameRoman:p.title_en||p.title,typeZh:p.category||p.layer,level:p.layer==='region'?'province':'prefecture',sourceLevel:p.layer,labelCoordinates:p.anchor,labelMinZoom:small?8:p.layer==='region'?4:5,sourceBasis:raw.note||raw.caption||'',originalLayer:p.layer,jiangshan:true}};
 });
 const counts=Object.fromEntries(['province','prefecture'].map(level=>[level,features.filter(f=>f.properties.level===level).length]));
 for(const p of periods.filter(p=>p.file===file))p.counts=counts;
 fs.writeFileSync(file,JSON.stringify({type:'FeatureCollection',name:raw.name,features})+'\n');total+=features.length;
}
const manifest={name:'江山时序 · 历史行政区划',source:repo,sourceReadme:repo+'/blob/main/README_ZH.md',importedAt:'2026-10-28',crs:'EPSG:4326',minYear:-403,maxYear:1948,yearZero:false,license:'GPL-3.0; CHGIS/Hartwell-derived data retain their academic, non-commercial terms',precision:'Historical administrative boundaries are schematic approximations, not survey-grade boundaries.',periods,files:[...new Set(periods.map(p=>p.file))],sourceHashes:Object.fromEntries(['map_data.js','china_geo_data.js','atlas_snapshots.js','i18n_dict.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(input+'/js/'+f)).digest('hex')]))};
fs.writeFileSync(out+'/catalog.json',JSON.stringify(manifest,null,2)+'\n');
fs.copyFileSync(input+'/LICENSE',out+'/LICENSE');fs.copyFileSync(input+'/README_ZH.md',out+'/UPSTREAM_README.md');
fs.writeFileSync(out+'/NOTICE.md',`# 江山时序行政区划\n\n来源：[DeanChensj/jiangshan-map](${repo})，作者 DeanChensj。使用上游官方 GeoJSON 导出器，保留一级政区与州郡两层，未导入政权、水系、道路和现代省界。\n\n负数为公元前，无公元0年。各分期表示上游编绘采用的示意快照，并非逐年考证的辖区存续日期；部分阶段复用政区几何。上游原始注记、标签位置和英文名保留。\n\nGPL-3.0 全文见 LICENSE；CHGIS V6 / Hartwell 衍生数据按上游说明保留原始学术、非商业使用条款，不统一改标 GPL。来源声明见 UPSTREAM_README.md。历史边界为示意近似，不能用于精确定位或测绘。\n\n生成脚本：scripts/prepare-jiangshan.cjs；输入 SHA-256 见 catalog.json。\n`);
console.log(JSON.stringify({phases:periods.length,snapshots:manifest.files.length,featuresAcrossSnapshots:total}));
