const assert=require('node:assert/strict'),fs=require('node:fs');const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const data=read('data/ancient-capital-research-extents.geojson').features,report=read('docs/kaifeng-inner-palace-correction.json'),previousDaliang=read('docs/daliang-reference-correction.json');
for(const [id,r] of Object.entries(report.features)){
 const f=data.find(f=>f.properties.sourceId===id);assert.deepEqual(f.geometry,r.geometry);assert.equal(f.geometry.coordinates[0].length,r.sourcePixels.length);assert.match(f.properties.sourceTitle,/孟凡人/);assert.match(f.properties.note,/不再用四点透视/);assert.ok(r.controlResidualMeters.every(n=>n<40));
 const ring=f.geometry.coordinates[0],pixels=r.sourcePixels,scale=r.scaleMetersPerPixel;
 for(let i=1;i<ring.length;i++){
  const imageLength=Math.hypot(pixels[i][0]-pixels[i-1][0],pixels[i][1]-pixels[i-1][1]);const metricLength=Math.hypot((ring[i][0]-ring[i-1][0])*r.metric[0],(ring[i][1]-ring[i-1][1])*r.metric[1]);
  assert.ok(Math.abs(metricLength-imageLength*scale)<1e-5,'Uniform scale along every edge; no projective shear');
 }
 assert.deepEqual(ring[0],ring.at(-1));assert.match(f.properties.note,/图件轮廓不能作为精确实测/);if(id.endsWith('inner'))assert.ok(f.properties.inferredBoundary,'Retain inner city dashed reference outline');
}
assert.deepEqual(data.find(f=>f.properties.sourceId==='kaifeng-wei-daliang-reference').geometry,previousDaliang.geometry,'Preserve previously corrected Daliang');assert.equal(data.filter(f=>/^kaifeng-song-/.test(f.properties.sourceId)).length,3);console.log('PASS: Kaifeng original traces, uniform edge scale, gate residuals, author correction and retained Daliang');
