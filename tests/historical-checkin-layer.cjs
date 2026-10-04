const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync(require.resolve('../app.js'),'utf8'),catalog=require('../data/imperial-tombs/catalog.json');
const periods=require('../historical-periods.js'),tombs=require('../imperial-tombs.js');
const capital={name:'北京',era:'明',dynasty:'明'};
const ctx={state:{mapOverlays:{}},HistoricalPeriods:periods,ImperialTombs:tombs,
 imperialTombMapIndex:new Map(catalog.items.map(x=>[x.name,x])),canonicalPlaceKey:x=>String(x||''),
 ancientCapitalMetaForPlace:p=>p.name==='北京'?capital:null,
 visitedPlaces:()=>['北京','明孝陵','普通打卡'].map((name,i)=>({place:{id:String(i),name,lng:116+i,lat:40}})),
 ensureHistoricalCheckinCatalogs:()=>{},activeChecklistOverlayKeys:()=>[],checklistOverlayPlaces:()=>[],
 mapDisplayCoordinate:(lng,lat)=>[lng,lat],mapCheckinTitle:p=>p.name,mapCheckinSubtitle:()=>'',depthColors:['','#dc2626']};
vm.createContext(ctx);
for(const name of ['historicalCheckinTheme','placeBelongsToActiveChecklistOverlay','mapLibrePointGeoJson']){
 const start=app.indexOf('function '+name+'('),end=app.indexOf('\nfunction ',start+10);
 vm.runInContext(app.slice(start,end),ctx);
}
const first=ctx.mapLibrePointGeoJson({checkins:true}).features;
assert.equal(first.length,3);
const capitalPoint=first.find(x=>x.properties.title==='北京').properties;
assert.equal(capitalPoint.checklistKey,'chinaAncientCapitals');assert.equal(capitalPoint.capitalIcon,'ancient-capital-明-visited');assert.equal(capitalPoint.capitalLabel,'✓ 北京');assert.equal(capitalPoint.color,periods.colors.明);
const tombPoint=first.find(x=>x.properties.title==='明孝陵').properties;
assert.equal(tombPoint.checklistKey,'imperialTombs');assert.equal(tombPoint.capitalIcon,'imperial-mausoleum-明-visited');assert.equal(tombPoint.color,periods.colors.明);
assert(!first.find(x=>x.properties.title==='普通打卡').properties.capitalIcon);
ctx.state.mapOverlays={chinaAncientCapitals:true,imperialTombs:true};
const second=ctx.mapLibrePointGeoJson({checkins:true}).features;
assert.equal(second.length,1,'active category overlays must suppress duplicate historical check-in points');
assert.equal(second[0].properties.title,'普通打卡');
assert.equal(ctx.mapLibrePointGeoJson({checkins:false}).features.length,0);
console.log('PASS: My check-ins uses visited capital/tomb symbols, keeps ordinary circles and avoids duplicate category points');
