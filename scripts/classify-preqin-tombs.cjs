module.exports=items=>{
 const countries=['晋','虢','鲁','齐','楚','秦','吴','越','曾','蔡','燕','韩','赵','中山','芮','霸','倗','古蜀','巴','西戎'];
 for(const x of items.filter(x=>x.era==='先秦')){
  let section='诸侯国',sectionOrder=3,country=x.dynasty.replace(/国$/,'').replace('田齐','齐');
  if(x.dynasty==='商'){section='商王室';sectionOrder=0;country='商';}
  else if(x.id.startsWith('early-')){section='早期王权与王陵线索';sectionOrder=-1;country=x.dynasty;}
  else if(['zhou-xianyang','zhou-lingpo'].includes(x.id)){section='西周王室候选陵址';sectionOrder=1;country='周（归属存争议）';}
  else if(x.dynasty==='东周'){section='东周王室';sectionOrder=2;country='东周';}
  const area=x.dynasty==='东周'?(x.id==='zhou-jincun'?'金村王陵区':x.id==='zhou-wangcheng'?'王城王陵区':'周山王陵区'):'';
  const areaOrder=area==='王城王陵区'?0:area==='周山王陵区'?1:area==='金村王陵区'?2:0;
  x.preqinClassification={section,sectionOrder,country,area,areaOrder,displayGroup:section==='诸侯国'?country+'国':area?section+' · '+area:section,countryOrder:Math.max(0,countries.indexOf(country)),note:section==='西周王室候选陵址'?'按传统陵名分类；现存墓葬的秦陵归属争议仍保留。':section==='诸侯国'?'按政权分组，各国组内按墓主卒年或遗址约略年代排序；不代表各国建立先后。':'王陵以墓号排序，人物墓与未完成墓坑分别排列。'};
 }
};
