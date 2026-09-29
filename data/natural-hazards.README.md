# Natural hazard overlays

`historical-earthquakes.json` merges the NOAA/NCEI Global Significant
Earthquake Database (2150 BCE to present), DOI `10.7289/V5TD9V7K`, with the
ISC-GEM main and supplementary global instrumental catalogues (1900–2024)
served by the USGS ComCat API. ISC-GEM is licensed CC BY-SA 3.0. Records that
match on date, position and magnitude are de-duplicated in favour of ISC-GEM.
The supplementary catalogue retains an `uncertain` flag because its location,
magnitude, or both may be less certain. Historical completeness still varies
substantially by region and period; this is not a catalogue of every felt event.

Run `node scripts/build-earthquake-catalog.js` to reproduce the merged local
asset from the retained NOAA data and the public USGS endpoint.

`global-volcanoes.json` contains the Smithsonian Institution Global Volcanism
Program Volcanoes of the World Holocene and Pleistocene catalogues. The source
snapshot is VOTW 5.1.7 (6 May 2024), distributed by the RIMES/Smithsonian data
portal while the live GVP WFS was temporarily unavailable. Holocene volcanoes
are shown by default; the less thoroughly reviewed Pleistocene catalogue is an
explicit optional layer. Run `node scripts/build-volcano-catalog.js` after
downloading the two official XML-Excel workbooks to `tmp/` to rebuild it.

Both files are stored locally so map rendering does not depend on a live
third-party API.
