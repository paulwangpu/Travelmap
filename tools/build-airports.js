const fs = require("fs");
const https = require("https");
const path = require("path");

const sourcePath = process.argv[2] || path.join("data", "sources", "ourairports-airports.csv");
const outputPath = process.argv[3] || path.join("data", "airports.json");
const sourceUrl = "https://davidmegginson.github.io/ourairports-data/airports.csv";

function download(url, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Download failed: HTTP ${response.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(destination);
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    });
    request.on("error", reject);
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean)));
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    console.log(`Downloading ${sourceUrl}`);
    await download(sourceUrl, sourcePath);
  }
  const text = fs.readFileSync(sourcePath, "utf8");
  const rows = parseCsv(text);
  const headers = rows.shift();
  const index = Object.fromEntries(headers.map((header, column) => [header, column]));
  const value = (row, key) => row[index[key]] || "";
  const airports = rows
    .map((row) => {
      const iata = value(row, "iata_code").trim().toUpperCase();
      const type = value(row, "type").trim();
      const lat = Number(value(row, "latitude_deg"));
      const lng = Number(value(row, "longitude_deg"));
      if (!iata || type === "closed" || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const name = value(row, "name").trim();
      const city = value(row, "municipality").trim() || name;
      const country = value(row, "iso_country").trim().toLowerCase();
      const aliases = unique([
        value(row, "ident"),
        value(row, "gps_code"),
        value(row, "local_code"),
        value(row, "keywords"),
      ].flatMap((entry) => String(entry || "").split(",")));
      return [name, iata, city, country, lat, lng, aliases];
    })
    .filter(Boolean)
    .sort((a, b) => `${a[3]}-${a[2]}-${a[1]}`.localeCompare(`${b[3]}-${b[2]}-${b[1]}`));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(airports)}\n`, "utf8");
  console.log(`Wrote ${airports.length} airports to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
