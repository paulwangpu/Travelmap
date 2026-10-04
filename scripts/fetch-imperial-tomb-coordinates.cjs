// Wikipedia resolves names only; coordinates and Earth datum are Wikidata P625 claims.
const fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'..','data','imperial-tombs');
const c=JSON.parse(fs.readFileSync(path.join(dir,'catalog.json'),'utf8'));
const alternate={
 'wu-jiang':['蒋陵','孙权墓','梅花山 (南京)'], 'shu-hui':['惠陵 (蜀汉)','惠陵'], 'ming-jingtai':['景泰陵'], 'legend-shaohao':['少昊陵'], 'han-chan':['禅陵'], 'chu-yi':['义帝陵'], 'zhou-song':['嵩陵'], 'zhou-qing':['庆陵 (后周)'], 'zhou-shun':['顺陵 (后周)'], 'zhou-later':['后周皇陵'],
 'legend-huangdi':['黄帝陵 (黄陵县)','黄帝陵'], 'legend-yandi':['炎帝陵'], 'legend-taihao':['太昊陵庙'],
 'legend-shun-yuncheng':['舜帝陵 (运城市)','舜帝陵 (运城)'], 'legend-shun-ningyuan':['舜帝陵 (宁远县)','舜帝陵 (宁远)'],
 'qin-gong-1':['秦公一号大墓'], 'han-ba':['汉霸陵'], 'sui-tai':['泰陵 (隋朝)'], 'sui-yang':['隋炀帝墓'],
 'shu-yong':['永陵 (前蜀)','成都永陵'], 'nantang-qin':['钦陵'], 'nantang-shun':['顺陵 (南唐)'],
 'nanhan-de':['德陵 (南汉)'], 'nanhan-kang':['康陵 (南汉)'], 'yuan-genghis':['成吉思汗陵'],
 'yin-kings':['殷墟王陵遗址'], 'zhongshan-cuo':['中山王墓'], 'jin-group':['金陵 (金朝)','金朝皇陵'],
 'chu-wuwangdun':['武王墩墓'], 'song6':['宋六陵'], 'song8':['宋陵'],
 'song-an':['永安陵 (宋朝)'], 'song-chang':['永昌陵'], 'song-xi':['永熙陵'], 'song-ding':['永定陵'],
 'song-zhao':['永昭陵'], 'song-hou':['永厚陵'], 'song-yu':['永裕陵'], 'song-tai':['永泰陵'],
 'song-si':['永思陵'], 'song-fu':['永阜陵'], 'song-chong':['永崇陵'], 'song-mao':['永茂陵'], 'song-mu':['永穆陵'], 'song-shao':['永绍陵'],
 'liang-jian':['建陵 (南梁)'], 'zhou-xiao':['孝陵 (北周)'], 'southern-danyang':['丹阳南朝陵墓石刻']
};
async function get(api,params){const u=new URL(api);u.search=new URLSearchParams({...params,format:'json'});const r=await fetch(u,{headers:{'User-Agent':'TravelMapResearch/1.0 (personal historical map)'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`HTTP ${r.status}`);const d=await r.json();if(d.error)throw new Error(d.error.info);return d;}
async function main(){
 const selectedIds=process.argv.slice(2);
 const eligible=c.items.filter(x=>(!selectedIds.length||selectedIds.includes(x.id))&&!/^xixia-\d+$/.test(x.id)&&x.id!=='mangshan'&&x.parentId!=='mangshan');
 const titles=[...new Set(eligible.flatMap(x=>[x.name,...(x.aliases||[]),...(alternate[x.id]||[])]))],index=new Map();
 for(let i=0;i<titles.length;i+=40){
  const batch=titles.slice(i,i+40),d=await get('https://zh.wikipedia.org/w/api.php',{action:'query',titles:batch.join('|'),prop:'pageprops',ppprop:'wikibase_item',redirects:'1',converttitles:'1'});
  const aliases=new Map([...(d.query?.normalized||[]),...(d.query?.converted||[]),...(d.query?.redirects||[])].map(x=>[x.from,x.to]));
  const pages=new Map(Object.values(d.query?.pages||{}).map(x=>[x.title,x]));
  for(const title of batch){let resolved=title;const seen=new Set();while(aliases.has(resolved)&&!seen.has(resolved)){seen.add(resolved);resolved=aliases.get(resolved);}const p=pages.get(resolved);if(p?.pageprops?.wikibase_item)index.set(title,{q:p.pageprops.wikibase_item,title:p.title});}
 }
 const entities={},ids=[...new Set([...index.values()].map(x=>x.q))];
 for(let i=0;i<ids.length;i+=40){const d=await get('https://www.wikidata.org/w/api.php',{action:'wbgetentities',ids:ids.slice(i,i+40).join('|'),props:'claims|labels|descriptions',languages:'zh|zh-hans|zh-hant|en'});Object.assign(entities,d.entities);}
 const result={researchedAt:'2026-10-03',provider:'Wikidata P625 (batch entity retrieval)',matches:[],unmatched:[],errors:[]};
 for(const item of eligible){
  const candidates=[item.name,...(item.aliases||[]),...(alternate[item.id]||[])].map(name=>index.get(name)).filter(Boolean);let match;
  for(const candidate of candidates){const e=entities[candidate.q];if(!e)continue;
   const claims=(e.claims?.P625||[]).filter(x=>x.rank!=='deprecated'&&x.mainsnak?.snaktype==='value'&&x.mainsnak.datavalue?.value?.globe==='http://www.wikidata.org/entity/Q2');
   const preferred=claims.filter(x=>x.rank==='preferred'),selected=preferred.length?preferred:claims;
   if(selected.length!==1)continue;const claim=selected[0],v=claim.mainsnak.datavalue.value;
   if(!(v.latitude>18&&v.latitude<54&&v.longitude>73&&v.longitude<135))continue;
   match={id:item.id,entity:candidate.q,label:candidate.title,description:e.descriptions?.zh?.value||e.descriptions?.en?.value||'',statementId:claim.id,rank:claim.rank,lat:v.latitude,lng:v.longitude,precisionDegrees:v.precision,globe:v.globe,references:claim.references||[],retrievedAt:result.researchedAt,target:item.recordType==='group'?'陵群代表点':'遗址代表点（非入口）',reviewStatus:'indexed_name_match_pending_review'};break;
  }
  if(match)result.matches.push(match);else result.unmatched.push({id:item.id,name:item.name,entityCandidates:candidates});
 }
 if(selectedIds.length){const previous=JSON.parse(fs.readFileSync(path.join(dir,'coordinate-research.json'),'utf8'));result.matches.push(...previous.matches.filter(x=>!selectedIds.includes(x.id)));result.unmatched.push(...previous.unmatched.filter(x=>!selectedIds.includes(x.id)));}
 else for(const x of c.items.filter(x=>!eligible.includes(x)))result.unmatched.push({id:x.id,reason:'Historical-to-physical correspondence needs archaeological verification.'});
 result.matches.sort((a,b)=>a.id.localeCompare(b.id));fs.writeFileSync(path.join(dir,'coordinate-research.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({matches:result.matches.length,unmatched:result.unmatched.length,errors:result.errors.length}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
