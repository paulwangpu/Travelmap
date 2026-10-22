function inside(p,r){let v=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const crossing=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0;
const lineHitsRing=(line,ring)=>line.some(p=>inside(p,ring))||line.slice(1).some((p,i)=>ring.slice(1).some((q,j)=>crossing(line[i],p,ring[j],q)));
function waterHitsRing(water,ring){const inWater=p=>inside(p,water[0])&&!water.slice(1).some(h=>inside(p,h));return ring.some(inWater)||water[0].some(p=>inside(p,ring))||ring.slice(1).some((p,i)=>water[0].slice(1).some((q,j)=>crossing(ring[i],p,water[0][j],q)));}
module.exports={inside,crossing,lineHitsRing,waterHitsRing};
