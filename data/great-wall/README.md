# 长城数据

显示去重：Wikipedia 概览中的19条明代线路保留在文件中，但不渲染；“其他朝代概览”仅显示其余30条。详细数据以明代为主，同时包含汉长城、北齐等早期遗址，不把全部详细数据强行标为明代。

独立历史概览：`history.geojson` 来自用户提供的 `GreatWall wikipedia.kmz`，保留全部49条线路和2005个顶点，不裁剪重叠段。六组时代：春秋战国、秦、汉、北魏、辽金、明。默认关闭，作为概略走向，不代表精确测绘；文件名不能证明 Wikipedia 授权。重建：`node scripts/build-great-wall-history.cjs "C:/Users/paulw/Downloads/GreatWall wikipedia.kmz"`，不改动详细数据。

以用户提供的本地 `长城地图.ovjsn` 为主，保留其全部 2454 个要素；135 个文件夹（含根文件夹）只用于类型归并，不作为地图省份分组。内部来源标识 `ovital` 保留兼容，不作为显示名称。

补充来源按优先级：

1. 长城小站专栏的 Songyizhe 明长城谷歌数据第一版（2014）：https://www.ilovegreatwall.cn/public/TheGoogleGreatWall/MingDynastyGreatWall_Songyizhe_V1.0.kmz
2. Adl3rAi/The-Great-Wall-of-China-geodata 的 fulldirection.geojson（MIT）：https://github.com/Adl3rAi/The-Great-Wall-of-China-geodata

不使用 OSM。空间判重容差100米，原数据优先；外部线路采样后移除已覆盖部分，只保留候选缺段。补充线是概略参考，不能视作实测墙体；不保证所有历史长城完整。长城小站仅选用专栏完整包，未合并所有历年分省版本。

点位按同类型100米内判重。原始名称、对象ID、目录及备注保留；不凭英文名称猜译。数据报告见 report.json。

用户于2026-10-02确认本次整合数据可以公开发布；该确认不改变各来源原有版权，也不将整套数据声明为MIT。公开GeoJSON补充部分的MIT版权与许可声明保存在 LICENSE-Adl3rAi.txt 中。

重建：`node scripts/build-great-wall.cjs "C:/Users/paulw/Desktop/长城地图.ovjsn"`。浏览器仅加载本地构建数据，不实时访问上游。
