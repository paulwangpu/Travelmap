"""Snapshot the public Safeture globe's country-risk dataset without advisory prose."""
import datetime, hashlib, json, pathlib, urllib.request
root = pathlib.Path(__file__).resolve().parent.parent
url = 'https://globe.safeture.com/assets/geojson/country_risk_assessment.geojson'
with urllib.request.urlopen(url, timeout=45) as response:
    raw = response.read()
    modified = response.headers.get('Last-Modified')
data = json.loads(raw)
features = []
for f in data['features']:
    p = f['properties']
    level = p.get('risklevelid')
    assert level is None or isinstance(level, int) and 1 <= level <= 5
    features.append({'type':'Feature','properties':{k:p.get(k) for k in ['name','iso2','iso3','risklevelid','risklevel','trend']},'geometry':f['geometry']})
stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
metadata = {'source':url,'officialPage':'https://www.safeture.com/globe/','retrievedAt':stamp,
 'sourceLastModified':modified,'sourceSha256':hashlib.sha256(raw).hexdigest(),
 'geometrySha256':hashlib.sha256(json.dumps([f['geometry'] for f in features],sort_keys=True,separators=(',',':')).encode()).hexdigest(),
 'totalAreas':len(features),'ratedAreas':sum(f['properties']['risklevelid'] is not None for f in features),
 'scope':'Overall country risk from the public interactive globe; dated snapshot, not a live feed or the annual 2026 poster.',
 'copyright':'Country risk data © Safeture / Riskline; original source geometry preserved.'}
out = root / 'output/safeture'
out.mkdir(parents=True,exist_ok=True)
(out/'country-risk-original.geojson').write_bytes(raw)
result={'type':'FeatureCollection','metadata':metadata,'features':features}
(root/'data/safeture-country-risk-20261017.geojson').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(json.dumps({'areas':metadata['totalAreas'],'rated':metadata['ratedAreas'],'unrated':metadata['totalAreas']-metadata['ratedAreas'],'bytes':len(raw)}))
