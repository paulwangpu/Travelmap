"""Source-qualified additions for India, Myanmar, Sri Lanka, Iran and Africa."""
import ast,json,xml.etree.ElementTree as ET
from pathlib import Path
BASE=Path('output/next-five');AUDIT='next-five-20261028'
def read(p):return json.loads(Path(p).read_text(encoding='utf8'))
def write(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
# Reuse only the data-construction function definitions, never the previous
# builder's entry-point or its site list. Existing records stay untouched.
previous=Path('scripts/supplement-five-regions.py').read_text(encoding='utf8')
for node in ast.parse(previous).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['osm','source','feature','city','tomb']:
  exec(compile(ast.get_source_segment(previous,node).replace('five-','next-'),'<historical-supplement-helper>','exec'))
def nom(file,index=0):
 d=read(BASE/(file+'.json'))[index]
 assert d['category']!='boundary' and d['type'] not in ['hotel','school','library','village','restaurant','station','parking'],(file,d['name'])
 # Only these verified former palace buildings may be indexed as museums.
 if d['type']=='museum':assert d['osm_id'] in [410092153,191377766]
 return dict(geometry=d['geojson'],center=[float(d['lon']),float(d['lat'])],url=f"https://www.openstreetmap.org/{d['osm_type']}/{d['osm_id']}",originalName=d['name'])
catalog=read('data/classical-sites/catalog.json');geo=read('data/classical-sites/sites.geojson');cap=read('data/china-ancient-capitals.json');t=read('data/imperial-tombs/catalog.json');tg=read('data/imperial-tombs/geometry.geojson')
for d,key in [(catalog,'sites'),(geo,'features'),(cap,'items'),(cap,'recordItems'),(t,'items'),(t,'sources'),(tg,'features')]:d[key]=[x for x in d[key] if x.get('supplementAudit',x.get('properties',{}).get('supplementAudit'))!=AUDIT]
added_cities=[];added_tombs=[];added_details=[]
SOURCES={
 'humayun':('胡马雍陵：世界遗产资料','https://whc.unesco.org/en/list/232/'),
 'akbar':('阿格拉地方政府：阿克巴陵','https://agra.nic.in/tourist-place/akbars-tomb-sikandra/'),
 'taj':('泰姬陵：陵园、衣冠石棺与实际墓室','https://whc.unesco.org/en/list/252/'),
 'lodi':('新德里市政委员会：洛迪与赛义德王朝陵墓','https://ndmc.gov.in/ndmc/monuments.aspx'),
 'ibrahim':('帕尼帕特政府：易卜拉欣洛迪墓','https://panipat.gov.in/tourist-place/ibrahim-lodhis-tomb/'),
 'bagan':('蒲甘都城与考古景观','https://whc.unesco.org/en/list/1588/'),
 'myanmar':('日本国际文化遗产协力联盟：缅甸古都调查','https://www.jcic-heritage.jp/wp-content/uploads/2022/12/2012Report_Myanmar_eg.pdf'),
 'amarapura':('缅甸艺术与科学研究院：阿摩罗补罗迁都研究','https://maas.edu.mm/Research/Admin/pdf/11.%20Dr%20Khin%20Mar%20Lwin%28121-132%29.pdf'),
 'bago':('勃固地区政府：干邦扎底宫','https://bagoregion.gov.mm/kanbawzathadi-palace/'),
 'anuradhapura':('阿努拉德普勒圣城','https://whc.unesco.org/en/list/200/'),
 'polonnaruwa':('斯里兰卡中央文化基金：波隆纳鲁沃王宫与古城','https://ccf.gov.lk/heritage-sites/polonnaruwa/'),
 'kandy':('康提王都与宗教核心','https://whc.unesco.org/en/list/450/'),
 'cyrus':('帕萨尔加德与居鲁士陵','https://whc.unesco.org/en/list/1106/'),
 'naqsh':('伊朗百科全书：纳克什鲁斯塔姆墓主认定','https://www.iranicaonline.org/articles/naqs-e-rostam/'),
 'persepolis':('波斯波利斯王室遗址','https://whc.unesco.org/en/list/114/'),
 'aksum':('阿克苏姆王国遗址与王陵','https://whc.unesco.org/en/list/15/'),
 'kaleb':('法国文化部：传统称卡莱布与格布雷梅斯克尔的墓葬','https://archeologie.culture.gouv.fr/axoum/fr/la-decouverte-du-site-0'),
 'carthage':('迦太基考古遗址与布匿港口','https://whc.unesco.org/en/list/37/'),
 'zimbabwe':('大津巴布韦政治中心与石构建筑','https://whc.unesco.org/en/list/364/'),
}

# India: actual tombs, not modern railway stations or whole Lodi Garden.
india=[('humayun','胡马雍陵','Humayun’s Tomb','humayun','莫卧儿王朝',['胡马雍'],1570,'humayun'),('akbar','阿克巴陵（西坎德拉）','Akbar’s Tomb, Sikandra','akbar','莫卧儿王朝',['阿克巴'],1613,'akbar'),('taj','泰姬陵（沙贾汗与穆姆塔兹合葬）','Taj Mahal','taj','莫卧儿王朝',['穆姆塔兹玛哈尔','沙贾汗'],1653,'taj'),('sikandar-lodi','锡坎达尔洛迪陵','Tomb of Sikandar Lodi','sikandar_lodi','德里苏丹国洛迪王朝',['锡坎达尔洛迪'],1518,'lodi'),('muhammad-shah','穆罕默德沙赛义德陵','Tomb of Muhammad Shah Sayyid','muhammad_shah','德里苏丹国赛义德王朝',['穆罕默德沙'],1444,'lodi'),('ibrahim-lodi','易卜拉欣洛迪墓','Tomb of Ibrahim Lodi','ibrahim_lodi','德里苏丹国洛迪王朝',['易卜拉欣洛迪'],1526,'ibrahim')]
for id,name,en,file,dyn,occ,year,ref in india:
 tomb(id,name,en,'印度','India','清' if year>=1644 else '明',dyn,occ,year,ref,nom(file),evidence='国家文物、遗产或地方政府资料与独立陵墓实体对应；年份为约略营建／使用阶段。园林内其他非君主墓不自动纳入。',disputes=['泰姬陵上层衣冠石棺与下层实际墓室不同；地面参观不等于可进入实际墓室。'] if id=='taj' else None)
 # The primary mapped object may be a precinct or a building; make it explicit.
 x=t['items'][-1];x['relicState']='mapped';x['geometryKind']='precinct' if id=='humayun' else 'building'
 if id=='humayun':
  building=nom('humayun_building')
  old=tg['features'][-1];new=json.loads(json.dumps(old));new['geometry']=building['geometry'];new['properties'].update(sourceId='next-humayun-main-building',name='胡马雍陵主体建筑轮廓',enName='Humayun main mausoleum footprint',sourceUrl=building['url'],geometryKind='building',tombOutline=False);tg['features'].append(new)

# Five Myanmar royal capitals. Intermittent royal residence is not presented
# as a continuous reign or a single unchanged city enclosure.
centres=[
 ('bagan','蒲甘','Bagan',[94.861,21.172],'蒲甘王朝都城',1100,1280,['宋辽金西夏','元'],'bagan','约11—13世纪代表阶段，不把1100年写成精确建都年；寺塔景观、旧城墙与广阔遗产保护区分开。',1588),
 ('mandalay','曼德勒','Mandalay',nom('mandalay')['center'],'贡榜王朝都城',1859,1885,['清'],'myanmar','建城、宫殿营建与正式迁都年份不同。现阶段只接入独立宫殿建筑区，不用同名现代行政边界冒充完整宫城。建筑含后期重建；当前受损状况未作现场核查。',None),
 ('amarapura','阿摩罗补罗','Amarapura',nom('amarapura')['center'],'贡榜王朝都城（间断）',1783,1859,['清'],'amarapura','1783年开始的都城阶段中多次与阿瓦往返，非连续在此建都；原王宫目前为遗址定位参照，不凭池塘或现代街区补出宫城。',None),
 ('inwa','阿瓦（因瓦）','Inwa',nom('nanmyin')['center'],'阿瓦及缅甸诸王朝都城（间断）',1364,1839,['元','明','清'],'myanmar','多次迁都与复都，所列为间断总时段；1839年地震之后的转移另见资料。南敏塔为原宫城遗存参照，不代表全城。',None),
 ('bago','勃固（汉达瓦底）','Bago / Hanthawaddy',nom('bago')['center'],'东吁王朝汉达瓦底都城阶段',1553,1599,['明'],'bago','这里先列勃印曩时期都城阶段，非勃固全部历史。现存干邦扎底宫含现代复原建筑，考古柱础与复原上部须分开理解。',None),
 ('anuradhapura','阿努拉德普勒','Anuradhapura',nom('anuradhapura')['center'],'阿努拉德普勒诸王朝政治中心',-300,993,['周','秦汉','魏晋南北朝','隋唐','五代十国','宋辽金西夏'],'anuradhapura','约前3世纪至993年的代表性政治与宗教中心阶段，不将其视为精确建城日期；宫城、寺院区与遗产范围分别核定。',200),
 ('polonnaruwa','波隆纳鲁沃','Polonnaruwa',nom('polonnaruwa')['center'],'朱罗及僧伽罗王朝政治中心',1000,1300,['宋辽金西夏','元'],'polonnaruwa','约11—13世纪阶段。王宫建筑、宗教核心区与全城范围不同，不将世界遗产全部范围画成宫城。',201),
 ('kandy','康提','Kandy',nom('kandy')['center'],'康提王国都城',1500,1815,['明','清'],'kandy','约16世纪至1815年的都城阶段参考，非精确建城年；王宫旧建筑与佛牙寺宗教核心分开。',450),
 ('aksum','阿克苏姆','Aksum',nom('aksum_palace')['center'],'阿克苏姆王国政治中心',100,800,['秦汉','魏晋南北朝','隋唐'],'aksum','约1—8世纪王国中心阶段。栋古尔建筑不能因传统传说而确认为示巴女王宫，王陵传统指认另列。',15),
 ('carthage','迦太基','Carthage',nom('carthage',1)['center'],'布匿迦太基政治中心',-600,-146,['周','秦汉'],'carthage','本条先列约前6世纪至前146年的布匿政治中心阶段。拜尔萨遗存包含后来的罗马层，不能将现存全部建筑断为布匿时期；不采用同名现代墓园。',37),
 ('great-zimbabwe','大津巴布韦','Great Zimbabwe',nom('great_zimbabwe',1)['center'],'绍纳地区王国政治中心',1100,1450,['宋辽金西夏','元','明'],'zimbabwe','约11—15世纪。按绍纳社会的考古政治中心收录，不沿用示巴女王建城传说作为历史认定；石构围墙、山丘与谷地遗址分区处理。',364),
]
for key,name,en,center,regime,start,end,periods,ref,note,whc in centres:
 country,code={'bagan':('缅甸','mm'),'mandalay':('缅甸','mm'),'amarapura':('缅甸','mm'),'inwa':('缅甸','mm'),'bago':('缅甸','mm'),'anuradhapura':('斯里兰卡','lk'),'polonnaruwa':('斯里兰卡','lk'),'kandy':('斯里兰卡','lk'),'aksum':('埃塞俄比亚','et'),'carthage':('突尼斯','tn'),'great-zimbabwe':('津巴布韦','zw')}[key]
 city(key,name,en,country,code,center,regime,start,end,periods,ref,note,whc)

for key,name,en,file,idx,period,ref,role,state,note in [
 ('mandalay','曼德勒宫建筑区（含后期重建）','Mandalay palace buildings, including reconstruction','mandalay',0,'清','myanmar','palace','mixed','只表示宫殿建筑区，不是约2公里见方的外郭城墙。现存建筑含后期重建，未宣称为全套19世纪原构。'),
 ('amarapura','阿摩罗补罗王宫遗址定位','Amarapura palace ruins reference','amarapura',0,'清','amarapura','palace','mapped','仅为遗址定位点，完整宫城外轮廓待核。'),
 ('inwa','南敏塔（阿瓦宫城遗存参照）','Nan Myint Tower, Inwa palace reference','nanmyin',0,'清','myanmar','palace','mapped','保留原始建筑轮廓，不以这座塔代替整片宫城；当前保存状况未作现场核查。'),
 ('bago','干邦扎底宫复原建筑','Reconstructed Kanbawzathadi Palace','bago',0,'明','bago','palace','reconstructed','这是复原展示建筑轮廓，不是整片原王宫或汉达瓦底外城范围。'),
 ('anuradhapura','阿努拉德普勒城堡定位','Anuradhapura citadel reference','anuradhapura',0,'隋唐','anuradhapura','palace','unverified','已有实体定位参考，完整城堡及城垣轮廓未核，不补推测闭合框。'),
 ('polonnaruwa','帕拉克拉马巴胡一世王宫遗址定位','Palace of Parakramabahu I reference','polonnaruwa',0,'宋辽金西夏','polonnaruwa','palace','mapped','现有公开输入为王宫点，不能扩成全城或完整王宫边界。'),
 ('kandy','康提旧王宫建筑','Old Royal Palace, Kandy','kandy',0,'清','kandy','palace','mapped','原王宫建筑现作博物馆使用；这是建筑轮廓，不是整个佛牙寺或康提城界。'),
 ('aksum','栋古尔高等级建筑遗址（宫殿归属待核）','Dungur high-status residence; palace attribution qualified','aksum_palace',0,'魏晋南北朝','aksum','public','mapped','考古建筑遗址，传统称“示巴女王宫”并无相应年代的确证；不将现代保护墙视为古代城墙。'),
 ('carthage','拜尔萨山考古区','Byrsa archaeological precinct','carthage',1,'秦汉','carthage','area','mapped','布匿与罗马多期遗存，不是整个迦太基城界。'),
 ('great-zimbabwe','大津巴布韦核心遗址标绘','Great Zimbabwe mapped core','great_zimbabwe',1,'元','zimbabwe','area','mapped','公开核心遗址区标绘，不自动作为全城80公顷的完整测绘界线。'),
]:
 feature(key,name,en,nom(file,idx),period,ref,role,note);geo['features'][-1]['properties']['relicState']=state

# Preserve each real wall's gaps; a moat is not a wall.
walls=[46715099,46715101,46715102,218817011,218817012,218817013,218817014,218817015]
parts=[osm(BASE/'bagan.osm','way',id) for id in walls]
shape=dict(geometry=dict(type='MultiLineString',coordinates=[p['geometry']['coordinates'] for p in parts]),url=parts[0]['url'])
feature('bagan','蒲甘旧城原始城墙段','Original Old Bagan wall segments',shape,'宋辽金西夏','bagan','wall','8条原始墙段分别保留开口，不拼成完整闭合城圈。')
geo['features'][-1]['properties'].update(sourceWays=[p['url'] for p in parts],relicState='mapped')
for id in [1247084795,1247084796]:feature('bagan','蒲甘旧护城河遗迹','Old Bagan moat remains',osm(BASE/'bagan.osm','way',id),'宋辽金西夏','bagan','water','原始护城河标绘，与城墙分开；不是复原的全周水面。')
feature('bagan','达拉巴门定位','Tharabar Gate reference',nom('tharabar'),'宋辽金西夏','bagan','gate','门址位置与现状参考，不代表整个宫城。')
feature('polonnaruwa','波隆纳鲁沃原始城墙遗迹','Polonnaruwa original wall remains',osm(BASE/'polonnaruwa.osm','way',337482569),'宋辽金西夏','polonnaruwa','wall','保留原始开放墙线，不人为闭合为全城轮廓。')
feature('polonnaruwa','波隆纳鲁沃宗教核心区','Polonnaruwa Quadrangle',osm(BASE/'polonnaruwa.osm','way',1011920999),'宋辽金西夏','polonnaruwa','area','宗教核心区单独标绘，不当作王宫或全城范围。')

# Iran: only Darius I's Naqsh-e Rostam tomb has a secure named inscription.
tomb('cyrus','居鲁士二世陵','Tomb of Cyrus the Great','伊朗','Iran','周','阿契美尼德王朝',['居鲁士二世'], -530,'cyrus',nom('cyrus'),evidence='帕萨尔加德遗产资料与独立陵墓建筑对应；不把整个遗址保护区作为王陵范围。')
tomb('naqsh-group','纳克什鲁斯塔姆阿契美尼德王陵群','Achaemenid royal tombs at Naqsh-e Rostam','伊朗','Iran','周','阿契美尼德王朝',[],-480,'naqsh',nom('naqsh'),group=True,evidence='四座王室岩墓；大流士一世有铭文可确认，其余三墓的常见王名归属仍属推定。')
for key,name,en,file,occ,year,recognition in [('darius','大流士一世岩墓','Rock-cut tomb of Darius I','darius','大流士一世',-486,'archaeological'),('xerxes','东侧岩墓（推定薛西斯一世）','Rock-cut tomb attributed to Xerxes I','xerxes','薛西斯一世（推定）',-465,'attributed'),('artaxerxes','西侧岩墓（推定阿尔塔薛西斯一世）','Rock-cut tomb attributed to Artaxerxes I','artaxerxes','阿尔塔薛西斯一世（推定）',-424,'attributed'),('darius2','最西岩墓（推定大流士二世）','Rock-cut tomb attributed to Darius II','darius2','大流士二世（推定）',-404,'attributed')]:
 tomb(key,name,en,'伊朗','Iran','周','阿契美尼德王朝',[occ],year,'naqsh',nom(file),parent='naqsh-group',recognition=recognition,evidence='大流士一世墓有DNa等铭文；其他王名依位置、样式与历史顺序推定，未同等视为铭文确认。坐标仅标岩墓立面附近，不是地下墓室平面。')
for key,name,en,file,occ,year in [('artaxerxes2','波斯波利斯岩墓（推定阿尔塔薛西斯二世）','Persepolis tomb attributed to Artaxerxes II','artaxerxes2','阿尔塔薛西斯二世（推定）',-358),('artaxerxes3','波斯波利斯岩墓（推定阿尔塔薛西斯三世）','Persepolis tomb attributed to Artaxerxes III','artaxerxes3','阿尔塔薛西斯三世（推定）',-338)]:
 tomb(key,name,en,'伊朗','Iran','周','阿契美尼德王朝',[occ],year,'persepolis',nom(file),recognition='attributed',evidence='波斯波利斯附近已完成的王室岩墓，具体王名为常见考古推定；公开几何不等于墓室实测界线。')

# Aksum: royal cemetery context is confirmed; traditional individual names are not.
tomb('aksum-stelae','阿克苏姆北部石碑区王陵群','Royal cemetery, Northern Stelae Field, Aksum','埃塞俄比亚','Ethiopia','魏晋南北朝','阿克苏姆王国',[],350,'aksum',osm(BASE/'aksum.osm','way',188465638),group=True,recognition='archaeological',evidence='碑林与地下王室墓葬相联系；现状围护区域不是完整古代陵区边界，未据碑号直接配给特定君主。')
tomb('kaleb','卡莱布与格布雷梅斯克尔双墓（传统指认）','Tombs traditionally attributed to Kaleb and Gebre Meskel','埃塞俄比亚','Ethiopia','魏晋南北朝','阿克苏姆王国',['卡莱布（传统指认）','格布雷梅斯克尔（传统指认）'],550,'kaleb',osm(BASE/'aksum.osm','node',580388078),group=True,recognition='traditional',evidence='机构考古史称“所谓卡莱布与格布雷梅斯克尔墓”；建筑为独立双墓遗存，但具体墓主传统指认与考古确认分开，未虚构两座独立实测点。')

# Link existing cities to their new cemeteries while keeping visits independent.
links={'agra':['next-akbar','next-taj'],'shahjahanabad':['next-humayun','next-sikandar-lodi','next-muhammad-shah'],'pasargadae':['next-cyrus'],'persepolis':['next-naqsh-group','next-artaxerxes2','next-artaxerxes3'],'aksum':['next-aksum-stelae','next-kaleb']}
for site in catalog['sites']:
 if site['key'] in links:
  old=site.get('relatedTombs',[]);ids={v['id'] for v in old}
  site['relatedTombs']=old+[dict(id=x['id'],name=x['name'],enName=x['enName']) for x in t['items'] if x['id'] in links[site['key']] and x['id'] not in ids]
for s in catalog['sites']:
 fs=[f for f in geo['features'] if f['properties']['siteKey']==s['key']];catalog['counts'][s['key']]=len(fs)
 if s.get('supplementAudit')==AUDIT:
  a=dict(featureCount=len(fs),areaCount=sum(f['properties']['role']=='area' for f in fs),wallCount=sum(f['properties']['role']=='wall' for f in fs),palaceCount=sum(f['properties']['role']=='palace' for f in fs),openWallCount=sum(f['properties']['role']=='wall' and f['geometry']['type'] in ['LineString','MultiLineString'] for f in fs),status='范围、原始开放墙段和定位点逐项区分；完整分期城界未全部核定。');s['boundaryAudit']=a
  for x in cap['items']+cap['recordItems']:
   if x.get('classicalSiteKey')==s['key']:x['boundaryAudit']=a;x['enHoverIdentity']='Historical capital / political centre: '+x['enName']
for f in geo['features']:
 if f['properties'].get('supplementAudit')==AUDIT:f['properties'].setdefault('relicState','mapped' if f['geometry']['type']!='Point' else 'unverified')
for f in tg['features']:
 if f['properties'].get('supplementAudit')==AUDIT:
  x=next(x for x in t['items'] if x['id']==f['properties']['tombId']);kind=x.get('geometryKind','precinct')
  f['properties'].update(geometryKind=kind,relicState='mapped',note='保留原始公开'+('主体建筑' if kind=='building' else '遗址／陵园')+'轮廓及孔洞；不是地下墓室或法定保护边界。岩墓立面与墓室平面不能互相替代。',enNote='Original mapped building/precinct geometry and holes, not an underground chamber or a legal protection boundary.')
for x in t['items']:
 if x.get('supplementAudit')==AUDIT:x.setdefault('relicState','mapped');x['enDynasty']={'莫卧儿王朝':'Mughal dynasty','德里苏丹国洛迪王朝':'Lodi dynasty, Delhi Sultanate','德里苏丹国赛义德王朝':'Sayyid dynasty, Delhi Sultanate','阿契美尼德王朝':'Achaemenid dynasty','阿克苏姆王国':'Kingdom of Aksum'}.get(x['dynasty'],x['dynasty'])
cap['siteCount']=len(cap['items']);cap['recordItemCount']=len(cap['recordItems']);cap['recordCount']=sum(x.get('recordCount',len(x.get('records',[]))) for x in cap['items'])
supp=cap.setdefault('coverageAudit',{}).setdefault('supplements',[]);supp[:]=[x for x in supp if x.get('report')!='docs/next-five-supplement.json'];supp.append(dict(date='2026-10-28',addedSites=len(added_cities),addedRecords=len(added_cities),scope='印度、缅甸、斯里兰卡、伊朗与非洲补充；非穷尽目录',report='docs/next-five-supplement.json'))
t['totalRecords']=len(t['items']);t['mapCandidateIds']=[x['id'] for x in t['items'] if x.get('mapEligible')];t['summary']={}
for x in t['items']:
 a=t['summary'].setdefault(x['era'],dict(records=0,singles=0,groups=0,mapCandidates=0,sourcePointsPendingDatum=0,missingCoordinates=0));a['records']+=1;a['singles']+=x['recordType']=='single';a['groups']+=x['recordType']=='group';a['mapCandidates']+=bool(x.get('mapEligible'));a['sourcePointsPendingDatum']+=bool(x.get('coordinates') and x['coordinates']['status']=='datum_pending');a['missingCoordinates']+=not bool(x.get('coordinates'))
t['researchedAt']='2026-10-28';scope=' 增量纳入印度、伊朗与阿克苏姆有据王室墓葬；岩墓墓主推定与铭文确认分开。';t['scope']=t['scope'].replace(scope,'')+scope
report=dict(date='2026-10-28',addedCities=added_cities,addedTombs=added_tombs,addedCityFeatures=added_details,tombShapes=sum(f['properties'].get('supplementAudit')==AUDIT for f in tg['features']),pending=['曼德勒完整外郭城墙、阿摩罗补罗与阿瓦完整宫城未取得可靠闭合矢量，未使用同名行政区替代。','阿努拉德普勒与波隆纳鲁沃部分对象仍为独立定位点；未把宗教区或遗产保护区画成全城。','阿克苏姆王陵墓主传统指认保留；假门墓未取得可靠独立点，不复制整个石碑区中心。','岩墓立面附近定位不等于地下墓室平面，泰姬陵上层衣冠石棺不等于原地宫开放。'],rejected=['同名酒店与火车站','曼德勒同名行政边界','西坎德拉现代行政区','迦太基同名现代墓园','纳克什鲁斯塔姆无铭文墓被一律视为已确认墓主'])
for x in t['items']:
 if x.get('supplementAudit')==AUDIT and x['id']=='next-ibrahim-lodi':
  x['relicState']='mixed';x['disputes'].append('现存高台露天墓于1867年重修；不能按1526年原貌理解现存建筑。')
for p,d in [('data/classical-sites/catalog.json',catalog),('data/classical-sites/sites.geojson',geo),('data/china-ancient-capitals.json',cap),('data/imperial-tombs/catalog.json',t),('data/imperial-tombs/geometry.geojson',tg),('docs/next-five-supplement.json',report)]:write(p,d)
print(json.dumps(dict(cities=len(added_cities),tombs=len(added_tombs),cityFeatures=len(added_details),tombShapes=report['tombShapes'],totalSites=len(catalog['sites']),totalFeatures=len(geo['features']),totalTombs=t['totalRecords'])))
