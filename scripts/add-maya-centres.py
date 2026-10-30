"""Add six researched Maya centres; never manufacture city boundaries."""
import json
import xml.etree.ElementTree as ET
from pathlib import Path

def read(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def write(p,d): Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

sites=[
 dict(key='tikal',name='蒂卡尔',enName='Tikal',center=[-89.6237,17.2221],country='危地马拉',countryId='gt',start=250,end=900,period='魏晋南北朝',periods=['魏晋南北朝','隋唐'],regime='玛雅蒂卡尔王国',whc=64,url='https://whc.unesco.org/en/list/64/',note='玛雅低地重要政治、经济与军事中心。250—900年为本目录采用的古典期范围，不是聚落全部存在时间；此前已有聚落。仅以遗址核心附近参照点定位；57600公顷国家公园不是古城范围。完整考古城区界线待核。'),
 dict(key='calakmul',name='卡拉克穆尔',enName='Calakmul',center=[-89.8108,18.1053],country='墨西哥',countryId='mx',start=600,end=900,period='隋唐',periods=['隋唐'],regime='玛雅卡恩王朝（卡拉克穆尔阶段）',whc=1061,url='https://whc.unesco.org/en/list/1061/',note='晚古典期卡恩（蛇）王朝的重要王都。600—900年为约略阶段，不等于该王朝全部年代或城市初建时间；卡恩王朝较早阶段不一概定位于此。接入的是OSM考古遗址现状范围，不是卡拉克穆尔生物圈保护区或扩展世界遗产的热带森林范围。'),
 dict(key='copan',name='科潘',enName='Copán',center=[-89.141,14.84],country='洪都拉斯',countryId='hn',start=427,end=900,period='魏晋南北朝',periods=['魏晋南北朝','隋唐'],regime='玛雅科潘王国',whc=129,url='https://whc.unesco.org/en/list/129/',note='科潘谷地政治与宗教中心；UNESCO记载427年开创的王朝延续16位统治者。目录末年约900表示古典期城市衰落阶段，不是最后一位君主的精确在位终年。遗址区现状边界不是完整城墙。'),
 dict(key='uxmal',name='乌斯马尔',enName='Uxmal',center=[-89.7714,20.3599],country='墨西哥',countryId='mx',start=700,end=1000,period='隋唐',periods=['隋唐','五代十国','宋辽金西夏'],regime='玛雅乌斯马尔地区政治中心',whc=791,url='https://whc.unesco.org/en/list/791/',note='普克地区政治与行政中心。约700—1000年是主要建筑与城市发展阶段；不把后世传统中的创建日期当作精确建城年。此处不推定一个疆界固定的统一玛雅国家。现状遗址区不等于完整古城墙。'),
 dict(key='caracol',name='卡拉科尔',enName='Caracol',center=[-89.1176,16.7639],country='伯利兹',countryId='bz',start=331,end=900,period='魏晋南北朝',periods=['魏晋南北朝','隋唐'],regime='玛雅卡拉科尔王国',url='https://ticketing.nichbelize.org/ia-sites/caracol/',research='https://caracol.org/wp-content/uploads/2022/07/Chase-et-al-2022.pdf',note='伯利兹重要玛雅城邦中心，与奇琴伊察的同名“卡拉科尔”天文台分开。研究记载王朝始于331年，约900为城市衰落的阶段参考，不是精确亡国年。定位点在遗址核心附近，未获得可靠完整矢量城界；未用保护区面积、圆形缓冲区或矩形代替城区。'),
 dict(key='yaxchilan',name='亚斯奇兰',enName='Yaxchilán',center=[-90.966,16.8989],country='墨西哥',countryId='mx',start=350,end=850,period='魏晋南北朝',periods=['魏晋南北朝','隋唐'],regime='玛雅亚斯奇兰王国',url='https://lugares.inah.gob.mx/en/node/4367',note='乌苏马辛塔河沿岸城邦。INAH将其王朝记述置于4—9世纪，兴盛期约600—800年；350—850仅为世纪范围的目录近似，不是精确建国或灭亡年份。早期王表含追述和合法性建构的可能，不将其全部视为同时代证据。现状考古遗址区不是城邦疆域。'),
]
selected={
 'calakmul': [('way','27138148','卡拉克穆尔遗址区范围','Calakmul archaeological site','area'),('way','55607908','一号建筑','Structure I','temple'),('way','90913058','二号建筑','Structure II','temple'),('way','55607915','大卫城（二十号建筑）','Great Acropolis (Structure XX)','palace')],
 'copan':[('relation','16113095','科潘遗址区范围','Copán archaeological site','area'),('node','3878873480','象形文字阶梯','Hieroglyphic Stairway','monument'),('way','386184309','四号建筑','Structure 4','temple')],
 'uxmal':[('way','26645969','乌斯马尔遗址区范围','Uxmal archaeological site','area'),('way','161288116','总督宫','Governor’s Palace','palace'),('way','161288117','魔术师金字塔','Pyramid of the Magician','temple'),('way','161288111','大金字塔','Great Pyramid','temple'),('way','161288104','海龟宫','House of the Turtles','palace')],
 'yaxchilan':[('way','54176813','亚斯奇兰遗址区范围','Yaxchilán archaeological site','area'),('way','333075389','三十三号建筑','Building 33','temple'),('way','333872614','迷宫（十九号建筑）','Labyrinth (Building 19)','palace'),('way','333077795','球场（十四号建筑）','Ballcourt (Building 14)','monument')],
}
features=[]
for s in sites:
 sourcefile=Path('output/maya')/(s['key']+'.osm')
 if not sourcefile.exists(): continue
 root=ET.parse(sourcefile).getroot()
 nodes={e.get('id'):[float(e.get('lon')),float(e.get('lat'))] for e in root.findall('node')}
 elements={(e.tag,e.get('id')):e for e in root}
 def way_coords(id): return [nodes[n.get('ref')] for n in elements[('way',id)].findall('nd')]
 for kind,id,zh,en,role in selected.get(s['key'],[]):
  el=elements[(kind,id)]
  if kind=='node': geom=dict(type='Point',coordinates=nodes[id])
  elif kind=='way':
   coords=way_coords(id)
   geom=dict(type='Polygon',coordinates=[coords]) if coords[0]==coords[-1] else dict(type='LineString',coordinates=coords)
  else:
   parts=[way_coords(m.get('ref')) for m in el.findall('member') if m.get('type')=='way' and m.get('role')=='outer']
   rings=[]
   while parts:
    ring=parts.pop(0)
    while ring[0]!=ring[-1]:
     for i,p in enumerate(parts):
      if p[0]==ring[-1]:ring+=p[1:];parts.pop(i);break
      if p[-1]==ring[-1]:ring+=list(reversed(p))[1:];parts.pop(i);break
     else: raise ValueError('Incomplete relation; do not close an open boundary')
    rings.append(ring)
   geom=dict(type='Polygon',coordinates=[rings[0]]) if len(rings)==1 else dict(type='MultiPolygon',coordinates=[[r] for r in rings])
  features.append(dict(type='Feature',geometry=geom,properties=dict(id=f"maya-{s['key']}-{kind}-{id}",siteKey=s['key'],siteName=s['name'],siteEnName=s['enName'],name=zh,enName=en,role=role,period=s['period'],wallPeriods=s['periods'],periodLabel='玛雅古典期／末古典期遗存；中国年代仅作对照',sourceUrl=f'https://www.openstreetmap.org/{kind}/{id}',referenceUrl=s['url'],label=role!='area',boundaryLabel=False,includeInDetails=True,lineWidth=1.1,note='OSM现状遗址或建筑标绘，未移动原始坐标；保留原始边界与孔洞，不表示某一期完整城墙、城邦疆界或世界遗产法定边界。建筑后期修复不单独反推建造年份。',attribution='© OpenStreetMap contributors · ODbL')))

catalog=read('data/classical-sites/catalog.json');geo=read('data/classical-sites/sites.geojson');cap=read('data/china-ancient-capitals.json')
keys={s['key'] for s in sites}
catalog['sites']=[s for s in catalog['sites'] if s['key'] not in keys]
geo['features']=[f for f in geo['features'] if f['properties']['siteKey'] not in keys]+features
cap['items']=[s for s in cap['items'] if s.get('classicalSiteKey') not in keys]
cap['recordItems']=[s for s in cap['recordItems'] if s.get('classicalSiteKey') not in keys]
for s in sites:
 fs=[f for f in features if f['properties']['siteKey']==s['key']]
 audit=dict(featureCount=len(fs),areaCount=sum(f['properties']['role']=='area' for f in fs),wallCount=0,palaceCount=sum(f['properties']['role']=='palace' for f in fs),openWallCount=0,status='已接入现状遗址区与主要遗迹；完整分期城界待核。' if fs else '仅有遗址核心附近定位参考点；完整考古城区矢量待核，未绘制推测边框。')
 sitekey='ancient-site:world-'+s['key'];year=f"约{s['start']}—{s['end']}年";order=max(x.get('sourceOrder',0) for x in cap['items'])+1
 sources=[dict(title='历史身份与遗址资料',url=s['url'])]
 if s.get('research'):sources.append(dict(title='卡拉科尔考古研究',url=s['research']))
 precision='遗址核心附近定位参照点，不表示精确建筑中心、完整城区或保护区几何中心。'
 rec={'时代':s['period'],'政权/国号':s['regime'],'政权年代（原文）':year,'都城性质':'玛雅城邦／地区政治中心','都城年代（原文）':year,'古称':s['name'],'今称/遗址名':s['name'],'今属行政区':s['country'],'置信度':'中','备注/争议':s['note'],'来源URL':s['url'],'都城类别码':'P','sourceOrder':order}
 item=dict(siteKey=sitekey,currentKey=sitekey,currentPlace=s['name'],name=s['name'],enName=s['enName'],lat=s['center'][1],lng=s['center'][0],admin=s['country'],country=s['country'],countryId=s['countryId'],confidence='中',sourceOrder=order,siteNames=[s['name'],s['enName']],ancientNames=[s['name']],aliases=[s['name'],s['enName']],dynasties=[s['regime']],eras=s['periods'],capitalPeriods=s['periods'],mapReferencePeriod=s['period'],capitalTypes=['玛雅城邦／地区政治中心'],categoryCodes=['P'],categoryLabels=['主要都城'],records=[rec],recordCount=1,sourceEra=s['period'],sourceSite=s['name'],sourceAncientName=s['name'],classicalSiteKey=s['key'],hoverIdentity=s['regime'],enHoverIdentity='Maya city-state / regional political centre',coordinatePrecision=precision,historicalSources=sources,boundaryAudit=audit)
 cap['items'].append(item)
 cap['recordItems'].append({**item,'records':[],'name':s['name']+' · '+s['regime'],'siteName':s['name'],'ancientName':s['name'],'parentName':s['name'],'dynasty':s['regime'],'era':s['period'],'capitalType':'玛雅城邦／地区政治中心','capitalYears':year,'regimeYears':year,'categoryCode':'P','sourceUrl':s['url'],'note':s['note']})
 bbox=[s['center'][0]-.012,s['center'][1]-.012,s['center'][0]+.012,s['center'][1]+.012]
 catalog['sites'].append(dict(key=s['key'],name=s['name'],enName=s['enName'],center=s['center'],date=s['start'],period=s['period'],capitalPeriods=s['periods'],urbanPeriods=s['periods'],regime=s['regime'],start=s['start'],end=s['end'],bbox=bbox,referenceUrl=s['url'],sourceUrl=s['url'],periodLabel=s['regime']+'；'+year+'（阶段参考）',tentative=False,capitalSiteKey=sitekey,historicalIdentity='capital',identityLabel='玛雅城邦／地区政治中心',identityEnLabel='Maya city-state / regional political centre',identityNote=s['note'],identityEnNote='Political centre and archaeological site. Dates are approximate phases, not exact foundation or abandonment years. Current site precincts are not complete ancient city walls or protected-area boundaries.',identitySourceUrl=s['url'],boundaryAudit=audit,**({'whc':s['whc'],'heritageId':'whc-'+str(s['whc'])} if s.get('whc') else {})))
 catalog['counts'][s['key']]=len(fs)
heritage_aliases={'tikal':['蒂卡尔国家公园','Tikal National Park'],'calakmul':['卡拉克穆尔古玛雅城和热带保护林','Ancient Maya City and Protected Tropical Forests of Calakmul, Campeche'],'copan':['科潘玛雅古迹遗址','Maya Site of Copan'],'uxmal':['乌斯马尔古镇','Pre-Hispanic Town of Uxmal']}
for site in catalog['sites']:
 if site['key'] in heritage_aliases:site['aliases']=heritage_aliases[site['key']]
cap['siteCount']=len(cap['items']);cap['recordItemCount']=len(cap['recordItems']);cap['recordCount']=sum(i.get('recordCount',len(i.get('records',[]))) for i in cap['items'])
supplements=cap.setdefault('coverageAudit',{}).setdefault('supplements',[])
supplements[:]=[s for s in supplements if s.get('report')!='docs/maya-centres.json']
supplements.append(dict(date='2026-10-27',addedSites=6,addedRecords=6,scope='玛雅主要城邦与地区政治中心；非穷尽目录',report='docs/maya-centres.json'))
write('data/classical-sites/catalog.json',catalog);write('data/classical-sites/sites.geojson',geo);write('data/china-ancient-capitals.json',cap)
write('data/maya-centres.geojson',dict(type='FeatureCollection',features=features))
write('docs/maya-centres.json',dict(reviewedAt='2026-10-27',scope='Six major Maya centres; not all Maya city-states',sites=sites,featureCount=len(features),geometryNote='Original OSM geometry for four sites. Tikal and Caracol have reference roots only. No invented bounds; bbox fields are focus windows, never rendered boundaries.'))
print(json.dumps(dict(sites=len(catalog['sites']),features=len(geo['features']),addedFeatures=len(features),capitalSites=cap['siteCount'],records=cap['recordCount'])))
