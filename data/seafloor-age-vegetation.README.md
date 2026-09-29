# NOAA seafloor-age vegetation basemap

The tiles in `seafloor-age-vegetation/` are derived from NOAA/NCEI Science On
a Sphere's **Age of the Seafloor (vegetation)** 4096 px equirectangular image:

https://sos.noaa.gov/catalog/datasets/age-of-the-seafloor-vegetation/

The visualization was developed from seafloor-age models by the School of
Geosciences, University of Sydney, via NOAA's National Geophysical Data Center.
It includes vegetation, labelled tectonic plates and plate boundaries.

`tools/build-seafloor-age-tiles.py` reprojects the source image to Web Mercator
XYZ JPEG tiles at zoom levels 0–4. Browsers overzoom level 4 at closer scales.
The reprojection is necessary because stretching the original equirectangular
image directly over a Web Mercator map would displace high-latitude features.

The sibling `seafloor-age-contours/` pyramid is built from NOAA's **Age of the
Seafloor (contour lines)** image:

https://sos.noaa.gov/catalog/datasets/age-of-the-seafloor-contour-lines/

The official contour PNG is transparent. The build script composites it over
the vegetation image before reprojection, so the second basemap is the same
seafloor-age visualization with contour labels and plate-boundary lines added,
not the transparent pixels' placeholder colours. Its age contours use a
5-million-year interval and it distinguishes convergent, divergent and
transform plate boundaries.
