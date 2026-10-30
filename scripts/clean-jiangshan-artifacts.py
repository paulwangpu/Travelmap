"""Remove repair-created dust and holes; retain source islands and named enclaves."""
import json,sys
from pathlib import Path
sys.path.insert(0,'output/historical-admin-deps')
from shapely.geometry import shape,Polygon,mapping
from shapely.ops import unary_union
from shapely.strtree import STRtree
root=Path('data/jiangshan');audit=[]
def parts(g):return list(g.geoms) if g.geom_type=='MultiPolygon' else [g]
for path in sorted((root/'snapshots').glob('*.geojson')):
 d=json.loads(path.read_text(encoding='utf8'));raw=json.loads((Path('output/jiangshan-upstream/geojson/snapshots')/path.name).read_text(encoding='utf8'))
 admins=[f for f in raw['features'] if f['properties']['layer'] in ['region','prefecture']]
 originals={path.stem+'-'+str(i):shape(f['geometry']) for i,f in enumerate(admins)}
 originals.update({path.stem+'-polity-'+str(i):shape(f['geometry']) for i,f in enumerate(raw['features']) if f['properties']['layer']=='polity'})
 geoms=[shape(f['geometry']) for f in d['features']];tree=STRtree(geoms);changed=False
 for i,f in enumerate(d['features']):
  g=geoms[i];source=originals.get(f['id']);sourceparts=parts(source) if source is not None else []
  originalholes=[Polygon(r) for p in sourceparts for r in p.interiors]
  originalislands=[p for p in sourceparts if p.is_valid]
  islands=parts(g);largest=max(p.area for p in islands);kept=[];filled=removed=0
  for p in islands:
   # A valid independent polygon explicitly present upstream is never dust.
   explicit=any(q.covers(p.representative_point()) and q.area<=p.area*1.5 for q in originalislands)
   if p.area<min(.01,largest*.0001) and not explicit:removed+=1;continue
   rings=[]
   for ring in p.interiors:
    hole=Polygon(ring)
    explicit=any(q.is_valid and q.intersection(hole).area>=hole.area*.5 for q in originalholes)
    occupied=False
    if not explicit:
     for j in tree.query(hole):
      other=d['features'][int(j)]
      if int(j)!=i and other['properties']['level']==f['properties']['level'] and geoms[int(j)].intersection(hole).area>hole.area*.1:
       occupied=True;break
    if explicit or occupied:rings.append(ring)
    else:filled+=1
   kept.append(Polygon(p.exterior,rings))
  if filled or removed:
   fixed=unary_union(kept);assert fixed.is_valid and not fixed.is_empty,f['id']
   f['geometry']=mapping(fixed);f['properties']['artifactCleanup']=dict(repairHolesFilled=filled,repairFragmentsRemoved=removed)
   audit.append(dict(file=path.name,id=f['id'],holesFilled=filled,fragmentsRemoved=removed));changed=True
 if changed:path.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8',newline='\n')
(root/'artifact-cleanup-audit.json').write_text(json.dumps(dict(method='Only holes absent from raw rings and unoccupied by peer regions; repair dust under 0.01 square degree and 0.01% of largest component; retain explicit source islands',changes=audit),ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps(dict(features=len(audit),holesFilled=sum(x['holesFilled'] for x in audit),fragmentsRemoved=sum(x['fragmentsRemoved'] for x in audit))))
