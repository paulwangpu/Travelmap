const fs = require('node:fs');
const overrides = JSON.parse(fs.readFileSync('data/language-zh-overrides.json', 'utf8'));
const data = JSON.parse(fs.readFileSync('data/language-areas.geojson', 'utf8'));
let count = 0;
for (const feature of data.features) {
  const p = feature.properties, entry = overrides[p.languageId];
  if (!entry) continue;
  p.nameZh = entry.zh;
  p.nameZhKind = entry.kind;
  p.nameZhNote = entry.note ?? p.nameZhNote ?? '';
  count++;
}
fs.writeFileSync('data/language-areas.geojson', JSON.stringify(data));
console.log(`Applied ${count} reviewed Chinese display names; ${data.features.filter(f => f.properties.nameZh !== f.properties.group_).length} translated records.`);
