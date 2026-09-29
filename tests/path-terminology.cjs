const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

assert.doesNotMatch(html, /轨迹/);
assert.doesNotMatch(app, /轨迹/);
assert.match(app, /overlayTracks: "我的路径"/);
assert.match(app, /importedTracks: "已导入路径"/);
assert.match(app, /trackLength: "路径长度"/);
assert.match(app, /function updateMapCheckboxTooltips/);
assert.match(app, /label\.title = text/);

console.log("PASS: user-facing Chinese track/path terminology is unified as 路径");
