// Keep paired royal tombs together: no separate queen records or invented ruler assignments.
module.exports=({items,group,source})=>{
 const sid='liuan-plan-centres-2023';
 source(sid,'六安市文物保护利用专项规划：附件1王陵中心点（第57—58页）','六安市文物保护中心','https://www.luan.gov.cn/group1/M00/12/31/wKgSGWgZfiaABsFrADweNLgLS6I974.pdf','2023年征求意见稿；原表未明确坐标基准，仅用区域估计，不能视为墓室实测坐标。');
 const history='liuan-four-cemeteries-2024';
 source(history,'探访六安双墩王陵与四处双连冢','六安新闻网（皖西日报）','https://www.luaninfo.com/laxw/sdbd/content_194363','四处墓群归属六安国；除双墩一号外，不据总体四代名单逐一指认墓主。');
 const parent=group('han-liuan-cemetery','六安汉代王陵墓地','秦汉','西汉·六安国','安徽省六安市金安区三十铺镇、先生店镇',sid+','+history,{rulerCategory:'feudal_king',evidence:'官方规划收录八处墓冢；四处成对王陵片区按所属关系展示，不将陵群和子记录相加。',chronology:{sortYear:-83,basis:'六安国王陵时代参照，非全部墓葬的建陵年'}});
 items.find(x=>x.id==='han-king-liuan').parentId=parent.id;
 const dms=(d,m,s)=>d+m/60+s/3600;
 const rows=[
  ['gaodadun','高大墩王陵墓群',35,19.3,19.2,44,56.7,54.3,'三十铺镇双墩村高大墩组'],
  ['madadun','马大墩王陵墓群',34,26.4,26.9,44,32.0,28.7,'三十铺镇双墩村双墩组'],
  ['sanxingmiao','三星庙墩王陵墓群',34,43.1,43.7,44,13.1,10.9,'先生店镇及双墩村五星庙组一带（规划表乡镇与村名须复核）']
 ];
 for(const [key,name,lm,ln,ls,bm,bn,bs,admin] of rows){
  const original=`北墩116°${lm}′${ln}″,31°${bm}′${bn}″；南墩116°${lm}′${ls}″,31°${bm}′${bs}″；原表基准未说明`;
  const basis='将官方规划分别列出的南北墩经纬度转换为十进制度，取两点中点作为成对墓群区域代表点；原表未明示坐标基准，暂按WGS84区域估计保存，不主张精确测绘。';
  const extent='成对墓冢及周边约500米范围；包括坐标基准尚未独立核实的限制';
  const x=group('han-liuan-'+key,name,'秦汉','西汉·六安国','安徽省六安市金安区'+admin,sid+','+history,{parentId:parent.id,rulerCategory:'feudal_king',recognition:'archaeological',evidence:'文物保护规划将南北两墩纳入六安汉代王陵墓地；作为成对王陵片区收录。',disputes:['未取得逐墓墓主的直接证据，不把刘禄、刘定、刘光名单机械对应给各处墓冢；南北墓可能为王与王后，不各生成单独记录。'],chronology:{sortYear:-50,basis:'西汉六安国后续王陵时代概略排序；非确定墓主卒年'},reviewTasks:['核对原规划坐标基准、墓冢边界及逐墓墓主认定']});
  x.coordinates={lat:dms(31,bm,(bn+bs)/2),lng:dms(116,lm,(ln+ls)/2),crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target:name+'南北墩之间的区域代表点',original,method:basis,sourceDatumExplicit:false,precision:{sourceUnit:'degree',resolutionDegrees:0.0001,horizontalAccuracyMeters:null},limitation:extent,estimate:{basis,extent,confidence:'regional',reviewedAt:'2026-10-04'}};
  x.mapEligible=true;x.mapReason=x.coordinates.target;
 }
};
