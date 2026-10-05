const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../sw.js'),'utf8');
const handlers = {}, writes = [];
let online = true, cached = {version:'old'}, calls=0;
const latest = {version:'new',ok:true,clone(){return this;}};
const ctx = {URL,self:{location:{origin:'http://localhost'},addEventListener:(type,handler)=>handlers[type]=handler},
  caches:{match:async()=>cached,open:async()=>({put:async(_request,response)=>{cached=response;writes.push(response);}})},
  fetch:async(_request,options)=>{calls++;assert.equal(options.cache,'no-store');if(!online)throw Error('offline');return latest;}};
vm.runInNewContext(source,ctx);
async function request(file){let response;handlers.fetch({request:{method:'GET',url:`http://localhost/data/${file}?v=3`,mode:'cors'},respondWith:promise=>response=promise});return response;}
(async()=>{
  assert.equal(await request('china-ancient-capitals.json'),latest);
  assert.equal(calls,1);assert.equal(writes.length,1);
  online=false;
  assert.equal(await request('china-ancient-capitals.json'),latest);
  assert.equal(await request('western-regions-36.json'),latest);
  cached=null;
  await assert.rejects(request('china-ancient-capitals.json'),/offline/);
  const app=fs.readFileSync(require.resolve('../app.js'),'utf8');
  assert.match(app,/addEventListener\("controllerchange"/);
  assert.match(app,/chinaAncientCapitalsPromise = null;\s*loadChinaAncientCapitals\(\)/);
  const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
  const version=html.match(/src="(app.js\?v=\d+)"/)[1];
  assert(source.includes('./'+version));
  console.log('PASS: latest capital data online, offline fallback, update invalidation and shell version alignment');
})().catch(error=>{console.error(error);process.exitCode=1;});
