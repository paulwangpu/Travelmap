const fs=require('fs');
require('../ethnic-regions.js');
global.document={querySelector:()=>({addEventListener(){}})};
EthnicRegions.init({state:()=>({mapOverlays:{languageColorMode:'affinity'}}),language:()=> 'zh'});
const d=JSON.parse(fs.readFileSync('data/language-areas.geojson'));
function csv(text){const rows=[];let row=[],value='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(value.replace(/\r$/,''));value='';if(c==='\n'){rows.push(row);row=[];}}else value+=c;}return rows;}
const nodes=new Map(csv(fs.readFileSync('output/glottolog-languages.csv','utf8')).slice(1).map(r=>[r[0],r[1]]));
const levels=new Map(csv(fs.readFileSync('output/glottolog-languages.csv','utf8')).slice(1).map(r=>[r[0],r[7]]));
const labels=new Map(JSON.parse(fs.readFileSync('output/wikidata-language-zh.json')).results.bindings.map(r=>[r.code.value,r.label.value]));
const simplified=require('../output/opencc-t2cn.cjs').Converter({from:'tw',to:'cn'});
const overrides={sini1245:'汉语族',burm1265:'缅羌语支',bodi1256:'藏语群',germ1287:'日耳曼语族',indo1320:'印度—伊朗语族',balt1263:'波罗的—斯拉夫语族',ital1284:'意大利语族',roma1334:'罗曼语族',celt1248:'凯尔特语族',mala1545:'马来—波利尼西亚语族',kare1337:'克伦语支',kuki1245:'库基—钦语支',hima1249:'喜马拉雅语群'};
const nodeName=id=>overrides[id]||(labels.has(id)?simplified(labels.get(id)):nodes.get(id)||id);
const families=EthnicRegions.legendGroups(d,'affinity');
const byId=new Map(d.features.map(f=>[f.properties.languageId,f.properties]));
function partition(members,depth){
 const groups=new Map();for(const m of members){const path=byId.get(m.id).kinPath||[];const id=path[depth]||'unassigned';if(!groups.has(id))groups.set(id,[]);groups.get(id).push(m);}
 if(groups.size===1 && !groups.has('unassigned') && members.some(m=>(byId.get(m.id).kinPath||[]).length>depth+1))return partition(members,depth+1);
 const branches=new Map();for(const [id,items] of groups){const key=levels.get(id)==='family'?id:'unassigned';if(!branches.has(key))branches.set(key,[]);branches.get(key).push(...items);}return [...branches].map(([id,items])=>({id,title:id==='unassigned'?'其他／未细分':nodeName(id),original:id==='unassigned'?'Other / unassigned':nodes.get(id)||id,members:items}));
}
const mainBranches={
 'Hmong-Mien':[['hmon1337','苗语族'],['mien1242','瑶语族']],
 'Tungusic':[['manc1250','满语—锡伯语群'],['nort3417','北部通古斯语群'],['orok1264','赫哲—乌尔奇语群']],
 'Indo-European':[['germ1287','日耳曼语族'],['roma1334','罗曼语族'],['indo1321','印度—雅利安语族'],['slav1255','斯拉夫语族'],['iran1269','伊朗语族'],['gree1276','希腊语族'],['celt1248','凯尔特语族']],
 'Sino-Tibetan':[['sini1245','汉语族'],['burm1265','缅羌语群'],['bodi1256','藏语及相关语言'],['kare1337','克伦语支']],
 'Afro-Asiatic':[['semi1276','闪米特语族'],['chad1250','乍得语族'],['cush1243','库希特语族'],['berb1260','柏柏尔语族']],
 'Austronesian':[['mala1545','马来—波利尼西亚语族']],
 'Dravidian':[['sout3133','南部达罗毗荼语族'],['nort2698','北部达罗毗荼语族']],
 'Turkic':[['oghu1243','乌古斯语支'],['karl1236','葛逻禄语支'],['kipc1239','钦察语支']],
 'Tai-Kadai':[['kamt1241','侗台语族'],['kada1291','仡央语族']],
 'Mongolic-Khitan':[['mong1329','蒙古语族']],
 'Uralic':[['finn1317','芬兰语支'],['hung1287','匈牙利语支'],['sami1281','萨米语支'],['perm1256','彼尔姆语支']],
 'Japonic':[['japa1256','日本语']],
 'Koreanic':[['kore1280','朝鲜语']]
};
const sections=families.map(f=>{
 const selected=mainBranches[f.key];let columns;
 if(selected){const groups=new Map();for(const m of f.members){const path=byId.get(m.id).kinPath||[];const pair=selected.find(([id])=>path.includes(id));const id=pair?pair[0]:'unassigned';if(!groups.has(id))groups.set(id,{id,title:pair?pair[1]:'其他分支',original:pair?nodes.get(id)||id:'Other branches',members:[]});groups.get(id).members.push(m);}columns=[...groups.values()];}
 else {const all=partition(f.members,1).sort((a,b)=>b.members.length-a.members.length);columns=all.slice(0,3);const rest=all.slice(3);if(rest.length)columns.push({id:'other-branches',title:'其他分支',original:'Other branches',members:rest.flatMap(c=>c.members)});}
 if(selected){const rank=new Map(selected.map(([id],i)=>[id,i]));columns.sort((a,b)=>(rank.get(a.id)??999)-(rank.get(b.id)??999));}
 else columns.sort((a,b)=>Number(a.id==='unassigned'||a.id==='other-branches')-Number(b.id==='unassigned'||b.id==='other-branches')||b.members.length-a.members.length);
 return {...f,columns};
});
for(const f of sections){const sorted=f.columns;sorted.forEach((c,index)=>{for(const m of c.members){const p=byId.get(m.id);p.colorBranchIndex=index;p.colorBranchCount=sorted.length;p.colorBranchId=c.id;p.colorBranchName=c.title;m.color=EthnicRegions.color(p,'affinity');}});}
fs.writeFileSync('data/language-areas.geojson',JSON.stringify(d));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const width=1600,pad=36,gap=20,cardWidth=367;
function orderedColors(c){return c.members.map(m=>m.color).sort((a,b)=>parseFloat(a.slice(4))-parseFloat(b.slice(4)));}
function makeSvg(items,title){let y=130,body='',defs='',serial=0;const columnY=[130,130,130,130];
 for(const f of items){const i=columnY.indexOf(Math.min(...columnY)),height=f.columns.length*35+80;y=columnY[i];const x=pad+i*(cardWidth+gap);body+=`<rect x="${x}" y="${y}" width="${cardWidth}" height="${height}" rx="12" fill="white" stroke="#dbe4e9"/><text x="${x+16}" y="${y+29}" class="family">${esc(f.nameZh)}</text><text x="${x+16}" y="${y+48}" class="sub">${esc(f.nameEn)}</text>`;
 f.columns.forEach((c,j)=>{const py=y+76+j*35,id='g'+serial++,colors=orderedColors(c);const sample=colors.filter((_,i)=>i===0||i===colors.length-1||i%Math.max(1,Math.floor(colors.length/8))===0);defs+=`<linearGradient id="${id}">${sample.map((color,k)=>`<stop offset="${sample.length===1?0:k/(sample.length-1)*100}%" stop-color="${color}"/>`).join('')}</linearGradient>`;const name=c.title.length>22?c.title.slice(0,21)+'…':c.title;
 body+=`<g><title>${esc(c.title+' / '+c.original)}</title><rect x="${x+16}" y="${py-13}" width="48" height="18" rx="3" fill="url(#${id})"/><text x="${x+76}" y="${py}" class="branch">${esc(name)}</text></g>`;});columnY[i]+=height+gap;
 }
 y=Math.max(...columnY)+58;return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y}" viewBox="0 0 ${width} ${y}"><defs>${defs}</defs><style>text{font-family:'Microsoft YaHei','Noto Sans CJK SC',sans-serif;fill:#243744}.family{font-size:18px;font-weight:700}.branch{font-size:13px}.sub{font-size:11px;fill:#748796}</style><rect width="100%" height="100%" fill="#f3f6f8"/><text x="36" y="50" font-size="28" font-weight="700">${esc(title)}</text><text x="36" y="80" font-size="14">详列主要语系与语族；同语系固定色相，主要语族优先排列，颜色由深到浅，其余语系合并到其他。</text><text x="36" y="103" class="sub">语言学分类层级并非统一等级；颜色表示亲缘分类，不代表互通程度。灰色：未分类或特殊类别。</text>${body}<text x="36" y="${y-26}" class="sub">Asher &amp; Moseley (2007) / Glottography v2.0 · Glottolog 分类 · CC BY 4.0；Wikidata CC0。</text></svg>`;}
const majorNames=['Sino-Tibetan','Indo-European','Austronesian','Afro-Asiatic','Atlantic-Congo','Dravidian','Turkic','Austroasiatic','Tai-Kadai','Hmong-Mien','Uralic','Mongolic-Khitan','Tungusic'];
const major=majorNames.map(key=>sections.find(f=>f.key===key)).filter(Boolean);
const rest=sections.filter(f=>!majorNames.includes(f.key));
const others={key:'other',nameZh:'其他语系',nameEn:'Other families · '+rest.length,columns:[{title:'其余语系与特殊类别',original:'Grouped in this legend',members:rest.flatMap(f=>f.members)}]};
const display=[...major,others];
fs.mkdirSync('outputs/language-legend',{recursive:true});
fs.writeFileSync('outputs/language-legend/full-legend.svg',makeSvg(display,'世界语言亲缘配色 · 主要语系与语族'));
fs.writeFileSync('outputs/language-legend/overview.svg',makeSvg(display,'世界语言亲缘配色 · 主要语系与语族'));
function card(f){return `<section><h2><label><input class="family-check" type="checkbox" data-key="${esc(f.key)}" checked /> ${esc(f.nameZh)}</label></h2><small class="original">${esc(f.nameEn)}</small>${f.columns.map(c=>{const colors=orderedColors(c);return `<div class="branch" title="${esc(c.original)}"><i style="background:linear-gradient(90deg,${colors.join(',')})"></i><span>${esc(c.title)}<small>${esc(c.original)}</small></span></div>`}).join('')}</section>`;}
fs.writeFileSync('outputs/language-legend/index.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>语言亲缘配色 · 语族图例</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f6f8;color:#243744;font:14px 'Microsoft YaHei',sans-serif}header{padding:26px 32px}h1{margin:0 0 10px;font-size:26px}p{margin:8px 0;line-height:1.6;color:#596f7e}a{color:#176b52}input[type=search]{padding:9px;width:300px;max-width:100%;margin-top:12px;border:1px solid #cbd8df;border-radius:6px}main{padding:0 32px 28px}.cards{columns:4 260px;column-gap:18px}section{break-inside:avoid;background:white;border:1px solid #dbe4e9;border-radius:12px;padding:18px;margin-bottom:18px}input[type=checkbox]{width:14px;height:14px;margin:0 5px 0 0;accent-color:#176b52}h2{font-size:18px;margin:0 0 4px}small{font-size:11px;color:#748796}.original{display:block;margin-bottom:16px}.branch{display:flex;align-items:center;gap:12px;margin:12px 0;line-height:1.4}.branch i{width:48px;height:18px;border-radius:3px;flex-shrink:0}.branch span{overflow-wrap:anywhere}.branch small{display:block}summary{cursor:pointer;padding:16px 0;font-size:17px;font-weight:bold}footer{padding:10px 32px 28px;color:#748796;font-size:12px}[hidden]{display:none!important}</style><header><h1>语言亲缘配色 · 语族图例</h1><p>主要语系详细显示语族，其他小语系合并；同语族用一条色带展示地图实际配色。</p><p>分类层级并非统一等级；颜色不代表互通程度。灰色：未分类或特殊类别。</p><a href="full-legend.svg" download>下载完整 SVG</a> · <a href="overview.png">下载概览 PNG</a><br><label><input id="selectAll" type="checkbox" checked /> 全选</label><br><input id="search" type="search" placeholder="搜索语系或语族" aria-label="搜索语系或语族"></header><main><div class="cards">${display.map(card).join('')}</div></main><footer>13 个主要语系列出主要语族，次要分支和小语系合并显示。Asher &amp; Moseley (2007) / Glottography v2.0 · Glottolog 分类 · CC BY 4.0；Wikidata CC0。</footer><script>
const checks=[...document.querySelectorAll('.family-check')],all=document.querySelector('#selectAll');
const saved=JSON.parse(localStorage.getItem('language-legend-hidden-families')||'[]');checks.forEach(c=>c.checked=!saved.includes(c.dataset.key));
function update(){const q=document.querySelector('#search').value.toLowerCase().trim();all.checked=checks.every(c=>c.checked);all.indeterminate=!all.checked&&checks.some(c=>c.checked);document.querySelectorAll('section').forEach(s=>{const family=(s.querySelector('h2').textContent+' '+s.querySelector('.original').textContent).toLowerCase().includes(q),checked=s.querySelector('.family-check').checked;let match=false;s.querySelectorAll('.branch').forEach(r=>{const hit=family||r.textContent.toLowerCase().includes(q);match||=hit;r.hidden=!checked||!hit});s.hidden=!match;s.style.opacity=checked?'1':'.55'});localStorage.setItem('language-legend-hidden-families',JSON.stringify(checks.filter(c=>!c.checked).map(c=>c.dataset.key)));}
checks.forEach(c=>c.onchange=update);all.onchange=()=>{checks.forEach(c=>c.checked=all.checked);update()};document.querySelector('#search').oninput=update;update();
</script></html>`);
console.log('Generated compact legend:',sections.length,'families;',sections.reduce((n,f)=>n+f.columns.length,0),'branches; no individual language rows');
