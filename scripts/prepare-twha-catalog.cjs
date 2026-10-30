// Parse original declarative data without running the original application.
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),base=path.join(root,'output/twha-research/original/twha5/js');
const sandbox={};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(base,'regions.js'),'utf8')+';globalThis.regions=region_list;',sandbox,{timeout:5000});
vm.runInContext(fs.readFileSync(path.join(base,'territory.js'),'utf8')+';globalThis.tiles=territory;',sandbox,{timeout:5000});
// Resolve the source's Chinese aliases before conversion. Some Chinese labels
// inherit Japanese spellings (@), while $ means use the English field.
const cc=require(path.resolve(process.argv[2]||path.join(root,'output/opencc-t2cn.cjs')));
const simplify=cc.Converter({from:'tw',to:'cn'}),fromJapanese=cc.Converter({from:'jp',to:'cn'});
let changed=0;
function chinese(row,offset){
  if(row.length<offset+3||row[offset+2]==null)return;
  const raw=row[offset+2],ja=row[offset]==='$'?row[offset+1]:row[offset];
  const value=raw==='@'?fromJapanese(ja||''):raw==='$'?(row[offset+1]||''):raw;
  let converted=value;for(let pass=0;pass<4;pass++){const next=simplify(converted);if(next===converted)break;converted=next;}row[offset+2]=converted;
  if(row[offset+2]!==raw)changed++;
}
for(const region of sandbox.regions)for(const row of region.slice(3)){
  if(row.length===3)chinese(row,0);
  else {chinese(row,3);if(row.length>=9)chinese(row,6);}
}
fs.mkdirSync(path.join(root,'data/twha'),{recursive:true});
fs.writeFileSync(path.join(root,'data/twha/catalog.json'),JSON.stringify({source:'https://x768.sakura.ne.jp/pub/twha.html',minYear:-4000,maxYear:2019,chineseScript:'Simplified Chinese (OpenCC); original archive preserved locally',regions:sandbox.regions,tiles:sandbox.tiles})+'\n');
console.log(`TWHA simplified Chinese catalog prepared: ${changed} fields converted or resolved`);
