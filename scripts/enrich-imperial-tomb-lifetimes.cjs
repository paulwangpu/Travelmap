module.exports=({items,source,sources})=>{
 const fs=require('node:fs'),path=require('node:path');
 const research=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/imperial-tombs/biography-research.json'),'utf8'));
 const indexed=new Map(research.people.map(x=>[x.label,x]));
 const year=y=>y<0?'前'+Math.abs(y):String(y);
 const text=(b,d)=>b==null&&d==null?'生卒不详':`${b==null?'生年不详':year(b)}—${d==null?'卒年不详':year(d)+'年'}`;
 // Prefer institution biographies where reviewed; unresolved conflicts remain explicit.
 source('min-life','王审知生平','福州市政府','https://www.fuzhou.gov.cn/zgfzzt/zjrc/mdfc/mdrj/202111/t20211115_4242653.htm');
 source('liu-bang-dates','刘邦生年两说','中国哲学书电子化计划人物索引','https://ctext.org/dictionary.pl?char=%E5%8A%89%E9%82%A6&if=en&remap=gb');
 source('luwang-life','朱以海生卒与金门遗迹','金门县政府','https://www.kinmen.gov.tw/News_Content2.aspx?n=98E3CA7358C89100&s=4B33A64D9A1030A0&sms=BF7D6D478B935644');
 const easternHanDates=[['汉明帝刘庄',28,75,130513],['汉章帝刘炟',57,88,473498],['汉和帝刘肇',79,106,409011],['汉殇帝刘隆',105,106,77403],['汉质帝刘缵',138,146,626280],['汉桓帝刘志',132,168,614805]];
 for(const [label,b,d,res] of easternHanDates)source('east-han-life-'+res,label+'生卒资料与纪年语句','中国哲学书电子化计划','https://ctext.org/datawiki.pl?if=gb&res='+res,'人物日期资料，不作为陵墓归属依据；采用换算后的公历年份。');
 const overrides={
  '秃黑鲁克帖木尔汗':[null,1363,'west-tughluq'],
  '苏突克·博格拉汗':[null,955,'west-satuq'],
  '北魏节闵帝元恭':[498,532,'wei-jiemin-life'],
  ...Object.fromEntries(easternHanDates.map(([label,b,d,res])=>[label,[b,d,'east-han-life-'+res]])),
  '西楚霸王项羽':[-232,-202,'xiang-life'],
  '秦二世胡亥':[-230,-207,'qin-second-history'],
  '钱镠':[852,932,'qian-history'],'王审知':[862,925,'min-life'],'萧道成':[427,482,'qi-taian'],
  '唐玄宗李隆基':[685,762,'tang'],'朱以海':[1618,1662,'luwang-life']
 };
 for(const x of items){
  x.biographies=x.occupants.map(label=>{
   if(/传说/.test(label))return {label,birthYear:null,deathYear:null,status:'legendary',lifespanText:'传说人物，生卒不详',sourceIds:[]};
   if(/未确定|推测|逐位待核/.test(label))return {label,birthYear:null,deathYear:null,status:'unresolved',lifespanText:'墓主未确定，生卒待核',sourceIds:[]};
   const r=indexed.get(label),override=overrides[label];
   let sid=null;if(r?.entity){sid='bio-'+r.entity;if(!sources.some(s=>s.id===sid))source(sid,(r.resolvedTitle||label)+'：生卒日期语句','Wikidata人物数据库','https://www.wikidata.org/wiki/'+r.entity,'P569/P570；仅显示年份，保留原始精度、历法及引用于biography-research.json。人物索引不是陵墓归属证据。');}
   const b=override?override[0]:r?.birth?.year??null,d=override?override[1]:r?.death?.year??null;
   const ids=[override?.[2],sid].filter(Boolean);
   const p={label,birthYear:b,deathYear:d,lifespanText:text(b,d),status:override?'institution_biography':sid?'indexed_biography':'unresolved',sourceIds:ids,entity:r?.entity||null,precision:'year',limitations:'只显示可核查年份，不将卒年视为建陵、迁葬或发掘年；索引资料需持续复核。'};
   if(r?.birth?.status==='conflicting'||r?.death?.status==='conflicting')p.disputes=['人物索引有冲突生卒语句，原始语句存档；有机构传记时采用机构年份，否则显示不详。'];
   if(label==='唐太宗李世民'){p.birthYear=null;p.birthYearAlternatives=[598,599];p.lifespanText='598或599—649年';p.disputes=['索引为598年，数字唐陵机构简介为599年，保留生年异说。'];p.sourceIds.push('tang');}
   if(label==='汉高祖刘邦'){p.birthYearAlternatives=[-256,-247];p.lifespanText='前256（另说前247）—前195年';p.disputes=['陕西地方志采用前256年；另有前247年说，生年异说保留。'];p.sourceIds.push('qin-second-history','liu-bang-dates');}
   if(label==='妇好'){p.birthYear=null;p.deathYear=null;p.lifespanText='生卒不详（生活于前13世纪中后期）';p.status='institution_biography';p.sourceIds.push('royal-shang-fuhao');p.disputes=['索引的前1200年为约略年代，不能作为精确卒年；依首都博物馆资料只给生活年代。'];}
   if(label==='越王允常（疑似）'){p.birthYear=null;p.deathYear=-497;p.sourceIds.push('preqin-yue-yinshan');p.lifespanText='生年不详—前497年（疑似墓主）';p.status='institution_biography';p.disputes=['生年缺少直接传记证据，暂不显示；柯桥机构资料记卒年前497，但人物年表不用于证明印山陵归属。'];}
   if(label==='朱以海')p.disputes=['人物索引的卒年1654与金门机构、圹志资料不符，采用机构生卒1618—1662年。'];
   return p;
  });
  x.lifespanText=x.biographies.length===1?x.biographies[0].lifespanText:x.biographies.length?x.biographies.map(p=>`${p.label}：${p.lifespanText}`).join('；'):x.recordType==='group'?'陵群，见各墓主资料':'墓主未确定，生卒待核';
  const first=x.biographies[0];if(first?.deathYear!=null&&!['ming-zu','qing-yong'].includes(x.id))x.chronology={sortYear:first.deathYear,basis:'首位墓主生卒资料中的卒年；不是建陵或迁葬年'};
 }
};
