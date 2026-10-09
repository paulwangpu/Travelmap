const assert=require('node:assert/strict'),fs=require('node:fs');
require('../historical-periods.js');require('../ancient-capital-walls.js');require('../angkor-sites.js');
const rectangle={type:'Polygon',coordinates:[[[0,0],[20,0],[20,10],[17,10],[14,10],[11,10],[8,10],[5,10],[0,10],[0,0]]]};
assert.ok(Math.hypot(...AncientCapitalWalls.boundaryLabelPosition(rectangle).map((v,i)=>v-[10,10][i]))<1e-9,'Split straight edge must be centered over the whole run');
const osm=JSON.parse(fs.readFileSync('data/angkor/osm.geojson')),efeo=JSON.parse(fs.readFileSync('data/angkor/efeo.geojson'));
assert.equal(osm.features.length,121);assert.equal(efeo.features.length,3);
assert.equal(new Set(osm.features.map(f=>f.properties.id)).size,121);
for(const f of [...osm.features,...efeo.features]){assert.match(f.properties.name,/[\u3400-\u9fff]/);assert.ok(AngkorSites.categories[f.properties.category]);assert.ok(f.properties.sourceUrl.startsWith('https://'));assert.equal(f.properties.license,f.properties.origin==='osm'?'ODbL':'CC BY-NC-SA 4.0');}
assert.ok(osm.features.some(f=>f.geometry.type==='Polygon'&&f.geometry.coordinates.length>1)||osm.features.some(f=>f.geometry.type==='MultiPolygon'&&f.geometry.coordinates.some(p=>p.length>1)),'Preserve polygon holes');
const surroundings=JSON.parse(fs.readFileSync('data/angkor/surroundings.geojson')),imported=JSON.parse(fs.readFileSync('docs/angkor-surroundings-import.json'));
assert.equal(surroundings.features.length,23);for(const name of ['吴哥寺（小吴哥）','女王宫','崩密列','神牛寺'])assert.ok(surroundings.features.some(f=>f.properties.name===name));
for(const f of surroundings.features){assert.deepEqual(f.geometry,imported.sourceGeometries[f.properties.id]);assert.match(f.properties.name,/[\u3400-\u9fff]/);}
const state={mapOverlays:{chinaAncientCapitals:true,ancientCapitalWalls:true,ancientCapitalPeriods:{},angkorSites:false,angkorEfeo:false}};
global.fetch=async u=>({ok:true,json:async()=>u.includes('surroundings.geojson')?surroundings:u.includes('osm.geojson')?osm:efeo});
let language='zh';
AngkorSites.init({state:()=>state,language:()=>language,error:()=>{throw Error('Load failure')}});
const sources=new Map(),layers=new Map(),images=new Map(),map={hasImage:id=>images.has(id),addImage:(id,v)=>images.set(id,v),getSource:id=>sources.get(id),getLayer:id=>layers.get(id),getStyle:()=>({layers:[]}),addSource:(id,s)=>sources.set(id,{...s,setData(d){this.data=d}}),addLayer:l=>layers.set(l.id,l),setLayoutProperty:(id,k,v)=>{layers.get(id).layout||={};layers.get(id).layout[k]=v;}};
(async()=>{
 await AngkorSites.sync(map);assert.equal(AngkorSites.collection().features.length,147);assert.equal(sources.get('angkor-capital').data.features.length,1);
 language='en';await AngkorSites.sync(map);assert.equal(sources.get('angkor-capital').data.features[0].properties.displayName,'Angkor Thom');
 language='zh';await AngkorSites.sync(map);assert.equal(sources.get('angkor-capital').data.features[0].properties.displayName,'吴哥城');
 assert.equal(layers.get('angkor-capital-point').minzoom,0);assert.equal(layers.get('angkor-labels').minzoom,13);assert.ok(layers.get('angkor-city-fill').paint['fill-opacity']>.1);
 assert.ok(!sources.get('angkor-site-labels').data.features.some(f=>f.properties.role==='city-extent'),'One main city label and icon');
 state.mapOverlays.ancientCapitalWalls=false;await AngkorSites.sync(map);assert.equal(AngkorSites.collection().features.length,0);assert.equal(AngkorSites.capital().features.length,1,'Capital icon independent of wall control');
 state.mapOverlays.ancientCapitalWalls=true;state.mapOverlays.ancientCapitalPeriods={'宋辽金西夏':false,元:false,明:false};await AngkorSites.sync(map);assert.ok(AngkorSites.collection().features.some(f=>f.properties.name==='神牛寺'));assert.ok(!AngkorSites.collection().features.some(f=>f.properties.name==='女王宫'));
 state.mapOverlays.ancientCapitalTangWalls=false;assert.ok(!AngkorSites.collection().features.some(f=>f.properties.name==='神牛寺'));
 for(const k of ['隋唐','五代十国','宋辽金西夏','元','明'])state.mapOverlays.ancientCapitalPeriods[k]=false;await AngkorSites.sync(map);assert.equal(AngkorSites.capital().features.length,0);
 state.mapOverlays.chinaAncientCapitals=false;await AngkorSites.sync(map);assert.ok([...layers.values()].every(l=>l.layout.visibility==='none'));
 const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('app.js','utf8');assert.ok(!html.includes('showAngkorSitesOnMap'));assert.ok(!app.includes('AngkorSites.legend'));assert.ok(!JSON.parse(fs.readFileSync('data/china-ancient-capitals.json')).items.some(s=>/吴哥/.test(s.name)));
 console.log('PASS: 23 regional sites, original OSM geometry, shared dynasty controls, city fill and low-zoom capital only');
})().catch(e=>{console.error(e);process.exitCode=1});
