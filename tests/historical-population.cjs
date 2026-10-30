const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),catalog=read('data/historical-admin/catalog.json');
const totals={2:57671401,742:52457215,1102:88813910,1820:351790112};
for(const period of catalog.periods){
  const all=read(period.file).features,children=all.filter(f=>f.properties.level==='prefecture').map(f=>f.properties),parents=all.filter(f=>f.properties.level==='upper').map(f=>f.properties);
  assert.equal(children.reduce((n,p)=>n+(p.population??0),0),totals[period.id]);
  assert.equal(parents.reduce((n,p)=>n+(p.population??0),0),totals[period.id],'Upper totals must conserve source population');
  for(const p of children){
    assert(p.populationAreaKm2>0);
    if(p.populationMethod==='missing'){assert.equal(p.population,null);assert.equal(p.populationDensity,null);}
    else {assert(p.population>=0);assert(p.populationDensityNote==='source_area_mismatch'||Math.abs(p.population/p.populationAreaKm2/p.populationDensity-1)<.001);}
  }
  for(const p of parents){
    const known=children.filter(c=>c.parent===p.name&&c.population!==null),area=known.reduce((n,c)=>n+c.populationAreaKm2,0);
    assert.equal(p.population,known.length?known.reduce((n,c)=>n+c.population,0):null);
    assert(Math.abs(p.populationKnownAreaKm2-area)<1e-7);
    if(area)assert(Math.abs(p.populationDensity-p.population/area)<1e-8,'Density uses original statistical areas, never the filled overview geometry');else assert.equal(p.populationDensity,null);
  }
  assert.equal(period.populationSummary.population,totals[period.id]);
}
assert.equal(catalog.periods.find(p=>p.id==='1102').populationSummary.methods.household_conversion,292);
assert.equal(catalog.periods.find(p=>p.id==='1820').populationSummary.missingUnits,4);
const state={mapOverlays:{historicalAdmin:true,populationDensity:true,historicalAdminPeriod:'1820',historicalAdminLevel:'prefecture',historicalAdminMetric:'density',historicalAdminOpacity:60}};
const ctx={document:{getElementById:()=>null},console};vm.createContext(ctx);vm.runInContext(fs.readFileSync('historical-admin.js','utf8'),ctx);ctx.HistoricalAdmin.init({state:()=>state,language:()=> 'zh',fetch:async p=>read(p.split('?')[0])});
const sources=new Map(),layers=new Map(),map={getSource:id=>sources.get(id),getLayer:id=>layers.get(id),addSource:(id,s)=>sources.set(id,{data:s.data,setData(d){this.data=d;}}),removeSource:id=>sources.delete(id),addLayer:l=>layers.set(l.id,l),removeLayer:id=>layers.delete(id),setPaintProperty:(id,k,v)=>layers.get(id).paint[k]=v,setLayoutProperty:(id,k,v)=>layers.get(id).layout[k]=v};
(async()=>{
 await ctx.HistoricalAdmin.sync(map);assert.equal(layers.get('historical-admin-fill').paint['fill-color'][0],'case');assert.equal(layers.get('historical-admin-fill').paint['fill-opacity'],.6);assert.equal(layers.get('historical-admin-population').layout.visibility,'none');
 assert.equal(sources.get('historical-admin-population').data.features.length,316,'Missing populations must not become zero-sized or misleading circles');
 state.mapOverlays.historicalAdminMetric='population';await ctx.HistoricalAdmin.sync(map);assert.equal(layers.get('historical-admin-population').layout.visibility,'visible');assert([...layers.keys()].indexOf('historical-admin-population')>[...layers.keys()].indexOf('historical-admin-label'),'Bubbles render above historical names');assert.equal(layers.get('historical-admin-label').layout['text-radial-offset'][0],'+','Names move outside the circle radius');assert.equal(layers.get('historical-admin-population').paint['circle-radius'][2][0],'sqrt','Circle area, rather than radius, represents population');
 state.mapOverlays.historicalAdminMetric='regions';await ctx.HistoricalAdmin.sync(map);assert.equal(layers.get('historical-admin-fill').paint['fill-color'][0],'get');assert.equal(layers.get('historical-admin-population').layout.visibility,'none');
 assert.equal(layers.get('historical-admin-label').layout['text-radial-offset'],0,'Restore centered labels outside bubble mode');
 state.mapOverlays.populationDensity=false;await ctx.HistoricalAdmin.sync(map);assert.equal(sources.size,0);assert.equal(layers.size,0);
 console.log('PASS: original population totals, household conversions, null missing data, density denominator, proportional circles and mode cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});
