const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const boundaries = require(path.join(root, "miniprogram/data/boundaries.js"));

const provinceByAdcode = {
  110000: "北京", 120000: "天津", 130000: "河北", 140000: "山西", 150000: "内蒙古",
  210000: "辽宁", 220000: "吉林", 230000: "黑龙江", 310000: "上海", 320000: "江苏",
  330000: "浙江", 340000: "安徽", 350000: "福建", 360000: "江西", 370000: "山东",
  410000: "河南", 420000: "湖北", 430000: "湖南", 440000: "广东", 450000: "广西",
  460000: "海南", 500000: "重庆", 510000: "四川", 520000: "贵州", 530000: "云南",
  540000: "西藏", 610000: "陕西", 620000: "甘肃", 630000: "青海", 640000: "宁夏",
  650000: "新疆", 710000: "台湾", 810000: "香港", 820000: "澳门"
};

const provinceIdsByName = {
  北京: "beijing", 天津: "tianjin", 河北: "hebei", 山西: "shanxi", 内蒙古: "inner-mongolia",
  辽宁: "liaoning", 吉林: "jilin", 黑龙江: "heilongjiang", 上海: "shanghai", 江苏: "jiangsu",
  浙江: "zhejiang", 安徽: "anhui", 福建: "fujian", 江西: "jiangxi", 山东: "shandong",
  河南: "henan", 湖北: "hubei", 湖南: "hunan", 广东: "guangdong", 广西: "guangxi",
  海南: "hainan", 重庆: "chongqing", 四川: "sichuan", 贵州: "guizhou", 云南: "yunnan",
  西藏: "tibet", 陕西: "shaanxi", 甘肃: "gansu", 青海: "qinghai", 宁夏: "ningxia",
  新疆: "xinjiang", 台湾: "taiwan", 香港: "hong-kong", 澳门: "macau"
};

const continentIds = {
  亚洲: "cn jp kr kp mn sg my th vn id ph bn kh la mm tl in pk bd lk np bt mv af ir iq sy lb jo il ps sa ae qa kw bh om ye tr ge am az kz uz tm kg tj".split(" "),
  欧洲: "gb ie fr it de es pt nl be lu ch at li mc ad sm va mt gr cy al mk rs me ba hr si hu sk cz pl ua by md ro bg ru ee lv lt fi se no dk is".split(" "),
  北美洲: "us ca mx gt bz hn sv ni cr pa cu jm ht do bs bb ag dm gd kn lc vc tt".split(" "),
  南美洲: "br ar cl pe co uy bo ec ve gy sr py".split(" "),
  非洲: "eg za ma dz tn ly sd ss et er dj so ke ug tz rw bi cd cg ga gq cm cf td ne ng bj tg gh ci lr sl gn gw gm sn mr ml bf ao zm zw mw mz na bw sz ls mg mu sc cv st".split(" "),
  大洋洲: "au nz fj pg sb vu nc pf ws to tv ki nr fm mh pw".split(" ")
};

const continentFor = (id) =>
  Object.entries(continentIds).find(([, ids]) => ids.includes(id))?.[0] || "其他";
const zhNames = new Intl.DisplayNames(["zh-CN"], { type: "region" });
const enNames = new Intl.DisplayNames(["en"], { type: "region" });

const countries = boundaries.countryRegions
  .filter((item) => item.id !== "tw")
  .map((item) => ({
    id: item.id,
    name: /^[a-z]{2}$/.test(item.id) ? zhNames.of(item.id.toUpperCase()) : item.name,
    nameEn: /^[a-z]{2}$/.test(item.id) ? enNames.of(item.id.toUpperCase()) : item.name,
    continent: continentFor(item.id)
  }))
  .sort((left, right) => {
    const order = ["亚洲", "欧洲", "北美洲", "南美洲", "非洲", "大洋洲", "其他"];
    return order.indexOf(left.continent) - order.indexOf(right.continent)
      || left.name.localeCompare(right.name, "zh-Hans-CN");
  });

const mainland = readJson("data/china-prefectures.geojson").features.map((feature) => {
  const props = feature.properties || {};
  const adcode = Number(props.adcode || 0);
  const provinceAdcode = Number(props.acroutes?.[1])
    || Math.floor(adcode / 10000) * 10000
    || adcode;
  const province = provinceByAdcode[provinceAdcode] || provinceByAdcode[adcode] || "未分省";
  return {
    id: `city-${adcode}`,
    name: props.name,
    province,
    provinceId: provinceIdsByName[province] || "",
    longitude: Number(props.center?.[0]),
    latitude: Number(props.center?.[1]),
    source: "china-prefectures.geojson"
  };
});

const direct = readJson("data/china-direct-admin.geojson").features.map((feature) => {
  const props = feature.properties || {};
  const province = props.province || provinceByAdcode[Number(props.parent?.adcode)] || "未分省";
  return {
    id: `city-${props.adcode}`,
    name: props.name,
    province,
    provinceId: provinceIdsByName[province] || "",
    longitude: Number(props.center?.[0]),
    latitude: Number(props.center?.[1]),
    source: "china-direct-admin.geojson"
  };
});

const taiwan = readJson("data/admin1-by-country/tw.geojson").features.map((feature) => {
  const props = feature.properties || {};
  return {
    id: `tw-${String(props.iso_3166_2 || props.adm1_code).toLowerCase()}`,
    name: props.name_zh || props.name_local || props.name,
    province: "台湾",
    provinceId: "taiwan",
    longitude: Number(props.longitude),
    latitude: Number(props.latitude),
    source: "admin1-by-country/tw.geojson"
  };
});

const citySeen = new Set();
const cityRegions = [...mainland, ...direct, ...taiwan]
  .filter((item) => {
    const key = `${item.province}:${item.name}`;
    if (!item.name || citySeen.has(key)) return false;
    citySeen.add(key);
    return true;
  })
  .sort((left, right) =>
    left.province.localeCompare(right.province, "zh-Hans-CN")
    || left.name.localeCompare(right.name, "zh-Hans-CN")
  );

const cityGroups = Object.entries(
  cityRegions.reduce((groups, item) => {
    groups[item.province] ||= [];
    groups[item.province].push(item);
    return groups;
  }, {})
).map(([province, items]) => ({
  province,
  provinceId: provinceIdsByName[province] || "",
  items
}));

const countryGroups = Object.entries(
  countries.reduce((groups, item) => {
    groups[item.continent] ||= [];
    groups[item.continent].push(item);
    return groups;
  }, {})
).map(([continent, items]) => ({ continent, items }));

const output = `module.exports = ${JSON.stringify({
  countries,
  countryGroups,
  cityRegions,
  cityGroups
})};\n`;
fs.writeFileSync(path.join(root, "miniprogram/data/web-catalog.js"), output);
console.log(`Wrote ${countries.length} countries and ${cityRegions.length} China second-level units`);
