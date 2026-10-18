"""Build an exclusive display mosaic; never overwrite original assessment geometry.

Requires Shapely 2.x. Uses only the three existing dated/local snapshots, no network.
"""
import argparse
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--deps', help='Optional directory containing Shapely')
parser.add_argument('--resume', action='store_true', help='Reuse this snapshot build cache after overlay validation changes')
args = parser.parse_args()
if args.deps:
    sys.path.insert(0, str(pathlib.Path(args.deps).resolve()))
from shapely import make_valid, set_precision, union_all, STRtree
from shapely.geometry import GeometryCollection, mapping, shape

GRID = 1e-7  # Derived display only: ~1 cm; stabilizes coincident source edges.

paths = {
    'country': 'data/safeture-country-risk-20261017.geojson',
    'regional': 'data/safeture-regional-risk-20261017.geojson',
    'land': 'data/gallup-safety-2025.geojson',
}
sources = {key: json.loads((ROOT / path).read_text(encoding='utf-8')) for key, path in paths.items()}
source_hashes = {path: hashlib.sha256((ROOT / path).read_bytes()).hexdigest() for path in paths.values()}
repairs = {key: 0 for key in paths}


def polygonal(g):
    if g.geom_type in ('Polygon', 'MultiPolygon'):
        return g
    return union_all([polygonal(part) for part in getattr(g, 'geoms', [])])


def geometries(key):
    result = []
    for feature in sources[key]['features']:
        g = shape(feature['geometry'])
        if not g.is_valid:
            repairs[key] += 1
            g = make_valid(g)
        result.append(set_precision(polygonal(g), GRID))
    return result


regions, countries, land = (geometries(key) for key in ('regional', 'country', 'land'))
if args.resume:
    cache = json.loads((ROOT / 'output/safeture/display-build-cache.json').read_text(encoding='utf-8'))
    assert cache['sourcesSha256'] == source_hashes, 'Rebuild required: source snapshots changed'
    mosaic = {int(level): shape(g) for level, g in cache['mosaic'].items()}
    coverage = shape(cache['coverage'])
else:
    empty = set_precision(GeometryCollection(), GRID)
    by_level = {level: [] for level in range(6)}
    claimed = empty
    # Regional category priority is independent of national category.
    for level in range(5, 0, -1):
        group = union_all([g for f, g in zip(sources['regional']['features'], regions)
                           if f['properties']['risklevelid'] == level], grid_size=GRID)
        by_level[level].append(polygonal(group.difference(claimed, grid_size=GRID)))
        claimed = claimed.union(group, grid_size=GRID)
    regional_union = claimed
    print('Regional priority resolved', flush=True)
    # Retain the original country painter order, including the rare overlapping edges.
    region_tree, country_tree = STRtree(regions), STRtree(countries)
    for index, (feature, g) in enumerate(zip(sources['country']['features'], countries)):
        level = feature['properties']['risklevelid'] or 0
        blockers = [regions[j] for j in region_tree.query(g)]
        blockers.extend(countries[j] for j in country_tree.query(g) if j > index)
        by_level[level].append(polygonal(g.difference(union_all(blockers, grid_size=GRID), grid_size=GRID)))
    claimed = union_all([regional_union, *countries], grid_size=GRID)
    print('Country priority resolved', flush=True)
    land_union = union_all(land, grid_size=GRID)
    by_level[0].append(polygonal(land_union.difference(claimed, grid_size=GRID)))
    mosaic = {level: polygonal(union_all(parts, grid_size=GRID)) for level, parts in by_level.items()}
    coverage = union_all([land_union, claimed], grid_size=GRID)
    coverage_error = coverage.symmetric_difference(union_all(list(mosaic.values()), grid_size=GRID), grid_size=GRID).area
    cache = {'mosaic': {level: mapping(g) for level, g in mosaic.items()}, 'coverage': mapping(coverage), 'coverageErrorDegrees2': coverage_error, 'sourcesSha256': source_hashes}
    (ROOT / 'output/safeture/display-build-cache.json').write_text(json.dumps(cache, separators=(',', ':')), encoding='utf-8')
    print(json.dumps({'mosaicReady': True, 'coverageErrorDegrees2': coverage_error}), flush=True)
    assert coverage_error < 1e-5, coverage_error

# Remove the sub-grid slivers introduced by repeated fixed-grid overlay rounding.
# Read back as floating precision, then resolve all six display categories exactly.
resolved = {}
claimed = GeometryCollection()
for level in range(5, -1, -1):
    g = shape(mapping(mosaic[level]))
    resolved[level] = polygonal(g.difference(claimed))
    claimed = claimed.union(resolved[level])
    print('Exclusive category resolved: ' + str(level), flush=True)
mosaic = resolved
coverage_error = coverage.symmetric_difference(union_all(list(mosaic.values()))).area
# The coverage check allows sub-grid edge slivers globally; overlaps stay strict below.
assert coverage_error < coverage.area * 1e-8, coverage_error
for level, g in mosaic.items():
    assert g.is_valid
    for other in range(level):
        assert g.intersection(mosaic[other]).area < 1e-10

# Check source interior samples against the original precedence, not just colours.
samples = 0
for g in regions + countries + land:
    if g.is_empty:
        continue
    p = g.representative_point()
    levels = [f['properties']['risklevelid'] for f, r in zip(sources['regional']['features'], regions) if r.covers(p)]
    if levels:
        expected = max(levels)
    else:
        levels = [f['properties']['risklevelid'] or 0 for f, c in zip(sources['country']['features'], countries) if c.covers(p)]
        expected = levels[-1] if levels else 0
    assert mosaic[expected].distance(p) < 1e-9
    samples += 1

features = [{'type': 'Feature', 'id': f'display-level-{level}',
             'properties': {'risklevelid': level or None, 'riskScope': 'display'},
             'geometry': mapping(g)} for level, g in mosaic.items() if not g.is_empty]
# One deduplicated line network avoids translucent shared outlines drawing twice.
boundaries = union_all([g.boundary for g in mosaic.values() if not g.is_empty] + [g.boundary for g in countries if not g.is_empty])
features.append({'type': 'Feature', 'id': 'display-boundaries',
                 'properties': {'riskScope': 'boundary'}, 'geometry': mapping(boundaries)})
metadata = {'sources': {key: {'path': path, 'sha256': hashlib.sha256((ROOT / path).read_bytes()).hexdigest()}
                        for key, path in paths.items()},
            'purpose': 'Derived display mosaic only; original geometries remain the interaction/detail sources.',
            'priority': 'Regional (highest overlapping category), then country overall, then grey land.',
            'landUse': 'Natural Earth geometry only; Gallup scores are ignored.',
            'invalidSourceGeometriesRepairedForDisplay': repairs,
            'displayGridDegrees': GRID,
            'coverageDifferenceDegrees2': coverage_error, 'nationalBoundariesRetained': True,
            'exclusiveCategoryFills': True, 'deduplicatedBoundaries': True,
            'sourceInteriorSamplesChecked': samples}
target = ROOT / 'data/safeture-display-20261017.geojson'
target.write_text(json.dumps({'type': 'FeatureCollection', 'metadata': metadata, 'features': features},
                            ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(json.dumps({'features': len(features), 'bytes': target.stat().st_size,
                  'disjointCategories': True, 'prioritySamples': samples, 'displayRepairs': repairs}))
