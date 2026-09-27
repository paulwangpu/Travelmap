# Population density basemap

The optional population-density basemap is generated from the official
**GHS-POP R2023A 2020** global 30 arc-second raster and stored as a compact
PMTiles archive. Source data is licensed under CC BY 4.0.

The color ramp keeps populated cells below 20 residents/km² near-white rather
than transparent, while true zero-value cells remain transparent so the
geographic context and oceans remain visible.

Source:

`https://jrc-ghsl.s3.amazonaws.com/ghs-pop/r2023a/4326/30ss/2020/GHS_POP_E2020_GLOBE_R2023A_4326_30ss_V1_0.tif`

Build:

```text
python tools/build-population-density-tiles.py source.tif output.mbtiles --maxzoom 8
pmtiles convert output.mbtiles data/population-density-2020-z0-8.pmtiles
```

The source GeoTIFF and intermediate MBTiles file are build artifacts and must
not be committed. The web application reads only the final PMTiles archive.

Attribution: European Commission, Joint Research Centre (JRC), Global Human
Settlement Layer (GHSL), 2023 release.
