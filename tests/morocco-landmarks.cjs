const assert=require('node:assert/strict'),fs=require('node:fs');
const d=JSON.parse(fs.readFileSync('data/classical-sites/sites.geojson','utf8')),c=JSON.parse(fs.readFileSync('data/classical-sites/catalog.json','utf8'));
const expected={fez:4,marrakesh:6,meknes:5,rabat:4,tangier:4,volubilis:6};
for(const [siteKey,count] of Object.entries(expected)){const all=d.features.filter(f=>f.properties.siteKey===siteKey),details=all.filter(f=>String(f.properties.id).startsWith('morocco-detail-'));assert.equal(details.length,count,siteKey);assert.equal(c.counts[siteKey],all.length);for(const f of details){assert(f.properties.name&&f.properties.enName&&f.properties.period&&f.properties.sourceUrl&&f.properties.referenceUrl);assert.equal(f.properties.labelMinZoom,12);assert(!/中国对应朝代|年代对应中国朝代/.test(f.properties.periodLabel));assert(f.geometry&&f.geometry.coordinates);}}
for(const name of ['非斯王宫','巴迪宫','巴伊亚宫','梅克内斯王宫','穆莱·伊斯梅尔皇家马厩','拉巴特王宫','卡拉卡拉凯旋门','北浴场'])assert(d.features.some(f=>f.properties.name===name&&/Polygon/.test(f.geometry.type)),name);
assert(d.features.some(f=>f.properties.name==='梅舒瓦尔—卡斯巴王城区'&&f.geometry.type==='Point'));
console.log('PASS: 29 Morocco palace, citadel, gate, religious and archaeological details use real OSM geometries with explicit scope notes');
