# Gallup Global Safety / Law and Order basemaps

Source: [Gallup Global Safety Research Center](https://www.gallup.com/analytics/356996/gallup-global-safety-research-center.aspx), retrieved 2026-10-16. Report: **2025**; fieldwork: **2024**, 144 countries/territories. These are national adult survey statistics, not real-time crime rates or city-level travel risk estimates.

- `safety`: percent reporting that they feel safe walking alone at night.
- `lawOrder`: Gallup's four-question Law and Order Index, 0–100. This combines perceived night-time safety, confidence in police, and experiences of theft and assault.
- Missing statistics are `null` and grey, never zero. No inheritance from another country/territory. Hong Kong, Taiwan, Northern Cyprus and Cyprus retain separate source observations.
- The original page labels the index table's numeric column “Rank”; these numbers are **scores**, not ordinal ranks. Verified against Gallup's [methodology](https://www.gallup.com/analytics/694904/what-is-law-order-index.aspx) and 2025 report (China 93; United States 84; Tajikistan 97).

Country polygons derive from the project's existing Natural Earth `countries.geojson`; no existing geometry was replaced. This derivative uses Douglas–Peucker generalization at 0.015 degrees, retaining all polygons/holes and original rings when simplification would collapse them. These are statistical overview boundaries. The explicit source-name crosswalk and retrieval metadata are embedded in the GeoJSON. Every one of the 144 observations matches exactly one feature.

Data attribution: **© 2025 Gallup, Inc. All rights reserved.** Public factual table values are attributed to Gallup; no open-data license or Gallup endorsement is claimed. Country geometry: Natural Earth (public domain). Survey source and methodology are linked in the on-map legend.

Rebuild: `python scripts/build-gallup-safety.py` using the Python standard library. Raw downloaded HTML and extracted tables are saved under `output/gallup-safety`; do not stage that directory wholesale.

Both basemaps use the existing selector, transparency control and OpenStreetMap reference tiles. The thematic source is loaded once per session and reused when switching metrics. Switching does not rebuild the map or alter check-ins, ancient-capital layers, or **My coverage / 我的点亮** fills, outlines, tooltips, state or controls. Existing point/area overlays retain their established order above the thematic basemap. Leaflet fallback uses the same statistics and bins.

Colour bins: <60, 60–69, 70–79, 80–84, 85–89, ≥90. Bins are display choices, not Gallup risk categories. The two units are shown separately: percent vs index points.

Verification: `node tests/gallup-safety.cjs`; full regression runner; browser screenshots/results under `output/gallup-safety`. Version stays 2.3.3; not committed or published.
