const assert=require('node:assert/strict');
const periods=require('../historical-periods.js'),tombs=require('../imperial-tombs.js'),catalog=require('../data/imperial-tombs/catalog.json');
for(const make of [periods.capitalImage,tombs.markerImage]){
 const image=make(periods.colors['明']),original=new Uint8Array(image.data),visited=periods.visitedImage(image);
 assert.deepEqual(image.data,original,'badge must not change the unvisited image');
 const pixel=(x,y)=>Array.from(visited.data.slice((y*40+x)*4,(y*40+x)*4+4));
 assert.deepEqual(pixel(31,3),[220,38,38,255],'red visited badge');
 assert.deepEqual(pixel(31,10),[255,255,255,255],'white check');
 assert.deepEqual(pixel(20,25),Array.from(original.slice((25*40+20)*4,(25*40+20)*4+4)),'period color remains');
}
const plain=tombs.geojson(catalog).features,visited=tombs.geojson(catalog,'',10,{},{},x=>x.id==='ming-xiao').features;
const by=(rows,id)=>rows.find(f=>f.properties.id===id).properties;
assert.equal(by(visited,'ming-xiao').done,true);assert(by(visited,'ming-xiao').name.startsWith('✓ '));assert(by(visited,'ming-xiao').icon.endsWith('-visited'));assert.equal(by(visited,'ming-xiao').color,by(plain,'ming-xiao').color);
assert.equal(by(visited,'qing-yong').done,false);assert.equal(by(visited,'qing-yong').icon,by(plain,'qing-yong').icon);
const single=tombs.geojson(catalog,'',10,{},{},x=>x.id==='ming-chang').features;
const overview=tombs.geojson(catalog,'',5,{},{},x=>x.id==='ming-chang').features;
assert.equal(by(single,'ming-chang').done,true);assert.equal(by(overview,'ming13').done,false,'one visited child must not mark the whole cemetery');
assert(!periods.visitedSvg(periods.capitalSvg('#123456'),false).includes('#dc2626'));assert(periods.visitedSvg(periods.capitalSvg('#123456'),true).includes('#dc2626'));
console.log('PASS: visited badges, unchanged era colors, independent tomb/group status and reversible markers');
