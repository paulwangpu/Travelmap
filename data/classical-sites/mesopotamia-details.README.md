# Babylon, Ur and Uruk: internal remains review

Incremental review, 2026-10-17. Release remains 2.3.3; no commit or publication.

| Site | Previous features | Added | Current |
|---|---:|---:|---:|
| Babylon | 4 | 5 | 9 |
| Ur | 1 | 4 | 5 |
| Uruk | 2 | 2 | 4 |

All eleven additions are polygonal details. There are no new capital roots, point-only placeholders, independent overlays or legends. Existing wall/capital period controls, the global physical source, bilingual details and independent remain check-ins are reused. The full dataset now has 2,573 features and 288 site entries. Original root IDs, names, coordinates, aliases, period records and World Heritage data remain unchanged. Root boundary references are extended and Ur's focus viewport is widened.

## Identity corrections and provenance

- **Babylon:** `babylon-relation-13261225` was incorrectly labelled as the Southern Palace. Its original name, Eniggidrukalamasuma, identifies a **Nabu temple**. Correct the metadata and root reference while retaining the feature ID, geometry, source members and check-in identity. The real Southern Palace is a separate addition from relation 16832642. Existing visits are not moved to that new palace.
- Add Etemenanki foundations, Tell Babil (the Summer Palace archaeological mound), the real Southern Palace, Ninmah temple and the Greek-style theatre. Distinguish ancient remains from 20th-century restoration/reconstruction. Tell Babil's archaeological mound is not presented as an exact palace enclosure. The theatre includes a Seleucid foundation and Parthian rebuilding; its Chinese-era grouping refers to the latter, while the complete local sequence remains in the detail.
- **Ur:** add Enunmah, Giparu, the Early Dynastic Royal Cemetery and the mapped southeastern residential excavation area. The Royal Cemetery is distinct from the nearby Ur III mausolea. The residential polygon is only a mapped excavation area; no individual house owner or complete residential-quarter boundary is asserted.
- **Uruk:** add the Eanna ziggurat and White Temple summit remains. The Eanna ziggurat's original OSM Wikipedia tag incorrectly links to Anu; retain the raw tag for provenance but use the reviewed Eanna identity. The White Temple's position was cross-checked against DAI 2019, page 121, figure 11's WGS84 / UTM38 grid. Its OSM representative position is about E560408/N3465629, matching the plotted summit building. This is an identity/location cross-check, not a georeferencing residual or survey accuracy claim. The summit polygon is not the whole Anu platform.

## Geometry

Source XML snapshots, extraction, baseline copies and browser evidence remain under `output/mesopotamia-details` / `output/five-country-capitals`; do not stage those directories wholesale. Source hashes, each new geometry hash, metadata corrections, pending items and preservation hashes are recorded in `docs/mesopotamia-details-audit.json`.

Every previously existing geometry is retained exactly. Ten additions retain their raw closed OSM geometry. The Southern Palace source contains a self-contact at 44.4222742, 32.5416404 that produced a triangular fill artefact in the browser. Only its derived display polygon is topologically resolved using Shapely `make_valid`. The complete original polygon (34 interior source rings), all 35 member ways and non-area topology fragments are preserved in `originalGeometry`, `originalMembers` and `topologyArtifacts`. Its valid display has 32 interior rings because touching courtyard rings join during topology resolution. Across the additions there are **39 original interior rings / 37 display interior rings**. No city wall, gate gap or palace boundary is invented during this operation. The before/after palace screenshots are retained in the research directory.

Historical preservation tests normalize only the explicitly recorded metadata/reference corrections before comparing old snapshot hashes; `tests/mesopotamia-details.cjs` independently locks all existing geometry and unrelated properties, new source hashes, preserved original rings, root identities, controls and independent visits.

## Primary references

- [UNESCO Babylon management plan](https://whc.unesco.org/document/168481): the palaces, temples, theatre, Processional Way and modern reconstruction.
- [ORACC temple glossary](https://oracc.museum.upenn.edu/ribo/babylon7/cbd/qpn-x-temple/summaries.html): Eniggidrukalamasuma is the temple of Nabu of the haru in east Babylon.
- [UNESCO Ahwar nomination annexes](https://whc.unesco.org/document/169034), annexes 14–15: Uruk's Eanna/Anu districts and Ur's sacred precinct.
- [Penn Museum: Ur and Its Treasures](https://www.penn.museum/sites/expedition/ur-and-its-treasures/) and [City of the Moon](https://www.penn.museum/sites/expedition/city-of-the-moon/): the cemetery, religious buildings and excavated residential areas.
- [DAI Uruk project](https://www.dainst.org/forschung/projekte/noslug/2604) and [van Ess 2019](https://doi.org/10.34780/5ea1-clce): Eanna, Anu and the printed summit topography.

## Still unverified

Ur's complete dated city wall, sacred enclosure, E-hursag palace, E-dublalmah and Ur III mausolea require geometric confirmation. The OSM protected-area outlines are not imported as ancient city walls. The museum label attached to an Ur building also needs confirmation before reuse. Uruk's full Anu platform, Bit Resh, Irigal, Gareus temple and Sinkashid palace require reliable geometry. Babylon's Northern Palace, Esagila, Processional Way and complete outer-city circuit remain pending. No hanging-garden reconstruction, duplicate modern Ishtar Gate or Saddam palace is added.

Validation: `tests/mesopotamia-details.cjs`, existing classical-site/period/check-in regressions, complete regression runner, JS syntax and `git diff --check`. The isolated browser checks all three cities, Chinese/English detail names and independent root/wall controls, with five screenshots under `output/mesopotamia-details`.
