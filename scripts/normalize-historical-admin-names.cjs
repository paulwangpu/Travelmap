const fs = require('node:fs');
const path = require('node:path');

// Compare administrative suffixes after normalizing their traditional forms.
// A source name may already contain its type, e.g. 威勝軍 + type 軍.
function normalizeName(name) {
  return name.replace(/[軍監廳]/g, c => ({軍:'军',監:'监',廳:'厅'}[c]))
    .replace(/([军郡州府厅监])\1+$/u, '$1');
}

function audit(root = path.resolve(__dirname, '..'), checkOnly = false) {
  const dir = path.join(root, 'data/historical-admin');
  const catalog = JSON.parse(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8'));
  const indexPath = path.join(dir, 'chinese-names.json');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const changes = [];
  for (const period of catalog.periods) {
    const file = path.join(root, period.file);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const feature of data.features) {
      const p = feature.properties;
      const name = normalizeName(p.nameZh);
      if (name === p.nameZh) continue;
      changes.push({id:p.id, before:p.nameZh, after:name});
      p.nameZh = name;
      if (index.prefecture[p.id]) index.prefecture[p.id].nameZh = name;
      if (p.name === 'Weisheng Jun') {
        p.nameSource = 'https://zh.wikisource.org/wiki/宋史/卷086#威勝軍';
        index.prefecture[p.id].source = p.nameSource;
      }
    }
    if (!checkOnly) fs.writeFileSync(file, JSON.stringify(data) + '\n');
  }
  if (!checkOnly) fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
  return changes;
}

if (require.main === module) {
  const checkOnly = process.argv.includes('--check');
  const changes = audit(undefined, checkOnly);
  console.log(JSON.stringify({checkOnly, count:changes.length, changes}));
  if (checkOnly && changes.length) process.exitCode = 1;
}
module.exports = {normalizeName, audit};
