const assert=require('node:assert/strict'),fs=require('fs');
require('../historical-periods.js');require('../luoyang-capital-evolution.js');
const data=JSON.parse(fs.readFileSync('data/luoyang-capital-evolution.json'));
const walls=JSON.parse(fs.readFileSync('data/ancient-capital-wall-snapshots.geojson'));
assert.deepEqual(data.stages.map(s=>s.id),LuoyangCapitalEvolution.ids);
assert.ok(data.stages.every(s=>s.sources.length&&s.coordinates.length===2));
assert.ok(data.stages.filter(s=>s.id!=='mingqing').every(s=>/未接入|未配准/.test(s.boundaryStatus)));
const mapped=JSON.parse(fs.readFileSync('data/ancient-capital-research-extents.geojson')).features.filter(f=>f.properties.family==='hanweiluo'&&f.properties.osm);assert.equal(mapped.length,23);assert.ok(data.stages.find(s=>s.id==='han').summary.includes('北魏内城'));
const state={mapOverlays:{chinaAncientCapitals:true,luoyangCapitalEvolution:true,luoyangCapitalStage:'all',ancientCapitalWallYear:1866,ancientCapitalPeriods:{}}};
let fetches=0;global.fetch=async url=>{fetches++;return {ok:true,json:async()=>url.includes('luoyang-capital-evolution.json')?data:walls}};
LuoyangCapitalEvolution.init({state:()=>state,language:()=> 'zh'});
const sources=new Map(),layers=new Map();const map={hasImage:()=>true,addImage:()=>{},getSource:id=>sources.get(id),getLayer:id=>layers.get(id),getStyle:()=>({layers:[]}),addSource:(id,s)=>sources.set(id,{...s,setData(d){this.data=d}}),addLayer:l=>layers.set(l.id,l),setLayoutProperty:(id,k,v)=>layers.get(id).layout={...layers.get(id).layout,[k]:v}};
(async()=>{
 await LuoyangCapitalEvolution.sync(map);
 let f=sources.get('luoyang-capital-evolution').data.features;
 assert.ok(f.filter(x=>x.geometry.type==='Point').every(x=>x.properties.capitalIcon.startsWith('ancient-capital-')));
 assert.equal(layers.get('luoyang-evolution-points').type,'symbol');
 assert.equal(f.filter(x=>x.geometry.type==='Point').length,4,'Shared Han/Wei/Jin site should have one marker');
 assert.equal(f.filter(x=>x.geometry.type==='MultiPolygon').length,0,'All wall polygons must be controlled by the shared wall layer');
 state.mapOverlays.luoyangCapitalStage='zhou';await LuoyangCapitalEvolution.sync(map);
 f=sources.get('luoyang-capital-evolution').data.features;assert.equal(f.length,2,'Eastern Zhou must show both Wangcheng and Chengzhou reference sites');
 assert.ok(f.every(x=>x.geometry.type==='Point'));
 let popup='';global.maplibregl={Popup:class{setLngLat(){return this}setHTML(value){popup=value;return this}addTo(){return this}}};
 map.queryRenderedFeatures=()=>[{properties:{siteId:'hanwei',stageIds:'zhou'}}];assert.equal(LuoyangCapitalEvolution.click(map,{point:{x:0,y:0},lngLat:{lng:112.62,lat:34.73}}),true);assert.match(popup,/东周成周/);assert.doesNotMatch(popup,/此点位于今王城公园/);assert.doesNotMatch(popup,/amap.com/);
 map.queryRenderedFeatures=()=>[{properties:{siteId:'wangcheng',stageIds:'zhou'}}];LuoyangCapitalEvolution.click(map,{point:{x:0,y:0},lngLat:{lng:112.415,lat:34.668}});assert.match(popup,/此点位于今王城公园/);
 const park=f.find(x=>x.properties.siteId==='wangcheng').geometry.coordinates;assert.ok(park[0]>112.414&&park[0]<112.418&&park[1]>34.666&&park[1]<34.67,'Wangcheng reference must fall in the park, using WGS84 rather than GCJ-02');
 state.mapOverlays.luoyangCapitalStage='han';await LuoyangCapitalEvolution.sync(map);
 f=sources.get('luoyang-capital-evolution').data.features;assert.equal(f.length,1);assert.ok(f[0].geometry.coordinates[0]>112.6,'Eastern Han is at Han/Wei ruins, not the modern civic center');
 state.mapOverlays.ancientCapitalPeriods['秦汉']=false;await LuoyangCapitalEvolution.sync(map);assert.equal(sources.get('luoyang-capital-evolution').data.features.length,0);

 function inRing(p,r){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
 function contains(p,g){return (g.type==='Polygon'?[g.coordinates]:g.coordinates).some(r=>inRing(p,r[0])&&!r.slice(1).some(h=>inRing(p,h)));}
 state.mapOverlays.luoyangCapitalStage='mingqing';
 for(const year of [1400,1537,1648,1708,1787,1866]){state.mapOverlays.ancientCapitalWallYear=year;await LuoyangCapitalEvolution.sync(map);const features=sources.get('luoyang-capital-evolution').data.features,point=features.find(f=>f.geometry.type==='Point'),polygons=walls.features.filter(f=>f.properties.city==='洛阳'&&f.properties.year===year);assert.ok(point&&polygons.some(f=>contains(point.geometry.coordinates,f.geometry)),'Ming/Qing marker must be inside the selected '+year+' extent');}
 state.mapOverlays.luoyangCapitalEvolution=false;await LuoyangCapitalEvolution.sync(map);assert.equal(layers.get('luoyang-evolution-points').layout.visibility,'none');
 assert.equal(fetches,2,'Switching stages should reuse cached data');
 console.log('PASS: Luoyang stages, site migration, shared markers, extent provenance and filtering');
})().catch(e=>{console.error(e);process.exitCode=1});
