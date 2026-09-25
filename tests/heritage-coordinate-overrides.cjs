const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const miniProgramChecklist = require(path.join(root, "miniprogram", "data", "checklists.js"));
const china5aCoordinates = JSON.parse(fs.readFileSync(path.join(root, "data", "china-5a-coordinates.json"), "utf8")).coordinates;
const summerPalace = miniProgramChecklist.worldHeritage.find((item) => item.id === "whc-880");

assert.deepEqual(
  [summerPalace.latitude, summerPalace.longitude],
  [39.9999, 116.2755],
  "Summer Palace heritage point uses the corrected Beijing coordinate",
);
assert.match(appSource, /"北京皇家园林-颐和园": \[39\.9999, 116\.2755, "中国"\]/);
assert.match(appSource, /"cn-summer-palace"[^\n]+北京皇家园林-颐和园/);
assert.deepEqual(china5aCoordinates["八达岭长城（八达岭-慕田峪长城）"].slice(0, 2), [40.354244, 116.006841]);
assert.deepEqual(china5aCoordinates["慕田峪长城旅游景区（八达岭-慕田峪长城）"].slice(0, 2), [40.4319, 116.5704]);
assert.match(appSource, /"八达岭-慕田峪长城": \[40\.354244, 116\.006841, "北京"\]/);

console.log("PASS: Summer Palace and Great Wall coordinates are corrected across web and mini-program data");
