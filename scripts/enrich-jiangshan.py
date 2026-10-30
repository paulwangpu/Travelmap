"""Attach schematic polity outlines and spatial upper-region matches."""
import json,sys
from pathlib import Path
sys.path.insert(0,'output/historical-admin-deps')
from shapely.geometry import shape,mapping
from shapely import make_valid
from shapely.ops import unary_union
from shapely.strtree import STRtree
root=Path('data/jiangshan');matched=unmatched=0
def polygonal(g):
 if g.geom_type=='Polygon':return [g]
 if g.geom_type in ['MultiPolygon','GeometryCollection']:return [p for x in g.geoms for p in polygonal(x)]
 return []
for path in sorted((root/'snapshots').glob('*.geojson')):
 d=json.loads(path.read_text(encoding='utf8'));d['features']=[f for f in d['features'] if f['properties']['level']!='polity']
 regions=[f for f in d['features'] if f['properties']['level']=='province'];geoms=[shape(f['geometry']) for f in regions];tree=STRtree(geoms)
 for f in d['features']:
  p=f['properties']
  if p['level']=='province':p.update(colorKey=p['nameZh']);continue
  g=shape(f['geometry']);scores=sorted([(g.intersection(geoms[i]).area,int(i)) for i in tree.query(g)],reverse=True)
  if scores and g.area and scores[0][0]/g.area>=.5:
   area,i=scores[0];parent=regions[i]['properties'];p.update(parentId=parent['id'],parentZh=parent['nameZh'],parentEn=parent['nameRoman'],colorKey=parent['nameZh'],parentMatch='largest_polygon_overlap',parentOverlap=round(area/g.area,4));matched+=1
  else:p.update(colorKey='unmatched',parentMatch='unresolved');unmatched+=1
 raw=json.loads((Path('output/jiangshan-upstream/geojson/snapshots')/path.name).read_text(encoding='utf8'))
 for i,f in enumerate(raw['features']):
  p=f['properties']
  if p['layer']!='polity':continue
  g=shape(f['geometry'])
  if not g.is_valid:
   parts=list(g.geoms) if g.geom_type=='MultiPolygon' else [g]
   g=unary_union([p for part in parts for p in polygonal(make_valid(part))])
  if g.is_empty:continue
  d['features'].append(dict(type='Feature',id=path.stem+'-polity-'+str(i),geometry=mapping(g),properties=dict(id=path.stem+'-polity-'+str(i),sourceId=path.stem+'-polity-'+str(i),nameZh=p['title'],nameRoman=p.get('title_en',p['title']),polityRole=p.get('role','neighbor'),polityColor=p.get('tint','#a69b84'),level='polity',originalLayer='polity',typeZh='政权疆界',labelCoordinates=p.get('anchor'),labelMinZoom=3,jiangshan=True)))
 path.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8',newline='\n')
print(json.dumps(dict(parentMatches=matched,unresolved=unmatched)))
notice=root/'NOTICE.md'
text=notice.read_text(encoding='utf8').replace('未导入政权、水系、道路和现代省界。','另导入政权轮廓仅用于国界线，不填色；未导入水系、道路和现代省界。')
if '最大重叠面积匹配' not in text:
 text+='\n二级政区按与一级政区的最大重叠面积匹配，覆盖比例至少50%；未达到阈值的保留待核，不就近强配。此为空间对应，不替代史料隶属关系。相同一级政区使用同一颜色。生成顺序：prepare-jiangshan.cjs → repair-jiangshan-topology.py → enrich-jiangshan.py。\n'
notice.write_text(text,encoding='utf8',newline='\n')
