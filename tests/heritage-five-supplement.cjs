const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const report=read('docs/heritage-five-supplement.json'),cities=read('data/classical-sites/catalog.json'),cap=read('data/china-ancient-capitals.json'),geo=read('data/classical-sites/sites.geojson'),t=read('data/imperial-tombs/catalog.json'),g=read('data/imperial-tombs/geometry.geojson');
const Tombs=require('../imperial-tombs.js');
assert.equal(report.addedCities.length,5);assert.equal(report.addedTombs.length,15);
for(const key of report.addedCities){assert.equal(cities.sites.filter(x=>x.key===key).length,1);assert.equal(cap.items.filter(x=>x.classicalSiteKey===key).length,1);assert(geo.features.some(x=>x.properties.siteKey===key));}
for(const key of [...report.addedCities,...report.updatedSites])assert.equal(cities.counts[key],geo.features.filter(x=>x.properties.siteKey===key).length);
for(const arr of [t.items.map(x=>x.id),t.sources.map(x=>x.id),geo.features.map(x=>x.properties.id)])assert.equal(new Set(arr).size,arr.length);
const added=t.items.filter(x=>report.addedTombs.includes(x.id));
for(const x of added){assert(/^[a-z0-9-]+$/.test(x.id));assert.equal(x.visitorAccess.originalChamber,false);assert(x.sourceIds.every(id=>t.sources.some(s=>s.id===id)));assert(!Tombs.mappedItems(t,{[x.correspondingChinesePeriod]:false},16).some(y=>y.id===x.id));if(x.parentId)assert(t.items.some(y=>y.id===x.parentId&&y.recordType==='group'));}
assert.equal(added.filter(x=>x.parentId==='expansion-qutb').length,6);
assert.equal(added.filter(x=>x.country==='苏丹').length,3);
const nuri=added.find(x=>x.id==='expansion-nuri');assert(Math.abs(nuri.coordinates.lat-(18+33/60+50/3600))<1e-9);assert.equal(nuri.coordinates.status,'estimated_wgs84');
const allnew=geo.features.filter(x=>x.properties.supplementAudit==='heritage-five-20261029');
assert.equal(allnew.filter(x=>x.properties.siteKey==='balkh'&&x.properties.role==='wall').length,0,'existing 20 wall ways must not be duplicated');
assert.equal(allnew.find(x=>x.properties.siteKey==='new-nisa').geometry.type,'Point','no invented new-Nisa perimeter');
assert.equal(allnew.filter(x=>x.properties.siteKey==='sigiriya'&&x.properties.role==='water')[0].geometry.coordinates.length,4);
assert.equal(allnew.find(x=>x.properties.siteKey==='sigiriya'&&x.properties.role==='palace').geometry.type,'Point','rock outline must not become a palace footprint');
assert.equal(g.features.filter(x=>report.addedTombs.includes(x.properties.tombId)).length,13);
assert(!g.features.some(x=>['expansion-nuri','expansion-kurru'].includes(x.properties.tombId)));
for(const key of ['taxila-bhir','taxila-sirkap','taxila-sirsukh'])assert.equal(cities.sites.find(x=>x.key===key).extentReview.completeCityBoundary,false);
assert(report.pending.length>=5);
console.log('PASS: five groups, independent city/cemetery identities, official references, no duplicate walls or fabricated city perimeters');
