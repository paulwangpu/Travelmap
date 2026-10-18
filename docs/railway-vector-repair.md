# 矢量铁路数据源与重复加载修复

2026-10-16；版本2.3.3；未提交、未发布。

旧样式保留了单独railway_line_high、旧turntables合并组和points_of_interest地址。此前浏览器7组源中3组失败；已按当前上游生成样式更新为8组，包括独立车站、站台、道岔和新版POI/面积组，78层标准铁路样式。没有临时删除失败源而牺牲细节。

同一地图、语言、样式的同步复用现有数据源及瓦片缓存，并合并并发安装。禁用、切换语言或基础样式重置后允许重新安装。错误跟踪至具体源和瓦片，仅同一资源成功后清除失败，不用另一块瓦片的成功覆盖仍失败的请求。关闭时清空本次状态，不自动切换图片版。

浏览器验证：8个TileJSON接口全部200；铁路78层、8源，视口实际渲染3781项铁路要素。连续同步5次新增数据源0、原数据源对象保持一致；正常铁路请求无HTTP错误和请求失败。模拟暂时失败及匹配资源恢复，提示成功更新；关闭后移除8个铁路源。页面异常0，控制台另有非铁路404及测试主动注入的暂时错误，不作为铁路服务失败。

全套171项回归通过，新增覆盖并发安装、语言变化、底图重置、资源分别恢复与现有悬停查询。真实请求记录及截图在output/railway-diagnosis/repaired-browser.json、repaired-network.png。服务未来仍可能暂时不可用，以上为本次核验结果。

上游源码：https://github.com/hiddewie/OpenRailwayMap-vector/blob/master/proxy/js/styles.mjs 。使用政策：https://github.com/hiddewie/OpenRailwayMap-vector/blob/master/USAGE.md 。仅正常浏览按需取瓦片，未批量下载或分发瓦片数据。
