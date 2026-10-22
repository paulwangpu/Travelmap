// Restore the reviewed ward layout when checking earlier historical snapshots.
module.exports=function(data){
 data=require('./luoyang-before-river-clearance.cjs')(data);
 const fs=require('fs'),a=JSON.parse(fs.readFileSync('docs/luoyang-palace-gates.json','utf8')),before=new Map(a.modifiedBefore.map(f=>[f.properties.sourceId,f]));
 return {...data,features:data.features.filter(f=>!f.properties.luoyangGateSupplement).map(f=>before.get(f.properties.sourceId)||f)};
};
