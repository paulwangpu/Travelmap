# CHGIS 本地历史与人口图层

2026-10-25补充：“历史”通过来源下拉选择CHGIS或TWHA；CHGIS另接入1990年CITAS普查的省级33、地市级346、县级2438条边界，与“人口”使用相同几何。1990年仅作独立年层，不外推到1912–1989年，不生成治所点。原始时间序列仍截止1911年。

1990年原表地名为繁体，界面现以OpenCC tw-to-cn转换为简体，2817条记录中1770条名称发生字形转换；保留`nameZhOriginal`、`parentZhOriginal`供核对。只转换文字，不修改人口、行政代码、年份或几何。重建普查数据后运行`node scripts/normalize-citas-population.cjs`（本地转换器默认`output/opencc-t2cn.cjs`，可通过第一个参数指定路径），同时生成历史用的三个1990边界文件。人口弹窗和历史弹窗可查看不同于显示文字的原表名称。

“历史”整合 CHGIS V6 及选定V4补充，共26个图层、85,196条有效要素。“人口”保留现代2020及原有四期研究数据，并增加1990年CITAS普查省／地市／县三级数据。完整核查与全部94个官方下载链接见 [数据清单](../sources/chgis-data.html)。

下载研究记录：`output/chgis-research/download-results.json`；77个压缩包均成功解压。1990人口原始变量说明：<https://dataverse.harvard.edu/api/access/datafile/2966749?format=original>。A102为人口总数，A101为户数，不能混用。三级按行政代码汇总，均为1,130,822,993人，是资料覆盖区合计，不等同于完整全国普查总数。

来源：https://doi.org/10.7910/DVN/I0Q7SM

原包：https://dataverse.harvard.edu/api/access/datafile/2966510?format=original

许可：https://doi.org/10.7910/DVN/FDLFJ3

原包 README 明确不允许重新发行。当前只在本地加载 `output/chgis-v6-prefecture.geojson`，该衍生文件、原始ZIP及解压文件不在发布资源清单中。不得随Git提交、网站部署或数据包重新发行。公开发布需先解决来源许可；仅不加入Service Worker清单并不能阻止托管服务器发布文件，部署前必须排除整个 `output/` 及其中的原始、衍生数据。

## 数据处理

- 府级时间序列原表3830条，日期倒置的永宁军 SYS_ID 220054（1129–1124）暂不参与显示，保留在本地 `output/chgis-v6-excluded.json`，不推测修正。新增图层的异常和删除记录见 `output/chgis-research/preparation-audit.json`。
- 3829条有效记录，按 `BEG_YR <= year <= END_YR` 筛选；范围前224–1911，界面不接受0年。
- 原表不仅有府级政区，还包含少量其他等级、非政区地域；提示文字不将全部要素称为府级政区。
- 保留原始中文名、罗马字名、类型、系统ID及起止年规则；不添加人口或推测上级分区。
- 面几何转等积投影处理、300米简化；去除小于25平方公里且小于主体1%的次要碎片，填平小于25平方公里的内部孔洞；最终修复几何，标注点在主体内部。
- 字体沿用12px Open Sans Regular / Arial Unicode MS Regular与白色描边；小区域按面积延后标名。
- 17个代表年份快捷选项、单行年份滑杆、独立透明度，以及上级／府州／县／局部政权层级；MapLibre与Leaflet均实现。1820、1911优先使用对应独立年层，绝不外推到其他年份。治所默认开启，村镇、水系、驿路按实际年代可用性控制。
- 旧版上级分区、政权及福建县界均为局部覆盖。治所点只提供位置，不据此生成辖区面。明代驿路为朝代专题，含1903年邮政图位置参照，未逐年复原；173个后期参照点单独标明。旧DEM为配准地形JPEG背景，留作参考，不叠加遮挡现有底图。
- 不是全国完整年层。政区以原表空间覆盖为准，尤其不能将秦汉时期的少量面误认为完整全国政区。

## 重建

安装 pyshp、shapely、pyproj 后：

```powershell
python scripts/prepare-chgis-v6.py --source PATH_TO/v6_time_pref_pgn_utf_wgs84.shp
```

本地验证：`node output/test-chgis-v6.cjs`、`node output/check-chgis-browser.cjs`、`python output/verify-chgis-geometry.py`。验证包括年份筛选、中文名称、有效几何、内部标注点、透明度、人口独立切换、刷新保留、移动端及图层移除。

扩展数据重建：`scripts/prepare-chgis-research.py`（另需Fiona读取MapInfo），然后 `scripts/prepare-citas-population.py`。本地下载与解压脚本保存在 `output/catalog-chgis-downloads.cjs`、`output/download-all-chgis.cjs`、`output/extract-all-chgis.cjs`。

扩展验证：`node tests/chgis-history.cjs`、`node tests/citas-population.cjs`、`node output/check-chgis-expanded.cjs`、`node output/check-chgis-rendered.cjs`、`python output/validate-chgis-research.py`。旧的单一府级数据测试只适用于扩展前的界面，应以这些扩展验证为准。
