const fs=require('fs');
function simplify(ring){
 const keep=new Set([0,ring.length-1]), stack=[[0,ring.length-1]];
 while(stack.length){const [a,b]=stack.pop(); const p=ring[a],q=ring[b], dx=q[0]-p[0],dy=q[1]-p[1],len=dx*dx+dy*dy;let max=0,index=-1;
 for(let i=a+1;i<b;i++){const r=ring[i],t=len?Math.max(0,Math.min(1,((r[0]-p[0])*dx+(r[1]-p[1])*dy)/len)):0;const dist=(r[0]-p[0]-t*dx)**2+(r[1]-p[1]-t*dy)**2;if(dist>max){max=dist;index=i;}}
 if(max>0.005**2){keep.add(index);stack.push([a,index],[index,b]);}}
 let out=[...keep].sort((a,b)=>a-b).map(i=>ring[i].map(v=>Math.round(v*1e5)/1e5));
 if(out.length<4)out=ring.map(p=>p.map(v=>Math.round(v*1e5)/1e5));return out;
}
const d=JSON.parse(fs.readFileSync('data/language-areas.geojson'));
const source=JSON.parse(fs.readFileSync('output/language-families-source.geojson'));
const ids={hmon1336:['Hmong-Mien','苗瑶语系'],tung1282:['Tungusic','通古斯语系']};
const additions=source.features.filter(f=>ids[f.properties['cldf:languageReference']]).map((f,i)=>{const id=f.properties['cldf:languageReference'],[family,familyZh]=ids[id];return {type:'Feature',properties:{dataset:'language',entryKind:'family-area',group_:family+' family area',nameZh:familyZh+'范围',family,familyZh,languageId:id,gwgroupid:'family:'+id,kinPath:[id],kinPosition:0.5,nameZhNote:'这是原地图集标注的语系整体范围，未细分具体语言；可与单个语言区域重叠。'},geometry:{type:f.geometry.type,coordinates:f.geometry.type==='Polygon'?f.geometry.coordinates.map(simplify):f.geometry.coordinates.map(p=>p.map(simplify))}};});
if(additions.length!==2)throw Error('Expected two family areas');
d.features=[...additions,...d.features.filter(f=>!ids[f.properties.languageId])];
fs.writeFileSync('data/language-areas.geojson',JSON.stringify(d));
console.log('Added',additions.length,'family areas; total',d.features.length);
