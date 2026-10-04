const assert=require('node:assert/strict'),fs=require('node:fs');
const {mappedItems,geojson}=require('../imperial-tombs.js'),c=require('../data/imperial-tombs/catalog.json');
const low=mappedItems(c,'',5),high=mappedItems(c,'',10);
const {isFeudalKing}=require('../imperial-tombs.js');
const withoutKings=mappedItems(c,'',10,{}, {},false);
assert(withoutKings.length<high.length);
assert(withoutKings.every(x=>!isFeudalKing(x)));
assert(withoutKings.some(x=>x.id==='qin-first'),'emperors remain visible');
assert(high.some(x=>x.preqinClassification?.section==='诸侯国'));
const addedKings=c.items.filter(x=>x.rulerCategory==='feudal_king');
assert.equal(addedKings.length,83);
assert.equal(addedKings.filter(x=>x.mapEligible).length,48);
const liuanParent=c.items.find(x=>x.id==='han-liuan-cemetery');
assert.equal(liuanParent.recordType,'group');
assert.equal(c.items.find(x=>x.id==='han-king-liuan').parentId,liuanParent.id);
const liuanPairs=['gaodadun','madadun','sanxingmiao'].map(k=>c.items.find(x=>x.id==='han-liuan-'+k));
for(const x of liuanPairs){
 assert.equal(x.parentId,liuanParent.id);assert.equal(x.recordType,'group');
 assert.equal(x.coordinates.status,'estimated_wgs84');assert.equal(x.coordinates.sourceDatumExplicit,false);
 assert(x.coordinates.original.includes('北墩')&&x.coordinates.original.includes('南墩'));
 assert(x.coordinates.lat>31.73&&x.coordinates.lat<31.76&&x.coordinates.lng>116.57&&x.coordinates.lng<116.60);
 assert(high.some(p=>p.id===x.id),'paired cemeteries must remain visible at detailed zoom');
}
assert.equal(new Set(liuanPairs.map(x=>x.coordinates.lat+','+x.coordinates.lng)).size,3);
const rudian=c.items.find(x=>x.id==='wei-gaoping-rudian');
assert.equal(rudian.recognition,'traditional');assert(rudian.relatedSiteIds.includes('wei-xizhu-m2'));
assert(rudian.coordinates.lat>34.14&&rudian.coordinates.lat<34.17&&rudian.coordinates.lng>112.46&&rudian.coordinates.lng<112.49);
for(const p of require('../data/imperial-tombs/clear-location-completion.json').locations){
 const item=c.items.find(x=>x.id===p.id);
 assert(item.mapEligible && item.coordinates.crs==='WGS84');
 assert(c.sources.some(x=>x.id===item.coordinates.sourceId));
 assert.equal(item.coordinates.target,p.target);
 assert.equal(item.coordinates.status,p.estimated?'estimated_wgs84':'verified_wgs84');
 if(p.estimated)assert(item.coordinates.estimate.basis&&item.coordinates.estimate.extent);
 if(p.crs==='GCJ-02')assert(Math.abs(item.coordinates.lng-p.lng)>0.001,'GCJ point must be converted');
}
const luPoint=c.items.find(x=>x.id==='han-lu-jiulong').coordinates;
assert(luPoint.lat>35.5 && luPoint.lat<35.52 && luPoint.lng>116.98 && luPoint.lng<117.01,'Han Lu cemetery, not Ming Lu cemetery');
const remaining=require('../data/imperial-tombs/remaining-locations.json');
assert.equal(remaining.mapCandidates,c.mapCandidateIds.length);
assert.equal(remaining.missingIndependentCoordinates,c.items.filter(x=>!x.coordinates&&!x.locationReference).length);
assert(remaining.unlocated.some(x=>x.id==='tang18'&&x.category==='overview_with_mapped_children'));
assert(!remaining.unlocated.some(x=>x.id==='tang-jian'));
assert(addedKings.every(x=>['秦汉','明'].includes(x.era)||x.id==='tuyuhun-murongzhi'));
assert(!geojson(c,'',10,{}, {},()=>true,false).features.some(x=>isFeudalKing(c.items.find(y=>y.id===x.id))));
assert(geojson(c,'',10,{}, {},()=>true,true).features.find(x=>x.id==='han-king-mancheng').properties.done,'re-enabling retains visited rendering');
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
const easternHanPoints=high.filter(x=>x.dynasty.startsWith('东汉')&&x.rulerCategory!=='feudal_king');
assert.equal(easternHanPoints.length,17);
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
const sw=fs.readFileSync(require.resolve('../sw.js'),'utf8');assert(sw.includes(html.match(/imperial-tombs\.js\?v=\d+/)[0]));assert(sw.includes(fs.readFileSync(require.resolve('../imperial-tombs.js'),'utf8').match(/data\/imperial-tombs\/catalog\.json\?v=\d+/)[0]));
console.log(`PASS: ${low.length} overview / ${high.length} detailed points; era filtering, invalid coordinate exclusion, hierarchy, layout and offline assets`);

assert.equal(Object.keys(c.summary)[0],'传说时代');
for(const id of ['wu-jiang','shu-hui','han-chan','han-ping','han-kang','han-yi','zhou-song','zhou-qing','zhou-shun','ming-jingtai','tang-tai','tang-jing2'])assert(high.some(x=>x.id===id),id+' must have a map point');
assert(geojson(c).features.find(x=>x.id==='wu-jiang').properties.name.includes('孙权'));
assert(c.items.find(x=>x.id==='wu-jiang').coordinates.target.includes('非孙权墓室'));
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
