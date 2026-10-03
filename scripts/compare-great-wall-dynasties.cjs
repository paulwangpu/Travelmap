// Whole-dataset audit. Raw tile archive and reference geometries stay in output/.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function periods(text){const out=new Set();for(const part of String(text||'').split(/[、，,～~]/)){if(/战国|春秋/.test(part))out.add('spring-autumn');else if(part==='秦汉'){out.add('qin');out.add('han');}else if(/秦/.test(part))out.add('qin');else if(/汉/.test(part))out.add('han');else if(/北魏|东魏|西魏|北齐|北周/.test(part))out.add('northern-wei');else if(/辽|金/.test(part))out.add('liao-jin');else if(/明/.test(part))out.add('ming');else if(part)out.add('other');}return [...out];}
const names=s=>String(s||'').replace(/[\s·（）()]/g,'').replace(/遗址$/,'');
function pointDistance(a,b){return Math.hypot((a[0]-b[0])*111320*Math.cos(a[1]*Math.PI/180),(a[1]-b[1])*111320);}
function segmentDistance(p,a,b){const k=Math.cos(p[1]*Math.PI/180)*111320,ay=(a[1]-p[1])*111320,ax=(a[0]-p[0])*k,bx=(b[0]-p[0])*k,by=(b[1]-p[1])*111320,t=Math.max(0,Math.min(1,-(ax*(bx-ax)+ay*(by-ay))/((bx-ax)**2+(by-ay)**2||1)));return Math.hypot(ax+t*(bx-ax),ay+t*(by-ay));}
function lines(g){if(g.type==='LineString')return [g.coordinates];if(g.type==='MultiLineString'||g.type==='Polygon')return g.coordinates;if(g.type==='MultiPolygon')return g.coordinates.flat();return [];}
function samples(g){const a=[];for(const line of lines(g))for(let i=1;i<line.length;i++){const from=line[i-1],to=line[i],length=pointDistance(from,to),n=Math.max(1,Math.ceil(length/100));for(let j=0;j<n;j++)a.push({point:[from[0]+(to[0]-from[0])*(j+.5)/n,from[1]+(to[1]-from[1])*(j+.5)/n],weight:length/n});}if(a.length>2500){const stride=Math.ceil(a.length/2500);return a.filter((_,i)=>i%stride===0).map(s=>({...s,weight:s.weight*stride}));}return a;}
function category(p){return ({'352101':'tower','352102':'bastion','352103':'pass','352104':'gateTower','352105':'shelter','352106':'landmark','353201':'beacon','353101':'pass','353102':'fortress'})[p.gwtype]||p._layer;}
function compatible(a,b){return a===b||(['fortress','city','town','guard'].includes(a)&&b==='fortress')||(['beacon','tower'].includes(a)&&['beacon','tower'].includes(b));}
function makeIndex(ref){const points=new Map(),segments=new Map(),cell=.005;const key=(x,y)=>x+','+y;
 const put=(grid,x,y,item)=>{const k=key(x,y);let a=grid.get(k);if(!a)grid.set(k,a=[]);a.push(item);};
 ref.forEach((f,id)=>{if(f.geometry.type==='Point')put(points,Math.floor(f.geometry.coordinates[0]/cell),Math.floor(f.geometry.coordinates[1]/cell),id);else for(const g of f.parts||[f.geometry])for(const line of lines(g))for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];const item={id,a,b};for(let x=Math.floor(Math.min(a[0],b[0])/cell);x<=Math.floor(Math.max(a[0],b[0])/cell);x++)for(let y=Math.floor(Math.min(a[1],b[1])/cell);y<=Math.floor(Math.max(a[1],b[1])/cell);y++)put(segments,x,y,item);}});
 return {near(p,kind){const grid=kind==='Point'?points:segments,x=Math.floor(p[0]/cell),y=Math.floor(p[1]/cell),a=[];for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)a.push(...(grid.get(key(x+dx,y+dy))||[]));return a;}};
}
function compare(data,ref,currentEra){const idx=makeIndex(ref),byCode=new Map(ref.map(f=>[f.id,f])),rows=[];
 const brief=(f,d)=>({code:f.id,name:f.properties.name,dynasty:f.properties.dynasty,periods:periods(f.properties.dynasty),distanceMetres:Math.round(d*10)/10,propertyConflict:!!f.propertyConflict});
 for(const f of data){const p=f.properties,row={id:f.id,name:p.name,source:p.source,geometry:f.geometry.type,currentEra:p.datingCorrection?.batch?p.datingCorrection.previousDisplayEra:currentEra(p),decision:'unmatched',matches:[]};
  const coded=byCode.get(p.source==='great-wall-archive'?p.originalId:'');
  if(coded){const distance=pointDistance(f.geometry.coordinates,coded.geometry.coordinates);row.decision=distance<=100?'identity-match':'identity-position-conflict';row.matches=[brief(coded,distance)];row.confidence='survey-id';}
  else if(f.geometry.type==='Point'){
   const nearby=idx.near(f.geometry.coordinates,'Point').map(id=>({f:ref[id],d:pointDistance(f.geometry.coordinates,ref[id].geometry.coordinates)})).filter(r=>r.d<=300&&compatible(p.category,category(r.f.properties))).sort((a,b)=>a.d-b.d);
   const same=nearby.filter(r=>names(p.name)===names(r.f.properties.name)&&r.d<=100);row.matches=(same.length?same:nearby.slice(0,5)).map(r=>brief(r.f,r.d));if(same.length){row.decision='name-position-match';row.confidence='same-name-compatible-type-within-100m';}else if(nearby.length)row.decision='nearby-review';
  }else{
   const ss=samples(f.geometry),votes={},matched=new Map();let total=0,covered=0,ambiguous=0,close=0;
   for(const sample of ss){total+=sample.weight;let best=Infinity,candidates=[];for(const seg of idx.near(sample.point,'LineString')){const d=segmentDistance(sample.point,seg.a,seg.b);if(d<=75){if(d<best)best=d;candidates.push({id:seg.id,d});}}
    if(best>75)continue;covered+=sample.weight;if(best<=40)close+=sample.weight;
    const candidatesById=new Map(candidates.filter(c=>c.d<=Math.min(75,best+10)).map(c=>[c.id,c]));const eras=new Set();for(const c of candidatesById.values()){const r=ref[c.id];for(const era of periods(r.properties.dynasty))eras.add(era);if(!matched.has(c.id))matched.set(c.id,{f:r,d:c.d});}
    if(eras.size===1){const era=[...eras][0];votes[era]=(votes[era]||0)+sample.weight;}else ambiguous+=sample.weight;
   }
   row.coverage=total?covered/total:0;row.closeCoverage=total?close/total:0;row.ambiguousShare=total?ambiguous/total:0;row.periodShares=Object.fromEntries(Object.entries(votes).map(([k,v])=>[k,total?v/total:0]));row.samples=ss.length;row.matches=[...matched.values()].map(r=>brief(r.f,r.d));if(covered)row.decision='partial-line-review';
   const dominant=Object.entries(row.periodShares).sort((a,b)=>b[1]-a[1])[0];if(p.source!=='wikipedia-kmz'&&dominant&&dominant[1]>=.95&&row.closeCoverage>=.95&&row.ambiguousShare<=.01&&!row.matches.some(r=>r.propertyConflict)){row.decision='line-overlap-match';row.confidence='95%-length-within-40m-single-era';row.suggestedEra=dominant[0];}
  }
  const eras=new Set(row.matches.flatMap(m=>m.periods));if(['identity-match','name-position-match'].includes(row.decision)&&eras.size===1&&!row.matches.some(m=>m.propertyConflict))row.suggestedEra=[...eras][0];
  if(row.matches.length&&(!row.suggestedEra||row.matches.some(m=>m.propertyConflict)))row.uncertain=true;
  // Preserve explicit prior dates as conflicts for review; only defaults can be auto-recolored.
  const explicit=(!!p.datingCorrection&&!p.datingCorrection.batch)||p.source==='arcgis-hammond'||p.source==='wikipedia-kmz'||(p.source==='ovital'&&/汉长城|北齐|北魏|秦长城|战国/.test((p.originalPath||'')+' '+p.name));
  row.eligibleCorrection=!!row.suggestedEra&&row.suggestedEra!==row.currentEra&&(!explicit||row.decision==='identity-match');
  if(row.suggestedEra&&row.suggestedEra!==row.currentEra&&explicit&&row.decision!=='identity-match')row.decision='explicit-dynasty-conflict';
  rows.push(row);if(rows.length%1000===0)console.log('Compared '+rows.length+'/'+data.length);
 }return rows;
}
function main(){const refFile=process.argv[2]||path.join(root,'output/great-wall-audit/reference.geojson'),ref=JSON.parse(fs.readFileSync(refFile)).features,local=JSON.parse(fs.readFileSync(path.join(root,'data/great-wall/features.geojson'))).features,history=JSON.parse(fs.readFileSync(path.join(root,'data/great-wall/history.geojson'))).features,js=fs.readFileSync(path.join(root,'great-wall.js'),'utf8'),c={};vm.createContext(c);vm.runInContext(js.match(/const eras=[^\n]+/)[0]+js.slice(js.indexOf('function detailEra('),js.indexOf('function detailColor(')),c);
 const rows=compare([...local,...history],ref,c.detailEra),summary={referenceRecords:ref.length,localDetailed:local.length,historicalOverview:history.length,compared:rows.length,byDecision:{},corrections:rows.filter(r=>r.eligibleCorrection).length,identityMultiEra:rows.filter(r=>r.decision==='identity-match'&&r.uncertain).length};for(const r of rows)summary.byDecision[r.decision]=(summary.byDecision[r.decision]||0)+1;
 const audit={reviewedAt:'2026-10-02',source:'https://greatwallarchive.com/map',license:'CC BY 4.0',attribution:'Great Wall Archive',method:'Full z18 reference; survey IDs; point name/type/100m; lines 95% length within 40m, <1% ambiguity. Mixed periods and explicit source conflicts require review.',summary,rows};
 fs.writeFileSync(path.join(root,'data/great-wall/dynasty-comparison.json'),JSON.stringify(audit));
 const verified=rows.filter(r=>r.eligibleCorrection||(r.decision==='identity-match'&&r.uncertain&&!r.matches.some(m=>m.propertyConflict))).map(r=>({id:r.id,name:r.name,era:r.suggestedEra||r.currentEra,previousDisplayEra:r.currentEra,mixed:!r.suggestedEra,periods:[...new Set(r.matches.flatMap(m=>m.periods))],dynastyZh:[...new Set(r.matches.map(m=>m.dynasty))].join(' / '),confidence:r.confidence,referenceCodes:r.matches.map(m=>m.code),coverage:r.coverage,closeCoverage:r.closeCoverage,ambiguousShare:r.ambiguousShare}));
 fs.writeFileSync(path.join(root,'data/great-wall/dynasty-verified.json'),JSON.stringify({reviewedAt:audit.reviewedAt,referenceRecords:ref.length,source:audit.source,records:verified},null,2));
 const md=['# 全量长城朝代对比','',`参考 ${ref.length} 条；详细数据 ${local.length} 条 + 历代概览 ${history.length} 条；全部 ${rows.length} 条完成比对。`,'','覆盖到参考记录不等于定年成功；未匹配、局部匹配、多朝重叠、原始年代冲突不自动改色。','', '```json',JSON.stringify(summary,null,2),'```','', '## 可自动更正（默认配色或编号明确）','', '|ID|名称|原显示|建议|依据|','|---|---|---|---|---|'];for(const r of rows.filter(r=>r.eligibleCorrection))md.push(`|${r.id}|${String(r.name).replace(/\|/g,'/')}|${r.currentEra}|${r.suggestedEra}|${r.confidence}|`);md.push('','完整逐条匹配、参考编号和覆盖比例：dynasty-comparison.json。原始参考坐标和252MB数据包只保留在output，不发布。');fs.writeFileSync(path.join(root,'data/great-wall/dynasty-comparison.md'),md.join('\n'));console.log(JSON.stringify(summary,null,2));
}
if(require.main===module)main();module.exports={periods,pointDistance,segmentDistance,samples,compare};
