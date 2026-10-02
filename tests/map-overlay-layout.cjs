const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync(require.resolve('../app.js'),'utf8');
const css=fs.readFileSync(require.resolve('../styles.css'),'utf8');
const start=app.indexOf('function updateMapOverlayInsets() {'),end=app.indexOf('\nfunction ensureCheckinOverlayVisible()',start);
function layout(narrow,visibleStatus,drawer=false) {
  const vars={},surface={height:800,top:0,bottom:800};
  const box=(top,height,width=200)=>({getBoundingClientRect:()=>({top,bottom:top+height,height,width})});
  const native=box(narrow?690:750,40),detail=box(480,200);
  const map={getBoundingClientRect:()=>surface,style:{setProperty:(k,v)=>vars[k]=v},querySelectorAll:()=>drawer?[native,detail]:[native]};
  const panel=box(8,140),debug={...box(0,50),hidden:!visibleStatus},legends={...box(0,200),hidden:false};
  const doc={querySelector:s=>s==='.map-surface'?map:s==='#loadingDebug'?debug:s==='#mapOverlayLegends'?legends:panel,documentElement:{style:{removeProperty(){},setProperty(){}}}};
  const context={document:doc,window:{matchMedia:q=>({matches:q.includes('700')?narrow:narrow})},getComputedStyle:()=>({display:'block'})};
  vm.runInNewContext(app.slice(start,end)+'\nupdateMapOverlayInsets();',context);
  return vars;
}
assert.equal(layout(false,true)['--map-status-bottom'],'250px');
assert.equal(layout(false,true)['--map-legend-bottom'],'42px');
assert.equal(layout(true,true)['--map-legend-bottom'],'118px');
assert.equal(layout(true,false)['--map-legend-bottom'],'118px');
assert.equal(layout(true,true,true)['--map-status-bottom'],'536px');
assert.deepEqual(layout(true,true),layout(true,false));
assert.deepEqual(layout(false,true),layout(false,false));
assert.match(css,/\.loading-debug \{ left:12px; right:auto;/);
assert.doesNotMatch(css,/bottom: 122px/);
console.log('PASS: status above fixed legends; status show/hide leaves desktop and mobile legend layout unchanged');
