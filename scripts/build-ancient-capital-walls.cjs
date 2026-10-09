const fs=require('fs'),path=require('path');
function find(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){const f=find(p);if(f)return f}else if(e.name==='MingQingCityWall.shp')return p;}}
const file=find('output/ancient-city-walls');if(!file)throw Error('Extract CCWAD zip in output/ancient-city-walls first');
const shp=fs.readFileSync(file),dbf=fs.readFileSync(file.replace(/shp$/,'dbf')),count=dbf.readUInt32LE(4),start=dbf.readUInt16LE(8),length=dbf.readUInt16LE(10),columns=[];
for(let i=32;dbf[i]!==13;i+=32)columns.push({name:dbf.subarray(i,i+11).toString().replace(/\0.*/,''),type:String.fromCharCode(dbf[i+11]),length:dbf[i+16]});
const rows=[];for(let i=0;i<count;i++){let pos=start+i*length+1,r={};for(const col of columns){const value=dbf.subarray(pos,pos+col.length).toString('utf8').trim();r[col.name]=['N','F'].includes(col.type)?Number(value):value;pos+=col.length;}rows.push(r);}
const cities={Changan:['西安',108.94,34.26],Beijing:['北京',116.4,39.9],Nanjing:['南京',118.8,32.05],Xian:['西安',108.94,34.26],Luoyang:['洛阳',112.46,34.68],Kaifeng:['开封',114.35,34.8],Hangzhou:['杭州',120.16,30.25],Datong:['大同',113.3,40.08],Chengdu:['成都',104.07,30.66],Dali:['大理',100.16,25.7],Shenyang:['沈阳',123.45,41.8],Shengjing:['沈阳',123.45,41.8],Guangzhou:['广州',113.26,23.13],Xianyang:['咸阳',108.7,34.33],Fengxiang:['凤翔',107.4,34.52],Fengyangfu:['凤阳',117.56,32.87]};
Object.assign(cities,{"Suzhou":["苏州",120.62,31.31],"Ningbo":["宁波",121.54,29.87],"Shaoxing":["绍兴",120.58,30],"Zhenjiang":["镇江",119.45,32.21],"Xiangyang":["襄阳",112.15,32.02],"Qingzhou":["青州",118.48,36.68],"Quanzhou":["泉州",118.58,24.91],"Fuzhou":["福州",119.3,26.09],"Jingzhou":["荆州",112.19,30.35],"Jinan":["济南",117.02,36.67],"Qufu":["曲阜",116.99,35.6],"Yangzhou":["扬州",119.43,32.39],"Taiyuan":["太原",112.56,37.87],"Pingyao":["平遥",112.18,37.2],"Zhengzhou":["郑州",113.67,34.75],"Wuchang":["武昌",114.3,30.54],"Nanchang":["南昌",115.89,28.68]});
Object.assign(cities,{"Changsha":["长沙",112.97,28.2],"Chongqing":["重庆",106.57,29.56],"Guiyang":["贵阳",106.71,26.58],"Kunming":["昆明",102.71,25.05],"Guilin":["桂林",110.29,25.28],"Liuzhou":["柳州",109.41,24.32],"Nanning":["南宁",108.32,22.82],"Baoqing":["邵阳",111.46,27.24],"Chaozhou":["潮州",116.64,23.67],"Dengzhou":["蓬莱",120.75,37.81],"Tianjin":["天津",117.17,39.14],"Zhengding":["正定",114.57,38.14],"Daming":["大名",115.15,36.28],"Zhangde":["安阳",114.35,36.1],"Weihui":["卫辉",114.07,35.41],"Nanyang":["南阳",112.54,33],"Guide":["商丘",115.61,34.38],"Huaiqing":["沁阳",112.94,35.09],"Xuzhou":["徐州",117.18,34.27],"Huaian":["淮安",119.14,33.51],"Anqing":["安庆",117.04,30.51],"Hefei":["合肥",117.28,31.87],"Huizhou":["徽州（歙县）",118.43,29.87],"Jianning":["建瓯",118.32,27.04],"Yanping":["南平（延平）",118.17,26.64],"Jianyang":["建阳",118.12,27.34],"Jinzhou":["锦州",121.12,41.11],"Ningyuan":["兴城",120.71,40.62],"Lanzhou":["兰州",103.82,36.06],"Xining":["西宁",101.78,36.62],"Ningxia":["银川",106.28,38.47],"Yulin":["榆林",109.75,38.3],"Hanzhong":["汉中",107.02,33.07],"Luzhou":["泸州",105.45,28.89],"Jianchang":["西昌",102.27,27.9]});
const translated=JSON.parse(fs.readFileSync('data/ancient-capital-wall-translations.json','utf8'));
Object.assign(cities,translated);
const features=[];let index=0;
for(let offset=100;offset<shp.length;index++){
 const size=shp.readInt32BE(offset+4)*2,begin=offset+8,type=shp.readInt32LE(begin);offset=begin+size;const r=rows[index],city=cities[r.NAME];if(![5,15].includes(type))throw Error('Expected polygon');
 const parts=shp.readInt32LE(begin+36),points=shp.readInt32LE(begin+40),partStart=begin+44,pointStart=partStart+4*parts,rings=[];
 for(let j=0;j<parts;j++){const a=shp.readInt32LE(partStart+4*j),b=j+1<parts?shp.readInt32LE(partStart+4*(j+1)):points;const ring=[];for(let k=a;k<b;k++)ring.push([shp.readDoubleLE(pointStart+16*k),shp.readDoubleLE(pointStart+16*k+8)].map(v=>Number(v.toFixed(6))));rings.push(ring);}
 const area=r=>r.reduce((s,v,i)=>{const w=r[(i+1)%r.length];return s+v[0]*w[1]-w[0]*v[1]},0)/2;
 const outers=rings.filter(r=>area(r)<0).map(r=>[r]),holes=rings.filter(r=>area(r)>=0);
 function contains(pt,r){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
 for(const h of holes){const parent=outers.find(p=>contains(h[0],p[0]));if(!parent)throw Error('Unmatched hole');parent.push(h);}
 const box=[shp.readDoubleLE(begin+4),shp.readDoubleLE(begin+12),shp.readDoubleLE(begin+20),shp.readDoubleLE(begin+28)],center=[(box[0]+box[2])/2,(box[1]+box[3])/2];
 const matched=city&&Math.hypot(center[0]-city[1],center[1]-city[2])<=0.15&&!(r.NAME==='Daming'&&r.TYPE!=='Fu');
 features.push({type:'Feature',properties:{city:matched?city[0]:r.NAME,sourceName:r.NAME,sourceId:index,sourceIds:[index],placeType:r.TYPE,begin:r.BEG_YEAR,end:r.END_YEAR,reliability:r.RELIABILIT,reference:r.REFERENCES,areaKm2:r.AREA_sq_km},geometry:{type:'MultiPolygon',coordinates:outers}});
}

if(features.length!==count)throw Error('Source record count mismatch');
const additions=JSON.parse(fs.readFileSync('data/ancient-capital-wall-name-additions.json','utf8'));
for(const f of features){if(!/[A-Za-z]/.test(f.properties.city))continue;const points=f.geometry.coordinates.flat(2);const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;const match=additions.entries.find(([name,zh,x,y])=>name===f.properties.sourceName&&Math.hypot(cx-x,cy-y)<additions.coordinateToleranceDegrees);if(match)f.properties.city=match[1];}

fs.writeFileSync('data/ancient-capital-walls.geojson',JSON.stringify({type:'FeatureCollection',features}));
console.log('Saved all',features.length,'source records');
