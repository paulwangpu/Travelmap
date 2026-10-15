# 埃及王陵与卡塔伊增补核查

2026-10-15。在本轮开始时的479条皇陵、394个古都根点基础上，增量增加8处王陵实体及卡塔伊1个古都根点／1条都城记录，另增加1项清真寺原始建筑面。全部原有皇陵、来源、古都、记录、ClassicalSites条目及几何（含孔洞）保持一致，SHA-256校验参数见[机器审计](egypt-priority-supplement.json)。发布版本保持2.3.3，不提交、不发布。

| 新增王陵 | 时期分组 | 定位与性质 |
|---|---|---|
| 纳尔迈王陵（B17／B18） | 中国史前，归入“传说” | 考古图判读估计参照；非实测墓界。B17与B18按同一王陵组合收录；纳尔迈归属依据早期王陵目录与墓区图，保留归属及绝对年代讨论，不拆成两个重复打卡点。 |
| 阿哈王陵（B10／B15／B19） | 中国史前，归入“传说” | 考古图判读估计参照；非实测墓界。B10、B15、B19作为阿哈王陵组合共用一条实体记录；点为墓区图配准参照，不表示三座墓室的精确中心或完整围界。 |
| 阿蒙霍特普三世陵（KV22／WV22） | 夏商 | 原始OSM墓体几何参照；非入口测绘。位于帝王谷西谷，KV22与WV22是同一墓。原始OSM建筑名VW22疑为字母倒置，按墓谷与考古墓号核对后规范显示；建筑标绘参照不等于墓室入口。 |
| 拉美西斯十世营建墓（KV18） | 夏商 | 原始OSM墓体几何参照；非入口测绘。未完工且没有用于王室安葬；作为有据王陵营建遗迹接入，不标为实际安葬。后世设施及利用不改变其原营建性质。 |
| 拉美西斯十一世营建墓（KV4） | 夏商 | 原始OSM墓体几何参照；非入口测绘。拉美西斯十一世未安葬于此。保留未完工及后续作业、复用性质，不因传统墓名认定存在其实际安葬。排除偏离原始墓体约80米的同名OSM点，采用原始墓体面参照。 |
| 阿肯那顿王室墓（TA26） | 夏商 | 原始OSM墓体几何参照；非入口测绘。位于阿玛尔纳东部王家谷，不属于卢克索帝王谷。考古队根据石棺及随葬残件讨论阿肯那顿在此安葬，梅凯塔顿墓室有据；未将提伊、娜芙蒂蒂拟用空间写成确定安葬。与阿玛尔纳古都独立打卡。 |
| 塞内布凯王陵（CS9） | 夏商 | 考古图判读估计参照；非实测墓界。南阿拜多斯CS9墓，铭文及遗骸支持墓主认定。不同于乌姆卡伯早王朝陵群，也不是邻近S10墓；依据发掘图比例尺、真北及S10地理参照估计选点，未接入未经核准的墓室边界。 |
| 梅丽特阿蒙王后陵（TT358） | 夏商 | 考古图判读估计参照；非实测墓界。位于代尔巴哈里哈特谢普苏特神庙北柱廊外侧山谷，不属于王后谷。墓主为第十八王朝阿赫摩斯－梅丽特阿蒙，不与拉美西斯二世同名女儿混淆。点仅按1932年原始发掘图与地理影像对照定位北柱廊外侧区域，具体入口及墓室中心待核。 |

纳尔迈和阿哈分别按同一实体墓葬组合记录；放大后独立显示、独立打卡，缩小后随乌姆卡伯陵群聚合。KV22／WV22共用一条记录；KV18、KV4未用于相应国王安葬，不列“实际安葬”，在现有性质分组中暂列待考并明确未使用。阿肯那顿TA26不属于帝王谷；梅丽特阿蒙TT358不属于王后谷，亦不与第十九王朝同名人物合并。塞内布凯CS9不同于邻近S10，不加入早王朝乌姆卡伯陵群。

4个图示参照点均标为估计。纳尔迈、阿哈按已发表考古图及相邻墓葬参照配准；拟合残差不作为定位精度。CS9按发掘图真北、比例尺和S10相对位置估计；TT358仅确定神庙北柱廊外侧区域，具体入口、墓室中心及边界待核。未生成任何虚构墓界。生卒年未核者保持空缺，不将建墓年代冒作生卒年。

卡塔伊为图伦王朝都城，中国对应时期“隋唐”；都城记录采用9世纪后期—905年，王朝为868—905年，二者不混用。根点取清真寺所在历史核心区域，明确不是已确认的王宫位置。与福斯塔特、阿斯卡尔及法蒂玛开罗分址、独立打卡；仅关联历史开罗遗产背景，不复用原世界遗产打卡身份。

新增伊本·图伦清真寺原始OSM relation 74081建筑面，保留中央庭院孔洞。闭合部分按现有全局古都细节渲染；建筑不是全城、皇城或城墙，完整城郭、宫城及宫殿范围尚待可靠资料，不以随意多边形补齐。

来源：
- [Royal tombs at Abydos: Cemetery B](https://www.ucl.ac.uk/museums-static/digitalegypt/abydos/abydoskingstombs.html)（UCL Digital Egypt）。
- [Umm el-Qaab archaeological plans, figures 2 and 9](https://www.persee.fr/doc/arnil_1161-0492_2008_num_18_1_955)（Archéo-Nil / Persée）。
- [Theban Mapping Project tomb plan 阿蒙霍特普三世陵（KV22／WV22）](https://thebanmappingproject.com/sites/default/files/plans/KV22_2.pdf)（Theban Mapping Project）。
- [The Oxford Handbook of the Valley of the Kings: KV18 unused burial](https://api.pageplace.de/preview/DT0400.9780199931644_A26121117/preview-9780199931644_A26121117.pdf)（Oxford University Press）。
- [Theban Mapping Project tomb plan 拉美西斯十世营建墓（KV18）](https://thebanmappingproject.com/sites/default/files/plans/KV18_1.pdf)（Theban Mapping Project）。
- [Research on the tomb of Ramesses XI, KV4](https://www.ifao.egnet.net/uploads/publications/enligne/BIGEN071_art_10.pdf)（Institut français d’archéologie orientale）。
- [Theban Mapping Project tomb plan 拉美西斯十一世营建墓（KV4）](https://thebanmappingproject.com/sites/default/files/plans/KV04_0.pdf)（Theban Mapping Project）。
- [Royal Tomb](https://www.amarnaproject.com/amarna-the-place/royal-tomb/)（Amarna Project）。
- [The Tomb of King Seneb-Kay at Abydos, figure 1.1](https://api.pageplace.de/preview/DT0400.9781949057102_A49510137/preview-9781949057102_A49510137.pdf)（Penn Museum / excavation publication）。
- [Abydos research project](https://www.penn.museum/research/project.php?pid=19)（Penn Museum）。
- [The mummy of Queen Merit Amun](https://egymonuments.gov.eg/news/the-mummy-of-queen-merit-amun/)（Ministry of Tourism and Antiquities, Egypt）。
- [The Tomb of Queen Meryet-Amun at Thebes (1932), Plate I](https://libmma.contentdm.oclc.org/digital/collection/p15324coll10/id/168201)（H. E. Winlock / Metropolitan Museum of Art）。
- [埃及文物部：卡塔伊／伊本·图伦清真寺](https://egymonuments.gov.eg/collections/historical-cairo/)。
- [埃及文物部：卡塔伊／伊本·图伦清真寺](https://egymonuments.gov.eg/monuments/ahmad-ibn-tulun-mosque/)。

本轮后：埃及84条皇陵记录（76座单陵、8个陵群），全球487条皇陵、364个可入图参照；古都395个根点、622条记录；ClassicalSites为288处、2562项几何。

验证：164项回归全部通过；皇陵目录校验487条记录／867项来源／364个可入图参照；相关JavaScript语法和git diff --check通过。本地浏览器已逐项核对8处王陵、卡塔伊建筑面、朝代筛选、范围开关、中英文及独立打卡，截图与结果保存在output/egypt-priority。
