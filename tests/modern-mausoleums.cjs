const assert=require('node:assert/strict'),c=require('../data/imperial-tombs/catalog.json'),api=require('../imperial-tombs.js'),periods=require('../historical-periods.js');
const get=id=>c.items.find(x=>x.id===id);
for(const id of ['modern-zhongshan','modern-mao-hall']){const x=get(id);assert(x.mapEligible);assert.equal(periods.tombPeriod(x),'近现代');assert.equal(x.coordinates.crs,'WGS84');assert(x.coordinates.target.includes('非'));assert(api.geojson(c,'近现代',8).features.some(f=>f.id===id));}
assert.equal(get('modern-zhongshan').nature,'actual_burial');assert.equal(get('modern-zhongshan').lifespanText,'1866—1925年');
assert.equal(get('modern-mao-hall').siteRole,'preserved_remains_memorial');assert.equal(get('modern-mao-hall').nature,'commemorative');assert.equal(get('modern-mao-hall').lifespanText,'1893—1976年');
assert(get('peng-hengshui').mapEligible);assert.equal(get('qing-cian').parentId,'qing-east');assert.equal(get('qing-cian').locationReference.parentId,'qing-east');
console.log('PASS: modern sites, nature distinctions, biographies, map candidates and Cian cemetery membership');

assert.equal(get('modern-mao-hall').coordinates.status,'verified_wgs84');assert(!get('modern-mao-hall').coordinates.estimate);assert.equal(api.geojson(c,'近现代',8).features.find(f=>f.id==='modern-mao-hall').properties.name,'毛主席纪念堂');

assert.equal(get('modern-zhongshan').coordinates.status,'verified_wgs84');assert(!get('modern-zhongshan').coordinates.estimate);assert.equal(api.geojson(c,'近现代',8).features.find(f=>f.id==='modern-zhongshan').properties.name,'中山陵');

const wu=get('wu-jiang');assert.equal(wu.coordinates.sourceId,'geo-wu-memorial');assert(wu.coordinates.target.includes('纪念馆'));assert(wu.coordinates.lat>32.052&&wu.coordinates.lat<32.053);assert(wu.coordinates.lng>118.834&&wu.coordinates.lng<118.835);assert(wu.coordinateAlternatives.some(p=>p.sourceId==='geo-osm-791617219'));
