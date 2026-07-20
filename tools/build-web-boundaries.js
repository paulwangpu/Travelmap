const fs = require("fs");
const path = require("path");
const https = require("https");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const admin1Dir = path.join(dataDir, "admin1-by-country");
const countryDir = path.join(dataDir, "countries-by-id");
const outDir = path.join(dataDir, "boundaries");
const boundaryCountryDir = path.join(outDir, "country");
const provinceDir = path.join(outDir, "province");
const cityDir = path.join(outDir, "city");
const sourceDir = path.join(dataDir, "sources");
const censusCountyUrl = "https://www2.census.gov/geo/tiger/GENZ2025/kml/cb_2025_us_county_5m.zip";
const censusCountyZip = path.join(sourceDir, "cb_2025_us_county_5m.zip");
const censusCountyExtractDir = path.join(sourceDir, "cb_2025_us_county_5m");

const chinaSpecialNames = {
  tw: "\u53f0\u6e7e",
  hk: "\u9999\u6e2f",
  mo: "\u6fb3\u95e8",
};
const chinaSpecialNamesEn = { tw: "Taiwan", hk: "Hong Kong", mo: "Macau" };
const japanRegionAliases = {
  Hokkaido: "\u5317\u6d77\u9053",
  Tohoku: "\u4e1c\u5317",
  "T\u014dhoku": "\u4e1c\u5317",
  Kanto: "\u5173\u4e1c",
  "Kant\u014d": "\u5173\u4e1c",
  Chubu: "\u4e2d\u90e8",
  "Ch\u016bbu": "\u4e2d\u90e8",
  Kinki: "\u8fd1\u757f",
  Kansai: "\u8fd1\u757f",
  Chugoku: "\u4e2d\u56fd",
  "Ch\u016bgoku": "\u4e2d\u56fd",
  Shikoku: "\u56db\u56fd",
  Kyushu: "\u4e5d\u5dde\u51b2\u7ef3",
  "Ky\u016bsh\u016b": "\u4e5d\u5dde\u51b2\u7ef3",
  Okinawa: "\u4e5d\u5dde\u51b2\u7ef3",
};
const usStateAbbrByFips = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", "10": "DE", "11": "DC",
  "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT",
  "31": "NE", "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
  "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI", "56": "WY", "60": "AS", "66": "GU", "69": "MP",
  "72": "PR", "78": "VI",
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data)}\n`, "utf8");
}

function normalizeCollection(data) {
  if (data?.type === "FeatureCollection") return data;
  if (data?.type === "Feature") return { type: "FeatureCollection", features: [data] };
  return { type: "FeatureCollection", features: [] };
}

function readFeatureCollection(file) {
  return normalizeCollection(readJson(file));
}

function geometryToPolygons(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates || [];
  return [];
}

function bboxForGeometry(geometry) {
  const points = geometryToPolygons(geometry).flat(2);
  const valid = points.filter((point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]));
  if (!valid.length) return null;
  const lngs = valid.map((point) => point[0]);
  const lats = valid.map((point) => point[1]);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

function preferredName(properties = {}) {
  return String(
    properties.name_zh
    || properties.name_zht
    || properties.name_en
    || properties.name_local
    || properties.NAMELSAD
    || properties.NAME
    || properties.NAME_1
    || properties.name
    || properties.adm1_name
    || properties.GEOID
    || "",
  ).trim();
}

function slug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "unit";
}

function cleanFeature(feature, countryId, layer, fallbackName = "") {
  const properties = feature.properties || {};
  const name = preferredName(properties) || fallbackName;
  const geometry = feature.geometry || null;
  return {
    type: "Feature",
    properties: {
      id: properties.id || properties.GEOID || properties.geoid || `${countryId}-${layer}-${slug(name)}`,
      countryId,
      name,
      name_en: properties.name_en || properties.NAME || properties.NAMELSAD || properties.name || name,
      region: properties.region || properties.region_name || "",
      region_sub: properties.region_sub || "",
      source_layer: layer,
      bbox: bboxForGeometry(geometry),
    },
    geometry,
  };
}

function validBoundaryFeatures(features) {
  return features.filter((feature) => feature.geometry && String(feature.properties?.name || "").trim());
}

function writeCollection(file, features) {
  writeJson(file, { type: "FeatureCollection", features: validBoundaryFeatures(features) });
}

function relDataPath(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function provinceFallbackFromCityFeatures(cityFeatures) {
  return cityFeatures.map((feature) => ({
    ...feature,
    properties: {
      ...feature.properties,
      id: String(feature.properties?.id || "").replace(/-city-/g, "-province-"),
      source_layer: "province",
      province_source: "city-as-province",
    },
  }));
}

function groupedCollection(features, countryId, groupField, source) {
  const groups = new Map();
  let groupedFeatureCount = 0;
  features.forEach((feature) => {
    const groupName = String(feature.properties?.[groupField] || "").trim();
    if (!groupName) return;
    groupedFeatureCount += 1;
    const key = `${countryId}:${groupField}:${groupName}`;
    if (!groups.has(key)) {
      groups.set(key, {
        type: "Feature",
        properties: {
          id: `${countryId}-${groupField}-${slug(groupName)}`,
          countryId,
          name: groupName,
          name_en: groupName,
          aliases: [],
          grouped_from: source,
          group_field: groupField,
          source_layer: "province",
        },
        geometry: { type: "MultiPolygon", coordinates: [] },
      });
    }
    const childNames = [feature.properties?.name, feature.properties?.name_en, preferredName(feature.properties)]
      .map((name) => String(name || "").trim())
      .filter(Boolean);
    childNames.forEach((name) => {
      const aliases = groups.get(key).properties.aliases;
      if (!aliases.includes(name)) aliases.push(name);
    });
    groups.get(key).geometry.coordinates.push(...geometryToPolygons(feature.geometry));
  });
  return {
    groupedFeatureCount,
    features: Array.from(groups.values()).map((feature) => ({
      ...feature,
      properties: { ...feature.properties, bbox: bboxForGeometry(feature.geometry) },
    })),
  };
}

function provinceFromCityFeatures(cityFeatures, countryId) {
  const usableFields = ["region", "region_sub"].map((field) => {
    const grouped = groupedCollection(cityFeatures, countryId, field, "admin1-by-country");
    return { field, ...grouped };
  }).filter((entry) => (
    entry.groupedFeatureCount === cityFeatures.length
    && entry.features.length >= 2
    && entry.features.length < cityFeatures.length
  ));
  if (usableFields.length) return { features: usableFields[0].features, source: usableFields[0].field, fallbackToCity: false };
  return { features: provinceFallbackFromCityFeatures(cityFeatures), source: "city-as-province", fallbackToCity: false };
}

function chinaProvinceFeatures() {
  const features = readFeatureCollection(path.join(dataDir, "china-provinces.geojson")).features
    .map((feature) => cleanFeature(feature, "cn", "province"));
  ["tw", "hk", "mo"].forEach((id) => {
    if (features.some((feature) => String(feature.properties?.name || "").includes(chinaSpecialNames[id]))) return;
    const file = path.join(countryDir, `${id}.geojson`);
    if (!fs.existsSync(file)) return;
    readFeatureCollection(file).features.forEach((feature) => {
      const cleaned = cleanFeature(feature, "cn", "province", id.toUpperCase());
      cleaned.properties.id = `cn-special-${id}`;
      cleaned.properties.name = chinaSpecialNames[id];
      cleaned.properties.name_en = chinaSpecialNamesEn[id];
      features.push(cleaned);
    });
  });
  return features;
}

function chinaCityFeatures() {
  const files = [
    path.join(dataDir, "china-prefectures.geojson"),
    path.join(dataDir, "china-direct-admin.geojson"),
    path.join(admin1Dir, "tw.geojson"),
  ];
  return files.flatMap((file) => {
    if (!fs.existsSync(file)) return [];
    return readFeatureCollection(file).features.map((feature) => cleanFeature(feature, "cn", "city"));
  });
}

function japanProvinceFeatures(cityFeatures) {
  const normalized = cityFeatures.map((feature) => ({
    ...feature,
    properties: {
      ...feature.properties,
      region: japanRegionAliases[feature.properties.region] || feature.properties.region,
    },
  }));
  return groupedCollection(normalized, "jp", "region", "japan-prefecture-regions").features;
}

function downloadFile(url, file) {
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return Promise.resolve();
  ensureDir(path.dirname(file));
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(file);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        output.close();
        fs.rmSync(file, { force: true });
        downloadFile(response.headers.location, file).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        output.close();
        fs.rmSync(file, { force: true });
        reject(new Error(`Download failed: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      response.pipe(output);
      output.on("finish", () => output.close(resolve));
    }).on("error", (error) => {
      output.close();
      fs.rmSync(file, { force: true });
      reject(error);
    });
  });
}

function extractZip(zipFile, targetDir) {
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).some((name) => name.toLowerCase().endsWith(".kml"))) return;
  fs.rmSync(targetDir, { recursive: true, force: true });
  ensureDir(targetDir);
  const command = `Expand-Archive -LiteralPath '${zipFile.replace(/'/g, "''")}' -DestinationPath '${targetDir.replace(/'/g, "''")}' -Force`;
  execFileSync("powershell", ["-NoProfile", "-Command", command], { stdio: "inherit" });
}

function decodeXml(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}

function simpleData(block, name) {
  const pattern = new RegExp(`<SimpleData\\s+name=["']${name}["']>([\\s\\S]*?)<\\/SimpleData>`, "i");
  return decodeXml(block.match(pattern)?.[1] || "");
}

function polygonFromKml(block) {
  const rings = [];
  const ringMatches = block.matchAll(/<LinearRing[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>[\s\S]*?<\/LinearRing>/gi);
  for (const match of ringMatches) {
    const ring = decodeXml(match[1]).trim().split(/\s+/)
      .map((item) => item.split(",").slice(0, 2).map(Number))
      .filter((point) => point.length === 2 && point.every(Number.isFinite));
    if (ring.length >= 4) rings.push(ring);
  }
  return rings.length ? rings : null;
}

function parseCountyKml(file) {
  const text = fs.readFileSync(file, "utf8");
  const features = [];
  for (const match of text.matchAll(/<Placemark\b[\s\S]*?<\/Placemark>/gi)) {
    const block = match[0];
    const name = simpleData(block, "NAMELSAD") || simpleData(block, "NAME") || decodeXml(block.match(/<name>([\s\S]*?)<\/name>/i)?.[1] || "");
    const geoid = simpleData(block, "GEOID");
    const statefp = simpleData(block, "STATEFP");
    const stateAbbr = usStateAbbrByFips[statefp] || statefp || "";
    const uniqueName = stateAbbr ? `${name}, ${stateAbbr}` : name;
    const polygons = [];
    for (const polygonMatch of block.matchAll(/<Polygon\b[\s\S]*?<\/Polygon>/gi)) {
      const polygon = polygonFromKml(polygonMatch[0]);
      if (polygon) polygons.push(polygon);
    }
    if (!polygons.length) continue;
    const geometry = polygons.length === 1 ? { type: "Polygon", coordinates: polygons[0] } : { type: "MultiPolygon", coordinates: polygons };
    features.push({
      type: "Feature",
      properties: {
        id: `us-county-${geoid || slug(name)}`,
        countryId: "us",
        name: uniqueName,
        name_en: uniqueName,
        county_name: name,
        state_abbr: stateAbbr,
        geoid,
        statefp,
        source_layer: "city",
        bbox: bboxForGeometry(geometry),
      },
      geometry,
    });
  }
  return features;
}

async function usCountyFeatures() {
  await downloadFile(censusCountyUrl, censusCountyZip);
  extractZip(censusCountyZip, censusCountyExtractDir);
  const kml = fs.readdirSync(censusCountyExtractDir).find((name) => name.toLowerCase().endsWith(".kml"));
  if (!kml) throw new Error("Census county KML not found after extraction");
  const features = parseCountyKml(path.join(censusCountyExtractDir, kml));
  if (features.length < 3000) throw new Error(`Unexpectedly small county feature count: ${features.length}`);
  return features;
}

function buildCountryCityFeatures(countryId) {
  if (countryId === "cn") return chinaCityFeatures();
  const file = path.join(admin1Dir, `${countryId}.geojson`);
  if (!fs.existsSync(file)) return [];
  return readFeatureCollection(file).features.map((feature) => cleanFeature(feature, countryId, "city"));
}

async function main() {
  const cachedUsCountyFeatures = fs.existsSync(path.join(cityDir, "us.geojson"))
    ? readFeatureCollection(path.join(cityDir, "us.geojson")).features
    : [];
  ensureDir(outDir);
  fs.rmSync(boundaryCountryDir, { recursive: true, force: true });
  fs.rmSync(provinceDir, { recursive: true, force: true });
  fs.rmSync(cityDir, { recursive: true, force: true });
  ensureDir(boundaryCountryDir);
  ensureDir(provinceDir);
  ensureDir(cityDir);

  const countryBoundaryFile = path.join(boundaryCountryDir, "world.geojson");
  const countryFeatures = readFeatureCollection(path.join(dataDir, "countries.geojson")).features
    .map((feature) => ({
      ...feature,
      properties: { ...feature.properties, bbox: bboxForGeometry(feature.geometry) },
    }));
  writeCollection(countryBoundaryFile, countryFeatures);

  const countryIds = fs.readdirSync(admin1Dir)
    .filter((name) => name.toLowerCase().endsWith(".geojson"))
    .map((name) => path.basename(name, ".geojson").toLowerCase())
    .filter((id) => id !== "hk" && id !== "mo");
  if (!countryIds.includes("cn")) countryIds.push("cn");

  const index = {
    generatedAt: new Date().toISOString(),
    source: {
      country: "data/countries.geojson",
      globalCity: "data/admin1-by-country/*.geojson",
      usCounty: censusCountyUrl,
    },
    layers: {
      country: {
        url: relDataPath(countryBoundaryFile),
        count: validBoundaryFeatures(countryFeatures).length,
      },
    },
    countries: {},
  };

  for (const countryId of Array.from(new Set(countryIds)).sort()) {
    const cityFeatures = countryId === "us" && cachedUsCountyFeatures.length >= 3000
      ? cachedUsCountyFeatures
      : countryId === "us"
        ? await usCountyFeatures()
        : buildCountryCityFeatures(countryId);
    if (!cityFeatures.length) continue;

    let provinceFeatures;
    let provinceSource;
    let fallbackToCity = false;
    if (countryId === "cn") {
      provinceFeatures = chinaProvinceFeatures();
      provinceSource = "china-provinces";
    } else if (countryId === "us") {
      provinceFeatures = readFeatureCollection(path.join(dataDir, "us-states.geojson")).features.map((feature) => cleanFeature(feature, "us", "province"));
      provinceSource = "us-states";
    } else if (countryId === "jp") {
      provinceFeatures = japanProvinceFeatures(cityFeatures);
      provinceSource = "japan-regions";
    } else {
      const province = provinceFromCityFeatures(cityFeatures, countryId);
      provinceFeatures = province.features;
      provinceSource = province.source;
      fallbackToCity = province.fallbackToCity;
    }

    const validCityFeatures = validBoundaryFeatures(cityFeatures);
    const validProvinceFeatures = validBoundaryFeatures(provinceFeatures);
    const cityFile = path.join(cityDir, `${countryId}.geojson`);
    const provinceFile = path.join(provinceDir, `${countryId}.geojson`);
    writeCollection(cityFile, validCityFeatures);
    writeCollection(provinceFile, validProvinceFeatures);
    index.countries[countryId] = {
      province: {
        url: relDataPath(provinceFile),
        count: validProvinceFeatures.length,
        source: provinceSource,
        fallbackToCity,
      },
      city: {
        url: relDataPath(cityFile),
        count: validCityFeatures.length,
      },
    };
  }

  writeJson(path.join(outDir, "index.json"), index);
  console.log(`Built ${Object.keys(index.countries).length} country boundary entries`);
  console.log(`US county count: ${index.countries.us?.city.count || 0}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
