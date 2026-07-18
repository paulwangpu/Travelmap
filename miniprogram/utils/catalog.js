const provinces = [
  { id: "beijing", name: "北京", latitude: 39.9042, longitude: 116.4074 },
  { id: "tianjin", name: "天津", latitude: 39.0842, longitude: 117.2009 },
  { id: "hebei", name: "河北", latitude: 38.0428, longitude: 114.5149 },
  { id: "shanxi", name: "山西", latitude: 37.8706, longitude: 112.5489 },
  { id: "inner-mongolia", name: "内蒙古", latitude: 40.8424, longitude: 111.7492 },
  { id: "liaoning", name: "辽宁", latitude: 41.8057, longitude: 123.4315 },
  { id: "jilin", name: "吉林", latitude: 43.8171, longitude: 125.3235 },
  { id: "heilongjiang", name: "黑龙江", latitude: 45.8038, longitude: 126.5349 },
  { id: "shanghai", name: "上海", latitude: 31.2304, longitude: 121.4737 },
  { id: "jiangsu", name: "江苏", latitude: 32.0603, longitude: 118.7969 },
  { id: "zhejiang", name: "浙江", latitude: 30.2741, longitude: 120.1551 },
  { id: "anhui", name: "安徽", latitude: 31.8206, longitude: 117.2272 },
  { id: "fujian", name: "福建", latitude: 26.0745, longitude: 119.2965 },
  { id: "jiangxi", name: "江西", latitude: 28.682, longitude: 115.8579 },
  { id: "shandong", name: "山东", latitude: 36.6512, longitude: 117.1201 },
  { id: "henan", name: "河南", latitude: 34.7466, longitude: 113.6254 },
  { id: "hubei", name: "湖北", latitude: 30.5928, longitude: 114.3055 },
  { id: "hunan", name: "湖南", latitude: 28.2282, longitude: 112.9388 },
  { id: "guangdong", name: "广东", latitude: 23.1291, longitude: 113.2644 },
  { id: "guangxi", name: "广西", latitude: 22.817, longitude: 108.3665 },
  { id: "hainan", name: "海南", latitude: 20.044, longitude: 110.1999 },
  { id: "chongqing", name: "重庆", latitude: 29.563, longitude: 106.5516 },
  { id: "sichuan", name: "四川", latitude: 30.5728, longitude: 104.0668 },
  { id: "guizhou", name: "贵州", latitude: 26.647, longitude: 106.6302 },
  { id: "yunnan", name: "云南", latitude: 25.0389, longitude: 102.7183 },
  { id: "tibet", name: "西藏", latitude: 29.652, longitude: 91.1721 },
  { id: "shaanxi", name: "陕西", latitude: 34.3416, longitude: 108.9398 },
  { id: "gansu", name: "甘肃", latitude: 36.0611, longitude: 103.8343 },
  { id: "qinghai", name: "青海", latitude: 36.6171, longitude: 101.7782 },
  { id: "ningxia", name: "宁夏", latitude: 38.4872, longitude: 106.2309 },
  { id: "xinjiang", name: "新疆", latitude: 43.8256, longitude: 87.6168 },
  { id: "hong-kong", name: "香港", latitude: 22.3193, longitude: 114.1694 },
  { id: "macau", name: "澳门", latitude: 22.1987, longitude: 113.5439 },
  { id: "taiwan", name: "台湾", latitude: 25.033, longitude: 121.5654 }
];

const countryNames = {
  cn: "中国", us: "美国", jp: "日本", fr: "法国", it: "意大利", gb: "英国",
  au: "澳大利亚", ca: "加拿大", sg: "新加坡", th: "泰国", my: "马来西亚",
  vn: "越南", id: "印度尼西亚", de: "德国", es: "西班牙", nz: "新西兰",
  mx: "墨西哥", ae: "阿联酋", eg: "埃及", za: "南非", br: "巴西",
  ar: "阿根廷", tr: "土耳其", hk: "香港", mo: "澳门", tw: "台湾",
  kr: "韩国", in: "印度", ru: "俄罗斯", nl: "荷兰", be: "比利时",
  ch: "瑞士", at: "奥地利", se: "瑞典", no: "挪威", dk: "丹麦",
  fi: "芬兰", pl: "波兰", pt: "葡萄牙", gr: "希腊", cz: "捷克",
  hu: "匈牙利", ie: "爱尔兰", is: "冰岛", il: "以色列",
  sa: "沙特阿拉伯", qa: "卡塔尔", ma: "摩洛哥", ke: "肯尼亚",
  pe: "秘鲁", cl: "智利", co: "哥伦比亚"
};

function countryName(id, fallback = "") {
  return countryNames[id] || fallback;
}

module.exports = {
  countryName,
  countryNames,
  provinces
};
