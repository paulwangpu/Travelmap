"""Import the user-supplied NPS boundary shapefile for the web map."""

from __future__ import annotations

import json
import site
import sys
import tempfile
from pathlib import Path

site.addsitedir(str(Path(tempfile.gettempdir()) / "travel-map-shapefile"))
site.addsitedir(str(Path(tempfile.gettempdir()) / "travel-map-shapely"))

import shapefile
from shapely.geometry import GeometryCollection, MultiPolygon, Polygon, mapping, shape
from shapely.validation import make_valid


ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "data" / "us-nps-boundaries.geojson"
SIMPLIFY_DEGREES = 0.00005


def rounded(value, digits=5):
    if isinstance(value, (list, tuple)):
        return [rounded(item, digits) for item in value]
    return round(value, digits) if isinstance(value, float) else value


def polygonal(geometry):
    geometry = make_valid(geometry)
    if isinstance(geometry, (Polygon, MultiPolygon)):
        return geometry
    if isinstance(geometry, GeometryCollection):
        polygons = [part for part in geometry.geoms if isinstance(part, (Polygon, MultiPolygon))]
        if not polygons:
            return None
        flattened = []
        for polygon in polygons:
            flattened.extend(polygon.geoms if isinstance(polygon, MultiPolygon) else [polygon])
        return MultiPolygon(flattened) if len(flattened) > 1 else flattened[0]
    return None


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("Usage: import_local_nps_boundaries.py <path-to-nps_boundary.shp>")
    source = Path(sys.argv[1])
    if not source.exists():
        raise SystemExit(f"Shapefile not found: {source}")

    features = []
    skipped = []
    reader = shapefile.Reader(str(source), encoding="utf-8")
    for shape_record in reader.iterShapeRecords():
        properties = shape_record.record.as_dict()
        code = str(properties.get("UNIT_CODE") or "").strip().upper()
        geometry = polygonal(shape(shape_record.shape.__geo_interface__))
        if not code or geometry is None or geometry.is_empty:
            skipped.append(code or "(missing code)")
            continue
        geometry = geometry.simplify(SIMPLIFY_DEGREES, preserve_topology=True)
        geojson_geometry = mapping(geometry)
        geojson_geometry["coordinates"] = rounded(geojson_geometry["coordinates"])
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "code": code,
                    "name": str(properties.get("UNIT_NAME") or properties.get("PARKNAME") or code).strip(),
                    "designation": str(properties.get("UNIT_TYPE") or "").strip(),
                    "location": str(properties.get("STATE") or "").strip(),
                    "editDate": str(properties.get("EditDate") or properties.get("DATE_EDIT") or "").strip(),
                },
                "geometry": geojson_geometry,
            }
        )

    collection = {
        "type": "FeatureCollection",
        "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
        "features": features,
        "name": "National Park Service unit boundaries",
        "source": "User-supplied local NPS boundary shapefile",
        "sourceFile": source.name,
    }
    DESTINATION.write_text(json.dumps(collection, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"features": len(features), "skipped": skipped, "bytes": DESTINATION.stat().st_size}))


if __name__ == "__main__":
    main()
