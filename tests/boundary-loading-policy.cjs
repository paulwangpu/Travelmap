const fs = require('node:fs');
const assert = require('node:assert/strict');

const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'app.js'), 'utf8');

function body(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} exists`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}' && --depth === 0) return source.slice(open + 1, index);
  }
  throw new Error(`Could not parse ${name}`);
}

const startup = source.slice(source.indexOf('setLoadingDebug("读取本地快速状态"'), source.indexOf('window.travelMapApp'));
assert.doesNotMatch(startup, /preloadDashboardStats\(\)/, 'startup must not load dashboard detail boundaries');

const levelKeys = body('boundaryKeysForLevel');
assert.doesNotMatch(levelKeys, /admin1|china2|chinaDirect|tw2/, 'map level base keys stay country-only');

const detailTasks = body('boundaryLayerTasksForLevel');
assert.match(detailTasks, /level === "subadmin"[^\n]+"city"/, 'city boundaries are gated by city level');
assert.match(detailTasks, /level === "subadmin"[^\n]+"counties"/, 'county references are gated by city level');

const importBody = body('importPlaces');
assert.match(importBody, /ensureBoundaryDataForLevel\(state\.boundaryLevel/, 'imports follow the active map level');
assert.doesNotMatch(importBody, /preloadBoundaryData/, 'imports must not preload finer boundaries');

const checkinsPage = body('showPage');
assert.doesNotMatch(checkinsPage, /preloadBoundaryData\(false, \["country", "china", "admin1", "china2"/, 'check-ins page must not eagerly load all detail files');

console.log('PASS: detail boundaries load only for the requesting view or level');
