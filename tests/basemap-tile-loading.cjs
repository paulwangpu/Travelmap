const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync('basemap-alignment.js','utf8'),identity=(x,y)=>[x,y],response=()=>({ok:true,headers:{get:()=> 'image/png'},arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer});
const provider={tiles:['https://a.test/{z}/{x}/{y}.png','https://b.test/{z}/{x}/{y}.png','https://c.test/{z}/{x}/{y}.png']};
function runtime(fetch,fastTimers=false){const ctx={fetch,AbortController,DOMException,console,clearTimeout,setTimeout:fastTimers?(fn=>setTimeout(fn,1)):setTimeout};vm.createContext(ctx);vm.runInContext(source,ctx);return ctx.BasemapAlignment;}
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 let calls=0,resolveGate;const gate=new Promise(r=>resolveGate=r);
 const api=runtime(async()=>{calls++;await gate;return response();}),c1=new AbortController(),c2=new AbortController();
 const one=api.tile(provider,4,1,1,identity,c1.signal),two=api.tile(provider,4,1,1,identity,c2.signal);
 const cancelled=assert.rejects(one,{name:'AbortError'});await tick();assert.equal(calls,1,'Concurrent consumers must share source request');c1.abort();await cancelled;resolveGate();assert.equal((await two).byteLength,3,'One cancelled consumer must not abort another');
 const cached=await api.tile(provider,4,1,1,identity);assert.equal(calls,1);new Uint8Array(cached)[0]=99;assert.equal(new Uint8Array(await api.tile(provider,4,1,1,identity))[0],1,'Keep cached buffer isolated from renderer mutation');
 let active=0,peak=0,unlock;const pause=new Promise(r=>unlock=r);
 const limited=runtime(async()=>{active++;peak=Math.max(peak,active);await pause;active--;return response();});
 const jobs=Array.from({length:24},(_,i)=>limited.tile(provider,6,i,1,identity));await tick();assert.equal(peak,16);unlock();await Promise.all(jobs);assert.equal(peak,16,'Limit source fetch concurrency');
 const hosts=[];const retry=runtime(async url=>{hosts.push(new URL(url).hostname);return hosts.length===1?{ok:false,status:503}:response();});await retry.tile(provider,4,2,2,identity);assert.notEqual(hosts[0],hosts[1],'Retry a different provider node');
 let fail=true,count=0;const recovery=runtime(async()=>{count++;if(fail)throw Error('offline');return response();});await assert.rejects(recovery.tile(provider,4,3,3,identity));assert.equal(count,3);fail=false;await recovery.tile(provider,4,3,3,identity);assert.equal(count,4,'Do not retain failed pending requests');
 let timeouts=0;const timeout=runtime(async(url,{signal})=>{timeouts++;if(timeouts>1)return response();return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('timeout','AbortError')),{once:true}));},true);await timeout.tile(provider,4,4,4,identity);assert.equal(timeouts,2,'Stalled fetch must time out and retry');
 let aborted=0;const abandon=runtime((url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>{aborted++;reject(new DOMException('abort','AbortError'));},{once:true})));
 const cs=Array.from({length:20},()=>new AbortController()),cancelJobs=cs.map((c,i)=>abandon.tile(provider,5,i,2,identity,c.signal));
 const checks=cancelJobs.map(p=>assert.rejects(p,{name:'AbortError'}));await tick();cs.forEach(c=>c.abort());await Promise.all(checks);await tick();assert.equal(aborted,16,'Cancel active jobs and discard queued jobs');
 console.log('PASS: tile sharing, isolated cancellation, cache reuse, concurrency limit, alternate nodes, timeout recovery and queue cancellation');
})().catch(e=>{console.error(e);process.exitCode=1;});
