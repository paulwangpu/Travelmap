# 明清北京城门、宫城与城墙增补

2026-10-16；版本2.3.3；未提交、未发布。

## 增量

补24项几何：21个闭合面、1条开放线、1组两段开放墙线、1个值房实体点。研究几何813→837。此前813项及整个古都目录经深度哈希比较保持不变；不新增古都根点。

| 项目 | 几何 | 来源 |
|---|---|---|
| 正阳门城楼 | Polygon | [原始几何](https://www.openstreetmap.org/way/25109960) · [历史依据](https://wwj.beijing.gov.cn/bjww/wwjzzcslm/1737418/1738090/wwgs/623147/index.html) |
| 正阳门箭楼 | Polygon | [原始几何](https://www.openstreetmap.org/way/439956436) · [历史依据](https://wwj.beijing.gov.cn/bjww/wwjzzcslm/1737418/1738090/wwgs/623147/index.html) |
| 德胜门箭楼 | Polygon | [原始几何](https://www.openstreetmap.org/way/26514845) · [历史依据](https://wwj.beijing.gov.cn/bjww/wwjzzcslm/1737418/1738088/1742737/523418/index.html) |
| 永定门城楼（2004年复建） | Polygon | [原始几何](https://www.openstreetmap.org/way/228041535) · [历史依据](https://www.beijing.gov.cn/renwen/rwzyd/qxdw/zmzhzhpgj/ydm/202309/t20230919_3262110.html) |
| 北京内城东南角楼 | Polygon | [原始几何](https://www.openstreetmap.org/way/488647832) · [历史依据](https://www.beijing.gov.cn/renwen/rwzyd/gdwh/mcqwwgjgy/202107/t20210705_2429407.html) |
| 午门 | Polygon | [原始几何](https://www.openstreetmap.org/way/638156366) · [历史依据](https://www.dpm.org.cn/explore/buildings.html) |
| 神武门 | Polygon | [原始几何](https://www.openstreetmap.org/way/638741722) · [历史依据](https://www.dpm.org.cn/explore/buildings.html) |
| 东华门 | Polygon | [原始几何](https://www.openstreetmap.org/way/40343947) · [历史依据](https://www.dpm.org.cn/explore/buildings.html) |
| 西华门 | Polygon | [原始几何](https://www.openstreetmap.org/way/40343948) · [历史依据](https://www.dpm.org.cn/explore/buildings.html) |
| 天安门 | Polygon | [原始几何](https://www.openstreetmap.org/relation/8847697) · [历史依据](https://whc.unesco.org/en/list/1714/) |
| 端门 | Polygon | [原始几何](https://www.openstreetmap.org/way/25097188) · [历史依据](https://www.dpm.org.cn/explore/buildings.html) |
| 紫禁城宫城范围 | Polygon | [原始几何](https://www.openstreetmap.org/relation/9511883) · [历史依据](https://www.dpm.org.cn/explore/buildings.html) |
| 明内城南墙遗存 | Polygon | [原始几何](https://www.openstreetmap.org/way/984088890) · [历史依据](https://wwj.beijing.gov.cn/bjww/362771/362779/dqpqgzdwwbhdw/523514/index.html) |
| 明内城东墙遗存 | LineString | [原始几何](https://www.openstreetmap.org/way/30835267) · [历史依据](https://wwj.beijing.gov.cn/bjww/362771/362779/dqpqgzdwwbhdw/523514/index.html) |
| 西便门附近内城残墙 | MultiLineString | [原始几何](https://www.openstreetmap.org/way/33680941) · [历史依据](https://wwj.beijing.gov.cn/bjww/362771/362779/dqpqgzdwwbhdw/523514/index.html) |
| 左安门值房遗存 | Point | [原始几何](https://www.openstreetmap.org/node/10701234724) · [历史依据](https://wwj.beijing.gov.cn/bjww/362771/362779/dqpqgzdwwbhdw/523514/index.html) |
| 太和门 | Polygon | [原始几何](https://www.openstreetmap.org/way/638308745) · [历史依据](https://www.dpm.org.cn/explore/buildings.html) |
| 乾清门 | Polygon | [原始几何](https://www.openstreetmap.org/way/638807674) · [历史依据](https://www.dpm.org.cn/explore/buildings.html) |
| 太和殿 | Polygon | [原始几何](https://www.openstreetmap.org/way/638449347) · [历史依据](https://www.dpm.org.cn/subject_600/buildingdetails/253792.html) |
| 中和殿 | Polygon | [原始几何](https://www.openstreetmap.org/relation/8854349) · [历史依据](https://www.dpm.org.cn/explore/buildings.html) |
| 保和殿 | Polygon | [原始几何](https://www.openstreetmap.org/way/638473398) · [历史依据](https://www.dpm.org.cn/explore/buildings.html) |
| 乾清宫 | Polygon | [原始几何](https://www.openstreetmap.org/way/638981317) · [历史依据](https://www.dpm.org.cn/explore/building/236472.html) |
| 交泰殿 | Polygon | [原始几何](https://www.openstreetmap.org/way/638981229) · [历史依据](https://www.dpm.org.cn/explore/building/236467.html) |
| 坤宁宫 | Polygon | [原始几何](https://www.openstreetmap.org/way/639012193) · [历史依据](https://www.dpm.org.cn/subject_600/buildingdetails/253791.html) |

## 证据与表达

- 正阳门城楼与箭楼分为两个实际建筑面，注明1900年损毁后重建，未补造已拆瓮城。德胜门只接入现存箭楼，不将其面称为完整城门。
- 永定门城楼明确标注2004年复建，不称明清原构。天安门说明历代与1969—1970年重建，不与内城正阳门、宫城午门混淆。
- 紫禁城采用OSM历史宫城边界relation 9511883的四段原始相连外环，严格接合原节点；任何缺口都不强闭合。其大小与故宫公布的南北约961米、东西约753米相符。不是世界遗产缓冲区，也不等于更大皇城。
- 原始单体建筑闭合则填充；中和殿和天安门采用原始关系保留外环及孔洞结构。三大殿、后三宫标注现状形制与后世重修，现存轮廓不推定为明初建筑原貌。
- 明内城南墙采用真实墙体厚度面，保留马面等不规则边缘；东墙开放线保持开放。西便门附近两条原始开放墙线组合成单项MultiLineString，只给一个标签，不补缺口，不冒充西便门城楼。
- 左安门值房是独立遗存，保留原实体点，不凭空生成值房建筑面或已拆城楼。

## 控制及标签

全部汇入global-capital-sites，复用古都总开关、城址范围与明清分期控制，没有新增独立开关或物理数据源。同一实体对应明清时只画一次，明清任一单选均可显示；同时检查所选该朝代年份与始建年代。明1537不显示1553以后形成的永定门和左安门值房，清1866均可显示；现代复建形制仍注明现状性质。

紫禁城范围标签从zoom11显示，主要城门和城墙从12显示，密集内部宫门及殿宇从13显示；中英文与独立打卡共用稳定标识，内部遗迹打卡不改变所属北京古都或世界遗产打卡。

## 尚未接入的城门

- **已拆内城城门**：崇文门、宣武门、朝阳门、阜成门、东直门、西直门、安定门。身份已核证；准确门址及历史建筑范围待可靠历史图或考古矢量，不使用地铁站或现代桥中心代替。
- **已拆外城城门**：左安门、右安门、广渠门、广安门、东便门、西便门。身份已核证；左安门值房、西便门残墙是附近独立遗存，不冒充完整旧城门。
- **皇城旧门与完整皇城**：东安门、西安门、地安门。原始几何尚不足，不按现道路或现代公园任意圈合皇城。

“内九外七”收录状态明确分列，当前未声称全部16组已恢复到地图；门址需要有依据的坐标或历史图，不使用同名地铁站、现代立交桥或街道中心作历史门楼。完整皇城历史边界仍待可靠图件。

## 核验

新增回归覆盖24项数量及原始813项完整保留、宫城尺寸、城楼与箭楼区别、复建提示、明清单选/同时选择/年份限制、英文及独立打卡。浏览器截图与控制/打卡结果保存于output/beijing-mingqing。原始XML及研究脚本不整体加入Git。

最终验证：167项完整回归通过；app.js、ancient-capital-walls.js、capital-map-layers.js、sw.js语法及git diff --check通过。Edge本地浏览器8张截图；zoom11/12/13新增标签数1/15/24；明1537为22项、清1866为24项；朝代图例全关不隐藏内部范围，范围总关清空本批几何。城楼与箭楼独立打卡及取消不影响北京古都，英文稳定标识，页面异常0。
