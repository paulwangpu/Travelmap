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
const heritage=JSON.parse(fs.readFileSync(path.join(root,'data/world-heritage.json'),'utf8')),angkor=heritage.items.find(x=>x.id==='whc-668'),miniAngkor=miniProgramChecklist.worldHeritage.find(x=>x.id==='whc-668');
assert.deepEqual([angkor.lat,angkor.lng],[13.4124901,103.866592]);assert.deepEqual(heritage.coordinates['吴哥窟'].slice(0,2),[angkor.lat,angkor.lng]);assert.deepEqual([miniAngkor.latitude,miniAngkor.longitude],[angkor.lat,angkor.lng]);assert.deepEqual(angkor.coordinateReference.originalCatalogCoordinates,[103.8333,13.43333]);assert.equal(angkor.idNo,'668');assert.equal(angkor.name,'吴哥窟');assert.equal(angkor.dateInscribed,'1992');assert.match(angkor.coordinateReference.note,/代表位置/);
const temple=JSON.parse(fs.readFileSync(path.join(root,'data/angkor/surroundings.geojson'),'utf8')).features.find(f=>f.properties.nameEn==='Angkor Wat');assert.deepEqual([angkor.lng,angkor.lat],temple.properties.labelCoordinates);
console.log('PASS: Angkor heritage point matches Angkor Wat across web/mini-program and retains identity and source coordinates');
