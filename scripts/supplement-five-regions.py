"""Five-region historical-city / royal-tomb supplement, preserving source geometry."""
import json, copy, xml.etree.ElementTree as ET
from pathlib import Path
BASE=Path('output/five-region'); AUDIT='five-regions-20261028'
def read(p):return json.loads(Path(p).read_text(encoding='utf8'))
def write(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
def nom(file,index=0):
 d=read(BASE/(file+'.json'))[index]
 # Itchan Kala is indexed as an open-air museum, but the verified object is
 # the 26-ha walled town, not a museum building.
 assert d['category']!='boundary' and (d['type'] not in ['village','hotel','museum','parking','board','restaurant','cafe','stop'] or file=='khiva-nominatim' and d['osm_id']==185036984),(file,d['name'])
 return dict(geometry=d['geojson'],center=[float(d['lon']),float(d['lat'])],url=f"https://www.openstreetmap.org/{d['osm_type']}/{d['osm_id']}",originalName=d['name'],tags=d.get('extratags') or {})
def osm(file,kind,id):
 root=ET.parse(file).getroot(); el=next(e for e in root if e.tag==kind and e.get('id')==str(id))
 nodes={n.get('id'):[float(n.get('lon')),float(n.get('lat'))] for n in root.findall('node')}
 if kind=='node':g=dict(type='Point',coordinates=nodes[str(id)]);center=g['coordinates']
 else:
  c=[nodes[n.get('ref')] for n in el.findall('nd')]
  g=dict(type='Polygon',coordinates=[c]) if c[0]==c[-1] else dict(type='LineString',coordinates=c)
  pts=c[:-1] if c[0]==c[-1] else c;center=[sum(p[i] for p in pts)/len(pts) for i in [0,1]]
 return dict(geometry=g,center=center,url=f'https://www.openstreetmap.org/{kind}/{id}',originalName={x.get('k'):x.get('v') for x in el.findall('tag')}.get('name',''))

catalog=read('data/classical-sites/catalog.json');geo=read('data/classical-sites/sites.geojson');cap=read('data/china-ancient-capitals.json');t=read('data/imperial-tombs/catalog.json');tg=read('data/imperial-tombs/geometry.geojson')
for d,key in [(catalog,'sites'),(cap,'items'),(cap,'recordItems'),(geo,'features'),(t,'items'),(t,'sources'),(tg,'features')]:
 d[key]=[x for x in d[key] if x.get('supplementAudit',x.get('properties',{}).get('supplementAudit'))!=AUDIT]
added_cities=[];added_tombs=[];added_details=[];gaps=[]
SOURCES={
 'baekje':('百济历史遗迹地区：都城、王陵与城防','https://whc.unesco.org/en/list/1477/'),
 'baekje-maps':('百济遗产组成部分地理参考','https://whc.unesco.org/en/list/1477/maps/'),
 'silla':('庆州历史区','https://whc.unesco.org/en/list/976/'),
 'silla-tombs':('庆州国立博物馆：新罗王陵考古','https://gyeongju.museum.go.kr/_prog/download/index.php?d_type=1&file_realname=special2_0_20150805174759.pdf&filename=20170809141739_00z8olxcxrbvuuzwrhvd0br0r0i8zl.pdf&func_gbn_cd=display_mgr&site_dvs_cd=kor'),
 'kofun':('百舌鸟—古市古坟群：身份与年代','https://whc.unesco.org/en/list/1593/'),
 'kofun-maps':('百舌鸟—古市古坟群：分项资料','https://whc.unesco.org/en/list/1593/maps/'),
 'hue':('顺化历史建筑群及阮朝帝陵','https://whc.unesco.org/en/list/678/'),
 'hue-maps':('顺化七座帝陵分项地理参考','https://whc.unesco.org/en/list/678/maps/'),
 'samarkand':('撒马尔罕历史分区与帖木儿王朝','https://whc.unesco.org/en/list/603/'),
 'bukhara':('布哈拉历史中心','https://whc.unesco.org/en/list/602/'),
 'khiva':('希瓦伊钦卡拉内城','https://whc.unesco.org/en/list/543/'),
 'merv':('古木鹿分期城址与桑贾尔陵','https://whc.unesco.org/en/list/886/'),
 'gur-emir':('乌兹别克斯坦官方旅游：古尔埃米尔陵','https://uzbekistan.travel/en/o/gur-emir/'),
 'samanid':('乌兹别克斯坦官方旅游：萨曼王朝陵','https://uzbekistan.travel/en/o/10-amazing-facts-about-samanid-mausoleum/'),
 'mayapan':('INAH：玛雅潘城市与城墙','https://lugares.inah.gob.mx/es/node/4439'),
 'coba':('墨西哥文化部：科巴','https://sic.cultura.gob.mx/ficha.php?disciplina=&table=zona_arqueologica&table_id=221'),
 'naranjo':('危地马拉文化部门：纳兰霍萨阿尔与黑石城王室碑铭','https://culturaguate.gob.gt/plaza-de-las-estelas/'),
 'dos-pilas':('范德堡大学：双柱城王朝与地区政治','https://news.vanderbilt.edu/2002/09/19/newly-revealed-hieroglyphs-tell-story-of-superpower-conflict-in-the-maya-world-60195/'),
 'tikal':('蒂卡尔考古与遗址范围','https://whc.unesco.org/en/list/64/'),
 'caracol':('伯利兹国家文化与历史研究所：卡拉科尔','https://ticketing.nichbelize.org/ia-sites/caracol/'),
 'pakal':('INAH：帕卡尔墓的考古发现','https://www.inah.gob.mx/foto-del-dia/la-tumba-de-pakal-un-hito-en-la-arqueologia-mexicana'),
 'tikal116':('危地马拉考古资料：蒂卡尔116号墓','https://www.sicultura.gob.gt/wp-content/uploads/2020/01/Nuevos-datos-para-la-historia-de-Tikal.pdf'),
}
def source(key):
 id='five-'+key
 if not any(x['id']==id for x in t['sources']):t['sources'].append(dict(id=id,title=SOURCES[key][0],publisher='文物、考古或遗产机构；见原文',url=SOURCES[key][1],accessedAt='2026-10-28',supplementAudit=AUDIT))
 return id
def feature(site,name,en,shape,period,ref,role='area',note=''):
 id='five-'+site+'-'+shape['url'].split('openstreetmap.org/')[-1].replace('/','-')
 # Do not duplicate a previously imported OSM object in the same city.
 if any(f['properties'].get('siteKey')==site and f['properties'].get('sourceUrl')==shape['url'] for f in geo['features']):return
 p=dict(id=id,siteKey=site,siteName=next(s['name'] for s in catalog['sites'] if s['key']==site),name=name,enName=en,role=role,period=period,periodLabel='遗址现状标绘；时代详见来源',sourceUrl=shape['url'],referenceUrl=SOURCES[ref][1],note=note or '保留公开现状矢量与原始孔洞；遗址区、建筑或城垣范围各按对象说明，不视作同一时期完整城界或法定保护区。',enNote='Original public mapped geometry and holes retained. Site precincts, buildings, ramparts and legal protection areas are distinct.',label=role!='area' and role!='wall',boundaryLabel=False,includeInDetails=True,lineWidth=1.1,attribution='© OpenStreetMap contributors · ODbL',supplementAudit=AUDIT)
 geo['features'].append(dict(type='Feature',geometry=shape['geometry'],properties=p));added_details.append(id)

def city(key,name,en,country,code,center,regime,start,end,periods,ref,note,whc=None):
 assert not any(s['key']==key for s in catalog['sites']),key
 sk='ancient-site:world-'+key;order=max(x.get('sourceOrder',0) for x in cap['items']+cap['recordItems'])+1;years=f'约{start}—{end}年';precision='历史政治中心的遗址区域定位参考，不表示精确宫殿中心、完整城墙或现代行政区范围。'
 rec={'时代':periods[0],'政权/国号':regime,'政权年代（原文）':years,'都城性质':'历史都城／地区政治中心','都城年代（原文）':years,'古称':name,'今称/遗址名':name,'今属行政区':country,'置信度':'中','备注/争议':note,'来源URL':SOURCES[ref][1],'都城类别码':'P','sourceOrder':order}
 item=dict(siteKey=sk,currentKey=sk,currentPlace=name,name=name,enName=en,lat=center[1],lng=center[0],admin=country,country=country,countryId=code,confidence='中',sourceOrder=order,siteNames=[name,en],ancientNames=[name],aliases=[name,en],dynasties=[regime],eras=periods,capitalPeriods=periods,mapReferencePeriod=periods[0],capitalTypes=['历史都城／地区政治中心'],categoryCodes=['P'],categoryLabels=['主要都城'],records=[rec],recordCount=1,sourceEra=periods[0],sourceSite=name,sourceAncientName=name,classicalSiteKey=key,hoverIdentity=regime,enHoverIdentity=regime,coordinatePrecision=precision,historicalSources=[dict(title=SOURCES[ref][0],url=SOURCES[ref][1])],supplementAudit=AUDIT)
 cap['items'].append(item);cap['recordItems'].append({**item,'records':[],'name':name+' · '+regime,'siteName':name,'ancientName':name,'parentName':name,'dynasty':regime,'era':periods[0],'capitalType':'历史都城／地区政治中心','capitalYears':years,'regimeYears':years,'categoryCode':'P','sourceUrl':SOURCES[ref][1],'note':note})
 s=dict(key=key,name=name,enName=en,country=country,center=center,date=start,period=periods[0],capitalPeriods=periods,urbanPeriods=periods,regime=regime,start=start,end=end,bbox=[center[0]-.025,center[1]-.025,center[0]+.025,center[1]+.025],referenceUrl=SOURCES[ref][1],sourceUrl=SOURCES[ref][1],periodLabel=regime+'；'+years+'（阶段参考）',tentative=False,capitalSiteKey=sk,historicalIdentity='capital',identityLabel='历史都城／地区政治中心',identityEnLabel='Historical capital / regional political centre',identityNote=note,identityEnNote='Dates describe the documented phase, not an uninterrupted occupation or precise boundary. Archaeological sites and their modern protection areas are distinguished.',identitySourceUrl=SOURCES[ref][1],supplementAudit=AUDIT)
 if whc:s.update(whc=whc,heritageId='whc-'+str(whc))
 catalog['sites'].append(s);added_cities.append(key)

# 1. Baekje and Silla: retain the existing capitals and actual fortress precincts.
city('iksan','益山（王宫里）','Iksan (Wanggung-ri)','韩国','kr',[127+3/60+20/3600,35+58/60+30/3600],'百济泗沘时期副都／王宫中心',600,660,['隋唐'],'baekje','UNESCO列为百济泗沘时期副都相关遗迹；约600—660仅作阶段定位，不声称已知精确迁都年。坐标为官方遗产分项参考，不以王宫里同名村庄代替遗址。',1477)
wang=dict(type='Feature',geometry=dict(type='Point',coordinates=[127+3/60+20/3600,35+58/60+30/3600]),properties=dict(id='five-iksan-official-reference',siteKey='iksan',siteName='益山（王宫里）',name='王宫里王宫遗址（官方区域参考）',enName='Wanggung-ri palace site (official component reference)',role='palace',period='隋唐',sourceUrl=SOURCES['baekje-maps'][1],referenceUrl=SOURCES['baekje'][1],note='仅为UNESCO遗产分项坐标，非精确宫殿中心或完整宫城界线。',label=False,includeInDetails=True,supplementAudit=AUDIT));geo['features'].append(wang);added_details.append(wang['properties']['id'])
naseong=nom('naseong-nominatim')
feature('buyeo','罗城遗迹定位（墙线待核）','Naseong city-wall reference; alignment pending',naseong,'魏晋南北朝','baekje','wall','OSM古迹点与UNESCO罗城分项交叉核对，仅标注遗迹位置；未把“罗城路”等现代道路拼成城墙，完整墙线待原始图件核定。')

# 2. Existing Japanese palace plans were already surveyed separately. Preserve them.
# 3. Hue already has a three-tier citadel/imperial-city/purple-city model; retain it.
# 4. Central Asian capitals and their distinct historic enclosures.
city('samarkand','撒马尔罕','Samarkand','乌兹别克斯坦','uz',[66.9758,39.6548],'帖木儿王朝都城',1370,1405,['明'],'samarkand','此处年代先列帖木儿都城阶段；阿弗拉西阿卜为较早古城，遗迹详情单列，不将古城与帖木儿城混为同一城界。帖木儿之后仍为重要都城，未以1405年作为城市终结。',603)
city('bukhara','布哈拉','Bukhara','乌兹别克斯坦','uz',nom('bukhara-nominatim')['center'],'萨曼王朝及布哈拉诸王朝都城（分期）',892,999,['隋唐','五代十国','宋辽金西夏'],'bukhara','根点在阿尔克城堡附近；约892—999为萨曼都城阶段，后来的汗国与埃米尔国都城阶段另见说明，不是城市存在期限。',602)
city('khiva','希瓦','Khiva','乌兹别克斯坦','uz',nom('khiva-nominatim')['center'],'希瓦汗国都城',1600,1920,['明','清','近现代'],'khiva','约1600—1920为汗国都城阶段参考；内城伊钦卡拉与外城迪尚卡拉不同，现阶段只接入有源内城范围，不假补外城全周。',543)
city('merv','木鹿（梅尔夫）','Merv','土库曼斯坦','tm',[62.1638,37.6642],'塞尔柱王朝都城／多期绿洲城',1100,1157,['宋辽金西夏'],'merv','约1100—1157为桑贾尔时期都城阶段参考。厄尔克城、盖奥尔城、苏丹城、阿卜杜拉汗城为不同阶段的城址；遗产保护区不能整体作为古城墙。',886)
for key,name,en,file,idx,period,ref,note in [
 ('samarkand','阿弗拉西阿卜古城现状范围','Afrasiyab ancient-city precinct','afrasiyab-nominatim',0,'隋唐','samarkand','OSM与林地共用的遗址标绘面，保留原始孔洞；不是逐段实测城垣，亦不是帖木儿时代城界。古城延续多期，不按单一朝代认定全部遗存。'),
 ('bukhara','阿尔克城堡定位（外轮廓待核）','Ark citadel reference; footprint pending','bukhara-nominatim',0,'清','bukhara','现有OSM资料为城堡游览点，尚无核实的城堡外轮廓；不以餐厅、酒店或同名行政区代替城防范围。'),
 ('khiva','希瓦伊钦卡拉内城范围','Itchan Kala inner enclosure','khiva-nominatim',0,'清','khiva','现存内城标绘范围，含历次修缮；不是迪尚卡拉外城，也不声称所有城垣同一年代营建。'),
 ('merv','厄尔克城城垣范围','Erk Kala fortified precinct','erk_kala-nominatim',0,'周','merv','早期城址的现状外缘；城墙经历多期营建，不将现存全部土体断为某一建造年。'),
 ('merv','盖奥尔城范围','Gyaur Kala enclosure','gyaur_kala-nominatim',0,'秦汉','merv','独立古城外缘标绘。原始OSM维基链接存在与大克孜堡混淆的标签，实体以名称、位置和UNESCO分期城址资料交叉核对；不沿用该错误链接。'),
 ('merv','苏丹城遗址定位（墙线待核）','Sultan Kala reference; wall alignment pending','sultan_kala-nominatim',0,'宋辽金西夏','merv','现有可靠输入为遗址参照点，未用圆形、矩形或其他城址轮廓代替苏丹城。'),
 ('merv','阿卜杜拉汗城范围','Abdullah Khan Kala enclosure','abdullah_kala-nominatim',0,'明','merv','后中古时期城址外缘，与较早厄尔克城、盖奥尔城及苏丹城分开。')]:
 feature(key,name,en,nom(file,idx),period,ref,'area',note)
feature('merv','盖奥尔城原始墙线（保留缺口）','Gyaur Kala original wall alignment',osm(BASE/'sultan_kala_exact.osm','way',44226148),'秦汉','merv','wall','OSM原始开放墙线，未把端点补闭合；与盖奥尔城区域面分开，不强行认定同一建造年。')
wall_ids=[301782709,301782710,301782713,301782717,301782718,301782720,301782722,301782724]
walls=[osm(BASE/'sultan_kala_exact.osm','way',id) for id in wall_ids]
grouped=dict(geometry=dict(type='MultiLineString',coordinates=[x['geometry']['coordinates'] for x in walls]),url=walls[0]['url'])
feature('merv','苏丹城及附郭现存墙段','Sultan Kala and associated extant wall segments',grouped,'宋辽金西夏','merv','wall','合并8条原始开放墙段供统一显示，各条坐标和开口完整保留；不拼接假闭合面，也不声称覆盖所有历史城垣。')
geo['features'][-1]['properties']['sourceWays']=[x['url'] for x in walls]
feature('merv','沙赫里亚尔城堡范围','Shahriyar Ark citadel precinct',osm(BASE/'sultan_kala_exact.osm','way',326129648),'宋辽金西夏','merv','area','苏丹城内城堡的独立现状范围，不代替整个苏丹城。')

# 5. Maya centres: five new roots, plus verifiable existing-site precincts.
naranjo=read(BASE/'naranjo-wikidata.json')['entities']['Q2662467']['claims']['P625'][0]['mainsnak']['datavalue']['value']
dos=read(BASE/'Q909286.json')['entities']['Q909286']['claims']['P625'][0]['mainsnak']['datavalue']['value']
for args in [
 ('mayapan','玛雅潘','Mayapán','墨西哥','mx',nom('mayapan-local')['center'],'玛雅潘地区政治中心',1250,1450,['宋辽金西夏','元','明'],'mayapan','INAH将主要后古典期阶段列为1250—1450。当前矢量仅为开放考古核心区，面积显著小于完整城址；不能把核心区外缘称为完整城墙。'),
 ('coba','科巴','Cobá','墨西哥','mx',nom('coba-local')['center'],'玛雅科巴城邦',250,1100,['魏晋南北朝','隋唐','五代十国','宋辽金西夏'],'coba','阶段参考并非精确建国或亡国年。核对为金塔纳罗奥的玛雅遗址，排除土耳其Coba Hüyük、欧洲同名墓地与现代旅馆。'),
 ('naranjo','纳兰霍萨阿尔','Naranjo Sa’al','危地马拉','gt',[naranjo['longitude'],naranjo['latitude']],'玛雅萨阿尔王国',250,900,['魏晋南北朝','隋唐'],'naranjo','佩滕的纳兰霍萨阿尔，与危地马拉城附近同名遗址分开。坐标取Q2662467原始P625 Earth声明，仅为遗址区域索引；完整城区与城墙尚待测绘图核定。'),
 ('dos-pilas','双柱城（多斯皮拉斯）','Dos Pilas','危地马拉','gt',[dos['longitude'],dos['latitude']],'玛雅双柱城王朝中心',629,761,['隋唐'],'dos-pilas','629年建立的蒂卡尔军事据点后来卷入地区王朝竞争，不简单视为始终独立城邦。OSM同名点偏向邻近阿罗约德彼德拉，已拒用；采用Q909286地理索引区域参考，精度仍待原始考古图核定。'),
 ('piedras-negras','黑石城（彼德拉斯内格拉斯）','Piedras Negras','危地马拉','gt',nom('piedras_negras-nominatim')['center'],'玛雅黑石城王朝中心',250,810,['魏晋南北朝','隋唐'],'naranjo','位于危地马拉佩滕乌苏马辛塔河沿岸，与墨西哥科阿韦拉州同名现代城市分开。仅有遗址参照点，未绘制城邦疆界；阶段末年为约数。')]:city(*args)
for key,name,en,file,period,ref in [('mayapan','玛雅潘考古核心区（非完整城墙）','Mayapán archaeological core, not full walls','mayapan-local','元','mayapan'),('coba','科巴遗址区范围','Cobá archaeological precinct','coba-local','隋唐','coba'),('tikal','蒂卡尔遗址区现状标绘','Tikal mapped archaeological precinct','tikal-focused','隋唐','tikal'),('caracol','卡拉科尔考古核心区','Caracol archaeological core','caracol-focused','隋唐','caracol')]:
 feature(key,name,en,nom(file),period,ref,'area','原始OSM标绘，非完整城市或城邦疆域。'+('蒂卡尔原始对象同时标为林地，孔洞反映地物分类，不表示古代空地；未将57600公顷国家公园当作城区。' if key=='tikal' else '不以保护区、村界或现代管理范围自动代替古城墙。'))

def tomb(id,name,en,country,countryEn,era,dynasty,occupants,year,ref,shape=None,point=None,parent=None,group=False,recognition='documented',evidence='',disputes=None):
 id='five-'+id; sid=source(ref);geoid='five-geo-'+id
 url=shape['url'] if shape else SOURCES[ref][1]
 t['sources'].append(dict(id=geoid,title=name+'：公开地理参考',publisher='OpenStreetMap / Nominatim' if shape else '遗产机构分项资料',url=url,accessedAt='2026-10-28',note='原始实体与参考坐标交叉核对；未宣称实测精度。',supplementAudit=AUDIT))
 center=shape['center'] if shape else point
 nature='mixed' if group else 'actual_burial'
 x=dict(id=id,name=name,enName=en,aliases=[name,en],country=country,countryEn=countryEn,era=era,correspondingChinesePeriod=era,correspondingChinesePeriodLabel='中国对应年代：'+era,enCorrespondingChinesePeriodLabel='Corresponding Chinese period: '+era,dynasty=dynasty,enDynasty=dynasty,occupants=occupants,enOccupants=occupants,admin=country+' · '+('分散陵区，位置见地图' if group else '遗址所在地'),enAdmin=countryEn,adminStatus='按独立遗址实体定位，非现代城市中心',recordType='group' if group else 'single',parentId='five-'+parent if parent else None,rulerCategory='royal',nature=nature,recognition=recognition,evidence=evidence,enEvidence='Institutional heritage or archaeological evidence; named attributions and geometric scope are separately qualified.',periodText='约'+str(year)+'年前后／对应世纪（阶段参考，非精确建陵年）',enPeriodText='Approximate historical phase; not an exact construction year',disputes=disputes or ['公开区域参照，不是墓室中心、入口或实测界线。'],enDisputes=['Public geographic reference, not a surveyed chamber position or visitor entrance.'],sourceIds=[sid],coordinates=dict(lat=center[1],lng=center[0],sourceId=geoid,original=f'{center[1]}, {center[0]}; '+url,method='公开遗址实体的区域代表点；名称与机构资料交叉核对',target='陵墓／陵区区域参照，非墓室中心',crs='WGS84',status='verified_wgs84' if shape else 'estimated_wgs84',sourceDatumExplicit=bool(shape),verificationScope='公开地理格式与机构所载实体对应；非现场测绘',precision=dict(sourceUnit='degree',horizontalAccuracyMeters=None),limitation='不能用于墓室或入口精确导航；形状范围见独立说明。'),mapEligible=True,mapReason='有据王室墓葬与公开区域参照',reviewTasks=['继续核对墓主认定、墓室开放、原始测绘与几何范围'],chronology=dict(sortYear=year,basis='约略营建／使用阶段，不自动作为墓主生卒年'),biographies=[dict(label=n,enLabel=n,birthYear=None,deathYear=None,status='lifespan_pending',lifespanText='生卒年未逐项核实',sourceIds=[sid]) for n in occupants],lifespanText='陵群或墓主生卒年未逐项核实；不以建陵年代代替',enLifespanText='Life dates not individually verified',visitorAccess=dict(status='unverified',originalChamber=False,note='未核实原地宫可进入；地面遗迹、展厅、复制墓室不等于原墓室开放。',enNote='Original chamber access is unverified; exhibitions or replicas do not establish access.'),disturbance=dict(status='unknown',label='尚未逐项核实',evidence='',scope='墓室',sourceIds=[],reviewedAt='2026-10-28'),supplementAudit=AUDIT)
 if not shape:x['coordinates']['estimate']=dict(basis='官方遗产分项地理参考；不提供具体墓室中心',extent='所列陵墓或陵区附近',confidence='regional',reviewedAt='2026-10-28')
 t['items'].append(x);added_tombs.append(id)
 if shape and shape['geometry']['type']!='Point' and id not in ['five-mozu','five-furuichi','five-nguyen']:
  p=dict(sourceId='five-shape-'+id,tombId=id,name=name+'现状标绘范围',enName=en+' mapped precinct',label=name,enLabel=en,period=era,sourceUrl=shape['url'],referenceUrl=SOURCES[ref][1],note='原始OSM遗址／建筑外轮廓及孔洞。不是已核定的墓室边界，也不自动等于封土轮廓或法定保护区。古坟可能包含周濠及管理区，未将其整体标作封土。',enNote='Original OSM site/building outline and holes, not a surveyed burial chamber or legal boundary. Kofun precincts may include moats; they are not presented as mound-only footprints.',status='公开现状标绘；非原始考古测绘GIS',enStatus='Public mapped precinct; not original archaeological survey GIS',labelMinZoom=15,tombOutline=True,fillOpacity=.05,supplementAudit=AUDIT)
  tg['features'].append(dict(type='Feature',geometry=shape['geometry'],properties=p))
 return x

# Korea: cemetery identities are not invented king-name attributions.
songsan=osm('output/world-gongju.xml','way',558646580);muryeong=osm('output/world-gongju.xml','node',13810148201)
dae=osm('output/five-region/gyeongju.osm','way',42435919)
tomb('songsan','宋山里百济王陵群','Royal Tombs in Songsan-ri','韩国','Republic of Korea','魏晋南北朝','百济熊津时期',[],500,'baekje',songsan,group=True,evidence='百济熊津都城相关王陵群，包含武宁王陵；不把所有封土都赋予具体王名。')
tomb('muryeong','武宁王与王妃陵','Tomb of King Muryeong and his queen','韩国','Republic of Korea','魏晋南北朝','百济', ['武宁王','武宁王妃'],525,'baekje',muryeong,parent='songsan',recognition='archaeological',evidence='墓志等考古证据可确认墓主身份；地图定位为原墓参照，非复制墓室或博物馆。')
tomb('neungsan','陵山里百济王陵群','Royal Tombs in Neungsan-ri','韩国','Republic of Korea','隋唐','百济泗沘时期',[],600,'baekje',nom('neungsan-nominatim',1),group=True,evidence='泗沘都城相关王陵群；具体墓主未逐墓确认，不能将每个墓号直接配给一位国王。')
tomb('daereungwon','大陵苑新罗王室墓群','Daereungwon Silla royal cemetery','韩国','Republic of Korea','魏晋南北朝','新罗',[],450,'silla',dae,group=True,evidence='庆州主要大型王室与上层墓葬区，不把整个墓群所有墓葬都视作已知国王墓。')
tomb('cheonmachong','天马冢（墓主未定）','Cheonmachong (occupant unidentified)','韩国','Republic of Korea','魏晋南北朝','新罗',[],500,'silla-tombs',nom('cheonmachong-nominatim'),parent='daereungwon',recognition='archaeological',evidence='发掘的大型新罗王室级墓葬，墓主姓名未定；不因天马图而指定为某位君主。')
tomb('hwangnam','皇南大冢（墓主未定）','Hwangnamdaechong (occupants unidentified)','韩国','Republic of Korea','魏晋南北朝','新罗',[],450,'silla-tombs',nom('hwangnam-nominatim'),parent='daereungwon',recognition='archaeological',evidence='考古确认的南北双坟大型王室级墓葬；具体王名存在争议，不以传统推测作为确证。')
# The two pre-existing city-detail cemetery polygons retain their IDs and metadata,
# but their map geometry is now owned by the tomb layer to avoid double rendering.
for f in geo['features']:
 if f['properties'].get('id') in ['gongju-way-558646580','gyeongju-way-42435919']:f['properties']['tombOwned']=True

# Japan: archaeological mound names first, traditional imperial attribution qualified.
jp=[('daisen','大仙古坟（传仁德天皇陵）','Daisen Kofun (traditionally Nintoku)','mozu-nominatim','mozu',450,['仁德天皇（传统指认，未考古确认）']),('richu','上石津御陵山古坟（传履中天皇陵）','Kamiishizu Misanzai Kofun','richu-nominatim','mozu',425,['履中天皇（传统指认，未考古确认）']),('itasuke','板须惠古坟','Itasuke Kofun','itasuke-nominatim','mozu',450,[]),('gobyoyama','御庙山古坟','Gobyoyama Kofun','gobyoyama-nominatim','mozu',450,[]),('ojin','誉田御庙山古坟（传应神天皇陵）','Konda Gobyoyama Kofun (traditionally Ojin)','ojin-nominatim','furuichi',425,['应神天皇（传统指认，未考古确认）']),('nakatsuyama','仲津山古坟（传仲姬命陵）','Nakatsuyama Kofun','nakatsuyama-nominatim','furuichi',400,['仲姬命（传统指认，未考古确认）']),('tsudo','津堂城山古坟','Tsudo Shiroyama Kofun','tsudo-nominatim','furuichi',400,[]),('ingyo','市野山古坟（传允恭天皇陵）','Ichinoyama Kofun (traditionally Ingyo)','ingyo-nominatim','furuichi',450,['允恭天皇（传统指认，未考古确认）'])]
for key,name,file in [('mozu','百舌鸟王族古坟群','mozu-nominatim'),('furuichi','古市王族古坟群','ojin-nominatim')]:
 tomb(key,name,'Mozu / Furuichi elite burial mounds','日本','Japan','魏晋南北朝','古坟时代王族及关联上层',[],450,'kofun',nom(file),group=True,evidence='世界遗产墓群包含王族及关联上层墓葬；不是49座均已确认具体天皇墓。群点借主要古坟作区域参照，不表示全部范围。')
for id,name,en,file,parent,year,occ in jp:
 tomb(id,name,en,'日本','Japan','魏晋南北朝','古坟时代',occ,year,'kofun',nom(file),parent=parent,recognition='traditional' if occ else 'archaeological',evidence='大型王族／关联上层古坟。古坟形制与年代有考古依据；传统陵名与具体墓主确认程度分开。',disputes=['具体墓主未获可公开独立核验的考古确认。','OSM外轮廓可能包含周濠及管理区域；封土、周濠尚未分别测绘，不把整个面称为封土。'])
tomb('nisanzai','尼桑扎伊古坟','Nisanzai Kofun','日本','Japan','魏晋南北朝','古坟时代',[],475,'kofun-maps',point=[135+29/60+57.98/3600,34+32/60+47.99/3600],parent='mozu',recognition='archaeological',evidence='世界遗产分项21的古坟实体；使用官方分项区域坐标，不用入口说明牌坐标替代封土或墓室。此项暂不绘制未经核实的边界。')

# Hue: seven independently documented imperial mausolea, not palace or temple points.
hue=[('gialong','嘉隆帝天授陵','Gia Long (Thien Tho)','hue_gialong-nominatim','嘉隆帝',1820),('minhmang','明命帝孝陵','Minh Mang (Hieu Lang)','hue_minhmang-nominatim','明命帝',1841),('thieutri','绍治帝昌陵','Thieu Tri (Xuong Lang)','hue_thieutri-nominatim','绍治帝',1847),('tuduc','嗣德帝谦陵','Tu Duc (Khiem Lang)','hue_tuduc-nominatim','嗣德帝',1883),('ducduc','育德帝安陵','Duc Duc (An Lang)','hue_ducduc-nominatim','育德帝',1883),('dongkhanh','同庆帝思陵','Dong Khanh (Tu Lang)','hue_dongkhanh-nominatim','同庆帝',1889),('khaidinh','启定帝应陵','Khai Dinh (Ung Lang)','hue_khaidinh-nominatim','启定帝',1925)]
tomb('nguyen','顺化阮朝帝陵群','Nguyen imperial mausolea near Hue','越南','Viet Nam','清','阮朝',[],1840,'hue',nom('hue_minhmang-nominatim'),group=True,evidence='顺化周边七座主要帝陵分散于香河流域。群点借明命陵作区域参照，不表示七陵连片边界。')
for id,name,en,file,occ,year in hue:
 tomb('hue-'+id,name,en,'越南','Viet Nam','近现代' if year>=1912 else '清','阮朝',[occ],year,'hue',nom(file),parent='nguyen',evidence='顺化世界遗产分项与原始陵园标绘对应；坐标指陵园区域，非墓室。',disputes=['所列年份用于排序，主要取墓主去世前后，不写作精确营建年。','嗣德帝实际遗体安葬的精确位置仍有不确定性；陵园内祭祀墓不直接证明遗体位置。'] if id=='tuduc' else None)

for id,name,en,country,era,dynasty,occ,year,ref,file,idx in [('gur-emir','古尔埃米尔陵（帖木儿家族陵）','Gur-e Amir','乌兹别克斯坦','明','帖木儿王朝',['帖木儿','兀鲁伯等王族'],1405,'gur-emir','gur_emir-nominatim',1),('samanid','萨曼王朝陵（伊斯迈尔萨曼家族）','Samanid dynastic mausoleum','乌兹别克斯坦','五代十国','萨曼王朝',['伊斯迈尔萨曼家族（归属见说明）'],910,'samanid','samanid-nominatim',0),('sanjar','苏丹桑贾尔陵','Mausoleum of Sultan Sanjar','土库曼斯坦','宋辽金西夏','大塞尔柱王朝',['艾哈迈德桑贾尔'],1157,'merv','sanjar-nominatim',0)]:
 tomb(id,name,en,country,'Uzbekistan' if country=='乌兹别克斯坦' else 'Turkmenistan',era,dynasty,occ,year,ref,nom(file,idx),evidence='遗产机构与国家旅游资料所载王朝陵寝；家族合葬建筑不按人数拆点。',recognition='attributed' if id=='samanid' else 'documented')

tomb('pakal','帕卡尔王墓（铭文神庙内）','Tomb of Pakal, Temple of the Inscriptions','墨西哥','Mexico','隋唐','玛雅巴卡尔王国',['基尼奇哈纳布帕卡尔'],683,'pakal',nom('pakal-extra'),recognition='archaeological',evidence='INAH记载1952年于铭文神庙内发现帕卡尔墓。平面仅为墓葬所在神庙地上轮廓，不代表地下墓室范围。')
tomb('tikal116','蒂卡尔116号王墓（一号神庙内）','Tikal Burial 116, beneath Temple I','危地马拉','Guatemala','隋唐','玛雅蒂卡尔王国',['贾索钱卡维尔一世（考古归属）'],734,'tikal116',nom('tikal_temple1-final'),recognition='archaeological',evidence='蒂卡尔考古资料将116号墓归于贾索钱卡维尔一世。几何是其上方一号神庙，不是地下墓室测绘。')

# Counts and audit metadata are recalculated, never interpreted as an exhaustive census.
for s in catalog['sites']:
 fs=[f for f in geo['features'] if f['properties']['siteKey']==s['key']]
 catalog['counts'][s['key']]=len(fs)
 if s.get('supplementAudit')==AUDIT or s['key'] in ['tikal','caracol']:
  audit=dict(featureCount=len(fs),areaCount=sum(f['properties'].get('role')=='area' for f in fs),wallCount=sum(f['properties'].get('role')=='wall' for f in fs),palaceCount=sum(f['properties'].get('role')=='palace' for f in fs),openWallCount=sum(f['properties'].get('role')=='wall' and f['geometry']['type']=='LineString' for f in fs),status='逐项说明现状遗址、城防或定位参考；完整分期城界未全部核定。')
  s['boundaryAudit']=audit
  for x in cap['items']+cap['recordItems']:
   if x.get('classicalSiteKey')==s['key']:x['boundaryAudit']=audit
for key in ['tikal','caracol']:
 s=next(s for s in catalog['sites'] if s['key']==key)
 suffix=' 本轮已增加原始OSM考古区标绘；该面不是完整城区或城邦疆域。'
 s['identityNote']=s['identityNote'].replace(suffix,'')+suffix
for item in cap['items']+cap['recordItems']:
 if item.get('supplementAudit')==AUDIT:
  item['enHoverIdentity']='Historical capital / regional political centre: '+item['enName']
  q={'naranjo':'Q2662467','dos-pilas':'Q909286'}.get(item.get('classicalSiteKey'))
  if q:item['historicalSources'].append(dict(title='定位索引（非墓主／政权认定依据）',url='https://www.wikidata.org/wiki/'+q))
dynasty_en={'百济熊津时期':'Baekje, Ungjin period','百济':'Baekje','百济泗沘时期':'Baekje, Sabi period','新罗':'Silla','古坟时代王族及关联上层':'Kofun-period royal clans and associated elites','古坟时代':'Kofun period','阮朝':'Nguyen dynasty','帖木儿王朝':'Timurid dynasty','萨曼王朝':'Samanid dynasty','大塞尔柱王朝':'Great Seljuk dynasty','玛雅巴卡尔王国':'Maya kingdom of Baakal','玛雅蒂卡尔王国':'Maya kingdom of Tikal'}
for item in t['items']:
 if item.get('supplementAudit')==AUDIT:item['enDynasty']=dynasty_en.get(item['dynasty'],item['dynasty'])
cap['siteCount']=len(cap['items']);cap['recordItemCount']=len(cap['recordItems']);cap['recordCount']=sum(x.get('recordCount',len(x.get('records',[]))) for x in cap['items'])
supp=cap.setdefault('coverageAudit',{}).setdefault('supplements',[]);supp[:]=[x for x in supp if x.get('report')!='docs/five-region-supplement.json'];supp.append(dict(date='2026-10-28',addedSites=len(added_cities),addedRecords=len(added_cities),scope='五批都城、王陵与城防补充；非穷尽目录',report='docs/five-region-supplement.json'))
t['totalRecords']=len(t['items']);t['mapCandidateIds']=[x['id'] for x in t['items'] if x.get('mapEligible')];t['summary']={}
for x in t['items']:
 a=t['summary'].setdefault(x['era'],dict(records=0,singles=0,groups=0,mapCandidates=0,sourcePointsPendingDatum=0,missingCoordinates=0));a['records']+=1;a['singles']+=x['recordType']=='single';a['groups']+=x['recordType']=='group';a['mapCandidates']+=bool(x.get('mapEligible'));a['sourcePointsPendingDatum']+=x.get('coordinates',{}).get('status')=='datum_pending' if x.get('coordinates') else False;a['missingCoordinates']+=not bool(x.get('coordinates'))
t['researchedAt']='2026-10-28'
extra_scope=' 增量纳入百济、新罗、日本古坟时代、越南阮朝、中亚及玛雅有据王室墓葬；传统墓主指认与考古确认分开。'
t['scope']=t['scope'].replace(extra_scope,'')+extra_scope
tg['scope']='有据王陵地上现状范围、遗址区及考古图示参考；不同几何的性质见逐项说明，不自动作为墓室或法定保护边界。'
gaps=['罗城完整墙线与各宫都完整规划范围：已有者保留，无可靠输入者不补假框。','日本古坟标绘包含不同周濠／管理范围；封土与周濠的独立测绘仍待补，未把9座之外所有古坟都纳入。','布哈拉城堡外轮廓仍待核；木鹿已增加原始城垣开放墙段，不人为补闭合。','玛雅潘当前仅有考古核心区矢量，完整外围城墙待考古图配准。纳兰霍、双柱城、黑石城尚无可靠全城矢量。','地宫可参观状态未因地上陵园开放而自动设置。']
report=dict(date='2026-10-28',batches=['百济—新罗','日本古坟及既有宫都核对','顺化','中亚','玛雅'],addedCities=added_cities,addedTombs=added_tombs,addedCityFeatures=added_details,geometryScope='Raw OSM geometry retained. Official component points and Wikidata Earth coordinates are reference locations, never fabricated city boundaries.',pending=gaps,existingReviewed=['公山城','扶苏山城','月城','飞鸟宫都','藤原京','平城京','顺化京城／皇城／紫禁城'],rejected=['现代同名村镇／行政区','土耳其Coba Hüyük','Coba中世纪墓地','Nisanzai说明牌当成古坟本体','OSM双柱城偏向阿罗约德彼德拉的冲突点','盖奥尔城原OSM错误百科链接'])
for p,d in [('data/classical-sites/catalog.json',catalog),('data/classical-sites/sites.geojson',geo),('data/china-ancient-capitals.json',cap),('data/imperial-tombs/catalog.json',t),('data/imperial-tombs/geometry.geojson',tg),('docs/five-region-supplement.json',report)]:write(p,d)
print(json.dumps(dict(cities=len(added_cities),tombs=len(added_tombs),cityFeatures=len(added_details),tombShapes=sum(f['properties'].get('supplementAudit')==AUDIT for f in tg['features']),totalSites=len(catalog['sites']),totalFeatures=len(geo['features']))))
