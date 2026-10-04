// Beijing and surrounding sites: historical names are not confirmed grave coordinates.
module.exports=({items,add,group,source})=>{
 source('beijing-jin-list','大房山金陵历史陵名与迁葬名单','北京市房山区文化和旅游局','https://www.bjfsh.gov.cn/2020/zjfs/lswh/wwbh/202002/t20200227_39992404.shtml','列17座历史帝陵含追尊祖陵；不是17座均已考古确认的证明。');
 source('beijing-jin-history','北京金代皇陵历史沿革与墓主人考','北京市文物局《北京文博》','https://wwj.beijing.gov.cn/bjww/resource/cms/article/bjww_362762/10828729/2020071316554626737.pdf','历史陵名、迁葬和废帝陵研究；PDF直接访问不稳定，逐陵实体仍需核对。');
 source('beijing-jin-tour','金陵遗址位置与交通','北京市人民政府','https://www.beijing.gov.cn/renwen/whrl/rdtj/202112/t20211207_2555555.html','龙门口村北九龙山；不采用17位帝王、后妃与宗室表述推定17位在位帝王。');
 source('beijing-liulihe-plan','琉璃河遗址保护规划（2020—2035）','北京市人民政府、北京市城市规划设计研究院','https://www.beijing.gov.cn/zhengce/zhengcefagui/202103/W020210317359243597782.pdf');
 source('beijing-liulihe-m1193','琉璃河燕侯M1193与墓主推定','北京大学考古文博学院','https://archaeology.pku.edu.cn/info/1030/3485.htm','墓主或为第一代燕侯；不将克铭文自动等同于确证墓主。');
 source('beijing-liulihe-ke','琉璃河M1193克罍与墓主争议','北京市人民政府（考古资料解读）','https://www.beijing.gov.cn/ywdt/gqrd/202508/t20250812_4171808.html');
 source('beijing-liulihe-m202','燕侯一级M202发掘回忆','北京市文物局、发掘者赵福生','https://wwj.beijing.gov.cn/bjww/362760/362765/652798/index.html','中字形墓，燕侯一级；具体姓名不明，墓室因地下水未完全清理。');
 source('beijing-liao-yongan','耶律淳葬香山永安陵的机构记载','北京市人民政府','https://www.beijing.gov.cn/ywdt/gzdt/202407/t20240703_3736031.html');
 source('beijing-liao-yongan-area','香山永安陵寻址与现存遗迹争议','北京市妇联网上妇女学校（香山文史）','https://study.bjwomen.gov.cn/thought/knowledge/2022/04/08/2662.shtml','双清西南上坡、蟾蜍峰附近；旧图及疑似仓库只是线索，没有墓志和科学发掘确认。');
 source('yan-xiadu-reassessment','燕下都九女台M16及年代研究','河北省文物局','https://wenwu.hebei.gov.cn/system/2023/11/01/030261130.shtml','称M16为高等级贵族；王室或国君身份仍需讨论。');
 source('yan-xiadu-layout','燕下都墓区分布与王陵讨论','北京市文物局《北京文博》研究论文','https://wwj.beijing.gov.cn/bjww/resource/cms/article/bjww_362762/10869859/2020092815400122305.pdf','虚粮冢、九女台分别为两处墓区；不能把每座封土都指定给燕王。');
 source('yan-xiadu-m16-disturbance','九女台M16形制与盗掘证据','北京市文物局《北京文博》1998年第1辑','https://wwj.beijing.gov.cn/bjww/resource/cms/article/bjww_362762/10867361/1998-1.pdf');
 source('beijing-liuji-exclusion','坟庄唐刘济墓的墓志认定','北京市文物局','https://wwj.beijing.gov.cn/bjww/362760/362767/2021nwhhzrycr/wwbh/10998897/index.html','不把坟庄刘济墓误作海陵王陵。');
 const jin=items.find(x=>x.id==='jin-group');
 jin.admin='北京市房山区周口店镇车厂村、龙门口村北大房山陵区';
 jin.sourceIds.push('beijing-jin-list','beijing-jin-tour');
 jin.evidence='房山区机构列历史帝陵及追尊祖陵；主陵区可作区域参考。2025年北京市文物局明确仅太祖睿陵经考古发掘确认，其余陵名与具体墓室不能直接对应。';
 jin.disputes.push('历史资料称17座帝陵，包含追尊者；不是17位在位皇帝，也不是17座已确认的独立墓室。');
 jin.chronology={sortYear:1155,basis:'迁葬与陵区营建年代，非墓主卒年'};
 const shared=()=>({parentId:'jin-group',status:'shared_region_estimate',target:'大房山金陵区共享参考位置（非单陵中心）',limitation:'整片历史陵区约60平方公里；参考点在九龙山主陵区，不能证明各祖陵、思陵或裕陵同在此点。'});
 const rui=items.find(x=>x.id==='jin-rui');rui.locationReference=shared();rui.reviewTasks.push('太祖身份已确认，独立墓室经纬度仍待核；当前仅引用陵区参考位置。');
 const rows=[
  ['jin-guang','金始祖光陵','金始祖函普（追尊）',true,null],
  ['jin-xi','金德帝熙陵','金德帝乌鲁（追尊）',true,null],
  ['jin-jian','金安帝建陵','金安帝跋海（追尊）',true,null],
  ['jin-hui','金献祖辉陵','金献祖绥可（追尊）',true,null],
  ['jin-an','金昭祖安陵','金昭祖石鲁（追尊）',true,null],
  ['jin-ding','金景祖定陵','金景祖乌古迺（追尊）',true,1074],
  ['jin-yong','金世祖永陵','金世祖劾里钵（追尊）',true,1092],
  ['jin-tai','金肃宗泰陵','金肃宗颇剌淑（追尊）',true,1094],
  ['jin-xian','金穆宗献陵','金穆宗盈歌（追尊）',true,1103],
  ['jin-qiao','金康宗乔陵','金康宗乌雅束（追尊）',true,1113],
  ['jin-gong','金太宗恭陵','金太宗完颜晟',false,1135],
  ['jin-jing','金睿宗景陵','金睿宗完颜宗辅（追尊）',true,1135],
  ['jin-xing','金世宗兴陵','金世宗完颜雍',false,1189],
  ['jin-dao','金章宗道陵','金章宗完颜璟',false,1208],
  ['jin-yu','金显宗裕陵','金显宗完颜允恭（追尊）',true,1185],
  ['jin-si','金熙宗思陵','金熙宗完颜亶',false,1149]
 ];
 for(const [id,name,owner,posthumous,year] of rows){
  const x=add(id,name,'宋辽金西夏','金',owner,'北京市房山区大房山历史陵区','beijing-jin-list,beijing-jin-history,jin-confirmed',{parentId:'jin-group',nature:posthumous?'posthumous':'actual_burial',recognition:'documented',locationReference:shared(),evidence:'机构历史陵名与墓主资料有据；未确认该陵名对应的独立考古墓室。',disputes:['历史陵名建档不等于确定墓室；共享陵区点不能作为该陵的精确导航。'],chronology:{sortYear:year??1155,basis:year?'历史纪年排序参照，生卒另须传记来源核对':'1155年迁葬陵区排序参照，非个人卒年'}});
  if(id==='jin-si'){x.admin='北京市房山区大房山峨眉谷（历史迁葬地，具体范围待核）';x.disputes.push('经历上京、蓼香甸与峨眉谷等迁葬；峨眉谷最终陵址未直接定位，不采用九龙山主陵点作为实际思陵中心。');}
 }
 add('jin-hailing','金海陵王墓（故址待核）','宋辽金西夏','金','海陵王完颜亮','北京市房山区大房山周边（历史归葬范围）','beijing-jin-history,beijing-liuji-exclusion',{nature:'unknown',recognition:'documented',evidence:'文献有废帝归葬记录，但最终墓址未取得可靠实体对应。',disputes:['不把长沟坟庄唐刘济墓作为海陵王陵；不从金陵主陵点任意偏移造点。'],chronology:{sortYear:1161,basis:'历史卒年排序参照，非墓址认定'}});
 group('yan-liulihe','琉璃河燕侯墓地','先秦','燕','北京市房山区琉璃河镇黄土坡墓葬Ⅱ区','beijing-liulihe-plan,beijing-liulihe-m1193',{recognition:'archaeological',evidence:'西周燕国国君一级墓葬与墓地有考古支持；不是将整座都城所有墓葬作为燕侯墓。',chronology:{sortYear:-1050,basis:'西周早期墓地约略年代，非精确卒年'}});
 for(const [id,name,owner,sid] of [
  ['yan-liulihe-m1193','琉璃河M1193（燕侯克，推定）','燕侯克（推定）','beijing-liulihe-m1193,beijing-liulihe-ke'],
  ['yan-liulihe-m202','琉璃河M202（燕侯级大墓）','燕侯（姓名未定）','beijing-liulihe-m202']
 ])add(id,name,'先秦','燕',owner,'北京市房山区琉璃河镇黄土坡墓葬Ⅱ区',sid,{parentId:'yan-liulihe',recognition:'attributed',evidence:id.endsWith('1193')?'克罍、克盉及墓葬等级支持燕侯归属；具体墓主仍有推定性质。':'发掘者记述M202为燕侯一级中字形大墓，未核定个人姓名。',disputes:['墓葬等级与个人身份分开；不填造先秦君主生卒年份。'],locationReference:{parentId:'yan-liulihe',status:'shared_region_estimate',target:'黄土坡墓地Ⅱ区共享参考点（非本墓墓室中心）',limitation:'区域级定位，不对应单墓实测经纬度。'},chronology:{sortYear:-1050,basis:'西周早期约略年代'}});
 group('yan-jiunutai','燕下都九女台墓区（疑似王室墓地）','先秦','燕','河北省保定市易县燕下都东城西北部','yan-xiadu-layout,yan-xiadu-reassessment',{recognition:'attributed',evidence:'与北侧虚粮冢分属两处墓区；王室与高等级贵族范围仍有讨论。',disputes:['不因九女台之名推定墓主都是女性；不将此处误放到北京琉璃河遗址。'],chronology:{sortYear:-400,basis:'战国约略年代排序，不代表精确建陵年'}});
 add('yan-jiunutai-m16','九女台M16（疑似燕王室墓）','先秦','燕','燕王室成员或高等级贵族（未定）','河北省保定市易县九女台墓区','yan-xiadu-reassessment,yan-xiadu-layout,yan-xiadu-m16-disturbance',{parentId:'yan-jiunutai',recognition:'attributed',nature:'unknown',evidence:'大型墓、陶礼器组合和车马坑有考古记录，身份在王室成员与高等级贵族之间讨论，非确认的燕昭王墓。',disputes:['国君身份和个人姓名未确认；发掘资料有盗扰证据。'],chronology:{sortYear:-400,basis:'战国约略年代排序'}});
 const xu=items.find(x=>x.id==='yan-xuliang');xu.sourceIds.push('yan-xiadu-layout','yan-xiadu-reassessment');xu.disputes.push('易县墓区不同于无极县等同名虚粮冢；部分外语网页误把燕下都坐标设在琉璃河，本目录不采用。');
 add('liao-yongan','辽永安陵（香山辽王坟，故址推定）','宋辽金西夏','北辽','辽宣宗耶律淳','北京市海淀区香山双清别墅西南上坡、蟾蜍峰附近','beijing-liao-yongan,beijing-liao-yongan-area',{aliases:['香山辽王坟','北辽永安陵'],recognition:'traditional',nature:'unknown',evidence:'机构引辽史记录葬于燕西香山永安陵；旧图、游记及疑似遗迹可用于区域线索，未考古确认墓室。',disputes:['疑似仓库、山洞或欢喜园附近说法尚有争议；不能宣称发现耶律淳地宫。'],chronology:{sortYear:1122,basis:'耶律淳卒年排序，非现址确认'}});
};
