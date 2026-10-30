"""Reproject official TWHA 3600x1800 Plate Carree tiles to Web Mercator.
Original: https://x768.sakura.ne.jp/pub/files/twha5.zip (2019-09-23).
Run after extracting the original into output/twha-research/original/twha5.
"""
from pathlib import Path
import math, json
from PIL import Image, ImageDraw, ImageChops

root = Path(__file__).resolve().parents[1]
src = root / 'output/twha-research/original/twha5'
dest = root / 'data/twha/tiles'
limit = math.degrees(math.atan(math.sinh(math.pi)))
merc = lambda lat: math.asinh(math.tan(math.radians(lat)))
rows = []
for j in range(4):
    north, south = min(limit, 90-j*45), max(-limit, 45-j*45)
    top, bottom = merc(north), merc(south)
    height = round((top-bottom)*3600/(2*math.pi))
    samples = [(90-math.degrees(math.atan(math.sinh(top-(v+.5)/height*(top-bottom)))))*10-j*450 for v in range(height)]
    rows.append(dict(north=north, south=south, height=height))
    for i in range(8):
        target = dest / f'{i}{j}'
        target.mkdir(parents=True, exist_ok=True)
        for path in sorted((src/'t'/f'{i}{j}').glob('*.png')):
            im = Image.open(path).convert('RGBA')
            # Ocean and unassigned white are background, not historical territory.
            for rgb in [(57,193,255),(255,255,255)]:
                diff = ImageChops.difference(im.convert('RGB'), Image.new('RGB',im.size,rgb))
                r,g,b = diff.split()
                mask = ImageChops.lighter(ImageChops.lighter(r,g),b).point(lambda n:255 if n else 0)
                im.putalpha(ImageChops.darker(im.getchannel('A'),mask))
            out = Image.new('RGBA', (450, height))
            for v, sy in enumerate(samples):
                # Nearest preserves categorical colors and transparent background.
                sy = max(0, min(449, math.floor(sy)))
                out.paste(im.crop((0, sy, 450, sy+1)), (0, v))
            out.save(target/path.name, optimize=True)

# Independent shoreline comparison against local Natural Earth 1:50m coast.
land = Image.new('RGB', (3600,1800))
for i in range(8):
    for j in range(4): land.paste(Image.open(src/'sf'/f'{i}{j}.png').convert('RGB'),(450*i,450*j))
coast = json.loads((root/'output/borders-50m-coast.geojson').read_text(encoding='utf8'))
draw = ImageDraw.Draw(land)
errors = []
pix = land.load()
def sea(x,y):
    r,g,b = pix[x,y]
    return b > 180 and b-r > 50 and g-r > 30
# Test fixed 0.1 degree/pixel world registration, no arbitrary regional warps.
for f in coast['features']:
    lines = [f['geometry']['coordinates']] if f['geometry']['type']=='LineString' else f['geometry']['coordinates']
    for line in lines:
        for lon,lat in line[::12]:
            x,y=round((lon+180)*10),round((90-lat)*10)
            if not (8<=x<3592 and 8<=y<1792) or abs(lat)>80: continue
            nearest=20
            for dx in range(-6,7):
                for dy in range(-6,7):
                    xx,yy=x+dx,y+dy
                    if sea(xx,yy)!=sea(xx+1,yy) or sea(xx,yy)!=sea(xx,yy+1): nearest=min(nearest,math.hypot(dx,dy))
            errors.append(nearest)
# Draw only after measuring, otherwise the overlay would contaminate sea tests.
for f in coast['features']:
    lines=[f['geometry']['coordinates']] if f['geometry']['type']=='LineString' else f['geometry']['coordinates']
    for line in lines: draw.line([((lon+180)*10,(90-lat)*10) for lon,lat in line],fill='#e60038',width=1)
land.resize((1800,900)).save(root/'output/twha-research/coast-registration.png')
errors.sort()
resolved=[e for e in errors if e<20]
report=dict(sourceProjection='Plate Carree',width=3600,height=1800,longitudeOrigin=-180,degreesPerPixel=.1,targetProjection='EPSG:3857',latitudeLimit=limit,rows=rows,comparison='Natural Earth 1:50m coastline; modern shoreline alignment only, not historical frontier validation',samples=len(errors),resolvedSamples=len(resolved),unmatchedWithinSearch=len(errors)-len(resolved),medianMatchedPixels=resolved[len(resolved)//2],p90MatchedPixels=resolved[int(len(resolved)*.9)],tiles=len(list(dest.glob('*/*.png'))))
(root/'data/twha/calibration.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report))
