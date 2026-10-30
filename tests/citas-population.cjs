const fs=require('fs'),assert=require('assert/strict');
const period=JSON.parse(fs.readFileSync('data/historical-admin/census-1990.json','utf8'));
assert.equal(period.populationSummary.population,1130822993);
assert.equal(period.counties,2438);assert.equal(period.populationSummary.knownUnits,2420);
assert.equal(period.populationSummary.missingUnits,18);assert.equal(period.redistributionAllowed,false);
assert(period.notice.includes('A102 = total population'));
if(fs.existsSync(period.file)){
 const features=JSON.parse(fs.readFileSync(period.file,'utf8')).features;
 const counties=features.filter(f=>f.properties.level==='county').map(f=>f.properties);
 assert.equal(counties.length,2438);assert.equal(counties.filter(p=>p.population===null).length,18);
 assert(counties.every(p=>p.population===null||p.population>0));
 assert(features.every(f=>f.properties.nameZh&&!f.properties.nameZh.includes('\ufffd')));
 assert(features.some(f=>f.properties.nameZh==='北京 门头沟区'&&f.properties.nameZhOriginal==='北京 門頭溝區'));
 assert(features.every(f=>f.properties.nameZhOriginal&&f.properties.parentZhOriginal),'Keep original source names');
 const catalog=JSON.parse(fs.readFileSync('data/history-boundaries/catalog.json','utf8'));
 for(const [from,level] of [['upper','province'],['prefecture','prefecture'],['county','county']]){
  const layer=catalog.layers.find(x=>x.id==='1990-'+level);assert(layer&&layer.snapshot===1990);
  const historic=JSON.parse(fs.readFileSync(layer.file)).features,original=features.filter(f=>f.properties.level===from);
  assert.equal(historic.length,original.length);
  for(let i=0;i<historic.length;i++){
   assert.equal(historic[i].properties.nameZh,original[i].properties.nameZh);
   assert.equal(historic[i].properties.start,1990);assert.equal(historic[i].properties.end,1990);
   assert.deepEqual(historic[i].geometry,original[i].geometry,'Reuse census geometry without shifting');
  }
 }
 for(const level of ['upper','prefecture']){
  const parents=features.filter(f=>f.properties.level===level).map(f=>f.properties);
  assert.equal(parents.reduce((n,p)=>n+(p.population||0),0),1130822993);
  for(const p of parents){
   const prefix=p.populationSourceId.slice(0,level==='upper'?2:4),children=counties.filter(x=>x.populationSourceId.startsWith(prefix));
   assert.equal(p.population||0,children.reduce((n,x)=>n+(x.population||0),0),'Aggregate by administrative code');
  }
 }
 for(const p of features.map(f=>f.properties))if(p.population!==null)assert(Math.abs(p.populationDensity-p.population/p.populationKnownAreaKm2)<1e-8);
 console.log('PASS: CITAS A102 counts, missing data, Chinese names, parent code aggregates and density denominator');
}else console.log('PASS: CITAS metadata; local nonredistributable geometry not present');
