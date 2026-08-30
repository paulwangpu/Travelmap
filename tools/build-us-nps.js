const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlPath = process.argv[2] || path.join(process.env.TEMP || process.env.TMP || root, "nps-system.html");
const boundaryPath = path.join(root, "data", "us-nps-boundaries.geojson");
const catalogPath = path.join(root, "data", "us-nps-units.json");
const existingTranslations = fs.existsSync(catalogPath)
  ? new Map((JSON.parse(fs.readFileSync(catalogPath, "utf8")).units || []).map((unit) => [unit.name, {
    zhName: unit.zhName,
    zhNameSource: unit.zhNameSource,
    zhNameSourceUrl: unit.zhNameSourceUrl,
  }]))
  : new Map();

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function typeId(label) {
  return label.toLowerCase().replace(/^national\s+/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const html = fs.readFileSync(htmlPath, "utf8");
const sectionPattern = /<button[^>]*class="usa-accordion__button"[^>]*>[\s\r\n]*([^<]+?)\s*\((\d+)\)[\s\r\n]*<\/button>[\s\S]*?<div[^>]*class="usa-accordion__content usa-prose"[^>]*>([\s\S]*?)<\/div>/g;
const groups = [];
const units = [];
let sectionMatch;
while ((sectionMatch = sectionPattern.exec(html))) {
  const designation = decodeHtml(sectionMatch[1]);
  if (designation === "Affiliated Areas") break;
  const expected = Number(sectionMatch[2]);
  const groupId = typeId(designation);
  const items = [];
  const linkPattern = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*,\s*([^<]+?)(?:<br\s*\/>|<\/p>)/gi;
  let linkMatch;
  while ((linkMatch = linkPattern.exec(sectionMatch[3]))) {
    const codeMatch = linkMatch[1].match(/\/([a-z0-9]{4})(?:\/|$)/i);
    if (!codeMatch) throw new Error(`Could not derive park code from ${linkMatch[1]}`);
    const websiteCode = codeMatch[1].toUpperCase();
    const name = decodeHtml(linkMatch[2]);
    const boundaryCodeOverrides = {
      "Kings Canyon National Park": "KICA",
      "Sequoia National Park": "SEQU",
    };
    const code = boundaryCodeOverrides[name] || websiteCode;
    const unit = {
      code,
      ...(code !== websiteCode ? { alternateCodes: [websiteCode] } : {}),
      name,
      location: decodeHtml(linkMatch[3]),
      designation,
      designationId: groupId,
      url: `https://www.nps.gov/${websiteCode.toLowerCase()}/index.htm`,
    };
    items.push(unit);
    units.push(unit);
  }
  if (designation === "National Historical Parks" && /Klondike Gold Rush National Historical Park/.test(sectionMatch[3])) {
    const malformedIndex = items.findIndex((unit) => unit.code === "KLGO" && unit.name !== "Klondike Gold Rush National Historical Park");
    if (malformedIndex >= 0) {
      const [malformed] = items.splice(malformedIndex, 1);
      units.splice(units.indexOf(malformed), 1);
    }
    [
      { code: "KLGO", alternateCodes: ["KLSE"], name: "Klondike Gold Rush National Historical Park", location: "Alaska and Washington" },
      { code: "LEWI", name: "Lewis and Clark National Historical Park", location: "Oregon and Washington" },
    ].forEach((entry) => {
      const unit = { ...entry, designation, designationId: groupId, url: `https://www.nps.gov/${entry.code.toLowerCase()}/index.htm` };
      items.push(unit);
      units.push(unit);
    });
  }
  if (designation === "National Memorials" && /Fort Caroline National Memorial/.test(sectionMatch[3])) {
    const unit = {
      code: "FOCA",
      name: "Fort Caroline National Memorial",
      location: "Florida",
      designation,
      designationId: groupId,
      url: "https://www.nps.gov/foca/index.htm",
    };
    items.push(unit);
    units.push(unit);
  }
  if (designation === "National Monuments" && /Hohokam Pima National Monument/.test(sectionMatch[3])) {
    const unit = {
      code: "HOPI",
      name: "Hohokam Pima National Monument",
      location: "Arizona",
      designation,
      designationId: groupId,
      url: "https://www.nps.gov/hopi/index.htm",
    };
    items.push(unit);
    units.push(unit);
  }
  if (designation === "National Parkways" && /John D\. Rockefeller, Jr\. Memorial Parkway/.test(sectionMatch[3])) {
    const unit = {
      code: "JODR",
      name: "John D. Rockefeller, Jr. Memorial Parkway",
      location: "Wyoming",
      designation,
      designationId: groupId,
      url: "https://www.nps.gov/jodr/index.htm",
    };
    items.push(unit);
    units.push(unit);
  }
  if (designation === "National Recreation Areas") {
    [
      ["LACH", "Lake Chelan National Recreation Area", "Washington"],
      ["ROLA", "Ross Lake National Recreation Area", "Washington"],
    ].forEach(([code, name, location]) => {
      if (!sectionMatch[3].includes(name)) return;
      const unit = { code, name, location, designation, designationId: groupId, url: `https://www.nps.gov/${code.toLowerCase()}/index.htm` };
      items.push(unit);
      units.push(unit);
    });
  }
  if (designation === "National Wild and Scenic Rivers" && /Middle Delaware National Scenic River/.test(sectionMatch[3])) {
    const unit = {
      code: "MIDE",
      name: "Middle Delaware National Scenic River",
      location: "New Jersey, New York, and Pennsylvania",
      designation,
      designationId: groupId,
      url: "https://www.nps.gov/mide/index.htm",
    };
    items.push(unit);
    units.push(unit);
  }
  if (items.length !== expected) throw new Error(`${designation}: expected ${expected}, parsed ${items.length}`);
  groups.push({ id: groupId, label: designation, count: expected, items: items.map((item) => `${groupId}:${item.code}`) });
}

if (units.length !== 433) throw new Error(`Expected 433 NPS units, parsed ${units.length}`);
units.forEach((unit) => { unit.id = `${unit.designationId}:${unit.code}`; });

const boundaryData = JSON.parse(fs.readFileSync(boundaryPath, "utf8"));
const catalogByCode = new Map();
units.forEach((unit) => [unit.code, ...(unit.alternateCodes || [])].forEach((code) => {
  if (!catalogByCode.has(code)) catalogByCode.set(code, unit);
}));
const boundaryCodes = new Set();
boundaryData.features = (boundaryData.features || []).map((feature) => {
  const source = feature.properties || {};
  const code = String(source.UNIT_CODE || source.code || "").toUpperCase();
  const catalog = catalogByCode.get(code);
  if (code) boundaryCodes.add(code);
  return {
    type: "Feature",
    properties: {
      code,
      name: catalog?.name || source.UNIT_NAME || source.PARKNAME || source.name || code,
      designation: catalog?.designation || source.UNIT_TYPE || source.designation || "Other Designation",
      location: catalog?.location || source.STATE || source.location || "",
    },
    geometry: feature.geometry,
  };
});
boundaryData.name = "National Park Service unit boundaries";
boundaryData.source = "National Park Service / ArcGIS, simplified for web display";

units.forEach((unit) => {
  unit.hasBoundary = [unit.code, ...(unit.alternateCodes || [])].some((code) => boundaryCodes.has(code));
  const translation = existingTranslations.get(unit.name);
  if (translation?.zhName) Object.assign(unit, translation);
});

fs.writeFileSync(boundaryPath, `${JSON.stringify(boundaryData)}\n`);
fs.writeFileSync(catalogPath, `${JSON.stringify({
  updated: "2026-07-01",
  total: units.length,
  boundaryUnitCount: units.filter((unit) => unit.hasBoundary).length,
  source: "https://www.nps.gov/aboutus/national-park-system.htm",
  groups,
  units,
}, null, 2)}\n`);

console.log(`Wrote ${units.length} units in ${groups.length} designations; ${boundaryCodes.size} have boundary geometry.`);
