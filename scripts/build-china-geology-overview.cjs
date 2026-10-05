// Preserve actual Macrostrat carto z4 polygons; this does not increase data precision.
const fs=require('node:fs'),path=require('node:path');
const clipping=require('polygon-clipping'),{VectorTile,Pbf}=require('../vendor/geology/vector-tile');
const root=path.resolve(__dirname,'..');
const china=JSON.parse(fs.readFileSync(path.join(root,'data/boundaries/country/world.geojson'))).features.find(f=>f.properties['ISO3166-1-Alpha-3']==='CHN').geometry.coordinates;
const features=[];
for(let x=11;x<=14;x++)for(let y=5;y<=7;y++){
  const latitude=row=>Math.atan(Math.sinh(Math.PI*(1-2*row/16)))*180/Math.PI;
  const west=x/16*360-180,east=(x+1)/16*360-180,north=latitude(y),south=latitude(y+1);
  const tileBounds=[[[west,south],[east,south],[east,north],[west,north],[west,south]]];
  const bytes=fs.readFileSync(path.join(root,`output/china-overview-tiles/4-${x}-${y}.mvt`));
  // Node Buffers can have a nonzero byteOffset in a pooled backing buffer.
  // Pbf 4's DataView assumes offset zero when reading float/double fields.
  const layer=new VectorTile(new Pbf(new Uint8Array(bytes))).layers.units;
  for(let i=0;i<(layer?.length||0);i++){
    const f=layer.feature(i);if(f.type!==3||Number(f.properties.source_id)!==154)continue;
    const geo=f.toGeoJSON(x,y,4),coords=geo.geometry.type==='Polygon'?[geo.geometry.coordinates]:geo.geometry.coordinates;
    // Remove MVT tile buffers so adjacent fragments do not paint twice at seams.
    const intersection=clipping.intersection(coords,china,tileBounds);if(!intersection.length)continue;
    const p=f.properties;
    for(const key of ['best_age_top','best_age_bottom'])if(p[key]!=null&&(!Number.isFinite(p[key])||p[key]<0||p[key]>1000000))throw Error(`Invalid ${key} in tile 4/${x}/${y}: ${p[key]}`);
    features.push({type:'Feature',properties:{...p,t_age:p.best_age_top??p.best_t_age,b_age:p.best_age_bottom??p.best_b_age,t_int_name:p.t_int_name||p.t_int,age:p.age||p.t_int_name||p.t_int,overview:true},geometry:{type:'MultiPolygon',coordinates:intersection}});
  }
}
const output=path.join(root,'data/geology/china-overview.geojson');fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify({type:'FeatureCollection',metadata:{source:'Macrostrat carto',source_id:154,compilationZoom:4,date:'2026-10-05',license:'CC BY 4.0',precision:'Global overview; numeric map scale unavailable',boundary:'Existing app China country geometry',attribution:'Macrostrat · CC BY 4.0 · original map references retained'},features}));
console.log(`${features.length} clipped polygons; ${fs.statSync(output).size} bytes`);
