const fs = require("fs/promises");
const path = require("path");

const outputPath = path.join(__dirname, "..", "data", "china-direct-admin.geojson");
const provinceUrls = [
  "https://geo.datav.aliyun.com/areas_v3/bound/460000_full.json",
  "https://geo.datav.aliyun.com/areas_v3/bound/410000_full.json",
  "https://geo.datav.aliyun.com/areas_v3/bound/420000_full.json",
  "https://geo.datav.aliyun.com/areas_v3/bound/650000_full.json",
];

const directUnits = new Map([
  [469001, ["海南", "五指山市"]],
  [469002, ["海南", "琼海市"]],
  [469005, ["海南", "文昌市"]],
  [469006, ["海南", "万宁市"]],
  [469007, ["海南", "东方市"]],
  [469021, ["海南", "定安县"]],
  [469022, ["海南", "屯昌县"]],
  [469023, ["海南", "澄迈县"]],
  [469024, ["海南", "临高县"]],
  [469025, ["海南", "白沙黎族自治县"]],
  [469026, ["海南", "昌江黎族自治县"]],
  [469027, ["海南", "乐东黎族自治县"]],
  [469028, ["海南", "陵水黎族自治县"]],
  [469029, ["海南", "保亭黎族苗族自治县"]],
  [469030, ["海南", "琼中黎族苗族自治县"]],
  [419001, ["河南", "济源市"]],
  [429004, ["湖北", "仙桃市"]],
  [429005, ["湖北", "潜江市"]],
  [429006, ["湖北", "天门市"]],
  [429021, ["湖北", "神农架林区"]],
  [659001, ["新疆", "石河子市"]],
  [659002, ["新疆", "阿拉尔市"]],
  [659003, ["新疆", "图木舒克市"]],
  [659004, ["新疆", "五家渠市"]],
  [659005, ["新疆", "北屯市"]],
  [659006, ["新疆", "铁门关市"]],
  [659007, ["新疆", "双河市"]],
  [659008, ["新疆", "可克达拉市"]],
  [659009, ["新疆", "昆玉市"]],
  [659010, ["新疆", "胡杨河市"]],
  [659011, ["新疆", "新星市"]],
  [659012, ["新疆", "白杨市"]],
]);

function walkFeatures(feature, result = []) {
  if (!feature) return result;
  if (feature.type === "FeatureCollection") {
    (feature.features || []).forEach((item) => walkFeatures(item, result));
    return result;
  }
  if (feature.type === "Feature") {
    result.push(feature);
    (feature.properties?.children || feature.properties?.features || []).forEach((item) => walkFeatures(item, result));
  }
  return result;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function main() {
  const features = [];
  const seen = new Set();
  for (const url of provinceUrls) {
    const data = await fetchJson(url);
    for (const feature of walkFeatures(data)) {
      const adcode = Number(feature.properties?.adcode);
      if (!directUnits.has(adcode) || seen.has(adcode)) continue;
      const [province, name] = directUnits.get(adcode);
      seen.add(adcode);
      const center = feature.properties?.center || feature.properties?.centroid || [];
      features.push({
        type: "Feature",
        properties: {
          ...feature.properties,
          adcode,
          name,
          province,
          country: "cn",
          subadminLevel: "direct-admin",
          originalLevel: feature.properties?.level || "district",
          supplemental: true,
        },
        geometry: feature.geometry,
      });
      if (Array.isArray(center) && center.length >= 2) {
        features.at(-1).properties.center = center;
      }
    }
  }

  const unresolved = Array.from(directUnits.entries())
    .filter(([adcode]) => !seen.has(adcode))
    .map(([adcode, [, name]]) => `${adcode} ${name}`);

  await fs.writeFile(outputPath, JSON.stringify({
    type: "FeatureCollection",
    metadata: {
      missingBoundaries: unresolved,
      note: "Only real source boundaries are included. Missing units are omitted instead of using bbox fallback.",
    },
    features,
  }), "utf8");
  console.log(`Wrote ${features.length} direct-admin boundaries to ${outputPath}`);
  if (unresolved.length) console.warn(`Missing boundaries omitted: ${unresolved.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
