const fs=require('fs'),assert=require('node:assert/strict');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),d=read('data/classical-sites/sites.geojson'),c=read('data/classical-sites/catalog.json'),a=read('data/china-ancient-capitals.json'),source=['osm','efeo','surroundings'].flatMap(n=>read('data/angkor/'+n+'.geojson').features),migrated=d.features.filter(f=>f.properties.id.startsWith('acim-angkor-'));
assert.equal(source.length,147);assert.equal(migrated.length,147);
for(const f of source){const actual=migrated.find(x=>x.properties.legacyId===f.properties.id);assert(actual);assert.deepEqual(actual.geometry,f.geometry);for(const k of ['sourceUrl','license','licenseUrl','note'])assert.equal(actual.properties[k],f.properties[k]);}
assert(a.items.some(x=>x.classicalSiteKey==='angkor'));assert(a.items.some(x=>x.classicalSiteKey==='roluos'));assert.equal(migrated.filter(f=>f.properties.siteKey==='roluos').length,3);
assert(migrated.some(f=>f.properties.role==='area'&&f.geometry.type==='Polygon'));assert(migrated.filter(f=>f.properties.origin==='efeo').every(f=>f.properties.inferredBoundary&&f.properties.attribution.includes('EFEO')));
const app=fs.readFileSync('app.js','utf8'),html=fs.readFileSync('index.html','utf8');assert(!app.includes('AngkorSites.sync'));assert(!app.includes('AngkorSites.click'));assert(!html.includes('src="angkor-sites.js'));
assert.deepEqual(c.sites.find(s=>s.key==='angkor').center,[103.8589,13.4413]);assert.equal(c.sites.find(s=>s.key==='roluos').historicalIdentity,'capital');
console.log('PASS: all 147 original Angkor geometries, holes, sources and licenses preserved in global layers; Roluos is separate; no parallel renderer');
