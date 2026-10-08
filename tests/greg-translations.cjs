const assert = require('node:assert/strict');
require('../ethnic-translations.js');
require('../greg-translations.js');
const {translate,clean} = globalThis.GregTranslations;
for (const [name,expected] of [['Chuang','壮族'],['Pai','白族'],['Puyi','布依族'],['Tung','侗族'],['Nahsi','纳西族'],['Tujen','土族'],['Tuchia','土家族'],['Pulang','布朗族'],['German Swiss','瑞士德语族群'],['Papuans of New Guinea','新几内亚巴布亚族群']]) assert.equal(translate(name),expected);
assert.equal(clean('CuraÃ§ao Islanders'),'Curaçao Islanders');
assert.equal(clean('Tehuelche and Ã“na'),'Tehuelche and Óna');
assert.equal(clean('OlÃ¶ts'),'Olöts');
assert.equal(translate('Unknown historical label'),'Unknown historical label');
assert.match(translate('Sobei, Yamna, Bonggo, Tobati a'),/原名截断/);
assert.equal(translate('Germans'),'德意志人');
assert.notEqual(translate('Wayao'),translate('Yao'));
console.log('PASS: historical aliases, mixed/regional names, mojibake, truncated names and fallback');

assert.equal(translate("Tay","CH"),"傣族");
assert.match(translate("Tay","VM"),/GREG 原分类/);
assert.equal(EthnicTranslations.group("Tay","Vietnam"),"岱依族（Tay）");

assert.equal(translate("Sui","LA"),"库伊族群（苏艾人，原名 Sui）");
assert.equal(translate("Shuichia","CH"),"水族");
assert.equal(translate("Yao","CH"),"瑶族");
assert.match(translate("Wayao","MI"),/非洲 Yao/);
assert.match(translate("Tonga","ZA"),/非洲 Tonga/);
assert.match(translate("Tongans"),/汤加人/);
assert.equal(translate("Kets"),"凯特人");
