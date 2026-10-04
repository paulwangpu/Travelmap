(function(root) {
  'use strict';
  function merge(base, supplement) {
    const data=JSON.parse(JSON.stringify(base));
    // Supplement merges are idempotent; original checklist names/site keys are retained.
    if(data.westernRegions?.id===supplement.id)return data;
    const summary={id:supplement.id,total:supplement.entries.length,mapped:0,pending:0,inferred:0,basis:supplement.basis,basisUrl:supplement.basisUrl};
    const era='西域三十六国',nextOrder=Math.max(0,...data.recordItems.map(r=>r.sourceOrder||0));
    for(const [index,entry] of supplement.entries.entries()) {
      const sources=[entry.sourceUrl||supplement.locationUrl,entry.coordinateUrl,supplement.basisUrl,supplement.primaryUrl].filter(Boolean);
      const meta={...entry,basis:supplement.basis,basisUrl:supplement.basisUrl,sources:[...new Set(sources)]};
      if(entry.position==='existing') {
        const site=data.items.find(s=>s.records?.some(r=>r['政权/国号']===entry.existingRegime));
        const record=data.recordItems.find(r=>r.dynasty===entry.existingRegime);
        if(!site||!record)throw new Error('Missing existing western capital: '+entry.name);
        site.westernRegion=meta;record.westernRegion=meta;summary.mapped++;
        continue;
      }
      const mapped=Number.isFinite(entry.lat)&&Number.isFinite(entry.lng);
      if(entry.position==='inferred')summary.inferred++;
      const status=entry.position==='site'?'遗址参照／身份见说明':entry.position==='inferred'?'推测位置，非都城确址':mapped?'概略地望，非都城确址':'地望待考，暂不落点';
      const note=entry.note||status;
      const siteKey='western-region:'+entry.id,name=entry.name+' · '+entry.capital;
      const common={westernRegion:meta,siteKey,currentKey:siteKey,currentPlace:entry.area,confidence:entry.position==='site'?'中':'低',sourceOrder:nextOrder+index+1,...(mapped?{lat:entry.lat,lng:entry.lng}:{})};
      const raw={'时代':era,'政权/国号':entry.name,'政权年代（原文）':'汉代（存续年代不一）','都城性质':status,'都城年代（原文）':'未定','古称':entry.capital,'今称/遗址名':entry.area,'今属行政区':entry.area,'置信度':common.confidence,'备注/争议':note,'来源URL':sources[0],'都城类别码':'P',sourceOrder:common.sourceOrder};
      data.recordItems.push({...common,name,siteName:entry.area,ancientName:entry.capital,dynasty:entry.name,era,admin:entry.area,capitalType:status,capitalYears:'未定',regimeYears:'汉代（存续年代不一）',categoryCode:'P',parentName:entry.name});
      if(mapped) {
        data.items.push({...common,name:entry.name,admin:entry.area,siteNames:[entry.area],ancientNames:[entry.capital],dynasties:[entry.name],eras:[era],capitalTypes:[status],categoryCodes:['P'],categoryLabels:['主要都城'],records:[raw],recordCount:1,sourceEra:era,sourceSite:entry.area,sourceAncientName:entry.capital});
        summary.mapped++;
      } else summary.pending++;
    }
    data.recordCount=data.recordItemCount=data.recordItems.length;
    data.siteCount=data.items.length;
    data.westernRegions=summary;
    return data;
  }
  root.WesternRegions={merge};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.WesternRegions;
})(globalThis);
