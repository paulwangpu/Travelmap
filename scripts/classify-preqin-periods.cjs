module.exports=items=>{
 // Political grouping remains independent of temporal marker colors.
 const explicit={
  'yin-kings':'夏商','shang-fuhao':'夏商','zhou-xianyang':'战国',
  'jin-hou':'西周','jin-m114':'西周','guo-kings':'西周','guo-m2001':'西周','guo-m2009':'西周',
  'yan-liulihe':'西周','yan-liulihe-m1193':'西周','yan-liulihe-m202':'西周',
  'zeng-yejiashan':'西周','zeng-m111':'西周','lu-fangshan':'春秋',
  'qin-gong-group':'春秋','qin-gong-1':'春秋','zhou-zhoushan':'春秋','zhou-three':'春秋','zhou-ling':'春秋','zhou-wangcheng':'春秋','zhou-jincun':'战国',
  'zhao-kings':'战国','lu-nine':'春秋','shu-jinsha-search':'西周','rui-liangdaicun':'春秋',
  'qi-tian':'战国','yan-xuliang':'战国','yan-jiunutai':'战国','yan-jiunutai-m16':'战国'
 };
 for(const x of items.filter(x=>x.era==='先秦')){
  const year=x.chronology?.sortYear;
  x.preqinPeriod=explicit[x.id]||(x.preqinPeriod!=='先秦跨期／未定'&&x.preqinPeriod)||(x.dynasty==='商'?'夏商':Number.isFinite(year)?year<-1046?'夏商':year<-770?'西周':year<-475?'春秋':'战国':'战国');
  x.preqinPeriodBasis='按主要墓葬年代、代表性大墓或遗址文化阶段归入最接近分期；跨期说明仍保留，不表示全部墓葬同时建造。';
  if(x.id==='rui-liangdaicun')x.preqinPeriodBasis='西周晚期至春秋早期跨期墓地，按春秋早期代表性国君大墓归入春秋。';
  if(x.id==='shu-jinsha-search')x.preqinPeriodBasis='商末至西周的古蜀都邑，按主要西周文化阶段归入西周；王陵位置仍未知。';
  if(x.id==='lu-fangshan'){
   x.mapLabel='防山墓群（疑似鲁国国君墓地）';
   x.periodText='周、汉（跨期墓群）';
   x.preqinPeriodBasis='山东省文化和旅游厅《第七批全国重点文物保护单位简介》定年为周、汉，记载大墓出土春秋玉磬、玉璜；暂按春秋遗存归入展示分组，不表示全群仅属春秋，更不确定为西周。';
   x.evidence='文保资料认为应为周代鲁国国公墓地；大墓曾出土春秋时期玉磬、玉璜，另含汉墓，具体墓主未定。';
   x.disputes=['传统早期鲁君归属尚待考古核实，不据此确定墓群为西周。','官方年代为周、汉；春秋仅为代表性遗存的展示归类，汉墓不另计入先秦君主陵。'];
   x.chronology={sortYear:-600,basis:'按已报告春秋遗存取春秋中期作为列表排序参照，不是确定建墓年；全群官方断代为周、汉。'};
  }
 }
};
