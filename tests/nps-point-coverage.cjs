const fs=require('node:fs'),assert=require('node:assert/strict');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const catalog=read('data/us-nps-units.json'),boundaries=read('data/us-nps-boundaries.geojson');
const insideRing=([x,y],ring)=>{let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const a=ring[j],b=ring[i];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;
}return yes;};
const insideGeometry=(p,g)=>(g.type==='Polygon'?[g.coordinates]:g.coordinates).some(rings=>insideRing(p,rings[0])&&!rings.slice(1).some(r=>insideRing(p,r)));
assert.equal(catalog.units.length,433);assert.equal(new Set(catalog.units.map(u=>u.id)).size,433);
assert.equal(catalog.groups.find(g=>g.id==='parks').count,64);
for(const unit of catalog.units.filter(u=>u.mapPoint)){
  const p=unit.mapPoint;assert(Number.isFinite(p.lat)&&Math.abs(p.lat)<=90);assert(Number.isFinite(p.lng)&&Math.abs(p.lng)<=180);
  assert(/^https:\/\//.test(p.sourceUrl));assert(p.label);
  if(p.kind==='boundary-reference'){
    const boundary=boundaries.features.find(f=>f.properties.code===p.sourceBoundaryCode);
    assert(boundary&&insideGeometry([p.lng,p.lat],boundary.geometry),unit.code+' reference must lie inside its actual polygon, outside holes');
  }
}
assert.equal(catalog.units.find(u=>u.code==='CHIR').id,'monuments:CHIR','redesignation retains existing check-in ID');
assert.equal(catalog.units.filter(u=>u.mapPoint).length,370);
console.log('PASS: NPS point provenance, valid coordinates, interior references, stable identity and 64-park grouping');
