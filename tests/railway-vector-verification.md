# Vector railway verification

Local version: 2.1.2. Backup: `railway-before-vector` (`2578013`). Development branch: `codex/vector-railways`. Not published.

Browser: Chrome, MapLibre 5.24.0, real upstream on-demand tiles. The preview harness reports rendered feature counts (including multiple style layers), not unique OSM records.

| View | zoom 4 | zoom 10 | zoom 17 | zoom 18 |
| --- | ---: | ---: | ---: | ---: |
| Beijing South | 12046 | 9389 | 772 | 502 |
| Houston | 3606 | 2378 | — | 77 |
| Berlin Hbf | 20152 | 18665 | 860 | 795 |

All sampled views reported zero map errors and visible railway geometry. Berlin zoom 18 retained 795 rendered railway features after changing the harness basemap to terrain.

Actual application checks:

- Pure pointer hover, without clicking, displayed 京哈线 and available ref/usage/maxspeed fields.
- Clicking pinned a closable popup with actual source, source layer, render layer, feature ID and tile properties.
- Moving away removed hover; closing the pinned popup removed it.
- Raster selection persisted after reload; vector selection restored the separate vector legend.
- Switching Google Terrain to OSM and toggling the railway checkbox restored vector geometry; disabling removed the legend.
- Chinese vector legend labels and English mode/legend/help text were inspected.
- All existing CJS tests, new adapter/hit-distance/cancellation/failure tests, and JavaScript syntax checks passed.

Limitations: the browser viewport capability accepted 390×844 but did not actually resize the Chrome page (DOM remained 2560×1215). Therefore actual phone-size rendering is not claimed as verified. Leaflet fallback and resource-failure messaging were checked in implementation/tests, not by forcing a live renderer or upstream outage. No global tiles were bulk downloaded.
