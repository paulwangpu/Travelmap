const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),a=require('../data/china-ancient-capitals.json'),c=require('../data/classical-sites/catalog.json'),r=require('../docs/himalaya-champa-regional-capitals-review.json'),H=require('../historical-periods.js'),d=JSON.parse(fs.readFileSync('data/classical-sites/sites.geojson','utf8')),app=fs.readFileSync('app.js','utf8');
const f=d.features.filter(x=>x.properties.id.startsWith('hc-'));
assert.equal(r.addedCapitalRoots,9);assert.equal(r.addedCapitalRecords,16);assert.equal(f.length,13);assert.equal(f.filter(x=>/Polygon/.test(x.geometry.type)).length,8);
for(const s of r.sites){const root=a.items.find(x=>x.classicalSiteKey===s.key),site=c.sites.find(x=>x.key===s.key);assert(root&&site);assert.equal(root.country,s.country);assert.equal(site.capitalSiteKey,root.siteKey);assert(f.some(x=>x.properties.siteKey===s.key));assert.match(root.coordinatePrecision,/不表示/);for(const row of root.records){assert(row.capitalPeriods.length);assert(row.capitalPeriods.every(x=>H.keys.includes(x)));assert(row['来源URL']);}}
const root=k=>a.items.find(x=>x.classicalSiteKey===k);
assert.deepEqual(H.capitalPeriods(root('gorkha')),['明','清']);assert.equal(H.capitalTheme(root('gorkha'),{明:false}).key,'清');assert.deepEqual(H.capitalPeriods(root('dongduong')),['隋唐','五代十国','宋辽金西夏']);assert.deepEqual(H.capitalPeriods(root('fusi')),['魏晋南北朝','隋唐']);
assert(f.some(x=>x.properties.siteKey==='gorkha'&&x.geometry.type==='Polygon'&&x.geometry.coordinates.length>1),'Lower palace courtyard hole is retained');
assert(!f.some(x=>/1446452500|340926506|1008910630/.test(x.properties.id)),'Do not import a named road or unrelated modern walls');
assert(f.filter(x=>x.properties.siteKey==='doban').every(x=>x.properties.role!=='wall'));
for(const p of ['大长和','大天兴','大义宁','大中国（高氏）'])assert(a.items.find(x=>x.currentPlace==='羊苴咩城').records.some(x=>x['政权/国号']===p));
assert(root('kathmandu').records.some(x=>x['政权/国号']==='尼泊尔沙阿王朝'));
const ctx={canonicalPlaceKey:x=>String(x||''),cleanChecklistName:x=>x,englishNameInParentheses:()=>'',cleanEnglishParkName:x=>x,HistoricalPeriods:H,state:{mapOverlays:{ancientCapitalPeriods:{}}}};vm.createContext(ctx);
vm.runInContext(app.slice(app.indexOf('const checklistCanonicalPlaces = ['),app.indexOf('\nfunction checklistCoordinateKeyFromCoords(')),ctx);
for(const name of ['斯贴','西贴','Si Thep','斯贴古城','西贴古镇及相关陀罗钵地古迹','The Ancient Town of Si Thep and its Associated Dvaravati Monuments'])assert.equal(ctx.checklistCanonicalKey(name),'place:th-sithep');
vm.runInContext(app.slice(app.indexOf('function foreignCapitalHoverMeta('),app.indexOf('\nfunction ensureHistoricalCheckinCatalogs(')),ctx);
for(const k of ['jinghong','guge','mongmao','fusi'])assert.equal(ctx.foreignCapitalHoverMeta(root(k)),null,'Chinese local capitals use Chinese metadata rules');
for(const k of ['gorkha','trakieu','dongduong','doban','panduranga'])assert(ctx.foreignCapitalHoverMeta(root(k)).identity);
const wh=require('../data/world-heritage.json').items.find(x=>x.id==='whc-1662'),s=c.sites.find(x=>x.key==='sithep');assert.equal(s.checklistItem,wh.name);assert.deepEqual(s.center,[wh.lng,wh.lat]);assert.equal(s.historicalIdentity,'ancient-city');assert.equal(d.features.filter(x=>x.properties.siteKey==='sithep').length,9);
console.log('PASS: Si Thep canonical identity; verified regional capitals, preserved palace holes, curated cross-period controls and excluded false walls');
