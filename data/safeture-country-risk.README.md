# Safeture / Riskline overall country risk

Active national base for the combined Safeture basemap. Regional advisories render above this layer and take priority even when their category is lower; see `safeture-regional-risk.README.md`. Country features without an assessment remain grey unless a Regional assessment covers that location.

Native basemap added on 2026-10-17 using the Safeture public interactive globe's directly referenced GeoJSON, not a traced poster or inferred Gallup score.

- [Official globe and methodology](https://www.safeture.com/globe/)
- [Original country-risk GeoJSON](https://globe.safeture.com/assets/geojson/country_risk_assessment.geojson)
- [Official downloadable maps](https://www.safeture.com/riskmaps/) permit digital distribution/printing; the official globe page also offers free embedding. Attribution remains **Country risk data © Safeture / Riskline**. No open-data licence or endorsement is claimed.

The snapshot contains 177 original country/area features: 167 rated and 10 with no assessment. Source geometries, holes and multipolygons are preserved. Only the factual name/ISO/risk-level/trend fields are retained; assessment descriptions and unrelated advisory text are not copied. Source bytes/hash, geometry hash, HTTP Last-Modified (when supplied) and retrieval timestamp are embedded as metadata. Missing assessments remain null/grey.

Risk levels: 1 Negligible (极低), 2 Low (低), 3 Medium (中), 4 High (高), 5 Critical (极高). The colours come from the official globe's public legend. These are categorical levels, not percentages or a 100-point index. Map labels use category words only; numeric IDs are internal. Hover identifies country, category and snapshot date.

This is a **dated snapshot of overall country risk**, not a live feed, the annual 2026 poster, or a rendering of Riskline's separate regional/advisory layer. The original country's assessment and geometry are used as supplied; no missing territory is assigned another country's score. The map geometry does not provide street-level risk estimates or establish political boundaries.

Placed before Gallup and DEM in the existing basemap menu. Uses the existing opacity control, pale reference background, compact 13–15px labels and global map ordering. Its fills, boundaries and labels remain below My coverage. No check-in, coverage state/style, ancient-capital or royal-tomb data is changed. MapLibre and Leaflet share the same snapshot and categories. Data loads once per session, with explicit retry feedback if unavailable; switching basemaps cleans up all risk layers and labels.

Rebuild: `python scripts/build-safeture-risk.py` (standard library). This updates a dated local snapshot and saves the raw download under `output/safeture`; a new snapshot should also update its dated filename, UI date, cache queries and documented provenance. Never stage the research directory wholesale.

Validation: `node tests/safeture-risk.cjs`, `node tests/map-layer-order.cjs`, full regressions, JS syntax and Git diff checks. Isolated browser QA screenshots/results are saved under `output/safeture`. Release remains 2.3.3; no commit or publication requested.
