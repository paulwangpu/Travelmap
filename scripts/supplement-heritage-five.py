"""Five requested groups: source-qualified cities, royal burials and fortifications.

Raw OSM objects are retained; no synthetic closed city walls are generated.
"""
import ast, hashlib, json, copy, xml.etree.ElementTree as ET
from pathlib import Path
BASE=Path('output/heritage-five'); AUDIT='heritage-five-20261029'
FILES=['data/classical-sites/catalog.json','data/classical-sites/sites.geojson','data/china-ancient-capitals.json','data/imperial-tombs/catalog.json','data/imperial-tombs/geometry.geojson']
original={p:hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in FILES}
def read(p): return json.loads(Path(p).read_text(encoding='utf8'))
def write(p,d): Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
previous=Path('scripts/supplement-five-regions.py').read_text(encoding='utf8')
for node in ast.parse(previous).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['osm','source','feature','city','tomb']:
  code=ast.get_source_segment(previous,node).replace('five-','expansion-').replace('2026-10-28','2026-10-29')
  exec(compile(code,'<qualified-historical-helper>','exec'))
catalog,geo,cap,t,tg=[read(p) for p in FILES]
for d,key in [(catalog,'sites'),(geo,'features'),(cap,'items'),(cap,'recordItems'),(t,'items'),(t,'sources'),(tg,'features')]:
 d[key]=[x for x in d[key] if x.get('supplementAudit',x.get('properties',{}).get('supplementAudit'))!=AUDIT]
added_cities=[];added_tombs=[];added_details=[]
SOURCES={
 'napata':('UNESCO：巴尔卡尔山与纳帕塔地区遗址','https://whc.unesco.org/en/list/1073/'),
 'napata-maps':('UNESCO：纳帕塔地区各组成部分官方坐标与地图','https://whc.unesco.org/en/list/1073/maps/'),
 'kurru':('密歇根大学凯尔西考古博物馆：库鲁王室墓地','https://lsa.umich.edu/kelsey/research/current-field-projects/el-kurru--sudan.html'),
 'nuri':('努里考古项目：王室墓地','https://archaeology.lipscomb.edu/excavations/nuri-archaeological-expedition/nuri-necropolis'),
 'meroe':('UNESCO：麦罗埃王城与库施遗址','https://whc.unesco.org/en/list/1336/'),
 'meroe-maps':('UNESCO：麦罗埃组成部分官方坐标与地图','https://whc.unesco.org/en/list/1336/maps/'),
 'nisa':('UNESCO：尼萨帕提亚堡垒','https://whc.unesco.org/en/list/1242/'),
 'nisa-maps':('UNESCO：老尼萨与新尼萨分项地图','https://whc.unesco.org/en/list/1242/maps/'),
 'sigiriya':('斯里兰卡中央文化基金：锡吉里耶王宫、宫苑与城防','https://ccf.gov.lk/heritage-sites/sigiriya-rock-fortress/'),
 'sigiriya-whc':('UNESCO：锡吉里耶古城及477—495年都城阶段','https://whc.unesco.org/en/list/202/'),
 'qutb':('UNESCO预备名单：戈尔康达与库特布沙希王陵','https://whc.unesco.org/en/tentativelists/5573/'),
 'qutb-asi':('印度考古调查局历史出版物：库特布沙希陵墓','https://ignca.gov.in/Asi_data/1204.pdf'),
 'gol':('比贾布尔地区政府：穆罕默德阿迪尔沙陵','https://vijayapura.nic.in/en/tourist-place/gol-gumbaz/'),
 'ibrahim':('比贾布尔地区政府：易卜拉欣陵园','https://vijayapura.nic.in/en/tourist-place/ibrahim-rouza/'),
 'bahmani':('卡纳塔克旅游局：阿什图尔巴赫曼尼王陵','https://karnatakatourism.org/en/destinations/ashtoor'),
 'ahmad':('德干遗产基金会：艾哈迈德沙一世陵数字记录','https://www.deccan-heritage-foundation.org/restoration-projects/digitally-preserving-the-ahmed-shah-wali-tomb-bahmani-tombs-bidar/'),
 'bidar':('比达尔地区政府：王陵与历史建筑','https://bidar.nic.in/en/adventures/'),
 'herat':('UNESCO预备名单：赫拉特与伊赫蒂亚鲁丁城堡','https://whc.unesco.org/en/tentativelists/1927/'),
 'herat-restoration':('阿迦汗文化信托：赫拉特城堡修复','https://prod.the.akdn/en/where-we-work/central-asia/afghanistan/cultural-development-overview-afghanistan/restoration-in-herat-afghanistan'),
 'balkh':('UNESCO预备名单：巴尔赫城墙与巴拉希萨尔','https://whc.unesco.org/en/tentativelists/1928/'),
 'ctesiphon':('大都会艺术博物馆：泰西封宫殿发掘','https://www.metmuseum.org/de/essays/the-metropolitan-museums-excavations-at-ctesiphon'),
 'sirkap':('巴基斯坦考古博物馆局：锡尔卡普城址与城墙','https://doam.gov.pk/public/sites/9756'),
 'sirsukh':('巴基斯坦考古博物馆局：锡尔苏克城址与城墙','https://doam.gov.pk/public/sites/858'),
 'taxila':('塔克西拉博物馆：三期城址与出土文物','https://taxilamuseum.punjab.gov.pk/node/81'),
 'kunala':('巴基斯坦考古博物馆局：鸠那罗佛塔与寺院','https://doam.gov.pk/public/sites/10362'),
}
def nom(file,index=0):
 d=read(BASE/(file+'.json'))[index]
 assert d['category'] not in ['shop','highway','place'],(file,d['category'])
 return dict(geometry=d['geojson'],center=[float(d['lon']),float(d['lat'])],url=f"https://www.openstreetmap.org/{d['osm_type']}/{d['osm_id']}",originalName=d['name'])
def point(coords,url): return dict(geometry=dict(type='Point',coordinates=coords),center=coords,url=url)
def raw(file,id): return osm(file,'way',id)
def add(site,name,en,shape,period,ref,role='area',note=''):
 before=len(geo['features']);feature(site,name,en,shape,period,ref,role,note)
 if len(geo['features'])>before:
  p=geo['features'][-1]['properties'];p.update(relicState='mapped' if shape['geometry']['type']!='Point' else 'unverified',geometryKind='reference' if shape['geometry']['type']=='Point' else 'precinct')
  p['enNote']='Public mapped geometry or regional reference, not a surveyed complete city wall or a legal protection boundary. See the linked institutional source for historical identity.'
 return geo['features'][-1]
def walls(site,file,ids,period,ref,name,en):
 existing={url for f in geo['features'] if f['properties'].get('siteKey')==site for url in f['properties'].get('sourceUrls',[f['properties'].get('sourceUrl')])}
 ids=[id for id in ids if f'https://www.openstreetmap.org/way/{id}' not in existing]
 if not ids:return
 parts=[raw(file,id) for id in ids]
 # Keep each original way intact, including its genuine gaps.
 lines=[]
 for p in parts:
  g=p['geometry'];lines.append(g['coordinates'][0] if g['type']=='Polygon' else g['coordinates'])
 shape=dict(geometry=dict(type='MultiLineString',coordinates=lines),center=parts[0]['center'],url=parts[0]['url'])
 f=add(site,name,en,shape,period,ref,'wall','原始墙线逐段保留，不连接端点或人为闭合；不代表全周墙体均保存或同一时代修建。')
 f['properties']['sourceWays']=[p['url'] for p in parts]

# 1. Kush: royal urban centres and cemeteries remain independent places.
napata=[31+49/60+40.9/3600,18+32/60+13.2/3600]
city('napata','纳帕塔（巴尔卡尔山）','Napata / Gebel Barkal','苏丹','sd',napata,'库施王国纳帕塔政治与宗教中心',-800,-300,['周','秦汉'],'napata','约前8—前4世纪代表阶段；纳帕塔是分散的城市、祭祀与王陵景观，坐标取巴尔卡尔山遗产分项，非整座古城中心或边界。',1073)
add('napata','巴尔卡尔山纳帕塔核心区（官方分项参照）','Gebel Barkal, Napatan core reference',point(napata,SOURCES['napata-maps'][1]),'周','napata','area','官方遗产分项区域坐标；未以山体、现代卡里马市界或整个保护区代替纳帕塔城界。')
meroe=raw(BASE/'meroe-city.osm',438303994)
city('meroe','麦罗埃（梅罗埃）','Meroë','苏丹','sd',meroe['center'],'库施王国麦罗埃王城',-300,350,['周','秦汉','魏晋南北朝'],'meroe','约前3世纪至公元4世纪代表阶段；城市更早已存在。尼罗河旁王城与东侧王室墓地分开，不以遗产保护区作为城市围墙。',1336)
add('meroe','麦罗埃王城考古标绘区','Meroë Royal City mapped precinct',meroe,'秦汉','meroe','palace','公开王城考古区轮廓，非整座麦罗埃都市范围，也不是单栋王宫或法定保护区。')
add('meroe','麦罗埃阿蒙神庙遗址','Amun temple, Meroë',raw(BASE/'meroe-city.osm',804413231),'秦汉','meroe','public','独立神庙遗址标绘，与王城围区及东侧金字塔墓地分开。')
for id,name,en,year,ref,shape,coords in [
 ('kurru','库鲁库施王陵群','El-Kurru royal cemetery',-700,'kurru',None,[31+46/60+17/3600,18+24/60+36/3600]),
 ('nuri','努里库施王陵群','Nuri royal cemetery',-600,'nuri',None,[31+55/60,18+33/60+50/3600]),
 ('meroe-pyramids','麦罗埃东部王室金字塔墓地','Meroë eastern royal pyramid cemeteries',-100,'meroe',nom('meroe-pyramids'),None)]:
  x=tomb(id,name,en,'苏丹','Sudan','周' if year<-221 else '秦汉','库施王国',[],year,ref,shape=shape,point=coords,group=True,recognition='archaeological',evidence='机构考古资料确认的库施王室墓地；陵群不等于所有金字塔均已确认具体墓主。努里、库鲁使用官方遗产分项参考坐标。')
  if not shape:
   gs=next(s for s in t['sources'] if s['id']==x['coordinates']['sourceId']);gs['url']=SOURCES['napata-maps'][1]
   x['coordinates']['original']=f"{coords[1]}, {coords[0]}; "+SOURCES['napata-maps'][1]
   x['coordinates']['target']='官方遗产分项区域参考；非具体金字塔或墓室中心'
  x['enDynasty']='Kingdom of Kush'

# 2. Old and New Nisa are two distinct components, not one merged polygon.
for key,name,en,shape,start,end,note in [
 ('old-nisa','老尼萨','Old Nisa',nom('old-nisa'),-250,100,'约前3世纪起的帕提亚早期王室堡垒与礼仪中心代表阶段；并非整个帝国一直唯一的行政首都。原始标绘外缘不自动等于官方35.234公顷遗产边界。'),
 ('new-nisa','新尼萨','New Nisa',point([58+11/60+54.99/3600,37+57/60+59/3600],SOURCES['nisa-maps'][1]),-250,300,'约前3世纪起的帕提亚城市代表阶段，和老尼萨王室堡垒分开；官方坐标只作区域定位，完整城垣轮廓尚未取得可靠矢量。')]:
 city(key,name,en,'土库曼斯坦','tm',shape['center'],'帕提亚尼萨王室与城市中心',start,end,['周','秦汉','魏晋南北朝'],'nisa',note,1242)
 add(key,name+('王室堡垒标绘范围' if key=='old-nisa' else '城址官方定位'),en+(' royal fortress mapped precinct' if key=='old-nisa' else ' official component reference'),shape,'秦汉','nisa','area',note)

# 3. Deccan: do not misidentify the ticket office or a mosque as a ruler's tomb.
cache=Path('output/five-country-capitals')
qgroup=tomb('qutb','库特布沙希王陵群','Qutb Shahi royal tombs','印度','India','明','库特布沙希王朝',[],1600,'qutb',shape=raw(cache/'golconda.xml',253509394),group=True,evidence='王朝王室墓园；UNESCO页面为预备名单，不能当作正式世界遗产。陵园中同时有宗教、辅助建筑及其他家族成员墓。')
qtombs=[('quli','苏丹库利库特布沙陵','Tomb of Sultan Quli Qutb Shah',933350840,1543),('jamsheed','贾姆希德库利库特布沙陵','Tomb of Jamsheed Quli Qutb Shah',933350842,1550),('ibrahim-quli','易卜拉欣库利库特布沙陵','Tomb of Ibrahim Quli Qutb Shah',356420864,1580),('muhammad-quli','穆罕默德库利库特布沙陵','Tomb of Muhammad Quli Qutb Shah',933350838,1612),('sultan-muhammad','苏丹穆罕默德库特布沙陵','Tomb of Sultan Muhammad Qutb Shah',933350843,1626),('abdullah','阿卜杜拉库特布沙陵','Tomb of Abdullah Qutb Shah',253509403,1672)]
for id,name,en,way,year in qtombs:
 tomb(id,name,en,'印度','India','清' if year>=1644 else '明','库特布沙希王朝',[name.removesuffix('陵')],year,'qutb-asi',shape=raw(cache/'golconda.xml',way),parent='qutb',evidence='历史考古出版物与具名陵墓实体交叉核对；未将售票处当王陵。末代阿布哈桑在道拉塔巴德去世，园内同名标绘未当作其确证实葬墓接入。')
for id,name,en,shape,year,ref,occ in [
 ('gol-gumbaz','戈尔贡巴兹（穆罕默德阿迪尔沙陵）','Gol Gumbaz, tomb of Muhammad Adil Shah',nom('gol-gumbaz'),1656,'gol','穆罕默德阿迪尔沙'),
 ('ibrahim-rauza','易卜拉欣阿迪尔沙二世陵园','Ibrahim Rauza',raw(cache/'bijapur.xml',575037411),1627,'ibrahim','易卜拉欣阿迪尔沙二世')]:
  tomb(id,name,en,'印度','India','清' if year>=1644 else '明','阿迪尔沙希王朝',[occ],year,ref,shape=shape,evidence='地方政府文化遗产资料与公开实体对应；几何表示包含附属建筑的陵园区域，不是单一墓室或主体陵墓轮廓。')
tomb('bahmani','阿什图尔巴赫曼尼王陵群','Bahmani royal tombs, Ashtur','印度','India','明','巴赫曼尼王朝',[],1450,'bahmani',shape=nom('bahmani'),group=True,evidence='机构记录的巴赫曼尼统治者王陵区；约12座陵墓不等于12位已确认君主的独立坐标。')
for id,name,en,way,year,ref in [('ahmad-wali','艾哈迈德沙一世瓦利陵','Tomb of Ahmad Shah I Wali',1359591621,1436,'ahmad'),('alauddin-bahmani','阿拉丁沙二世陵','Tomb of Ala-ud-Din Ahmad Shah II',1359591620,1458,'bidar')]:
 tomb(id,name,en,'印度','India','明','巴赫曼尼王朝',[name.removesuffix('陵')],year,ref,shape=raw(cache/'bidar.xml',way),parent='bahmani',evidence='机构具名陵墓记录与原始建筑轮廓对应；不把整个陵区复制为单墓边界。')

# 4. Sigiriya: archaeological core, rock reference and surviving moat segments.
sig=raw(BASE/'sigiriya.osm',217591865)
city('sigiriya','锡吉里耶（狮子岩）','Sigiriya','斯里兰卡','lk',sig['center'],'迦叶波一世王都',477,495,['魏晋南北朝'],'sigiriya-whc','477—495年都城阶段，之后转为寺院等用途。公开核心区只覆盖部分宫苑，不把整片岩体当王宫建筑或以遗产保护区当完整古城。',202)
add('sigiriya','锡吉里耶宫苑考古核心区','Sigiriya mapped palace-garden core',sig,'魏晋南北朝','sigiriya','area','原始OSM核心区标绘，不覆盖全部约70公顷城防布局；核心区边缘不作为完整古城墙。')
rock=raw(BASE/'sigiriya.osm',23810659)
add('sigiriya','狮子岩山顶王宫区参照','Summit palace area reference, Lion Rock',point(rock['center'],rock['url']),'魏晋南北朝','sigiriya','palace','取狮子岩岩体区域代表点，仅指示山顶王宫所在区域，不把岩体多边形作为王宫建筑平面或遗址实测边界。')
parts=[raw(BASE/'sigiriya.osm',id) for id in [191390684,191390687,191390689,267840101]]
shape=dict(geometry=dict(type='MultiPolygon',coordinates=[s['geometry']['coordinates'] for s in parts]),url=parts[0]['url'],center=parts[0]['center'])
f=add('sigiriya','锡吉里耶护城河现状标绘段','Sigiriya mapped moat segments',shape,'魏晋南北朝','sigiriya','water','保留四段原始护城河水面，不沿水面补画城墙，也不将四段拼为完整闭合环。');f['properties']['sourceWays']=[s['url']for s in parts]

# 5. Existing thin sites: major remains, accurate scope and original lines.
add('herat','赫拉特伊赫蒂亚鲁丁城堡','Qala Ikhtyaruddin, Herat Citadel',nom('herat-citadel'),'明','herat','palace','多期营建并经过现代保护修复的城堡，当前轮廓不能全部断为亚历山大时代原构；与赫拉特全城界分开。')
add('balkh','巴尔赫巴拉希萨尔堡垒区','Bala Hissar fortified precinct, Balkh',nom('balkh-fort'),'秦汉','balkh','area','巴尔赫北侧独立堡垒区公开标绘；与约11平方公里古城和约10公里城墙遗迹分开，非全城边界。')
walls('balkh',BASE/'balkh.osm',[240796020,240796029,240796030,240796031],'秦汉','balkh','巴尔赫北部现存城墙标绘段','Balkh northern mapped wall segments')
add('ctesiphon','塔克基斯拉宫殿拱厅遗存','Taq-i Kisra palace iwan remains',raw(cache/'ctesiphon.xml',586125675),'魏晋南北朝','ctesiphon','palace','现存宫殿拱厅及紧邻建筑遗迹轮廓，不代表泰西封复合都市整体或完整宫区；不虚构整城闭合墙线。')
add('taxila-sirkap','鸠那罗佛塔与寺院遗址','Kunala stupa and monastery',raw(cache/'taxila-sirkap.xml',495843821),'秦汉','kunala','public','锡尔卡普南侧山脊的独立宗教遗址，保留定位与范围，不把佛塔围区当全城墙。')
taxilaNotes={
 'taxila-bhir':('taxila','比尔丘为较早城址；现有面为公开考古／保护标绘区，不是完整城墙。三期城址保持独立。'),
 'taxila-sirkap':('sirkap','机构记载城墙约5.5公里，现有面主要覆盖发掘区，不能代替整座有城墙的古城。完整墙线尚待原始测绘图校准。'),
 'taxila-sirsukh':('sirsukh','机构记载城址约1372×920米，南、东城垣较清楚，北、西多已消失。现有标绘只覆盖部分遗存，未按尺寸生成推测矩形。')}
updated_sites=['golconda','hyderabad','bijapur','bidar','herat','balkh','ctesiphon',*taxilaNotes]
for key,(ref,note) in taxilaNotes.items():
 s=next(s for s in catalog['sites'] if s['key']==key)
 s['extentReview']=dict(reviewedAt='2026-10-29',note=note,sourceUrl=SOURCES[ref][1],completeCityBoundary=False)
 for f in geo['features']:
  if f['properties']['siteKey']==key and f['properties'].get('supplementAudit')!=AUDIT:
   p=f['properties'];p['extentReviewNote']=note;p['referenceUrl']=SOURCES[ref][1]
   if note not in p.get('note',''):p['note']=p.get('note','')+' '+note
 for x in cap['items']+cap['recordItems']:
  if x.get('classicalSiteKey')==key:
   refs=x.setdefault('historicalSources',[])
   if not any(r.get('url')==SOURCES[ref][1]for r in refs):refs.append(dict(title=SOURCES[ref][0],url=SOURCES[ref][1]))
 # Original catalogue anchors were well outside parts of the mapped sites.
 shape=nom({'taxila-bhir':'sirkap','taxila-sirkap':'sirkap','taxila-sirsukh':'sirsukh'}[key]) if key!='taxila-bhir' else None
 if shape:
  s['center']=shape['center']
  for x in cap['items']+cap['recordItems']:
   if x.get('classicalSiteKey')==key:x['lng'],x['lat']=shape['center'];x['coordinatePrecision']='公开城址标绘的区域代表点参考；不表示精确宫殿、城门或完整城界中心。'

# Related-place navigation stays independent of visits and layer ownership.
links={'napata':['kurru','nuri'],'meroe':['meroe-pyramids'],'golconda':['qutb'],'hyderabad':['qutb'],'bijapur':['gol-gumbaz','ibrahim-rauza'],'bidar':['bahmani']}
for s in catalog['sites']:
 if 'relatedTombs'in s:s['relatedTombs']=[x for x in s['relatedTombs'] if not x['id'].startswith('expansion-') or any(y['id']==x['id']for y in t['items'])]
 if s['key'] in links:
  ids={'expansion-'+id for id in links[s['key']]};old=s.setdefault('relatedTombs',[])
  old[:]=[x for x in old if x['id'] not in ids]+[dict(id=x['id'],name=x['name'],enName=x['enName'])for x in t['items']if x['id']in ids]
 fs=[f for f in geo['features']if f['properties']['siteKey']==s['key']];catalog['counts'][s['key']]=len(fs)
 if s['key']in added_cities+updated_sites:
  audit=dict(featureCount=len(fs),areaCount=sum(f['properties']['role']=='area'for f in fs),wallCount=sum(f['properties']['role']=='wall'for f in fs),palaceCount=sum(f['properties']['role']=='palace'for f in fs),status='逐项区分现状范围、原始开放墙段与区域定位；完整古城界未全部核定。')
  s['boundaryAudit']=audit
  for x in cap['items']+cap['recordItems']:
   if x.get('classicalSiteKey')==s['key']:x['boundaryAudit']=audit
for x in cap['items']+cap['recordItems']:
 if x.get('supplementAudit')==AUDIT:x['enHoverIdentity']='Historical capital / royal centre: '+x['enName']
catalog['reviewedAt']='2026-10-29'
for x in t['items']:
 if x.get('supplementAudit')==AUDIT:
  x.setdefault('relicState','mapped' if x['coordinates']['sourceDatumExplicit'] else 'unverified')
  x['geometryKind']='building' if x.get('parentId') else 'precinct'
  x['enDynasty']={'库特布沙希王朝':'Qutb Shahi dynasty','阿迪尔沙希王朝':'Adil Shahi dynasty','巴赫曼尼王朝':'Bahmani dynasty','库施王国':'Kingdom of Kush'}.get(x['dynasty'],x['dynasty'])
for f in tg['features']:
 if f['properties'].get('supplementAudit')==AUDIT:
  x=next(x for x in t['items']if x['id']==f['properties']['tombId']);f['properties'].update(geometryKind=x['geometryKind'],relicState='mapped',note='原始公开'+('陵墓建筑' if x['geometryKind']=='building'else '陵园／考古区')+'范围及孔洞；不是地下墓室、完整古代陵域或法定保护界。')
cap['siteCount']=len(cap['items']);cap['recordItemCount']=len(cap['recordItems']);cap['recordCount']=sum(x.get('recordCount',len(x.get('records',[])))for x in cap['items'])
t['totalRecords']=len(t['items']);t['mapCandidateIds']=[x['id']for x in t['items']if x.get('mapEligible')];t['summary']={}
for x in t['items']:
 a=t['summary'].setdefault(x['era'],dict(records=0,singles=0,groups=0,mapCandidates=0,sourcePointsPendingDatum=0,missingCoordinates=0));a['records']+=1;a['singles']+=x['recordType']=='single';a['groups']+=x['recordType']=='group';a['mapCandidates']+=bool(x.get('mapEligible'));a['sourcePointsPendingDatum']+=bool(x.get('coordinates')and x['coordinates']['status']=='datum_pending');a['missingCoordinates']+=not bool(x.get('coordinates'))
t['researchedAt']='2026-10-29'
report=dict(date='2026-10-29',addedCities=added_cities,updatedSites=updated_sites,addedTombs=added_tombs,addedCityFeatures=added_details,tombShapes=sum(f['properties'].get('supplementAudit')==AUDIT for f in tg['features']),sources=[dict(title=v[0],url=v[1])for v in SOURCES.values()],pending=['纳帕塔为分散遗址景观，完整城界未核；库鲁、努里仍为官方陵区参考点。','新尼萨完整城垣矢量未取得，使用独立官方坐标，不套用老尼萨边界。','锡吉里耶现有核心面不覆盖全部约70公顷布局，未把岩体或护城河当作全城墙。','泰西封完整都市与塔克基斯拉宫区尚待原始测绘；未拼造闭合城界。','塔克西拉保留三期城址，完善机构记载与关键遗迹；锡尔卡普完整约5.5公里城墙、锡尔苏克消失的北西墙线未作假补。'],rejected=['尼萨同名便利店、体育场和街道','纳帕塔山峰点替代王宫或城界','库特布沙希陵园售票点替代墓地','同名阿布哈桑墓作为已确认的末代苏丹实葬','易卜拉欣陵园清真寺点代替陵墓','狮子岩岩体边界作为山顶王宫建筑轮廓'])
for p in FILES:assert hashlib.sha256(Path(p).read_bytes()).hexdigest()==original[p],p+' changed concurrently'
for p,d in zip(FILES,[catalog,geo,cap,t,tg]):write(p,d)
write('docs/heritage-five-supplement.json',report)
# Append only this supplement's audit sections, preserving every other review.
for filename,kind in [('data/imperial-tombs/README.md','table'),('data/imperial-tombs/review.md','review')]:
 p=Path(filename);s=p.read_text(encoding='utf8');begin='<!-- heritage-five-20261029:start -->';end='<!-- heritage-five-20261029:end -->'
 if begin in s:s=s[:s.index(begin)]+s[s.index(end)+len(end):]
 rows=[x for x in t['items']if x.get('supplementAudit')==AUDIT]
 content='\n\n'+begin+'\n\n## 苏丹库施与印度德干王陵增补（2026-10-29）\n\n'
 if kind=='table':
  content+='| ID | 名称 | 王朝／范围 | 原始资料 |\n|---|---|---|---|\n'
  for x in rows:
   sourceRows=[s for s in t['sources']if s['id']in x['sourceIds']]
   content+='| '+x['id']+' | '+x['name']+' | '+x['dynasty']+'；'+('陵群'if x['recordType']=='group'else'单陵')+' | '+'、'.join('['+v['title']+']('+v['url']+')'for v in sourceRows)+' |\n'
 else:
  for x in rows:
   sourceRows=[s for s in t['sources']if s['id']in x['sourceIds']+[x['coordinates']['sourceId']]]
   content+='### '+x['id']+' · '+x['name']+'\n\n- 依据：'+x['evidence']+'\n- 范围：'+x['coordinates']['target']+'\n- 地宫：未核实原地宫可参观\n- 后续：'+ '；'.join(x['reviewTasks'])+'\n- 来源：'+'、'.join('['+v['title']+']('+v['url']+')'for v in sourceRows)+'\n\n'
 p.write_text(s.rstrip()+content+'\n'+end+'\n',encoding='utf8',newline='\n')
print(json.dumps(dict(cities=len(added_cities),tombs=len(added_tombs),cityFeatures=len(added_details),tombShapes=report['tombShapes']),ensure_ascii=False))
