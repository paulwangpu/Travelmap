# 中国地质图接入核查（2026-10-05 UTC）

后续放大保留机制已扩展全球：使用同一 Macrostrat carto zoom4 PNG/MVT 作为全球背景、图例和空白位置主记录，不再按中国行政面裁剪或预缓存中国资产。中国官方精细图核查结论不变。当前实现见 `geology-global-fallback.md`；下文保留接入和历史修复核查记录。

## 结论

未发现已通过全部接入检查的中国官方匿名精细服务。因此没有启用任何中国精细图，也没有新增图幅覆盖声明。自动模式新增 Macrostrat carto z4 实际地质面的中国裁剪快照，在放大时保留原始概略覆盖；全球概览保持原在线瓦片。此版本修复放大空白、改善来源一致性，不提高中国原始数据精度。没有发布或推送 Git 新版本。

## 本次继续核查

| 官方候选及实际端点 | 实测 | 不启用原因 |
| --- | --- | --- |
| CGS OneGeologyChina：`https://onegeologychina.cgs.gov.cn/cgi-bin/mapserv.exe?map=C:/ms4w/apps/CHINAGEOLOGY/CHINAMMAP_ENGLISH.map&SERVICE=WMS&REQUEST=GetCapabilities` | 主机 DNS 解析失败；历史入口由 CGS 公告确认 | 无法验证当前元数据、匿名瓦片、真实图幅、图例、查询和条款 |
| 服务申请入口：`https://igss.cgs.gov.cn/admin/token/service/index.jsp` | HTTPS 15秒超时 | 未取得可核查服务信息；不能由页面路径推断必须有账号 |
| OnePetrology：`https://dde.igeodata.org/geoserver/ows?service=WMS&version=1.3.0&request=GetCapabilities`，`dde:GEO_asia` | HTTPS200、CORS `*`、Fees/AccessConstraints NONE；GetFeatureInfo与WFS均可匿名读取 | 实际可查要素是岩浆岩专题，不是完整区域地质图；成都、北京返回空。名称和亚洲矩形bbox不能证明完整覆盖。不能用它查询下面的另一张全地质栅格 |
| Ren Jishun 亚洲地质栅格：`https://tiles.igeodata.org/asia_ren/{z}/{x}/{-y}.png` | 官方 OnePetrology 页面配置，z6瓦片200；带Origin请求未提供CORS头 | 未验证该栅格自身的真实覆盖、数值比例尺、再使用条款、图例及一致的位置查询；不启用 |
| 香港 CEDD：`https://ginfo.cedd.gov.hk/server/rest/services/HKGeology?f=pjson` | HTTPS200返回JSON错误499 Token Required；根目录CORS可用 | 地质服务不可匿名读取；20k/100k下载页面需联系信息和验证码，未操作表单。局部香港数据也不能改善成都、北京 |
| USGS Far East `geo3al`，`https://data.usgs.gov/datacatalog/metadata/USGS.60abc7f9d34ea221ce51e5ee.xml` | 官方元数据200、原图1:5,000,000 | useconst明确限制向第三方分发原始或派生数据；不是可自由再分发的USGS自有数据，不打包进应用 |

可复核入口：[CGS OneGeologyChina 公告](https://en.cgs.gov.cn/news1/201603/t20160309_266274.html)、[OnePetrology](https://dde.igeodata.org/)、[CEDD 地质开放数据](https://www.ginfo.cedd.gov.hk/geoopendata/eng/GeologicalMap.aspx)、[USGS 原始元数据](https://data.usgs.gov/datacatalog/metadata/USGS.60abc7f9d34ea221ce51e5ee.xml)。本机原始响应保存在 output/ 中，不作为应用缓存资源。

## 官方入口核查

| 入口 | 实测结果 | 未启用原因 |
| --- | --- | --- |
| https://www.cgs.gov.cn/ | 可访问，服务接口和地质图件指向地质云 | 主页不是瓦片服务 |
| https://geocloud.cgs.gov.cn/ | web 工具及本机 HTTPS 请求均超时（本机15秒） | 无法取得服务元数据、真实图幅边界、匿名瓦片、图例、查询接口及使用条款；CORS未验证 |
| https://geocloud.cgs.gov.cn/topic/view?id=1572879185748213761 | web 工具及本机 HTTPS 请求均超时（本机10秒） | 同上；不得依据全国/矩形范围认定覆盖 |
| https://www.webmap.cn/ddGeoportal/geoportalMap.html?t=1&typeId=2 | 页面读取失败 | 数据分发入口不能等同于可直接接入的地质面服务 |

官方公告 https://m.cgs.gov.cn/ddyw/202201/t20220121_690354.html 提及1:5万图幅及1:20万、1:50万、1:100万等服务，但公告本身不证明匿名浏览器接入、覆盖或再使用许可。https://www.cgs.gov.cn/hdjl/zxjy/202008/t20200828_820884.html 是历史服务说明，不能作为当前可用端点验证。

1:20万/25万、50万/100万及5万图幅均未达到启用门槛。没有账号/密钥要求已被证实的结论，也未尝试使用第三方令牌。

## Macrostrat 验证与实现

官方说明：https://tiles.macrostrat.org/ 。原始图源引用和 Macrostrat CC BY 4.0 保留。

- 地图：HTTPS `/carto/{z}/{x}/{y}.png`。图例和点击：TileJSON 实际使用的无扩展名 `/carto/{z}/{x}/{y}` protobuf，`units` 图层的实际 polygon、`color`、`map_id`、`source_id`。带 Origin 请求 CORS `*`，浏览器实测成功。`.mvt` 扩展形式不作为接入依据。
- 读取真实 `best_age_top/bottom`、`t_int` 字段，保留原文地层名，不猜测中文名称。数值比例尺只有元数据明确提供时才显示；`tiny/large` 等分类不能推算成比例尺，缺少数值时显示原始尺度分类（局部详图/区域地质图/洲际地质图/全球概略图），分类也缺少时显示“未提供”。
- 原有 v3 地点图例端点在成都、北京 zoom10 返回空数组，不能用它替代当前地图的真实单元。v2 位置记录现在仅放入图源对照。
- 成都104.06,30.67和北京116.4,39.9：z4地图面和图例可用，主记录来自source154。z10在线瓦片为空；自动模式现在实际绘制source154的中国裁剪概略面，并以这些相同地质面生成图例和主记录，额外标注放大不会提高精度。全球模式仍据实提示在线地图无地质面。
- 当前启用注册表仅 Macrostrat；未来官方 provider 必须先验证真正图幅边界和全部接口，才可加入。未实现伪精细覆盖或未经验证的官方接口。

## 检查结果

通过：语法检查、geology-legend/providers/detail、map-overlay-layout、map-layer-order、population-density-basemap、railway-overlay、map-resolution、esri-relief；新增几何孔洞、视野裁剪、经度环绕、缓存与取消测试。旧铁路测试同步此前已改为“铁路”的名称，并补入已有的地质层可见条件。

浏览器通过：成都、北京跨域，真实 MapLibre 和 Leaflet 栅格及点击弹窗，默认详情 tab，切换对照、连续点击只显示最后位置、失败提示及重试恢复、样式重载关闭旧详情、应用自动/全球切换。390×844移动端实测通过，修复Leaflet宽度溢出及查询完成后的自动定位；中英文切换通过。应用重载后全球模式和65%透明度仍保存，最后恢复自动模式。图源与透明度通过现有本地状态保存；未设置图源的旧状态默认auto。

中国官方精细图幅内、图幅边缘和官方/全球混合视野验证：不可执行，因为无通过验证的官方 provider；不得报告为通过。边界和无覆盖使用实际carto polygon，没有中国矩形掩膜。提供本地双引擎预览 `output/geology-engines.html` 和失败/连续点击验证页 `output/geology-preview.html`（开发验证文件，不进入应用缓存）。缓存升级travel-map-v815，应用版本仍2.2.2。


本次追加验证：china-geology-overview 实际资产测试通过，成都/北京z10自动保留实际地质面、图例与主记录一致、国外和边界外不补面、全球模式不补面、取消与缓存通过；双引擎浏览器z10地图和详情通过，应用自动/全球切换无浏览器错误。调整地质层顺序，始终在点亮和水系之前；原有图例/详情/图层顺序/铁路/布局测试通过。快照536个裁剪片段，约1.3MB，保留孔洞。中国精细服务仍未能完成实际接入。

随后发现全国视野中部分地图块缺失：Node Buffer 池中存在非零 byteOffset，构建脚本直接交给 Pbf 4 会错读部分 double 年代字段，使数值异常巨大；MapLibre 将属性编码成内部瓦片时报 `Given varint doesn't fit into 10 bytes`，整块无法显示。修正构建输入并重建全部536个片段，增加全部年代字段范围/顺序检查及乌鲁木齐、拉萨、昆明、上海覆盖回归。裁去瓦片缓冲边缘，避免重复叠色。全国z5浏览器验证缺块消失、错误日志为空；下拉框固定28px高度，图例列表最高180px并在内部滚动。新资产v2，缓存travel-map-v818。
