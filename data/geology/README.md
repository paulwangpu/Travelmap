# 中国放大概略图

此资产现作为历史构建材料保留，应用已改为全球通用的在线 zoom 4 背景，不再读取或预缓存本文件。当前行为见 `docs/geology-global-fallback.md`。

`china-overview.geojson` 是 Macrostrat carto 在 zoom 4 实际显示的 source_id 154 地质面快照（2026-10-05），保留原始颜色、年代、岩性及引用字段。使用本项目已有中国行政面裁剪；行政边界仅限制显示，不代表官方地质图幅覆盖。

用于自动模式在较高缩放时补充空白背景，原始数据精度不变，数值比例尺未提供。全球概览模式保持原有在线瓦片行为。不是中国官方精细图。

来源：https://tiles.macrostrat.org/ ，Macrostrat · CC BY 4.0；原始图源引用在记录中保留。

重建：下载无扩展名 `/carto/4/{x}/{y}`（x=11..14，y=5..7）到 `output/china-overview-tiles/4-x-y.mvt`，运行 `node scripts/build-china-geology-overview.cjs`。依赖项目已有 polygon-clipping 0.15.7 及固定版本 vector-tile 解析器。

构建时先把 Node Buffer 复制为从零偏移开始的 Uint8Array，避免 Pbf 4 浮点读取错位；验证年代数值后输出。地质面同时裁掉 MVT 瓦片缓冲边缘，防止相邻片段重复叠色。修正资产缓存版本为 v2。
