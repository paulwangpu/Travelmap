(function(root){
 'use strict';
 // One palette for both categories; reserve check-in red and separate adjacent periods.
 const colors={'传说':'#806600','夏商':'#96512b','周':'#728600','秦汉':'#bd9200','魏晋南北朝':'#5146bd','隋唐':'#d57816','五代十国':'#278eae','宋辽金西夏':'#086838','元':'#176bd1','明':'#783c86','清':'#379b27','近现代':'#343c46'};
 const displayPeriod=k=>['传说时代','史前','传说与史前'].includes(k)?'传说':['西周','东周','春秋','战国','春秋战国'].includes(k)?'周':k;
 function periodSelection(saved={}){return {...saved,'传说':saved['传说']??(saved['传说时代']!==false||saved['史前']!==false),'周':saved['周']??(saved['西周']!==false||(saved['春秋战国']??(saved['春秋']!==false||saved['战国']!==false)))};}
 const keys=Object.keys(colors);
 // A missing start (e.g. ?—-473) must not be mistaken for the end date.
 function startYear(text){const s=String(text||'').trim();if(!s||/^[?？]|未定|待考/.test(s))return null;const m=s.match(/(?:公元前|前)?\s*(-?\d{1,4})(\s*世纪)?(?:\s*(BCE?|CE|AD))?/i);if(!m)return null;const before=/公元前|前/.test(s.slice(0,m.index+m[0].length))||/^BC/i.test(m[3]||'')||Number(m[1])<0,n=Math.abs(Number(m[1]));return before?-(m[2]?n*100:n):(m[2]?(n-1)*100+1:n);}
 function yearOf(x){const capital=startYear(x['都城年代（原文）']||x.capitalYears);return capital??startYear(x['政权年代（原文）']||x.regimeYears);}
 function fromYear(y){return y<-2070?'传说':y<-1046?'夏商':y<-770?'西周':y<-475?'春秋':y<-221?'战国':y<220?'秦汉':y<581?'魏晋南北朝':y<907?'隋唐':y<960?'五代十国':y<1271?'宋辽金西夏':y<1368?'元':y<1644?'明':y<1912?'清':'近现代';}
 function classifyCapitalPeriod(x){const era=x['时代']||x.era||x.sourceEra||'',d=x['政权/国号']||x.dynasty||x.dynasties?.[0]||'',y=yearOf(x);
  // “三十六国” contains “十六国”; test the Han-era list before Sixteen Kingdoms.
  if(/西域三十六/.test(era)||x.westernRegion||/^(龟兹国|于阗国|焉耆国|疏勒国)$/.test(d))return '秦汉';
  if(/近现代/.test(era))return '近现代';
  if(/明清/.test(era)){if(/清|后金|太平天国|吴周|杜文秀|大成国/.test(d))return '清';if(/明|北元|大顺|大西|鲁王/.test(d))return '明';return y!==null?fromYear(y):null;}
  if(/元及/.test(era))return '元';
  if(/宋辽夏金/.test(era))return '宋辽金西夏';
  if(/五代/.test(era))return '五代十国';
  if(/隋唐/.test(era))return '隋唐';
  if(/三国|两晋|十六国|南北朝/.test(era))return '魏晋南北朝';
  if(/秦汉|西域三十六/.test(era))return '秦汉';
  if(/上古|夏商周/.test(era)){if(/西周/.test(d))return '西周';if(/东周/.test(d))return y!==null&&y>=-475?'战国':'春秋';return /尧|舜|黄帝|炎帝/.test(d)?'传说':'夏商';}
  if(/春秋战国/.test(era)){const start=startYear(x['都城年代（原文）']||x.capitalYears);return start!==null?fromYear(start):'春秋';}
  if(/边疆与并立/.test(era))return y!==null?fromYear(y):null;
  if(keys.includes(displayPeriod(era)))return displayPeriod(era);
  return y!==null?fromYear(y):null;
 }
 function capitalPeriod(x){return displayPeriod(classifyCapitalPeriod(x));}
 function tombPeriod(x){return displayPeriod(x.era==='先秦'?(x.preqinPeriod||fromYear(x.sortYear)):x.era==='明清'?capitalPeriod(x):x.era==='秦汉至五代'?'秦汉':x.era);}
 function capitalPeriods(x){return [...new Set((x.records?.length?x.records:[x]).map(capitalPeriod))].sort((a,b)=>keys.indexOf(a)-keys.indexOf(b));}
 function capitalTheme(x,selection={}){const periods=capitalPeriods(x),key=periods.find(k=>selection[k]!==false)||periods[0];return {key,color:colors[key],icon:'ancient-capital-'+key};}
 const capitalSvg=c=>`<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="${c}" stroke="#26313a" stroke-width=".7" stroke-linejoin="round"><path d="M2 8 5 4h10l3 4ZM4 9h12v8h-4v-5H8v5H4ZM2 17h16v2H2Z"/></g></svg>`;
 function capitalImage(color){const size=40,data=new Uint8Array(size*size*4),rgb=color.slice(1).match(/../g).map(v=>parseInt(v,16));const inside=(x,y)=>(y>=4&&y<=8&&x>=5-(y-4)*.75&&x<=15+(y-4)*.75)||(y>=9&&y<=17&&x>=4&&x<=16&&!(x>8&&x<12&&y>12))||(y>=17&&y<=19&&x>=2&&x<=18);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const xx=(x+.5)/2,yy=(y+.5)/2,on=inside(xx,yy),near=[[-.6,0],[.6,0],[0,-.6],[0,.6]].map(([a,b])=>inside(xx+a,yy+b));const c=on?(near.every(Boolean)?rgb:[38,49,58]):near.some(Boolean)?[255,255,255]:null;if(c)data.set([...c,255],(y*size+x)*4);}return {width:size,height:size,data};}
 function legendIcon(svg,color){return `<i class="tomb-era-icon" style="--era-color:${color}" aria-hidden="true">${svg.replace(/stroke="#26313a"/g,'stroke="#fff"')}</i>`;}
 function visitedSvg(svg,done){return done?svg.replace('</svg>','<circle cx="16" cy="4" r="3.8" fill="#dc2626" stroke="#fff" stroke-width=".8"/><path d="m13.9 4 1.4 1.4 2.8-3" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'):svg;}
 function visitedImage(image){
  const data=new Uint8Array(image.data),cx=image.width*.8,cy=image.height*.2,r=image.width*.19;
  const segment=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);};
  const tick=[[cx-r*.52,cy],[cx-r*.18,cy+r*.35],[cx+r*.55,cy-r*.42]];
  for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++){
   const distance=Math.hypot(x+.5-cx,y+.5-cy);if(distance>r+1)continue;
   const white=distance>r-1||Math.min(segment(x+.5,y+.5,tick[0],tick[1]),segment(x+.5,y+.5,tick[1],tick[2]))<1.2;
   data.set(white?[255,255,255,255]:[220,38,38,255],(y*image.width+x)*4);
  }
  return {width:image.width,height:image.height,data};
 }
 const api={colors,keys,displayPeriod,periodSelection,startYear,yearOf,fromYear,tombPeriod,capitalPeriod,capitalPeriods,capitalTheme,capitalSvg,capitalImage,legendIcon,visitedSvg,visitedImage};root.HistoricalPeriods=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
