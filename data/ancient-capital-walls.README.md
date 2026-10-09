# 明清城墙范围（完整接入）

来源：CCWAD，Xue et al. (2021)，https://doi.org/10.5194/essd-13-5071-2021 ，数据 https://doi.org/10.6084/m9.figshare.14112968.v3 ，CC BY 4.0。原坐标系 WGS84。

完整保留 MingQingCityWall.shp 的3356条几何和年代记录，每条以原始行号 sourceId 标识，不按名称合并，不排除同名异地。按 begin/end 筛选所选年份。sourceName、placeType、reliability、reference 保留原字段；已核实的名称通过名称、地理位置和行政类型映射中文，其余保留原始拼音。

原始记录数不是城市数。某些记录只在很短时期有效，未必出现在6个代表年份中，但完整保存在本地数据里。数据年代沿用来源，不等于精确建城年代。附属关城、卫所及驻防城均按来源保留，不能将所有范围视为古都。

北京、洛阳分期模块仅用 ancient-capital-wall-snapshots.geojson 辅助定位参考点，不绘制城墙；所有城墙由统一图层绘制和开关控制。凤阳府城范围不等于完整明中都；所有范围均非现代行政界或其他朝代城界。

重建：将来源 ZIP 解压到 output/ancient-city-walls，运行 node scripts/build-ancient-capital-walls.cjs。城市定位列表已移除，仅保留开关、年份与范围点击详情。

中文名称补充表位于 ancient-capital-wall-translations.json，使用拼音及大致地理位置共同匹配，匹配范围0.15度。行政类型10种及来源文献6类在弹窗翻译为中文；未确认地名仍显示原拼音。
