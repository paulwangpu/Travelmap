const assert=require('node:assert/strict'),fs=require('node:fs');
const {build}=require('../scripts/build-great-wall-history.cjs');
const {parseKmz}=require('../scripts/build-great-wall.cjs');
const data=JSON.parse(fs.readFileSync(require.resolve('../data/great-wall/history.geojson')));
assert.equal(data.features.length,49);
assert.equal(data.features.reduce((n,f)=>n+f.geometry.coordinates.length,0),2005);
const counts={};for(const f of data.features){counts[f.properties.dynasty]=(counts[f.properties.dynasty]||0)+1;assert.equal(f.geometry.type,'LineString');assert.equal(f.properties.source,'wikipedia-kmz');assert.equal(f.properties.approximate,true);assert.ok(f.properties.originalName);}
assert.deepEqual(counts,{'spring-autumn':9,qin:5,han:8,'northern-wei':1,'liao-jin':7,ming:19});
assert.equal(new Set(data.features.map(f=>f.id)).size,49);
const local='C:/Users/paulw/Downloads/GreatWall wikipedia.kmz';
if(fs.existsSync(local)){const buffer=fs.readFileSync(local),raw=parseKmz(buffer);assert.deepEqual(build(buffer),data);assert.deepEqual(build(buffer),build(buffer));data.features.forEach((f,i)=>assert.deepEqual(f.geometry,raw[i].geometry));}
const moduleCode=fs.readFileSync(require.resolve('../great-wall.js'),'utf8'),app=fs.readFileSync(require.resolve('../app.js'),'utf8');
assert.match(app,/greatWallHistory: false/);assert.match(app,/greatWallHistory: Boolean/);
assert.match(moduleCode,/great-wall-history-line/);assert.match(moduleCode,/greatWallHistoryPane.*zIndex='389'/);
assert.doesNotMatch(moduleCode,/historyLegend.hidden=/);
assert.match(moduleCode,/greatWallHistory=e.target.checked/);
assert.doesNotMatch(moduleCode,/historyToggle\.closest\('details'\)\.open=true/);
assert.match(moduleCode,/filter\(f=>f.properties.dynasty!=='ming'\)/);
assert.match(moduleCode,/filter\(\(\[key\]\)=>key!=='ming'\)/);
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
assert.equal((html.match(/id="showGreatWallHistory"/g)||[]).length,1);
console.log('PASS: historical KMZ preserves all 49 routes and coordinates; eras, naming, defaults and both renderers wired');
