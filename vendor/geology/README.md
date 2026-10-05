# Geology vector-tile decoder

Bundled offline browser parser only; it contains no remote service or credentials.
Versions: @mapbox/vector-tile 2.0.4 (BSD-3-Clause), pbf 4.0.1 (BSD-3-Clause), @mapbox/point-geometry 1.1.0 (ISC). Licenses accompany this file. esbuild 0.25.12 builds the IIFE `GeologyVectorTile`, targeting ES2020, with CommonJS export for tests.

Rebuild in a temporary tooling directory: install the above fixed versions and esbuild; create an entry exporting `VectorTile` from `@mapbox/vector-tile` and default `Pbf` from `pbf`; bundle with format=iife, globalName=GeologyVectorTile, target=es2020, and footer `if(typeof module!=="undefined")module.exports=GeologyVectorTile;`. The application has no build-time dependency on this temporary directory.
