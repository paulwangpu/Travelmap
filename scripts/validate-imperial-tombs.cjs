const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname,'..','data','imperial-tombs');
const c = JSON.parse(fs.readFileSync(path.join(dir,'catalog.json'),'utf8'));
const byId = new Map(c.items.map(x=>[x.id,x]));
const sources = new Map(c.sources.map(x=>[x.id,x]));
assert.equal(byId.size,c.items.length,'duplicate record IDs');
assert.equal(sources.size,c.sources.length,'duplicate source IDs');
assert.equal(c.totalRecords,c.items.length);
const candidates=[];
for(const x of c.items) {
  assert(x.name && x.era && x.dynasty && x.admin && x.evidence);
  assert(Object.hasOwn(c.natureLabels,x.nature));
  assert(Object.hasOwn(c.recognitionLabels,x.recognition));
  assert(['single','group'].includes(x.recordType));
  assert(x.sourceIds.length>0);
  for(const id of x.sourceIds) assert(sources.has(id),`unknown source ${id}`);
  assert.equal(x.biographies.length,x.occupants.length,'one biography per named occupant');
  assert(x.lifespanText);
  for(const p of x.biographies){
    assert(p.lifespanText);
    for(const id of p.sourceIds)assert(sources.has(id),`unknown biography source ${id}`);
    for(const year of [p.birthYear,p.deathYear])assert(year===null||Number.isInteger(year)&&year!==0);
    if(p.birthYear!=null&&p.deathYear!=null)assert(p.birthYear<=p.deathYear,'birth after death');
    if(p.status==='legendary')assert(p.birthYear===null&&p.deathYear===null);
    if(p.birthYear!=null||p.deathYear!=null)assert(p.sourceIds.length>0);
  }
  assert(Object.hasOwn(c.disturbanceLabels,x.disturbance.status));
  if(x.disturbance.status!=='unknown')assert(x.disturbance.sourceIds.length>0);
  for(const id of x.disturbance.sourceIds)assert(sources.has(id),`unknown disturbance source ${id}`);
  assert(x.reviewTasks.length>0);
  if(x.parentId) {
    assert(byId.has(x.parentId));
    assert.equal(byId.get(x.parentId).recordType,'group');
    const chain=new Set([x.id]);let ancestor=x;
    while(ancestor.parentId) {assert(!chain.has(ancestor.parentId),'cyclic parent');chain.add(ancestor.parentId);ancestor=byId.get(ancestor.parentId);}
  }
  if(x.coordinates) {
    const p=x.coordinates;
    assert.equal(p.crs,'WGS84');assert(['datum_pending','verified_wgs84','estimated_wgs84'].includes(p.status));
    assert(p.lat>18&&p.lat<54&&p.lng>73&&p.lng<135,'point outside China envelope');
    assert(sources.has(p.sourceId));assert(p.original&&p.target&&p.limitation);
    assert.equal(p.precision.horizontalAccuracyMeters,null,'no invented accuracy');
  }
  if(x.mapEligible) {assert(x.coordinates);assert(['verified_wgs84','estimated_wgs84'].includes(x.coordinates.status));if(x.coordinates.status==='estimated_wgs84')assert(x.coordinates.estimate.basis&&x.coordinates.estimate.extent);candidates.push(x.id);}
  if(x.coordinates?.status==='datum_pending') assert.equal(x.mapEligible,false);
}
assert.deepEqual(c.mapCandidateIds,candidates);
for(const [era,s] of Object.entries(c.summary)) {
  const rows=c.items.filter(x=>x.era===era);
  assert.equal(s.records,rows.length);
  assert.equal(s.singles,rows.filter(x=>x.recordType==='single').length);
  assert.equal(s.groups,rows.filter(x=>x.recordType==='group').length);
  assert.equal(s.mapCandidates,rows.filter(x=>x.mapEligible).length);
  assert.equal(s.sourcePointsPendingDatum,rows.filter(x=>x.coordinates?.status==='datum_pending').length);
  assert.equal(s.missingCoordinates,rows.filter(x=>!x.coordinates).length);
}
assert.equal(byId.get('han-ba').coordinates.sourceId,'geo-reviewed-han-ba');assert(Math.abs(byId.get('han-ba').coordinates.lat-34.23809)<0.00001);
for(const id of ['zhou-ling','zhou-three','zhou-xianyang','shang-fuhao','zeng-yi','qin-gong-1','yin-kings','yue-yinshan','chu-xiongjia','qi-tian','qin-east','jin-hou','guo-kings','nanyue-wen','ming-luwang','ming-shaowu','qing-cixi'])assert(byId.get(id).mapEligible,id+' must have a reviewed location');
assert.equal(byId.get('shang-fuhao').ownerRole,'royal_consort');
assert.equal(byId.get('shang-fuhao').recognition,'archaeological');
assert.equal(byId.get('shang-fuhao').biographies[0].deathYear,null,'Fu Hao approximate era must not become an exact death year');
assert(byId.get('shang-fuhao').lifespanText.includes('前13世纪'));
assert.equal(byId.get('ming-luwang').lifespanText,'1618—1662年');
assert(byId.get('ming-luwang').coordinates.lat>24&&byId.get('ming-luwang').coordinates.lat<25,'Kinmen regent tomb must not use Shandong homonym');
assert(Math.abs(byId.get('yin-kings').coordinates.lat-byId.get('shang-fuhao').coordinates.lat)>0.01,'Fu Hao at palace precinct and royal cemetery are different locations');
assert(byId.get('zhou-xianyang').disputes.some(x=>x.includes('秦王陵')));
assert.equal(byId.get('nanyue-wen').disturbance.status,'reported_unrobbed');
assert(byId.get('han-ba').sourceIds.includes('baling'));
assert(byId.get('han-ba').disputes.some(x=>x.includes('凤凰嘴')));
assert.equal(byId.get('qin-first').coordinateAlternatives[0].sourceRecordId,'441-001');
assert(Math.abs(byId.get('qin-first').coordinates.lat-34.38167)<0.00001);
assert(Math.abs(byId.get('qing-west').coordinateAlternatives[0].lat-(39+20/60))<1e-8);
assert.equal(byId.get('ming-xianling').mapEligible,true);
assert.equal(byId.get('ming-xianling').coordinates.status,'estimated_wgs84');
assert.equal(byId.get('song-an').nature,'posthumous');
assert.equal(byId.get('ming-zu').nature,'cenotaph');
assert.equal(byId.get('yuan-genghis').nature,'commemorative');
assert.equal(byId.get('tang-qian').occupants.length,2);
assert.equal(c.items.filter(x=>x.parentId==='tang18').length,18);
assert.equal(c.items.filter(x=>x.parentId==='ming13').length,13);
assert.equal(c.items.filter(x=>x.parentId==='xixia9').length,9);
assert.equal(byId.get('shu-hui').lifespanText,'161—223年');
assert.equal(byId.get('wu-jiang').lifespanText,'182—252年');
assert.equal(byId.get('han-chang').lifespanText,'前256（另说前247）—前195年');
assert.equal(byId.get('han-kang').lifespanText,'前9—6年');
assert.equal(byId.get('tang-qian').biographies.length,2);
assert.equal(byId.get('tang-qian').biographies[1].deathYear,705);
assert.deepEqual(byId.get('tang-zhao').biographies[0].birthYearAlternatives,[598,599]);
assert.equal(byId.get('tang-tai').biographies[0].birthYear,685);
assert.equal(byId.get('tang-tai').biographies[0].deathYear,762);
assert.equal(byId.get('tang-jian').disturbance.status,'surface_theft');
assert.equal(byId.get('han-haihun').disturbance.status,'attempted');
assert.equal(byId.get('wuyue-qian').disturbance.status,'documentary_record');
assert.equal(byId.get('shu-hui').disturbance.status,'unknown');
assert.equal(byId.get('tubo-kings').recordType,'group');
assert.equal(c.items.filter(x=>x.id.startsWith('tubo-')).length,1,'no invented individual tomb assignment');
for(const x of c.items.filter(x=>x.era==='传说时代')) {
  assert.equal(x.nature,'commemorative');assert.equal(x.recognition,'traditional');
}
// Cross-check generated human deliverables and every record's audit section.
const report=fs.readFileSync(path.join(dir,'README.md'),'utf8');
const review=fs.readFileSync(path.join(dir,'review.md'),'utf8');
for(const x of c.items) {assert(report.includes(`| ${x.id} |`));assert(review.includes(`### ${x.id} ·`));}
console.log(`Validated ${c.items.length} records, ${c.sources.length} sources, ${candidates.length} area-level map candidates; hierarchy and historical regressions passed.`);
