"""Rebuild overview regions by dissolving original ResearchArea boundaries first.

Requires pyshp, shapely and pyproj. Prefectural display geometry is left intact.
"""
import argparse
import collections
import json
import math
from pathlib import Path

import shapefile
from pyproj import CRS, Transformer
from shapely.geometry import Polygon, mapping, shape
from shapely.ops import transform, unary_union

ROOT = Path(__file__).resolve().parents[1]
MIN_PART_AREA = 1000 * 1_000_000  # Overview display only, square metres.


def polygons(geometry):
    return list(geometry.geoms) if geometry.geom_type == 'MultiPolygon' else [geometry]


def stats(geometry):
    parts = polygons(geometry)
    return {
        'parts': len(parts),
        'holes': sum(len(part.interiors) for part in parts),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, help='Original ResearchArea shapefile base path')
    args = parser.parse_args()
    source = Path(args.source).with_suffix('')
    original_crs = CRS.from_wkt(source.with_suffix('.prj').read_text())
    to_equal_area = Transformer.from_crs(original_crs, 6933, always_xy=True).transform
    to_wgs84 = Transformer.from_crs(6933, 4326, always_xy=True).transform
    groups = collections.defaultdict(list)
    for row in shapefile.Reader(str(source), encoding='utf-8').iterShapeRecords():
        record = row.record.as_dict()
        year = int(record['YEAR'].replace('AD', ''))
        geometry = shape(row.shape.__geo_interface__)
        if not geometry.is_valid:
            geometry = geometry.buffer(0)
        groups[(year, record['ProvNAM'])].append(transform(to_equal_area, geometry))

    directory = ROOT / 'data/historical-admin'
    catalog_path = directory / 'catalog.json'
    catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
    results = []
    for period in catalog['periods']:
        file = ROOT / period['file']
        collection = json.loads(file.read_text(encoding='utf-8'))
        result = {'year': period['year'], 'beforeParts': 0, 'afterParts': 0,
                  'beforeHoles': 0, 'afterHoles': 0, 'closedGapAreaKm2': 0}
        for feature in collection['features']:
            p = feature['properties']
            if p['level'] != 'upper':
                continue
            old_stats = stats(shape(feature['geometry']))
            result['beforeParts'] += old_stats['parts']
            result['beforeHoles'] += old_stats['holes']
            # Dissolve before simplifying; independent prefectural simplification
            # creates thousands of sliver gaps along shared internal boundaries.
            dissolved = unary_union(groups[(period['year'], p['name'])])
            # Close narrow water cuts and seams in this overview layer. This is
            # morphological closing, not removal of the basemap water layer.
            closed = dissolved.buffer(1000).buffer(-1000)
            result['closedGapAreaKm2'] += round(closed.difference(dissolved).area / 1_000_000, 2)
            dissolved = closed
            dissolved = dissolved.simplify(350, preserve_topology=True)
            parts = polygons(dissolved)
            largest = max(parts, key=lambda part: part.area)
            retained = []
            for part in parts:
                if part is not largest and part.area < MIN_PART_AREA:
                    continue
                holes = [ring.coords for ring in part.interiors
                         if Polygon(ring).area >= MIN_PART_AREA]
                retained.append(Polygon(part.exterior.coords, holes))
            cleaned = unary_union(retained)
            if not cleaned.is_valid:
                cleaned = cleaned.buffer(0)
            geometry = transform(to_wgs84, cleaned)
            assert geometry.is_valid and not geometry.is_empty
            feature['geometry'] = mapping(geometry)
            p['areaKm2'] = round(cleaned.area / 1_000_000, 2)
            main_part = max(polygons(cleaned), key=lambda part: part.area)
            point = transform(to_wgs84, main_part.representative_point())
            p['labelCoordinates'] = [round(point.x, 5), round(point.y, 5)]
            p['labelMinZoom'] = max(4, math.ceil(math.log2(
                40075016 * math.cos(math.radians(point.y))
                * math.sqrt(2500 / main_part.area) / 512)))
            new_stats = stats(geometry)
            result['afterParts'] += new_stats['parts']
            result['afterHoles'] += new_stats['holes']
        result['closedGapAreaKm2'] = round(result['closedGapAreaKm2'], 2)
        file.write_text(json.dumps(collection, ensure_ascii=False, separators=(',', ':')) + '\n',
                        encoding='utf-8')
        results.append(result)
        print(json.dumps(result), flush=True)
    catalog['upperDisplayCleanup'] = {
        'method': 'Dissolve original ResearchArea; automatically close narrow water cuts and gaps with a 1000m positive/negative buffer, then simplify at 350m. Remove secondary components and interior holes under 1000 square kilometres; always retain the largest component. Large lake holes remain.',
        'narrowGapWidthM': 2000,
        'minimumComponentAreaKm2': 1000,
        'minimumHoleAreaKm2': 1000,
        'periods': results,
    }
    catalog['upperDisplayNote'] = '上级分区单独从原始ResearchArea合并，再自动闭合约2公里以内的窄缝；删除小于1000平方公里的次要独立碎片和内部孔洞，始终保留主体及较大的岛屿、湖泊。该规则仅用于上级概览显示，不修改府级图形或底图水系。'
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
