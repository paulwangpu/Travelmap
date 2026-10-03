# 全量长城朝代对比

参考 42073 条；详细数据 5975 条 + 历代概览 49 条；全部 6024 条完成比对。

覆盖到参考记录不等于定年成功；未匹配、局部匹配、多朝重叠、原始年代冲突不自动改色。

```json
{
  "referenceRecords": 42073,
  "localDetailed": 5975,
  "historicalOverview": 49,
  "compared": 6024,
  "byDecision": {
    "unmatched": 2345,
    "nearby-review": 1328,
    "name-position-match": 78,
    "line-overlap-match": 151,
    "partial-line-review": 628,
    "identity-match": 1491,
    "identity-position-conflict": 3
  },
  "corrections": 11,
  "identityMultiEra": 19
}
```

## 可自动更正（默认配色或编号明确）

|ID|名称|原显示|建议|依据|
|---|---|---|---|---|
|greatwall-station-1059-5|盘道梁段|ming|northern-wei|95%-length-within-40m-single-era|
|greatwall-station-1559-0|五墩堡至民勤|ming|han|95%-length-within-40m-single-era|
|public-geojson-148-2|Huangcaoliang to Guangwucheng|ming|northern-wei|95%-length-within-40m-single-era|
|public-geojson-151-0|Dayukou to Lingyunkou|ming|northern-wei|95%-length-within-40m-single-era|
|public-geojson-151-1|Dayukou to Lingyunkou|ming|northern-wei|95%-length-within-40m-single-era|
|public-geojson-151-2|Dayukou to Lingyunkou|ming|northern-wei|95%-length-within-40m-single-era|
|gwa-150825353201030014|富海1号烽火台|qin|han|survey-id|
|gwa-152923353201170135|T171烽火台|ming|han|survey-id|
|gwa-152923353201170106|T158烽火台|ming|han|survey-id|
|gwa-640323352101110006|刘八庄明长城2段1号敌台|other|ming|survey-id|
|gwa-640323352101110005|刘八庄明长城1段敌台|other|ming|survey-id|

完整逐条匹配、参考编号和覆盖比例：dynasty-comparison.json。原始参考坐标和252MB数据包只保留在output，不发布。