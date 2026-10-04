module.exports=({items,add,source})=>{
 source('luoyang-northwei-plan','北魏帝陵重点保护区经纬度','洛阳市瀍河区政府公开资料','https://www.chanhe.gov.cn/upload/default/20260120/b98a27fae67a9bef9a35880795a0c143.pdf','保护区中心坐标未明确基准，作为区域估计；不是墓室测绘。');
 source('wei-jiemin-life','北魏节闵帝元恭生卒资料','中国哲学书电子化计划','https://ctext.org/datawiki.pl?if=gb&res=120745');
 add('wei-jiemin','北魏节闵帝陵（元恭墓，推定）','魏晋南北朝','北魏','北魏节闵帝元恭','河南省洛阳市西工区衡山北路张岭村东南','luoyang-northwei-plan',{recognition:'attributed',aliases:['衡山路北魏大墓'],evidence:'政府公开保护规划列北魏节闵帝帝陵重点保护区；墓葬实体与墓主推定分开标注。',disputes:['墓主对应为推定，不能仅依据金币年代确认唯一墓主。']});
 source('east-han-plan-coordinates','洛南重点保护区六座大墓中心坐标','洛阳市偃师区政府公开环评资料','https://www.yanshi.gov.cn/upload/content/file/20241203/1733187583812398.pdf','规划列M1030、M1038、M1048、M1052、M1055、M1071；经纬度未明示基准，作区域估计。');
 source('east-han-2023-dispute','汉代图像论坛：东汉邙山五陵对应方案','南京大学艺术学院','https://art.nju.edu.cn/8b/1c/c55327a625436/page.htm');
 source('east-han-xuan-update','白草坡陵园与桓帝宣陵认定进展','洛阳日报','https://lyrb.lyd.com.cn/images2/1/2025-03/20/002/20250320002_pdf.pdf');
 for(const [id,name,alias] of [['han-wen','东汉文陵（刘家井大冢）','刘家井大冢M067'],['han-huai','东汉怀陵（朱仓M707，推定）','朱仓升子冢'],['han-xianjie','东汉显节陵（M1038，推定）','白草坡磨盘冢M1038'],['han-jing-east','东汉敬陵（M1052，推定）','姬家桥双冢M1052'],['han-xuan','东汉宣陵（白草坡M1030）','白草坡东汉陵园遗址']]){
  const x=items.find(x=>x.id===id);x.name=name;x.mapLabel=name;x.aliases.push(alias);x.sourceIds.push('east-han-layout-text');x.recognition='attributed';x.evidence='独立墓冢实体经考古调查，陵号采用研究推定；不将遗址坐标核验等同于墓主确认。';x.disputes=x.disputes.filter(t=>!t.includes('暂未获得逐陵独立经纬度'));if(id.startsWith('han-xianjie')||id==='han-jing-east')x.disputes.push('2019年布局研究推定此陵号，具体墓主尚待独立考古证据验证。');
 }
 const xuan=items.find(x=>x.id==='han-xuan');xuan.recognition='archaeological';xuan.sourceIds.push('east-han-xuan-update');xuan.evidence='白草坡M1030陵园持续发掘，纪年器物及布局支持桓帝宣陵认定；坐标采用保护规划参考中心。';
 for(const id of ['han-yuan','han-gong','han-xian','han-huai']){const x=items.find(x=>x.id===id);x.sourceIds.push('east-han-2023-dispute');x.disputes.push('2023年南京大学论坛另有方案：朱仓M722、M707属原陵，大汉冢属恭陵，二汉冢属宪陵，三汉冢属怀陵。陵号对应仍存争议。');}
 add('han-sanhan','三汉冢（M560，墓主有争议）','秦汉','东汉','未确定','河南省洛阳市孟津区平乐镇','east-han-layout-text,east-han-2023-dispute',{parentId:'mangshan',recognition:'archaeological',aliases:['北乡侯刘懿墓（推测）'],evidence:'帝陵区内的减制大墓实体；2019年研究推测为少帝刘懿墓，2023年论坛方案认为是冲帝怀陵。',disputes:['与其他已列帝陵可能存在候选对应，不把候选墓主人数量与墓冢数量相加。']});
 for(const [id,name] of [['han-m1048','洛南王室大墓M1048（东冢）'],['han-m1055','洛南王室大墓M1055（西干大冢）'],['han-m1071','洛南王室大墓M1071（寇店小冢）']])add(id,name,'秦汉','东汉','未确定','河南省洛阳市洛南万安山北麓陵区','east-han-layout-text,east-han-plan-coordinates',{recognition:'archaeological',ownerRole:'royal_member_uncertain',evidence:'保护规划列为大型墓冢；依据规格、布局推测帝后或太后陵，具体墓主未定。',disputes:['王室大墓候选；帝陵与后陵性质待核，不赋予未经验证的皇帝陵号。']});
};
