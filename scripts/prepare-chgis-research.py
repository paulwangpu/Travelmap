"""Normalize downloaded official CHGIS layers for LOCAL use, not redistribution.

Requires fiona, shapely, pyproj. Run after downloading/extracting the official
packages into output/chgis-research/extracted. Existing research data is preserved.
"""
import json
from pathlib import Path
import fiona
from pyproj import Transformer
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import transform
from shapely.validation import make_valid

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / 'output/chgis-research'
EXTRACTED = RESEARCH / 'extracted'
DERIVED = RESEARCH / 'derived'
V4 = 'https://yugong.fudan.edu.cn/CHGIS/sjxz.htm'
V6_1820 = 'https://doi.org/10.7910/DVN/ST5KKM'
V6_1911 = 'https://doi.org/10.7910/DVN/HHVVHX'
MING = 'https://doi.org/10.7910/DVN/SB8ZTM'


def polygon_parts(g):
    if g.geom_type == 'Polygon':
        return [g]
    return [p for child in getattr(g, 'geoms', []) for p in polygon_parts(child)]


def rounded(value):
    return [rounded(x) for x in value] if isinstance(value, (list, tuple)) else round(value, 6)


def definition(id, pattern, name, kind, level, source, snapshot=None, interval=None):
    return dict(id=id, pattern=pattern, name=name, kind=kind, level=level,
                source=source, snapshot=snapshot, interval=interval)


LAYERS = [
    definition('time-province', 'V4_TimeSeries_Province_Bou/**/*.TAB', '上级分区（局部）', 'area', 'province', V4),
    definition('time-regime', 'V4_TimeSeries_Regime_Bou/**/*.TAB', '政权（闽、殷、清源／平海、东宁等局部）', 'area', 'regime', V4),
    definition('time-county', 'V4_TimeSeries_County_Bou_Fujian/**/*.TAB', '福建及相关台湾地区县界', 'area', 'county', V4),
    definition('time-province-seats', 'V4_TimeSeries_Province_Point/**/*.TAB', '历代上级治所（局部）', 'seat', 'province', V4),
    definition('time-regime-seats', 'V4_TimeSeries_Regime_Point/**/*.TAB', '局部政权治所', 'seat', 'regime', V4),
    definition('time-prefecture-seats', '*v6_time_pref_pts_utf_wgs84/*.shp', '历代府级治所', 'seat', 'prefecture', 'https://doi.org/10.7910/DVN/WW1PD6'),
    definition('time-county-seats', '*v6_time_cnty_pts_utf_wgs84/*.shp', '历代县级治所', 'seat', 'county', 'https://doi.org/10.7910/DVN/Q9VOF5'),
]
for y, source in [(1820, V6_1820), (1911, V6_1911)]:
    for code, level, zh in [('prov', 'province', '省'), ('pref', 'prefecture', '府'), ('cnty', 'county', '县')]:
        if y != 1820 or code != 'cnty':
            LAYERS.append(definition(f'{y}-{level}', f'*v6_{y}_{code}_pgn_utf/*.shp', f'{y}年{zh}界', 'area', level, source, snapshot=y))
        LAYERS.append(definition(f'{y}-{level}-seats', f'*v6_{y}_{code}_pts_utf/*.shp', f'{y}年{zh}级治所', 'seat', level, source, snapshot=y))
    LAYERS.append(definition(f'{y}-towns', f'*v6_{y}_twn_pts_utf/*.shp', f'{y}年村镇', 'town', 'town', source, snapshot=y))
LAYERS += [
    definition('1820-rivers', '*v6_1820_coded_rvr_lin_utf/*.shp', '1820年河流', 'water-line', 'water', V6_1820, snapshot=1820),
    definition('1820-lakes', '*v6_1820_lks_pgn_utf/*.shp', '1820年湖泊', 'water-area', 'water', V6_1820, snapshot=1820),
    definition('1820-coast', 'V4_Layer1820_Sealine/**/*.TAB', '1820年海岸线', 'water-line', 'water', V4, snapshot=1820),
    definition('ming-routes', '*Ming_Routes_2016/*.shp', '明代驿路专题（含1903年邮政图参照）', 'route', 'route', MING, interval=[1368, 1644]),
    definition('ming-stations', '*Ming_Stations_2016/*.shp', '明代驿站专题（含后期位置参照）', 'station', 'station', MING, interval=[1368, 1644]),
]


def text(p, *keys):
    return next((str(p[k]).strip() for k in keys if p.get(k) is not None and str(p[k]).strip()), '')


def main():
    DERIVED.mkdir(parents=True, exist_ok=True)
    to_area = Transformer.from_crs(4326, 6933, always_xy=True).transform
    from_area = Transformer.from_crs(6933, 4326, always_xy=True).transform
    catalog_layers, audit = [], []
    # Original V6 prefecture conversion was already verified and is preserved.
    pref_file = ROOT / 'output/chgis-v6-prefecture.geojson'
    pref = json.loads(pref_file.read_text(encoding='utf8'))
    catalog_layers.append(dict(id='time-prefecture', name='历代府级及其他历史区域', kind='area', level='prefecture', source='https://doi.org/10.7910/DVN/I0Q7SM', file='output/chgis-v6-prefecture.geojson', count=len(pref['features']), snapshot=None, interval=None))
    for layer in LAYERS:
        matches = list(EXTRACTED.glob(layer['pattern']))
        if len(matches) != 1:
            raise ValueError(f"Ambiguous source {layer['id']}: {matches}")
        filename = matches[0]
        features, exclusions = [], []
        kwargs = {'encoding': 'utf-8'} if filename.suffix.lower() == '.shp' else {}
        with fiona.open(filename, **kwargs) as src:
            to_wgs = Transformer.from_crs(src.crs_wkt or src.crs, 4326, always_xy=True).transform
            for i, row in enumerate(src):
                p = dict(row['properties'])
                id = text(p, 'SYS_ID', 'YZ_ID', 'KEY_ID') or str(i)
                if layer['snapshot'] is not None:
                    start = end = layer['snapshot']
                elif layer['interval']:
                    start, end = layer['interval']
                else:
                    start, end = int(p['BEG_YR']), int(p['END_YR'])
                if start > end or not row['geometry']:
                    exclusions.append(dict(id=id, reason='invalid_dates_or_missing_geometry', start=start, end=end))
                    continue
                g = transform(to_wgs, shape(row['geometry']))
                if g.is_empty:
                    exclusions.append(dict(id=id, reason='empty_geometry'))
                    continue
                area = 0
                if layer['kind'] in ['area', 'water-area']:
                    projected = transform(to_area, make_valid(g))
                    parts = polygon_parts(projected)
                    if not parts:
                        exclusions.append(dict(id=id, reason='no_polygon'))
                        continue
                    largest = max(parts, key=lambda x: x.area)
                    area = projected.area / 1e6
                    kept = []
                    for part in parts:
                        if part is not largest and part.area < min(25e6, largest.area * .01):
                            continue
                        # Preserve lake islands; administrative display alone fills small holes.
                        rings = [r for r in part.interiors if layer['kind'] == 'water-area' or Polygon(r).area >= 25e6]
                        kept.extend(polygon_parts(make_valid(Polygon(part.exterior, rings).simplify(300, preserve_topology=True))))
                    valid = make_valid(MultiPolygon(kept) if len(kept) > 1 else kept[0])
                    kept = polygon_parts(valid)
                    valid = MultiPolygon(kept) if len(kept) > 1 else kept[0]
                    label = transform(from_area, max(kept, key=lambda x: x.area).representative_point())
                    g = transform(from_area, valid)
                else:
                    if layer['kind'] in ['water-line', 'route']:
                        g = g.simplify(.001, preserve_topology=True)
                    label = g.representative_point()
                geometry = mapping(g)
                geometry['coordinates'] = rounded(geometry['coordinates'])
                check = shape(geometry)
                if not check.is_valid:
                    check = make_valid(check)
                    if layer['kind'] in ['area', 'water-area']:
                        parts = polygon_parts(check)
                        check = MultiPolygon(parts) if len(parts) > 1 else parts[0]
                    geometry = mapping(check)
                if layer['kind'] not in ['area', 'water-area']:
                    label = shape(geometry).representative_point()
                name = text(p, 'NAME_CH', 'YZNM_CH', 'NAME_FT')
                source_basis = text(p, 'SRC', 'SOURCE')
                features.append({'type': 'Feature', 'id': f"{layer['id']}:{i}", 'geometry': geometry, 'properties': {
                    'id': f"{layer['id']}:{i}", 'sourceId': id, 'nameZh': name,
                    'nameRoman': text(p, 'NAME_PY', 'YZNM_PY'),
                    'typeZh': '1903年邮政图参考点' if source_basis == 'PA_1903' else text(p, 'TYPE_CH') or {'route': '驿路线段', 'station': '驿站', 'water-line': '历史水系线', 'water-area': '湖泊'}.get(layer['kind'], ''),
                    'level': layer['level'], 'kind': layer['kind'], 'start': start, 'end': end,
                    'parentZh': ' · '.join(filter(None, [text(p, 'LEV1_CH'), text(p, 'LEV2_CH'), text(p, 'COUNT_CH')])),
                    'modernLocation': text(p, 'PRES_LOC', 'PERS_LOC'),
                    'areaKm2': round(area, 2), 'labelCoordinates': [label.x, label.y],
                    'labelMinZoom': (9 if layer['kind'] == 'town' else 7 if layer['level'] == 'county' else 5 if layer['kind'] in ['seat', 'station'] else 8 if area < 100 else 7 if area < 500 else 6 if area < 2000 else 4),
                    'sourceUrl': layer['source'], 'sourceLayer': layer['name'], 'sourceBasis': source_basis,
                    'beginRule': text(p, 'BEG_RULE'), 'endRule': text(p, 'END_RULE'),
                    'temporalPrecision': 'dynasty_topic' if layer['interval'] else 'snapshot' if layer['snapshot'] else 'source_range',
                }})
            source_count = len(src)
        target = DERIVED / (layer['id'] + '.geojson')
        target.write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, ensure_ascii=False, separators=(',', ':')), encoding='utf8', newline='\n')
        info = {k: v for k, v in layer.items() if k != 'pattern'}
        info.update(file=target.relative_to(ROOT).as_posix(), count=len(features), sourceCount=source_count, excluded=len(exclusions))
        catalog_layers.append(info)
        audit.append(dict(id=layer['id'], sourceFile=filename.relative_to(ROOT).as_posix(), sourceCount=source_count, count=len(features), exclusions=exclusions, bytes=target.stat().st_size))
        print(f"{layer['id']}: {len(features)}", flush=True)
    catalog = dict(title='CHGIS V6 + selected V4 supplements', status='local-only', minYear=-224, maxYear=1911,
                   file='output/chgis-v6-prefecture.geojson', source='https://doi.org/10.7910/DVN/I0Q7SM',
                   license='https://doi.org/10.7910/DVN/FDLFJ3', redistributionAllowed=False,
                   layers=catalog_layers, notice='Partial coverage; snapshots apply only to their exact year. Local use only, not for redistribution.')
    (ROOT / 'data/history-boundaries/catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding='utf8', newline='\n')
    (RESEARCH / 'preparation-audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding='utf8', newline='\n')
    print(json.dumps(dict(layers=len(catalog_layers), features=sum(x['count'] for x in catalog_layers))))


if __name__ == '__main__':
    main()
