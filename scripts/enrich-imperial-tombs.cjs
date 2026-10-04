// Explicitly reviewed geographic matches; never approve newly fetched rows automatically.
module.exports = function enrich({items,sources,add,group,batch,source,dir}) {
  source('national-7','第七批全国重点文物保护单位','国务院','https://www.gov.cn/guoqing/2014-07/21/dqpqgzdwwbhdwmd.pdf');
  add('han-chan','汉献帝禅陵','秦汉','东汉','汉献帝刘协','河南省焦作市修武县','national-7');
  add('chu-yi','义帝陵','秦汉','楚','楚义帝熊心','湖南省郴州市北湖区','national-7',{recognition:'traditional',nature:'unknown',disputes:['保护单位名称不等于墓主考古鉴定。']});
  source('shu-hui','武侯祠与刘备惠陵','成都武侯祠博物馆','https://jp.wuhouci.net.cn/map');
  add('shu-hui','蜀汉惠陵','魏晋南北朝','蜀汉','刘备','四川省成都市武侯区','shu-hui');
  source('wu-jiang','孙权纪念馆与蒋陵','南京钟山风景区管理局','https://zschina.nanjing.gov.cn/lyzx/202602/t20260209_5789565.html');
  add('wu-jiang','吴大帝蒋陵','魏晋南北朝','东吴','孙权','江苏省南京市玄武区','wu-jiang',{aliases:['孙权墓'],recognition:'traditional',disputes:['梅花山传统陵址，不能将纪念馆等同已发掘墓室。']});
  source('zhou-later','后周皇陵','郑州市文物局','https://wwj.zhengzhou.gov.cn/country/3176952.jhtml');
  group('zhou-later','后周皇陵','五代十国','后周','河南省郑州市新郑市','zhou-later');
  batch('zhou-later','五代十国','后周','zhou-later',['zhou-song|后周嵩陵|郭威|河南省郑州市新郑市','zhou-qing|后周庆陵|柴荣|河南省郑州市新郑市','zhou-shun|后周顺陵|柴宗训|河南省郑州市新郑市']);
  source('ming-jingtai','景泰陵','北京市海淀区政府','https://zyk.bjhd.gov.cn/kjhd/whhd/hdww/wwcl/202208/t20220802_4545990.shtml');
  add('ming-jingtai','景泰陵','明清','明','朱祁钰','北京市海淀区','ming-jingtai');
  source('shaohao','少昊陵','济宁市文化和旅游局','https://whlyj.jining.gov.cn/art/2020/4/26/art_65780_2488132.html');
  add('legend-shaohao','少昊陵','传说时代','传说时代','少昊（传说人物）','山东省济宁市曲阜市','shaohao',{nature:'commemorative',recognition:'traditional',evidence:'官方旅游资料记载传统陵庙及纪念建筑，非遗体墓考古认定。'});
  const fs=require('node:fs'),path=require('node:path');
  source('yongling-location','清永陵地理位置交叉核查','高德地图','https://ditu.amap.com/place/B019D00YMB','GCJ-02坐标仅用于交叉核查地区，不直接导入WGS84。');
  const rejected={'han-ba':'点位与江村大墓不一致，暂留待核','han-west':'分布广泛的西汉帝陵不能用阳陵点替代','nanhan2':'实体为博物馆，不是二陵墓址','nantang-shun':'名称重定向为二陵陵群，不能复制给顺陵','tang18':'代表坐标指向十八陵之一，不能代表整个分布','ming-xianling':'官方范围与索引坐标尚未统一','zhongshan-cuo':'实体为整片王陵，单墓对应需核'};
  const approved='chen-wanan han-haihun houshu-he min-xuan qin-second song-shaodi southern-song-chuning tubo-kings wuyue-qian han-chan chu-yi legend-shaohao ming-jingtai zhou-qing zhou-shun zhou-song qing-yong chu-wuwangdun han-an han-chang han-du han-mao han-wei han-yan han-yang legend-taihao legend-yu liang-jian liao-huai liao-qing liao-zu ming-chang ming-de ming-ding ming-huang ming-jing ming-kang ming-mao ming-qing ming-si ming-tai ming-xian ming-xiao ming-yong ming-yu ming-zhao ming-zu ming13 nantang2 qin-first qing-chang qing-chong qing-ding qing-east qing-fu qing-hui qing-jing qing-mu qing-tai qing-west qing-xiao qing-yu qing-zhao shu-yong song-an song-chang song-ding song-hou song-tai song-xi song-yu song-zhao song6 song8 sui-tai sui-yang tang-ding tang-qian tang-qiao tang-xian tang-zhao wei-gao xixia9 yuan-genghis zhao-kings'.split(' ');
  approved.push(...'zhou-three zhou-xianyang yue-yinshan wu-helv qi-tian qin-east lu-fangshan jin-hou shang-fuhao zeng-yi guo-kings qing-zhaoxi'.split(' '));
  const research=JSON.parse(fs.readFileSync(path.join(dir,'coordinate-research.json'),'utf8'));
  for(const id of approved){const r=research.matches.find(x=>x.id===id),x=items.find(x=>x.id===id);if(!r||!x)throw new Error('Missing approved coordinate '+id);
    const sid='geo-'+r.entity;
    if(!sources.some(s=>s.id===sid))source(sid,r.label+'：地理坐标','Wikidata地理数据','https://www.wikidata.org/wiki/'+r.entity,'P625 Earth采用WGS84；社区地理资料，仅核实体对应与代表地点，不证明测量精度。');
    if(x.coordinates)x.coordinateAlternatives=[x.coordinates];
    x.coordinates={lat:r.lat,lng:r.lng,crs:'WGS84',status:'verified_wgs84',verificationScope:'地理实体对应、地区与数据坐标系；非现场测绘',target:x.recordType==='group'?'陵区代表点（非入口）':'遗址代表点（非墓室或入口）',sourceId:sid,sourceRecordId:r.entity,statementId:r.statementId,original:`${r.lat}, ${r.lng}; Earth Q2`,sourceDatumExplicit:true,method:'已复核实体名称、历史目录与行政地区，采用P625 Earth地理坐标',precision:{sourceUnit:'degree',resolutionDegrees:r.precisionDegrees,horizontalAccuracyMeters:null},limitation:'社区地理资料，未提供实测误差；可用于区域浏览，不作为墓室中心或入口导航。'};
    x.mapEligible=true;x.mapReason='实体对应及WGS84地理数据格式已核；仅区域代表定位';x.reviewTasks=['补测陵体、入口及误差；复核地理资料更新',...x.reviewTasks.filter(t=>!t.includes('WGS84'))];
  }
  require('./supplement-imperial-tomb-coordinates.cjs')({items,source});
  for(const id of ['han-ba','ming-xianling','zhongshan-cuo'])delete rejected[id];
  const yong=items.find(x=>x.id==='qing-yong');yong.sourceIds.push('yongling-location');yong.disputes.push('原UNESCO登记纬度与现址不一致；本次以Wikidata Earth代表点展示，辽宁文旅所在地与高德POI作地区交叉核查，旧点保留于coordinateAlternatives，不作精确导航。');
  fs.writeFileSync(path.join(dir,'coordinate-decisions.json'),JSON.stringify({reviewedAt:'2026-10-03',policy:'明确白名单；新增索引不自动批准；历史性质独立核查',approved:items.filter(x=>x.mapEligible).map(x=>x.id),wikidataApproved:approved,supplementalApproved:items.filter(x=>x.mapEligible&&!approved.includes(x.id)).map(x=>({id:x.id,sourceId:x.coordinates.sourceId,method:x.coordinates.method})),rejected,datumDocumentation:'https://www.wikidata.org/wiki/Help:Data_type#Globe_coordinate'},null,2)+'\n');
};
