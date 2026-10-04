// Site records distinguish physical graves, historical burial areas and memorials.
module.exports=({items,add,source})=>{
 source('jin-huizong-original','金史卷十九：徽宗改葬兴陵','元代金史（维基文库原文）','https://zh.wikisource.org/zh-hans/金史/卷19','使用史籍原文，不是百科归纳；记宗峻卒于天会二年、改葬兴陵。');
 source('jin-five-areas','大房山金代帝王陵：五处陵区','房山区政协文史资料','https://zx.bjfsh.gov.cn/docs/20220902095355205122.pdf','九龙山、石门峪、峨眉峪、断头峪、康东峪为历史分区；不视作各墓室均已确证。');
 source('jin-site-study','房山文史资料全编：金熙宗陵及金陵调查','房山区政协','https://zx.bjfsh.gov.cn/docs/20240705105130135809.pdf','西庄村西坡峨眉峪地点线索；资料中的年代错讹不沿用。');
 source('jin-2025-story','金陵帝王与陵区考古介绍','北京日报','https://news.bjd.com.cn/2025/03/11/11092729.shtml','17座历史帝陵包含追尊祖先，不能当作17位在位皇帝。');
 source('jin-national-table','中国历代帝王陵墓简表：金宣宗德陵','南昌市博物馆','https://www.nchbwg.cn/news/239.html','金宣宗德陵在河南开封；不提供具体陵址。');
 source('jin-aizong-bio','完颜守绪','故宫博物院','https://www.dpm.org.cn/lemmas/242756.html','蔡州殉难及末帝死亡，不据死亡地点直接判定陵址。');
 source('jin-aizong-site','金末帝调查：汝水葬骨与葬颜冢线索','辽沈晚报现场采访','https://epaper.lnd.com.cn/lswbepaper/pad/con/201911/18/content_52240.html','引用金史葬骨记载和当地学者；金史与宋史遗骸记述不同，现存墓室未确认。');
 source('jin-chenglin-local','泾川完颜村传统陵墓与迁葬说','平凉市文化广电和旅游局','https://wlj.pingliang.gov.cn/ztzl/yzpl/y/art/2022/art_1b88c7fb367c48a9a35cdebba1cf5c1b.html','地方文旅叙述不作为遗骸或墓主考古确认。');
 source('jin-chenglin-soil','祭祖七百载：2003年取土建冢并非遗骸迁葬','辽沈晚报现场采访','https://epaper.lnd.com.cn/lswbepaper/pc/con/201911/18/content_52199.html','采访区分三星村簸箕湾传统墓与完颜村东沟芮王坪取土纪念冢。');
 source('jin-wanyan-tour','完颜村现存景点与仿金地宫','甘肃日报','https://gansu.gscn.com.cn/system/2020/05/22/012389293.shtml','旅游基地仿金地宫不是金代考古墓室。');
 const get=id=>items.find(x=>x.id===id);
 const shared=()=>({parentId:'jin-group',status:'shared_region_estimate',target:'大房山金陵主陵区参考，非该墓室',limitation:'历史分区互有距离，九龙山参考点不能用于定位其他分区的独立墓室。'});
 for(const id of ['jin-guang','jin-xi','jin-jian','jin-hui','jin-an','jin-ding','jin-yong','jin-tai','jin-xian','jin-qiao']){const x=get(id);x.admin='北京市房山区大房山石门峪十帝陵区（历史归属）';x.burialArea='石门峪十帝陵区';x.sourceIds.push('jin-five-areas');x.locationReference=shared();}
 for(const id of ['jin-rui','jin-gong','jin-jing','jin-xing','jin-yu']){get(id).burialArea='九龙山主陵区';get(id).sourceIds.push('jin-five-areas');}
 const si=get('jin-si');si.admin='北京市房山区西庄村西坡、凤凰山峨眉峪沟（历史陵址线索）';si.burialArea='峨眉峪思陵区';si.sourceIds.push('jin-five-areas','jin-site-study');si.disputes.push('初葬上京皇后墓、后迁蓼香甸、最终峨眉峪不是同一陵址；不将九龙山代表坐标当作思陵中心。');
 get('jin-dao').admin='北京市房山区大房山主陵区、柳家沟一带（具体对应推测）';get('jin-dao').disputes.push('柳家沟道陵对应为调查推测，不能将建筑构件位置直接认作地宫。');
 const make=(id,name,owner,admin,src,opts={})=>add(id,name,'宋辽金西夏','金',owner,admin,src,{reviewTasks:['核对原始文献、独立陵址及可复核WGS84区域坐标'],...opts});
 make('jin-shun','金德宗顺陵（后降为墓）','金德宗完颜宗干（追尊后削号）','北京市房山区九龙山主陵区（历史迁葬范围）','beijing-jin-history,jin-five-areas',{parentId:'jin-group',nature:'posthumous',locationReference:shared(),aliases:['完颜宗干墓','金德宗墓'],evidence:'文物部门研究记载宗干1155年与太祖、太宗迁入云峰寺基址，后削帝号、陵改为墓。',disputes:['不是阿骨打本人墓；合葬／同陵区关系不能用于虚构独立墓室点。'],chronology:{sortYear:1141,basis:'墓主卒年'}});
 make('jin-huizong-xing','金徽宗兴陵（陵址未定）','金徽宗完颜宗峻（追尊）','黑龙江省哈尔滨市阿城区金上京附近（具体陵址待考）','jin-huizong-original,beijing-jin-history',{nature:'posthumous',evidence:'金史卷十九记宗峻卒于天会二年、徽宗改葬兴陵；北京文物部门研究记葬于上京，未见迁入房山记载。',disputes:['与金世宗兴陵同名异陵，不合并墓主或套用世宗兴陵坐标。'],chronology:{sortYear:1124,basis:'墓主卒年；陵址待核'}});
 make('jin-weishao','金卫绍王墓（康东峪线索）','卫绍王完颜永济','北京市房山区大房山康东峪（文史归属线索）','jin-five-areas,beijing-jin-history',{parentId:'jin-group',locationReference:shared(),recognition:'attributed',evidence:'房山政协文史资料列康东峪为永济葬区；保留地理线索，尚无墓志或墓室身份确证。',disputes:['其他研究记葬所不明，康东峪不得视为无争议定论。'],chronology:{sortYear:1213,basis:'墓主卒年'}});
 make('jin-de','金宣宗德陵（开封，陵址未定）','金宣宗完颜珣','河南省开封市附近，具体陵址不明','jin-national-table',{evidence:'博物馆帝陵简表列金宣宗德陵在河南开封；南迁后的陵寝，不属于北京金陵。',disputes:['不与明德陵混淆；不以开封市中心假充陵址。'],chronology:{sortYear:1223,basis:'墓主卒年'}});
 make('jin-ai-rushui','金哀宗葬骨处（汝水滨，故址待核）','金哀宗完颜守绪','河南省驻马店市汝南县汝水滨、后龙亭河湾北岸张彦庄一带（线索）','jin-aizong-bio,jin-aizong-site',{recognition:'attributed',nature:'unknown',aliases:['金哀宗墓','金哀宗汝水葬骨处'],evidence:'报道引用金史汝水葬骨记载，并调查张彦庄及葬颜冢传统；独立墓址未考古确认。',disputes:['宋史另记遗骸被带回临安，不能断定全部遗骸葬于汝南。','葬颜冢包含将士合葬传统，不等同于已确认的哀宗独立帝陵。'],chronology:{sortYear:1234,basis:'殉难及葬骨记载年代'}});
 const original=make('jin-chenglin-boji','金末帝传统墓址（泾川簸箕湾）','金末帝完颜承麟（传统墓主）','甘肃省平凉市泾川县太平乡三星村岭背后簸箕湾、大湾林场一带','jin-chenglin-local,jin-chenglin-soil',{recognition:'traditional',nature:'unknown',evidence:'地方文旅记载及现场采访保存簸箕湾守陵传统，无墓志、遗骸或科学发掘身份确认。',disputes:['秘葬泾川为传统与地方调查说，不作为考古事实。'],chronology:{sortYear:1234,basis:'传统墓主卒年'}});
 const memorial=make('jin-chenglin-memorial','金末帝纪念冢（完颜村）','金末帝完颜承麟（纪念对象）','甘肃省平凉市泾川县王村镇完颜村东沟芮王坪','jin-chenglin-local,jin-chenglin-soil,jin-wanyan-tour',{recognition:'documented',nature:'commemorative',siteRole:'memorial',aliases:['完颜村完颜承麟墓'],evidence:'2019年采访明确2003年从传统墓前取土重建土冢，并非搬迁遗骸；与原簸箕湾地点分别建档。',disputes:['文旅将其称迁墓，现场调查说明为取土纪念，应按纪念冢展示。','景区仿金地宫不能作为古墓实体证据。'],chronology:{sortYear:2003,basis:'取土纪念冢营建年'}});
 const stages=[{year:1234,siteId:original.id,label:'簸箕湾传统墓址（未确证）',status:'traditional'},{year:2003,siteId:memorial.id,label:'完颜村取土纪念冢（非遗骸迁葬）',status:'documented'}];
 for(const x of [original,memorial])x.migrationHistory={person:'金末帝完颜承麟',stages,sourceIds:['jin-chenglin-soil']};
 get('jin-group').sourceIds.push('jin-five-areas','jin-2025-story');
};
