const fs=require('fs'),assert=require('node:assert/strict'),d=JSON.parse(fs.readFileSync('data/classical-sites/sites.geojson')),r=require('../docs/hue-three-enclosures.json');
for(const a of r.added)assert.deepEqual(d.features.find(f=>f.properties.id===a.properties.id),a);
const find=id=>d.features.find(f=>f.properties.id===id),outer=find('hue-way-1509320731'),imperial=find('hue-imperial-city-reference'),purple=find('hue-purple-city-plan-reference');
function inside(p,ring){let b=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],c=ring[j];if((a[1]>p[1])!==(c[1]>p[1])&&p[0]<(c[0]-a[0])*(p[1]-a[1])/(c[1]-a[1])+a[0])b=!b;}return b;}
for(const [f,parent] of [[imperial,outer],[purple,imperial]]){assert.equal(f.geometry.type,'Polygon');const ring=f.geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));assert(ring.slice(0,-1).every(p=>inside(p,parent.geometry.coordinates[0])));assert(inside(f.properties.labelCoordinates,ring));assert.equal(f.properties.inferredBoundary,true);}
assert.match(purple.properties.note,/图示参考，非实测墙界/);assert.match(purple.properties.note,/残差不代表范围精度/);
for(const id of imperial.properties.sourceWays){const f=find('hue-way-'+id);assert.equal(f.geometry.type,'LineString');assert.notDeepEqual(f.geometry.coordinates[0],f.geometry.coordinates.at(-1));assert.equal(f.properties.label,false);}
for(const g of imperial.properties.gateConnections)assert(g.lengthMeters>0&&g.lengthMeters<60);
for(const id of ['hue-way-285990344','hue-way-285990348']){const f=find(id);assert(f.geometry.coordinates[0].every(p=>inside(p,purple.geometry.coordinates[0])),id);}
assert.match(purple.properties.note,/南缘切过勤政殿/);
console.log('PASS Hue three nested enclosures, palace alignment, separate open walls and explicit reference provenance');
