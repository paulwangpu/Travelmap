const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const polygons = (geometry) => geometry?.type === "Polygon"
  ? [geometry.coordinates]
  : geometry?.type === "MultiPolygon" ? geometry.coordinates : [];
const pointKey = (point) => `${Number(point[0]).toFixed(12)},${Number(point[1]).toFixed(12)}`;
const points = (features) => new Set(features.flatMap((feature) => polygons(feature.geometry).flat(2)).map(pointKey));
const edgeKey = (left, right) => {
  const a = pointKey(left);
  const b = pointKey(right);
  return a < b ? `${a}|${b}` : `${b}|${a}`;
};
const sharedEdgeCount = (features) => {
  const owners = new Map();
  features.forEach((feature, featureIndex) => polygons(feature.geometry).forEach((polygon) => polygon.forEach((ring) => {
    for (let index = 0; index < ring.length - 1; index += 1) {
      const key = edgeKey(ring[index], ring[index + 1]);
      if (!owners.has(key)) owners.set(key, new Set());
      owners.get(key).add(featureIndex);
    }
  })));
  return Array.from(owners.values()).filter((featureOwners) => featureOwners.size > 1).length;
};

const world = read("data/boundaries/country/world.geojson");
for (const countryId of ["cn", "us"]) {
  const cities = read(`data/boundaries/city/${countryId}.geojson`).features;
  const provinces = read(`data/boundaries/province/${countryId}.geojson`).features;
  assert.equal(provinces.length, countryId === "cn" ? 34 : 52, `${countryId} province/state count`);
  assert.ok(provinces.every((feature) => feature.geometry && feature.properties.topology_source === "province"));
  assert.ok(sharedEdgeCount(provinces) > (countryId === "cn" ? 8000 : 700), `${countryId} adjacent provinces/states must share boundary edges`);
  const clippedCityCount = cities.filter((feature) => feature.properties?.topology_source === "province-clip").length;
  assert.ok(clippedCityCount >= (countryId === "cn" ? 387 : 436), `${countryId} city/district exteriors are clipped to province/state boundaries`);

  const countryCode = countryId.toUpperCase();
  const country = world.features.find((feature) => feature.properties?.["ISO3166-1-Alpha-2"] === countryCode);
  assert.equal(country.properties.grouped_from, "province", `${countryId} country is derived from provinces`);
  const provincePoints = points(provinces);
  for (const point of points([country])) {
    assert.ok(provincePoints.has(point), `${countryId} country vertex ${point} must come from province geometry`);
  }
}

console.log("PASS: China and US provinces/states share borders and country outlines reuse province vertices");
