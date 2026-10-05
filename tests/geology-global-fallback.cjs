const assert=require('node:assert/strict'),fs=require('node:fs');
global.GeologyVectorTile=require('../vendor/geology/vector-tile');const providers=require('../geology-providers');
const calls=[];
global.fetch=async(url,{signal}={})=>{
  if(signal?.aborted)throw new DOMException('Aborted','AbortError');calls.push(url);
  const [,z,x,y]=url.match(/carto\/(\d+)\/(\d+)\/(\d+)$/)||[];
  const file=`tests/fixtures/geology/${z}-${x}-${y}.mvt`;
  const bytes=fs.existsSync(file)?fs.readFileSync(file):new Uint8Array();
  return {ok:true,arrayBuffer:async()=>new Uint8Array(bytes).buffer};
};
(async()=>{
  const auto=providers.chooseAt(null,'auto'),globalMap=providers.chooseAt(null,'global');
  assert.equal(auto.render.maxzoom,14);assert.equal(globalMap.render.maxzoom,2);assert.equal(providers.overview.render.maxzoom,4);
  for(const[lng,lat]of[[139.7,35.7],[77.6,12.97],[36.82,-1.29],[-58.38,-34.6]]){
    const result=await auto.inspect(lng,lat,10);assert(result.length);assert(result.every(u=>u.overview));
    const legend=await auto.legend([[lng-.01,lat-.01,lng+.01,lat+.01]],10);
    assert(result.every(u=>legend.some(v=>v.map_id===u.map_id&&v.color===u.color)));
    assert(Array.isArray(await globalMap.inspect(lng,lat,10)));
    const before=calls.length;await auto.inspect(lng,lat,10);assert.equal(calls.length,before);
  }
  assert(calls.some(url=>url.includes('/carto/10/')));assert(calls.some(url=>url.includes('/carto/4/')));
  const before=calls.length;await globalMap.inspect(139.7,35.7,14);assert.equal(calls.length,before);
  assert.deepEqual(await auto.inspect(0,-80,10),[]);
  const aborted=new AbortController();aborted.abort();await assert.rejects(auto.inspect(10,10,12,aborted.signal),{name:'AbortError'});
  console.log('PASS: Japan/India/Kenya/Argentina fallback, matching legend and primary, global-mode overzoom, ocean no-data, cache and cancellation');
})();
