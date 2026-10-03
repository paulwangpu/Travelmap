// Offline, one-zoom extraction from a user-authorized public map archive.
// Tools and raw archive stay in output/, never in the shipped application.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
async function main(){const root=path.resolve(__dirname,'..'),tools=path.join(root,'output/great-wall-audit-tools/node_modules');
 const {PMTiles,tileIdToZxy}=require(path.join(tools,'pmtiles'));
 const {VectorTile}=await import(require('node:url').pathToFileURL(path.join(tools,'@mapbox/vector-tile/index.js')));
 const {default:Pbf}=await import(require('node:url').pathToFileURL(path.join(tools,'pbf/index.js')));
 const file=process.argv[2]||path.join(root,'output/great-wall-audit/greatwall.pmtiles'),zoom=Number(process.argv[3]||12),buffer=fs.readFileSync(file);
 const source={getKey:()=>file,getBytes:async(offset,length)=>({data:buffer.buffer.slice(buffer.byteOffset+offset,buffer.byteOffset+offset+length)})};
 const pm=new PMTiles(source),header=await pm.getHeader(),entries=[],counts={};
 async function directory(offset,length){for(const e of await pm.cache.getDirectory(source,offset,length,header)){if(!e.runLength)await directory(header.leafDirectoryOffset+e.offset,e.length);else{const [z]=tileIdToZxy(e.tileId);counts[z]=(counts[z]||0)+e.runLength;if(z===zoom)entries.push(e);}}}
 await directory(header.rootDirectoryOffset,header.rootDirectoryLength);console.log(JSON.stringify({zoom,tileCounts:counts,selectedEntries:entries.length}));
 const records=new Map(),layerCounts={},missingIds=[],conflicts=[];let tileCount=0;
 for(const e of entries)for(let j=0;j<e.runLength;j++){const [z,x,y]=tileIdToZxy(e.tileId+j),tile=await pm.getZxy(z,x,y);if(!tile)throw Error('Missing indexed tile');const vt=new VectorTile(new Pbf(new Uint8Array(tile.data)));
  for(const [layerName,layer] of Object.entries(vt.layers))for(let i=0;i<layer.length;i++){const f=layer.feature(i),g=f.toGeoJSON(x,y,z),p=g.properties,key=p.code||p.CODE||p.id||f.id;if(key===undefined){missingIds.push({layerName,properties:p});continue;}const id=String(key);let r=records.get(id);if(!r){r={type:'Feature',id,properties:{...p,_layer:layerName},geometry:g.geometry,parts:[]};records.set(id,r);layerCounts[layerName]=(layerCounts[layerName]||0)+1;}else if(JSON.stringify({...r.properties,_layer:undefined})!==JSON.stringify(p))conflicts.push({id,layerName});
   if(JSON.stringify({...r.properties,_layer:undefined})!==JSON.stringify(p))r.propertyConflict=true;
   r.parts.push(g.geometry);
  }
  tileCount++;if(tileCount%10000===0)console.log(JSON.stringify({tiles:tileCount,records:records.size}));
 }
 const metadata=await pm.getMetadata(),out=path.join(root,'output/great-wall-audit');fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'reference.geojson'),JSON.stringify({type:'FeatureCollection',features:[...records.values()]}));
 const report={source:'https://shanqiao.app/map/greatwall.pmtiles',attribution:'Great Wall Archive',license:'CC BY 4.0',sha256:crypto.createHash('sha256').update(buffer).digest('hex'),zoom,tileCount,records:records.size,layerCounts,missingIds:missingIds.slice(0,10),missingIdCount:missingIds.length,propertyConflicts:conflicts.length,tileCounts:counts,metadata};
 fs.writeFileSync(path.join(out,'extraction.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({...report,metadata:undefined},null,2));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
