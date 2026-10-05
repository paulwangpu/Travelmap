const fs = require('node:fs');
const path = require('node:path');
const excluded = {
  'shu-jinsha-search':'古蜀都邑遗址，当前目录未提供已确认王陵或王族墓地；保留古都条目。',
  'shu-sanxingdui-search':'古蜀都邑遗址，祭祀坑不等同墓葬；保留古都条目。',
  'early-erlitou-search':'都邑及普通分等级墓葬线索不能替代已确认王陵；保留古都条目。',
  'early-panlongcheng-search':'现条目为遗址中心探索区，没有对应到具体统治者墓葬；如补入应按具体墓地或墓号重新核查。'
};
module.exports = ({items,dir}) => {
  const archive = items.filter(x=>Object.hasOwn(excluded,x.id)).map(record=>({id:record.id,name:record.name,reason:excluded[record.id],record}));
  if(archive.length) fs.writeFileSync(path.join(dir,'excluded-settlement-sites.json'),JSON.stringify({reviewedAt:'2026-10-04',policy:'都邑、宫殿及探索区域不作为皇陵；有独立墓葬证据的王族候选墓地保留。资料存档不进入地图与打卡目录。',items:archive},null,2)+'\n');
  for(let i=items.length-1;i>=0;i--) if(Object.hasOwn(excluded,items[i].id)) items.splice(i,1);
  const jiaohe=items.find(x=>x.id==='cheshi-goubei');
  if(jiaohe){
    jiaohe.siteRole='royal_cemetery_candidate';
    jiaohe.mapEligible=false;
    jiaohe.mapReason='实际墓地有考古依据，但现有点借用交河故城；墓地区域独立位置核实前不入图。';
    jiaohe.reviewTasks=[...new Set([...jiaohe.reviewTasks,'取得沟北墓地区域坐标，不能沿用交河故城锚点。'])];
  }
};
