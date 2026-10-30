"""Repair source self-intersections without smoothing or filling valid holes."""
import json,sys
from pathlib import Path
sys.path.insert(0,'output/historical-admin-deps')
from shapely.geometry import shape,mapping
from shapely import make_valid
from shapely.ops import unary_union
root=Path('data/jiangshan');audit=[]
def polygons(g):
 if g.geom_type=='Polygon':return [g]
 if g.geom_type in ['MultiPolygon','GeometryCollection']:return [p for x in g.geoms for p in polygons(x)]
 return []
for path in sorted((root/'snapshots').glob('*.geojson')):
 data=json.loads(path.read_text(encoding='utf8'));changed=False
 for f in data['features']:
  g=shape(f['geometry'])
  if g.is_valid:continue
  parts=list(g.geoms) if g.geom_type=='MultiPolygon' else [g]
  fixed=unary_union([p for part in parts for p in polygons(make_valid(part))])
  assert fixed.is_valid and not fixed.is_empty,f['id']
  audit.append(dict(file=path.name,id=f['id'],originalType=g.geom_type,repairedType=fixed.geom_type,originalAreaDegrees2=g.area,repairedAreaDegrees2=fixed.area))
  f['geometry']=mapping(fixed);f['properties']['topologyRepair']='make_valid; polygonal components only; no smoothing or buffer';changed=True
 if changed:path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8',newline='\n')
(root/'topology-audit.json').write_text(json.dumps(dict(method='Shapely make_valid per polygon then union overlaps; preserve source holes; no buffering or smoothing',repairs=audit),ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
print('Repaired source geometries:',len(audit))
