const fs=require('fs'),assert=require('assert'),d=JSON.parse(fs.readFileSync('data/classical-sites/sites.geojson')),cap=require('../data/china-ancient-capitals.json');
const get=id=>d.features.find(f=>f.properties.id===id);
assert.equal(get('depth-cordoba-relation-19024092').geometry.coordinates.length,3,'Two courtyard holes');
assert.equal(get('depth-madrid-relation-30399').geometry.coordinates.length,5,'Four courtyard holes');
assert.equal(get('depth-ayutthaya-way-738897331').geometry.type,'Polygon');
const outline=get('depth-sukhothai-city-wall-reference');assert(outline.properties.inferredBoundary);assert.equal(outline.properties.joinedGapMeters.length,6);assert(Math.max(...outline.properties.joinedGapMeters)<=125);
for(const k of ['sithep','chiangmai']){const f=get(`depth-${k}-moat-group`);assert.equal(f.geometry.type,'MultiPolygon');assert.equal(f.properties.role,'water');assert(f.properties.sourceWayIds.length>1);}
const su=cap.items.find(r=>r.classicalSiteKey==='sukhothai');assert.deepEqual([su.lng,su.lat],[99.7038,17.0167]);assert(!cap.items.some(r=>r.classicalSiteKey==='sithep')); assert(su.eras.includes('元'));
assert.equal(cap.items.find(r=>r.classicalSiteKey==='aigai').eras[0],'周');assert.equal(cap.items.find(r=>r.classicalSiteKey==='nafplio').eras[0],'清');
const disputed=d.features.find(f=>f.properties.name.includes('传统王宫说有争议'));assert(disputed);assert.notEqual(disputed.properties.role,'palace');
console.log('PASS: real palace polygons and courtyard holes, grouped moats, explicitly inferred wall joins, corrected roots and historical periods');
