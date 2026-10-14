const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const capitals=require('../data/china-ancient-capitals.json'),catalog=require('../data/classical-sites/catalog.json'),data=JSON.parse(fs.readFileSync('data/classical-sites/sites.geojson','utf8'));
const keys=['fez','marrakesh','meknes','rabat','volubilis'];
for(const key of keys){
 const root=capitals.items.find(x=>x.siteKey===`ancient-site:world-${key}`),site=catalog.sites.find(x=>x.key===key),features=data.features.filter(x=>x.properties.siteKey===key);
 assert(root&&site,`${key}: capital metadata missing`);assert.equal(site.historicalIdentity,'capital');assert.equal(site.sharedCapitalCheckin,true);assert(root.heritageId.startsWith('whc-'));assert(features.length>0);assert(root.boundaryRelations.length>0);assert(features.every(x=>!/中国对应朝代|年代对应中国朝代/.test(x.properties.periodLabel||'')));
}
assert.equal(capitals.items.find(x=>x.siteKey==='ancient-site:world-fez').records.length,3);
assert.equal(capitals.items.find(x=>x.siteKey==='ancient-site:world-marrakesh').records.length,3);
assert.equal(capitals.items.find(x=>x.siteKey==='ancient-site:world-rabat').records.length,2);
assert.equal(capitals.items.find(x=>x.siteKey==='ancient-site:world-volubilis').records.length,2);
const tangier=catalog.sites.find(x=>x.key==='tangier'),tangierWalls=data.features.filter(x=>x.properties.siteKey==='tangier'&&x.properties.role==='wall');
assert.equal(tangier.historicalIdentity,'provincial-capital');assert(!tangier.capitalSiteKey);assert.match(tangier.identityNote,/行省首府.*不作为独立国家都城/);assert.equal(tangierWalls.length,2);assert(tangierWalls.every(x=>x.geometry.type==='LineString'));
const walls=data.features.filter(x=>['fez','marrakesh','meknes','rabat','tangier'].includes(x.properties.siteKey)&&x.properties.role==='wall');assert.equal(walls.length,176);assert(walls.every(x=>x.geometry.type==='LineString'));assert(walls.every(x=>/开放线保持开放/.test(x.properties.note)));
const vol=data.features.find(x=>x.properties.id==='volubilis-site-way-175612028');assert.equal(vol.geometry.type,'Polygon');assert.match(vol.properties.note,/现代遗址围栏.*不作为实测残墙线/);
const source=fs.readFileSync('classical-sites.js','utf8'),ctx={HistoricalPeriods:require('../historical-periods.js'),fetch:async u=>({ok:true,json:async()=>u.includes('catalog')?catalog:data})};vm.createContext(ctx);vm.runInContext(source+'\nthis.api=ClassicalSites;',ctx);ctx.api.init({state:()=>({mapOverlays:{chinaAncientCapitals:true,ancientCapitalPeriods:{}}}),language:()=> 'zh'});(async()=>{await ctx.api.sync();const rows=ctx.api.siteFeatures().features;assert.equal(rows.find(x=>x.properties.siteKey==='tangier').properties.markerKind,'ancient-city');assert(!rows.some(x=>keys.includes(x.properties.siteKey)),'capital-owned roots must not duplicate standalone markers');console.log('PASS: Morocco capital identities, Tangier provincial classification, original wall lines and Volubilis boundary caveat');})().catch(e=>{console.error(e);process.exitCode=1;});
