"""Prepare local 1990 census population (A102), per official variable codebook.

Province/prefecture statistics are aggregated by administrative codes, not names.
Raw and derived data remain local: CHGIS prohibits redistribution.
"""
import collections
import json
from pathlib import Path
import fiona
from pyproj import Transformer
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import transform
from shapely.validation import make_valid

ROOT = Path(__file__).resolve().parents[1]
EXTRACTED = ROOT / 'output/chgis-research/extracted'
SOURCE = 'https://doi.org/10.7910/DVN/T27RQO'


def parts(g):
    if g.geom_type == 'Polygon':
        return [g]
    return [p for child in getattr(g, 'geoms', []) for p in parts(child)]


def rounded(a):
    return [rounded(x) for x in a] if isinstance(a, (tuple, list)) else round(a, 6)


def geometry(g):
    polygons = parts(make_valid(g))
    largest = max(polygons, key=lambda x: x.area)
    kept = []
    for p in polygons:
        if p is not largest and p.area < min(25e6, largest.area * .01):
            continue
        kept.extend(parts(make_valid(Polygon(p.exterior, [r for r in p.interiors if Polygon(r).area >= 25e6]).simplify(300, preserve_topology=True))))
    cleaned = make_valid(MultiPolygon(kept) if len(kept) > 1 else kept[0])
    polygons = parts(cleaned)
    cleaned = MultiPolygon(polygons) if len(polygons) > 1 else polygons[0]
    label = max(polygons, key=lambda x: x.area).representative_point()
    return cleaned, label


def main():
    project = Transformer.from_crs(4326, 6933, always_xy=True).transform
    reverse = Transformer.from_crs(6933, 4326, always_xy=True).transform
    county_rows, features = [], []
    for code, level in [('cnty', 'county'), ('pref', 'prefecture'), ('prov', 'upper')]:
        filename = next(EXTRACTED.glob(f'*v6_citas90_{code}*/*.shp'))
        with fiona.open(filename, encoding='gbk') as src:
            to_wgs = Transformer.from_crs(src.crs_wkt, 4326, always_xy=True).transform
            for index, row in enumerate(src):
                p = dict(row['properties'])
                original = transform(project, transform(to_wgs, make_valid(shape(row['geometry']))))
                clean, label = geometry(original)
                area = original.area / 1e6
                if level == 'county':
                    key = str(p['GBCODE_91']).zfill(6)
                    population = int(p['A102']) if p.get('A102', 0) > 0 else None
                    stat = dict(code=key, population=population, area=area, prov=p['PROV_HZ'], pref=p['PREF_HZ'])
                    county_rows.append(stat)
                    units, missing = (1 if population else 0), (0 if population else 1)
                    known_area = area if population else 0
                    name, roman, parent = p['CNTY_HZ'], p['CNTY_PY'], p['PREF_HZ']
                else:
                    key = str(p['GB_91'] if level == 'prefecture' else p['GBCODE90']).zfill(6)
                    prefix = key[:4] if level == 'prefecture' else key[:2]
                    children = [x for x in county_rows if x['code'].startswith(prefix)]
                    known = [x for x in children if x['population'] is not None]
                    population = sum(x['population'] for x in known) if known else None
                    known_area = sum(x['area'] for x in known)
                    units, missing = len(known), len(children) - len(known)
                    name = p['HZ_NAME'] if level == 'prefecture' else p['NAME_HZ']
                    roman = p['PY_NAME'] if level == 'prefecture' else p['NAME_PY']
                    parent = children[0]['prov'] if children else name
                label = transform(reverse, label)
                g = mapping(transform(reverse, clean))
                g['coordinates'] = rounded(g['coordinates'])
                test = shape(g)
                if not test.is_valid:
                    valid = parts(make_valid(test))
                    g = mapping(MultiPolygon(valid) if len(valid) > 1 else valid[0])
                methods = {'census': units}
                if missing:
                    methods['missing'] = missing
                features.append({'type': 'Feature', 'geometry': g, 'properties': {
                    'id': f'1990-{level}-{key}', 'year': 1990, 'level': level,
                    'name': roman, 'nameZh': name, 'parent': parent, 'parentZh': parent,
                    'nameSource': SOURCE, 'labelCoordinates': [label.x, label.y],
                    'labelMinZoom': 8 if area < 100 else 7 if area < 500 else 6 if area < 2000 else 4,
                    'areaKm2': round(area, 2), 'population': population,
                    'populationDensity': population / known_area if population is not None and known_area else None,
                    'populationAreaKm2': known_area, 'populationKnownAreaKm2': known_area,
                    'populationMethod': 'census' if level == 'county' else 'aggregate',
                    'populationSourceText': 'CITAS 1990 Census, A102 (Total P)',
                    'populationRecordStatus': 'Recorded' if population else 'NoRecords',
                    'populationMethods': methods, 'populationKnownUnits': units, 'populationMissingUnits': missing,
                    'populationSourceId': key,
                }})
    target = ROOT / 'output/chgis-research/derived/census-1990.geojson'
    target.write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, ensure_ascii=False, separators=(',', ':')), encoding='utf8', newline='\n')
    known = [r for r in county_rows if r['population'] is not None]
    summary = dict(population=sum(r['population'] for r in known), knownUnits=len(known), missingUnits=len(county_rows)-len(known), methods={'census': len(known), 'missing': len(county_rows)-len(known)})
    period = dict(id='1990', year=1990, name='现代 · 1990年普查', enName='Modern · 1990 census',
                  file=target.relative_to(ROOT).as_posix(), article=SOURCE, dataSource=SOURCE,
                  countyLevel=True, prefectures=sum(f['properties']['level']=='prefecture' for f in features),
                  upperRegions=sum(f['properties']['level']=='upper' for f in features), counties=len(county_rows),
                  populationSummary=summary, status='local-only', redistributionAllowed=False,
                  notice='A102 = total population, not households. Zero/missing population is left unknown. Density uses county polygon area; parent totals aggregate by code.')
    (ROOT / 'data/historical-admin/census-1990.json').write_text(json.dumps(period, ensure_ascii=False, indent=2), encoding='utf8', newline='\n')
    print(json.dumps(dict(features=len(features), bytes=target.stat().st_size, **summary)))


if __name__ == '__main__':
    main()
