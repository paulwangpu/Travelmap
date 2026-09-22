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

const world = read("data/boundaries/country/world.geojson");
for (const countryId of ["cn", "us"]) {
  const cities = read(`data/boundaries/city/${countryId}.geojson`).features;
  const provinces = read(`data/boundaries/province/${countryId}.geojson`).features;
  assert.equal(provinces.length, countryId === "cn" ? 34 : 52, `${countryId} province/state count`);
  assert.ok(provinces.every((feature) => feature.geometry && feature.properties.grouped_from === "city" || ["香港特别行政区", "澳门特别行政区"].includes(feature.properties.name)));

  const childPoints = points(cities);
  const derivedProvinces = provinces.filter((feature) => feature.properties.grouped_from === "city");
  for (const point of points(derivedProvinces)) {
    assert.ok(childPoints.has(point), `${countryId} parent vertex ${point} must come from city geometry`);
  }

  const countryCode = countryId.toUpperCase();
  const country = world.features.find((feature) => feature.properties?.["ISO3166-1-Alpha-2"] === countryCode);
  assert.equal(country.properties.grouped_from, "province", `${countryId} country is derived from provinces`);
  const provincePoints = points(provinces);
  for (const point of points([country])) {
    assert.ok(provincePoints.has(point), `${countryId} country vertex ${point} must come from province geometry`);
  }
}

console.log("PASS: China and US country/province boundaries share child-layer vertices");
