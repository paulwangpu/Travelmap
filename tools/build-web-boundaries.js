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
const referenceDir = path.join(outDir, "reference");
const sourceDir = path.join(dataDir, "sources");
const censusCountyUrl = "https://www2.census.gov/geo/tiger/GENZ2025/kml/cb_2025_us_county_5m.zip";
const censusCountyZip = path.join(sourceDir, "cb_2025_us_county_5m.zip");
const censusCountyExtractDir = path.join(sourceDir, "cb_2025_us_county_5m");
const censusCongressionalDistrictUrl = "https://www2.census.gov/geo/tiger/GENZ2025/kml/cb_2025_us_cd119_5m.zip";
const censusCongressionalDistrictZip = path.join(sourceDir, "cb_2025_us_cd119_5m.zip");
const censusCongressionalDistrictExtractDir = path.join(sourceDir, "cb_2025_us_cd119_5m");
const giscoNuts3Url = "https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_01M_2024_4326_LEVL_3.geojson";
const giscoNuts3File = path.join(sourceDir, "NUTS_RG_01M_2024_4326_LEVL_3.geojson");
const giscoNuts2Url = "https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_01M_2024_4326_LEVL_2.geojson";
const giscoNuts2File = path.join(sourceDir, "NUTS_RG_01M_2024_4326_LEVL_2.geojson");
const moroccoAdm2Url = "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/MAR/ADM2/geoBoundaries-MAR-ADM2_simplified.geojson";
const moroccoAdm2File = path.join(sourceDir, "geoBoundaries-MAR-ADM2_simplified.geojson");

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
const vietnamRegionByProvinceEn = new Map([
  ["dien bien", "Tây Bắc"], ["lai chau", "Tây Bắc"], ["son la", "Tây Bắc"], ["hoa binh", "Tây Bắc"], ["lao cai", "Tây Bắc"], ["yen bai", "Tây Bắc"],
  ["ha giang", "Đông Bắc"], ["cao bang", "Đông Bắc"], ["bac kan", "Đông Bắc"], ["lang son", "Đông Bắc"], ["tuyen quang", "Đông Bắc"], ["thai nguyen", "Đông Bắc"], ["phu tho", "Đông Bắc"], ["bac giang", "Đông Bắc"], ["quang ninh", "Đông Bắc"],
  ["hanoi", "Đồng bằng sông Hồng"], ["ha noi", "Đồng bằng sông Hồng"], ["haiphong", "Đồng bằng sông Hồng"], ["hai phong", "Đồng bằng sông Hồng"], ["vinh phuc", "Đồng bằng sông Hồng"], ["bac ninh", "Đồng bằng sông Hồng"], ["hai duong", "Đồng bằng sông Hồng"], ["hung yen", "Đồng bằng sông Hồng"], ["thai binh", "Đồng bằng sông Hồng"], ["ha nam", "Đồng bằng sông Hồng"], ["nam dinh", "Đồng bằng sông Hồng"], ["ninh binh", "Đồng bằng sông Hồng"],
  ["thanh hoa", "Bắc Trung Bộ"], ["nghe an", "Bắc Trung Bộ"], ["ha tinh", "Bắc Trung Bộ"], ["quang binh", "Bắc Trung Bộ"], ["quang tri", "Bắc Trung Bộ"], ["thua thien hue", "Bắc Trung Bộ"],
  ["da nang", "Duyên hải Nam Trung Bộ"], ["quang nam", "Duyên hải Nam Trung Bộ"], ["quang ngai", "Duyên hải Nam Trung Bộ"], ["binh dinh", "Duyên hải Nam Trung Bộ"], ["phu yen", "Duyên hải Nam Trung Bộ"], ["khanh hoa", "Duyên hải Nam Trung Bộ"], ["ninh thuan", "Duyên hải Nam Trung Bộ"], ["binh thuan", "Duyên hải Nam Trung Bộ"],
  ["kon tum", "Tây Nguyên"], ["gia lai", "Tây Nguyên"], ["dak lak", "Tây Nguyên"], ["dak nong", "Tây Nguyên"], ["lam dong", "Tây Nguyên"],
  ["binh phuoc", "Đông Nam Bộ"], ["tay ninh", "Đông Nam Bộ"], ["binh duong", "Đông Nam Bộ"], ["dong nai", "Đông Nam Bộ"], ["ba ria-vung tau", "Đông Nam Bộ"], ["ho chi minh", "Đông Nam Bộ"],
  ["long an", "Đồng bằng sông Cửu Long"], ["tien giang", "Đồng bằng sông Cửu Long"], ["ben tre", "Đồng bằng sông Cửu Long"], ["tra vinh", "Đồng bằng sông Cửu Long"], ["vinh long", "Đồng bằng sông Cửu Long"], ["dong thap", "Đồng bằng sông Cửu Long"], ["an giang", "Đồng bằng sông Cửu Long"], ["kien giang", "Đồng bằng sông Cửu Long"], ["can tho", "Đồng bằng sông Cửu Long"], ["hau giang", "Đồng bằng sông Cửu Long"], ["soc trang", "Đồng bằng sông Cửu Long"], ["bac lieu", "Đồng bằng sông Cửu Long"], ["ca mau", "Đồng bằng sông Cửu Long"],
]);
const vietnamRegionLabels = {
  "Tây Bắc": { zh: "西北部", en: "Northwest" },
  "Đông Bắc": { zh: "东北部", en: "Northeast" },
  "Đồng bằng sông Hồng": { zh: "红河三角洲", en: "Red River Delta" },
  "Bắc Trung Bộ": { zh: "北中部", en: "North Central Coast" },
  "Duyên hải Nam Trung Bộ": { zh: "南中部沿海", en: "South Central Coast" },
  "Tây Nguyên": { zh: "中部高原", en: "Central Highlands" },
  "Đông Nam Bộ": { zh: "东南部", en: "Southeast" },
  "Đồng bằng sông Cửu Long": { zh: "湄公河三角洲", en: "Mekong Delta" },
};

const turkeyRegionByProvinceEn = new Map([
  ["istanbul", "marmara"], ["edirne", "marmara"], ["kirklareli", "marmara"], ["tekirdag", "marmara"], ["kocaeli", "marmara"], ["yalova", "marmara"], ["sakarya", "marmara"], ["bilecik", "marmara"], ["bursa", "marmara"], ["balikesir", "marmara"], ["canakkale", "marmara"],
  ["izmir", "aegean"], ["aydin", "aegean"], ["denizli", "aegean"], ["mugla", "aegean"], ["manisa", "aegean"], ["afyonkarahisar", "aegean"], ["kutahya", "aegean"], ["usak", "aegean"],
  ["antalya", "mediterranean"], ["burdur", "mediterranean"], ["isparta", "mediterranean"], ["mersin", "mediterranean"], ["adana", "mediterranean"], ["osmaniye", "mediterranean"], ["hatay", "mediterranean"], ["kahramanmaras", "mediterranean"],
  ["ankara", "central-anatolia"], ["eskisehir", "central-anatolia"], ["konya", "central-anatolia"], ["karaman", "central-anatolia"], ["aksaray", "central-anatolia"], ["nigde", "central-anatolia"], ["nevsehir", "central-anatolia"], ["kirikkale", "central-anatolia"], ["kirsehir", "central-anatolia"], ["yozgat", "central-anatolia"], ["kayseri", "central-anatolia"], ["sivas", "central-anatolia"], ["cankiri", "central-anatolia"],
  ["bolu", "black-sea"], ["duzce", "black-sea"], ["zonguldak", "black-sea"], ["karabuk", "black-sea"], ["bartin", "black-sea"], ["kastamonu", "black-sea"], ["sinop", "black-sea"], ["corum", "black-sea"], ["amasya", "black-sea"], ["tokat", "black-sea"], ["samsun", "black-sea"], ["ordu", "black-sea"], ["giresun", "black-sea"], ["gumushane", "black-sea"], ["trabzon", "black-sea"], ["bayburt", "black-sea"], ["rize", "black-sea"], ["artvin", "black-sea"],
  ["erzurum", "eastern-anatolia"], ["erzincan", "eastern-anatolia"], ["agri", "eastern-anatolia"], ["kars", "eastern-anatolia"], ["igdir", "eastern-anatolia"], ["ardahan", "eastern-anatolia"], ["malatya", "eastern-anatolia"], ["elazig", "eastern-anatolia"], ["bingol", "eastern-anatolia"], ["tunceli", "eastern-anatolia"], ["van", "eastern-anatolia"], ["mus", "eastern-anatolia"], ["bitlis", "eastern-anatolia"], ["hakkari", "eastern-anatolia"],
  ["gaziantep", "southeastern-anatolia"], ["kilis", "southeastern-anatolia"], ["adiyaman", "southeastern-anatolia"], ["sanliurfa", "southeastern-anatolia"], ["diyarbakir", "southeastern-anatolia"], ["mardin", "southeastern-anatolia"], ["batman", "southeastern-anatolia"], ["siirt", "southeastern-anatolia"], ["sirnak", "southeastern-anatolia"],
]);
const turkeyRegionLabels = {
  marmara: { zh: "\u9a6c\u5c14\u9a6c\u62c9\u5730\u533a", en: "Marmara Region" },
  aegean: { zh: "\u7231\u7434\u6d77\u5730\u533a", en: "Aegean Region" },
  mediterranean: { zh: "\u5730\u4e2d\u6d77\u5730\u533a", en: "Mediterranean Region" },
  "central-anatolia": { zh: "\u4e2d\u5b89\u7eb3\u6258\u5229\u4e9a\u5730\u533a", en: "Central Anatolia Region" },
  "black-sea": { zh: "\u9ed1\u6d77\u5730\u533a", en: "Black Sea Region" },
  "eastern-anatolia": { zh: "\u4e1c\u5b89\u7eb3\u6258\u5229\u4e9a\u5730\u533a", en: "Eastern Anatolia Region" },
  "southeastern-anatolia": { zh: "\u4e1c\u5357\u5b89\u7eb3\u6258\u5229\u4e9a\u5730\u533a", en: "Southeastern Anatolia Region" },
};
function normalizeLatinKey(value) {
  return String(value || "")
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*,.*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

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

function latinBoundaryName(value) {
  return String(value || "")
    .replace(/[^\u0000-\u024f\s'’.,/-]/g, " ")
    .replace(/\b(Province|Prefecture|Préfecture)\s+(de|d'|of)?\s*/gi, "")
    .replace(/\b(Province|Prefecture|Préfecture)\b/gi, "")
    .replace(/[-,./\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
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

function vietnamProvinceKey(feature) {
  const properties = feature.properties || {};
  const candidates = [
    properties.name_en,
    properties.name,
    properties.gn_name,
    properties.gns_name,
    properties.woe_label,
  ];
  for (const candidate of candidates) {
    const normalized = String(candidate || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^tinh\s+/i, "")
      .replace(/^thanh pho\s+/i, "")
      .replace(/\s*,.*$/, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (vietnamRegionByProvinceEn.has(normalized)) return vietnamRegionByProvinceEn.get(normalized);
  }
  return "";
}

function vietnamProvinceFeatures(cityFeatures) {
  const groups = new Map();
  cityFeatures.forEach((feature) => {
    const regionKey = vietnamProvinceKey(feature);
    if (!regionKey) return;
    const label = vietnamRegionLabels[regionKey] || { zh: regionKey, en: regionKey };
    if (!groups.has(regionKey)) {
      groups.set(regionKey, {
        type: "Feature",
        properties: {
          id: `vn-region-${slug(regionKey)}`,
          countryId: "vn",
          name: label.zh,
          name_en: label.en,
          aliases: [regionKey],
          grouped_from: "admin1-by-country",
          group_field: "vietnam-standard-region",
          source_layer: "province",
        },
        geometry: { type: "MultiPolygon", coordinates: [] },
      });
    }
    const group = groups.get(regionKey);
    const childNames = [feature.properties?.name, feature.properties?.name_en, preferredName(feature.properties)]
      .map((name) => String(name || "").trim())
      .filter(Boolean);
    childNames.forEach((name) => {
      if (!group.properties.aliases.includes(name)) group.properties.aliases.push(name);
    });
    group.geometry.coordinates.push(...geometryToPolygons(feature.geometry));
  });
  return Array.from(groups.values()).map((feature) => ({
    ...feature,
    properties: { ...feature.properties, bbox: bboxForGeometry(feature.geometry) },
  }));
}

function turkeyProvinceKey(feature) {
  const properties = feature.properties || {};
  const candidates = [
    properties.name_en,
    properties.name,
    properties.gn_name,
    properties.gns_name,
    properties.woe_label,
  ];
  for (const candidate of candidates) {
    const normalized = normalizeLatinKey(candidate);
    if (turkeyRegionByProvinceEn.has(normalized)) return turkeyRegionByProvinceEn.get(normalized);
  }
  return "";
}

function turkeyProvinceFeatures(cityFeatures) {
  const groups = new Map();
  cityFeatures.forEach((feature) => {
    const regionKey = turkeyProvinceKey(feature);
    if (!regionKey) return;
    const label = turkeyRegionLabels[regionKey] || { zh: regionKey, en: regionKey };
    if (!groups.has(regionKey)) {
      groups.set(regionKey, {
        type: "Feature",
        properties: {
          id: `tr-region-${slug(regionKey)}`,
          countryId: "tr",
          name: label.zh,
          name_en: label.en,
          aliases: [regionKey],
          grouped_from: "admin1-by-country",
          group_field: "turkey-geographic-region",
          source_layer: "province",
        },
        geometry: { type: "MultiPolygon", coordinates: [] },
      });
    }
    const group = groups.get(regionKey);
    const childNames = [feature.properties?.name, feature.properties?.name_en, preferredName(feature.properties)]
      .map((name) => String(name || "").trim())
      .filter(Boolean);
    childNames.forEach((name) => {
      if (!group.properties.aliases.includes(name)) group.properties.aliases.push(name);
    });
    group.geometry.coordinates.push(...geometryToPolygons(feature.geometry));
  });
  if (groups.size !== 7) {
    const missed = cityFeatures
      .map((feature) => feature.properties?.name_en || feature.properties?.name || "")
      .filter((name) => name && !turkeyProvinceKey({ properties: { name_en: name } }));
    throw new Error(`Turkey geographic regions incomplete: ${groups.size}/7 groups, missed ${missed.join(", ")}`);
  }
  return Array.from(groups.values()).map((feature) => ({
    ...feature,
    properties: { ...feature.properties, bbox: bboxForGeometry(feature.geometry) },
  }));
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

function parseCongressionalDistrictKml(file) {
  const text = fs.readFileSync(file, "utf8");
  const features = [];
  for (const match of text.matchAll(/<Placemark\b[\s\S]*?<\/Placemark>/gi)) {
    const block = match[0];
    const geoid = simpleData(block, "GEOID");
    const statefp = simpleData(block, "STATEFP");
    const cd119fp = simpleData(block, "CD119FP");
    const displayName = simpleData(block, "NAMELSAD") || decodeXml(block.match(/<name>([\s\S]*?)<\/name>/i)?.[1] || "");
    const stateAbbr = usStateAbbrByFips[statefp] || statefp || "";
    const shortName = cd119fp === "00" ? `${stateAbbr} At-Large District` : `${stateAbbr}-${cd119fp}`;
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
        id: `us-cd119-${geoid || slug(shortName)}`,
        countryId: "us",
        name: shortName,
        name_en: shortName,
        display_name: displayName,
        state_abbr: stateAbbr,
        statefp,
        cd119fp,
        geoid,
        source_layer: "city",
        bbox: bboxForGeometry(geometry),
      },
      geometry,
    });
  }
  return features;
}

async function usCongressionalDistrictFeatures() {
  await downloadFile(censusCongressionalDistrictUrl, censusCongressionalDistrictZip);
  extractZip(censusCongressionalDistrictZip, censusCongressionalDistrictExtractDir);
  const kml = fs.readdirSync(censusCongressionalDistrictExtractDir).find((name) => name.toLowerCase().endsWith(".kml"));
  if (!kml) throw new Error("Census congressional district KML not found after extraction");
  const features = parseCongressionalDistrictKml(path.join(censusCongressionalDistrictExtractDir, kml));
  if (features.length < 430 || features.length > 460) throw new Error(`Unexpected congressional district feature count: ${features.length}`);
  return features;
}

async function giscoNutsFeatures(countryId, level, minCount) {
  const upperCountryId = String(countryId || "").toUpperCase();
  const sourceUrl = level === 2 ? giscoNuts2Url : giscoNuts3Url;
  const sourceFile = level === 2 ? giscoNuts2File : giscoNuts3File;
  await downloadFile(sourceUrl, sourceFile);
  const collection = readFeatureCollection(sourceFile);
  const features = collection.features
    .filter((feature) => String(feature.properties?.CNTR_CODE || "").toUpperCase() === upperCountryId)
    .map((feature) => {
      const properties = feature.properties || {};
      const name = String(properties.NUTS_NAME || properties.NAME_LATN || properties.NUTS_ID || "").trim();
      const geometry = feature.geometry || null;
      return {
        type: "Feature",
        properties: {
          id: `${countryId}-nuts${level}-${properties.NUTS_ID || slug(name)}`,
          countryId,
          name,
          name_en: name,
          nuts_id: properties.NUTS_ID || "",
          nuts_level: properties.LEVL_CODE ?? level,
          source_layer: "city",
          bbox: bboxForGeometry(geometry),
        },
        geometry,
      };
    });
  if (features.length < minCount) throw new Error(`Unexpectedly small ${upperCountryId} NUTS${level} feature count: ${features.length}`);
  return features;
}

async function moroccoAdm2Features() {
  await downloadFile(moroccoAdm2Url, moroccoAdm2File);
  const collection = readFeatureCollection(moroccoAdm2File);
  const features = collection.features.map((feature) => {
    const properties = feature.properties || {};
    const rawName = properties.shapeName || properties.name || properties.NAME || properties.shapeID || "";
    const name = latinBoundaryName(rawName) || String(rawName || properties.shapeID || "").trim();
    const geometry = feature.geometry || null;
    return {
      type: "Feature",
      properties: {
        id: `ma-adm2-${properties.shapeID || slug(name)}`,
        countryId: "ma",
        name,
        name_en: name,
        adm_level: 2,
        shape_id: properties.shapeID || "",
        source_layer: "city",
        bbox: bboxForGeometry(geometry),
      },
      geometry,
    };
  });
  if (features.length < 70) throw new Error(`Unexpectedly small Morocco ADM2 feature count: ${features.length}`);
  return features;
}

async function buildCountryCityFeatures(countryId) {
  if (countryId === "cn") return chinaCityFeatures();
  if (countryId === "at") return giscoNutsFeatures("at", 3, 30);
  if (countryId === "de") return giscoNutsFeatures("de", 2, 35);
  if (countryId === "ma") return moroccoAdm2Features();
  const file = path.join(admin1Dir, `${countryId}.geojson`);
  if (!fs.existsSync(file)) return [];
  return readFeatureCollection(file).features.map((feature) => cleanFeature(feature, countryId, "city"));
}

async function main() {
  const cachedUsCityFile = path.join(cityDir, "us.geojson");
  const cachedUsReferenceFile = path.join(referenceDir, "us-counties.geojson");
  const cachedUsCityFeatures = fs.existsSync(cachedUsCityFile)
    ? readFeatureCollection(cachedUsCityFile).features
    : [];
  const cachedUsDistrictFeatures = cachedUsCityFeatures.length >= 430 && cachedUsCityFeatures.length <= 460 && cachedUsCityFeatures.some((feature) => feature.properties?.cd119fp)
    ? cachedUsCityFeatures
    : [];
  const legacyUsCountyFeatures = cachedUsCityFeatures.length >= 3000 && cachedUsCityFeatures.some((feature) => feature.properties?.county_name)
    ? cachedUsCityFeatures
    : [];
  const cachedUsCountyFeatures = fs.existsSync(cachedUsReferenceFile)
    ? readFeatureCollection(cachedUsReferenceFile).features
    : legacyUsCountyFeatures;
  ensureDir(outDir);
  fs.rmSync(boundaryCountryDir, { recursive: true, force: true });
  fs.rmSync(provinceDir, { recursive: true, force: true });
  fs.rmSync(cityDir, { recursive: true, force: true });
  fs.rmSync(referenceDir, { recursive: true, force: true });
  ensureDir(boundaryCountryDir);
  ensureDir(provinceDir);
  ensureDir(cityDir);
  ensureDir(referenceDir);

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
      usCongressionalDistricts: censusCongressionalDistrictUrl,
      giscoNuts2: giscoNuts2Url,
      giscoNuts3: giscoNuts3Url,
      moroccoAdm2: moroccoAdm2Url,
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
    const cityFeatures = countryId === "us" && cachedUsDistrictFeatures.length
      ? cachedUsDistrictFeatures
      : countryId === "us"
        ? await usCongressionalDistrictFeatures()
        : await buildCountryCityFeatures(countryId);
    if (!cityFeatures.length) continue;

    let provinceFeatures;
    let provinceSource;
    let fallbackToCity = false;
    if (countryId === "cn") {
      provinceFeatures = chinaProvinceFeatures();
      provinceSource = "china-provinces";
    } else if (countryId === "at" || countryId === "de") {
      provinceFeatures = readFeatureCollection(path.join(admin1Dir, `${countryId}.geojson`)).features.map((feature) => cleanFeature(feature, countryId, "province"));
      provinceSource = countryId === "at" ? "austria-states" : "germany-states";
    } else if (countryId === "us") {
      provinceFeatures = readFeatureCollection(path.join(dataDir, "us-states.geojson")).features.map((feature) => cleanFeature(feature, "us", "province"));
      provinceSource = "us-states";
    } else if (countryId === "jp") {
      provinceFeatures = japanProvinceFeatures(cityFeatures);
      provinceSource = "japan-regions";
    } else if (countryId === "vn") {
      provinceFeatures = vietnamProvinceFeatures(cityFeatures);
      provinceSource = "vietnam-standard-regions";
    } else if (countryId === "tr") {
      provinceFeatures = turkeyProvinceFeatures(cityFeatures);
      provinceSource = "turkey-geographic-regions";
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
    if (countryId === "us") {
      const countyFeatures = cachedUsCountyFeatures.length >= 3000 ? cachedUsCountyFeatures : await usCountyFeatures();
      const countyFile = path.join(referenceDir, "us-counties.geojson");
      writeCollection(countyFile, countyFeatures);
      index.countries.us.city.source = "us-congressional-districts-119";
      index.countries.us.reference = {
        counties: {
          url: relDataPath(countyFile),
          count: validBoundaryFeatures(countyFeatures).length,
          source: "us-counties-reference",
        },
      };
    }
  }

  writeJson(path.join(outDir, "index.json"), index);
  console.log(`Built ${Object.keys(index.countries).length} country boundary entries`);
  console.log(`US congressional district count: ${index.countries.us?.city.count || 0}`);
  console.log(`US county reference count: ${index.countries.us?.reference?.counties?.count || 0}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
