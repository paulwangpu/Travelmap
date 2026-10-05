const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('../data/imperial-tombs/catalog.json');
const {mappedItems,geojson,hasVisitableChamber,isFeudalKing}=require('../imperial-tombs.js');
const ids=zoom=>mappedItems(c,'',zoom,{}, {},true,true).map(x=>x.id);
for(const zoom of [5,10]){
 const shown=ids(zoom);assert(shown.includes('ming-ding'));assert(shown.includes('qing-chong'));assert(shown.includes('wei-jing'));
 assert(!shown.includes('qin-first'));assert(!shown.includes('ming-jing'));assert(!shown.includes('nantang-qin'));assert(!shown.includes('han-king-guangling'));
 assert(mappedItems(c,'',zoom,{}, {},true,true).every(hasVisitableChamber));
 assert(!shown.includes('qing-east'),'nonvisitable group must not hide accessible children at low zoom');
}
assert(mappedItems(c,'',10,{}, {},false,true).every(x=>!isFeudalKing(x)));
assert(!mappedItems(c,{明:false},10,{}, {},true,true).some(x=>x.id==='ming-ding'));
const feature=geojson(c,'',10,{}, {},x=>x.id==='ming-ding',true,true).features.find(x=>x.id==='ming-ding');assert(feature.properties.done);
for(const x of c.items.filter(hasVisitableChamber))assert(x.visitorAccess.sourceIds.length&&x.visitorAccess.sourceIds.every(id=>c.sources.some(s=>s.id===id)));
const app=fs.readFileSync(require.resolve('../app.js'),'utf8'),ui=fs.readFileSync(require.resolve('../imperial-tombs.js'),'utf8');
assert(app.includes('imperialTombsOnlyVisitableChambers: overlays.imperialTombsOnlyVisitableChambers === true'));
assert(ui.includes('data-tomb-chambers'));assert(!ui.includes("en()?'Periods':'时代'"));
const mapCatalogVersion=ui.match(/catalog\.json\?v=(\d+)/)?.[1],checklistCatalogVersion=app.match(/catalog\.json\?v=(\d+)/)?.[1];
assert(mapCatalogVersion&&mapCatalogVersion===checklistCatalogVersion,'map and checklist must request the same catalog version');
for(const id of ['wei-gao','sui-yang','han-haihun','qin-gong-1']){
 const x=c.items.find(x=>x.id===id);assert(hasVisitableChamber(x));assert.equal(x.visitorAccess.mode,'view_original_remains');assert(ids(10).includes(id));
}
assert(ids(5).includes('qing-cixi'),'accessible child of East Qing tombs stays visible under chamber filter');
assert(c.sources.find(x=>x.id==='visit-cixi').url.includes('dpm.org.cn'));
assert.equal(c.items.find(x=>x.id==='shang-tang-bozhou').nature,'cenotaph');
assert.equal(c.items.find(x=>x.id==='chenghan-huaxi').recognition,'attributed');
assert(c.items.find(x=>x.id==='han-king-changyi').coordinates.estimate.extent.includes('2公里'));
console.log('PASS: chamber filter, dynasty/king composition, zoom hierarchy, checkins, sources and new site caveats');
