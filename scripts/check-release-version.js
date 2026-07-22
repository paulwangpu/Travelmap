const fs = require("fs");

const expected = (process.argv[2] || "").trim().replace(/^v/i, "");
const appJs = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");

const appMatch = appJs.match(/const\s+appVersion\s*=\s*"([^"]+)"/);
const htmlMatch = html.match(/id="appVersion"[^>]*>\s*v?([^<\s]+)/);

const appVersion = appMatch?.[1] || "";
const htmlVersion = htmlMatch?.[1] || "";
const failures = [];

if (!appVersion) failures.push("app.js appVersion not found");
if (!htmlVersion) failures.push("index.html #appVersion not found");
if (appVersion && htmlVersion && appVersion !== htmlVersion) {
  failures.push(`app.js version ${appVersion} does not match index.html version ${htmlVersion}`);
}
if (expected && appVersion && appVersion !== expected) {
  failures.push(`expected ${expected}, found ${appVersion}`);
}

if (failures.length) {
  console.error("Release version check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Release version OK: v${appVersion}`);
