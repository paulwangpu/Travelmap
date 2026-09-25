const fs = require("fs");
const path = require("path");
const polygonClipping = require("polygon-clipping");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value)}\n`, "utf8");
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.renameSync(temporary, file);
      return;
    } catch (error) {
      lastError = error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 40 * (attempt + 1));
    }
  }
  if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  throw lastError;
}

function polygons(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates || [];
  return [];
}

function geometryFromMultiPolygon(coordinates) {
  if (!Array.isArray(coordinates) || !coordinates.length) return null;
  return coordinates.length === 1
    ? { type: "Polygon", coordinates: coordinates[0] }
    : { type: "MultiPolygon", coordinates };
}

function polygonCenter(polygon) {
  const ring = polygon?.[0] || [];
  if (!ring.length) return [0, 0];
  const xs = ring.map((point) => point[0]);
  const ys = ring.map((point) => point[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}

function distanceToBbox(point, bbox) {
  if (!bbox) return Number.POSITIVE_INFINITY;
  const dx = point[0] < bbox[0] ? bbox[0] - point[0] : point[0] > bbox[2] ? point[0] - bbox[2] : 0;
  const dy = point[1] < bbox[1] ? bbox[1] - point[1] : point[1] > bbox[3] ? point[1] - bbox[3] : 0;
  return dx * dx + dy * dy;
}

function pointKey(point) {
  return `${Number(point[0]).toFixed(12)},${Number(point[1]).toFixed(12)}`;
}

function edgeKey(a, b) {
  const left = pointKey(a);
  const right = pointKey(b);
  return left < right ? `${left}|${right}` : `${right}|${left}`;
}

function signedArea(ring) {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return area / 2;
}

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const crosses = ((yi > point[1]) !== (yj > point[1]))
      && point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || Number.EPSILON) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function bboxForGeometry(geometry) {
  const points = polygons(geometry).flat(2);
  if (!points.length) return null;
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// Dissolve polygons without re-simplifying them. Identical child edges cancel, so
// every retained parent edge is literally made from the child layer's vertices.
function dissolveGeometries(geometries) {
  const edges = new Map();
  geometries.forEach((geometry) => {
    polygons(geometry).forEach((polygon) => polygon.forEach((ring) => {
      for (let i = 0; i < ring.length - 1; i += 1) {
        const a = ring[i];
        const b = ring[i + 1];
        const key = edgeKey(a, b);
        if (edges.has(key)) edges.delete(key);
        else edges.set(key, { a, b });
      }
    }));
  });

  const adjacency = new Map();
  const boundaryEdges = Array.from(edges.values());
  boundaryEdges.forEach((edge, index) => {
    [edge.a, edge.b].forEach((point) => {
      const key = pointKey(point);
      if (!adjacency.has(key)) adjacency.set(key, []);
      adjacency.get(key).push(index);
    });
  });

  const used = new Set();
  const rings = [];
  for (let start = 0; start < boundaryEdges.length; start += 1) {
    if (used.has(start)) continue;
    const first = boundaryEdges[start];
    const ring = [first.a, first.b];
    used.add(start);
    const startKey = pointKey(first.a);
    let currentKey = pointKey(first.b);
    let guard = 0;
    while (currentKey !== startKey && guard <= boundaryEdges.length) {
      const nextIndex = (adjacency.get(currentKey) || []).find((index) => !used.has(index));
      if (nextIndex === undefined) break;
      const edge = boundaryEdges[nextIndex];
      const next = pointKey(edge.a) === currentKey ? edge.b : edge.a;
      ring.push(next);
      currentKey = pointKey(next);
      used.add(nextIndex);
      guard += 1;
    }
    if (currentKey === startKey && ring.length >= 4) rings.push(ring);
  }
  if (!rings.length) return null;

  const largest = rings.reduce((best, ring) => (
    Math.abs(signedArea(ring)) > Math.abs(signedArea(best)) ? ring : best
  ));
  const exteriorSign = Math.sign(signedArea(largest)) || 1;
  const exteriors = rings.filter((ring) => (Math.sign(signedArea(ring)) || exteriorSign) === exteriorSign);
  const holes = rings.filter((ring) => (Math.sign(signedArea(ring)) || exteriorSign) !== exteriorSign);
  const result = exteriors.map((ring) => [ring]);
  holes.forEach((hole) => {
    const container = exteriors.findIndex((outer) => pointInRing(hole[0], outer));
    if (container >= 0) result[container].push(hole);
    else result.push([hole.slice().reverse()]);
  });
  return result.length === 1
    ? { type: "Polygon", coordinates: result[0] }
    : { type: "MultiPolygon", coordinates: result };
}

function provinceCode(properties = {}) {
  const adcode = Number(properties.adcode || 0);
  const route = Array.isArray(properties.acroutes) ? properties.acroutes.map(Number) : [];
  const parent = Number(properties.parent?.adcode || properties.parent_adcode || 0);
  if (adcode && adcode % 10000 === 0) return adcode;
  return route.find((code) => code >= 110000 && code <= 820000 && code % 10000 === 0)
    || (parent >= 110000 && parent <= 820000 ? Math.floor(parent / 10000) * 10000 : 0);
}

function rebuildChina(root, cityCollection, oldProvinceCollection) {
  const data = path.join(root, "data");
  const rawFiles = [
    path.join(data, "china-prefectures.geojson"),
    path.join(data, "china-direct-admin.geojson"),
    path.join(data, "admin1-by-country", "tw.geojson"),
  ];
  const raw = rawFiles.flatMap((file) => (fs.existsSync(file) ? readJson(file).features || [] : []));
  if (raw.length !== cityCollection.features.length) {
    throw new Error(`China city hierarchy mismatch: ${raw.length} source features, ${cityCollection.features.length} built features`);
  }
  const provinceSource = readJson(path.join(data, "china-provinces.geojson")).features || [];
  const metadata = new Map(provinceSource.map((feature) => [Number(feature.properties?.adcode), feature.properties || {}]));
  const groups = new Map();
  cityCollection.features.forEach((feature, index) => {
    const rawProperties = raw[index].properties || {};
    const code = provinceCode(rawProperties) || (index >= raw.length - (readJson(rawFiles[2]).features || []).length ? 710000 : 0);
    if (!code) return;
    if (!groups.has(code)) groups.set(code, []);
    groups.get(code).push(feature.geometry);
  });
  const rebuilt = Array.from(groups.entries()).map(([code, geometries]) => {
    const source = metadata.get(code) || {};
    const geometry = dissolveGeometries(geometries);
    const name = source.name || (code === 710000 ? "台湾" : String(code));
    return {
      type: "Feature",
      properties: {
        id: `cn-province-${code}`,
        countryId: "cn",
        name,
        name_en: source.name_en || name,
        adcode: code,
        source_layer: "province",
        grouped_from: "city",
        bbox: bboxForGeometry(geometry),
      },
      geometry,
    };
  }).filter((feature) => feature.geometry);
  ["香港", "澳门"].forEach((specialName) => {
    const existing = (oldProvinceCollection.features || []).find((feature) => String(feature.properties?.name || "").includes(specialName));
    if (existing) rebuilt.push(existing);
  });
  return rebuilt;
}

const usStateNameByFips = {
  "01": "Alabama", "02": "Alaska", "04": "Arizona", "05": "Arkansas", "06": "California", "08": "Colorado",
  "09": "Connecticut", "10": "Delaware", "11": "District of Columbia", "12": "Florida", "13": "Georgia",
  "15": "Hawaii", "16": "Idaho", "17": "Illinois", "18": "Indiana", "19": "Iowa", "20": "Kansas",
  "21": "Kentucky", "22": "Louisiana", "23": "Maine", "24": "Maryland", "25": "Massachusetts", "26": "Michigan",
  "27": "Minnesota", "28": "Mississippi", "29": "Missouri", "30": "Montana", "31": "Nebraska", "32": "Nevada",
  "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico", "36": "New York", "37": "North Carolina",
  "38": "North Dakota", "39": "Ohio", "40": "Oklahoma", "41": "Oregon", "42": "Pennsylvania", "44": "Rhode Island",
  "45": "South Carolina", "46": "South Dakota", "47": "Tennessee", "48": "Texas", "49": "Utah", "50": "Vermont",
  "51": "Virginia", "53": "Washington", "54": "West Virginia", "55": "Wisconsin", "56": "Wyoming", "72": "Puerto Rico",
};

function rebuildUs(cityCollection, oldProvinceCollection) {
  const groups = new Map();
  cityCollection.features.forEach((feature) => {
    const key = String(feature.properties?.statefp || "");
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(feature.geometry);
  });
  const oldFeatures = oldProvinceCollection.features || [];
  return Array.from(groups.entries()).filter(([statefp]) => usStateNameByFips[statefp]).map(([statefp, geometries]) => {
    const geometry = dissolveGeometries(geometries);
    const bbox = bboxForGeometry(geometry);
    const center = bbox ? [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2] : [0, 0];
    const match = oldFeatures.find((feature) => {
      const box = feature.properties?.bbox || bboxForGeometry(feature.geometry);
      return box && center[0] >= box[0] && center[0] <= box[2] && center[1] >= box[1] && center[1] <= box[3];
    });
    const name = usStateNameByFips[statefp];
    const namedMatch = oldFeatures.find((feature) => feature.properties?.name === name) || match;
    return {
      type: "Feature",
      properties: {
        ...(namedMatch?.properties || {}),
        id: `us-province-${statefp}`,
        countryId: "us",
        name,
        name_en: namedMatch?.properties?.name_en || name,
        statefp,
        source_layer: "province",
        grouped_from: "city",
        bbox,
      },
      geometry,
    };
  }).filter((feature) => feature.geometry);
}

function replaceCountryGeometry(world, countryCode, provinceFeatures) {
  const feature = world.features.find((item) => String(item.properties?.["ISO3166-1-Alpha-2"] || "").toUpperCase() === countryCode);
  if (!feature) throw new Error(`Country ${countryCode} not found`);
  feature.geometry = dissolveGeometries(provinceFeatures.map((item) => item.geometry));
  feature.properties.bbox = bboxForGeometry(feature.geometry);
  feature.properties.grouped_from = "province";
}

function preserveProvinceTopology(collection, countryId) {
  return {
    type: "FeatureCollection",
    features: (collection.features || []).map((feature) => ({
      ...feature,
      properties: {
        ...(feature.properties || {}),
        countryId,
        source_layer: "province",
        topology_source: "province",
        bbox: bboxForGeometry(feature.geometry),
      },
    })),
  };
}

function chinaCityProvinceKeys(root, cityCount) {
  const data = path.join(root, "data");
  const files = [
    path.join(data, "china-prefectures.geojson"),
    path.join(data, "china-direct-admin.geojson"),
    path.join(data, "admin1-by-country", "tw.geojson"),
  ];
  const raw = files.flatMap((file) => (fs.existsSync(file) ? readJson(file).features || [] : []));
  if (raw.length !== cityCount) throw new Error(`China city hierarchy mismatch: ${raw.length}/${cityCount}`);
  const taiwanStart = raw.length - (readJson(files[2]).features || []).length;
  return raw.map((feature, index) => String(provinceCode(feature.properties || {}) || (index >= taiwanStart ? 710000 : "")));
}

function alignCitiesToProvinces(cityCollection, provinceCollection, cityGroupKeys, provinceGroupKey, fillResidual = true) {
  const provinceByKey = new Map(provinceCollection.features.map((feature) => [String(provinceGroupKey(feature)), feature]));
  const groupedIndexes = new Map();
  cityCollection.features.forEach((feature, index) => {
    const key = String(cityGroupKeys[index] || "");
    if (!key || !provinceByKey.has(key)) return;
    if (!groupedIndexes.has(key)) groupedIndexes.set(key, []);
    groupedIndexes.get(key).push(index);
  });

  groupedIndexes.forEach((indexes, key) => {
    const province = provinceByKey.get(key);
    const provincePolygon = polygons(province.geometry);
    const clipped = [];
    indexes.forEach((index) => {
      const city = cityCollection.features[index];
      let coordinates;
      try {
        coordinates = polygonClipping.intersection(polygons(city.geometry), provincePolygon);
      } catch (error) {
        return;
      }
      if (!coordinates.length) return;
      city.geometry = geometryFromMultiPolygon(coordinates);
      city.properties = { ...city.properties, topology_source: "province-clip", bbox: bboxForGeometry(city.geometry) };
      clipped.push(index);
    });
    if (!clipped.length) return;

    if (!fillResidual) return;
    const covered = polygonClipping.union(...clipped.map((index) => polygons(cityCollection.features[index].geometry)));
    let residual = [];
    try {
      residual = polygonClipping.difference(provincePolygon, covered);
    } catch (error) {
      // Dateline geometries (notably Alaska) can contain nearly identical
      // floating-point endpoints. Their cities are still clipped safely; only
      // optional microscopic-gap assignment is skipped for that group.
      residual = [];
    }
    residual.forEach((gapPolygon) => {
      const center = polygonCenter(gapPolygon);
      const owner = clipped.reduce((best, index) => {
        const distance = distanceToBbox(center, cityCollection.features[index].properties?.bbox);
        return !best || distance < best.distance ? { index, distance } : best;
      }, null)?.index;
      if (owner === undefined) return;
      const city = cityCollection.features[owner];
      city.geometry = geometryFromMultiPolygon(polygonClipping.union(polygons(city.geometry), [gapPolygon]));
      city.properties.bbox = bboxForGeometry(city.geometry);
    });
  });
  return cityCollection;
}

function rebuildSharedBoundaries(root) {
  const boundaryRoot = path.join(root, "data", "boundaries");
  const oldCnProvince = readJson(path.join(boundaryRoot, "province", "cn.geojson"));
  const oldUsProvince = readJson(path.join(boundaryRoot, "province", "us.geojson"));
  // Province/state sources already share their internal borders. City sources do
  // not: their cross-province edges were simplified independently and create
  // visible slivers when dissolved upward. Keep the coherent province topology,
  // then derive the country outline from exactly those province vertices.
  const cnProvince = preserveProvinceTopology(oldCnProvince, "cn");
  const usProvince = preserveProvinceTopology(oldUsProvince, "us");
  const chinaProvinceCodeByName = new Map(
    (readJson(path.join(root, "data", "china-provinces.geojson")).features || [])
      .map((feature) => [String(feature.properties?.name || ""), String(feature.properties?.adcode || "")]),
  );
  chinaProvinceCodeByName.set("台湾省", "710000");
  chinaProvinceCodeByName.set("台湾", "710000");
  const cnCityFile = path.join(boundaryRoot, "city", "cn.geojson");
  const usCityFile = path.join(boundaryRoot, "city", "us.geojson");
  const cnCity = alignCitiesToProvinces(
    readJson(cnCityFile),
    cnProvince,
    chinaCityProvinceKeys(root, readJson(cnCityFile).features.length),
    (feature) => chinaProvinceCodeByName.get(String(feature.properties?.name || "")) || "",
    false,
  );
  const usCitySource = readJson(usCityFile);
  const usCity = alignCitiesToProvinces(
    usCitySource,
    usProvince,
    usCitySource.features.map((feature) => feature.properties?.statefp),
    (feature) => Object.entries(usStateNameByFips).find(([, name]) => name === feature.properties?.name)?.[0] || "",
    false,
  );
  writeJson(cnCityFile, cnCity);
  writeJson(usCityFile, usCity);
  writeJson(path.join(boundaryRoot, "province", "cn.geojson"), cnProvince);
  writeJson(path.join(boundaryRoot, "province", "us.geojson"), usProvince);

  const worldFile = path.join(boundaryRoot, "country", "world.geojson");
  const world = readJson(worldFile);
  replaceCountryGeometry(world, "CN", cnProvince.features);
  replaceCountryGeometry(world, "US", usProvince.features);
  writeJson(worldFile, world);
  return { cnProvinceCount: cnProvince.features.length, usProvinceCount: usProvince.features.length };
}

module.exports = { dissolveGeometries, rebuildSharedBoundaries };

if (require.main === module) {
  const root = path.resolve(__dirname, "..");
  console.log(rebuildSharedBoundaries(root));
}
