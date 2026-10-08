# World language areas

Glottography/asher2007world v2.0, contemporary language areas, from Asher & Moseley (2007), Atlas of the World’s Languages. https://github.com/Glottography/asher2007world/tree/v2.0

CC BY 4.0. See language-areas-LICENSE.txt. Cite original atlas and Ranacher et al. (2025), https://doi.org/10.1038/s41597-025-05828-6 and dataset release https://zenodo.org/records/18613195. Contemporary means the atlas period, not current live data.

4062 source features. Coordinates simplified with Douglas-Peucker tolerance 0.005 degrees and rounded to 5 decimals. Narrow or small rings retain coordinates if simplification would invalidate them. Source geometry attributes reduced. No census/population shares inferred.

Chinese common language names use Unicode CLDR and manually curated aliases. Unmatched names remain in the original language rather than guessing. Families use a curated dictionary; unmatched family names remain original. CLDR: https://github.com/unicode-org/cldr-json (Unicode License v3).

Chinese translation expansion (2026-10-07): exact Glottolog code matches to Wikidata P1394 labels (CC0), normalized to simplified Chinese using OpenCC. Existing curated/CLDR translations retained. Matching by names alone is not used for languages. See language-translations-audit.json. Some rare languages still have no Chinese label; original names are retained. Family translations expanded with curated terms and unambiguous English-name matches.

## China-priority naming review (2026-10-07)

39 curated display overrides in language-zh-overrides.json, applied reproducibly by scripts/apply-language-zh-overrides.cjs. A broad spatial screen against the local Chinese province geometries identified 21 untranslated candidate records; all 21 now have Chinese display names. This screen can include cross-border and historical cartographic spillover and is not an authoritative inventory of languages spoken in China. 8 overrides are explicitly marked as transliterations in the popup; original names and IDs remain.

References:
- Yi southeastern varieties (Axi/Azhe): https://www.ynmyw.cn/uploadDir/pdf/20211203/1638513785852.pdf
- Huzhu Tu language: https://www.cp.com.cn/book/30f47779-6.html
- Chinese language/ISO variety correspondence (Hani, Wa, Palaung, Tibetan): https://library.ttcdw.com/dev/upload/webUploader/202408/1723128716038eb45ac4151cfb.pdf
- Dzalakha/Deori/Humla Chinese names: https://lingweb.eva.mpg.de/channumerals/Dzalakha.htm ; https://lingweb.eva.mpg.de/channumerals/Deori.htm ; https://lingweb.eva.mpg.de/channumerals/Sino-Tibetan-CN.htm
- Drugchu and retired Dafla classification: https://glottolog.org/resource/languoid/id/hbru1241 ; https://glottolog.org/resource/languoid/id/nisi1239
- Ngochang distinct from Longchuan Achang: https://glottolog.org/resource/languoid/id/ngoc1235

The atlas classifications and fixed colors are preserved. Clearer Chinese wording does not merge distinct Glottocodes.

Language affinity coloring uses Glottolog CLDF classification.nex retrieved 2026-10-07: https://github.com/glottolog/glottolog-cldf/blob/master/cldf/classification.nex (CC BY 4.0). Subtree intervals subdivide a fixed hue band within each atlas family. Color expresses classification, not quantified mutual intelligibility or lexical distance. Unmatched/retired entries use their atlas family without an inferred branch.

Added 2 contemporary family-level geometries from Glottography/asher2007world v2.0 cldf/contemporary/families.geojson (Hmong-Mien hmon1336; Tungusic tung1282), simplified by the same tolerance. Total: 4062 language records + 2 explicitly marked family-area records. Family areas precede individual languages in drawing order. They describe family-level coverage and must not be interpreted as individual language territories. Tungusic is now separately selectable and colored; its 9 language records remain.


### 中国区域纠错（2026-10-08）

- 原始 Hezhe (Nanai) 记录 1986 混入云南北部约 100.19–100.52°E、28.31–28.93°N 的孤立多边形。移除该块，保留东北及俄罗斯远东区域，不猜测该块应属何种语言。
- 从同版 contemporary/features.geojson 恢复 Miao（3829、3830）及 Yao（6589、6591）的原地图集语言群区域，使用独立 atlas ID 和苗语族／瑶语族分类，避免沿用不正确的单语言关联。保留 sourceFeatureIds 可追溯来源。
- 这些合并区域包含云南及东南亚，未细分具体语言，也不代表中国苗瑶语言的完整分布。中国总图所附区域在原始数字化数据中覆盖不足，未据此推测或绘制贵州、湖南等缺失范围。
- 可重复运行 scripts/fix-language-china-areas.cjs，然后运行 scripts/build-language-legend.cjs。


### 原始区域记录恢复（2026-10-08）

scripts/restore-language-source-areas.cjs 从同版 features.geojson 恢复未被单语言汇总文件纳入的记录。恢复 1,288 条源记录，按有效分类编号合并为 1,244 个新增区域：265 个语言群、784 个方言、195 个分类待核实区域。方言沿其 Glottolog 上级语言确定语系；无有效分类关联的区域保留原名、灰色及待核实说明，不猜测分类。精确编号的 Wikidata 中文名和人工核对的中国名称优先，缺少可靠中文名时保留原名。未知编号不生成无效 Glottolog 链接。

一条源记录 Jin / 2272 的名称与 Ching 编号、贵州位置冲突，隔离而不猜测重命名。统计是区域记录数，不是新增语言数；原始区域可能重叠。未对原始地图集缺失区域推测边界。详情见 language-source-restoration-audit.json。

补充说明：此前将所有苗语关联问题统称为“错误编号”不够准确；firs1234 实为 First Vernacular Hmong 的语言群编号，本身属于正确语系，遗漏也由只接入单语言层级造成。

新增中国记录中文名补充：科尔沁、喀喇沁、巴尔虎、巴林等蒙古语土语及太湖片吴语。科尔沁／喀喇沁名称参考中央民族大学国家语言资源监测与研究民族语言中心 https://nmlr.muc.edu.cn/info/1119/2132.htm 。源记录 5667 Taihu Dialect 补充关联 Glottolog taih1244（Taihu），按其吴语上级路径分类；原始 sourceFeatureIds 保留。

显示修正：语系已有具体语言区域时，不再显示语系总范围填色及标签。方言记录与其已显示的上级区域同色时，仅保留方言标签和详情，不重复填色或描边，避免形成透明度接缝。

方言显示进一步修正：同色方言只取消与上级区域重叠部分的填色，其超出上级范围的部分仍显示。原始方言范围保留，用于标签和点击详情；预计算的 dialectResidualGeometry 由 scripts/build-language-dialect-residuals.cjs 生成，避免误隐藏太湖片等不完全重叠的区域。残余填色不额外描边，以免产生拼接线。重新生成区域或配色后需重跑此脚本。

俄语／鄂温克语显示叠加修正：针对 russ1263 与 even1259 的重叠，绘制俄语时扣除鄂温克语范围；仅处理这两个记录的显示叠加，不推定实际语言排他性，原始区域用于标签及详情仍保留。两个记录都可见时才应用；隐藏通古斯语系会恢复完整俄语填色。由 scripts/fix-russian-evenki-overlap.cjs 重建。逐块描边和抗锯齿保留。
