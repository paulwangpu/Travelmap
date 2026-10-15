# 古都按具体城址命名核验

本轮只修改地图显示名称及其缓存版本，发布版本保持 2.3.3。

- 删除按行政区归并为九座现代城市的概览标签逻辑。343 个数据根点统一使用城址名称；原先受影响的 21 处见 `capital-site-label-audit.json`。
- zoom 5 至不足 11 使用可选概览短名，zoom 11 起使用完整名称。郫邑分别为“郫邑（候选址）”与“郫邑（杜鹃城候选）”；成都、金沙遗址保持独立名称。
- MapLibre、Leaflet、世界遗产合并标记共用根点命名。悬停采用完整名称；详情、候选位置说明和今属行政区保留。
- 数据深度比较确认除新增的中英文显示字段外，所有原字段、557 条记录、根点标识、名称、坐标和关联均未改变；几何文件未修改。

验证：全局中英文名称；zoom 5／8／11／15；打卡、取消打卡、古都关闭后普通打卡样式、朝代全关；世界遗产合并名称；Leaflet 标签边界及类别隐藏。浏览器无页面脚本异常。

截图位于 `output/pi-capital-label-full.png` 和 `output/{chengdu,luoyang,xian,beijing,datong}-capital-site-labels.png`；浏览器结构化结果位于 `output/capital-site-labels-browser-results.json`。研究材料不整体加入 Git。
