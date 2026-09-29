#!/usr/bin/env node
/* Convert the Smithsonian GVP XML-Excel volcano snapshots into the compact
 * static JSON consumed by the map. Download inputs are intentionally kept out
 * of the repository; pass their paths or use the defaults in tmp/. */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const holocenePath = process.argv[2] || path.join(root, "tmp", "gvp-holocene.xls");
const pleistocenePath = process.argv[3] || path.join(root, "tmp", "gvp-pleistocene.xls");

function decode(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)));
}

function parseWorkbook(file, epoch) {
  const xml = fs.readFileSync(file, "utf8");
  const rows = [...xml.matchAll(/<Row[^>]*>([\s\S]*?)<\/Row>/g)].map((match) =>
    [...match[1].matchAll(/<Cell[^>]*>([\s\S]*?)<\/Cell>/g)].map((cell) => {
      const data = cell[1].match(/<Data[^>]*>([\s\S]*?)<\/Data>/);
      return decode(data?.[1] || "").trim();
    })
  );
  const headerIndex = rows.findIndex((row) => row.includes("Volcano Number"));
  if (headerIndex < 0) throw new Error(`No volcano header found in ${file}`);
  const headers = rows[headerIndex];
  const index = Object.fromEntries(headers.map((header, i) => [header, i]));
  const value = (row, name) => row[index[name]] || "";
  return rows.slice(headerIndex + 1).map((row) => ({
    volcanoLocationId: Number(value(row, "Volcano Number")),
    name: value(row, "Volcano Name"),
    country: value(row, "Country"),
    morphology: value(row, "Primary Volcano Type") || value(row, "Volcano Landform"),
    evidence: value(row, "Activity Evidence"),
    lastEruption: value(row, "Last Known Eruption"),
    region: value(row, "Region"),
    subregion: value(row, "Subregion"),
    latitude: Number(value(row, "Latitude")),
    longitude: Number(value(row, "Longitude")),
    elevation: Number(value(row, "Elevation (m)")),
    rockType: value(row, "Dominant Rock Type"),
    tectonicSetting: value(row, "Tectonic Setting"),
    epoch,
    source: "Smithsonian GVP"
  })).filter((item) => item.name && Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
}

const holocene = parseWorkbook(holocenePath, "Holocene");
const pleistocene = parseWorkbook(pleistocenePath, "Pleistocene");
const output = {
  source: "Smithsonian Global Volcanism Program, Volcanoes of the World",
  version: "5.1.7 snapshot (2024-05-06)",
  generated: new Date().toISOString().slice(0, 10),
  counts: { holocene: holocene.length, pleistocene: pleistocene.length, total: holocene.length + pleistocene.length },
  items: [...holocene, ...pleistocene]
};
fs.writeFileSync(path.join(root, "data", "global-volcanoes.json"), JSON.stringify(output));
console.log(`Wrote ${holocene.length} Holocene and ${pleistocene.length} Pleistocene volcanoes`);
