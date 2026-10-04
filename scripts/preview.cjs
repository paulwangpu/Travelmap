// Local-only static preview with HTTP Range support for PMTiles.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),port=Number(process.argv[2]||4173);
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.geojson':'application/geo+json','.pbf':'application/x-protobuf','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  let file;
  try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(file===root||fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){res.writeHead(404).end();return;}
    let start=0,end=stat.size-1,status=200;
    const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
    if(range){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;if(start>end){res.writeHead(416,{'Content-Range':'bytes */'+stat.size}).end();return;}status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);}
    res.writeHead(status,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':Math.max(0,end-start+1),'Accept-Ranges':'bytes','Cache-Control':'no-cache'});
    if(req.method==='HEAD'||stat.size===0)res.end();else fs.createReadStream(file,{start,end}).pipe(res);
  });
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://localhost:${port}`));
