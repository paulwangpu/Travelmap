module.exports=function(data){
 data=require('./luoyang-before-west-retrace.cjs')(data);
 const fs=require('fs'),a=JSON.parse(fs.readFileSync('docs/luoyang-river-ward-clearance.json','utf8')),before=new Map(a.before.map(f=>[f.properties.sourceId,f]));
 return {...data,features:data.features.filter(f=>!f.properties.luoyangWestDetail).map(f=>before.get(f.properties.sourceId)||f)};
};
