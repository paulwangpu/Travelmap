// Mechanical field-by-field refresh; retain local-only Holocene and all Pleistocene records.
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../volcano-catalog.js');
const service = 'https://services7.arcgis.com/iFGeGXTAJXnjq0YN/arcgis/rest/services/Smithsonian_Global_Volcanism_Program_Holocene_Volcano_List_/FeatureServer/0';
(async () => {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const params = new URLSearchParams({ where: '1=1', outFields: '*', returnGeometry: 'false', orderByFields: 'FID ASC', resultOffset: String(offset), resultRecordCount: '1000', f: 'json' });
    const response = await fetch(`${service}/query?${params}`, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error || !Array.isArray(data.features)) throw new Error(data.error?.message || 'Invalid response');
    rows.push(...data.features.map(feature => feature.attributes));
    if (!data.exceededTransferLimit) break;
    if (!data.features.length) throw new Error('Incomplete empty page');
  }
  const countResponse = await fetch(`${service}/query?where=1%3D1&returnCountOnly=true&f=json`, { signal: AbortSignal.timeout(30000) });
  const count = await countResponse.json();
  if (count.count !== rows.length || new Set(rows.map(row => row.Volcano_Number)).size !== rows.length) throw new Error('Incomplete or duplicate reference records');
  const file = path.join(__dirname, '../data/global-volcanoes.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const merged = catalog.merge(data.items, rows);
  const { items, ...comparison } = merged;
  data.items = items;
  data.reference = { service, retrieved: new Date().toISOString(), count: rows.length, comparison, note: 'ArcGIS item cites GVP 5.2.8 (2025-05-06); reference is not a live eruption feed. Local-only records retained.' };
  data.counts = { holocene: items.filter(item => item.epoch === 'Holocene').length, pleistocene: items.filter(item => item.epoch === 'Pleistocene').length, total: items.length };
  fs.writeFileSync(file, JSON.stringify(data));
  console.log(JSON.stringify({ ...comparison, counts: data.counts }));
})().catch(error => { console.error(error); process.exitCode = 1; });
