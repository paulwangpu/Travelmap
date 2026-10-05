const assert=require('node:assert/strict'),fs=require('node:fs');
global.GeologyVectorTile=require('../vendor/geology/vector-tile');const providers=require('../geology-providers');
const data=JSON.parse(fs.readFileSync('data/geology/china-overview.geojson'));
assert.equal(data.metadata.compilationZoom,4);assert.equal(data.metadata.license,'CC BY 4.0');
assert(data.features.length>100);assert(data.features.every(f=>f.geometry.type==='MultiPolygon'&&f.properties.source_id===154&&/^#[a-f0-9]{6}$/i.test(f.properties.color)));
for(const f of data.features){const p=f.properties;for(const value of [p.t_age,p.b_age])if(value!=null)assert(Number.isFinite(value)&&value>=0&&value<=4600,`Corrupt ages in map unit ${p.map_id}`);if(p.t_age!=null&&p.b_age!=null)assert(p.t_age<=p.b_age);assert.equal(p.t_age,p.best_age_top);assert.equal(p.b_age,p.best_age_bottom);}
// Archived China snapshot remains reproducible; the app now uses global online fallback.
for(const[lng,lat]of[[104.06,30.67],[116.4,39.9]])assert(data.features.some(f=>providers.at(f,lng,lat)));
console.log('PASS: archived China snapshot numeric integrity and geometry');
