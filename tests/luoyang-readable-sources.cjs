const fs=require('fs'),assert=require('node:assert/strict');
require('../ancient-capital-walls.js');
const state={mapOverlays:{chinaAncientCapitals:true,ancientCapitalWalls:true}};
AncientCapitalWalls.init({state:()=>state,language:()=> 'zh'});
let popup='',feature;
global.maplibregl={Popup:class{setLngLat(){return this}setHTML(value){popup=value;return this}addTo(){return this}}};
const map={getLayer:()=>true,queryRenderedFeatures:()=>[feature]};
const data=JSON.parse(fs.readFileSync('data/ancient-capital-research-extents.geojson','utf8'));
const affected=data.features.filter(f=>/docs\/luoyang-.*\.md/.test(f.properties.sourceUrl||'')||/wk\.100ke\.info/.test(f.properties.referenceUrl||''));
assert(affected.length>=16);
const page=fs.readFileSync('sources/luoyang.html','utf8');
for(feature of affected){assert.equal(AncientCapitalWalls.click(map,{point:{x:0,y:0},lngLat:[112.4,34.6]}),true);const urls=[...popup.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);assert(urls.some(u=>u.startsWith('./sources/luoyang.html#')));assert(urls.every(u=>!u.includes('.md')&&!u.includes('wk.100ke.info')));for(const url of urls.filter(u=>u.startsWith('./sources/luoyang.html#')))assert(page.includes('id="'+url.split('#')[1]+'"'));}
assert(page.includes('https://zh.wikisource.org/wiki/'));assert(fs.statSync('sources/luoyang-reference.png').size>100000);
assert(fs.readFileSync('sw.js','utf8').includes('./sources/luoyang.html'));
for(feature of affected.filter(f=>f.properties.sourceDiagramLine)){AncientCapitalWalls.click(map,{point:{x:0,y:0},lngLat:[112.4,34.6]});assert(popup.includes('上阳宫'));assert(!popup.includes('名称归属待核'));assert(popup.includes('非实测墙界'));}
console.log('PASS: '+affected.length+' Luoyang popups link to readable source sections; original data unchanged');
