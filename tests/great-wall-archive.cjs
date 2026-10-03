const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {integrate,types}=require('../scripts/integrate-great-wall-archive.cjs');
const data=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/great-wall/features.geojson'))),added=data.features.filter(f=>f.properties.source==='great-wall-archive'),records=data.features.flatMap(f=>f.properties.archiveRecords||[]);
assert.equal(added.length,1494);assert.equal(records.length,6);assert.equal(new Set([...added.map(f=>f.properties.originalId),...records.map(r=>r.code)]).size,1500);
for(const f of added){assert.equal(f.geometry.type,'Point');assert.equal(f.properties.name,f.properties.rawFields.name_zh);assert.equal(f.properties.category,types[f.properties.rawFields.type_en]);assert.equal(f.properties.license,'CC BY 4.0');assert.equal(f.properties.attribution,'Great Wall Archive');assert.equal(f.properties.rawFields.dynasty_code,String(f.properties.rawFields.dynasty_code));}
const local='C:/Users/paulw/Desktop/great-wall-heritage-sites.geojson';if(fs.existsSync(local)){const input=JSON.parse(fs.readFileSync(local)),rebuilt=integrate(data,input);assert.ok(JSON.stringify(rebuilt.data)===JSON.stringify(data),'idempotent build');for(const f of added){const original=input.features.find(g=>g.properties.code===f.properties.originalId);assert.deepEqual(f.geometry,original.geometry);assert.deepEqual(f.properties.rawFields,original.properties);}for(const record of records)assert.deepEqual(record.rawFields,input.features.find(g=>g.properties.code===record.code).properties);}
const source=fs.readFileSync(path.resolve(__dirname,'../great-wall.js'),'utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(source.match(/const eras=[^\n]+/)[0]+source.match(/const colors =[^\n]+/)[0]+source.slice(source.indexOf('function detailEra('),source.indexOf('function filtered(')),ctx);
for(const f of added.filter(f=>f.properties.dynasty==='other'))assert.equal(ctx.detailColor(f.properties),'#5b6470');
assert.equal(added.filter(f=>f.properties.dynasty==='other').length,16); // Two source-code Sui records are explicitly Ming in the full survey map.
for(const [code,era] of Object.entries({'04':'han','05':'other','07':'northern-wei','08':'northern-wei','10':'northern-wei','12':'other','15':'liao-jin','17':'ming'})) {
 assert.equal(ctx.detailEra({source:'great-wall-archive',dynasty:'ming',rawFields:JSON.stringify({dynasty_code:code})}),era,'raw survey code takes precedence');
}
assert.equal(ctx.detailEra({name:'唐代烽燧',originalPath:'汉长城'}),'other'); // An explicit period is stronger than a broad folder.
assert.equal(ctx.detailEra({name:'唐家会堡'}),'ming'); // Place-name characters are not dynasty evidence.
assert.equal(ctx.detailEra({name:'北周长城'}),'northern-wei');
assert.match(source,/Great Wall Archive ↗/);assert.match(source,/CC BY 4.0/);assert.match(source,/typeof p.archiveRecords==='string'/);
// Separate survey IDs and conflicting dynasties remain separate even at one position.
const point=(code,dynasty)=>({type:'Feature',geometry:{type:'Point',coordinates:[110,40]},properties:{code,name_zh:'测试堡',name_en:'Test fort',type_en:'Fortress',dynasty_code:dynasty,dynasty_en:dynasty}});
const old={type:'FeatureCollection',features:[{id:'old',geometry:{type:'Point',coordinates:[110,40]},properties:{name:'测试堡',category:'fortress',dynasty:'liao-jin'}}]};
assert.equal(integrate(old,{type:'FeatureCollection',features:[point('1','03'),point('2','17')]}).report.added,2);
assert.equal(integrate(old,{type:'FeatureCollection',features:[point('1','15')]}).report.merged,1);
console.log('PASS: Archive 1500 records retained, 1494 additions/6 enrichments, dynasty conflicts, types, original fields/geometry, gray historical periods and repeat build');
