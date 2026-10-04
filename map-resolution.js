(function(root){
  'use strict';
  function canvasLimits(gl) {
    if(!gl)return [4096,4096];
    const texture=gl.getParameter(gl.MAX_TEXTURE_SIZE),buffer=gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),viewport=gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    const limit=dimension=>Math.max(1,Math.floor(Math.min(8192,texture||4096,buffer||4096,viewport?.[dimension]||4096)));
    return [limit(0),limit(1)];
  }
  function options(document,window) {
    const canvas=document.createElement('canvas');
    let gl;
    try {gl=canvas.getContext('webgl2')||canvas.getContext('webgl');return {maxCanvasSize:canvasLimits(gl),pixelRatio:window.devicePixelRatio||1};}
    catch {return {maxCanvasSize:[4096,4096],pixelRatio:window.devicePixelRatio||1};}
    finally {gl?.getExtension('WEBGL_lose_context')?.loseContext();}
  }
  function observe(map,window) {
    let frame=null,media=null,disposed=false;
    const resize=()=>{
      frame=null;if(disposed)return;
      const container=map.getContainer();if(!container.clientWidth||!container.clientHeight)return;
      const ratio=window.devicePixelRatio||1;
      if(map.getPixelRatio()!==ratio)map.setPixelRatio(ratio);
      else map.resize();
    };
    const schedule=()=>{if(frame===null)frame=window.requestAnimationFrame(resize);};
    const watchDpi=()=>{media?.removeEventListener('change',dpiChanged);media=window.matchMedia?.(`(resolution: ${window.devicePixelRatio||1}dppx)`);media?.addEventListener('change',dpiChanged);};
    const dpiChanged=()=>{watchDpi();schedule();};
    const observer=window.ResizeObserver?new window.ResizeObserver(schedule):null;
    observer?.observe(map.getContainer());window.addEventListener('resize',schedule);watchDpi();schedule();
    const dispose=()=>{disposed=true;observer?.disconnect();window.removeEventListener('resize',schedule);media?.removeEventListener('change',dpiChanged);if(frame!==null)window.cancelAnimationFrame(frame);};
    map.on('remove',dispose);return dispose;
  }
  const api={canvasLimits,options,observe};root.MapResolution=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
