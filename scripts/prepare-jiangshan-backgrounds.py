"""Background territories fill only gaps in the selected administrative layer."""
import json,sys,math
from pathlib import Path
sys.path.insert(0,'output/historical-admin-deps')
from shapely.geometry import shape,mapping
from shapely.ops import unary_union
root=Path('data/jiangshan');count=0
def polygons(g):
 if g.geom_type=='Polygon':return [g]
 if g.geom_type in ['MultiPolygon','GeometryCollection']:return [p for x in g.geoms for p in polygons(x)]
 return []
for path in sorted((root/'snapshots').glob('*.geojson')):
 d=json.loads(path.read_text(encoding='utf8'));backgrounds={}
 polities=[f for f in d['features'] if f['properties']['level']=='polity' and (f['properties'].get('polityRole')!='neighbor' or '吐蕃' in f['properties']['nameZh'])]
 for level in ['province','prefecture']:
  occupied=unary_union([shape(f['geometry']) for f in d['features'] if f['properties']['level']==level and f['properties']['typeZh']!='非政区国土'])
  out=[]
  if level=='province':
   upper=[f for f in d['features'] if f['properties']['level']=='province']
   names=sorted(set(f['properties']['nameZh'] for f in upper))
   supplements=[]
   for f in d['features']:
    p=f['properties']
    if p['level']!='prefecture' or p['typeZh']=='非政区国土' or p.get('parentZh') not in names:continue
    original=shape(f['geometry'])
    if occupied.covers(original):continue
    g=unary_union(polygons(original.difference(occupied)))
    if g.is_empty or g.area<max(.01,original.area*.01):continue
    assert g.is_valid
    hue=math.floor(names.index(p['parentZh'])*137.508+.5)%360
    props={**p,'historyBackground':True,'backgroundTier':'lowerSupplement','color':f'hsl({hue}, 42%, 53%)'}
    out.append(dict(type='Feature',id='background-lower-'+str(f['id']),geometry=mapping(g),properties=props));supplements.append(g);count+=1
   if supplements:occupied=unary_union([occupied]+supplements)
  if level=='prefecture':
   upper=[f for f in d['features'] if f['properties']['level']=='province' and f['properties']['typeZh']!='非政区国土']
   names=sorted(set(f['properties']['nameZh'] for f in d['features'] if f['properties']['level']=='province'))
   for f in upper:
    g=unary_union(polygons(shape(f['geometry']).difference(occupied)))
    if g.is_empty:continue
    assert g.is_valid
    hue=math.floor(names.index(f['properties']['nameZh'])*137.508+.5)%360
    p={**f['properties'],'historyBackground':True,'backgroundTier':'upper','color':f'hsl({hue}, 42%, 53%)'}
    out.append(dict(type='Feature',id='background-upper-'+str(f['id']),geometry=mapping(g),properties=p));count+=1
   occupied=unary_union([occupied]+[shape(f['geometry']) for f in upper])
  for f in polities:
   g=unary_union(polygons(shape(f['geometry']).difference(occupied)))
   if g.is_empty:continue
   assert g.is_valid
   p={**f['properties'],'historyBackground':True,'backgroundTier':'polity','color':f['properties']['polityColor'],'labelMinZoom':3}
   anchor=p.get('labelCoordinates');point=g.representative_point()
   # Label the remaining background, rather than a city already inside a district.
   p['labelCoordinates']=[point.x,point.y]
   out.append(dict(type='Feature',id='background-'+level+'-'+str(f['id']),geometry=mapping(g),properties=p));count+=1
  backgrounds[level]=dict(type='FeatureCollection',features=out)
 backgrounds['polity']=dict(type='FeatureCollection',features=[])
 d['backgrounds']=backgrounds
 temporary=path.with_suffix('.background-tmp');temporary.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8',newline='\n');temporary.replace(path)
print('Gap-only background features:',count)
