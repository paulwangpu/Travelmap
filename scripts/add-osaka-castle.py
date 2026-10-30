import json,xml.etree.ElementTree as E
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
# Complete outer circuit traced from the Osaka Business Development Agency's
# Toyotomi/Tokugawa comparison map, not joined from modern rail/road fragments.
source='https://www.obda.or.jp/about/history/md-transition.html'
image='https://www.obda.or.jp/wp-content/uploads/2023/07/osakajo_sogamae_1large.jpg'
gcp=[{'name':'western moat bend','pixel':[298,166],'wgs84':[135.5204574,34.6882451],'source':'https://www.openstreetmap.org/way/1550234049'}, {'name':'northern moat apex','pixel':[407,79],'wgs84':[135.5248714,34.6910336],'source':'https://www.openstreetmap.org/way/1550234049'}, {'name':'eastern moat corner','pixel':[538,269],'wgs84':[135.5308842,34.6844176],'source':'https://www.openstreetmap.org/way/1550234049'}, {'name':'Hommachi bridge','pixel':[75,350],'wgs84':[135.5098806,34.6835],'source':'https://commons.wikimedia.org/wiki/Category:Hommachi_Bridge'}]
a=np.array([[*p['pixel'],1] for p in gcp]);b=np.array([p['wgs84'] for p in gcp]);fit=np.linalg.lstsq(a,b,rcond=None)[0]
residual=np.linalg.norm((a@fit-b)*np.array([91500,111000]),axis=1)
for p,r in zip(gcp,residual):p['fitResidualMeters']=round(float(r),1)
pixels=[[59,111],[83,105],[114,101],[160,101],[198,99],[240,97],[276,95],[299,88],[322,94],[344,98],[367,88],[389,81],[412,80],[435,87],[468,98],[496,102],[529,115],[559,125],[581,141],[595,165],[603,185],[607,205],[605,259],[602,304],[603,350],[593,397],[584,448],[577,488],[568,525],[560,545],[530,547],[503,554],[478,561],[463,566],[438,573],[419,578],[393,581],[369,584],[345,583],[324,577],[286,575],[251,573],[214,570],[181,565],[150,561],[116,559],[88,555],[85,511],[82,468],[79,422],[77,377],[73,331],[70,288],[67,243],[63,199],[61,155],[59,111]]
ring=[[round(float(x),7) for x in np.array([*p,1])@fit] for p in pixels]
report={'reference':source,'image':image,'method':'affine fit from identifiable present moat corners and Hommachi bridge; digitized full outer circuit from comparative reconstruction map','controlPoints':gcp,'affinePixelToWGS84':fit.tolist(),'fitRmsMeters':round(float(np.sqrt(np.mean(residual**2))),1),'uncertaintyNote':'Fit residual only describes control points; it is not historical boundary accuracy. Schematic reconstruction and manual identification introduce additional error. Not a measured wall or cadastral boundary.','outlinePixels':pixels}
Path('data/osaka-castle-calibration.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
r=E.parse('output/osaka-castle/osm.xml').getroot();ns={n.get('id'):[float(n.get('lon')),float(n.get('lat'))] for n in r.findall('node')};w=next(w for w in r.findall('way') if w.get('id')=='1550234049');current=[ns[n.get('ref')] for n in w.findall('nd')]
base={'siteKey':'osaka-castle','siteName':'大阪城（大坂城）','siteEnName':'Osaka Castle','role':'area','period':'明','lineWidth':1.1,'label':False,'boundaryLabel':False,'includeInDetails':True}
outer={'type':'Feature','geometry':{'type':'Polygon','coordinates':[ring]},'properties':{**base,'id':'osaka-castle-toyotomi-full-outer','name':'丰臣大坂城完整惣构范围（复原图示）','enName':'Complete Toyotomi Osaka outer enclosure (reconstruction reference)','periodLabel':'丰臣期惣构（1594—1615年）','inferredBoundary':True,'sourceType':'georeferenced-reconstruction-map','sourceUrl':image,'referenceUrl':source,'calibrationUrl':'data/osaka-castle-calibration.json','note':'据大阪产业局发布的丰臣、德川外郭比较图，配准后沿图示完整外围数字化。此闭合面表示文献复原范围，不声称全周城墙实测或完整遗存；控制点拟合误差不是历史界线精度。图示参考，非实测墙界。现代公园、水之回廊和零散铁路、道路参照线均未作为城界。','attribution':'Reference: Osaka Business Development Agency, Toyotomi/Tokugawa outer enclosure comparison; control geometry © OpenStreetMap contributors · ODbL'}}
existing={'type':'Feature','geometry':{'type':'Polygon','coordinates':[current]},'properties':{**base,'id':'osaka-castle-way-1550234049','name':'大阪城现存城郭范围（对照）','enName':'Present Osaka Castle precinct (comparison)','periodLabel':'现存城郭；主要为德川期重筑范围','sourceUrl':'https://www.openstreetmap.org/way/1550234049','referenceUrl':'https://www.city.osaka.lg.jp/keizaisenryaku/cmsfiles/contents/0000626/626612/gaiyou_.pdf','note':'OSM城郭现状外轮廓，仅用于对照丰臣完整惣构范围；不是现代大阪城公园边界，也非特别史迹法定指定区。','attribution':'© OpenStreetMap contributors · ODbL'}}
Path('data/osaka-castle-sites.geojson').write_text(json.dumps({'type':'FeatureCollection','features':[outer,existing]+json.loads(Path('output/osaka-castle/main-remains.json').read_text(encoding='utf8'))['features']},ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
im=Image.open('output/osaka-castle/outer-comparison.jpg').convert('RGB');draw=ImageDraw.Draw(im);draw.line([tuple(p) for p in pixels],fill='#f5284e',width=2)
for p in gcp:
 x,y=p['pixel'];draw.ellipse((x-4,y-4,x+4,y+4),fill='#0066ff')
im.save('output/osaka-castle/full-outer-trace-review.png')
print(json.dumps({'features':2,'outlineVertices':len(ring),'fitRmsMeters':report['fitRmsMeters']}))
