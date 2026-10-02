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

const vm = require("node:vm");
const statsStart = source.indexOf("function refreshRenderedChecklistStats(");
const statsEnd = source.indexOf("function refreshAncientCapitalEraStats(", statsStart);
for (const buttonCount of [0, 10, 50, 100, 359]) {
  let doneCalls = 0, totalCalls = 0, displayCalls = 0;
  const header = { textContent: "" }, achievement = { textContent: "" }, groupCount = { textContent: "" };
  const section = { querySelector: () => header };
  const context = {
    checklistCatalog: { china5a: { byRegion: { Beijing: ["a", "b"] } }, worldHeritage: {} },
    checklistCanonicalKey: () => "linked",
    document: { querySelectorAll: (selector) => {
      if (selector.includes("data-achievement-count")) return buttonCount ? [achievement] : [];
      if (selector === "[data-checklist-group]") return [{ dataset: { checklistGroup: "china5a:Beijing" }, querySelector: () => groupCount }];
      return Array.from({ length: buttonCount }, () => ({ closest: () => section }));
    } },
    checklistDoneCount: () => { doneCalls++; return 101; },
    checklistTotalCount: () => { totalCalls++; return 359; },
    checklistGroupId: (key, group) => `${key}:${group}`,
    displayChecklistItems: (key, items) => { displayCalls++; return items; },
    isChecklistItemDone: (key, item) => item === "a",
  };
  vm.createContext(context);
  vm.runInContext(source.slice(statsStart, statsEnd), context);
  context.refreshRenderedChecklistStats("china5a", "Beijing");
  assert.equal(doneCalls, buttonCount ? 1 : 0);
  assert.equal(totalCalls, buttonCount ? 1 : 0);
  assert.equal(displayCalls, 1);
  assert.equal(groupCount.textContent, "1/2");
  if (buttonCount) {
    assert.equal(header.textContent, "101/359");
    assert.equal(achievement.textContent, "101/359");
    context.checklistDoneCount = () => { doneCalls++; return 100; };
    context.refreshRenderedChecklistStats("china5a");
    assert.equal(header.textContent, "100/359");
    assert.equal(doneCalls, 2);
  }
  const before = doneCalls;
  context.refreshCanonicalChecklistStats("a", new Set(["china5a", "worldHeritage"]));
  assert.equal(doneCalls, before, "already refreshed categories are not counted again");
}
console.log("PASS: checklist geography, status cache, single-pass counts, uncheck counts and linked refresh dedup");
