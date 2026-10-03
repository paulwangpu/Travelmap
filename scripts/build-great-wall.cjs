/* Build curated local wall snapshot. Usage: node scripts/build-great-wall.cjs source.ovjsn */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const categories = {
  wall: ['墙体', 'Wall'], lost: ['消失走势', 'Lost / approximate'], pass: ['关口', 'Pass'],
  fortress: ['军堡', 'Fortress'], town: ['营城', 'Garrison town'], guard: ['卫所', 'Guard post'],
  city: ['古城', 'Historic city'], tower: ['敌楼', 'Watchtower'], beacon: ['墩台烽燧', 'Beacon'],
  museum: ['博物馆', 'Museum'], landmark: ['其他地标', 'Landmark'], unknown: ['未分类', 'Unclassified'],
};
function category(names, type, featureName = '') {
  for (const name of [...names].reverse()) {
    if (/消失/.test(name)) return 'lost';
    if (/博物馆/.test(name)) return 'museum';
    if (/敌楼|敌台/.test(name)) return 'tower';
    if (/边墩|火路墩|墩台|烽/.test(name)) return 'beacon';
    if (/军堡/.test(name)) return 'fortress';
    if (/关口/.test(name)) return 'pass';
    if (/营城/.test(name)) return 'town';
    if (/卫所|诸卫|七卫/.test(name)) return 'guard';
    if (/古城/.test(name)) return 'city';
    if (/边墙|墙体|汉长城/.test(name)) return 'wall';
    if (/地标|公园/.test(name)) return 'landmark';
  }
  // Prefer curated folder types; use the actual object name when folders only name regions.
  if (/博物馆/.test(featureName)) return 'museum';
  if (/公园/.test(featureName)) return 'landmark';
  if (/敌楼|敌台/.test(featureName)) return 'tower';
  if (/墩|烽燧|烽火台/.test(featureName)) return 'beacon';
  if (/卫城$/.test(featureName)) return 'city';
  if (/卫$|所$/.test(featureName)) return 'guard';
  if (/营$|镇$/.test(featureName)) return 'town';
  if (/长城|边墙/.test(featureName)) return type===7?'landmark':'wall';
  if (/城$/.test(featureName)) return 'city';
  if (type === 8 && (/长城|边墙/.test(featureName) || ['八仙山','八仙山至黄崖关','黄崖关至玻璃台'].includes(featureName))) return 'wall';
  if (/关$|口$|塞$/.test(featureName)) return 'pass';
  if (type === 7 && /长城|山$|顶$/.test(featureName)) return 'landmark';
  return type === 8 && /长城|边墙/.test(names.at(-1) || '') ? 'wall' : 'unknown';
}
function parse(source) {
  const features = []; let folders = 0;
  function visit(items, parents = []) {
    for (const item of items || []) {
      const o = item.Object, d = o.ObjectDetail;
      if (d.ObjChildren) { folders++; visit(d.ObjChildren, [...parents, o.Name]); continue; }
      let geometry;
      if (item.Type === 7) geometry = { type: 'Point', coordinates: [d.Lng, d.Lat] };
      else if ([8, 13].includes(item.Type)) {
        const points = []; for (let i = 0; i < d.Latlng.length; i += 2) points.push([d.Latlng[i + 1], d.Latlng[i]]);
        if (item.Type === 13 && JSON.stringify(points[0]) !== JSON.stringify(points.at(-1))) points.push([...points[0]]);
        geometry = { type: item.Type === 13 ? 'Polygon' : 'LineString', coordinates: item.Type === 13 ? [points] : points };
      } else throw new Error('Unsupported object type ' + item.Type);
      if (d.Gcj02 !== 0) throw new Error('Unexpected GCJ object: ' + o.Name);
      features.push({ type: 'Feature', id: 'ov-' + item.ObjID, properties: { name: o.Name, category: category(parents, item.Type, o.Name), source: 'ovital', originalPath: parents.join('/'), originalId: item.ObjID, comment: o.Comment || '', approximate: parents.some(n => /消失/.test(n)) }, geometry });
    }
  }
  visit(source.ObjItems); return { features, folders };
}
// Spatial segment index: compare distance to segments, not names or vertex count.
function coverage(features) {
  const cells = new Map(), cell = .02;
  const key = (x, y) => x + ':' + y;
  function add(line) {
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1], b = line[i];
      for (let x = Math.floor(Math.min(a[0], b[0]) / cell); x <= Math.floor(Math.max(a[0], b[0]) / cell); x++)
        for (let y = Math.floor(Math.min(a[1], b[1]) / cell); y <= Math.floor(Math.max(a[1], b[1]) / cell); y++) {
          const k = key(x, y); if (!cells.has(k)) cells.set(k, []); cells.get(k).push([a, b]);
        }
    }
  }
  features.filter(f => f.geometry.type === 'LineString' && ['wall', 'lost', 'unknown'].includes(f.properties.category)).forEach(f => add(f.geometry.coordinates));
  function covered(p) {
    const scale = Math.cos(p[1] * Math.PI / 180), cx = Math.floor(p[0] / cell), cy = Math.floor(p[1] / cell);
    for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) for (const [a, b] of cells.get(key(x, y)) || []) {
      const ax = (a[0] - p[0]) * scale * 111320, ay = (a[1] - p[1]) * 111320;
      const bx = (b[0] - p[0]) * scale * 111320, by = (b[1] - p[1]) * 111320;
      const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
      if (Math.hypot(ax + t * dx, ay + t * dy) <= 100) return true;
    }
    return false;
  }
  return { add, covered };
}
async function main() {
  const parsed = parse(JSON.parse(fs.readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, '')));
  const features = [...parsed.features], index = coverage(features), report = { original: parsed.features.length, folders: parsed.folders, sources: [], categories: {} };
  function supplement(lines, source, approximate) {
    let added = 0, omittedEdges = 0;
    for (const f of lines) {
      const c = f.geometry.coordinates; let run = [], part = 0;
      const flush = () => { if (run.length > 1) { features.push({ type: 'Feature', id: `${source}-${f.id ?? added}-${part++}`, properties: { name: f.properties?.name || '长城', category: 'wall', source, approximate, originalId: f.id ?? '', comment: '补充缺失段；未替换原始线路' }, geometry: { type: 'LineString', coordinates: run } }); index.add(run); added++; } run = []; };
      for (let i = 1; i < c.length; i++) {
        const a = c[i - 1], b = c[i], count = Math.max(1, Math.ceil(Math.hypot((b[0] - a[0]) * .78, b[1] - a[1]) * 111320 / 100));
        for (let j = 0; j < count; j++) {
          const p = [a[0] + (b[0] - a[0]) * j / count, a[1] + (b[1] - a[1]) * j / count], q = [a[0] + (b[0] - a[0]) * (j + 1) / count, a[1] + (b[1] - a[1]) * (j + 1) / count];
          if (index.covered(p) && index.covered(q) && index.covered([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2])) { omittedEdges++; flush(); } else { if (!run.length) run.push(p); run.push(q); }
        }
      }
      flush();
    }
    return { added, omittedEdges };
  }
  for (const source of ['greatwall-station', 'public-geojson']) {
    try {
      const url = source === 'greatwall-station' ? 'https://www.ilovegreatwall.cn/public/TheGoogleGreatWall/MingDynastyGreatWall_Songyizhe_V1.0.kmz' : 'https://raw.githubusercontent.com/Adl3rAi/The-Great-Wall-of-China-geodata/main/direction/fulldirection.geojson';
      const r = await fetch(url, { signal: AbortSignal.timeout(30000) }); if (!r.ok) throw new Error('HTTP ' + r.status);
      const incoming = source === 'greatwall-station' ? parseKmz(Buffer.from(await r.arrayBuffer())) : (await r.json()).features.map((f,i)=>({...f,id:i}));
      const lines = incoming.filter(f=>f.geometry.type==='LineString' && (source==='public-geojson'||f.properties.category==='wall'));
      let addedPoints=0;
      for(const f of incoming.filter(f=>f.geometry.type==='Point')) {
        const p=f.geometry.coordinates, category=f.properties.category;
        const duplicate=features.some(g=>g.geometry.type==='Point'&&g.properties.category===category&&Math.hypot((g.geometry.coordinates[0]-p[0])*.78,g.geometry.coordinates[1]-p[1])*111320<100);
        if(!duplicate){features.push({...f,id:`${source}-point-${f.id}`,properties:{...f.properties,source,approximate:true}});addedPoints++;}
      }
      report.sources.push({ source, url, input: incoming.length, wallLines:lines.length, addedPoints, status: 'ok', ...supplement(lines, source, true) });
    } catch (e) { report.sources.push({ source, status: 'unavailable', error: e.message }); }
  }
  for (const f of features) report.categories[f.properties.category] = (report.categories[f.properties.category] || 0) + 1;
  report.total = features.length; report.builtAt = new Date().toISOString(); report.proximityMetres = 100;
  fs.mkdirSync(path.join(__dirname, '../data/great-wall'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '../data/great-wall/features.geojson'), JSON.stringify(require('./apply-great-wall-dynasties.cjs').apply({ type: 'FeatureCollection', features })));
  fs.writeFileSync(path.join(__dirname, '../data/great-wall/report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
function parseKmz(buffer) {
  let end=buffer.length-22;while(end>=Math.max(0,buffer.length-65557)&&buffer.readUInt32LE(end)!==0x06054b50)end--;
  if(end<0)throw new Error('Invalid KMZ');let at=buffer.readUInt32LE(end+16);const files=[];
  for(let i=0;i<buffer.readUInt16LE(end+10);i++){
    if(buffer.readUInt32LE(at)!==0x02014b50)throw new Error('Invalid ZIP directory');
    const method=buffer.readUInt16LE(at+10),size=buffer.readUInt32LE(at+20),n=buffer.readUInt16LE(at+28),extra=buffer.readUInt16LE(at+30),comment=buffer.readUInt16LE(at+32),offset=buffer.readUInt32LE(at+42),name=buffer.toString('utf8',at+46,at+46+n);
    if(/\.kml$/i.test(name)){const start=offset+30+buffer.readUInt16LE(offset+26)+buffer.readUInt16LE(offset+28),compressed=buffer.subarray(start,start+size);files.push((method===8?zlib.inflateRawSync(compressed):compressed).toString('utf8'));}at+=46+n+extra+comment;
  }
  const features=[];
  const decode=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
  for(const xml of files){const root={tag:'root',children:[],text:''},stack=[root];
    for(const match of xml.matchAll(/<!\[CDATA\[([\s\S]*?)\]\]>|<!--[\s\S]*?-->|<([^>]+)>|([^<]+)/g)){
      if(match[1]!==undefined){stack.at(-1).text+=match[1];continue;}if(match[3]){stack.at(-1).text+=decode(match[3]);continue;}const token=match[2];if(!token||/^[!?]/.test(token))continue;if(token.startsWith('/')){stack.pop();continue;}const node={tag:token.split(/[\s/]/)[0].split(':').at(-1),children:[],text:''};stack.at(-1).children.push(node);if(!token.endsWith('/'))stack.push(node);
    }
    const child=(n,tag)=>n.children.find(c=>c.tag===tag),desc=(n,tag)=>n.children.flatMap(c=>[...(c.tag===tag?[c]:[]),...desc(c,tag)]);
    function walk(node,parents=[]){const name=child(node,'name')?.text.trim()||'';if(node.tag==='Placemark'){
      const cat=category(parents,8,name),properties={name,category:cat,originalPath:parents.join('/'),comment:child(node,'description')?.text||''};
      for(const geom of [...desc(node,'Point'),...desc(node,'LineString')]){const text=desc(geom,'coordinates')[0]?.text.trim();if(!text)continue;const coordinates=text.split(/\s+/).map(s=>s.split(',').slice(0,2).map(Number));if(!coordinates.every(p=>p.length===2&&p.every(Number.isFinite)))throw new Error('Invalid station coordinate');features.push({type:'Feature',id:features.length,properties:{...properties},geometry:{type:geom.tag,coordinates:geom.tag==='Point'?coordinates[0]:coordinates}});}
    }else for(const c of node.children)walk(c,node.tag==='Folder'?[...parents,name]:parents);}
    walk(root);
  }return features;
}
function reclassifySnapshot() {
  const file=path.join(__dirname,'../data/great-wall/features.geojson'), reportFile=path.join(__dirname,'../data/great-wall/report.json');
  const data=JSON.parse(fs.readFileSync(file,'utf8')), report=JSON.parse(fs.readFileSync(reportFile,'utf8'));let changed=0;
  for(const f of data.features) {
    if(f.properties.source!=='ovital'&&f.properties.category!=='unknown')continue;
    const next=category((f.properties.originalPath||'').split('/'), f.geometry.type==='Point'?7:f.geometry.type==='Polygon'?13:8, f.properties.name);
    if(next!=='unknown'&&next!==f.properties.category){f.properties.category=next;changed++;}
  }
  report.categories={};for(const f of data.features)report.categories[f.properties.category]=(report.categories[f.properties.category]||0)+1;
  report.classificationUpdatedAt=new Date().toISOString();
  fs.writeFileSync(file,JSON.stringify(data));fs.writeFileSync(reportFile,JSON.stringify(report,null,2));
  console.log(JSON.stringify({reclassified:changed,remainingUnknown:report.categories.unknown||0,categories:report.categories}));
}
module.exports = { categories, category, parse, coverage, parseKmz };
if (require.main === module) {
  if(process.argv[2]==='--reclassify-snapshot')reclassifySnapshot();
  else main().catch(e => { console.error(e); process.exitCode = 1; });
}
