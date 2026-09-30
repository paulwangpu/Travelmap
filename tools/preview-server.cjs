const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.geojson': 'application/geo+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { response.writeHead(404).end(); return; }
    let start = 0, end = stat.size - 1, status = 200;
    const range = request.headers.range;
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match || Number(match[1]) >= stat.size) {
        response.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return;
      }
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), end) : end;
      if (end < start) { response.writeHead(416).end(); return; }
      status = 206;
      response.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
    }
    response.setHeader('Accept-Ranges', 'bytes');
    response.setHeader('Content-Length', end - start + 1);
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    response.writeHead(status);
    if (request.method === 'HEAD') { response.end(); return; }
    const stream = fs.createReadStream(file, { start, end });
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  });
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://localhost:4173'));
