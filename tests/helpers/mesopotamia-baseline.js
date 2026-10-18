// Historical audits compare their original snapshots. Undo only the documented
// metadata/reference corrections; the new audit separately locks all geometry.
const restore=require('../../docs/mesopotamia-details-audit.json').baselineRestores;
module.exports=function priorSnapshot(value){
  if(Array.isArray(value))return value.map(priorSnapshot);
  if(!value||typeof value!=='object')return value;
  if(value.key==='dholavira'&&value.urbanPeriods)return structuredClone(require('../../docs/early-cities-audit.json').baselineRestores.dholavira);
  // Later roots are append-only and locked separately by mesopotamia-capitals.cjs.
  if(value.coverageAudit&&Array.isArray(value.items)&&Array.isArray(value.recordItems)&&value.items.some(s=>s.classicalSiteKey==='kish')){
    const prior=require('../../docs/mesopotamia-capitals-audit.json').baseline;
    value={...value,items:value.items.slice(0,prior.roots),recordItems:value.recordItems.slice(0,prior.records),siteCount:prior.roots,recordCount:prior.records,recordItemCount:prior.records,coverageAudit:{...value.coverageAudit,supplements:value.coverageAudit.supplements.filter(s=>!['docs/mesopotamia-capitals-audit.json','docs/middle-east-capitals-audit.json','docs/early-cities-audit.json'].includes(s.report))}};
  }
  if(value.type==='Feature'&&restore.featureProperties[value.properties?.id])return {...value,properties:structuredClone(restore.featureProperties[value.properties.id])};
  if(Array.isArray(value.records)&&Array.isArray(value.boundaryRelations)&&restore.rootBoundaryRelations[value.siteKey])return {...value,boundaryRelations:structuredClone(restore.rootBoundaryRelations[value.siteKey])};
  if(value.key&&restore.siteFocusBounds[value.key])return {...value,focusBounds:structuredClone(restore.siteFocusBounds[value.key])};
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,priorSnapshot(item)]));
};
