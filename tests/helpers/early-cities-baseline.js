const before=require('../../docs/early-cities-audit.json').baselineRestores.dholavira;
module.exports=function restore(value){
  if(Array.isArray(value))return value.map(restore);
  if(!value||typeof value!=='object')return value;
  if(value.key==='dholavira'&&value.urbanPeriods)return structuredClone(before);
  return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,restore(v)]));
};
