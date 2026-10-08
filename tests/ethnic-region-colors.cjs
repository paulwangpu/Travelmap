const assert = require('node:assert/strict');
require('../ethnic-regions.js');
const {color, canonicalName} = globalThis.EthnicRegions;
const record = (group_,statename,gwgroupid) => ({group_,statename,gwgroupid});
const kurds = ['Iran','Turkey','Iraq','Syria'].map((country,index) => record('Kurds',country,index));
assert.equal(new Set(kurds.map(color)).size,1,'cross-border groups must share a color');
assert.equal(color(record('  KURDS  ','Iraq',10)),color(kurds[0]),'normalize whitespace and case');
for (const [a,b] of [['Mongolians','Mongols'],['Uighur','Uyghur'],['Kazakh','Kazakhs'],['Kirghiz','Kyrgyz'],['Dayak','Dayaks'],['Anuak','Anyuak']]) {
  assert.equal(color(record(a,'China',1)),color(record(b,'Elsewhere',2)),`${a}/${b}`);
}
assert.notEqual(canonicalName(record('Kurds/Yezidis','Iraq',1)),canonicalName(kurds[0]),'mixed groups remain separate');
assert.notEqual(color(record('Yao','China',1)),color(record('Yao','Malawi',2)),'unrelated homonyms remain separate');
assert.equal(color(record('Yao','Malawi',1)),color(record('Yao','Mozambique',2)));
assert.notEqual(canonicalName(record('Chinese','Malaysia',1)),canonicalName(record('Chinese (Han)','China',2)),'do not assume broader categories are identical');
assert.match(color(kurds[0]),/^hsl\(\d+, \d+%, \d+%\)$/);
assert.ok(new Set(Array.from({length:100},(_,i)=>color(record(`Group ${i}`,'Country',i)))).size > 90,'avoid the old eight-color palette');
console.log('PASS: stable cross-border colors, spelling variants, mixed groups, homonyms and palette');
require('../ethnic-kin.js');
for (const [a,b] of [[71008000,81611000],[71011000,81603000],[85013000,91001000],[71009000,71203000]]) {
  assert.equal(color({gwgroupid:a}),color({gwgroupid:b}),`official cross-border kin ${a}/${b}`);
}
assert.notEqual(canonicalName({gwgroupid:77505000}),canonicalName({gwgroupid:71017000}),'Kachin umbrella must not be reduced to Jingpo');
assert.notEqual(canonicalName({gwgroupid:77505000}),canonicalName({gwgroupid:71020000}),'Kachin umbrella must not be reduced to Lisu');
assert.deepEqual(globalThis.EthnicKin.byId[77505000],[603,604]);
console.log('PASS: official Miao/Hmong, Yao/Dao, Papuan and Mongol links; Kachin umbrella');
