const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const provinceSource = path.join(root, "data", "china-provinces.geojson");
const citySource = path.join(root, "data", "china-prefectures-lite.geojson");
const directCitySource = path.join(root, "data", "china-direct-admin.geojson");
const taiwanCitySource = path.join(root, "data", "admin1-by-country", "tw.geojson");
const countrySource = path.join(root, "data", "countries.geojson");
const usSource = path.join(root, "data", "us-states.geojson");
const japanSource = path.join(root, "data", "admin1-by-country", "jp.geojson");
const output = path.join(root, "miniprogram", "data", "boundaries.js");

const provinceIds = {
  110000: "beijing",
  120000: "tianjin",
  130000: "hebei",
  140000: "shanxi",
  150000: "inner-mongolia",
  210000: "liaoning",
  220000: "jilin",
  230000: "heilongjiang",
  310000: "shanghai",
  320000: "jiangsu",
  330000: "zhejiang",
  340000: "anhui",
  350000: "fujian",
  360000: "jiangxi",
  370000: "shandong",
  410000: "henan",
  420000: "hubei",
  430000: "hunan",
  440000: "guangdong",
  450000: "guangxi",
  460000: "hainan",
  500000: "chongqing",
  510000: "sichuan",
  520000: "guizhou",
  530000: "yunnan",
  540000: "tibet",
  610000: "shaanxi",
  620000: "gansu",
  630000: "qinghai",
  640000: "ningxia",
  650000: "xinjiang",
  710000: "taiwan",
  810000: "hong-kong",
  820000: "macau"
};

function perpendicularDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) {
    return Math.hypot(point[0] - start[0], point[1] - start[1]);
  }
  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy));
}

function simplifyLine(points, tolerance) {
  if (points.length <= 3) return points;
  const first = points[0];
  const last = points[points.length - 1];
  let maxDistance = 0;
  let splitIndex = 0;

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = perpendicularDistance(points[index], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      splitIndex = index;
    }
  }

  if (maxDistance <= tolerance) return [first, last];
  const left = simplifyLine(points.slice(0, splitIndex + 1), tolerance);
  const right = simplifyLine(points.slice(splitIndex), tolerance);
  return left.slice(0, -1).concat(right);
}

function simplifyRing(ring, tolerance) {
  if (!Array.isArray(ring) || ring.length < 4) return [];
  const open = ring.slice(0, -1);
  const simplified = simplifyLine(open, tolerance);
  if (simplified.length < 3) return [];
  return simplified.map(([longitude, latitude]) => ({
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4))
  }));
}

function outerRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates.slice(0, 1);
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((polygon) => polygon[0]).filter(Boolean);
  }
  return [];
}

function ringArea(points) {
  if (!points.length) return 0;
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  return (Math.max(...latitudes) - Math.min(...latitudes)) * (Math.max(...longitudes) - Math.min(...longitudes));
}

function convertFeature(feature, index, tolerance, type) {
  const properties = feature.properties || {};
  const adcode = Number(properties.adcode || properties.adcode12 || 0);
  const countryCode = String(properties["ISO3166-1-Alpha-2"] || "").toLowerCase();
  const id =
    type === "province"
      ? provinceIds[adcode] || `province-${adcode}`
      : type === "country"
        ? countryCode || `country-${index}`
        : `city-${adcode || index}`;
  const provinceAdcode =
    type === "city"
      ? (provinceIds[adcode] ? adcode : Number(properties.parent?.adcode || properties.parent_adcode || Math.floor(adcode / 10000) * 10000))
      : adcode;
  const rings = outerRings(feature.geometry)
    .map((ring, ringIndex) => ({
      id: `${id}-${ringIndex}`,
      regionId: id,
      provinceId: provinceIds[provinceAdcode] || "",
      name: String(properties.name || id).replace(/(省|市|自治区|特别行政区)$/u, ""),
      points: simplifyRing(ring, tolerance)
    }))
    .filter((item) => item.points.length >= 3)
    .sort((left, right) => ringArea(right.points) - ringArea(left.points));
  const filtered = rings.filter((item, ringIndex) => ringIndex === 0 || ringArea(item.points) >= 0.015);
  return filtered.slice(0, type === "country" ? 1 : 20);
}

function convertFile(filename, tolerance, type) {
  const collection = JSON.parse(fs.readFileSync(filename, "utf8"));
  return collection.features.flatMap((feature, index) => convertFeature(feature, index, tolerance, type));
}

function convertSupplementalCities(filename, tolerance, idForFeature, provinceId, nameForFeature) {
  const collection = JSON.parse(fs.readFileSync(filename, "utf8"));
  return collection.features.flatMap((feature, index) => {
    const regionId = idForFeature(feature, index);
    return outerRings(feature.geometry)
      .map((ring, ringIndex) => ({
        id: `${regionId}-${ringIndex}`,
        regionId,
        provinceId: provinceId(feature),
        name: nameForFeature(feature),
        points: simplifyRing(ring, tolerance)
      }))
      .filter((item) => item.points.length >= 3)
      .sort((left, right) => ringArea(right.points) - ringArea(left.points))
      .filter((item, ringIndex) => ringIndex === 0 || ringArea(item.points) >= 0.003)
      .slice(0, 20);
  });
}

const provinceBoundaries = convertFile(provinceSource, 0.045, "province");
const directCityBoundaries = convertSupplementalCities(
  directCitySource,
  0.025,
  (feature) => `city-${feature.properties.adcode}`,
  (feature) => provinceIds[feature.properties.parent?.adcode] || "",
  (feature) => feature.properties.name
);
const taiwanCityBoundaries = convertSupplementalCities(
  taiwanCitySource,
  0.025,
  (feature, index) => `tw-${String(feature.properties.iso_3166_2 || feature.properties.adm1_code || index).toLowerCase()}`,
  () => "taiwan",
  (feature) => feature.properties.name_zh || feature.properties.name_zht || feature.properties.name
);
const cityBoundaries = convertFile(citySource, 0.06, "city")
  .concat(directCityBoundaries, taiwanCityBoundaries);
const countryBoundaries = convertFile(countrySource, 0.16, "country");
const countryRegions = Array.from(
  countryBoundaries.reduce((regions, item) => {
    if (!regions.has(item.regionId)) {
      const latitudes = item.points.map((point) => point.latitude);
      const longitudes = item.points.map((point) => point.longitude);
      regions.set(item.regionId, {
        id: item.regionId,
        name: item.name,
        latitude: Number(((Math.min(...latitudes) + Math.max(...latitudes)) / 2).toFixed(4)),
        longitude: Number(((Math.min(...longitudes) + Math.max(...longitudes)) / 2).toFixed(4))
      });
    }
    return regions;
  }, new Map()).values()
).sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));
const usRegions = JSON.parse(fs.readFileSync(usSource, "utf8")).features.map((feature, index) => ({
  id: `us-${String(feature.properties?.name || index).toLowerCase().replace(/[^a-z0-9]+/gu, "-")}`,
  name: feature.properties?.name || `State ${index + 1}`
}));
const japanRegions = JSON.parse(fs.readFileSync(japanSource, "utf8")).features.map((feature, index) => ({
  id: String(feature.properties?.iso_3166_2 || `jp-${index}`).toLowerCase(),
  name: feature.properties?.name_zh || feature.properties?.name_ja || feature.properties?.name || `都道府县 ${index + 1}`
}));
const content = `// Generated by tools/build-miniprogram-boundaries.js\nmodule.exports = ${JSON.stringify({
  countryBoundaries,
  countryRegions,
  usRegions,
  japanRegions,
  provinceBoundaries,
  cityBoundaries
})};\n`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, content, "utf8");
console.log(`Wrote ${countryBoundaries.length} country rings, ${provinceBoundaries.length} province rings and ${cityBoundaries.length} city rings`);
