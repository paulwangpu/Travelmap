const assert=require('node:assert/strict');
const c=require('../data/imperial-tombs/catalog.json');
const {mappedItems,isFeudalKing}=require('../imperial-tombs.js');
const byId=new Map(c.items.map(x=>[x.id,x]));
const parent=byId.get('koguryo-jian-kings');
const children=c.items.filter(x=>x.parentId===parent.id);
assert.equal(children.length,12,'all twelve royal tombs in the protection ordinance');
assert.equal(new Set(children.map(x=>x.aliases[0])).size,12,'tomb numbers identify distinct entities');
assert(children.every(x=>!isFeudalKing(x)),'regional monarchs are not ordinary vassal kings');
assert(children.every(x=>x.sourceIds.includes('koguryo-law')));
assert(byId.get('koguryo-ym0001').aliases.includes('长寿王陵'));
assert.equal(byId.get('koguryo-ym0001').coordinates,null,'conflicting longitude must not become a map point');
assert.equal(byId.get('koguryo-ym0001').locationReference.parentId,parent.id);
assert.equal(byId.get('koguryo-ym0541').coordinates.lng,126.21);
assert.equal(byId.get('koguryo-tongmyong').nature,'unknown','traditional founder attribution is not proof of original burial');
assert.equal(byId.get('koguryo-kangso').era,'隋唐','late sixth/seventh century tombs use contemporary dynasty period');
const low=mappedItems(c,'',5),high=mappedItems(c,'',10);
assert(low.some(x=>x.id===parent.id));
assert(!low.some(x=>x.id==='koguryo-ym0541'),'avoid group and component double points');
assert(high.some(x=>x.id==='koguryo-ym0541'));
for(const id of ['koguryo-jian-kings','koguryo-ym0541','koguryo-tongmyong','koguryo-kangso','koguryo-honam-sasin']){
 const x=byId.get(id);assert(x.mapEligible);assert.equal(x.coordinates.crs,'WGS84');assert.equal(x.coordinates.status,'estimated_wgs84');assert(x.coordinates.original);assert(x.coordinates.estimate.extent);
}
for(const id of ['bohai-liudingshan','bohai-longtoushan','bohai-sanlingfen']){
 const x=byId.get(id);assert.equal(x.recordType,'group');assert.equal(x.dynasty,'渤海国');assert.equal(x.coordinates,null,'no city/temple coordinates substituted for royal cemetery');
}
assert(!c.items.some(x=>x.id==='koguryo-general-companion'||x.name==='贞惠公主墓'),'companions and princesses are not independent monarch tombs');
console.log('PASS: twelve royal tombs, candidate identities, coordinate conflicts, group deduplication and Bohai cemetery scope');
