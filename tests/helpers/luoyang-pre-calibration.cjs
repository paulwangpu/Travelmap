// Earlier addition tests keep checking their historical snapshots. The current
// documented corrections are checked directly by luoyang-layout-calibration.cjs.
module.exports=function restoreAdditionSnapshot(data){
 data=require('./luoyang-before-user-layout.cjs')(data);
 const fs=require('fs'),audit=JSON.parse(fs.readFileSync('docs/luoyang-layout-calibration.json','utf8'));
 const before=new Map(audit.before.map(f=>[f.properties.sourceId,f]));
 return {...data,features:data.features.filter(f=>!f.properties.luoyangRiverAddition).map(f=>before.get(f.properties.sourceId)||f)};
};
