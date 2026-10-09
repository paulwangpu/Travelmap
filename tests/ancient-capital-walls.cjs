const assert=require('node:assert/strict'),fs=require('fs');
require('../historical-periods.js');require('../ancient-capital-walls.js');
const data=JSON.parse(fs.readFileSync('data/ancient-capital-walls.geojson'));
assert.equal(data.features.length,3356);assert.equal(new Set(data.features.map(f=>f.properties.sourceId)).size,3356);
assert.ok(data.features.every(f=>f.properties.sourceIds.length&&f.properties.areaKm2>0));
assert.ok(!data.features.some(f=>f.properties.city.includes('辽上京')));
const beijing=data.features.find(f=>f.properties.city==='北京'&&f.properties.begin<=1866&&f.properties.end>=1866);
assert.ok(beijing.geometry.coordinates.flat(2).every(p=>p[0]>116&&p[0]<117&&p[1]>39&&p[1]<41));
const state={mapOverlays:{chinaAncientCapitals:true,ancientCapitalWalls:true,ancientCapitalWallYear:1866,ancientCapitalPeriods:{},ancientCapitalLiaoJinWalls:false,ancientCapitalYuanWalls:false,ancientCapitalQinHanWalls:false,ancientCapitalZhouWalls:false,ancientCapitalHanWeiWalls:false,ancientCapitalShangWalls:false,ancientCapitalSixDynastyWalls:false,ancientCapitalSouthernTangWalls:false}};
const tang={type:"FeatureCollection",features:[{type:"Feature",properties:{Name:"南城牆",layer:"fx-1城牆雙鉤線"},geometry:beijing.geometry},{type:"Feature",properties:{Name:"朱雀門",layer:"fx-3城門"},geometry:beijing.geometry}]};
tang.features.push({type:'Feature',properties:{Name:'含光殿線',layer:'fx-2宮城、皇城'},geometry:{type:'Polygon',coordinates:[[[1,0],[1,4],[0,4],[0,0],[-.001,0],[-.001,4.001],[1.001,4.001],[1.001,0],[1,0]]]}});
global.fetch=async url=>({ok:true,json:async()=>String(url).startsWith("https:")?(decodeURIComponent(String(url)).includes("02唐長安")?tang:{type:"FeatureCollection",features:[]}):String(url).includes("research-extents")?JSON.parse(fs.readFileSync("data/ancient-capital-research-extents.geojson")):data});
AncientCapitalWalls.init({state:()=>state,language:()=> 'zh'});
const sources=new Map(),layers=new Map();
const map={getSource:id=>sources.get(id),getLayer:id=>layers.get(id),getStyle:()=>({layers:[]}),addSource:(id,s)=>sources.set(id,{...s,setData(d){this.data=d}}),addLayer:l=>layers.set(l.id,l),setLayoutProperty:(id,k,v)=>layers.get(id).layout={[k]:v}};
(async()=>{
 for(const capital of [false,true])for(const walls of [false,true])for(const era of [false,true]){Object.assign(state.mapOverlays,{chinaAncientCapitals:capital,ancientCapitalWalls:walls,ancientCapitalWallYear:1866,ancientCapitalPeriods:{明:era,清:era}});await AncientCapitalWalls.sync(map);if(capital&&walls){assert.equal(layers.get('ancient-capital-wall-fill').layout.visibility,'visible');assert.ok(sources.get('ancient-capital-walls').data.features.filter(f=>!f.properties.early&&!f.properties.research).every(f=>f.properties.begin<=1866&&f.properties.end>=1866));}else if(layers.has('ancient-capital-wall-fill'))assert.equal(layers.get('ancient-capital-wall-fill').layout.visibility,'none');}
 state.mapOverlays.chinaAncientCapitals=true;state.mapOverlays.ancientCapitalWalls=true;state.mapOverlays.ancientCapitalWallYear=1400;await AncientCapitalWalls.sync(map);assert.ok(sources.get('ancient-capital-walls').data.features.filter(f=>!f.properties.early&&!f.properties.research).every(f=>f.properties.begin<=1400&&f.properties.end>=1400));
 assert.deepEqual(layers.get('ancient-capital-wall-research-labels').paint['text-color'],['get','color']);
 assert.deepEqual(layers.get('ancient-capital-wall-city-labels').paint['text-color'],['get','color']);
 const named=sources.get('ancient-capital-walls-labels').data.features.filter(f=>!f.properties.research&&!f.properties.early);
 assert.equal(named.length,AncientCapitalWalls.collection().features.filter(f=>!f.properties.research&&!f.properties.early).length,'Every active Ming/Qing extent has a label');
 assert.ok(named.every(f=>f.properties.label===f.properties.city+'（明清）'&&f.geometry.coordinates.length===2&&f.geometry.coordinates.every(Number.isFinite)),'MultiPolygon labels must have finite Point coordinates');
 const onRing=(p,r)=>r.slice(1).some((b,i)=>{const a=r[i],dx=b[0]-a[0],dy=b[1]-a[1],t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1);return t>=-1e-8&&t<=1+1e-8&&Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<1e-8;});
 for(const f of named){const original=data.features.find(x=>x.properties.sourceId===f.properties.sourceId);const polygons=original.geometry.type==='MultiPolygon'?original.geometry.coordinates:[original.geometry.coordinates];assert.ok(polygons.some(r=>onRing(f.geometry.coordinates,r[0])),f.properties.city+' label must lie on an exterior boundary');assert.equal(f.properties.boundaryLabel,true);}
 const researchLabels=sources.get('ancient-capital-walls-labels').data.features.filter(f=>f.properties.research);
 assert.ok(researchLabels.some(f=>f.properties.boundaryLabel),'City extent labels use their boundary');
 assert.ok(researchLabels.filter(f=>/宫|殿|寺|建筑|基址/.test(f.properties.sourceName)).every(f=>!f.properties.boundaryLabel),'Palaces and building footprints retain interior labels');
 assert.equal(AncientCapitalWalls.collection().features.filter(f=>f.properties.early).length,51);
 state.mapOverlays.ancientCapitalTangWalls=false;assert.equal(AncientCapitalWalls.collection().features.filter(f=>f.properties.early).length,0);assert.ok(AncientCapitalWalls.collection().features.length>1000);
 state.mapOverlays.ancientCapitalTangWalls=true;assert.equal(AncientCapitalWalls.collection().features.filter(f=>f.properties.early).length,51);
 for(const tangEnabled of [false,true])for(const mingQingEnabled of [false,true]){Object.assign(state.mapOverlays,{ancientCapitalTangWalls:tangEnabled,ancientCapitalMingQingWalls:mingQingEnabled});const features=AncientCapitalWalls.collection().features;assert.equal(features.filter(f=>f.properties.early).length,tangEnabled?51:0);assert.equal(features.some(f=>!f.properties.early&&!f.properties.research),mingQingEnabled);}
 Object.assign(state.mapOverlays,{ancientCapitalTangWalls:true,ancientCapitalMingQingWalls:true});
 state.mapOverlays.ancientCapitalTangWalls=false;state.mapOverlays.ancientCapitalMingQingWalls=false;
 for(const northSouth of [false,true])for(const wudai of [false,true]){Object.assign(state.mapOverlays,{ancientCapitalHanWeiWalls:northSouth,ancientCapitalSouthernTangWalls:wudai});const f=AncientCapitalWalls.collection().features;assert.equal(f.some(x=>x.properties.family==='sixdynasties'),northSouth);assert.equal(f.some(x=>x.properties.family==='southerntang'),wudai);assert.equal(f.some(x=>x.properties.sourceName.includes('吴越海塘')),wudai);assert.ok(f.every(x=>['魏晋南北朝','五代十国'].includes(x.properties.period)));}
 Object.assign(state.mapOverlays,{ancientCapitalSixDynastyWalls:false,ancientCapitalHanWeiWalls:false,ancientCapitalSouthernTangWalls:false,ancientCapitalTangWalls:true,ancientCapitalMingQingWalls:true});
 assert.deepEqual(layers.get('ancient-capital-wall-detail-fill').filter,['all',['has','tangDetail'],['==',['geometry-type'],'Polygon']]);
 assert.deepEqual(layers.get('ancient-capital-wall-fill').filter,['all',['!', ['has','tangDetail']],['==',['geometry-type'],'Polygon']]);
 const hanguang=AncientCapitalWalls.collection().features.find(f=>f.properties.sourceName==='含光殿線');assert.equal(hanguang.geometry.type,'LineString');assert.equal(hanguang.geometry.coordinates.length,4);assert.deepEqual(hanguang.geometry.coordinates[0],[1.0005,0]);
 for(const han of [false,true])for(const shang of [false,true]){Object.assign(state.mapOverlays,{ancientCapitalHanWeiWalls:han,ancientCapitalShangWalls:shang,ancientCapitalTangWalls:false,ancientCapitalMingQingWalls:false});const f=AncientCapitalWalls.collection().features;assert.equal(f.some(x=>x.properties.sourceId==='hanwei-inner-south-inferred'),han);assert.equal(f.some(x=>x.properties.family==='sixdynasties'),han);assert.equal(f.some(x=>x.properties.sourceId==='anyang-huanbei-city-reference'),shang);assert.equal(f.some(x=>x.properties.sourceId==='zhengzhou-shang-outer-west-south'),shang);assert.ok(f.every(x=>['魏晋南北朝','夏商'].includes(x.properties.period)));}
 Object.assign(state.mapOverlays,{ancientCapitalHanWeiWalls:false,ancientCapitalShangWalls:false,ancientCapitalTangWalls:true,ancientCapitalMingQingWalls:true});
 Object.assign(state.mapOverlays,{ancientCapitalZhouWalls:true,ancientCapitalTangWalls:false,ancientCapitalMingQingWalls:false});const zhou=AncientCapitalWalls.collection().features;assert.equal(zhou.length,41);assert.equal(zhou.filter(f=>f.properties.city==='邯郸').length,11);assert.equal(zhou.filter(f=>f.properties.city==='新郑').length,23);assert.ok(zhou.some(f=>f.geometry.type==='Polygon'));assert.ok(zhou.some(f=>f.geometry.type==='LineString'));assert.equal(zhou.find(f=>f.properties.sourceId==='wangcheng-protection-reference').properties.validationMeters,157);Object.assign(state.mapOverlays,{ancientCapitalZhouWalls:false,ancientCapitalTangWalls:true,ancientCapitalMingQingWalls:true});
 Object.assign(state.mapOverlays,{ancientCapitalQinHanWalls:true,ancientCapitalTangWalls:false,ancientCapitalMingQingWalls:false});const qinhan=AncientCapitalWalls.collection().features;assert.equal(qinhan.length,44);assert.equal(qinhan.filter(f=>f.geometry.type==='LineString').length,13);assert.ok(!qinhan.some(f=>f.properties.sourceId==='osm-way-821525318'));Object.assign(state.mapOverlays,{ancientCapitalQinHanWalls:false,ancientCapitalTangWalls:true,ancientCapitalMingQingWalls:true});
 const luotang=JSON.parse(fs.readFileSync('data/ancient-capital-research-extents.geojson')).features.filter(f=>f.properties.family==='suitangluo');assert.equal(luotang.length,30);assert.equal(luotang.filter(f=>f.properties.sourceId.startsWith('suitang-luoyang-survey')).length,14);assert.ok(luotang.filter(f=>f.properties.sourceId.startsWith('suitang-luoyang-survey')).every(f=>f.geometry.type==='LineString'));
 for(const key of ['ancientCapitalShangWalls','ancientCapitalZhouWalls','ancientCapitalQinHanWalls','ancientCapitalHanWeiWalls','ancientCapitalSixDynastyWalls','ancientCapitalSouthernTangWalls','ancientCapitalLiaoJinWalls','ancientCapitalYuanWalls'])state.mapOverlays[key]=true;
 await AncientCapitalWalls.sync(map);
 const colorFeatures=sources.get('ancient-capital-walls').data.features;
 assert.ok(colorFeatures.filter(f=>f.properties.research).every(f=>f.properties.color===(f.properties.waterFeature?'#277caa':f.properties.fixedLandmark?'#111111':HistoricalPeriods.colors[f.properties.period])));
 const jin=colorFeatures.find(f=>f.properties.sourceId==='beijing-jin-buriedarea-2019');assert.equal(jin.properties.color,HistoricalPeriods.colors['宋辽金西夏']);
 for(const label of sources.get('ancient-capital-walls-labels').data.features)assert.ok(/^#[0-9a-f]{6}$/i.test(label.properties.color));
 const queries=[];let popup;
 global.maplibregl={Popup:class{setLngLat(){return this}setHTML(h){popup=h;return this}addTo(){return this}}};
 const event={point:{x:100,y:200},lngLat:{lng:108.9,lat:34.2}};
 map.queryRenderedFeatures=(box,options)=>{queries.push({box,options});return options.layers[0]==='ancient-capital-wall-line'?[{properties:{early:true,sourceName:'南城牆'}}]:[]};
 assert.equal(AncientCapitalWalls.click(map,event),true);
 assert.deepEqual(queries[0].box,[[94,194],[106,206]]);assert.match(popup,/南城牆/);assert.equal(queries.length,2);
 queries.length=0;map.queryRenderedFeatures=(box,options)=>{queries.push({box,options});return options.layers[0]==='ancient-capital-wall-fill'?[{properties:{early:true,sourceName:'皇城'}}]:[]};
 assert.equal(AncientCapitalWalls.click(map,event),true);assert.deepEqual(queries[2].box,event.point);
 state.mapOverlays.ancientCapitalWalls=false;queries.length=0;assert.equal(AncientCapitalWalls.click(map,event),false);assert.equal(queries.length,0);
 console.log('PASS: capital master switch and independent wall/era controls across all combinations');
})().catch(e=>{console.error(e);process.exitCode=1});
const counts={};for(const year of [1400,1537,1648,1708,1787,1866])counts[year]=data.features.filter(f=>f.properties.begin<=year&&f.properties.end>=year).length;assert.ok(Object.values(counts).every(n=>n>1000));
