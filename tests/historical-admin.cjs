const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),catalog=read('data/historical-admin/catalog.json');
for(const period of catalog.periods){
 const d=read(period.file),pref=d.features.filter(f=>f.properties.level==='prefecture');
 assert.equal(d.features.filter(f=>f.properties.level==='upper').length,period.upperRegions);assert.equal(pref.length,period.prefectures);
 assert(d.features.every(f=>f.properties.year===period.year&&f.properties.name&&f.geometry.coordinates.length));
 assert(d.features.every(f=>f.properties.nameZh&&/[\u3400-\u9fff]/.test(f.properties.nameZh)&&!/[A-Za-z\ufffd]/.test(f.properties.nameZh)),'Every administrative region needs a Chinese name');
 assert(d.features.every(f=>f.properties.labelCoordinates?.length===2&&f.properties.labelMinZoom>=4&&f.properties.areaKm2>0));
 assert(pref.every(f=>f.properties.nameSource?.startsWith('https://')));
}
const {normalizeName,audit}=require('../scripts/normalize-historical-admin-names.cjs');assert.equal(normalizeName('威胜軍军'),'威胜军');assert.equal(normalizeName('富顺監监'),'富顺监');assert.equal(normalizeName('千乘郡'),'千乘郡');assert.equal(audit(undefined,true).length,0,'No duplicate administrative suffixes in any period');const nameIndex=read('data/historical-admin/chinese-names.json');for(const period of catalog.periods)for(const f of read(period.file).features.filter(f=>f.properties.level==='prefecture'))assert.equal(f.properties.nameZh,nameIndex.prefecture[f.properties.id].nameZh,'Name index must match map data');assert.equal(read('data/historical-admin/china-1102.geojson').features.find(f=>f.properties.name==='Weisheng Jun').properties.nameZh,'威胜军');
const han=read('data/historical-admin/china-2.geojson').features;
assert.equal(han.find(f=>f.properties.name==='Qiansheng Jun').properties.nameZh,'千乘郡');assert.equal(han.find(f=>f.properties.name==='Zho Jun').properties.nameZh,'涿郡');
const tang=read('data/historical-admin/china-742.geojson').features;
assert.deepEqual(new Set(tang.filter(f=>f.properties.name==='Huan Zhou'&&f.properties.parent==='Lingnan Dao').map(f=>f.properties.nameZh)),new Set(['环州','驩州']));
assert.deepEqual(new Set(tang.filter(f=>f.properties.name==='Yi Zhou'&&f.properties.parent==='Jiannan Dao').map(f=>f.properties.nameZh)),new Set(['翼州','益州']));
const s={mapOverlays:{historicalAdmin:true,populationDensity:true,historicalAdminPeriod:'742',historicalAdminLevel:'upper'}},ctx={document:{getElementById:()=>null},console};vm.createContext(ctx);vm.runInContext(fs.readFileSync('historical-admin.js','utf8'),ctx);ctx.HistoricalAdmin.init({state:()=>s,language:()=> 'zh',fetch:async p=>read(p.split('?')[0])});
const sources=new Map(),layers=new Map(),map={getSource:id=>sources.get(id),getLayer:id=>layers.get(id),addSource:(id,p)=>sources.set(id,{_data:p.data,setData(d){this._data=d;}}),removeSource:id=>sources.delete(id),addLayer:l=>layers.set(l.id,l),removeLayer:id=>layers.delete(id)};
(async()=>{
 await ctx.HistoricalAdmin.sync(map);assert.equal(sources.get('historical-admin')._data.features.length,15);assert(sources.get('historical-admin')._data.features.some(f=>f.properties.displayName==='岭南道'));
 s.mapOverlays.historicalAdminPeriod='1102';s.mapOverlays.historicalAdminLevel='prefecture';await ctx.HistoricalAdmin.sync(map);const features=sources.get('historical-admin')._data.features,labelFeatures=sources.get('historical-admin-labels')._data.features;assert.equal(features.length,330);assert.equal(labelFeatures.length,features.filter(f=>!f.properties.suppressLabel).length);assert(labelFeatures.every(f=>f.geometry.type==='Point'));assert.equal(new Set(labelFeatures.map(f=>f.properties.id)).size,labelFeatures.length);assert(!labelFeatures.some(f=>f.properties.name==='Baoding Jun'));
 const label=layers.get('historical-admin-label');assert.equal(label.layout['text-size'],12);assert.equal(label.layout['text-font'].join('|'),'Open Sans Regular|Arial Unicode MS Regular');assert.equal(label.filter[0],'<=');assert(labelFeatures.some(f=>f.properties.labelMinZoom>=8),'Small prefectures should wait for zoom-in');
 s.mapOverlays.populationDensity=false;await ctx.HistoricalAdmin.sync(map);assert.equal(sources.size,0);assert.equal(layers.size,0);console.log('PASS: all Chinese names, homonym disambiguation, one label per region, size thresholds, period switching and cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});
