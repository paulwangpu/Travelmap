const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {integrate,distance}=require('../scripts/integrate-arcgis-great-wall.cjs');
const data=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/great-wall/features.geojson'))),added=data.features.filter(f=>f.properties.source==='arcgis-hammond');
assert.equal(added.length,714);assert.equal(added.filter(f=>f.properties.category==='fortress').length,620);assert.equal(added.filter(f=>f.properties.category==='beacon').length,94);
assert.equal(new Set(data.features.map(f=>f.id)).size,data.features.length);
const easternHan=added.filter(f=>f.properties.dynastyCode===3);
assert.equal(easternHan.length,89);
for(const f of easternHan){assert.equal(f.properties.dynastyZh,'东汉');assert.equal(f.properties.dynastyEn,'Eastern Han');assert.equal(f.properties.originalDynastyName,'Later Han');}
for(const f of added){assert.equal(f.geometry.type,'Point');assert.equal(f.properties.reviewStatus,'unverified-source-candidate');assert.equal(f.properties.rawFields.OBJECTID,f.properties.originalId);assert.equal(f.properties.rawFields.Name,f.properties.originalName);assert.ok(f.properties.nameEn);}
for(let i=0;i<added.length;i++)for(let j=i+1;j<added.length;j++)if(added[i].properties.originalLayer===added[j].properties.originalLayer&&added[i].properties.dynastyCode===added[j].properties.dynastyCode)assert.ok(distance(added[i].geometry.coordinates,added[j].geometry.coordinates)>100);
const comparison=path.resolve(__dirname,'../output/arcgis-great-wall/comparison.geojson');
const ordered=d=>JSON.stringify([...d.features].sort((a,b)=>String(a.id).localeCompare(String(b.id))));
if(fs.existsSync(comparison)){const raw=JSON.parse(fs.readFileSync(comparison)),rebuilt=integrate(data,raw);assert.equal(ordered(rebuilt.data),ordered(data),'repeat builds preserve records and archive annotations');assert.equal(rebuilt.report.excludedExistingOrReview,96);assert.equal(rebuilt.report.omittedSourceDuplicates.length,11);for(const f of added){const original=raw.features.find(g=>g.id===f.id);assert.equal(original.properties.decision,'candidate-new-location');assert.deepEqual(f.geometry,original.geometry);assert.ok(original.properties.nearestAny.distanceMetres>100);}}
const ui=fs.readFileSync(path.resolve(__dirname,'../great-wall.js'),'utf8');assert.doesNotMatch(ui,/towerUnspecified/);assert.match(ui,/Source candidate, unverified/);assert.match(ui,/p.rawFields/);
console.log('PASS: ArcGIS candidate exclusions, internal dedup, 714 additions, original fields and coordinates, repeat builds and unverified display');
