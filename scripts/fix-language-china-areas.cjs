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
const source=JSON.parse(fs.readFileSync('output/language-features-source.geojson'));
const nanai=d.features.find(f=>f.properties.languageId==='nana1257');
const polygons=nanai.geometry.type==='Polygon'?[nanai.geometry.coordinates]:nanai.geometry.coordinates;
nanai.geometry={type:'MultiPolygon',coordinates:polygons.filter(p=>p[0].some(c=>c[1]>40))};
nanai.properties.geometryNote='已剔除原数据中位于云南北部、与赫哲语实际分布不符的孤立区域；未将其猜测归入其他语言。';
const groups=[
 {id:'atlas-miao',ids:['3829','3830'],en:'Miao language group areas',zh:'苗语群范围',branch:'hmon1337'},
 {id:'atlas-yao',ids:['6589','6591'],en:'Yao language group areas',zh:'瑶语群范围',branch:'mien1242'}
];
const additions=groups.map(g=>{
 const features=source.features.filter(f=>g.ids.includes(String(f.properties.id)));
 if(features.length!==g.ids.length)throw Error('Missing source features for '+g.id);
 return {type:'Feature',properties:{dataset:'language',entryKind:'language-group-area',languageId:g.id,glottocode:g.branch,gwgroupid:g.id,group_:g.en,nameZh:g.zh,family:'Hmong-Mien',familyZh:'苗瑶语系',kinPath:['hmon1336',g.branch],sourceFeatureIds:g.ids,nameZhNote:'原地图集合并标注多种苗语或瑶语，包含云南及东南亚区域；此处表示语言群范围，不能细分为某一种语言。'},geometry:{type:'MultiPolygon',coordinates:features.flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).map(p=>p.map(simplify))}};
});
d.features=[...d.features.filter(f=>!groups.some(g=>g.id===f.properties.languageId)),...additions];
fs.writeFileSync('data/language-areas.geojson',JSON.stringify(d));
console.log('Corrected Nanai; supplemented Miao/Yao source areas:',d.features.length);
