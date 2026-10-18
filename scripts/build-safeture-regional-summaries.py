"""Extract public Summary excerpts from exactly the existing Regional snapshot."""
import hashlib, json, pathlib
from html.parser import HTMLParser
root=pathlib.Path(__file__).resolve().parent.parent
raw=(root/'output/safeture/regional-advisory-original.geojson').read_bytes()
geo=json.loads((root/'data/safeture-regional-risk-20261017.geojson').read_text(encoding='utf-8'))
assert hashlib.sha256(raw).hexdigest()==geo['metadata']['sourceSha256'], 'Use the raw source matching the active snapshot'
source=json.loads(raw)
class Text(HTMLParser):
    def __init__(self): super().__init__(convert_charrefs=True); self.parts=[]; self.skip=0
    def handle_starttag(self,tag,attrs):
        if tag in ['script','style']: self.skip+=1
        if tag in ['p','br','li','div'] and not self.skip: self.parts.append('\n')
    def handle_endtag(self,tag):
        if tag in ['script','style'] and self.skip: self.skip-=1
        if tag in ['p','li','div'] and not self.skip: self.parts.append('\n')
    def handle_data(self,text):
        if not self.skip: self.parts.append(text)
    def plain(self): return '\n\n'.join(' '.join(p.split()) for p in ''.join(self.parts).splitlines() if p.strip())
items={}
for f in geo['features']:
    original=source['features'][f['properties']['sourceIndex']]
    assert original['properties']['geomtype']=='regions'
    parser=Text();parser.feed(original['properties'].get('description') or '')
    items[f['id']]=parser.plain()
assert len(items)==110 and all(items.values())
result={'metadata':{'source':geo['metadata']['source'],'sourceSha256':geo['metadata']['sourceSha256'],
 'retrievedAt':geo['metadata']['retrievedAt'],'language':'en','type':'Public original Summary excerpts; HTML stripped, no translation',
 'copyright':'© Riskline / Safeture'},'items':items}
(root/'data/safeture-regional-summaries-20261017.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'summaries':len(items),'maxWords':max(len(t.split()) for t in items.values()),'originalSnapshotMatched':True}))
