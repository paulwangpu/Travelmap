const boundaries = require("../data/boundaries");
const webCatalog = require("../data/web-catalog");
const checklists = require("../data/checklists");
const catalog = require("./catalog");

function pointInRing(longitude, latitude, points) {
  let inside = false;
  for (let current = 0, previous = points.length - 1; current < points.length; previous = current, current += 1) {
    const currentPoint = points[current];
    const previousPoint = points[previous];
    const crosses = (currentPoint.latitude > latitude) !== (previousPoint.latitude > latitude);
    const edgeLongitude = ((previousPoint.longitude - currentPoint.longitude) * (latitude - currentPoint.latitude))
      / ((previousPoint.latitude - currentPoint.latitude) || Number.EPSILON)
      + currentPoint.longitude;
    if (crosses && longitude < edgeLongitude) inside = !inside;
  }
  return inside;
}

function findBoundary(items, longitude, latitude) {
  return items.find((item) => pointInRing(longitude, latitude, item.points));
}

function regionAtPoint(level, longitude, latitude, provinceId = "") {
  if (level === "country") {
    return findBoundary(boundaries.countryBoundaries, longitude, latitude)?.regionId || "";
  }
  if (level === "city") {
    const cityItems = provinceId
      ? boundaries.cityBoundaries.filter((item) => item.provinceId === provinceId)
      : boundaries.cityBoundaries;
    return findBoundary(cityItems, longitude, latitude)?.regionId || "";
  }
  return findBoundary(boundaries.provinceBoundaries, longitude, latitude)?.regionId || "";
}

function inferPoint(longitude, latitude) {
  const country = findBoundary(boundaries.countryBoundaries, longitude, latitude);
  const province = findBoundary(boundaries.provinceBoundaries, longitude, latitude);
  const city = findBoundary(boundaries.cityBoundaries, longitude, latitude);
  return {
    countryId: country?.regionId || "",
    countryName: catalog.countryName(
      country?.regionId,
      boundaries.countryRegions.find((item) => item.id === country?.regionId)?.name || ""
    ),
    provinceId: province?.regionId || city?.provinceId || "",
    provinceName: province?.name || "",
    cityId: city?.regionId || "",
    cityName: city?.name || ""
  };
}

function provinceIdForCity(cityId) {
  return boundaries.cityBoundaries.find((item) => item.regionId === cityId)?.provinceId
    || webCatalog.cityRegions.find((item) => item.id === cityId)?.provinceId
    || "";
}

function toggleRegion(state, level, id) {
  const key = level === "city"
    ? "manualVisitedCities"
    : level === "country"
      ? "manualVisitedCountries"
      : level === "us"
        ? "manualVisitedUsStates"
        : level === "japan"
          ? "manualVisitedJapanRegions"
          : "manualVisitedProvinces";
  const values = new Set(state[key] || []);
  if (values.has(id)) values.delete(id);
  else values.add(id);
  return recomputeCoverage({
    ...state,
    [key]: Array.from(values)
  });
}

function recomputeCoverage(state, extraPoints = []) {
  const countries = new Set(state.manualVisitedCountries || []);
  const provinces = new Set(state.manualVisitedProvinces || []);
  const cities = new Set(state.manualVisitedCities || []);
  const usStates = new Set(state.manualVisitedUsStates || []);
  const japanRegions = new Set(state.manualVisitedJapanRegions || []);

  cities.forEach((cityId) => {
    const provinceId = provinceIdForCity(cityId);
    if (provinceId) provinces.add(provinceId);
  });
  if (provinces.size || cities.size) countries.add("cn");
  if (usStates.size) countries.add("us");
  if (japanRegions.size) countries.add("jp");

  const linePoints = (state.importedLines || []).flatMap((line) =>
    (line.points || []).filter((point, index) =>
      index === 0 || index === line.points.length - 1 || index % 20 === 0
    )
  );
  const points = []
    .concat(state.checkins || [])
    .concat(state.importedPoints || [])
    .concat(linePoints)
    .concat(["china5a", "worldHeritage", "referenceLists"].flatMap((key) => {
      const marks = new Set(state.checklistMarks?.[key] || []);
      return (checklists[key] || []).filter((item) =>
        marks.has(item.id)
        && Number.isFinite(Number(item.longitude))
        && Number.isFinite(Number(item.latitude))
      );
    }))
    .concat(extraPoints || []);
  points.forEach((point) => {
    const longitude = Number(point.longitude);
    const latitude = Number(point.latitude);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;
    const country = findBoundary(boundaries.countryBoundaries, longitude, latitude);
    if (country) countries.add(country.regionId);
    const province = findBoundary(boundaries.provinceBoundaries, longitude, latitude);
    if (province) provinces.add(province.regionId);
    const city = findBoundary(boundaries.cityBoundaries, longitude, latitude);
    if (city) {
      cities.add(city.regionId);
      if (city.provinceId) provinces.add(city.provinceId);
    }
  });
  if (provinces.size || cities.size) countries.add("cn");

  return {
    manualVisitedCountries: Array.from(state.manualVisitedCountries || []),
    manualVisitedProvinces: Array.from(state.manualVisitedProvinces || []),
    manualVisitedCities: Array.from(state.manualVisitedCities || []),
    manualVisitedUsStates: Array.from(state.manualVisitedUsStates || []),
    manualVisitedJapanRegions: Array.from(state.manualVisitedJapanRegions || []),
    visitedCountries: Array.from(countries),
    visitedProvinces: Array.from(provinces),
    visitedCities: Array.from(cities),
    visitedUsStates: Array.from(usStates),
    visitedJapanRegions: Array.from(japanRegions)
  };
}

function inferCoverage(state, points) {
  return recomputeCoverage(state, points);
}

/*
 * Older states stored only the derived coverage arrays. Store normalization
 * migrates them into manual arrays before this reconciliation runs.
 */
function reconcileCoverage(state) {
  return recomputeCoverage(state);
}

module.exports = {
  inferCoverage,
  inferPoint,
  provinceIdForCity,
  recomputeCoverage,
  reconcileCoverage,
  regionAtPoint,
  toggleRegion
};
