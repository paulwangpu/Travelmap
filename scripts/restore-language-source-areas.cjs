const fs=require('fs');
function simplify(ring){
 const keep=new Set([0,ring.length-1]), stack=[[0,ring.length-1]];
 while(stack.length){const [a,b]=stack.pop(); const p=ring[a],q=ring[b], dx=q[0]-p[0],dy=q[1]-p[1],len=dx*dx+dy*dy;let max=0,index=-1;
 for(let i=a+1;i<b;i++){const r=ring[i],t=len?Math.max(0,Math.min(1,((r[0]-p[0])*dx+(r[1]-p[1])*dy)/len)):0;const dist=(r[0]-p[0]-t*dx)**2+(r[1]-p[1]-t*dy)**2;if(dist>max){max=dist;index=i;}}
 if(max>0.005**2){keep.add(index);stack.push([a,index],[index,b]);}}
 let out=[...keep].sort((a,b)=>a-b).map(i=>ring[i].map(v=>Math.round(v*1e5)/1e5));
 if(out.length<4)out=ring.map(p=>p.map(v=>Math.round(v*1e5)/1e5));return out;
}


function csv(text){const rows=[];let row=[],value='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(value.replace(/\r$/,''));value='';if(c==='\n'){rows.push(row);row=[];}}else value+=c;}return rows;}
const nodes=new Map(csv(fs.readFileSync('output/glottolog-languages.csv','utf8')).slice(1).map(r=>[r[0],{name:r[1],level:r[7],languageParent:r[10]}]));
const paths=new Map();
for(const match of fs.readFileSync('output/glottolog-classification.nex','utf8').matchAll(/tree\s+(\w+)\s*=\s*\[&R\]\s*([^;]+);/g)){
 const tokens=match[2].match(/[(),]|[a-z]{4}\d{4}|:[\d.]+/g);let index=0;
 function parse(){const children=[];if(tokens[index]==='('){index++;do{children.push(parse());if(tokens[index]!==',')break;index++;}while(true);if(tokens[index++]!==')')throw Error('Invalid tree');}const id=tokens[index++];if(tokens[index]?.startsWith(':'))index++;return {id,children};}
 function walk(n,path){const next=[...path,n.id];paths.set(n.id,next);n.children.forEach(c=>walk(c,next));}walk(parse(),[]);
}
const d=JSON.parse(fs.readFileSync('data/language-areas.geojson'));
d.features=d.features.filter(f=>!f.properties.restoredSource);
const source=JSON.parse(fs.readFileSync('output/language-features-source.geojson'));
const ids=new Set(d.features.map(f=>f.properties.languageId)),done=new Set(d.features.flatMap(f=>f.properties.sourceFeatureIds||[]));
const familyByRoot=new Map(d.features.filter(f=>f.properties.kinPath?.length).map(f=>[f.properties.kinPath[0],{family:f.properties.family,familyZh:f.properties.familyZh}]));
const reviewed=JSON.parse(fs.readFileSync('data/language-zh-overrides.json','utf8'));
const convert=require('../output/opencc-t2cn.cjs').Converter({from:'tw',to:'cn'});
const labels=new Map(JSON.parse(fs.readFileSync('output/wikidata-language-zh.json')).results.bindings.filter(r=>/[\u3400-\u9fff]/.test(r.label.value)).map(r=>[r.code.value,convert(r.label.value)]));
const curated={jiri1239:'蒙古语（科尔沁）',jost1238:'蒙古语（喀喇沁）',taih1244:'吴语（太湖片）',barg1251:'蒙古语（巴尔虎）',joud1238:'蒙古语（巴林）',ejin1238:'蒙古语（额济纳）',shil1261:'蒙古语（乌珠穆沁）',dari1250:'蒙古语（达里冈嘎）',khos1234:'蒙古语（和硕特）',khot1255:'蒙古语（和屯）',zakh1248:'蒙古语（扎哈沁）',makk1244:'莫语',beic1239:'临高语群',kami1255:'侗水语群',jino1236:'基诺语群',pumi1242:'普米语群',ping1245:'平话语群',dulo1243:'独龙语（独龙江方言）',deho1238:'傣那语（德宏）',xina1239:'西南官话',jing1262:'江淮官话',solo1263:'鄂温克语（索伦）',east2344:'康藏语（东部）',nort2707:'康藏语（北部）',sout2714:'康藏语（南部）',west2413:'康藏语（西部）',dbus1238:'藏语（卫）',gtsa1238:'藏语（藏）',ordo1245:'蒙古语（鄂尔多斯）',chah1241:'蒙古语（察哈尔）',baic1239:'白语群',lalo1240:'拉罗语群',nisu1237:'尼苏语群'};
const quarantine=[],groups=new Map();
for(const f of source.features){
 const p=f.properties,sid=String(p.id),ref=sid==='5667'?'taih1244':p['cldf:languageReference'];
 if(ids.has(ref)||done.has(sid))continue;
 if(sid==='2272'){quarantine.push({id:sid,name:p.name,reason:'Source Jin name conflicts with Ching identifier and Guizhou geometry; not reassigned by guess.'});continue;}
 const node=nodes.get(ref),path=paths.get(ref)||(node?.level==='dialect'&&paths.has(node.languageParent)?[...paths.get(node.languageParent),ref]:null);
 const valid=node&&path;
 const id=valid?ref:'atlas-unclassified:'+sid;
 if(!groups.has(id)){
  const family=valid?familyByRoot.get(path[0]):null;
  const localName=/\[Yi\]/.test(p.name)?'彝语变体（'+p.name.replace(/ \[Yi\]/,'')+'）':/\[Hani\]/.test(p.name)?'哈尼语变体（'+p.name.replace(/ \[Hani\]/,'')+'）':null;
  const bySource={'1474':'门巴语（东部）','6785':'哈姆尼干语','6796':'布央语','5124':'德昂语（汝买）'};
  const zh=reviewed[ref]?.zh||curated[ref]||bySource[sid]||labels.get(ref)||localName||p.name;
  groups.set(id,{type:'Feature',properties:{dataset:'language',restoredSource:true,entryKind:valid?(node.level==='dialect'?'dialect-area':'language-group-area'):'unclassified-area',languageId:id,glottocode:valid?ref:null,gwgroupid:id,group_:valid?node.name:p.name,nameZh:zh,family:family?.family||'Unclassifiable',familyZh:family?.familyZh||'尚无法分类',kinPath:valid?path:[],sourceFeatureIds:[],sourceNames:[],nameZhNote:valid?(node.level==='dialect'?'原图集的方言区域；与相关语言区域可能重叠。':'原图集的语言群区域，未细分单个语言；与相关区域可能重叠。'):'原图集记录缺少可核实的分类关联，保留原名和区域，暂不推定语系。'},geometry:{type:'MultiPolygon',coordinates:[]}});
 }
 const target=groups.get(id);target.properties.sourceFeatureIds.push(sid);target.properties.sourceNames.push(p.name);
 target.geometry.coordinates.push(...(f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).map(p=>p.map(simplify)));
}
const additions=[...groups.values()];d.features.push(...additions);fs.writeFileSync('data/language-areas.geojson',JSON.stringify(d));
const report={sourceRecords:source.features.length,addedRecords:additions.reduce((n,f)=>n+f.properties.sourceFeatureIds.length,0),addedAreas:additions.length,counts:{},quarantine,entries:additions.map(f=>f.properties)};
for(const f of additions)report.counts[f.properties.entryKind]=(report.counts[f.properties.entryKind]||0)+1;
fs.writeFileSync('data/language-source-restoration-audit.json',JSON.stringify(report,null,2));console.log({total:d.features.length,addedRecords:report.addedRecords,addedAreas:report.addedAreas,counts:report.counts,quarantine});
