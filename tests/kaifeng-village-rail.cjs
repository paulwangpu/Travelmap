const fs=require('fs'),assert=require('node:assert/strict'),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const report=read('docs/kaifeng-village-rail-correction.json'),data=read('data/ancient-capital-research-extents.geojson').features,f=data.find(f=>f.properties.sourceId===report.sourceId);
assert.deepEqual(f.geometry,report.geometry);assert.equal(f.geometry.coordinates[0].length,report.sourcePixels.length);
assert.equal(report.landmarks.filter(l=>l.usedForFit).length,8);assert.ok(report.landmarks.every(l=>l.sourceUrl.startsWith('https://www.openstreetmap.org/node/')));
for(const i of report.railHoldoutIndices){assert.ok(!report.railTrainIndices.includes(i));assert.ok(report.railErrorsAfter[i]<report.railErrorsBefore[i]*.6);assert.ok(report.railErrorsAfter[i]<45);}
assert.ok(report.railways.every(r=>r.tags.name==='陇海线'&&r.tags.usage==='main'));
assert.ok(!report.landmarks.find(l=>l.name==='大北岗村').usedForFit);assert.ok(report.excluded.some(e=>e.name==='私访院村'));
assert.ok(report.ironTowerHoldout.errorMeters<100);
const ring=f.geometry.coordinates[0],scale=Math.hypot(...report.coefficients.slice(0,2));assert.ok(Math.abs(scale/(1000/94)-1)<.01);
for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],p=report.sourcePixels[i-1],q=report.sourcePixels[i];assert.ok(Math.abs(Math.hypot((b[0]-a[0])*report.metric[0],(b[1]-a[1])*report.metric[1])-Math.hypot(q[0]-p[0],q[1]-p[1])*scale)<1e-5);}
const prior=read('docs/kaifeng-inner-palace-correction.json');for(const [id,v] of Object.entries(prior.features))assert.deepEqual(data.find(f=>f.properties.sourceId===id).geometry,v.geometry);
assert.deepEqual(data.find(f=>f.properties.sourceId==='kaifeng-wei-daliang-reference').geometry,read('docs/daliang-reference-correction.json').geometry);
console.log('PASS: village provenance, railway holdouts, original wall trace/scale, qualified outliers and preserved other Kaifeng extents');
