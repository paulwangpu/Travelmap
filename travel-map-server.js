const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const host = "0.0.0.0";
const port = Number(process.env.PORT) || 4173;
const root = __dirname;
const url = `http://localhost:${port}/index.html`;
const shouldOpenBrowser = process.argv.includes("--open");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".geojson": "application/geo+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pmtiles": "application/vnd.pmtiles",
};

function openBrowser() {
  if (process.platform === "win32") exec(`start "" "${url}"`);
  else console.log(`Open ${url}`);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${host}:${port}`);
  let filePath = decodeURIComponent(requestUrl.pathname);
  if (filePath === "/") filePath = "/index.html";

  const fullPath = path.resolve(root, `.${filePath}`);
  if (!fullPath.startsWith(root)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.stat(fullPath, (error, stat) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    const contentType = contentTypes[path.extname(fullPath).toLowerCase()] || "application/octet-stream";
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]);
      const requestedEnd = range[2] ? Number(range[2]) : stat.size - 1;
      const end = Math.min(requestedEnd, stat.size - 1);
      if (!Number.isFinite(start) || start < 0 || start > end) {
        response.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        response.end();
        return;
      }
      response.writeHead(206, {
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Content-Length": end - start + 1,
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      });
      fs.createReadStream(fullPath, { start, end }).pipe(response);
      return;
    }
    response.writeHead(200, {
      "Accept-Ranges": "bytes",
      "Content-Length": stat.size,
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    fs.createReadStream(fullPath).pipe(response);
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Port ${port} is already in use. Opening existing server: ${url}`);
    if (shouldOpenBrowser) openBrowser();
    return;
  }
  console.error(error);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`Travel Map server running: ${url}`);
  console.log("Keep this window open while using Travel Map.");
  if (shouldOpenBrowser) openBrowser();
});
