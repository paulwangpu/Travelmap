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

function parsePhoto(filename, buffer) {
  const gps = readExifGps(buffer);
  if (!gps) return null;
  return {
    name: filename.replace(/\.[^.]+$/u, "") || "照片地点",
    latitude: gps.latitude,
    longitude: gps.longitude,
    type: "照片",
    source: "Photo EXIF GPS"
  };
}

function readExifGps(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 12) return null;
  if (view.getUint16(0, false) === 0xffd8) return readJpegExifGps(view);
  return readTiffGps(view, 0);
}

function readJpegExifGps(view) {
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) return null;
    const marker = view.getUint8(offset + 1);
    const size = view.getUint16(offset + 2, false);
    if (marker === 0xe1 && offset + 4 + size <= view.byteLength) {
      if (asciiFromView(view, offset + 4, 6) === "Exif\0\0") {
        return readTiffGps(view, offset + 10);
      }
    }
    offset += 2 + size;
  }
  return null;
}

function readTiffGps(view, tiffOffset) {
  if (tiffOffset + 8 > view.byteLength) return null;
  const endian = asciiFromView(view, tiffOffset, 2);
  const littleEndian = endian === "II";
  if (!littleEndian && endian !== "MM") return null;
  if (view.getUint16(tiffOffset + 2, littleEndian) !== 42) return null;
  const ifd0Offset = view.getUint32(tiffOffset + 4, littleEndian);
  const gpsEntry = readIfdValue(view, tiffOffset, tiffOffset + ifd0Offset, 0x8825, littleEndian);
  if (!gpsEntry?.valueOffset) return null;
  const gpsIfd = tiffOffset + gpsEntry.valueOffset;
  const latRef = readExifAsciiValue(view, tiffOffset, gpsIfd, 1, littleEndian);
  const lat = readExifRationalTriplet(view, tiffOffset, gpsIfd, 2, littleEndian);
  const lngRef = readExifAsciiValue(view, tiffOffset, gpsIfd, 3, littleEndian);
  const lng = readExifRationalTriplet(view, tiffOffset, gpsIfd, 4, littleEndian);
  if (!lat || !lng) return null;
  const latitude = dmsToDecimal(lat) * (latRef === "S" ? -1 : 1);
  const longitude = dmsToDecimal(lng) * (lngRef === "W" ? -1 : 1);
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : null;
}

function readIfdValue(view, tiffOffset, ifdOffset, targetTag, littleEndian) {
  if (ifdOffset + 2 > view.byteLength) return null;
  const count = view.getUint16(ifdOffset, littleEndian);
  for (let index = 0; index < count; index += 1) {
    const entry = ifdOffset + 2 + index * 12;
    if (entry + 12 > view.byteLength) return null;
    if (view.getUint16(entry, littleEndian) !== targetTag) continue;
    return {
      type: view.getUint16(entry + 2, littleEndian),
      itemCount: view.getUint32(entry + 4, littleEndian),
      valueOffset: view.getUint32(entry + 8, littleEndian),
      entryValueOffset: entry + 8
    };
  }
  return null;
}

function readExifAsciiValue(view, tiffOffset, ifdOffset, tag, littleEndian) {
  const entry = readIfdValue(view, tiffOffset, ifdOffset, tag, littleEndian);
  if (!entry) return "";
  const offset = entry.itemCount <= 4 ? entry.entryValueOffset : tiffOffset + entry.valueOffset;
  return asciiFromView(view, offset, entry.itemCount).replace(/\0/gu, "").trim();
}

function readExifRationalTriplet(view, tiffOffset, ifdOffset, tag, littleEndian) {
  const entry = readIfdValue(view, tiffOffset, ifdOffset, tag, littleEndian);
  if (!entry || entry.type !== 5 || entry.itemCount < 3) return null;
  const offset = tiffOffset + entry.valueOffset;
  if (offset + 24 > view.byteLength) return null;
  return [0, 1, 2].map((index) => {
    const base = offset + index * 8;
    const numerator = view.getUint32(base, littleEndian);
    const denominator = view.getUint32(base + 4, littleEndian);
    return denominator ? numerator / denominator : 0;
  });
}

function dmsToDecimal(values) {
  return values[0] + values[1] / 60 + values[2] / 3600;
}

function asciiFromView(view, offset, length) {
  if (offset < 0 || offset + length > view.byteLength) return "";
  let output = "";
  for (let index = 0; index < length; index += 1) {
    output += String.fromCharCode(view.getUint8(offset + index));
  }
  return output;
}

module.exports = {
  parseFile,
  parsePhoto
};
