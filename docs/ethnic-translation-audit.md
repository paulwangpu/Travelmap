# Ethnic translation audit

Display translations are separate for GeoEPR and GREG. A shared English label is not evidence of equivalent ethnicity. The GREG corpus contains 928 distinct names across 8,969 polygon records; every name has a display translation, but this coverage count is not a claim that all uncommon transliterations have been independently verified.

## Context and corrections

| Source / name | Display / handling | Evidence |
|---|---|---|
| GREG Tay, 1067, FIPS CH | 傣族; other countries retain the broader GREG classification | Public GREG query at 100.8,21.9 returns Tay / 1067 / CH |
| GeoEPR Tay, Vietnam | 岱依族（Tay） | Distinct source record; do not reuse for GREG |
| GREG Sui, 1029 | 库伊族群（苏艾人） | GREG records in LA, TH, VM; Suay/Sui is a Kui exonym, not Chinese Shui |
| GREG Shuichia | 水族 | Historical Chinese spelling retained in source dictionary |
| GREG Yao, 1229 | 瑶族 | GREG distinct-country query returns BM, CH, LA, TH, VM |
| GREG Wayao / African GeoEPR Yao | 尧族群（非洲 Yao） | African Yao is distinct from Asian Yao |
| Kachins | 克钦族群（多个相关民族的合称） | Kachin includes Jinghpaw, Lisu and several other peoples |
| Hmong | 赫蒙族群（苗族相关支系） | Avoid implying all Miao subdivisions are Hmong |
| Banyarwanda | 巴尼亚卢旺达族群（卢旺达语族群） | A cross-border umbrella label, not citizenship |
| GeoEPR Tigry, Ethiopia | 提格雷人（埃塞俄比亚） | Avoid conflating Ethiopian Tigray with Eritrean Tigre |
| GREG Tonga | 汤加族群（非洲 Tonga） | FIPS ZA / ZI; distinguish Polynesian Tongans |
| GREG Kets | 凯特人 | Remove erroneous Chinese character 偈 |

## References

- GREG provider: https://icr.ethz.ch/data/greg/
- Public GREG attributes: https://services6.arcgis.com/C0HVLQJI37vYnazu/arcgis/rest/services/Global_Ethnic_Groups/FeatureServer/10
- Kui survey: https://sealang.net/sala/archives/pdf8/vanderhaak1987-1988kui.pdf
- Kachin languages: https://iias.asia/the-newsletter/article/linguistic-convergence-within-kachin-languages
- Banyarwanda description: https://www.hrw.org/reports/1996/Zaire.htm
- Ethiopia source atlas: https://growup.ethz.ch/atlas/pdf/Ethiopia.pdf
- Eritrea source atlas: https://growup.ethz.ch/atlas/pdf/Eritrea.pdf

## Remaining limits

GREG uses 1964 classifications and can combine diverse peoples in a single record. Rare historical names currently have conservative phonetic display labels; their exact correspondence to contemporary self-identifications still requires specialist verification. Source labels remain available in popup title attributes. Translation changes do not alter geometry, group IDs, or cross-border color assignments.
