function normalizePoint(coordinates, name) {
  const longitude = Number(coordinates && coordinates[0]);
  const latitude = Number(coordinates && coordinates[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    id: `import-point-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name || "导入地点",
    latitude,
    longitude
  };
}

function normalizeLine(coordinates, name) {
  const points = (coordinates || [])
    .map((coordinate) => normalizePoint(coordinate, ""))
    .filter(Boolean)
    .map(({ latitude, longitude }) => ({ latitude, longitude }));
  if (points.length < 2) return null;
  return {
    id: `import-line-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name || "导入足迹",
    points
  };
}

function parseGeometry(geometry, properties, result) {
  if (!geometry) return;
  const name = properties?.name || properties?.title || properties?.Name || "";
  if (geometry.type === "Point") {
    const point = normalizePoint(geometry.coordinates, name);
    if (point) result.points.push(point);
  } else if (geometry.type === "MultiPoint") {
    geometry.coordinates.forEach((coordinates) => {
      const point = normalizePoint(coordinates, name);
      if (point) result.points.push(point);
    });
  } else if (geometry.type === "LineString") {
    const line = normalizeLine(geometry.coordinates, name);
    if (line) result.lines.push(line);
  } else if (geometry.type === "MultiLineString" || geometry.type === "Polygon") {
    geometry.coordinates.forEach((coordinates) => {
      const line = normalizeLine(coordinates, name);
      if (line) result.lines.push(line);
    });
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((polygon) => {
      polygon.forEach((coordinates) => {
        const line = normalizeLine(coordinates, name);
        if (line) result.lines.push(line);
      });
    });
  } else if (geometry.type === "GeometryCollection") {
    geometry.geometries.forEach((item) => parseGeometry(item, properties, result));
  }
}

function parseGeoJson(text) {
  const data = JSON.parse(text);
  const result = { points: [], lines: [] };
  if (data.type === "FeatureCollection") {
    data.features.forEach((feature) => parseGeometry(feature.geometry, feature.properties || {}, result));
  } else if (data.type === "Feature") {
    parseGeometry(data.geometry, data.properties || {}, result);
  } else {
    parseGeometry(data, {}, result);
  }
  return result;
}

function splitCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
}

function parseCsv(text) {
  const rows = text.split(/\r?\n/u).filter((line) => line.trim()).map(splitCsvLine);
  if (rows.length < 2) return { points: [], lines: [] };
  const headers = rows[0].map((value) => value.toLowerCase());
  const latitudeIndex = headers.findIndex((value) => ["lat", "latitude", "纬度"].includes(value));
  const longitudeIndex = headers.findIndex((value) => ["lng", "lon", "longitude", "经度"].includes(value));
  const nameIndex = headers.findIndex((value) => ["name", "title", "名称", "地点"].includes(value));
  if (latitudeIndex < 0 || longitudeIndex < 0) throw new Error("CSV_MISSING_COORDINATES");
  return {
    points: rows.slice(1).map((row) => normalizePoint(
      [row[longitudeIndex], row[latitudeIndex]],
      nameIndex >= 0 ? row[nameIndex] : ""
    )).filter(Boolean),
    lines: []
  };
}

function parseKml(text) {
  const result = { points: [], lines: [] };
  const placemarks = text.match(/<Placemark[\s\S]*?<\/Placemark>/giu) || [];
  placemarks.forEach((placemark) => {
    const name = placemark.match(/<name[^>]*>([\s\S]*?)<\/name>/iu)?.[1]?.replace(/<[^>]+>/gu, "").trim() || "";
    const coordinateBlocks = [...placemark.matchAll(/<coordinates[^>]*>([\s\S]*?)<\/coordinates>/giu)];
    coordinateBlocks.forEach((match) => {
      const coordinates = match[1].trim().split(/\s+/u).map((value) => value.split(",").slice(0, 2));
      if (coordinates.length === 1) {
        const point = normalizePoint(coordinates[0], name);
        if (point) result.points.push(point);
      } else {
        const line = normalizeLine(coordinates, name);
        if (line) result.lines.push(line);
      }
    });
  });
  return result;
}

function parseFile(filename, text) {
  const extension = filename.split(".").pop().toLowerCase();
  if (extension === "geojson" || extension === "json") return parseGeoJson(text);
  if (extension === "csv") return parseCsv(text);
  if (extension === "kml") return parseKml(text);
  throw new Error("UNSUPPORTED_FILE");
}

module.exports = {
  parseFile
};
