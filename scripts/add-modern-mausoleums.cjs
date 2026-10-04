module.exports=({items,add,source})=>{
 source('modern-sun','中山陵：陵墓营建及1929年奉安','南京市中山陵园管理局','https://zschina.nanjing.gov.cn/fjms/jqjd/zsljq/zyjd/201808/t20180823_3860682.html');
 source('modern-sun-life','孙中山生平与诞辰','南京市中山陵园管理局','https://zschina.nanjing.gov.cn/zszx/dtxx/202604/t20260408_5819634.html');
 source('modern-mao','毛主席纪念堂：瞻仰大厅与遗体安放','北京市天安门地区管理委员会','https://tamgw.beijing.gov.cn/diqufuwu/zjtam/201912/t20191218_1272027.html');
 source('modern-mao-life','毛泽东逝世及生年','人民网中国共产党新闻网','https://cpc.people.com.cn/GB/33837/2534985.html');
 add('modern-zhongshan','中山陵','近现代','中华民国','孙中山','江苏省南京市玄武区钟山中茅峰南麓','modern-sun,modern-sun-life',{nature:'actual_burial',siteRole:'modern_leader_mausoleum',periodText:'1929年迁葬奉安',evidence:'陵园管理机构明确为孙中山陵墓，1929年6月1日奉安。',disputes:['孙中山为近现代领导人，并非帝王；依用户指定纳入本图层。']});
 add('modern-mao-hall','毛主席纪念堂','近现代','中华人民共和国','毛泽东','北京市东城区天安门广场南部','modern-mao,modern-mao-life',{nature:'commemorative',siteRole:'preserved_remains_memorial',periodText:'1977年开放；遗体安放于瞻仰大厅水晶棺',evidence:'天安门地区管理机构明确纪念堂及瞻仰大厅遗体安放，不按地下墓葬标注。',disputes:['毛泽东为近现代领导人，并非帝王；依用户指定纳入本图层。','此处为保存遗体的纪念堂，不是衣冠冢或仅有纪念建筑。']});
 source('geo-modern-hengbei','横水墓地：倗国国君、夫人与国人墓地','运城市人民政府','https://www.yuncheng.gov.cn/doc/2024/05/15/448911.shtml');
 source('cian-membership','定东陵：慈安普祥峪与慈禧菩陀峪','故宫博物院','https://www.dpm.org.cn/court/system/236384.html');
 const cian=items.find(x=>x.id==='qing-cian');cian.parentId='qing-east';cian.sourceIds.push('cian-membership');
};
