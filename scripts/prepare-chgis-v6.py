"""Prepare a local CHGIS V6 prefecture overlay; source data is not redistributable.

Usage: python scripts/prepare-chgis-v6.py --source PATH_TO_SHP
Dependencies: pyshp, shapely, pyproj.
Derived geometry stays under output/, outside the release asset list.
"""
import argparse
import json
from pathlib import Path
import shapefile
from pyproj import Transformer
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import transform
from shapely.validation import make_valid

ROOT = Path(__file__).resolve().parents[1]


def parts(g):
    if g.geom_type == 'Polygon':
        return [g]
    return [p for child in getattr(g, 'geoms', []) for p in parts(child)]


def rounded(value):
    return [rounded(item) for item in value] if isinstance(value, (list, tuple)) else round(value, 6)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', required=True)
    args = parser.parse_args()
    reader = shapefile.Reader(args.source, encoding='utf_8')
    forward = Transformer.from_crs(4326, 6933, always_xy=True).transform
    reverse = Transformer.from_crs(6933, 4326, always_xy=True).transform
    features, excluded = [], []
    for index, item in enumerate(reader.iterShapeRecords()):
        row = item.record.as_dict()
        start, end = int(row['BEG_YR']), int(row['END_YR'])
        if start > end:
            excluded.append({'sourceId': row['SYS_ID'], 'nameZh': row['NAME_CH'], 'start': start, 'end': end, 'reason': 'source_date_range_reversed'})
            continue
        projected = transform(forward, make_valid(shape(item.shape.__geo_interface__)))
        polygons = parts(projected)
        if not polygons:
            raise ValueError(f'No polygon: {index}')
        largest = max(polygons, key=lambda p: p.area)
        kept = []
        for polygon in polygons:
            if polygon is not largest and polygon.area < min(25e6, largest.area * .01):
                continue
            polygon = Polygon(polygon.exterior, [ring for ring in polygon.interiors if Polygon(ring).area >= 25e6])
            kept.extend(parts(make_valid(polygon.simplify(300, preserve_topology=True))))
        cleaned = make_valid(MultiPolygon(kept) if len(kept) > 1 else kept[0])
        kept = parts(cleaned)
        cleaned = MultiPolygon(kept) if len(kept) > 1 else kept[0]
        display = transform(reverse, cleaned)
        label = transform(reverse, max(kept, key=lambda p: p.area).representative_point())
        area = projected.area / 1e6
        geometry = mapping(display)
        geometry['coordinates'] = rounded(geometry['coordinates'])
        rounded_shape = shape(geometry)
        if not rounded_shape.is_valid:
            repaired = parts(make_valid(rounded_shape))
            geometry = mapping(MultiPolygon(repaired) if len(repaired) > 1 else repaired[0])
        features.append({'type': 'Feature', 'id': index, 'geometry': geometry, 'properties': {
            'id': index, 'sourceId': row['SYS_ID'], 'nameZh': row['NAME_CH'].strip(),
            'nameRoman': row['NAME_PY'].strip(), 'typeZh': row['TYPE_CH'].strip(),
            'rank': row['LEV_RANK'], 'start': start, 'end': end,
            'beginRule': row['BEG_RULE'], 'endRule': row['END_RULE'], 'noteId': row['NOTE_ID'],
            'areaKm2': round(area, 2), 'labelCoordinates': [label.x, label.y],
            'labelMinZoom': 8 if area < 100 else 7 if area < 500 else 6 if area < 2000 else 4,
        }})
    target = ROOT / 'output/chgis-v6-prefecture.geojson'
    target.write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, ensure_ascii=False, separators=(',', ':')), encoding='utf8', newline='\n')
    (ROOT / 'output/chgis-v6-excluded.json').write_text(json.dumps(excluded, ensure_ascii=False, indent=2), encoding='utf8', newline='\n')
    print(json.dumps({'features': len(features), 'bytes': target.stat().st_size,
                      'start': min(f['properties']['start'] for f in features),
                      'end': max(f['properties']['end'] for f in features)}))


if __name__ == '__main__':
    main()
