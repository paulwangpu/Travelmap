const fs=require('node:fs');
const H=require('../historical-periods.js');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const catalog=read('data/china-ancient-capitals.json');
const research=read('data/ancient-capital-research-extents.geojson').features;
const walls=read('data/ancient-capital-walls.geojson').features;
const extents=new Map([...research.map(f=>[f.properties.sourceId,f]),...walls.map(f=>['ccwad-'+f.properties.sourceId,f])]);
function inside(p,ring){let result=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])result=!result;}return result;}
function containment(p,g){const polygons=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:null;if(!polygons)return null;return polygons.some(r=>inside(p,r[0])&&!r.slice(1).some(h=>inside(p,h)));}
const errors=[];
for(const record of catalog.recordItems){const owner=catalog.items.find(s=>s.siteKey===record.siteKey);if(!owner||!owner.records.some(r=>r.sourceOrder===record.sourceOrder))errors.push({site:record.name,issue:'记录未归属到正确地点',sourceOrder:record.sourceOrder});}
for(const item of [...catalog.items,...catalog.recordItems])for(const relation of item.boundaryRelations||[]){
 if(relation.id!=='tang-changan-online'&&!extents.has(relation.id))errors.push({site:item.name,issue:'关联范围不存在',id:relation.id});
 if(item.siteName&&relation.period!=='明清'&&relation.period!==H.capitalPeriod(item))errors.push({site:item.name,issue:'关联朝代不符',id:relation.id});
 if(item.siteName&&relation.period==='明清'&&!['明','清'].includes(H.capitalPeriod(item)))errors.push({site:item.name,issue:'非明清记录误关联明清城界',id:relation.id});
 const f=extents.get(relation.id);if(item.siteName&&f?.properties.research&&!(f.properties.periods||[f.properties.period]).includes(H.capitalPeriod(item)))errors.push({site:item.name,issue:'范围无法由本条朝代选项显示',id:relation.id});
}
const sites=catalog.items.map(item=>{
 const relations=item.boundaryRelations||[];
 const point=[item.lng,item.lat];
 const checks=relations.map(r=>({id:r.id,name:r.name,period:r.period,pointInside:extents.has(r.id)?containment(point,extents.get(r.id).geometry):null}));
 return {site:item.name,siteKey:item.siteKey,coordinates:point,periods:H.capitalPeriods(item),relations:checks,status:!relations.length?'未接入对应范围':checks.some(c=>c.pointInside===false)?'区域参照点与部分范围不重合；宫城、保护区或不同朝代不能据此强行合并':'已建立范围对应',note:item.boundaryRelationNote||item.coordinatePrecision||'点位是否落在宫城内不能单独判定古都点错误；需核实点的参照对象。'};
});
const duplicateGeometries=[];const seen=new Map();for(const f of research){const key=JSON.stringify(f.geometry);if(seen.has(key))duplicateGeometries.push({first:seen.get(key),second:f.properties.sourceId,action:'保留并核对类型；同位置不同语义不自动合并'});else seen.set(key,f.properties.sourceId);}
const report={checkedDate:'2026-10-09',scope:{sites:sites.length,records:catalog.recordItems.length,researchExtents:research.length,mingQingRecords:walls.length},errors,duplicateGeometries,sites,limitations:'全量数据对应和几何检查，不等于逐城考古测绘验证。未接入范围、点与部分形状不重合均列出，不自动吸附点位或合并朝代。'};
fs.writeFileSync('docs/capital-boundary-full-audit.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync('docs/capital-boundary-full-audit.md','# 古都与城址范围全量检查\n\n'+`检查 ${sites.length} 个古都地点、${catalog.recordItems.length} 条政权记录、${research.length} 条研究范围及 ${walls.length} 条明清城界记录。\n\n`+'| 古都地点 | 范围对应 | 检查结果 |\n|---|---:|---|\n'+sites.map(s=>`| ${s.site} | ${s.relations.length} | ${s.status} |`).join('\n')+'\n\n'+report.limitations+'\n');
console.log(JSON.stringify({scope:report.scope,errors:errors.length,unlinked:sites.filter(s=>!s.relations.length).length,partialOutside:sites.filter(s=>s.relations.some(r=>r.pointInside===false)).length,duplicateGeometries:duplicateGeometries.length}));
if(errors.length)process.exitCode=1;
