const assert=require('assert/strict'),fs=require('fs'),crypto=require('crypto');
require('../gallup-safety.js');const api=require('../safeture-risk.js');
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const display=read('data/safeture-display-20261017.geojson'),meta=display.metadata;
for(const {path,sha256} of Object.values(meta.sources))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'),sha256,'Display matches the preserved source snapshots');
assert.equal(meta.exclusiveCategoryFills,true);assert.equal(meta.deduplicatedBoundaries,true);
const fills=display.features.filter(f=>f.properties.riskScope==='display'),lines=display.features.filter(f=>f.properties.riskScope==='boundary');
assert.equal(fills.length,6);assert.equal(lines.length,1);assert(lines[0].geometry.type.endsWith('LineString'));
const regional=read(meta.sources.regional.path),country=read(meta.sources.country.path),land=read(meta.sources.land.path);
// Independent point sampling of source precedence; every interior has just one fill.
const samples=[];for(let y=-53.482;y<82;y+=11)for(let x=-177.173;x<180;x+=11)samples.push([x,y]);
samples.push(...api.labelPoints(regional).features.map(f=>f.geometry.coordinates));
for(const point of samples){
  const regions=regional.features.filter(f=>api.contains(point,f.geometry));
  const countries=country.features.filter(f=>api.contains(point,f.geometry));
  const covered=regions.length||countries.length||land.features.some(f=>api.contains(point,f.geometry));
  const expected=regions.length?Math.max(...regions.map(f=>f.properties.risklevelid)):countries.at(-1)?.properties.risklevelid||null;
  const matches=fills.filter(f=>api.contains(point,f.geometry));
  assert.equal(matches.length,covered?1:0,'One fill at '+point);
  if(covered)assert.equal(matches[0].properties.risklevelid,expected,'Original priority at '+point);
}
// A lower Regional category must remain the only fill over a higher national category.
const point=[95.24036846642855,20.42785],match=fills.filter(f=>api.contains(point,f.geometry));
assert.equal(match.length,1);assert.equal(match[0].properties.risklevelid,4,'Regional High overrides national Critical');
console.log('PASS: exclusive Safeture display mosaic, matched snapshot hashes, '+samples.length+' independent precedence/one-fill samples, grey fallback and shared boundary network');
