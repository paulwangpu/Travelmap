#!/usr/bin/env node
/* Build the static earthquake overlay from NOAA significant events plus
 * ISC-GEM main/supplementary catalogues exposed by the USGS ComCat API. */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const target = path.join(root, "data", "historical-earthquakes.json");
const existing = JSON.parse(fs.readFileSync(target, "utf8"));
const noaaItems = (existing.items || []).filter((item) => item.source !== "ISC-GEM");

async function fetchJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": "TravelMap earthquake catalogue builder" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function fetchWindow(catalog, startYear, endYear) {
  const query = new URLSearchParams({
    format: "geojson",
    catalog,
    starttime: `${startYear}-01-01`,
    endtime: `${endYear}-01-01`,
    orderby: "time-asc",
    limit: "20000"
  });
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?${query}`;
  const data = await fetchJson(url);
  return data.features || [];
}

function compactFeature(feature, catalogue) {
  const coordinates = feature.geometry?.coordinates || [];
  const timestamp = Number(feature.properties?.time);
  const date = Number.isFinite(timestamp) ? new Date(timestamp) : null;
  return {
    id: feature.id,
    year: date ? date.getUTCFullYear() : null,
    month: date ? date.getUTCMonth() + 1 : null,
    day: date ? date.getUTCDate() : null,
    hour: date ? date.getUTCHours() : null,
    minute: date ? date.getUTCMinutes() : null,
    second: date ? date.getUTCSeconds() : null,
    locationName: feature.properties?.place || "ISC-GEM event",
    latitude: Number(coordinates[1]),
    longitude: Number(coordinates[0]),
    eqDepth: Number.isFinite(Number(coordinates[2])) ? Number(coordinates[2]) : null,
    eqMagnitude: Number(feature.properties?.mag),
    magnitudeType: feature.properties?.magType || "",
    source: "ISC-GEM",
    catalogue,
    uncertain: catalogue === "iscgemsup"
  };
}

function dateKey(item) {
  return [item.year, item.month || 0, item.day || 0].join("-");
}

function isDuplicate(a, b) {
  if (dateKey(a) !== dateKey(b)) return false;
  const lat = Math.abs(Number(a.latitude) - Number(b.latitude));
  const lon = Math.abs(Number(a.longitude) - Number(b.longitude));
  const magA = Number(a.eqMagnitude);
  const magB = Number(b.eqMagnitude);
  return lat <= 0.25 && lon <= 0.25 && (!Number.isFinite(magA) || !Number.isFinite(magB) || Math.abs(magA - magB) <= 0.4);
}

async function loadCatalogue(catalogue) {
  const result = [];
  // Five-year windows remain comfortably below the ComCat 20,000-result cap.
  for (let start = 1900; start <= 2025; start += 5) {
    const end = Math.min(start + 5, 2027);
    const features = await fetchWindow(catalogue, start, end);
    result.push(...features.map((feature) => compactFeature(feature, catalogue)));
    process.stdout.write(`${catalogue} ${start}-${end - 1}: ${features.length}\n`);
  }
  return result;
}

(async () => {
  const main = await loadCatalogue("iscgem");
  const supplementary = await loadCatalogue("iscgemsup");
  const isc = [...main, ...supplementary].filter((item) =>
    Number.isFinite(item.latitude) && Number.isFinite(item.longitude) && Number.isFinite(item.eqMagnitude)
  );

  const byDay = new Map();
  for (const item of isc) {
    const key = dateKey(item);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(item);
  }
  const retainedNoaa = noaaItems.filter((item) => {
    const candidates = byDay.get(dateKey(item)) || [];
    return !candidates.some((candidate) => isDuplicate(item, candidate));
  }).map((item) => ({ ...item, source: item.source || "NOAA/NCEI" }));

  const items = [...retainedNoaa, ...isc].sort((a, b) =>
    Number(a.year) - Number(b.year) || (Number(a.month) || 0) - (Number(b.month) || 0) || (Number(a.day) || 0) - (Number(b.day) || 0)
  );
  const output = {
    source: "NOAA/NCEI Global Significant Earthquake Database + ISC-GEM via USGS ComCat",
    generated: new Date().toISOString().slice(0, 10),
    license: "NOAA/USGS public data; ISC-GEM CC BY-SA 3.0",
    counts: { total: items.length, noaa: retainedNoaa.length, iscGem: main.length, iscGemSupplementary: supplementary.length },
    items
  };
  fs.writeFileSync(target, JSON.stringify(output));
  process.stdout.write(`Wrote ${items.length} events to ${target}\n`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
