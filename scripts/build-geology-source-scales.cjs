// Offline rebuild from the four official /api/v2/defs/sources?scale=... responses.
const fs=require('node:fs');
const categories=['large','medium','small','tiny'],sources=new Map();
for(const category of categories){const payload=JSON.parse(fs.readFileSync(`output/geology-sources-${category}.json`));if(!Array.isArray(payload.success?.data))throw Error(`Invalid ${category} source response`);for(const source of payload.success.data){if(source.scale!==category||!Number.isFinite(Number(source.source_id)))throw Error('Invalid source scale');sources.set(Number(source.source_id),{source_id:source.source_id,name:source.name,scale:source.scale,...(source.map_scale?{map_scale:source.map_scale}:{}),...(source.scale_denominator?{scale_denominator:source.scale_denominator}:{})});}}
fs.writeFileSync('data/geology/source-scales.json',JSON.stringify({updated:'2026-10-05',license:'CC BY 4.0',data:[...sources.values()]}));console.log(`Verified scale metadata: ${sources.size} sources`);
