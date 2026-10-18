"""Preserve only the public globe's geomtype=regions risk advisories."""
import datetime, hashlib, json, pathlib, urllib.request
root=pathlib.Path(__file__).resolve().parent.parent
url='https://globe.safeture.com/assets/geojson/riskline_advisory_simplified_description.geojson'
with urllib.request.urlopen(url,timeout=45) as response:
    raw=response.read()
    modified=response.headers.get('Last-Modified')
original=json.loads(raw)
features=[]
for index,f in enumerate(original['features']):
    p=f['properties']
    if p.get('geomtype')!='regions': continue
    assert isinstance(p.get('risklevelid'),int) and 1<=p['risklevelid']<=5
    countries=p.get('country_info') or '[]'
    if isinstance(countries,str): countries=json.loads(countries)
    countries=[{'iso2':c.get('iso3166-1'),'name':c.get('description')} for c in countries]
    props={k:p.get(k) for k in ['title','risklevelid','risklevel','geomtype','created','firstcreatedat']}
    props.update({'name':p.get('title'),'countries':countries,'sourceIndex':index})
    features.append({'type':'Feature','id':'safeture-regional-'+str(index),'properties':props,'geometry':f['geometry']})
metadata={'source':url,'officialPage':'https://www.safeture.com/globe/',
 'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceLastModified':modified,
 'sourceSha256':hashlib.sha256(raw).hexdigest(),'sourceFeatures':len(original['features']),
 'regionalFeatures':len(features),'excludedNationalAdvisories':sum(f['properties'].get('geomtype')=='country' for f in original['features']),
 'scope':'Official Regional risk advisory layer only. Outside these geometries means no Regional coverage, not negligible risk.',
 'copyright':'Risk data and original geometry © Riskline / Safeture. Local display palette; original levels retained.'}
result={'type':'FeatureCollection','metadata':metadata,'features':features}
out=root/'output/safeture';out.mkdir(exist_ok=True,parents=True)
(out/'regional-advisory-original.geojson').write_bytes(raw)
(root/'data/safeture-regional-risk-20261017.geojson').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(json.dumps({'regions':len(features),'excludedNationalAdvisories':metadata['excludedNationalAdvisories'],'levels':{i:sum(f['properties']['risklevelid']==i for f in features) for i in range(1,6)}}))
