"""Attach original ResearchArea population attributes without changing geometry."""
import argparse
import collections
import json
from pathlib import Path

import shapefile

ROOT = Path(__file__).resolve().parents[1]
METHODS = {
    'Population records': 'recorded',
    'Number of households*5': 'household_conversion',
    'Estimation from Gong (2019)': 'historical_estimate',
    'Estimated according to its area and population of neighboring regions': 'neighbor_estimate',
    'No records': 'missing',
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True)
    args = parser.parse_args()
    groups = collections.defaultdict(list)
    for record in shapefile.Reader(args.source, encoding='utf-8').records():
        row = record.as_dict()
        groups[int(row['YEAR'].replace('AD', ''))].append(row)
    catalog_file = ROOT / 'data/historical-admin/catalog.json'
    catalog = json.loads(catalog_file.read_text(encoding='utf-8'))
    for period in catalog['periods']:
        file = ROOT / period['file']
        collection = json.loads(file.read_text(encoding='utf-8'))
        prefectures = [f for f in collection['features'] if f['properties']['level'] == 'prefecture']
        rows = groups[period['year']]
        assert len(rows) == len(prefectures)
        for feature, row in zip(prefectures, rows):
            p = feature['properties']
            assert (p['name'], p['parent']) == (row['PrefNAM'], row['ProvNAM'])
            method = METHODS[row['Source']]
            population = None if method == 'missing' else row['POP']
            p.update(population=population,
                     populationDensity=None if population is None else row['POPDENS'],
                     populationAreaKm2=row['AREA'],
                     populationKnownAreaKm2=0 if population is None else row['AREA'],
                     populationMethod=method, populationSourceText=row['Source'],
                     populationRecordStatus=row['RECORDS'], populationSourceId=row['PrefID'],
                     populationMethods={method: 1},
                     populationKnownUnits=int(population is not None),
                     populationMissingUnits=int(population is None))
            if population is not None and row['POPDENS'] > 0 and abs(population / row['AREA'] / row['POPDENS'] - 1) > .001:
                p['populationDensityNote'] = 'source_area_mismatch'
        for feature in collection['features']:
            p = feature['properties']
            if p['level'] != 'upper':
                continue
            children = [f['properties'] for f in prefectures if f['properties']['parent'] == p['name']]
            known = [c for c in children if c['population'] is not None]
            population = sum(c['population'] for c in known) if known else None
            known_area = sum(c['populationAreaKm2'] for c in known)
            methods = collections.Counter(c['populationMethod'] for c in children)
            p.update(population=population,
                     populationDensity=population / known_area if population is not None and known_area else None,
                     populationAreaKm2=sum(c['populationAreaKm2'] for c in children),
                     populationKnownAreaKm2=known_area, populationMethod='aggregate',
                     populationMethods=dict(methods), populationKnownUnits=len(known),
                     populationMissingUnits=len(children) - len(known))
        period['populationSummary'] = {
            'population': sum(f['properties']['population'] or 0 for f in prefectures),
            'knownUnits': sum(f['properties']['population'] is not None for f in prefectures),
            'missingUnits': sum(f['properties']['population'] is None for f in prefectures),
            'methods': dict(collections.Counter(f['properties']['populationMethod'] for f in prefectures)),
        }
        file.write_text(json.dumps(collection, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
        print(period['id'], period['populationSummary'])
    catalog['populationNote'] = '人口、府级密度和面积保留原ResearchArea统计值；无记录不作0人口。上级人口由所属府级相加，密度为已知人口合计除以有记录部分原始统计面积，不使用填缝后的显示面积。记录人口、户数乘5换算、史家估算、邻区推算分别标明；覆盖区合计不等同完整全国人口。'
    catalog_file.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
