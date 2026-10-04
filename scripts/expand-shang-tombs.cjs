module.exports=({items,add,source})=>{
 source('shang-royal-study','探寻安阳殷墟西北冈王陵区中长眠的殷王','中央研究院历史语言研究所','https://www.sinica.edu.tw/news_content/557/3661','2026年研究，王名比定为作者的学术推论，非公认逐墓定名。');
 source('shang-royal-museum','安阳西北冈1001号大墓','中央研究院历史语言研究所历史文物陈列馆','https://museum.sinica.edu.tw/ja/exhibitions/5/','陈列馆明确指出年代和墓主仍未完全解明，记录多次盗掘。');
 source('shang-royal-plan','殷墟西北冈王陵区墓葬分布图','故宫博物院学术资料','https://www.dpm.org.cn/Uploads/File/2018/06/01/u5b1123336de3d.pdf','图六列出墓号与相对位置；示意图未配WGS84控制点，不据此虚构单墓坐标。');
 const hypotheses={1001:'小乙；旧说武丁',1002:'庚丁；另有康丁等旧说',1003:'祖甲；另有帝乙等旧说',1004:'祖庚；另有廪辛等旧说',1217:'文武丁（文丁）',1400:'武丁；旧说祖甲',1500:'武乙',1550:'祖己（未即位），王室成员身份另有争议'};
 for(const n of [1001,1002,1003,1004,1217,1400,1500,1550]){
  const x=add('shang-m'+n,'殷墟商王陵M'+n+(n===1550?'（王室大墓）':''),'先秦','商','商王或王室成员（墓主未定）','河南省安阳市殷都区西北冈王陵区','yin,shang-royal-study,shang-royal-plan'+(n===1001?',shang-royal-museum':''),{parentId:'yin-kings',recognition:'archaeological',evidence:'西北冈四墓道大型王室墓，考古确认墓号与遗址，具体墓主仍有学术分歧。',disputes:['2026年研究提出的墓主比定：'+hypotheses[n]+'；只记录假说，不把此墓直接命名为该王陵。'],locationReference:{parentId:'yin-kings',status:'shared_region_estimate',target:'西北冈王陵区参考位置，单墓坐标待核',basis:'考古分布图明确所属陵区，但缺少单墓WGS84控制点。'},reviewTasks:['将考古平面图与现场地理控制点配准，核验单墓位置','核对墓主归属异说、墓道与盗坑记录']});
  x.mapReason='使用所属西北冈陵区参考位置，不重复生成同坐标单墓点';
 }
 add('shang-m1567','殷墟M1567未完成王陵','先秦','商','墓主未定','河南省安阳市殷都区西北冈王陵区','shang-royal-plan',{parentId:'yin-kings',nature:'unknown',recognition:'archaeological',evidence:'考古分布图记录未完成的大墓；不作为已有实际埋葬的商王墓。',disputes:['传统研究有帝辛（商纣王）拟建陵说，不能由未完成墓坑证明帝辛实际葬于此。'],locationReference:{parentId:'yin-kings',status:'shared_region_estimate',target:'西北冈王陵区参考位置，墓坑坐标待核',basis:'按考古分布图所属陵区定位，未配准墓坑。'}});
 items.find(x=>x.id==='yin-kings').mapLabel='商王陵（殷墟西北冈）';
 items.find(x=>x.id==='yin-kings').evidence+=' 单墓已按M1001、M1002、M1003、M1004、M1217、M1400、M1500、M1550记录，另列未完成M1567。';
 items.find(x=>x.id==='yin-kings').disputes=['单墓按墓号记录；商王名比定有争议，妇好墓位于宫殿宗庙区，不能并入西北冈或混用坐标。'];
};
