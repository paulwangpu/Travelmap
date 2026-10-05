/* Local availability reuses viewport legend records; no coverage drawing. */
(function(root){
  let revision=0,controller;
  function prepare(map,boxes,zoom,en){revision++;controller?.abort();const status=document.getElementById('geologyCoverageStatus');if(status)status.textContent=en?'Checking local availability…':'正在核查局部详图…';}
  async function show(map,boxes,zoom,en,records=[]){const request=++revision;controller?.abort();controller=new AbortController();const status=document.getElementById('geologyCoverageStatus');if(!status)return;
    try{const meta=await root.GeologyAuto.sources(controller.signal);if(request!==revision)return;const local=records.some(u=>meta.get(Number(u.source_id))?.scale==='large');status.textContent=local?(en?'Local detail found in this view · complete coverage unverified':'当前视野已发现局部详图 · 完整覆盖范围未核实'):(zoom<10?(en?'Local coverage unverified at this zoom.':'当前缩放下局部详图覆盖范围未核实。'):(en?'No local detail found in the loaded data for this view.':'当前视野已读取数据中未发现局部详图。'));}catch(error){if(request===revision)status.textContent=en?'Local availability query failed · retry':'局部详图查询失败 · 可刷新重试';}
  }
  function stop(){revision++;controller?.abort();}
  root.GeologyCoverage={show,stop,prepare};
})(typeof window!=='undefined'?window:globalThis);
