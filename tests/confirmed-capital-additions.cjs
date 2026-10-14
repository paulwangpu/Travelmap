const assert=require('node:assert/strict'),fs=require('fs');
const a=require('../data/china-ancient-capitals.json'),c=require('../data/classical-sites/catalog.json'),r=require('../docs/confirmed-three-country-capital-additions.json'),d=JSON.parse(fs.readFileSync('data/classical-sites/sites.geojson','utf8'));
const added=d.features.filter(f=>f.properties.id.startsWith('confirmed-'));
assert.equal(r.cities.length,32);assert.equal(added.length,195);assert.equal(r.addedCapitalRecords,36);
assert.equal(new Set(d.features.map(f=>f.properties.id)).size,d.features.length);
for(const city of r.cities){
 const root=a.items.find(s=>s.classicalSiteKey===city.key),site=c.sites.find(s=>s.key===city.key),features=d.features.filter(f=>f.properties.siteKey===city.key);
 assert(root&&site,city.key);assert.equal(site.capitalSiteKey,root.siteKey);assert.equal(features.length,city.geometryCount);assert(features.length>0);
 assert(root.hoverIdentity&&root.eras.length&&root.records.every(x=>x['时代']&&x['来源URL']));assert.match(city.completePhasedCityBoundary,/待核/);
 if(city.heritageId){assert(site.sharedCapitalCheckin);assert.equal(root.checkinChecklistKey,'worldHeritage');assert(root.checkinItem);}
 for(const f of features){assert.notEqual(f.geometry.type,'Point','No generic detail placeholders: '+f.properties.id);assert(f.properties.sourceUrl);}
}
assert.equal(added.reduce((n,f)=>n+(f.properties.sourceWayCount||0),0),346);
assert(added.some(f=>f.geometry.type==='Polygon'&&f.geometry.coordinates.length>1)||added.some(f=>f.geometry.type==='MultiPolygon'&&f.geometry.coordinates.some(p=>p.length>1)),'Preserve courtyard holes');
assert.equal(d.features.find(f=>f.properties.id==='depth-bangkok-way-1348245391').properties.siteKey,'thonburi');
assert(d.features.some(f=>f.properties.id==='confirmed-cangas-de-onis-way-190096376'));
assert.equal(d.features.find(f=>f.properties.siteKey==='alpuente').properties.role,'gate');
assert(d.features.filter(f=>f.properties.siteKey==='murcia').every(f=>f.properties.name.includes('蒙特阿古多')));
const vm=require('node:vm'),HistoricalPeriods=require('../historical-periods.js'),app=fs.readFileSync('app.js','utf8'),ctx={HistoricalPeriods,currentLanguage:'zh',state:{mapOverlays:{ancientCapitalPeriods:{}}}};
vm.createContext(ctx);
for(const [start,end] of [['function foreignCapitalHoverMeta(','\nfunction ensureHistoricalCheckinCatalogs('],['function ancientCapitalIconVisible(','\nfunction ownedHeritageCapitalMeta(']])vm.runInContext(app.slice(app.indexOf(start),app.indexOf(end,app.indexOf(start))),ctx);
for(const city of r.cities){const root=a.items.find(s=>s.classicalSiteKey===city.key);for(const lang of ['zh','en']){ctx.currentLanguage=lang;assert.equal(ctx.foreignCapitalHoverMeta(root).identity,lang==='en'?root.enHoverIdentity:root.hoverIdentity);assert(HistoricalPeriods.keys.includes(ctx.foreignCapitalHoverMeta(root).period));}assert(ctx.ancientCapitalIconVisible(root));}
ctx.state.mapOverlays.ancientCapitalPeriods=Object.fromEntries(HistoricalPeriods.keys.map(k=>[k,false]));
for(const city of r.cities)assert.equal(ctx.ancientCapitalIconVisible(a.items.find(s=>s.classicalSiteKey===city.key)),false);
console.log('PASS: 32 incremental capitals, 195 actual geometries, 346 original wall ways, shared check-ins and qualified boundary scopes');
