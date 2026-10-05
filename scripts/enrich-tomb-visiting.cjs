// Only documented original chambers qualify; a museum or open park alone does not.
module.exports=({items,source})=>{
 const entries=[
 ['tang-hui-rang','visit-tang-hui','唐惠陵原地宫开放参观记录','华山风景名胜区／景区运营方','https://www.sohu.com/a/168566269_155446','2017年8月30日开馆报道明确游客可走入原地宫甬道；不是复制墓室。此为历史开放记录，当日开放以博物馆公告为准。'],
 ['ming-ding','visit-ding','明定陵地宫开放资料','北京市文物局','https://wwj.beijing.gov.cn/bjww/362679/362680/482911/10871994/2020101014363863044.pdf','原地宫可参观；十三陵地面景区开放不代表其他陵墓地宫开放。'],
 ['qing-yu','visit-yu','清东陵开放陵寝','河北省文物局','https://wenwu.hebei.gov.cn/system/2023/09/26/030253453.shtml','裕陵原地宫有开放参观记录；2026年地宫修缮方案获批，具体开放以管理处公告为准。'],
 ['qing-cixi','visit-cixi','定东陵：慈禧陵地宫向游人开放','故宫博物院','https://www.dpm.org.cn/court/system/236384.html','可进入慈禧陵原地宫参观；不把慈安陵地面开放视为其地宫开放。'],
 ['wei-gao','visit-gao','曹操高陵原墓本体栈道参观','新华社（高陵管理机构负责人介绍）','https://www.xinhuanet.com/politics/2023-04/27/c_1129569551.htm','可沿栈道观看原址曹操墓本体；可进入的1∶1模拟墓室另在展览区，不等同进入原墓室。'],
 ['sui-yang','visit-sui-yang','隋炀帝陵遗址公园原址墓穴展示','江苏省文化和旅游厅','https://wlt.jiangsu.gov.cn/art/2024/2/22/art_695_11156089.html','馆内可观看原址隋炀帝砖室墓穴；与萧后墓一同展示，不承诺进入墓室内部。'],
 ['han-haihun','visit-haihun','海昏侯刘贺主墓遗址展示','南昌市人民政府','https://www.nc.gov.cn/ncszf/rwfg/202208/8621e793af2543cbbb817e2ca2b7c1ca.shtml','墎墩苑室内展示刘贺主墓原址遗存；属于墓坑遗址观看，不是完整地宫内部游览。'],
 ['qin-gong-1','visit-qin-gong','秦公一号大墓原址保护展示','宝鸡市文物局','https://wwj.baoji.gov.cn/col1896/col9958/202608/t20260826_1297017.html','博物馆以原址秦公一号大墓及车马坑为主要展示内容；属于原墓坑遗址观看，不承诺进入椁室。'],
 ['qing-chong','visit-chong','崇陵地宫','故宫博物院','https://www.dpm.org.cn/court/system/236372.html','原地宫可参观；清西陵其他帝陵地宫不据此纳入。'],
 ['nanyue-wen','visit-nanyue','越秀区文化发展规划：南越王墓墓室开放','广州市越秀区人民政府','https://www.yuexiu.gov.cn/data/cms/category/fzgh/root1529908176578284.pdf','王墓展区保留并开放原墓室，区别于王宫展区。'],
 ['han-king-mancheng','visit-mancheng','满城汉墓科学开发与展示','河北省文化和旅游厅','https://whly.hebei.gov.cn/c/2019-08-28/558709.html','刘胜原崖洞墓室可参观；王后墓不另增加王陵条目。'],
 ['han-chu-guishan','visit-guishan','参访龟山汉墓原墓道与墓室','九三学社中央委员会','https://www.93.gov.cn/472/756973.html','原崖洞墓道和墓室可参观；数字展厅复刻模型不是筛选依据。'],
 ['han-chu-shizi','visit-shizi','狮子山汉墓原址参访','江苏省人民政府台湾事务办公室','https://www.jsstb.gov.cn/stkx/201807/t20180719_12037651.htm','汉文化景区原址墓室可参观；兵马俑展厅不是墓室点位。'],
 ['shu-yong','visit-yong','成都永陵地宫陈列与参观','成都永陵博物馆／故宫博物院','https://www.dpm.org.cn/study_detail/100199.html','原陵宫可参观；墓室建于地表之上，虽惯称地宫，实际并非地下建造。'],
 ['wei-jing','visit-jing','北魏景陵发掘后开放','河南省文物局','https://wwj.henan.gov.cn/2025/08-20/3203951.html','可参观原址北魏景陵；区别于古墓博物馆迁建复原的其他墓葬。'],
 ['han-king-dabaotai','visit-dabaotai','大葆台一号墓原状陈列开放','北京市人民政府／丰台区人民政府','https://www.beijing.gov.cn/ywdt/gqrd/202505/t20250523_4096398.html','可观看原址一号墓黄肠题凑及墓室遗存，含加固及补配；不是完整石室地宫，不可进入棺椁内部。二号墓地面轮廓复现不计。'],
 ['han-king-tushan','visit-tushan','土山彭城王墓考古现场展示','徐州市社会科学界联合会／徐州博物馆','https://www.xzsk.org/news_detail?id=1680','可观看原址墓室及发掘现场；属于遗址展示，不承诺游客能进入墓室内部。'],
 ['han-liang-kings','visit-liang','芒砀山汉梁王原址石室与景区','河南省人民政府台湾事务办公室','https://ytsc.rootinhenan.gov.cn/sitesources/ytsc/page_pc/hnly/fjms/article6a0989c9111d472bad0fbd6da8c79dc1.html','陵群内有梁孝王等原址崖洞地宫参观项目；不代表所有山头的王陵都已开放。'],
 ['nantang2','visit-nantang','南唐二陵墓室及陵区','牛首山官方景区','https://tchinese.niushoushan.net/TangTomb.html','陵区内有原墓室参观项目；钦陵另有封闭提示，不能理解为两陵均随时可进入。'],
 ];
 for(const [id,sid,title,publisher,url,note] of entries){
  const x=items.find(x=>x.id===id);if(!x)throw Error('Missing chamber record '+id);
  source(sid,title,publisher,url,'证明原墓室参观或原址墓葬遗存展示，具体方式见条目；不是当日实时开放保证。');
  x.sourceIds.push(sid);x.visitorAccess={status:'documented_visitable',originalChamber:true,mode:'original_chamber',note,sourceIds:[sid],reviewedAt:'2026-10-04',openingPolicy:'出行前核对管理机构临时关闭、维修及限流公告'};
 }
 for(const id of ['han-king-dabaotai','han-king-tushan','wei-gao','sui-yang','han-haihun','qin-gong-1'])items.find(x=>x.id===id).visitorAccess.mode='view_original_remains';
 const liang=items.find(x=>x.id==='han-liang-xiao');liang.sourceIds.push('visit-liang');liang.visitorAccess={status:'documented_visitable',originalChamber:true,mode:'original_chamber',note:'保安山梁孝王原址崖洞地宫参观项目；开放范围依景区公告。',sourceIds:['visit-liang'],reviewedAt:'2026-10-04'};
 source('visit-qin-closure','南唐二陵钦陵封闭提示','携程景区公告（辅助开放风险线索）','https://you.ctrip.com/sight/nanjing9/21820.html','页面作岐陵封闭通知；未取得管理机构恢复公告，不列钦陵为确认可参观项。');
 const qin=items.find(x=>x.id==='nantang-qin');qin.sourceIds.push('visit-qin-closure');qin.visitorAccess={status:'closure_reported',originalChamber:true,mode:'original_chamber',note:'原墓室曾供参观；旅游平台现列封闭提示，恢复情况待管理机构确认。',sourceIds:['visit-qin-closure','nantang'],reviewedAt:'2026-10-04'};
 const shun=items.find(x=>x.id==='nantang-shun');shun.visitorAccess={status:'documented_visitable',originalChamber:true,mode:'original_chamber',note:'顺陵原墓室参观项目；共享南唐二陵位置，不能据此指向单陵入口。',sourceIds:['visit-nantang'],reviewedAt:'2026-10-04'};shun.sourceIds.push('visit-nantang');
 source('visit-yu-repair','清裕陵地宫修缮方案核准','河北省文物局','https://wenwu.hebei.gov.cn/system/2026/09/23/030396650.shtml','方案核准不等于已开工或已关闭，保留开放前复核提醒。');
 items.find(x=>x.id==='qing-yu').sourceIds.push('visit-yu-repair');
 const exclusions=[['qin-first','秦始皇陵地宫未开放；兵马俑坑不是帝陵墓室。'],['ming-jing','景陵地面开放不代表地宫开放。'],['han-king-guangling','扬州汉陵苑的迁建展示不按原址地宫计入。']];
 for(const [id,note] of exclusions){const x=items.find(x=>x.id===id);if(x)x.visitorAccess={status:'not_qualified',originalChamber:false,note,reviewedAt:'2026-10-04'};}
};
