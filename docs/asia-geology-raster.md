# 亚洲地质影像图

用户明确要求加入已发现的亚洲栅格。以独立、可选影像模式接入，未混入自动拼合或称为中国精细图。原服务：https://tiles.igeodata.org/asia_ren/{z}/{x}/{-y}.png ，官方配置 output/onepetrology-mapmanager.js 的 init_aisa_ren，署名 Ren JISHUN team / IGEO@CAGS。采用TMS翻转，不下载或再分发整套数据。

HTTPS匿名瓦片z6、z10、z12实测200；带Origin请求未提供CORS头，不能直接用于MapLibre纹理。选择后使用已有Leaflet二维引擎，保留视野与透明度；切换回其他模式恢复MapLibre。限制原始瓦片最大12级。已有原图覆盖以实际返回的瓦片为准，不用亚洲矩形冒充完整覆盖。

原栅格的独立图例、数值比例尺、可复用许可、位置查询尚未核实；官网公开展示不等同开放数据许可，因此不将其打包为离线资产，也不宣称CC BY。不能将CGMW IGMA的1:500万直接套用到该端点，不能用岩浆岩专题dde:GEO_asia查询此影像。地图说明保留上述限制，详情只展示本影像来源与位置查询不可用提示，不查询或显示Macrostrat地层。

验证：成都影像与独立详情，主页面Leaflet/MapLibre往返，原始署名、刷新、恢复Macrostrat图例和缓存更新。兼容旧存储，新增asia状态归一化。未发布Git版本。

2026-10-05 图例补充：找到编制团队在 ResearchGate 公开的 IGMA 原版图例页面 https://www.researchgate.net/publication/304485539_Legend 。增加“原版图例（参考）”外链，标题明确尚未核实与当前瓦片完全一致；页面抓取返回429，未嵌入图片或据此生成色块。影像本身不妨碍配图例，但确认同一版本与配色后才能作为当前图层图例。卡片说明改为11px，与辅助文字一致，缩短为“影像图层，暂不支持点击查询。”
