(function (root) {
  function eruptionYear(text) {
    const match = String(text || '').trim().match(/^(\d{1,5})\s*(BCE|BC|CE|AD)?\s*\??$/i);
    return match ? Number(match[1]) * (/^B/.test((match[2] || '').toUpperCase()) ? -1 : 1) : null;
  }
  function typeGroup(item) {
    const type = String(item.primaryType || item.morphology || '').toLowerCase();
    if (/strato/.test(type)) return 'strato';
    if (/shield/.test(type)) return 'shield';
    if (/caldera/.test(type)) return 'caldera';
    if (/field/.test(type)) return 'field';
    if (/dome/.test(type)) return 'dome';
    if (/maar|explosion crater/.test(type)) return 'maar';
    if (/fissure|crater rows/.test(type)) return 'fissure';
    if (/cone|tuff ring/.test(type)) return 'cone';
    return 'other';
  }
  const colors = { strato: '#b33437', shield: '#2874a6', caldera: '#8052a1', field: '#27794c', dome: '#956046', cone: '#d67525', maar: '#17858b', fissure: '#9c831b', other: '#68717b' };
  function matches(item, options) {
    if (item.epoch !== 'Pleistocene' && options.includeHolocene === false) return false;
    if (item.epoch === 'Pleistocene' && !options.includePleistocene) return false;
    if (options.type && options.type !== 'all' && typeGroup(item) !== options.type) return false;
    const year = eruptionYear(item.lastEruption);
    if (options.eruption === 'since1900') return year != null && year >= 1900;
    if (options.eruption === 'before1900') return year != null && year < 1900;
    if (options.eruption === 'unknown') return year == null;
    return true;
  }
  function merge(local, reference) {
    const byId = new Map(local.map(item => [Number(item.volcanoLocationId), { ...item }]));
    let updated = 0, added = 0;
    for (const row of reference) {
      const id = Number(row.Volcano_Number);
      if (!Number.isInteger(id) || id <= 0 || row.Latitude == null || row.Longitude == null || !Number.isFinite(Number(row.Latitude)) || !Number.isFinite(Number(row.Longitude)) || Math.abs(Number(row.Latitude)) > 90 || Math.abs(Number(row.Longitude)) > 180) throw new Error('Invalid reference volcano');
      const existing = byId.get(id);
      if (existing?.epoch === 'Pleistocene') continue; // Do not silently reclassify the retained older catalogue.
      const item = { ...(existing || {}), volcanoLocationId: id, epoch: 'Holocene', source: 'Smithsonian GVP', referenceSource: 'ArcGIS GVP Holocene reference' };
      const fields = { name: 'Volcano_Name', country: 'Country', morphology: 'Volcano_Landform', primaryType: 'Primary_Volcano_Type', evidence: 'Activity_Evidence', lastEruption: 'Last_Known_Eruption', region: 'Volcanic_Region', subregion: 'Volcanic_Province', tectonicSetting: 'Tectonic_Setting', rockType: 'Dominant_Rock_Type' };
      for (const [key, field] of Object.entries(fields)) if (row[field] != null && String(row[field]).trim()) item[key] = String(row[field]).trim();
      item.latitude = Number(row.Latitude); item.longitude = Number(row.Longitude);
      if (row.Elevation__m_ != null && Number.isFinite(Number(row.Elevation__m_))) item.elevation = Number(row.Elevation__m_);
      byId.set(id, item);
      if (existing) updated++; else added++;
    }
    return { items: [...byId.values()], updated, added, retainedOnly: local.filter(item => item.epoch === 'Holocene' && !reference.some(row => Number(row.Volcano_Number) === Number(item.volcanoLocationId))).length };
  }
  const api = { eruptionYear, typeGroup, matches, merge, colors };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.VolcanoCatalog = api;
})(typeof window !== 'undefined' ? window : globalThis);
