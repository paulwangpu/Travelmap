/* Online ArcGIS archive: query only the visible extent; no persistent data download. */
(function (root) {
  const endpoint = "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/Historical_Quakes/FeatureServer/0/query";
  function extents(west, south, east, north) {
    south = Math.max(-90, south); north = Math.min(90, north);
    if (east - west >= 360) return [[-180, south, 180, north]];
    const width = ((east - west) % 360 + 360) % 360;
    west = ((west + 180) % 360 + 360) % 360 - 180;
    east = west + width;
    return east <= 180 ? [[west, south, east, north]] : [[west, south, 180, north], [-180, south, east - 360, north]];
  }
  function normalize(a) {
    const date = new Date(a.time);
    if (a.time == null || !Number.isFinite(date.getTime()) || !a.id || a.latitude == null || a.longitude == null || !Number.isFinite(Number(a.latitude)) || !Number.isFinite(Number(a.longitude)) || a.mag == null || !Number.isFinite(Number(a.mag))) return null;
    return { id: a.id, year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate(), hour: date.getUTCHours(), minute: date.getUTCMinutes(), second: date.getUTCSeconds(), timestamp: date.getTime(), locationName: a.place, latitude: Number(a.latitude), longitude: Number(a.longitude), eqMagnitude: Number(a.mag), eqDepth: a.depth, magnitudeType: a.magType, url: a.url, source: "USGS / Esri" };
  }
  function merge(local, online) {
    const days = new Map();
    for (const item of online) {
      const key = `${item.year}-${item.month}-${item.day}`;
      if (!days.has(key)) days.set(key, []);
      days.get(key).push(item);
    }
    const retained = local.filter(item => {
      const candidates = days.get(`${item.year}-${item.month}-${item.day}`) || [];
      return !candidates.some(other => {
        if (String(item.id).replace(/^iscgem(?:sup)?/, "") === String(other.id).replace(/^iscgem(?:sup)?/, "")) return true;
        if (item.hour == null || item.minute == null) return false;
        const time = Date.UTC(item.year, item.month - 1, item.day, item.hour, item.minute, item.second || 0);
        const longitudeDistance = Math.abs(((Number(item.longitude) - other.longitude + 540) % 360) - 180);
        return Math.abs(time - other.timestamp) <= 120000 && Math.abs(Number(item.latitude) - other.latitude) <= 0.15 && longitudeDistance <= 0.15 && Math.abs(Number(item.eqMagnitude ?? item.eqMagUnk) - other.eqMagnitude) <= 0.35;
      });
    });
    return retained.concat(online);
  }
  async function query(options) {
    const { bounds, minimum, startYear, endYear, signal, onPage, fetcher = fetch } = options;
    if (endYear != null && endYear < 1900 || startYear != null && endYear != null && startYear > endYear) return { items: [], truncated: false };
    const items = new Map();
    const limit = 20000, pageSize = 2000;
    const where = [`mag >= ${[4, 5, 6, 7].includes(Number(minimum)) ? Number(minimum) : 5}`, "type = 'Earthquake'", "time >= TIMESTAMP '1900-01-01 00:00:00'"];
    if (Number.isInteger(startYear) && startYear >= 1900 && startYear <= 9998) where.push(`time >= TIMESTAMP '${startYear}-01-01 00:00:00'`);
    if (Number.isInteger(endYear) && endYear >= 1900 && endYear <= 9998) where.push(`time < TIMESTAMP '${endYear + 1}-01-01 00:00:00'`);
    const envelopes = extents(...bounds);
    for (const [extentIndex, extent] of envelopes.entries()) {
      for (let offset = 0; ; offset += pageSize) {
        const params = new URLSearchParams({ f: "json", where: where.join(" AND "), geometry: extent.join(","), geometryType: "esriGeometryEnvelope", inSR: "4326", spatialRel: "esriSpatialRelIntersects", outFields: "id,mag,magType,time,place,latitude,longitude,depth,url", returnGeometry: "false", orderByFields: "mag DESC,OBJECTID ASC", resultOffset: String(offset), resultRecordCount: String(pageSize) });
        const response = await fetcher(`${endpoint}?${params}`, { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "ArcGIS query failed");
        if (!Array.isArray(data.features)) throw new Error("Invalid ArcGIS response");
        for (const feature of data.features || []) {
          const item = normalize(feature.attributes || {});
          if (item && (items.size < limit || items.has(item.id))) items.set(item.id, item);
        }
        onPage?.([...items.values()]);
        if (items.size >= limit && (data.exceededTransferLimit || extentIndex < envelopes.length - 1)) return { items: [...items.values()], truncated: true };
        if (!data.exceededTransferLimit) break;
        if (!(data.features || []).length) throw new Error("ArcGIS returned an empty incomplete page");
      }
    }
    return { items: [...items.values()], truncated: false };
  }
  function yearPreset(preset, currentYear = new Date().getFullYear()) {
    if (preset === "all") return [null, null];
    if (preset === "before1900") return [null, 1899];
    if (preset === "1900") return [1900, currentYear];
    if (preset === "10") return [currentYear - 9, currentYear];
    return null;
  }
  function yearDomain(start, end, earliest, currentYear) {
    return { min: Math.min(start == null ? earliest : 1900, start ?? earliest, end ?? currentYear), max: Math.max(currentYear, start ?? currentYear, end ?? currentYear) };
  }
  function yearPosition(year, earliest, latest) {
    const value = Math.max(earliest, Math.min(latest, year));
    return value <= 1900 ? (value - earliest) / (1900 - earliest) * 1500 : 1500 + (value - 1900) / (latest - 1900) * 8500;
  }
  function positionYear(position, earliest, latest) {
    const value = Math.max(0, Math.min(10000, Number(position)));
    return Math.round(value <= 1500 ? earliest + value / 1500 * (1900 - earliest) : 1900 + (value - 1500) / 8500 * (latest - 1900));
  }
  const api = { endpoint, extents, normalize, merge, query, yearPreset, yearDomain, yearPosition, positionYear };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EarthquakeOnline = api;
})(typeof window !== "undefined" ? window : globalThis);
