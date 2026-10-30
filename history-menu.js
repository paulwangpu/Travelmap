/* Shared controls for history sources. Snapshot-only sources retain their real dates. */
globalThis.HistoryMenu=(()=>{
 let context;
 const ranges={chgis:{min:-224,max:1990,key:'chgisYear',step:'chgisYearStep'},jiangshan:{min:-403,max:1948,key:'jiangshanYear',step:'jiangshanYearStep'},twha:{min:-3500,max:2019,key:'twhaYear',step:'twhaYearStep'}};
 const opts=()=>context.state().mapOverlays;
 const index=n=>n>0?n-1:n,fromIndex=n=>n>=0?n+1:n;
 const date=(n,en)=>`${n}${en?'':'年'}`;
 const active=()=>opts().historySource||'chgis';
 function stepFor(source){const r=ranges[source],n=Number(opts()[r.step]??1);return Number.isInteger(n)&&n>=1&&n<=index(r.max)-index(r.min)?n:1;}
 function capture(source){const o=opts(),r=ranges[source],saved=o.historySharedControls||{};return {year:Number(source==='research'?o.researchYear??1820:o[r?.key]??1820),opacity:Number(source==='twha'?o.twhaOpacity??55:o.chgisOpacity??13),step:r?stepFor(source):saved.step??1,level:source==='twha'?saved.level||o.chgisLevel||o.jiangshanLevel||'prefecture':o[{chgis:'chgisLevel',jiangshan:'jiangshanLevel',research:'researchLevel'}[source]]||'prefecture'};}
 function switchSource(target){
  if(!['chgis','jiangshan','twha','research'].includes(target))return false;
  const o=opts(),current=capture(active()),previous=o.historyAppliedControls,shared={...(o.historySharedControls||current)};
  for(const key of ['year','opacity','step','level'])if(!previous||current[key]!==previous[key])shared[key]=current[key];
  o.historySharedControls=shared;o.chgisOpacity=o.twhaOpacity=shared.opacity;
  if(target==='research'){o.researchYear=[2,742,1102,1820].reduce((best,n)=>Math.abs(n-shared.year)<Math.abs(best-shared.year)?n:best,2);o.researchLevel=shared.level==='province'?'province':'prefecture';}
  else {const r=ranges[target];o[r.key]=Math.max(r.min,Math.min(r.max,shared.year))||1;o[r.step]=Math.max(1,Math.min(index(r.max)-index(r.min),shared.step));if(target==='chgis')o.chgisLevel=['province','prefecture','county'].includes(shared.level)?shared.level:'prefecture';if(target==='jiangshan')o.jiangshanLevel=shared.level==='province'?'province':'prefecture';}
  o.historySource=target;o.historyAppliedControls=capture(target);return true;
 }
 function manual(select,n,en){
  let option=[...select.options].find(o=>Number(o.value)===n&&!o.hasAttribute('data-history-manual')&&!o.hasAttribute('data-jiangshan-manual'));
  if(!option){option=select.querySelector('[data-history-manual],[data-jiangshan-manual]');if(!option){option=document.createElement('option');option.setAttribute('data-history-manual','');select.prepend(option);}option.value=String(n);option.textContent=(en?'Manual':'手动')+' · '+date(n,en);}
  select.value=String(n);
 }
 function format(el,{source,year,english=false}){
  if(!context)return;
  const heading=el.querySelector('strong');if(heading)heading.textContent=english?'History':'历史';
  el.dataset.historyMenuSource=source;
  for(const select of el.querySelectorAll(':scope > label > select'))select.parentElement.classList.add('history-menu-row');
  let period=el.querySelector('[data-chgis-period],[data-jiangshan-phase],[data-research-period],[data-history-period]');
  const yearRow=el.querySelector('.chgis-year-control'),opacity=el.querySelector('.historical-admin-opacity');
  if(yearRow){
   yearRow.querySelector('output').textContent=date(year,english);
   if(!period){const row=document.createElement('label');row.className='history-menu-row';row.innerHTML=`<span>${english?'Period':'时期'}</span><select data-history-period></select>`;period=row.querySelector('select');for(const n of [-3500,-221,2,220,618,742,960,1200,1290,1415,1582,1820,1911,1945,2019]){const o=document.createElement('option');o.value=n;o.textContent=date(n,english);period.append(o);}yearRow.before(row);}
   if(source==='chgis'){const selected=period.selectedOptions[0];if(selected&&/^(?:公元前\d+年|\d+年|\d+ BC|AD \d+)$/.test(selected.textContent.trim()))selected.textContent=(english?'Manual':'手动')+' · '+date(year,english);}
   if(source==='twha')manual(period,year,english);
   el.querySelector('.twha-year-step')?.remove();
   const r=ranges[source],step=stepFor(source),row=document.createElement('div');row.className='twha-year-step history-year-step';
   row.innerHTML=`<label for="historyYearStep">${english?'Step':'步长'}</label><input id="historyYearStep" data-history-year-step type="number" min="1" max="${index(r.max)-index(r.min)}" step="1" value="${step}" aria-label="${english?'Year increment':'年份增量'}"><span>${english?'years':'年'}</span><button type="button" data-history-year-shift="-1" aria-label="${english?'Earlier':'向前'} ${step} ${english?'years':'年'}" ${year<=r.min?'disabled':''}>←</button><button type="button" data-history-year-shift="1" aria-label="${english?'Later':'向后'} ${step} ${english?'years':'年'}" ${year>=r.max?'disabled':''}>→</button>`;
   yearRow.after(row);if(opacity)row.after(opacity);
  }else if(period&&opacity)period.parentElement.after(opacity);
  if(opacity&&opacity.firstChild?.nodeType===3){const caption=document.createElement('span');caption.textContent=opacity.firstChild.textContent.trim();opacity.firstChild.replaceWith(caption);}
 }
 function change(e){const t=e.target,r=ranges[active()];if(!r)return false;
  if(t.hasAttribute('data-history-year-step')){const n=Number(t.value);opts()[r.step]=Number.isInteger(n)&&n>=1?Math.min(n,index(r.max)-index(r.min)):1;}
  else if(t.hasAttribute('data-history-period'))opts()[r.key]=Number(t.value);
  else return false;context.save();context.render();return true;
 }
 function click(e){const t=e.target.closest?.('[data-history-year-shift]'),r=ranges[active()];if(!t||!r)return false;const n=Number(opts()[r.key]??1820),delta=Number(t.dataset.historyYearShift)*stepFor(active());opts()[r.key]=fromIndex(Math.max(index(r.min),Math.min(index(r.max),index(n)+delta)));context.save();context.render();return true;}
 function input(e,el){const t=e.target;if(!t.matches?.('[data-chgis-year],[data-jiangshan-year],[data-twha-year]'))return false;const n=fromIndex(Number(t.value)),en=context.language()==='en';t.parentElement.querySelector('output').textContent=date(n,en);const select=el.querySelector('[data-chgis-period],[data-jiangshan-phase],[data-history-period]');if(select)manual(select,n,en);return true;}
 return {init:c=>context=c,format,change,click,input,switchSource};
})();
