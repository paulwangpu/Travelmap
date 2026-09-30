# HydroRIVERS major-river backbone

`hydrorivers-major.geojson` is a display-optimized subset of the official
HydroRIVERS v1 global river network. It keeps `ORD_FLOW` classes 1–4
(approximately long-term average discharge of at least 100 m³/s), rounds
coordinates to five decimal places, and groups reaches by flow class. The
result contains 273,191 source reaches in four `MultiLineString` features.

The file is rebuilt from the official `HydroRIVERS_v10_shp.zip` download with:

```text
python tools/build-hydrorivers.py HydroRIVERS_v10.shp data/hydrorivers-major.geojson --max-flow-order 4
```

Source: <https://www.hydrosheds.org/products/hydrorivers>

Citation: Lehner, B. & Grill, G. (2013), “Global river hydrography and network
routing: baseline data and new approaches to study the world's large river
systems,” *Hydrological Processes*, 27(15), 2171–2186.

HydroRIVERS data are distributed under the HydroSHEDS license and are free for
scientific, educational, and commercial use. HydroRIVERS does not include river
or lake names; labels in the application continue to come from the ArcGIS water
reference overlay.
