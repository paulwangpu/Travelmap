const assert=require('node:assert/strict'),fs=require('node:fs');
const catalog=require('../data/china-ancient-capitals.json'),d=JSON.parse(fs.readFileSync('data/ancient-capital-research-extents.geojson'));
const features=d.features.filter(f=>f.properties.sourceId.startsWith('yanxiadu-')),get=id=>features.find(f=>f.properties.sourceId==='yanxiadu-'+id);
assert.equal(features.length,10);assert.equal(new Set(features.map(f=>f.properties.sourceId)).size,10);
assert.ok(features.filter(f=>f.geometry.type==='Point').every(f=>f.properties.sitePoint===true),'Individual reference locations must have a visible marker');
const site=catalog.items.find(s=>s.name==='燕下都'),record=catalog.recordItems.find(r=>r.sourceOrder===22);
assert.equal(site.siteKey,'ancient-site:燕下都:39.34600,115.53000');assert.deepEqual(site.locationReference.originalCoordinates,[115.53,39.346]);
assert.deepEqual(record.siteReference.coordinates,[site.lng,site.lat]);assert.equal(site.boundaryRelations.length,10);assert.equal(record.boundaryRelations.length,10);
function inside(p,r){let hit=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
const east=get('east-city').geometry.coordinates[0];assert.ok(east.length>40);assert.deepEqual(east[0],east.at(-1));assert.ok(inside([site.lng,site.lat],east));assert.ok(!inside([115.53,39.346],east));
assert.ok(inside([site.lng,site.lat],get('wuyang').geometry.coordinates[0]));assert.ok(!inside(get('laomu').properties.labelCoordinates,east),'Laomu is outside the north city wall');
assert.equal(get('west-visible-wall').geometry.type,'LineString');assert.notDeepEqual(get('west-visible-wall').geometry.coordinates[0],get('west-visible-wall').geometry.coordinates.at(-1));
assert.equal(get('yunliang').properties.waterFeature,true);assert.match(get('late-cross-wall').properties.note,/赵国/);
for(const f of features){assert.equal(f.properties.period,'周');assert.equal(f.properties.capitalSiteKey,site.siteKey);assert.ok(f.properties.sourceUrl.startsWith('https://'));}
const fit=JSON.parse(fs.readFileSync('docs/yanxiadu-georeferencing.json'));assert.equal(fit.fit.controls.length,11);assert.ok(Math.max(...fit.fit.controls.map(p=>p.leaveOneOutMeters))<210);
console.log('PASS: Yanxiadu detailed extents, independent visible platforms, open west wall, period links and saved identity');
