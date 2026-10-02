# 长城数据

ArcGIS 点位补充（v2.1.6）：Great_Wall_of_China_WFL1 的 Forts / Towers，来源为 Yuanyuan Zhang（2010）与 Tom Hammond（2012）的 ver04 KMZ。821个原始点与既有点位比较；同类100米内、同类100–300米待核查、不同类100米内冲突均不加入。725个候选内部再按同层同朝代100米去重，加入714个：堡城620、塔台94。原始坐标及七个字段完整保留，全部标为未核实来源候选；不推断精确年代，按用户要求将 Towers 统一归入墩台烽燧（仅展示分类，原始 Towers 与 Structure 字段保留，不代表已考证用途），不直接用占位符作名称。Later Han 显示为东汉（Eastern Han），原始朝代名称仍保留供追溯。重建：先运行 scripts/compare-arcgis-great-wall.cjs，再运行 scripts/integrate-arcgis-great-wall.cjs；后者可重复运行，不重复追加。原始下载留在 output/arcgis-great-wall，原始下载不随版本发布。来源：https://www.arcgis.com/home/item.html?id=7858f29201864201802db840db2daf89 。该服务许可字段为空，不推定MIT或CC授权。

“历代概览”显示 Wikipedia KMZ 的全部49条线路，包含19条明代线路。详细数据包含多个朝代；概览作为独立粗点线绘制在详细数据下方，不替换详细线路，也不裁剪重叠段。六组朝代有独立复选框，旧存档默认全部选中；顶部开关仅控制整组显示，子选择保存于 mapOverlays.greatWallHistoryEras。

独立历史概览：`history.geojson` 来自用户提供的 `GreatWall wikipedia.kmz`，保留全部49条线路和2005个顶点，不裁剪重叠段。六组时代：春秋战国、秦、汉、北魏、辽金、明。默认关闭，作为概略走向，不代表精确测绘；文件名不能证明 Wikipedia 授权。重建：`node scripts/build-great-wall-history.cjs "C:/Users/paulw/Downloads/GreatWall wikipedia.kmz"`，不改动详细数据。

以用户提供的本地 `长城地图.ovjsn` 为主，保留其全部 2454 个要素；135 个文件夹（含根文件夹）只用于类型归并，不作为地图省份分组。内部来源标识 `ovital` 保留兼容，不作为显示名称。

补充来源按优先级：

1. 长城小站专栏的 Songyizhe 明长城谷歌数据第一版（2014）：https://www.ilovegreatwall.cn/public/TheGoogleGreatWall/MingDynastyGreatWall_Songyizhe_V1.0.kmz
2. Adl3rAi/The-Great-Wall-of-China-geodata 的 fulldirection.geojson（MIT）：https://github.com/Adl3rAi/The-Great-Wall-of-China-geodata

不使用 OSM。空间判重容差100米，原数据优先；外部线路采样后移除已覆盖部分，只保留候选缺段。补充线是概略参考，不能视作实测墙体；不保证所有历史长城完整。长城小站仅选用专栏完整包，未合并所有历年分省版本。

点位按同类型100米内判重。原始名称、对象ID、目录及备注保留；不凭英文名称猜译。数据报告见 report.json。

用户于2026-10-02确认本次整合数据可以公开发布；该确认不改变各来源原有版权，也不将整套数据声明为MIT。公开GeoJSON补充部分的MIT版权与许可声明保存在 LICENSE-Adl3rAi.txt 中。

重建：`node scripts/build-great-wall.cjs "C:/Users/paulw/Desktop/长城地图.ovjsn"`。浏览器仅加载本地构建数据，不实时访问上游。
