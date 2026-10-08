/* Public GeoEPR 2021 ArcGIS snapshot; polygons describe research coverage. */
globalThis.EthnicRegions = (() => {
  const service = 'https://services3.arcgis.com/9nfxWATFamVUTTGb/arcgis/rest/services/Ethnicities/FeatureServer/0/query';
  let context, data, pending, popup, popupFeatures = [], revision = 0, renderedDataset = '', renderedColorMode = '';
  const cache = new Map(), requests = new Map();
  const dataset = () => ['geoepr','language'].includes(context?.state().mapOverlays.ethnicRegionsSource) ? context.state().mapOverlays.ethnicRegionsSource : 'greg';
  const gregService = 'https://services6.arcgis.com/C0HVLQJI37vYnazu/arcgis/rest/services/Global_Ethnic_Groups/FeatureServer/10/query';
  const labelLayers = [0,3,6,9].map(zoom => `ethnic-regions-label-${zoom}`);
  let activeMap = null;
  function labelProperties(feature) {
    const p = feature.properties;
    p.labelEn = p.group_;
    p.labelZh = p.dataset === 'language' ? p.nameZh : p.dataset === 'greg' ? p.group_.split(' / ').map(n => GregTranslations.translate(n,p.countryCode)).join('／') : EthnicTranslations.shortGroup(p.group_,p.statename);
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    let area = 0;
    for (const polygon of polygons) {
      const ring = polygon[0]; let sum = 0;
      for (let i=1;i<ring.length;i++) {
        let delta = ring[i][0]-ring[i-1][0];
        if (delta>180) delta-=360; if (delta < -180) delta+=360;
        sum += delta*Math.PI/180*(2+Math.sin(ring[i-1][1]*Math.PI/180)+Math.sin(ring[i][1]*Math.PI/180));
      }
      area += Math.abs(sum)*6371*6371/2;
    }
    p.labelMinZoom = area >= 100000 ? 0 : area >= 10000 ? 3 : area >= 500 ? 6 : 9;
    if(p.entryKind==='dialect-area')p.labelMinZoom=Math.max(6,p.labelMinZoom);
    if(p.entryKind==='unclassified-area')p.labelMinZoom=9;
    p.labelOrder = -area;
  }
  // Labels use interior points so combined names describe the same location.
  function overlapLabels(collection) {
    const parts = [], grid = new Map();
    const insideRing = ([x,y],ring) => {
      let inside = false;
      for (let i=0,j=ring.length-1;i<ring.length;j=i++) {
        const [a,b]=ring[i], [c,d]=ring[j];
        if ((b>y)!==(d>y) && x<(c-a)*(y-b)/(d-b)+a) inside=!inside;
      }
      return inside;
    };
    const inside = (point,rings) => insideRing(point,rings[0]) && !rings.slice(1).some(r=>insideRing(point,r));
    for (const feature of collection.features) {
      const polygons=feature.geometry.type==='Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      for (const rings of polygons) {
        const xs=rings[0].map(p=>p[0]), ys=rings[0].map(p=>p[1]);
        const box=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
        const part={feature,rings,box}; parts.push(part);
        for(let x=Math.floor(box[0]/5);x<=Math.floor(box[2]/5);x++) for(let y=Math.floor(box[1]/5);y<=Math.floor(box[3]/5);y++) {
          const key=x+','+y;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(part);
        }
      }
    }
    const features=[], placements=new Map();
    for(const part of parts) {
      const {box,rings,feature}=part; let point=null, width=-1;
      for(const fraction of [0.5,0.25,0.75]) {
        const y=box[1]+(box[3]-box[1])*fraction, crossings=[];
        for(const ring of rings) for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
          const [a,b]=ring[i],[c,d]=ring[j];
          if((b>y)!==(d>y))crossings.push(a+(c-a)*(y-b)/(d-b));
        }
        crossings.sort((a,b)=>a-b);
        for(let i=0;i+1<crossings.length;i++) {
          const candidate=[(crossings[i]+crossings[i+1])/2,y], span=crossings[i+1]-crossings[i];
          if(span>width && inside(candidate,rings)){point=candidate;width=span;}
        }
      }
      if(!point)continue;
      const candidates=grid.get(Math.floor(point[0]/5)+','+Math.floor(point[1]/5))||[];
      const matches=[...new Set(candidates.filter(p=>point[0]>=p.box[0]&&point[0]<=p.box[2]&&point[1]>=p.box[1]&&point[1]<=p.box[3]&&inside(point,p.rings)).map(p=>p.feature))];
      const component={geometry:{type:'Polygon',coordinates:rings},properties:{...feature.properties}};
      labelProperties(component);
      const names=key=>[...new Set(matches.filter(f=>f.properties.labelMinZoom<=component.properties.labelMinZoom).map(f=>f.properties[key]))].sort().join(' / ');
      const labelEn=names('labelEn'), labelZh=names('labelZh');
      const label={type:'Feature',geometry:{type:'Point',coordinates:point},properties:{labelEn,labelZh,labelMinZoom:component.properties.labelMinZoom,labelOrder:component.properties.labelOrder-matches.length*1e9,placementArea:component.properties.labelOrder}};
      // One placement per record and name combination; tiny disconnected islands
      // no longer repeat a label with the visibility of the entire territory.
      const key=collection.features.indexOf(feature)+'|'+labelEn;
      const previous=placements.get(key);
      if(!previous || label.properties.placementArea<previous.properties.placementArea) placements.set(key,label);
    }
    features.push(...placements.values());
    return {type:'FeatureCollection',features};
  }
  // Explicit spelling variants only: mixed and religious groups remain distinct.
  const nameAliases = {
    mongolians:'mongols', uighur:'uyghur', kazakh:'kazakhs', kirghiz:'kyrgyz', dayaks:'dayak',
    anyuak:'anuak', azeri:'azerbaijanis', 'russian-speakers':'russian speakers',
    'bosniak/muslims':'bosniaks/muslims', gartfuna:'garifuna',
    'herero, mbanderu':'herero/mbanderu',
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const english = () => context.language() === 'en';
  function canonicalName(properties) {
    if (properties.dataset === 'language') return `language:${properties.languageId}`;
    if (properties.dataset === 'greg') return `greg:${properties.groupIds}`;
    const kin = globalThis.EthnicKin?.byId[properties.gwgroupid];
    if (kin?.length === 1) return `tek:${kin[0]}`;
    // Several kin links denote an umbrella record, not one equivalent ethnicity.
    if (kin?.length > 1) return `tek-mixed:${kin.join(',')}`;
    const name = String(properties.group_ ?? '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
    // The African Yao people and the Chinese Yao ethnic group are unrelated.
    if (name === 'yao') return properties.statename === 'China' ? 'yao:china' : 'yao:africa';
    return nameAliases[name] || name || `unnamed:${properties.gwgroupid}`;
  }
  const languageColorMode=()=>context?.state().mapOverlays.languageColorMode==='language'?'language':'affinity';
  function color(properties, mode=languageColorMode()) {
    if(properties.dataset==='language' && mode==='affinity') {
      const family=properties.family||'';
      if(!family || ['Bookkeeping','Unclassifiable','Unattested','Speech Register','Pidgin'].includes(family))return 'hsl(210, 12%, 55%)';
      const mainHues={'Sino-Tibetan':135,'Indo-European':215,'Austronesian':30,'Afro-Asiatic':355,'Austroasiatic':75,'Dravidian':275,'Turkic':185,'Tai-Kadai':95,'Hmong-Mien':160,'Uralic':245,'Atlantic-Congo':320,'Mongolic-Khitan':195,'Tungusic':50,'Japonic':45,'Koreanic':290};
      const majorFamilies=['Sino-Tibetan','Indo-European','Austronesian','Afro-Asiatic','Atlantic-Congo','Dravidian','Turkic','Austroasiatic','Tai-Kadai','Hmong-Mien','Uralic','Mongolic-Khitan','Tungusic'];
      if(!majorFamilies.includes(family))return 'hsl(210, 12%, 55%)';
      let familyHash=2166136261;for(const c of family)familyHash=Math.imul(familyHash^c.charCodeAt(0),16777619)>>>0;
      const index=properties.colorBranchIndex??0;
      const count=Math.max(1,properties.colorBranchCount??1);
      const hue=mainHues[family]??familyHash%360;
      // A fixed hue and saturation identify the family; branches vary only in shade.
      const range=family==='Turkic'?[39,55]:[30,66];
      const lightness=count===1?48:range[0]+index/(count-1)*(range[1]-range[0]);
      return 'hsl('+hue+', 72%, '+lightness.toFixed(2)+'%)';
    }
    let hash = 2166136261;
    for (const c of canonicalName(properties)) hash = Math.imul(hash ^ c.charCodeAt(0),16777619) >>> 0;
    // Derive a wider, stable palette from the name rather than country-specific IDs.
    return `hsl(${hash % 360}, ${58 + (hash >>> 9) % 20}%, ${42 + (hash >>> 17) % 15}%)`;
  }
  function html(features) {
    if(features[0]?.properties.dataset==='language') {
      const unique=[...new Map(features.map(f=>[f.properties.languageId,f])).values()];
      return '<strong>'+(english()?'Language distribution · Atlas 2007':'语言分布 · 2007 年地图集')+'</strong>'+unique.map(({properties:p})=>'<p><b>'+escape(english()?p.group_:p.nameZh)+'</b>'+(!english()&&p.nameZh!==p.group_?'<br><small>'+escape(p.group_)+'</small>':'')+(!english() && (p.nameZhKind==='transliteration'||p.nameZhNote) ? '<br><small>'+escape((p.nameZhKind==='transliteration'?'中文名称为音译。':'')+(p.nameZhNote||''))+'</small>' : '')+'<br>'+escape(english()?'Family: '+(p.family||'Unclassified'):'语系：'+(p.familyZh||p.family||'未分类'))+(p.entryKind?'<br><small>'+escape(english()?({'dialect-area':'Dialect area','language-group-area':'Language group area','family-area':'Family area','unclassified-area':'Classification pending'}[p.entryKind]||''):({'dialect-area':'方言区域','language-group-area':'语言群区域','family-area':'语系整体范围','unclassified-area':'分类待核实'}[p.entryKind]||''))+'</small>':'')+(/^[a-z]{4}\d{4}$/.test(p.glottocode||p.languageId)?'<br><a href="https://glottolog.org/resource/languoid/id/'+encodeURIComponent(p.glottocode||p.languageId)+'" target="_blank" rel="noopener">Glottolog ↗</a>':'')+'</p>').join('')+'<small>'+(english()?'Glottography · Asher & Moseley (2007), contemporary speaker areas. Not a live census.':'Glottography · 展示原地图集时期的语言使用范围，不代表当前人口占比。')+'</small>';
    }
    if (features[0]?.properties.dataset === 'greg') {
      const unique = [...new Map(features.map(f => [f.properties.gwgroupid,f])).values()];
      return '<strong>GREG · 1964</strong>' + unique.map(({properties:p}) => '<p><b title="' + escape(p.group_) + '">' + escape(english() ? p.group_ : p.group_.split(' / ').map(n => GregTranslations.translate(n,p.countryCode)).join('／')) + '</b></p>').join('') + '<small>' + (english() ? 'Historical ethnic settlement areas · 1964; mixed groups may share an area.' : '1964 年历史民族聚居范围；同一区域可能包含多个族群。') + '</small>';
    }
    const unique = [...new Map(features.map(f => [f.properties.gwgroupid, f])).values()];
    return `<strong>${english() ? 'Ethnic settlement areas · 2021' : '民族聚居区 · 2021'}</strong>` + unique.map(({properties:p}) => `<p><b title="${escape(p.group_)}">${escape(english() ? p.group_ : EthnicTranslations.shortGroup(p.group_,p.statename))}</b>${!english() && EthnicTranslations.explanation(p.group_) ? '<br><small>'+escape(EthnicTranslations.explanation(p.group_))+'</small>' : ''}<br>${escape(english() ? p.statename : EthnicTranslations.country(p.statename))} · ${escape(english() ? p.type : EthnicTranslations.type(p.type))}<br>${escape(p.from_)}–${escape(p.to_)}${kinHtml(p)}</p>`).join('') + `<small>${english() ? 'GeoEPR research coverage; overlapping groups possible.' : 'GeoEPR 研究覆盖范围；多个族群可能重叠。'}</small>`;
  }
  function kinHtml(properties) {
    const ids = globalThis.EthnicKin?.byId[properties.gwgroupid] || [];
    if (!ids.length) return '';
    const lines = ids.map(id => {
      const records = globalThis.EthnicKin.groups[id];
      const sample = records.find(r => globalThis.EthnicKin.byId[r.id]?.length === 1) || records[0];
      const name = english() ? sample.name : EthnicTranslations.shortGroup(sample.name,sample.country);
      const countries = [...new Set(records.map(r => english() ? r.country : EthnicTranslations.country(r.country)))];
      const swatch = color({gwgroupid:sample.id,group_:sample.name,statename:sample.country});
      return `<span style="display:block"><i style="display:inline-block;width:9px;height:9px;background:${swatch};margin-right:4px"></i>${escape(name)}：${escape(countries.join('、'))}</span>`;
    });
    return `<details><summary>${english() ? 'Cross-border links (EPR-TEK)' : '跨境关联（展开查看）'}</summary><small>${english() ? 'Cross-border kin (EPR-TEK)' : '跨境族群关联（EPR-TEK）'}${ids.length > 1 ? (english() ? ' · umbrella record' : ' · 合并记录，包含多个关联族群') : ''}${lines.join('')}</small></details>`;
  }
  async function load(mode = dataset()) {
    if (cache.has(mode)) return cache.get(mode);
    if (!requests.has(mode)) requests.set(mode, (async () => {
      if(mode==='language') {
        const response=await fetch('data/language-areas.geojson?v=17',{signal:AbortSignal.timeout(45000)});
        if(!response.ok)throw new Error('HTTP '+response.status);
        const result=await response.json();
        if(result.type!=='FeatureCollection'||!result.features?.length)throw new Error('Invalid language data');
        for(const feature of result.features){feature.properties.color=color(feature.properties);labelProperties(feature);}
        cache.set(mode,result);return result;
      }
      const features = [];
      for (let offset = 0; ; offset += 1000) {
        const params = new URLSearchParams({f:'geojson', where:'from_ <= 2021 AND to_ >= 2021', outFields:'FID,group_,statename,from_,to_,type,gwgroupid', outSR:'4326', orderByFields:'FID', resultOffset:String(offset), resultRecordCount:'1000', maxAllowableOffset:'0.01'});
        if (mode === 'greg') {
          params.set('where','1=1'); params.set('outFields','OBJECTID,G1ID,G2ID,G3ID,G1SHORTNAM,G2SHORTNAM,G3SHORTNAM,FIPS_CNTRY'); params.set('orderByFields','OBJECTID');
        }
        const response = await fetch(`${mode === 'greg' ? gregService : service}?${params}`, {signal:AbortSignal.timeout(45000)});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (result.error || !Array.isArray(result.features)) throw new Error(result.error?.message || 'Invalid GeoJSON');
        for (const f of result.features) { if (f.geometry) {
          if (mode === 'greg') {
            const p = f.properties;
            f.properties = {dataset:'greg',group_:[1,2,3].map(i=>GregTranslations.clean(p['G'+i+'SHORTNAM'])).filter(Boolean).join(' / '),countryCode:p.FIPS_CNTRY,groupIds:[1,2,3].map(i=>p['G'+i+'ID']).filter(id=>id>0).sort((a,b)=>a-b).join(','),gwgroupid:p.OBJECTID};
          } else f.properties.dataset = 'geoepr';
          f.properties.color = color(f.properties); labelProperties(f); features.push(f);
        } }
        if (!result.exceededTransferLimit && result.features.length < 1000) break;
      }
      const result = {type:'FeatureCollection',features};
      cache.set(mode,result);
      return result;
    })().finally(() => { requests.delete(mode); }));
    pending = requests.get(mode);
    return pending;
  }
  function legendGroups(collection, mode = languageColorMode()) {
    const groups = new Map();
    const unique = new Map(collection.features.map(f => [f.properties.languageId, f.properties]));
    for (const p of unique.values()) {
      const key = mode === 'affinity' ? p.family || '' : p.languageId;
      if (!groups.has(key)) groups.set(key, {key, nameEn:mode === 'affinity' ? p.family || 'Unclassified' : p.group_, nameZh:mode === 'affinity' ? p.familyZh || p.family || '未分类' : p.nameZh, members:[]});
      groups.get(key).members.push({id:p.languageId, nameEn:p.group_, nameZh:p.nameZh, color:color(p,mode)});
    }
    for (const group of groups.values()) group.members.sort((a,b) => (english() ? a.nameEn : a.nameZh).localeCompare(english() ? b.nameEn : b.nameZh, english() ? 'en' : 'zh'));
    return [...groups.values()].sort((a,b) => mode === 'affinity' ? b.members.length-a.members.length || a.nameEn.localeCompare(b.nameEn) : (english() ? a.nameEn : a.nameZh).localeCompare(english() ? b.nameEn : b.nameZh,english() ? 'en' : 'zh'));
  }
  const mainLanguageFamilies=['Sino-Tibetan','Indo-European','Austronesian','Afro-Asiatic','Atlantic-Congo','Dravidian','Turkic','Austroasiatic','Tai-Kadai','Hmong-Mien','Uralic','Mongolic-Khitan','Tungusic'];
  const familyKey=p=>mainLanguageFamilies.includes(p.family)?p.family:'other';
  const hiddenFamilies=()=>context.state().mapOverlays.languageHiddenFamilies||[];
  function visibleLanguageData(collection){
    const specificFamilies=new Set(collection.features.filter(f=>f.properties.entryKind!=='family-area').map(f=>f.properties.family));
    const visible=collection.features.filter(f=>!(f.properties.entryKind==='family-area'&&specificFamilies.has(f.properties.family))&&!hiddenFamilies().includes(familyKey(f.properties)));
    const byId=new Map(visible.map(f=>[f.properties.languageId,f.properties]));
    return {type:'FeatureCollection',features:visible.flatMap(f=>{
      const forcedMask=f.properties.paintExclusionIds?.every(id=>byId.has(id));
      const masked=!!forcedMask||f.properties.sameColorMaskIds?.every(id=>byId.has(id)&&(languageColorMode()==='language'||byId.get(id).color===f.properties.color));
      const residual=forcedMask?f.properties.overlapResidualGeometry:masked?f.properties.sameColorResidualGeometry:f.properties.dialectResidualGeometry;
      const contextOnly=!!masked||!!f.properties.dialectResidualGeometry&&f.properties.entryKind==='dialect-area'&&(f.properties.kinPath||[]).slice(0,-1).some(id=>byId.has(id)&&byId.get(id).entryKind!=='family-area'&&(languageColorMode()==='language'||byId.get(id).color===f.properties.color));
      const full={...f,properties:{...f.properties,contextOnly}};
      if(!contextOnly||!residual?.coordinates.length)return [full];
      return [full,{...f,geometry:residual,properties:{...f.properties,contextOnly:false,residualOnly:!forcedMask}}];
    })};
  }
  let renderedLanguageFilter='';
  function renderColorLegend() {
    const container=document.querySelector('#languageLegend');container.hidden=dataset()!=='language';
    const link=document.querySelector('#languageLegendLink');
    link.textContent=english()?'View detailed branch legend ↗':'查看详细语族图例 ↗';
    const list=document.querySelector('#languageFamilyLegend');
    list.hidden=languageColorMode()!=='affinity';
    document.querySelector('#languageFamilyLegendTitle').textContent=english()?'Language family colors':'语系配色';
    document.querySelector('#languageFamilyLegendTitle').hidden=list.hidden;
    const collection=cache.get('language');if(!collection){list.textContent=english()?'Loading…':'加载后显示';return;}
    const main=mainLanguageFamilies;
    const groups=legendGroups(collection,'affinity');
    const entries=main.map(key=>groups.find(g=>g.key===key)).filter(Boolean);
    const others=groups.filter(g=>!main.includes(g.key));
    if(others.length)entries.push({key:'other',nameEn:'Other families',nameZh:'其他语系',members:others.flatMap(g=>g.members)});
    const all=document.querySelector('#languageFamilyAll');const hidden=hiddenFamilies();
    all.checked=hidden.length===0;all.indeterminate=hidden.length>0&&hidden.length<mainLanguageFamilies.length+1;
    document.querySelector('#languageFamilyAllText').textContent=english()?'Select all':'全选';
    list.innerHTML=entries.map(g=>{const colors=[...new Set(g.members.map(m=>m.color))].sort((a,b)=>parseFloat(a.split(',')[2])-parseFloat(b.split(',')[2]));const samples=colors.filter((_,i)=>i===0||i===colors.length-1||i%Math.max(1,Math.floor(colors.length/6))===0);
      const background=samples.length===1?samples[0]:'linear-gradient(90deg,'+samples.join(',')+')';
      return '<label class="language-family-key" title="'+escape(g.nameEn)+'"><input type="checkbox" data-language-family="'+escape(g.key)+'"'+(!hidden.includes(g.key)?' checked':'')+' /><i style="background:'+background+'" aria-hidden="true"></i><span>'+escape(english()?g.nameEn:g.nameZh)+'</span></label>';
    }).join('');
  }
  function controls() {
    const overlays = context.state().mapOverlays;
    const mode = dataset();
    const colorControl=document.querySelector('#languageColorControl');colorControl.hidden=mode!=='language';
    document.querySelector('#languageColorMode').value=languageColorMode();
    document.querySelector('#languageColorLabel').textContent=english()?'Colors':'配色';
    document.querySelector('#languageColorMode option[value="affinity"]').textContent=english()?'Language affinity':'按亲缘';
    document.querySelector('#languageColorMode option[value="language"]').textContent=english()?'Individual language':'按语言';
    document.querySelector('#languageColorNote').textContent=english()?'One hue per family; branches use lighter or darker shades. Colors do not indicate mutual intelligibility.':'同语系固定色相，不同语族仅用深浅区分；不代表彼此能听懂。';
    document.querySelector('#ethnicRegionsSource').value = mode;
    document.querySelector('#ethnicRegionsSourceLabel').textContent = english() ? 'Source' : '来源';
    document.querySelector('#ethnicRegionsNote').textContent = mode === 'greg' ? (english() ? 'Historical ethnic settlement areas from the 1964 Atlas of the Peoples of the World. Mixed groups can share an area; this is not present-day population distribution.' : '展示《世界民族地图集》（1964）的历史民族聚居范围，同一区域可能有多个族群，不代表当前人口分布。') : (english() ? 'Settlement areas of politically relevant ethnic groups covered by GeoEPR in 2021. Countries and groups outside its research scope may be missing; blank areas do not mean no inhabitants.' : '展示 GeoEPR 收录的 2021 年政治相关族群聚居范围，并非完整世界民族分布；部分国家和族群未收录，空白不表示无人居住。');
    if(mode==='language')document.querySelector('#ethnicRegionsNote').textContent=english()?'Language speaker areas from Asher & Moseley (2007), digitized by Glottography. Contemporary means the atlas period; areas may overlap. Not current population distribution.':'展示《世界语言地图集》（2007）时期的语言使用范围，由 Glottography 数字化；区域可能重叠，不代表当前人口分布。没有可靠中文译名的小语种保留原名。';
    const title=document.querySelector('#ethnicRegionsLegend strong');
    title.removeAttribute('data-i18n');title.textContent=mode==='language'?(english()?'Language distribution':'语言分布'):(english()?'Ethnic settlement areas':'民族聚居区');
    const optionLabels=english() ? {greg:'GREG · Ethnic areas (1964 atlas)',geoepr:'GeoEPR · Politically relevant ethnic groups (2021)',language:'Glottography · Language areas (2007 atlas)'} : {greg:'GREG · 民族分布（1964 年地图集）',geoepr:'GeoEPR · 政治相关族群分布（2021）',language:'Glottography · 语言分布（2007 年地图集）'};
    for(const [value,label] of Object.entries(optionLabels))document.querySelector('#ethnicRegionsSource option[value="'+value+'"]').textContent=label;
    document.querySelector('#ethnicKinSourceLink').hidden = mode !== 'geoepr';
    const link = document.querySelector('#ethnicRegionsSourceLink');
    link.href = mode === 'language' ? 'https://github.com/Glottography/asher2007world' : mode === 'greg' ? 'https://icr.ethz.ch/data/greg/' : 'https://www.arcgis.com/home/item.html?id=c969daf5655c41fbbe9ae0140989efeb';
    link.textContent = (mode === 'language' ? 'Glottography' : mode === 'greg' ? 'GREG' : 'GeoEPR') + (english() ? ' · Source / preview ↗' : ' · 来源与预览 ↗');
    document.querySelector('#ethnicRegionsRetry').textContent = english() ? 'Retry' : '重试';
    document.querySelector('#showEthnicRegionsOnMap').checked = !!overlays.ethnicRegions;
    document.querySelector('#ethnicRegionsLegend').hidden = !overlays.ethnicRegions;
    document.querySelector('#ethnicRegionsOpacity').value = overlays.ethnicRegionsOpacity ?? 45;
    document.querySelector('#ethnicRegionsOpacityValue').textContent = `${overlays.ethnicRegionsOpacity ?? 45}%`;
    renderColorLegend();
  }
  async function sync(map, leafletGroup) {
    const token = ++revision;
    const enabled = context.state().mapOverlays.ethnicRegions;
    activeMap = map || null;
    const mode = dataset();
    if (renderedDataset && renderedDataset !== mode) {
      popup?.remove();
      if (map) { for (const id of [...labelLayers,'ethnic-regions-line','ethnic-regions-fill']) if (map.getLayer(id)) map.removeLayer(id); if (map.getSource('ethnic-regions-labels')) map.removeSource('ethnic-regions-labels'); if (map.getSource('ethnic-regions')) map.removeSource('ethnic-regions'); }
      renderedDataset = '';
    }
    controls();
    if (!enabled) popup?.remove();
    if (map?.getLayer('ethnic-regions-fill')) {
      for (const id of ['ethnic-regions-fill','ethnic-regions-line',...labelLayers]) if(map.getLayer(id)) map.setLayoutProperty(id,'visibility', enabled ? 'visible' : 'none');
      if(mode==='language' && renderedColorMode!==languageColorMode() && data){for(const f of data.features)f.properties.color=color(f.properties);map.getSource('ethnic-regions').setData(visibleLanguageData(data));renderedColorMode=languageColorMode();}
      if(mode==='language'&&renderedLanguageFilter!==JSON.stringify(hiddenFamilies())&&data){const visible=visibleLanguageData(data);map.getSource('ethnic-regions').setData(visible);map.getSource('ethnic-regions-labels').setData(overlapLabels(visible));renderedLanguageFilter=JSON.stringify(hiddenFamilies());popup?.remove();}
      map.setPaintProperty('ethnic-regions-line','line-opacity',['case',['any',['==',['get','contextOnly'],true],['==',['get','residualOnly'],true]],0,0.8]);
      map.setPaintProperty('ethnic-regions-fill','fill-antialias',true);
      map.setPaintProperty('ethnic-regions-fill','fill-opacity',['case',['==',['get','contextOnly'],true],0,(context.state().mapOverlays.ethnicRegionsOpacity ?? 45)/100]);
      return;
    }
    if (!enabled) return;
    const status = document.querySelector('#ethnicRegionsStatus');
    const retry = document.querySelector('#ethnicRegionsRetry');
    retry.hidden = true;
    status.textContent = english() ? 'Loading settlement areas…' : '正在加载聚居区…';
    try {
      const geojson = await load(mode);
      if (token !== revision || !context.state().mapOverlays.ethnicRegions) return;
      data = geojson;
      if(mode==='language')for(const f of data.features)f.properties.color=color(f.properties);
      renderedColorMode=languageColorMode();
      renderedDataset = mode;
      const renderedGeojson=mode==='language'?visibleLanguageData(geojson):geojson;
      renderedLanguageFilter=JSON.stringify(hiddenFamilies());
      const opacity = (context.state().mapOverlays.ethnicRegionsOpacity ?? 45)/100;
      if (map) {
        map.addSource('ethnic-regions',{type:'geojson',data:renderedGeojson,attribution:mode === 'language' ? 'Glottography · Asher & Moseley (2007) · CC BY 4.0' : mode === 'greg' ? 'GREG · Weidmann, Rød & Cederman (2010) · 1964' : 'GeoEPR 2021 · ETH Zürich'});
        map.addSource('ethnic-regions-labels',{type:'geojson',data:overlapLabels(renderedGeojson)});
        const before = map.getStyle().layers.find(l => l.type === 'symbol')?.id;
        map.addLayer({id:'ethnic-regions-fill',type:'fill',source:'ethnic-regions',paint:{'fill-antialias':true,'fill-color':['get','color'],'fill-opacity':['case',['==',['get','contextOnly'],true],0,opacity]}},before);
        map.addLayer({id:'ethnic-regions-line',type:'line',source:'ethnic-regions',paint:{'line-color':['get','color'],'line-width':0.7,'line-opacity':['case',['any',['==',['get','contextOnly'],true],['==',['get','residualOnly'],true]],0,0.8]}},before);
        [0,3,6,9].forEach((zoom,index) => map.addLayer({
          id:labelLayers[index],type:'symbol',source:'ethnic-regions-labels',minzoom:zoom,...(index<3 ? {maxzoom:[3,6,9][index]} : {}),
          filter:['<=',['get','labelMinZoom'],zoom],
          layout:{'text-field':['get',english() ? 'labelEn' : 'labelZh'],'text-font':['Open Sans Regular','Arial Unicode MS Regular'],'text-size':12,'text-max-width':12,'text-padding':18,'symbol-sort-key':['get','labelOrder'],'text-allow-overlap':false},
          paint:{'text-color':'#24352d','text-halo-color':'rgba(255,255,255,0.95)','text-halo-width':1.5},
        }));
        context.front();
      } else if (leafletGroup) {
        const layer = L.geoJSON(renderedGeojson,{bubblingMouseEvents:false,style:f => ({color:f.properties.color,weight:f.properties.contextOnly||f.properties.residualOnly?0:0.7,fillOpacity:f.properties.contextOnly?0:opacity}),onEachFeature:(f,l) => {
          l.bindPopup(html([f]));

        }}).addTo(leafletGroup);
        const labels = L.geoJSON(overlapLabels(renderedGeojson),{pointToLayer:(f,latlng)=>L.marker(latlng,{interactive:false,icon:L.divIcon({className:'',html:'',iconSize:[0,0]})}),onEachFeature:(f,l)=>l.bindTooltip(escape(english() ? f.properties.labelEn : f.properties.labelZh).replace(/\n/g,'<br>'),{permanent:true,direction:'center',className:'ethnic-region-label'})}).addTo(leafletGroup);
        const leafletMap = leafletGroup._map;
        const update = () => labels.eachLayer(l => { if(leafletMap.getZoom() >= l.feature.properties.labelMinZoom) l.openTooltip(); else l.closeTooltip(); });
        if (leafletMap) { update(); leafletMap.on('zoomend',update); layer.on('remove',()=>leafletMap.off('zoomend',update)); }
      }
      status.textContent = english() ? `${geojson.features.length} settlement records · click an area` : `${geojson.features.length} 条聚居区记录 · 点击区域查看`;
      renderColorLegend();
    } catch (error) { if (token === revision) { retry.hidden = false; status.textContent = english() ? 'Loading failed. Use Retry.' : '加载失败，请点击重试。'; } }
  }
  function click(map,event) {
    if (!context.state().mapOverlays.ethnicRegions || !map?.getLayer('ethnic-regions-fill')) return false;
    const features = map.queryRenderedFeatures(event.point,{layers:['ethnic-regions-fill']});
    if (!features.length) return false;
    popup?.remove();
    popupFeatures = features;
    popup = new maplibregl.Popup({maxWidth:'320px'}).setLngLat(event.lngLat).setHTML(html(features)).addTo(map);
    const activePopup = popup;
    popup.on('close', () => { if (popup === activePopup) { popup = null; popupFeatures = []; } });
    return true;
  }
  function refreshLanguage() {
    if (!context) return;
    controls();
    if (activeMap) for (const id of labelLayers) if (activeMap.getLayer(id)) activeMap.setLayoutProperty(id,'text-field',['get',english() ? 'labelEn' : 'labelZh']);
    if (popup && popupFeatures.length) popup.setHTML(html(popupFeatures));
    const status = document.querySelector('#ethnicRegionsStatus');
    const currentData = cache.get(dataset());
    if (currentData) status.textContent = english() ? `${currentData.features.length} area records · click an area` : `${currentData.features.length} 条区域记录 · 点击区域查看`;
    else if (requests.has(dataset())) status.textContent = english() ? 'Loading settlement areas…' : '正在加载聚居区…';
    else if (!document.querySelector('#ethnicRegionsRetry').hidden) status.textContent = english() ? 'Loading failed. Use Retry.' : '加载失败，请点击重试。';
  }
  function init(ctx) {
    context = ctx;
    document.querySelector('#languageFamilyLegend').addEventListener('change',e=>{const key=e.target.dataset?.languageFamily;if(!key)return;const hidden=new Set(hiddenFamilies());if(e.target.checked)hidden.delete(key);else hidden.add(key);context.state().mapOverlays.languageHiddenFamilies=[...hidden];context.save();context.render();});
    document.querySelector('#languageFamilyAll').addEventListener('change',e=>{context.state().mapOverlays.languageHiddenFamilies=e.target.checked?[]:[...mainLanguageFamilies,'other'];context.save();context.render();});
    document.querySelector('#showEthnicRegionsOnMap').addEventListener('change',e => { context.state().mapOverlays.ethnicRegions = e.target.checked; context.save(); context.render(); });
    document.querySelector('#ethnicRegionsOpacity').addEventListener('input',e => { context.state().mapOverlays.ethnicRegionsOpacity = Number(e.target.value); context.save(); context.render(); });
    document.querySelector('#ethnicRegionsRetry').addEventListener('click',() => context.render());
    document.querySelector('#languageColorMode').addEventListener('change',e=>{context.state().mapOverlays.languageColorMode=e.target.value;context.save();context.render();});
    document.querySelector('#ethnicRegionsSource').addEventListener('change',e => { context.state().mapOverlays.ethnicRegionsSource = e.target.value; context.save(); context.render(); });
  }
  return {init,sync,click,controls,canonicalName,color,overlapLabels,refreshLanguage,labelProperties,legendGroups};
})();
