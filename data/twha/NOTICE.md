# TWHA-derived historical reference overlay

Derived from World Historical Atlas, official 2019-09-23 release:
https://x768.sakura.ne.jp/pub/twha.html
https://x768.sakura.ne.jp/pub/files/twha5.zip

The original author's permission: “You may modify and redistribute
\"World Historical Atlas\". In that case, please change its name to distinguish
it from the original content.” This derivative is named **Travel Map historical
reference overlay (TWHA data)**. It is not the original application.

Only political raster tiles and text records are used; portraits and flags
are not redistributed here. Data ends in 2019, not the current year.

Source raster: 3600 × 1800 Plate Carree, west=-180, north=90,
0.1 degree per pixel. Tiles are reprojected to Web Mercator and cropped at
±85.0511287798066 degrees. Ocean and unassigned white background are transparent.
Text coordinates are source layout anchors, not surveyed capitals or seats.
Historical boundaries remain the original generalized reconstruction.
Modern shoreline checks do not validate historical territorial claims.

Rebuild tiles: scripts/prepare-twha.py. Calibration details: calibration.json.
