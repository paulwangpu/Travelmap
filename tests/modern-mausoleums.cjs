const assert=require('node:assert/strict'),c=require('../data/imperial-tombs/catalog.json'),api=require('../imperial-tombs.js'),periods=require('../historical-periods.js');
const get=id=>c.items.find(x=>x.id===id);
for(const id of ['modern-zhongshan','modern-mao-hall']){const x=get(id);assert(x.mapEligible);assert.equal(periods.tombPeriod(x),'近现代');assert.equal(x.coordinates.crs,'WGS84');assert(x.coordinates.target.includes('非'));assert(api.geojson(c,'近现代',8).features.some(f=>f.id===id));}
assert.equal(get('modern-zhongshan').nature,'actual_burial');assert.equal(get('modern-zhongshan').lifespanText,'1866—1925年');
assert.equal(get('modern-mao-hall').siteRole,'preserved_remains_memorial');assert.equal(get('modern-mao-hall').nature,'commemorative');assert.equal(get('modern-mao-hall').lifespanText,'1893—1976年');
assert(get('peng-hengshui').mapEligible);assert.equal(get('qing-cian').parentId,'qing-east');assert.equal(get('qing-cian').locationReference.parentId,'qing-east');
console.log('PASS: modern sites, nature distinctions, biographies, map candidates and Cian cemetery membership');
