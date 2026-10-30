const fs = require('node:fs');
const convert = require('../output/opencc-t2cn.cjs').Converter({from:'tw',to:'cn'});
const file = 'data/us-nps-units.json';
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
let changed = 0;
for (const unit of catalog.units) {
  let name = unit.zhName || '';
  for (let i = 0; i < 4; i++) {
    const next = convert(name);
    if (next === name) break;
    name = next;
  }
  if (name !== unit.zhName) {
    unit.zhNameOriginal ??= unit.zhName;
    unit.zhName = name;
    changed++;
  }
}
catalog.chineseScript = 'Simplified Chinese (OpenCC tw-to-cn); original source names retained when converted';
fs.writeFileSync(file, JSON.stringify(catalog, null, 2) + '\n');
console.log(JSON.stringify({units:catalog.units.length,converted:changed,remaining:catalog.units.filter(unit=>convert(unit.zhName)!==unit.zhName).length}));
