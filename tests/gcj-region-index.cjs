const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const api=require('../gcj-region.js'),source=fs.readFileSync(require.resolve('../gcj-region.js'),'utf8');
const start=source.indexOf('const polygons='),end=source.indexOf('const bound=',start);
const data={};vm.runInNewContext(source.slice(start,end)+'globalThis.data={polygons,excluded};',data);
const ring=(x,y,r)=>{let hit=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
const inside=(x,y,ps)=>ps.some(p=>ring(x,y,p[0])&&!p.slice(1).some(r=>ring(x,y,r)));
const reference=(x,y)=>inside(x,y,data.data.polygons)&&!inside(x,y,data.data.excluded);
let seed=71;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
for(let i=0;i<4000;i++){const x=70+random()*70,y=10+random()*50;assert.equal(api.contains(x,y),reference(x,y),`${x},${y}`);}
for(const ps of [data.data.polygons,data.data.excluded])for(const p of ps)for(const r of p)for(let i=0;i<r.length;i+=31)for(const offset of [0,1e-8,-1e-8]){const [x,y]=r[i];assert.equal(api.contains(x,y+offset),reference(x,y+offset));}
console.log('PASS: indexed coordinate mask matches full ray crossing, random points and border vertices');
