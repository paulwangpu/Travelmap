const visitDepths = [1, 2, 3, 4];
const depthLabels = {
  0: "未去过",
  1: "去过",
};

const depthColors = {
  0: "#f2a58a",
  1: "#d9480f",
};

const storageKey = "travel-map-state-v1";
const idbName = "travel-map-db";
const idbStore = "archives";
const idbStateKey = "state";
const worldCountryTotal = 195;
const boundarySources = {
  country: "data/countries.geojson",
  china: "data/china-provinces.geojson",
  us: "data/us-states.geojson",
  japan: "",
  admin1: "data/admin1.geojson",
  china2: "data/china-prefectures.geojson",
  us2: "data/us-counties.geojson",
  ru2: "data/russia-subregions.geojson",
};
const boundaryFallbackSources = {
  country: "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
  china: "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
  us: "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json",
  japan: "",
  admin1: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson",
  china2: "",
  us2: "",
  ru2: "",
};
const catalogSources = {
  china5a: "https://zh.wikipedia.org/api/rest_v1/page/html/%E5%9B%BD%E5%AE%B65A%E7%BA%A7%E6%97%85%E6%B8%B8%E6%99%AF%E5%8C%BA",
  worldHeritageCountries: "https://en.wikipedia.org/api/rest_v1/page/html/World_Heritage_Sites_by_country",
};

let leafletMap = null;
let leafletLayers = null;
let mapLibreMap = null;
let mapLibreMarkers = [];
let mapLibreLayerHandlersBound = { admin: false, subadmin: false };
let leafletDidInitialFit = false;
let catalogDataRequested = false;
let boundaryData = { country: null, china: null, us: null, japan: null, admin1: null, china2: null, us2: null, ru2: null };
let boundaryLoading = { country: false, china: false, us: false, japan: false, admin1: false, china2: false, us2: false, ru2: false };
let boundaryPromises = {};
let admin1DisplayCache = { source: null, collection: null };
const admin1RegionGroupCountries = new Set(["fr", "it"]);
const subadminConfigs = {
  china2: { countryId: "cn", label: "China prefecture-level units" },
  us2: { countryId: "us", label: "US counties and county equivalents" },
  ru2: { countryId: "ru", label: "Russia comparable travel regions" },
};

const countries = [
  { id: "cn", name: "中国", continent: "亚洲", bbox: [73, 18, 135, 54], x: 74, y: 43, w: 10, h: 10 },
  { id: "jp", name: "日本", continent: "亚洲", bbox: [122, 24, 154, 46], x: 84, y: 40, w: 4, h: 10 },
  { id: "us", name: "美国", continent: "北美洲", bbox: [-125, 24, -66, 49], x: 17, y: 37, w: 16, h: 12 },
  { id: "fr", name: "法国", continent: "欧洲", bbox: [-5, 41, 10, 51], x: 49, y: 36, w: 5, h: 5 },
  { id: "it", name: "意大利", continent: "欧洲", bbox: [6, 36, 19, 47], x: 54, y: 41, w: 4, h: 7 },
  { id: "gb", name: "英国", continent: "欧洲", bbox: [-8, 50, 2, 59], x: 48, y: 30, w: 4, h: 6 },
  { id: "au", name: "澳大利亚", continent: "大洋洲", bbox: [113, -44, 154, -10], x: 78, y: 72, w: 14, h: 11 },
  { id: "ca", name: "加拿大", continent: "北美洲", bbox: [-141, 42, -52, 84], x: 11, y: 18, w: 24, h: 14 },
  { id: "sg", name: "新加坡", continent: "亚洲", bbox: [103.5, 1, 104.2, 1.6], x: 75, y: 57, w: 2, h: 2 },
  { id: "th", name: "泰国", continent: "亚洲", bbox: [97, 5, 106, 21], x: 72, y: 53, w: 5, h: 7 },
  { id: "my", name: "Malaysia", continent: "Asia", bbox: [99, 0, 120, 8], x: 74, y: 58, w: 6, h: 4 },
  { id: "vn", name: "Vietnam", continent: "Asia", bbox: [102, 8, 110, 24], x: 75, y: 52, w: 4, h: 8 },
  { id: "id", name: "Indonesia", continent: "Asia", bbox: [95, -11, 141, 6], x: 75, y: 63, w: 14, h: 7 },
  { id: "de", name: "德国", continent: "欧洲", bbox: [5, 47, 16, 55], x: 53, y: 33, w: 5, h: 5 },
  { id: "es", name: "西班牙", continent: "欧洲", bbox: [-10, 35, 4, 44], x: 47, y: 42, w: 6, h: 5 },
  { id: "nz", name: "新西兰", continent: "大洋洲", bbox: [166, -48, 179, -34], x: 91, y: 82, w: 5, h: 7 },
  { id: "mx", name: "墨西哥", continent: "北美洲", bbox: [-118, 14, -86, 33], x: 22, y: 50, w: 9, h: 8 },
  { id: "ae", name: "阿联酋", continent: "亚洲", bbox: [51, 22, 57, 27], x: 65, y: 50, w: 3, h: 3 },
  { id: "eg", name: "埃及", continent: "非洲", bbox: [25, 22, 36, 32], x: 57, y: 50, w: 5, h: 5 },
  { id: "za", name: "南非", continent: "非洲", bbox: [16, -35, 33, -22], x: 54, y: 75, w: 8, h: 7 },
  { id: "br", name: "巴西", continent: "南美洲", bbox: [-74, -34, -34, 6], x: 35, y: 66, w: 14, h: 16 },
  { id: "ar", name: "阿根廷", continent: "南美洲", bbox: [-74, -56, -53, -22], x: 34, y: 78, w: 8, h: 15 },
  { id: "tr", name: "土耳其", continent: "亚洲/欧洲", bbox: [26, 36, 45, 42], x: 58, y: 44, w: 8, h: 4 },
];

const regionSets = {
  china: {
    label: "中国省级",
    total: 34,
    units: [
      { name: "北京", bbox: [115.4, 39.4, 117.6, 41.1] },
      { name: "上海", bbox: [120.8, 30.6, 122.1, 31.9] },
      { name: "天津", bbox: [116.7, 38.6, 118.1, 40.3] },
      { name: "重庆", bbox: [105.3, 28.1, 110.2, 32.2] },
      { name: "河北", bbox: [113.4, 36.0, 119.9, 42.6] },
      { name: "山西", bbox: [110.2, 34.6, 114.6, 40.7] },
      { name: "内蒙古", bbox: [97.1, 37.4, 126.1, 53.3] },
      { name: "辽宁", bbox: [118.8, 38.7, 125.8, 43.5] },
      { name: "吉林", bbox: [121.6, 40.9, 131.3, 46.3] },
      { name: "黑龙江", bbox: [121.2, 43.4, 135.1, 53.6] },
      { name: "山东", bbox: [114.8, 34.4, 122.7, 38.4] },
      { name: "河南", bbox: [110.3, 31.4, 116.7, 36.4] },
      { name: "湖北", bbox: [108.3, 29.0, 116.1, 33.3] },
      { name: "湖南", bbox: [108.8, 24.6, 114.3, 30.2] },
      { name: "广东", bbox: [109.6, 20.2, 117.3, 25.5] },
      { name: "广西", bbox: [104.4, 20.9, 112.1, 26.4] },
      { name: "海南", bbox: [108.6, 18.0, 111.2, 20.2] },
      { name: "陕西", bbox: [105.5, 31.7, 111.3, 39.6] },
      { name: "甘肃", bbox: [92.3, 32.6, 108.7, 42.8] },
      { name: "青海", bbox: [89.4, 31.6, 103.1, 39.2] },
      { name: "宁夏", bbox: [104.3, 35.2, 107.7, 39.4] },
      { name: "新疆", bbox: [73, 34, 96.5, 49.2] },
      { name: "云南", bbox: [97.5, 21, 106.2, 29.3] },
      { name: "贵州", bbox: [103.6, 24.6, 109.6, 29.2] },
      { name: "四川", bbox: [97, 26, 108.6, 34.5] },
      { name: "安徽", bbox: [114.9, 29.4, 119.7, 34.6] },
      { name: "福建", bbox: [115.8, 23.5, 120.7, 28.4] },
      { name: "江西", bbox: [113.6, 24.5, 118.5, 30.1] },
      { name: "浙江", bbox: [118, 27, 123, 31.3] },
      { name: "江苏", bbox: [116.3, 30.7, 121.9, 35.2] },
      { name: "西藏", bbox: [78, 26.8, 99.2, 36.6] },
      { name: "台湾", bbox: [119.3, 21.8, 122.1, 25.4] },
      { name: "香港", bbox: [113.8, 22.1, 114.4, 22.6] },
      { name: "澳门", bbox: [113.5, 22.1, 113.7, 22.3] },
    ],
  },
  us: {
    label: "美国州",
    total: 50,
    units: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
      "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
      "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
      "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
      "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
    ].map((name) => ({ name })),
  },
  japan: {
    label: "日本都道府县",
    total: 47,
    units: [
      "北海道", "青森县", "岩手县", "宫城县", "秋田县", "山形县", "福岛县", "茨城县", "栃木县", "群马县",
      "埼玉县", "千叶县", "东京都", "神奈川县", "新潟县", "富山县", "石川县", "福井县", "山梨县", "长野县",
      "岐阜县", "静冈县", "爱知县", "三重县", "滋贺县", "京都府", "大阪府", "兵库县", "奈良县", "和歌山县",
      "鸟取县", "岛根县", "冈山县", "广岛县", "山口县", "德岛县", "香川县", "爱媛县", "高知县", "福冈县",
      "佐贺县", "长崎县", "熊本县", "大分县", "宫崎县", "鹿儿岛县", "冲绳县",
    ],
  },
};

regionSets.japan.units = regionSets.japan.units.map((name) => ({ name }));

const usStateBboxes = {
  California: [-124.6, 32.4, -114, 42.1],
  "New York": [-80, 40.4, -71.8, 45.1],
  Texas: [-106.7, 25.8, -93.5, 36.6],
  Colorado: [-109.1, 36.9, -102, 41.1],
  Utah: [-114.1, 36.9, -109, 42.1],
  Florida: [-87.8, 24.4, -80, 31.1],
};
regionSets.us.units.forEach((unit) => {
  if (usStateBboxes[unit.name]) unit.bbox = usStateBboxes[unit.name];
});

const japanPrefBboxes = {
  东京都: [138.8, 35.4, 140, 35.9],
  京都府: [134.8, 34.7, 136.1, 35.8],
  岐阜县: [136.2, 35.1, 137.7, 36.6],
  大阪府: [135.1, 34.2, 135.8, 35],
  北海道: [139.3, 41.3, 145.9, 45.7],
};
regionSets.japan.units.forEach((unit) => {
  if (japanPrefBboxes[unit.name]) unit.bbox = japanPrefBboxes[unit.name];
});

let places = [
  { id: "forbidden-city", name: "故宫", country: "cn", unit: "北京", city: "北京市", type: "世界遗产 / 5A / 博物馆", lat: 39.9163, lng: 116.3972, tags: ["历史", "建筑"], checklist: ["世界遗产", "中国 5A 景区"] },
  { id: "shenzhen", name: "深圳", country: "cn", unit: "广东", city: "深圳市", type: "城市", lat: 22.5431, lng: 114.0579, tags: ["城市"], checklist: [] },
  { id: "xian", name: "西安", country: "cn", unit: "陕西", city: "西安市", type: "古都", lat: 34.3416, lng: 108.9398, tags: ["古都"], checklist: ["中国四大古都"] },
  { id: "tokyo", name: "东京", country: "jp", unit: "东京都", city: "东京", type: "城市", lat: 35.6762, lng: 139.6503, tags: ["城市", "铁路"], checklist: ["首都城市"] },
  { id: "kyoto", name: "京都", country: "jp", unit: "京都府", city: "京都", type: "世界遗产城市", lat: 35.0116, lng: 135.7681, tags: ["文化"], checklist: ["世界遗产"] },
  { id: "yosemite", name: "Yosemite", country: "us", unit: "California", city: "Yosemite", type: "国家公园 / 世界遗产", lat: 37.8651, lng: -119.5383, tags: ["国家公园"], checklist: ["世界遗产", "美国国家公园"] },
  { id: "nyc", name: "纽约", country: "us", unit: "New York", city: "New York City", type: "城市", lat: 40.7128, lng: -74.006, tags: ["城市"], checklist: ["著名城市"] },
  { id: "washington-dc", name: "Washington, D.C.", country: "us", unit: "District of Columbia", city: "Washington, D.C.", type: "Capital city", lat: 38.9072, lng: -77.0369, tags: ["city", "capital"], checklist: ["首都城市"] },
  { id: "paris", name: "巴黎", country: "fr", unit: "Ile-de-France", city: "Paris", type: "首都城市", lat: 48.8566, lng: 2.3522, tags: ["艺术"], checklist: ["首都城市", "世界遗产"] },
  { id: "rome", name: "罗马", country: "it", unit: "Lazio", city: "Rome", type: "首都城市 / 世界遗产", lat: 41.9028, lng: 12.4964, tags: ["古城"], checklist: ["首都城市", "世界遗产"] },
  { id: "singapore", name: "新加坡", country: "sg", unit: "Singapore", city: "Singapore", type: "国家 / 城市", lat: 1.3521, lng: 103.8198, tags: ["城市"], checklist: ["首都城市"] },
];

const checklistCatalog = {
  china5a: {
    label: "中国 5A 景区",
    byRegion: {
      北京: ["故宫", "八达岭-慕田峪长城", "颐和园", "天坛", "恭王府", "圆明园", "明十三陵", "奥林匹克公园"],
      陕西: ["秦始皇帝陵博物院", "华山", "大雁塔-大唐芙蓉园", "黄帝陵", "法门寺", "金丝峡"],
      山东: ["泰山", "曲阜三孔", "崂山", "蓬莱阁", "刘公岛", "台儿庄古城"],
      安徽: ["黄山", "九华山", "天柱山", "皖南古村落", "三河古镇"],
      浙江: ["西湖", "普陀山", "雁荡山", "乌镇", "千岛湖", "西溪湿地", "南浔古镇"],
      江苏: ["苏州园林", "周庄古镇", "同里古镇", "中山陵", "瘦西湖", "鼋头渚", "夫子庙-秦淮风光带"],
      福建: ["武夷山", "鼓浪屿", "福建土楼", "太姥山", "清源山"],
      江西: ["庐山", "井冈山", "三清山", "龙虎山", "滕王阁"],
      湖南: ["张家界武陵源", "岳阳楼-君山岛", "韶山", "衡山", "凤凰古城", "崀山"],
      广东: ["长隆旅游度假区", "丹霞山", "罗浮山", "西樵山", "雁南飞茶田"],
      广西: ["桂林漓江", "青秀山", "德天跨国瀑布", "涠洲岛", "两江四湖-象山"],
      海南: ["三亚南山", "蜈支洲岛", "分界洲岛", "呀诺达雨林", "大小洞天"],
      四川: ["九寨沟", "黄龙", "峨眉山-乐山大佛", "青城山-都江堰", "阆中古城", "稻城亚丁", "剑门蜀道"],
      重庆: ["大足石刻", "武隆喀斯特", "巫山小三峡", "酉阳桃花源", "金佛山"],
      贵州: ["黄果树瀑布", "梵净山", "荔波樟江", "百里杜鹃", "镇远古城"],
      云南: ["丽江古城", "石林", "玉龙雪山", "大理崇圣寺三塔", "普达措", "西双版纳热带植物园"],
      西藏: ["布达拉宫", "大昭寺", "巴松措", "珠穆朗玛峰"],
      新疆: ["天山天池", "喀纳斯", "葡萄沟", "那拉提", "可可托海", "赛里木湖", "喀什古城"],
      甘肃: ["莫高窟", "嘉峪关", "崆峒山", "麦积山", "鸣沙山月牙泉", "张掖七彩丹霞"],
      青海: ["青海湖", "塔尔寺", "茶卡盐湖", "互助土族故土园"],
      宁夏: ["沙坡头", "镇北堡西部影城", "水洞沟", "沙湖"],
      山西: ["五台山", "云冈石窟", "平遥古城", "乔家大院", "雁门关", "壶口瀑布"],
      河南: ["龙门石窟", "嵩山少林", "清明上河园", "云台山", "老君山", "殷墟"],
      湖北: ["黄鹤楼", "神农架", "三峡大坝", "武当山", "恩施大峡谷", "东湖"],
      吉林: ["长白山", "伪满皇宫", "净月潭", "高句丽文物古迹"],
      黑龙江: ["哈尔滨太阳岛", "五大连池", "镜泊湖", "漠河北极村", "虎头旅游景区"],
      辽宁: ["沈阳故宫", "本溪水洞", "金石滩", "千山", "盘锦红海滩"],
      河北: ["承德避暑山庄", "山海关", "白洋淀", "西柏坡", "野三坡"],
      内蒙古: ["呼伦贝尔草原", "响沙湾", "成吉思汗陵", "阿尔山", "额济纳胡杨林"],
      上海: ["东方明珠", "上海科技馆", "上海野生动物园", "上海迪士尼"],
      天津: ["古文化街", "盘山", "天津之眼", "瓷房子"],
      港澳台: ["台北故宫", "日月潭", "阿里山", "太鲁阁", "香港迪士尼", "香港海洋公园", "澳门历史城区", "澳门威尼斯人"],
    },
    items: [
      "故宫", "八达岭-慕田峪长城", "颐和园", "天坛", "恭王府", "圆明园", "明十三陵", "奥林匹克公园",
      "秦始皇帝陵博物院", "华山", "大雁塔-大唐芙蓉园", "黄帝陵", "法门寺", "金丝峡",
      "泰山", "曲阜三孔", "崂山", "蓬莱阁", "刘公岛", "台儿庄古城",
      "黄山", "九华山", "天柱山", "皖南古村落", "三河古镇",
      "西湖", "普陀山", "雁荡山", "乌镇", "千岛湖", "西溪湿地", "南浔古镇",
      "苏州园林", "周庄古镇", "同里古镇", "中山陵", "瘦西湖", "鼋头渚", "夫子庙-秦淮风光带",
      "武夷山", "鼓浪屿", "福建土楼", "太姥山", "清源山",
      "庐山", "井冈山", "三清山", "龙虎山", "滕王阁",
      "张家界武陵源", "岳阳楼-君山岛", "韶山", "衡山", "凤凰古城", "崀山",
      "长隆旅游度假区", "丹霞山", "罗浮山", "西樵山", "雁南飞茶田",
      "桂林漓江", "青秀山", "德天跨国瀑布", "涠洲岛", "两江四湖-象山",
      "三亚南山", "蜈支洲岛", "分界洲岛", "呀诺达雨林", "大小洞天",
      "九寨沟", "黄龙", "峨眉山-乐山大佛", "青城山-都江堰", "阆中古城", "稻城亚丁", "剑门蜀道",
      "重庆大足石刻", "武隆喀斯特", "巫山小三峡", "酉阳桃花源", "金佛山",
      "黄果树瀑布", "梵净山", "荔波樟江", "百里杜鹃", "镇远古城",
      "丽江古城", "石林", "玉龙雪山", "大理崇圣寺三塔", "普达措", "西双版纳热带植物园",
      "布达拉宫", "大昭寺", "巴松措", "珠穆朗玛峰",
      "天山天池", "喀纳斯", "葡萄沟", "那拉提", "可可托海", "赛里木湖", "喀什古城",
      "莫高窟", "嘉峪关", "崆峒山", "麦积山", "鸣沙山月牙泉", "张掖七彩丹霞",
      "青海湖", "塔尔寺", "茶卡盐湖", "互助土族故土园",
      "沙坡头", "镇北堡西部影城", "水洞沟", "沙湖",
      "五台山", "云冈石窟", "平遥古城", "乔家大院", "雁门关", "壶口瀑布",
      "龙门石窟", "嵩山少林", "清明上河园", "云台山", "老君山", "殷墟",
      "黄鹤楼", "神农架", "三峡大坝", "武当山", "恩施大峡谷", "东湖",
      "长白山", "伪满皇宫", "净月潭", "高句丽文物古迹",
      "哈尔滨太阳岛", "五大连池", "镜泊湖", "漠河北极村", "虎头旅游景区",
      "沈阳故宫", "本溪水洞", "金石滩", "千山", "盘锦红海滩",
      "承德避暑山庄", "山海关", "白洋淀", "西柏坡", "野三坡",
      "呼伦贝尔草原", "响沙湾", "成吉思汗陵", "阿尔山", "额济纳胡杨林",
      "上海东方明珠", "上海科技馆", "上海野生动物园", "上海迪士尼",
      "天津古文化街", "盘山", "天津之眼", "瓷房子",
      "台北故宫", "日月潭", "阿里山", "太鲁阁",
      "香港迪士尼", "香港海洋公园", "澳门历史城区", "澳门威尼斯人",
    ],
  },
  worldHeritage: {
    label: "世界遗产",
    byCountry: {
      中国: ["长城", "故宫", "秦始皇陵及兵马俑", "莫高窟", "周口店北京人遗址", "泰山", "黄山", "九寨沟", "黄龙", "武陵源", "承德避暑山庄", "曲阜三孔", "武当山古建筑群", "布达拉宫历史建筑群", "庐山国家公园", "峨眉山-乐山大佛", "丽江古城", "平遥古城", "苏州古典园林", "颐和园", "天坛", "大足石刻", "武夷山", "青城山-都江堰", "皖南古村落", "龙门石窟", "明清皇家陵寝", "云冈石窟", "云南三江并流", "高句丽王城王陵及贵族墓葬", "澳门历史城区", "四川大熊猫栖息地", "殷墟", "中国南方喀斯特", "开平碉楼与村落", "福建土楼", "三清山", "五台山", "登封天地之中古建筑群", "杭州西湖", "元上都遗址", "澄江化石地", "新疆天山", "红河哈尼梯田", "大运河", "丝绸之路", "土司遗址", "湖北神农架", "青海可可西里", "鼓浪屿", "梵净山", "良渚古城遗址", "黄渤海候鸟栖息地", "泉州", "普洱景迈山古茶林"],
      美国: ["梅萨维德国家公园", "黄石国家公园", "大沼泽地国家公园", "大峡谷国家公园", "独立厅", "克卢恩/兰格尔-圣伊莱亚斯/冰川湾/塔琴希尼-阿尔塞克", "红木国家和州立公园", "猛犸洞国家公园", "奥林匹克国家公园", "卡霍基亚土丘", "大烟山国家公园", "自由女神像", "优胜美地国家公园", "查科文化", "夏洛茨维尔蒙蒂塞洛和弗吉尼亚大学", "夏威夷火山国家公园", "陶斯印第安村", "卡尔斯巴德洞窟国家公园", "沃特顿-冰川国际和平公园", "帕帕哈瑙莫夸基亚", "波弗蒂角", "圣安东尼奥传教区", "弗兰克·劳埃德·赖特建筑作品", "希望之井礼仪土方"],
      日本: ["法隆寺地区佛教古迹", "姬路城", "屋久岛", "白神山地", "古京都历史遗迹", "白川乡与五箇山合掌造村落", "广岛和平纪念碑", "严岛神社", "古奈良历史遗迹", "日光神社与寺院", "琉球王国城堡及相关遗产群", "纪伊山地圣地及参拜道", "知床", "石见银山", "平泉", "小笠原群岛", "富士山", "富冈制丝厂", "明治日本工业革命遗产", "国立西洋美术馆", "宗像和冲之岛", "长崎与天草地方潜伏基督徒相关遗产", "百舌鸟古市古坟群", "奄美大岛、德之岛、冲绳岛北部及西表岛", "北海道北东北绳文遗址群", "佐渡岛金山"],
      法国: ["巴黎塞纳河岸", "凡尔赛宫", "圣米歇尔山及其海湾", "沙特尔大教堂", "枫丹白露宫", "卢瓦尔河谷", "阿维尼翁历史中心", "卡尔卡松历史城塞"],
      意大利: ["罗马历史中心", "佛罗伦萨历史中心", "威尼斯及其泻湖", "比萨主教座堂广场", "庞贝古城", "那不勒斯历史中心", "阿马尔菲海岸", "维罗纳城", "多洛米蒂山"],
    },
  },
  fiveMountains: {
    label: "五岳",
    items: ["泰山", "华山", "衡山", "恒山", "嵩山"],
  },
  threeMountains: {
    label: "三山",
    items: ["黄山", "庐山", "雁荡山"],
  },
  buddhistMountains: {
    label: "四大佛教名山",
    items: ["五台山", "峨眉山", "普陀山", "九华山"],
  },
  grottoes: {
    label: "四大石窟",
    items: ["莫高窟", "云冈石窟", "龙门石窟", "麦积山石窟"],
  },
  usNationalParks: {
    label: "美国国家公园",
    items: ["Acadia", "American Samoa", "Arches", "Badlands", "Big Bend", "Biscayne", "Black Canyon of the Gunnison", "Bryce Canyon", "Canyonlands", "Capitol Reef", "Carlsbad Caverns", "Channel Islands", "Congaree", "Crater Lake", "Cuyahoga Valley", "Death Valley", "Denali", "Dry Tortugas", "Everglades", "Gates of the Arctic", "Gateway Arch", "Glacier", "Glacier Bay", "Grand Canyon", "Grand Teton", "Great Basin", "Great Sand Dunes", "Great Smoky Mountains", "Guadalupe Mountains", "Haleakala", "Hawaii Volcanoes", "Hot Springs", "Indiana Dunes", "Isle Royale", "Joshua Tree", "Katmai", "Kenai Fjords", "Kings Canyon", "Kobuk Valley", "Lake Clark", "Lassen Volcanic", "Mammoth Cave", "Mesa Verde", "Mount Rainier", "New River Gorge", "North Cascades", "Olympic", "Petrified Forest", "Pinnacles", "Redwood", "Rocky Mountain", "Saguaro", "Sequoia", "Shenandoah", "Theodore Roosevelt", "Virgin Islands", "Voyageurs", "White Sands", "Wind Cave", "Wrangell-St. Elias", "Yellowstone", "Yosemite", "Zion"],
  },
};

const checklistPlaceCoordinates = {
  故宫: [39.9163, 116.3972, "北京"], "八达岭-慕田峪长城": [40.4319, 116.5704, "北京"], 颐和园: [39.9999, 116.2755, "北京"], 天坛: [39.8822, 116.4066, "北京"], 恭王府: [39.9366, 116.3868, "北京"], 圆明园: [40.0086, 116.2983, "北京"], 明十三陵: [40.2552, 116.2273, "北京"],
  "秦始皇帝陵博物院": [34.3844, 109.2783, "陕西"], 华山: [34.4833, 110.0833, "陕西"], "大雁塔-大唐芙蓉园": [34.218, 108.964, "陕西"], 黄帝陵: [35.5856, 109.2608, "陕西"], 法门寺: [34.4377, 107.8971, "陕西"],
  泰山: [36.255, 117.106, "山东"], 曲阜三孔: [35.5966, 116.9865, "山东"], 崂山: [36.19, 120.59, "山东"], 蓬莱阁: [37.8267, 120.7586, "山东"], 刘公岛: [37.501, 122.188, "山东"],
  黄山: [30.1302, 118.1689, "安徽"], 九华山: [30.478, 117.807, "安徽"], 天柱山: [30.733, 116.45, "安徽"], 皖南古村落: [29.904, 117.987, "安徽"],
  西湖: [30.2431, 120.1489, "浙江"], 普陀山: [30.0007, 122.3864, "浙江"], 雁荡山: [28.37, 121.06, "浙江"], 乌镇: [30.746, 120.49, "浙江"], 千岛湖: [29.608, 119.044, "浙江"],
  苏州园林: [31.324, 120.625, "江苏"], 周庄古镇: [31.1179, 120.8442, "江苏"], 同里古镇: [31.159, 120.717, "江苏"], 中山陵: [32.0647, 118.8486, "江苏"], 瘦西湖: [32.414, 119.437, "江苏"],
  武夷山: [27.7566, 117.68, "福建"], 鼓浪屿: [24.447, 118.063, "福建"], 福建土楼: [24.657, 117.003, "福建"], 太姥山: [27.105, 120.207, "福建"],
  庐山: [29.55, 115.994, "江西"], 井冈山: [26.571, 114.166, "江西"], 三清山: [28.914, 118.064, "江西"], 龙虎山: [28.1205, 116.998, "江西"],
  张家界武陵源: [29.345, 110.55, "湖南"], 武陵源: [29.345, 110.55, "湖南"], 岳阳楼: [29.357, 113.094, "湖南"], 韶山: [27.915, 112.527, "湖南"], 衡山: [27.254, 112.655, "湖南"], 凤凰古城: [27.948, 109.599, "湖南"],
  长隆旅游度假区: [23.005, 113.324, "广东"], 丹霞山: [25.04, 113.75, "广东"], 罗浮山: [23.279, 114.047, "广东"], 西樵山: [22.933, 112.985, "广东"],
  桂林漓江: [25.235, 110.427, "广西"], 青秀山: [22.791, 108.396, "广西"], 德天跨国瀑布: [22.853, 106.722, "广西"], 涠洲岛: [21.033, 109.106, "广西"],
  三亚南山: [18.299, 109.207, "海南"], 蜈支洲岛: [18.311, 109.764, "海南"], 分界洲岛: [18.575, 110.194, "海南"], 呀诺达雨林: [18.459, 109.682, "海南"],
  九寨沟: [33.257, 103.918, "四川"], 黄龙: [32.745, 103.833, "四川"], "峨眉山-乐山大佛": [29.55, 103.77, "四川"], 峨眉山: [29.52, 103.336, "四川"], 青城山: [30.907, 103.568, "四川"], "青城山-都江堰": [30.994, 103.613, "四川"], 阆中古城: [31.575, 105.974, "四川"], 稻城亚丁: [28.455, 100.347, "四川"],
  大足石刻: [29.706, 105.802, "重庆"], 武隆喀斯特: [29.421, 107.756, "重庆"], 巫山小三峡: [31.074, 109.878, "重庆"], 金佛山: [29.052, 107.187, "重庆"],
  黄果树瀑布: [25.988, 105.669, "贵州"], 梵净山: [27.895, 108.695, "贵州"], 荔波樟江: [25.414, 107.887, "贵州"], 百里杜鹃: [27.175, 105.86, "贵州"],
  丽江古城: [26.872, 100.234, "云南"], 石林: [24.817, 103.324, "云南"], 玉龙雪山: [27.101, 100.177, "云南"], 普达措: [27.823, 99.993, "云南"],
  布达拉宫: [29.6578, 91.1169, "西藏"], 大昭寺: [29.653, 91.132, "西藏"], 巴松措: [30.0, 93.95, "西藏"], 珠穆朗玛峰: [27.9881, 86.925, "西藏"],
  天山天池: [43.883, 88.133, "新疆"], 喀纳斯: [48.82, 87.04, "新疆"], 葡萄沟: [42.951, 89.203, "新疆"], 那拉提: [43.25, 84.0, "新疆"], 可可托海: [47.21, 89.86, "新疆"], 赛里木湖: [44.61, 81.17, "新疆"], 喀什古城: [39.47, 75.99, "新疆"],
  莫高窟: [40.037, 94.804, "甘肃"], 嘉峪关: [39.802, 98.216, "甘肃"], 崆峒山: [35.543, 106.508, "甘肃"], 麦积山: [34.352, 106.006, "甘肃"], 鸣沙山月牙泉: [40.09, 94.672, "甘肃"], 张掖七彩丹霞: [38.97, 100.065, "甘肃"],
  青海湖: [36.895, 100.175, "青海"], 塔尔寺: [36.489, 101.565, "青海"], 茶卡盐湖: [36.791, 99.078, "青海"],
  沙坡头: [37.472, 105.002, "宁夏"], 镇北堡西部影城: [38.613, 106.065, "宁夏"], 沙湖: [38.82, 106.39, "宁夏"],
  五台山: [39.009, 113.594, "山西"], 云冈石窟: [40.109, 113.122, "山西"], 平遥古城: [37.201, 112.175, "山西"], 乔家大院: [37.407, 112.433, "山西"], 雁门关: [39.199, 112.89, "山西"],
  龙门石窟: [34.558, 112.479, "河南"], 嵩山少林: [34.507, 112.935, "河南"], 嵩山: [34.507, 112.935, "河南"], 清明上河园: [34.801, 114.346, "河南"], 云台山: [35.43, 113.36, "河南"], 老君山: [33.754, 111.64, "河南"], 殷墟: [36.127, 114.313, "河南"],
  黄鹤楼: [30.545, 114.297, "湖北"], 神农架: [31.744, 110.675, "湖北"], 三峡大坝: [30.823, 111.003, "湖北"], 武当山: [32.397, 111.004, "湖北"], 恩施大峡谷: [30.458, 109.204, "湖北"],
  长白山: [42.006, 128.055, "吉林"], 伪满皇宫: [43.903, 125.35, "吉林"], 五大连池: [48.667, 126.167, "黑龙江"], 镜泊湖: [44.0, 128.98, "黑龙江"], 漠河北极村: [53.48, 122.36, "黑龙江"],
  沈阳故宫: [41.795, 123.455, "辽宁"], 本溪水洞: [41.302, 124.08, "辽宁"], 金石滩: [39.09, 121.99, "辽宁"], 千山: [41.02, 123.13, "辽宁"],
  承德避暑山庄: [40.986, 117.939, "河北"], 山海关: [40.006, 119.754, "河北"], 白洋淀: [38.946, 115.976, "河北"], 西柏坡: [38.343, 113.944, "河北"], 野三坡: [39.68, 115.43, "河北"],
  呼伦贝尔草原: [49.211, 119.765, "内蒙古"], 响沙湾: [40.245, 109.96, "内蒙古"], 成吉思汗陵: [39.37, 109.78, "内蒙古"], 阿尔山: [47.177, 119.944, "内蒙古"],
  东方明珠: [31.2397, 121.4998, "上海"], 上海科技馆: [31.218, 121.544, "上海"], 上海野生动物园: [31.057, 121.728, "上海"], 上海迪士尼: [31.144, 121.657, "上海"],
  古文化街: [39.143, 117.19, "天津"], 盘山: [40.085, 117.271, "天津"],
  Yellowstone: [44.6, -110.5, "Wyoming"], Yosemite: [37.8651, -119.5383, "California"], "Grand Canyon": [36.1069, -112.1129, "Arizona"], "Zion": [37.2982, -113.0263, "Utah"], "Rocky Mountain": [40.3428, -105.6836, "Colorado"], "Acadia": [44.35, -68.21, "Maine"], "Arches": [38.7331, -109.5925, "Utah"], "Bryce Canyon": [37.593, -112.1871, "Utah"], "Death Valley": [36.5054, -117.0794, "California"], "Everglades": [25.2866, -80.8987, "Florida"], "Glacier": [48.7596, -113.787, "Montana"], "Grand Teton": [43.7904, -110.6818, "Wyoming"], "Great Smoky Mountains": [35.6118, -83.4895, "Tennessee"], "Joshua Tree": [33.8734, -115.901, "California"], "Olympic": [47.8021, -123.6044, "Washington"], "Sequoia": [36.4864, -118.5658, "California"], "Mount Rainier": [46.8797, -121.7269, "Washington"], "Hawaii Volcanoes": [19.4194, -155.2885, "Hawaii"], "Denali": [63.1148, -151.1926, "Alaska"], "Mesa Verde": [37.2309, -108.4618, "Colorado"], "Carlsbad Caverns": [32.1479, -104.5567, "New Mexico"], "Saguaro": [32.2967, -111.1666, "Arizona"], "Canyonlands": [38.3269, -109.8783, "Utah"], "Capitol Reef": [38.0877, -111.1355, "Utah"], "Crater Lake": [42.9446, -122.109, "Oregon"], "Redwood": [41.2132, -124.0046, "California"],
};

let state = {
  visits: [
    { placeId: "forbidden-city", tripId: "seed", date: "2018-05-01", depth: 4 },
    { placeId: "shenzhen", tripId: "seed", date: "2024-03-12", depth: 3 },
    { placeId: "xian", tripId: "seed", date: "2025-10-03", depth: 2 },
    { placeId: "tokyo", tripId: "seed", date: "", depth: 4 },
    { placeId: "kyoto", tripId: "seed", date: "", depth: 3 },
    { placeId: "yosemite", tripId: "seed", date: "", depth: 4 },
    { placeId: "nyc", tripId: "seed", date: "", depth: 3 },
    { placeId: "paris", tripId: "seed", date: "", depth: 2 },
    { placeId: "singapore", tripId: "seed", date: "", depth: 3 },
  ],
  trips: [
    { id: "seed", name: "示例足迹", start: "", end: "", transport: "多种", type: "示例", route: ["北京", "东京", "Yosemite", "巴黎"], rating: 5 },
  ],
  importedFiles: [],
  checklistMarks: [],
  openChecklistGroups: [],
  worldHeritageStats: [],
  selectedRegionView: "china",
  boundaryLevel: "country",
  focusPlaceId: "forbidden-city",
};

const $ = (selector) => document.querySelector(selector);

function inBbox(lng, lat, bbox) {
  if (!Array.isArray(bbox)) return false;
  return Number.isFinite(lng) && Number.isFinite(lat) && lng >= bbox[0] && lat >= bbox[1] && lng <= bbox[2] && lat <= bbox[3];
}

function loadBoundaryData(key) {
  if (boundaryData[key] || !boundarySources[key]) return Promise.resolve(boundaryData[key] || null);
  if (boundaryPromises[key]) return boundaryPromises[key];
  boundaryLoading[key] = true;
  boundaryPromises[key] = fetchBoundaryJson(boundarySources[key], boundaryFallbackSources[key])
    .then((data) => {
      boundaryData[key] = normalizeFeatureCollection(data);
      if (key === "admin1") admin1DisplayCache = { source: null, collection: null };
      refreshInferredLocations();
      saveState();
      return boundaryData[key];
    })
    .catch((error) => {
      console.warn(`${key} 边界数据加载失败`, error);
      if (key === "country" || key === "china") showToast(`${boundaryLabel(key)}边界暂时加载失败，已使用本地兜底`);
    })
    .finally(() => {
      boundaryLoading[key] = false;
      boundaryPromises[key] = null;
      renderAll();
    });
  return boundaryPromises[key];
}

function fetchBoundaryJson(primaryUrl, fallbackUrl = "") {
  return fetchJson(primaryUrl)
    .catch((primaryError) => {
      if (!fallbackUrl || fallbackUrl === primaryUrl) throw primaryError;
      console.warn(`本地边界读取失败，改用在线源：${primaryUrl}`, primaryError);
      return fetchJson(fallbackUrl);
    })
    .then((data) => data.gjDownloadURL ? fetchJson(data.gjDownloadURL) : data);
}

function fetchJson(url) {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error(`${response.status}`);
    return response.json();
  });
}

function preloadBoundaryData(force = false, keys = ["country", "china", "us", "japan", "admin1"]) {
  return Promise.all(keys.map((key) => {
    if (force) boundaryData[key] = null;
    return loadBoundaryData(key);
  }));
}

function boundaryLabel(key) {
  return { country: "国家", china: "中国省级", us: "美国州", japan: "日本都道府县" }[key] || key;
}

function normalizeFeatureCollection(data) {
  if (data?.type === "FeatureCollection") return data;
  if (data?.type === "Feature") return { type: "FeatureCollection", features: [data] };
  return { type: "FeatureCollection", features: [] };
}

function countryIdFromFeature(feature) {
  const props = feature.properties || {};
  const subdivision = props.iso_3166_2 || props.iso_3166_2_code || props.ISO_3166_2 || "";
  const subdivisionCountry = String(subdivision).includes("-") ? String(subdivision).split("-")[0] : "";
  const candidates = [
    props.ISO_A2,
    props.iso_a2,
    props["ISO3166-1-Alpha-2"],
    subdivisionCountry,
    props.adm0_a3,
    props.ADM0_A3,
    props.iso_a3,
    props.ISO_A3,
    props.admin,
    props.ADMIN,
    props.name,
    props.NAME,
  ];
  for (const candidate of candidates) {
    const raw = String(candidate || "").trim();
    if (!raw || raw === "-99") continue;
    const normalized = normalizeCountry(raw);
    if (/^[a-z]{2}$/.test(normalized) || countries.some((country) => country.id === normalized)) return normalized;
  }
  return "";
}

function adminNameFromFeature(feature) {
  const props = feature.properties || {};
  return String(
    props.name_zh
    || props.name_zht
    || props.name_ja
    || props.name_local
    || props.中文名
    || props.name
    || props.NAME
    || props.NAME_1
    || props.nam_ja
    || props.pref
    || props.prefecture
    || props.fullname
    || props.full_name
    || props.adm1_name
    || ""
  ).trim();
}

function canonicalAdminNameFromFeature(feature) {
  const props = feature.properties || {};
  return String(
    props.name
    || props.NAME
    || props.NAME_1
    || props.name_en
    || props.adm1_name
    || adminNameFromFeature(feature)
    || ""
  ).trim();
}

function subadminNameFromFeature(feature) {
  const props = feature.properties || {};
  return String(
    props.name_zh
    || props.name_local
    || props.NAME_2
    || props.name_2
    || props.NAME_3
    || props.name_3
    || props.county
    || props.COUNTY
    || props.district
    || props.DISTRICT
    || props.city
    || props.CITY
    || props.name
    || props.NAME
    || adminNameFromFeature(feature)
    || ""
  ).trim();
}

function admin1DisplayCollection() {
  if (!boundaryData.admin1) return { type: "FeatureCollection", features: [] };
  if (admin1DisplayCache.source === boundaryData.admin1 && admin1DisplayCache.collection) return admin1DisplayCache.collection;

  const grouped = new Map();
  const passthrough = [];
  boundaryData.admin1.features.forEach((feature) => {
    const countryId = countryIdFromFeature(feature);
    const props = feature.properties || {};
    const regionName = String(props.region || props.region_name || "").trim();
    const regionCode = String(props.region_cod || props.region_code || "").trim();
    if (!admin1RegionGroupCountries.has(countryId) || !regionName) {
      passthrough.push(feature);
      return;
    }

    const key = `${countryId}-${regionCode || cleanAdminName(regionName)}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        type: "Feature",
        properties: {
          ...props,
          name: regionName,
          name_en: regionName,
          adm1_name: regionName,
          iso_3166_2: regionCode || props.iso_3166_2,
          type_en: "Region",
          grouped_from: props.type_en || "admin subdivision",
          is_region_group: true,
        },
        geometry: { type: "MultiPolygon", coordinates: [] },
      });
    }
    grouped.get(key).geometry.coordinates.push(...geometryToPolygons(feature.geometry));
  });

  admin1DisplayCache = {
    source: boundaryData.admin1,
    collection: { type: "FeatureCollection", features: [...passthrough, ...grouped.values()] },
  };
  return admin1DisplayCache.collection;
}

function geometryToPolygons(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates || [];
  return [];
}

function groupedRegionOutlineGeoJson() {
  return {
    type: "FeatureCollection",
    features: regionGeoJson().features
      .filter((feature) => feature.properties?.is_region_group)
      .map((feature) => ({
        type: "Feature",
        properties: {
          id: `${feature.properties.id}-outline`,
          name: feature.properties.name,
          depth: feature.properties.depth,
          kind: "region-outline",
        },
        geometry: exteriorLineGeometryForFeature(feature),
      }))
      .filter((feature) => feature.geometry.coordinates.length),
  };
}

function exteriorLineGeometryForFeature(feature) {
  const edges = new Map();
  geometryToPolygons(feature.geometry).forEach((polygon) => {
    polygon.forEach((ring) => {
      for (let index = 0; index < ring.length - 1; index += 1) {
        const start = ring[index];
        const end = ring[index + 1];
        if (!validCoordinate(start) || !validCoordinate(end)) continue;
        const forward = coordinateKey(start);
        const backward = coordinateKey(end);
        const key = forward < backward ? `${forward}|${backward}` : `${backward}|${forward}`;
        const current = edges.get(key) || { count: 0, segment: [start, end] };
        current.count += 1;
        edges.set(key, current);
      }
    });
  });

  return {
    type: "MultiLineString",
    coordinates: Array.from(edges.values())
      .filter((edge) => edge.count === 1)
      .map((edge) => edge.segment),
  };
}

function validCoordinate(point) {
  return Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]);
}

function coordinateKey(point) {
  return `${Number(point[0]).toFixed(6)},${Number(point[1]).toFixed(6)}`;
}

function sameAdminName(left, right) {
  return cleanAdminName(left) === cleanAdminName(right);
}

function adminUnitForFeature(regionKey, feature) {
  const name = adminNameFromFeature(feature);
  const canonicalName = canonicalAdminNameFromFeature(feature);
  const units = regionSets[regionKey]?.units || [];
  const direct = units.find((item) => sameAdminName(item.name, name) || sameAdminName(item.name, canonicalName));
  if (direct) return direct;
  const alias = adminNameAlias(regionKey, name) || adminNameAlias(regionKey, canonicalName);
  if (!alias) return regionKey === "us" && canonicalName ? { name: canonicalName } : null;
  return units.find((item) => sameAdminName(item.name, alias)) || { name: alias };
}

function adminNameAlias(regionKey, name) {
  const key = cleanAdminName(name);
  const aliases = {
    japan: {
      hokkaido: "北海道",
      aomori: "青森县",
      iwate: "岩手县",
      miyagi: "宫城县",
      akita: "秋田县",
      yamagata: "山形县",
      fukushima: "福岛县",
      ibaraki: "茨城县",
      tochigi: "枥木县",
      gunma: "群马县",
      saitama: "埼玉县",
      chiba: "千叶县",
      tokyo: "东京都",
      kanagawa: "神奈川县",
      niigata: "新潟县",
      toyama: "富山县",
      ishikawa: "石川县",
      fukui: "福井县",
      yamanashi: "山梨县",
      nagano: "长野县",
      gifu: "岐阜县",
      shizuoka: "静冈县",
      aichi: "爱知县",
      mie: "三重县",
      shiga: "滋贺县",
      kyoto: "京都府",
      osaka: "大阪府",
      hyogo: "兵库县",
      nara: "奈良县",
      wakayama: "和歌山县",
      tottori: "鸟取县",
      shimane: "岛根县",
      okayama: "冈山县",
      hiroshima: "广岛县",
      yamaguchi: "山口县",
      tokushima: "德岛县",
      kagawa: "香川县",
      ehime: "爱媛县",
      kochi: "高知县",
      fukuoka: "福冈县",
      saga: "佐贺县",
      nagasaki: "长崎县",
      kumamoto: "熊本县",
      oita: "大分县",
      miyazaki: "宫崎县",
      kagoshima: "鹿儿岛县",
      okinawa: "冲绳县",
    },
  };
  return aliases[regionKey]?.[key] || "";
}

function cleanAdminName(value) {
  const usAliases = {
    al: "alabama", ak: "alaska", az: "arizona", ar: "arkansas", ca: "california", co: "colorado", ct: "connecticut", de: "delaware", fl: "florida", ga: "georgia",
    hi: "hawaii", id: "idaho", il: "illinois", in: "indiana", ia: "iowa", ks: "kansas", ky: "kentucky", la: "louisiana", me: "maine", md: "maryland",
    ma: "massachusetts", mi: "michigan", mn: "minnesota", ms: "mississippi", mo: "missouri", mt: "montana", ne: "nebraska", nv: "nevada", nh: "newhampshire", nj: "newjersey",
    nm: "newmexico", ny: "newyork", nc: "northcarolina", nd: "northdakota", oh: "ohio", ok: "oklahoma", or: "oregon", pa: "pennsylvania", ri: "rhodeisland", sc: "southcarolina",
    sd: "southdakota", tn: "tennessee", tx: "texas", ut: "utah", vt: "vermont", va: "virginia", wa: "washington", wv: "westvirginia", wi: "wisconsin", wy: "wyoming",
  };
  const raw = String(value || "").trim();
  if (usAliases[raw.toLowerCase()]) return usAliases[raw.toLowerCase()];
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[東]/g, "东")
    .replace(/[県縣]/g, "县")
    .replace(/[臺]/g, "台")
    .replace(/[廣]/g, "广")
    .replace(/[栃]/g, "枥")
    .replace(/[沖]/g, "冲")
    .replace(/[繩]/g, "绳")
    .replace(/[龍]/g, "龙")
    .replace(/[兒]/g, "儿")
    .replace(/省|市|自治区|壮族自治区|回族自治区|维吾尔自治区|特别行政区|县|府|都|道|state of|prefecture/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function findFeatureAtPoint(collection, lng, lat) {
  if (!collection?.features || !Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return collection.features.find((feature) => geometryContainsPoint(feature.geometry, lng, lat));
}

function geometryContainsPoint(geometry, lng, lat) {
  if (!geometry) return false;
  if (geometry.type === "Polygon") return polygonContainsPoint(geometry.coordinates, lng, lat);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.some((polygon) => polygonContainsPoint(polygon, lng, lat));
  return false;
}

function polygonContainsPoint(rings, lng, lat) {
  if (!Array.isArray(rings?.[0])) return false;
  if (!ringContainsPoint(rings[0], lng, lat)) return false;
  return !rings.slice(1).some((ring) => ringContainsPoint(ring, lng, lat));
}

function ringContainsPoint(ring, lng, lat) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersects = ((yi > lat) !== (yj > lat)) && (lng < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-12) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function inferCountry(lng, lat) {
  const feature = findFeatureAtPoint(boundaryData.country, lng, lat);
  if (feature) {
    const id = countryIdFromFeature(feature);
    return id ? getCountry(id) : null;
  }
  return countries.find((country) => inBbox(lng, lat, country.bbox));
}

function inferRegion(countryId, lng, lat) {
  const key = countryId === "cn" ? "china" : countryId === "us" ? "us" : countryId === "jp" ? "japan" : "";
  if (key && boundaryData[key]) {
    const feature = findFeatureAtPoint(boundaryData[key], lng, lat);
    const name = feature ? adminNameFromFeature(feature) : "";
    if (name) return regionSets[key].units.find((unit) => sameAdminName(unit.name, name)) || { name };
  }
  if (boundaryData.admin1) {
    const feature = findFeatureAtPoint(admin1DisplayCollection(), lng, lat);
    const name = feature ? adminNameFromFeature(feature) : "";
    if (name) return { name };
  }
  return key ? regionSets[key].units.find((unit) => inBbox(lng, lat, unit.bbox)) : null;
}

function inferSubregion(countryId, lng, lat) {
  const key = subadminKeyForCountry(countryId);
  if (!key || !boundaryData[key]) return null;
  const feature = findFeatureAtPoint(boundaryData[key], lng, lat);
  const name = feature ? subadminNameFromFeature(feature) : "";
  return name ? { name } : null;
}

function slugify(value) {
  return String(value || "place").trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "");
}

function project(lng, lat) {
  return {
    x: ((lng + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  };
}

function getCountry(countryId) {
  if (countryId === "imported") return { id: "imported", name: "未分类导入", continent: "导入" };
  return countries.find((country) => country.id === countryId) || { id: countryId, name: countryId || "未分类", continent: "导入" };
}

function getPlace(placeId) {
  return places.find((place) => place.id === placeId);
}

function visitedPlaces() {
  return state.visits.map((visit) => ({ ...visit, place: getPlace(visit.placeId) })).filter((visit) => visit.place);
}

function locatedVisitedPlaces() {
  return visitedPlaces().filter((visit) => !visit.place.shapeOnly && Number.isFinite(visit.place.lat) && Number.isFinite(visit.place.lng));
}

function bestVisitForPlace(placeId) {
  const visits = state.visits.filter((visit) => visit.placeId === placeId);
  return visits.length ? visits.reduce((best, visit) => (visit.depth > best.depth ? visit : best), visits[0]) : null;
}

function bestDepthForCountry(countryId) {
  const normalized = normalizeCountry(countryId);
  return locatedVisitedPlaces().some((visit) => normalizeCountry(visit.place.country) === normalized) ? 1 : 0;
}

function uniqueVisitedCountries() {
  return new Set(locatedVisitedPlaces().map((visit) => normalizeCountry(visit.place.country)).filter((country) => country && country !== "imported"));
}

function upsertVisit(placeId, depth = 1, options = {}) {
  const place = getPlace(placeId);
  if (!place) return;
  const tripName = options.tripName?.trim();
  const date = options.date || "";
  const tripId = options.tripId || (tripName ? slugify(tripName) : "quick-checkins");
  const existing = state.visits.find((visit) => visit.placeId === placeId && visit.tripId === tripId);
  if (existing) {
    existing.depth = 1;
    if (date) existing.date = date;
  } else {
    state.visits.push({ placeId, tripId, date, depth: 1 });
  }
  saveState();
}

function markVisited(placeId, depth = 1, options = {}) {
  const place = getPlace(placeId);
  state.focusPlaceId = placeId;
  upsertVisit(placeId, 1, options);
  renderAll();
  showToast(`${place.name} 已标记为去过`);
}

function canonicalPlaceKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/景区|旅游区|风景区|国家公园|公园|博物院|博物馆|历史城区|文化旅游区|旅游度假区|风景名胜区/g, "")
    .replace(/[·\-—–()（）]/g, "");
}

function placeMatchesName(place, name) {
  const target = canonicalPlaceKey(name);
  return canonicalPlaceKey(place.name) === target || canonicalPlaceKey(place.type) === target || place.checklist?.some((item) => canonicalPlaceKey(item) === target);
}

function unvisitPlace(placeId) {
  const place = getPlace(placeId);
  if (!place) return;
  const key = canonicalPlaceKey(place.name);
  const ids = places.filter((candidate) => canonicalPlaceKey(candidate.name) === key).map((candidate) => candidate.id);
  state.visits = state.visits.filter((visit) => !ids.includes(visit.placeId));
  state.checklistMarks = (state.checklistMarks || []).filter((mark) => canonicalPlaceKey(mark.split(":").slice(1).join(":")) !== key);
  places = places.filter((candidate) => !(candidate.checklistOnly && canonicalPlaceKey(candidate.name) === key));
  closeMapPopupsAndDetail();
  saveState();
  renderAll();
  showToast(`${place.name} 已取消去过`);
}

function closeMapPopupsAndDetail() {
  if (leafletMap) leafletMap.closePopup();
  document.querySelectorAll(".maplibregl-popup").forEach((popup) => popup.remove());
  const detail = $("#mapDetail");
  if (detail) {
    detail.classList.add("hidden");
    detail.innerHTML = `
      <p class="eyebrow">Selection</p>
      <h3>地图详情</h3>
      <p class="muted">点击地图上的点、国家或行政区查看证据。</p>`;
  }
}

function ensureMapDetailCloseButton() {
  const detail = $("#mapDetail");
  if (!detail || detail.classList.contains("hidden") || detail.querySelector("[data-close-detail]")) return;
  const button = document.createElement("button");
  button.className = "map-detail-close";
  button.type = "button";
  button.dataset.closeDetail = "1";
  button.setAttribute("aria-label", "Close map detail");
  button.textContent = "x";
  detail.prepend(button);
}

function saveState() {
  const payload = { places, state, savedAt: new Date().toISOString() };
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch (error) {
    console.warn("保存失败", error);
  }
  saveStateToIndexedDb(payload);
}

function openTravelMapDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(idbName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(idbStore);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveStateToIndexedDb(payload) {
  try {
    const db = await openTravelMapDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(idbStore, "readwrite");
      tx.objectStore(idbStore).put(payload, idbStateKey);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.warn("IndexedDB save failed", error);
  }
}

async function loadStateFromIndexedDb() {
  try {
    const db = await openTravelMapDb();
    const payload = await new Promise((resolve, reject) => {
      const tx = db.transaction(idbStore, "readonly");
      const request = tx.objectStore(idbStore).get(idbStateKey);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (!payload) return false;
    applySavedPayload(payload);
    return true;
  } catch (error) {
    console.warn("IndexedDB load failed", error);
    return false;
  }
}

function applySavedPayload(saved) {
  if (!saved?.state || !Array.isArray(saved?.places)) return false;
  places = saved.places;
  const savedBoundaryLevel = ["country", "admin", "subadmin"].includes(saved.state.boundaryLevel) ? saved.state.boundaryLevel : "country";
  state = {
    ...state,
    ...saved.state,
    boundaryLevel: savedBoundaryLevel,
    selectedRegionView: saved.state.selectedRegionView || "china",
    importedFiles: saved.state.importedFiles || [],
    checklistMarks: saved.state.checklistMarks || [],
    openChecklistGroups: saved.state.openChecklistGroups || [],
  };
  state.visits = (state.visits || []).map((visit) => ({ ...visit, depth: visit.depth > 0 ? 1 : 0 })).filter((visit) => visit.depth > 0);
  migrateImportedShapes();
  return true;
}

function currentArchivePayload() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    places,
    state,
  };
}

function exportArchive() {
  const blob = new Blob([JSON.stringify(currentArchivePayload(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `travel-map-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("已导出旅行地图存档");
}

async function importArchiveFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    if (!Array.isArray(payload.places) || !payload.state || !Array.isArray(payload.state.visits)) {
      throw new Error("存档结构不正确");
    }
    places = payload.places;
    state = {
      ...state,
      ...payload.state,
      visits: payload.state.visits || [],
      importedFiles: payload.state.importedFiles || [],
      checklistMarks: payload.state.checklistMarks || [],
      openChecklistGroups: payload.state.openChecklistGroups || [],
    };
    migrateImportedShapes();
    saveState();
    renderAll();
    showToast(`已恢复存档：${file.name}`);
  } catch (error) {
    showToast(`存档导入失败：${error.message}`);
  } finally {
    event.target.value = "";
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    applySavedPayload(saved);
  } catch (error) {
    console.warn("读取保存数据失败", error);
  }
}

function migrateImportedShapes() {
  const shapeIds = new Set();
  places.forEach((place) => {
    if (place.importedGeometry && place.importedGeometry.type !== "Point" && place.importedGeometry.type !== "MultiPoint") {
      place.shapeOnly = true;
      shapeIds.add(place.id);
    }
  });
  if (shapeIds.size) state.visits = state.visits.filter((visit) => !shapeIds.has(visit.placeId));
}

function refreshInferredLocations() {
  places.forEach((place) => {
    if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return;
    const country = inferCountry(place.lng, place.lat);
    if (country?.id && country.id !== "imported") place.country = country.id;
    const region = inferRegion(place.country, place.lng, place.lat);
    if (region?.name) place.unit = region.name;
    const subregion = inferSubregion(place.country, place.lng, place.lat);
    if (subregion?.name) place.subunit = subregion.name;
  });
}

function loadCatalogData() {
  if (catalogDataRequested) return;
  catalogDataRequested = true;
  fetch(catalogSources.china5a)
    .then((response) => response.ok ? response.text() : Promise.reject(new Error(`${response.status}`)))
    .then((html) => {
      const items = parseChina5aFromHtml(html);
      if (items.length > checklistCatalog.china5a.items.length) {
        checklistCatalog.china5a.items = items;
        renderAchievements();
      }
    })
    .catch((error) => console.warn("5A 清单在线更新失败，使用内置清单", error));

  fetch(catalogSources.worldHeritageCountries)
    .then((response) => response.ok ? response.text() : Promise.reject(new Error(`${response.status}`)))
    .then((html) => {
      state.worldHeritageStats = parseWorldHeritageStatsFromHtml(html);
      renderAchievements();
    })
    .catch((error) => console.warn("世界遗产国家统计在线更新失败，使用内置清单", error));
}

function parseChina5aFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const names = new Set(checklistCatalog.china5a.items);
  doc.querySelectorAll("table tr").forEach((row) => {
    const cells = Array.from(row.querySelectorAll("td, th")).map((cell) => cell.textContent.trim().replace(/\[[^\]]+\]/g, ""));
    cells.forEach((cell) => {
      const cleaned = cell.replace(/\s+/g, "").replace(/（.*?）|\(.*?\)/g, "");
      if (cleaned.length >= 2 && cleaned.length <= 28 && /景区|旅游区|风景区|度假区|古城|故居|公园|山|湖|寺|陵|窟|宫|园|城|岛|瀑布|草原|遗址/.test(cleaned)) {
        names.add(cleaned);
      }
    });
  });
  return Array.from(names).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

function parseWorldHeritageStatsFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const rows = [];
  doc.querySelectorAll("table tr").forEach((row) => {
    const cells = Array.from(row.querySelectorAll("td, th")).map((cell) => cell.textContent.trim().replace(/\[[^\]]+\]/g, ""));
    const country = cells[0];
    const total = cells.map((cell) => Number(cell.replace(/[^\d]/g, ""))).find((num) => Number.isFinite(num) && num > 0);
    if (country && total && country.length < 40 && !/country|state party/i.test(country)) rows.push({ country, total });
  });
  return rows.slice(0, 220);
}

function getMapCountries() {
  const dynamicCountries = Array.from(new Set(places.map((place) => place.country)))
    .filter((countryId) => countryId && !countries.some((country) => country.id === countryId))
    .map((countryId) => getCountry(countryId));
  return [...countries, ...dynamicCountries];
}

function bboxToFeature(item, properties = {}) {
  const bbox = item.bbox;
  return {
    type: "Feature",
    properties: { id: item.id, name: item.name, ...properties },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [bbox[0], bbox[1]],
        [bbox[2], bbox[1]],
        [bbox[2], bbox[3]],
        [bbox[0], bbox[3]],
        [bbox[0], bbox[1]],
      ]],
    },
  };
}

function countryGeoJson() {
  if (boundaryData.country) {
    const visited = uniqueVisitedCountries();
    return {
      type: "FeatureCollection",
      features: boundaryData.country.features
        .map((feature) => ({ feature, countryId: countryIdFromFeature(feature) }))
        .filter(({ countryId }) => countryId && visited.has(countryId))
        .map(({ feature, countryId }) => {
          const country = getCountry(countryId);
          return {
            ...feature,
            properties: { ...feature.properties, id: countryId, name: country.name, depth: bestDepthForCountry(countryId), kind: "country" },
          };
        }),
    };
  }

  return {
    type: "FeatureCollection",
    features: getMapCountries()
      .filter((country) => country.bbox && bestDepthForCountry(country.id) > 0)
      .map((country) => {
        const depth = bestDepthForCountry(country.id);
        const custom = customBoundaryFor("country", country.id);
        return custom ? { ...custom, properties: { ...custom.properties, id: country.id, name: country.name, depth, kind: "country" } } : null;
      })
      .filter(Boolean),
  };
}

function adminCountryContextGeoJson() {
  if (!boundaryData.country) return { type: "FeatureCollection", features: [] };
  const adminKeys = new Set(adminBoundaryKeysToShow());
  const countriesWithAdmin = new Set(Array.from(adminKeys).map(countryIdForRegionKey).filter(Boolean));
  const visited = uniqueVisitedCountries();
  return {
    type: "FeatureCollection",
    features: boundaryData.country.features
      .map((feature) => ({ feature, countryId: countryIdFromFeature(feature) }))
      .filter(({ countryId }) => countryId && visited.has(countryId) && !countriesWithAdmin.has(countryId))
      .map(({ feature, countryId }) => {
        const country = getCountry(countryId);
        return {
          ...feature,
          properties: { ...feature.properties, id: countryId, name: country.name, depth: 0, kind: "country-context" },
        };
      }),
  };
}

function countryIdForRegionKey(key) {
  return { china: "cn", us: "us", japan: "jp" }[key] || "";
}

function countryIdForSubadminKey(key) {
  return subadminConfigs[key]?.countryId || "";
}

function areaCenterGeoJson() {
  const features = [];
  getMapCountries()
    .filter((country) => country.bbox && bestDepthForCountry(country.id) > 0)
    .forEach((country) => {
      const depth = bestDepthForCountry(country.id);
      features.push({
        type: "Feature",
        properties: { id: country.id, name: country.name, depth, kind: "country" },
        geometry: { type: "Point", coordinates: bboxCenter(country.bbox) },
      });
    });

  Object.entries(regionSets).forEach(([regionKey, set]) => {
    set.units.forEach((unit) => {
      const matches = visitedPlaces().filter((visit) => visit.place.unit === unit.name);
      const depth = matches.length ? 1 : 0;
      if (!depth) return;
      features.push({
        type: "Feature",
        properties: {
          id: `${regionKey}-${slugify(unit.name)}`,
          name: unit.name,
          depth,
          kind: "region",
          count: matches.length,
        },
        geometry: { type: "Point", coordinates: bboxCenter(unit.bbox) },
      });
    });
  });

  return { type: "FeatureCollection", features };
}

function importedShapeGeoJson() {
  return {
    type: "FeatureCollection",
    features: places
      .filter((place) => place.importedGeometry && !["Point", "MultiPoint"].includes(place.importedGeometry.type))
      .map((place) => ({
        type: "Feature",
        properties: {
          id: place.id,
          name: place.name,
          depth: 1,
          type: place.type,
        },
        geometry: place.importedGeometry,
      })),
  };
}

function importedPathGeoJson() {
  return {
    type: "FeatureCollection",
    features: importedShapeGeoJson().features
      .filter((feature) => ["LineString", "MultiLineString"].includes(feature.geometry?.type)),
  };
}

function importedPolygonGeoJson() {
  return {
    type: "FeatureCollection",
    features: importedShapeGeoJson().features
      .filter((feature) => ["Polygon", "MultiPolygon"].includes(feature.geometry?.type)),
  };
}

function bboxCenter(bbox) {
  return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
}

function regionGeoJson() {
  const features = [
    ...adminBoundaryKeysToShow().flatMap((regionKey) => adminFeaturesForRegion(regionKey)),
    ...globalAdmin1GeoJson().features,
  ];
  if (features.length) return { type: "FeatureCollection", features };

  const fallbackFeatures = [];
  adminBoundaryKeysToShow().forEach((regionKey) => {
    const set = regionSets[regionKey];
    set.units.forEach((unit) => {
      const matches = locatedVisitedPlaces().filter((visit) => regionKeyForCountry(visit.place.country) === regionKey && sameAdminName(visit.place.unit, unit.name));
      const depth = matches.length ? 1 : 0;
      if (!depth) return;
      const properties = {
        depth,
        kind: "region",
        regionKey,
        count: matches.length,
      };
      const custom = customBoundaryFor("admin", regionKey, unit.name);
      if (custom) {
        fallbackFeatures.push({ ...custom, properties: { ...custom.properties, id: `${regionKey}-${slugify(unit.name)}`, name: unit.name, ...properties } });
      }
    });
  });
  return { type: "FeatureCollection", features: fallbackFeatures };
}

function subadminGeoJson() {
  const countriesWithSubadmin = new Set(
    Object.keys(subadminConfigs)
      .filter((key) => boundaryData[key]?.features?.length)
      .map(countryIdForSubadminKey)
  );
  return {
    type: "FeatureCollection",
    features: [
      ...subadminBoundaryKeysToShow().flatMap((key) => subadminFeaturesForKey(key)),
      ...regionGeoJson().features.filter((feature) => !countriesWithSubadmin.has(adminRegionCountryId(feature.properties?.regionKey))),
    ],
  };
}

function subadminFeaturesForKey(key) {
  const config = subadminConfigs[key];
  const collection = boundaryData[key];
  if (!config || !collection?.features?.length) return [];
  return collection.features.map((feature) => {
    const name = subadminNameFromFeature(feature);
    if (!name) return null;
    const matches = locatedVisitedPlaces().filter((visit) => {
      if (normalizeCountry(visit.place.country) !== config.countryId) return false;
      if (sameAdminName(visit.place.subunit, name) || sameAdminName(visit.place.unit, name)) return true;
      return geometryContainsPoint(feature.geometry, visit.place.lng, visit.place.lat);
    });
    return {
      ...feature,
      properties: {
        ...feature.properties,
        id: `${key}-${slugify(name)}`,
        name,
        depth: matches.length ? 1 : 0,
        kind: "subadmin",
        regionKey: key,
        countryId: config.countryId,
        count: matches.length,
      },
    };
  }).filter(Boolean);
}

function adminFeaturesForRegion(regionKey) {
  const countryId = countryIdForRegionKey(regionKey);
  const sourceFeatures = [
    ...(boundaryData[regionKey]?.features || []),
    ...admin1DisplayCollection().features.filter((feature) => countryIdFromFeature(feature) === countryId),
  ];
  const seen = new Set();
  return sourceFeatures.map((feature) => {
    const unit = adminUnitForFeature(regionKey, feature);
    if (!unit) return null;
    const dedupeKey = `${regionKey}-${cleanAdminName(unit.name)}`;
    if (seen.has(dedupeKey)) return null;
    seen.add(dedupeKey);
    const matches = locatedVisitedPlaces().filter((visit) => regionKeyForCountry(visit.place.country) === regionKey && sameAdminName(visit.place.unit, unit.name));
    return {
      ...feature,
      properties: {
        ...feature.properties,
        id: `${regionKey}-${slugify(unit.name)}`,
        name: unit.name,
        depth: matches.length ? 1 : 0,
        kind: "region",
        regionKey,
        count: matches.length,
      },
    };
  }).filter(Boolean);
}

function globalAdmin1GeoJson() {
  if (!boundaryData.admin1) return { type: "FeatureCollection", features: [] };
  const specialCountries = new Set(["cn", "us", "jp"]);
  const visits = locatedVisitedPlaces().filter((visit) => !specialCountries.has(normalizeCountry(visit.place.country)));
  const features = admin1DisplayCollection().features.map((feature) => {
    const matches = visits.filter((visit) => geometryContainsPoint(feature.geometry, visit.place.lng, visit.place.lat));
    if (!matches.length) return null;
    const countryId = countryIdFromFeature(feature) || matches[0].place.country;
    return {
      ...feature,
      properties: {
        ...feature.properties,
        id: `${countryId}-${slugify(adminNameFromFeature(feature))}`,
        name: adminNameFromFeature(feature),
        depth: 1,
        kind: "region",
        regionKey: countryId,
        count: matches.length,
      },
    };
  }).filter(Boolean);
  return { type: "FeatureCollection", features };
}

function adminBoundaryKeysToShow() {
  const supportedKeys = ["china", "us"];
  const visitedKeys = locatedVisitedPlaces().map((visit) => regionKeyForCountry(visit.place.country)).filter(Boolean);
  const selectedKey = supportedKeys.includes(state.selectedRegionView) ? state.selectedRegionView : "china";
  return Array.from(new Set([...supportedKeys, selectedKey, ...visitedKeys].filter(Boolean)));
}

function subadminBoundaryKeysToShow() {
  const visitedKeys = locatedVisitedPlaces().map((visit) => subadminKeyForCountry(visit.place.country)).filter(Boolean);
  return Array.from(new Set([...visitedKeys, ...Object.keys(subadminConfigs)].filter(Boolean)));
}

function customBoundaryFor(level, countryOrRegion, unitName = "") {
  const match = places.find((place) => {
    if (!place.importedGeometry || place.importedGeometry.type === "Point") return false;
    if (level === "country") return place.boundaryLevel === "country" && place.country === countryOrRegion;
    return place.boundaryLevel === "admin" && regionKeyForCountry(place.country) === countryOrRegion && place.unit === unitName;
  });
  return match ? {
    type: "Feature",
    properties: { source: "imported-boundary", name: match.name },
    geometry: match.importedGeometry,
  } : null;
}

function regionKeyForCountry(countryId) {
  const normalized = normalizeCountry(countryId);
  return normalized === "cn" ? "china" : normalized === "us" ? "us" : normalized === "jp" ? "japan" : "";
}

function subadminKeyForCountry(countryId) {
  const normalized = normalizeCountry(countryId);
  return Object.keys(subadminConfigs).find((key) => subadminConfigs[key].countryId === normalized) || "";
}

function renderPlaceSelect() {
  $("#placeSelect").innerHTML = places
    .map((place) => `<option value="${place.id}">${place.name} - ${getCountry(place.country).name}</option>`)
    .join("");
}

function renderLegend() {
  const legend = $("#legend");
  if (legend) legend.remove();
}

function renderMetrics() {
  const visited = visitedPlaces();
  const metrics = [
    ["去过国家/地区", uniqueVisitedCountries().size],
    ["中国省级行政区", `${countVisitedRegions("china")}/34`],
    ["美国州", `${countVisitedRegions("us")}/50`],
    ["世界遗产", visited.filter((v) => v.place.checklist.includes("世界遗产")).length],
    ["导入地点/Shape", places.filter((place) => place.imported).length],
  ];
  $("#metrics").innerHTML = metrics.map(([label, value]) => `<article class="metric"><strong>${value}</strong><span>${label}</span></article>`).join("");
}

function renderGeoMap() {
  if (window.maplibregl) {
    renderMapLibreMap();
    return;
  }

  if (!window.L) {
    $("#leafletMap").innerHTML = `<div class="map-empty">MapLibre/Leaflet 未加载。请检查网络是否能访问 unpkg.com。</div>`;
    return;
  }

  if (!leafletMap) {
    leafletMap = L.map("leafletMap", {
      worldCopyJump: true,
      minZoom: 1,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    }).setView([25, 20], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      updateWhenZooming: false,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);
  }

  renderLeafletLayers();
  setTimeout(() => {
    leafletMap.invalidateSize();
    if (!leafletDidInitialFit) {
      fitMapToVisitedPlaces();
      leafletDidInitialFit = true;
    }
  }, 80);
}

function fitMapToVisitedPlaces() {
  if (!leafletMap || !window.L) return;
  const focusPlace = getPlace(state.focusPlaceId);
  if (focusPlace && Number.isFinite(focusPlace.lat) && Number.isFinite(focusPlace.lng)) {
    leafletMap.setView([focusPlace.lat, focusPlace.lng], 5, { animate: false });
    return;
  }
  const points = visitedPlaces()
    .filter((visit) => Number.isFinite(visit.place.lat) && Number.isFinite(visit.place.lng))
    .map((visit) => [visit.place.lat, visit.place.lng]);
  if (!points.length) return;
  const lats = points.map((point) => point[0]).sort((a, b) => a - b);
  const lngs = points.map((point) => point[1]).sort((a, b) => a - b);
  const middle = Math.floor(points.length / 2);
  leafletMap.setView([lats[middle], lngs[middle]], 5, { animate: false });
}

function renderMapLibreMap() {
  const focusPlace = getPlace(state.focusPlaceId) || visitedPlaces()[0]?.place;
  const center = focusPlace && Number.isFinite(focusPlace.lng) && Number.isFinite(focusPlace.lat)
    ? [focusPlace.lng, focusPlace.lat]
    : [105, 35];

  if (!mapLibreMap) {
    mapLibreMap = new maplibregl.Map({
      container: "leafletMap",
      center,
      zoom: 4.6,
      attributionControl: true,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
    });
    mapLibreMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    mapLibreMap.on("load", renderMapLibreLayers);
    return;
  }

  mapLibreMap.resize();
  if (mapLibreMap.isStyleLoaded()) renderMapLibreLayers();
}

function setMapLibreSource(id, data) {
  const source = mapLibreMap.getSource(id);
  if (source) source.setData(data);
  else mapLibreMap.addSource(id, { type: "geojson", data });
}

function renderMapLibreLayers() {
  if (!mapLibreMap || !mapLibreMap.isStyleLoaded()) return;

  if (state.boundaryLevel === "country") loadBoundaryData("country");
  if (state.boundaryLevel === "admin") {
    adminBoundaryKeysToShow().forEach(loadBoundaryData);
    loadBoundaryData("admin1");
  }
  if (state.boundaryLevel === "subadmin") {
    subadminBoundaryKeysToShow().forEach(loadBoundaryData);
  }

  removeMapLibreLayer("visited-area-labels");
  removeMapLibreLayer("visited-area-centers");
  removeMapLibreLayer("imported-shapes-line");
  removeMapLibreLayer("imported-shapes-fill");
  removeMapLibreLayer("imported-shapes-path-line");
  removeMapLibreLayer("visited-regions-line");
  removeMapLibreLayer("visited-regions-fill");
  removeMapLibreLayer("visited-region-group-outlines-line");
  removeMapLibreLayer("visited-subadmin-line");
  removeMapLibreLayer("visited-subadmin-fill");
  removeMapLibreLayer("admin-country-context-line");
  removeMapLibreLayer("admin-country-context-fill");
  removeMapLibreLayer("visited-countries-line");
  removeMapLibreLayer("visited-countries-fill");
  removeMapLibreSource("visited-area-centers");
  removeMapLibreSource("imported-shapes");
  removeMapLibreSource("imported-paths");
  removeMapLibreSource("visited-regions");
  removeMapLibreSource("visited-region-group-outlines");
  removeMapLibreSource("visited-subadmin");
  removeMapLibreSource("admin-country-context");
  removeMapLibreSource("visited-countries");

  if (state.boundaryLevel === "country") {
    setMapLibreSource("visited-countries", countryGeoJson());
    addMapLibreFillLayer("visited-countries", "visited-countries-fill", "visited-countries-line", 0.2, 1.15);
  }

  if (state.boundaryLevel === "admin") {
    loadBoundaryData("country");
    setMapLibreSource("visited-regions", regionGeoJson());
    addMapLibreFillLayer("visited-regions", "visited-regions-fill", "visited-regions-line", 0.24, 1.4);
    setMapLibreSource("visited-region-group-outlines", groupedRegionOutlineGeoJson());
    addMapLibreLineLayer("visited-region-group-outlines", "visited-region-group-outlines-line", 1.55);
    setMapLibreSource("admin-country-context", adminCountryContextGeoJson());
    addMapLibreFillLayer("admin-country-context", "admin-country-context-fill", "admin-country-context-line", 0.18, 1);
  }

  if (state.boundaryLevel === "subadmin") {
    setMapLibreSource("visited-subadmin", subadminGeoJson());
    addMapLibreFillLayer("visited-subadmin", "visited-subadmin-fill", "visited-subadmin-line", 0.24, 1.2);
  }

  setMapLibreSource("imported-shapes", importedPolygonGeoJson());
  addMapLibreFillLayer("imported-shapes", "imported-shapes-fill", "imported-shapes-line", 0.24, 1.5, true);
  setMapLibreSource("imported-paths", importedPathGeoJson());
  addMapLibreImportedPathLayer("imported-paths", "imported-shapes-path-line", 3);
  bindMapLibreLayerHandlers();

  mapLibreMarkers.forEach((marker) => marker.remove());
  mapLibreMarkers = [];
  visitedPlaces()
    .filter((visit) => !visit.place.shapeOnly && !visit.place.manualAdmin && Number.isFinite(visit.place.lng) && Number.isFinite(visit.place.lat))
    .forEach((visit) => {
      const el = document.createElement("button");
      el.className = "maplibre-marker";
      el.style.background = depthColors[1];
      el.title = visit.place.name;
      el.addEventListener("click", () => renderPlaceDetail(visit.place.id));
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([visit.place.lng, visit.place.lat])
        .setPopup(new maplibregl.Popup({ offset: 16 }).setHTML(`<strong>${visit.place.name}</strong><br>${getCountry(visit.place.country).name} · ${visit.place.unit || "未分区"}<br><button class="popup-action" data-unvisit="${visit.place.id}" type="button">取消去过</button>`))
        .addTo(mapLibreMap);
      mapLibreMarkers.push(marker);
    });
}

function bindMapLibreLayerHandlers() {
  if (!mapLibreLayerHandlersBound.admin && mapLibreMap.getLayer("visited-regions-fill")) {
    mapLibreLayerHandlersBound.admin = true;
    mapLibreMap.on("click", "visited-regions-fill", (event) => {
      const feature = event.features?.[0];
      if (feature) handleAdminRegionClick(feature);
    });
    mapLibreMap.on("mouseenter", "visited-regions-fill", () => {
      mapLibreMap.getCanvas().style.cursor = "pointer";
    });
    mapLibreMap.on("mouseleave", "visited-regions-fill", () => {
      mapLibreMap.getCanvas().style.cursor = "";
    });
  }
  if (!mapLibreLayerHandlersBound.subadmin && mapLibreMap.getLayer("visited-subadmin-fill")) {
    mapLibreLayerHandlersBound.subadmin = true;
    mapLibreMap.on("click", "visited-subadmin-fill", (event) => {
      const feature = event.features?.[0];
      if (feature) handleAdminRegionClick(feature);
    });
    mapLibreMap.on("mouseenter", "visited-subadmin-fill", () => {
      mapLibreMap.getCanvas().style.cursor = "pointer";
    });
    mapLibreMap.on("mouseleave", "visited-subadmin-fill", () => {
      mapLibreMap.getCanvas().style.cursor = "";
    });
  }
}

function addMapLibreFillLayer(sourceId, fillId, lineId, opacity, lineWidth, geometryFilter = false) {
  const polygonFilter = ["any", ["==", ["geometry-type"], "Polygon"], ["==", ["geometry-type"], "MultiPolygon"]];
  const paintColor = ["case", [">", ["get", "depth"], 0], depthColors[1], depthColors[0]];
  const paintOpacity = ["case", [">", ["get", "depth"], 0], opacity, Math.min(opacity, 0.18)];
  const lineColor = ["case", [">", ["get", "depth"], 0], depthColors[1], "#b43d16"];
  const lineOpacity = ["case", ["==", ["get", "is_region_group"], true], 0, [">", ["get", "depth"], 0], 0.82, 0.7];
  mapLibreMap.addLayer({
    id: fillId,
    type: "fill",
    source: sourceId,
    ...(geometryFilter ? { filter: polygonFilter } : {}),
    paint: {
      "fill-color": paintColor,
      "fill-opacity": paintOpacity,
    },
  });
  mapLibreMap.addLayer({
    id: lineId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": lineColor,
      "line-width": lineWidth,
      "line-opacity": lineOpacity,
    },
  });
}

function addMapLibreLineLayer(sourceId, lineId, lineWidth) {
  const lineColor = ["case", [">", ["get", "depth"], 0], depthColors[1], "#b43d16"];
  mapLibreMap.addLayer({
    id: lineId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": lineColor,
      "line-width": lineWidth,
      "line-opacity": 0.86,
    },
  });
}

function addMapLibreImportedPathLayer(sourceId, lineId, lineWidth) {
  mapLibreMap.addLayer({
    id: lineId,
    type: "line",
    source: sourceId,
    filter: ["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "MultiLineString"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": depthColors[1],
      "line-width": lineWidth,
      "line-opacity": 0.95,
    },
  });
}

function removeMapLibreLayer(id) {
  if (mapLibreMap.getLayer(id)) mapLibreMap.removeLayer(id);
}

function removeMapLibreSource(id) {
  if (mapLibreMap.getSource(id)) mapLibreMap.removeSource(id);
}

function renderLeafletLayers() {
  if (!leafletMap || !window.L) return;
  if (state.boundaryLevel === "country") loadBoundaryData("country");
  if (state.boundaryLevel === "admin") {
    adminBoundaryKeysToShow().forEach(loadBoundaryData);
    loadBoundaryData("admin1");
  }
  if (state.boundaryLevel === "subadmin") {
    subadminBoundaryKeysToShow().forEach(loadBoundaryData);
  }
  if (leafletLayers) leafletLayers.remove();
  leafletLayers = L.layerGroup().addTo(leafletMap);

  if (state.boundaryLevel === "country") {
    L.geoJSON(countryGeoJson(), {
      style: leafletBoundaryStyle,
      onEachFeature: (feature, layer) => {
        layer.on("click", () => renderCountryDetail(feature.properties.id));
        layer.bindTooltip(feature.properties.name, { sticky: true });
      },
    }).addTo(leafletLayers);
  }

  if (state.boundaryLevel === "admin") {
    loadBoundaryData("country");
    L.geoJSON(regionGeoJson(), {
      style: leafletBoundaryStyle,
      onEachFeature: (feature, layer) => {
        layer.on("click", () => handleAdminRegionClick(feature));
        layer.bindTooltip(`${feature.properties.name} · ${feature.properties.count} 个地点`, { sticky: true });
      },
    }).addTo(leafletLayers);
    L.geoJSON(groupedRegionOutlineGeoJson(), {
      style: leafletOutlineStyle,
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.name, { sticky: true });
      },
    }).addTo(leafletLayers);
    L.geoJSON(adminCountryContextGeoJson(), {
      style: (feature) => ({ ...leafletBoundaryStyle(feature), fillOpacity: 0.18, weight: 1 }),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.name, { sticky: true });
      },
    }).addTo(leafletLayers);
  }

  if (state.boundaryLevel === "subadmin") {
    L.geoJSON(subadminGeoJson(), {
      style: leafletBoundaryStyle,
      onEachFeature: (feature, layer) => {
        layer.on("click", () => handleAdminRegionClick(feature));
        layer.bindTooltip(String(feature.properties.name || ""), { sticky: true });
      },
    }).addTo(leafletLayers);
  }

  L.geoJSON(importedShapeGeoJson(), {
    style: leafletBoundaryStyle,
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.name, { sticky: true });
    },
  }).addTo(leafletLayers);

  visitedPlaces()
    .filter((visit) => !visit.place.shapeOnly && !visit.place.manualAdmin && Number.isFinite(visit.place.lng) && Number.isFinite(visit.place.lat))
    .forEach((visit) => {
      const marker = L.circleMarker([visit.place.lat, visit.place.lng], {
        radius: 4,
        color: "#111827",
        weight: 2,
        fillColor: depthColors[1],
        fillOpacity: 0.95,
      });
      marker.bindPopup(`<strong>${visit.place.name}</strong><br>${getCountry(visit.place.country).name} · ${visit.place.unit || "未分区"}<br><button class="popup-action" data-unvisit="${visit.place.id}" type="button">取消去过</button>`);
      marker.on("click", () => renderPlaceDetail(visit.place.id));
      marker.addTo(leafletLayers);
    });

}

function leafletBoundaryStyle(feature) {
  const depth = feature.properties.depth || 0;
  return {
    color: depth ? depthColors[1] : "#b43d16",
    weight: feature.properties.is_region_group ? 0 : 1.2,
    fillColor: depth ? depthColors[1] : depthColors[0],
    fillOpacity: depth ? 0.22 : 0.18,
  };
}

function leafletOutlineStyle(feature) {
  const depth = feature.properties.depth || 0;
  return {
    color: depth ? depthColors[1] : "#b43d16",
    weight: 1.55,
    opacity: 0.86,
    fillOpacity: 0,
  };
}

function renderCountryDetail(countryId) {
  const country = getCountry(countryId);
  const visits = visitedPlaces().filter((visit) => visit.place.country === countryId);
  $("#mapDetail").classList.remove("hidden");
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">Country Detail</p>
    <h3>${country.name}</h3>
    <dl>
      <div><dt>状态</dt><dd>${depthLabels[bestDepthForCountry(countryId)]}</dd></div>
      <div><dt>证据</dt><dd>${visits.length}</dd></div>
      <div><dt>地区</dt><dd>${new Set(visits.map((v) => v.place.unit).filter(Boolean)).size}</dd></div>
      <div><dt>世界遗产</dt><dd>${visits.filter((v) => v.place.checklist.includes("世界遗产")).length}</dd></div>
    </dl>
    <div class="tag-row">${visits.map((visit) => `<span class="tag">${visit.place.name}</span>`).join("") || `<span class="tag">未去清单</span>`}</div>`;
}

function handleAdminRegionClick(feature) {
  const props = feature.properties || {};
  const regionName = props.name;
  const countryId = adminRegionCountryId(props.regionKey);
  const isSubadmin = props.kind === "subadmin" || Boolean(subadminConfigs[props.regionKey]);
  if (!regionName || !countryId || countryId === "imported") return;

  const manual = manualAdminPlaceFor(countryId, regionName);
  if (manual) {
    state.visits = state.visits.filter((visit) => visit.placeId !== manual.id);
    places = places.filter((place) => place.id !== manual.id);
    closeMapPopupsAndDetail();
    saveState();
    renderAll();
    showToast(`${regionName} 已取消手动点亮`);
    return;
  }

  const realVisits = locatedVisitedPlaces().filter((visit) =>
    !visit.place.manualAdmin
    && normalizeCountry(visit.place.country) === countryId
    && (isSubadmin ? sameAdminName(visit.place.subunit || visit.place.unit, regionName) : sameAdminName(visit.place.unit, regionName))
  );
  if (realVisits.length) {
    renderAdminRegionDetail(countryId, regionName, realVisits);
    return;
  }

  const center = geometryCenter(feature.geometry);
  const id = manualAdminPlaceId(countryId, regionName);
  places.push({
    id,
    name: `${getCountry(countryId).name} - ${regionName}`,
    country: countryId,
    unit: isSubadmin ? "" : regionName,
    subunit: isSubadmin ? regionName : "",
    city: "",
    type: "手动点亮行政区",
    lat: center?.[1] ?? null,
    lng: center?.[0] ?? null,
    tags: ["行政区"],
    checklist: [],
    manualAdmin: true,
  });
  state.focusPlaceId = id;
  upsertVisit(id, 1, { tripId: "manual-admin" });
  renderAll();
  showToast(`${regionName} 已手动点亮`);
}

function renderAdminRegionDetail(countryId, regionName, visits) {
  $("#mapDetail").classList.remove("hidden");
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">Administrative Region</p>
    <h3>${regionName}</h3>
    <dl>
      <div><dt>国家/地区</dt><dd>${getCountry(countryId).name}</dd></div>
      <div><dt>状态</dt><dd>已点亮</dd></div>
      <div><dt>证据</dt><dd>${visits.length} 个地点</dd></div>
    </dl>
    <div class="tag-row">${visits.map((visit) => `<span class="tag">${visit.place.name}</span>`).join("")}</div>`;
}

function handleAdminRegionClick(feature) {
  const props = feature.properties || {};
  const regionName = props.name;
  const countryId = adminRegionCountryId(props.regionKey);
  const isSubadmin = props.kind === "subadmin" || Boolean(subadminConfigs[props.regionKey]);
  if (!regionName || !countryId || countryId === "imported") return;
  const visits = adminRegionEvidenceVisits(countryId, regionName, isSubadmin);
  renderAdminRegionDetail(countryId, regionName, visits, {
    center: geometryCenter(feature.geometry),
    isSubadmin,
    manual: Boolean(manualAdminPlaceFor(countryId, regionName)),
  });
}

function adminRegionEvidenceVisits(countryId, regionName, isSubadmin) {
  return locatedVisitedPlaces().filter((visit) =>
    !visit.place.manualAdmin
    && normalizeCountry(visit.place.country) === countryId
    && (isSubadmin ? sameAdminName(visit.place.subunit || visit.place.unit, regionName) : sameAdminName(visit.place.unit, regionName))
  );
}

function toggleManualAdminRegion(countryId, regionName, isSubadmin, center) {
  const manual = manualAdminPlaceFor(countryId, regionName);
  if (manual) {
    state.visits = state.visits.filter((visit) => visit.placeId !== manual.id);
    places = places.filter((place) => place.id !== manual.id);
    closeMapPopupsAndDetail();
    saveState();
    renderAll();
    showToast(`${regionName} unmarked`);
    return;
  }

  const realVisits = adminRegionEvidenceVisits(countryId, regionName, isSubadmin);
  if (realVisits.length) {
    renderAdminRegionDetail(countryId, regionName, realVisits, { center, isSubadmin, manual: false });
    return;
  }

  const id = manualAdminPlaceId(countryId, regionName);
  places.push({
    id,
    name: `${getCountry(countryId).name} - ${regionName}`,
    country: countryId,
    unit: isSubadmin ? "" : regionName,
    subunit: isSubadmin ? regionName : "",
    city: "",
    type: "Manual admin region",
    lat: center?.[1] ?? null,
    lng: center?.[0] ?? null,
    tags: ["admin region"],
    checklist: [],
    manualAdmin: true,
  });
  state.focusPlaceId = id;
  upsertVisit(id, 1, { tripId: "manual-admin" });
  renderAll();
  showToast(`${regionName} marked`);
}

function renderAdminRegionDetail(countryId, regionName, visits, options = {}) {
  const center = Array.isArray(options.center) ? options.center : [];
  const canToggle = options.manual || visits.length === 0;
  const action = canToggle ? `
    <button class="detail-action" data-admin-toggle="1" data-country="${countryId}" data-region="${encodeURIComponent(regionName)}" data-subadmin="${options.isSubadmin ? "1" : "0"}" data-lng="${center[0] ?? ""}" data-lat="${center[1] ?? ""}" type="button">
      ${options.manual ? "Unmark visited" : "Mark visited"}
    </button>` : "";
  $("#mapDetail").classList.remove("hidden");
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">Administrative Region</p>
    <h3>${regionName}</h3>
    <dl>
      <div><dt>Country</dt><dd>${getCountry(countryId).name}</dd></div>
      <div><dt>Status</dt><dd>${options.manual || visits.length ? "Visited" : "Not visited"}</dd></div>
      <div><dt>Evidence</dt><dd>${visits.length}</dd></div>
    </dl>
    <div class="tag-row">${visits.map((visit) => `<span class="tag">${visit.place.name}</span>`).join("") || `<span class="tag">No place evidence</span>`}</div>
    ${action}`;
}

function adminRegionCountryId(regionKey) {
  const countryId = countryIdForRegionKey(regionKey) || countryIdForSubadminKey(regionKey) || normalizeCountry(regionKey);
  return countryId || "";
}

function manualAdminPlaceId(countryId, regionName) {
  return `manual-admin-${slugify(countryId)}-${slugify(regionName)}`;
}

function manualAdminPlaceFor(countryId, regionName) {
  const id = manualAdminPlaceId(countryId, regionName);
  return places.find((place) => place.id === id || (place.manualAdmin && normalizeCountry(place.country) === countryId && (sameAdminName(place.unit, regionName) || sameAdminName(place.subunit, regionName))));
}

function renderPlaceDetail(placeId) {
  const place = getPlace(placeId);
  const visit = bestVisitForPlace(placeId);
  $("#mapDetail").classList.remove("hidden");
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">Map Point</p>
    <h3>${place.name}</h3>
    <dl>
      <div><dt>国家</dt><dd>${getCountry(place.country).name}</dd></div>
      <div><dt>地区</dt><dd>${place.unit || "未分区"}</dd></div>
      <div><dt>状态</dt><dd>${visit ? "去过" : "未去过"}</dd></div>
      <div><dt>坐标</dt><dd>${Number.isFinite(place.lat) ? `${place.lat.toFixed(2)}, ${place.lng.toFixed(2)}` : "无"}</dd></div>
    </dl>
    <div class="tag-row">${place.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
    ${visit ? `<button class="detail-action" data-unvisit="${place.id}" type="button">取消去过</button>` : ""}`;
}

function countVisitedRegions(regionKey) {
  const units = regionSets[regionKey].units;
  const visits = locatedVisitedPlaces().filter((visit) =>
    regionKeyForCountry(visit.place.country) === regionKey
    || units.some((unit) => sameAdminName(visit.place.unit, unit.name))
  );
  const visitedUnitNames = visits.map((visit) => visit.place.unit).filter(Boolean);
  return units.filter((unit) =>
    visitedUnitNames.some((name) => sameAdminName(name, unit.name))
    || visits.some((visit) => visitInRegionBoundary(visit, regionKey, unit.name))
  ).length;
}

function visitInRegionBoundary(visit, regionKey, unitName) {
  const features = [
    ...(boundaryData[regionKey]?.features || []),
    ...admin1DisplayCollection().features.filter((feature) => countryIdFromFeature(feature) === countryIdForRegionKey(regionKey)),
  ];
  return features.some((feature) => {
    const name = adminNameFromFeature(feature);
    return sameAdminName(name, unitName) && geometryContainsPoint(feature.geometry, visit.place.lng, visit.place.lat);
  });
}

function renderRegionMap() {
  const view = state.selectedRegionView;
  const set = regionSets[view];
  $("#regionMap").innerHTML = set.units.map((unit) => {
    const matches = locatedVisitedPlaces().filter((visit) => sameAdminName(visit.place.unit, unit.name));
    const depth = matches.length ? 1 : 0;
    return `<button class="region-tile depth-${depth}" data-region="${unit.name}">
      <strong>${unit.name}</strong>
      <span>${matches.length ? `${matches.length} 个地点` : "未点亮"}</span>
    </button>`;
  }).join("");
}

function renderCoverage() {
  const rows = [
    [regionSets.china.label, countVisitedRegions("china"), regionSets.china.total],
    [regionSets.us.label, countVisitedRegions("us"), regionSets.us.total],
    ["世界国家/地区", uniqueVisitedCountries().size, worldCountryTotal],
  ];
  $("#coverageBars").innerHTML = rows.map(([name, done, total]) => {
    const percent = Math.round((done / total) * 100);
    return `<div class="bar-row"><div class="bar-meta"><span>${name}</span><span>${done}/${total} · ${percent}%</span></div><div class="bar"><i style="width:${percent}%"></i></div></div>`;
  }).join("");
}

function renderImportSummary() {
  const files = state.importedFiles;
  $("#importSummary").innerHTML = files.length
    ? `<article class="check-item"><header><strong>全部导入数据</strong><span>${places.filter((place) => place.imported).length} 个对象</span></header><button class="text-action" data-delete-all-imports="1" type="button">删除全部导入</button></article>${files.map((file, index) => `<article class="check-item"><header><strong>${file.name}</strong><span>${file.count} 条</span></header><p class="muted">${file.format} · ${file.marked ? "已点亮地图" : "仅导入"}</p><button class="text-action" data-delete-import="${file.id || ""}" data-import-index="${index}" type="button">删除导入</button></article>`).join("")}`
    : `<p class="muted">还没有导入文件。导入后，地图点、国家/地区覆盖率、行政区覆盖率会自动刷新。</p>`;
}

function renderAchievements() {
  const checklistHtml = Object.entries(checklistCatalog).map(([key, list]) => renderChecklistSection(key, list)).join("");
  const heritageStatsHtml = renderWorldHeritageCountryStats();
  const chinaCount = countVisitedRegions("china");
  const chinaPercent = Math.round((chinaCount / regionSets.china.total) * 100);
  const achievements = [
    [`中国省级 ${chinaPercent}%`, chinaCount >= 17, `${chinaCount}/${regionSets.china.total}`],
    ["中国省级全收集", chinaCount >= regionSets.china.total, `${chinaCount}/${regionSets.china.total}`],
    ["跨越多个国家/地区", uniqueVisitedCountries().size >= 3, `${uniqueVisitedCountries().size} 个国家/地区`],
    ["世界遗产收藏家 Lv.1", checklistDoneCount("worldHeritage") >= 3, `${checklistDoneCount("worldHeritage")}/${checklistTotalCount("worldHeritage")}`],
    ["五岳进度", checklistDoneCount("fiveMountains") >= 1, `${checklistDoneCount("fiveMountains")}/5`],
    ["外部地图数据已接入", places.some((place) => place.imported), `${places.filter((place) => place.imported).length} 个导入对象`],
  ];
  const achievementHtml = achievements.map(([name, done, progress]) => `
    <article class="achievement ${done ? "done" : "locked"}">
      <header><strong>${name}</strong><span>${done ? "已解锁" : "进行中"}</span></header>
      <strong class="achievement-value">${progress}</strong>
      <div class="bar"><i style="width:${done ? 100 : 38}%"></i></div>
    </article>`).join("");
  $("#achievementList").innerHTML = `${achievementHtml}<div class="theme-checklists">${checklistHtml}${heritageStatsHtml}</div>`;
}

function renderWorldHeritageCountryStats() {
  const stats = state.worldHeritageStats || [];
  if (!stats.length) return "";
  return `<section class="theme-checklist">
    <header><strong>全球世界遗产按国家统计</strong><span>${stats.length} 个国家/地区</span></header>
    <div class="country-stat-grid">
      ${stats.map((row) => `<span class="country-stat"><strong>${row.country}</strong><em>${row.total}</em></span>`).join("")}
    </div>
  </section>`;
}

function renderChecklistSection(key, list) {
  if (list.byRegion) return renderRegionChecklistSection(key, list);
  if (list.byCountry) return renderCountryChecklistSection(key, list);
  const done = checklistDoneCount(key);
  return `<section class="theme-checklist">
    <header><strong>${list.label}</strong><span>${done}/${list.items.length}</span></header>
    <div class="check-chip-grid">
      ${list.items.map((item) => {
        const checked = isChecklistItemDone(key, item);
        return `<button class="check-chip ${checked ? "done" : ""}" data-checklist="${key}" data-item="${item}" type="button">${checked ? "已去 · " : ""}${item}</button>`;
      }).join("")}
    </div>
  </section>`;
}

function renderRegionChecklistSection(key, list) {
  const blocks = Object.entries(list.byRegion).map(([region, items]) => {
    const done = items.filter((item) => isChecklistItemDone(key, item)).length;
    const groupId = checklistGroupId(key, region);
    return `<details class="country-checklist" data-checklist-group="${groupId}" ${done || isChecklistGroupOpen(groupId) ? "open" : ""}>
      <summary><strong>${region}</strong><span>${done}/${items.length}</span></summary>
      <div class="check-chip-grid">
        ${items.map((item) => {
          const checked = isChecklistItemDone(key, item);
          return `<button class="check-chip ${checked ? "done" : ""}" data-checklist="${key}" data-item="${item}" type="button">${checked ? "已去 · " : ""}${item}</button>`;
        }).join("")}
      </div>
    </details>`;
  }).join("");
  return `<section class="theme-checklist featured-checklist">
    <header><strong>${list.label}</strong><span>${checklistDoneCount(key)}/${checklistTotalCount(key)}</span></header>
    <div class="country-checklist-list">${blocks}</div>
  </section>`;
}

function renderCountryChecklistSection(key, list) {
  const countryBlocks = Object.entries(list.byCountry).map(([country, items]) => {
    const done = items.filter((item) => isChecklistItemDone(key, item)).length;
    const groupId = checklistGroupId(key, country);
    return `<details class="country-checklist" data-checklist-group="${groupId}" ${country === "中国" || isChecklistGroupOpen(groupId) ? "open" : ""}>
      <summary><strong>${country}</strong><span>${done}/${items.length}</span></summary>
      <div class="check-chip-grid">
        ${items.map((item) => {
          const checked = isChecklistItemDone(key, item);
          return `<button class="check-chip ${checked ? "done" : ""}" data-checklist="${key}" data-item="${item}" type="button">${checked ? "已去 · " : ""}${item}</button>`;
        }).join("")}
      </div>
    </details>`;
  }).join("");
  return `<section class="theme-checklist">
    <header><strong>${list.label}</strong><span>${checklistDoneCount(key)}/${checklistTotalCount(key)}</span></header>
    <div class="country-checklist-list">${countryBlocks}</div>
  </section>`;
}

function checklistDoneCount(key) {
  return checklistItemsFor(key).filter((item) => isChecklistItemDone(key, item)).length;
}

function checklistTotalCount(key) {
  return checklistItemsFor(key).length;
}

function checklistItemsFor(key) {
  const list = checklistCatalog[key];
  if (list.byRegion) return Object.values(list.byRegion).flat();
  if (list.byCountry) return Object.values(list.byCountry).flat();
  return list.items;
}

function isChecklistItemDone(key, item) {
  return state.checklistMarks.includes(checklistId(key, item))
    || visitedPlaces().some((visit) => placeMatchesName(visit.place, item));
}

function checklistId(key, item) {
  return `${key}:${canonicalPlaceKey(item)}`;
}

function checklistGroupId(key, group) {
  return `${key}:${canonicalPlaceKey(group)}`;
}

function isChecklistGroupOpen(groupId) {
  return (state.openChecklistGroups || []).includes(groupId);
}

function setChecklistGroupOpen(groupId, open) {
  if (!groupId) return;
  const groups = new Set(state.openChecklistGroups || []);
  if (open) groups.add(groupId);
  else groups.delete(groupId);
  state.openChecklistGroups = Array.from(groups);
  saveState();
}

function rememberChecklistGroupForElement(element) {
  const details = element?.closest?.("[data-checklist-group]");
  if (details) setChecklistGroupOpen(details.dataset.checklistGroup, true);
}

function toggleChecklistItem(key, item) {
  const id = checklistId(key, item);
  const marks = new Set(state.checklistMarks || []);
  if (isChecklistItemDone(key, item)) {
    Array.from(marks).forEach((mark) => {
      if (mark.endsWith(`:${canonicalPlaceKey(item)}`)) marks.delete(mark);
    });
    unvisitPlaceByName(item);
  } else {
    marks.add(id);
    const place = ensureChecklistPlace(key, item);
  }
  state.checklistMarks = Array.from(marks);
  saveState();
  renderAll();
}

function ensureChecklistPlace(key, item) {
  const listLabel = checklistCatalog[key].label;
  const coords = checklistPlaceCoordinates[item] || checklistPlaceCoordinates[cleanChecklistName(item)];
  const existing = places.find((place) => placeMatchesName(place, item));
  if (existing) {
    existing.checklist = Array.from(new Set([...(existing.checklist || []), listLabel]));
    applyChecklistCoordinates(existing, coords);
    upsertVisit(existing.id, 1, { tripId: "checklist" });
    state.focusPlaceId = existing.id;
    return existing;
  }
  const id = `checklist-${slugify(key)}-${slugify(item)}`;
  const defaultCountry = key === "usNationalParks" ? "us" : "cn";
  const place = {
    id,
    name: item,
    country: defaultCountry,
    unit: coords?.[2] || "",
    city: "",
    type: listLabel,
    lat: coords?.[0] ?? null,
    lng: coords?.[1] ?? null,
    tags: [listLabel],
    checklist: [listLabel],
    checklistOnly: true,
  };
  if (Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
    const country = inferCountry(place.lng, place.lat);
    if (country?.id) place.country = country.id;
    const region = inferRegion(place.country, place.lng, place.lat);
    if (region?.name) place.unit = region.name;
    const subregion = inferSubregion(place.country, place.lng, place.lat);
    if (subregion?.name) place.subunit = subregion.name;
  }
  places.push(place);
  upsertVisit(id, 1, { tripId: "checklist" });
  state.focusPlaceId = id;
  return place;
}

function applyChecklistCoordinates(place, coords) {
  if (!coords || Number.isFinite(place.lat) && Number.isFinite(place.lng)) return;
  place.lat = coords[0];
  place.lng = coords[1];
  place.unit = place.unit || coords[2] || "";
  const country = inferCountry(place.lng, place.lat);
  if (country?.id) place.country = country.id;
  const region = inferRegion(place.country, place.lng, place.lat);
  if (region?.name) place.unit = region.name;
  const subregion = inferSubregion(place.country, place.lng, place.lat);
  if (subregion?.name) place.subunit = subregion.name;
}

function cleanChecklistName(value) {
  return String(value || "").replace(/景区|旅游区|风景区|国家公园|历史城区/g, "").trim();
}

function geocodeChecklistPlace(placeId, item) {
  if (!placeId) return;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${item} 中国`)}`;
  fetch(url)
    .then((response) => response.ok ? response.json() : Promise.reject(new Error(`${response.status}`)))
    .then((results) => {
      const first = results?.[0];
      const place = getPlace(placeId);
      if (!first || !place) return;
      place.lat = Number(first.lat);
      place.lng = Number(first.lon);
      const country = inferCountry(place.lng, place.lat);
      if (country?.id) place.country = country.id;
      const region = inferRegion(place.country, place.lng, place.lat);
      if (region?.name) place.unit = region.name;
      const subregion = inferSubregion(place.country, place.lng, place.lat);
      if (subregion?.name) place.subunit = subregion.name;
      saveState();
      renderAll();
    })
    .catch((error) => console.warn(`${item} 坐标查询失败`, error));
}

function removeChecklistOnlyPlace(key, item) {
  const listLabel = checklistCatalog[key].label;
  const place = places.find((candidate) => candidate.checklistOnly && sameAdminName(candidate.name, item) && candidate.checklist?.includes(listLabel));
  if (!place) return;
  state.visits = state.visits.filter((visit) => visit.placeId !== place.id);
  places = places.filter((candidate) => candidate.id !== place.id);
}

function unvisitPlaceByName(item) {
  const key = canonicalPlaceKey(item);
  const ids = places.filter((place) => canonicalPlaceKey(place.name) === key || placeMatchesName(place, item)).map((place) => place.id);
  state.visits = state.visits.filter((visit) => !ids.includes(visit.placeId));
  places = places.filter((place) => !(place.checklistOnly && ids.includes(place.id)));
}

function renderNextStops() {
  const recommendations = [
    ["导入真实足迹文件", "把地图软件导出的 GeoJSON、KML 或 CSV 放进来，系统会按经纬度自动点亮地区。", "下一步"],
    ["使用自动边界", "国家边界和中国省级边界由软件自动加载，用户不需要自己准备行政区 shape。", "基础数据"],
    ["补齐经纬度", "没有经纬度的 CSV 最好补 lat/lng，这样国家和省级自动匹配会更准。", "数据质量"],
  ];
  $("#nextStops").innerHTML = recommendations.map(([title, body, goal]) => `
    <article class="next-card"><header><strong>${title}</strong><span class="tag">${goal}</span></header><p class="muted">${body}</p></article>`).join("");
}

async function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const extension = file.name.split(".").pop().toLowerCase();
    const imported = importPlacesFromText(text, extension, file.name, Number($("#importDepth").value));
    showToast(`已导入 ${imported.length} 个地点/shape，并自动点亮相应地区`);
  } catch (error) {
    showToast(`导入失败：${error.message}`);
  } finally {
    event.target.value = "";
  }
}

function importPlacesFromText(text, extension, fileName = `import.${extension}`, depth = 2) {
  const imported = parseImportFile(text, extension);
  const createdIds = [];
  const importId = `import-${slugify(fileName)}-${Date.now()}`;
  imported.forEach((place) => {
    const idBase = slugify(`${place.country}-${place.unit}-${place.name}`);
    let id = `import-${idBase}`;
    let suffix = 2;
    while (places.some((existing) => existing.id === id)) {
      id = `import-${idBase}-${suffix}`;
      suffix += 1;
    }
    places.push({ ...place, id, imported: true, importId, sourceFile: fileName });
    createdIds.push(id);
  });
  if (depth > 0) {
    createdIds
      .filter((id) => !getPlace(id)?.shapeOnly)
      .forEach((id) => upsertVisit(id, depth, { tripId: `import-${slugify(fileName)}` }));
  }
  const firstPointId = createdIds.find((id) => !getPlace(id)?.shapeOnly);
  if (firstPointId) state.focusPlaceId = firstPointId;
  state.importedFiles.unshift({ id: importId, name: fileName, count: imported.length, format: extension.toUpperCase(), marked: depth > 0, ids: createdIds });
  saveState();
  renderAll();
  preloadBoundaryData(false, ["country", "admin1", "china2"]).then(() => {
    refreshInferredLocations();
    saveState();
    renderAll();
  });
  return imported;
}

function deleteImportedBatch(importId, index) {
  const record = state.importedFiles.find((file, fileIndex) => (importId && file.id === importId) || fileIndex === index);
  if (!record) return;
  const ids = new Set(record.ids || []);
  places.forEach((place) => {
    if (place.importId === record.id || (!record.id && place.sourceFile === record.name)) ids.add(place.id);
  });
  state.visits = state.visits.filter((visit) => !ids.has(visit.placeId));
  places = places.filter((place) => !ids.has(place.id));
  state.importedFiles = state.importedFiles.filter((file, fileIndex) => file !== record && fileIndex !== index);
  closeMapPopupsAndDetail();
  saveState();
  renderAll();
  showToast(`${record.name} 已删除`);
}

function deleteAllImportedData() {
  const ids = new Set(places.filter((place) => place.imported).map((place) => place.id));
  state.visits = state.visits.filter((visit) => !ids.has(visit.placeId));
  places = places.filter((place) => !ids.has(place.id));
  state.importedFiles = [];
  closeMapPopupsAndDetail();
  saveState();
  renderAll();
  showToast("导入数据已全部删除");
}

function parseImportFile(text, extension) {
  if (extension === "geojson" || extension === "json") return parseGeoJson(text);
  if (extension === "kml") return parseKml(text);
  if (extension === "csv") return parseCsv(text);
  throw new Error("暂不支持该格式");
}

function parseGeoJson(text) {
  const data = JSON.parse(text);
  const features = data.type === "FeatureCollection" ? data.features : [data];
  return features.map((feature, index) => {
    const props = feature.properties || {};
    const coordinate = geometryCenter(feature.geometry);
    return normalizeImportedPlace({
      name: props.name || props.NAME || props.title || `GeoJSON Feature ${index + 1}`,
      country: props.country || props.Country || "",
      unit: props.unit || props.province || props.state || props.region || "",
      city: props.city || props.City || "",
      type: props.type || feature.geometry?.type || "GeoJSON",
      lat: coordinate?.[1],
      lng: coordinate?.[0],
      tags: props.tags || props.category || props.class,
      checklist: props.checklist,
      boundaryLevel: detectBoundaryLevel(props, feature.geometry),
      geometryType: feature.geometry?.type || "Feature",
      importedGeometry: feature.geometry,
      shapeOnly: feature.geometry?.type !== "Point" && feature.geometry?.type !== "MultiPoint",
    });
  });
}

function parseKml(text) {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  return Array.from(doc.querySelectorAll("Placemark")).map((node, index) => {
    const importedGeometry = kmlGeometry(node);
    const center = geometryCenter(importedGeometry);
    const [lng, lat] = center || [null, null];
    const geometryType = importedGeometry?.type || "Placemark";
    return normalizeImportedPlace({
      name: node.querySelector("name")?.textContent?.trim() || `KML Placemark ${index + 1}`,
      country: "",
      unit: "",
      city: "",
      type: geometryType,
      lat,
      lng,
      tags: "KML",
      checklist: "",
      geometryType,
      importedGeometry,
      shapeOnly: geometryType !== "Point",
    });
  });
}

function kmlGeometry(node) {
  const polygon = node.querySelector("Polygon");
  if (polygon) {
    const outer = parseKmlCoordinates(polygon.querySelector("outerBoundaryIs coordinates")?.textContent);
    const inners = Array.from(polygon.querySelectorAll("innerBoundaryIs coordinates")).map((item) => parseKmlCoordinates(item.textContent)).filter((ring) => ring.length);
    return outer.length ? { type: "Polygon", coordinates: [outer, ...inners] } : null;
  }
  const line = node.querySelector("LineString coordinates");
  if (line) {
    const coords = parseKmlCoordinates(line.textContent);
    return coords.length ? { type: "LineString", coordinates: coords } : null;
  }
  const point = node.querySelector("Point coordinates") || node.querySelector("coordinates");
  const coords = parseKmlCoordinates(point?.textContent);
  return coords[0] ? { type: "Point", coordinates: coords[0] } : null;
}

function parseKmlCoordinates(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .map((item) => item.split(",").map(Number))
    .filter((coord) => Number.isFinite(coord[0]) && Number.isFinite(coord[1]))
    .map((coord) => [coord[0], coord[1]]);
}

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/).filter(Boolean).map(parseCsvLine);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  return rows.slice(1).map((row, index) => {
    const record = Object.fromEntries(headers.map((header, cellIndex) => [header, row[cellIndex] || ""]));
    return normalizeImportedPlace({
      name: record.name || record["名称"] || `CSV Place ${index + 1}`,
      country: record.country || record["国家"] || "",
      unit: record.unit || record.province || record.state || record["省"] || "",
      city: record.city || record["城市"] || "",
      type: record.type || record["类型"] || "CSV",
      lat: Number(record.lat || record.latitude || record["纬度"]) || null,
      lng: Number(record.lng || record.lon || record.longitude || record["经度"]) || null,
      tags: record.tags || record["标签"],
      checklist: record.checklist || record["清单"],
      geometryType: "CSV Row",
    });
  });
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === "\"") quoted = !quoted;
    else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else current += char;
  }
  cells.push(current.trim());
  return cells;
}

function firstCoordinate(coordinates) {
  if (!Array.isArray(coordinates)) return null;
  if (typeof coordinates[0] === "number") return coordinates;
  return firstCoordinate(coordinates[0]);
}

function geometryCenter(geometry) {
  if (!geometry?.coordinates) return null;
  const points = flattenCoordinates(geometry.coordinates);
  if (!points.length) return null;
  const totals = points.reduce((sum, point) => [sum[0] + point[0], sum[1] + point[1]], [0, 0]);
  return [totals[0] / points.length, totals[1] / points.length];
}

function flattenCoordinates(coordinates) {
  if (!Array.isArray(coordinates)) return [];
  if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") return [coordinates];
  return coordinates.flatMap(flattenCoordinates);
}

function normalizeImportedPlace(raw) {
  const lat = Number(raw.lat);
  const lng = Number(raw.lng);
  const inferredCountry = Number.isFinite(lat) && Number.isFinite(lng) ? inferCountry(lng, lat) : null;
  const countryId = normalizeCountry(raw.country || inferredCountry?.id || "");
  const inferredRegion = Number.isFinite(lat) && Number.isFinite(lng) ? inferRegion(countryId, lng, lat) : null;
  const inferredSubregion = Number.isFinite(lat) && Number.isFinite(lng) ? inferSubregion(countryId, lng, lat) : null;
  return {
    id: "",
    name: String(raw.name || "未命名地点").trim(),
    country: countryId,
    subunit: String(raw.subunit || raw.county || raw.district || inferredSubregion?.name || "").trim(),
    unit: String(raw.unit || inferredRegion?.name || "导入图层").trim(),
    city: String(raw.city || "").trim(),
    type: String(raw.type || "导入地点").trim(),
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    tags: normalizeTags(raw.tags),
    checklist: normalizeChecklist(raw),
    geometryType: raw.geometryType || "Imported",
    importedGeometry: raw.importedGeometry || null,
    boundaryLevel: raw.boundaryLevel || "",
    shapeOnly: Boolean(raw.shapeOnly),
  };
}

function detectBoundaryLevel(props, geometry) {
  if (!geometry || !["Polygon", "MultiPolygon"].includes(geometry.type)) return "";
  const text = Object.values(props || {}).join(" ").toLowerCase();
  if (/country|nation|国家|国界|admin[_ -]?0/.test(text)) return "country";
  if (/province|state|prefecture|region|admin|省|州|都道府县|县/.test(text)) return "admin";
  if (props.unit || props.province || props.state || props.region) return "admin";
  if (props.country || props.Country) return "country";
  return "";
}

function normalizeCountry(value) {
  const raw = String(value || "").trim();
  if (!raw) return "imported";
  const compact = raw.toLowerCase().replace(/\./g, "").trim();
  const aliases = {
    china: "cn",
    chn: "cn",
    中国: "cn",
    "people's republic of china": "cn",
    usa: "us",
    us: "us",
    "united states": "us",
    "united states of america": "us",
    美国: "us",
    japan: "jp",
    jpn: "jp",
    日本: "jp",
    france: "fr",
    fra: "fr",
    法国: "fr",
    italy: "it",
    ita: "it",
    意大利: "it",
    germany: "de",
    deu: "de",
    德国: "de",
    "united kingdom": "gb",
    gbr: "gb",
    uk: "gb",
    英国: "gb",
    australia: "au",
    aus: "au",
    澳大利亚: "au",
    canada: "ca",
    can: "ca",
    加拿大: "ca",
    singapore: "sg",
    sgp: "sg",
    新加坡: "sg",
    thailand: "th",
    tha: "th",
    泰国: "th",
    malaysia: "my",
    mys: "my",
    vietnam: "vn",
    "viet nam": "vn",
    vnm: "vn",
    indonesia: "id",
    idn: "id",
    spain: "es",
    esp: "es",
    西班牙: "es",
    mexico: "mx",
    mex: "mx",
    墨西哥: "mx",
    brazil: "br",
    bra: "br",
    巴西: "br",
  };
  if (aliases[compact] || aliases[raw]) return aliases[compact] || aliases[raw];
  if (/^[a-z]{2}$/i.test(raw)) return raw.toLowerCase();
  const known = countries.find((country) => country.id === raw.toLowerCase() || country.name === raw);
  return known?.id || raw;
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value;
  if (!value) return ["导入"];
  return String(value).split(/[;；,，]/).map((tag) => tag.trim()).filter(Boolean);
}

function normalizeChecklist(raw) {
  const explicit = normalizeTags(raw.checklist).filter((item) => item !== "导入");
  const text = `${raw.name || ""} ${raw.type || ""} ${normalizeTags(raw.tags).join(" ")}`.toLowerCase();
  const inferred = [];
  if (/世界遗产|unesco|world heritage/.test(text)) inferred.push("世界遗产");
  if (/5a|aaaaa|五a/.test(text)) inferred.push("中国 5A 景区");
  if (/国家公园|national park/.test(text)) inferred.push("美国国家公园");
  if (/首都|capital/.test(text)) inferred.push("首都城市");
  return Array.from(new Set([...explicit, ...inferred]));
}

function addVisit(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  markVisited(data.get("placeId"), Number(data.get("depth")), {
    tripName: data.get("tripName"),
    date: data.get("tripDate"),
  });
  event.currentTarget.reset();
  renderPlaceSelect();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

function renderAll() {
  renderMapControls();
  renderPlaceSelect();
  renderMetrics();
  if (isMapPageActive()) renderGeoMap();
  renderRegionMap();
  renderCoverage();
  renderImportSummary();
  renderAchievements();
  renderNextStops();
}

function isMapPageActive() {
  return document.querySelector('[data-page="world"]')?.classList.contains("active");
}

function renderMapControls() {
  const level = $("#boundaryLevel");
  if (level) level.value = state.boundaryLevel || "country";
  document.querySelectorAll("[data-region-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.regionView === state.selectedRegionView);
  });
}

function moveMapLevelControlToToolbar() {
  const toolbar = document.querySelector(".map-toolbar");
  const firstBlock = toolbar?.firstElementChild;
  const control = document.querySelector(".map-level-control");
  if (!toolbar || !firstBlock || !control || control.closest(".map-toolbar")) return;
  const row = document.createElement("div");
  row.className = "map-title-row";
  toolbar.insertBefore(row, firstBlock);
  row.appendChild(firstBlock);
  row.appendChild(control);
}

function showPage(pageId) {
  const target = document.querySelector(`[data-page="${pageId}"]`) ? pageId : "world";
  document.querySelectorAll("[data-page]").forEach((page) => {
    page.classList.toggle("active", page.dataset.page === target);
  });
  document.querySelectorAll(".nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${target}`);
  });
  const main = document.querySelector(".map-first-main");
  if (main) {
    main.scrollTop = 0;
    main.scrollLeft = 0;
  }
  document.querySelector(`[data-page="${target}"]`)?.scrollIntoView({ block: "start", inline: "nearest" });
  if (target === "world") {
    setTimeout(() => {
      if (mapLibreMap) mapLibreMap.resize();
      if (leafletMap) leafletMap.invalidateSize();
      renderGeoMap();
    }, 80);
  }
  if (target === "achievements") loadCatalogData();
}

loadState();
moveMapLevelControlToToolbar();
loadStateFromIndexedDb().finally(() => {
  renderLegend();
  preloadBoundaryData(false, ["country", "china", "us"]);
  if (state.boundaryLevel === "admin") loadBoundaryData("admin1");
  if (state.boundaryLevel === "subadmin") subadminBoundaryKeysToShow().forEach(loadBoundaryData);
  renderAll();
  showPage(location.hash.replace("#", "") || "world");
});

window.travelMapApp = {
  importPlacesFromText,
  parseImportFile,
  places: () => places,
  visits: () => state.visits,
};

$("#quickAddForm").addEventListener("submit", addVisit);
$("#importFile").addEventListener("change", handleImport);
$("#exportArchive").addEventListener("click", exportArchive);
$("#archiveFile").addEventListener("change", importArchiveFile);
$("#importSummary").addEventListener("click", (event) => {
  if (event.target.closest("[data-delete-all-imports]")) {
    deleteAllImportedData();
    return;
  }
  const button = event.target.closest("[data-delete-import]");
  if (!button) return;
  deleteImportedBatch(button.dataset.deleteImport, Number(button.dataset.importIndex));
});
$("#boundaryLevel").addEventListener("change", (event) => {
  state.boundaryLevel = event.target.value;
  saveState();
  renderGeoMap();
});
$("#achievementList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-checklist]");
  if (!button) return;
  rememberChecklistGroupForElement(button);
  toggleChecklistItem(button.dataset.checklist, button.dataset.item);
});
$("#achievementList").addEventListener("toggle", (event) => {
  const details = event.target.closest?.("[data-checklist-group]");
  if (!details) return;
  setChecklistGroupOpen(details.dataset.checklistGroup, details.open);
}, true);
$("#leafletMap").addEventListener("click", (event) => {
  const button = event.target.closest("[data-unvisit]");
  if (!button) return;
  unvisitPlace(button.dataset.unvisit);
});
$("#mapDetail").addEventListener("click", (event) => {
  if (event.target.closest("[data-close-detail]")) {
    closeMapPopupsAndDetail();
    return;
  }
  const adminButton = event.target.closest("[data-admin-toggle]");
  if (adminButton) {
    const center = [
      Number(adminButton.dataset.lng),
      Number(adminButton.dataset.lat),
    ];
    toggleManualAdminRegion(
      adminButton.dataset.country,
      decodeURIComponent(adminButton.dataset.region || ""),
      adminButton.dataset.subadmin === "1",
      center.every(Number.isFinite) ? center : null
    );
    return;
  }
  const button = event.target.closest("[data-unvisit]");
  if (!button) return;
  unvisitPlace(button.dataset.unvisit);
});
new MutationObserver(ensureMapDetailCloseButton).observe($("#mapDetail"), {
  childList: true,
  subtree: false,
  attributes: true,
  attributeFilter: ["class"],
});
$("#refreshBoundaries")?.addEventListener("click", () => {
  const button = $("#refreshBoundaries");
  button.disabled = true;
  button.textContent = "加载中";
  preloadBoundaryData(true).finally(() => {
    button.disabled = false;
    button.textContent = "重新加载边界";
    renderAll();
  });
  showToast("正在重新加载边界数据");
});
document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const pageId = link.getAttribute("href").replace("#", "");
    history.replaceState(null, "", `#${pageId}`);
    showPage(pageId);
  });
});
window.addEventListener("hashchange", () => {
  showPage(location.hash.replace("#", "") || "world");
});
document.querySelectorAll("[data-region-view]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-region-view]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.selectedRegionView = button.dataset.regionView;
    saveState();
    renderRegionMap();
    renderGeoMap();
  });
});
