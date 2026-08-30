const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const catalogPath = path.join(root, "data", "us-nps-units.json");
const appPath = path.join(root, "app.js");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const official = new Map([
  ["Joshua Tree National Park", { zhName: "约书亚树国家公园", url: "https://www.nps.gov/jotr/planyourvisit/chinese.htm" }],
  ["Craters of the Moon National Monument", { zhName: "月面环形火山口国家纪念区", url: "https://www.nps.gov/crmo/planyourvisit/simplified-chinese.htm" }],
  ["Craters of the Moon National Preserve", { zhName: "月面环形火山口国家保护区", url: "https://www.nps.gov/crmo/planyourvisit/simplified-chinese.htm" }],
]);

const designationZh = {
  "National Parks": "国家公园",
  "National Monuments": "国家纪念地",
  "National Historic Sites": "国家历史遗址",
  "National Historical Parks": "国家历史公园",
  "National Memorials": "国家纪念园",
  "National Recreation Areas": "国家休闲区",
  "National Preserves": "国家保护区",
  "National Seashores": "国家海岸",
  "National Lakeshores": "国家湖岸",
  "National Battlefields": "国家战场",
  "National Battlefield Parks": "国家战场公园",
  "National Battlefield Sites": "国家战场遗址",
  "National Military Parks": "国家军事公园",
  "National Rivers": "国家河流",
  "National Wild and Scenic Rivers": "国家野生与风景河流",
  "National Parkways": "国家公园大道",
  "National Scenic Trails": "国家风景步道",
  "National Historic Trails": "国家历史步道",
  "National Reserves": "国家保留地",
  "International Historic Sites": "国际历史遗址",
};

function legacyTranslations() {
  const source = fs.readFileSync(appPath, "utf8");
  const map = new Map();
  const pattern = /"([^"\r\n（）]+)（([^"\r\n（）]+)）"/g;
  let match;
  while ((match = pattern.exec(source))) {
    if (/National Park(?: and Preserve)?$/.test(match[2])) map.set(match[2], match[1]);
  }
  return map;
}

async function wikidataLabels(names) {
  const labels = new Map();
  for (let index = 0; index < names.length; index += 45) {
    const batch = names.slice(index, index + 45);
    const values = batch.map((name) => JSON.stringify(name)).join(" ");
    const query = `SELECT ?en ?zh WHERE { VALUES ?en { ${values} } ?item rdfs:label ?en. FILTER(LANG(?en) = "en") OPTIONAL { ?item rdfs:label ?zh. FILTER(LANG(?zh) IN ("zh-hans", "zh-cn", "zh")) } }`;
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
    const response = await fetch(url, { headers: { "User-Agent": "TravelMapNpsCatalog/1.0" } });
    if (!response.ok) throw new Error(`Wikidata HTTP ${response.status}`);
    const data = await response.json();
    for (const binding of data.results?.bindings || []) {
      const en = binding.en?.value;
      const zh = binding.zh?.value;
      if (!en || !zh || labels.has(en)) continue;
      labels.set(en, zh);
    }
  }
  return labels;
}

async function wikipediaZhTitles(names) {
  const labels = new Map();
  for (let index = 0; index < names.length; index += 45) {
    const batch = names.slice(index, index + 45);
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1&prop=langlinks&lllang=zh&lllimit=max&titles=${encodeURIComponent(batch.join("|"))}`;
    const response = await fetch(url, { headers: { "User-Agent": "TravelMapNpsCatalog/1.0" } });
    if (!response.ok) throw new Error(`Wikipedia HTTP ${response.status}`);
    const data = await response.json();
    const normalized = new Map((data.query?.normalized || []).map((entry) => [entry.to, entry.from]));
    const redirects = new Map((data.query?.redirects || []).map((entry) => [entry.to, normalized.get(entry.from) || entry.from]));
    for (const page of data.query?.pages || []) {
      const original = redirects.get(page.title) || normalized.get(page.title) || page.title;
      const zh = page.langlinks?.find((entry) => entry.lang === "zh")?.title;
      if (original && zh) labels.set(original, zh.replace(/\s*\([^()]+\)\s*$/, ""));
    }
  }
  return labels;
}

function fallbackName(unit) {
  const type = designationZh[unit.designation] || unit.designation;
  const suffixes = [
    " National Historical Park and Preserve", " National Monument and Historic Shrine",
    " National Historical Park", " National Battlefield Park", " National Military Park",
    " National Historic Site", " International Historic Site", " National Recreation Area",
    " National Scenic Riverway", " National Scenic and Recreational River", " National Recreational River",
    " Wild and Scenic River", " Scenic and Recreational River", " National Scenic River", " Wild River",
    " National Monument", " National Memorial", " National Preserve", " National Seashore",
    " National Lakeshore", " National Battlefield Site", " National Battlefield", " National Parkway",
    " Memorial Parkway", " Parkway", " National Scenic Trail", " National Historic Trail",
    " National Reserve", " National Park",
  ];
  const base = suffixes.reduce((value, suffix) => value.endsWith(suffix) ? value.slice(0, -suffix.length) : value, unit.name);
  return `${base} · ${type}`;
}

(async () => {
  const legacy = legacyTranslations();
  const names = catalog.units.map((unit) => unit.name);
  const [wikidata, wikipedia] = await Promise.all([wikidataLabels(names), wikipediaZhTitles(names)]);
  const counts = { official: 0, common: 0, project: 0 };
  for (const unit of catalog.units) {
    const nps = official.get(unit.name);
    if (nps) {
      unit.zhName = nps.zhName;
      unit.zhNameSource = "nps-official";
      unit.zhNameSourceUrl = nps.url;
      counts.official += 1;
      continue;
    }
    const common = legacy.get(unit.name) || wikipedia.get(unit.name) || wikidata.get(unit.name);
    if (common) {
      unit.zhName = common;
      unit.zhNameSource = "common";
      unit.zhNameSourceUrl = legacy.has(unit.name) ? "" : wikipedia.has(unit.name) ? "https://zh.wikipedia.org/" : "https://www.wikidata.org/";
      counts.common += 1;
      continue;
    }
    unit.zhName = fallbackName(unit);
    unit.zhNameSource = "project-rule";
    unit.zhNameSourceUrl = "";
    counts.project += 1;
  }
  catalog.translationUpdated = new Date().toISOString().slice(0, 10);
  catalog.translationCounts = counts;
  fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log({ total: catalog.units.length, ...counts });
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
