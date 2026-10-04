module.exports=({items,source})=>{
 source('dawu-current-site-review','原窝托村南大武汉墓地望','淄博市生态环境局公开建设项目环境影响报告','https://epb.zibo.gov.cn/module/download/downfile.jsp?classid=0&filename=9d085e3b752045feb237318364e945e9.pdf','第41页将原窝托村南的大武汉墓列入文物地望；未公开本墓独立坐标，项目中心不是墓址。');
 source('dawu-historical-name-review','诸墓考：淳于髡','临淄区政府公开《齐文化》2013年10月刊','https://www.linzi.gov.cn/lz/files/app/20140324_162221.pdf','第11页讨论窝托冢子、驸马坟传统名称及汉齐王墓认定；关于旧封土搬运的叙述只作寻找旧地块线索，不推断墓室整体消失。');
 const definitions=[
  ['yan-xuliang','已复核河北省文物局考古综述和燕下都墓区研究：虚粮冢属于东城西北部，与九女台是两处墓区。城址中心及把墓区写入西城的游记均不能作为定位依据。','仍需东城西北墓区保护界桩坐标，或包含武阳台、运粮河等现代可识别控制点的总平面；现有文字不足以计算独立WGS84锚点。',['yan-xiadu-layout','yan-xiadu-reassessment']],
  ['yan-jiunutai','已复核九女台与虚粮冢两区关系，M16经考古研究认定高等级贵族墓，尚不能指名燕王。墓区点须与北部虚粮冢分开，不采用黄金台、城址中心或外地同名九女台。','仍需九女台墓区边界和现代控制点；M16位置在墓区定位后关联，不能以墓号反推经纬度。',['yan-xiadu-layout','yan-xiadu-reassessment']],
  ['han-qi-dawu','淄博文旅、临淄区志及环境报告交叉确认原窝托村南的大武汉墓即汉齐王墓；传统淳于髡墓名称不代表战国墓主认定。旧村地块与迁建社区、藏品馆必须分开。','仍需原窝托村旧地籍、东风站扩建发掘位置图，或文保单位墓区测绘；新社区、车站中心和展厅不能替代原墓址。',['dawu-site-2017','han-feudal-qi','dawu-current-site-review','dawu-historical-name-review']]
 ];
 for(const [id,reason,nextStep,sids] of definitions){const x=items.find(x=>x.id===id);if(!x)throw Error(id);x.sourceIds=[...new Set([...x.sourceIds,...sids])];x.locationReview={...x.locationReview,status:'known_site_not_georeferenced',reason,nextStep,sourceIds:[...new Set([...(x.locationReview?.sourceIds||[]),...sids])],reviewedAt:'2026-10-04'};x.mapReason=nextStep;x.reviewTasks=[nextStep,'核坐标基准、指向对象及区域估计范围'];}
};
