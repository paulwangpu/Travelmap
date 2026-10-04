module.exports=({items,source,estimate})=>{
 source('luoyang-tomb-protection-text','邙山陵墓群重要墓葬保护中心坐标','洛阳市人大常委会条例原文（维基文库转录）','https://zh.wikisource.org/zh/洛阳市邙山陵墓群保护条例','2011年公布文本第十条；基准未明。引用墓址和坐标，不作为现行法规效力判断。');
 source('luoyang-jin-plan','西晋崇阳陵与峻阳陵保护中心坐标','洛阳市偃师区政府公开规划','https://yanshi.gov.cn/ueditor/php/upload/file/20230223/1677148923874170.pdf','规划原文引用两陵各外扩500米保护范围，坐标基准未明。');
 for(const [id,latMinutes,lngMinutes,sid,extent,target] of [
  ['han-xian',46.524,36.026,'luoyang-tomb-protection-text',500,'朱仓M722遗址区域（宪陵对应有争议）'],
  ['jin-chongyang',45.0294,44.2001,'luoyang-jin-plan',500,'西晋崇阳陵保护区中心'],
  ['jin-junyang',45.0001,41.9963,'luoyang-jin-plan',500,'西晋峻阳陵保护区中心'],
  ['wei-jing',44.084,24.430,'luoyang-northwei-plan',300,'北魏景陵保护区中心'],
  ['wei-ding',46.506,33.764,'luoyang-tomb-protection-text',300,'北魏定陵保护区中心'],
  ['wei-jing2',42.273,22.518,'luoyang-northwei-plan',300,'北魏静陵保护区中心'],
  ['later-tang-hui',47.088,33.912,'luoyang-tomb-protection-text',500,'后唐明宗徽陵保护区中心']
 ]){
  const x=items.find(x=>x.id===id);x.sourceIds.push(sid);
  estimate(id,112+lngMinutes/60,34+latMinutes/60,sid,target+'（估计）','原始保护文本公布独立墓葬保护中心，未注明坐标基准，按WGS84区域估计保存',`以公布中心向各方向外扩${extent}米的保护区；范围不是测量误差，基准偏移待核`);
 }
 const xian=items.find(x=>x.id==='han-xian');xian.name='东汉宪陵（朱仓M722，推定）';xian.mapLabel=xian.name;xian.aliases.push('朱仓大冢M722');xian.recognition='attributed';xian.evidence='朱仓M722帝陵实体及独立保护中心有依据；宪陵对应采用2019年研究方案，2023年论坛另认为属原陵。';
 const sid='luoyang-northwei-plan',x=items.find(x=>x.id==='wei-jiemin');x.sourceIds.push(sid);
 estimate('wei-jiemin',112+21/60+57.15/3600,34+42/60+55.19/3600,sid,'北魏节闵帝陵保护区中心（估计）','政府公开资料公布张岭村东南帝陵重点保护区独立中心，未明确坐标基准','公布中心各外扩300米的保护区；墓主仍为推定，坐标基准待核');
};
