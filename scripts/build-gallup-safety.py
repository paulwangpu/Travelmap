import json, pathlib, urllib.request, re, html as htmlmod

root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'output/gallup-safety'
out.mkdir(exist_ok=True)
url = 'https://www.gallup.com/analytics/356996/gallup-global-safety-research-center.aspx'
html = urllib.request.urlopen(url).read()
(out / 'official-page.html').write_bytes(html)
tables = []
for table in re.findall(r'<table\b.*?</table>',html.decode(),re.S):
    rows = []
    for tr in re.findall(r'<tr\b.*?</tr>',table,re.S):
        cells = [htmlmod.unescape(re.sub('<[^>]*>','',c)).strip() for c in re.findall(r'<t[dh]\b[^>]*>(.*?)</t[dh]>',tr,re.S)]
        if len(cells) == 2:
            try: rows.append([cells[0], int(cells[1].rstrip('%'))])
            except ValueError: pass
    if len(rows) > 100: tables.append(rows)
assert len(tables) == 2, [len(t) for t in tables]
assert dict(tables[0])['China'] == 94 and dict(tables[1])['China'] == 93
countries = json.loads((root / 'data/countries.geojson').read_text(encoding='utf-8'))
(out / 'official-tables.json').write_text(json.dumps(tables,ensure_ascii=False,indent=2),encoding='utf-8')

# Explicit source-name crosswalk; no regional value is inherited by another area.
aliases = {'Tanzania':'United Republic of Tanzania','Russian Federation':'Russia',
 'Czech Republic':'Czechia','Türkiye':'Turkey',"Lao People's Democratic Republic":'Laos',
 'State of Palestine':'Palestine','Republic of Moldova':'Moldova','Serbia':'Republic of Serbia',
 "Côte d'Ivoire":'Ivory Coast','Eswatini':'eSwatini','The Dominican Republic':'Dominican Republic',
 'The Comoros':'Comoros','The Democratic Republic of the Congo':'Democratic Republic of the Congo',
 'The Republic of the Congo':'Republic of the Congo','Hong Kong (S.A.R. of China)':'Hong Kong S.A.R.',
 'Taiwan, Province of China':'Taiwan','United Kingdom of Great Britain and Northern Ireland':'United Kingdom'}
lookup = {f['properties']['name']: f for f in countries['features']}
scores = {}
for metric, rows in zip(['safety','lawOrder'],tables):
    for name, value in rows:
        target = aliases.get(name,name)
        assert target in lookup, name
        scores.setdefault(target,{'sourceName':name})[metric] = value
assert len(scores) == 144

def simplify(points, epsilon=0.015):
    # Douglas-Peucker, in degrees; retain every polygon and hole, including islands.
    if len(points) <= 4: return points
    ax,ay = points[0]; bx,by = points[-1]; dx,dy=bx-ax,by-ay
    den=dx*dx+dy*dy
    distances=[]
    for x,y in points[1:-1]:
        t=max(0,min(1,((x-ax)*dx+(y-ay)*dy)/den)) if den else 0
        distances.append((x-ax-t*dx)**2+(y-ay-t*dy)**2)
    maximum=max(distances,default=0)
    if maximum<=epsilon*epsilon: return [points[0],points[-1]]
    index=distances.index(maximum)+1
    return simplify(points[:index+1],epsilon)[:-1]+simplify(points[index:],epsilon)

def ring(r):
    result=simplify(r)
    if len(result)<4: result=r
    return [[round(p[0],5),round(p[1],5)] for p in result]
features=[]
for f in countries['features']:
    p=f['properties']; geometry=f['geometry']
    if geometry['type']=='Polygon': coordinates=[ring(r) for r in geometry['coordinates']]
    else: coordinates=[[ring(r) for r in polygon] for polygon in geometry['coordinates']]
    features.append({'type':'Feature','properties':{'name':p['name'],'iso2':p['ISO3166-1-Alpha-2'],
      **scores.get(p['name'],{'safety':None,'lawOrder':None})},'geometry':{'type':geometry['type'],'coordinates':coordinates}})
meta={'reportYear':2025,'surveyYear':2024,'retrievedAt':'2026-10-16','source':url,
 'report':'https://www.gallup.com/file/analytics/695138/Gallup_Global-Safety-Report-2025.pdf',
 'coverage':144,'copyright':'© 2025 Gallup, Inc. All rights reserved.',
 'metrics':{'safety':'Percentage feeling safe walking alone at night','lawOrder':'Four-question Law and Order Index, 0–100'},
 'geometry':'Existing Natural Earth country geometry; generalized 0.015 degrees for thematic overview. Not a survey boundary.',
 'nameCrosswalk':aliases}
data={'type':'FeatureCollection','metadata':meta,'features':features}
(root/'data/gallup-safety-2025.geojson').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(json.dumps({'mapped':len(scores),'features':len(features),'bytes':(root/'data/gallup-safety-2025.geojson').stat().st_size}))
