const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

function body(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} exists`);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}" && --depth === 0) return source.slice(open + 1, index);
  }
  throw new Error(`Could not parse ${name}`);
}

const geographyPolicy = body("canUseChecklistCatalogGeography");
assert.match(geographyPolicy, /key === "china5a"/);
assert.match(geographyPolicy, /checklistCoordinateFor\(item, group\)/);
assert.match(geographyPolicy, /coords\?\.\[2\]/);

const statusKeys = body("checklistStatusKeys");
assert.match(statusKeys, /checklistStatusCache\.signature && checklistStatusCacheReusable/);
assert.match(statusKeys, /queueMicrotask/);

const toggle = body("toggleChecklistItem");
assert.match(toggle, /canUseChecklistCatalogGeography\(key, item, group\)/);
assert.match(toggle, /else if \(changedPlace\) addCoverageForPlace\(changedPlace\)/);

console.log("PASS: checklist taps avoid boundary blocking and repeated full status rebuilds");
