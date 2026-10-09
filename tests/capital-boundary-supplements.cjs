const assert=require('node:assert/strict'),fs=require('node:fs');
const features=JSON.parse(fs.readFileSync('data/ancient-capital-research-extents.geojson')).features;
const byId=id=>features.find(f=>f.properties.sourceId===id);
const jin=byId('beijing-jin-buriedarea-2019');
assert.equal(jin.geometry.type,'Polygon');
assert.match(jin.properties.note,/埋藏区/);
const metadata={extent:JSON.parse(fs.readFileSync('docs/erlitou-palaces-georeferencing.json')).exportedExtent};
assert.equal(metadata.extent.spatialReference.wkid,4326);
assert.ok(Math.abs(metadata.extent.xmin-112.685)<1e-9&&Math.abs(metadata.extent.ymax-34.697)<1e-9);
for(const id of ['erlitou-palace-1','erlitou-palace-2']){
 const f=byId(id),ring=f.geometry.coordinates[0];
 assert.equal(f.geometry.type,'Polygon');assert.deepEqual(ring[0],ring.at(-1));
 assert.ok(ring.every(p=>p[0]>112.685&&p[0]<112.695&&p[1]>34.689&&p[1]<34.697));
 assert.match(f.properties.status,/展示/);
}
const west=byId('han-palaces-plan2005-4');
assert.equal(west.geometry.type,'Polygon');assert.deepEqual(west.geometry.coordinates[0][0],west.geometry.coordinates[0].at(-1));
assert.ok(Math.min(...west.geometry.coordinates[0].map(p=>p[0]))<108.821);
assert.match(west.properties.note,/1996/);
const outer=features.filter(f=>f.properties.sourceId.startsWith('hanwei-northernwei-outer-'));
assert.equal(outer.length,2);assert.ok(outer.every(f=>f.geometry.type==='LineString'&&f.properties.period==='魏晋南北朝'));
const catalog=JSON.parse(fs.readFileSync('data/china-ancient-capitals.json'));
const han=catalog.recordItems.filter(r=>r.siteName==='洛阳'&&r.dynasty==='东汉');
assert.ok(han.length&&han.every(r=>!r.boundaryRelations.some(b=>b.id.startsWith('hanwei-northernwei-outer-'))));
const northern=catalog.recordItems.find(r=>r.siteName==='洛阳'&&r.dynasty==='北魏');
assert.equal(northern.boundaryRelations.filter(b=>b.id.startsWith('hanwei-northernwei-outer-')).length,2);
console.log('PASS: filled buried area, geolocated palace display polygons, west-wall supplement and separate Han/Northern Wei extents');
