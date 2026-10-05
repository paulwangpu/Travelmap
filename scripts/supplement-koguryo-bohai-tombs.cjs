// Royal cemeteries only: ordinary aristocratic tombs and capital sites are excluded.
module.exports=({add,group,source})=>{
 const point=(x,lat,lng,sid,original,target,extent)=>{
  x.coordinates={lat:Number(lat.toFixed(3)),lng:Number(lng.toFixed(3)),crs:'WGS84',status:'estimated_wgs84',sourceId:sid,target,original,method:'机构公开DMS坐标换算后取三位小数；按WGS84约定作为区域参考，未声称现场实测',sourceDatumExplicit:false,precision:{sourceUnit:'arcsecond',resolutionDegrees:0.001,horizontalAccuracyMeters:null},limitation:extent+'；原始来源未明示基准与测量误差，不作为墓室中心或入口。',estimate:{basis:'机构记录名称、墓号与地望互核；保留原始坐标供复核',extent,confidence:'regional',reviewedAt:'2026-10-04'}};
  x.mapEligible=true;x.mapReason=target;x.reviewTasks=['补核现场实测坐标、基准及入口；区域参考不证明墓主身份'];
 };
 source('koguryo-law','高句丽王城、王陵及贵族墓葬保护管理条例：十二座王陵名录','吉林省人大','https://www.jlrd.gov.cn/jlsjk/202311/P020231102699822228181.pdf','第十条区分12座王陵与27座贵族墓；好太王碑与陪坟不另计王陵。');
 source('koguryo-nomination','集安高句丽王陵申报档案','UNESCO／中国申报资料','https://whc.unesco.org/uploads/nominations/1135.pdf','第22—24页列各王陵墓号及候选归属；不将整个遗产地代表坐标当作单陵坐标。');
 source('koguryo-taewang-survey','太王陵YM0541中心地理坐标与考古资料','东北亚历史财团资料库','https://contents.nahf.or.kr/id/NAHF.ku.d_0001_0040_0030_1750','太王陵中心N41°8′30.7″ E126°12′35.5″；与吉林王陵墓号互核，来源未说明基准。');
 source('koguryo-general-conflict','将军坟地质调查报告坐标待复核','东北亚历史财团','https://contents.nahf.or.kr/id/NAHF.cr.d_0005_0040_0010_0040','报告E126°12′35.3″与公开地理索引E126°13′34.62″相差约1.4公里；保留冲突，未直接采用任一值。');
 source('koguryo-royal-attributions','高句丽平壤时期候选王陵及归属比较','东北亚历史财团','https://contents.nahf.or.kr/item/level.do?levelId=gt.d_0008_0040_0030','讨论东明王陵、湖南里四神墓、江西大墓和中墓等王陵候选；不同于一般贵族墓。');
 source('koguryo-dprk-map','朝鲜高句丽墓葬群组成与地理坐标','UNESCO','https://whc.unesco.org/en/list/1091/maps/','1091-001东明王陵及真坡里墓群、002湖南里四神墓、004江西三墓；坐标指遗产组成部分。');
 source('koguryo-dprk-nomination','朝鲜高句丽墓葬群申报档案','UNESCO／朝鲜申报资料','https://whc.unesco.org/uploads/nominations/1091.pdf','保留王陵归属及时代争议，组分代表点不等于单陵墓室。');
 const parent=group('koguryo-jian-kings','集安高句丽王陵群','魏晋南北朝','高句丽','吉林省通化市集安市','koguryo-law,koguryo-nomination',{recognition:'archaeological',evidence:'保护条例明确列十二座王陵，逐墓建立子记录；陵群数与子陵数不相加。',disputes:['保护名录认定王陵类别，并不等于十二位墓主均已确认。','地图陵群代表点选在已核地望的太王陵；不指陵群中心或全部保护区边界。']});
 const rows=[
  ['YM0001','将军坟','长寿王高琏（推定）','亦有好太王归属及长寿王虚宫说，不能将旅游通称当作确定墓主。'],
  ['YM0541','太王陵','好太王高谈德（推定）','亦有故国壤王等异说，铭文及碑墓关系的解释仍存在分歧。'],
  ['MM1000','千秋墓','故国壤王（候选）','亦有故国原王、小兽林王等候选，不以任一说固定墓主。'],
  ['MM0500','西大墓','西川王（候选）','申报资料提出西川王对应，保留候选。'],
  ['YM0043','临江墓','','王陵墓主尚未可靠确认。'],
  ['YM2110','禹山2110号王陵','','王陵墓主尚未可靠确认。'],
  ['YM0992','禹山0992号王陵','','王陵墓主尚未可靠确认。'],
  ['MM0626','麻线0626号王陵','','王陵墓主尚未可靠确认。'],
  ['MM2100','麻线2100号王陵','','王陵墓主尚未可靠确认。'],
  ['MM2378','麻线2378号王陵','','王陵墓主尚未可靠确认。'],
  ['QM0211','七星山0211号王陵','','王陵墓主尚未可靠确认。'],
  ['QM0871','七星山0871号王陵','','王陵墓主尚未可靠确认。'],
 ];
 let taewang;
 for(const [code,name,owner,dispute] of rows){
  const x=add('koguryo-'+code.toLowerCase(),name,'魏晋南北朝','高句丽',owner,'吉林省通化市集安市','koguryo-law,koguryo-nomination',{parentId:parent.id,aliases:[code,'高句丽'+name,...(code==='YM0001'?['长寿王陵']:code==='YM0541'?['好太王陵','广开土王陵']:[])],recognition:owner?'attributed':'archaeological',evidence:'吉林保护条例第十条列为高句丽王陵；墓号用于实体对应，具体墓主见争议说明。',disputes:[dispute],reviewTasks:['核对单陵保护界址、独立坐标及墓主研究；不借用同名墓点']});
  if(code==='YM0541')taewang=x;
  else {x.locationReference={parentId:parent.id,label:'集安高句丽王陵群参考（太王陵代表点）',reason:'只表示属于该陵群，不表示单陵与太王陵同址。'};x.mapReason='单陵坐标待核，可参考所属集安王陵群；不生成重叠单陵点。';}
  if(code==='YM0001'){x.sourceIds.push('koguryo-general-conflict');x.disputes.push('地质报告与地理索引经度冲突，本轮不采用为独立点。');}
 }
 const lat=41+8/60+30.7/3600,lng=126+12/60+35.5/3600;
 taewang.sourceIds.push('koguryo-taewang-survey');parent.sourceIds.push('koguryo-taewang-survey');
 point(taewang,lat,lng,'koguryo-taewang-survey','N41°8′30.7″ E126°12′35.5″','太王陵实体周边区域参考','太王陵及周边约500米');
 point(parent,lat,lng,'koguryo-taewang-survey','N41°8′30.7″ E126°12′35.5″','以太王陵实体作集安王陵群代表点','集安不同墓区跨度数公里，点位仅表示太王陵，不代表其余十一陵位置');
 const tong=add('koguryo-tongmyong','东明王陵（传统指认）','魏晋南北朝','高句丽','东明王朱蒙（传统祭祀对象）','朝鲜平壤市力浦区龙山里','koguryo-dprk-map,koguryo-dprk-nomination,koguryo-royal-attributions',{aliases:['东明王墓','朱蒙陵','Tongmyong'],nature:'unknown',recognition:'traditional',evidence:'联合国教科文组织以东明王陵及真坡里墓群组成部分收录；现存墓葬与建国君主的对应有争议。',disputes:['现存墓葬一般置于高句丽平壤时期；朱蒙是传统祭祀对象，不能以其卒年作为现存墓建造年代。','有迁葬、象征纪念及其他国王墓等观点，不能直接定为朱蒙原葬墓。']});
 point(tong,38+53/60+22/3600,125+55/60+47/3600,'koguryo-dprk-map','1091-001 N38°53′22″ E125°55′47″','东明王陵与真坡里陵区代表点','遗产组分220公顷；不是单陵墓室中心');
 const kangso=group('koguryo-kangso','江西三墓（高句丽王陵候选）','隋唐','高句丽','朝鲜南浦市江西区域','koguryo-dprk-map,koguryo-dprk-nomination,koguryo-royal-attributions',{recognition:'attributed',evidence:'江西大墓和中墓有王陵归属研究；小墓随陵群说明保留，不强行指定三位国王。',disputes:['大墓、中墓被推定为平原王、婴阳王等陵墓，各说不一。','整体归入六世纪末至七世纪对应隋唐展示，不代表整个高句丽政权仅属隋唐。']});
 point(kangso,38+57/60+53/3600,125+25/60+30/3600,'koguryo-dprk-map','1091-004 N38°57′53″ E125°25′30″','江西三墓陵区代表点','遗产本体1.9公顷；未拆分三座墓室坐标');
 const honam=add('koguryo-honam-sasin','湖南里四神墓（王陵候选）','魏晋南北朝','高句丽','高句丽国王（未定）','朝鲜平壤市三石区域湖南里','koguryo-dprk-map,koguryo-royal-attributions',{aliases:['湖南里四神冢','Honam-ri Sasin'],recognition:'attributed',evidence:'独立大型壁画墓，有王陵归属研究；不是仅因列入世界遗产而认定王陵。',disputes:['安原王、阳原王等归属说尚不能确定，保留王陵候选。']});
 point(honam,39+4/60+51/3600,125+55/60+19/3600,'koguryo-dprk-map','1091-002 N39°4′51″ E125°55′19″','湖南里四神墓遗产组分参考点','遗产本体0.8公顷及周边约500米参考范围');
 source('bohai-liudingshan','六顶山古墓群及王室归属','吉林省地方志','https://dfz.jl.gov.cn/ybjl/201106/t20110607_5217088.html','王室贵族墓地，第二墓区有珍陵传统；不将贞惠公主墓单独列为君主陵。');
 source('bohai-longtoushan','龙头山渤海王陵考古与展示','吉林省政府','https://www.jl.gov.cn/yaowen/202609/t20260903_3667664.html','报道龙头山渤海王陵专题展及2026年调查，不据此认定全部墓主。');
 source('bohai-sanlingfen','三灵坟位置与陵园组成：保护规划','黑龙江省政府／保护规划','https://www.hlj.gov.cn/hlj/c108411/202110/31182525/files/a5a0b47f8f709901864104e4cf2bb558.pdf','上京城北牡丹江左岸，三处陵园；城址位置不能替代三灵坟坐标。');
 for(const [id,name,admin,sid,dispute] of [
  ['bohai-liudingshan','六顶山渤海王室墓群','吉林省延边朝鲜族自治州敦化市','bohai-liudingshan','珍陵具体墓主与墓号未定；混合王室贵族墓地不等于所有墓都是王陵。'],
  ['bohai-longtoushan','龙头山渤海王陵区','吉林省延边朝鲜族自治州和龙市','bohai-longtoushan','保留陵区，后妃及公主墓只在群内说明，不单独纳入。'],
  ['bohai-sanlingfen','渤海国三灵坟陵区','黑龙江省牡丹江市宁安市渤海镇','bohai-sanlingfen','三个陵园不等于恰有三位国王；未以渤海上京城坐标代替陵园位置。'],
 ])group(id,name,'隋唐','渤海国',admin,sid,{recognition:'documented',evidence:'机构资料确认王室墓地或王陵区，以群记录避免将未定墓主强行分配给渤海国王。',disputes:[dispute,'遗存包含唐至五代阶段，采用主要时期隋唐展示，具体分期待逐陵核对。'],reviewTasks:['从文保保护图或现场地理资料配准陵区；不同坐标索引存在冲突，不使用城址或景区中心替代']});
};
