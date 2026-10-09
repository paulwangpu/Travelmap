/* Reproject only visible GCJ-02 raster tiles to the map's WGS84 grid. */
(function (root) {
  const shifted = new Set(['gaode', 'gaodeSatellite', 'google', 'googleTerrain', 'bingRoad']);
  const size = 256;
  function tileUrl(provider, z, x, y) {
    return provider.tileUrl ? provider.tileUrl(z, x, y) : provider.tiles[Math.abs(x + y) % provider.tiles.length].replace('{z}', z).replace('{x}', x).replace('{y}', y);
  }
  const tileCache = new Map();
  async function readTile(url, signal) {
    if (tileCache.has(url)) return tileCache.get(url);
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error('Basemap tile HTTP ' + response.status);
    const data = await response.arrayBuffer();
    tileCache.set(url, data);
    if (tileCache.size > 64) tileCache.delete(tileCache.keys().next().value);
    return data;
  }
  function pixel(lng, lat, z) {
    const n = size * 2 ** z, sin = Math.sin(lat * Math.PI / 180);
    return [(lng + 180) / 360 * n, (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * n];
  }
  function coordinate(x, y, z) {
    const n = size * 2 ** z;
    return [x / n * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI];
  }
  function grid(z, x, y, transform) {
    const steps = 8, points = [];
    for (let j = 0; j <= steps; j++) for (let i = 0; i <= steps; i++) {
      const u = i * size / steps, v = j * size / steps;
      const ll = coordinate(x * size + u, y * size + v, z);
      const p = pixel(...transform(...ll), z);
      points.push({ u, v, x: p[0], y: p[1] });
    }
    return { steps, points };
  }
  function triangle(ctx, image, a, b, c, originX, originY) {
    const sx = [a.x - originX, b.x - originX, c.x - originX], sy = [a.y - originY, b.y - originY, c.y - originY];
    const dx = [a.u, b.u, c.u], dy = [a.v, b.v, c.v];
    const det = sx[0] * (sy[1] - sy[2]) + sx[1] * (sy[2] - sy[0]) + sx[2] * (sy[0] - sy[1]);
    if (Math.abs(det) < 1e-8) return;
    const coeff = d => [(d[0] * (sy[1] - sy[2]) + d[1] * (sy[2] - sy[0]) + d[2] * (sy[0] - sy[1])) / det,
      (d[0] * (sx[2] - sx[1]) + d[1] * (sx[0] - sx[2]) + d[2] * (sx[1] - sx[0])) / det,
      (d[0] * (sx[1] * sy[2] - sx[2] * sy[1]) + d[1] * (sx[2] * sy[0] - sx[0] * sy[2]) + d[2] * (sx[0] * sy[1] - sx[1] * sy[0])) / det];
    const h = coeff(dx), v = coeff(dy);
    const cx = (a.u + b.u + c.u) / 3, cy = (a.v + b.v + c.v) / 3;
    const edge = p => [p.u + Math.sign(p.u - cx) * 0.3, p.v + Math.sign(p.v - cy) * 0.3];
    ctx.save(); ctx.beginPath(); ctx.moveTo(...edge(a)); ctx.lineTo(...edge(b)); ctx.lineTo(...edge(c)); ctx.closePath(); ctx.clip();
    ctx.setTransform(h[0], v[0], h[1], v[1], h[2], v[2]); ctx.drawImage(image, 0, 0); ctx.restore();
  }
  async function tile(provider, z, x, y, transform, signal) {
    const { steps, points } = grid(z, x, y, transform);
    if (points.every(p => Math.abs(p.x - x * size - p.u) < 0.001 && Math.abs(p.y - y * size - p.v) < 0.001)) {
      const url = tileUrl(provider, z, x, y);
      return (await readTile(url, signal)).slice(0);
    }
    const minX = Math.floor(Math.min(...points.map(p => p.x)) / size), maxX = Math.floor((Math.max(...points.map(p => p.x)) - 1e-6) / size);
    const minY = Math.floor(Math.min(...points.map(p => p.y)) / size), maxY = Math.floor((Math.max(...points.map(p => p.y)) - 1e-6) / size);
    const canvas = new OffscreenCanvas((maxX - minX + 1) * size, (maxY - minY + 1) * size), ctx = canvas.getContext('2d');
    const jobs = [];
    for (let ty = minY; ty <= maxY; ty++) for (let tx = minX; tx <= maxX; tx++) {
      const n = 2 ** z, nx = ((tx % n) + n) % n;
      if (ty < 0 || ty >= n) continue;
      const url = tileUrl(provider, z, nx, ty);
      jobs.push(readTile(url, signal).then(data => createImageBitmap(new Blob([data]))).then(image => {
        ctx.drawImage(image, (tx - minX) * size, (ty - minY) * size, size, size); image.close();
      }));
    }
    await Promise.all(jobs);
    const output = new OffscreenCanvas(size, size), out = output.getContext('2d');
    for (let j = 0; j < steps; j++) for (let i = 0; i < steps; i++) {
      const a = points[j * (steps + 1) + i], b = points[j * (steps + 1) + i + 1], c = points[(j + 1) * (steps + 1) + i], d = points[(j + 1) * (steps + 1) + i + 1];
      triangle(out, canvas, a, b, d, minX * size, minY * size); triangle(out, canvas, a, d, c, minX * size, minY * size);
    }
    return (await output.convertToBlob({ type: 'image/png' })).arrayBuffer();
  }
  function register(maplibre, providers, transform) {
    maplibre.addProtocol('aligned', (params, controller) => {
      const match = params.url.match(/^aligned:\/\/([^/]+)\/(\d+)\/(\d+)\/(\d+)/);
      if (!match || !shifted.has(match[1])) throw new Error('Invalid aligned basemap');
      return tile(providers[match[1]], ...match.slice(2).map(Number), transform, controller.signal).then(data => ({ data }));
    });
  }
  const correctedPaths = new WeakMap();
  function pathGeometry(place, inverse) {
    const geometry = place?.importedGeometry;
    if (!geometry || !['LineString', 'MultiLineString'].includes(geometry.type) || String(place.pathCoordinateSystem || '').toLowerCase() === 'wgs84') return geometry;
    const cached = correctedPaths.get(geometry);
    if (cached?.inverse === inverse && cached.coordinates === geometry.coordinates) return cached.result;
    const point = p => [...inverse(Number(p[0]), Number(p[1])), ...p.slice(2)];
    const result = { ...geometry, coordinates: geometry.type === 'LineString' ? geometry.coordinates.map(point) : geometry.coordinates.map(line => line.map(point)) };
    correctedPaths.set(geometry, { inverse, coordinates: geometry.coordinates, result });
    return result;
  }
  const api = { shifted, pixel, coordinate, grid, tile, register, pathGeometry };
  root.BasemapAlignment = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
