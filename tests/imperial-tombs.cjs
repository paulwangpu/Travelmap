const assert=require('node:assert/strict'),fs=require('node:fs');
const {mappedItems,geojson}=require('../imperial-tombs.js'),c=require('../data/imperial-tombs/catalog.json');
const low=mappedItems(c,'',5),high=mappedItems(c,'',10);
const xixia=c.items.filter(x=>/^xixia-\d$/.test(x.id));
assert.equal(xixia.length,9);
assert.equal(new Set(xixia.map(x=>{assert(x.mapEligible);assert.equal(x.coordinates.status,'verified_wgs84');return x.coordinates.lat+','+x.coordinates.lng;})).size,9);
assert(low.some(x=>x.id==='xixia9'));assert(!low.some(x=>x.id==='xixia-1'));
assert.equal(high.filter(x=>/^xixia-\d$/.test(x.id)).length,9);assert(!high.some(x=>x.id==='xixia9'));
assert.equal(c.items.find(x=>x.id==='legend-two').nature,'commemorative');
assert(high.some(x=>x.id==='legend-two'));
for(const id of ['nantang-qin','nantang-shun','song-si','song-fu','song-chong','song-mao','song-mu','song-shao']){
 const x=c.items.find(x=>x.id===id);assert(!x.mapEligible);assert.equal(x.coordinates,null);assert.equal(x.locationReference.coordinates.crs,'WGS84');assert(x.locationReference.coordinates.sourceId);
}
assert.equal(c.items.find(x=>x.id==='nanhan-de').disturbance.status,'archaeological_evidence');
const easternHanPoints=high.filter(x=>x.dynasty.startsWith('东汉'));
assert.equal(easternHanPoints.length,14);
for(const id of ['han-xian','jin-chongyang','jin-junyang','wei-jing','wei-ding','wei-jing2','wei-jiemin','later-tang-hui']){
 const x=c.items.find(x=>x.id===id);assert(x.mapEligible);assert.equal(x.coordinates.status,'estimated_wgs84');assert(x.coordinates.estimate.basis);assert.equal(x.coordinates.precision.horizontalAccuracyMeters,null);
}
assert.equal(c.items.find(x=>x.id==='wei-jiemin').biographies[0].birthYear,498);
assert.equal(c.items.find(x=>x.id==='wei-jiemin').biographies[0].deathYear,532);
const southernIds=['han-xuan','han-xianjie','han-jing-east','han-m1048','han-m1055','han-m1071'];
assert.equal(new Set(southernIds.map(id=>{const x=c.items.find(x=>x.id===id);assert.equal(x.coordinates.status,'estimated_wgs84');return x.coordinates.lng+','+x.coordinates.lat;})).size,6);
assert.equal(c.items.find(x=>x.id==='han-shen').biographies[0].deathYear,106);
assert.equal(c.items.find(x=>x.id==='han-xuan').biographies[0].deathYear,168);
assert.equal(c.items.find(x=>x.id==='han-yuan').coordinates.sourceId,'geo-reviewed-han-yuan');
assert(c.items.find(x=>x.id==='han-yuan').coordinates.lat<34.8);
assert(c.items.find(x=>x.id==='han-yuan-tiexie').coordinates.lat>34.8);
assert.equal(c.items.find(x=>x.id==='han-yuan-tiexie').nature,'commemorative');
for(const rows of [low,high])for(const x of rows){assert(x.mapEligible);assert(['verified_wgs84','estimated_wgs84'].includes(x.coordinates.status));assert(!rows.some(p=>p.id===x.parentId));}
assert(low.some(x=>x.id==='ming13'));assert(!low.some(x=>x.id==='ming-chang'));
assert(high.some(x=>x.id==='ming-chang'));assert(!high.some(x=>x.id==='ming13'));
assert(mappedItems(c,'明').every(x=>x.era==='明'));assert.equal(mappedItems(c,'invalid').length,0);
const eras=Object.fromEntries(Object.keys(c.summary).map(era=>[era,['明','隋唐'].includes(era)]));
assert(mappedItems(c,eras).every(x=>['明','隋唐'].includes(x.era)));
assert(mappedItems(c,eras).some(x=>x.era==='隋唐'));assert(mappedItems(c,eras).some(x=>x.era==='明'));
assert.equal(mappedItems(c,Object.fromEntries(Object.keys(c.summary).map(era=>[era,false]))).length,0);
assert(mappedItems(c,'',10,{commemorative:false,cenotaph:false}).every(x=>!['commemorative','cenotaph'].includes(x.nature)));
assert.equal(mappedItems({items:[{mapEligible:true,coordinates:{status:'datum_pending',lat:34,lng:109}}]}).length,0);
assert.equal(mappedItems({items:[{mapEligible:true,coordinates:{status:'verified_wgs84',lat:NaN,lng:109}}]}).length,0);
const q=geojson(c).features.find(x=>x.id==='qin-first');assert(Math.abs(q.geometry.coordinates[0]-109.25389)<0.00001);assert(Math.abs(q.geometry.coordinates[1]-34.38167)<0.00001);
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
assert.match(html,/compact-toggle-pair[^]*?showAncientCapitalsOnMap[^]*?showImperialTombsOnMap/);
assert.match(html,/hazard-toggle-pair[^]*?showArcgisWaterOnMap[^]*?水系[^]*?showGreatWallOnMap/);
for(const id of ['showImperialTombsOnMap','showGreatWallOnMap','showArcgisWaterOnMap'])assert.equal(html.split(`id="${id}"`).length,2);
const sw=fs.readFileSync(require.resolve('../sw.js'),'utf8');assert(sw.includes('imperial-tombs.js?v=55'));assert(sw.includes('data/imperial-tombs/catalog.json?v=33'));
console.log(`PASS: ${low.length} overview / ${high.length} detailed points; era filtering, invalid coordinate exclusion, hierarchy, layout and offline assets`);

assert.equal(Object.keys(c.summary)[0],'传说时代');
for(const id of ['wu-jiang','shu-hui','han-chan','han-ping','han-kang','han-yi','zhou-song','zhou-qing','zhou-shun','ming-jingtai','tang-tai','tang-jing2'])assert(high.some(x=>x.id===id),id+' must have a map point');
assert(geojson(c).features.find(x=>x.id==='wu-jiang').properties.name.includes('孙权'));
assert(c.items.find(x=>x.id==='wu-jiang').coordinates.target.includes('非已确认墓室'));
const ping=c.items.find(x=>x.id==='han-ping').coordinates;
assert(Math.abs(ping.lat-34.36182)<0.0002&&Math.abs(ping.lng-108.64036)<0.0002,'GCJ conversion agrees with independent OSM regional point');
const decisions=require('../data/imperial-tombs/coordinate-decisions.json');
assert.deepEqual(new Set(decisions.approved),new Set(c.mapCandidateIds));

assert.equal(mappedItems({items:[{mapEligible:true,coordinates:{status:'estimated_wgs84',lat:34,lng:109}}]}).length,0);
assert(geojson(c).features.find(x=>x.id==='ming-xianling').properties.name.endsWith('（估）'));

const shang=c.items.filter(x=>x.id.startsWith('shang-m'));
assert.equal(shang.length,10);
for(const x of shang){assert.equal(x.parentId,'yin-kings');assert.equal(x.mapEligible,false);assert.equal(x.coordinates,null);assert.equal(x.locationReference.coordinates.crs,'WGS84');}
assert(high.some(x=>x.id==='yin-kings'),'shared references retain the one cemetery marker');
assert.equal(c.items.find(x=>x.id==='shang-m1567').nature,'unknown');

const {compareChecklistItems}=require('../imperial-tombs.js');
const preqin=c.items.filter(x=>x.era==='先秦').sort(compareChecklistItems);
assert(preqin.every(x=>x.preqinClassification),'every pre-Qin record has a classification');
assert.deepEqual([...new Set(preqin.map(x=>x.preqinClassification.section))],['早期王权与王陵线索','商王室','西周王室候选陵址','东周王室','诸侯国']);
assert(preqin.findIndex(x=>x.id==='shang-m1550')<preqin.findIndex(x=>x.id==='shang-fuhao'));
assert(preqin.findIndex(x=>x.id==='shang-fuhao')<preqin.findIndex(x=>x.id==='shang-m1567'));
assert(preqin.findIndex(x=>x.id==='qi-jing')<preqin.findIndex(x=>x.id==='qi-tian'));
const countriesSeen=new Set();let lastCountry='';
for(const x of preqin.filter(x=>x.preqinClassification.section==='诸侯国')){const country=x.preqinClassification.country;if(country!==lastCountry){assert(!countriesSeen.has(country),'each state must stay together');countriesSeen.add(country);lastCountry=country;}}

const stateFilters=Object.fromEntries(preqin.map(x=>[x.preqinClassification.country,false]));
assert.equal(mappedItems(c,'先秦',10,{},stateFilters).length,0);
const qiOnly=mappedItems(c,'先秦',10,{}, {...stateFilters,齐:true});
assert(qiOnly.length>0&&qiOnly.every(x=>x.preqinClassification.country==='齐'));
assert(mappedItems(c,'明',10,{},stateFilters).length>0,'pre-Qin state filters must not hide other eras');

for(const id of ['zhou-jue','chu-you']){const x=c.items.find(x=>x.id===id);assert(x.mapEligible);assert.equal(x.coordinates.status,'estimated_wgs84');assert(x.coordinates.estimate.extent.includes('公里'));assert.equal(x.coordinates.precision.horizontalAccuracyMeters,null);}
const chuYou=c.items.find(x=>x.id==='chu-you');const chuAnchor=c.items.find(x=>x.id==='chu-wuwangdun');assert.equal(chuYou.coordinates.lng,chuAnchor.coordinates.lng);assert(Math.abs((chuAnchor.coordinates.lat-chuYou.coordinates.lat)*111.32-14.6)<0.01);

const deEstimate=c.items.find(x=>x.id==='nanhan-de');assert(deEstimate.mapEligible);assert.equal(deEstimate.coordinates.status,'estimated_wgs84');assert.equal(deEstimate.coordinates.estimate.derivation.anchorId,'nanhan-kang');assert.equal(deEstimate.coordinates.estimate.derivation.inheritsAnchorUncertainty,true);assert(deEstimate.coordinates.lat>c.items.find(x=>x.id==='nanhan-kang').coordinates.lat);assert.equal(deEstimate.coordinates.precision.horizontalAccuracyMeters,null);

const easternGroups=[...new Set(preqin.filter(x=>x.dynasty==='东周'&&x.id!=='zhou-zhoushan').map(x=>x.preqinClassification.displayGroup))];
assert.deepEqual(easternGroups,['东周王室 · 王城王陵区','东周王室 · 周山王陵区','东周王室 · 金村王陵区']);
assert.equal(c.items.find(x=>x.id==='zhou-ling').parentId,'zhou-zhoushan');
assert.equal(c.items.find(x=>x.id==='zhou-three').parentId,'zhou-zhoushan');
assert.equal(c.items.find(x=>x.id==='zhou-wangcheng').coordinates.status,'estimated_wgs84');
assert(preqin.filter(x=>x.preqinClassification.section==='诸侯国').every(x=>x.preqinClassification.displayGroup===x.preqinClassification.country+'国'));

const completion=require('../data/imperial-tombs/location-completion-audit.json');
assert.equal(completion.newRegionalPoints.length,10);
for(const id of completion.newRegionalPoints){const x=c.items.find(x=>x.id===id);assert(x.mapEligible);assert.equal(x.coordinates.status,'estimated_wgs84');assert(x.coordinates.estimate.extent);assert.equal(x.coordinates.precision.horizontalAccuracyMeters,null);}
assert(c.items.find(x=>x.id==='rong-majiayuan').disputes.some(x=>x.includes('35.046173')));
assert(c.items.find(x=>x.id==='tang-gong').coordinates.lng>112.8);
assert(c.items.find(x=>x.id==='wei-xizhu-m2').coordinates.target.includes('M2独立中心待核'));
