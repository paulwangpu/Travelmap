const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
let complete,ready=false,saves=0,renders=0;
const pending=new Promise(r=>complete=()=>{ready=true;r();});
const places=[],state={};
const context={places,state,console,Date,ensureBoundaryLayersForPoint:()=>pending,
 inferMapClickPoint:()=>({countryId:'cn',regionName:ready?'河南':'',subregionName:ready?'洛阳':''}),
 getPlace:id=>places.find(p=>p.id===id),mapClickPointType:()=>'',mapClickPointTag:()=>'',mapClickPointName:()=>'',
 ensureCheckinOverlayVisible(){},upsertVisit(){},invalidateMapGeoJsonCacheOnly(){},invalidateMapPointRenderCache(){},
 saveState(){saves++;},setMapAddMode(){},closeMapPopupsAndDetail(){},renderPlaceDetail(){},
 renderAfterCheckinChange(){renders++;},showToast(){},t:x=>x,recomputeCoverage(){},$:()=>null};
vm.runInNewContext(source.slice(source.indexOf('async function createMapClickCheckin('),source.indexOf('function handleMapCanvasClick(')),context);
(async()=>{
 await context.createMapClickCheckin({name:'测试地点',lng:112.4,lat:34.6});
 assert.equal(places.length,1);assert.equal(saves,1);assert.equal(renders,1,'Point completes while administrative data is pending');
 assert.equal(places[0].unit,'');complete();await pending;await Promise.resolve();
 assert.equal(places[0].unit,'河南');assert.equal(places[0].subunit,'洛阳');assert.equal(saves,2);
 console.log('PASS: immediate check-in persistence and deferred administrative completion');
})().catch(e=>{console.error(e);process.exitCode=1;});
