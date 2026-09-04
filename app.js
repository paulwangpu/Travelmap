const visitDepths = [1, 2, 3, 4];
const depthLabels = {
  0: "未去",
  1: "去过",
};

const depthColors = {
  0: "#f2a58a",
  1: "#d9480f",
};

const storageKey = "travel-map-state-v1";
const languageStorageKey = "travel-map-language";
const mapControlsStorageKey = "travel-map-controls-collapsed";
const idbName = "travel-map-db";
const idbStore = "archives";
const idbStateKey = "state";
const appVersion = "2.0.2";
const worldCountryTotal = 195;
const china5aOfficialTotal = 359;
const chinaAncientCapitalTotal = 296;
const worldHeritageCatalogTotal = 1248;
const usNpsUnitTotal = 433;
const dataCacheVersion = "20260831-crmo-crmp-split1";
let importGuideUserToggled = false;
let syncingImportGuideOpenState = false;
const fixedChecklistTotals = {
  china5a: china5aOfficialTotal,
  chinaAncientCapitals: chinaAncientCapitalTotal,
  worldHeritage: worldHeritageCatalogTotal,
  usNationalParks: usNpsUnitTotal,
};
const maxImportVisiblePoints = Infinity;
const airportDataUrl = "data/airports.json";
const boundaryIndexUrl = "data/boundaries/index.json";
const boundarySources = {
  country: "data/boundaries/country/world.geojson",
  china: "data/china-provinces.geojson",
  us: "data/us-states.geojson",
  japan: "",
  admin1: "data/admin1.geojson",
  china2: "data/china-prefectures.geojson",
  chinaDirect: "data/china-direct-admin.geojson",
  tw2: "data/admin1-by-country/tw.geojson",
  us2: "data/us-counties.geojson",
  ru2: "data/russia-subregions.geojson",
};
const boundaryFallbackSources = {
  country: "data/countries.geojson",
  china: "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
  us: "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json",
  japan: "",
  admin1: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson",
  china2: "",
  chinaDirect: "",
  tw2: "",
  us2: "",
  ru2: "",
};
let leafletMap = null;
let leafletLayers = null;
let leafletBaseLayer = null;
let mapLibreMap = null;
let mapLibreMarkers = [];
let mapLibreMarkerSignature = "";
let mapPointRenderRevision = 0;
let mapLibreLayerHandlersBound = { country: false, admin: false, subadmin: false, points: false, paths: false, pathVertices: false, flights: false, nps: false };
let bingMapLibreProtocolRegistered = false;
let mapProviderDetectionPromise = null;
let leafletDidInitialFit = false;
let catalogDataRequested = false;
let catalogDataPromise = null;
let china5aCatalogPromise = null;
let china5aCoordinatesPromise = null;
let chinaAncientCapitalsPromise = null;
let usNpsCatalogPromise = null;
let usNpsBoundaryPromise = null;
let usNpsUnits = [];
let usNpsGroups = [];
let usNpsUnitById = new Map();
let usNpsUnitsByCode = new Map();
let usNpsUnitByMergeName = new Map();
let usNpsUnitByCanonicalPlace = new Map();
let usNpsBoundaries = null;
let legacyUsNationalParkItems = [];
let china5aCatalogStatus = { source: "本地清单", detail: `${china5aOfficialTotal} 个 5A 景区`, total: china5aOfficialTotal };
let china5aCoordinates = {};
let chinaAncientCapitals = {};
let chinaAncientCapitalCoordinates = {};
let chinaAncientCapitalMeta = {};
let worldHeritageCatalogStatus = { source: "本地清单", detail: `${worldHeritageCatalogTotal} 条记录`, total: worldHeritageCatalogTotal };
let worldHeritageCoordinates = {};
let worldHeritageEnglishNames = {};
let worldHeritageCountryIds = {};
let worldHeritageParentKeys = {};
let worldHeritageParentNames = {};
let boundaryData = { country: null, china: null, us: null, japan: null, admin1: null, china2: null, chinaDirect: null, tw2: null, us2: null, ru2: null };
let boundaryLoading = { country: false, china: false, us: false, japan: false, admin1: false, china2: false, chinaDirect: false, tw2: false, us2: false, ru2: false };
let boundaryPromises = {};
let boundaryIndex = null;
let boundaryIndexPromise = null;
let boundaryLayerData = { province: {}, city: {} };
let boundaryLayerPromises = { province: {}, city: {} };
let boundaryLayerFailures = { province: {}, city: {} };
let boundaryReferenceData = {};
let boundaryReferencePromises = {};
let boundaryReferenceFailures = {};
let admin1DisplayCache = { source: null, collection: null };
let mapDataVersion = 0;
const mapGeoJsonCache = new Map();
const mapLibreSourceDataRefs = new Map();
const preparedBboxCollections = new WeakSet();
let pendingUiStateSave = null;
let pendingFullStateSave = null;
let pendingGeoMapRender = null;
let pendingIndexedDbSave = null;
let pendingIndexedDbPayload = null;
let fullStateLoaded = false;
let pendingCheckinRender = null;
let pendingCoverageMapRefresh = null;
let pendingManualNavSpy = null;
let pendingChecklistNavSpy = null;
let restoringMapViewport = false;
let checklistStatusCache = { signature: "", marked: new Set(), visited: new Set() };
let checklistOverlayCache = { signature: "", items: [], keySet: new Set() };
let unifiedParkHeritageIndex = { signature: "", byEntity: new Map(), byEntry: new Map() };
let unifiedParkHeritageDoneCache = { signature: "", values: new Map() };
let checklistCoordinateLookupCache = { china5a: null, ancientCapitals: null, highAltitude: null, worldHeritage: null, englishNames: null, map: new Map() };
let derivedStatsRevision = 0;
let dashboardStatsCache = { signature: "", stats: null };
let mapAddMode = false;
let mapPathMode = false;
let editingMapPathId = null;
let pendingMapClickPoint = null;
let pendingMapPath = [];
let mapPathEditTool = "append";
let movingMapPathVertexIndex = null;
const selectedMapPathVertexIndices = new Set();
let mapPathSimplifyLevel = 0;
let mapPathUndoStack = [];
let mapPathRedoStack = [];
let mapPathBoxSelection = null;
let mapPathBoxSelectionBound = false;
let mapControlsCollapsed = localStorage.getItem(mapControlsStorageKey) === "1";
let importManagerQuery = "";
let importManagerSort = "newest";
let manualCheckinPage = 0;
let manualPathPage = 0;
const importManagerPageSize = 20;
let importManagerSearchTimer = null;
const selectedManualCheckinIds = new Set();
const selectedManualPathIds = new Set();
let highAltitudeFilters = { threeMountains: true, fiveMountains: true, buddhistMountains: true, taoistMountains: true, other: true };
const manualAirportCatalog = [
  ["北京首都", "PEK", "北京", "cn", 40.0799, 116.6031, ["北京首都国际"]],
  ["北京大兴", "PKX", "北京", "cn", 39.5098, 116.4105, ["北京大兴国际"]],
  ["上海浦东", "PVG", "上海", "cn", 31.1443, 121.8083, ["上海浦东国际"]],
  ["上海虹桥", "SHA", "上海", "cn", 31.1979, 121.3363, ["上海虹桥国际"]],
  ["深圳宝安", "SZX", "深圳", "cn", 22.6393, 113.8107, ["深圳宝安国际"]],
  ["广州白云", "CAN", "广州", "cn", 23.3924, 113.2988, ["广州白云国际"]],
  ["南京禄口", "NKG", "南京", "cn", 31.742, 118.862, ["南京禄口国际"]],
  ["杭州萧山", "HGH", "杭州", "cn", 30.2295, 120.4345, ["杭州萧山国际"]],
  ["厦门高崎", "XMN", "厦门", "cn", 24.544, 118.127, ["厦门高崎国际"]],
  ["福州长乐", "FOC", "福州", "cn", 25.9351, 119.6633, ["福州长乐国际"]],
  ["南昌昌北", "KHN", "南昌", "cn", 28.8648, 115.9, ["南昌昌北国际"]],
  ["武汉天河", "WUH", "武汉", "cn", 30.7838, 114.2081, ["武汉天河国际"]],
  ["长沙黄花", "CSX", "长沙", "cn", 28.1892, 113.2196, ["长沙黄花国际"]],
  ["合肥新桥", "HFE", "合肥", "cn", 31.9878, 116.9769, ["合肥新桥国际"]],
  ["郑州新郑", "CGO", "郑州", "cn", 34.5197, 113.8409, ["郑州新郑国际"]],
  ["西安咸阳", "XIY", "西安", "cn", 34.4471, 108.7516, ["西安咸阳国际"]],
  ["太原武宿", "TYN", "太原", "cn", 37.7469, 112.6284, ["太原武宿国际"]],
  ["成都双流", "CTU", "成都", "cn", 30.5785, 103.9471, ["成都双流国际"]],
  ["成都天府", "TFU", "成都", "cn", 30.3125, 104.4414, ["成都天府国际"]],
  ["重庆江北", "CKG", "重庆", "cn", 29.7192, 106.6417, ["重庆江北国际"]],
  ["昆明长水", "KMG", "昆明", "cn", 25.1019, 102.9292, ["昆明长水国际"]],
  ["贵阳龙洞堡", "KWE", "贵阳", "cn", 26.5385, 106.8007, ["贵阳龙洞堡国际"]],
  ["南宁吴圩", "NNG", "南宁", "cn", 22.6083, 108.1725, ["南宁吴圩国际"]],
  ["桂林两江", "KWL", "桂林", "cn", 25.2181, 110.0392, ["桂林两江国际"]],
  ["海口美兰", "HAK", "海口", "cn", 19.9349, 110.4589, ["海口美兰国际"]],
  ["三亚凤凰", "SYX", "三亚", "cn", 18.3029, 109.4123, ["三亚凤凰国际"]],
  ["北京南苑", "NAY", "北京", "cn", 39.7825, 116.3878, ["北京南苑机场"]],
  ["珠海金湾", "ZUH", "珠海", "cn", 22.0064, 113.376, ["珠海金湾机场"]],
  ["湛江吴川", "ZHA", "湛江", "cn", 21.2144, 110.358, ["湛江吴川机场", "湛江"]],
  ["喀什徕宁", "KHG", "喀什", "cn", 39.5429, 76.0199, ["喀什机场"]],
  ["拉萨贡嘎", "LXA", "拉萨", "cn", 29.2978, 90.9119, ["拉萨贡嘎国际"]],
  ["西宁曹家堡", "XNN", "西宁", "cn", 36.5275, 102.043, ["西宁曹家堡国际"]],
  ["银川河东", "INC", "银川", "cn", 38.3228, 106.393, ["银川河东国际"]],
  ["哈尔滨太平", "HRB", "哈尔滨", "cn", 45.6234, 126.2503, ["哈尔滨太平国际"]],
  ["大庆萨尔图", "DQA", "大庆", "cn", 46.7464, 125.1406, ["大庆萨尔图机场"]],
  ["东营胜利", "DOY", "东营", "cn", 37.5086, 118.788, ["东营胜利机场"]],
  ["南阳姜营", "NNY", "南阳", "cn", 32.9808, 112.615, ["南阳姜营机场"]],
  ["扬州泰州", "YTY", "扬州", "cn", 32.5634, 119.7198, ["扬州泰州国际"]],
  ["无锡硕放", "WUX", "无锡", "cn", 31.4944, 120.429, ["苏南硕放", "无锡硕放国际"]],
  ["南通兴东", "NTG", "南通", "cn", 32.0708, 120.9756, ["南通兴东国际"]],
  ["宜昌三峡", "YIH", "宜昌", "cn", 30.5566, 111.4799, ["宜昌三峡机场"]],
  ["白山长白山", "NBS", "白山", "cn", 42.0669, 127.602, ["长白山机场"]],
  ["张家界荷花", "DYG", "张家界", "cn", 29.1028, 110.443, ["张家界荷花国际"]],
  ["大连周水子", "DLC", "大连", "cn", 38.9657, 121.5386, ["大连", "大连周水子国际"]],
  ["敦煌莫高", "DNH", "敦煌", "cn", 40.1611, 94.8092, ["敦煌", "敦煌莫高国际"]],
  ["乌鲁木齐地窝堡", "URC", "乌鲁木齐", "cn", 43.9071, 87.4742, ["乌鲁木齐", "乌鲁木齐地窝堡国际"]],
  ["丽江三义", "LJG", "丽江", "cn", 26.68, 100.246, ["丽江", "丽江三义国际"]],
  ["西双版纳嘎洒", "JHG", "西双版纳", "cn", 21.9739, 100.7596, ["西双版纳", "景洪", "西双版纳嘎洒国际"]],
  ["牡丹江海浪", "MDG", "牡丹江", "cn", 44.5241, 129.5689, ["牡丹江", "牡丹江海浪国际"]],
  ["青岛胶东", "TAO", "青岛", "cn", 36.3619, 120.088, ["青岛胶东国际"]],
  ["中国澳门", "MFM", "澳门", "cn", 22.1496, 113.5916, ["澳门国际", "澳门"]],
  ["香港国际", "HKG", "香港", "cn", 22.308, 113.9185, ["香港"]],
  ["东京成田", "NRT", "东京", "jp", 35.772, 140.3929, ["东京成田国际", "成田"]],
  ["首尔仁川", "ICN", "首尔", "kr", 37.4602, 126.4407, ["仁川国际", "首尔仁川国际"]],
  ["新加坡樟宜", "SIN", "新加坡", "sg", 1.3644, 103.9915, ["新加坡"]],
  ["吉隆坡国际", "KUL", "吉隆坡", "my", 2.7456, 101.7072, ["吉隆坡"]],
  ["巴厘岛努拉莱伊", "DPS", "巴厘岛", "id", -8.7482, 115.167, ["巴厘岛", "登巴萨"]],
  ["日惹国际", "YIA", "日惹", "id", -7.9053, 110.0573, ["日惹"]],
  ["曼谷素万那普", "BKK", "曼谷", "th", 13.69, 100.7501, ["曼谷"]],
  ["曼谷廊曼", "DMK", "曼谷", "th", 13.9126, 100.6068, ["廊曼国际"]],
  ["清迈国际", "CNX", "清迈", "th", 18.7668, 98.9626, ["清迈"]],
  ["河内内排国际", "HAN", "河内", "vn", 21.2187, 105.8042, ["河内内排", "河内"]],
  ["胡志明市新山一国际", "SGN", "胡志明市", "vn", 10.8188, 106.652, ["胡志明市新山一", "胡志明市"]],
  ["岘港国际", "DAD", "岘港", "vn", 16.0439, 108.1994, ["岘港"]],
  ["金兰国际", "CXR", "芽庄", "vn", 11.9982, 109.2194, ["金兰", "芽庄"]],
  ["大叻莲姜", "DLI", "大叻", "vn", 11.75, 108.3736, ["莲姜"]],
  ["槟城国际", "PEN", "槟城", "my", 5.2971, 100.2769, ["槟城"]],
  ["暹粒国际", "SAI", "暹粒", "kh", 13.3692, 104.223, ["暹粒"]],
  ["特里布万国际", "KTM", "加德满都", "np", 27.6966, 85.3591, ["加德满都"]],
  ["博卡拉", "PKR", "博卡拉", "np", 28.2009, 83.9821, ["博卡拉机场"]],
  ["旧金山国际", "SFO", "旧金山", "us", 37.6213, -122.379, ["旧金山"]],
  ["休斯敦乔治布什洲际", "IAH", "休斯敦", "us", 29.9902, -95.3368, ["休斯敦布什", "休斯敦"]],
  ["洛杉矶国际", "LAX", "洛杉矶", "us", 33.9416, -118.4085, ["洛杉矶"]],
  ["凤凰城天港国际", "PHX", "凤凰城", "us", 33.4352, -112.0101, ["凤凰城"]],
  ["弗雷斯诺优胜美地国际", "FAT", "弗雷斯诺", "us", 36.7762, -119.7181, ["弗雷斯诺"]],
  ["查尔斯顿国际", "CHS", "查尔斯顿", "us", 32.8986, -80.0405, ["查尔斯顿"]],
  ["奥兰多国际", "MCO", "奥兰多", "us", 28.4312, -81.3081, ["奥兰多"]],
  ["丹佛国际", "DEN", "丹佛", "us", 39.8561, -104.6737, ["丹佛"]],
  ["劳德代尔国际", "FLL", "劳德代尔堡", "us", 26.0742, -80.1506, ["劳德代尔堡"]],
  ["基韦斯特国际", "EYW", "基韦斯特", "us", 24.5561, -81.7596, ["基韦斯特"]],
  ["巴尔的摩", "BWI", "巴尔的摩", "us", 39.1754, -76.6684, ["巴尔的摩华盛顿国际"]],
  ["拉皮德城", "RAP", "拉皮德城", "us", 44.0453, -103.0574, ["拉皮德城地区"]],
  ["杰克逊霍勒", "JAC", "杰克逊", "us", 43.6073, -110.7377, ["杰克逊霍尔"]],
  ["波士顿洛干国际", "BOS", "波士顿", "us", 42.3656, -71.0096, ["波士顿洛根", "波士顿"]],
  ["纽约纽瓦克国际", "EWR", "纽约", "us", 40.6895, -74.1745, ["纽瓦克国际", "纽约纽瓦克"]],
  ["纽约肯尼迪国际", "JFK", "纽约", "us", 40.6413, -73.7781, ["纽约肯尼迪"]],
  ["芝加哥奥黑尔", "ORD", "芝加哥", "us", 41.9742, -87.9073, ["芝加哥奥黑尔国际"]],
  ["华盛顿杜勒斯国际", "IAD", "华盛顿", "us", 38.9531, -77.4565, ["华盛顿杜勒斯"]],
  ["西雅图塔科马", "SEA", "西雅图", "us", 47.4502, -122.3088, ["西雅图"]],
  ["拉斯维加斯", "LAS", "拉斯维加斯", "us", 36.084, -115.1537, ["拉斯维加斯哈里里德", "哈里里德国际"]],
  ["圣地亚哥国际", "SAN", "圣地亚哥", "us", 32.7338, -117.1933, ["圣地亚哥"]],
  ["维也纳国际", "VIE", "维也纳", "at", 48.1103, 16.5697, ["维也纳"]],
  ["哥本哈根", "CPH", "哥本哈根", "dk", 55.618, 12.6561, ["哥本哈根凯斯楚普"]],
  ["斯德哥尔摩阿兰达", "ARN", "斯德哥尔摩", "se", 59.6498, 17.9238, ["斯德哥尔摩"]],
  ["阿姆斯特丹史基浦", "AMS", "阿姆斯特丹", "nl", 52.3105, 4.7683, ["阿姆斯特丹"]],
  ["雅典国际", "ATH", "雅典", "gr", 37.9364, 23.9475, ["雅典"]],
  ["大阪关西", "KIX", "大阪", "jp", 34.4347, 135.2441, ["关西国际"]],
  ["卡萨布兰卡", "CMN", "卡萨布兰卡", "ma", 33.3675, -7.59, ["卡萨布兰卡穆罕默德五世"]],
  ["马拉喀什", "RAK", "马拉喀什", "ma", 31.6069, -8.0363, ["马拉喀什梅纳拉"]],
  ["马德里巴拉哈斯", "MAD", "马德里", "es", 40.4983, -3.5676, ["马德里"]],
  ["巴塞罗那埃尔普拉特", "BCN", "巴塞罗那", "es", 41.2974, 2.0833, ["巴塞罗那"]],
  ["毕尔巴鄂", "BIO", "毕尔巴鄂", "es", 43.3011, -2.9106, ["毕尔巴鄂机场"]],
  ["法兰克福", "FRA", "法兰克福", "de", 50.0379, 8.5622, ["法兰克福国际"]],
  ["米兰利纳特", "LIN", "米兰", "it", 45.4451, 9.2767, ["米兰利纳特机场"]],
  ["罗马菲乌米奇诺", "FCO", "罗马", "it", 41.8003, 12.2389, ["罗马菲乌米奇诺机场"]],
  ["那不勒斯", "NAP", "那不勒斯", "it", 40.886, 14.2908, ["那不勒斯国际"]],
  ["伊斯坦布尔", "IST", "伊斯坦布尔", "tr", 41.2753, 28.7519, ["伊斯坦布尔机场"]],
  ["莫斯科谢列梅捷沃", "SVO", "莫斯科", "ru", 55.9726, 37.4146, ["莫斯科"]],
  ["伦敦希思罗", "LHR", "伦敦", "gb", 51.47, -0.4543, ["希思罗"]],
  ["巴黎戴高乐", "CDG", "巴黎", "fr", 49.0097, 2.5479, ["巴黎"]],
];
let airportCatalog = [...manualAirportCatalog];
let airportDataPromise = null;
let airportDataLoaded = false;
let airportLookupCache = null;
const admin1RegionGroupCountries = new Set(["fr", "it", "jp"]);
const subadminConfigs = {
  china2: { countryId: "cn", label: "China prefecture-level units" },
  japanPref: { countryId: "jp", label: "Japan prefectures" },
};

const translations = {
  zh: {
    appName: "拓界足迹",
    appSubtitle: "个人地理数据库",
    navMap: "地图",
    navDashboard: "总览",
    navLight: "点亮",
    navChecklist: "打卡",
    navImport: "导入",
    privacyEyebrow: "隐私",
    privacyTitle: "本地保存",
    privacyText: "数据只保存在本机浏览器里，不会自动上传或公开。如需备份请导出。",
    mapEyebrow: "开源底图 + MapLibre + 本地边界",
    mapTitle: "我的全球旅行地图",
    fieldPlace: "地点",
    fieldStatus: "状态",
    fieldDate: "日期",
    visited: "去过",
    lightUp: "点亮",
    mapProvider: "底图",
    providerAuto: "自动底图",
    providerOsm: "OpenStreetMap",
    providerGaode: "高德",
    providerGaodeSatellite: "高德卫星",
    providerGoogle: "Google 街道",
    providerGoogleSatellite: "Google 卫星",
    providerGoogleTerrain: "Google 地形",
    providerEsriSatellite: "Esri 卫星",
    providerBingRoad: "Bing 地图",
    providerBingAerial: "Bing 卫星",
    mapLevel: "显示层级",
    levelCountry: "国家",
    levelAdmin: "省级",
    levelCity: "市级",
    overlayLight: "我的点亮",
    overlayCheckins: "我的打卡",
    overlayTracks: "我的轨迹",
    overlayFlights: "我的航线",
    overlay3d: "3D",
    overlay5a: "5A / 国家公园",
    overlayAncientCapitals: "中国古都",
    overlayHeritage: "世界遗产",
    overlayHighAltitude: "高海拔挑战",
    hideMapControls: "收起",
    showMapControls: "地图设置",
    selectionEyebrow: "选择对象",
    mapDetailTitle: "地图详情",
    mapDetailHelp: "点击地图上的点、国家或行政区查看证据。",
    dashboardEyebrow: "总览",
    dashboardTitle: "旅行统计总览",
    nextEyebrow: "下一步",
    nextTitle: "下一步打卡导航",
    manualEyebrow: "手动点亮",
    manualTitle: "手动点亮",
    chinaAdmin1: "中国一级行政区",
    chinaProvince: "中国省级",
    chinaAdmin2: "中国二级行政区",
    chinaCity: "中国地级市",
    japanAdmin1: "日本一级地理区",
    japanRegion: "日本大区",
    japanAdmin2: "日本二级地理区",
    japanPrefecture: "日本都道府县",
    usStatesPlate: "美国 50 州",
    countriesEyebrow: "国家地区",
    countriesTitle: "国家/地区",
    importEyebrow: "导入",
    importTitle: "导入地图或地点文件",
    chooseFile: "选择文件",
    importGuideTitle: "导入说明",
    importGuideSummary: "查看导入说明",
    importHelpCheckinsTitle: "打卡与轨迹导入",
    importHelpCheckinsIntro: "支持导入 GeoJSON/JSON、KML、CSV 和照片。",
    importHelpGeoJson: "GeoJSON/KML：点数据将作为“我的打卡”显示；线和面数据将作为“我的轨迹”显示。",
    importHelpCsv: "CSV：建议仅保留名称、纬度和经度三列。也支持英文列名：name、lat/latitude、lng/lon/longitude。",
    importHelpPhoto: "照片：仅在本地读取文件名和 EXIF GPS 信息，不会上传照片。",
    importHelpFlightsTitle: "航线导入",
    importHelpFlightsIntro: "支持直接导入航旅纵横通过“导出航班行程（Pro 专享）”生成的 Excel（.xls）文件。",
    importHelpFlightsLayer: "系统会自动提取航班信息，并在独立的“我的航线”图层中绘制航线，但不会自动点亮途经城市或国家。",
    importHelpFlightEndpoints: "航班起降地可以填写城市名称、机场名称或 IATA 机场代码；系统将使用本地全球机场数据库进行匹配。",
    importHelpLimitTitle: "导入数量",
    importHelpLimitText: "目前不限制导入点数。但数据量过大可能影响浏览器渲染性能，建议只导入确实需要展示的数据。",
    archiveEyebrow: "存档",
    archiveTitle: "数据存档",
    exportArchive: "导出存档",
    clearAllData: "清空全部数据",
    importArchive: "导入存档",
    archiveHelp: "点亮地点、导入对象、打卡勾选和展开状态都会保存到存档文件。恢复存档会覆盖当前浏览器里的旅行数据。",
    dataEyebrow: "数据检查",
    dataTitle: "数据检查",
    checklistEyebrow: "打卡清单",
    checklistTitle: "打卡",
    checklistFallback: "打卡清单",
    coreCheckins: "核心打卡等级",
    viewChecklist: "查看清单",
    coreCheckinsEyebrow: "核心打卡",
    totalCheckins: "总打卡地点",
    importedPoints: "已导入地点",
    importedTracks: "已导入轨迹",
    importedFlights: "已导入航班",
    trackLength: "轨迹长度",
    checked: "已去",
    unvisited: "未去",
    markVisited: "标记去过",
    unvisit: "取消去过",
    countryDetail: "国家详情",
    adminRegion: "行政区",
    status: "状态",
    evidence: "证据",
    countryRegion: "国家/地区",
    region: "地区",
    worldHeritage: "世界遗产",
    noVisitList: "未去清单",
    lit: "已点亮",
    noPlaceEvidence: "暂无地点证据",
    mapPoint: "地图点",
    coordinates: "坐标",
    none: "无",
    unassigned: "未分区",
    markedToast: "已标记为去过",
    unmarkedToast: "已取消去过",
    addMapPoint: "添加打卡点",
    addMapPointCompact: "添加打卡",
    addingMapPoint: "点击地图空白处添加打卡点",
    addMapPath: "添加路径",
    addMapPathCompact: "添加路径",
    addingMapPath: "依次点击地图添加路径节点",
    mapPathName: "路径名称",
    mapPathHint: "继续点击地图添加节点（至少 2 个）",
    mapPathPoints: "节点数",
    saveMapPath: "保存路径",
    cancelMapPath: "取消",
    mapPathAdded: "路径已添加",
    editMapPath: "编辑路径",
    editingMapPath: "编辑已有路径",
    mapPathUpdated: "路径已更新",
    appendMapPathPoints: "追加节点",
    insertMapPathPoint: "插入节点",
    selectMapPathPoints: "选择节点",
    moveMapPathPoint: "移动节点",
    simplifyMapPath: "简化路径",
    deleteSelectedMapPathPoints: "删除所选节点",
    deleteMapPath: "删除路径",
    selectedMapPathPoints: "已选择",
    moveMapPathHint: "先点击一个节点，再点击地图上的新位置",
    selectMapPathHint: "拖动矩形框选节点；Shift/Ctrl 可追加选择",
    mapPathSimplified: "路径已简化",
    mapPathPointMoved: "节点已移动",
    mapPathPointInserted: "节点已插入",
    undoMapPathEdit: "撤销",
    redoMapPathEdit: "重新应用",
    mapPointName: "打卡点名称",
    saveMapPoint: "保存打卡点",
    cancelMapPoint: "取消",
    mapPointAdded: "打卡点已添加",
    mapClickPoint: "地图打卡点",
    detectedArea: "自动识别区域",
  },
  en: {
    appName: "Tuojie Footprints",
    appSubtitle: "Personal geographic database",
    navMap: "Map",
    navDashboard: "Dashboard",
    navLight: "Light Up",
    navChecklist: "Check-ins",
    navImport: "Import",
    privacyEyebrow: "Privacy",
    privacyTitle: "Saved locally",
    privacyText: "Your data stays in this browser. It is not uploaded or published automatically. Export when you need a backup.",
    mapEyebrow: "Open basemap + MapLibre + local boundaries",
    mapTitle: "Tuojie Footprints",
    fieldPlace: "Place",
    fieldStatus: "Status",
    fieldDate: "Date",
    visited: "Visited",
    lightUp: "Light up",
    mapProvider: "Basemap",
    providerAuto: "Auto map",
    providerOsm: "OpenStreetMap",
    providerGaode: "Gaode",
    providerGaodeSatellite: "Gaode Satellite",
    providerGoogle: "Google Road",
    providerGoogleSatellite: "Google Satellite",
    providerGoogleTerrain: "Google Terrain",
    providerEsriSatellite: "Esri Satellite",
    providerBingRoad: "Bing Road",
    providerBingAerial: "Bing Aerial",
    mapLevel: "Boundary level",
    levelCountry: "Country level",
    levelAdmin: "Province / State",
    levelCity: "City level",
    overlayLight: "My lit areas",
    overlayCheckins: "My check-ins",
    overlayTracks: "My tracks",
    overlayFlights: "My flights",
    overlay3d: "3D",
    overlay5a: "5A / National Parks",
    overlayAncientCapitals: "Ancient Chinese Capitals",
    overlayHeritage: "World Heritage",
    overlayHighAltitude: "High-altitude challenge",
    hideMapControls: "Collapse",
    showMapControls: "Map controls",
    selectionEyebrow: "Selection",
    mapDetailTitle: "Map details",
    mapDetailHelp: "Click a place, country, or administrative unit on the map to view evidence.",
    dashboardEyebrow: "Dashboard",
    dashboardTitle: "Travel overview",
    nextEyebrow: "Next",
    nextTitle: "Next check-in shortcuts",
    manualEyebrow: "Manual check-in",
    manualTitle: "Manual light-up",
    chinaAdmin1: "China Admin 1",
    chinaProvince: "China province level",
    chinaAdmin2: "China Admin 2",
    chinaCity: "China prefecture level",
    japanAdmin1: "Japan Admin 1",
    japanRegion: "Japan regions",
    japanAdmin2: "Japan Admin 2",
    japanPrefecture: "Japan prefectures",
    usStatesPlate: "U.S. 50 states",
    countriesEyebrow: "Countries",
    countriesTitle: "Countries / Regions",
    importEyebrow: "Import",
    importTitle: "Import map or place files",
    chooseFile: "Choose file",
    importGuideTitle: "Import Guide",
    importGuideSummary: "View import guide",
    importHelpCheckinsTitle: "Check-in and Track Import",
    importHelpCheckinsIntro: "Import GeoJSON/JSON, KML, CSV, and photos.",
    importHelpGeoJson: "GeoJSON/KML: point data appears in My check-ins; lines and polygons appear in My tracks.",
    importHelpCsv: "CSV: use only name, latitude, and longitude when possible. English headers are also supported: name, lat/latitude, lng/lon/longitude.",
    importHelpPhoto: "Photos: only local filenames and EXIF GPS metadata are read. Photos are not uploaded.",
    importHelpFlightsTitle: "Flight Route Import",
    importHelpFlightsIntro: "Import Excel (.xls) files generated by TravelSky/CAPA's “Export flight itinerary (Pro)” feature.",
    importHelpFlightsLayer: "The app extracts flights and draws them in the separate My flights layer, but it does not automatically light up transit cities or countries.",
    importHelpFlightEndpoints: "Flight endpoints can be city names, airport names, or IATA airport codes. They are matched with the local global airport database.",
    importHelpLimitTitle: "Import Size",
    importHelpLimitText: "There is currently no hard point limit. Very large datasets can slow browser rendering, so import only the data you actually need to display.",
    archiveEyebrow: "Archive",
    archiveTitle: "Data archive",
    exportArchive: "Export archive",
    clearAllData: "Clear all data",
    importArchive: "Import archive",
    archiveHelp: "Check-ins, imported objects, checklist marks, and expanded groups are saved in the archive. Restoring an archive replaces current browser data.",
    dataEyebrow: "Data inspector",
    dataTitle: "Data inspector",
    checklistEyebrow: "Checklists",
    checklistTitle: "Check-ins",
    checklistFallback: "Checklist",
    coreCheckins: "Core check-in levels",
    viewChecklist: "View checklists",
    coreCheckinsEyebrow: "Core check-ins",
    totalCheckins: "Total check-ins",
    importedPoints: "Imported places",
    importedTracks: "Imported tracks",
    importedFlights: "Imported flights",
    trackLength: "Track length",
    checked: "Visited",
    unvisited: "Unvisited",
    markVisited: "Mark visited",
    unvisit: "Unvisit",
    countryDetail: "Country detail",
    adminRegion: "Administrative region",
    status: "Status",
    evidence: "Evidence",
    countryRegion: "Country / Region",
    region: "Region",
    worldHeritage: "World Heritage",
    noVisitList: "Not visited",
    lit: "Visited",
    noPlaceEvidence: "No place evidence",
    mapPoint: "Map point",
    coordinates: "Coordinates",
    none: "None",
    unassigned: "Unassigned",
    markedToast: "marked visited",
    unmarkedToast: "unmarked",
    addMapPoint: "Add Check-in Point",
    addMapPointCompact: "Add check-in",
    addingMapPoint: "Click an empty spot on the map to add a check-in point",
    addMapPath: "Add Path",
    addMapPathCompact: "Add path",
    addingMapPath: "Click the map to add path vertices in order",
    mapPathName: "Path name",
    mapPathHint: "Keep clicking the map to add vertices (at least 2)",
    mapPathPoints: "Vertices",
    saveMapPath: "Save path",
    cancelMapPath: "Cancel",
    mapPathAdded: "Path added",
    editMapPath: "Edit path",
    editingMapPath: "Edit existing path",
    mapPathUpdated: "Path updated",
    appendMapPathPoints: "Add vertices",
    insertMapPathPoint: "Insert vertex",
    selectMapPathPoints: "Select vertices",
    moveMapPathPoint: "Move vertex",
    simplifyMapPath: "Simplify path",
    deleteSelectedMapPathPoints: "Delete selected",
    deleteMapPath: "Delete path",
    selectedMapPathPoints: "Selected",
    moveMapPathHint: "Select a vertex, then click its new map position",
    selectMapPathHint: "Drag a rectangle around vertices; hold Shift/Ctrl to add",
    mapPathSimplified: "Path simplified",
    mapPathPointMoved: "Vertex moved",
    mapPathPointInserted: "Vertex inserted",
    undoMapPathEdit: "Undo",
    redoMapPathEdit: "Redo",
    mapPointName: "Check-in point name",
    saveMapPoint: "Save point",
    cancelMapPoint: "Cancel",
    mapPointAdded: "Check-in point added",
    mapClickPoint: "Map check-in point",
    detectedArea: "Detected area",
  },
};

let currentLanguage = localStorage.getItem(languageStorageKey) || "zh";

function t(key) {
  return translations[currentLanguage]?.[key] || translations.zh[key] || key;
}

function defaultMapOverlays() {
  return { light: true, checkins: true, paths: true, flights: true, china5a: false, chinaAncientCapitals: false, worldHeritage: false, highAltitude: false };
}

function normalizeMapOverlays(overlays = {}) {
  return {
    ...defaultMapOverlays(),
    ...overlays,
    china5a: Boolean(overlays.china5a),
    chinaAncientCapitals: Boolean(overlays.chinaAncientCapitals),
    worldHeritage: Boolean(overlays.worldHeritage),
    highAltitude: Boolean(overlays.highAltitude),
  };
}

function isLightOverlayEnabled() {
  return Boolean(({ ...defaultMapOverlays(), ...(state.mapOverlays || {}) }).light);
}

function normalizeAirportName(value = "") {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[（）()·,，。]/g, "")
    .replace(/机场$/g, "")
    .replace(/国际机场$/g, "国际")
    .trim();
}

function airportLookup() {
  if (airportLookupCache) return airportLookupCache;
  airportLookupCache = new Map();
  airportCatalog.forEach(([name, iata, city, country, lat, lng, aliases = []]) => {
    const airport = { name, iata, city, country, lat, lng, aliases };
    const setLookup = (key, value = airport, overwrite = true) => {
      if (!key) return;
      const normalized = normalizeAirportName(key);
      if (overwrite || !airportLookupCache.has(normalized)) airportLookupCache.set(normalized, value);
      const upper = String(key).toUpperCase();
      if (overwrite || !airportLookupCache.has(upper)) airportLookupCache.set(upper, value);
    };
    setLookup(city, airport, false);
    setLookup(name);
    setLookup(iata);
    aliases.filter(Boolean).forEach((alias) => setLookup(alias, airport, false));
  });
  return airportLookupCache;
}

function normalizeAirportCatalogEntry(entry) {
  if (!Array.isArray(entry)) return null;
  const [name, iata, city, country, lat, lng, aliases = []] = entry;
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!name || !iata || !country || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return [
    String(name).trim(),
    String(iata).trim().toUpperCase(),
    String(city || name).trim(),
    String(country).trim().toLowerCase(),
    latitude,
    longitude,
    Array.isArray(aliases) ? aliases.map((alias) => String(alias || "").trim()).filter(Boolean) : [],
  ];
}

function loadAirportData() {
  if (airportDataLoaded) return Promise.resolve(airportCatalog);
  if (airportDataPromise) return airportDataPromise;
  airportDataPromise = fetch(`${airportDataUrl}?v=${dataCacheVersion}`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((records) => {
      const generated = (Array.isArray(records) ? records : []).map(normalizeAirportCatalogEntry).filter(Boolean);
      const byIata = new Map();
      [...manualAirportCatalog, ...generated].forEach((entry) => {
        const key = String(entry[1] || "").toUpperCase();
        if (!key) return;
        if (!byIata.has(key)) {
          byIata.set(key, [...entry.slice(0, 6), [...(entry[6] || [])]]);
          return;
        }
        const existing = byIata.get(key);
        existing[6] = Array.from(new Set([
          ...(existing[6] || []),
          entry[0],
          entry[2],
          ...(entry[6] || []),
        ].filter(Boolean)));
      });
      airportCatalog = Array.from(byIata.values());
      airportLookupCache = null;
      airportDataLoaded = true;
      return airportCatalog;
    })
    .catch((error) => {
      console.warn("机场数据加载失败，使用内置机场字典", error);
      airportCatalog = [...manualAirportCatalog];
      airportLookupCache = null;
      airportDataLoaded = true;
      return airportCatalog;
    });
  return airportDataPromise;
}

function findAirport(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const lookup = airportLookup();
  return lookup.get(normalizeAirportName(raw)) || lookup.get(raw.toUpperCase()) || null;
}

function sanitizeFlights(flights = []) {
  return (Array.isArray(flights) ? flights : [])
    .map((flight) => normalizeFlightRecord(flight))
    .filter((flight) => flight.key);
}

function normalizeFlightRecord(raw = {}) {
  const flight = {
    key: String(raw.key || "").trim(),
    date: String(raw.date || "").trim(),
    airline: String(raw.airline || "").trim(),
    flightNo: String(raw.flightNo || "").trim().toUpperCase(),
    fromAirport: String(raw.fromAirport || "").trim(),
    fromTime: normalizeFlightTime(raw.fromTime),
    toAirport: String(raw.toAirport || "").trim(),
    toTime: normalizeFlightTime(raw.toTime),
    distanceKm: Number(raw.distanceKm) || 0,
    ticketNo: String(raw.ticketNo || "").trim(),
    ticketStatus: String(raw.ticketStatus || "").trim(),
    sourceFile: String(raw.sourceFile || "").trim(),
    importId: String(raw.importId || "").trim(),
    importedAt: String(raw.importedAt || "").trim(),
  };
  flight.key ||= flightDedupKey(flight);
  const from = findAirport(flight.fromAirport);
  const to = findAirport(flight.toAirport);
  flight.fromIata = raw.fromIata || from?.iata || "";
  flight.toIata = raw.toIata || to?.iata || "";
  return flight;
}

function flightDedupKey(flight) {
  const parts = [
    flight.date,
    flight.flightNo,
    normalizeAirportName(flight.fromAirport),
    flight.fromTime,
    normalizeAirportName(flight.toAirport),
    flight.toTime,
  ];
  if (flight.ticketNo && flight.ticketNo !== "--") parts.push(flight.ticketNo);
  return slugify(parts.join("-"));
}

function flightRouteKey(flight) {
  const from = findAirport(flight.fromAirport);
  const to = findAirport(flight.toAirport);
  if (!from || !to) return "";
  return [flightRouteEndpointKey(from), flightRouteEndpointKey(to)].sort().join("-");
}

function flightRouteEndpointKey(airport) {
  return `${airport.country}:${airport.city || airport.name}`;
}

function flightRouteEndpointName(airport) {
  return airport.city || airport.name;
}

function flightRouteWidth(count) {
  if (count >= 30) return 8.5;
  if (count >= 15) return 6.8;
  if (count >= 8) return 5.2;
  if (count >= 4) return 3.6;
  if (count >= 2) return 2.3;
  return 1.35;
}

function flightRouteOpacity(count) {
  if (count >= 30) return 0.9;
  if (count >= 15) return 0.84;
  if (count >= 8) return 0.78;
  if (count >= 4) return 0.7;
  if (count >= 2) return 0.62;
  return 0.52;
}

function greatCircleLine(from, to, steps = 96) {
  const toRad = (value) => (value * Math.PI) / 180;
  const toDeg = (value) => (value * 180) / Math.PI;
  const lat1 = toRad(from.lat);
  const lon1 = toRad(from.lng);
  const lat2 = toRad(to.lat);
  const lon2 = toRad(to.lng);
  const delta = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
  ));
  if (!Number.isFinite(delta) || delta === 0) return [[from.lng, from.lat], [to.lng, to.lat]];
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const fraction = index / steps;
    const a = Math.sin((1 - fraction) * delta) / Math.sin(delta);
    const b = Math.sin(fraction * delta) / Math.sin(delta);
    const x = a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);
    const y = a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);
    const z = a * Math.sin(lat1) + b * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);
    points.push([toDeg(lon), toDeg(lat)]);
  }
  return points;
}

function splitAntimeridian(points) {
  const lines = [];
  let current = [];
  points.forEach((point) => {
    if (current.length) {
      const previous = current[current.length - 1];
      if (Math.abs(point[0] - previous[0]) > 180) {
        if (previous[0] > 0 && point[0] < 0) {
          const adjustedLng = point[0] + 360;
          const ratio = (180 - previous[0]) / (adjustedLng - previous[0]);
          const lat = previous[1] + ratio * (point[1] - previous[1]);
          current.push([180, lat]);
          if (current.length > 1) lines.push(current);
          current = [[-180, lat]];
        } else if (previous[0] < 0 && point[0] > 0) {
          const adjustedLng = point[0] - 360;
          const ratio = (-180 - previous[0]) / (adjustedLng - previous[0]);
          const lat = previous[1] + ratio * (point[1] - previous[1]);
          current.push([-180, lat]);
          if (current.length > 1) lines.push(current);
          current = [[180, lat]];
        } else {
          if (current.length > 1) lines.push(current);
          current = [];
        }
      }
    }
    current.push(point);
  });
  if (current.length > 1) lines.push(current);
  return lines.length > 1 ? { type: "MultiLineString", coordinates: lines } : { type: "LineString", coordinates: points };
}

const mapProviders = {
  osm: {
    label: "OpenStreetMap",
    tiles: [
      "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ],
    attribution: "© OpenStreetMap contributors",
  },
  gaode: {
    label: "高德",
    tiles: [
      "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    ],
    attribution: "© 高德地图",
  },
  gaodeSatellite: {
    label: "高德卫星",
    tiles: [
      "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      "https://webst03.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      "https://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    ],
    attribution: "© 高德地图",
  },
  google: {
    label: "Google 街道",
    tiles: [
      "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      "https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      "https://mt3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    ],
    attribution: "© Google",
  },
  googleSatellite: {
    label: "Google 卫星",
    tiles: [
      "https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      "https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      "https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    ],
    attribution: "© Google",
  },
  googleTerrain: {
    label: "Google 地形",
    tiles: [
      "https://mt0.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
      "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
      "https://mt2.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
      "https://mt3.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    ],
    attribution: "© Google",
  },
  esriSatellite: {
    label: "Esri 卫星",
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Tiles © Esri",
  },
  bingRoad: {
    label: "Bing 地图",
    tiles: ["bing://road/{z}/{x}/{y}"],
    attribution: "© Microsoft Bing",
  },
  bingAerial: {
    label: "Bing 卫星",
    tiles: ["bing://aerial/{z}/{x}/{y}"],
    attribution: "© Microsoft Bing",
  },
};

function normalizeMapProviderMode(value) {
  return ["auto", ...Object.keys(mapProviders)].includes(value) ? value : "auto";
}

function normalizeMapBaseOpacity(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : 100;
}

function normalizeDetectedMapProvider(value) {
  return ["gaode", "google"].includes(value) ? value : "";
}

function activeMapProvider() {
  const mode = normalizeMapProviderMode(state.mapProviderMode);
  if (mode !== "auto") return mode;
  return normalizeDetectedMapProvider(state.detectedMapProvider) || fallbackMapProviderFromLocale();
}

function isGaodeProvider(provider = activeMapProvider()) {
  return provider === "gaode" || provider === "gaodeSatellite";
}

function isCoordinateInChina(lng, lat) {
  return Number.isFinite(lng) && Number.isFinite(lat) && lng >= 72.004 && lng <= 137.8347 && lat >= 0.8293 && lat <= 55.8271;
}

function transformLatForChina(lng, lat) {
  let ret = -100 + 2 * lng + 3 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) / 3;
  ret += ((20 * Math.sin(lat * Math.PI) + 40 * Math.sin((lat / 3) * Math.PI)) * 2) / 3;
  ret += ((160 * Math.sin((lat / 12) * Math.PI) + 320 * Math.sin((lat * Math.PI) / 30)) * 2) / 3;
  return ret;
}

function transformLngForChina(lng, lat) {
  let ret = 300 + lng + 2 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) / 3;
  ret += ((20 * Math.sin(lng * Math.PI) + 40 * Math.sin((lng / 3) * Math.PI)) * 2) / 3;
  ret += ((150 * Math.sin((lng / 12) * Math.PI) + 300 * Math.sin((lng / 30) * Math.PI)) * 2) / 3;
  return ret;
}

function wgsToGcj(lng, lat) {
  if (!isCoordinateInChina(lng, lat)) return [lng, lat];
  const a = 6378245;
  const ee = 0.006693421622965943;
  let dLat = transformLatForChina(lng - 105, lat - 35);
  let dLng = transformLngForChina(lng - 105, lat - 35);
  const radLat = (lat / 180) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  dLng = (dLng * 180) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return [lng + dLng, lat + dLat];
}

function gcjToWgs(lng, lat) {
  if (!isCoordinateInChina(lng, lat)) return [lng, lat];
  const [gcjLng, gcjLat] = wgsToGcj(lng, lat);
  return [lng * 2 - gcjLng, lat * 2 - gcjLat];
}

function mapDisplayCoordinate(lng, lat) {
  return isGaodeProvider() ? wgsToGcj(lng, lat) : [lng, lat];
}

function mapStorageCoordinateFromClick(lng, lat) {
  return isGaodeProvider() ? gcjToWgs(lng, lat) : [lng, lat];
}

function fallbackMapProviderFromLocale() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const language = navigator.language || "";
  return timezone === "Asia/Shanghai" || /^zh-CN/i.test(language) ? "gaode" : "google";
}

function tileQuadKey(z, x, y) {
  let quadKey = "";
  for (let level = z; level > 0; level -= 1) {
    let digit = 0;
    const mask = 1 << (level - 1);
    if ((x & mask) !== 0) digit += 1;
    if ((y & mask) !== 0) digit += 2;
    quadKey += digit;
  }
  return quadKey;
}

function bingTileUrl(kind, z, x, y) {
  const quadKey = tileQuadKey(z, x, y);
  const subdomain = Math.abs(x + y) % 4;
  const prefix = kind === "aerial" ? "a" : "r";
  const extension = kind === "aerial" ? "jpeg" : "png";
  const culture = currentLanguage === "en" ? "en-US" : "zh-CN";
  return `https://ecn.t${subdomain}.tiles.virtualearth.net/tiles/${prefix}${quadKey}.${extension}?g=1391&mkt=${culture}`;
}

function registerBingMapLibreProtocol() {
  if (bingMapLibreProtocolRegistered || !window.maplibregl?.addProtocol) return;
  window.maplibregl.addProtocol("bing", async (params) => {
    const match = String(params.url || "").match(/^bing:\/\/(road|aerial)\/(\d+)\/(\d+)\/(\d+)/);
    if (!match) throw new Error("Invalid Bing tile URL");
    const [, kind, zText, xText, yText] = match;
    const response = await fetch(bingTileUrl(kind, Number(zText), Number(xText), Number(yText)));
    if (!response.ok) throw new Error(`Bing tile ${response.status}`);
    return { data: await response.arrayBuffer() };
  });
  bingMapLibreProtocolRegistered = true;
}

async function detectMapProviderByIp() {
  if (normalizeMapProviderMode(state.mapProviderMode) !== "auto") return;
  if (normalizeDetectedMapProvider(state.detectedMapProvider)) return;
  if (mapProviderDetectionPromise) return mapProviderDetectionPromise;
  let timeout = null;
  mapProviderDetectionPromise = (async () => {
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 2500);
      const response = await fetch("https://ipapi.co/json/", { signal: controller.signal, cache: "no-store" });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`${response.status}`);
      const data = await response.json();
      const detected = String(data.country_code || data.country || "").toUpperCase() === "CN" ? "gaode" : "google";
      if (state.detectedMapProvider === detected) return;
      state.detectedMapProvider = detected;
      saveUiStateSoon();
      renderMapControls();
      if (isMapPageActive()) renderGeoMap();
    } catch (error) {
      state.detectedMapProvider = state.detectedMapProvider || fallbackMapProviderFromLocale();
      renderMapControls();
    } finally {
      if (timeout) clearTimeout(timeout);
      mapProviderDetectionPromise = null;
    }
  })();
  return mapProviderDetectionPromise;
}

const chinaProvincialCapitals = [
  "北京", "天津", "上海", "重庆", "石家庄", "太原", "呼和浩特", "沈阳", "长春", "哈尔滨",
  "南京", "杭州", "合肥", "福州", "南昌", "济南", "郑州", "武汉", "长沙", "广州",
  "南宁", "海口", "成都", "贵阳", "昆明", "拉萨", "西安", "兰州", "西宁", "银川",
  "乌鲁木齐", "台北", "香港", "澳门",
];
const chinaProvinceAliases = {
  北京市: "北京",
  天津市: "天津",
  上海市: "上海",
  重庆市: "重庆",
  河北省: "河北",
  山西省: "山西",
  内蒙古自治区: "内蒙古",
  辽宁省: "辽宁",
  吉林省: "吉林",
  黑龙江省: "黑龙江",
  江苏省: "江苏",
  浙江省: "浙江",
  安徽省: "安徽",
  福建省: "福建",
  江西省: "江西",
  山东省: "山东",
  河南省: "河南",
  湖北省: "湖北",
  湖南省: "湖南",
  广东省: "广东",
  广西壮族自治区: "广西",
  海南省: "海南",
  四川省: "四川",
  贵州省: "贵州",
  云南省: "云南",
  西藏自治区: "西藏",
  陕西省: "陕西",
  甘肃省: "甘肃",
  青海省: "青海",
  宁夏回族自治区: "宁夏",
  新疆维吾尔自治区: "新疆",
  台湾省: "台湾",
  香港特别行政区: "香港",
  澳门特别行政区: "澳门",
};

const chinaProvinceEnglishNames = {
  北京: "Beijing",
  天津: "Tianjin",
  上海: "Shanghai",
  重庆: "Chongqing",
  河北: "Hebei",
  山西: "Shanxi",
  内蒙古: "Inner Mongolia",
  辽宁: "Liaoning",
  吉林: "Jilin",
  黑龙江: "Heilongjiang",
  江苏: "Jiangsu",
  浙江: "Zhejiang",
  安徽: "Anhui",
  福建: "Fujian",
  江西: "Jiangxi",
  山东: "Shandong",
  河南: "Henan",
  湖北: "Hubei",
  湖南: "Hunan",
  广东: "Guangdong",
  广西: "Guangxi",
  海南: "Hainan",
  四川: "Sichuan",
  贵州: "Guizhou",
  云南: "Yunnan",
  西藏: "Tibet",
  陕西: "Shaanxi",
  甘肃: "Gansu",
  青海: "Qinghai",
  宁夏: "Ningxia",
  新疆: "Xinjiang",
  台湾: "Taiwan",
  香港: "Hong Kong",
  澳门: "Macau",
};

const continentEnglishNames = {
  亚洲: "Asia",
  欧洲: "Europe",
  北美洲: "North America",
  南美洲: "South America",
  非洲: "Africa",
  大洋洲: "Oceania",
  其他: "Other",
  "亚洲/欧洲": "Asia / Europe",
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
  { id: "my", name: "马来西亚", continent: "亚洲", bbox: [99, 0, 120, 8], x: 74, y: 58, w: 6, h: 4 },
  { id: "vn", name: "越南", continent: "亚洲", bbox: [102, 8, 110, 24], x: 75, y: 52, w: 4, h: 8 },
  { id: "id", name: "印度尼西亚", continent: "亚洲", bbox: [95, -11, 141, 6], x: 75, y: 63, w: 14, h: 7 },
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

const countryChineseNames = {
  cn: "中国", us: "美国", jp: "日本", fr: "法国", it: "意大利", gb: "英国", au: "澳大利亚", ca: "加拿大", sg: "新加坡", th: "泰国",
  my: "马来西亚", vn: "越南", id: "印度尼西亚", de: "德国", es: "西班牙", nz: "新西兰", mx: "墨西哥", ae: "阿联酋", eg: "埃及", za: "南非",
  br: "巴西", ar: "阿根廷", tr: "土耳其", hk: "香港", mo: "澳门", tw: "台湾", kr: "韩国", in: "印度", ru: "俄罗斯", nl: "荷兰",
  be: "比利时", ch: "瑞士", at: "奥地利", se: "瑞典", no: "挪威", dk: "丹麦", fi: "芬兰", pl: "波兰", pt: "葡萄牙", gr: "希腊",
  cz: "捷克", hu: "匈牙利", ie: "爱尔兰", is: "冰岛", il: "以色列", sa: "沙特阿拉伯", qa: "卡塔尔", ma: "摩洛哥", ke: "肯尼亚", pe: "秘鲁",
  cl: "智利", co: "哥伦比亚",
};

const worldHeritageCountryNameAliases = {
  美國: "美国",
  美利坚合众国: "美国",
  大韩民国: "韩国",
  韓國: "韩国",
  朝鲜民主主义人民共和国: "朝鲜",
  臺灣: "台湾",
  台灣: "台湾",
  香港特別行政區: "香港",
  澳門特別行政區: "澳门",
  亞美尼亞: "亚美尼亚",
  克羅地亞: "克罗地亚",
  蒙特內哥羅: "黑山",
  白俄羅斯: "白俄罗斯",
  法國: "法国",
  德國: "德国",
  義大利: "意大利",
  荷蘭: "荷兰",
  波蘭: "波兰",
  烏克蘭: "乌克兰",
  愛爾蘭共和國: "爱尔兰",
  愛沙尼亞: "爱沙尼亚",
  拉脫維亞: "拉脱维亚",
  羅馬尼亞: "罗马尼亚",
  斯洛文尼亞: "斯洛文尼亚",
  塞爾維亞: "塞尔维亚",
  阿爾巴尼亞: "阿尔巴尼亚",
  阿爾及利亞: "阿尔及利亚",
  敘利亞: "叙利亚",
  突尼西亞: "突尼斯",
  馬來西亞: "马来西亚",
  泰國: "泰国",
  芬蘭: "芬兰",
  奧地利: "奥地利",
  馬爾他: "马耳他",
  馬耳他: "马耳他",
  馬達加斯加: "马达加斯加",
  馬拉威: "马拉维",
  馬紹爾群島: "马绍尔群岛",
  尼泊爾: "尼泊尔",
  索馬里: "索马里",
  厄立特里亞: "厄立特里亚",
  毛里塔尼亞: "毛里塔尼亚",
  玻利維亞: "玻利维亚",
  薩爾瓦多: "萨尔瓦多",
  贊比亞: "赞比亚",
  坦桑尼亞: "坦桑尼亚",
  奈及利亞: "尼日利亚",
  岡比亞: "冈比亚",
  畿內亞比紹: "几内亚比绍",
  剛果共和國: "刚果共和国",
  中非共和國: "中非共和国",
  布吉納法索: "布基纳法索",
  梵蒂岡城國: "梵蒂冈",
  蒙古國: "蒙古",
  孟加拉國: "孟加拉国",
  朝鮮民主主義人民共和國: "朝鲜",
  土庫曼: "土库曼斯坦",
  土库曼: "土库曼斯坦",
  邁赫拉蘇丹國: "也门",
  德意志联邦共和国: "德国",
  法兰西共和国: "法国",
  大不列颠及北爱尔兰联合王国: "英国",
  俄罗斯帝国: "俄罗斯",
  中华人民共和国: "中国",
  中華人民共和國: "中国",
  中华民国: "中国",
  中華民國: "中国",
  中华民国大陆时期: "中国",
  中華民國大陸時期: "中国",
  清朝: "中国",
};

const traditionalToSimplifiedPhrases = [
  ["澳門", "澳门"],
  ["臺灣", "台湾"],
  ["台灣", "台湾"],
  ["香港特別行政區", "香港"],
  ["澳門特別行政區", "澳门"],
  ["中華人民共和國", "中华人民共和国"],
  ["中華民國大陸時期", "中华民国大陆时期"],
  ["中華民國", "中华民国"],
  ["蘇聯", "苏联"],
];

const traditionalToSimplifiedChars = {
  國: "国", 亞: "亚", 門: "门", 區: "区", 臺: "台", 灣: "湾", 華: "华", 義: "义",
  韓國: "韩国", 韓: "韩", 俄: "俄", 德: "德", 法: "法", 馬: "马", 羅: "罗", 蘭: "兰",
  貝: "贝", 蘇: "苏", 烏: "乌", 愛: "爱", 爾: "尔", 脫: "脱", 維: "维", 敘: "叙",
  突: "突", 芬: "芬", 達: "达", 紹: "绍", 尼: "尼", 爾: "尔", 厄: "厄", 玻: "玻",
  薩: "萨", 贊: "赞", 岡: "冈", 剛: "刚", 納: "纳", 梵: "梵", 蒙: "蒙", 聖: "圣",
  繁: "繁", 體: "体", 歷: "历", 遺: "遗", 產: "产", 園: "园", 觀: "观", 築: "筑",
  宮: "宫", 殿: "殿", 館: "馆", 峽: "峡", 濕: "湿", 熱: "热", 護: "护", 麗: "丽",
  廣: "广", 舊: "旧", 與: "与", 對: "对", 濟: "济", 鹽: "盐", 礦: "矿", 廠: "厂",
  鐘: "钟", 樓: "楼", 島: "岛", 橋: "桥", 鐵: "铁", 農: "农", 莊: "庄", 陵: "陵",
  塢: "坞", 灣: "湾", 櫸: "榉", 樹: "树", 線: "线", 縣: "县", 鄉: "乡", 鎮: "镇",
  畫: "画", 點: "点", 聯: "联", 雙: "双", 龍: "龙", 黃: "黄", 黑: "黑", 萊: "莱",
  魯: "鲁", 錫: "锡", 斯: "斯", 齊: "齐", 齒: "齿", 齋: "斋", 藝: "艺", 術: "术",
  寶: "宝", 溪: "溪", 濱: "滨", 邊: "边", 葉: "叶", 壇: "坛", 壘: "垒", 蘆: "芦",
  沖: "冲", 關: "关", 財: "财", 製: "制", 絲: "丝", 綢: "绸", 業: "业", 紀: "纪",
  靈: "灵", 參: "参", 長: "长", 脈: "脉", 萬: "万", 奧: "奥", 時: "时", 戰: "战",
  禮: "礼", 場: "场", 亞: "亚", 寫: "写", 賽: "赛", 鬥: "斗", 陽: "阳", 陰: "阴",
  階: "阶", 讀: "读", 賓: "宾", 彎: "弯", 圍: "围", 牆: "墙", 衛: "卫", 類: "类",
  鋪: "铺", 廟: "庙", 鑄: "铸", 塔: "塔", 語: "语", 聲: "声", 蹟: "迹", 跡: "迹",
  遜: "逊", 祿: "禄", 東: "东", 燈: "灯", 劇: "剧", 盧: "卢", 鄭: "郑",
  會: "会", 圖: "图", 書: "书", 總: "总", 署: "署", 樓: "楼", 議: "议", 玫: "玫",
  瀋: "沈", 雲: "云", 墳: "坟", 誕: "诞", 詩: "诗",
  庫: "库", 鯨: "鲸", 魚: "鱼", 貼: "贴", 邁: "迈", 廳: "厅", 貧: "贫",
  賈: "贾", 喬: "乔", 遺: "遗", 灣: "湾",
};

const worldHeritageItemNameAliases = {
  "梅萨维德印第安遗址": "梅萨维德国家公园",
  "红杉国家公园": "红木国家和州立公园",
  "Historic Centre of Macau": "澳门历史城区",
  "Historic Centre of Macao": "澳门历史城区",
  "Imperial Palaces of the Ming and Qing Dynasties in Beijing and Shenyang": "北京及沈阳的明清皇家宫殿",
  "The Great Wall": "长城",
  "Mogao Caves": "莫高窟",
  "Mausoleum of the First Qin Emperor": "秦始皇陵及兵马俑",
  "Peking Man Site at Zhoukoudian": "周口店北京人遗址",
  "Mount Taishan": "泰山",
  "Mount Huangshan": "黄山",
  "Wulingyuan Scenic and Historic Interest Area": "武陵源",
  "Mount Emei Scenic Area, including Leshan Giant Buddha Scenic Area": "峨眉山-乐山大佛",
  "Xinjiang Tianshan": "新疆天山",
  "Central Axis of Beijing": "北京中轴线",
  Fanjingshan: "梵净山",
  "Migratory Bird Sanctuaries along the Coast of Yellow Sea-Bohai Gulf of China": "中国黄（渤）海候鸟栖息地（第二期）",
  "Migratory Bird Sanctuaries along the Coast of Yellow Sea-Bohai Gulf of China (Phase I)": "中国黄（渤）海候鸟栖息地（第二期）",
  "中国黄（渤）海候鸟栖息地（第一期）": "中国黄（渤）海候鸟栖息地（第二期）",
  "中国黄（渤）海候鸟栖息地（第一期、第二期）": "中国黄（渤）海候鸟栖息地（第二期）",
  "北京及瀋陽的明清皇家宮殿": "北京及沈阳的明清皇家宫殿",
  "庐山第四纪冰川国家地质公园": "庐山国家公园",
  "秦始皇陵": "秦始皇陵及兵马俑",
  "良渚遗址": "良渚古城遗址",
  "可可西里": "青海可可西里",
  "苏州园林": "苏州古典园林",
  "花山岩画": "左江花山岩画文化景观",
  "红河哈尼梯田": "红河哈尼梯田文化景观",
  "曲阜的孔庙、孔林、孔府": "曲阜孔庙、孔林和孔府",
  "周口店遗址": "周口店北京人遗址",
  "Historic City of Ayutthaya": "阿瑜陀耶古城",
  "Ayutthaya Historical Park": "阿瑜陀耶古城",
  Shiretoko: "知床",
  "Shiretoko Peninsula": "知床",
  "知床半島": "知床",
  "知床半岛": "知床",
  "Sado Island Gold Mines": "佐渡岛金山",
  "佐渡金山": "佐渡岛金山",
  "Kaeng Krachan Forest Complex": "岗卡章森林保护区",
  "Phu Phrabat, a testimony to the Sīma stone tradition of the Dvaravati period": "普帕巴历史公园",
  "Poverty Point": "波弗蒂角",
  "貧点": "波弗蒂角",
  "Centennial Hall": "百年厅",
  "百年廳": "百年厅",
  Bam: "巴姆古城",
  "巴姆": "巴姆古城",
};

function toSimplifiedChineseText(value) {
  let text = String(value || "").trim();
  traditionalToSimplifiedPhrases.forEach(([from, to]) => {
    text = text.split(from).join(to);
  });
  return Array.from(text).map((char) => traditionalToSimplifiedChars[char] || char).join("");
}

function normalizeWorldHeritageItemName(name, aliases = {}) {
  const raw = String(name || "").trim();
  if (!raw || /^Q\d+$/.test(raw)) return "";
  const aliased = aliases[raw] || worldHeritageItemNameAliases[raw] || raw;
  let normalized = toSimplifiedChineseText(aliased).replace(/\s+/g, " ").trim();
  const chinesePrefix = normalized.match(/^([^（(]*[\u4e00-\u9fff][^（(]*)(?:（|\()([A-Za-z][^）)]*)(?:）|\))/);
  if (chinesePrefix?.[1]) normalized = chinesePrefix[1].trim();
  normalized = worldHeritageItemNameAliases[normalized] || normalized;
  if (isMacauWorldHeritageItem(normalized)) normalized = "澳门历史城区";
  if (!normalized || /^Q\d+$/.test(normalized) || isWorldHeritageComponentOnlyName(normalized)) return "";
  return normalized;
}

function isWorldHeritageComponentOnlyName(name) {
  return new Set([
    "登封市",
    "角抵塚",
    "莫角山遗址",
    "通济渠郑州段",
  ]).has(name);
}

const macauWorldHeritageNamePatterns = [
  /澳门|澳門|Macau|Macao/i,
  /伯多祿五世劇院|伯多禄五世剧院/,
  /大炮台|大三巴/,
  /東方基金會會址|东方基金会会址|Casa Garden/i,
  /東望洋|东望洋/,
  /何東圖書館|何东图书馆|Sir Robert Ho Tung Library/i,
  /馬禮遜教堂|马礼逊教堂|马礼遜教堂|Macau Protestant Chapel/i,
  /玫瑰聖母堂|玫瑰圣母堂|St\.?\s*Dominic/i,
  /民政總署大樓|民政总署大楼|Leal Senado/i,
  /仁慈堂大樓|仁慈堂大楼|Santa Casa da Miseric[oó]rdia/i,
  /聖安多尼教堂|圣安多尼教堂|St\.?\s*Anthony/i,
  /議事亭前地|议事亭前地|Senado Square/i,
  /基督教墳场|基督教坟场|Protestant Cemetery/i,
  /三街会馆|三街會館|Sam Kai Vui Kun/i,
  /聖奧斯定教堂|圣奥斯定教堂|St\.?\s*Augustine/i,
  /聖老楞佐堂|圣老楞佐堂|St\.?\s*Lawrence/i,
  /聖母聖誕主教座堂|圣母圣诞主教座堂/,
  /聖母雪地殿教堂|圣母雪地殿教堂|Guia Chapel/i,
  /聖若瑟修院及聖堂|圣若瑟修院及圣堂/,
  /媽閣|妈阁|盧家大屋|卢家大屋|鄭家大屋|郑家大屋/,
];

function isMacauWorldHeritageItem(itemName) {
  const text = String(itemName || "");
  return macauWorldHeritageNamePatterns.some((pattern) => pattern.test(text));
}

function collectWorldHeritageNameAliases(byCountry = {}) {
  const aliases = {};
  Object.values(byCountry).flat().forEach((item) => {
    const normalized = toSimplifiedChineseText(item).replace(/\s+/g, " ").trim();
    const match = normalized.match(/^([^（(]*[\u4e00-\u9fff][^（(]*)(?:（|\()([^）)]+)(?:）|\))/);
    if (!match?.[1] || !match?.[2]) return;
    const chineseName = match[1].trim();
    const englishName = match[2].trim();
    if (!/^[A-Za-z]/.test(englishName) || /^Q\d+$/.test(englishName)) return;
    aliases[englishName] = chineseName;
    aliases[String(item).trim()] = chineseName;
  });
  return aliases;
}

function worldHeritageDisplayCountryForItem(itemName, fallbackCountry) {
  const text = `${itemName || ""} ${fallbackCountry || ""}`;
  if (/香港|Hong Kong/i.test(text)) return "香港";
  if (/台湾|臺灣|台灣|Taiwan/i.test(text)) return "台湾";
  if (/苏联|蘇聯/.test(text)) {
    if (/圣彼得堡|Saint Petersburg/i.test(text)) return "俄罗斯";
    if (/诗歌塔|Burana/i.test(text)) return "吉尔吉斯斯坦";
    if (/Bukhara|布哈拉/i.test(text)) return "乌兹别克斯坦";
  }
  return normalizeWorldHeritageCountryName(fallbackCountry);
}

function normalizeWorldHeritageCountryName(name) {
  const value = String(name || "").trim();
  const aliased = worldHeritageCountryNameAliases[value] || value;
  const simplified = toSimplifiedChineseText(aliased);
  return worldHeritageCountryNameAliases[simplified] || simplified || "未分国家";
}

function worldHeritageCountryCoverageId(countryName) {
  const normalized = normalizeWorldHeritageCountryName(countryName);
  const mappedId = worldHeritageCountryIds[countryName] || worldHeritageCountryIds[normalized];
  if (mappedId) return countryCoverageId(mappedId);
  const namedCountry = Object.entries(countryChineseNames).find(([, name]) => name === normalized);
  if (namedCountry) return countryCoverageId(namedCountry[0]);
  const knownCountry = countries.find((country) => country.name === normalized || countryDisplayName(country.id) === normalized);
  if (knownCountry) return countryCoverageId(knownCountry.id);
  const catalogCountry = worldCountryCatalog.find((country) => country.name === normalized || countryDisplayName(country.id) === normalized);
  if (catalogCountry) return countryCoverageId(catalogCountry.id);
  return "";
}

function visitedWorldHeritageCountryNames(byCountry = {}) {
  const visited = uniqueVisitedCountries();
  return new Set(Object.keys(byCountry).filter((country) => {
    if (["香港", "澳门", "台湾"].includes(country) && visited.has(countryCoverageId("cn"))) return true;
    const coverageId = worldHeritageCountryCoverageId(country);
    return coverageId && visited.has(coverageId);
  }));
}

const regionNameFormatter = typeof Intl !== "undefined" && Intl.DisplayNames
  ? new Intl.DisplayNames(["zh-CN"], { type: "region" })
  : null;
const englishRegionNameFormatter = typeof Intl !== "undefined" && Intl.DisplayNames
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null;

const continentCountryIds = {
  亚洲: "cn jp kr kp mn sg my th vn id ph bn kh la mm tl in pk bd lk np bt mv af ir iq sy lb jo il ps sa ae qa kw bh om ye tr ge am az kz uz tm kg tj".split(" "),
  欧洲: "gb ie fr it de es pt nl be lu ch at li mc ad sm va mt gr cy al mk rs me ba hr si hu sk cz pl ua by md ro bg ru ee lv lt fi se no dk is".split(" "),
  北美洲: "us ca mx gt bz hn sv ni cr pa cu jm ht do bs bb ag dm gd kn lc vc tt".split(" "),
  南美洲: "br ar cl pe co uy bo ec ve gy sr py".split(" "),
  非洲: "eg za ma dz tn ly sd ss et er dj so ke ug tz rw bi cd cg ga gq cm cf td ne ng bj tg gh ci lr sl gn gw gm sn mr ml bf ao zm zw mw mz na bw sz ls mg mu sc cv st".split(" "),
  大洋洲: "au nz fj pg sb vu nc pf ws to tv ki nr fm mh pw".split(" "),
};

function countryDisplayName(countryId) {
  const normalized = normalizeCountry(countryId);
  if (currentLanguage === "en" && /^[a-z]{2}$/.test(normalized) && englishRegionNameFormatter) {
    try {
      return englishRegionNameFormatter.of(normalized.toUpperCase()) || normalized.toUpperCase();
    } catch {
      return normalized.toUpperCase();
    }
  }
  if (countryChineseNames[normalized]) return countryChineseNames[normalized];
  if (/^[a-z]{2}$/.test(normalized) && regionNameFormatter) {
    try {
      return regionNameFormatter.of(normalized.toUpperCase()) || normalized.toUpperCase();
    } catch {
      return normalized.toUpperCase();
    }
  }
  return normalized || "未分类";
}

function continentForCountryId(countryId) {
  const normalized = countryCoverageId(countryId);
  const catalog = worldCountryCatalog.find((country) => countryCoverageId(country.id) === normalized);
  if (catalog?.continent) return catalog.continent;
  const known = countries.find((country) => countryCoverageId(country.id) === normalized);
  if (known?.continent) return known.continent;
  return Object.entries(continentCountryIds).find(([, ids]) => ids.includes(normalized))?.[0] || "其他";
}

function continentDisplayName(continent) {
  return currentLanguage === "en" ? continentEnglishNames[continent] || continent : continent;
}

function chinaProvinceDisplayName(name) {
  const normalized = chinaProvinceAliases[name] || name;
  return currentLanguage === "en" ? chinaProvinceEnglishNames[normalized] || normalized : normalized;
}

const chinesePinyinMap = {
  阿: "a", 哀: "ai", 安: "an", 鞍: "an", 巴: "ba", 白: "bai", 百: "bai", 蚌: "beng", 包: "bao", 宝: "bao", 保: "bao", 北: "bei", 本: "ben", 毕: "bi", 滨: "bin", 亳: "bo", 博: "bo", 沧: "cang", 昌: "chang", 常: "chang", 长: "chang", 朝: "chao", 承: "cheng", 城: "cheng", 成: "cheng", 池: "chi", 赤: "chi", 充: "chong", 崇: "chong", 滁: "chu", 楚: "chu", 川: "chuan", 达: "da", 大: "da", 丹: "dan", 儋: "dan", 德: "de", 迪: "di", 定: "ding", 东: "dong", 都: "du", 鄂: "e", 恩: "en", 防: "fang", 肥: "fei", 佛: "fo", 福: "fu", 抚: "fu", 阜: "fu", 赣: "gan", 甘: "gan", 冈: "gang", 港: "gang", 高: "gao", 固: "gu", 广: "guang", 贵: "gui", 桂: "gui", 果: "guo", 哈: "ha", 海: "hai", 邯: "han", 汉: "han", 杭: "hang", 浩: "hao", 合: "he", 和: "he", 河: "he", 鹤: "he", 黑: "hei", 衡: "heng", 红: "hong", 呼: "hu", 葫: "hu", 湖: "hu", 华: "hua", 淮: "huai", 怀: "huai", 黄: "huang", 惠: "hui", 鸡: "ji", 吉: "ji", 济: "ji", 佳: "jia", 嘉: "jia", 江: "jiang", 焦: "jiao", 揭: "jie", 金: "jin", 晋: "jin", 锦: "jin", 京: "jing", 景: "jing", 靖: "jing", 九: "jiu", 酒: "jiu", 喀: "ka", 开: "kai", 康: "kang", 可: "ke", 昆: "kun", 拉: "la", 来: "lai", 兰: "lan", 廊: "lang", 乐: "le", 勒: "le", 丽: "li", 连: "lian", 辽: "liao", 聊: "liao", 林: "lin", 临: "lin", 柳: "liu", 六: "liu", 龙: "long", 陇: "long", 娄: "lou", 泸: "lu", 鲁: "lu", 洛: "luo", 漯: "luo", 马: "ma", 茂: "mao", 眉: "mei", 梅: "mei", 门: "men", 牡: "mu", 南: "nan", 内: "nei", 宁: "ning", 怒: "nu", 攀: "pan", 盘: "pan", 平: "ping", 莆: "pu", 普: "pu", 七: "qi", 齐: "qi", 迁: "qian", 钦: "qin", 秦: "qin", 青: "qing", 清: "qing", 庆: "qing", 曲: "qu", 衢: "qu", 泉: "quan", 日: "ri", 三: "san", 厦: "xia", 商: "shang", 上: "shang", 韶: "shao", 邵: "shao", 绍: "shao", 沈: "shen", 深: "shen", 神: "shen", 什: "shi", 石: "shi", 十: "shi", 双: "shuang", 朔: "shuo", 四: "si", 松: "song", 苏: "su", 宿: "su", 绥: "sui", 随: "sui", 遂: "sui", 台: "tai", 泰: "tai", 太: "tai", 唐: "tang", 桃: "tao", 天: "tian", 铁: "tie", 通: "tong", 铜: "tong", 吐: "tu", 万: "wan", 威: "wei", 渭: "wei", 乌: "wu", 吴: "wu", 无: "wu", 武: "wu", 五: "wu", 西: "xi", 咸: "xian", 仙: "xian", 孝: "xiao", 忻: "xin", 新: "xin", 信: "xin", 邢: "xing", 兴: "xing", 雄: "xiong", 徐: "xu", 宣: "xuan", 雅: "ya", 烟: "yan", 延: "yan", 盐: "yan", 扬: "yang", 阳: "yang", 鸭: "ya", 宜: "yi", 伊: "yi", 义: "yi", 益: "yi", 鹰: "ying", 营: "ying", 永: "yong", 榆: "yu", 玉: "yu", 岳: "yue", 云: "yun", 运: "yun", 枣: "zao", 泽: "ze", 湛: "zhan", 张: "zhang", 彰: "zhang", 漳: "zhang", 昭: "zhao", 肇: "zhao", 郑: "zheng", 镇: "zhen", 芝: "zhi", 舟: "zhou", 株: "zhu", 驻: "zhu", 珠: "zhu", 淄: "zi", 资: "zi", 遵: "zun", 乡: "xiang", 亚: "ya", 仁: "ren", 伦: "lun", 依: "yi", 克: "ke", 区: "qu", 古: "gu", 塔: "ta", 孜: "zi", 家: "jia", 尔: "er", 山: "shan", 州: "zhou", 投: "tou", 春: "chun", 柯: "ke", 水: "shui", 治: "zhi", 津: "jin", 温: "wen", 特: "te", 自: "zi", 苗: "miao", 萨: "sa", 蒙: "meng", 那: "na", 锡: "xi",
  亳: "bo", 亭: "ting", 丘: "qiu", 中: "zhong", 义: "yi", 余: "yu", 作: "zuo", 元: "yuan", 关: "guan", 兴: "xing", 农: "nong", 凉: "liang", 则: "ze", 化: "hua", 卫: "wei", 原: "yuan", 口: "kou", 可: "ke", 同: "tong", 名: "ming", 吕: "lv", 周: "zhou", 善: "shan", 嘴: "zui", 园: "yuan", 图: "tu", 圳: "zhen", 坊: "fang", 坝: "ba", 埠: "bu", 基: "ji", 堰: "yan", 壁: "bi", 夏: "xia", 多: "duo", 头: "tou", 子: "zi", 宏: "hong", 宝: "bao", 宾: "bin", 密: "mi", 察: "cha", 封: "feng", 尾: "wei", 屏: "ping", 屯: "tun", 岗: "gang", 岛: "dao", 岩: "yan", 岭: "ling", 峡: "xia", 峪: "yu", 峰: "feng", 左: "zuo", 布: "bu", 常: "chang", 庄: "zhuang", 底: "di", 店: "dian", 康: "kang", 开: "kai", 彦: "yan", 忠: "zhong", 惠: "hui", 感: "gan", 指: "zhi", 掖: "ye", 文: "wen", 斯: "si", 方: "fang", 施: "shi", 明: "ming", 普: "pu", 木: "mu", 杨: "yang", 杭: "hang", 果: "guo", 枝: "zhi", 架: "jia", 树: "shu", 栗: "li", 梁: "liang", 梧: "wu", 楞: "leng", 榆: "yu", 毕: "bi", 汕: "shan", 汾: "fen", 沂: "yi", 沙: "sha", 河: "he", 波: "bo", 洱: "er", 洲: "zhou", 浮: "fu", 淖: "nao", 渠: "qu", 湘: "xiang", 源: "yuan", 溪: "xi", 滨: "bin", 潍: "wei", 潜: "qian", 潭: "tan", 潮: "chao", 澄: "cheng", 澎: "peng", 濮: "pu", 照: "zhao", 版: "ban", 犁: "li", 玛: "ma", 理: "li", 琼: "qiong", 田: "tian", 界: "jie", 番: "fan", 皇: "huang", 盐: "yan", 盘: "pan", 眉: "mei", 竹: "zhu", 纳: "na", 绵: "mian", 胡: "hu", 舒: "shu", 色: "se", 节: "jie", 芜: "wu", 芦: "lu", 花: "hua", 荆: "jing", 莞: "guan", 莲: "lian", 菏: "he", 萍: "ping", 衡: "heng", 襄: "xiang", 许: "xu", 贝: "bei", 贡: "gong", 贺: "he", 边: "bian", 迈: "mai", 远: "yuan", 邯: "han", 邵: "shao", 郭: "guo", 郴: "chen", 郸: "dan", 里: "li", 重: "chong", 银: "yin", 门: "men", 陵: "ling", 隆: "long", 音: "yin", 顶: "ding", 顺: "shun", 饶: "rao", 黔: "qian"
};

const chineseEthnicPhrases = [
  ["蒙古族", "Mongolian"],
  ["回族", "Hui"],
  ["藏族", "Tibetan"],
  ["维吾尔族", "Uyghur"],
  ["壮族", "Zhuang"],
  ["朝鲜族", "Korean"],
  ["哈萨克族", "Kazakh"],
  ["柯尔克孜族", "Kyrgyz"],
  ["傣族", "Dai"],
  ["彝族", "Yi"],
  ["白族", "Bai"],
  ["苗族", "Miao"],
  ["侗族", "Dong"],
  ["瑶族", "Yao"],
  ["土家族", "Tujia"],
  ["布依族", "Bouyei"],
  ["哈尼族", "Hani"],
  ["黎族", "Li"],
  ["傈僳族", "Lisu"],
  ["佤族", "Wa"],
  ["拉祜族", "Lahu"],
  ["水族", "Shui"],
  ["羌族", "Qiang"],
  ["景颇族", "Jingpo"],
  ["东乡族", "Dongxiang"],
  ["撒拉族", "Salar"],
  ["保安族", "Bonan"],
  ["裕固族", "Yugur"],
  ["锡伯族", "Xibe"],
  ["塔吉克族", "Tajik"],
  ["达斡尔族", "Daur"],
  ["鄂温克族", "Ewenki"],
  ["鄂伦春族", "Oroqen"],
  ["赫哲族", "Hezhen"],
  ["满族", "Manchu"],
  ["畲族", "She"],
  ["高山族", "Gaoshan"],
  ["仡佬族", "Gelao"],
  ["毛南族", "Maonan"],
  ["仫佬族", "Mulao"],
  ["柯尔克孜", "Kyrgyz"],
  ["哈萨克", "Kazakh"],
  ["蒙古", "Mongolian"],
  ["维吾尔", "Uyghur"],
  ["朝鲜", "Korean"],
  ["黎", "Li"],
  ["苗", "Miao"],
];

function chinaSubadminDisplayName(name) {
  if (currentLanguage !== "en") return name;
  const raw = String(name || "");
  if (!/\p{Script=Han}/u.test(raw)) return raw;
  const suffixRules = [
    [/特别行政区$/u, " SAR"],
    [/自治县$/u, " Autonomous County"],
    [/自治州$/u, " Autonomous Prefecture"],
    [/林区$/u, " Forestry District"],
    [/地区$/u, " Prefecture"],
    [/盟$/u, " League"],
    [/县$/u, " County"],
    [/市$/u, " City"],
  ];
  const matched = suffixRules.find(([pattern]) => pattern.test(raw));
  const suffix = matched?.[1] || "";
  let base = matched ? raw.replace(matched[0], "") : raw;
  let descriptor = "";
  chineseEthnicPhrases.forEach(([phrase, label]) => {
    if (base.includes(phrase)) {
      base = base.replace(phrase, "");
      descriptor = descriptor ? `${descriptor} ${label}` : label;
    }
  });
  return [chineseToPinyinTitle(base), descriptor, suffix.trim()].filter(Boolean).join(" ");
}

function chineseToPinyinTitle(value) {
  return String(value || "")
    .split("")
    .map((char) => /\p{Script=Han}/u.test(char) ? (chinesePinyinMap[char] || char) : char)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : "")
    .join(" ");
}

const checklistEnglishLabels = {
  china5a: "China 5A Scenic Areas",
  chinaAncientCapitals: "Ancient Chinese Capitals",
  worldHeritage: "World Heritage",
  fiveMountains: "Five Great Mountains of China",
  threeMountains: "Three Famous Mountains of China",
  chinaHighAltitude: "Global High-Altitude Travel Challenge",
  buddhistMountains: "Four Sacred Buddhist Mountains",
  taoistMountains: "Four Sacred Taoist Mountains",
  grottoes: "Four Great Grottoes",
  usNationalParks: "U.S. National Parks",
};

const checklistItemEnglishNames = {
  泰山: "Mount Tai",
  华山: "Mount Hua",
  衡山: "Mount Heng (Hunan)",
  恒山: "Mount Heng (Shanxi)",
  嵩山: "Mount Song",
  黄山: "Mount Huangshan",
  庐山: "Mount Lu",
  雁荡山: "Yandang Mountains",
  五台山: "Mount Wutai",
  峨眉山: "Mount Emei",
  普陀山: "Mount Putuo",
  九华山: "Mount Jiuhua",
  "泰山 · 玉皇顶 · 1545m": "Mount Tai · Jade Emperor Peak · 1545m",
  "华山 · 南峰 · 2155m": "Mount Hua · South Peak · 2155m",
  "黄山 · 莲花峰 · 1864m": "Mount Huangshan · Lotus Peak · 1864m",
  "庐山 · 汉阳峰 · 1474m": "Mount Lu · Hanyang Peak · 1474m",
  "武夷山 · 黄岗山 · 2160m": "Wuyi Mountains · Huanggangshan · 2160m",
  "三清山 · 玉京峰 · 1819m": "Mount Sanqing · Yujing Peak · 1819m",
  "雁荡山 · 百岗尖 · 1108m": "Yandang Mountains · Baigangjian · 1108m",
  "普陀山 · 佛顶山 · 291m": "Mount Putuo · Foding Mountain · 291m",
  "九华山 · 十王峰 · 1342m": "Mount Jiuhua · Shiwang Peak · 1342m",
  "嵩山 · 峻极峰 · 1492m": "Mount Song · Junji Peak · 1492m",
  "衡山 · 祝融峰 · 1300m": "Mount Heng (Hunan) · Zhurong Peak · 1300m",
  "恒山 · 天峰岭 · 2016m": "Mount Heng (Shanxi) · Tianfengling · 2016m",
  "峨眉山 · 金顶 · 3079m": "Mount Emei · Golden Summit · 3079m",
  "五台山 · 北台叶斗峰 · 3061m": "Mount Wutai · North Terrace Yedou Peak · 3061m",
  "黄龙 · 五彩池 · 3576m": "Huanglong · Five-Color Pond · 3576m",
  "四姑娘山双桥沟 · 红杉林 · 3840m": "Mount Siguniang Shuangqiaogou · Redwood Forest · 3840m",
  "达古冰川 · 冰川观景区 · 4860m": "Dagu Glacier · Glacier Viewing Area · 4860m",
  "稻城亚丁 · 牛奶海 · 4600m": "Daocheng Yading · Milk Lake · 4600m",
  "稻城亚丁 · 五色海 · 4700m": "Daocheng Yading · Five-Color Lake · 4700m",
  "折多山 · 垭口 · 4298m": "Zheduo Mountain · Pass · 4298m",
  "雅哈垭口 · 观景点 · 4568m": "Yaha Pass · Viewpoint · 4568m",
  "子梅垭口 · 观景点 · 4550m": "Zimei Pass · Viewpoint · 4550m",
  "鱼子西 · 观景平台 · 4200m": "Yuzixi · Viewing Platform · 4200m",
  "冷嘎措 · 湖边观景点 · 4530m": "Lenggacuo · Lakeside Viewpoint · 4530m",
  "玉龙雪山 · 冰川公园平台 · 4680m": "Jade Dragon Snow Mountain · Glacier Park Platform · 4680m",
  "梅里雪山 · 飞来寺观景台 · 3400m": "Meili Snow Mountain · Feilai Temple Viewpoint · 3400m",
  "白马雪山 · 垭口 · 4292m": "Baima Snow Mountain · Pass · 4292m",
  "石卡雪山 · 索道高点 · 4449m": "Shika Snow Mountain · Cableway High Point · 4449m",
  "青海湖 · 湖区游览点 · 3196m": "Qinghai Lake · Lakeside Area · 3196m",
  "茶卡盐湖 · 景区湖区 · 3059m": "Chaka Salt Lake · Scenic Area · 3059m",
  "昆仑山口 · 公路垭口 · 4768m": "Kunlun Pass · Road Pass · 4768m",
  "可可西里 · 索南达杰保护站 · 4479m": "Hoh Xil · Sonam Dargye Protection Station · 4479m",
  "唐古拉山口 · 公路山口 · 5231m": "Tanggula Pass · Road Pass · 5231m",
  "白沙湖/白沙山 · 湖边观景点 · 3300m": "Baisha Lake / Baisha Mountain · Lakeside Viewpoint · 3300m",
  "喀拉库勒湖 · 湖边观景点 · 3600m": "Karakul Lake · Lakeside Viewpoint · 3600m",
  "慕士塔格峰景区 · 4688米石碑 · 4688m": "Muztagh Ata Scenic Area · 4688m Marker · 4688m",
  "盘龙古道 · 最高观景垭口 · 4216m": "Panlong Ancient Road · Highest View Pass · 4216m",
  "红其拉甫国门 · 国门附近 · 4733m": "Khunjerab Gate · Border Gate Area · 4733m",
  "纳木错 · 扎西半岛 · 4718m": "Namtso · Tashi Peninsula · 4718m",
  "羊卓雍措 · 湖区观景点 · 4441m": "Yamdrok Lake · Lakeside Viewpoint · 4441m",
  "普莫雍措 · 湖边游览点 · 5010m": "Pumoyongcuo · Lakeside Area · 5010m",
  "卡若拉冰川 · 公路观景区 · 5036m": "Karola Glacier · Roadside Viewpoint · 5036m",
  "珠峰景区 · 珠峰大本营 · 5200m": "Everest Scenic Area · Everest Base Camp · 5200m",
  "加吾拉山口 · 珠峰观景山口 · 5200m": "Gyawu La Pass · Everest View Pass · 5200m",
  "绒布寺 · 寺院观景区 · 4900m": "Rongbuk Monastery · Viewing Area · 4900m",
  "玛旁雍错 · 湖区游览点 · 4588m": "Lake Manasarovar · Lakeside Area · 4588m",
  "冈仁波齐 · 塔尔钦周边 · 4670m": "Mount Kailash · Darchen Area · 4670m",
  "南迦巴瓦 · 色季拉山口观景台 · 4728m": "Namcha Barwa · Sejila Pass Viewpoint · 4728m",
  "巴松措 · 湖区游览点 · 3480m": "Basum Lake · Lakeside Area · 3480m",
  "玉山 · 主峰步道终点 · 3952m": "Yushan · Main Peak Trail End · 3952m",
  "武当山 · 天柱峰 · 1612m": "Wudang Mountains · Tianzhu Peak · 1612m",
  "龙虎山 · 天门山 · 1300m": "Longhu Mountain · Tianmen Mountain · 1300m",
  "齐云山 · 廊崖 · 585m": "Qiyun Mountain · Langya · 585m",
  "青城山 · 老君阁/彭祖峰 · 1260m": "Mount Qingcheng · Laojun Pavilion / Pengzu Peak · 1260m",
  "珠峰南坡 · 尼泊尔大本营 · 5364m": "Everest South Side · Nepal Base Camp · 5364m",
  "安纳普尔纳环线 · Thorong La山口 · 5416m": "Annapurna Circuit · Thorong La Pass · 5416m",
  "列城公路 · Khardung La山口 · 5359m": "Leh Road · Khardung La Pass · 5359m",
  "班公湖 · 湖边观景点 · 4250m": "Pangong Tso · Lakeside Viewpoint · 4250m",
  "亚拉腊山 · 常规登山终点 · 5137m": "Mount Ararat · Standard Trek Summit · 5137m",
  "富士山 · 五合目 · 2305m": "Mount Fuji · 5th Station · 2305m",
  "基纳巴卢山 · Low's Peak步道终点 · 4095m": "Mount Kinabalu · Low's Peak Trail End · 4095m",
  "汉拿山 · 白鹿潭步道终点 · 1950m": "Hallasan · Baengnokdam Trail End · 1950m",
  "南针峰 · 缆车观景台 · 3842m": "Aiguille du Midi · Cable Car Viewpoint · 3842m",
  "小马特洪峰 · 缆车高点 · 3883m": "Klein Matterhorn · Cable Car High Point · 3883m",
  "戈尔内格拉特 · 登山铁路观景台 · 3135m": "Gornergrat · Mountain Railway Viewpoint · 3135m",
  "少女峰火车站 · 欧洲屋脊 · 3454m": "Jungfraujoch · Top of Europe Railway Station · 3454m",
  "楚格峰 · 缆车/齿轨铁路高点 · 2962m": "Zugspitze · Cable Car / Cog Railway High Point · 2962m",
  "大钟山高山公路 · Edelweissspitze观景点 · 2571m": "Grossglockner High Alpine Road · Edelweissspitze Viewpoint · 2571m",
  "埃特纳火山 · 缆车上站区域 · 2500m": "Mount Etna · Upper Cable Car Area · 2500m",
  "泰德峰 · 缆车上站 · 3555m": "Mount Teide · Upper Cable Car Station · 3555m",
  "莫纳克亚山 · 公路可达峰顶 · 4207m": "Mauna Kea · Road-Accessible Summit · 4207m",
  "派克峰 · 公路/齿轨铁路峰顶 · 4302m": "Pikes Peak · Road / Cog Railway Summit · 4302m",
  "蓝天山 · 峰顶公路高点 · 4350m": "Mount Blue Sky · Summit Road High Point · 4350m",
  "落基山国家公园 · Trail Ridge Road高点 · 3713m": "Rocky Mountain National Park · Trail Ridge Road High Point · 3713m",
  "哈莱阿卡拉 · 火山口观景台 · 3055m": "Haleakala · Crater Viewpoint · 3055m",
  "奥里萨巴峰 · Piedra Grande营地 · 4260m": "Pico de Orizaba · Piedra Grande Hut · 4260m",
  "惠斯勒山 · Peak Chair区域 · 2182m": "Whistler Mountain · Peak Chair Area · 2182m",
  "阿空加瓜省立公园 · Plaza de Mulas营地 · 4300m": "Aconcagua Provincial Park · Plaza de Mulas Camp · 4300m",
  "彩虹山 · 观景点 · 5036m": "Rainbow Mountain · Viewpoint · 5036m",
  "马丘比丘山 · 步道终点 · 3082m": "Machu Picchu Mountain · Trail End · 3082m",
  "拉巴斯/埃尔阿尔托 · 城市高点 · 4060m": "La Paz / El Alto · City High Point · 4060m",
  "乌尤尼盐沼 · 盐沼游览点 · 3656m": "Salar de Uyuni · Salt Flat Viewpoint · 3656m",
  "科托帕希国家公园 · Jose Rivas山屋 · 4864m": "Cotopaxi National Park · Jose Rivas Refuge · 4864m",
  "钦博拉索 · Carrel山屋 · 4850m": "Chimborazo · Carrel Refuge · 4850m",
  "乞力马扎罗 · Uhuru Peak步道终点 · 5895m": "Kilimanjaro · Uhuru Peak Trail End · 5895m",
  "肯尼亚山 · Point Lenana步道终点 · 4985m": "Mount Kenya · Point Lenana Trail End · 4985m",
  "图卜卡勒峰 · 常规登山终点 · 4167m": "Mount Toubkal · Standard Trek Summit · 4167m",
  "西门山国家公园 · Bwahit Pass观景点 · 4200m": "Simien Mountains National Park · Bwahit Pass Viewpoint · 4200m",
  "萨尼山口 · 公路山口 · 2876m": "Sani Pass · Road Pass · 2876m",
  "科修斯科山 · 步道终点 · 2228m": "Mount Kosciuszko · Trail End · 2228m",
  "卡拉帕塔 · 珠峰观景徒步点 · 5644m": "Kala Patthar · Everest View Trek Point · 5644m",
  "戈京日 · 湖区徒步观景点 · 5357m": "Gokyo Ri · Lakes Trek Viewpoint · 5357m",
  "昌拉山口 · 公路山口 · 5360m": "Chang La · Road Pass · 5360m",
  "塔格朗拉山口 · 公路山口 · 5328m": "Taglang La · Road Pass · 5328m",
  "古鲁东玛湖 · 湖边游览点 · 5150m": "Gurudongmar Lake · Lakeside Viewpoint · 5150m",
  "锡金零点 · 公路高点 · 4663m": "Yumthang Zero Point · Road High Point · 4663m",
  "阿克拜塔尔山口 · 帕米尔公路山口 · 4655m": "Ak-Baital Pass · Pamir Highway Pass · 4655m",
  "阿拉湖山口 · 徒步山口 · 3860m": "Ala-Kul Pass · Trekking Pass · 3860m",
  "巴尔斯孔山口 · 公路山口 · 3754m": "Barskoon Pass · Road Pass · 3754m",
  "林贾尼火山 · 常规登山终点 · 3726m": "Mount Rinjani · Standard Trek Summit · 3726m",
  "番西邦峰 · 缆车/步道终点 · 3143m": "Fansipan · Cable Car / Trail End · 3143m",
  "琼布拉克 · Talgar Pass滑雪区高点 · 3180m": "Shymbulak · Talgar Pass Ski Area High Point · 3180m",
  "布恩山 · 徒步观景点 · 3210m": "Poon Hill · Trekking Viewpoint · 3210m",
  "宋库尔湖 · 湖边游览点 · 3016m": "Song Kul Lake · Lakeside Area · 3016m",
  "立山室堂 · 阿尔卑斯路线高点 · 2450m": "Tateyama Murodo · Alpine Route High Point · 2450m",
  "因他暖山 · 泰国最高点 · 2565m": "Doi Inthanon · Thailand High Point · 2565m",
  "普拉格山 · 步道终点 · 2922m": "Mount Pulag · Trail End · 2922m",
  "亚当峰 · 朝圣步道终点 · 2243m": "Adam's Peak · Pilgrimage Trail End · 2243m",
  "杰贝勒杰斯山 · 公路观景点 · 1934m": "Jebel Jais · Road Viewpoint · 1934m",
  "布罗莫火山 · King Kong Hill观景点 · 2600m": "Mount Bromo · King Kong Hill Viewpoint · 2600m",
  "铁力士山 · 缆车观景台 · 3020m": "Titlis · Cable Car Viewpoint · 3020m",
  "雪朗峰 · Piz Gloria观景台 · 2970m": "Schilthorn · Piz Gloria Viewpoint · 2970m",
  "冰川3000 · Scex Rouge观景点 · 2971m": "Glacier 3000 · Scex Rouge Viewpoint · 2971m",
  "迪亚沃勒扎 · 缆车观景台 · 2978m": "Diavolezza · Cable Car Viewpoint · 2978m",
  "科尔瓦奇峰 · 缆车高点 · 3303m": "Corvatsch · Cable Car High Point · 3303m",
  "鹰巢站 · 勃朗峰有轨电车终点 · 2372m": "Nid d'Aigle · Mont Blanc Tramway Terminus · 2372m",
  "南比戈尔峰 · 缆车观景台 · 2877m": "Pic du Midi de Bigorre · Cable Car Viewpoint · 2877m",
  "马尔莫拉达 · Punta Rocca缆车站 · 3265m": "Marmolada · Punta Rocca Cable Car Station · 3265m",
  "塞切达山 · 缆车观景点 · 2519m": "Seceda · Cable Car Viewpoint · 2519m",
  "斯泰尔维奥山口 · 公路山口 · 2758m": "Stelvio Pass · Road Pass · 2758m",
  "弗朗茨约瑟夫高地 · 大钟山观景点 · 2369m": "Kaiser-Franz-Josefs-Hoehe · Grossglockner Viewpoint · 2369m",
  "厄尔布鲁士山 · Garabashi缆车站 · 3847m": "Mount Elbrus · Garabashi Cable Car Station · 3847m",
  "卡兹别克 · 圣三一教堂观景点 · 2170m": "Kazbegi · Gergeti Trinity Church Viewpoint · 2170m",
  "穆萨拉峰 · 步道终点 · 2925m": "Musala · Trail End · 2925m",
  "特里格拉夫峰 · 常规徒步终点 · 2864m": "Triglav · Standard Trek Summit · 2864m",
  "奥林匹斯山 · 米蒂卡斯峰 · 2918m": "Mount Olympus · Mytikas Summit · 2918m",
  "惠特尼山 · 步道终点 · 4421m": "Mount Whitney · Trail End · 4421m",
  "格雷斯峰 · 步道终点 · 4352m": "Grays Peak · Trail End · 4352m",
  "惠勒峰 · 新墨西哥步道终点 · 4013m": "Wheeler Peak · New Mexico Trail End · 4013m",
  "洛夫兰山口 · 公路山口 · 3655m": "Loveland Pass · Road Pass · 3655m",
  "独立山口 · 公路山口 · 3687m": "Independence Pass · Road Pass · 3687m",
  "汉弗莱斯峰 · 步道终点 · 3852m": "Humphreys Peak · Trail End · 3852m",
  "拉森峰 · 火山步道终点 · 3187m": "Lassen Peak · Volcano Trail End · 3187m",
  "猛犸山 · 缆车高点 · 3369m": "Mammoth Mountain · Gondola High Point · 3369m",
  "华盛顿山 · 公路/齿轨铁路峰顶 · 1917m": "Mount Washington · Road / Cog Railway Summit · 1917m",
  "克灵曼圆顶 · 观景塔 · 2025m": "Clingmans Dome · Observation Tower · 2025m",
  "硫磺山 · 班夫缆车上站 · 2281m": "Sulphur Mountain · Banff Gondola Upper Station · 2281m",
  "惠斯勒斯山 · 贾斯珀缆车高点 · 2463m": "The Whistlers · Jasper SkyTram High Point · 2463m",
  "内瓦多德托卢卡 · 火山口游览点 · 4200m": "Nevado de Toluca · Crater Viewpoint · 4200m",
  "伊斯塔西瓦特尔 · La Joya登山口 · 3970m": "Iztaccihuatl · La Joya Trailhead · 3970m",
  "奇里波峰 · 步道终点 · 3820m": "Cerro Chirripo · Trail End · 3820m",
  "基多缆车 · Cruz Loma观景点 · 4050m": "Quito Teleferico · Cruz Loma Viewpoint · 4050m",
  "基洛托阿火山湖 · 环湖观景点 · 3914m": "Quilotoa Crater Lake · Rim Viewpoint · 3914m",
  "安蒂萨纳 · 火山观景点 · 4000m": "Antisana · Volcano Viewpoint · 4000m",
  "内瓦多德鲁伊斯 · 游客区 · 4050m": "Nevado del Ruiz · Visitor Area · 4050m",
  "蒙塞拉特山 · 缆车山顶 · 3152m": "Monserrate · Cable Car Summit · 3152m",
  "科尔卡峡谷 · 秃鹰十字观景台 · 3287m": "Colca Canyon · Cruz del Condor Viewpoint · 3287m",
  "查卡尔塔亚 · 公路高点 · 5300m": "Chacaltaya · Road High Point · 5300m",
  "红湖 · 湖边观景点 · 4278m": "Laguna Colorada · Lakeside Viewpoint · 4278m",
  "塔蒂奥间歇泉 · 游览区 · 4320m": "El Tatio Geysers · Visitor Area · 4320m",
  "米斯坎蒂湖 · 湖边观景点 · 4120m": "Miscanti Lake · Lakeside Viewpoint · 4120m",
  "乌马太湖 · 湖边观景点 · 4200m": "Humantay Lake · Lakeside Viewpoint · 4200m",
  "拉古纳69 · 湖边步道终点 · 4600m": "Laguna 69 · Lakeside Trail End · 4600m",
  "解放者山口 · 国际公路山口 · 3200m": "Los Libertadores Pass · International Road Pass · 3200m",
  "帕斯托鲁里冰川 · 游览步道高点 · 5000m": "Pastoruri Glacier · Visitor Trail High Point · 5000m",
  "马拉加山口 · 公路山口 · 4316m": "Abra Malaga · Road Pass · 4316m",
  "瓦斯卡兰国家公园 · 扬加努科湖区 · 3850m": "Huascaran National Park · Llanganuco Lakes Area · 3850m",
  "的的喀喀湖 · 湖边游览点 · 3812m": "Lake Titicaca · Lakeside Area · 3812m",
  "内瓦多谷 · 滑雪区高点 · 3025m": "Valle Nevado · Ski Area High Point · 3025m",
  "罗唐山口 · 公路山口 · 3978m": "Rohtang Pass · Road Pass · 3978m",
  "昆祖姆山口 · 公路山口 · 4551m": "Kunzum Pass · Road Pass · 4551m",
  "巴布萨尔山口 · 公路山口 · 4173m": "Babusar Pass · Road Pass · 4173m",
  "费尔梅多斯 · 南迦帕尔巴特观景点 · 3300m": "Fairy Meadows · Nanga Parbat Viewpoint · 3300m",
  "贝尔图斯山口 · 公路山口 · 3337m": "Beartooth Pass · Road Pass · 3337m",
  "蒂奥加山口 · 公路山口 · 3031m": "Tioga Pass · Road Pass · 3031m",
  "马拉塞拉山口 · 莱索托公路高点 · 3222m": "Mahlasela Pass · Lesotho Road High Point · 3222m",
  "乘鞍岳 · 畳平 · 2702m": "Mount Norikura · Tatamidaira · 2702m",
  "帕塔潘帕山口 · 火山观景公路点 · 4910m": "Patapampa Pass · Volcano View Road Point · 4910m",
  "琼加拉湖 · 湖边观景点 · 4517m": "Lake Chungara · Lakeside Viewpoint · 4517m",
  "威廉山 · 巴布亚新几内亚步道终点 · 4509m": "Mount Wilhelm · Papua New Guinea Trail End · 4509m",
  "拉拉亚山口 · 公路山口 · 4335m": "La Raya Pass · Road Pass · 4335m",
  "塔胡穆尔科火山 · 常规登山终点 · 4220m": "Tajumulco Volcano · Standard Trek Summit · 4220m",
  "达马万德山 · Bargah Sevom营地 · 4200m": "Mount Damavand · Bargah Sevom Camp · 4200m",
  "安纳普尔纳大本营 · 徒步营地 · 4130m": "Annapurna Base Camp · Trekking Camp · 4130m",
  "皮凯峰 · 珠峰远眺点 · 4065m": "Pikey Peak · Everest Viewpoint · 4065m",
  "阿拉加茨山 · 南峰步道终点 · 3888m": "Mount Aragats · South Summit Trail End · 3888m",
  "托查尔山 · 缆车高点 · 3740m": "Tochal · Cable Car High Point · 3740m",
  "科顿伍德山口 · 公路山口 · 3696m": "Cottonwood Pass · Road Pass · 3696m",
  "波波卡特佩特尔 · Paso de Cortes山口 · 3600m": "Popocatepetl · Paso de Cortes Pass · 3600m",
  "玛蒂希玛尔 · 高营地 · 3580m": "Mardi Himal · High Camp · 3580m",
  "瓜内拉山口 · 公路山口 · 3557m": "Guanella Pass · Road Pass · 3557m",
  "米特阿拉林 · 冰川地铁高点 · 3457m": "Mittelallalin · Metro Alpin High Point · 3457m",
  "尼拉贡戈火山 · 火山口徒步终点 · 3470m": "Nyiragongo Volcano · Crater Trek End · 3470m",
  "莫纳罗亚山 · 公路观测站 · 3397m": "Mauna Loa · Road Observatory · 3397m",
  "乌凯迈登 · 滑雪区高点 · 3268m": "Oukaimeden · Ski Area High Point · 3268m",
  "杰克逊霍尔缆车 · Rendezvous Mountain · 3185m": "Jackson Hole Tram · Rendezvous Mountain · 3185m",
  "穆兰杰山 · Sapitwa步道终点 · 3002m": "Mount Mulanje · Sapitwa Trail End · 3002m",
  "大阿拉木图湖 · 湖边游览点 · 2511m": "Big Almaty Lake · Lakeside Area · 2511m",
  "三峰山景区 · Auronzo山屋 · 2320m": "Tre Cime di Lavaredo · Rifugio Auronzo · 2320m",
  "波尔多伊山口 · 公路山口 · 2239m": "Pordoi Pass · Road Pass · 2239m",
  "皮拉图斯山 · 齿轨/缆车高点 · 2128m": "Pilatus · Cog Railway / Cable Car High Point · 2128m",
  "库克山国家公园 · Mueller Hut · 1800m": "Aoraki / Mount Cook National Park · Mueller Hut · 1800m",
  "阿凯山口 · 公路山口 · 4895m": "Abra del Acay · Road Pass · 4895m",
  "拉昆布雷山口 · 永加斯公路高点 · 4650m": "La Cumbre Pass · Yungas Road High Point · 4650m",
  "萨尔坎泰山口 · 徒步山口 · 4630m": "Salkantay Pass · Trekking Pass · 4630m",
  "霍尔诺卡尔山 · 彩山观景点 · 4350m": "Hornocal · Colored Mountain Viewpoint · 4350m",
  "萨哈马国家公园 · 间歇泉区 · 4300m": "Sajama National Park · Geyser Area · 4300m",
  "基孜勒阿尔特山口 · 帕米尔公路山口 · 4280m": "Kyzyl-Art Pass · Pamir Highway Pass · 4280m",
  "哈马山口 · 国际公路山口 · 4200m": "Paso de Jama · International Road Pass · 4200m",
  "德奥赛高原 · Sheosar湖 · 4142m": "Deosai Plains · Sheosar Lake · 4142m",
  "帕帕亚克塔山口 · 公路山口 · 4064m": "Papallacta Pass · Road Pass · 4064m",
  "帕尔卡约彩虹山 · 观景点 · 4900m": "Palcoyo Rainbow Mountain · Viewpoint · 4900m",
  "卡拉库里湖 · 帕米尔公路湖区 · 3914m": "Karakul Lake · Pamir Highway Lake Area · 3914m",
  "亚什库勒湖 · 湖边观景点 · 3734m": "Yashilkul Lake · Lakeside Viewpoint · 3734m",
  "香多尔山口 · 公路山口 · 3738m": "Shandur Pass · Road Pass · 3738m",
  "图奥阿舒山口 · 公路山口 · 3586m": "Too-Ashuu Pass · Road Pass · 3586m",
  "拉玛草甸 · 南迦帕尔巴特观景点 · 3300m": "Rama Meadows · Nanga Parbat Viewpoint · 3300m",
  "塔什拉巴特 · 高原驿站 · 3200m": "Tash Rabat · Highland Caravanserai · 3200m",
  "伊塞兰山口 · 阿尔卑斯公路山口 · 2764m": "Col de l'Iseran · Alpine Road Pass · 2764m",
  "蒂默尔斯约赫山口 · 阿尔卑斯公路山口 · 2474m": "Timmelsjoch · Alpine Road Pass · 2474m",
  "富尔卡山口 · 阿尔卑斯公路山口 · 2429m": "Furka Pass · Alpine Road Pass · 2429m",
  "格里姆瑟尔山口 · 阿尔卑斯公路山口 · 2164m": "Grimsel Pass · Alpine Road Pass · 2164m",
  "苏斯滕山口 · 阿尔卑斯公路山口 · 2224m": "Susten Pass · Alpine Road Pass · 2224m",
  "十字架山口 · 高加索公路山口 · 2379m": "Jvari Pass · Caucasus Road Pass · 2379m",
  "科鲁尔迪湖 · 梅斯蒂亚观景徒步点 · 2740m": "Koruldi Lakes · Mestia View Trek Point · 2740m",
  "塞利姆山口 · 亚美尼亚公路山口 · 2410m": "Selim Pass · Armenia Road Pass · 2410m",
  "沙赫达格 · 滑雪区高点 · 2500m": "Shahdag · Ski Area High Point · 2500m",
  "雷尼尔山 · Camp Muir · 3105m": "Mount Rainier · Camp Muir · 3105m",
  "大提顿 · Paintbrush Divide · 3260m": "Grand Teton · Paintbrush Divide · 3260m",
  "黄石 · Mount Washburn步道终点 · 3122m": "Yellowstone · Mount Washburn Trail End · 3122m",
  "锡达布雷克斯 · 观景点 · 3150m": "Cedar Breaks · Viewpoint · 3150m",
  "布赖恩峰 · 公路高点 · 3446m": "Brian Head Peak · Road High Point · 3446m",
  "内华达惠勒峰 · 步道终点 · 3982m": "Wheeler Peak Nevada · Trail End · 3982m",
  "瓜达卢佩峰 · 步道终点 · 2667m": "Guadalupe Peak · Trail End · 2667m",
  "桑迪亚峰 · 缆车高点 · 3163m": "Sandia Peak · Tramway High Point · 3163m",
  "洛根山口 · 冰川国家公园公路山口 · 2026m": "Logan Pass · Glacier National Park Road Pass · 2026m",
  "优胜美地 · 冰川点 · 2199m": "Yosemite · Glacier Point · 2199m",
  "布莱斯峡谷 · Rainbow Point · 2778m": "Bryce Canyon · Rainbow Point · 2778m",
  "大峡谷北缘 · Bright Angel Point · 2500m": "Grand Canyon North Rim · Bright Angel Point · 2500m",
  "梅萨维德 · Park Point · 2613m": "Mesa Verde · Park Point · 2613m",
  "皮兹奈尔峰 · 缆车高点 · 3056m": "Piz Nair · Cable Car High Point · 3056m",
  "蒙福尔峰 · 缆车高点 · 3330m": "Mont Fort · Cable Car High Point · 3330m",
  "多洛米蒂萨斯波尔多伊 · 缆车高点 · 2950m": "Sass Pordoi · Cable Car High Point · 2950m",
  "格莱舍天堂 · Trockener Steg · 2939m": "Matterhorn Glacier Paradise Area · Trockener Steg · 2939m",
  "卡普伦基茨施泰因峰 · 缆车高点 · 3029m": "Kitzsteinhorn · Cable Car High Point · 3029m",
  "陶恩山阿尔卑斯公路 · Hochtor山口 · 2504m": "Grossglockner Road · Hochtor Pass · 2504m",
  "锡尔夫雷塔高山公路 · Bielerhohe · 2037m": "Silvretta High Alpine Road · Bielerhoehe · 2037m",
  "曼利申 · 缆车山脊 · 2343m": "Mannlichen · Cable Car Ridge · 2343m",
  "格林德瓦First · 缆车高点 · 2168m": "Grindelwald First · Cable Car High Point · 2168m",
  "布赖特峰高原 · 冰川观景点 · 3480m": "Breithorn Plateau · Glacier Viewpoint · 3480m",
  "达赫施泰因 · Skywalk观景台 · 2700m": "Dachstein · Skywalk Viewpoint · 2700m",
  "北链山 · Hafelekar缆车站 · 2256m": "Nordkette · Hafelekar Cable Car Station · 2256m",
  "盖斯拉赫科格尔 · 缆车高点 · 3058m": "Gaislachkogl · Cable Car High Point · 3058m",
  "红针峰 · Les Arcs缆车高点 · 3226m": "Aiguille Rouge · Les Arcs Cable Car High Point · 3226m",
  "加尔赫峰 · 挪威步道终点 · 2469m": "Galdhopiggen · Norway Trail End · 2469m",
  "路易斯湖 · 六冰川平原茶屋 · 2100m": "Lake Louise · Plain of Six Glaciers Tea House · 2100m",
  "威尔科克斯山口 · 冰原大道徒步点 · 2375m": "Wilcox Pass · Icefields Parkway Trek Point · 2375m",
  "库克山国家公园 · Sealy Tarns · 1300m": "Aoraki / Mount Cook National Park · Sealy Tarns · 1300m",
  "大雪山旭岳 · 姿见站/步道终点 · 2291m": "Daisetsuzan Asahidake · Sugatami Station / Trail End · 2291m",
  "白马岳 · 八方池观景点 · 2060m": "Mount Hakuba · Happo Pond Viewpoint · 2060m",
  "藏王山 · 御釜观景点 · 1758m": "Mount Zao · Okama Crater Viewpoint · 1758m",
  "阿苏山 · 中岳火口观景点 · 1500m": "Mount Aso · Nakadake Crater Viewpoint · 1500m",
  "雾岛山 · 高千穗峰步道终点 · 1574m": "Kirishima · Takachiho-no-mine Trail End · 1574m",
  "雪岳山 · 大青峰步道终点 · 1708m": "Seoraksan · Daecheongbong Trail End · 1708m",
  "路易斯湖 · Sentinel Pass · 2611m": "Lake Louise · Sentinel Pass · 2611m",
  "贾斯珀 · Skyline Trail The Notch · 2511m": "Jasper · Skyline Trail The Notch · 2511m",
  "约霍国家公园 · Opabin Plateau · 2300m": "Yoho National Park · Opabin Plateau · 2300m",
  "班夫 · Parker Ridge · 2275m": "Banff · Parker Ridge · 2275m",
  "加里波第 · Panorama Ridge · 2133m": "Garibaldi · Panorama Ridge · 2133m",
  "本洛蒙德山 · 皇后镇步道终点 · 1748m": "Ben Lomond · Queenstown Trail End · 1748m",
  "罗伊峰 · 瓦纳卡步道终点 · 1578m": "Roys Peak · Wanaka Trail End · 1578m",
  "凯普勒步道 · Luxmore Hut · 1085m": "Kepler Track · Luxmore Hut · 1085m",
  "菲茨罗伊 · Laguna de los Tres · 1170m": "Fitz Roy · Laguna de los Tres · 1170m",
  "百内三塔 · Base Torres观景点 · 900m": "Torres del Paine · Base Torres Viewpoint · 900m",
  "塞罗卡斯蒂略 · 湖边观景点 · 1450m": "Cerro Castillo · Lakeside Viewpoint · 1450m",
  "本尼维斯山 · 步道终点 · 1345m": "Ben Nevis · Trail End · 1345m",
  "斯诺登山 · 步道/铁路终点 · 1085m": "Snowdon · Trail / Railway Summit · 1085m",
  "卡朗图厄尔山 · 步道终点 · 1039m": "Carrauntoohil · Trail End · 1039m",
  "凯布讷山 · 瑞典步道终点 · 2097m": "Kebnekaise · Sweden Trail End · 2097m",
  "哈尔蒂山 · 芬兰高点步道 · 1324m": "Halti · Finland High Point Trail · 1324m",
  "达尔斯尼巴 · 峡湾公路观景台 · 1476m": "Dalsnibba · Fjord Road Viewpoint · 1476m",
  "洪扎 · Eagle's Nest观景台 · 2850m": "Hunza · Eagle's Nest Viewpoint · 2850m",
  "纳尔塔尔山谷 · 湖区游览点 · 3050m": "Naltar Valley · Lakes Area · 3050m",
  "桑达克普 · 喜马拉雅观景点 · 3636m": "Sandakphu · Himalayan Viewpoint · 3636m",
  "厄拉维库拉姆国家公园 · Anamudi观景点 · 2695m": "Eravikulam National Park · Anamudi Viewpoint · 2695m",
  "阿波山 · 菲律宾步道终点 · 2954m": "Mount Apo · Philippines Trail End · 2954m",
  "克林奇火山 · 常规登山终点 · 3805m": "Mount Kerinci · Standard Trek Summit · 3805m",
  "阿贡火山 · 常规登山终点 · 3031m": "Mount Agung · Standard Trek Summit · 3031m",
  "金马仑高原 · Brinchang山 · 2032m": "Cameron Highlands · Mount Brinchang · 2032m",
  "埃尔吉耶斯山 · 滑雪区高点 · 3360m": "Mount Erciyes · Ski Area High Point · 3360m",
  "内姆鲁特山 · 山顶遗址 · 2134m": "Mount Nemrut · Summit Archaeological Site · 2134m",
  "梅鲁山 · 步道终点 · 4566m": "Mount Meru · Trail End · 4566m",
  "萨内蒂高原 · 公路高点 · 4377m": "Sanetti Plateau · Road High Point · 4377m",
  "拉斯达申峰 · 常规徒步终点 · 4550m": "Ras Dashen · Standard Trek Summit · 4550m",
  "喀麦隆山 · 常规登山终点 · 4040m": "Mount Cameroon · Standard Trek Summit · 4040m",
  "图盖拉瀑布顶端 · 德拉肯斯堡步道点 · 3000m": "Tugela Falls Top · Drakensberg Trail Point · 3000m",
  "内日峰 · 留尼汪步道终点 · 3070m": "Piton des Neiges · Reunion Trail End · 3070m",
  "塔拉纳基山 · 步道终点 · 2518m": "Mount Taranaki · Trail End · 2518m",
  "鲁阿佩胡山 · 火山口湖观景点 · 2672m": "Mount Ruapehu · Crater Lake Viewpoint · 2672m",
  "汤加里罗红火山口 · 穿越步道高点 · 1886m": "Tongariro Red Crater · Alpine Crossing High Point · 1886m",
  莫高窟: "Mogao Caves",
  云冈石窟: "Yungang Grottoes",
  龙门石窟: "Longmen Grottoes",
  麦积山石窟: "Maijishan Grottoes",
};

const checklistItemDetailLabels = {
  threeMountains: {
    黄山: { zh: "黄山 · 莲花峰 · 1864m", en: "Mount Huangshan · Lotus Peak · 1864m" },
    庐山: { zh: "庐山 · 汉阳峰 · 1474m", en: "Mount Lu · Hanyang Peak · 1474m" },
    雁荡山: { zh: "雁荡山 · 百岗尖 · 1108m", en: "Yandang Mountains · Baigangjian · 1108m" },
  },
  fiveMountains: {
    泰山: { zh: "泰山 · 玉皇顶 · 1545m", en: "Mount Tai · Jade Emperor Peak · 1545m" },
    华山: { zh: "华山 · 南峰 · 2155m", en: "Mount Hua · South Peak · 2155m" },
    衡山: { zh: "衡山 · 祝融峰 · 1300m", en: "Mount Heng (Hunan) · Zhurong Peak · 1300m" },
    恒山: { zh: "恒山 · 天峰岭 · 2016m", en: "Mount Heng (Shanxi) · Tianfengling · 2016m" },
    嵩山: { zh: "嵩山 · 峻极峰 · 1492m", en: "Mount Song · Junji Peak · 1492m" },
  },
  buddhistMountains: {
    五台山: { zh: "五台山 · 北台叶斗峰 · 3061m", en: "Mount Wutai · North Terrace Yedou Peak · 3061m" },
    峨眉山: { zh: "峨眉山 · 金顶 · 3079m", en: "Mount Emei · Golden Summit · 3079m" },
    普陀山: { zh: "普陀山 · 佛顶山 · 291m", en: "Mount Putuo · Foding Mountain · 291m" },
    九华山: { zh: "九华山 · 十王峰 · 1342m", en: "Mount Jiuhua · Shiwang Peak · 1342m" },
  },
  taoistMountains: {
    武当山: { zh: "武当山 · 天柱峰 · 1612m", en: "Wudang Mountains · Tianzhu Peak · 1612m" },
    龙虎山: { zh: "龙虎山 · 天门山 · 1300m", en: "Longhu Mountain · Tianmen Mountain · 1300m" },
    齐云山: { zh: "齐云山 · 廊崖 · 585m", en: "Qiyun Mountain · Langya · 585m" },
    青城山: { zh: "青城山 · 老君阁/彭祖峰 · 1260m", en: "Mount Qingcheng · Laojun Pavilion / Pengzu Peak · 1260m" },
  },
};

function checklistLabel(key, list) {
  return currentLanguage === "en" ? checklistEnglishLabels[key] || list.label : list.label;
}

function checklistGroupDisplayName(key, group) {
  if (currentLanguage !== "en") return group;
  if (key === "china5a") return chinaProvinceDisplayName(group);
  if (key === "worldHeritage") return worldHeritageCountryDisplayName(group);
  return group;
}

function worldHeritageCountryDisplayName(countryName) {
  const coverageId = worldHeritageCountryCoverageId(countryName);
  if (coverageId) return countryDisplayName(coverageId);
  return countryName;
}

function worldHeritageItemEnglishName(item) {
  const raw = String(item || "").trim();
  if (!raw) return "";
  return worldHeritageEnglishNames[raw]
    || worldHeritageEnglishNames[canonicalPlaceKey(raw)]
    || "";
}

function checklistItemDisplayName(key, item) {
  if (key === "usNationalParks" && usNpsUnitById.has(String(item || ""))) {
    const unit = usNpsUnitById.get(String(item || ""));
    return currentLanguage === "en" ? unit.name : unit.zhName || unit.name;
  }
  const detailed = checklistItemDetailLabels[key]?.[item];
  if (detailed) return currentLanguage === "en" ? detailed.en : detailed.zh;
  if (key === "worldHeritage" && worldHeritageParentNames[canonicalPlaceKey(item)]) {
    const parent = worldHeritageParentNames[canonicalPlaceKey(item)];
    const primary = currentLanguage === "en" ? worldHeritageItemEnglishName(item) || item : item;
    const parentName = currentLanguage === "en" ? parent.en : parent.zh;
    return `${primary} · ${parentName}`;
  }
  if (currentLanguage !== "en") {
    if (key === "usNationalParks") return String(item || "").replace(/（[^（）]+）|\([^()]+\)/g, "").trim();
    return item;
  }
  if (key === "worldHeritage" && worldHeritageItemEnglishName(item)) return worldHeritageItemEnglishName(item);
  const parenthetical = englishNameInParentheses(item);
  if (parenthetical) return parenthetical;
  if (checklistItemEnglishNames[item]) return checklistItemEnglishNames[item];
  return item;
}

function china5aStatusSourceText() {
  if (currentLanguage !== "en") return china5aCatalogStatus.source;
  return china5aCatalogStatus.source.includes("备用") ? "Built-in fallback catalog" : "Local complete catalog";
}

function china5aStatusDetailText() {
  if (currentLanguage !== "en") return china5aCatalogStatus.detail;
  const coordinateCount = Object.keys(china5aCoordinates || {}).length;
  return coordinateCount
    ? `${china5aOfficialTotal} 5A scenic areas, ${coordinateCount} local coordinates`
    : `${china5aOfficialTotal} 5A scenic areas`;
}

const chinaProvinceByAdcode = {
  110000: "北京", 120000: "天津", 130000: "河北", 140000: "山西", 150000: "内蒙古", 210000: "辽宁", 220000: "吉林", 230000: "黑龙江",
  310000: "上海", 320000: "江苏", 330000: "浙江", 340000: "安徽", 350000: "福建", 360000: "江西", 370000: "山东", 410000: "河南",
  420000: "湖北", 430000: "湖南", 440000: "广东", 450000: "广西", 460000: "海南", 500000: "重庆", 510000: "四川", 520000: "贵州",
  530000: "云南", 540000: "西藏", 610000: "陕西", 620000: "甘肃", 630000: "青海", 640000: "宁夏", 650000: "新疆",
  710000: "台湾", 810000: "香港", 820000: "澳门",
};

const taiwanSubadminUnits = [
  ["台北市", 121.5654, 25.0330], ["新北市", 121.4628, 25.0169], ["桃园市", 121.3010, 24.9936], ["台中市", 120.6736, 24.1477],
  ["台南市", 120.2270, 22.9999], ["高雄市", 120.3014, 22.6273], ["基隆市", 121.7392, 25.1276], ["新竹市", 120.9686, 24.8039],
  ["嘉义市", 120.4491, 23.4801], ["新竹县", 121.0177, 24.8392], ["苗栗县", 120.8214, 24.5602], ["彰化县", 120.5161, 24.0518],
  ["南投县", 120.9876, 23.8388], ["云林县", 120.3897, 23.7559], ["嘉义县", 120.2555, 23.4518], ["屏东县", 120.5487, 22.5519],
  ["宜兰县", 121.7530, 24.7021], ["花莲县", 121.3542, 23.7569], ["台东县", 121.1438, 22.7613], ["澎湖县", 119.6151, 23.5655],
  ["金门县", 118.3186, 24.4368], ["连江县", 119.9517, 26.1602],
].map(([name, lng, lat]) => ({ province: "台湾", name, center: [lng, lat] }));

const chinaDirectSubadminUnits = [
  ["海南", "五指山市", 109.5169, 18.7769],
  ["海南", "琼海市", 110.4668, 19.2460],
  ["海南", "文昌市", 110.7977, 19.5433],
  ["海南", "万宁市", 110.3888, 18.7962],
  ["海南", "东方市", 108.6538, 19.1019],
  ["海南", "定安县", 110.3588, 19.6814],
  ["海南", "屯昌县", 110.1028, 19.3629],
  ["海南", "澄迈县", 110.0071, 19.7385],
  ["海南", "临高县", 109.6877, 19.9083],
  ["海南", "白沙黎族自治县", 109.4526, 19.2246],
  ["海南", "昌江黎族自治县", 109.0558, 19.2983],
  ["海南", "乐东黎族自治县", 109.1754, 18.7476],
  ["海南", "陵水黎族自治县", 110.0375, 18.5050],
  ["海南", "保亭黎族苗族自治县", 109.7025, 18.6391],
  ["海南", "琼中黎族苗族自治县", 109.8399, 19.0356],
  ["河南", "济源市", 112.6023, 35.0690],
  ["湖北", "仙桃市", 113.4539, 30.3649],
  ["湖北", "潜江市", 112.8969, 30.4212],
  ["湖北", "天门市", 113.1661, 30.6634],
  ["湖北", "神农架林区", 110.6759, 31.7445],
  ["新疆", "石河子市", 86.0411, 44.3059],
  ["新疆", "阿拉尔市", 81.2805, 40.5477],
  ["新疆", "图木舒克市", 79.0778, 39.8673],
  ["新疆", "五家渠市", 87.5269, 44.1674],
  ["新疆", "北屯市", 87.8249, 47.3532],
  ["新疆", "铁门关市", 85.5012, 41.8273],
  ["新疆", "双河市", 82.3537, 44.8405],
  ["新疆", "可克达拉市", 80.6358, 43.6832],
  ["新疆", "昆玉市", 79.2702, 37.2154],
  ["新疆", "胡杨河市", 84.8276, 44.6929],
  ["新疆", "新星市", 93.7483, 42.7970],
  ["新疆", "白杨市", 82.9803, 46.7454],
].map(([province, name, lng, lat]) => ({ province, name, center: [lng, lat], supplemental: true }));

function chinaDirectSubadminUnitsFromBoundary() {
  const features = boundaryData.chinaDirect?.features || [];
  if (!features.length) return [];
  const seen = new Set();
  return features.map((feature) => {
    const name = subadminNameFromFeature(feature);
    const key = cleanAdminName(name);
    if (!name || seen.has(key)) return null;
    seen.add(key);
    const props = feature.properties && typeof feature.properties === "object" ? feature.properties : {};
    const center = Array.isArray(props.center) && props.center.length >= 2 ? props.center : geometryCenter(feature.geometry);
    return {
      province: props.province || provinceNameForChinaSubadminFeature(feature),
      name,
      center,
      supplemental: true,
      hasBoundary: true,
    };
  }).filter(Boolean);
}

function missingChinaDirectBoundaryUnits() {
  const available = new Set((boundaryData.chinaDirect?.features || []).map((feature) => cleanAdminName(subadminNameFromFeature(feature))));
  return chinaDirectSubadminUnits.filter((unit) => !available.has(cleanAdminName(unit.name)));
}

const worldCountryCatalog = [
  ["亚洲", "cn", "中国"], ["亚洲", "jp", "日本"], ["亚洲", "kr", "韩国"], ["亚洲", "kp", "朝鲜"], ["亚洲", "mn", "蒙古"], ["亚洲", "sg", "新加坡"], ["亚洲", "my", "马来西亚"], ["亚洲", "th", "泰国"], ["亚洲", "vn", "越南"], ["亚洲", "id", "印度尼西亚"], ["亚洲", "ph", "菲律宾"], ["亚洲", "in", "印度"], ["亚洲", "pk", "巴基斯坦"], ["亚洲", "bd", "孟加拉国"], ["亚洲", "lk", "斯里兰卡"], ["亚洲", "np", "尼泊尔"], ["亚洲", "bt", "不丹"], ["亚洲", "mv", "马尔代夫"], ["亚洲", "ae", "阿联酋"], ["亚洲", "sa", "沙特阿拉伯"], ["亚洲", "qa", "卡塔尔"], ["亚洲", "kw", "科威特"], ["亚洲", "bh", "巴林"], ["亚洲", "om", "阿曼"], ["亚洲", "jo", "约旦"], ["亚洲", "il", "以色列"], ["亚洲", "tr", "土耳其"], ["亚洲", "ge", "格鲁吉亚"], ["亚洲", "am", "亚美尼亚"], ["亚洲", "az", "阿塞拜疆"],
  ["欧洲", "gb", "英国"], ["欧洲", "fr", "法国"], ["欧洲", "it", "意大利"], ["欧洲", "de", "德国"], ["欧洲", "es", "西班牙"], ["欧洲", "pt", "葡萄牙"], ["欧洲", "nl", "荷兰"], ["欧洲", "be", "比利时"], ["欧洲", "ch", "瑞士"], ["欧洲", "at", "奥地利"], ["欧洲", "ie", "爱尔兰"], ["欧洲", "is", "冰岛"], ["欧洲", "no", "挪威"], ["欧洲", "se", "瑞典"], ["欧洲", "fi", "芬兰"], ["欧洲", "dk", "丹麦"], ["欧洲", "pl", "波兰"], ["欧洲", "cz", "捷克"], ["欧洲", "sk", "斯洛伐克"], ["欧洲", "hu", "匈牙利"], ["欧洲", "gr", "希腊"], ["欧洲", "ru", "俄罗斯"], ["欧洲", "ua", "乌克兰"], ["欧洲", "ro", "罗马尼亚"], ["欧洲", "bg", "保加利亚"], ["欧洲", "hr", "克罗地亚"], ["欧洲", "si", "斯洛文尼亚"], ["欧洲", "rs", "塞尔维亚"], ["欧洲", "al", "阿尔巴尼亚"],
  ["北美洲", "us", "美国"], ["北美洲", "ca", "加拿大"], ["北美洲", "mx", "墨西哥"], ["北美洲", "gt", "危地马拉"], ["北美洲", "cu", "古巴"], ["北美洲", "jm", "牙买加"], ["北美洲", "pa", "巴拿马"], ["北美洲", "cr", "哥斯达黎加"],
  ["南美洲", "br", "巴西"], ["南美洲", "ar", "阿根廷"], ["南美洲", "cl", "智利"], ["南美洲", "pe", "秘鲁"], ["南美洲", "co", "哥伦比亚"], ["南美洲", "uy", "乌拉圭"], ["南美洲", "bo", "玻利维亚"], ["南美洲", "ec", "厄瓜多尔"], ["南美洲", "ve", "委内瑞拉"],
  ["非洲", "eg", "埃及"], ["非洲", "za", "南非"], ["非洲", "ma", "摩洛哥"], ["非洲", "ke", "肯尼亚"], ["非洲", "tz", "坦桑尼亚"], ["非洲", "et", "埃塞俄比亚"], ["非洲", "ng", "尼日利亚"], ["非洲", "tn", "突尼斯"], ["非洲", "gh", "加纳"],
  ["大洋洲", "au", "澳大利亚"], ["大洋洲", "nz", "新西兰"], ["大洋洲", "fj", "斐济"], ["大洋洲", "pg", "巴布亚新几内亚"], ["大洋洲", "ws", "萨摩亚"], ["大洋洲", "to", "汤加"],
].map(([continent, id, name]) => ({ continent, id, name }));

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
    label: "日本大区",
    total: 8,
    units: ["北海道", "东北", "关东", "中部", "近畿", "中国", "四国", "九州冲绳"].map((name) => ({ name })),
  },
};

const chinaProvinceImageryCatalog = [
  ["北京", "京", "北京欢迎你", "Beijing Welcomes You"],
  ["天津", "津", "天天乐道 津津有味", "Tianjin: daily delight, endless flavor"],
  ["河北", "冀", "这么近那么美，周末到河北", "So close, so beautiful: weekend in Hebei"],
  ["山西", "晋", "华夏古文明 山西好风光", "Ancient Chinese civilization, beautiful Shanxi"],
  ["内蒙古", "蒙", "亮丽内蒙古", "Beautiful Inner Mongolia"],
  ["辽宁", "辽", "山海有情 天辽地宁", "Mountains, sea, and boundless Liaoning"],
  ["吉林", "吉", "清爽吉林·22℃的夏天", "Refreshing Jilin, a 22°C summer"],
  ["黑龙江", "黑", "北国好风光 美在黑龙江", "Northern beauty in Heilongjiang"],
  ["上海", "沪", "这里是上海", "This is Shanghai"],
  ["江苏", "苏", "水韵江苏 有你会更美", "Water charm Jiangsu, better with you"],
  ["浙江", "浙", "诗画江南 活力浙江", "Poetic Jiangnan, vibrant Zhejiang"],
  ["安徽", "皖", "美好安徽 迎客天下", "Beautiful Anhui welcomes the world"],
  ["福建", "闽", "清新福建", "Fresh Fujian"],
  ["江西", "赣", "江西风景独好", "Jiangxi: uniquely beautiful scenery"],
  ["山东", "鲁", "好客山东 好品山东", "Hospitable Shandong, quality Shandong"],
  ["河南", "豫", "行走河南·读懂中国", "Walk Henan, understand China"],
  ["湖北", "鄂", "知音湖北 遇见无处不在", "Hubei, where encounters are everywhere"],
  ["湖南", "湘", "三湘四水 相约湖南", "Meet Hunan among rivers and landscapes"],
  ["广东", "粤", "活力广东", "Vibrant Guangdong"],
  ["广西", "桂", "秀甲天下 壮美广西", "Magnificent Guangxi, beauty beyond compare"],
  ["海南", "琼", "活力自贸港 魅力海南岛", "Vibrant free trade port, charming Hainan Island"],
  ["重庆", "渝", "雄奇山水 新韵重庆", "Majestic landscapes, new Chongqing charm"],
  ["四川", "川", "锦绣天府 安逸四川", "Splendid Tianfu, easygoing Sichuan"],
  ["贵州", "黔", "走遍大地神州，醉美多彩贵州", "Travel across China, discover enchanting Colorful Guizhou"],
  ["云南", "滇", "有一种叫云南的生活", "A lifestyle called Yunnan"],
  ["西藏", "藏", "圣洁西藏", "Sacred Tibet"],
  ["陕西", "秦", "三秦四季 畅旅欢歌", "Four seasons in Shaanxi, joyful journeys"],
  ["甘肃", "陇", "交响丝路 如意甘肃", "Symphonic Silk Road, auspicious Gansu"],
  ["青海", "青", "大美青海 生态旅游净地", "Great beauty Qinghai, pure eco-travel land"],
  ["宁夏", "宁", "星星故乡 神奇宁夏", "Home of the stars, magical Ningxia"],
  ["新疆", "新", "新疆是个好地方", "Xinjiang is a wonderful place"],
  ["台湾", "台", "宝岛山海", "Island mountains and sea"],
  ["香港", "港", "Hello Hong Kong（你好，香港）", "Hello Hong Kong"],
  ["澳门", "澳", "感受澳门 无限式", "Experience Macao Unlimited"],
].map(([name, abbr, imageryZh, imageryEn]) => ({ name, abbr, imageryZh, imageryEn }));

const chinaProvinceImageryByName = new Map(chinaProvinceImageryCatalog.map((item) => [item.name, item]));

const chinaProvinceTravelGroups = [
  ["华北", "North China", ["北京", "天津", "河北", "山西", "内蒙古"]],
  ["东北", "Northeast China", ["辽宁", "吉林", "黑龙江"]],
  ["华东", "East China", ["上海", "江苏", "浙江", "安徽", "福建", "江西", "山东"]],
  ["中南", "Central South China", ["河南", "湖北", "湖南", "广东", "广西", "海南"]],
  ["西南", "Southwest China", ["重庆", "四川", "贵州", "云南", "西藏"]],
  ["西北", "Northwest China", ["陕西", "甘肃", "青海", "宁夏", "新疆"]],
  ["港澳台", "Hong Kong, Macau and Taiwan", ["香港", "澳门", "台湾"]],
].map(([name, nameEn, provinces]) => ({ name, nameEn, provinces }));

const japanRegionImageryCatalog = [
  ["北海道", "北", "雪原花海", "Snowfields and Wildflowers"],
  ["东北", "奥", "雪国温泉", "Snow Country Onsen"],
  ["关东", "関", "都会海湾", "Metropolitan Bay"],
  ["中部", "中", "山岳北陆", "Alps and Hokuriku"],
  ["近畿", "近", "古都巡礼", "Ancient Capitals"],
  ["中国", "瀬", "濑户内海", "Seto Inland Sea"],
  ["四国", "遍", "遍路之路", "Pilgrimage Island"],
  ["九州冲绳", "九", "火山海岛", "Volcanoes and Islands"],
].map(([name, abbr, imageryZh, imageryEn]) => ({ name, abbr, imageryZh, imageryEn }));

const japanRegionImageryByName = new Map(japanRegionImageryCatalog.map((item) => [item.name, item]));

const japanPrefectures = ["北海道", "青森县", "岩手县", "宫城县", "秋田县", "山形县", "福岛县", "茨城县", "栃木县", "群马县", "埼玉县", "千叶县", "东京都", "神奈川县", "新潟县", "富山县", "石川县", "福井县", "山梨县", "长野县", "岐阜县", "静冈县", "爱知县", "三重县", "滋贺县", "京都府", "大阪府", "兵库县", "奈良县", "和歌山县", "鸟取县", "岛根县", "冈山县", "广岛县", "山口县", "德岛县", "香川县", "爱媛县", "高知县", "福冈县", "佐贺县", "长崎县", "熊本县", "大分县", "宫崎县", "鹿儿岛县", "冲绳县"].map((name) => ({ name }));
const japanPrefectureRegionMap = {
  "北海道": "北海道",
  "青森县": "东北",
  "岩手县": "东北",
  "宫城县": "东北",
  "秋田县": "东北",
  "山形县": "东北",
  "福岛县": "东北",
  "茨城县": "关东",
  "栃木县": "关东",
  "群马县": "关东",
  "埼玉县": "关东",
  "千叶县": "关东",
  "东京都": "关东",
  "神奈川县": "关东",
  "新潟县": "中部",
  "富山县": "中部",
  "石川县": "中部",
  "福井县": "中部",
  "山梨县": "中部",
  "长野县": "中部",
  "岐阜县": "中部",
  "静冈县": "中部",
  "爱知县": "中部",
  "三重县": "近畿",
  "滋贺县": "近畿",
  "京都府": "近畿",
  "大阪府": "近畿",
  "兵库县": "近畿",
  "奈良县": "近畿",
  "和歌山县": "近畿",
  "鸟取县": "中国",
  "岛根县": "中国",
  "冈山县": "中国",
  "广岛县": "中国",
  "山口县": "中国",
  "德岛县": "四国",
  "香川县": "四国",
  "爱媛县": "四国",
  "高知县": "四国",
  "福冈县": "九州冲绳",
  "佐贺县": "九州冲绳",
  "长崎县": "九州冲绳",
  "熊本县": "九州冲绳",
  "大分县": "九州冲绳",
  "宫崎县": "九州冲绳",
  "鹿儿岛县": "九州冲绳",
  "冲绳县": "九州冲绳",
};

const japanRegionNameAliases = {
  Hokkaido: "北海道",
  Tohoku: "东北",
  Tōhoku: "东北",
  Kanto: "关东",
  Kantō: "关东",
  Chubu: "中部",
  Chūbu: "中部",
  Kinki: "近畿",
  Kansai: "近畿",
  Chugoku: "中国",
  Chūgoku: "中国",
  Shikoku: "四国",
  Kyushu: "九州冲绳",
  Kyūshū: "九州冲绳",
  Okinawa: "九州冲绳",
};

const japanPrefectureNameAliases = {
  Hokkaido: "北海道",
  Aomori: "青森县",
  Iwate: "岩手县",
  Miyagi: "宫城县",
  Akita: "秋田县",
  Yamagata: "山形县",
  Fukushima: "福岛县",
  Ibaraki: "茨城县",
  Tochigi: "栃木县",
  Gunma: "群马县",
  Saitama: "埼玉县",
  Chiba: "千叶县",
  Tokyo: "东京都",
  Kanagawa: "神奈川县",
  Niigata: "新潟县",
  Toyama: "富山县",
  Ishikawa: "石川县",
  Fukui: "福井县",
  Yamanashi: "山梨县",
  Nagano: "长野县",
  Gifu: "岐阜县",
  Shizuoka: "静冈县",
  Aichi: "爱知县",
  Mie: "三重县",
  Shiga: "滋贺县",
  Kyoto: "京都府",
  Osaka: "大阪府",
  Hyogo: "兵库县",
  Hyōgo: "兵库县",
  Nara: "奈良县",
  Wakayama: "和歌山县",
  Tottori: "鸟取县",
  Shimane: "岛根县",
  Okayama: "冈山县",
  Hiroshima: "广岛县",
  Yamaguchi: "山口县",
  Tokushima: "德岛县",
  Kagawa: "香川县",
  Ehime: "爱媛县",
  Kochi: "高知县",
  Kōchi: "高知县",
  Fukuoka: "福冈县",
  Saga: "佐贺县",
  Nagasaki: "长崎县",
  Kumamoto: "熊本县",
  Oita: "大分县",
  Ōita: "大分县",
  Miyazaki: "宫崎县",
  Kagoshima: "鹿儿岛县",
  Okinawa: "冲绳县",
};

function japanRegionName(value) {
  const raw = String(value || "").trim();
  return japanRegionNameAliases[raw] || raw;
}

function japanPrefectureName(value) {
  const raw = String(value || "").replace(/\s+Prefecture$/i, "").trim();
  return japanPrefectureNameAliases[raw] || raw;
}

function japanRegionForPrefecture(prefecture) {
  const match = Object.keys(japanPrefectureRegionMap).find((name) => sameAdminName(name, prefecture));
  return match ? japanPrefectureRegionMap[match] : "";
}

function japanPrefectureUnits() {
  return japanPrefectures;
}

function normalizeJapanPlaceHierarchy(place) {
  if (!place || normalizeCountry(place.country) !== "jp") return false;
  const beforeUnit = place.unit || "";
  const beforeSubunit = place.subunit || "";
  const prefectureName = beforeSubunit || beforeUnit;
  const prefecture = japanPrefectureUnits().find((unit) => sameAdminName(unit.name, prefectureName))?.name || prefectureName;
  const region = japanRegionForPrefecture(prefecture);
  if (!region) return false;
  place.unit = region;
  place.subunit = prefecture;
  return beforeUnit !== place.unit || beforeSubunit !== place.subunit;
}

function normalizeJapanPlacesHierarchy() {
  let changed = false;
  places.forEach((place) => {
    if (normalizeJapanPlaceHierarchy(place)) changed = true;
  });
  return changed;
}


const usStatePlateCatalog = [
  ["Alabama", "AL", "阿拉巴马州", "Heart of Dixie", "南方腹地"],
  ["Alaska", "AK", "阿拉斯加州", "The Last Frontier", "最后的边疆"],
  ["Arizona", "AZ", "亚利桑那州", "Grand Canyon State", "大峡谷之州"],
  ["Arkansas", "AR", "阿肯色州", "The Natural State", "自然之州"],
  ["California", "CA", "加利福尼亚州", "Golden State", "金州"],
  ["Colorado", "CO", "科罗拉多州", "Centennial State", "百年之州"],
  ["Connecticut", "CT", "康涅狄格州", "Constitution State", "宪法之州"],
  ["Delaware", "DE", "特拉华州", "First State", "第一州"],
  ["Florida", "FL", "佛罗里达州", "Sunshine State", "阳光之州"],
  ["Georgia", "GA", "佐治亚州", "Peach State", "桃州"],
  ["Hawaii", "HI", "夏威夷州", "Aloha State", "阿罗哈之州"],
  ["Idaho", "ID", "爱达荷州", "Famous Potatoes", "土豆之乡"],
  ["Illinois", "IL", "伊利诺伊州", "Land of Lincoln", "林肯之地"],
  ["Indiana", "IN", "印第安纳州", "Crossroads of America", "美国十字路口"],
  ["Iowa", "IA", "艾奥瓦州", "Hawkeye State", "鹰眼之州"],
  ["Kansas", "KS", "堪萨斯州", "Sunflower State", "向日葵之州"],
  ["Kentucky", "KY", "肯塔基州", "Bluegrass State", "蓝草之州"],
  ["Louisiana", "LA", "路易斯安那州", "Sportsman's Paradise", "户外运动天堂"],
  ["Maine", "ME", "缅因州", "Vacationland", "度假胜地"],
  ["Maryland", "MD", "马里兰州", "Old Line State", "老防线之州"],
  ["Massachusetts", "MA", "马萨诸塞州", "Bay State", "海湾之州"],
  ["Michigan", "MI", "密歇根州", "Great Lakes State", "五大湖之州"],
  ["Minnesota", "MN", "明尼苏达州", "10,000 Lakes", "万湖之州"],
  ["Mississippi", "MS", "密西西比州", "Magnolia State", "木兰之州"],
  ["Missouri", "MO", "密苏里州", "Show-Me State", "求证之州"],
  ["Montana", "MT", "蒙大拿州", "Big Sky Country", "大天空之乡"],
  ["Nebraska", "NE", "内布拉斯加州", "Cornhusker State", "玉米剥壳者之州"],
  ["Nevada", "NV", "内华达州", "Silver State", "白银之州"],
  ["New Hampshire", "NH", "新罕布什尔州", "Live Free or Die", "不自由，毋宁死"],
  ["New Jersey", "NJ", "新泽西州", "Garden State", "花园之州"],
  ["New Mexico", "NM", "新墨西哥州", "Land of Enchantment", "魔力之地"],
  ["New York", "NY", "纽约州", "Empire State", "帝国之州"],
  ["North Carolina", "NC", "北卡罗来纳州", "First in Flight", "首飞之地"],
  ["North Dakota", "ND", "北达科他州", "Peace Garden State", "和平花园之州"],
  ["Ohio", "OH", "俄亥俄州", "Buckeye State", "七叶树之州"],
  ["Oklahoma", "OK", "俄克拉荷马州", "Sooner State", "捷足者之州"],
  ["Oregon", "OR", "俄勒冈州", "Beaver State", "海狸之州"],
  ["Pennsylvania", "PA", "宾夕法尼亚州", "Keystone State", "拱心石之州"],
  ["Rhode Island", "RI", "罗得岛州", "Ocean State", "海洋之州"],
  ["South Carolina", "SC", "南卡罗来纳州", "Palmetto State", "棕榈之州"],
  ["South Dakota", "SD", "南达科他州", "Mount Rushmore State", "拉什莫尔山之州"],
  ["Tennessee", "TN", "田纳西州", "Volunteer State", "志愿者之州"],
  ["Texas", "TX", "得克萨斯州", "Lone Star State", "孤星之州"],
  ["Utah", "UT", "犹他州", "Beehive State", "蜂巢之州"],
  ["Vermont", "VT", "佛蒙特州", "Green Mountain State", "绿山之州"],
  ["Virginia", "VA", "弗吉尼亚州", "Virginia Is For Lovers", "爱在弗吉尼亚"],
  ["Washington", "WA", "华盛顿州", "Evergreen State", "常青之州"],
  ["West Virginia", "WV", "西弗吉尼亚州", "Mountain State", "山地之州"],
  ["Wisconsin", "WI", "威斯康星州", "America's Dairyland", "美国乳业之乡"],
  ["Wyoming", "WY", "怀俄明州", "Equality State", "平等之州"],
].map(([name, abbr, nameZh, nicknameEn, nicknameZh]) => ({ name, abbr, nameZh, nicknameEn, nicknameZh }));

const usStatePlateByName = new Map(usStatePlateCatalog.map((item) => [item.name, item]));

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
japanPrefectures.forEach((unit) => {
  if (japanPrefBboxes[unit.name]) unit.bbox = japanPrefBboxes[unit.name];
});

let places = [
  { id: "forbidden-city", name: "故宫", country: "cn", unit: "北京", city: "北京市", type: "世界遗产 / 5A / 博物馆", lat: 39.9163, lng: 116.3972, tags: ["历史", "建筑"], checklist: ["世界遗产", "中国 5A 景区"] },
  { id: "shenzhen", name: "深圳", country: "cn", unit: "广东", city: "深圳市", type: "城市", lat: 22.5431, lng: 114.0579, tags: ["城市"], checklist: [] },
  { id: "xian", name: "西安", country: "cn", unit: "陕西", city: "西安市", type: "古都", lat: 34.3416, lng: 108.9398, tags: ["古都"], checklist: ["中国四大古都"] },
  { id: "tokyo", name: "东京", country: "jp", unit: "东京都", city: "东京", type: "城市", lat: 35.6762, lng: 139.6503, tags: ["城市", "铁路"], checklist: ["首都城市"] },
  { id: "kyoto", name: "京都", country: "jp", unit: "京都府", city: "京都", type: "世界遗产城市", lat: 35.0116, lng: 135.7681, tags: ["文化"], checklist: ["世界遗产"] },
  { id: "yosemite", name: "优胜美地国家公园", country: "us", unit: "California", city: "Yosemite", type: "国家公园 / 世界遗产", lat: 37.8651, lng: -119.5383, tags: ["国家公园"], checklist: ["世界遗产", "美国国家公园"] },
  { id: "nyc", name: "纽约", country: "us", unit: "New York", city: "New York City", type: "城市", lat: 40.7128, lng: -74.006, tags: ["城市"], checklist: ["著名城市"] },
  { id: "washington-dc", name: "华盛顿哥伦比亚特区", country: "us", unit: "District of Columbia", city: "Washington, D.C.", type: "首都城市", lat: 38.9072, lng: -77.0369, tags: ["城市", "首都"], checklist: ["首都城市"] },
  { id: "paris", name: "巴黎", country: "fr", unit: "Ile-de-France", city: "Paris", type: "首都城市", lat: 48.8566, lng: 2.3522, tags: ["艺术"], checklist: ["首都城市", "世界遗产"] },
  { id: "rome", name: "罗马", country: "it", unit: "Lazio", city: "Rome", type: "首都城市 / 世界遗产", lat: 41.9028, lng: 12.4964, tags: ["古城"], checklist: ["首都城市", "世界遗产"] },
  { id: "singapore", name: "新加坡", country: "sg", unit: "Singapore", city: "Singapore", type: "国家 / 城市", lat: 1.3521, lng: 103.8198, tags: ["城市"], checklist: ["首都城市"] },
];

let placeIndexCache = { source: null, size: 0, index: new Map() };

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
  chinaAncientCapitals: {
    label: "中国古都",
    items: [],
  },
  worldHeritage: {
    label: "世界遗产",
    byCountry: {
      中国: ["长城", "故宫", "秦始皇陵及兵马俑", "莫高窟", "周口店北京人遗址", "泰山", "黄山", "九寨沟", "黄龙", "武陵源", "承德避暑山庄", "曲阜三孔", "武当山古建筑群", "布达拉宫历史建筑群", "庐山国家公园", "峨眉山-乐山大佛", "丽江古城", "平遥古城", "苏州古典园林", "颐和园", "天坛", "大足石刻", "武夷山", "青城山-都江堰", "皖南古村落", "龙门石窟", "明清皇家陵寝", "云冈石窟", "云南三江并流", "高句丽王城王陵及贵族墓葬", "澳门历史城区", "四川大熊猫栖息地", "殷墟", "中国南方喀斯特", "开平碉楼与村落", "福建土楼", "三清山", "五台山", "登封天地之中古建筑群", "杭州西湖", "元上都遗址", "澄江化石地", "新疆天山", "红河哈尼梯田", "大运河", "丝绸之路", "土司遗址", "湖北神农架", "青海可可西里", "鼓浪屿", "梵净山", "良渚古城遗址", "黄渤海候鸟栖息地", "泉州", "普洱景迈山古茶林"],
      美国: ["梅萨维德国家公园", "黄石国家公园", "大沼泽国家公园", "大峡谷国家公园", "独立厅", "克卢恩/兰格尔-圣伊莱亚斯/冰川湾/塔琴希尼-阿尔塞克", "红木国家和州立公园", "猛犸洞国家公园", "奥林匹克国家公园", "卡霍基亚土丘", "大烟雾山国家公园", "自由女神像", "优胜美地国家公园", "查科文化", "夏洛茨维尔蒙蒂塞洛和弗吉尼亚大学", "夏威夷火山国家公园", "陶斯印第安村", "卡尔斯巴德洞穴国家公园", "沃特顿-冰川国际和平公园", "帕帕哈瑙莫夸基亚", "波弗蒂角", "圣安东尼奥传教区", "弗兰克·劳埃德·赖特建筑作品", "希望之井礼仪土方"],
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
  chinaHighAltitude: {
    label: "全球高海拔旅行挑战",
    items: [
      "唐古拉山口 · 公路山口 · 5231m",
      "珠峰景区 · 珠峰大本营 · 5200m",
      "加吾拉山口 · 珠峰观景山口 · 5200m",
      "红其拉甫国门 · 国门附近 · 4733m",
      "普莫雍措 · 湖边游览点 · 5010m",
      "卡若拉冰川 · 公路观景区 · 5036m",
      "绒布寺 · 寺院观景区 · 4900m",
      "达古冰川 · 冰川观景区 · 4860m",
      "昆仑山口 · 公路垭口 · 4768m",
      "南迦巴瓦 · 色季拉山口观景台 · 4728m",
      "纳木错 · 扎西半岛 · 4718m",
      "稻城亚丁 · 五色海 · 4700m",
      "玉龙雪山 · 冰川公园平台 · 4680m",
      "慕士塔格峰景区 · 4688米石碑 · 4688m",
      "冈仁波齐 · 塔尔钦周边 · 4670m",
      "稻城亚丁 · 牛奶海 · 4600m",
      "玛旁雍错 · 湖区游览点 · 4588m",
      "雅哈垭口 · 观景点 · 4568m",
      "子梅垭口 · 观景点 · 4550m",
      "冷嘎措 · 湖边观景点 · 4530m",
      "羊卓雍措 · 湖区观景点 · 4441m",
      "石卡雪山 · 索道高点 · 4449m",
      "可可西里 · 索南达杰保护站 · 4479m",
      "白马雪山 · 垭口 · 4292m",
      "折多山 · 垭口 · 4298m",
      "鱼子西 · 观景平台 · 4200m",
      "盘龙古道 · 最高观景垭口 · 4216m",
      "玉山 · 主峰步道终点 · 3952m",
      "四姑娘山双桥沟 · 红杉林 · 3840m",
      "喀拉库勒湖 · 湖边观景点 · 3600m",
      "黄龙 · 五彩池 · 3576m",
      "巴松措 · 湖区游览点 · 3480m",
      "梅里雪山 · 飞来寺观景台 · 3400m",
      "白沙湖/白沙山 · 湖边观景点 · 3300m",
      "青海湖 · 湖区游览点 · 3196m",
      "峨眉山 · 金顶 · 3079m",
      "五台山 · 北台叶斗峰 · 3061m",
      "茶卡盐湖 · 景区湖区 · 3059m",
      "武夷山 · 黄岗山 · 2160m",
      "华山 · 南峰 · 2155m",
      "恒山 · 天峰岭 · 2016m",
      "黄山 · 莲花峰 · 1864m",
      "三清山 · 玉京峰 · 1819m",
      "武当山 · 天柱峰 · 1612m",
      "泰山 · 玉皇顶 · 1545m",
      "嵩山 · 峻极峰 · 1492m",
      "庐山 · 汉阳峰 · 1474m",
      "九华山 · 十王峰 · 1342m",
      "龙虎山 · 天门山 · 1300m",
      "衡山 · 祝融峰 · 1300m",
      "青城山 · 老君阁/彭祖峰 · 1260m",
      "雁荡山 · 百岗尖 · 1108m",
      "齐云山 · 廊崖 · 585m",
      "普陀山 · 佛顶山 · 291m",
      "乞力马扎罗 · Uhuru Peak步道终点 · 5895m",
      "安纳普尔纳环线 · Thorong La山口 · 5416m",
      "珠峰南坡 · 尼泊尔大本营 · 5364m",
      "列城公路 · Khardung La山口 · 5359m",
      "亚拉腊山 · 常规登山终点 · 5137m",
      "彩虹山 · 观景点 · 5036m",
      "肯尼亚山 · Point Lenana步道终点 · 4985m",
      "科托帕希国家公园 · Jose Rivas山屋 · 4864m",
      "钦博拉索 · Carrel山屋 · 4850m",
      "蓝天山 · 峰顶公路高点 · 4350m",
      "派克峰 · 公路/齿轨铁路峰顶 · 4302m",
      "阿空加瓜省立公园 · Plaza de Mulas营地 · 4300m",
      "奥里萨巴峰 · Piedra Grande营地 · 4260m",
      "班公湖 · 湖边观景点 · 4250m",
      "西门山国家公园 · Bwahit Pass观景点 · 4200m",
      "莫纳克亚山 · 公路可达峰顶 · 4207m",
      "图卜卡勒峰 · 常规登山终点 · 4167m",
      "基纳巴卢山 · Low's Peak步道终点 · 4095m",
      "拉巴斯/埃尔阿尔托 · 城市高点 · 4060m",
      "小马特洪峰 · 缆车高点 · 3883m",
      "南针峰 · 缆车观景台 · 3842m",
      "落基山国家公园 · Trail Ridge Road高点 · 3713m",
      "乌尤尼盐沼 · 盐沼游览点 · 3656m",
      "泰德峰 · 缆车上站 · 3555m",
      "少女峰火车站 · 欧洲屋脊 · 3454m",
      "戈尔内格拉特 · 登山铁路观景台 · 3135m",
      "哈莱阿卡拉 · 火山口观景台 · 3055m",
      "马丘比丘山 · 步道终点 · 3082m",
      "楚格峰 · 缆车/齿轨铁路高点 · 2962m",
      "萨尼山口 · 公路山口 · 2876m",
      "大钟山高山公路 · Edelweissspitze观景点 · 2571m",
      "埃特纳火山 · 缆车上站区域 · 2500m",
      "富士山 · 五合目 · 2305m",
      "科修斯科山 · 步道终点 · 2228m",
      "惠斯勒山 · Peak Chair区域 · 2182m",
      "汉拿山 · 白鹿潭步道终点 · 1950m",
      "卡拉帕塔 · 珠峰观景徒步点 · 5644m",
      "昌拉山口 · 公路山口 · 5360m",
      "戈京日 · 湖区徒步观景点 · 5357m",
      "塔格朗拉山口 · 公路山口 · 5328m",
      "查卡尔塔亚 · 公路高点 · 5300m",
      "古鲁东玛湖 · 湖边游览点 · 5150m",
      "帕斯托鲁里冰川 · 游览步道高点 · 5000m",
      "锡金零点 · 公路高点 · 4663m",
      "阿克拜塔尔山口 · 帕米尔公路山口 · 4655m",
      "梅鲁山 · 步道终点 · 4566m",
      "拉斯达申峰 · 常规徒步终点 · 4550m",
      "萨内蒂高原 · 公路高点 · 4377m",
      "格雷斯峰 · 步道终点 · 4352m",
      "马拉加山口 · 公路山口 · 4316m",
      "内瓦多德托卢卡 · 火山口游览点 · 4200m",
      "红湖 · 湖边观景点 · 4278m",
      "喀麦隆山 · 常规登山终点 · 4040m",
      "基多缆车 · Cruz Loma观景点 · 4050m",
      "内瓦多德鲁伊斯 · 游客区 · 4050m",
      "惠特尼山 · 步道终点 · 4421m",
      "惠勒峰 · 新墨西哥步道终点 · 4013m",
      "安蒂萨纳 · 火山观景点 · 4000m",
      "伊斯塔西瓦特尔 · La Joya登山口 · 3970m",
      "基洛托阿火山湖 · 环湖观景点 · 3914m",
      "阿拉湖山口 · 徒步山口 · 3860m",
      "奇里波峰 · 步道终点 · 3820m",
      "汉弗莱斯峰 · 步道终点 · 3852m",
      "厄尔布鲁士山 · Garabashi缆车站 · 3847m",
      "巴尔斯孔山口 · 公路山口 · 3754m",
      "独立山口 · 公路山口 · 3687m",
      "洛夫兰山口 · 公路山口 · 3655m",
      "林贾尼火山 · 常规登山终点 · 3726m",
      "猛犸山 · 缆车高点 · 3369m",
      "科尔卡峡谷 · 秃鹰十字观景台 · 3287m",
      "马尔莫拉达 · Punta Rocca缆车站 · 3265m",
      "布恩山 · 徒步观景点 · 3210m",
      "解放者山口 · 国际公路山口 · 3200m",
      "琼布拉克 · Talgar Pass滑雪区高点 · 3180m",
      "蒙塞拉特山 · 缆车山顶 · 3152m",
      "番西邦峰 · 缆车/步道终点 · 3143m",
      "内日峰 · 留尼汪步道终点 · 3070m",
      "内瓦多谷 · 滑雪区高点 · 3025m",
      "宋库尔湖 · 湖边游览点 · 3016m",
      "图盖拉瀑布顶端 · 德拉肯斯堡步道点 · 3000m",
      "帕塔潘帕山口 · 火山观景公路点 · 4910m",
      "拉古纳69 · 湖边步道终点 · 4600m",
      "昆祖姆山口 · 公路山口 · 4551m",
      "琼加拉湖 · 湖边观景点 · 4517m",
      "威廉山 · 巴布亚新几内亚步道终点 · 4509m",
      "塔蒂奥间歇泉 · 游览区 · 4320m",
      "拉拉亚山口 · 公路山口 · 4335m",
      "塔胡穆尔科火山 · 常规登山终点 · 4220m",
      "乌马太湖 · 湖边观景点 · 4200m",
      "达马万德山 · Bargah Sevom营地 · 4200m",
      "巴布萨尔山口 · 公路山口 · 4173m",
      "安纳普尔纳大本营 · 徒步营地 · 4130m",
      "米斯坎蒂湖 · 湖边观景点 · 4120m",
      "皮凯峰 · 珠峰远眺点 · 4065m",
      "罗唐山口 · 公路山口 · 3978m",
      "阿拉加茨山 · 南峰步道终点 · 3888m",
      "瓦斯卡兰国家公园 · 扬加努科湖区 · 3850m",
      "托查尔山 · 缆车高点 · 3740m",
      "的的喀喀湖 · 湖边游览点 · 3812m",
      "科顿伍德山口 · 公路山口 · 3696m",
      "波波卡特佩特尔 · Paso de Cortes山口 · 3600m",
      "玛蒂希玛尔 · 高营地 · 3580m",
      "瓜内拉山口 · 公路山口 · 3557m",
      "米特阿拉林 · 冰川地铁高点 · 3457m",
      "尼拉贡戈火山 · 火山口徒步终点 · 3470m",
      "莫纳罗亚山 · 公路观测站 · 3397m",
      "贝尔图斯山口 · 公路山口 · 3337m",
      "费尔梅多斯 · 南迦帕尔巴特观景点 · 3300m",
      "科尔瓦奇峰 · 缆车高点 · 3303m",
      "乌凯迈登 · 滑雪区高点 · 3268m",
      "马拉塞拉山口 · 莱索托公路高点 · 3222m",
      "拉森峰 · 火山步道终点 · 3187m",
      "杰克逊霍尔缆车 · Rendezvous Mountain · 3185m",
      "蒂奥加山口 · 公路山口 · 3031m",
      "穆兰杰山 · Sapitwa步道终点 · 3002m",
      "铁力士山 · 缆车观景台 · 3020m",
      "冰川3000 · Scex Rouge观景点 · 2971m",
      "雪朗峰 · Piz Gloria观景台 · 2970m",
      "迪亚沃勒扎 · 缆车观景台 · 2978m",
      "穆萨拉峰 · 步道终点 · 2925m",
      "南比戈尔峰 · 缆车观景台 · 2877m",
      "奥林匹斯山 · 米蒂卡斯峰 · 2918m",
      "普拉格山 · 步道终点 · 2922m",
      "特里格拉夫峰 · 常规徒步终点 · 2864m",
      "乘鞍岳 · 畳平 · 2702m",
      "斯泰尔维奥山口 · 公路山口 · 2758m",
      "鲁阿佩胡山 · 火山口湖观景点 · 2672m",
      "布罗莫火山 · King Kong Hill观景点 · 2600m",
      "因他暖山 · 泰国最高点 · 2565m",
      "大阿拉木图湖 · 湖边游览点 · 2511m",
      "塞切达山 · 缆车观景点 · 2519m",
      "塔拉纳基山 · 步道终点 · 2518m",
      "惠斯勒斯山 · 贾斯珀缆车高点 · 2463m",
      "立山室堂 · 阿尔卑斯路线高点 · 2450m",
      "鹰巢站 · 勃朗峰有轨电车终点 · 2372m",
      "弗朗茨约瑟夫高地 · 大钟山观景点 · 2369m",
      "三峰山景区 · Auronzo山屋 · 2320m",
      "硫磺山 · 班夫缆车上站 · 2281m",
      "波尔多伊山口 · 公路山口 · 2239m",
      "亚当峰 · 朝圣步道终点 · 2243m",
      "卡兹别克 · 圣三一教堂观景点 · 2170m",
      "皮拉图斯山 · 齿轨/缆车高点 · 2128m",
      "华盛顿山 · 公路/齿轨铁路峰顶 · 1917m",
      "杰贝勒杰斯山 · 公路观景点 · 1934m",
      "克灵曼圆顶 · 观景塔 · 2025m",
      "库克山国家公园 · Mueller Hut · 1800m",
      "阿凯山口 · 公路山口 · 4895m",
      "拉昆布雷山口 · 永加斯公路高点 · 4650m",
      "萨尔坎泰山口 · 徒步山口 · 4630m",
      "霍尔诺卡尔山 · 彩山观景点 · 4350m",
      "萨哈马国家公园 · 间歇泉区 · 4300m",
      "基孜勒阿尔特山口 · 帕米尔公路山口 · 4280m",
      "哈马山口 · 国际公路山口 · 4200m",
      "德奥赛高原 · Sheosar湖 · 4142m",
      "帕帕亚克塔山口 · 公路山口 · 4064m",
      "帕尔卡约彩虹山 · 观景点 · 4900m",
      "卡拉库里湖 · 帕米尔公路湖区 · 3914m",
      "亚什库勒湖 · 湖边观景点 · 3734m",
      "香多尔山口 · 公路山口 · 3738m",
      "图奥阿舒山口 · 公路山口 · 3586m",
      "拉玛草甸 · 南迦帕尔巴特观景点 · 3300m",
      "塔什拉巴特 · 高原驿站 · 3200m",
      "伊塞兰山口 · 阿尔卑斯公路山口 · 2764m",
      "蒂默尔斯约赫山口 · 阿尔卑斯公路山口 · 2474m",
      "富尔卡山口 · 阿尔卑斯公路山口 · 2429m",
      "格里姆瑟尔山口 · 阿尔卑斯公路山口 · 2164m",
      "苏斯滕山口 · 阿尔卑斯公路山口 · 2224m",
      "十字架山口 · 高加索公路山口 · 2379m",
      "科鲁尔迪湖 · 梅斯蒂亚观景徒步点 · 2740m",
      "塞利姆山口 · 亚美尼亚公路山口 · 2410m",
      "沙赫达格 · 滑雪区高点 · 2500m",
      "雷尼尔山 · Camp Muir · 3105m",
      "大提顿 · Paintbrush Divide · 3260m",
      "黄石 · Mount Washburn步道终点 · 3122m",
      "锡达布雷克斯 · 观景点 · 3150m",
      "布赖恩峰 · 公路高点 · 3446m",
      "内华达惠勒峰 · 步道终点 · 3982m",
      "瓜达卢佩峰 · 步道终点 · 2667m",
      "桑迪亚峰 · 缆车高点 · 3163m",
      "洛根山口 · 冰川国家公园公路山口 · 2026m",
      "优胜美地 · 冰川点 · 2199m",
      "布莱斯峡谷 · Rainbow Point · 2778m",
      "大峡谷北缘 · Bright Angel Point · 2500m",
      "梅萨维德 · Park Point · 2613m",
      "皮兹奈尔峰 · 缆车高点 · 3056m",
      "蒙福尔峰 · 缆车高点 · 3330m",
      "多洛米蒂萨斯波尔多伊 · 缆车高点 · 2950m",
      "格莱舍天堂 · Trockener Steg · 2939m",
      "卡普伦基茨施泰因峰 · 缆车高点 · 3029m",
      "陶恩山阿尔卑斯公路 · Hochtor山口 · 2504m",
      "锡尔夫雷塔高山公路 · Bielerhohe · 2037m",
      "曼利申 · 缆车山脊 · 2343m",
      "格林德瓦First · 缆车高点 · 2168m",
      "布赖特峰高原 · 冰川观景点 · 3480m",
      "达赫施泰因 · Skywalk观景台 · 2700m",
      "北链山 · Hafelekar缆车站 · 2256m",
      "盖斯拉赫科格尔 · 缆车高点 · 3058m",
      "红针峰 · Les Arcs缆车高点 · 3226m",
      "加尔赫峰 · 挪威步道终点 · 2469m",
      "路易斯湖 · 六冰川平原茶屋 · 2100m",
      "威尔科克斯山口 · 冰原大道徒步点 · 2375m",
      "库克山国家公园 · Sealy Tarns · 1300m",
      "大雪山旭岳 · 姿见站/步道终点 · 2291m",
      "白马岳 · 八方池观景点 · 2060m",
      "藏王山 · 御釜观景点 · 1758m",
      "阿苏山 · 中岳火口观景点 · 1500m",
      "雾岛山 · 高千穗峰步道终点 · 1574m",
      "雪岳山 · 大青峰步道终点 · 1708m",
      "路易斯湖 · Sentinel Pass · 2611m",
      "贾斯珀 · Skyline Trail The Notch · 2511m",
      "约霍国家公园 · Opabin Plateau · 2300m",
      "班夫 · Parker Ridge · 2275m",
      "加里波第 · Panorama Ridge · 2133m",
      "本洛蒙德山 · 皇后镇步道终点 · 1748m",
      "罗伊峰 · 瓦纳卡步道终点 · 1578m",
      "凯普勒步道 · Luxmore Hut · 1085m",
      "菲茨罗伊 · Laguna de los Tres · 1170m",
      "百内三塔 · Base Torres观景点 · 900m",
      "塞罗卡斯蒂略 · 湖边观景点 · 1450m",
      "本尼维斯山 · 步道终点 · 1345m",
      "斯诺登山 · 步道/铁路终点 · 1085m",
      "卡朗图厄尔山 · 步道终点 · 1039m",
      "凯布讷山 · 瑞典步道终点 · 2097m",
      "哈尔蒂山 · 芬兰高点步道 · 1324m",
      "达尔斯尼巴 · 峡湾公路观景台 · 1476m",
      "洪扎 · Eagle's Nest观景台 · 2850m",
      "纳尔塔尔山谷 · 湖区游览点 · 3050m",
      "桑达克普 · 喜马拉雅观景点 · 3636m",
      "厄拉维库拉姆国家公园 · Anamudi观景点 · 2695m",
      "阿波山 · 菲律宾步道终点 · 2954m",
      "克林奇火山 · 常规登山终点 · 3805m",
      "阿贡火山 · 常规登山终点 · 3031m",
      "金马仑高原 · Brinchang山 · 2032m",
      "埃尔吉耶斯山 · 滑雪区高点 · 3360m",
      "内姆鲁特山 · 山顶遗址 · 2134m",
      "汤加里罗红火山口 · 穿越步道高点 · 1886m",
      ],
    meta: {
      "唐古拉山口 · 公路山口 · 5231m": { province: "青海/西藏", geoUnit: "唐古拉山", point: "公路山口", altitude: 5231, type: "垭口" },
      "珠峰景区 · 珠峰大本营 · 5200m": { province: "西藏", geoUnit: "珠穆朗玛峰", point: "珠峰大本营", altitude: 5200, type: "雪山观景" },
      "加吾拉山口 · 珠峰观景山口 · 5200m": { province: "西藏", geoUnit: "喜马拉雅山", point: "珠峰观景山口", altitude: 5200, type: "垭口" },
      "红其拉甫国门 · 国门附近 · 4733m": { province: "新疆", geoUnit: "帕米尔高原", point: "国门附近", altitude: 4733, type: "国门/口岸" },
      "普莫雍措 · 湖边游览点 · 5010m": { province: "西藏", geoUnit: "喜马拉雅山北麓湖群", point: "湖边游览点", altitude: 5010, type: "高原湖泊" },
      "卡若拉冰川 · 公路观景区 · 5036m": { province: "西藏", geoUnit: "宁金抗沙峰", point: "公路观景区", altitude: 5036, type: "冰川景区" },
      "绒布寺 · 寺院观景区 · 4900m": { province: "西藏", geoUnit: "珠穆朗玛峰", point: "寺院观景区", altitude: 4900, type: "雪山观景" },
      "达古冰川 · 冰川观景区 · 4860m": { province: "四川", geoUnit: "达古雪山", point: "冰川观景区", altitude: 4860, type: "冰川景区" },
      "昆仑山口 · 公路垭口 · 4768m": { province: "青海", geoUnit: "昆仑山", point: "公路垭口", altitude: 4768, type: "垭口" },
      "南迦巴瓦 · 色季拉山口观景台 · 4728m": { province: "西藏", geoUnit: "南迦巴瓦峰", point: "色季拉山口观景台", altitude: 4728, type: "雪山观景" },
      "纳木错 · 扎西半岛 · 4718m": { province: "西藏", geoUnit: "念青唐古拉山湖区", point: "扎西半岛", altitude: 4718, type: "高原湖泊" },
      "稻城亚丁 · 五色海 · 4700m": { province: "四川", geoUnit: "三怙主雪山", point: "五色海", altitude: 4700, type: "高原湖泊" },
      "玉龙雪山 · 冰川公园平台 · 4680m": { province: "云南", geoUnit: "玉龙雪山", point: "冰川公园平台", altitude: 4680, type: "雪山景区" },
      "慕士塔格峰景区 · 4688米石碑 · 4688m": { province: "新疆", geoUnit: "慕士塔格峰", point: "4688米石碑", altitude: 4688, type: "雪山观景" },
      "冈仁波齐 · 塔尔钦周边 · 4670m": { province: "西藏", geoUnit: "冈仁波齐", point: "塔尔钦周边", altitude: 4670, type: "神山" },
      "稻城亚丁 · 牛奶海 · 4600m": { province: "四川", geoUnit: "三怙主雪山", point: "牛奶海", altitude: 4600, type: "高原湖泊" },
      "玛旁雍错 · 湖区游览点 · 4588m": { province: "西藏", geoUnit: "冈仁波齐-玛旁雍错", point: "湖区游览点", altitude: 4588, type: "高原湖泊" },
      "雅哈垭口 · 观景点 · 4568m": { province: "四川", geoUnit: "贡嘎山", point: "观景点", altitude: 4568, type: "雪山观景" },
      "子梅垭口 · 观景点 · 4550m": { province: "四川", geoUnit: "贡嘎山", point: "观景点", altitude: 4550, type: "雪山观景" },
      "冷嘎措 · 湖边观景点 · 4530m": { province: "四川", geoUnit: "贡嘎山", point: "湖边观景点", altitude: 4530, type: "高原湖泊" },
      "羊卓雍措 · 湖区观景点 · 4441m": { province: "西藏", geoUnit: "喜马拉雅山北麓湖群", point: "湖区观景点", altitude: 4441, type: "高原湖泊" },
      "石卡雪山 · 索道高点 · 4449m": { province: "云南", geoUnit: "石卡雪山", point: "索道高点", altitude: 4449, type: "雪山景区" },
      "可可西里 · 索南达杰保护站 · 4479m": { province: "青海", geoUnit: "可可西里", point: "索南达杰保护站", altitude: 4479, type: "高原保护地" },
      "白马雪山 · 垭口 · 4292m": { province: "云南", geoUnit: "白马雪山", point: "公路垭口", altitude: 4292, type: "垭口" },
      "折多山 · 垭口 · 4298m": { province: "四川", geoUnit: "折多山", point: "公路垭口", altitude: 4298, type: "垭口" },
      "鱼子西 · 观景平台 · 4200m": { province: "四川", geoUnit: "贡嘎山/雅拉雪山观景带", point: "观景平台", altitude: 4200, type: "雪山观景" },
      "盘龙古道 · 最高观景垭口 · 4216m": { province: "新疆", geoUnit: "帕米尔高原", point: "最高观景垭口", altitude: 4216, type: "垭口" },
      "玉山 · 主峰步道终点 · 3952m": { province: "台湾", geoUnit: "玉山山脉", point: "主峰步道终点", altitude: 3952, type: "名山/高山" },
      "四姑娘山双桥沟 · 红杉林 · 3840m": { province: "四川", geoUnit: "四姑娘山", point: "红杉林", altitude: 3840, type: "雪山观景" },
      "喀拉库勒湖 · 湖边观景点 · 3600m": { province: "新疆", geoUnit: "慕士塔格峰/帕米尔高原", point: "湖边观景点", altitude: 3600, type: "高原湖泊" },
      "黄龙 · 五彩池 · 3576m": { province: "四川", geoUnit: "岷山", point: "五彩池", altitude: 3576, type: "高山景区" },
      "巴松措 · 湖区游览点 · 3480m": { province: "西藏", geoUnit: "念青唐古拉山东段", point: "湖区游览点", altitude: 3480, type: "高原湖泊" },
      "梅里雪山 · 飞来寺观景台 · 3400m": { province: "云南", geoUnit: "梅里雪山", point: "飞来寺观景台", altitude: 3400, type: "雪山观景" },
      "白沙湖/白沙山 · 湖边观景点 · 3300m": { province: "新疆", geoUnit: "帕米尔高原", point: "湖边观景点", altitude: 3300, type: "高原湖泊" },
      "青海湖 · 湖区游览点 · 3196m": { province: "青海", geoUnit: "青海湖盆地", point: "湖区游览点", altitude: 3196, type: "高原湖泊" },
      "峨眉山 · 金顶 · 3079m": { province: "四川", geoUnit: "峨眉山", point: "金顶", altitude: 3079, type: "佛教名山" },
      "五台山 · 北台叶斗峰 · 3061m": { province: "山西", geoUnit: "五台山", point: "北台叶斗峰", altitude: 3061, type: "佛教名山" },
      "茶卡盐湖 · 景区湖区 · 3059m": { province: "青海", geoUnit: "柴达木盆地边缘", point: "景区湖区", altitude: 3059, type: "高原湖泊" },
      "武夷山 · 黄岗山 · 2160m": { province: "福建/江西", geoUnit: "武夷山脉", point: "黄岗山", altitude: 2160, type: "名山" },
      "华山 · 南峰 · 2155m": { province: "陕西", geoUnit: "秦岭", point: "南峰", altitude: 2155, type: "五岳" },
      "恒山 · 天峰岭 · 2016m": { province: "山西", geoUnit: "恒山山脉", point: "天峰岭", altitude: 2016, type: "五岳" },
      "黄山 · 莲花峰 · 1864m": { province: "安徽", geoUnit: "黄山山脉", point: "莲花峰", altitude: 1864, type: "三山" },
      "三清山 · 玉京峰 · 1819m": { province: "江西", geoUnit: "怀玉山脉", point: "玉京峰", altitude: 1819, type: "名山" },
      "武当山 · 天柱峰 · 1612m": { province: "湖北", geoUnit: "武当山", point: "天柱峰", altitude: 1612, type: "道教名山" },
      "泰山 · 玉皇顶 · 1545m": { province: "山东", geoUnit: "泰山", point: "玉皇顶", altitude: 1545, type: "五岳" },
      "嵩山 · 峻极峰 · 1492m": { province: "河南", geoUnit: "嵩山", point: "峻极峰", altitude: 1492, type: "五岳" },
      "庐山 · 汉阳峰 · 1474m": { province: "江西", geoUnit: "庐山", point: "汉阳峰", altitude: 1474, type: "三山" },
      "九华山 · 十王峰 · 1342m": { province: "安徽", geoUnit: "九华山", point: "十王峰", altitude: 1342, type: "佛教名山" },
      "龙虎山 · 天门山 · 1300m": { province: "江西", geoUnit: "龙虎山", point: "天门山", altitude: 1300, type: "道教名山" },
      "衡山 · 祝融峰 · 1300m": { province: "湖南", geoUnit: "南岳衡山", point: "祝融峰", altitude: 1300, type: "五岳" },
      "青城山 · 老君阁/彭祖峰 · 1260m": { province: "四川", geoUnit: "青城山", point: "老君阁/彭祖峰", altitude: 1260, type: "道教名山" },
      "雁荡山 · 百岗尖 · 1108m": { province: "浙江", geoUnit: "雁荡山", point: "百岗尖", altitude: 1108, type: "三山" },
      "齐云山 · 廊崖 · 585m": { province: "安徽", geoUnit: "齐云山", point: "廊崖", altitude: 585, type: "道教名山" },
      "普陀山 · 佛顶山 · 291m": { province: "浙江", geoUnit: "普陀山", point: "佛顶山", altitude: 291, type: "佛教名山" },
      "乞力马扎罗 · Uhuru Peak步道终点 · 5895m": { country: "坦桑尼亚", countryId: "tz", province: "乞力马扎罗区", geoUnit: "乞力马扎罗山", point: "Uhuru Peak步道终点", altitude: 5895, type: "徒步高点", continent: "非洲" },
      "安纳普尔纳环线 · Thorong La山口 · 5416m": { country: "尼泊尔", countryId: "np", province: "甘达基/马南", geoUnit: "安纳普尔纳山群", point: "Thorong La山口", altitude: 5416, type: "徒步山口", continent: "亚洲" },
      "珠峰南坡 · 尼泊尔大本营 · 5364m": { country: "尼泊尔", countryId: "np", province: "科希/索卢昆布", geoUnit: "珠穆朗玛峰", point: "尼泊尔大本营", altitude: 5364, type: "徒步营地", continent: "亚洲" },
      "列城公路 · Khardung La山口 · 5359m": { country: "印度", countryId: "in", province: "拉达克", geoUnit: "喀喇昆仑山南缘", point: "Khardung La山口", altitude: 5359, type: "公路山口", continent: "亚洲" },
      "亚拉腊山 · 常规登山终点 · 5137m": { country: "土耳其", countryId: "tr", province: "东安纳托利亚地区", geoUnit: "亚拉腊山", point: "常规登山终点", altitude: 5137, type: "名山/徒步", continent: "亚洲" },
      "彩虹山 · 观景点 · 5036m": { country: "秘鲁", countryId: "pe", province: "库斯科大区", geoUnit: "安第斯山脉", point: "观景点", altitude: 5036, type: "高山观景", continent: "南美" },
      "肯尼亚山 · Point Lenana步道终点 · 4985m": { country: "肯尼亚", countryId: "ke", province: "肯尼亚山国家公园", geoUnit: "肯尼亚山", point: "Point Lenana步道终点", altitude: 4985, type: "徒步高点", continent: "非洲" },
      "科托帕希国家公园 · Jose Rivas山屋 · 4864m": { country: "厄瓜多尔", countryId: "ec", province: "科托帕希省", geoUnit: "科托帕希火山", point: "Jose Rivas山屋", altitude: 4864, type: "火山/山屋", continent: "南美" },
      "钦博拉索 · Carrel山屋 · 4850m": { country: "厄瓜多尔", countryId: "ec", province: "钦博拉索省", geoUnit: "钦博拉索火山", point: "Carrel山屋", altitude: 4850, type: "火山/山屋", continent: "南美" },
      "蓝天山 · 峰顶公路高点 · 4350m": { country: "美国", countryId: "us", province: "科罗拉多州", geoUnit: "落基山脉", point: "峰顶公路高点", altitude: 4350, type: "公路高点", continent: "北美" },
      "派克峰 · 公路/齿轨铁路峰顶 · 4302m": { country: "美国", countryId: "us", province: "科罗拉多州", geoUnit: "落基山脉", point: "公路/齿轨铁路峰顶", altitude: 4302, type: "名山/公路", continent: "北美" },
      "阿空加瓜省立公园 · Plaza de Mulas营地 · 4300m": { country: "阿根廷", countryId: "ar", province: "门多萨省", geoUnit: "阿空加瓜", point: "Plaza de Mulas营地", altitude: 4300, type: "高山营地", continent: "南美" },
      "奥里萨巴峰 · Piedra Grande营地 · 4260m": { country: "墨西哥", countryId: "mx", province: "普埃布拉/韦拉克鲁斯", geoUnit: "奥里萨巴峰", point: "Piedra Grande营地", altitude: 4260, type: "火山/营地", continent: "北美" },
      "班公湖 · 湖边观景点 · 4250m": { country: "印度", countryId: "in", province: "拉达克", geoUnit: "班公湖", point: "湖边观景点", altitude: 4250, type: "高原湖泊", continent: "亚洲" },
      "西门山国家公园 · Bwahit Pass观景点 · 4200m": { country: "埃塞俄比亚", countryId: "et", province: "阿姆哈拉州", geoUnit: "西门山", point: "Bwahit Pass观景点", altitude: 4200, type: "高山观景", continent: "非洲" },
      "莫纳克亚山 · 公路可达峰顶 · 4207m": { country: "美国", countryId: "us", province: "夏威夷州", geoUnit: "莫纳克亚火山", point: "公路可达峰顶", altitude: 4207, type: "火山/公路", continent: "北美" },
      "图卜卡勒峰 · 常规登山终点 · 4167m": { country: "摩洛哥", countryId: "ma", province: "马拉喀什-萨菲", geoUnit: "阿特拉斯山脉", point: "常规登山终点", altitude: 4167, type: "名山/徒步", continent: "非洲" },
      "基纳巴卢山 · Low's Peak步道终点 · 4095m": { country: "马来西亚", countryId: "my", province: "沙巴", geoUnit: "基纳巴卢山", point: "Low's Peak步道终点", altitude: 4095, type: "名山/徒步", continent: "亚洲" },
      "拉巴斯/埃尔阿尔托 · 城市高点 · 4060m": { country: "玻利维亚", countryId: "bo", province: "拉巴斯省", geoUnit: "安第斯高原", point: "城市高点", altitude: 4060, type: "高原城市", continent: "南美" },
      "小马特洪峰 · 缆车高点 · 3883m": { country: "瑞士", countryId: "ch", province: "瓦莱州", geoUnit: "阿尔卑斯山", point: "缆车高点", altitude: 3883, type: "缆车高点", continent: "欧洲" },
      "南针峰 · 缆车观景台 · 3842m": { country: "法国", countryId: "fr", province: "奥弗涅-罗讷-阿尔卑斯", geoUnit: "勃朗峰山群", point: "缆车观景台", altitude: 3842, type: "缆车高点", continent: "欧洲" },
      "落基山国家公园 · Trail Ridge Road高点 · 3713m": { country: "美国", countryId: "us", province: "科罗拉多州", geoUnit: "落基山国家公园", point: "Trail Ridge Road高点", altitude: 3713, type: "公路高点", continent: "北美" },
      "乌尤尼盐沼 · 盐沼游览点 · 3656m": { country: "玻利维亚", countryId: "bo", province: "波托西省", geoUnit: "乌尤尼盐沼", point: "盐沼游览点", altitude: 3656, type: "高原盐湖", continent: "南美" },
      "泰德峰 · 缆车上站 · 3555m": { country: "西班牙", countryId: "es", province: "加那利群岛", geoUnit: "泰德火山", point: "缆车上站", altitude: 3555, type: "火山/缆车", continent: "欧洲" },
      "少女峰火车站 · 欧洲屋脊 · 3454m": { country: "瑞士", countryId: "ch", province: "伯尔尼州", geoUnit: "伯尔尼阿尔卑斯", point: "欧洲屋脊火车站", altitude: 3454, type: "登山铁路", continent: "欧洲" },
      "戈尔内格拉特 · 登山铁路观景台 · 3135m": { country: "瑞士", countryId: "ch", province: "瓦莱州", geoUnit: "马特洪峰观景带", point: "登山铁路观景台", altitude: 3135, type: "登山铁路", continent: "欧洲" },
      "哈莱阿卡拉 · 火山口观景台 · 3055m": { country: "美国", countryId: "us", province: "夏威夷州", geoUnit: "哈莱阿卡拉火山", point: "火山口观景台", altitude: 3055, type: "火山/公路", continent: "北美" },
      "马丘比丘山 · 步道终点 · 3082m": { country: "秘鲁", countryId: "pe", province: "库斯科大区", geoUnit: "马丘比丘山", point: "步道终点", altitude: 3082, type: "名山/徒步", continent: "南美" },
      "楚格峰 · 缆车/齿轨铁路高点 · 2962m": { country: "德国", countryId: "de", province: "巴伐利亚州", geoUnit: "阿尔卑斯山", point: "缆车/齿轨铁路高点", altitude: 2962, type: "名山/缆车", continent: "欧洲" },
      "萨尼山口 · 公路山口 · 2876m": { country: "南非/莱索托", countryId: "za", province: "夸祖鲁-纳塔尔/莱索托", geoUnit: "德拉肯斯堡山脉", point: "公路山口", altitude: 2876, type: "公路山口", continent: "非洲" },
      "大钟山高山公路 · Edelweissspitze观景点 · 2571m": { country: "奥地利", countryId: "at", province: "萨尔茨堡/克恩顿", geoUnit: "大钟山高山公路", point: "Edelweissspitze观景点", altitude: 2571, type: "公路观景", continent: "欧洲" },
      "埃特纳火山 · 缆车上站区域 · 2500m": { country: "意大利", countryId: "it", province: "西西里", geoUnit: "埃特纳火山", point: "缆车上站区域", altitude: 2500, type: "火山/缆车", continent: "欧洲" },
      "富士山 · 五合目 · 2305m": { country: "日本", countryId: "jp", province: "山梨/静冈", geoUnit: "富士山", point: "五合目", altitude: 2305, type: "名山/公路", continent: "亚洲" },
      "科修斯科山 · 步道终点 · 2228m": { country: "澳大利亚", countryId: "au", province: "新南威尔士州", geoUnit: "澳大利亚阿尔卑斯山", point: "步道终点", altitude: 2228, type: "名山/徒步", continent: "大洋洲" },
      "惠斯勒山 · Peak Chair区域 · 2182m": { country: "加拿大", countryId: "ca", province: "不列颠哥伦比亚省", geoUnit: "海岸山脉", point: "Peak Chair区域", altitude: 2182, type: "滑雪/缆车", continent: "北美" },
      "汉拿山 · 白鹿潭步道终点 · 1950m": { country: "韩国", countryId: "kr", province: "济州", geoUnit: "汉拿山", point: "白鹿潭步道终点", altitude: 1950, type: "名山/徒步", continent: "亚洲" },
      "卡拉帕塔 · 珠峰观景徒步点 · 5644m": { country: "尼泊尔", countryId: "np", province: "科希/索卢昆布", geoUnit: "珠穆朗玛峰", point: "珠峰观景徒步点", altitude: 5644, type: "徒步高点", continent: "亚洲" },
      "昌拉山口 · 公路山口 · 5360m": { country: "印度", countryId: "in", province: "拉达克", geoUnit: "拉达克山脉", point: "公路山口", altitude: 5360, type: "公路山口", continent: "亚洲" },
      "戈京日 · 湖区徒步观景点 · 5357m": { country: "尼泊尔", countryId: "np", province: "科希/索卢昆布", geoUnit: "戈京湖群", point: "湖区徒步观景点", altitude: 5357, type: "徒步高点", continent: "亚洲" },
      "塔格朗拉山口 · 公路山口 · 5328m": { country: "印度", countryId: "in", province: "拉达克", geoUnit: "喜马拉雅公路", point: "公路山口", altitude: 5328, type: "公路山口", continent: "亚洲" },
      "查卡尔塔亚 · 公路高点 · 5300m": { country: "玻利维亚", countryId: "bo", province: "拉巴斯省", geoUnit: "安第斯山脉", point: "公路高点", altitude: 5300, type: "公路高点", continent: "南美" },
      "古鲁东玛湖 · 湖边游览点 · 5150m": { country: "印度", countryId: "in", province: "锡金", geoUnit: "喜马拉雅山", point: "湖边游览点", altitude: 5150, type: "高原湖泊", continent: "亚洲" },
      "帕斯托鲁里冰川 · 游览步道高点 · 5000m": { country: "秘鲁", countryId: "pe", province: "安卡什大区", geoUnit: "科迪勒拉布兰卡", point: "游览步道高点", altitude: 5000, type: "冰川景区", continent: "南美" },
      "锡金零点 · 公路高点 · 4663m": { country: "印度", countryId: "in", province: "锡金", geoUnit: "喜马拉雅山", point: "公路高点", altitude: 4663, type: "公路高点", continent: "亚洲" },
      "阿克拜塔尔山口 · 帕米尔公路山口 · 4655m": { country: "塔吉克斯坦", countryId: "tj", province: "戈尔诺-巴达赫尚", geoUnit: "帕米尔高原", point: "帕米尔公路山口", altitude: 4655, type: "公路山口", continent: "亚洲" },
      "梅鲁山 · 步道终点 · 4566m": { country: "坦桑尼亚", countryId: "tz", province: "阿鲁沙区", geoUnit: "梅鲁山", point: "步道终点", altitude: 4566, type: "名山/徒步", continent: "非洲" },
      "拉斯达申峰 · 常规徒步终点 · 4550m": { country: "埃塞俄比亚", countryId: "et", province: "阿姆哈拉州", geoUnit: "西门山", point: "常规徒步终点", altitude: 4550, type: "名山/徒步", continent: "非洲" },
      "萨内蒂高原 · 公路高点 · 4377m": { country: "埃塞俄比亚", countryId: "et", province: "奥罗米亚州", geoUnit: "贝尔山", point: "公路高点", altitude: 4377, type: "公路高点", continent: "非洲" },
      "格雷斯峰 · 步道终点 · 4352m": { country: "美国", countryId: "us", province: "科罗拉多州", geoUnit: "落基山脉", point: "步道终点", altitude: 4352, type: "名山/徒步", continent: "北美" },
      "马拉加山口 · 公路山口 · 4316m": { country: "秘鲁", countryId: "pe", province: "库斯科大区", geoUnit: "安第斯山脉", point: "公路山口", altitude: 4316, type: "公路山口", continent: "南美" },
      "内瓦多德托卢卡 · 火山口游览点 · 4200m": { country: "墨西哥", countryId: "mx", province: "墨西哥州", geoUnit: "内瓦多德托卢卡火山", point: "火山口游览点", altitude: 4200, type: "火山景区", continent: "北美" },
      "红湖 · 湖边观景点 · 4278m": { country: "玻利维亚", countryId: "bo", province: "波托西省", geoUnit: "安第斯高原", point: "湖边观景点", altitude: 4278, type: "高原湖泊", continent: "南美" },
      "喀麦隆山 · 常规登山终点 · 4040m": { country: "喀麦隆", countryId: "cm", province: "西南区", geoUnit: "喀麦隆山", point: "常规登山终点", altitude: 4040, type: "火山/徒步", continent: "非洲" },
      "基多缆车 · Cruz Loma观景点 · 4050m": { country: "厄瓜多尔", countryId: "ec", province: "皮钦查省", geoUnit: "皮钦查火山", point: "Cruz Loma观景点", altitude: 4050, type: "缆车高点", continent: "南美" },
      "内瓦多德鲁伊斯 · 游客区 · 4050m": { country: "哥伦比亚", countryId: "co", province: "卡尔达斯/托利马", geoUnit: "鲁伊斯火山", point: "游客区", altitude: 4050, type: "火山景区", continent: "南美" },
      "惠特尼山 · 步道终点 · 4421m": { country: "美国", countryId: "us", province: "加利福尼亚州", geoUnit: "内华达山脉", point: "步道终点", altitude: 4421, type: "名山/徒步", continent: "北美" },
      "惠勒峰 · 新墨西哥步道终点 · 4013m": { country: "美国", countryId: "us", province: "新墨西哥州", geoUnit: "桑格雷德克里斯托山脉", point: "步道终点", altitude: 4013, type: "名山/徒步", continent: "北美" },
      "安蒂萨纳 · 火山观景点 · 4000m": { country: "厄瓜多尔", countryId: "ec", province: "纳波省", geoUnit: "安蒂萨纳火山", point: "火山观景点", altitude: 4000, type: "火山观景", continent: "南美" },
      "伊斯塔西瓦特尔 · La Joya登山口 · 3970m": { country: "墨西哥", countryId: "mx", province: "墨西哥州/普埃布拉", geoUnit: "伊斯塔西瓦特尔火山", point: "La Joya登山口", altitude: 3970, type: "登山口", continent: "北美" },
      "基洛托阿火山湖 · 环湖观景点 · 3914m": { country: "厄瓜多尔", countryId: "ec", province: "科托帕希省", geoUnit: "基洛托阿火山湖", point: "环湖观景点", altitude: 3914, type: "火山湖", continent: "南美" },
      "阿拉湖山口 · 徒步山口 · 3860m": { country: "吉尔吉斯斯坦", countryId: "kg", province: "伊塞克湖州", geoUnit: "天山", point: "徒步山口", altitude: 3860, type: "徒步山口", continent: "亚洲" },
      "奇里波峰 · 步道终点 · 3820m": { country: "哥斯达黎加", countryId: "cr", province: "圣何塞/利蒙", geoUnit: "奇里波山", point: "步道终点", altitude: 3820, type: "名山/徒步", continent: "北美" },
      "汉弗莱斯峰 · 步道终点 · 3852m": { country: "美国", countryId: "us", province: "亚利桑那州", geoUnit: "圣弗朗西斯科峰", point: "步道终点", altitude: 3852, type: "名山/徒步", continent: "北美" },
      "厄尔布鲁士山 · Garabashi缆车站 · 3847m": { country: "俄罗斯", countryId: "ru", province: "北高加索", geoUnit: "高加索山脉", point: "Garabashi缆车站", altitude: 3847, type: "缆车高点", continent: "欧洲" },
      "巴尔斯孔山口 · 公路山口 · 3754m": { country: "吉尔吉斯斯坦", countryId: "kg", province: "伊塞克湖州", geoUnit: "天山", point: "公路山口", altitude: 3754, type: "公路山口", continent: "亚洲" },
      "独立山口 · 公路山口 · 3687m": { country: "美国", countryId: "us", province: "科罗拉多州", geoUnit: "落基山脉", point: "公路山口", altitude: 3687, type: "公路山口", continent: "北美" },
      "洛夫兰山口 · 公路山口 · 3655m": { country: "美国", countryId: "us", province: "科罗拉多州", geoUnit: "落基山脉", point: "公路山口", altitude: 3655, type: "公路山口", continent: "北美" },
      "林贾尼火山 · 常规登山终点 · 3726m": { country: "印度尼西亚", countryId: "id", province: "西努沙登加拉", geoUnit: "林贾尼火山", point: "常规登山终点", altitude: 3726, type: "火山/徒步", continent: "亚洲" },
      "猛犸山 · 缆车高点 · 3369m": { country: "美国", countryId: "us", province: "加利福尼亚州", geoUnit: "内华达山脉", point: "缆车高点", altitude: 3369, type: "缆车高点", continent: "北美" },
      "科尔卡峡谷 · 秃鹰十字观景台 · 3287m": { country: "秘鲁", countryId: "pe", province: "阿雷基帕大区", geoUnit: "科尔卡峡谷", point: "秃鹰十字观景台", altitude: 3287, type: "峡谷观景", continent: "南美" },
      "马尔莫拉达 · Punta Rocca缆车站 · 3265m": { country: "意大利", countryId: "it", province: "威尼托/特伦蒂诺", geoUnit: "多洛米蒂", point: "Punta Rocca缆车站", altitude: 3265, type: "缆车高点", continent: "欧洲" },
      "布恩山 · 徒步观景点 · 3210m": { country: "尼泊尔", countryId: "np", province: "甘达基", geoUnit: "安纳普尔纳山群", point: "徒步观景点", altitude: 3210, type: "徒步观景", continent: "亚洲" },
      "解放者山口 · 国际公路山口 · 3200m": { country: "智利/阿根廷", countryId: "cl", province: "瓦尔帕莱索/门多萨", geoUnit: "安第斯山脉", point: "国际公路山口", altitude: 3200, type: "公路山口", continent: "南美" },
      "琼布拉克 · Talgar Pass滑雪区高点 · 3180m": { country: "哈萨克斯坦", countryId: "kz", province: "阿拉木图", geoUnit: "天山", point: "Talgar Pass滑雪区高点", altitude: 3180, type: "滑雪/缆车", continent: "亚洲" },
      "蒙塞拉特山 · 缆车山顶 · 3152m": { country: "哥伦比亚", countryId: "co", province: "波哥大", geoUnit: "东科迪勒拉山脉", point: "缆车山顶", altitude: 3152, type: "城市山顶/缆车", continent: "南美" },
      "番西邦峰 · 缆车/步道终点 · 3143m": { country: "越南", countryId: "vn", province: "老街省", geoUnit: "黄连山脉", point: "缆车/步道终点", altitude: 3143, type: "名山/缆车", continent: "亚洲" },
      "内日峰 · 留尼汪步道终点 · 3070m": { country: "法国", countryId: "fr", province: "留尼汪", geoUnit: "内日峰", point: "步道终点", altitude: 3070, type: "火山/徒步", continent: "非洲" },
      "内瓦多谷 · 滑雪区高点 · 3025m": { country: "智利", countryId: "cl", province: "圣地亚哥首都大区", geoUnit: "安第斯山脉", point: "滑雪区高点", altitude: 3025, type: "滑雪区", continent: "南美" },
      "宋库尔湖 · 湖边游览点 · 3016m": { country: "吉尔吉斯斯坦", countryId: "kg", province: "纳伦州", geoUnit: "天山", point: "湖边游览点", altitude: 3016, type: "高原湖泊", continent: "亚洲" },
      "图盖拉瀑布顶端 · 德拉肯斯堡步道点 · 3000m": { country: "南非/莱索托", countryId: "za", province: "夸祖鲁-纳塔尔/莱索托", geoUnit: "德拉肯斯堡山脉", point: "瀑布顶端步道点", altitude: 3000, type: "峡谷/徒步", continent: "非洲" },
      "帕塔潘帕山口 · 火山观景公路点 · 4910m": { country: "秘鲁", countryId: "pe", province: "阿雷基帕大区", geoUnit: "安第斯山脉", point: "火山观景公路点", altitude: 4910, type: "公路观景", continent: "南美" },
      "拉古纳69 · 湖边步道终点 · 4600m": { country: "秘鲁", countryId: "pe", province: "安卡什大区", geoUnit: "科迪勒拉布兰卡", point: "湖边步道终点", altitude: 4600, type: "高原湖泊", continent: "南美" },
      "昆祖姆山口 · 公路山口 · 4551m": { country: "印度", countryId: "in", province: "喜马偕尔邦", geoUnit: "斯皮提/喜马拉雅山", point: "公路山口", altitude: 4551, type: "公路山口", continent: "亚洲" },
      "琼加拉湖 · 湖边观景点 · 4517m": { country: "智利", countryId: "cl", province: "阿里卡和帕里纳科塔大区", geoUnit: "安第斯高原", point: "湖边观景点", altitude: 4517, type: "高原湖泊", continent: "南美" },
      "威廉山 · 巴布亚新几内亚步道终点 · 4509m": { country: "巴布亚新几内亚", countryId: "pg", province: "钦布省", geoUnit: "俾斯麦山脉", point: "步道终点", altitude: 4509, type: "名山/徒步", continent: "大洋洲" },
      "塔蒂奥间歇泉 · 游览区 · 4320m": { country: "智利", countryId: "cl", province: "安托法加斯塔大区", geoUnit: "阿塔卡马高原", point: "游览区", altitude: 4320, type: "高原地热", continent: "南美" },
      "拉拉亚山口 · 公路山口 · 4335m": { country: "秘鲁", countryId: "pe", province: "库斯科/普诺", geoUnit: "安第斯山脉", point: "公路山口", altitude: 4335, type: "公路山口", continent: "南美" },
      "塔胡穆尔科火山 · 常规登山终点 · 4220m": { country: "危地马拉", countryId: "gt", province: "圣马科斯省", geoUnit: "塔胡穆尔科火山", point: "常规登山终点", altitude: 4220, type: "火山/徒步", continent: "北美" },
      "乌马太湖 · 湖边观景点 · 4200m": { country: "秘鲁", countryId: "pe", province: "库斯科大区", geoUnit: "安第斯山脉", point: "湖边观景点", altitude: 4200, type: "高原湖泊", continent: "南美" },
      "达马万德山 · Bargah Sevom营地 · 4200m": { country: "伊朗", countryId: "ir", province: "马赞德兰省", geoUnit: "厄尔布尔士山脉", point: "Bargah Sevom营地", altitude: 4200, type: "高山营地", continent: "亚洲" },
      "巴布萨尔山口 · 公路山口 · 4173m": { country: "巴基斯坦", countryId: "pk", province: "开伯尔-普什图省/吉尔吉特-巴尔蒂斯坦", geoUnit: "喀喇昆仑/喜马拉雅公路", point: "公路山口", altitude: 4173, type: "公路山口", continent: "亚洲" },
      "安纳普尔纳大本营 · 徒步营地 · 4130m": { country: "尼泊尔", countryId: "np", province: "甘达基", geoUnit: "安纳普尔纳山群", point: "徒步营地", altitude: 4130, type: "徒步营地", continent: "亚洲" },
      "米斯坎蒂湖 · 湖边观景点 · 4120m": { country: "智利", countryId: "cl", province: "安托法加斯塔大区", geoUnit: "阿塔卡马高原", point: "湖边观景点", altitude: 4120, type: "高原湖泊", continent: "南美" },
      "皮凯峰 · 珠峰远眺点 · 4065m": { country: "尼泊尔", countryId: "np", province: "科希/索卢昆布", geoUnit: "喜马拉雅山", point: "珠峰远眺点", altitude: 4065, type: "徒步观景", continent: "亚洲" },
      "罗唐山口 · 公路山口 · 3978m": { country: "印度", countryId: "in", province: "喜马偕尔邦", geoUnit: "喜马拉雅山", point: "公路山口", altitude: 3978, type: "公路山口", continent: "亚洲" },
      "阿拉加茨山 · 南峰步道终点 · 3888m": { country: "亚美尼亚", countryId: "am", province: "阿拉加措特恩省", geoUnit: "阿拉加茨山", point: "南峰步道终点", altitude: 3888, type: "名山/徒步", continent: "亚洲" },
      "瓦斯卡兰国家公园 · 扬加努科湖区 · 3850m": { country: "秘鲁", countryId: "pe", province: "安卡什大区", geoUnit: "科迪勒拉布兰卡", point: "扬加努科湖区", altitude: 3850, type: "高山湖区", continent: "南美" },
      "托查尔山 · 缆车高点 · 3740m": { country: "伊朗", countryId: "ir", province: "德黑兰省", geoUnit: "厄尔布尔士山脉", point: "缆车高点", altitude: 3740, type: "缆车高点", continent: "亚洲" },
      "的的喀喀湖 · 湖边游览点 · 3812m": { country: "秘鲁/玻利维亚", countryId: "pe", province: "普诺/拉巴斯", geoUnit: "安第斯高原", point: "湖边游览点", altitude: 3812, type: "高原湖泊", continent: "南美" },
      "科顿伍德山口 · 公路山口 · 3696m": { country: "美国", countryId: "us", province: "科罗拉多州", geoUnit: "落基山脉", point: "公路山口", altitude: 3696, type: "公路山口", continent: "北美" },
      "波波卡特佩特尔 · Paso de Cortes山口 · 3600m": { country: "墨西哥", countryId: "mx", province: "墨西哥州/普埃布拉", geoUnit: "波波卡特佩特尔火山", point: "Paso de Cortes山口", altitude: 3600, type: "火山观景", continent: "北美" },
      "玛蒂希玛尔 · 高营地 · 3580m": { country: "尼泊尔", countryId: "np", province: "甘达基", geoUnit: "安纳普尔纳山群", point: "高营地", altitude: 3580, type: "徒步营地", continent: "亚洲" },
      "瓜内拉山口 · 公路山口 · 3557m": { country: "美国", countryId: "us", province: "科罗拉多州", geoUnit: "落基山脉", point: "公路山口", altitude: 3557, type: "公路山口", continent: "北美" },
      "米特阿拉林 · 冰川地铁高点 · 3457m": { country: "瑞士", countryId: "ch", province: "瓦莱州", geoUnit: "阿尔卑斯山", point: "冰川地铁高点", altitude: 3457, type: "缆车/地铁高点", continent: "欧洲" },
      "尼拉贡戈火山 · 火山口徒步终点 · 3470m": { country: "刚果民主共和国", countryId: "cd", province: "北基伍省", geoUnit: "维龙加火山群", point: "火山口徒步终点", altitude: 3470, type: "火山/徒步", continent: "非洲" },
      "莫纳罗亚山 · 公路观测站 · 3397m": { country: "美国", countryId: "us", province: "夏威夷州", geoUnit: "莫纳罗亚火山", point: "公路观测站", altitude: 3397, type: "火山/公路", continent: "北美" },
      "贝尔图斯山口 · 公路山口 · 3337m": { country: "美国", countryId: "us", province: "蒙大拿/怀俄明", geoUnit: "落基山脉", point: "公路山口", altitude: 3337, type: "公路山口", continent: "北美" },
      "费尔梅多斯 · 南迦帕尔巴特观景点 · 3300m": { country: "巴基斯坦", countryId: "pk", province: "吉尔吉特-巴尔蒂斯坦", geoUnit: "南迦帕尔巴特", point: "雪山观景点", altitude: 3300, type: "雪山观景", continent: "亚洲" },
      "科尔瓦奇峰 · 缆车高点 · 3303m": { country: "瑞士", countryId: "ch", province: "格劳宾登州", geoUnit: "伯尔尼纳山群", point: "缆车高点", altitude: 3303, type: "缆车高点", continent: "欧洲" },
      "乌凯迈登 · 滑雪区高点 · 3268m": { country: "摩洛哥", countryId: "ma", province: "马拉喀什-萨菲", geoUnit: "阿特拉斯山脉", point: "滑雪区高点", altitude: 3268, type: "滑雪区", continent: "非洲" },
      "马拉塞拉山口 · 莱索托公路高点 · 3222m": { country: "莱索托", countryId: "ls", province: "布塔布泰区", geoUnit: "马洛蒂山脉", point: "公路高点", altitude: 3222, type: "公路山口", continent: "非洲" },
      "拉森峰 · 火山步道终点 · 3187m": { country: "美国", countryId: "us", province: "加利福尼亚州", geoUnit: "喀斯喀特山脉", point: "火山步道终点", altitude: 3187, type: "火山/徒步", continent: "北美" },
      "杰克逊霍尔缆车 · Rendezvous Mountain · 3185m": { country: "美国", countryId: "us", province: "怀俄明州", geoUnit: "提顿山脉", point: "缆车高点", altitude: 3185, type: "缆车高点", continent: "北美" },
      "蒂奥加山口 · 公路山口 · 3031m": { country: "美国", countryId: "us", province: "加利福尼亚州", geoUnit: "内华达山脉", point: "公路山口", altitude: 3031, type: "公路山口", continent: "北美" },
      "穆兰杰山 · Sapitwa步道终点 · 3002m": { country: "马拉维", countryId: "mw", province: "南部区", geoUnit: "穆兰杰山", point: "Sapitwa步道终点", altitude: 3002, type: "名山/徒步", continent: "非洲" },
      "铁力士山 · 缆车观景台 · 3020m": { country: "瑞士", countryId: "ch", province: "上瓦尔登/乌里", geoUnit: "阿尔卑斯山", point: "缆车观景台", altitude: 3020, type: "缆车高点", continent: "欧洲" },
      "冰川3000 · Scex Rouge观景点 · 2971m": { country: "瑞士", countryId: "ch", province: "沃州/伯尔尼州", geoUnit: "阿尔卑斯山", point: "Scex Rouge观景点", altitude: 2971, type: "缆车高点", continent: "欧洲" },
      "雪朗峰 · Piz Gloria观景台 · 2970m": { country: "瑞士", countryId: "ch", province: "伯尔尼州", geoUnit: "阿尔卑斯山", point: "Piz Gloria观景台", altitude: 2970, type: "缆车高点", continent: "欧洲" },
      "迪亚沃勒扎 · 缆车观景台 · 2978m": { country: "瑞士", countryId: "ch", province: "格劳宾登州", geoUnit: "伯尔尼纳山群", point: "缆车观景台", altitude: 2978, type: "缆车高点", continent: "欧洲" },
      "穆萨拉峰 · 步道终点 · 2925m": { country: "保加利亚", countryId: "bg", province: "索菲亚州", geoUnit: "里拉山", point: "步道终点", altitude: 2925, type: "名山/徒步", continent: "欧洲" },
      "南比戈尔峰 · 缆车观景台 · 2877m": { country: "法国", countryId: "fr", province: "奥克西塔尼", geoUnit: "比利牛斯山", point: "缆车观景台", altitude: 2877, type: "缆车观景", continent: "欧洲" },
      "奥林匹斯山 · 米蒂卡斯峰 · 2918m": { country: "希腊", countryId: "gr", province: "中马其顿", geoUnit: "奥林匹斯山", point: "米蒂卡斯峰", altitude: 2918, type: "名山/徒步", continent: "欧洲" },
      "普拉格山 · 步道终点 · 2922m": { country: "菲律宾", countryId: "ph", province: "科迪勒拉行政区", geoUnit: "普拉格山", point: "步道终点", altitude: 2922, type: "名山/徒步", continent: "亚洲" },
      "特里格拉夫峰 · 常规徒步终点 · 2864m": { country: "斯洛文尼亚", countryId: "si", province: "上卡尼奥拉", geoUnit: "朱利安阿尔卑斯", point: "常规徒步终点", altitude: 2864, type: "名山/徒步", continent: "欧洲" },
      "乘鞍岳 · 畳平 · 2702m": { country: "日本", countryId: "jp", province: "中部", geoUnit: "北阿尔卑斯/乘鞍岳", point: "畳平", altitude: 2702, type: "山岳公路", continent: "亚洲" },
      "斯泰尔维奥山口 · 公路山口 · 2758m": { country: "意大利", countryId: "it", province: "伦巴第/特伦蒂诺-上阿迪杰", geoUnit: "阿尔卑斯山", point: "公路山口", altitude: 2758, type: "公路山口", continent: "欧洲" },
      "鲁阿佩胡山 · 火山口湖观景点 · 2672m": { country: "新西兰", countryId: "nz", province: "马纳瓦图-旺加努伊", geoUnit: "鲁阿佩胡火山", point: "火山口湖观景点", altitude: 2672, type: "火山/徒步", continent: "大洋洲" },
      "布罗莫火山 · King Kong Hill观景点 · 2600m": { country: "印度尼西亚", countryId: "id", province: "东爪哇", geoUnit: "布罗莫-腾格尔火山群", point: "King Kong Hill观景点", altitude: 2600, type: "火山观景", continent: "亚洲" },
      "因他暖山 · 泰国最高点 · 2565m": { country: "泰国", countryId: "th", province: "清迈府", geoUnit: "因他暖山", point: "泰国最高点", altitude: 2565, type: "名山/公路", continent: "亚洲" },
      "大阿拉木图湖 · 湖边游览点 · 2511m": { country: "哈萨克斯坦", countryId: "kz", province: "阿拉木图", geoUnit: "天山", point: "湖边游览点", altitude: 2511, type: "高山湖泊", continent: "亚洲" },
      "塞切达山 · 缆车观景点 · 2519m": { country: "意大利", countryId: "it", province: "特伦蒂诺-上阿迪杰", geoUnit: "多洛米蒂", point: "缆车观景点", altitude: 2519, type: "缆车观景", continent: "欧洲" },
      "塔拉纳基山 · 步道终点 · 2518m": { country: "新西兰", countryId: "nz", province: "塔拉纳基", geoUnit: "塔拉纳基山", point: "步道终点", altitude: 2518, type: "名山/徒步", continent: "大洋洲" },
      "惠斯勒斯山 · 贾斯珀缆车高点 · 2463m": { country: "加拿大", countryId: "ca", province: "艾伯塔省", geoUnit: "加拿大落基山", point: "贾斯珀缆车高点", altitude: 2463, type: "缆车高点", continent: "北美" },
      "立山室堂 · 阿尔卑斯路线高点 · 2450m": { country: "日本", countryId: "jp", province: "中部", geoUnit: "立山连峰", point: "阿尔卑斯路线高点", altitude: 2450, type: "山岳路线", continent: "亚洲" },
      "鹰巢站 · 勃朗峰有轨电车终点 · 2372m": { country: "法国", countryId: "fr", province: "奥弗涅-罗讷-阿尔卑斯", geoUnit: "勃朗峰山群", point: "有轨电车终点", altitude: 2372, type: "登山铁路", continent: "欧洲" },
      "弗朗茨约瑟夫高地 · 大钟山观景点 · 2369m": { country: "奥地利", countryId: "at", province: "克恩顿", geoUnit: "大钟山", point: "观景点", altitude: 2369, type: "公路观景", continent: "欧洲" },
      "三峰山景区 · Auronzo山屋 · 2320m": { country: "意大利", countryId: "it", province: "威尼托", geoUnit: "多洛米蒂", point: "Auronzo山屋", altitude: 2320, type: "山岳景区", continent: "欧洲" },
      "硫磺山 · 班夫缆车上站 · 2281m": { country: "加拿大", countryId: "ca", province: "艾伯塔省", geoUnit: "加拿大落基山", point: "班夫缆车上站", altitude: 2281, type: "缆车高点", continent: "北美" },
      "波尔多伊山口 · 公路山口 · 2239m": { country: "意大利", countryId: "it", province: "特伦蒂诺-上阿迪杰/威尼托", geoUnit: "多洛米蒂", point: "公路山口", altitude: 2239, type: "公路山口", continent: "欧洲" },
      "亚当峰 · 朝圣步道终点 · 2243m": { country: "斯里兰卡", countryId: "lk", province: "萨伯勒格穆沃省", geoUnit: "亚当峰", point: "朝圣步道终点", altitude: 2243, type: "名山/朝圣", continent: "亚洲" },
      "卡兹别克 · 圣三一教堂观景点 · 2170m": { country: "格鲁吉亚", countryId: "ge", province: "姆茨赫塔-姆季阿涅季", geoUnit: "高加索山脉", point: "圣三一教堂观景点", altitude: 2170, type: "雪山观景", continent: "亚洲" },
      "皮拉图斯山 · 齿轨/缆车高点 · 2128m": { country: "瑞士", countryId: "ch", province: "卢塞恩/上瓦尔登", geoUnit: "阿尔卑斯前山", point: "齿轨/缆车高点", altitude: 2128, type: "名山/缆车", continent: "欧洲" },
      "华盛顿山 · 公路/齿轨铁路峰顶 · 1917m": { country: "美国", countryId: "us", province: "新罕布什尔州", geoUnit: "白山山脉", point: "公路/齿轨铁路峰顶", altitude: 1917, type: "名山/公路", continent: "北美" },
      "杰贝勒杰斯山 · 公路观景点 · 1934m": { country: "阿拉伯联合酋长国", countryId: "ae", province: "哈伊马角", geoUnit: "哈杰尔山脉", point: "公路观景点", altitude: 1934, type: "公路观景", continent: "亚洲" },
      "克灵曼圆顶 · 观景塔 · 2025m": { country: "美国", countryId: "us", province: "田纳西/北卡罗来纳", geoUnit: "大烟山", point: "观景塔", altitude: 2025, type: "名山/公路", continent: "北美" },
      "库克山国家公园 · Mueller Hut · 1800m": { country: "新西兰", countryId: "nz", province: "坎特伯雷", geoUnit: "南阿尔卑斯山", point: "Mueller Hut", altitude: 1800, type: "雪山观景/徒步", continent: "大洋洲" },
      "阿凯山口 · 公路山口 · 4895m": { country: "阿根廷", countryId: "ar", province: "萨尔塔省", geoUnit: "安第斯山脉", point: "公路山口", altitude: 4895, type: "公路山口", continent: "南美" },
      "拉昆布雷山口 · 永加斯公路高点 · 4650m": { country: "玻利维亚", countryId: "bo", province: "拉巴斯省", geoUnit: "安第斯山脉", point: "永加斯公路高点", altitude: 4650, type: "公路山口", continent: "南美" },
      "萨尔坎泰山口 · 徒步山口 · 4630m": { country: "秘鲁", countryId: "pe", province: "库斯科大区", geoUnit: "萨尔坎泰山", point: "徒步山口", altitude: 4630, type: "徒步山口", continent: "南美" },
      "霍尔诺卡尔山 · 彩山观景点 · 4350m": { country: "阿根廷", countryId: "ar", province: "胡胡伊省", geoUnit: "安第斯山脉", point: "彩山观景点", altitude: 4350, type: "高山观景", continent: "南美" },
      "萨哈马国家公园 · 间歇泉区 · 4300m": { country: "玻利维亚", countryId: "bo", province: "奥鲁罗省", geoUnit: "萨哈马国家公园", point: "间歇泉区", altitude: 4300, type: "高原地热", continent: "南美" },
      "基孜勒阿尔特山口 · 帕米尔公路山口 · 4280m": { country: "塔吉克斯坦/吉尔吉斯斯坦", countryId: "tj", province: "戈尔诺-巴达赫尚/奥什州", geoUnit: "帕米尔高原", point: "帕米尔公路山口", altitude: 4280, type: "公路山口", continent: "亚洲" },
      "哈马山口 · 国际公路山口 · 4200m": { country: "智利/阿根廷", countryId: "cl", province: "安托法加斯塔/胡胡伊", geoUnit: "安第斯山脉", point: "国际公路山口", altitude: 4200, type: "公路山口", continent: "南美" },
      "德奥赛高原 · Sheosar湖 · 4142m": { country: "巴基斯坦", countryId: "pk", province: "吉尔吉特-巴尔蒂斯坦", geoUnit: "德奥赛高原", point: "Sheosar湖", altitude: 4142, type: "高原湖泊", continent: "亚洲" },
      "帕帕亚克塔山口 · 公路山口 · 4064m": { country: "厄瓜多尔", countryId: "ec", province: "纳波/皮钦查", geoUnit: "安第斯山脉", point: "公路山口", altitude: 4064, type: "公路山口", continent: "南美" },
      "帕尔卡约彩虹山 · 观景点 · 4900m": { country: "秘鲁", countryId: "pe", province: "库斯科大区", geoUnit: "安第斯山脉", point: "观景点", altitude: 4900, type: "高山观景", continent: "南美" },
      "卡拉库里湖 · 帕米尔公路湖区 · 3914m": { country: "塔吉克斯坦", countryId: "tj", province: "戈尔诺-巴达赫尚", geoUnit: "帕米尔高原", point: "湖区游览点", altitude: 3914, type: "高原湖泊", continent: "亚洲" },
      "亚什库勒湖 · 湖边观景点 · 3734m": { country: "塔吉克斯坦", countryId: "tj", province: "戈尔诺-巴达赫尚", geoUnit: "帕米尔高原", point: "湖边观景点", altitude: 3734, type: "高原湖泊", continent: "亚洲" },
      "香多尔山口 · 公路山口 · 3738m": { country: "巴基斯坦", countryId: "pk", province: "开伯尔-普什图省/吉尔吉特-巴尔蒂斯坦", geoUnit: "兴都库什山脉", point: "公路山口", altitude: 3738, type: "公路山口", continent: "亚洲" },
      "图奥阿舒山口 · 公路山口 · 3586m": { country: "吉尔吉斯斯坦", countryId: "kg", province: "楚河州", geoUnit: "天山", point: "公路山口", altitude: 3586, type: "公路山口", continent: "亚洲" },
      "拉玛草甸 · 南迦帕尔巴特观景点 · 3300m": { country: "巴基斯坦", countryId: "pk", province: "吉尔吉特-巴尔蒂斯坦", geoUnit: "南迦帕尔巴特", point: "雪山观景点", altitude: 3300, type: "雪山观景", continent: "亚洲" },
      "塔什拉巴特 · 高原驿站 · 3200m": { country: "吉尔吉斯斯坦", countryId: "kg", province: "纳伦州", geoUnit: "天山", point: "高原驿站", altitude: 3200, type: "高原文化点", continent: "亚洲" },
      "伊塞兰山口 · 阿尔卑斯公路山口 · 2764m": { country: "法国", countryId: "fr", province: "奥弗涅-罗讷-阿尔卑斯", geoUnit: "阿尔卑斯山", point: "公路山口", altitude: 2764, type: "公路山口", continent: "欧洲" },
      "蒂默尔斯约赫山口 · 阿尔卑斯公路山口 · 2474m": { country: "奥地利/意大利", countryId: "at", province: "蒂罗尔/南蒂罗尔", geoUnit: "阿尔卑斯山", point: "公路山口", altitude: 2474, type: "公路山口", continent: "欧洲" },
      "富尔卡山口 · 阿尔卑斯公路山口 · 2429m": { country: "瑞士", countryId: "ch", province: "瓦莱/乌里", geoUnit: "阿尔卑斯山", point: "公路山口", altitude: 2429, type: "公路山口", continent: "欧洲" },
      "格里姆瑟尔山口 · 阿尔卑斯公路山口 · 2164m": { country: "瑞士", countryId: "ch", province: "伯尔尼/瓦莱", geoUnit: "阿尔卑斯山", point: "公路山口", altitude: 2164, type: "公路山口", continent: "欧洲" },
      "苏斯滕山口 · 阿尔卑斯公路山口 · 2224m": { country: "瑞士", countryId: "ch", province: "伯尔尼/乌里", geoUnit: "阿尔卑斯山", point: "公路山口", altitude: 2224, type: "公路山口", continent: "欧洲" },
      "十字架山口 · 高加索公路山口 · 2379m": { country: "格鲁吉亚", countryId: "ge", province: "姆茨赫塔-姆季阿涅季", geoUnit: "高加索山脉", point: "公路山口", altitude: 2379, type: "公路山口", continent: "亚洲" },
      "科鲁尔迪湖 · 梅斯蒂亚观景徒步点 · 2740m": { country: "格鲁吉亚", countryId: "ge", province: "萨梅格列罗-上斯瓦涅季", geoUnit: "高加索山脉", point: "梅斯蒂亚观景徒步点", altitude: 2740, type: "雪山观景", continent: "亚洲" },
      "塞利姆山口 · 亚美尼亚公路山口 · 2410m": { country: "亚美尼亚", countryId: "am", province: "瓦约茨佐尔", geoUnit: "小高加索山脉", point: "公路山口", altitude: 2410, type: "公路山口", continent: "亚洲" },
      "沙赫达格 · 滑雪区高点 · 2500m": { country: "阿塞拜疆", countryId: "az", province: "古萨尔区", geoUnit: "大高加索山脉", point: "滑雪区高点", altitude: 2500, type: "滑雪区", continent: "亚洲" },
      "雷尼尔山 · Camp Muir · 3105m": { country: "美国", countryId: "us", province: "华盛顿州", geoUnit: "雷尼尔山", point: "Camp Muir", altitude: 3105, type: "雪山徒步", continent: "北美" },
      "大提顿 · Paintbrush Divide · 3260m": { country: "美国", countryId: "us", province: "怀俄明州", geoUnit: "提顿山脉", point: "Paintbrush Divide", altitude: 3260, type: "徒步山口", continent: "北美" },
      "黄石 · Mount Washburn步道终点 · 3122m": { country: "美国", countryId: "us", province: "怀俄明州", geoUnit: "黄石国家公园", point: "Mount Washburn步道终点", altitude: 3122, type: "国家公园徒步", continent: "北美" },
      "锡达布雷克斯 · 观景点 · 3150m": { country: "美国", countryId: "us", province: "犹他州", geoUnit: "科罗拉多高原", point: "观景点", altitude: 3150, type: "国家纪念地观景", continent: "北美" },
      "布赖恩峰 · 公路高点 · 3446m": { country: "美国", countryId: "us", province: "犹他州", geoUnit: "科罗拉多高原", point: "公路高点", altitude: 3446, type: "公路高点", continent: "北美" },
      "内华达惠勒峰 · 步道终点 · 3982m": { country: "美国", countryId: "us", province: "内华达州", geoUnit: "大盆地", point: "步道终点", altitude: 3982, type: "国家公园徒步", continent: "北美" },
      "瓜达卢佩峰 · 步道终点 · 2667m": { country: "美国", countryId: "us", province: "得克萨斯州", geoUnit: "瓜达卢佩山脉", point: "步道终点", altitude: 2667, type: "国家公园徒步", continent: "北美" },
      "桑迪亚峰 · 缆车高点 · 3163m": { country: "美国", countryId: "us", province: "新墨西哥州", geoUnit: "桑迪亚山脉", point: "缆车高点", altitude: 3163, type: "缆车高点", continent: "北美" },
      "洛根山口 · 冰川国家公园公路山口 · 2026m": { country: "美国", countryId: "us", province: "蒙大拿州", geoUnit: "冰川国家公园", point: "公路山口", altitude: 2026, type: "国家公园公路", continent: "北美" },
      "优胜美地 · 冰川点 · 2199m": { country: "美国", countryId: "us", province: "加利福尼亚州", geoUnit: "优胜美地国家公园", point: "冰川点", altitude: 2199, type: "国家公园观景", continent: "北美" },
      "布莱斯峡谷 · Rainbow Point · 2778m": { country: "美国", countryId: "us", province: "犹他州", geoUnit: "布莱斯峡谷国家公园", point: "Rainbow Point", altitude: 2778, type: "国家公园观景", continent: "北美" },
      "大峡谷北缘 · Bright Angel Point · 2500m": { country: "美国", countryId: "us", province: "亚利桑那州", geoUnit: "大峡谷国家公园", point: "Bright Angel Point", altitude: 2500, type: "国家公园观景", continent: "北美" },
      "梅萨维德 · Park Point · 2613m": { country: "美国", countryId: "us", province: "科罗拉多州", geoUnit: "梅萨维德国家公园", point: "Park Point", altitude: 2613, type: "国家公园观景", continent: "北美" },
      "皮兹奈尔峰 · 缆车高点 · 3056m": { country: "瑞士", countryId: "ch", province: "格劳宾登州", geoUnit: "阿尔卑斯山", point: "缆车高点", altitude: 3056, type: "缆车高点", continent: "欧洲" },
      "蒙福尔峰 · 缆车高点 · 3330m": { country: "瑞士", countryId: "ch", province: "瓦莱州", geoUnit: "阿尔卑斯山", point: "缆车高点", altitude: 3330, type: "缆车高点", continent: "欧洲" },
      "多洛米蒂萨斯波尔多伊 · 缆车高点 · 2950m": { country: "意大利", countryId: "it", province: "特伦蒂诺-上阿迪杰", geoUnit: "多洛米蒂", point: "缆车高点", altitude: 2950, type: "缆车高点", continent: "欧洲" },
      "格莱舍天堂 · Trockener Steg · 2939m": { country: "瑞士", countryId: "ch", province: "瓦莱州", geoUnit: "马特洪峰观景带", point: "Trockener Steg", altitude: 2939, type: "缆车/冰川观景", continent: "欧洲" },
      "卡普伦基茨施泰因峰 · 缆车高点 · 3029m": { country: "奥地利", countryId: "at", province: "萨尔茨堡州", geoUnit: "阿尔卑斯山", point: "缆车高点", altitude: 3029, type: "缆车高点", continent: "欧洲" },
      "陶恩山阿尔卑斯公路 · Hochtor山口 · 2504m": { country: "奥地利", countryId: "at", province: "萨尔茨堡/克恩顿", geoUnit: "大钟山高山公路", point: "Hochtor山口", altitude: 2504, type: "公路山口", continent: "欧洲" },
      "锡尔夫雷塔高山公路 · Bielerhohe · 2037m": { country: "奥地利", countryId: "at", province: "福拉尔贝格/蒂罗尔", geoUnit: "阿尔卑斯山", point: "Bielerhohe", altitude: 2037, type: "公路观景", continent: "欧洲" },
      "曼利申 · 缆车山脊 · 2343m": { country: "瑞士", countryId: "ch", province: "伯尔尼州", geoUnit: "伯尔尼阿尔卑斯", point: "缆车山脊", altitude: 2343, type: "缆车观景", continent: "欧洲" },
      "格林德瓦First · 缆车高点 · 2168m": { country: "瑞士", countryId: "ch", province: "伯尔尼州", geoUnit: "伯尔尼阿尔卑斯", point: "缆车高点", altitude: 2168, type: "缆车观景", continent: "欧洲" },
      "布赖特峰高原 · 冰川观景点 · 3480m": { country: "瑞士", countryId: "ch", province: "瓦莱州", geoUnit: "马特洪峰观景带", point: "冰川观景点", altitude: 3480, type: "冰川观景", continent: "欧洲" },
      "达赫施泰因 · Skywalk观景台 · 2700m": { country: "奥地利", countryId: "at", province: "施泰尔马克/上奥地利", geoUnit: "达赫施泰因山群", point: "Skywalk观景台", altitude: 2700, type: "缆车观景", continent: "欧洲" },
      "北链山 · Hafelekar缆车站 · 2256m": { country: "奥地利", countryId: "at", province: "蒂罗尔州", geoUnit: "北链山", point: "Hafelekar缆车站", altitude: 2256, type: "缆车观景", continent: "欧洲" },
      "盖斯拉赫科格尔 · 缆车高点 · 3058m": { country: "奥地利", countryId: "at", province: "蒂罗尔州", geoUnit: "阿尔卑斯山", point: "缆车高点", altitude: 3058, type: "缆车高点", continent: "欧洲" },
      "红针峰 · Les Arcs缆车高点 · 3226m": { country: "法国", countryId: "fr", province: "奥弗涅-罗讷-阿尔卑斯", geoUnit: "阿尔卑斯山", point: "Les Arcs缆车高点", altitude: 3226, type: "缆车高点", continent: "欧洲" },
      "加尔赫峰 · 挪威步道终点 · 2469m": { country: "挪威", countryId: "no", province: "因兰代特郡", geoUnit: "尤通黑门山", point: "步道终点", altitude: 2469, type: "名山/徒步", continent: "欧洲" },
      "路易斯湖 · 六冰川平原茶屋 · 2100m": { country: "加拿大", countryId: "ca", province: "艾伯塔省", geoUnit: "加拿大落基山", point: "六冰川平原茶屋", altitude: 2100, type: "国家公园徒步", continent: "北美" },
      "威尔科克斯山口 · 冰原大道徒步点 · 2375m": { country: "加拿大", countryId: "ca", province: "艾伯塔省", geoUnit: "加拿大落基山", point: "冰原大道徒步点", altitude: 2375, type: "国家公园徒步", continent: "北美" },
      "库克山国家公园 · Sealy Tarns · 1300m": { country: "新西兰", countryId: "nz", province: "坎特伯雷", geoUnit: "南阿尔卑斯山", point: "Sealy Tarns", altitude: 1300, type: "雪山观景/徒步", continent: "大洋洲" },
      "大雪山旭岳 · 姿见站/步道终点 · 2291m": { country: "日本", countryId: "jp", province: "北海道", geoUnit: "大雪山", point: "姿见站/步道终点", altitude: 2291, type: "名山/缆车徒步", continent: "亚洲" },
      "白马岳 · 八方池观景点 · 2060m": { country: "日本", countryId: "jp", province: "中部", geoUnit: "北阿尔卑斯/白马岳", point: "八方池观景点", altitude: 2060, type: "雪山观景/徒步", continent: "亚洲" },
      "藏王山 · 御釜观景点 · 1758m": { country: "日本", countryId: "jp", province: "东北", geoUnit: "藏王连峰", point: "御釜观景点", altitude: 1758, type: "火山湖/公路", continent: "亚洲" },
      "阿苏山 · 中岳火口观景点 · 1500m": { country: "日本", countryId: "jp", province: "九州冲绳", geoUnit: "阿苏火山", point: "中岳火口观景点", altitude: 1500, type: "火山景区", continent: "亚洲" },
      "雾岛山 · 高千穗峰步道终点 · 1574m": { country: "日本", countryId: "jp", province: "九州冲绳", geoUnit: "雾岛山", point: "高千穗峰步道终点", altitude: 1574, type: "名山/徒步", continent: "亚洲" },
      "雪岳山 · 大青峰步道终点 · 1708m": { country: "韩国", countryId: "kr", province: "江原圈", geoUnit: "雪岳山", point: "大青峰步道终点", altitude: 1708, type: "名山/徒步", continent: "亚洲" },
      "路易斯湖 · Sentinel Pass · 2611m": { country: "加拿大", countryId: "ca", province: "艾伯塔省", geoUnit: "加拿大落基山", point: "Sentinel Pass", altitude: 2611, type: "国家公园徒步", continent: "北美" },
      "贾斯珀 · Skyline Trail The Notch · 2511m": { country: "加拿大", countryId: "ca", province: "艾伯塔省", geoUnit: "加拿大落基山", point: "Skyline Trail The Notch", altitude: 2511, type: "国家公园徒步", continent: "北美" },
      "约霍国家公园 · Opabin Plateau · 2300m": { country: "加拿大", countryId: "ca", province: "不列颠哥伦比亚省", geoUnit: "加拿大落基山", point: "Opabin Plateau", altitude: 2300, type: "国家公园徒步", continent: "北美" },
      "班夫 · Parker Ridge · 2275m": { country: "加拿大", countryId: "ca", province: "艾伯塔省", geoUnit: "加拿大落基山", point: "Parker Ridge", altitude: 2275, type: "国家公园徒步", continent: "北美" },
      "加里波第 · Panorama Ridge · 2133m": { country: "加拿大", countryId: "ca", province: "不列颠哥伦比亚省", geoUnit: "海岸山脉", point: "Panorama Ridge", altitude: 2133, type: "名山/徒步", continent: "北美" },
      "本洛蒙德山 · 皇后镇步道终点 · 1748m": { country: "新西兰", countryId: "nz", province: "奥塔哥", geoUnit: "瓦卡蒂普湖区", point: "步道终点", altitude: 1748, type: "名山/徒步", continent: "大洋洲" },
      "罗伊峰 · 瓦纳卡步道终点 · 1578m": { country: "新西兰", countryId: "nz", province: "奥塔哥", geoUnit: "瓦纳卡湖区", point: "步道终点", altitude: 1578, type: "名山/徒步", continent: "大洋洲" },
      "凯普勒步道 · Luxmore Hut · 1085m": { country: "新西兰", countryId: "nz", province: "南地大区", geoUnit: "峡湾国家公园", point: "Luxmore Hut", altitude: 1085, type: "国家公园徒步", continent: "大洋洲" },
      "菲茨罗伊 · Laguna de los Tres · 1170m": { country: "阿根廷", countryId: "ar", province: "圣克鲁斯省", geoUnit: "菲茨罗伊山群", point: "Laguna de los Tres", altitude: 1170, type: "世界级名山观景", continent: "南美" },
      "百内三塔 · Base Torres观景点 · 900m": { country: "智利", countryId: "cl", province: "麦哲伦大区", geoUnit: "百内国家公园", point: "Base Torres观景点", altitude: 900, type: "世界级名山观景", continent: "南美" },
      "塞罗卡斯蒂略 · 湖边观景点 · 1450m": { country: "智利", countryId: "cl", province: "艾森大区", geoUnit: "塞罗卡斯蒂略", point: "湖边观景点", altitude: 1450, type: "名山/徒步", continent: "南美" },
      "本尼维斯山 · 步道终点 · 1345m": { country: "英国", countryId: "gb", province: "苏格兰", geoUnit: "格兰屏山脉", point: "步道终点", altitude: 1345, type: "国家最高峰/徒步", continent: "欧洲" },
      "斯诺登山 · 步道/铁路终点 · 1085m": { country: "英国", countryId: "gb", province: "威尔士", geoUnit: "斯诺登尼亚", point: "步道/铁路终点", altitude: 1085, type: "名山/铁路", continent: "欧洲" },
      "卡朗图厄尔山 · 步道终点 · 1039m": { country: "爱尔兰", countryId: "ie", province: "凯里郡", geoUnit: "麦吉利卡迪山脉", point: "步道终点", altitude: 1039, type: "国家最高峰/徒步", continent: "欧洲" },
      "凯布讷山 · 瑞典步道终点 · 2097m": { country: "瑞典", countryId: "se", province: "北博滕省", geoUnit: "斯堪的纳维亚山脉", point: "步道终点", altitude: 2097, type: "国家最高峰/徒步", continent: "欧洲" },
      "哈尔蒂山 · 芬兰高点步道 · 1324m": { country: "芬兰", countryId: "fi", province: "拉普兰", geoUnit: "斯堪的纳维亚山脉", point: "芬兰高点步道", altitude: 1324, type: "国家高点/徒步", continent: "欧洲" },
      "达尔斯尼巴 · 峡湾公路观景台 · 1476m": { country: "挪威", countryId: "no", province: "默勒-鲁姆斯达尔郡", geoUnit: "盖朗厄尔峡湾", point: "峡湾公路观景台", altitude: 1476, type: "公路观景", continent: "欧洲" },
      "洪扎 · Eagle's Nest观景台 · 2850m": { country: "巴基斯坦", countryId: "pk", province: "吉尔吉特-巴尔蒂斯坦", geoUnit: "喀喇昆仑山", point: "Eagle's Nest观景台", altitude: 2850, type: "雪山观景", continent: "亚洲" },
      "纳尔塔尔山谷 · 湖区游览点 · 3050m": { country: "巴基斯坦", countryId: "pk", province: "吉尔吉特-巴尔蒂斯坦", geoUnit: "喀喇昆仑山", point: "湖区游览点", altitude: 3050, type: "高山湖区", continent: "亚洲" },
      "桑达克普 · 喜马拉雅观景点 · 3636m": { country: "印度", countryId: "in", province: "西孟加拉邦", geoUnit: "喜马拉雅山", point: "喜马拉雅观景点", altitude: 3636, type: "雪山观景/徒步", continent: "亚洲" },
      "厄拉维库拉姆国家公园 · Anamudi观景点 · 2695m": { country: "印度", countryId: "in", province: "喀拉拉邦", geoUnit: "西高止山脉", point: "Anamudi观景点", altitude: 2695, type: "国家公园名山", continent: "亚洲" },
      "阿波山 · 菲律宾步道终点 · 2954m": { country: "菲律宾", countryId: "ph", province: "达沃", geoUnit: "阿波山", point: "步道终点", altitude: 2954, type: "国家最高峰/徒步", continent: "亚洲" },
      "克林奇火山 · 常规登山终点 · 3805m": { country: "印度尼西亚", countryId: "id", province: "苏门答腊", geoUnit: "克林奇火山", point: "常规登山终点", altitude: 3805, type: "火山/徒步", continent: "亚洲" },
      "阿贡火山 · 常规登山终点 · 3031m": { country: "印度尼西亚", countryId: "id", province: "巴厘", geoUnit: "阿贡火山", point: "常规登山终点", altitude: 3031, type: "火山/徒步", continent: "亚洲" },
      "金马仑高原 · Brinchang山 · 2032m": { country: "马来西亚", countryId: "my", province: "马来半岛", geoUnit: "金马仑高原", point: "Brinchang山", altitude: 2032, type: "高原景区/公路", continent: "亚洲" },
      "埃尔吉耶斯山 · 滑雪区高点 · 3360m": { country: "土耳其", countryId: "tr", province: "中安纳托利亚地区", geoUnit: "埃尔吉耶斯山", point: "滑雪区高点", altitude: 3360, type: "滑雪区/火山", continent: "亚洲" },
      "内姆鲁特山 · 山顶遗址 · 2134m": { country: "土耳其", countryId: "tr", province: "东南安纳托利亚地区", geoUnit: "内姆鲁特山", point: "山顶遗址", altitude: 2134, type: "名山/遗址", continent: "亚洲" },
      "汤加里罗红火山口 · 穿越步道高点 · 1886m": { country: "新西兰", countryId: "nz", province: "马纳瓦图-旺加努伊", geoUnit: "汤加里罗火山", point: "穿越步道高点", altitude: 1886, type: "火山/徒步", continent: "大洋洲" },
    },
  },
  buddhistMountains: {
    label: "四大佛教名山",
    items: ["五台山", "峨眉山", "普陀山", "九华山"],
  },
  taoistMountains: {
    label: "四大道教名山",
    items: ["武当山", "龙虎山", "齐云山", "青城山"],
  },
  grottoes: {
    label: "四大石窟",
    items: ["莫高窟", "云冈石窟", "龙门石窟", "麦积山石窟"],
  },
  usNationalParks: {
    label: "美国国家公园",
    items: [
      "阿卡迪亚国家公园（Acadia National Park）",
      "美属萨摩亚国家公园（National Park of American Samoa）",
      "拱门国家公园（Arches National Park）",
      "恶地国家公园（Badlands National Park）",
      "大弯国家公园（Big Bend National Park）",
      "比斯坎国家公园（Biscayne National Park）",
      "甘尼逊黑峡谷国家公园（Black Canyon of the Gunnison National Park）",
      "布莱斯峡谷国家公园（Bryce Canyon National Park）",
      "峡谷地国家公园（Canyonlands National Park）",
      "圆顶礁国家公园（Capitol Reef National Park）",
      "卡尔斯巴德洞穴国家公园（Carlsbad Caverns National Park）",
      "海峡群岛国家公园（Channel Islands National Park）",
      "康加里国家公园（Congaree National Park）",
      "火山口湖国家公园（Crater Lake National Park）",
      "凯霍加谷国家公园（Cuyahoga Valley National Park）",
      "死亡谷国家公园（Death Valley National Park）",
      "德纳里国家公园（Denali National Park）",
      "干龟岛国家公园（Dry Tortugas National Park）",
      "大沼泽国家公园（Everglades National Park）",
      "北极之门国家公园（Gates of the Arctic National Park）",
      "门户拱门国家公园（Gateway Arch National Park）",
      "冰川国家公园（Glacier National Park）",
      "冰川湾国家公园（Glacier Bay National Park）",
      "大峡谷国家公园（Grand Canyon National Park）",
      "大提顿国家公园（Grand Teton National Park）",
      "大盆地国家公园（Great Basin National Park）",
      "大沙丘国家公园（Great Sand Dunes National Park）",
      "大烟雾山国家公园（Great Smoky Mountains National Park）",
      "瓜达卢佩山国家公园（Guadalupe Mountains National Park）",
      "哈莱阿卡拉国家公园（Haleakala National Park）",
      "夏威夷火山国家公园（Hawaii Volcanoes National Park）",
      "温泉国家公园（Hot Springs National Park）",
      "印第安纳沙丘国家公园（Indiana Dunes National Park）",
      "皇家岛国家公园（Isle Royale National Park）",
      "约书亚树国家公园（Joshua Tree National Park）",
      "卡特迈国家公园（Katmai National Park）",
      "基奈峡湾国家公园（Kenai Fjords National Park）",
      "国王峡谷国家公园（Kings Canyon National Park）",
      "科伯克谷国家公园（Kobuk Valley National Park）",
      "克拉克湖国家公园（Lake Clark National Park）",
      "拉森火山国家公园（Lassen Volcanic National Park）",
      "猛犸洞国家公园（Mammoth Cave National Park）",
      "梅萨维德国家公园（Mesa Verde National Park）",
      "雷尼尔山国家公园（Mount Rainier National Park）",
      "新河峡谷国家公园和保护区（New River Gorge National Park and Preserve）",
      "北喀斯喀特国家公园（North Cascades National Park）",
      "奥林匹克国家公园（Olympic National Park）",
      "石化林国家公园（Petrified Forest National Park）",
      "尖峰国家公园（Pinnacles National Park）",
      "红木国家和州立公园（Redwood National Park）",
      "落基山国家公园（Rocky Mountain National Park）",
      "萨瓜罗国家公园（Saguaro National Park）",
      "红杉国家公园（Sequoia National Park）",
      "谢南多厄国家公园（Shenandoah National Park）",
      "西奥多·罗斯福国家公园（Theodore Roosevelt National Park）",
      "维尔京群岛国家公园（Virgin Islands National Park）",
      "旅人国家公园（Voyageurs National Park）",
      "白沙国家公园（White Sands National Park）",
      "风洞国家公园（Wind Cave National Park）",
      "兰格尔-圣伊莱亚斯国家公园（Wrangell-St. Elias National Park）",
      "黄石国家公园（Yellowstone National Park）",
      "优胜美地国家公园（Yosemite National Park）",
      "锡安国家公园（Zion National Park）",
    ],
  },
};

const chinaHighAltitudeCoordinates = {
  "唐古拉山口 · 公路山口 · 5231m": [32.981, 91.919, "西藏"],
  "珠峰景区 · 珠峰大本营 · 5200m": [28.141, 86.853, "西藏"],
  "加吾拉山口 · 珠峰观景山口 · 5200m": [28.306, 87.004, "西藏"],
  "红其拉甫国门 · 国门附近 · 4733m": [36.849, 75.431, "新疆"],
  "普莫雍措 · 湖边游览点 · 5010m": [28.533, 90.395, "西藏"],
  "卡若拉冰川 · 公路观景区 · 5036m": [28.911, 90.209, "西藏"],
  "绒布寺 · 寺院观景区 · 4900m": [28.191, 86.832, "西藏"],
  "达古冰川 · 冰川观景区 · 4860m": [32.217, 102.95, "四川"],
  "昆仑山口 · 公路垭口 · 4768m": [35.648, 94.04, "青海"],
  "南迦巴瓦 · 色季拉山口观景台 · 4728m": [29.606, 94.636, "西藏"],
  "纳木错 · 扎西半岛 · 4718m": [30.762, 90.991, "西藏"],
  "稻城亚丁 · 五色海 · 4700m": [28.393, 100.322, "四川"],
  "玉龙雪山 · 冰川公园平台 · 4680m": [27.101, 100.177, "云南"],
  "慕士塔格峰景区 · 4688米石碑 · 4688m": [38.22676, 75.02572, "新疆"],
  "冈仁波齐 · 塔尔钦周边 · 4670m": [31.104, 81.31, "西藏"],
  "稻城亚丁 · 牛奶海 · 4600m": [28.386, 100.322, "四川"],
  "玛旁雍错 · 湖区游览点 · 4588m": [30.69, 81.49, "西藏"],
  "雅哈垭口 · 观景点 · 4568m": [29.785, 101.764, "四川"],
  "子梅垭口 · 观景点 · 4550m": [29.725, 101.698, "四川"],
  "冷嘎措 · 湖边观景点 · 4530m": [29.65, 101.692, "四川"],
  "羊卓雍措 · 湖区观景点 · 4441m": [29.195, 90.646, "西藏"],
  "石卡雪山 · 索道高点 · 4449m": [27.889, 99.672, "云南"],
  "可可西里 · 索南达杰保护站 · 4479m": [35.221, 93.088, "青海"],
  "白马雪山 · 垭口 · 4292m": [28.223, 99.099, "云南"],
  "折多山 · 垭口 · 4298m": [30.052, 101.798, "四川"],
  "鱼子西 · 观景平台 · 4200m": [30.096, 101.62, "四川"],
  "盘龙古道 · 最高观景垭口 · 4216m": [37.63607, 75.51116, "新疆"],
  "玉山 · 主峰步道终点 · 3952m": [23.47, 120.957, "台湾"],
  "四姑娘山双桥沟 · 红杉林 · 3840m": [31.105, 102.85, "四川"],
  "喀拉库勒湖 · 湖边观景点 · 3600m": [38.44, 75.056, "新疆"],
  "黄龙 · 五彩池 · 3576m": [32.745, 103.833, "四川"],
  "巴松措 · 湖区游览点 · 3480m": [30.022, 93.943, "西藏"],
  "梅里雪山 · 飞来寺观景台 · 3400m": [28.442, 98.86, "云南"],
  "白沙湖/白沙山 · 湖边观景点 · 3300m": [38.72971, 75.01629, "新疆"],
  "青海湖 · 湖区游览点 · 3196m": [36.895, 100.175, "青海"],
  "峨眉山 · 金顶 · 3079m": [29.52, 103.336, "四川"],
  "五台山 · 北台叶斗峰 · 3061m": [39.009, 113.594, "山西"],
  "茶卡盐湖 · 景区湖区 · 3059m": [36.791, 99.078, "青海"],
  "武夷山 · 黄岗山 · 2160m": [27.861, 117.775, "福建"],
  "华山 · 南峰 · 2155m": [34.4833, 110.0833, "陕西"],
  "恒山 · 天峰岭 · 2016m": [39.6739, 113.7336, "山西"],
  "黄山 · 莲花峰 · 1864m": [30.1302, 118.1689, "安徽"],
  "三清山 · 玉京峰 · 1819m": [28.914, 118.064, "江西"],
  "武当山 · 天柱峰 · 1612m": [32.397, 111.004, "湖北"],
  "泰山 · 玉皇顶 · 1545m": [36.255, 117.106, "山东"],
  "嵩山 · 峻极峰 · 1492m": [34.507, 112.935, "河南"],
  "庐山 · 汉阳峰 · 1474m": [29.55, 115.994, "江西"],
  "九华山 · 十王峰 · 1342m": [30.478, 117.807, "安徽"],
  "龙虎山 · 天门山 · 1300m": [28.1205, 116.998, "江西"],
  "衡山 · 祝融峰 · 1300m": [27.254, 112.655, "湖南"],
  "青城山 · 老君阁/彭祖峰 · 1260m": [30.907, 103.568, "四川"],
  "雁荡山 · 百岗尖 · 1108m": [28.37, 121.06, "浙江"],
  "齐云山 · 廊崖 · 585m": [29.817, 118.037, "安徽"],
  "普陀山 · 佛顶山 · 291m": [30.0007, 122.3864, "浙江"],
  "乞力马扎罗 · Uhuru Peak步道终点 · 5895m": [-3.0758, 37.3533, "坦桑尼亚"],
  "安纳普尔纳环线 · Thorong La山口 · 5416m": [28.7936, 83.9371, "尼泊尔"],
  "珠峰南坡 · 尼泊尔大本营 · 5364m": [28.0026, 86.8528, "尼泊尔"],
  "列城公路 · Khardung La山口 · 5359m": [34.278, 77.604, "印度"],
  "亚拉腊山 · 常规登山终点 · 5137m": [39.702, 44.299, "土耳其"],
  "彩虹山 · 观景点 · 5036m": [-13.869, -71.303, "秘鲁"],
  "肯尼亚山 · Point Lenana步道终点 · 4985m": [-0.151, 37.316, "肯尼亚"],
  "科托帕希国家公园 · Jose Rivas山屋 · 4864m": [-0.677, -78.438, "厄瓜多尔"],
  "钦博拉索 · Carrel山屋 · 4850m": [-1.469, -78.817, "厄瓜多尔"],
  "蓝天山 · 峰顶公路高点 · 4350m": [39.5883, -105.6438, "美国"],
  "派克峰 · 公路/齿轨铁路峰顶 · 4302m": [38.8409, -105.0423, "美国"],
  "阿空加瓜省立公园 · Plaza de Mulas营地 · 4300m": [-32.648, -70.058, "阿根廷"],
  "奥里萨巴峰 · Piedra Grande营地 · 4260m": [19.032, -97.269, "墨西哥"],
  "班公湖 · 湖边观景点 · 4250m": [33.758, 78.667, "印度"],
  "西门山国家公园 · Bwahit Pass观景点 · 4200m": [13.235, 38.213, "埃塞俄比亚"],
  "莫纳克亚山 · 公路可达峰顶 · 4207m": [19.8207, -155.4681, "美国"],
  "图卜卡勒峰 · 常规登山终点 · 4167m": [31.061, -7.916, "摩洛哥"],
  "基纳巴卢山 · Low's Peak步道终点 · 4095m": [6.075, 116.558, "马来西亚"],
  "拉巴斯/埃尔阿尔托 · 城市高点 · 4060m": [-16.513, -68.192, "玻利维亚"],
  "小马特洪峰 · 缆车高点 · 3883m": [45.9386, 7.7293, "瑞士"],
  "南针峰 · 缆车观景台 · 3842m": [45.8789, 6.887, "法国"],
  "落基山国家公园 · Trail Ridge Road高点 · 3713m": [40.396, -105.751, "美国"],
  "乌尤尼盐沼 · 盐沼游览点 · 3656m": [-20.133, -67.489, "玻利维亚"],
  "泰德峰 · 缆车上站 · 3555m": [28.272, -16.642, "西班牙"],
  "少女峰火车站 · 欧洲屋脊 · 3454m": [46.5475, 7.9823, "瑞士"],
  "戈尔内格拉特 · 登山铁路观景台 · 3135m": [45.9839, 7.7844, "瑞士"],
  "哈莱阿卡拉 · 火山口观景台 · 3055m": [20.7097, -156.2533, "美国"],
  "马丘比丘山 · 步道终点 · 3082m": [-13.163, -72.545, "秘鲁"],
  "楚格峰 · 缆车/齿轨铁路高点 · 2962m": [47.421, 10.986, "德国"],
  "萨尼山口 · 公路山口 · 2876m": [-29.584, 29.287, "南非"],
  "大钟山高山公路 · Edelweissspitze观景点 · 2571m": [47.123, 12.83, "奥地利"],
  "埃特纳火山 · 缆车上站区域 · 2500m": [37.753, 14.995, "意大利"],
  "富士山 · 五合目 · 2305m": [35.3949, 138.7328, "日本"],
  "科修斯科山 · 步道终点 · 2228m": [-36.455, 148.263, "澳大利亚"],
  "惠斯勒山 · Peak Chair区域 · 2182m": [50.059, -122.957, "加拿大"],
  "汉拿山 · 白鹿潭步道终点 · 1950m": [33.3617, 126.5292, "韩国"],
  "卡拉帕塔 · 珠峰观景徒步点 · 5644m": [27.995, 86.829, "尼泊尔"],
  "昌拉山口 · 公路山口 · 5360m": [34.032, 77.929, "印度"],
  "戈京日 · 湖区徒步观景点 · 5357m": [27.954, 86.695, "尼泊尔"],
  "塔格朗拉山口 · 公路山口 · 5328m": [33.506, 77.765, "印度"],
  "查卡尔塔亚 · 公路高点 · 5300m": [-16.35, -68.13, "玻利维亚"],
  "古鲁东玛湖 · 湖边游览点 · 5150m": [28.024, 88.709, "印度"],
  "帕斯托鲁里冰川 · 游览步道高点 · 5000m": [-9.916, -77.188, "秘鲁"],
  "锡金零点 · 公路高点 · 4663m": [27.966, 88.754, "印度"],
  "阿克拜塔尔山口 · 帕米尔公路山口 · 4655m": [38.537, 73.596, "塔吉克斯坦"],
  "梅鲁山 · 步道终点 · 4566m": [-3.243, 36.749, "坦桑尼亚"],
  "拉斯达申峰 · 常规徒步终点 · 4550m": [13.236, 38.372, "埃塞俄比亚"],
  "萨内蒂高原 · 公路高点 · 4377m": [6.864, 39.829, "埃塞俄比亚"],
  "格雷斯峰 · 步道终点 · 4352m": [39.633, -105.817, "美国"],
  "马拉加山口 · 公路山口 · 4316m": [-13.133, -72.317, "秘鲁"],
  "内瓦多德托卢卡 · 火山口游览点 · 4200m": [19.108, -99.758, "墨西哥"],
  "红湖 · 湖边观景点 · 4278m": [-22.207, -67.773, "玻利维亚"],
  "喀麦隆山 · 常规登山终点 · 4040m": [4.217, 9.17, "喀麦隆"],
  "基多缆车 · Cruz Loma观景点 · 4050m": [-0.183, -78.532, "厄瓜多尔"],
  "内瓦多德鲁伊斯 · 游客区 · 4050m": [4.895, -75.321, "哥伦比亚"],
  "惠特尼山 · 步道终点 · 4421m": [36.578, -118.292, "美国"],
  "惠勒峰 · 新墨西哥步道终点 · 4013m": [36.556, -105.416, "美国"],
  "安蒂萨纳 · 火山观景点 · 4000m": [-0.545, -78.157, "厄瓜多尔"],
  "伊斯塔西瓦特尔 · La Joya登山口 · 3970m": [19.137, -98.654, "墨西哥"],
  "基洛托阿火山湖 · 环湖观景点 · 3914m": [-0.858, -78.902, "厄瓜多尔"],
  "阿拉湖山口 · 徒步山口 · 3860m": [42.35, 78.54, "吉尔吉斯斯坦"],
  "奇里波峰 · 步道终点 · 3820m": [9.484, -83.489, "哥斯达黎加"],
  "汉弗莱斯峰 · 步道终点 · 3852m": [35.346, -111.678, "美国"],
  "厄尔布鲁士山 · Garabashi缆车站 · 3847m": [43.299, 42.459, "俄罗斯"],
  "巴尔斯孔山口 · 公路山口 · 3754m": [41.92, 77.66, "吉尔吉斯斯坦"],
  "独立山口 · 公路山口 · 3687m": [39.108, -106.564, "美国"],
  "洛夫兰山口 · 公路山口 · 3655m": [39.664, -105.879, "美国"],
  "林贾尼火山 · 常规登山终点 · 3726m": [-8.411, 116.457, "印度尼西亚"],
  "猛犸山 · 缆车高点 · 3369m": [37.63, -119.032, "美国"],
  "科尔卡峡谷 · 秃鹰十字观景台 · 3287m": [-15.611, -71.905, "秘鲁"],
  "马尔莫拉达 · Punta Rocca缆车站 · 3265m": [46.435, 11.86, "意大利"],
  "布恩山 · 徒步观景点 · 3210m": [28.4, 83.692, "尼泊尔"],
  "解放者山口 · 国际公路山口 · 3200m": [-32.823, -70.07, "智利"],
  "琼布拉克 · Talgar Pass滑雪区高点 · 3180m": [43.129, 77.08, "哈萨克斯坦"],
  "蒙塞拉特山 · 缆车山顶 · 3152m": [4.605, -74.056, "哥伦比亚"],
  "番西邦峰 · 缆车/步道终点 · 3143m": [22.303, 103.775, "越南"],
  "内日峰 · 留尼汪步道终点 · 3070m": [-21.099, 55.48, "法国"],
  "内瓦多谷 · 滑雪区高点 · 3025m": [-33.35, -70.25, "智利"],
  "宋库尔湖 · 湖边游览点 · 3016m": [41.84, 75.14, "吉尔吉斯斯坦"],
  "图盖拉瀑布顶端 · 德拉肯斯堡步道点 · 3000m": [-28.754, 28.892, "南非"],
  "帕塔潘帕山口 · 火山观景公路点 · 4910m": [-15.742, -71.597, "秘鲁"],
  "拉古纳69 · 湖边步道终点 · 4600m": [-9.011, -77.612, "秘鲁"],
  "昆祖姆山口 · 公路山口 · 4551m": [32.398, 77.638, "印度"],
  "琼加拉湖 · 湖边观景点 · 4517m": [-18.251, -69.16, "智利"],
  "威廉山 · 巴布亚新几内亚步道终点 · 4509m": [-5.78, 145.03, "巴布亚新几内亚"],
  "塔蒂奥间歇泉 · 游览区 · 4320m": [-22.331, -68.011, "智利"],
  "拉拉亚山口 · 公路山口 · 4335m": [-14.482, -70.987, "秘鲁"],
  "塔胡穆尔科火山 · 常规登山终点 · 4220m": [15.043, -91.903, "危地马拉"],
  "乌马太湖 · 湖边观景点 · 4200m": [-13.415, -72.586, "秘鲁"],
  "达马万德山 · Bargah Sevom营地 · 4200m": [35.951, 52.111, "伊朗"],
  "巴布萨尔山口 · 公路山口 · 4173m": [35.146, 74.071, "巴基斯坦"],
  "安纳普尔纳大本营 · 徒步营地 · 4130m": [28.53, 83.879, "尼泊尔"],
  "米斯坎蒂湖 · 湖边观景点 · 4120m": [-23.735, -67.771, "智利"],
  "皮凯峰 · 珠峰远眺点 · 4065m": [27.477, 86.586, "尼泊尔"],
  "罗唐山口 · 公路山口 · 3978m": [32.371, 77.246, "印度"],
  "阿拉加茨山 · 南峰步道终点 · 3888m": [40.47, 44.18, "亚美尼亚"],
  "瓦斯卡兰国家公园 · 扬加努科湖区 · 3850m": [-9.056, -77.607, "秘鲁"],
  "托查尔山 · 缆车高点 · 3740m": [35.884, 51.419, "伊朗"],
  "的的喀喀湖 · 湖边游览点 · 3812m": [-15.766, -69.684, "秘鲁"],
  "科顿伍德山口 · 公路山口 · 3696m": [38.827, -106.409, "美国"],
  "波波卡特佩特尔 · Paso de Cortes山口 · 3600m": [19.085, -98.646, "墨西哥"],
  "玛蒂希玛尔 · 高营地 · 3580m": [28.446, 83.946, "尼泊尔"],
  "瓜内拉山口 · 公路山口 · 3557m": [39.596, -105.711, "美国"],
  "米特阿拉林 · 冰川地铁高点 · 3457m": [46.059, 7.902, "瑞士"],
  "尼拉贡戈火山 · 火山口徒步终点 · 3470m": [-1.522, 29.25, "刚果民主共和国"],
  "莫纳罗亚山 · 公路观测站 · 3397m": [19.536, -155.576, "美国"],
  "贝尔图斯山口 · 公路山口 · 3337m": [44.969, -109.442, "美国"],
  "费尔梅多斯 · 南迦帕尔巴特观景点 · 3300m": [35.387, 74.579, "巴基斯坦"],
  "科尔瓦奇峰 · 缆车高点 · 3303m": [46.419, 9.821, "瑞士"],
  "乌凯迈登 · 滑雪区高点 · 3268m": [31.206, -7.861, "摩洛哥"],
  "马拉塞拉山口 · 莱索托公路高点 · 3222m": [-28.821, 28.728, "莱索托"],
  "拉森峰 · 火山步道终点 · 3187m": [40.488, -121.505, "美国"],
  "杰克逊霍尔缆车 · Rendezvous Mountain · 3185m": [43.596, -110.87, "美国"],
  "蒂奥加山口 · 公路山口 · 3031m": [37.91, -119.257, "美国"],
  "穆兰杰山 · Sapitwa步道终点 · 3002m": [-15.955, 35.591, "马拉维"],
  "铁力士山 · 缆车观景台 · 3020m": [46.772, 8.437, "瑞士"],
  "冰川3000 · Scex Rouge观景点 · 2971m": [46.326, 7.206, "瑞士"],
  "雪朗峰 · Piz Gloria观景台 · 2970m": [46.557, 7.835, "瑞士"],
  "迪亚沃勒扎 · 缆车观景台 · 2978m": [46.412, 9.966, "瑞士"],
  "穆萨拉峰 · 步道终点 · 2925m": [42.179, 23.585, "保加利亚"],
  "南比戈尔峰 · 缆车观景台 · 2877m": [42.937, 0.142, "法国"],
  "奥林匹斯山 · 米蒂卡斯峰 · 2918m": [40.088, 22.358, "希腊"],
  "普拉格山 · 步道终点 · 2922m": [16.599, 120.883, "菲律宾"],
  "特里格拉夫峰 · 常规徒步终点 · 2864m": [46.378, 13.836, "斯洛文尼亚"],
  "乘鞍岳 · 畳平 · 2702m": [36.123, 137.551, "日本"],
  "斯泰尔维奥山口 · 公路山口 · 2758m": [46.529, 10.453, "意大利"],
  "鲁阿佩胡山 · 火山口湖观景点 · 2672m": [-39.281, 175.568, "新西兰"],
  "布罗莫火山 · King Kong Hill观景点 · 2600m": [-7.902, 112.953, "印度尼西亚"],
  "因他暖山 · 泰国最高点 · 2565m": [18.588, 98.486, "泰国"],
  "大阿拉木图湖 · 湖边游览点 · 2511m": [43.052, 76.985, "哈萨克斯坦"],
  "塞切达山 · 缆车观景点 · 2519m": [46.6, 11.724, "意大利"],
  "塔拉纳基山 · 步道终点 · 2518m": [-39.296, 174.064, "新西兰"],
  "惠斯勒斯山 · 贾斯珀缆车高点 · 2463m": [52.803, -118.124, "加拿大"],
  "立山室堂 · 阿尔卑斯路线高点 · 2450m": [36.577, 137.596, "日本"],
  "鹰巢站 · 勃朗峰有轨电车终点 · 2372m": [45.858, 6.797, "法国"],
  "弗朗茨约瑟夫高地 · 大钟山观景点 · 2369m": [47.074, 12.751, "奥地利"],
  "三峰山景区 · Auronzo山屋 · 2320m": [46.612, 12.295, "意大利"],
  "硫磺山 · 班夫缆车上站 · 2281m": [51.113, -115.555, "加拿大"],
  "波尔多伊山口 · 公路山口 · 2239m": [46.488, 11.812, "意大利"],
  "亚当峰 · 朝圣步道终点 · 2243m": [6.809, 80.499, "斯里兰卡"],
  "卡兹别克 · 圣三一教堂观景点 · 2170m": [42.662, 44.62, "格鲁吉亚"],
  "皮拉图斯山 · 齿轨/缆车高点 · 2128m": [46.979, 8.252, "瑞士"],
  "华盛顿山 · 公路/齿轨铁路峰顶 · 1917m": [44.27, -71.303, "美国"],
  "杰贝勒杰斯山 · 公路观景点 · 1934m": [25.953, 56.183, "阿联酋"],
  "克灵曼圆顶 · 观景塔 · 2025m": [35.562, -83.498, "美国"],
  "库克山国家公园 · Mueller Hut · 1800m": [-43.719, 170.094, "新西兰"],
  "阿凯山口 · 公路山口 · 4895m": [-24.402, -66.242, "阿根廷"],
  "拉昆布雷山口 · 永加斯公路高点 · 4650m": [-16.333, -68.04, "玻利维亚"],
  "萨尔坎泰山口 · 徒步山口 · 4630m": [-13.358, -72.552, "秘鲁"],
  "霍尔诺卡尔山 · 彩山观景点 · 4350m": [-23.199, -65.167, "阿根廷"],
  "萨哈马国家公园 · 间歇泉区 · 4300m": [-18.097, -68.944, "玻利维亚"],
  "基孜勒阿尔特山口 · 帕米尔公路山口 · 4280m": [39.383, 73.326, "塔吉克斯坦"],
  "哈马山口 · 国际公路山口 · 4200m": [-23.236, -67.058, "智利"],
  "德奥赛高原 · Sheosar湖 · 4142m": [35.006, 75.223, "巴基斯坦"],
  "帕帕亚克塔山口 · 公路山口 · 4064m": [-0.35, -78.162, "厄瓜多尔"],
  "帕尔卡约彩虹山 · 观景点 · 4900m": [-14.065, -71.269, "秘鲁"],
  "卡拉库里湖 · 帕米尔公路湖区 · 3914m": [39.017, 73.53, "塔吉克斯坦"],
  "亚什库勒湖 · 湖边观景点 · 3734m": [37.72, 72.87, "塔吉克斯坦"],
  "香多尔山口 · 公路山口 · 3738m": [36.083, 72.55, "巴基斯坦"],
  "图奥阿舒山口 · 公路山口 · 3586m": [42.358, 73.807, "吉尔吉斯斯坦"],
  "拉玛草甸 · 南迦帕尔巴特观景点 · 3300m": [35.334, 74.862, "巴基斯坦"],
  "塔什拉巴特 · 高原驿站 · 3200m": [40.817, 75.287, "吉尔吉斯斯坦"],
  "伊塞兰山口 · 阿尔卑斯公路山口 · 2764m": [45.417, 7.03, "法国"],
  "蒂默尔斯约赫山口 · 阿尔卑斯公路山口 · 2474m": [46.906, 11.096, "奥地利"],
  "富尔卡山口 · 阿尔卑斯公路山口 · 2429m": [46.572, 8.416, "瑞士"],
  "格里姆瑟尔山口 · 阿尔卑斯公路山口 · 2164m": [46.561, 8.337, "瑞士"],
  "苏斯滕山口 · 阿尔卑斯公路山口 · 2224m": [46.729, 8.447, "瑞士"],
  "十字架山口 · 高加索公路山口 · 2379m": [42.504, 44.454, "格鲁吉亚"],
  "科鲁尔迪湖 · 梅斯蒂亚观景徒步点 · 2740m": [43.064, 42.725, "格鲁吉亚"],
  "塞利姆山口 · 亚美尼亚公路山口 · 2410m": [39.951, 45.235, "亚美尼亚"],
  "沙赫达格 · 滑雪区高点 · 2500m": [41.318, 48.136, "阿塞拜疆"],
  "雷尼尔山 · Camp Muir · 3105m": [46.835, -121.732, "美国"],
  "大提顿 · Paintbrush Divide · 3260m": [43.789, -110.786, "美国"],
  "黄石 · Mount Washburn步道终点 · 3122m": [44.797, -110.434, "美国"],
  "锡达布雷克斯 · 观景点 · 3150m": [37.612, -112.838, "美国"],
  "布赖恩峰 · 公路高点 · 3446m": [37.681, -112.849, "美国"],
  "内华达惠勒峰 · 步道终点 · 3982m": [38.986, -114.313, "美国"],
  "瓜达卢佩峰 · 步道终点 · 2667m": [31.892, -104.86, "美国"],
  "桑迪亚峰 · 缆车高点 · 3163m": [35.209, -106.45, "美国"],
  "洛根山口 · 冰川国家公园公路山口 · 2026m": [48.696, -113.718, "美国"],
  "优胜美地 · 冰川点 · 2199m": [37.728, -119.574, "美国"],
  "布莱斯峡谷 · Rainbow Point · 2778m": [37.475, -112.24, "美国"],
  "大峡谷北缘 · Bright Angel Point · 2500m": [36.197, -112.052, "美国"],
  "梅萨维德 · Park Point · 2613m": [37.313, -108.462, "美国"],
  "皮兹奈尔峰 · 缆车高点 · 3056m": [46.507, 9.787, "瑞士"],
  "蒙福尔峰 · 缆车高点 · 3330m": [46.082, 7.318, "瑞士"],
  "多洛米蒂萨斯波尔多伊 · 缆车高点 · 2950m": [46.501, 11.81, "意大利"],
  "格莱舍天堂 · Trockener Steg · 2939m": [45.967, 7.722, "瑞士"],
  "卡普伦基茨施泰因峰 · 缆车高点 · 3029m": [47.188, 12.688, "奥地利"],
  "陶恩山阿尔卑斯公路 · Hochtor山口 · 2504m": [47.084, 12.843, "奥地利"],
  "锡尔夫雷塔高山公路 · Bielerhohe · 2037m": [46.918, 10.094, "奥地利"],
  "曼利申 · 缆车山脊 · 2343m": [46.612, 7.943, "瑞士"],
  "格林德瓦First · 缆车高点 · 2168m": [46.661, 8.053, "瑞士"],
  "布赖特峰高原 · 冰川观景点 · 3480m": [45.93, 7.728, "瑞士"],
  "达赫施泰因 · Skywalk观景台 · 2700m": [47.475, 13.605, "奥地利"],
  "北链山 · Hafelekar缆车站 · 2256m": [47.313, 11.383, "奥地利"],
  "盖斯拉赫科格尔 · 缆车高点 · 3058m": [46.966, 10.986, "奥地利"],
  "红针峰 · Les Arcs缆车高点 · 3226m": [45.55, 6.856, "法国"],
  "加尔赫峰 · 挪威步道终点 · 2469m": [61.636, 8.313, "挪威"],
  "路易斯湖 · 六冰川平原茶屋 · 2100m": [51.417, -116.255, "加拿大"],
  "威尔科克斯山口 · 冰原大道徒步点 · 2375m": [52.229, -117.211, "加拿大"],
  "库克山国家公园 · Sealy Tarns · 1300m": [-43.708, 170.102, "新西兰"],
  "大雪山旭岳 · 姿见站/步道终点 · 2291m": [43.663, 142.854, "日本"],
  "白马岳 · 八方池观景点 · 2060m": [36.696, 137.803, "日本"],
  "藏王山 · 御釜观景点 · 1758m": [38.136, 140.45, "日本"],
  "阿苏山 · 中岳火口观景点 · 1500m": [32.884, 131.104, "日本"],
  "雾岛山 · 高千穗峰步道终点 · 1574m": [31.886, 130.919, "日本"],
  "雪岳山 · 大青峰步道终点 · 1708m": [38.119, 128.465, "韩国"],
  "路易斯湖 · Sentinel Pass · 2611m": [51.331, -116.229, "加拿大"],
  "贾斯珀 · Skyline Trail The Notch · 2511m": [52.657, -118.025, "加拿大"],
  "约霍国家公园 · Opabin Plateau · 2300m": [51.353, -116.33, "加拿大"],
  "班夫 · Parker Ridge · 2275m": [52.192, -117.112, "加拿大"],
  "加里波第 · Panorama Ridge · 2133m": [49.959, -123.045, "加拿大"],
  "本洛蒙德山 · 皇后镇步道终点 · 1748m": [-45.004, 168.63, "新西兰"],
  "罗伊峰 · 瓦纳卡步道终点 · 1578m": [-44.697, 169.046, "新西兰"],
  "凯普勒步道 · Luxmore Hut · 1085m": [-45.389, 167.611, "新西兰"],
  "菲茨罗伊 · Laguna de los Tres · 1170m": [-49.279, -72.947, "阿根廷"],
  "百内三塔 · Base Torres观景点 · 900m": [-50.942, -72.948, "智利"],
  "塞罗卡斯蒂略 · 湖边观景点 · 1450m": [-46.099, -72.149, "智利"],
  "本尼维斯山 · 步道终点 · 1345m": [56.797, -5.003, "英国"],
  "斯诺登山 · 步道/铁路终点 · 1085m": [53.068, -4.076, "英国"],
  "卡朗图厄尔山 · 步道终点 · 1039m": [51.999, -9.743, "爱尔兰"],
  "凯布讷山 · 瑞典步道终点 · 2097m": [67.9, 18.516, "瑞典"],
  "哈尔蒂山 · 芬兰高点步道 · 1324m": [69.307, 21.267, "芬兰"],
  "达尔斯尼巴 · 峡湾公路观景台 · 1476m": [62.049, 7.268, "挪威"],
  "洪扎 · Eagle's Nest观景台 · 2850m": [36.318, 74.669, "巴基斯坦"],
  "纳尔塔尔山谷 · 湖区游览点 · 3050m": [36.168, 74.18, "巴基斯坦"],
  "桑达克普 · 喜马拉雅观景点 · 3636m": [27.105, 88.0, "印度"],
  "厄拉维库拉姆国家公园 · Anamudi观景点 · 2695m": [10.17, 77.061, "印度"],
  "阿波山 · 菲律宾步道终点 · 2954m": [6.987, 125.27, "菲律宾"],
  "克林奇火山 · 常规登山终点 · 3805m": [-1.697, 101.264, "印度尼西亚"],
  "阿贡火山 · 常规登山终点 · 3031m": [-8.343, 115.508, "印度尼西亚"],
  "金马仑高原 · Brinchang山 · 2032m": [4.516, 101.381, "马来西亚"],
  "埃尔吉耶斯山 · 滑雪区高点 · 3360m": [38.532, 35.45, "土耳其"],
  "内姆鲁特山 · 山顶遗址 · 2134m": [37.981, 38.741, "土耳其"],
  "汤加里罗红火山口 · 穿越步道高点 · 1886m": [-39.132, 175.648, "新西兰"],
};

const checklistPlaceCoordinates = {
  故宫: [39.9163, 116.3972, "北京"], "八达岭-慕田峪长城": [40.4319, 116.5704, "北京"], 颐和园: [39.9999, 116.2755, "北京"], 天坛: [39.8822, 116.4066, "北京"], 恭王府: [39.9366, 116.3868, "北京"], 圆明园: [40.0086, 116.2983, "北京"], 明十三陵: [40.2552, 116.2273, "北京"],
  "秦始皇帝陵博物院": [34.3844, 109.2783, "陕西"], 华山: [34.4833, 110.0833, "陕西"], 恒山: [39.6739, 113.7336, "山西"], "大雁塔-大唐芙蓉园": [34.218, 108.964, "陕西"], 黄帝陵: [35.5856, 109.2608, "陕西"], 法门寺: [34.4377, 107.8971, "陕西"],
  泰山: [36.255, 117.106, "山东"], 曲阜三孔: [35.5966, 116.9865, "山东"], 崂山: [36.19, 120.59, "山东"], 蓬莱阁: [37.8267, 120.7586, "山东"], 刘公岛: [37.501, 122.188, "山东"],
  黄山: [30.1302, 118.1689, "安徽"], 九华山: [30.478, 117.807, "安徽"], 天柱山: [30.733, 116.45, "安徽"], 皖南古村落: [29.904, 117.987, "安徽"],
  西湖: [30.2431, 120.1489, "浙江"], 普陀山: [30.0007, 122.3864, "浙江"], 雁荡山: [28.37, 121.06, "浙江"], 乌镇: [30.746, 120.49, "浙江"], 千岛湖: [29.608, 119.044, "浙江"],
  苏州园林: [31.324, 120.625, "江苏"], 周庄古镇: [31.1179, 120.8442, "江苏"], 同里古镇: [31.159, 120.717, "江苏"], 中山陵: [32.0647, 118.8486, "江苏"], 瘦西湖: [32.414, 119.437, "江苏"],
  武夷山: [27.7566, 117.68, "福建"], 鼓浪屿: [24.447, 118.063, "福建"], 福建土楼: [24.657, 117.003, "福建"], 太姥山: [27.105, 120.207, "福建"],
  庐山: [29.55, 115.994, "江西"], 井冈山: [26.571, 114.166, "江西"], 三清山: [28.914, 118.064, "江西"], 龙虎山: [28.1205, 116.998, "江西"],
  张家界武陵源: [29.345, 110.55, "湖南"], 武陵源: [29.345, 110.55, "湖南"], 岳阳楼: [29.357, 113.094, "湖南"], 韶山: [27.915, 112.527, "湖南"], 衡山: [27.254, 112.655, "湖南"], 凤凰古城: [27.948, 109.599, "湖南"],
  长隆旅游度假区: [23.005, 113.324, "广东"], 丹霞山: [25.04704, 113.75239, "广东"], 罗浮山: [23.279, 114.047, "广东"], 西樵山: [22.933, 112.985, "广东"],
  桂林漓江: [25.235, 110.427, "广西"], 青秀山: [22.791, 108.396, "广西"], 德天跨国瀑布: [22.8565, 106.7235, "广西"], 涠洲岛: [21.033, 109.106, "广西"],
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
  "National Park of American Samoa": [-14.2583, -170.6833, "American Samoa"],
  "Badlands National Park": [43.8554, -102.3397, "South Dakota"],
  "Big Bend National Park": [29.1275, -103.2425, "Texas"],
  "Biscayne National Park": [25.4824, -80.2083, "Florida"],
  "Black Canyon of the Gunnison National Park": [38.5754, -107.7416, "Colorado"],
  "Channel Islands National Park": [34.0069, -119.7785, "California"],
  "Congaree National Park": [33.7919, -80.7487, "South Carolina"],
  "Cuyahoga Valley National Park": [41.2808, -81.5678, "Ohio"],
  "Dry Tortugas National Park": [24.6285, -82.8732, "Florida"],
  "Gates of the Arctic National Park": [67.78, -153.3, "Alaska"],
  "Gateway Arch National Park": [38.6247, -90.1848, "Missouri"],
  "Glacier Bay National Park": [58.6658, -136.9002, "Alaska"],
  "Great Basin National Park": [38.9833, -114.3, "Nevada"],
  "Great Sand Dunes National Park": [37.7916, -105.5943, "Colorado"],
  "Guadalupe Mountains National Park": [31.923, -104.885, "Texas"],
  "Haleakala National Park": [20.7204, -156.1552, "Hawaii"],
  "Hot Springs National Park": [34.5215, -93.0423, "Arkansas"],
  "Indiana Dunes National Park": [41.6533, -87.0524, "Indiana"],
  "Isle Royale National Park": [48.0115, -88.8278, "Michigan"],
  "Katmai National Park": [58.6126, -155.0631, "Alaska"],
  "Kenai Fjords National Park": [59.8487, -150.1879, "Alaska"],
  "Kings Canyon National Park": [36.8879, -118.5551, "California"],
  "Kobuk Valley National Park": [67.55, -159.28, "Alaska"],
  "Lake Clark National Park": [60.4127, -154.3235, "Alaska"],
  "Lassen Volcanic National Park": [40.4977, -121.4207, "California"],
  "Mammoth Cave National Park": [37.1869, -86.1005, "Kentucky"],
  "New River Gorge National Park and Preserve": [37.875, -81.0181, "West Virginia"],
  "North Cascades National Park": [48.7718, -121.2985, "Washington"],
  "Petrified Forest National Park": [35.0659, -109.78, "Arizona"],
  "Pinnacles National Park": [36.4906, -121.1825, "California"],
  "Shenandoah National Park": [38.533, -78.35, "Virginia"],
  "Theodore Roosevelt National Park": [46.979, -103.538, "North Dakota"],
  "Virgin Islands National Park": [18.3424, -64.741, "U.S. Virgin Islands"],
  "Voyageurs National Park": [48.4839, -92.8389, "Minnesota"],
  "White Sands National Park": [32.7797, -106.1717, "New Mexico"],
  "Wind Cave National Park": [43.5724, -103.4416, "South Dakota"],
  "Wrangell-St. Elias National Park": [61.7104, -142.9857, "Alaska"],
};

let state = {
  visits: [],
  trips: [],
  importedFiles: [],
  flights: [],
  flightImports: [],
  checklistMarks: [],
  openChecklistGroups: [],
  coverage: { countries: [], regions: {}, subregions: {} },
  selectedRegionView: "china",
  boundaryLevel: "country",
  mapProviderMode: "auto",
  mapBaseOpacity: 100,
  map3d: false,
  detectedMapProvider: "",
  mapOverlays: { light: true, checkins: true, paths: true, flights: true, china5a: false, chinaAncientCapitals: false, worldHeritage: false, highAltitude: false },
  mapViewport: null,
  focusPlaceId: "",
};

const $ = (selector) => document.querySelector(selector);
const loadingDebugState = new Map();
const loadingDebugStartedAt = new Map();
const slowLoadingThresholdMs = 1200;
const maxLoadingDebugItems = 3;
const perfLogThresholdMs = 250;

function perfNow() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function logSlowStep(label, startedAt, threshold = perfLogThresholdMs) {
  const elapsed = Math.round(perfNow() - startedAt);
  if (elapsed >= threshold) console.info(`[Travel Map perf] ${label}: ${elapsed}ms`);
}

function logRenderStage(label, startedAt) {
  logSlowStep(`renderMapLibreLayers:${label}`, startedAt, 120);
  return perfNow();
}

function setLoadingDebug(label, status = "pending") {
  const panel = $("#loadingDebug");
  if (!panel) return;
  const now = performance.now();
  if (status === "pending" && !loadingDebugStartedAt.has(label)) loadingDebugStartedAt.set(label, now);
  const startedAt = loadingDebugStartedAt.get(label);
  const elapsed = startedAt ? Math.round(now - startedAt) : 0;
  if (status === "done") {
    loadingDebugState.set(label, { label, status: elapsed > slowLoadingThresholdMs ? "slow" : "done", elapsed, at: now });
    loadingDebugStartedAt.delete(label);
  } else if (status === "clear") {
    loadingDebugState.delete(label);
    loadingDebugStartedAt.delete(label);
  } else {
    loadingDebugState.set(label, { label, status, elapsed, at: now });
  }

  for (const [key, item] of loadingDebugState.entries()) {
    if ((item.status === "done" || item.status === "slow") && now - item.at > 2500) loadingDebugState.delete(key);
  }

  if (!loadingDebugState.size) {
    panel.hidden = true;
    panel.innerHTML = "";
    return;
  }

  const items = Array.from(loadingDebugState.values())
    .sort((a, b) => {
      const rank = (item) => item.status === "pending" ? 0 : item.status === "error" ? 1 : 2;
      return rank(a) - rank(b) || b.at - a.at;
    })
    .slice(0, maxLoadingDebugItems)
    .map((item) => {
      const text = item.status === "done" ? "完成" : item.status === "slow" ? "慢" : item.status === "error" ? "失败" : "进行中";
      const time = item.elapsed ? ` ${item.elapsed}ms` : "";
      return `<span>${item.label}：${text}${time}</span>`;
    })
    .join("");
  panel.hidden = false;
  panel.innerHTML = `<strong>状态</strong>${items}<em>调试提示</em>`;
}

function clearLoadingDebugSoon() {
  window.setTimeout(() => {
    Array.from(loadingDebugState.keys()).forEach((key) => {
      const status = loadingDebugState.get(key)?.status;
      if (status === "done" || status === "slow") loadingDebugState.delete(key);
    });
    setLoadingDebug("状态", "clear");
  }, 2600);
}

function inBbox(lng, lat, bbox) {
  if (!Array.isArray(bbox)) return false;
  return Number.isFinite(lng) && Number.isFinite(lat) && lng >= bbox[0] && lat >= bbox[1] && lng <= bbox[2] && lat <= bbox[3];
}

function loadBoundaryIndex() {
  if (boundaryIndex) return Promise.resolve(boundaryIndex);
  if (boundaryIndexPromise) return boundaryIndexPromise;
  setLoadingDebug("加载统一边界索引", "pending");
  boundaryIndexPromise = fetchJson(boundaryIndexUrl)
    .then((data) => {
      boundaryIndex = data?.countries ? data : { countries: {} };
      setLoadingDebug("加载统一边界索引", "done");
      clearLoadingDebugSoon();
      return boundaryIndex;
    })
    .catch((error) => {
      console.warn("统一边界索引加载失败", error);
      boundaryIndex = { countries: {} };
      setLoadingDebug("加载统一边界索引", "error");
      clearLoadingDebugSoon();
      return boundaryIndex;
    })
    .finally(() => {
      boundaryIndexPromise = null;
    });
  return boundaryIndexPromise;
}

function boundaryLayerUrl(countryId, layer) {
  const normalized = countryCoverageId(countryId);
  return boundaryIndex?.countries?.[normalized]?.[layer]?.url || "";
}

function hasBoundaryLayer(countryId, layer) {
  return Boolean(boundaryIndex?.countries?.[countryCoverageId(countryId)]?.[layer]?.count > 0);
}

function boundaryReferenceUrl(countryId, referenceKey) {
  const normalized = countryCoverageId(countryId);
  return boundaryIndex?.countries?.[normalized]?.reference?.[referenceKey]?.url || "";
}

function hasBoundaryReference(countryId, referenceKey) {
  const normalized = countryCoverageId(countryId);
  return Boolean(boundaryIndex?.countries?.[normalized]?.reference?.[referenceKey]?.count > 0);
}

function hasDrawableProvinceBoundary(countryId) {
  return hasBoundaryLayer(countryId, "province");
}

function loadBoundaryLayer(countryId, layer, options = {}) {
  const perfStartedAt = perfNow();
  const { renderOnLoad = true } = options;
  const normalized = countryCoverageId(countryId);
  if (!normalized || normalized === "imported") return Promise.resolve(null);
  if (boundaryLayerData[layer]?.[normalized]) return Promise.resolve(boundaryLayerData[layer][normalized]);
  if (boundaryLayerPromises[layer]?.[normalized]) return boundaryLayerPromises[layer][normalized];
  if (boundaryLayerFailures[layer]?.[normalized]) return Promise.resolve(null);
  boundaryLayerPromises[layer] ||= {};
  boundaryLayerData[layer] ||= {};
  boundaryLayerFailures[layer] ||= {};
  const promise = loadBoundaryIndex()
    .then(() => {
      const url = boundaryLayerUrl(normalized, layer);
      if (!url) return null;
      setLoadingDebug(`加载${getCountry(normalized).name}${layer === "province" ? "省级" : "市级"}边界`, "pending");
      return fetchJson(url).then((data) => {
        boundaryLayerData[layer][normalized] = normalizeFeatureCollection(data);
        delete boundaryLayerFailures[layer][normalized];
        try {
          if (refreshInferredLocationsForCountry(normalized)) {
            recomputeCoverage();
            saveState();
          }
        } catch (refreshError) {
          console.warn(`${normalized} ${layer} inferred location refresh failed`, refreshError);
        }
        mapDataVersion += 1;
        logSlowStep(`loadBoundaryLayer:${normalized}:${layer}`, perfStartedAt);
        setLoadingDebug(`加载${getCountry(normalized).name}${layer === "province" ? "省级" : "市级"}边界`, "done");
        clearLoadingDebugSoon();
        return boundaryLayerData[layer][normalized];
      });
    })
    .catch((error) => {
      console.warn(`${normalized} ${layer} 边界加载失败`, error);
      setLoadingDebug(`加载${getCountry(normalized).name}${layer === "province" ? "省级" : "市级"}边界`, "error");
      clearLoadingDebugSoon();
      return null;
    })
    .finally(() => {
      boundaryLayerPromises[layer][normalized] = null;
      if (renderOnLoad) scheduleGeoMapRender();
    });
  boundaryLayerPromises[layer][normalized] = promise;
  return promise;
}

function boundaryDetailCountries() {
  const countriesToShow = new Set(uniqueVisitedCountries());
  locatedCoverageVisits().forEach((visit) => {
    const countryId = countryCoverageId(visit.place.country);
    if (countryId && countryId !== "imported") countriesToShow.add(countryId);
  });
  return Array.from(countriesToShow)
    .map(countryCoverageId)
    .filter((countryId) => countryId && countryId !== "imported");
}

function loadBoundaryLayersForLevel(countries, level) {
  const tasks = boundaryLayerTasksForLevel(countries, level);
  return runBoundaryLayerTasks(tasks);
}

function runBoundaryLayerTasks(tasks) {
  const concurrency = 4;
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const task = tasks[cursor];
      cursor += 1;
      await task();
    }
  });
  return Promise.all(workers);
}

function boundaryLayerNeedsLoad(countryId, layer) {
  const normalized = countryCoverageId(countryId);
  return Boolean(
    normalized
    && normalized !== "imported"
    && hasBoundaryLayer(normalized, layer)
    && !boundaryLayerData[layer]?.[normalized]
    && !boundaryLayerPromises[layer]?.[normalized]
    && !boundaryLayerFailures[layer]?.[normalized]
  );
}

function boundaryLayerIsLoading(countryId, layer) {
  const normalized = countryCoverageId(countryId);
  return Boolean(normalized && boundaryLayerPromises[layer]?.[normalized]);
}

function loadBoundaryReference(countryId, referenceKey, options = {}) {
  const perfStartedAt = perfNow();
  const { renderOnLoad = true } = options;
  const normalized = countryCoverageId(countryId);
  if (!normalized || normalized === "imported") return Promise.resolve(null);
  const cacheKey = `${normalized}:${referenceKey}`;
  const loadingLabel = `Loading ${getCountry(normalized).name} reference boundaries`;
  if (boundaryReferenceData[cacheKey]) return Promise.resolve(boundaryReferenceData[cacheKey]);
  if (boundaryReferencePromises[cacheKey]) return boundaryReferencePromises[cacheKey];
  if (boundaryReferenceFailures[cacheKey]) return Promise.resolve(null);
  const promise = loadBoundaryIndex()
    .then(() => {
      const url = boundaryReferenceUrl(normalized, referenceKey);
      if (!url) return null;
      setLoadingDebug(loadingLabel, "pending");
      return fetchJson(url).then((data) => {
        boundaryReferenceData[cacheKey] = normalizeFeatureCollection(data);
        delete boundaryReferenceFailures[cacheKey];
        mapDataVersion += 1;
        logSlowStep(`loadBoundaryReference:${normalized}:${referenceKey}`, perfStartedAt);
        setLoadingDebug(loadingLabel, "done");
        clearLoadingDebugSoon();
        return boundaryReferenceData[cacheKey];
      });
    })
    .catch((error) => {
      console.warn(`${normalized} ${referenceKey} reference boundary load failed`, error);
      boundaryReferenceFailures[cacheKey] = true;
      setLoadingDebug(loadingLabel, "error");
      clearLoadingDebugSoon();
      return null;
    })
    .finally(() => {
      boundaryReferencePromises[cacheKey] = null;
      if (renderOnLoad) scheduleGeoMapRender();
    });
  boundaryReferencePromises[cacheKey] = promise;
  return promise;
}

function boundaryReferenceNeedsLoad(countryId, referenceKey) {
  const normalized = countryCoverageId(countryId);
  const cacheKey = `${normalized}:${referenceKey}`;
  return Boolean(
    normalized
    && normalized !== "imported"
    && hasBoundaryReference(normalized, referenceKey)
    && !boundaryReferenceData[cacheKey]
    && !boundaryReferencePromises[cacheKey]
    && !boundaryReferenceFailures[cacheKey]
  );
}

function boundaryReferenceIsLoading(countryId, referenceKey) {
  const normalized = countryCoverageId(countryId);
  return Boolean(normalized && boundaryReferencePromises[`${normalized}:${referenceKey}`]);
}

function boundaryLayerTasksForLevel(countries, level) {
  return countries.flatMap((countryId) => [
    boundaryLayerNeedsLoad(countryId, "province") ? () => loadBoundaryLayer(countryId, "province", { renderOnLoad: false }) : null,
    level === "subadmin" && boundaryLayerNeedsLoad(countryId, "city") ? () => loadBoundaryLayer(countryId, "city", { renderOnLoad: false }) : null,
    level === "subadmin" && boundaryReferenceNeedsLoad(countryId, "counties") ? () => loadBoundaryReference(countryId, "counties", { renderOnLoad: false }) : null,
  ].filter(Boolean));
}

function boundaryLevelHasPendingDetailLoads(level = state.boundaryLevel) {
  if (!isLightOverlayEnabled()) return false;
  if (level !== "admin" && level !== "subadmin") return false;
  const countries = boundaryDetailCountries();
  return countries.some((countryId) =>
    boundaryLayerNeedsLoad(countryId, "province")
    || boundaryLayerIsLoading(countryId, "province")
    || (level === "subadmin" && (boundaryLayerNeedsLoad(countryId, "city") || boundaryLayerIsLoading(countryId, "city")))
    || (level === "subadmin" && (boundaryReferenceNeedsLoad(countryId, "counties") || boundaryReferenceIsLoading(countryId, "counties")))
  );
}

function loadBoundaryData(key, options = {}) {
  const { renderOnLoad = true } = options;
  if (boundaryData[key] || !boundarySources[key]) return Promise.resolve(boundaryData[key] || null);
  if (boundaryPromises[key]) return boundaryPromises[key];
  boundaryLoading[key] = true;
  setLoadingDebug(`加载${boundaryLabel(key)}边界`, "pending");
  boundaryPromises[key] = fetchBoundaryJson(boundarySources[key], boundaryFallbackSources[key])
    .then((data) => {
      boundaryData[key] = normalizeFeatureCollection(data);
      if (key === "admin1") admin1DisplayCache = { source: null, collection: null };
      const refreshedChina = (key === "china2" || key === "chinaDirect" || key === "tw2") && refreshInferredSubregionsForVisitedPlaces();
      const refreshedJapan = key === "admin1" && refreshInferredJapanForVisitedPlaces();
      if (refreshedChina || refreshedJapan) {
        recomputeCoverage();
        saveState();
      }
      mapDataVersion += 1;
      setLoadingDebug(`加载${boundaryLabel(key)}边界`, "done");
      clearLoadingDebugSoon();
      return boundaryData[key];
    })
    .catch((error) => {
      console.warn(`${key} 边界数据加载失败`, error);
      if (key === "country" || key === "china") showToast(`${boundaryLabel(key)}边界暂时加载失败，缺失边界不会绘制占位框`);
      setLoadingDebug(`加载${boundaryLabel(key)}边界`, "error");
      clearLoadingDebugSoon();
    })
    .finally(() => {
      boundaryLoading[key] = false;
      boundaryPromises[key] = null;
      if (renderOnLoad) scheduleGeoMapRender();
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
  return fetch(versionedLocalDataUrl(url)).then((response) => {
    if (!response.ok) throw new Error(`${response.status}`);
    return response.json();
  });
}

function versionedLocalDataUrl(url) {
  if (!/^data\//.test(String(url || ""))) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(dataCacheVersion)}`;
}

function preloadBoundaryData(force = false, keys = ["country", "china", "us", "japan", "admin1"]) {
  return Promise.all(keys.map((key) => {
    if (force) boundaryData[key] = null;
    return loadBoundaryData(key);
  }));
}

function boundaryKeysForLevel(level = state.boundaryLevel) {
  if (level === "country") return ["country"];
  if (level === "admin") return ["country"];
  if (level === "subadmin") return ["country"];
  return ["country"];
}

function ensureBoundaryDataForLevel(level = state.boundaryLevel) {
  if (!isLightOverlayEnabled()) return [];
  const keys = Array.from(new Set(boundaryKeysForLevel(level))).filter((key) => boundarySources[key]);
  const pending = keys
    .filter((key) => !boundaryData[key])
    .map((key) => loadBoundaryData(key, { renderOnLoad: false }));
  if (level === "admin" || level === "subadmin") {
    const loadDetailBoundaries = () => {
      if (normalizeSavedChecklistGeography()) {
        recomputeCoverage();
        saveState();
      }
      const tasks = boundaryLayerTasksForLevel(boundaryDetailCountries(), level);
      return tasks.length ? runBoundaryLayerTasks(tasks) : null;
    };
    if (boundaryIndex) {
      const detailBoundaryPromise = loadDetailBoundaries();
      if (detailBoundaryPromise) pending.push(detailBoundaryPromise);
    } else {
      pending.push(loadBoundaryIndex().then(loadDetailBoundaries));
    }
  }
  if (pending.length) Promise.all(pending).finally(scheduleGeoMapRender);
  return pending;
}

function boundaryLabel(key) {
  return { country: "国家", china: "中国省级", us: "美国州", japan: "日本大区", japanPref: "日本都道府县", china2: "中国地级市", chinaDirect: "省直辖县级行政区", tw2: "台湾县市" }[key] || key;
}

function normalizeFeatureCollection(data) {
  if (data?.type === "FeatureCollection") return data;
  if (data?.type === "Feature") return { type: "FeatureCollection", features: [data] };
  return { type: "FeatureCollection", features: [] };
}

function emptyFeatureCollection() {
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
    props["ISO3166-1-Alpha-3"],
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

function localizedBoundaryName(feature, fallbackName = "") {
  const props = feature?.properties || {};
  const localized = currentLanguage === "en"
    ? (props.name_en || props.NAME_EN || props.NAMELSAD || props.NAME || props.name)
    : (props.name_zh || props.name_zht || props.name || props.NAME || props.name_en);
  return String(localized || fallbackName || adminNameFromFeature(feature) || "").trim();
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

function adminNameCandidatesFromFeature(feature) {
  const props = feature?.properties || {};
  const aliases = Array.isArray(props.aliases) ? props.aliases : [];
  return Array.from(new Set([
    props.name,
    props.name_zh,
    props.name_zht,
    props.name_en,
    props.name_local,
    props.NAME,
    props.NAME_1,
    props.NAME_2,
    props.NAMELSAD,
    props.adm1_name,
    adminNameFromFeature(feature),
    canonicalAdminNameFromFeature(feature),
    ...aliases,
  ].map((name) => String(name || "").trim()).filter(Boolean)));
}

function subadminNameFromFeature(feature) {
  const props = feature.properties || {};
  const name = String(
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
  return countryIdFromFeature(feature) === "jp" ? japanPrefectureName(props.name || props.name_en || name) : name;
}

function admin1DisplayCollection() {
  if (!boundaryData.admin1) return { type: "FeatureCollection", features: [] };
  if (admin1DisplayCache.source === boundaryData.admin1 && admin1DisplayCache.collection) return admin1DisplayCache.collection;

  const grouped = new Map();
  const passthrough = [];
  boundaryData.admin1.features.forEach((feature) => {
    const countryId = countryIdFromFeature(feature);
    const props = feature.properties && typeof feature.properties === "object" ? feature.properties : {};
    const rawRegionName = String(props.region || props.region_name || "").trim();
    const regionName = countryId === "jp" ? japanRegionName(rawRegionName) : rawRegionName;
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

function adminOutlineGeoJsonForKeys(regionKeys) {
  return {
    type: "FeatureCollection",
    features: regionKeys.flatMap((regionKey) => adminFeaturesForRegion(regionKey))
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
    coordinates: stitchLineSegments(Array.from(edges.values())
      .filter((edge) => edge.count === 1)
      .map((edge) => edge.segment)),
  };
}

function stitchLineSegments(segments) {
  const unused = new Set(segments.map((_, index) => index));
  const pointToSegments = new Map();
  segments.forEach((segment, index) => {
    segment.forEach((point) => {
      const key = coordinateKey(point);
      const list = pointToSegments.get(key) || [];
      list.push(index);
      pointToSegments.set(key, list);
    });
  });

  const samePoint = (left, right) => coordinateKey(left) === coordinateKey(right);
  const takeNextSegment = (point) => {
    const candidates = pointToSegments.get(coordinateKey(point)) || [];
    return candidates.find((index) => unused.has(index));
  };
  const extendChain = (chain, forward = true) => {
    while (true) {
      const point = forward ? chain[chain.length - 1] : chain[0];
      const nextIndex = takeNextSegment(point);
      if (nextIndex === undefined) return;
      unused.delete(nextIndex);
      const [start, end] = segments[nextIndex];
      const nextPoint = samePoint(point, start) ? end : start;
      if (forward) chain.push(nextPoint);
      else chain.unshift(nextPoint);
      if (samePoint(chain[0], chain[chain.length - 1])) return;
    }
  };

  const lines = [];
  while (unused.size) {
    const index = unused.values().next().value;
    unused.delete(index);
    const chain = [segments[index][0], segments[index][1]];
    extendChain(chain, true);
    if (!samePoint(chain[0], chain[chain.length - 1])) extendChain(chain, false);
    if (chain.length > 1) lines.push(chain);
  }
  return lines;
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

function sameRegionName(regionKey, left, right) {
  if (sameAdminName(left, right)) return true;
  const leftAlias = adminNameAlias(regionKey, left);
  const rightAlias = adminNameAlias(regionKey, right);
  return Boolean(
    (leftAlias && sameAdminName(leftAlias, right))
    || (rightAlias && sameAdminName(left, rightAlias))
    || (leftAlias && rightAlias && sameAdminName(leftAlias, rightAlias))
  );
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
    china: {
      beijing: "北京",
      peking: "北京",
      shanghai: "上海",
      tianjin: "天津",
      chongqing: "重庆",
      hebei: "河北",
      shanxi: "山西",
      innermongolia: "内蒙古",
      neimenggu: "内蒙古",
      liaoning: "辽宁",
      jilin: "吉林",
      heilongjiang: "黑龙江",
      shandong: "山东",
      henan: "河南",
      hubei: "湖北",
      hunan: "湖南",
      guangdong: "广东",
      guangxi: "广西",
      hainan: "海南",
      shaanxi: "陕西",
      shensi: "陕西",
      gansu: "甘肃",
      qinghai: "青海",
      ningxia: "宁夏",
      xinjiang: "新疆",
      yunnan: "云南",
      guizhou: "贵州",
      sichuan: "四川",
      anhui: "安徽",
      fujian: "福建",
      jiangxi: "江西",
      zhejiang: "浙江",
      jiangsu: "江苏",
      tibet: "西藏",
      xizang: "西藏",
      taiwan: "台湾",
      hongkong: "香港",
      hongkongsar: "香港",
      hk: "香港",
      macao: "澳门",
      macau: "澳门",
    },
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
  const cleaned = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u81fa\u7063|\u53f0\u7063/g, "\u53f0\u6e7e")
    .replace(/(\u58ee\u65cf|\u56de\u65cf|\u7ef4\u543e\u5c14)?\u81ea\u6cbb\u533a$/g, "")
    .replace(/\u7279\u522b\u884c\u653f\u533a$/g, "")
    .replace(/(\u7701|\u5e02|\u53bf|\u5e9c|\u90fd)$/g, "")
    .replace(/\b(state of|prefecture|province|county|city)\b/gi, "")
    .replace(/[\s·・.'’`-]+/g, "")
    .toLowerCase();
  if (cleaned) return cleaned;
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
  ensureFeatureBboxes(collection);
  return collection.features.find((feature) => {
    const bbox = featureBbox(feature);
    return bboxContainsPoint(bbox, lng, lat) && geometryContainsPoint(feature.geometry, lng, lat);
  });
}

function ensureFeatureBboxes(collection) {
  if (!collection?.features || preparedBboxCollections.has(collection)) return;
  collection.features.forEach((feature) => {
    if (!feature?.geometry || Array.isArray(feature.bbox) || Array.isArray(feature.properties?.bbox)) return;
    const bbox = bboxForGeometry(feature.geometry);
    if (!bbox) return;
    feature.properties ||= {};
    feature.properties.bbox = bbox;
  });
  preparedBboxCollections.add(collection);
}

function featureBbox(feature) {
  return feature?.bbox || feature?.properties?.bbox || null;
}

function bboxContainsPoint(bbox, lng, lat) {
  if (!Array.isArray(bbox) || bbox.length < 4) return true;
  return lng >= bbox[0] && lat >= bbox[1] && lng <= bbox[2] && lat <= bbox[3];
}

function bboxForGeometry(geometry) {
  if (!geometry) return null;
  if (geometry.type === "GeometryCollection") {
    const boxes = (geometry.geometries || []).map(bboxForGeometry).filter(Boolean);
    if (!boxes.length) return null;
    return boxes.reduce((merged, bbox) => [
      Math.min(merged[0], bbox[0]),
      Math.min(merged[1], bbox[1]),
      Math.max(merged[2], bbox[2]),
      Math.max(merged[3], bbox[3]),
    ]);
  }
  if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
    const [lng, lat] = geometry.coordinates;
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat, lng, lat] : null;
  }
  if (!geometry.coordinates) return null;
  const points = flattenCoordinates(geometry.coordinates).filter((point) => Number.isFinite(point?.[0]) && Number.isFinite(point?.[1]));
  if (!points.length) return null;
  return points.reduce((bbox, point) => [
    Math.min(bbox[0], point[0]),
    Math.min(bbox[1], point[1]),
    Math.max(bbox[2], point[0]),
    Math.max(bbox[3], point[1]),
  ], [points[0][0], points[0][1], points[0][0], points[0][1]]);
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
  const normalizedCountry = countryCoverageId(countryId);
  const provinceCollection = boundaryLayerData.province?.[normalizedCountry];
  if (provinceCollection) {
    const feature = findFeatureAtPoint(provinceCollection, lng, lat);
    const name = feature ? String(feature.properties?.name || adminNameFromFeature(feature) || "").trim() : "";
    if (name) return { name };
  }
  const key = regionKeyForCountry(countryId);
  if (key && boundaryData[key]) {
    const feature = findFeatureAtPoint(boundaryData[key], lng, lat);
    const name = feature ? adminNameFromFeature(feature) : "";
    if (name) return regionSets[key]?.units?.find((unit) => sameAdminName(unit.name, name)) || { name };
  }
  if (boundaryData.admin1) {
    const feature = findFeatureAtPoint(admin1DisplayCollection(), lng, lat);
    const name = feature ? adminNameFromFeature(feature) : "";
    if (name) return { name };
  }
  return key && regionSets[key]?.units ? regionSets[key].units.find((unit) => inBbox(lng, lat, unit.bbox)) : null;
}

function inferSubregion(countryId, lng, lat) {
  const normalizedCountry = countryCoverageId(countryId);
  const cityCollection = boundaryLayerData.city?.[normalizedCountry];
  if (cityCollection) {
    const feature = findFeatureAtPoint(cityCollection, lng, lat);
    const name = feature ? String(feature.properties?.name || subadminNameFromFeature(feature) || "").trim() : "";
    if (name) return { name };
  }
  const key = subadminKeyForCountry(countryId);
  if (!key) return null;
  const collection = key === "china2"
    ? { type: "FeatureCollection", features: [...(boundaryData[key]?.features || []), ...(boundaryData.chinaDirect?.features || []), ...(boundaryData.tw2?.features || [])] }
    : key === "japanPref"
      ? { type: "FeatureCollection", features: (boundaryData.admin1?.features || []).filter((feature) => countryIdFromFeature(feature) === "jp") }
      : boundaryData[key];
  if (!collection) return null;
  const feature = findFeatureAtPoint(collection, lng, lat);
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
  const normalized = normalizeCountry(countryId);
  const known = countries.find((country) => country.id === normalized);
  if (known) return { ...known, name: countryDisplayName(normalized), continent: continentForCountryId(normalized) || known.continent };
  const catalog = worldCountryCatalog.find((country) => country.id === normalized);
  if (catalog) return { id: normalized, name: countryDisplayName(normalized), continent: catalog.continent };
  return { id: normalized, name: countryDisplayName(normalized), continent: continentForCountryId(normalized) };
}

function getPlace(placeId) {
  return placeIndex().get(placeId);
}

function placeIndex() {
  if (placeIndexCache.source !== places || placeIndexCache.size !== places.length) {
    placeIndexCache = { source: places, size: places.length, index: new Map(places.map((place) => [place.id, place])) };
  }
  return placeIndexCache.index;
}

function visitedPlaces() {
  const index = placeIndex();
  return state.visits.map((visit) => ({ ...visit, place: index.get(visit.placeId) })).filter((visit) => visit.place);
}

function locatedVisitedPlaces() {
  return visitedPlaces().filter((visit) => !visit.place.shapeOnly && Number.isFinite(visit.place.lat) && Number.isFinite(visit.place.lng));
}

function locatedCoverageVisits() {
  return locatedVisitedPlaces().filter((visit) => placeCountsForCoverage(visit.place));
}

function bestVisitForPlace(placeId) {
  const visits = state.visits.filter((visit) => visit.placeId === placeId);
  return visits.length ? visits.reduce((best, visit) => (visit.depth > best.depth ? visit : best), visits[0]) : null;
}

function bestDepthForCountry(countryId) {
  return coverageHasCountry(countryId) ? 1 : 0;
}

function countryCoverageId(countryId) {
  const normalized = normalizeCountry(countryId);
  return ["tw", "hk", "mo"].includes(normalized) ? "cn" : normalized;
}

function uniqueVisitedCountries() {
  return new Set((state.coverage?.countries || []).map(countryCoverageId).filter((country) => country && country !== "imported"));
}

function placeCountsForCoverage(place) {
  if (!place || place.shapeOnly) return false;
  if (!place.checklistOnly) return true;
  const isWorldHeritageChecklist =
    place.checklistKey === "worldHeritage" ||
    String(place.id || "").startsWith("checklist-worldheritage-") ||
    (place.checklist || []).includes(checklistCatalog.worldHeritage.label);
  return !isWorldHeritageChecklist || (Number.isFinite(place.lat) && Number.isFinite(place.lng));
}

function ensureCoverage() {
  if (!state.coverage) state.coverage = { countries: [], regions: {}, subregions: {} };
  state.coverage.countries ||= [];
  state.coverage.regions ||= {};
  state.coverage.subregions ||= {};
  return state.coverage;
}

function coverageHasCountry(countryId) {
  const target = countryCoverageId(countryId);
  return ensureCoverage().countries.map(countryCoverageId).includes(target);
}

function coverageRegionNames(regionKey) {
  const coverage = ensureCoverage();
  const names = regionCoverageKeys(regionKey).flatMap((key) => coverage.regions[key] || []);
  return Array.from(new Set(names));
}

function coverageHasRegion(regionKey, name) {
  const compareKey = regionCompareKey(regionKey);
  return coverageRegionNames(regionKey).some((item) => sameRegionName(compareKey, item, name));
}

function regionCoverageKeys(regionKey) {
  const key = countryCoverageId(regionKey) || regionKey;
  const aliases = {
    cn: ["cn", "china"],
    china: ["china", "cn"],
    jp: ["jp", "japan"],
    japan: ["japan", "jp"],
    us: ["us"],
  };
  return aliases[key] || aliases[regionKey] || [regionKey];
}

function regionCompareKey(regionKey) {
  const key = countryCoverageId(regionKey) || regionKey;
  return { cn: "china", jp: "japan" }[key] || regionKey;
}

function coverageHasRegionForFeature(regionKey, feature, fallbackName = "") {
  return adminNameCandidatesFromFeature(feature)
    .concat(fallbackName ? [fallbackName] : [])
    .some((name) => coverageHasRegion(regionKey, name));
}

function coverageSubregionNames(subadminKey) {
  return ensureCoverage().subregions[subadminKey] || [];
}

function coverageHasSubregion(subadminKey, name) {
  const alternateKeys = {
    cn: ["china2"],
    china2: ["cn"],
    jp: ["japanPref"],
    japanPref: ["jp"],
  }[subadminKey] || [];
  return [subadminKey, ...alternateKeys].some((key) =>
    coverageSubregionNames(key).some((item) => sameAdminName(item, name))
  );
}

function coverageHasSubregionForFeature(subadminKey, feature, fallbackName = "") {
  return adminNameCandidatesFromFeature(feature)
    .concat(fallbackName ? [fallbackName] : [])
    .some((name) => coverageHasSubregion(subadminKey, name));
}

function chinaRegionNameForPlace(place, countryId) {
  return chinaRegionNameForCountryId(countryId) || place.unit || "";
}

function addUniqueAdminName(list, name, matcher = sameAdminName) {
  if (!name) return;
  if (!list.some((item) => matcher(item, name))) list.push(name);
}

function rebuildCoverageFromSavedVisits() {
  const countriesSeen = new Set();
  const regions = {};
  const subregions = {};
  visitedPlaces().forEach((visit) => {
    if (!placeCountsForCoverage(visit.place)) return;
    const countryId = normalizeCountry(visit.place.country);
    const coverageCountryId = countryCoverageId(countryId);
    if (coverageCountryId && coverageCountryId !== "imported") countriesSeen.add(coverageCountryId);

    const regionKey = regionKeyForCountry(countryId) || countryId;
    const regionName = chinaRegionNameForPlace(visit.place, countryId);
    if (regionKey && regionName) {
      regionCoverageKeys(regionKey).forEach((key) => {
        regions[key] ||= [];
        addUniqueAdminName(regions[key], regionName, (left, right) => sameRegionName(regionCompareKey(key), left, right));
      });
    }

    const subadminKey = subadminKeyForCountry(countryId);
    const subunit = visit.place.subunit || (sameAdminName(regionName, visit.place.unit) ? "" : visit.place.unit) || "";
    if (subadminKey && subunit) {
      subregions[subadminKey] ||= [];
      addUniqueAdminName(subregions[subadminKey], subunit);
    }
  });
  state.coverage = {
    countries: Array.from(countriesSeen),
    regions,
    subregions,
    updatedAt: new Date().toISOString(),
  };
  invalidateDerivedStatsCache();
}

function recomputeCoverage() {
  const perfStartedAt = perfNow();
  const countriesSeen = new Set();
  const regions = {};
  const subregions = {};
  visitedPlaces().forEach((visit) => {
    if (!placeCountsForCoverage(visit.place)) return;
    const countryId = normalizeCountry(visit.place.country);
    const coverageCountryId = countryCoverageId(countryId);
    if (coverageCountryId && coverageCountryId !== "imported") countriesSeen.add(coverageCountryId);

    const regionKey = regionKeyForCountry(countryId) || countryId;
    const regionName = chinaRegionNameForPlace(visit.place, countryId);
    if (regionKey && regionName) {
      regionCoverageKeys(regionKey).forEach((key) => {
        regions[key] ||= [];
        addUniqueAdminName(regions[key], regionName, (left, right) => sameRegionName(regionCompareKey(key), left, right));
      });
    }

    const subadminKey = subadminKeyForCountry(countryId);
    const subunit = visit.place.subunit || (sameAdminName(regionName, visit.place.unit) ? "" : visit.place.unit) || "";
    if (subadminKey && subunit) {
      subregions[subadminKey] ||= [];
      addUniqueAdminName(subregions[subadminKey], subunit);
    }
  });
  state.coverage = {
    countries: Array.from(countriesSeen),
    regions,
    subregions,
    updatedAt: new Date().toISOString(),
  };
  invalidateDerivedStatsCache();
  logSlowStep("recomputeCoverage", perfStartedAt);
}

function addCoverageForPlace(place) {
  if (!placeCountsForCoverage(place)) return;
  const coverage = ensureCoverage();
  const countryId = normalizeCountry(place.country);
  const coverageCountryId = countryCoverageId(countryId);
  if (coverageCountryId && coverageCountryId !== "imported" && !coverage.countries.map(countryCoverageId).includes(coverageCountryId)) coverage.countries.push(coverageCountryId);
  const regionKey = regionKeyForCountry(countryId) || countryId;
  const regionName = chinaRegionNameForPlace(place, countryId);
  if (regionKey && regionName) {
    regionCoverageKeys(regionKey).forEach((key) => {
      coverage.regions[key] ||= [];
      addUniqueAdminName(coverage.regions[key], regionName, (left, right) => sameRegionName(regionCompareKey(key), left, right));
    });
  }
  const subadminKey = subadminKeyForCountry(countryId);
  const subunit = place.subunit || (sameAdminName(regionName, place.unit) ? "" : place.unit) || "";
  if (subadminKey && subunit) {
    coverage.subregions[subadminKey] ||= [];
    addUniqueAdminName(coverage.subregions[subadminKey], subunit);
  }
  coverage.updatedAt = new Date().toISOString();
  invalidateDerivedStatsCache();
}

function upsertVisit(placeId, depth = 1, options = {}) {
  const place = getPlace(placeId);
  if (!place) return;
  normalizeJapanPlaceHierarchy(place);
  const tripName = options.tripName?.trim();
  const date = options.date || "";
  const tripId = options.tripId || (tripName ? slugify(tripName) : "quick-checkins");
  const updatedAt = options.updatedAt || new Date().toISOString();
  const existing = state.visits.find((visit) => visit.placeId === placeId && visit.tripId === tripId);
  if (existing) {
    existing.depth = 1;
    if (date) existing.date = date;
    existing.updatedAt = updatedAt;
  } else {
    state.visits.push({ placeId, tripId, date, depth: 1, updatedAt });
  }
  addCoverageForPlace(place);
  if (options.save !== false) saveState();
}

function markVisited(placeId, depth = 1, options = {}) {
  const place = getPlace(placeId);
  if (!place) return;
  state.focusPlaceId = placeId;
  upsertVisit(placeId, 1, { ...options, save: false });
  invalidateMapGeoJsonCacheOnly();
  saveState();
  if (!$("#mapDetail")?.classList.contains("hidden")) renderPlaceDetail(placeId);
  renderAfterCheckinChange();
  showToast(`${place.name} ${t("markedToast")}`);
}

function canonicalPlaceKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/景区|旅游区|风景区|国家公园|公园|博物院|博物馆|历史城区|文化旅游区|旅游度假区|风景名胜区/g, "")
    .replace(/[·\-—–()（）]/g, "");
}

const checklistCanonicalPlaces = [
  { id: "cn-huangshan", aliases: ["黄山", "黄山风景区", "黄山 · 莲花峰 · 1864m"] },
  { id: "cn-taishan", aliases: ["泰山", "泰山景区", "泰山 · 玉皇顶 · 1545m", "Mount Taishan"] },
  { id: "cn-jiuzhaigou", aliases: ["九寨沟", "九寨沟风景名胜区", "九寨沟景区"] },
  { id: "cn-huanglong", aliases: ["黄龙", "黄龙风景名胜区", "黄龙景区", "黄龙 · 五彩池 · 3576m"] },
  { id: "cn-wulingyuan", aliases: ["武陵源", "武陵源风景名胜区", "张家界武陵源—天门山旅游区"] },
  { id: "cn-chengde-mountain-resort", aliases: ["承德避暑山庄", "承德避暑山庄及周围寺庙", "承德避暑山庄及其周围寺庙", "承德避暑山庄及周围寺庙景区", "Mountain Resort and its Outlying Temples, Chengde"] },
  { id: "cn-qufu-san-kong", aliases: ["曲阜三孔", "曲阜孔庙、孔林和孔府", "曲阜明故城（三孔）旅游区"] },
  { id: "cn-wudangshan", aliases: ["武当山", "武当山古建筑群", "武当山风景区", "武当山 · 天柱峰 · 1612m"] },
  { id: "cn-potala-palace", aliases: ["布达拉宫", "布达拉宫历史建筑群", "拉萨布达拉宫历史建筑群", "布达拉宫景区", "Historic Ensemble of the Potala Palace, Lhasa"] },
  { id: "cn-lushan", aliases: ["庐山", "庐山国家公园", "庐山风景名胜区", "庐山 · 汉阳峰 · 1474m"] },
  { id: "cn-emeishan-leshan", aliases: ["峨眉山-乐山大佛", "峨眉山—乐山大佛", "峨眉山乐山大佛", "峨眉山景区", "乐山大佛景区", "峨眉山 · 金顶 · 3079m", "Mount Emei Scenic Area, including Leshan Giant Buddha Scenic Area"] },
  { id: "cn-lijiang-old-town", aliases: ["丽江古城", "丽江古城景区", "Old Town of Lijiang"] },
  { id: "cn-pingyao", aliases: ["平遥古城", "平遥古城景区"] },
  { id: "cn-suzhou-gardens", aliases: ["苏州古典园林", "苏州市园林", "Classical Gardens of Suzhou"] },
  { id: "cn-summer-palace", aliases: ["颐和园", "颐和园景区"] },
  { id: "cn-temple-of-heaven", aliases: ["天坛", "天坛公园"] },
  { id: "cn-dazu-rock-carvings", aliases: ["大足石刻", "大足石刻景区"] },
  { id: "cn-wuyishan", aliases: ["武夷山", "武夷山景区", "武夷山 · 黄岗山 · 2160m"] },
  { id: "cn-qingcheng-dujiangyan", aliases: ["青城山-都江堰", "青城山—都江堰", "青城山都江堰", "青城山—都江堰旅游景区", "青城山都江堰旅游", "青城山", "都江堰景区", "青城山 · 老君阁/彭祖峰 · 1260m", "Mount Qingcheng and the Dujiangyan Irrigation System"] },
  { id: "cn-wannan-villages", aliases: ["皖南古村落", "皖南古村落-西递、宏村", "皖南古村落西递宏村", "西递", "宏村"] },
  { id: "cn-longmen-grottoes", aliases: ["龙门石窟", "龙门石窟景区"] },
  { id: "cn-yungang-grottoes", aliases: ["云冈石窟", "云岗石窟", "云冈石窟景区", "Yungang Grottoes"] },
  { id: "cn-sanqingshan", aliases: ["三清山", "三清山国家公园", "三清山风景名胜区", "三清山 · 玉京峰 · 1819m", "Mount Sanqingshan National Park"] },
  { id: "cn-wutaishan", aliases: ["五台山", "五台山景区", "五台山 · 北台叶斗峰 · 3061m"] },
  { id: "cn-dengfeng", aliases: ["登封天地之中古建筑群", "登封“天地之中”历史建筑群", "登封天地之中", "嵩山少林", "嵩山少林景区", "嵩山", "嵩山 · 峻极峰 · 1492m", "Mount Song"] },
  { id: "cn-west-lake", aliases: ["杭州西湖", "杭州西湖文化景观", "西湖", "西湖风景名胜区", "West Lake Cultural Landscape of Hangzhou"] },
  { id: "cn-honghe-hani", aliases: ["红河哈尼梯田", "红河哈尼梯田景区"] },
  { id: "cn-gulangyu", aliases: ["鼓浪屿", "鼓浪屿景区", "鼓浪屿风景名胜区", "Kulangsu, a Historic International Settlement"] },
  { id: "cn-fanjingshan", aliases: ["梵净山", "梵净山景区", "Fanjingshan"] },
  { id: "cn-danxiashan", aliases: ["丹霞山", "中国丹霞", "丹霞山景区"] },
  { id: "cn-yandangshan", aliases: ["雁荡山", "雁荡山风景名胜区", "雁荡山 · 百岗尖 · 1108m"] },
  { id: "cn-huashan", aliases: ["华山", "华山景区", "华山 · 南峰 · 2155m"] },
  { id: "cn-yulong-snow-mountain", aliases: ["玉龙雪山", "玉龙雪山景区", "玉龙雪山 · 冰川公园平台 · 4680m"] },
  { id: "cn-jiuhuashan", aliases: ["九华山", "九华山风景区", "九华山 · 十王峰 · 1342m"] },
  { id: "cn-yinxu", aliases: ["殷墟", "殷墟景区", "Yin Xu"] },
  { id: "es-teide", aliases: ["泰德国家公园", "Teide National Park", "泰德峰 · 缆车上站 · 3555m"] },
  { id: "fr-reunion-pitons", aliases: ["留尼汪岛的山峰，冰斗和峭壁", "Pitons, cirques and remparts of Reunion Island", "内日峰 · 留尼汪步道终点 · 3070m"] },
  { id: "us-yellowstone", aliases: ["黄石国家公园", "Yellowstone National Park", "Yellowstone"] },
  { id: "us-grand-canyon", aliases: ["大峡谷国家公园", "Grand Canyon National Park", "Grand Canyon"] },
  { id: "us-yosemite", aliases: ["优胜美地国家公园", "Yosemite National Park", "Yosemite"] },
  { id: "us-redwood", aliases: ["红木国家公园", "红木国家和州立公园", "Redwood National Park", "Redwood National and State Parks", "Redwood"] },
  { id: "us-everglades", aliases: ["大沼泽国家公园", "大沼泽地国家公园", "Everglades National Park", "Everglades"] },
  { id: "us-great-smoky-mountains", aliases: ["大烟山国家公园", "大烟雾山国家公园", "大烟雾山", "Great Smoky Mountains National Park", "Great Smoky Mountains"] },
  { id: "us-mesa-verde", aliases: ["梅萨维德国家公园", "梅萨维德印第安遗址", "Mesa Verde National Park", "Mesa Verde"] },
  { id: "us-olympic", aliases: ["奥林匹克国家公园", "Olympic National Park", "Olympic"] },
  { id: "us-mammoth-cave", aliases: ["猛犸洞国家公园", "猛玛洞穴国家公园", "Mammoth Cave National Park", "Mammoth Cave"] },
  { id: "us-hawaii-volcanoes", aliases: ["夏威夷火山国家公园", "Hawaii Volcanoes National Park", "Hawaii Volcanoes"] },
  { id: "us-carlsbad-caverns", aliases: ["卡尔斯巴德洞穴国家公园", "卡尔斯巴德洞窟国家公园", "Carlsbad Caverns National Park", "Carlsbad Caverns"] },
  { id: "us-waterton-glacier", aliases: ["沃特顿-冰川国际和平公园", "冰川国家公园", "Glacier National Park", "Waterton-Glacier International Peace Park", "Glacier"] },
  { id: "us-statue-of-liberty", aliases: ["自由女神像", "自由女神像国家名胜", "自由女神像國家名勝", "Statue of Liberty", "Statue of Liberty National Monument"] },
];

const checklistCanonicalAliasMap = new Map();
checklistCanonicalPlaces.forEach((place) => {
  place.aliases.forEach((alias) => {
    const key = canonicalPlaceKey(alias);
    if (key) checklistCanonicalAliasMap.set(key, place);
  });
});

function checklistCanonicalPlaceForItem(item) {
  const candidates = [
    item,
    cleanChecklistName(item),
    englishNameInParentheses(item),
    cleanEnglishParkName(englishNameInParentheses(item)),
  ].filter(Boolean);
  for (const candidate of candidates) {
    const place = checklistCanonicalAliasMap.get(canonicalPlaceKey(candidate));
    if (place) return place;
  }
  return null;
}

function checklistCanonicalKey(item) {
  const place = checklistCanonicalPlaceForItem(item);
  return place ? `place:${place.id}` : "";
}

function checklistCoordinateKeyFromCoords(coords) {
  if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) return "";
  return `coord:${Number(coords[0]).toFixed(5)},${Number(coords[1]).toFixed(5)}`;
}

function checklistCoordinateKeyForItem(key, item, context = null) {
  if (key === "chinaAncientCapitals") return "";
  const group = key === "china5a" ? (typeof context === "string" ? context : context?.unit || "") : "";
  return checklistCoordinateKeyFromCoords(checklistCoordinateFor(item, group));
}

function checklistCoordinateKeyForPlace(place) {
  return checklistCoordinateKeyFromCoords([place?.lat, place?.lng]);
}

function placeMatchesName(place, name) {
  const target = canonicalPlaceKey(name);
  const sourceCanonical = checklistCanonicalKey(name);
  const sourceCoordinate = checklistCoordinateKeyForItem("", name);
  const placeCoordinate = checklistCoordinateKeyForPlace(place);
  const placeKeys = [place.name, place.type, ...(place.checklist || [])].map(canonicalPlaceKey);
  return placeKeys.includes(target)
    || (sourceCanonical && [place.name, place.type, ...(place.checklist || [])].some((value) => checklistCanonicalKey(value) === sourceCanonical))
    || (sourceCoordinate && placeCoordinate === sourceCoordinate);
}

function visitedChecklistKeys() {
  const keys = new Set();
  const visitedIds = new Set((state.visits || []).map((visit) => visit.placeId));
  places.forEach((place) => {
    if (!visitedIds.has(place.id)) return;
    if (place.checklistKey) {
      const checklistKey = checklistItemKey(place.checklistKey, place.name, place);
      if (checklistKey) keys.add(checklistKey);
    }
    [place.name, place.type, ...(place.checklist || [])].forEach((value) => {
      const key = canonicalPlaceKey(value);
      if (key) keys.add(key);
      const canonical = checklistCanonicalKey(value);
      if (canonical) keys.add(canonical);
    });
    const coordinateKey = checklistCoordinateKeyForPlace(place);
    if (coordinateKey) keys.add(coordinateKey);
  });
  return keys;
}

function checklistMarkKeys() {
  const keys = new Set();
  (state.checklistMarks || []).forEach((mark) => {
    const raw = mark.split(":").slice(1).join(":");
    if (raw.startsWith("coord:")) keys.add(raw);
    const key = canonicalPlaceKey(raw);
    if (key) keys.add(key);
    const canonical = raw.startsWith("place:") ? raw : checklistCanonicalKey(raw);
    if (canonical) keys.add(canonical);
  });
  return keys;
}

function checklistStatusKeys() {
  const signature = [
    (state.visits || []).map((visit) => `${visit.placeId}:${visit.depth || 0}`).sort().join("|"),
    (state.checklistMarks || []).slice().sort().join("|"),
    places.map((place) => `${place.id}:${place.name}:${place.type || ""}:${(place.checklist || []).join(",")}`).sort().join("|"),
  ].join("##");
  if (checklistStatusCache.signature !== signature) {
    checklistStatusCache = {
      signature,
      marked: checklistMarkKeys(),
      visited: visitedChecklistKeys(),
    };
  }
  return checklistStatusCache;
}

function unvisitPlace(placeId) {
  const place = getPlace(placeId);
  if (!place) return;
  const key = canonicalPlaceKey(place.name);
  const ids = new Set(places.filter((candidate) => canonicalPlaceKey(candidate.name) === key).map((candidate) => candidate.id));
  state.visits = state.visits.filter((visit) => !ids.has(visit.placeId));
  state.checklistMarks = (state.checklistMarks || []).filter((mark) => canonicalPlaceKey(mark.split(":").slice(1).join(":")) !== key);
  places = places.filter((candidate) => !(candidate.checklistOnly && canonicalPlaceKey(candidate.name) === key));
  checklistStatusCache.signature = "";
  closeMapPopupsAndDetail();
  recomputeCoverage();
  invalidateMapGeoJsonCacheOnly();
  saveStateSoon();
  renderAfterCheckinChange();
  showToast(`${place.name} ${t("unmarkedToast")}`);
}

function closeMapPopupsAndDetail() {
  if (leafletMap) leafletMap.closePopup();
  document.querySelectorAll(".maplibregl-popup").forEach((popup) => popup.remove());
  const detail = $("#mapDetail");
  if (detail) {
    detail.classList.add("hidden");
    detail.classList.remove("ancient-capital-detail");
    detail.innerHTML = `
      <p class="eyebrow">${t("selectionEyebrow")}</p>
      <h3>${t("mapDetailTitle")}</h3>
      <p class="muted">${t("mapDetailHelp")}</p>`;
  }
}

function resetMapDetailClass() {
  $("#mapDetail")?.classList.remove("ancient-capital-detail");
}

function setMapAddMode(enabled) {
  mapAddMode = Boolean(enabled);
  if (mapAddMode) setMapPathMode(false, false);
  pendingMapClickPoint = null;
  $("#addMapPoint")?.classList.toggle("active", mapAddMode);
  $("#leafletMap")?.classList.toggle("adding-map-point", mapAddMode);
  if (mapLibreMap) mapLibreMap.getCanvas().style.cursor = mapAddMode ? "crosshair" : "";
  if (mapAddMode) showToast(t("addingMapPoint"));
}

function setMapPathMode(enabled, announce = true) {
  const wasEnabled = mapPathMode;
  mapPathMode = Boolean(enabled);
  if (mapPathMode && !wasEnabled) {
    mapPathSimplifyLevel = 0;
    mapPathUndoStack = [];
    mapPathRedoStack = [];
    selectedMapPathVertexIndices.clear();
    movingMapPathVertexIndex = null;
  }
  if (!mapPathMode) {
    pendingMapPath = [];
    editingMapPathId = null;
    mapPathEditTool = "append";
    movingMapPathVertexIndex = null;
    selectedMapPathVertexIndices.clear();
    mapPathSimplifyLevel = 0;
    mapPathUndoStack = [];
    mapPathRedoStack = [];
  }
  if (mapPathMode) {
    mapAddMode = false;
    pendingMapClickPoint = null;
  }
  $("#addMapPoint")?.classList.toggle("active", mapAddMode);
  $("#addMapPath")?.classList.toggle("active", mapPathMode);
  $("#leafletMap")?.classList.toggle("adding-map-point", mapAddMode || mapPathMode);
  if (mapLibreMap) mapLibreMap.getCanvas().style.cursor = mapAddMode || mapPathMode ? "crosshair" : "";
  if (mapPathMode && announce) showToast(t("addingMapPath"));
}

function mapPathDefaultName() {
  const date = new Date().toISOString().slice(0, 10);
  return currentLanguage === "en" ? `Map path ${date}` : `地图路径 ${date}`;
}

function openMapPathForm() {
  $("#mapDetail").classList.remove("hidden");
  resetMapDetailClass();
  const editedPath = editingMapPathId ? getPlace(editingMapPathId) : null;
  const existingName = $("#mapPathForm input[name='name']")?.value || editedPath?.name || mapPathDefaultName();
  const toolHint = mapPathEditTool === "move" ? t("moveMapPathHint") : mapPathEditTool === "select" ? t("selectMapPathHint") : t("mapPathHint");
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">${t(editingMapPathId ? "editingMapPath" : "addMapPath")}</p>
    <h3>${toolHint}</h3>
    <form class="map-point-form" id="mapPathForm">
      <label><span>${t("mapPathName")}</span><input name="name" type="text" value="${escapeHtml(existingName)}" /></label>
      <dl><div><dt>${t("mapPathPoints")}</dt><dd>${pendingMapPath.length}</dd></div><div><dt>${t("selectedMapPathPoints")}</dt><dd>${selectedMapPathVertexIndices.size}</dd></div></dl>
      <div class="map-point-actions">
        <button class="detail-action secondary-action ${mapPathEditTool === "append" ? "active" : ""}" data-map-path-tool="append" type="button">${t("appendMapPathPoints")}</button>
        <button class="detail-action secondary-action ${mapPathEditTool === "insert" ? "active" : ""}" data-map-path-tool="insert" type="button">${t("insertMapPathPoint")}</button>
        <button class="detail-action secondary-action ${mapPathEditTool === "select" ? "active" : ""}" data-map-path-tool="select" type="button">${t("selectMapPathPoints")}</button>
        <button class="detail-action secondary-action ${mapPathEditTool === "move" ? "active" : ""}" data-map-path-tool="move" type="button">${t("moveMapPathPoint")}</button>
      </div>
      <div class="map-point-actions">
        <button class="detail-action secondary-action" data-undo-map-path-edit="1" type="button" ${mapPathUndoStack.length ? "" : "disabled"}>${t("undoMapPathEdit")}</button>
        <button class="detail-action secondary-action" data-redo-map-path-edit="1" type="button" ${mapPathRedoStack.length ? "" : "disabled"}>${t("redoMapPathEdit")}</button>
        <button class="detail-action secondary-action" data-simplify-map-path="1" type="button" ${pendingMapPath.length > 2 ? "" : "disabled"}>${t("simplifyMapPath")}</button>
        <button class="detail-action secondary-action" data-delete-selected-map-path="1" type="button" ${selectedMapPathVertexIndices.size && pendingMapPath.length - selectedMapPathVertexIndices.size >= 2 ? "" : "disabled"}>${t("deleteSelectedMapPathPoints")}</button>
        <button class="detail-action" type="submit" ${pendingMapPath.length >= 2 ? "" : "disabled"}>${t("saveMapPath")}</button>
        ${editingMapPathId ? `<button class="detail-action danger" data-delete-map-path="1" type="button">${t("deleteMapPath")}</button>` : ""}
        <button class="detail-action secondary-action" data-cancel-map-path="1" type="button">${t("cancelMapPath")}</button>
      </div>
    </form>`;
}

function refreshMapPathPreview() {
  invalidateMapGeoJsonCacheOnly();
  if (mapLibreMap?.getSource("imported-paths")) mapLibreMap.getSource("imported-paths").setData(importedPathGeoJson());
  else if (!mapLibreMap && leafletMap) renderGeoMap();
}

function mapPathEditSnapshot() {
  return {
    points: pendingMapPath.map((point) => [...point]),
    simplifyLevel: mapPathSimplifyLevel,
    selectedIndices: [...selectedMapPathVertexIndices],
  };
}

function restoreMapPathEditSnapshot(snapshot) {
  if (!snapshot) return;
  pendingMapPath = snapshot.points.map((point) => [...point]);
  mapPathSimplifyLevel = Number(snapshot.simplifyLevel) || 0;
  selectedMapPathVertexIndices.clear();
  (snapshot.selectedIndices || []).forEach((index) => {
    if (index >= 0 && index < pendingMapPath.length) selectedMapPathVertexIndices.add(index);
  });
  movingMapPathVertexIndex = null;
  openMapPathForm();
  refreshMapPathPreview();
}

function recordMapPathEdit() {
  mapPathUndoStack.push(mapPathEditSnapshot());
  if (mapPathUndoStack.length > 100) mapPathUndoStack.shift();
  mapPathRedoStack = [];
}

function undoMapPathEdit() {
  if (!mapPathUndoStack.length) return;
  mapPathRedoStack.push(mapPathEditSnapshot());
  restoreMapPathEditSnapshot(mapPathUndoStack.pop());
}

function redoMapPathEdit() {
  if (!mapPathRedoStack.length) return;
  mapPathUndoStack.push(mapPathEditSnapshot());
  restoreMapPathEditSnapshot(mapPathRedoStack.pop());
}

function addMapPathVertex(lng, lat) {
  recordMapPathEdit();
  pendingMapPath.push(mapStorageCoordinateFromClick(lng, lat));
  mapPathSimplifyLevel = 0;
  ensureTrackOverlayVisible();
  openMapPathForm();
  refreshMapPathPreview();
}

function insertMapPathVertex(lng, lat) {
  if (pendingMapPath.length < 2) {
    addMapPathVertex(lng, lat);
    return;
  }
  const point = mapStorageCoordinateFromClick(lng, lat);
  let nearestSegment = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < pendingMapPath.length - 1; index += 1) {
    const distance = pointSegmentDistance(point, pendingMapPath[index], pendingMapPath[index + 1]);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestSegment = index;
    }
  }
  recordMapPathEdit();
  pendingMapPath.splice(nearestSegment + 1, 0, point);
  mapPathSimplifyLevel = 0;
  selectedMapPathVertexIndices.clear();
  selectedMapPathVertexIndices.add(nearestSegment + 1);
  openMapPathForm();
  refreshMapPathPreview();
  showToast(t("mapPathPointInserted"));
}

function setMapPathEditTool(tool) {
  if (!["append", "insert", "select", "move"].includes(tool)) return;
  mapPathEditTool = tool;
  movingMapPathVertexIndex = null;
  if (tool !== "select") selectedMapPathVertexIndices.clear();
  openMapPathForm();
  refreshMapPathPreview();
}

function toggleMapPathVertexSelection(index) {
  if (!Number.isInteger(index) || index < 0 || index >= pendingMapPath.length) return;
  if (selectedMapPathVertexIndices.has(index)) selectedMapPathVertexIndices.delete(index);
  else selectedMapPathVertexIndices.add(index);
  openMapPathForm();
  refreshMapPathPreview();
}

function mapPathVertexScreenPoint(index) {
  const coordinate = pendingMapPath[index];
  if (!coordinate) return null;
  const [displayLng, displayLat] = mapDisplayCoordinate(coordinate[0], coordinate[1]);
  if (mapLibreMap) {
    const point = mapLibreMap.project([displayLng, displayLat]);
    return { x: point.x, y: point.y };
  }
  if (leafletMap) {
    const point = leafletMap.latLngToContainerPoint([displayLat, displayLng]);
    return { x: point.x, y: point.y };
  }
  return null;
}

function setMapPathSelectionBox(start, end) {
  const container = $("#leafletMap");
  if (!container) return;
  let box = container.querySelector(".map-path-selection-box");
  if (!box) {
    box = document.createElement("div");
    box.className = "map-path-selection-box";
    container.appendChild(box);
  }
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);
  box.style.left = `${left}px`;
  box.style.top = `${top}px`;
  box.style.width = `${Math.abs(end.x - start.x)}px`;
  box.style.height = `${Math.abs(end.y - start.y)}px`;
}

function clearMapPathSelectionBox() {
  $("#leafletMap .map-path-selection-box")?.remove();
}

function bindMapPathBoxSelection() {
  if (mapPathBoxSelectionBound) return;
  const container = $("#leafletMap");
  if (!container) return;
  mapPathBoxSelectionBound = true;
  container.addEventListener("pointerdown", (event) => {
    if (!mapPathMode || mapPathEditTool !== "select" || event.button !== 0) return;
    const rect = container.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    mapPathBoxSelection = {
      pointerId: event.pointerId,
      start: point,
      end: point,
      additive: event.shiftKey || event.ctrlKey || event.metaKey,
      mapLibreDragEnabled: Boolean(mapLibreMap?.dragPan?.isEnabled?.()),
      leafletDragEnabled: Boolean(leafletMap?.dragging?.enabled?.()),
    };
    mapLibreMap?.dragPan?.disable?.();
    leafletMap?.dragging?.disable?.();
    container.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  }, true);
  container.addEventListener("pointermove", (event) => {
    if (!mapPathBoxSelection || event.pointerId !== mapPathBoxSelection.pointerId) return;
    const rect = container.getBoundingClientRect();
    mapPathBoxSelection.end = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (Math.hypot(mapPathBoxSelection.end.x - mapPathBoxSelection.start.x, mapPathBoxSelection.end.y - mapPathBoxSelection.start.y) > 4) {
      setMapPathSelectionBox(mapPathBoxSelection.start, mapPathBoxSelection.end);
    }
    event.preventDefault();
    event.stopPropagation();
  }, true);
  const finishSelection = (event) => {
    if (!mapPathBoxSelection || event.pointerId !== mapPathBoxSelection.pointerId) return;
    const selection = mapPathBoxSelection;
    mapPathBoxSelection = null;
    clearMapPathSelectionBox();
    if (selection.mapLibreDragEnabled) mapLibreMap?.dragPan?.enable?.();
    if (selection.leafletDragEnabled) leafletMap?.dragging?.enable?.();
    const distance = Math.hypot(selection.end.x - selection.start.x, selection.end.y - selection.start.y);
    const projected = pendingMapPath.map((_, index) => ({ index, point: mapPathVertexScreenPoint(index) })).filter((item) => item.point);
    if (!selection.additive) selectedMapPathVertexIndices.clear();
    if (distance <= 4) {
      const nearest = projected.map((item) => ({ ...item, distance: Math.hypot(item.point.x - selection.end.x, item.point.y - selection.end.y) }))
        .filter((item) => item.distance <= 12).sort((left, right) => left.distance - right.distance)[0];
      if (nearest) {
        if (selection.additive && selectedMapPathVertexIndices.has(nearest.index)) selectedMapPathVertexIndices.delete(nearest.index);
        else selectedMapPathVertexIndices.add(nearest.index);
      }
    } else {
      const left = Math.min(selection.start.x, selection.end.x);
      const right = Math.max(selection.start.x, selection.end.x);
      const top = Math.min(selection.start.y, selection.end.y);
      const bottom = Math.max(selection.start.y, selection.end.y);
      projected.forEach(({ index, point }) => {
        if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) selectedMapPathVertexIndices.add(index);
      });
    }
    openMapPathForm();
    refreshMapPathPreview();
    event.preventDefault();
    event.stopPropagation();
  };
  container.addEventListener("pointerup", finishSelection, true);
  container.addEventListener("pointercancel", finishSelection, true);
}

function activateMapPathVertex(index) {
  if (!mapPathMode || !Number.isInteger(index) || index < 0 || index >= pendingMapPath.length) return;
  if (mapPathEditTool === "select") {
    toggleMapPathVertexSelection(index);
    return;
  }
  if (mapPathEditTool === "move") {
    movingMapPathVertexIndex = index;
    selectedMapPathVertexIndices.clear();
    selectedMapPathVertexIndices.add(index);
    openMapPathForm();
    refreshMapPathPreview();
    showToast(t("moveMapPathHint"));
  }
}

function deleteSelectedMapPathVertices() {
  if (!selectedMapPathVertexIndices.size || pendingMapPath.length - selectedMapPathVertexIndices.size < 2) return;
  recordMapPathEdit();
  pendingMapPath = pendingMapPath.filter((_, index) => !selectedMapPathVertexIndices.has(index));
  mapPathSimplifyLevel = 0;
  selectedMapPathVertexIndices.clear();
  movingMapPathVertexIndex = null;
  openMapPathForm();
  refreshMapPathPreview();
}

function pointSegmentDistance(point, start, end) {
  const latitudeScale = Math.cos((((point[1] + start[1] + end[1]) / 3) * Math.PI) / 180);
  const px = point[0] * latitudeScale;
  const py = point[1];
  const sx = start[0] * latitudeScale;
  const sy = start[1];
  const ex = end[0] * latitudeScale;
  const ey = end[1];
  const dx = ex - sx;
  const dy = ey - sy;
  if (!dx && !dy) return Math.hypot(px - sx, py - sy);
  const ratio = Math.max(0, Math.min(1, ((px - sx) * dx + (py - sy) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (sx + ratio * dx), py - (sy + ratio * dy));
}

function simplifyMapPathSection(points, first, last, tolerance, kept) {
  const sections = [[first, last]];
  while (sections.length) {
    const [sectionFirst, sectionLast] = sections.pop();
    let farthestDistance = 0;
    let farthestIndex = -1;
    for (let index = sectionFirst + 1; index < sectionLast; index += 1) {
      const distance = pointSegmentDistance(points[index], points[sectionFirst], points[sectionLast]);
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthestIndex = index;
      }
    }
    if (farthestIndex < 0 || farthestDistance <= tolerance) continue;
    kept.add(farthestIndex);
    sections.push([sectionFirst, farthestIndex], [farthestIndex, sectionLast]);
  }
}

function simplifyPendingMapPath() {
  if (pendingMapPath.length <= 2) return;
  const zoom = mapLibreMap?.getZoom?.() ?? leafletMap?.getZoom?.() ?? 6;
  recordMapPathEdit();
  mapPathSimplifyLevel += 1;
  const tolerancePixels = 0.3 * (1.7 ** (mapPathSimplifyLevel - 1));
  const tolerance = Math.max(0.000001, 360 / (256 * (2 ** zoom)) * tolerancePixels);
  const selectedBefore = new Set(selectedMapPathVertexIndices);
  const selectedOnly = selectedBefore.size > 0;
  const kept = new Set([0, pendingMapPath.length - 1]);
  if (selectedOnly) {
    pendingMapPath.forEach((_, index) => {
      if (!selectedBefore.has(index)) kept.add(index);
    });
  }
  const anchors = [...kept].sort((left, right) => left - right);
  for (let index = 1; index < anchors.length; index += 1) {
    simplifyMapPathSection(pendingMapPath, anchors[index - 1], anchors[index], tolerance, kept);
  }
  const simplifiedEntries = pendingMapPath.map((point, index) => ({ point, index })).filter((entry) => kept.has(entry.index));
  const simplified = simplifiedEntries.map((entry) => entry.point);
  if (simplified.length >= pendingMapPath.length) {
    showToast(currentLanguage === "en"
      ? `Simplification level ${mapPathSimplifyLevel}: no vertices removed; click again for a stronger pass`
      : `简化等级 ${mapPathSimplifyLevel}：本次未减少节点，可再次点击提高强度`);
    openMapPathForm();
    return;
  }
  const removed = pendingMapPath.length - simplified.length;
  pendingMapPath = simplified;
  selectedMapPathVertexIndices.clear();
  simplifiedEntries.forEach((entry, index) => {
    if (selectedBefore.has(entry.index)) selectedMapPathVertexIndices.add(index);
  });
  movingMapPathVertexIndex = null;
  openMapPathForm();
  refreshMapPathPreview();
  const scope = selectedOnly ? (currentLanguage === "en" ? "selected vertices" : "选中节点") : (currentLanguage === "en" ? "whole path" : "整条路径");
  showToast(`${t("mapPathSimplified")} ${mapPathSimplifyLevel} · ${scope} · ${currentLanguage === "en" ? `${removed} removed` : `减少 ${removed} 个节点`}`);
}

function deleteEditingMapPath() {
  const placeId = editingMapPathId;
  if (!placeId) return;
  const message = currentLanguage === "en" ? "Delete this path?" : "确认删除这条路径？";
  if (!window.confirm(message)) return;
  setMapPathMode(false, false);
  deleteInventoryObject(placeId);
}

function saveMapPath(name) {
  if (pendingMapPath.length < 2) return;
  const finalName = String(name || "").trim() || mapPathDefaultName();
  const geometry = { type: "LineString", coordinates: pendingMapPath.map((point) => [...point]) };
  const editedPathId = editingMapPathId;
  setMapPathMode(false, false);
  if (editedPathId) {
    const place = getPlace(editedPathId);
    if (!place) return;
    const manualPath = isManualDrawnPath(place);
    const oldSourceFile = place.sourceFile;
    place.name = finalName;
    place.geometryType = "LineString";
    place.importedGeometry = geometry;
    if (manualPath) {
      place.sourceFile = finalName;
      state.importedFiles = (state.importedFiles || []).map((record) => record.id === place.importId
        ? { ...record, name: finalName }
        : record);
      places.forEach((candidate) => {
        if (candidate !== place && candidate.importId === place.importId && candidate.sourceFile === oldSourceFile) candidate.sourceFile = finalName;
      });
    }
    invalidateMapCaches();
    saveState();
    closeMapPopupsAndDetail();
    if (isMapPageActive() && !refreshMapLibreDataOnly()) scheduleGeoMapRender();
    showToast(`${finalName} ${t("mapPathUpdated")}`);
    return;
  }
  importPlaces([normalizeImportedPlace({
    name: finalName,
    country: "imported",
    unit: currentLanguage === "en" ? "Drawn paths" : "手绘路径",
    type: currentLanguage === "en" ? "Drawn path" : "手绘路径",
    geometryType: "LineString",
    importedGeometry: geometry,
    shapeOnly: true,
    sourceType: "manual-path",
    tags: [currentLanguage === "en" ? "Map drawing" : "地图绘制"],
  })], "drawn", finalName, 0);
  closeMapPopupsAndDetail();
  showToast(`${finalName} ${t("mapPathAdded")}`);
}

function editManualPath(placeId) {
  const place = getPlace(placeId);
  const coordinates = place?.importedGeometry?.type === "LineString" ? place.importedGeometry.coordinates : null;
  if (!isEditablePath(place) || !Array.isArray(coordinates) || coordinates.length < 2) return;
  setMapPathMode(true, false);
  editingMapPathId = place.id;
  pendingMapPath = coordinates.map((point) => [Number(point[0]), Number(point[1])]).filter((point) => point.every(Number.isFinite));
  if (pendingMapPath.length < 2) {
    setMapPathMode(false, false);
    return;
  }
  ensureTrackOverlayVisible();
  openMapPathForm();
  refreshMapPathPreview();
  showToast(t("editingMapPath"));
}

function mapClickPointName() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return currentLanguage === "en" ? `Map check-in ${stamp}` : `地图打卡点 ${stamp}`;
}

function mapClickPointType() {
  return currentLanguage === "en" ? "Map check-in point" : "地图打卡点";
}

function mapClickPointTag() {
  return currentLanguage === "en" ? "Map check-in" : "地图打卡";
}

function inferMapClickPoint(lng, lat) {
  const country = inferCountry(lng, lat);
  const countryId = country?.id || "imported";
  const region = inferRegion(countryId, lng, lat);
  const subregion = inferSubregion(countryId, lng, lat);
  return {
    lng,
    lat,
    countryId,
    countryName: getCountry(countryId).name,
    regionName: region?.name || "",
    subregionName: subregion?.name || "",
  };
}

function mapClickAreaText(point) {
  return [point.countryName, point.regionName, point.subregionName].filter(Boolean).join(" / ") || t("unassigned");
}

function ensureBoundaryLayersForPoint(countryId, lng, lat) {
  const normalized = countryCoverageId(countryId || inferCountry(lng, lat)?.id);
  if (!normalized || normalized === "imported") return Promise.resolve();
  return loadBoundaryIndex().then(() => Promise.all([
    hasBoundaryLayer(normalized, "province") ? loadBoundaryLayer(normalized, "province", { renderOnLoad: false }) : null,
    hasBoundaryLayer(normalized, "city") ? loadBoundaryLayer(normalized, "city", { renderOnLoad: false }) : null,
  ]));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtmlTags(value) {
  return String(value || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function openMapClickCheckinForm(lng, lat) {
  const point = inferMapClickPoint(lng, lat);
  pendingMapClickPoint = { ...point, defaultName: mapClickPointName() };
  $("#mapDetail").classList.remove("hidden");
  resetMapDetailClass();
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">${t("mapClickPoint")}</p>
    <h3>${t("addMapPoint")}</h3>
    <form class="map-point-form" id="mapPointForm">
      <label>
        <span>${t("mapPointName")}</span>
        <input name="name" type="text" value="${escapeHtml(pendingMapClickPoint.defaultName)}" />
      </label>
      <dl>
        <div><dt>${t("coordinates")}</dt><dd>${lat.toFixed(5)}, ${lng.toFixed(5)}</dd></div>
        <div><dt>${t("detectedArea")}</dt><dd>${mapClickAreaText(point)}</dd></div>
      </dl>
      <div class="map-point-actions">
        <button class="detail-action" type="submit">${t("saveMapPoint")}</button>
        <button class="detail-action secondary-action" data-cancel-map-point="1" type="button">${t("cancelMapPoint")}</button>
      </div>
    </form>`;
  $("#mapPointForm")?.querySelector("input[name='name']")?.select();
}

async function createMapClickCheckin({ name, lng, lat }) {
  await ensureBoundaryLayersForPoint(null, lng, lat);
  const point = inferMapClickPoint(lng, lat);
  const id = `map-click-${Date.now()}`;
  const finalName = String(name || "").trim() || mapClickPointName();
  places.push({
    id,
    name: finalName,
    country: point.countryId,
    unit: point.regionName,
    subunit: point.subregionName,
    city: "",
    type: mapClickPointType(),
    lat,
    lng,
    tags: [mapClickPointTag()],
    checklist: [],
    imported: false,
    shapeOnly: false,
  });
  state.focusPlaceId = id;
  ensureCheckinOverlayVisible();
  upsertVisit(id, 1, { tripId: "map-click", save: false });
  recomputeCoverage();
  invalidateMapGeoJsonCacheOnly();
  invalidateMapPointRenderCache();
  saveState();
  setMapAddMode(false);
  closeMapPopupsAndDetail();
  renderPlaceDetail(id);
  renderAfterCheckinChange();
  showToast(`${finalName} ${t("mapPointAdded")}`);
}

function handleMapCanvasClick(lng, lat, originalEvent = null) {
  if (originalEvent?._travelMapHandled) return;
  if (mapPathMode) {
    if (mapPathEditTool === "insert") {
      insertMapPathVertex(lng, lat);
      return;
    }
    if (mapPathEditTool === "move") {
      if (Number.isInteger(movingMapPathVertexIndex)) {
        recordMapPathEdit();
        pendingMapPath[movingMapPathVertexIndex] = mapStorageCoordinateFromClick(lng, lat);
        mapPathSimplifyLevel = 0;
        movingMapPathVertexIndex = null;
        selectedMapPathVertexIndices.clear();
        openMapPathForm();
        refreshMapPathPreview();
        showToast(t("mapPathPointMoved"));
      } else {
        showToast(t("moveMapPathHint"));
      }
      return;
    }
    if (mapPathEditTool === "select") {
      showToast(t("selectMapPathHint"));
      return;
    }
    addMapPathVertex(lng, lat);
    return;
  }
  if (!mapAddMode) {
    closeMapPopupsAndDetail();
    return;
  }
  const [storageLng, storageLat] = mapStorageCoordinateFromClick(lng, lat);
  openMapClickCheckinForm(storageLng, storageLat);
}

function markMapEventHandled(event) {
  event?.preventDefault?.();
  if (event?.originalEvent) {
    event.originalEvent._travelMapHandled = true;
    event.originalEvent.stopPropagation?.();
    event.originalEvent.stopImmediatePropagation?.();
  }
}

function mapEventHitsPoint(event) {
  if (!mapLibreMap || !event?.point || !mapLibreMap.getLayer("map-points-circle")) return false;
  const pointLayers = ["map-points-circle", "map-points-label", "map-points-label-full"]
    .filter((layerId) => mapLibreMap.getLayer(layerId));
  return mapLibreMap.queryRenderedFeatures(event.point, { layers: pointLayers }).length > 0;
}

function mapEventHitsNpsBoundary(event) {
  if (!mapLibreMap || !event?.point) return false;
  const layers = ["us-nps-hit-line", "us-nps-fill"].filter((id) => mapLibreMap.getLayer(id));
  return layers.length > 0 && mapLibreMap.queryRenderedFeatures(event.point, { layers })
    .some((feature) => Boolean(feature.properties?.itemId));
}

function ensureMapDetailCloseButton() {
  const detail = $("#mapDetail");
  if (!detail || detail.classList.contains("hidden") || detail.querySelector("[data-close-detail]")) return;
  const button = document.createElement("button");
  button.className = "map-detail-close";
  button.type = "button";
  button.dataset.closeDetail = "1";
  button.setAttribute("aria-label", currentLanguage === "en" ? "Close map detail" : "关闭地图详情");
  button.textContent = "x";
  detail.prepend(button);
}

function syncImportGuideOpenState(force = false) {
  const guide = document.querySelector(".import-guide");
  if (!guide || (importGuideUserToggled && !force)) return;
  syncingImportGuideOpenState = true;
  guide.open = window.matchMedia("(min-width: 681px)").matches;
  setTimeout(() => {
    syncingImportGuideOpenState = false;
  }, 0);
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "en" ? "en" : "zh-CN";
  document.title = t("appName");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  const version = $("#appVersion");
  if (version) version.textContent = `v${appVersion}`;
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === currentLanguage);
    button.classList.toggle("language-target", button.dataset.language !== currentLanguage);
    button.textContent = button.dataset.language === "en" ? "EN" : "中";
  });
  syncImportGuideOpenState();
  renderMapControls();
}

function setLanguage(language) {
  const viewState = captureLanguageSwitchViewState();
  currentLanguage = language === "en" ? "en" : "zh";
  localStorage.setItem(languageStorageKey, currentLanguage);
  applyLanguage();
  renderLanguageSensitiveViews();
  refreshMapLabelsForLanguage();
  restoreLanguageSwitchViewState(viewState);
}

function refreshMapLabelsForLanguage() {
  checklistOverlayCache.signature = "";
  mapLibreMarkerSignature = "";
  if (mapLibreMap && mapLibreMap.isStyleLoaded() && mapLibreMap.getSource("map-points")) {
    renderMapLibreMarkers();
  } else if (leafletMap && window.L) {
    renderLeafletLayers();
  }
}

function captureLanguageSwitchViewState() {
  const activePage = document.querySelector("[data-page].active");
  const pageId = activePage?.id || "";
  const openAchievementSections = [];
  if (pageId === "achievements") {
    activePage.querySelectorAll("[data-achievement-section]").forEach((details) => {
      if (details.open && details.id) openAchievementSections.push(details.id);
    });
    activePage.querySelectorAll("[data-checklist-group]").forEach((details) => {
      setChecklistGroupOpen(details.dataset.checklistGroup, details.open);
    });
  }
  return {
    pageId,
    openAchievementSections,
    scrollTop: activePage?.scrollTop || 0,
  };
}

function restoreLanguageSwitchViewState(viewState) {
  if (!viewState?.pageId) return;
  requestAnimationFrame(() => {
    const page = document.getElementById(viewState.pageId);
    if (!page?.classList.contains("active")) return;
    if (viewState.pageId === "achievements") {
      (viewState.openAchievementSections || []).forEach((id) => {
        const details = document.getElementById(id);
        if (!details?.matches("[data-achievement-section]")) return;
        details.open = true;
        scheduleFillAchievementSection(details);
      });
    }
    page.scrollTop = viewState.scrollTop || 0;
    window.setTimeout(() => {
      const latestPage = document.getElementById(viewState.pageId);
      if (latestPage?.classList.contains("active")) latestPage.scrollTop = viewState.scrollTop || 0;
    }, 80);
    if (viewState.pageId === "checkins") scheduleManualNavSpy();
    if (viewState.pageId === "achievements") scheduleChecklistNavSpy();
  });
}

function renderLanguageSensitiveViews() {
  const activePage = document.querySelector("[data-page].active")?.dataset.page || "world";
  renderMapControls();
  renderPlaceSelect();
  if (activePage === "dashboard") {
    renderMetrics();
    renderDashboardAchievements();
    renderNextStops();
  }
  if (activePage === "imports") {
    renderImportSummary();
    renderDataInventory();
  }
  if (activePage === "checkins") renderCheckinsPage();
  if (activePage === "achievements") renderAchievements();
  if (!$("#mapDetail")?.classList.contains("hidden")) closeMapPopupsAndDetail();
}

function saveState(options = {}) {
  if (options.invalidateMapData !== false) mapDataVersion += 1;
  const payload = { places, state, savedAt: new Date().toISOString() };
  if (!fullStateLoaded && !options.allowBeforeFullLoad) {
    console.warn("Skipped state save before full state load");
    return;
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(localStorageSnapshot(payload)));
  } catch (error) {
    console.warn("保存失败", error);
  }
  if (options.immediateIndexedDb) {
    saveStateToIndexedDb(payload);
  } else {
    saveStateToIndexedDbSoon(payload);
  }
}

function saveStateToIndexedDbSoon(payload) {
  pendingIndexedDbPayload = payload;
  if (pendingIndexedDbSave) clearTimeout(pendingIndexedDbSave);
  pendingIndexedDbSave = window.setTimeout(() => {
    pendingIndexedDbSave = null;
    const payloadToSave = pendingIndexedDbPayload;
    pendingIndexedDbPayload = null;
    saveStateToIndexedDb(payloadToSave);
  }, 350);
}

function saveUiStateSoon() {
  if (pendingUiStateSave) clearTimeout(pendingUiStateSave);
  pendingUiStateSave = setTimeout(() => {
    pendingUiStateSave = null;
    saveState({ invalidateMapData: false });
  }, 80);
}

function saveStateSoon(options = {}) {
  if (pendingFullStateSave) clearTimeout(pendingFullStateSave);
  pendingFullStateSave = setTimeout(() => {
    pendingFullStateSave = null;
    saveState(options);
  }, 160);
}

function normalizeMapViewport(viewport, options = {}) {
  if (!viewport || !Array.isArray(viewport.center)) return null;
  const [lng, lat] = viewport.center.map(Number);
  const zoom = Number(viewport.zoom);
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || !Number.isFinite(zoom)) return null;
  const minZoom = Number.isFinite(options.minZoom) ? options.minZoom : 1;
  return {
    center: [Math.max(-180, Math.min(180, lng)), Math.max(-85, Math.min(85, lat))],
    zoom: Math.max(minZoom, Math.min(18, zoom)),
  };
}

function rememberMapViewportSoon() {
  if (restoringMapViewport) return;
  let viewport = null;
  if (mapLibreMap) {
    const center = mapLibreMap.getCenter();
    viewport = normalizeMapViewport({ center: [center.lng, center.lat], zoom: mapLibreMap.getZoom() }, { minZoom: state.map3d ? 0 : 1 });
  } else if (leafletMap) {
    const center = leafletMap.getCenter();
    viewport = normalizeMapViewport({ center: [center.lng, center.lat], zoom: leafletMap.getZoom() });
  }
  if (!viewport) return;
  state.mapViewport = viewport;
  saveUiStateSoon();
}

function restoreStoredMapViewport() {
  const viewport = normalizeMapViewport(state.mapViewport);
  if (!viewport) return;
  restoringMapViewport = true;
  try {
    if (mapLibreMap) {
      mapLibreMap.jumpTo({ center: viewport.center, zoom: viewport.zoom });
    } else if (leafletMap) {
      leafletMap.setView([viewport.center[1], viewport.center[0]], viewport.zoom, { animate: false });
    }
  } finally {
    setTimeout(() => {
      restoringMapViewport = false;
    }, 0);
  }
}

function localStorageSnapshot(payload) {
  const savedState = payload.state || {};
  return {
    version: 3,
    storage: "indexeddb-primary",
    savedAt: payload.savedAt,
    state: {
      boundaryLevel: savedState.boundaryLevel,
      selectedRegionView: savedState.selectedRegionView,
      focusPlaceId: savedState.focusPlaceId,
      openChecklistGroups: savedState.openChecklistGroups || [],
      mapProviderMode: savedState.mapProviderMode || "auto",
      mapBaseOpacity: normalizeMapBaseOpacity(savedState.mapBaseOpacity),
      map3d: Boolean(savedState.map3d),
      detectedMapProvider: savedState.detectedMapProvider || "",
      mapOverlays: normalizeMapOverlays(savedState.mapOverlays || {}),
      mapViewport: normalizeMapViewport(savedState.mapViewport),
      coverage: savedState.coverage || { countries: [], regions: {}, subregions: {} },
    },
  };
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
    try {
      localStorage.setItem(storageKey, JSON.stringify(localStorageSnapshot({ ...payload, savedAt: payload.savedAt || new Date().toISOString() })));
    } catch (error) {
      console.warn("Local storage snapshot refresh failed", error);
    }
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
      flights: saved.state.flights || [],
      flightImports: saved.state.flightImports || [],
      checklistMarks: saved.state.checklistMarks || [],
      openChecklistGroups: saved.state.openChecklistGroups || [],
      mapProviderMode: normalizeMapProviderMode(saved.state.mapProviderMode || state.mapProviderMode),
      mapBaseOpacity: normalizeMapBaseOpacity(saved.state.mapBaseOpacity),
      map3d: Boolean(saved.state.map3d),
      detectedMapProvider: normalizeDetectedMapProvider(saved.state.detectedMapProvider || state.detectedMapProvider),
      mapOverlays: normalizeMapOverlays(saved.state.mapOverlays || {}),
      mapViewport: normalizeMapViewport(saved.state.mapViewport) || state.mapViewport || null,
      coverage: saved.state.coverage || { countries: [], regions: {}, subregions: {} },
    };
  state.visits = (state.visits || []).map((visit) => ({ ...visit, depth: visit.depth > 0 ? 1 : 0 })).filter((visit) => visit.depth > 0);
  migrateImportedShapes();
  sanitizeDataStore();
  return true;
}

function applyLocalStorageSnapshot(saved) {
  if (!saved?.state || saved.storage !== "indexeddb-primary") return false;
  const savedBoundaryLevel = ["country", "admin", "subadmin"].includes(saved.state.boundaryLevel) ? saved.state.boundaryLevel : "country";
  state = {
    ...state,
    boundaryLevel: savedBoundaryLevel,
    selectedRegionView: saved.state.selectedRegionView || state.selectedRegionView || "china",
    focusPlaceId: saved.state.focusPlaceId || state.focusPlaceId,
    openChecklistGroups: saved.state.openChecklistGroups || state.openChecklistGroups || [],
    mapProviderMode: normalizeMapProviderMode(saved.state.mapProviderMode || state.mapProviderMode),
    mapBaseOpacity: normalizeMapBaseOpacity(saved.state.mapBaseOpacity),
    map3d: Boolean(saved.state.map3d),
    detectedMapProvider: normalizeDetectedMapProvider(saved.state.detectedMapProvider || state.detectedMapProvider),
    mapOverlays: normalizeMapOverlays(saved.state.mapOverlays || state.mapOverlays || {}),
    mapViewport: normalizeMapViewport(saved.state.mapViewport) || state.mapViewport || null,
    coverage: saved.state.coverage || state.coverage || { countries: [], regions: {}, subregions: {} },
  };
  return true;
}

function sanitizeDataStore() {
  const seedPlaceIds = new Set(["forbidden-city", "shenzhen", "xian", "tokyo", "kyoto", "yosemite", "nyc", "paris", "singapore"]);
  const checklistChanged = normalizeSavedChecklistGeography();
  const japanHierarchyChanged = normalizeJapanPlacesHierarchy();
  const coverageNeedsRebuild = checklistChanged || japanHierarchyChanged;
  state.visits = (state.visits || []).filter((visit) => !(visit.tripId === "seed" && seedPlaceIds.has(visit.placeId)));
  state.trips = (state.trips || []).filter((trip) => trip.id !== "seed");
  if (seedPlaceIds.has(state.focusPlaceId)) state.focusPlaceId = "";
  const knownPlaceIds = new Set(places.map((place) => place.id));
  const visitMap = new Map();
  (state.visits || []).forEach((visit) => {
    if (!knownPlaceIds.has(visit.placeId) || visit.depth <= 0) return;
    const key = `${visit.placeId}:${visit.tripId || "default"}`;
    const current = visitMap.get(key);
    if (!current || (visit.date || "") > (current.date || "")) {
      visitMap.set(key, { ...visit, depth: 1, tripId: visit.tripId || "default", date: visit.date || "" });
    }
  });
  state.visits = Array.from(visitMap.values());
  state.importedFiles ||= [];
  state.flights = sanitizeFlights(state.flights || []);
  state.flightImports = Array.isArray(state.flightImports) ? state.flightImports : [];
  state.checklistMarks ||= [];
  state.openChecklistGroups ||= [];
  if (coverageNeedsRebuild) rebuildCoverageFromSavedVisits();
  else ensureCoverage();
  state.coverage.countries = Array.from(new Set((state.coverage.countries || []).map(countryCoverageId).filter((country) => country && country !== "imported")));
}

function normalizeSavedChecklistGeography() {
  let changed = false;
  const hasNorthKoreaCoverage = (state.coverage?.countries || []).map(countryCoverageId).includes("kp");
  places.forEach((place) => {
    const isChina5a =
      place.checklistKey === "china5a" ||
      String(place.id || "").startsWith("checklist-china5a-");
    const isWorldHeritage =
      place.checklistKey === "worldHeritage" ||
      String(place.id || "").startsWith("checklist-worldheritage-") ||
      (place.checklist || []).includes(checklistCatalog.worldHeritage.label);
    const isAncientCapital =
      place.checklistKey === "chinaAncientCapitals" ||
      String(place.id || "").startsWith("checklist-chinaancientcapitals-");
    if (!isChina5a && !isWorldHeritage && !isAncientCapital) return;
    const before = `${place.country || ""}|${place.unit || ""}|${place.subunit || ""}|${place.lat || ""}|${place.lng || ""}`;
    const checklistKey = isChina5a ? "china5a" : isAncientCapital ? "chinaAncientCapitals" : "worldHeritage";
    applyChecklistCoordinates(place, checklistCoordinateFor(place.name), checklistKey);
    const after = `${place.country || ""}|${place.unit || ""}|${place.subunit || ""}|${place.lat || ""}|${place.lng || ""}`;
    if (before !== after) changed = true;
    if (hasNorthKoreaCoverage) changed = true;
  });
  return changed;
}

function currentArchivePayload() {
  sanitizeDataStore();
  recomputeCoverage();
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    counts: dataCounts(),
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
    restoreArchivePayload(JSON.parse(await file.text()));
    saveState();
    renderAll();
    showToast(`已恢复存档：${file.name}`);
  } catch (error) {
    showToast(`存档导入失败：${error.message}`);
  } finally {
    event.target.value = "";
  }
}

function isArchivePayload(payload) {
  return Array.isArray(payload?.places) && payload?.state && Array.isArray(payload.state.visits);
}

function restoreArchivePayload(payload) {
  if (!isArchivePayload(payload)) throw new Error("存档结构不正确");
  applySavedPayload(payload);
  recomputeCoverage();
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw && raw.length > 250000) {
      console.warn("Skipping oversized legacy localStorage state; IndexedDB will be used");
      return;
    }
    const saved = JSON.parse(raw || "null");
    if (!applyLocalStorageSnapshot(saved)) applySavedPayload(saved);
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
    normalizeJapanPlaceHierarchy(place);
  });
}

function refreshInferredSubregionsForVisitedPlaces() {
  if (!boundaryData.china2) return false;
  let changed = false;
  visitedPlaces().forEach((visit) => {
    const place = visit.place;
    if (place.shapeOnly || countryCoverageId(place.country) !== "cn") return;
    if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return;
    const subregion = inferSubregion("cn", place.lng, place.lat);
    if (subregion?.name && !sameAdminName(place.subunit, subregion.name)) {
      place.subunit = subregion.name;
      changed = true;
    }
  });
  return changed;
}

function refreshInferredJapanForVisitedPlaces() {
  if (!boundaryData.admin1) return false;
  let changed = false;
  visitedPlaces().forEach((visit) => {
    const place = visit.place;
    if (place.shapeOnly || normalizeCountry(place.country) !== "jp") return;
    if (Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
      const region = inferRegion("jp", place.lng, place.lat);
      const subregion = inferSubregion("jp", place.lng, place.lat);
      if (region?.name && !sameAdminName(place.unit, region.name)) {
        place.unit = region.name;
        changed = true;
      }
      if (subregion?.name && !sameAdminName(place.subunit, subregion.name)) {
        place.subunit = subregion.name;
        changed = true;
      }
    }
    if (normalizeJapanPlaceHierarchy(place)) changed = true;
  });
  return changed;
}

function refreshInferredLocationsForCountry(countryId) {
  const normalized = countryCoverageId(countryId);
  if (!normalized || normalized === "imported") return false;
  let changed = false;
  places.forEach((place) => {
    if (place.shapeOnly || countryCoverageId(place.country) !== normalized) return;
    if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return;
    const region = inferRegion(normalized, place.lng, place.lat);
    const subregion = inferSubregion(normalized, place.lng, place.lat);
    if (region?.name && !sameAdminName(place.unit, region.name)) {
      place.unit = region.name;
      changed = true;
    }
    if (subregion?.name && !sameAdminName(place.subunit, subregion.name)) {
      place.subunit = subregion.name;
      changed = true;
    }
    if (normalizeJapanPlaceHierarchy(place)) changed = true;
  });
  return changed;
}

function loadCatalogData() {
  if (catalogDataPromise) return catalogDataPromise;
  catalogDataRequested = true;
  catalogDataPromise = fetchJson("data/world-heritage.json")
    .then((data) => {
      if (!data?.byCountry || !data?.coordinates) throw new Error("invalid world heritage catalog");
      const byCountry = {};
      const coordinates = {};
      const englishNames = {};
      const countryIds = {};
      const parentKeys = {};
      const parentNames = {};
      const nameAliases = collectWorldHeritageNameAliases(data.byCountry);
      if (Array.isArray(data.items) && data.items.length) {
        data.items.forEach((item) => {
          const sourceName = stripHtmlTags(item.zhName || (/^Q\d+$/.test(item.name || "") ? item.enName : item.name) || item.enName);
          const normalizedItem = normalizeWorldHeritageItemName(sourceName, nameAliases);
          if (!normalizedItem) return;
          const itemCountries = (Array.isArray(item.countries) && item.countries.length ? item.countries : [item.country]).map(stripHtmlTags);
          const itemCountryIds = Array.isArray(item.countryIds) ? item.countryIds : [];
          if (item.enName) {
            const englishName = stripHtmlTags(item.enName);
            englishNames[normalizedItem] = englishName;
            englishNames[canonicalPlaceKey(normalizedItem)] = englishName;
          }
          if (Array.isArray(item.components) && item.components.length) {
            item.components.forEach((component) => {
              const componentName = normalizeWorldHeritageItemName(stripHtmlTags(component.zhName || component.name || component.enName), nameAliases);
              if (!componentName) return;
              const componentCountry = worldHeritageDisplayCountryForItem(componentName, stripHtmlTags(component.country || itemCountries[0]));
              if (component.countryId) countryIds[componentCountry] = String(component.countryId).toLowerCase();
              byCountry[componentCountry] ||= [];
              byCountry[componentCountry].push(componentName);
              parentKeys[canonicalPlaceKey(componentName)] = canonicalPlaceKey(normalizedItem);
              parentNames[canonicalPlaceKey(componentName)] = {
                zh: normalizedItem,
                en: stripHtmlTags(item.enName || normalizedItem),
              };
              if (component.enName) {
                const englishName = stripHtmlTags(component.enName);
                englishNames[componentName] = englishName;
                englishNames[canonicalPlaceKey(componentName)] = englishName;
              }
              if (Number.isFinite(component.lat) && Number.isFinite(component.lng)) {
                coordinates[componentName] = [component.lat, component.lng, componentCountry];
              }
            });
            return;
          }
          itemCountries.forEach((country, index) => {
            const itemCountry = worldHeritageDisplayCountryForItem(normalizedItem, country);
            if (itemCountryIds[index]) countryIds[itemCountry] = String(itemCountryIds[index]).toLowerCase();
            byCountry[itemCountry] ||= [];
            byCountry[itemCountry].push(normalizedItem);
          });
          if (Number.isFinite(item.lat) && Number.isFinite(item.lng)) {
            const coordinateCountry = worldHeritageDisplayCountryForItem(normalizedItem, itemCountries[0]);
            coordinates[normalizedItem] = [item.lat, item.lng, coordinateCountry];
          }
        });
      } else {
        const coordinateCountryByName = new Map();
        Object.entries(data.coordinates || {}).forEach(([name, coords]) => {
          if (!Array.isArray(coords)) return;
          const normalizedName = normalizeWorldHeritageItemName(stripHtmlTags(name), nameAliases);
          if (!normalizedName) return;
          const normalizedCountry = worldHeritageDisplayCountryForItem(normalizedName, stripHtmlTags(coords[2]));
          coordinates[normalizedName] = [coords[0], coords[1], normalizedCountry];
          coordinateCountryByName.set(normalizedName, normalizedCountry);
        });
        Object.entries(data.byCountry || {}).forEach(([country, items]) => {
          const normalizedCountry = normalizeWorldHeritageCountryName(stripHtmlTags(country));
          (items || []).forEach((item) => {
            const normalizedItem = normalizeWorldHeritageItemName(stripHtmlTags(item), nameAliases);
            if (!normalizedItem) return;
            const itemCountry = worldHeritageDisplayCountryForItem(
              normalizedItem,
              coordinateCountryByName.get(normalizedItem) || normalizedCountry
            );
            byCountry[itemCountry] ||= [];
            byCountry[itemCountry].push(normalizedItem);
          });
        });
      }
      Object.entries(data.englishNames || {}).forEach(([name, englishName]) => {
        const normalizedName = normalizeWorldHeritageItemName(stripHtmlTags(name), nameAliases);
        if (normalizedName && englishName) englishNames[normalizedName] = stripHtmlTags(englishName);
      });
      Object.entries(data.countryIds || {}).forEach(([country, id]) => {
        const normalizedCountry = normalizeWorldHeritageCountryName(country);
        if (normalizedCountry && id) countryIds[normalizedCountry] = String(id).toLowerCase();
      });
      Object.keys(byCountry).forEach((country) => {
        byCountry[country] = Array.from(new Set(byCountry[country])).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
      });
      checklistCatalog.worldHeritage.byCountry = byCountry;
      worldHeritageCoordinates = coordinates;
      worldHeritageEnglishNames = englishNames;
      worldHeritageCountryIds = countryIds;
      worldHeritageParentKeys = parentKeys;
      worldHeritageParentNames = parentNames;
      invalidateUnifiedParkHeritageIndex();
      const countryCount = Object.keys(byCountry).length;
      const total = Number(data.total) || worldHeritageCatalogTotal;
      worldHeritageCatalogStatus = {
        source: currentLanguage === "en" ? "Local UNESCO 2025 catalog" : "本地 UNESCO 2025 清单",
        detail: currentLanguage === "en"
          ? `${total} records, ${countryCount} countries/regions`
          : `${total} 条记录，${countryCount} 个国家/地区`,
        total,
      };
      if (normalizeSavedChecklistGeography()) {
        recomputeCoverage();
        saveState();
        ensureBoundaryDataForLevel(state.boundaryLevel || "country");
        if (isMapPageActive()) scheduleGeoMapRender();
      }
    })
    .catch((error) => {
      console.warn("世界遗产清单加载失败，使用内置备用清单", error);
      worldHeritageCoordinates = {};
      worldHeritageEnglishNames = {};
      worldHeritageCountryIds = {};
      worldHeritageParentKeys = {};
      worldHeritageParentNames = {};
      worldHeritageCatalogStatus = {
        source: currentLanguage === "en" ? "Built-in fallback catalog" : "内置备用清单",
        detail: currentLanguage === "en" ? "data/world-heritage.json was not loaded" : "未能加载 data/world-heritage.json",
        total: worldHeritageCatalogTotal,
      };
    })
    .finally(() => {
      renderDashboardAchievements();
      if (document.querySelector('[data-page="achievements"]')?.classList.contains("active")) renderAchievements();
      if (isMapPageActive() && state.mapOverlays?.worldHeritage) scheduleGeoMapRender();
    });
  return catalogDataPromise;
}

function loadChina5aCatalog() {
  if (china5aCatalogPromise) return china5aCatalogPromise;
  china5aCatalogPromise = fetchJson("data/china-5a.json")
    .then((data) => {
      if (!data?.byRegion) throw new Error("invalid 5A catalog");
      checklistCatalog.china5a.byRegion = data.byRegion;
      const total = Number(data.total) || Object.values(data.byRegion).flat().length;
      china5aCatalogStatus = {
        source: currentLanguage === "en" ? "Local official catalog" : "本地完整清单",
        detail: currentLanguage === "en" ? `${total} 5A scenic areas` : `${total} 个 5A 景区`,
        total,
      };
    })
    .catch((error) => {
      console.warn("中国 5A 清单加载失败，使用内置备用清单", error);
      const total = checklistItemsFor("china5a").length;
      china5aCatalogStatus = {
        source: currentLanguage === "en" ? "Built-in fallback catalog" : "内置备用清单",
        detail: currentLanguage === "en" ? `${total} fallback records` : `${total} 条备用记录`,
        total,
      };
    })
    .finally(() => {
      renderMetrics();
      renderDashboardAchievements();
      renderNextStops();
      if (document.querySelector('[data-page="achievements"]')?.classList.contains("active")) renderAchievements();
      if (isMapPageActive() && state.mapOverlays?.china5a) scheduleGeoMapRender();
    });
  return china5aCatalogPromise;
}

function loadChina5aCoordinates() {
  if (china5aCoordinatesPromise) return china5aCoordinatesPromise;
  china5aCoordinatesPromise = fetchJson("data/china-5a-coordinates.json")
    .then((data) => {
      china5aCoordinates = data?.coordinates || {};
      china5aCatalogStatus = {
        ...china5aCatalogStatus,
        detail: currentLanguage === "en"
          ? `${china5aOfficialTotal} 5A scenic areas, ${Object.keys(china5aCoordinates).length} local coordinates`
          : `${china5aOfficialTotal} 个 5A 景区，${Object.keys(china5aCoordinates).length} 条本地坐标`,
      };
    })
    .catch(() => {
      china5aCoordinates = {};
    })
    .finally(() => {
      if (document.querySelector('[data-page="achievements"]')?.classList.contains("active")) renderAchievements();
      if (isMapPageActive() && state.mapOverlays?.china5a) scheduleGeoMapRender();
    });
  return china5aCoordinatesPromise;
}

function loadUsNpsCatalog() {
  if (usNpsCatalogPromise) return usNpsCatalogPromise;
  usNpsCatalogPromise = fetchJson("data/us-nps-units.json")
    .then((data) => {
      if (!Array.isArray(data?.units) || Number(data.total) !== usNpsUnitTotal) throw new Error("invalid NPS catalog");
      usNpsUnits = data.units;
      const broadGroups = [
        { id: "parks", label: "National Parks", items: [] },
        { id: "battlefields", label: "Battlefields and Military Parks", items: [] },
        { id: "historic", label: "Historic Sites and Memorials", items: [] },
        { id: "nature-recreation", label: "Nature and Recreation Areas", items: [] },
        { id: "other-nps-units", label: "Other NPS Units", items: [] },
      ];
      usNpsUnits.forEach((unit) => {
        const designation = String(unit.designation || "");
        const groupId = designation === "National Parks"
          ? "parks"
          : /Battlefield|Military/i.test(designation)
            ? "battlefields"
            : /Historic|Historical|Memorial/i.test(designation)
              ? "historic"
              : /Recreation|Preserve|Seashore|Lakeshore|River|Scenic Trail/i.test(designation)
                ? "nature-recreation"
                : "other-nps-units";
        unit.designationId = groupId;
        broadGroups.find((group) => group.id === groupId)?.items.push(unit.id);
      });
      usNpsGroups = broadGroups.map((group) => ({ ...group, count: group.items.length })).filter((group) => group.items.length);
      usNpsUnitById = new Map(usNpsUnits.map((unit) => [unit.id, unit]));
      usNpsUnitsByCode = new Map();
      usNpsUnitByMergeName = new Map();
      usNpsUnitByCanonicalPlace = new Map();
      usNpsUnits.forEach((unit) => {
        usNpsUnitByMergeName.set(canonicalPlaceKey(unit.name), unit);
        const canonicalKey = checklistCanonicalKey(unit.name);
        if (canonicalKey) usNpsUnitByCanonicalPlace.set(canonicalKey, unit);
      });
      usNpsUnits.forEach((unit) => [unit.code, ...(unit.alternateCodes || [])].forEach((code) => {
        const normalizedCode = String(code || "").toUpperCase();
        if (!normalizedCode) return;
        const list = usNpsUnitsByCode.get(normalizedCode) || [];
        list.push(unit);
        usNpsUnitsByCode.set(normalizedCode, list);
      }));
      if (!legacyUsNationalParkItems.length) legacyUsNationalParkItems = [...(checklistCatalog.usNationalParks.items || [])];
      checklistCatalog.usNationalParks.items = usNpsUnits.map((unit) => unit.id);
      invalidateUnifiedParkHeritageIndex();
      let migrated = false;
      state.checklistMarks = Array.from(new Set((state.checklistMarks || []).map((mark) => {
        if (!String(mark).startsWith("usNpsUnits:")) return mark;
        migrated = true;
        return `usNationalParks:${String(mark).slice("usNpsUnits:".length)}`;
      })));
      places.forEach((place) => {
        if (place.checklistKey !== "usNpsUnits") return;
        place.checklistKey = "usNationalParks";
        migrated = true;
      });
      if (migrated) {
        checklistStatusCache.signature = "";
        if (fullStateLoaded) saveStateSoon();
      }
    })
    .catch((error) => {
      console.warn("NPS 园区清单加载失败", error);
      usNpsUnits = [];
      usNpsGroups = [];
      usNpsUnitById = new Map();
      usNpsUnitsByCode = new Map();
      usNpsUnitByMergeName = new Map();
      usNpsUnitByCanonicalPlace = new Map();
      if (legacyUsNationalParkItems.length) checklistCatalog.usNationalParks.items = [...legacyUsNationalParkItems];
    })
    .finally(() => {
      if (document.querySelector('[data-page="achievements"]')?.classList.contains("active")) renderAchievements();
      if (isMapPageActive() && state.mapOverlays?.china5a) scheduleGeoMapRender();
    });
  return usNpsCatalogPromise;
}

function loadUsNpsBoundaries() {
  if (usNpsBoundaryPromise) return usNpsBoundaryPromise;
  usNpsBoundaryPromise = fetchJson("data/us-nps-boundaries.geojson?v=466")
    .then((data) => {
      if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) throw new Error("invalid NPS boundaries");
      usNpsBoundaries = data;
      invalidateMapGeoJsonCacheOnly();
    })
    .catch((error) => {
      console.warn("NPS 园区边界加载失败", error);
      usNpsBoundaries = null;
    })
    .finally(() => {
      if (isMapPageActive() && state.mapOverlays?.china5a) scheduleGeoMapRender();
    });
  return usNpsBoundaryPromise;
}

function loadChinaAncientCapitals() {
  if (chinaAncientCapitalsPromise) return chinaAncientCapitalsPromise;
  chinaAncientCapitalsPromise = fetchJson("data/china-ancient-capitals.json")
    .then((data) => {
      const items = Array.isArray(data?.items) ? data.items : [];
      if (!items.length) throw new Error("invalid ancient capitals catalog");
      chinaAncientCapitals = data;
      chinaAncientCapitalCoordinates = {};
      chinaAncientCapitalMeta = {};
      const mergedSiteByCoordinate = new Map();
      const recordItems = Array.isArray(data.recordItems) && data.recordItems.length ? data.recordItems : [];
      checklistCatalog.chinaAncientCapitals.items = (recordItems.length ? recordItems : items).map((item) => item.name);
      items.forEach((item) => {
        if (!item?.name || !Number.isFinite(item.lat) || !Number.isFinite(item.lng)) return;
        const coords = [item.lat, item.lng, "中国"];
        chinaAncientCapitalCoordinates[item.name] = coords;
        const mergedMeta = {
          ...item,
          siteKey: item.siteKey || `ancient-site:${canonicalPlaceKey(item.sourceSite || item.name)}`,
          isMergedSite: true,
        };
        chinaAncientCapitalMeta[canonicalPlaceKey(item.name)] = mergedMeta;
        mergedSiteByCoordinate.set(ancientCapitalCoordinateKey(item.lng, item.lat), mergedMeta);
      });
      recordItems.forEach((item) => {
        if (!item?.name) return;
        const mergedSite = Number.isFinite(item.lng) && Number.isFinite(item.lat)
          ? mergedSiteByCoordinate.get(ancientCapitalCoordinateKey(item.lng, item.lat))
          : null;
        const normalizedItem = mergedSite ? {
          ...item,
          siteKey: mergedSite.siteKey,
          currentKey: mergedSite.currentKey || mergedSite.siteKey,
          currentPlace: ancientCapitalCurrentDisplayName(mergedSite),
        } : item;
        if (Number.isFinite(item.lat) && Number.isFinite(item.lng)) {
          chinaAncientCapitalCoordinates[item.name] = [item.lat, item.lng, "中国"];
        }
        chinaAncientCapitalMeta[canonicalPlaceKey(item.name)] = normalizedItem;
      });
    })
    .catch((error) => {
      console.warn("中国古都清单加载失败", error);
      chinaAncientCapitals = {};
      chinaAncientCapitalCoordinates = {};
      chinaAncientCapitalMeta = {};
      checklistCatalog.chinaAncientCapitals.items = [];
    })
    .finally(() => {
      checklistOverlayCache.signature = "";
      if (isMapPageActive() && state.mapOverlays?.chinaAncientCapitals) scheduleGeoMapRender();
    });
  return chinaAncientCapitalsPromise;
}

function getMapCountries() {
  const dynamicCountries = Array.from(new Set(places.map((place) => place.country)))
    .filter((countryId) => countryId && !countries.some((country) => country.id === countryId))
    .map((countryId) => getCountry(countryId));
  return [...countries, ...dynamicCountries];
}

function countryGeoJson() {
  if (boundaryData.country) {
    const visited = uniqueVisitedCountries();
    return groupedCountryGeoJson(({ countryId }) => countryId && countryHasSyncedBackground(countryId, visited), "country", (countryId) => bestDepthForCountry(countryId));
  }

  return {
    type: "FeatureCollection",
    features: getMapCountries()
      .filter((country) => country.bbox && countryHasSyncedBackground(country.id, uniqueVisitedCountries()))
      .map((country) => {
        const displayCountryId = countryCoverageId(country.id);
        const depth = bestDepthForCountry(displayCountryId);
        const custom = customBoundaryFor("country", country.id);
        return custom ? { ...custom, properties: { ...custom.properties, id: displayCountryId, sourceCountryId: country.id, name: getCountry(displayCountryId).name, depth, kind: "country" } } : null;
      })
      .filter(Boolean),
  };
}

function allCountryClickGeoJson() {
  if (!boundaryData.country) return { type: "FeatureCollection", features: [] };
  return groupedCountryGeoJson(({ countryId }) => countryId, "country-click", (countryId) => bestDepthForCountry(countryId));
}

function groupedCountryGeoJson(filterFn, kind, depthFn) {
  const grouped = new Map();
  boundaryData.country.features
    .map((feature) => ({ feature, countryId: countryIdFromFeature(feature) }))
    .filter(filterFn)
    .forEach(({ feature, countryId }) => {
      const displayCountryId = countryCoverageId(countryId);
      if (!displayCountryId || displayCountryId === "imported") return;
      if (!grouped.has(displayCountryId)) grouped.set(displayCountryId, { sourceIds: [], polygons: [] });
      const group = grouped.get(displayCountryId);
      group.sourceIds.push(countryId);
      group.polygons.push(...geometryToPolygons(feature.geometry));
    });
  return {
    type: "FeatureCollection",
    features: Array.from(grouped.entries()).map(([displayCountryId, group]) => {
      const country = getCountry(displayCountryId);
      return {
        type: "Feature",
        properties: { id: displayCountryId, sourceCountryIds: group.sourceIds.join(","), name: country.name, depth: depthFn(displayCountryId), kind },
        geometry: { type: "MultiPolygon", coordinates: group.polygons },
      };
    }),
  };
}

function adminCountryContextGeoJson(countriesWithDetail = null) {
  if (!boundaryData.country) return { type: "FeatureCollection", features: [] };
  const adminKeys = new Set(adminBoundaryKeysToShow());
  const countriesWithAdmin = countriesWithDetail || new Set(Array.from(adminKeys).map(countryIdForRegionKey).filter(Boolean));
  const visited = uniqueVisitedCountries();
  return {
    type: "FeatureCollection",
    features: boundaryData.country.features
      .map((feature) => ({ feature, countryId: countryIdFromFeature(feature) }))
      .filter(({ countryId }) => countryId && visited.has(countryCoverageId(countryId)) && !countriesWithAdmin.has(countryCoverageId(countryId)))
      .map(({ feature, countryId }) => {
        const displayCountryId = countryCoverageId(countryId);
        const country = getCountry(displayCountryId);
        return {
          ...feature,
          properties: { ...feature.properties, id: displayCountryId, sourceCountryId: countryId, name: country.name, depth: 0, kind: "country-context" },
        };
      }),
  };
}

function mapBackgroundContextGeoJson() {
  if (!boundaryData.country) return { type: "FeatureCollection", features: [] };
  const visited = uniqueVisitedCountries();
  if (!visited.size) return { type: "FeatureCollection", features: [] };
  const grouped = new Map();
  boundaryData.country.features
    .map((feature) => ({ feature, countryId: countryIdFromFeature(feature) }))
    .filter(({ countryId }) => countryId && countryHasSyncedBackground(countryId, visited))
    .forEach(({ feature, countryId }) => {
      const displayCountryId = countryCoverageId(countryId);
      if (!grouped.has(displayCountryId)) grouped.set(displayCountryId, { sourceIds: [], polygons: [] });
      const group = grouped.get(displayCountryId);
      group.sourceIds.push(countryId);
      group.polygons.push(...geometryToPolygons(feature.geometry));
    });
  return {
    type: "FeatureCollection",
    features: Array.from(grouped.entries()).map(([displayCountryId, group]) => {
      const country = getCountry(displayCountryId);
      return {
        type: "Feature",
        properties: { id: displayCountryId, sourceCountryIds: group.sourceIds.join(","), name: country.name, depth: 0, kind: "country-background" },
        geometry: { type: "MultiPolygon", coordinates: group.polygons },
      };
    }),
  };
}

function countryHasSyncedBackground(countryId, visitedCountries) {
  if (visitedCountries.has(countryCoverageId(countryId))) return true;
  return false;
}

function countryIdForRegionKey(key) {
  if (boundaryIndex) {
    const normalized = countryCoverageId(key);
    return hasBoundaryLayer(normalized, "province") ? normalized : "";
  }
  const mapped = { china: "cn", us: "us", japan: "jp" }[key] || "";
  if (mapped) return mapped;
  const normalized = countryCoverageId(key);
  return hasDrawableProvinceBoundary(normalized) ? normalized : "";
}

function countryIdForSubadminKey(key) {
  if (boundaryIndex) {
    const normalized = countryCoverageId(key);
    return hasBoundaryLayer(normalized, "city") ? normalized : "";
  }
  const mapped = subadminConfigs[key]?.countryId || "";
  if (mapped) return mapped;
  const normalized = countryCoverageId(key);
  return boundaryIndex?.countries?.[normalized]?.city ? normalized : "";
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
  const features = importedShapeGeoJson().features
    .filter((feature) => ["LineString", "MultiLineString"].includes(feature.geometry?.type) && feature.properties.id !== editingMapPathId);
  if (mapPathMode && pendingMapPath.length >= 2) {
    features.push({ type: "Feature", properties: { name: t("addMapPath"), draft: true }, geometry: { type: "LineString", coordinates: pendingMapPath.map((point) => [...point]) } });
  }
  if (mapPathMode) {
    pendingMapPath.forEach((point, index) => features.push({
      type: "Feature",
      properties: { name: `${t("mapPathPoints")} ${index + 1}`, draftVertex: true, vertexIndex: index, selected: selectedMapPathVertexIndices.has(index) },
      geometry: { type: "Point", coordinates: [...point] },
    }));
  }
  return {
    type: "FeatureCollection",
    features,
  };
}

function importedPolygonGeoJson() {
  return {
    type: "FeatureCollection",
    features: importedShapeGeoJson().features
      .filter((feature) => ["Polygon", "MultiPolygon"].includes(feature.geometry?.type)),
  };
}

function flightRouteGeoJson() {
  const groups = new Map();
  sanitizeFlights(state.flights || []).forEach((flight) => {
    const from = findAirport(flight.fromAirport);
    const to = findAirport(flight.toAirport);
    if (!from || !to) return;
    const key = flightRouteKey(flight);
    if (!groups.has(key)) groups.set(key, { key, from, to, flights: [] });
    groups.get(key).flights.push(flight);
  });
  return {
    type: "FeatureCollection",
    features: Array.from(groups.values()).map((group) => {
      const count = group.flights.length;
      const title = `${flightRouteEndpointName(group.from)} ⇄ ${flightRouteEndpointName(group.to)}`;
      return {
        type: "Feature",
        properties: {
          id: group.key,
          name: title,
          count,
          width: flightRouteWidth(count),
          opacity: flightRouteOpacity(count),
        },
        geometry: splitAntimeridian(greatCircleLine(group.from, group.to)),
      };
    }),
  };
}

function totalImportedPathLengthKm() {
  return importedPathGeoJson().features.reduce((total, feature) => total + geometryLineLengthKm(feature.geometry), 0);
}

function flightStatsSummary() {
  const flights = sanitizeFlights(state.flights || []);
  const routeKeys = new Set();
  let totalDistanceKm = 0;
  let totalDurationMinutes = 0;
  flights.forEach((flight) => {
    const from = findAirport(flight.fromAirport);
    const to = findAirport(flight.toAirport);
    totalDurationMinutes += flightDurationMinutes(flight);
    if (from && to) {
      routeKeys.add(flightRouteKey(flight));
      const distance = flight.distanceKm || haversineKm([from.lng, from.lat], [to.lng, to.lat]);
      totalDistanceKm += distance;
    } else if (flight.distanceKm) {
      totalDistanceKm += flight.distanceKm;
    }
  });
  return {
    flights: flights.length,
    routes: routeKeys.size,
    distanceKm: totalDistanceKm,
    durationMinutes: totalDurationMinutes,
  };
}

function flightDurationMinutes(flight) {
  const parseTime = (value) => {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
  };
  const from = parseTime(flight.fromTime);
  const to = parseTime(flight.toTime);
  if (from === null || to === null) return 0;
  let duration = to - from;
  if (duration < 0) duration += 24 * 60;
  return duration;
}

function invalidateDerivedStatsCache() {
  derivedStatsRevision += 1;
  dashboardStatsCache.signature = "";
  dashboardStatsCache.stats = null;
}

function dashboardStatsSignature() {
  const coverage = state.coverage || {};
  const coverageSignature = [
    ...(coverage.countries || []).map(countryCoverageId).sort(),
    ...Object.entries(coverage.regions || {}).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, values]) => `${key}:${(values || []).slice().sort().join(",")}`),
    ...Object.entries(coverage.subregions || {}).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, values]) => `${key}:${(values || []).slice().sort().join(",")}`),
  ].join("|");
  return [
    derivedStatsRevision,
    places.length,
    (state.visits || []).map((visit) => `${visit.placeId}:${visit.depth || 0}`).sort().join("|"),
    (state.flights || []).length,
    (state.flightImports || []).length,
    (state.checklistMarks || []).slice().sort().join("|"),
    coverageSignature,
    china5aCatalogStatus.total || "",
    worldHeritageCatalogStatus.total || "",
  ].join("|");
}

function dashboardStats() {
  const signature = dashboardStatsSignature();
  if (dashboardStatsCache.signature === signature && dashboardStatsCache.stats) return dashboardStatsCache.stats;
  const visited = visitedPlaces();
  const imported = places.filter((place) => place.imported || place.importId || place.sourceFile);
  const importedShapes = imported.filter((place) => place.shapeOnly);
  const importedPoints = imported.filter((place) => !place.shapeOnly);
  const visitedIds = new Set(state.visits.map((visit) => visit.placeId));
  const litAdministrativeUnits = visited.filter((visit) => visit.place.manualCountry || visit.place.manualAdmin);
  const litPlaces = visited.filter((visit) => !visit.place.shapeOnly && !visit.place.manualCountry && !visit.place.manualAdmin);
  const flightStats = flightStatsSummary();
  const stats = {
    places: places.length,
    visits: state.visits.length,
    visitedPlaces: visitedIds.size,
    litPlaces: litPlaces.length,
    litAdministrativeUnits: litAdministrativeUnits.length,
    visitedPointCount: visited.filter((visit) => !visit.place.shapeOnly && !visit.place.manualAdmin && !visit.place.manualCountry).length,
    importedObjects: imported.length,
    importedPoints: importedPoints.length,
    importedShapes: importedShapes.length,
    pathLengthKm: totalImportedPathLengthKm(),
    flights: flightStats.flights,
    flightRoutes: flightStats.routes,
    flightDistanceKm: flightStats.distanceKm,
    flightDurationMinutes: flightStats.durationMinutes,
    countries: uniqueVisitedCountries().size,
    chinaRegions: countVisitedRegions("china"),
    chinaSubregions: countVisitedSubregions("china2"),
    chinaSubregionTotal: chinaPrefectureTotal(),
    usRegions: countVisitedRegions("us"),
    japanRegions: countVisitedRegions("japan"),
    japanPrefectures: countVisitedSubregions("japanPref"),
    china5aDone: checklistDoneCount("china5a"),
    china5aTotal: checklistTotalCount("china5a"),
    worldHeritageDone: checklistDoneCount("worldHeritage"),
    worldHeritageTotal: checklistTotalCount("worldHeritage"),
  };
  dashboardStatsCache = { signature, stats };
  return stats;
}

function geometryLineLengthKm(geometry) {
  if (!geometry) return 0;
  if (geometry.type === "LineString") return lineLengthKm(geometry.coordinates);
  if (geometry.type === "MultiLineString") return geometry.coordinates.reduce((total, line) => total + lineLengthKm(line), 0);
  return 0;
}

function lineLengthKm(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return 0;
  let total = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    total += haversineKm(coordinates[index - 1], coordinates[index]);
  }
  return total;
}

function haversineKm(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right)) return 0;
  const [lng1, lat1] = left.map(Number);
  const [lng2, lat2] = right.map(Number);
  if (![lng1, lat1, lng2, lat2].every(Number.isFinite)) return 0;
  const radiusKm = 6371;
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bboxCenter(bbox) {
  if (!Array.isArray(bbox) || bbox.length < 4) return null;
  return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
}

function unifiedBoundaryFeatures(layer, kind) {
  const countriesToShow = boundaryDetailCountries();
  return countriesToShow.flatMap((countryId) => {
    if (!hasBoundaryLayer(countryId, layer)) return [];
    const collection = boundaryLayerData[layer]?.[countryId];
    if (!collection?.features?.length) return [];
    return collection.features.map((feature) => {
      const name = localizedBoundaryName(feature);
      if (!name) return null;
      const depth = layer === "province"
        ? (coverageHasRegionForFeature(countryId, feature, name) ? 1 : 0)
        : (coverageHasSubregionForFeature(countryId, feature, name) ? 1 : 0);
      return {
        ...feature,
        properties: {
          ...feature.properties,
          id: `${countryId}-${layer}-${slugify(name)}`,
          name,
          depth,
          kind,
          is_region_group: layer === "province" && Boolean(feature.properties?.grouped_from || feature.properties?.group_field),
          regionKey: countryId,
          countryId,
          count: depth,
        },
      };
    }).filter(Boolean);
  });
}

function unifiedBoundaryGeoJson(layer, kind) {
  return { type: "FeatureCollection", features: unifiedBoundaryFeatures(layer, kind) };
}

function boundaryReferenceGeoJson(countryId, referenceKey, kind) {
  const normalized = countryCoverageId(countryId);
  const collection = boundaryReferenceData[`${normalized}:${referenceKey}`];
  if (!collection?.features?.length) return emptyFeatureCollection();
  return {
    type: "FeatureCollection",
    features: collection.features.map((feature) => {
      const name = localizedBoundaryName(feature);
      return {
        ...feature,
        properties: {
          ...feature.properties,
          id: `${normalized}-${referenceKey}-${slugify(feature.properties?.id || name)}`,
          name,
          depth: 0,
          kind,
          countryId: normalized,
        },
      };
    }),
  };
}

function usCountyReferenceGeoJson() {
  return boundaryReferenceGeoJson("us", "counties", "county-reference");
}

function shouldShowUsCountyReference() {
  return state.boundaryLevel === "subadmin"
    && hasBoundaryReference("us", "counties")
    && subadminBoundaryKeysToShow().includes("us");
}

function unifiedProvinceOutlineGeoJson() {
  return {
    type: "FeatureCollection",
    features: unifiedBoundaryFeatures("province", "region")
      .map((feature) => ({
        type: "Feature",
        properties: {
          id: `${feature.properties.id}-outline`,
          name: feature.properties.name,
          depth: feature.properties.depth,
          kind: "region-outline",
          countryId: feature.properties.countryId,
        },
        geometry: exteriorLineGeometryForFeature(feature),
      }))
      .filter((feature) => feature.geometry.coordinates.length),
  };
}

function provinceOutlineGeoJson() {
  return boundaryIndex ? unifiedProvinceOutlineGeoJson() : groupedRegionOutlineGeoJson();
}

function regionGeoJson() {
  if (boundaryIndex) return unifiedBoundaryGeoJson("province", "region");
  const features = [
    ...adminBoundaryKeysToShow().flatMap((regionKey) => adminFeaturesForRegion(regionKey)),
    ...globalAdmin1GeoJson().features,
  ];
  if (features.length) return { type: "FeatureCollection", features };

  const fallbackFeatures = [];
  adminBoundaryKeysToShow().forEach((regionKey) => {
    const set = regionSets[regionKey];
    set.units.forEach((unit) => {
      const depth = coverageHasRegion(regionKey, unit.name) ? 1 : 0;
      if (!depth) return;
      const properties = {
        depth,
        kind: "region",
        regionKey,
        count: depth,
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
  if (boundaryIndex) return unifiedBoundaryGeoJson("city", "subadmin");
  const configuredSubadminCountries = new Set(Object.keys(subadminConfigs).map(countryIdForSubadminKey));
  return {
    type: "FeatureCollection",
    features: [
      ...subadminBoundaryKeysToShow().flatMap((key) => subadminFeaturesForKey(key)),
      ...regionGeoJson().features.filter((feature) => !configuredSubadminCountries.has(adminRegionCountryId(feature.properties?.regionKey))),
    ],
  };
}

function subadminFeaturesForKey(key) {
  const config = subadminConfigs[key];
  if (!config) return [];
  const sourceFeatures = key === "japanPref"
    ? (boundaryData.admin1?.features || []).filter((feature) => countryIdFromFeature(feature) === "jp")
    : [
      ...(boundaryData[key]?.features || []),
      ...(key === "china2" ? (boundaryData.chinaDirect?.features || []) : []),
      ...(key === "china2" ? (boundaryData.tw2?.features || []) : []),
    ];
  const boundaryFeatures = sourceFeatures.map((feature) => {
    const name = subadminNameFromFeature(feature);
    if (!name) return null;
    const depth = coverageHasSubregionForFeature(key, feature, name) ? 1 : 0;
    return {
      ...feature,
      properties: {
        ...feature.properties,
        id: `${key}-${slugify(name)}`,
        name,
        depth,
        kind: "subadmin",
        regionKey: key,
        countryId: config.countryId,
        count: depth,
      },
    };
  }).filter(Boolean);
  return boundaryFeatures;
}

function adminFeaturesForRegion(regionKey) {
  const countryId = countryIdForRegionKey(regionKey);
  const sourceFeatures = [
    ...chinaSpecialProvinceFeatures(regionKey),
    ...(boundaryData[regionKey]?.features || []),
    ...admin1DisplayCollection().features.filter((feature) => countryIdFromFeature(feature) === countryId),
  ];
  const seen = new Set();
  const features = sourceFeatures.map((feature) => {
    const unit = adminUnitForFeature(regionKey, feature);
    if (!unit) return null;
    const dedupeKey = `${regionKey}-${cleanAdminName(unit.name)}`;
    if (seen.has(dedupeKey)) return null;
    seen.add(dedupeKey);
    const depth = coverageHasRegion(regionKey, unit.name) ? 1 : 0;
    return {
      ...feature,
      properties: {
        ...feature.properties,
        id: `${regionKey}-${slugify(unit.name)}`,
        name: unit.name,
        depth,
        kind: "region",
        regionKey,
        count: depth,
      },
    };
  }).filter(Boolean);
  return features;
}

function chinaSpecialProvinceFeatures(regionKey) {
  if (regionKey !== "china" || !boundaryData.country?.features?.length) return [];
  return boundaryData.country.features.filter((feature) => ["tw", "hk", "mo"].includes(countryIdFromFeature(feature)));
}

function globalAdmin1GeoJson() {
  if (!boundaryData.admin1) return { type: "FeatureCollection", features: [] };
  const specialCountries = new Set(["cn", "us", "jp"]);
  const visited = uniqueVisitedCountries();
  const features = admin1DisplayCollection().features.map((feature) => {
    const countryId = countryIdFromFeature(feature);
    const displayCountryId = countryCoverageId(countryId);
    if (!countryId || specialCountries.has(displayCountryId) || !visited.has(displayCountryId)) return null;
    const name = adminNameFromFeature(feature);
    const depth = coverageHasRegionForFeature(countryId, feature, name) ? 1 : 0;
    return {
      ...feature,
      properties: {
        ...feature.properties,
        id: `${displayCountryId}-${slugify(name)}`,
        name,
        depth,
        kind: "region",
        regionKey: displayCountryId,
        count: depth,
      },
    };
  }).filter(Boolean);
  return { type: "FeatureCollection", features };
}

function adminBoundaryKeysToShow() {
  if (boundaryIndex) return boundaryDetailCountries().filter((countryId) => hasBoundaryLayer(countryId, "province"));
  const visitedKeys = Array.from(uniqueVisitedCountries()).map(regionKeyForCountry).filter(Boolean);
  return Array.from(new Set(visitedKeys));
}

function subadminBoundaryKeysToShow() {
  if (boundaryIndex) return boundaryDetailCountries().filter((countryId) => hasBoundaryLayer(countryId, "city"));
  const visitedKeys = Array.from(uniqueVisitedCountries()).map(subadminKeyForCountry).filter(Boolean);
  return Array.from(new Set(visitedKeys.filter(Boolean)));
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
  const coverageId = countryCoverageId(normalized);
  if (boundaryIndex) return hasBoundaryLayer(coverageId, "province") ? coverageId : "";
  return ["cn", "hk", "mo", "tw"].includes(normalized) ? "china" : normalized === "us" ? "us" : normalized === "jp" ? "japan" : "";
}

function chinaRegionNameForCountryId(countryId) {
  const normalized = normalizeCountry(countryId);
  return { hk: "香港", mo: "澳门", tw: "台湾" }[normalized] || "";
}

function subadminKeyForCountry(countryId) {
  const normalized = normalizeCountry(countryId);
  const coverageId = countryCoverageId(normalized);
  if (boundaryIndex) return hasBoundaryLayer(coverageId, "city") ? coverageId : "";
  if (coverageId && coverageId !== "imported") return coverageId;
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
  const stats = dashboardStats();
  const locale = currentLanguage === "en" ? "en-US" : "zh-CN";
  const formatKm = (value) => value ? `${Math.round(value).toLocaleString(locale)} km` : "0 km";
  const formatDuration = (minutes) => {
    const total = Math.round(minutes || 0);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (currentLanguage === "en") return hours ? `${hours.toLocaleString(locale)} h ${mins} m` : `${mins} m`;
    return hours ? `${hours.toLocaleString(locale)} 小时 ${mins} 分` : `${mins} 分`;
  };
  const regularMetrics = [
    [t("totalCheckins"), stats.visitedPointCount],
    [t("importedPoints"), stats.importedPoints],
    [t("importedTracks"), stats.importedShapes],
    [t("trackLength"), formatKm(stats.pathLengthKm)],
  ];
  const flightMetrics = [
    [currentLanguage === "en" ? "Imported flights" : "已导入航班", stats.flights],
    [currentLanguage === "en" ? "Flight routes" : "航线数量", stats.flightRoutes],
    [currentLanguage === "en" ? "Flight time" : "累计时长", formatDuration(stats.flightDurationMinutes)],
    [currentLanguage === "en" ? "Flight distance" : "飞行里程", formatKm(stats.flightDistanceKm)],
  ];
  const rowHtml = (metrics, className = "") => `<div class="metric-row ${className}">${metrics.map(([label, value]) => `<article class="metric"><strong>${value}</strong><span>${label}</span></article>`).join("")}</div>`;
  $("#metrics").innerHTML = `${rowHtml(regularMetrics)}${rowHtml(flightMetrics, "flight-metric-row")}`;
}

function renderGeoMap() {
  if (location.protocol === "file:") {
    $("#leafletMap").innerHTML = `<div class="map-empty"><strong>请通过本地 HTTP 打开拓界足迹</strong><br>浏览器会拦截 file:// 页面读取 data/*.geojson，所以二级行政区和本地边界不会显示。请在项目目录运行本地服务后访问 http://localhost 对应地址。</div>`;
    return;
  }
  if (window.maplibregl) {
    renderMapLibreMap();
    return;
  }

  if (!window.L) {
    $("#leafletMap").innerHTML = `<div class="map-empty">MapLibre/Leaflet 未加载。请检查网络是否能访问 unpkg.com。</div>`;
    return;
  }

  if (!leafletMap) {
    const savedViewport = normalizeMapViewport(state.mapViewport);
    leafletMap = L.map("leafletMap", {
      worldCopyJump: true,
      minZoom: 1,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    }).setView([savedViewport?.center?.[1] ?? 25, savedViewport?.center?.[0] ?? 20], savedViewport?.zoom ?? 2);

    leafletMap.on("moveend zoomend", rememberMapViewportSoon);
    leafletMap.on("click", (event) => {
      handleMapCanvasClick(event.latlng.lng, event.latlng.lat, event.originalEvent);
    });
    L.control.scale({ imperial: false, metric: true, maxWidth: 120, position: "bottomright" }).addTo(leafletMap);
    applyLeafletProvider();
  } else {
    applyLeafletProvider();
  }

  renderLeafletLayers();
  setTimeout(() => {
    leafletMap.invalidateSize();
    leafletDidInitialFit = true;
  }, 80);
}

function applyLeafletProvider() {
  if (!leafletMap || !window.L) return;
  const providerId = activeMapProvider();
  if (leafletBaseLayer?._travelMapProvider === providerId) return;
  if (leafletBaseLayer) leafletMap.removeLayer(leafletBaseLayer);
  const provider = mapProviders[providerId] || mapProviders.osm;
  leafletBaseLayer = providerId.startsWith("bing")
    ? new (L.TileLayer.extend({
      getTileUrl(coords) {
        return bingTileUrl(providerId === "bingAerial" ? "aerial" : "road", coords.z, coords.x, coords.y);
      },
    }))("", { maxZoom: 18, updateWhenZooming: false, attribution: provider.attribution, opacity: normalizeMapBaseOpacity(state.mapBaseOpacity) / 100 })
    : L.tileLayer(provider.tiles[0], {
      maxZoom: 18,
      updateWhenZooming: false,
      attribution: provider.attribution,
      opacity: normalizeMapBaseOpacity(state.mapBaseOpacity) / 100,
    });
  leafletBaseLayer._travelMapProvider = providerId;
  leafletBaseLayer.addTo(leafletMap);
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

function scheduleGeoMapRender() {
  if (pendingGeoMapRender) return;
  pendingGeoMapRender = window.requestAnimationFrame(() => {
    pendingGeoMapRender = null;
    if (isMapPageActive()) renderGeoMap();
  });
}

function renderMapLibreMap() {
  const savedViewport = normalizeMapViewport(state.mapViewport);
  const center = savedViewport?.center || [20, 25];
  const provider = activeMapProvider();

  if (!mapLibreMap) {
    setLoadingDebug("使用 MapLibre 显示底图", "pending");
    mapLibreMap = new maplibregl.Map({
      container: "leafletMap",
      center,
      zoom: savedViewport?.zoom ?? 2,
      bearing: 0,
      pitch: 0,
      projection: mapLibreProjection(),
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      localIdeographFontFamily: '"Microsoft YaHei", SimHei, "Noto Sans CJK SC", sans-serif',
      attributionControl: true,
      style: mapLibreBaseStyle(provider),
    });
    mapLibreMap.dragRotate?.disable();
    mapLibreMap.touchZoomRotate?.disableRotation();
    mapLibreMap._travelMapProvider = provider;
    mapLibreMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    mapLibreMap.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");
    mapLibreMap.on("click", (event) => {
      if (event.originalEvent?._travelMapHandled) return;
      if (mapAddMode || mapPathMode) {
        handleMapCanvasClick(event.lngLat.lng, event.lngLat.lat, event.originalEvent);
        return;
      }
      const npsLayers = ["us-nps-hit-line", "us-nps-fill"].filter((layerId) => mapLibreMap.getLayer(layerId));
      const selectableNpsFeature = npsLayers.length
        && mapLibreMap.queryRenderedFeatures(event.point, { layers: npsLayers })
          .some((feature) => Boolean(feature.properties?.itemId));
      if (selectableNpsFeature) return;
      handleMapCanvasClick(event.lngLat.lng, event.lngLat.lat, event.originalEvent);
    });
    mapLibreMap.on("moveend", rememberMapViewportSoon);
    mapLibreMap.on("zoomend", rememberMapViewportSoon);
    mapLibreMap.on("load", () => {
      setLoadingDebug("使用 MapLibre 显示底图", "done");
      clearLoadingDebugSoon();
      renderMapLibreLayers();
    });
    mapLibreMap.on("error", () => {
      setLoadingDebug("使用 MapLibre 显示底图", "error");
      clearLoadingDebugSoon();
    });
    return;
  }

  mapLibreMap.dragRotate?.disable();
  mapLibreMap.touchZoomRotate?.disableRotation();
  applyMapLibreProjectionMode();
  applyMapLibreProvider(provider);
  mapLibreMap.resize();
  if (mapLibreMap.isStyleLoaded()) renderMapLibreLayers();
}

function mapLibreProjection() {
  return { type: state.map3d ? "globe" : "mercator" };
}

function currentMapLibreViewport() {
  if (!mapLibreMap) return null;
  const center = mapLibreMap.getCenter();
  return normalizeMapViewport({ center: [center.lng, center.lat], zoom: mapLibreMap.getZoom() });
}

function applyMapLibreProjectionMode() {
  if (!mapLibreMap) return;
  mapLibreMap.dragRotate?.disable();
  mapLibreMap.touchZoomRotate?.disableRotation();
  try {
    mapLibreMap.setProjection?.(mapLibreProjection());
  } catch (error) {
    console.warn("3D globe projection unavailable", error);
  }
  if (mapLibreMap.getBearing?.() !== 0) mapLibreMap.setBearing(0);
  if (mapLibreMap.getPitch?.() !== 0) mapLibreMap.setPitch(0);
}

function applyMap3dToggle(enabled) {
  if (enabled === Boolean(state.map3d)) return;
  state.mapViewport = currentMapLibreViewport() || normalizeMapViewport(state.mapViewport);
  state.map3d = enabled;
  applyMapLibreProjectionMode();
}

function mapLibreBaseStyle(providerId) {
  if (providerId.startsWith("bing")) registerBingMapLibreProtocol();
  const provider = mapProviders[providerId] || mapProviders.osm;
  const style = {
    version: 8,
    projection: mapLibreProjection(),
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      basemap: {
        type: "raster",
        tiles: provider.tiles,
        tileSize: 256,
        attribution: provider.attribution,
      },
    },
    layers: [{ id: "basemap", type: "raster", source: "basemap", paint: { "raster-opacity": normalizeMapBaseOpacity(state.mapBaseOpacity) / 100 } }],
  };
  if (state.map3d) {
    style.sky = {
      "sky-color": "#0f172a",
      "sky-horizon-blend": 0.08,
      "horizon-color": "#dbeafe",
      "horizon-fog-blend": 0.5,
      "fog-color": "#eff6ff",
      "fog-ground-blend": 0.08,
    };
  }
  return style;
}

function applyMapBaseOpacity() {
  const opacity = normalizeMapBaseOpacity(state.mapBaseOpacity) / 100;
  if (leafletBaseLayer?.setOpacity) leafletBaseLayer.setOpacity(opacity);
  if (mapLibreMap?.getLayer("basemap")) mapLibreMap.setPaintProperty("basemap", "raster-opacity", opacity);
}

function applyMapLibreProvider(provider) {
  if (!mapLibreMap || mapLibreMap._travelMapProvider === provider) return;
  mapLibreMap._travelMapProvider = provider;
  mapLibreLayerHandlersBound = { country: false, admin: false, subadmin: false, points: false, paths: false, pathVertices: false, flights: false, nps: false };
  mapLibreSourceDataRefs.clear();
  clearMapLibreMarkers();
  mapLibreMap.setStyle(mapLibreBaseStyle(provider));
  const rerender = () => {
    applyMapLibreProjectionMode();
    renderMapLibreLayersWhenReady();
  };
  mapLibreMap.once("style.load", rerender);
  mapLibreMap.once("styledata", rerender);
  mapLibreMap.once("idle", rerender);
  renderMapLibreLayersWhenReady();
}

function clearMapLibreMarkers() {
  mapLibreMarkers.forEach((marker) => marker.remove());
  mapLibreMarkers = [];
  mapLibreMarkerSignature = "";
}

function renderMapLibreLayersWhenReady(attempt = 0) {
  if (!mapLibreMap) return;
  if (mapLibreMap.isStyleLoaded()) {
    renderMapLibreLayers();
    return;
  }
  if (attempt >= 12) return;
  window.setTimeout(() => renderMapLibreLayersWhenReady(attempt + 1), 120);
}

function setMapLibreSource(id, data) {
  const source = mapLibreMap.getSource(id);
  if (source) {
    if (mapLibreSourceDataRefs.get(id) !== data) source.setData(data);
  } else {
    mapLibreMap.addSource(id, { type: "geojson", data, ...mapLibreSourceOptions(id) });
  }
  mapLibreSourceDataRefs.set(id, data);
}

function mapLibreSourceOptions(id) {
  if (id === "map-points") {
    return {
      maxzoom: 18,
      buffer: 128,
      tolerance: 0.25,
    };
  }
  if (id === "us-nps-boundaries") {
    return {
      maxzoom: 16,
      buffer: 128,
      tolerance: 0.05,
    };
  }
  if (id === "visited-subadmin" || id === "us-county-reference") {
    return {
      maxzoom: 9,
      buffer: 64,
      tolerance: 1.25,
    };
  }
  if (id === "visited-regions" || id === "visited-region-group-outlines" || id === "admin-country-context") {
    return {
      maxzoom: 8,
      buffer: 96,
      tolerance: 0.8,
    };
  }
  if (id === "visited-countries" || id === "country-click" || id === "map-background-context") {
    return {
      maxzoom: 7,
      buffer: 96,
      tolerance: 0.9,
    };
  }
  if (id === "imported-shapes" || id === "imported-paths" || id === "flight-routes") {
    return {
      maxzoom: 12,
      buffer: 128,
      tolerance: 0.35,
    };
  }
  return {
    maxzoom: 10,
    buffer: 128,
    tolerance: 0.5,
  };
}

function cachedMapGeoJson(key, builder) {
  const cacheKey = `${key}:${mapDataVersion}`;
  const cached = mapGeoJsonCache.get(cacheKey);
  if (cached) return cached;
  const data = builder();
  mapGeoJsonCache.set(cacheKey, data);
  if (mapGeoJsonCache.size > 24) mapGeoJsonCache.clear();
  return data;
}

function usNpsUnitDone(unit) {
  if (!unit) return false;
  return isChecklistItemDone("usNationalParks", unit.id);
}

function usNpsDoneCodes() {
  const doneCodes = new Set();
  usNpsUnits.forEach((unit) => {
    if (usNpsUnitDone(unit)) [unit.code, ...(unit.alternateCodes || [])].forEach((code) => doneCodes.add(String(code).toUpperCase()));
  });
  return doneCodes;
}

function usNpsDoneFilterExpression() {
  return ["in", ["get", "code"], ["literal", Array.from(usNpsDoneCodes())]];
}

const usNpsLegacyBoundaryCodeAliases = {
  MALL: "NAMA",
  NACA: "NACE",
  LOSA: "SACN",
};

function usNpsUnitForBoundaryFeature(feature) {
  const boundaryCode = String(feature?.properties?.code || "").toUpperCase();
  const aliasedCode = usNpsLegacyBoundaryCodeAliases[boundaryCode] || boundaryCode;
  const unitsByCode = usNpsUnitsByCode.get(aliasedCode) || [];
  if (unitsByCode.length) return unitsByCode.find((unit) => unit.designation === "National Parks") || unitsByCode[0];
  const nameKey = canonicalPlaceKey(feature?.properties?.name || "");
  return nameKey ? (usNpsUnitByMergeName.get(nameKey) || null) : null;
}

function usNpsBoundaryGeoJson() {
  if (!usNpsBoundaries?.features || !usNpsUnits.length) return emptyFeatureCollection();
  const doneCodes = usNpsDoneCodes();
  return {
    type: "FeatureCollection",
    features: usNpsBoundaries.features.map((feature) => {
      const boundaryCode = String(feature.properties?.code || "").toUpperCase();
      const primary = usNpsUnitForBoundaryFeature(feature);
      const code = String(primary?.code || boundaryCode).toUpperCase();
      return {
        ...feature,
        geometry: filterTinyUsNpsPolygonParts(restoreUsNpsPolygonHoles(feature.geometry)),
        properties: {
          ...(feature.properties || {}),
          boundaryCode,
          code,
          itemId: primary?.id || "",
          entityId: primary ? parkHeritageEntityId("usNationalParks", primary.id) : "",
          name: primary?.name || feature.properties?.name || code,
          location: primary?.location || feature.properties?.location || "",
          done: doneCodes.has(code),
        },
      };
    }),
  };
}

function usNpsRingAreaSquareKm(ring) {
  if (!Array.isArray(ring) || ring.length < 4) return 0;
  let area = 0;
  let latitudeTotal = 0;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    area += Number(ring[previous]?.[0] || 0) * Number(ring[index]?.[1] || 0)
      - Number(ring[index]?.[0] || 0) * Number(ring[previous]?.[1] || 0);
    latitudeTotal += Number(ring[index]?.[1] || 0);
  }
  const meanLatitude = latitudeTotal / ring.length;
  return Math.abs(area / 2) * 111.32 * 111.32 * Math.cos(meanLatitude * Math.PI / 180);
}

function usNpsPointInRing(point, ring) {
  if (!Array.isArray(point) || !Array.isArray(ring)) return false;
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const [x1, y1] = ring[index] || [];
    const [x2, y2] = ring[previous] || [];
    if (![x1, y1, x2, y2].every(Number.isFinite)) continue;
    if ((y1 > point[1]) !== (y2 > point[1]) && point[0] < ((x2 - x1) * (point[1] - y1)) / (y2 - y1) + x1) inside = !inside;
  }
  return inside;
}

function restoreUsNpsPolygonHoles(geometry) {
  if (geometry?.type !== "MultiPolygon" || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) return geometry;
  const polygons = geometry.coordinates.map((coordinates, index) => ({
    coordinates,
    index,
    area: usNpsRingAreaSquareKm(coordinates?.[0]),
    parent: null,
  }));
  polygons.forEach((candidate) => {
    const point = candidate.coordinates?.[0]?.[0];
    if (!point) return;
    candidate.parent = polygons
      .filter((container) => container.area > candidate.area && usNpsPointInRing(point, container.coordinates?.[0]))
      .sort((left, right) => left.area - right.area)[0] || null;
  });
  const coordinates = polygons.filter((polygon) => !polygon.parent).map((polygon) => [
    ...polygon.coordinates,
    ...polygons.filter((candidate) => candidate.parent === polygon).map((candidate) => candidate.coordinates[0]),
  ]);
  return { ...geometry, coordinates };
}

function filterTinyUsNpsPolygonParts(geometry) {
  if (geometry?.type !== "MultiPolygon" || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) return geometry;
  const areas = geometry.coordinates.map((polygon) => usNpsRingAreaSquareKm(polygon?.[0]));
  const largestIndex = areas.indexOf(Math.max(...areas));
  const coordinates = geometry.coordinates.filter((polygon, index) => index === largestIndex || areas[index] >= 0.1);
  return { ...geometry, coordinates };
}

function addMapLibreUsNpsLayers() {
  const doneFilter = usNpsDoneFilterExpression();
  if (!mapLibreMap.getLayer("us-nps-fill")) {
    mapLibreMap.addLayer({
      id: "us-nps-fill",
      type: "fill",
      source: "us-nps-boundaries",
      paint: {
        "fill-color": "#315b46",
        "fill-opacity": 0.08,
      },
    });
  }
  if (!mapLibreMap.getLayer("us-nps-done-fill")) {
    mapLibreMap.addLayer({
      id: "us-nps-done-fill",
      type: "fill",
      source: "us-nps-boundaries",
      filter: doneFilter,
      paint: {
        "fill-color": "#176b4b",
        "fill-opacity": 0.38,
      },
    });
  }
  if (!mapLibreMap.getLayer("us-nps-line")) {
    mapLibreMap.addLayer({
      id: "us-nps-line",
      type: "line",
      source: "us-nps-boundaries",
      paint: {
        "line-color": "#315b46",
        "line-width": 0.9,
        "line-opacity": 0.62,
      },
    });
  }
  if (!mapLibreMap.getLayer("us-nps-done-line")) {
    mapLibreMap.addLayer({
      id: "us-nps-done-line",
      type: "line",
      source: "us-nps-boundaries",
      filter: doneFilter,
      paint: {
        "line-color": "#111111",
        "line-width": 0.9,
        "line-opacity": 0.95,
      },
    });
  }
  if (!mapLibreMap.getLayer("us-nps-hit-line")) {
    mapLibreMap.addLayer({
      id: "us-nps-hit-line",
      type: "line",
      source: "us-nps-boundaries",
      paint: {
        "line-color": "#000000",
        "line-width": 8,
        "line-opacity": 0.01,
      },
    });
  }
}

function ensureMapLibreUsNpsSourceAndLayers() {
  const overlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  if (!mapLibreMap?.isStyleLoaded() || !overlays.china5a || !usNpsBoundaries || !usNpsUnits.length) return false;
  if (!mapLibreMap.getSource("us-nps-boundaries")) {
    setMapLibreSource("us-nps-boundaries", usNpsBoundaryGeoJson());
  }
  addMapLibreUsNpsLayers();
  bindMapLibreUsNpsHandlers();
  return true;
}

function synchronizeUsNpsMapState() {
  if (!state.mapOverlays?.china5a) return false;
  const synchronize = () => {
    if (!isMapPageActive()) return;
    refreshUsNpsBoundaryState();
  };
  renderGeoMap();
  window.requestAnimationFrame(synchronize);
  window.setTimeout(synchronize, 120);
  if (mapLibreMap) mapLibreMap.once("idle", synchronize);
  return true;
}

function bindMapLibreUsNpsHandlers() {
  if (mapLibreLayerHandlersBound.nps || !mapLibreMap.getLayer("us-nps-fill")) return;
  mapLibreLayerHandlersBound.nps = true;
  const handleClick = (event) => {
    if (mapAddMode || mapPathMode) return;
    if (event.originalEvent?._travelMapHandled) return;
    const pointLayers = ["map-points-circle", "map-points-label", "map-points-label-full"].filter((layerId) => mapLibreMap.getLayer(layerId));
    if (pointLayers.length && mapLibreMap.queryRenderedFeatures(event.point, { layers: pointLayers }).length) return;
    const feature = event.features?.[0];
    const itemId = feature?.properties?.itemId;
    if (!itemId) return;
    markMapEventHandled(event);
    renderChecklistMapDetail("usNationalParks", itemId);
    const displayName = checklistItemDisplayName("usNationalParks", itemId);
    document.querySelectorAll(".maplibregl-popup").forEach((popup) => popup.remove());
    new maplibregl.Popup({ offset: 10, closeButton: false })
      .setLngLat(event.lngLat)
      .setHTML(mapPopupHtml(`<strong>${escapeHtml(displayName)}</strong><br>${escapeHtml(feature.properties.location || "")}<br><button class="popup-action" data-checklist-map="usNationalParks" data-item="${escapeHtml(itemId)}" type="button">${isChecklistItemDone("usNationalParks", itemId) ? t("unvisit") : t("markVisited")}</button>`))
      .addTo(mapLibreMap);
  };
  ["us-nps-fill", "us-nps-hit-line"].forEach((layerId) => {
    mapLibreMap.on("click", layerId, handleClick);
    mapLibreMap.on("mouseenter", layerId, () => { mapLibreMap.getCanvas().style.cursor = mapAddMode || mapPathMode ? "crosshair" : "pointer"; });
    mapLibreMap.on("mouseleave", layerId, () => { mapLibreMap.getCanvas().style.cursor = mapAddMode || mapPathMode ? "crosshair" : ""; });
  });
}

function invalidateMapCaches() {
  mapDataVersion += 1;
  mapGeoJsonCache.clear();
  mapLibreSourceDataRefs.clear();
}

function invalidateMapGeoJsonCacheOnly() {
  mapDataVersion += 1;
  mapGeoJsonCache.clear();
}

function invalidateCoverageMapGeoJsonCache() {
  [
    "countries",
    "regions",
    "region-outlines",
    "subadmin",
    "subadmin-country-context",
    "subadmin-province-outlines",
  ].forEach((key) => mapGeoJsonCache.delete(`${key}:${mapDataVersion}`));
}

function invalidateMapPointRenderCache() {
  mapPointRenderRevision += 1;
  mapLibreMarkerSignature = "";
  checklistOverlayCache.signature = "";
  invalidateDerivedStatsCache();
}

function renderMapLibreLayers() {
  const perfStartedAt = perfNow();
  if (!mapLibreMap || !mapLibreMap.isStyleLoaded()) return;
  let perfStageStartedAt = perfStartedAt;
  const overlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };

  setLoadingDebug("渲染地图图层", "pending");
  ensureBoundaryDataForLevel(state.boundaryLevel);
  perfStageStartedAt = logRenderStage("ensure", perfStageStartedAt);
  if (boundaryLevelHasPendingDetailLoads(state.boundaryLevel)) {
    setLoadingDebug("娓叉煋鍦板浘鍥惧眰", "done");
    clearLoadingDebugSoon();
    return;
  }

  removeMapLibreLayer("visited-area-labels");
  removeMapLibreLayer("visited-area-centers");
  removeMapLibreLayer("imported-shapes-line");
  removeMapLibreLayer("imported-shapes-fill");
  removeMapLibreLayer("imported-shapes-path-line");
  removeMapLibreLayer("imported-shapes-path-line-vertices");
  removeMapLibreLayer("flight-routes-line");
  removeMapLibreLayer("visited-regions-line");
  removeMapLibreLayer("visited-regions-fill");
  removeMapLibreLayer("visited-region-group-outlines-line");
  removeMapLibreLayer("us-county-reference-line");
  removeMapLibreLayer("visited-subadmin-line");
  removeMapLibreLayer("visited-subadmin-fill");
  removeMapLibreLayer("map-points-shadow");
  removeMapLibreLayer("map-points-stroke");
  removeMapLibreLayer("map-points-circle");
  removeMapLibreLayer("map-points-label");
  removeMapLibreLayer("map-points-label-full");
  removeMapLibreLayer("admin-country-context-line");
  removeMapLibreLayer("admin-country-context-fill");
  removeMapLibreLayer("map-background-context-line");
  removeMapLibreLayer("map-background-context-fill");
  removeMapLibreLayer("visited-countries-line");
  removeMapLibreLayer("visited-countries-fill");
  removeMapLibreLayer("country-click-fill");
  removeMapLibreSource("visited-area-centers");
  removeMapLibreSource("imported-shapes");
  removeMapLibreSource("imported-paths");
  removeMapLibreSource("flight-routes");
  removeMapLibreSource("visited-regions");
  removeMapLibreSource("visited-region-group-outlines");
  removeMapLibreSource("us-county-reference");
  removeMapLibreSource("visited-subadmin");
  removeMapLibreSource("map-points");
  removeMapLibreSource("admin-country-context");
  removeMapLibreSource("map-background-context");
  removeMapLibreSource("visited-countries");
  removeMapLibreSource("country-click");
  if (!overlays.china5a) {
    removeMapLibreLayer("us-nps-hit-line");
    removeMapLibreLayer("us-nps-line");
    removeMapLibreLayer("us-nps-done-line");
    removeMapLibreLayer("us-nps-done-fill");
    removeMapLibreLayer("us-nps-fill");
    removeMapLibreSource("us-nps-boundaries");
  }
  perfStageStartedAt = logRenderStage("remove", perfStageStartedAt);

  setMapLibreSource("map-background-context", overlays.light ? cachedMapGeoJson("map-background-context", mapBackgroundContextGeoJson) : emptyFeatureCollection());
  addMapLibreFillLayer("map-background-context", "map-background-context-fill", "map-background-context-line", 0.2, 1);
  perfStageStartedAt = logRenderStage("background", perfStageStartedAt);

  if (overlays.light && state.boundaryLevel === "country") {
    setMapLibreSource("country-click", cachedMapGeoJson("country-click", allCountryClickGeoJson));
    addMapLibreClickFillLayer("country-click", "country-click-fill");
    setMapLibreSource("visited-countries", cachedMapGeoJson("countries", countryGeoJson));
    addMapLibreFillLayer("visited-countries", "visited-countries-fill", "visited-countries-line", 0.4, 1.15);
    perfStageStartedAt = logRenderStage("country", perfStageStartedAt);
  }

  if (overlays.light && state.boundaryLevel === "admin") {
    const adminStageStartedAt = perfNow();
    let adminSubstageStartedAt = adminStageStartedAt;
    setMapLibreSource("visited-regions", cachedMapGeoJson("regions", regionGeoJson));
    addMapLibreFillLayer("visited-regions", "visited-regions-fill", "visited-regions-line", 0.4, boundaryIndex ? 0 : 1.4);
    adminSubstageStartedAt = logRenderStage("admin-regions", adminSubstageStartedAt);
    setMapLibreSource("visited-region-group-outlines", cachedMapGeoJson("region-outlines", provinceOutlineGeoJson));
    addMapLibreLineLayer("visited-region-group-outlines", "visited-region-group-outlines-line", 1.55);
    adminSubstageStartedAt = logRenderStage("admin-outlines", adminSubstageStartedAt);
    setMapLibreSource("admin-country-context", cachedMapGeoJson("admin-country-context", adminCountryContextGeoJson));
    addMapLibreFillLayer("admin-country-context", "admin-country-context-fill", "admin-country-context-line", 0.2, 1);
    logRenderStage("admin-context", adminSubstageStartedAt);
    logSlowStep("renderMapLibreLayers:admin-total", adminStageStartedAt, 120);
    perfStageStartedAt = logRenderStage("admin", perfStageStartedAt);
  }

  if (overlays.light && state.boundaryLevel === "subadmin") {
    const subadminStageStartedAt = perfNow();
    let subadminSubstageStartedAt = subadminStageStartedAt;
    const subadminKeys = subadminBoundaryKeysToShow();
    const countriesWithSubadmin = new Set(subadminKeys.map(countryIdForSubadminKey).filter(Boolean));
    if (countriesWithSubadmin.size) {
      setMapLibreSource("admin-country-context", cachedMapGeoJson("subadmin-country-context", () => adminCountryContextGeoJson(countriesWithSubadmin)));
      addMapLibreFillLayer("admin-country-context", "admin-country-context-fill", "admin-country-context-line", 0.2, 1);
    }
    subadminSubstageStartedAt = logRenderStage("subadmin-context", subadminSubstageStartedAt);
    if (subadminKeys.length) {
      setMapLibreSource("visited-subadmin", cachedMapGeoJson("subadmin", subadminGeoJson));
      addMapLibreFillLayer("visited-subadmin", "visited-subadmin-fill", "visited-subadmin-line", 0.4, 0.55);
    }
    subadminSubstageStartedAt = logRenderStage("subadmin-city", subadminSubstageStartedAt);
    if (shouldShowUsCountyReference()) {
      setMapLibreSource("us-county-reference", cachedMapGeoJson("us-county-reference", usCountyReferenceGeoJson));
      addMapLibreReferenceLineLayer("us-county-reference", "us-county-reference-line", 0.32);
    }
    subadminSubstageStartedAt = logRenderStage("subadmin-reference", subadminSubstageStartedAt);
    if (boundaryIndex || subadminKeys.includes("china2")) {
      setMapLibreSource("visited-region-group-outlines", cachedMapGeoJson("subadmin-province-outlines", () => boundaryIndex ? provinceOutlineGeoJson() : adminOutlineGeoJsonForKeys(["china"])));
      addMapLibreLineLayer("visited-region-group-outlines", "visited-region-group-outlines-line", 1.55);
    }
    logRenderStage("subadmin-outlines", subadminSubstageStartedAt);
    logSlowStep("renderMapLibreLayers:subadmin-total", subadminStageStartedAt, 120);
    perfStageStartedAt = logRenderStage("subadmin", perfStageStartedAt);
  }

  setMapLibreSource("imported-shapes", cachedMapGeoJson("imported-polygons", importedPolygonGeoJson));
  addMapLibreFillLayer("imported-shapes", "imported-shapes-fill", "imported-shapes-line", 0.24, 1.5, true);
  if (overlays.paths) {
    setMapLibreSource("imported-paths", cachedMapGeoJson("imported-paths", importedPathGeoJson));
    addMapLibreImportedPathLayer("imported-paths", "imported-shapes-path-line", 3);
  }
  if (overlays.flights) {
    setMapLibreSource("flight-routes", cachedMapGeoJson("flight-routes", flightRouteGeoJson));
    addMapLibreFlightRouteLayer("flight-routes", "flight-routes-line");
    bindMapLibreFlightRouteHandlers();
  }
  if (overlays.china5a && usNpsBoundaries && usNpsUnits.length) {
    ensureMapLibreUsNpsSourceAndLayers();
  }
  perfStageStartedAt = logRenderStage("imports", perfStageStartedAt);
  bindMapLibreLayerHandlers();
  renderMapLibreMarkers(overlays);
  if (overlays.china5a) refreshUsNpsBoundaryState();
  perfStageStartedAt = logRenderStage("bind-points", perfStageStartedAt);
  logSlowStep("renderMapLibreLayers", perfStartedAt);
  setLoadingDebug("渲染地图图层", "done");
  clearLoadingDebugSoon();
}

function refreshMapLibreDataOnly(options = {}) {
  const perfStartedAt = perfNow();
  if (!mapLibreMap || !mapLibreMap.isStyleLoaded()) return false;
  const { updateImports = true, updateMarkers = true } = options;
  const overlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  const needs = ["map-background-context"];
  if (overlays.light && state.boundaryLevel === "country") needs.push("country-click", "visited-countries");
  if (overlays.light && state.boundaryLevel === "admin") needs.push("visited-regions", "visited-region-group-outlines", "admin-country-context");
  if (overlays.light && state.boundaryLevel === "subadmin") {
    needs.push("admin-country-context", "visited-subadmin", "visited-region-group-outlines");
    if (shouldShowUsCountyReference()) needs.push("us-county-reference");
  }
  if (needs.some((id) => !mapLibreMap.getSource(id))) return false;

  setMapLibreSource("map-background-context", overlays.light ? cachedMapGeoJson("map-background-context", mapBackgroundContextGeoJson) : emptyFeatureCollection());

  if (overlays.light && state.boundaryLevel === "country") {
    setMapLibreSource("country-click", cachedMapGeoJson("country-click", allCountryClickGeoJson));
    setMapLibreSource("visited-countries", cachedMapGeoJson("countries", countryGeoJson));
  }

  if (overlays.light && state.boundaryLevel === "admin") {
    setMapLibreSource("visited-regions", cachedMapGeoJson("regions", regionGeoJson));
    setMapLibreSource("visited-region-group-outlines", cachedMapGeoJson("region-outlines", provinceOutlineGeoJson));
    setMapLibreSource("admin-country-context", cachedMapGeoJson("admin-country-context", adminCountryContextGeoJson));
  }

  if (overlays.light && state.boundaryLevel === "subadmin") {
    const subadminKeys = subadminBoundaryKeysToShow();
    const countriesWithSubadmin = new Set(subadminKeys.map(countryIdForSubadminKey).filter(Boolean));
    if (mapLibreMap.getSource("admin-country-context")) {
      setMapLibreSource(
        "admin-country-context",
        countriesWithSubadmin.size
          ? cachedMapGeoJson("subadmin-country-context", () => adminCountryContextGeoJson(countriesWithSubadmin))
          : emptyFeatureCollection(),
      );
    }
    if (mapLibreMap.getSource("visited-subadmin")) {
      setMapLibreSource("visited-subadmin", subadminKeys.length ? cachedMapGeoJson("subadmin", subadminGeoJson) : emptyFeatureCollection());
    }
    if (mapLibreMap.getSource("us-county-reference")) {
      setMapLibreSource(
        "us-county-reference",
        shouldShowUsCountyReference() ? cachedMapGeoJson("us-county-reference", usCountyReferenceGeoJson) : emptyFeatureCollection(),
      );
    }
    if (mapLibreMap.getSource("visited-region-group-outlines")) {
      setMapLibreSource(
        "visited-region-group-outlines",
        boundaryIndex || subadminKeys.includes("china2")
          ? cachedMapGeoJson("subadmin-province-outlines", () => boundaryIndex ? provinceOutlineGeoJson() : adminOutlineGeoJsonForKeys(["china"]))
          : emptyFeatureCollection(),
      );
    }
  }

  if (updateImports && mapLibreMap.getSource("imported-shapes")) {
    setMapLibreSource("imported-shapes", cachedMapGeoJson("imported-polygons", importedPolygonGeoJson));
  }
  if (updateImports && overlays.paths && mapLibreMap.getSource("imported-paths")) {
    setMapLibreSource("imported-paths", cachedMapGeoJson("imported-paths", importedPathGeoJson));
  }
  if (updateImports && overlays.flights && mapLibreMap.getSource("flight-routes")) {
    setMapLibreSource("flight-routes", cachedMapGeoJson("flight-routes", flightRouteGeoJson));
  }
  if (updateMarkers) renderMapLibreMarkers(overlays);
  logSlowStep("refreshMapLibreDataOnly", perfStartedAt);
  return true;
}

function refreshFlightRoutesOnMap() {
  const overlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  if (mapLibreMap && mapLibreMap.isStyleLoaded()) {
    if (!overlays.flights && !mapLibreMap.getSource("flight-routes")) return true;
    const data = overlays.flights ? cachedMapGeoJson("flight-routes", flightRouteGeoJson) : emptyFeatureCollection();
    setMapLibreSource("flight-routes", data);
    if (overlays.flights && !mapLibreMap.getLayer("flight-routes-line")) {
      addMapLibreFlightRouteLayer("flight-routes", "flight-routes-line");
      bindMapLibreFlightRouteHandlers();
    }
    return true;
  }
  if (leafletMap && window.L) {
    renderLeafletLayers();
    return true;
  }
  return false;
}

function renderMapLibreMarkers(overlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) }) {
  const perfStartedAt = perfNow();
  const signature = mapLibreMarkerRenderSignature(overlays);
  if (mapLibreMarkerSignature === signature && mapLibreMap.getLayer("map-points-circle")) return;
  mapLibreMarkerSignature = signature;
  mapLibreMarkers.forEach((marker) => marker.remove());
  mapLibreMarkers = [];
  renderMapLibrePointLayers(overlays);
  logSlowStep("renderMapLibreMarkers", perfStartedAt);
  return;
  if (overlays.checkins) {
    visitedPlaces()
      .filter((visit) =>
        !visit.place.shapeOnly
        && !visit.place.manualAdmin
        && !placeBelongsToActiveChecklistOverlay(visit.place)
        && Number.isFinite(visit.place.lng)
        && Number.isFinite(visit.place.lat)
      )
      .forEach((visit) => {
        const title = mapCheckinTitle(visit.place);
        const subtitle = mapCheckinSubtitle(visit.place);
        const el = document.createElement("button");
        el.className = "maplibre-marker";
        el.style.background = depthColors[1];
        el.title = title;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          event._travelMapHandled = true;
          renderPlaceDetail(visit.place.id);
        });
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([visit.place.lng, visit.place.lat])
          .setPopup(new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(mapPopupHtml(`<strong>${escapeHtml(title)}</strong><br>${escapeHtml(subtitle)}<br><button class="popup-action" data-unvisit="${escapeHtml(visit.place.id)}" type="button">${t("unvisit")}</button>`)))
          .addTo(mapLibreMap);
        mapLibreMarkers.push(marker);
      });
  }
  checklistOverlayPlaces().forEach((entry) => {
    const el = document.createElement("button");
    el.className = `maplibre-marker checklist-marker checklist-${entry.key} ${entry.done ? "done" : ""}`;
    el.title = entry.title || entry.item;
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      event._travelMapHandled = true;
      renderChecklistMapDetail(entry.key, entry.item);
    });
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([entry.lng, entry.lat])
      .setPopup(new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(mapPopupHtml(`<strong>${escapeHtml(entry.title || entry.item)}</strong><br>${escapeHtml(entry.subtitle || checklistLabel(entry.key, checklistCatalog[entry.key]))}<br><button class="popup-action" data-checklist-map="${escapeHtml(entry.key)}" data-item="${escapeHtml(entry.item)}" type="button">${entry.done ? t("unvisit") : t("markVisited")}</button>`)))
      .addTo(mapLibreMap);
    mapLibreMarkers.push(marker);
  });
  logSlowStep("renderMapLibreMarkers", perfStartedAt);
}

function mapLibreMarkerRenderSignature(overlays) {
  const activeKeys = activeChecklistOverlayKeys();
  const checklistSignature = [
    activeKeys.join(","),
    (state.checklistMarks || []).length,
    checklistTotalCount("china5a"),
    checklistTotalCount("usNationalParks"),
    checklistTotalCount("chinaAncientCapitals"),
    checklistTotalCount("chinaHighAltitude"),
    checklistTotalCount("worldHeritage"),
    Object.keys(china5aCoordinates || {}).length,
    Object.keys(chinaAncientCapitalCoordinates || {}).length,
    Object.keys(chinaHighAltitudeCoordinates || {}).length,
    Object.keys(worldHeritageCoordinates || {}).length,
  ].join("#");
  return JSON.stringify({
    language: currentLanguage,
    provider: activeMapProvider(),
    checkins: Boolean(overlays.checkins),
    china5a: Boolean(overlays.china5a),
    chinaAncientCapitals: Boolean(overlays.chinaAncientCapitals),
    worldHeritage: Boolean(overlays.worldHeritage),
    highAltitude: Boolean(overlays.highAltitude),
    revision: mapPointRenderRevision,
    visits: (state.visits || []).length,
    places: places.length,
    checklistSignature,
  });
}

function renderMapLibrePointLayers(overlays) {
  setMapLibreSource("map-points", mapLibrePointGeoJson(overlays));
  addMapLibrePointLayers("map-points");
  bindMapLibrePointHandlers();
}

function mapLibrePointGeoJson(overlays) {
  const features = [];
  if (overlays.checkins) {
    visitedPlaces()
      .filter((visit) =>
        !visit.place.shapeOnly
        && !visit.place.manualAdmin
        && !placeBelongsToActiveChecklistOverlay(visit.place)
        && Number.isFinite(visit.place.lng)
        && Number.isFinite(visit.place.lat)
      )
      .forEach((visit) => {
        const [displayLng, displayLat] = mapDisplayCoordinate(visit.place.lng, visit.place.lat);
        const title = mapCheckinTitle(visit.place);
        const subtitle = mapCheckinSubtitle(visit.place);
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [displayLng, displayLat] },
          properties: {
            kind: "checkin",
            placeId: visit.place.id,
            title,
            subtitle,
            color: depthColors[1],
            stroke: "#111827",
            radius: 4,
            haloOpacity: 0.98,
            shadowOpacity: 0.26,
          },
        });
      });
  }
  checklistOverlayPlaces().forEach((entry) => {
    const [displayLng, displayLat] = mapDisplayCoordinate(entry.lng, entry.lat);
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [displayLng, displayLat] },
      properties: {
        kind: "checklist",
        checklistKey: entry.key,
        item: entry.item,
        entityId: checklistMergeKeyForEntry(entry),
        title: entry.title || entry.item,
        subtitle: entry.subtitle || checklistCatalog[entry.key]?.label || t("checklistFallback"),
        done: Boolean(entry.done),
        color: checklistOverlayColor(entry.key, Boolean(entry.done)),
        stroke: entry.done ? "#111827" : "rgba(17, 24, 39, 0.5)",
        radius: entry.done ? 4 : 3,
        haloOpacity: entry.done ? 0.98 : 0,
        shadowOpacity: entry.done ? 0.18 : 0.1,
      },
    });
  });
  return { type: "FeatureCollection", features };
}

function checklistOverlayColor(key, done = false) {
  if (key === "worldHeritage") return done ? "#3b82f6" : "#60a5fa";
  if (key === "chinaAncientCapitals") return done ? "#a855f7" : "#c084fc";
  if (key === "chinaHighAltitude") return "#f59e0b";
  return done ? "#0f5f51" : "#218a78";
}

function addMapLibrePointLayers(sourceId) {
  if (!mapLibreMap.getLayer("map-points-shadow")) {
    mapLibreMap.addLayer({
      id: "map-points-shadow",
      type: "circle",
      source: sourceId,
      paint: {
        "circle-radius": ["+", ["get", "radius"], 4.6],
        "circle-color": "#0f172a",
        "circle-opacity": ["get", "shadowOpacity"],
        "circle-blur": 0.85,
        "circle-translate": [0, 1.2],
      },
    });
  }
  if (!mapLibreMap.getLayer("map-points-stroke")) {
    mapLibreMap.addLayer({
      id: "map-points-stroke",
      type: "circle",
      source: sourceId,
      paint: {
        "circle-radius": ["+", ["get", "radius"], 3.6],
        "circle-color": "#ffffff",
        "circle-opacity": ["get", "haloOpacity"],
      },
    });
  }
  if (!mapLibreMap.getLayer("map-points-circle")) {
    mapLibreMap.addLayer({
      id: "map-points-circle",
      type: "circle",
      source: sourceId,
      paint: {
        "circle-radius": ["get", "radius"],
        "circle-color": ["get", "color"],
        "circle-stroke-color": "#111827",
        "circle-stroke-width": ["case", ["==", ["get", "done"], false], 0.9, 1.6],
        "circle-opacity": ["case", ["==", ["get", "done"], false], 0.82, 0.96],
      },
    });
  }
  if (!mapLibreMap.getLayer("map-points-label")) {
    mapLibreMap.addLayer({
      id: "map-points-label",
      type: "symbol",
      source: sourceId,
      minzoom: 5,
      maxzoom: 8.5,
      layout: {
        "text-field": ["get", "title"],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 5, 12, 8.5, 14],
        "text-variable-anchor": ["top", "bottom", "left", "right"],
        "text-radial-offset": 0.75,
        "text-max-width": 12,
        "text-padding": 1,
        "text-optional": true,
      },
      paint: {
        "text-color": "#111827",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.05,
        "text-halo-blur": 0.05,
        "text-opacity": ["interpolate", ["linear"], ["zoom"], 4.8, 0, 5, 1],
      },
    });
  }
  if (!mapLibreMap.getLayer("map-points-label-full")) {
    mapLibreMap.addLayer({
      id: "map-points-label-full",
      type: "symbol",
      source: sourceId,
      minzoom: 8.5,
      layout: {
        "text-field": ["get", "title"],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 8.5, 14, 11, 16],
        "text-offset": [0, 1.15],
        "text-anchor": "top",
        "text-max-width": 12,
        "text-padding": 1,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
        "text-optional": true,
      },
      paint: {
        "text-color": "#111827",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.05,
        "text-halo-blur": 0.05,
      },
    });
  }
}

function bindMapLibrePointHandlers() {
  if (mapLibreLayerHandlersBound.points || !mapLibreMap.getLayer("map-points-circle")) return;
  mapLibreLayerHandlersBound.points = true;
  const handlePointClick = (event) => {
    if (event.originalEvent?._travelMapHandled) return;
    markMapEventHandled(event);
    const feature = event.features?.[0];
    if (!feature) return;
    renderMapLibrePointDetail(feature);
    showMapLibrePointPopup(feature, event.lngLat);
  };
  const setPointer = () => {
    mapLibreMap.getCanvas().style.cursor = "pointer";
  };
  const clearPointer = () => {
    mapLibreMap.getCanvas().style.cursor = "";
  };
  ["map-points-circle", "map-points-label", "map-points-label-full"].forEach((layerId) => {
    if (!mapLibreMap.getLayer(layerId)) return;
    mapLibreMap.on("click", layerId, handlePointClick);
    mapLibreMap.on("mouseenter", layerId, setPointer);
    mapLibreMap.on("mouseleave", layerId, clearPointer);
  });
}

function renderMapLibrePointDetail(feature) {
  const props = feature.properties || {};
  if (props.kind === "checkin" && props.placeId) renderPlaceDetail(props.placeId);
  if (props.kind === "checklist" && props.checklistKey && props.item) renderChecklistMapDetail(props.checklistKey, props.item);
}

function showMapLibrePointPopup(feature, lngLat) {
  const props = feature.properties || {};
  const coordinates = feature.geometry?.type === "Point" ? feature.geometry.coordinates : null;
  const popupLngLat = Array.isArray(coordinates)
    && Number.isFinite(coordinates[0])
    && Number.isFinite(coordinates[1])
    ? coordinates
    : lngLat;
  const title = escapeHtml(props.title || "");
  const subtitle = escapeHtml(props.subtitle || "");
  const button = props.kind === "checkin"
    ? `<button class="popup-action" data-unvisit="${escapeHtml(props.placeId)}" type="button">${t("unvisit")}</button>`
    : `<button class="popup-action" data-checklist-map="${escapeHtml(props.checklistKey)}" data-item="${escapeHtml(props.item)}" type="button">${props.done ? t("unvisit") : t("markVisited")}</button>`;
  document.querySelectorAll(".maplibregl-popup").forEach((popup) => popup.remove());
  new maplibregl.Popup({ offset: 12, closeButton: false })
    .setLngLat(popupLngLat)
    .setHTML(mapPopupHtml(`<strong>${title}</strong><br>${subtitle}<br>${button}`))
    .addTo(mapLibreMap);
}

function mapPopupHtml(content) {
  return `<button class="popup-close-button" data-close-popup="1" type="button" aria-label="${currentLanguage === "en" ? "Close popup" : "关闭弹窗"}"></button><div class="popup-body">${content}</div>`;
}

function checklistOverlayPlaces() {
  const perfStartedAt = perfNow();
  const keys = activeChecklistOverlayKeys();
  const signature = [
    keys.join(","),
    currentLanguage,
    mapPointRenderRevision,
    (state.checklistMarks || []).length,
    (state.visits || []).length,
    places.length,
    Object.keys(china5aCoordinates || {}).length,
    Object.keys(chinaAncientCapitalCoordinates || {}).length,
    Object.keys(chinaHighAltitudeCoordinates || {}).length,
    Object.keys(worldHeritageCoordinates || {}).length,
  ].join("#");
  if (checklistOverlayCache.signature === signature) return checklistOverlayCache.items;
  const seen = new Set(visitedPlaces()
    .filter((visit) => Number.isFinite(visit.place.lat) && Number.isFinite(visit.place.lng))
    .flatMap((visit) => [
      canonicalPlaceKey(visit.place.name),
      visit.place.checklistKey ? checklistItemKey(visit.place.checklistKey, visit.place.name, visit.place) : "",
      checklistCanonicalKey(visit.place.name),
      checklistCoordinateKeyForPlace(visit.place),
    ].filter(Boolean)));
  const allOverlayItems = keys.flatMap(checklistOverlayEntriesFor);
  const rawItems = allOverlayItems.map(({ key, item, group, itemKey, legacyKey, title, subtitle }) => {
    const coords = checklistCoordinateFor(item, key === "china5a" ? group : "");
    if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) return null;
    const done = isChecklistItemDone(key, item, group);
    if (seen.has(itemKey) && !done) return null;
    if (seen.has(legacyKey) && !done) return null;
    return { key, item, lat: coords[0], lng: coords[1], done, title, subtitle };
  }).filter(Boolean);
  const items = mergeCanonicalChecklistOverlayItems(rawItems);
  checklistOverlayCache = {
    signature,
    items,
    keySet: new Set(allOverlayItems.flatMap((entry) => [
      entry.itemKey,
      entry.legacyKey,
      checklistCanonicalKey(entry.item),
      checklistMergeKeyForEntry(entry),
      checklistCoordinateKeyForItem(entry.key, entry.item, entry.group || ""),
    ]).filter(Boolean)),
  };
  logSlowStep("checklistOverlayPlaces", perfStartedAt);
  return items;
}

function mergeCanonicalChecklistOverlayItems(items) {
  const merged = new Map();
  items.forEach((entry) => {
    const mergeKey = checklistMergeKeyForEntry(entry) || `${entry.key}:${canonicalPlaceKey(entry.item)}:${entry.lat.toFixed(5)},${entry.lng.toFixed(5)}`;
    const categoryLabel = checklistLabel(entry.key, checklistCatalog[entry.key] || {});
    if (!merged.has(mergeKey)) {
      merged.set(mergeKey, { ...entry, entityId: mergeKey, categoryLabels: [categoryLabel], displayPriority: checklistOverlayDisplayPriority(entry.key) });
      return;
    }
    const existing = merged.get(mergeKey);
    existing.categoryLabels = Array.from(new Set([...(existing.categoryLabels || []), categoryLabel].filter(Boolean)));
    existing.subtitle = existing.categoryLabels.join(" · ");
    const priority = checklistOverlayDisplayPriority(entry.key);
    if (priority < (existing.displayPriority ?? 99)) {
      existing.key = entry.key;
      existing.item = entry.item;
      existing.title = entry.title;
      existing.done = entry.done;
      existing.displayPriority = priority;
    } else if (priority === (existing.displayPriority ?? 99)) {
      existing.done = existing.done || entry.done;
    }
  });
  return Array.from(merged.values()).map(({ categoryLabels, displayPriority, ...entry }) => entry);
}

function checklistOverlayDisplayPriority(key) {
  return {
    china5a: 1,
    usNationalParks: 1,
    worldHeritage: 2,
    chinaAncientCapitals: 3,
    chinaHighAltitude: 4,
  }[key] || 9;
}

function checklistEntryIdentity(key, item, group = "") {
  return `${key}:${group}:${item}`;
}

function npsUnitForChecklistEntry(key, item) {
  if (key === "usNationalParks") return usNpsUnitById.get(String(item || "")) || null;
  if (key !== "worldHeritage") return null;
  const englishName = worldHeritageItemEnglishName(item);
  const exactEnglishMatch = englishName ? usNpsUnitByMergeName.get(canonicalPlaceKey(englishName)) : null;
  if (exactEnglishMatch) return exactEnglishMatch;
  const canonicalKey = checklistCanonicalKey(item);
  if (!canonicalKey) return null;
  return usNpsUnitByCanonicalPlace.get(canonicalKey) || null;
}

function parkHeritageEntityId(key, item) {
  if (key !== "usNationalParks" && key !== "worldHeritage") return "";
  const npsUnit = npsUnitForChecklistEntry(key, item);
  if (npsUnit) return `nps:${String(npsUnit.id)}`;
  return key === "worldHeritage" ? `wh:${worldHeritageMainKey(item)}` : "";
}

function buildUnifiedParkHeritageIndex() {
  const signature = [
    usNpsUnits.length,
    Object.keys(checklistCatalog.worldHeritage?.byCountry || {}).length,
    Object.keys(worldHeritageEnglishNames || {}).length,
    Object.keys(worldHeritageParentKeys || {}).length,
  ].join(":");
  if (unifiedParkHeritageIndex.signature === signature) return unifiedParkHeritageIndex;
  const byEntity = new Map();
  const byEntry = new Map();
  ["usNationalParks", "worldHeritage"].forEach((catalogKey) => {
    checklistOverlayEntriesFor(catalogKey).forEach((entry) => {
      const entityId = parkHeritageEntityId(entry.key, entry.item);
      if (!entityId) return;
      const normalized = { ...entry, entityId };
      const entries = byEntity.get(entityId) || [];
      if (!entries.some((candidate) => candidate.key === entry.key && candidate.item === entry.item)) entries.push(normalized);
      byEntity.set(entityId, entries);
      byEntry.set(checklistEntryIdentity(entry.key, entry.item, entry.group || ""), entityId);
      byEntry.set(checklistEntryIdentity(entry.key, entry.item, ""), entityId);
    });
  });
  unifiedParkHeritageIndex = { signature, byEntity, byEntry };
  unifiedParkHeritageDoneCache = { signature: "", values: new Map() };
  return unifiedParkHeritageIndex;
}

function invalidateUnifiedParkHeritageIndex() {
  unifiedParkHeritageIndex = { signature: "", byEntity: new Map(), byEntry: new Map() };
  unifiedParkHeritageDoneCache = { signature: "", values: new Map() };
}

function checklistMergeKeyForEntry(entry) {
  const entityId = parkHeritageEntityId(entry.key, entry.item);
  if (entityId) return entityId;
  return checklistCanonicalKey(entry.item)
    || checklistCoordinateKeyForItem(entry.key, entry.item, entry.group || "")
    || "";
}

function relatedChecklistEntriesForItem(key, item, group = "") {
  if (key !== "usNationalParks" && key !== "worldHeritage") return [];
  const index = buildUnifiedParkHeritageIndex();
  const entityId = index.byEntry.get(checklistEntryIdentity(key, item, group)) || parkHeritageEntityId(key, item);
  return entityId ? (index.byEntity.get(entityId) || []) : [];
}

function checklistRelatedDetailRows(key, item, group = "") {
  const related = relatedChecklistEntriesForItem(key, item, group);
  if (related.length < 2) return "";
  const rowLabel = (zh, en) => currentLanguage === "en" ? en : zh;
  const pairs = Array.from(new Set(related.map((entry) => {
    const listLabel = checklistLabel(entry.key, checklistCatalog[entry.key] || {});
    const itemLabel = entry.title || checklistItemDisplayName(entry.key, entry.item);
    return [listLabel, itemLabel].filter(Boolean).join(" - ");
  }).filter(Boolean)));
  const chips = (values) => `<span class="tag-row map-detail-tags">${values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("")}</span>`;
  return `
      <div><dt>${rowLabel("关联条目", "Linked items")}</dt><dd>${chips(pairs)}</dd></div>`;
}

function relatedChecklistRemovalKeys(key, item, group = "") {
  const entries = [
    { key, item, group, itemKey: checklistItemKey(key, item, group), legacyKey: canonicalPlaceKey(item) },
    ...relatedChecklistEntriesForItem(key, item, group),
  ];
  const raw = new Set();
  const normalized = new Set();
  const addKey = (value) => {
    if (!value) return;
    raw.add(value);
    normalized.add(canonicalPlaceKey(value));
  };
  entries.forEach((entry) => {
    [
      entry.itemKey,
      entry.legacyKey,
      checklistCanonicalKey(entry.item),
      checklistCoordinateKeyForItem(entry.key, entry.item, entry.group || ""),
    ].filter(Boolean).forEach(addKey);
    checklistCanonicalPlaceForItem(entry.item)?.aliases?.forEach(addKey);
  });
  return { raw, normalized };
}

function ambiguousChecklistItemKeys(key) {
  if (key !== "china5a") return new Set();
  const counts = new Map();
  Object.values(checklistCatalog.china5a?.byRegion || {}).forEach((items) => {
    items.forEach((item) => {
      const itemKey = canonicalPlaceKey(item);
      if (itemKey) counts.set(itemKey, (counts.get(itemKey) || 0) + 1);
    });
  });
  return new Set(Array.from(counts.entries()).filter(([, count]) => count > 1).map(([itemKey]) => itemKey));
}

function checklistOverlayEntriesFor(key) {
  const list = checklistCatalog[key] || {};
  if (key === "chinaHighAltitude") {
    return (list.items || []).map((item) => {
      const meta = highAltitudeMetaFor(item);
      const parsed = parseHighAltitudeItem(checklistItemDisplayName(key, item));
      const titleParts = [parsed.name, parsed.point, parsed.altitudeText].filter(Boolean);
      const title = titleParts.join(" · ");
      const subtitle = currentLanguage === "en"
        ? countryDisplayName(meta.countryId || "cn")
        : (meta.country || "中国");
      return {
        key,
        group: "",
        item,
        itemKey: checklistItemKey(key, item),
        legacyKey: canonicalPlaceKey(item),
        title,
        subtitle,
      };
    });
  }
  if (key === "chinaAncientCapitals" && Array.isArray(chinaAncientCapitals?.items) && chinaAncientCapitals.items.length) {
    return chinaAncientCapitals.items.map((item) => ({
      key,
      group: "",
      item: item.name,
      itemKey: checklistItemKey(key, item.name),
      legacyKey: canonicalPlaceKey(item.name),
      title: ancientCapitalMapTitle(item),
      subtitle: ancientCapitalMapSubtitle(item),
    }));
  }
  if (list.byRegion) {
    return Object.entries(list.byRegion).flatMap(([group, items]) =>
      items.map((item) => ({
        key,
        group,
        item,
        itemKey: checklistItemKey(key, item, group),
        legacyKey: canonicalPlaceKey(item),
        title: checklistItemDisplayName(key, item),
        subtitle: checklistGroupDisplayName(key, group),
      })));
  }
  if (list.byCountry) {
    return Object.entries(list.byCountry).flatMap(([group, items]) =>
      items.map((item) => ({
        key,
        group,
        item,
        itemKey: checklistItemKey(key, item),
        legacyKey: canonicalPlaceKey(item),
        title: checklistItemDisplayName(key, item),
        subtitle: checklistGroupDisplayName(key, group),
      })));
  }
  return (list.items || []).map((item) => ({
    key,
    group: "",
    item,
    itemKey: checklistItemKey(key, item),
    legacyKey: canonicalPlaceKey(item),
    title: checklistItemDisplayName(key, item),
    subtitle: checklistLabel(key, list),
  }));
}

function activeChecklistOverlayKeys() {
  const overlays = state.mapOverlays || {};
  return [
    overlays.china5a ? "china5a" : "",
    overlays.china5a ? "usNationalParks" : "",
    overlays.chinaAncientCapitals ? "chinaAncientCapitals" : "",
    overlays.worldHeritage ? "worldHeritage" : "",
    overlays.highAltitude ? "chinaHighAltitude" : "",
  ].filter(Boolean);
}

function hasAncientCapitalCheckins() {
  return places.some((place) => place.checklistKey === "chinaAncientCapitals");
}

function placeBelongsToActiveChecklistOverlay(place) {
  if (!place) return false;
  const activeKeys = activeChecklistOverlayKeys();
  if (!activeKeys.length) return false;
  if (place.checklistOnly && activeKeys.includes(place.checklistKey)) return true;
  if (place.checklistOnly && place.checklistItemId && usNpsUnitById.has(place.checklistItemId) && activeKeys.includes("usNationalParks")) return true;
  checklistOverlayPlaces();
  const placeKey = canonicalPlaceKey(place.name);
  const exactKey = place.checklistKey ? checklistItemKey(place.checklistKey, place.name, place) : "";
  const npsMergeKey = place.checklistItemId && usNpsUnitById.has(place.checklistItemId)
    ? checklistMergeKeyForEntry({ key: "usNationalParks", item: place.checklistItemId })
    : "";
  const placeMergeKey = place.checklistKey
    ? checklistMergeKeyForEntry({ key: place.checklistKey, item: place.name })
    : "";
  const coordinateKey = checklistCoordinateKeyForPlace(place);
  return checklistOverlayCache.keySet.has(exactKey)
    || checklistOverlayCache.keySet.has(placeKey)
    || (npsMergeKey && checklistOverlayCache.keySet.has(npsMergeKey))
    || (placeMergeKey && checklistOverlayCache.keySet.has(placeMergeKey))
    || (coordinateKey && checklistOverlayCache.keySet.has(coordinateKey));
}

function checklistMapItemsFor(key) {
  return checklistItemsFor(key);
}

function renderChecklistMapDetail(key, item) {
  const done = isChecklistItemDone(key, item);
  const npsUnit = key === "usNationalParks" ? usNpsUnitById.get(item) : null;
  const capitalMeta = key === "chinaAncientCapitals" ? chinaAncientCapitalMeta[canonicalPlaceKey(item)] : null;
  if (capitalMeta) {
    renderAncientCapitalDetail(key, item, capitalMeta, done);
    return;
  }
  $("#mapDetail").classList.remove("hidden");
  resetMapDetailClass();
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">${checklistCatalog[key]?.label || t("checklistFallback")}</p>
    <h3>${escapeHtml(checklistItemDisplayName(key, item))}</h3>
    <dl>
      ${checklistRelatedDetailRows(key, item)}
      ${npsUnit ? `<div><dt>${currentLanguage === "en" ? "Designation" : "类型"}</dt><dd>${escapeHtml(npsUnit.designation)}</dd></div>
      <div><dt>${currentLanguage === "en" ? "Location" : "所在地"}</dt><dd>${escapeHtml(npsUnit.location || t("none"))}</dd></div>
      <div><dt>${currentLanguage === "en" ? "Chinese name" : "中文名来源"}</dt><dd>${escapeHtml(usNpsTranslationSourceLabel(npsUnit.zhNameSource))}</dd></div>
      <div><dt>${currentLanguage === "en" ? "Boundary" : "边界"}</dt><dd>${npsUnit.hasBoundary ? (currentLanguage === "en" ? "Available" : "可显示") : (currentLanguage === "en" ? "Not available" : "暂无")}</dd></div>` : ""}
      <div><dt>${t("status")}</dt><dd>${done ? t("checked") : t("unvisited")}</dd></div>
    </dl>
    <button class="detail-action" data-checklist-map="${escapeHtml(key)}" data-item="${escapeHtml(item)}" type="button">${done ? t("unvisit") : t("markVisited")}</button>`;
}

function renderAncientCapitalDetail(key, item, capitalMeta, done) {
  $("#mapDetail").classList.remove("hidden");
  $("#mapDetail").classList.add("ancient-capital-detail");
  const currentPlace = ancientCapitalCurrentDisplayName(capitalMeta) || item;
  const records = ancientCapitalDetailRecords(capitalMeta);
  const recordsLabel = currentLanguage === "en" ? `${records.length} records` : `${records.length} 条`;
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">${checklistCatalog[key]?.label || t("checklistFallback")}</p>
    <h3>${escapeHtml(currentPlace)}</h3>
    <div class="capital-facts">
      <section>
        <header><strong>${currentLanguage === "en" ? "Capital records" : "都城记录"}</strong><em>${recordsLabel}</em></header>
        ${renderAncientCapitalRecordList(records)}
      </section>
      <section class="capital-meta-line">
        <span>${escapeHtml(capitalMeta.admin || t("none"))}</span>
        <span>${done ? t("checked") : t("unvisited")}</span>
      </section>
    </div>
    <button class="detail-action" data-checklist-map="${key}" data-item="${item}" type="button">${done ? t("unvisit") : t("markVisited")}</button>`;
}

function ancientCapitalDetailRecords(capitalMeta) {
  if (Array.isArray(capitalMeta?.records) && capitalMeta.records.length) {
    return capitalMeta.records.map((record) => ({
      era: ancientCapitalDisplayEra(record["时代"] || capitalMeta.sourceEra || capitalMeta.era),
      ancientName: record["古称"] || capitalMeta.ancientName || capitalMeta.name,
      dynasty: record["政权/国号"] || capitalMeta.dynasty,
      years: ancientCapitalRecordYears(record),
      capitalType: record["都城性质"] || capitalMeta.capitalType,
      confidence: record["置信度"] || capitalMeta.confidence,
    }));
  }
  return [{
    era: ancientCapitalDisplayEra(capitalMeta?.era || capitalMeta?.sourceEra || ancientCapitalPrimaryEra(capitalMeta)),
    ancientName: capitalMeta?.ancientName || capitalMeta?.name,
    dynasty: capitalMeta?.dynasty || compactMapLabelValues(capitalMeta?.dynasties, 2, "、"),
    years: ancientCapitalRecordYears(capitalMeta),
    capitalType: capitalMeta?.capitalType || compactMapLabelValues(capitalMeta?.capitalTypes, 2, "、"),
    confidence: capitalMeta?.confidence,
  }];
}

function ancientCapitalRecordYears(record) {
  const capitalYears = record?.["都城年代（原文）"] || record?.capitalYears || "";
  const regimeYears = record?.["政权年代（原文）"] || record?.regimeYears || "";
  if (capitalYears && regimeYears && capitalYears !== regimeYears) {
    return currentLanguage === "en"
      ? `Capital ${capitalYears}; regime ${regimeYears}`
      : `都城 ${capitalYears}；政权 ${regimeYears}`;
  }
  return capitalYears || regimeYears || "";
}

function renderAncientCapitalRecordList(records) {
  const labels = currentLanguage === "en"
    ? {
      era: "Era",
      ancientName: "Ancient name",
      dynasty: "Regime",
      years: "Years",
      capitalType: "Capital type",
      confidence: "Confidence",
    }
    : {
      era: "朝代",
      ancientName: "古称",
      dynasty: "政权",
      years: "年代",
      capitalType: "都城类型",
      confidence: "置信度",
    };
  return `<div class="ancient-capital-record-list">${records.map((record) => `
    <article class="ancient-capital-record">
      <span><b>${labels.era}</b><em>${escapeHtml(record.era || t("none"))}</em></span>
      <span><b>${labels.ancientName}</b><em>${escapeHtml(record.ancientName || t("none"))}</em></span>
      <span><b>${labels.dynasty}</b><em>${escapeHtml(record.dynasty || t("none"))}</em></span>
      <span class="wide"><b>${labels.years}</b><em>${escapeHtml(record.years || t("none"))}</em></span>
      <span><b>${labels.capitalType}</b><em>${escapeHtml(record.capitalType || t("none"))}</em></span>
      <span><b>${labels.confidence}</b><em>${escapeHtml(record.confidence || t("none"))}</em></span>
    </article>`).join("")}</div>`;
}

function renderCompactValueList(values) {
  const list = (values || []).filter(Boolean);
  if (!list.length) return escapeHtml(t("none"));
  return `<span class="compact-value-list">${list.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</span>`;
}

function bindMapLibreLayerHandlers() {
  if (!mapLibreLayerHandlersBound.pathVertices && mapLibreMap.getLayer("imported-shapes-path-line-vertices")) {
    mapLibreLayerHandlersBound.pathVertices = true;
    mapLibreMap.on("click", "imported-shapes-path-line-vertices", (event) => {
      if (!mapPathMode) return;
      markMapEventHandled(event);
      activateMapPathVertex(Number(event.features?.[0]?.properties?.vertexIndex));
    });
    mapLibreMap.on("mouseenter", "imported-shapes-path-line-vertices", () => {
      if (mapPathMode) mapLibreMap.getCanvas().style.cursor = "pointer";
    });
    mapLibreMap.on("mouseleave", "imported-shapes-path-line-vertices", () => {
      if (mapPathMode) mapLibreMap.getCanvas().style.cursor = "crosshair";
    });
  }
  if (!mapLibreLayerHandlersBound.paths && mapLibreMap.getLayer("imported-shapes-path-line")) {
    mapLibreLayerHandlersBound.paths = true;
    mapLibreMap.on("click", "imported-shapes-path-line", (event) => {
      if (mapAddMode || mapPathMode) return;
      if (event.originalEvent?._travelMapHandled) return;
      const placeId = event.features?.[0]?.properties?.id;
      if (!isEditablePath(getPlace(placeId))) return;
      markMapEventHandled(event);
      editManualPath(placeId);
    });
    mapLibreMap.on("mouseenter", "imported-shapes-path-line", (event) => {
      const placeId = event.features?.[0]?.properties?.id;
      if (isEditablePath(getPlace(placeId))) mapLibreMap.getCanvas().style.cursor = "pointer";
    });
    mapLibreMap.on("mouseleave", "imported-shapes-path-line", () => {
      if (!mapAddMode && !mapPathMode) mapLibreMap.getCanvas().style.cursor = "";
    });
  }
  if (!mapLibreLayerHandlersBound.country && mapLibreMap.getLayer("country-click-fill")) {
    mapLibreLayerHandlersBound.country = true;
    mapLibreMap.on("click", "country-click-fill", (event) => {
      if (mapAddMode || mapPathMode) return;
      if (event.originalEvent?._travelMapHandled || mapEventHitsPoint(event) || mapEventHitsNpsBoundary(event)) return;
      markMapEventHandled(event);
      const feature = event.features?.[0];
      if (feature) handleCountryClick(feature);
    });
    mapLibreMap.on("mouseenter", "country-click-fill", () => {
      mapLibreMap.getCanvas().style.cursor = "pointer";
    });
    mapLibreMap.on("mouseleave", "country-click-fill", () => {
      mapLibreMap.getCanvas().style.cursor = "";
    });
  }
  if (!mapLibreLayerHandlersBound.admin && mapLibreMap.getLayer("visited-regions-fill")) {
    mapLibreLayerHandlersBound.admin = true;
    mapLibreMap.on("click", "visited-regions-fill", (event) => {
      if (mapAddMode || mapPathMode) return;
      if (event.originalEvent?._travelMapHandled || mapEventHitsPoint(event) || mapEventHitsNpsBoundary(event)) return;
      markMapEventHandled(event);
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
      if (mapAddMode || mapPathMode) return;
      if (event.originalEvent?._travelMapHandled || mapEventHitsPoint(event) || mapEventHitsNpsBoundary(event)) return;
      markMapEventHandled(event);
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
  const paintOpacity = ["case", [">", ["get", "depth"], 0], opacity, Math.min(opacity, 0.2)];
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
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": lineColor,
      "line-width": lineWidth,
      "line-opacity": lineOpacity,
    },
  });
}

function addMapLibreClickFillLayer(sourceId, fillId) {
  mapLibreMap.addLayer({
    id: fillId,
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": "#ffffff",
      "fill-opacity": 0.01,
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

function addMapLibreReferenceLineLayer(sourceId, lineId, lineWidth) {
  mapLibreMap.addLayer({
    id: lineId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": "#b45309",
      "line-width": lineWidth,
      "line-opacity": 0.34,
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
      "line-color": "#0000FF",
      "line-width": lineWidth,
      "line-opacity": 0.95,
    },
  });
  mapLibreMap.addLayer({
    id: `${lineId}-vertices`,
    type: "circle",
    source: sourceId,
    filter: ["==", ["get", "draftVertex"], true],
    paint: {
      "circle-radius": ["case", ["==", ["get", "selected"], true], 7, 5],
      "circle-color": ["case", ["==", ["get", "selected"], true], "#f97316", "#ffffff"],
      "circle-stroke-color": ["case", ["==", ["get", "selected"], true], "#7c2d12", "#0000FF"],
      "circle-stroke-width": 2,
    },
  });
}

function addMapLibreFlightRouteLayer(sourceId, lineId) {
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
      "line-color": "#7c3aed",
      "line-width": ["get", "width"],
      "line-opacity": ["get", "opacity"],
    },
  });
}

function bindMapLibreFlightRouteHandlers() {
  if (mapLibreLayerHandlersBound.flights || !mapLibreMap.getLayer("flight-routes-line")) return;
  mapLibreLayerHandlersBound.flights = true;
  mapLibreMap.on("click", "flight-routes-line", (event) => {
    markMapEventHandled(event);
    const props = event.features?.[0]?.properties || {};
    const countText = currentLanguage === "en" ? `${props.count || 0} flights` : `${props.count || 0} 次航班`;
    new maplibregl.Popup({ offset: 12, closeButton: false })
      .setLngLat(event.lngLat)
      .setHTML(mapPopupHtml(`<strong>${escapeHtml(props.name || "")}</strong><br>${escapeHtml(countText)}`))
      .addTo(mapLibreMap);
  });
  mapLibreMap.on("mouseenter", "flight-routes-line", () => {
    mapLibreMap.getCanvas().style.cursor = "pointer";
  });
  mapLibreMap.on("mouseleave", "flight-routes-line", () => {
    mapLibreMap.getCanvas().style.cursor = "";
  });
}

function removeMapLibreLayer(id) {
  if (mapLibreMap.getLayer(id)) mapLibreMap.removeLayer(id);
}

function removeMapLibreSource(id) {
  // Keep parsed GeoJSON sources around so level switching does not force MapLibre
  // to re-ingest large local files such as the global admin1 boundary set.
  void id;
}

function renderLeafletLayers() {
  if (!leafletMap || !window.L) return;
  const overlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  ensureBoundaryDataForLevel(state.boundaryLevel);
  if (leafletLayers) leafletLayers.remove();
  leafletLayers = L.layerGroup().addTo(leafletMap);

  if (overlays.light) {
    L.geoJSON(mapBackgroundContextGeoJson(), {
      style: (feature) => ({ ...leafletBoundaryStyle(feature), fillOpacity: 0.2, weight: 1 }),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.name, { sticky: true });
      },
    }).addTo(leafletLayers);
  }

  if (overlays.light && state.boundaryLevel === "country") {
    L.geoJSON(allCountryClickGeoJson(), {
      style: () => ({ color: "transparent", weight: 0, fillColor: "#ffffff", fillOpacity: 0.01 }),
      onEachFeature: (feature, layer) => {
        layer.on("click", (event) => {
          if (mapAddMode || mapPathMode) return;
          if (event.originalEvent) event.originalEvent._travelMapHandled = true;
          renderCountryDetail(feature.properties.id);
        });
        layer.bindTooltip(feature.properties.name, { sticky: true });
      },
    }).addTo(leafletLayers);
    L.geoJSON(countryGeoJson(), {
      style: leafletBoundaryStyle,
      onEachFeature: (feature, layer) => {
        layer.on("click", (event) => {
          if (mapAddMode || mapPathMode) return;
          if (event.originalEvent) event.originalEvent._travelMapHandled = true;
          renderCountryDetail(feature.properties.id);
        });
        layer.bindTooltip(feature.properties.name, { sticky: true });
      },
    }).addTo(leafletLayers);
  }

  if (overlays.light && state.boundaryLevel === "admin") {
    L.geoJSON(regionGeoJson(), {
      style: (feature) => boundaryIndex ? { ...leafletBoundaryStyle(feature), weight: 0, opacity: 0 } : leafletBoundaryStyle(feature),
      onEachFeature: (feature, layer) => {
        layer.on("click", (event) => {
          if (mapAddMode || mapPathMode) return;
          if (event.originalEvent) event.originalEvent._travelMapHandled = true;
          handleAdminRegionClick(feature);
        });
        layer.bindTooltip(`${feature.properties.name} · ${feature.properties.count} 个地点`, { sticky: true });
      },
    }).addTo(leafletLayers);
    L.geoJSON(provinceOutlineGeoJson(), {
      style: leafletOutlineStyle,
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.name, { sticky: true });
      },
    }).addTo(leafletLayers);
    L.geoJSON(adminCountryContextGeoJson(), {
      style: (feature) => ({ ...leafletBoundaryStyle(feature), fillOpacity: 0.2, weight: 1 }),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.name, { sticky: true });
      },
    }).addTo(leafletLayers);
  }

  if (overlays.light && state.boundaryLevel === "subadmin") {
    const subadminKeys = subadminBoundaryKeysToShow();
    const countriesWithSubadmin = new Set(subadminKeys.map(countryIdForSubadminKey).filter(Boolean));
    if (countriesWithSubadmin.size) {
      L.geoJSON(adminCountryContextGeoJson(countriesWithSubadmin), {
        style: (feature) => ({ ...leafletBoundaryStyle(feature), fillOpacity: 0.2, weight: 1 }),
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(feature.properties.name, { sticky: true });
        },
      }).addTo(leafletLayers);
    }
    if (subadminKeys.length) {
      L.geoJSON(subadminGeoJson(), {
        style: (feature) => ({ ...leafletBoundaryStyle(feature), weight: 0.55 }),
        onEachFeature: (feature, layer) => {
          layer.on("click", (event) => {
            if (mapAddMode || mapPathMode) return;
            if (event.originalEvent) event.originalEvent._travelMapHandled = true;
            handleAdminRegionClick(feature);
          });
          layer.bindTooltip(String(feature.properties.name || ""), { sticky: true });
        },
      }).addTo(leafletLayers);
    }
    if (shouldShowUsCountyReference()) {
      L.geoJSON(usCountyReferenceGeoJson(), {
        style: () => ({ color: "#b45309", weight: 0.35, opacity: 0.34, fillOpacity: 0 }),
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(String(feature.properties.name || ""), { sticky: true });
        },
      }).addTo(leafletLayers);
    }
    if (boundaryIndex || subadminKeys.includes("china2")) {
      L.geoJSON(boundaryIndex ? provinceOutlineGeoJson() : adminOutlineGeoJsonForKeys(["china"]), {
        style: leafletOutlineStyle,
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(feature.properties.name, { sticky: true });
        },
      }).addTo(leafletLayers);
    }
  }

  if (overlays.china5a && usNpsBoundaries && usNpsUnits.length) {
    L.geoJSON(usNpsBoundaryGeoJson(), {
      style: (feature) => ({
        color: feature.properties.done ? "#111111" : "#315b46",
        weight: 0.9,
        opacity: feature.properties.done ? 0.95 : 0.62,
        fillColor: feature.properties.done ? "#d9480f" : "#315b46",
        fillOpacity: feature.properties.done ? 0.28 : 0.08,
      }),
      onEachFeature: (feature, layer) => {
        const itemId = feature.properties.itemId;
        const displayName = itemId
          ? checklistItemDisplayName("usNationalParks", itemId)
          : (feature.properties.name || feature.properties.code);
        layer.bindTooltip(displayName, { sticky: true });
        if (!itemId) return;
        layer.on("click", (event) => {
          if (mapAddMode || mapPathMode) return;
          if (event.originalEvent) event.originalEvent._travelMapHandled = true;
          renderChecklistMapDetail("usNationalParks", itemId);
        });
        layer.bindPopup(mapPopupHtml(`<strong>${escapeHtml(displayName)}</strong><br>${escapeHtml(feature.properties.location || "")}<br><button class="popup-action" data-checklist-map="usNationalParks" data-item="${escapeHtml(itemId)}" type="button">${isChecklistItemDone("usNationalParks", itemId) ? t("unvisit") : t("markVisited")}</button>`), { closeButton: false });
      },
    }).addTo(leafletLayers);
  }

  L.geoJSON(importedPolygonGeoJson(), {
    style: leafletBoundaryStyle,
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.name, { sticky: true });
    },
  }).addTo(leafletLayers);

  if (overlays.paths) {
    L.geoJSON(importedPathGeoJson(), {
      style: () => ({ color: "#0000FF", weight: 3, opacity: 0.95 }),
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius: feature.properties.selected ? 7 : 5,
        color: feature.properties.selected ? "#7c2d12" : "#0000FF",
        weight: 2,
        fillColor: feature.properties.selected ? "#f97316" : "#ffffff",
        fillOpacity: 1,
      }),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.name, { sticky: true });
        if (feature.properties.draftVertex) {
          layer.on("click", (event) => {
            if (event.originalEvent) event.originalEvent._travelMapHandled = true;
            activateMapPathVertex(Number(feature.properties.vertexIndex));
          });
          return;
        }
        if (isEditablePath(getPlace(feature.properties.id))) {
          layer.on("click", (event) => {
            if (event.originalEvent) event.originalEvent._travelMapHandled = true;
            editManualPath(feature.properties.id);
          });
        }
      },
    }).addTo(leafletLayers);
  }

  if (overlays.flights) {
    L.geoJSON(flightRouteGeoJson(), {
      style: (feature) => ({ color: "#7c3aed", weight: feature.properties.width || 2, opacity: feature.properties.opacity || 0.72 }),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(`${feature.properties.name} · ${feature.properties.count} ${currentLanguage === "en" ? "flights" : "次"}`, { sticky: true });
      },
    }).addTo(leafletLayers);
  }

  if (overlays.checkins) {
    visitedPlaces()
      .filter((visit) => !visit.place.shapeOnly && !visit.place.manualAdmin && Number.isFinite(visit.place.lng) && Number.isFinite(visit.place.lat))
      .forEach((visit) => {
        const [displayLng, displayLat] = mapDisplayCoordinate(visit.place.lng, visit.place.lat);
        const title = mapCheckinTitle(visit.place);
        const subtitle = mapCheckinSubtitle(visit.place);
        const marker = L.circleMarker([displayLat, displayLng], {
          radius: 4,
          color: "#111827",
          weight: 2,
          fillColor: depthColors[1],
          fillOpacity: 0.95,
        });
        marker.bindPopup(mapPopupHtml(`<strong>${escapeHtml(title)}</strong><br>${escapeHtml(subtitle)}<br><button class="popup-action" data-unvisit="${escapeHtml(visit.place.id)}" type="button">${t("unvisit")}</button>`), { closeButton: false });
        marker.on("click", (event) => {
          if (event.originalEvent) event.originalEvent._travelMapHandled = true;
          renderPlaceDetail(visit.place.id);
        });
        marker.addTo(leafletLayers);
      });
  }

  checklistOverlayPlaces().forEach((entry) => {
    const [displayLng, displayLat] = mapDisplayCoordinate(entry.lng, entry.lat);
    const marker = L.circleMarker([displayLat, displayLng], {
      radius: entry.done ? 4 : 3,
      color: entry.done ? "#111827" : "rgba(17, 24, 39, 0.5)",
      weight: entry.done ? 2 : 1,
      fillColor: checklistOverlayColor(entry.key, entry.done),
      fillOpacity: entry.done ? 0.96 : 0.82,
    });
    marker.bindTooltip(entry.title || entry.item, { sticky: true });
    marker.bindPopup(mapPopupHtml(`<strong>${escapeHtml(entry.title || entry.item)}</strong><br>${escapeHtml(entry.subtitle || checklistLabel(entry.key, checklistCatalog[entry.key] || {}) || t("checklistFallback"))}<br><button class="popup-action" data-checklist-map="${escapeHtml(entry.key)}" data-item="${escapeHtml(entry.item)}" type="button">${entry.done ? t("unvisit") : t("markVisited")}</button>`), { closeButton: false });
    marker.on("click", (event) => {
      if (event.originalEvent) event.originalEvent._travelMapHandled = true;
      renderChecklistMapDetail(entry.key, entry.item);
    });
    marker.addTo(leafletLayers);
  });

}

function leafletBoundaryStyle(feature) {
  const depth = feature.properties.depth || 0;
  return {
    color: depth ? depthColors[1] : "#b43d16",
    weight: feature.properties.is_region_group ? 0 : 1.2,
    fillColor: depth ? depthColors[1] : depthColors[0],
    fillOpacity: depth ? 0.4 : 0.2,
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
  const normalizedCountryId = countryCoverageId(countryId);
  const visits = visitedPlaces().filter((visit) => countryCoverageId(visit.place.country) === normalizedCountryId);
  const manual = Boolean(manualCountryPlaceFor(countryId));
  const canToggle = !bestDepthForCountry(countryId) || manual;
  const action = canToggle ? `<button class="detail-action" data-country-toggle="${countryId}" type="button">${manual ? t("unvisit") : t("markVisited")}</button>` : "";
  $("#mapDetail").classList.remove("hidden");
  resetMapDetailClass();
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">${t("countryDetail")}</p>
    <h3>${country.name}</h3>
    <dl>
      <div><dt>${t("status")}</dt><dd>${bestDepthForCountry(countryId) ? t("checked") : t("unvisited")}</dd></div>
      <div><dt>${t("evidence")}</dt><dd>${visits.length}</dd></div>
      <div><dt>${t("region")}</dt><dd>${new Set(visits.map((v) => v.place.unit).filter(Boolean)).size}</dd></div>
      <div><dt>${t("worldHeritage")}</dt><dd>${visits.filter((v) => v.place.checklist.includes("世界遗产")).length}</dd></div>
    </dl>
    <div class="tag-row">${visits.map((visit) => `<span class="tag">${visit.place.name}</span>`).join("") || `<span class="tag">${t("noVisitList")}</span>`}</div>
    ${action}`;
}

function handleCountryClick(feature) {
  const countryId = countryCoverageId(feature.properties?.id || countryIdFromFeature(feature));
  if (!countryId || countryId === "imported") return;
  renderCountryDetail(countryId);
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
    recomputeCoverage();
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
  resetMapDetailClass();
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">${t("adminRegion")}</p>
    <h3>${regionName}</h3>
    <dl>
      <div><dt>${t("countryRegion")}</dt><dd>${getCountry(countryId).name}</dd></div>
      <div><dt>${t("status")}</dt><dd>${t("lit")}</dd></div>
      <div><dt>${t("evidence")}</dt><dd>${visits.length} 个地点</dd></div>
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
    recomputeCoverage();
    invalidateMapGeoJsonCacheOnly();
    saveState();
    renderAfterCheckinChange();
    renderAdminRegionDetail(countryId, regionName, adminRegionEvidenceVisits(countryId, regionName, isSubadmin), {
      center,
      isSubadmin,
      manual: false,
    });
    showToast(`${regionName} 已取消点亮`);
    return;
  }

  const realVisits = adminRegionEvidenceVisits(countryId, regionName, isSubadmin);
  if (realVisits.length) {
    renderAdminRegionDetail(countryId, regionName, realVisits, { center, isSubadmin, manual: false });
    return;
  }

  const id = manualAdminPlaceId(countryId, regionName);
  const normalizedCountry = normalizeCountry(countryId);
  const manualUnit = isSubadmin
    ? (normalizedCountry === "jp" ? japanRegionForPrefecture(regionName) : "")
    : regionName;
  places.push({
    id,
    name: `${getCountry(countryId).name} - ${regionName}`,
    country: countryId,
    unit: manualUnit,
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
  upsertVisit(id, 1, { tripId: "manual-admin", save: false });
  recomputeCoverage();
  invalidateMapGeoJsonCacheOnly();
  saveState();
  renderAfterCheckinChange();
  renderAdminRegionDetail(countryId, regionName, adminRegionEvidenceVisits(countryId, regionName, isSubadmin), {
    center,
    isSubadmin,
    manual: true,
  });
  showToast(`${regionName} 已点亮`);
}

function renderAdminRegionDetail(countryId, regionName, visits, options = {}) {
  const center = Array.isArray(options.center) ? options.center : [];
  const canToggle = options.manual || visits.length === 0;
  const displayRegionName = options.isSubadmin ? chinaSubadminDisplayName(regionName) : chinaProvinceDisplayName(regionName);
  const action = canToggle ? `
    <button class="detail-action" data-admin-toggle="1" data-country="${countryId}" data-region="${encodeURIComponent(regionName)}" data-subadmin="${options.isSubadmin ? "1" : "0"}" data-lng="${center[0] ?? ""}" data-lat="${center[1] ?? ""}" type="button">
      ${options.manual ? t("unvisit") : t("markVisited")}
    </button>` : "";
  $("#mapDetail").classList.remove("hidden");
  resetMapDetailClass();
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">${t("adminRegion")}</p>
    <h3>${displayRegionName}</h3>
    <dl>
      <div><dt>${t("countryRegion")}</dt><dd>${getCountry(countryId).name}</dd></div>
      <div><dt>${t("status")}</dt><dd>${options.manual || visits.length ? t("checked") : t("unvisited")}</dd></div>
      <div><dt>${t("evidence")}</dt><dd>${visits.length}</dd></div>
    </dl>
    <div class="tag-row">${visits.map((visit) => `<span class="tag">${visit.place.name}</span>`).join("") || `<span class="tag">${t("noPlaceEvidence")}</span>`}</div>
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

function manualAdminCenter(countryId, regionName, isSubadmin) {
  const normalizedCountry = normalizeCountry(countryId);
  if (normalizedCountry === "cn") {
    return isSubadmin
      ? chinaSubadminUnitsForManualList().find((unit) => sameAdminName(unit.name, regionName))?.center
      : bboxCenter(regionSets.china.units.find((unit) => sameAdminName(unit.name, regionName))?.bbox || []);
  }
  if (normalizedCountry === "jp") {
    if (isSubadmin) {
      const feature = (boundaryData.admin1?.features || []).find((item) =>
        countryIdFromFeature(item) === "jp" && sameAdminName(subadminNameFromFeature(item), regionName)
      );
      return feature ? geometryCenter(feature.geometry) : bboxCenter(japanPrefBboxes[regionName] || []);
    }
    const feature = admin1DisplayCollection().features.find((item) =>
      countryIdFromFeature(item) === "jp" && sameAdminName(adminNameFromFeature(item), regionName)
    );
    return feature ? geometryCenter(feature.geometry) : null;
  }
  return null;
}

function manualCountryPlaceId(countryId) {
  return `manual-country-${slugify(countryCoverageId(countryId))}`;
}

function manualCountryPlaceFor(countryId) {
  const id = manualCountryPlaceId(countryId);
  return places.find((place) => place.id === id || (place.manualCountry && countryCoverageId(place.country) === countryCoverageId(countryId)));
}

function toggleManualCountry(countryId) {
  const normalized = countryCoverageId(countryId);
  if (!normalized || normalized === "imported") return;
  const manual = manualCountryPlaceFor(normalized);
  if (manual) {
    state.visits = state.visits.filter((visit) => visit.placeId !== manual.id);
    places = places.filter((place) => place.id !== manual.id);
    closeMapPopupsAndDetail();
    recomputeCoverage();
    invalidateMapCaches();
    saveState();
    renderAfterCheckinChange();
    showToast(`${getCountry(normalized).name} ${t("unmarkedToast")}`);
    return;
  }

  const country = getCountry(normalized);
  const center = country.bbox ? bboxCenter(country.bbox) : [null, null];
  const id = manualCountryPlaceId(normalized);
  places.push({
    id,
    name: country.name,
    country: normalized,
    unit: "",
    city: "",
    type: "手动点亮国家",
    lat: center?.[1] ?? null,
    lng: center?.[0] ?? null,
    tags: ["国家"],
    checklist: [],
    manualCountry: true,
  });
  state.focusPlaceId = id;
  upsertVisit(id, 1, { tripId: "manual-country" });
  renderAfterCheckinChange();
  showToast(`${country.name} ${t("markedToast")}`);
}

function manualButtonHtml({ label, visited, manual, action, disabled = false }) {
  return `<button class="manual-chip ${visited ? "done" : ""}" ${disabled ? "disabled" : ""} data-manual-action="${action}" type="button">
    <strong>${label}</strong><span>${visited ? manual ? (currentLanguage === "en" ? "Manual" : "手动点亮") : t("lit") : (currentLanguage === "en" ? "Unlit" : "未点亮")}</span>
  </button>`;
}

function renderCheckinsPage() {
  const countryTarget = $("#manualCountryList");
  if (!countryTarget) return;
  const stats = dashboardStats();
  const en = currentLanguage === "en";

  const provinceRows = regionSets.china.units;
  const chinaProvinceText = `${stats.chinaRegions}/${provinceRows.length}`;
  $("#manualChinaProvinceCount").textContent = chinaProvinceText;
  setManualNavButtonLabel("manual-section-china", en ? "China units" : "中国省市");

  const chinaCityText = `${stats.chinaSubregions}/${stats.chinaSubregionTotal}`;
  $("#manualChinaCityCount").textContent = chinaCityText;

  const japanRegionRows = regionSets.japan.units;
  $("#manualJapanRegionCount").textContent = `${stats.japanRegions}/${japanRegionRows.length}`;

  const japanPrefRows = japanPrefectureUnits();
  const japanPrefText = `${stats.japanPrefectures}/${japanPrefRows.length}`;
  $("#manualJapanPrefectureCount").textContent = japanPrefText;
  setManualNavButtonLabel("manual-section-japan", en ? "Japan areas" : "日本区县");

  const usStateText = `${stats.usRegions}/${regionSets.us.total}`;
  $("#manualUsStateCount").textContent = usStateText;
  setManualNavButtonLabel("manual-section-us-states", en ? "U.S. 50 states" : "美国50州");

  const countryText = `${stats.countries}/${worldCountryTotal}`;
  $("#manualCountryCount").textContent = countryText;
  setManualNavButtonLabel("manual-section-country", en ? "Global countries" : "全球国家");
  clearClosedManualSections();
  renderOpenManualSections();
  scheduleManualNavSpy();
}

function setManualNavButtonLabel(targetId, label) {
  const button = document.querySelector(`[data-manual-jump="${targetId}"]`);
  if (button) button.textContent = label;
}

function scheduleManualNavSpy() {
  if (pendingManualNavSpy) return;
  pendingManualNavSpy = window.requestAnimationFrame(() => {
    pendingManualNavSpy = null;
    updateManualNavActiveByScroll();
  });
}

function updateManualNavActiveByScroll() {
  const page = $("#checkins");
  if (!page?.classList.contains("active")) return;
  const nav = page.querySelector(".manual-view-tabs");
  const sections = Array.from(page.querySelectorAll("[data-manual-jump]"))
    .map((button) => ({ button, target: document.getElementById(button.dataset.manualJump) }))
    .filter((item) => item.target);
  if (!nav || !sections.length) return;
  const navBottom = nav.getBoundingClientRect().bottom + 10;
  let active = sections[0];
  sections.forEach((item) => {
    const rect = item.target.getBoundingClientRect();
    if (rect.top <= navBottom && rect.bottom > navBottom) active = item;
    else if (rect.top <= navBottom) active = item;
  });
  sections.forEach((item) => item.button.classList.toggle("active", item === active));
}

function scheduleChecklistNavSpy() {
  if (pendingChecklistNavSpy) return;
  pendingChecklistNavSpy = window.requestAnimationFrame(() => {
    pendingChecklistNavSpy = null;
    updateChecklistNavActiveByScroll();
  });
}

function updateChecklistNavActiveByScroll() {
  const page = $("#achievements");
  if (!page?.classList.contains("active")) return;
  const nav = page.querySelector(".checklist-page-nav");
  const sections = Array.from(page.querySelectorAll("[data-checklist-jump]"))
    .map((button) => ({ button, target: document.getElementById(button.dataset.checklistJump) }))
    .filter((item) => item.target);
  if (!nav || !sections.length) return;
  const navBottom = nav.getBoundingClientRect().bottom + 10;
  let active = sections[0];
  sections.forEach((item) => {
    const rect = item.target.getBoundingClientRect();
    if (rect.top <= navBottom && rect.bottom > navBottom) active = item;
    else if (rect.top <= navBottom) active = item;
  });
  sections.forEach((item) => item.button.classList.toggle("active", item === active));
}

function renderOpenManualSections() {
  document.querySelectorAll("#checkins .manual-section-details[open]").forEach((details) => renderManualSection(details.dataset.manualSection));
}

function clearClosedManualSections() {
  document.querySelectorAll("#checkins .manual-section-details:not([open])").forEach((details) => {
    const target = details.querySelector(".manual-grid, .manual-country-groups, .license-plate-grid");
    if (target) target.innerHTML = "";
  });
}

function renderManualSection(section) {
  if (section === "chinaProvince") {
    $("#manualChinaProvinceList").innerHTML = renderChinaProvinceImageryBadges();
    return;
  }
  if (section === "chinaCity") {
    const cityRows = chinaSubadminUnitsForManualList();
    $("#manualChinaCityList").innerHTML = cityRows.length
      ? renderChinaSubadminGroups(cityRows)
      : `<p class="muted">${currentLanguage === "en" ? "China city boundaries will appear after loading." : "中国地级市边界加载后显示。"}</p>`;
    return;
  }
  if (section === "japanRegion") {
    $("#manualJapanRegionList").innerHTML = renderJapanRegionImageryBadges();
    return;
  }
  if (section === "japanPrefecture") {
    $("#manualJapanPrefectureList").innerHTML = renderJapanPrefectureGroups(japanPrefectureUnits());
    return;
  }
  if (section === "usStates") {
    $("#manualUsStateList").innerHTML = renderUsStateLicensePlates();
    return;
  }
  if (section === "country") {
    const countryRows = manualCountryRows();
    $("#manualCountryCount").textContent = `${dashboardStats().countries}/${countryRows.length}`;
    $("#manualCountryList").innerHTML = renderCountryGroups(countryRows);
  }
}

function renderChinaProvinceImageryBadges() {
  const en = currentLanguage === "en";
  const unitsByName = new Map(regionSets.china.units.map((unit) => [unit.name, unit]));
  return chinaProvinceTravelGroups.map((group) => {
    const cards = group.provinces
      .map((name) => unitsByName.get(name))
      .filter(Boolean)
      .map((unit) => renderChinaProvinceImageryBadge(unit, en))
      .join("");
    const done = group.provinces.filter((name) => coverageHasRegion("china", name)).length;
    return `<details class="manual-group manual-province-group" open>
      <summary><strong>${escapeHtml(en ? group.nameEn : group.name)}</strong><span>${done}/${group.provinces.length}</span></summary>
      <div class="manual-grid province-badge-grid">${cards}</div>
    </details>`;
  }).join("");
}

function renderChinaProvinceImageryBadge(unit, en = currentLanguage === "en") {
  const badge = chinaProvinceImageryByName.get(unit.name) || { name: unit.name, imageryZh: "", imageryEn: "" };
    const visited = coverageHasRegion("china", unit.name);
    const manual = Boolean(manualAdminPlaceFor("cn", unit.name));
    const disabled = visited && !manual;
    const name = chinaProvinceDisplayName(unit.name);
    const imagery = en ? badge.imageryEn : badge.imageryZh;
    const status = visited ? manual ? (en ? "Manual" : "手动点亮") : t("lit") : (en ? "Unlit" : "未点亮");
    return `<button class="province-badge-card ${visited ? "done" : ""}" ${disabled ? "disabled" : ""} data-manual-action="admin:cn:${encodeURIComponent(unit.name)}:0" type="button">
      <span class="badge-name-row"><strong>${escapeHtml(name)}</strong><i>${escapeHtml(status)}</i></span>
      <span class="province-badge-imagery">${escapeHtml(imagery)}</span>
    </button>`;
}

function renderJapanRegionImageryBadges() {
  const en = currentLanguage === "en";
  return regionSets.japan.units.map((unit) => {
    const badge = japanRegionImageryByName.get(unit.name) || { name: unit.name, imageryZh: "", imageryEn: "" };
    const visited = coverageHasRegion("japan", unit.name);
    const manual = Boolean(manualAdminPlaceFor("jp", unit.name));
    const disabled = visited && !manual;
    const name = en ? japanRegionEnglishName(unit.name) : unit.name;
    const imagery = en ? badge.imageryEn : badge.imageryZh;
    const status = visited ? manual ? (en ? "Manual" : "手动点亮") : t("lit") : (en ? "Unlit" : "未点亮");
    return `<button class="province-badge-card japan-region-badge ${visited ? "done" : ""}" ${disabled ? "disabled" : ""} data-manual-action="admin:jp:${encodeURIComponent(unit.name)}:0" type="button">
      <span class="badge-name-row"><strong>${escapeHtml(name)}</strong><i>${escapeHtml(status)}</i></span>
      <span class="province-badge-imagery">${escapeHtml(imagery)}</span>
    </button>`;
  }).join("");
}

function japanRegionEnglishName(name) {
  return {
    北海道: "Hokkaido",
    东北: "Tohoku",
    关东: "Kanto",
    中部: "Chubu",
    近畿: "Kinki",
    中国: "Chugoku",
    四国: "Shikoku",
    九州冲绳: "Kyushu and Okinawa",
  }[name] || name;
}

function renderUsStateLicensePlates() {
  const en = currentLanguage === "en";
  return regionSets.us.units.map((unit) => {
    const plate = usStatePlateByName.get(unit.name) || { name: unit.name, abbr: unit.name.slice(0, 2).toUpperCase(), nameZh: unit.name, nicknameEn: "", nicknameZh: "" };
    const visited = coverageHasRegion("us", unit.name);
    const manual = Boolean(manualAdminPlaceFor("us", unit.name));
    const disabled = visited && !manual;
    const stateName = en ? plate.name : plate.nameZh;
    const slogan = en ? plate.nicknameEn : plate.nicknameZh;
    const status = visited ? manual ? (en ? "Manual" : "手动点亮") : t("lit") : (en ? "Unlit" : "未点亮");
    return `<button class="license-plate-card ${visited ? "done" : ""}" ${disabled ? "disabled" : ""} data-manual-action="admin:us:${encodeURIComponent(unit.name)}:0" type="button">
      <span class="license-plate-top"><b>${escapeHtml(plate.abbr)}</b></span>
      <span class="badge-name-row"><strong>${escapeHtml(stateName)}</strong><i>${escapeHtml(status)}</i></span>
      <span class="license-plate-slogan">${escapeHtml(slogan)}</span>
    </button>`;
  }).join("");
}

function manualCountryRows() {
  const rows = new Map();
  const addCountry = (rawId, name) => {
    const id = countryCoverageId(rawId);
    if (!id || id === "tw" || id === "imported") return;
    rows.set(id, {
      id,
      name: countryDisplayName(id) || name || id.toUpperCase(),
      continent: continentForCountryId(id),
    });
  };
  worldCountryCatalog.forEach((country) => addCountry(country.id, country.name));
  (boundaryData.country?.features || []).forEach((feature) => {
    addCountry(countryIdFromFeature(feature), feature.properties?.name || feature.properties?.NAME);
  });
  return Array.from(rows.values()).sort((left, right) => {
    const continentCompare = continentSortValue(left.continent) - continentSortValue(right.continent);
    return continentCompare || left.name.localeCompare(right.name, "zh-Hans-CN");
  });
}

function continentSortValue(continent) {
  const index = ["亚洲", "欧洲", "北美洲", "南美洲", "非洲", "大洋洲", "其他"].indexOf(continent);
  return index === -1 ? 99 : index;
}

function chinaSubadminUnitsForManualList() {
  const taiwanUnits = taiwanSubadminUnitsForManualList();
  const municipalities = new Set(["北京", "上海", "天津", "重庆"]);
  const seen = new Set();
  const mainland = (boundaryData.china2?.features || []).map((feature) => {
    const name = subadminNameFromFeature(feature);
    if (!name) return null;
    const province = provinceNameForChinaSubadminFeature(feature);
    if (municipalities.has(cleanAdminName(province)) || municipalities.has(cleanAdminName(name))) return null;
    const key = cleanAdminName(name);
    if (seen.has(key)) return null;
    seen.add(key);
    return { province, name, center: geometryCenter(feature.geometry) };
  }).filter(Boolean);
  const supplemental = chinaDirectSubadminUnitsFromBoundary().filter((unit) => {
    const key = cleanAdminName(unit.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...mainland, ...supplemental, ...taiwanUnits].sort((left, right) => {
    const provinceCompare = left.province.localeCompare(right.province, "zh-Hans-CN");
    return provinceCompare || left.name.localeCompare(right.name, "zh-Hans-CN");
  });
}

function taiwanSubadminUnitsForManualList() {
  if (!boundaryData.tw2?.features?.length) return taiwanSubadminUnits;
  const seen = new Set();
  return boundaryData.tw2.features.map((feature) => {
    const name = subadminNameFromFeature(feature);
    const key = cleanAdminName(name);
    if (!name || seen.has(key)) return null;
    seen.add(key);
    return { province: "台湾", name, center: geometryCenter(feature.geometry) };
  }).filter(Boolean);
}

function provinceNameForChinaSubadminFeature(feature) {
  const props = feature.properties || {};
  if (props.province) return props.province;
  const parent = Number(props.parent?.adcode || props.parent_adcode || props.adcode && Math.floor(Number(props.adcode) / 10000) * 10000);
  return chinaProvinceByAdcode[parent] || adminNameFromFeature(feature) || "未分省";
}

function renderChinaSubadminGroups(rows) {
  const grouped = groupBy(rows, (row) => row.province || "未分省");
  return Object.entries(grouped).map(([province, units]) => {
    const done = units.filter((unit) => coverageHasSubregion("china2", unit.name)).length;
    return `<details class="manual-group manual-city-group" open>
      <summary><strong>${chinaProvinceDisplayName(province)}</strong><span>${done}/${units.length}</span></summary>
      <div class="manual-list">
        ${units.map((unit) => {
          const visited = coverageHasSubregion("china2", unit.name);
          const manual = Boolean(manualAdminPlaceFor("cn", unit.name));
          return manualButtonHtml({ label: chinaSubadminDisplayName(unit.name), visited, manual, action: `admin:cn:${encodeURIComponent(unit.name)}:1`, disabled: visited && !manual });
        }).join("")}
      </div>
    </details>`;
  }).join("");
}

function renderJapanPrefectureGroups(rows) {
  const grouped = groupBy(rows, (row) => japanRegionForPrefecture(row.name) || "未分区");
  return Object.entries(grouped).map(([region, units]) => {
    const done = units.filter((unit) => coverageHasSubregion("japanPref", unit.name)).length;
    return `<details class="manual-group manual-city-group" open>
      <summary><strong>${region}</strong><span>${done}/${units.length}</span></summary>
      <div class="manual-list">
        ${units.map((unit) => {
          const visited = coverageHasSubregion("japanPref", unit.name);
          const manual = Boolean(manualAdminPlaceFor("jp", unit.name));
          return manualButtonHtml({ label: unit.name, visited, manual, action: `admin:jp:${encodeURIComponent(unit.name)}:1`, disabled: visited && !manual });
        }).join("")}
      </div>
    </details>`;
  }).join("");
}

function renderCountryGroups(rows) {
  const grouped = groupBy(rows, (row) => row.continent || "其他");
  return Object.entries(grouped).map(([continent, countriesInContinent]) => {
    const done = countriesInContinent.filter((country) => coverageHasCountry(country.id)).length;
    return `<details class="manual-group" ${done ? "open" : ""}>
      <summary><strong>${continentDisplayName(continent)}</strong><span>${done}/${countriesInContinent.length}</span></summary>
      <div class="manual-grid">
        ${countriesInContinent.map((country) => {
          const visited = coverageHasCountry(country.id);
          const manual = Boolean(manualCountryPlaceFor(country.id));
          return manualButtonHtml({ label: country.name, visited, manual, action: `country:${country.id}`, disabled: visited && !manual });
        }).join("")}
      </div>
    </details>`;
  }).join("");
}

function groupBy(items, keyFn) {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    groups[key] ||= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function renderPlaceDetail(placeId) {
  const place = getPlace(placeId);
  const visit = bestVisitForPlace(placeId);
  const ancientCapitalMeta = ancientCapitalMetaForPlace(place);
  if (ancientCapitalMeta) {
    renderAncientCapitalDetail("chinaAncientCapitals", place.name, ancientCapitalMeta, Boolean(visit));
    return;
  }
  const regionLabel = countryCoverageId(place.country) === "cn"
    ? (place.subunit ? chinaSubadminDisplayName(place.subunit) : chinaProvinceDisplayName(place.unit))
    : place.unit;
  $("#mapDetail").classList.remove("hidden");
  $("#mapDetail").classList.remove("ancient-capital-detail");
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">${t("mapPoint")}</p>
    <h3>${place.name}</h3>
    <dl>
      <div><dt>${t("countryRegion")}</dt><dd>${getCountry(place.country).name}</dd></div>
      <div><dt>${t("region")}</dt><dd>${regionLabel || t("unassigned")}</dd></div>
      <div><dt>${t("status")}</dt><dd>${visit ? t("checked") : t("unvisited")}</dd></div>
    </dl>
    <div class="tag-row">${place.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
    ${visit ? `<button class="detail-action" data-unvisit="${place.id}" type="button">${t("unvisit")}</button>` : ""}`;
}

function countVisitedRegions(regionKey) {
  const units = regionSets[regionKey].units;
  return units.filter((unit) => coverageHasRegion(regionKey, unit.name)).length;
}

function missingVisitedRegions(regionKey) {
  return regionSets[regionKey].units
    .filter((unit) => !coverageHasRegion(regionKey, unit.name))
    .map((unit) => unit.name);
}

function countVisitedSubregions(subadminKey) {
  if (subadminKey === "china2") {
    const units = chinaSubadminUnitsForManualList();
    if (units.length) return units.filter((unit) => coverageHasSubregion("china2", unit.name)).length;
  }
  if (subadminKey === "japanPref") {
    return japanPrefectureUnits().filter((unit) => coverageHasSubregion("japanPref", unit.name)).length;
  }
  return coverageSubregionNames(subadminKey).length;
}

function chinaPrefectureTotal() {
  const total = chinaSubadminUnitsForManualList().length;
  return total || (333 + 30 + taiwanSubadminUnits.length);
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
    ["中国地级尺度", countVisitedSubregions("china2"), chinaPrefectureTotal()],
    [regionSets.us.label, countVisitedRegions("us"), regionSets.us.total],
    [regionSets.japan.label, countVisitedRegions("japan"), regionSets.japan.total],
    ["日本都道府县", countVisitedSubregions("japanPref"), japanPrefectureUnits().length],
    ["世界国家/地区", uniqueVisitedCountries().size, worldCountryTotal],
  ];
  $("#coverageBars").innerHTML = rows.map(([name, done, total]) => {
    const percent = Math.round((done / total) * 100);
    return `<div class="bar-row"><div class="bar-meta"><span>${name}</span><span>${done}/${total} · ${percent}%</span></div><div class="bar"><i style="width:${percent}%"></i></div></div>`;
  }).join("");
}

function isManualDrawnPath(place, fileById = null) {
  if (!place?.shapeOnly) return false;
  if (place.sourceType === "manual-path") return true;
  const record = fileById?.get(place.importId);
  if (String(record?.format || "").toUpperCase() === "DRAWN") return true;
  const text = [place.type, place.unit, ...(place.tags || [])].join(" ").toLowerCase();
  return /手绘路径|地图绘制|drawn path|map drawing/.test(text);
}

function isEditablePath(place) {
  return Boolean(place?.shapeOnly
    && place.importedGeometry?.type === "LineString"
    && Array.isArray(place.importedGeometry.coordinates)
    && place.importedGeometry.coordinates.length >= 2);
}

function importManagerDate(value, en) {
  return value ? new Date(value).toLocaleString(en ? "en-US" : "zh-CN") : (en ? "Imported" : "已导入");
}

function renderImportPagination(type, page, pageCount, en) {
  return `<nav class="import-pagination" aria-label="${en ? "Pagination" : "分页"}">
    <button class="table-action" data-import-page="${type}" data-page-delta="-1" type="button" ${page <= 0 ? "disabled" : ""}>${en ? "Previous" : "上一页"}</button>
    <span>${en ? `Page ${page + 1} of ${pageCount}` : `第 ${page + 1} / ${pageCount} 页`}</span>
    <button class="table-action" data-import-page="${type}" data-page-delta="1" type="button" ${page >= pageCount - 1 ? "disabled" : ""}>${en ? "Next" : "下一页"}</button>
  </nav>`;
}

function renderImportSummary() {
  const target = $("#importSummary");
  if (!target) return;
  const openGroups = new Set(Array.from(target.querySelectorAll("[data-import-group]"))
    .filter((details) => details.open).map((details) => details.dataset.importGroup));
  const en = currentLanguage === "en";
  const files = state.importedFiles || [];
  const fileById = new Map(files.map((file) => [file.id, file]));
  const manualPaths = places.filter((place) => isManualDrawnPath(place, fileById));
  const manualImportIds = new Set(manualPaths.map((place) => place.importId).filter(Boolean));
  const regularFiles = files.filter((file) => String(file.format || "").toUpperCase() !== "DRAWN" && !manualImportIds.has(file.id));
  const flightFiles = state.flightImports || [];
  const manualCheckinVisits = visitedPlaces().filter((visit) => visit.tripId === "map-click" || visit.place.id?.startsWith("map-click-"));
  const manualCheckinIds = new Set(manualCheckinVisits.map((visit) => visit.place.id));
  const manualCheckins = manualCheckinVisits.map((visit) => ({ ...visit.place, manualUpdatedAt: visit.updatedAt || visit.date || "" }));
  const nonImportedVisits = visitedPlaces().filter((visit) => !manualCheckinIds.has(visit.place.id) && !visit.place.imported && !visit.place.importId && !visit.place.sourceFile);
  const importedObjectCount = places.filter(isImportedObject).length + (state.flights || []).length;
  const query = importManagerQuery.trim().toLocaleLowerCase();
  const matches = (...values) => !query || values.some((value) => String(value || "").toLocaleLowerCase().includes(query));
  const dateValue = (item) => item.importedAt || "";
  const sortItems = (items, nameFn = (item) => item.name) => [...items].sort((left, right) => {
    if (importManagerSort === "oldest") return dateValue(left).localeCompare(dateValue(right));
    if (importManagerSort === "name") return String(nameFn(left) || "").localeCompare(String(nameFn(right) || ""), currentLanguage === "en" ? "en" : "zh-CN");
    return dateValue(right).localeCompare(dateValue(left));
  });
  const filteredFiles = sortItems(regularFiles.filter((file) => matches(file.name, file.format)));
  const filteredFlights = sortItems(flightFiles.filter((file) => matches(file.name, file.format)));
  const filteredCheckins = sortItems(manualCheckins.filter((place) => matches(place.name, place.type)), (place) => place.name)
    .sort((left, right) => importManagerSort === "name" ? left.name.localeCompare(right.name, en ? "en" : "zh-CN") : importManagerSort === "oldest" ? (left.manualUpdatedAt || "").localeCompare(right.manualUpdatedAt || "") : (right.manualUpdatedAt || "").localeCompare(left.manualUpdatedAt || ""));
  const filteredPaths = sortItems(manualPaths.filter((place) => matches(place.name, place.type)));
  const checkinPageCount = Math.max(1, Math.ceil(filteredCheckins.length / importManagerPageSize));
  const pathPageCount = Math.max(1, Math.ceil(filteredPaths.length / importManagerPageSize));
  manualCheckinPage = Math.min(manualCheckinPage, checkinPageCount - 1);
  manualPathPage = Math.min(manualPathPage, pathPageCount - 1);
  const visibleCheckins = filteredCheckins.slice(manualCheckinPage * importManagerPageSize, (manualCheckinPage + 1) * importManagerPageSize);
  const visiblePaths = filteredPaths.slice(manualPathPage * importManagerPageSize, (manualPathPage + 1) * importManagerPageSize);
  const allVisibleCheckinsSelected = visibleCheckins.length > 0 && visibleCheckins.every((place) => selectedManualCheckinIds.has(place.id));
  const allVisiblePathsSelected = visiblePaths.length > 0 && visiblePaths.every((place) => selectedManualPathIds.has(place.id));
  const fileRows = filteredFiles.map((file) => {
    const index = files.indexOf(file);
    return `<div class="import-compact-row"><div><strong>${escapeHtml(file.name)}</strong><span>${escapeHtml(file.format || "")} · ${escapeHtml(importManagerDate(file.importedAt, en))}</span></div><em>${file.count || 0} ${en ? "items" : "条"}</em><button class="table-action danger" data-delete-import="${escapeHtml(file.id || "")}" data-import-index="${index}" type="button">${en ? "Delete" : "删除"}</button></div>`;
  }).join("");
  const pathRows = visiblePaths.map((place) => `<div class="import-compact-row manual-path-row">
    <label class="manual-path-select"><input type="checkbox" data-select-manual-path="${escapeHtml(place.id)}" ${selectedManualPathIds.has(place.id) ? "checked" : ""} /><span></span></label>
    <div><strong>${escapeHtml(place.name)}</strong><span>${escapeHtml(importManagerDate(place.importedAt, en))} · ${escapeHtml(place.importedGeometry?.type || "LineString")}</span></div>
    <div class="compact-row-actions"><button class="table-action" data-locate-manual-path="${escapeHtml(place.id)}" type="button">${en ? "Locate" : "定位"}</button><button class="table-action" data-edit-manual-path="${escapeHtml(place.id)}" type="button">${t("editMapPath")}</button><button class="table-action" data-rename-manual-path="${escapeHtml(place.id)}" type="button">${en ? "Rename" : "重命名"}</button><button class="table-action danger" data-delete-inventory-object="${escapeHtml(place.id)}" type="button">${en ? "Delete" : "删除"}</button></div>
  </div>`).join("");
  const checkinRows = visibleCheckins.map((place) => `<div class="import-compact-row manual-path-row">
    <label class="manual-path-select"><input type="checkbox" data-select-manual-checkin="${escapeHtml(place.id)}" ${selectedManualCheckinIds.has(place.id) ? "checked" : ""} /><span></span></label>
    <div><strong>${escapeHtml(place.name)}</strong><span>${escapeHtml(importManagerDate(place.manualUpdatedAt, en))} · ${Number(place.lat).toFixed(5)}, ${Number(place.lng).toFixed(5)}</span></div>
    <div class="compact-row-actions"><button class="table-action" data-locate-manual-checkin="${escapeHtml(place.id)}" type="button">${en ? "Locate" : "定位"}</button><button class="table-action" data-rename-manual-checkin="${escapeHtml(place.id)}" type="button">${en ? "Rename" : "重命名"}</button><button class="table-action danger" data-delete-manual-checkin="${escapeHtml(place.id)}" type="button">${en ? "Delete" : "删除"}</button></div>
  </div>`).join("");
  const flightRows = filteredFlights.map((file) => `<div class="import-compact-row"><div><strong>${escapeHtml(file.name)}</strong><span>${escapeHtml(file.format || "XLS")} · ${escapeHtml(importManagerDate(file.importedAt, en))}</span></div><em>${file.count || 0} ${en ? "flights" : "条航班"}</em><button class="table-action danger" data-delete-flight-import="${escapeHtml(file.id || "")}" type="button">${en ? "Delete" : "删除"}</button></div>`).join("");
  const open = (name) => openGroups.has(name) ? "open" : "";
  target.innerHTML = `
    <article class="check-item import-management-card"><header><strong>${en ? "All imported data" : "全部导入数据"}</strong><span>${importedObjectCount} ${en ? "objects" : "个对象"}</span></header><p class="muted">${en ? "Imported files and manually drawn paths are managed separately below." : "导入文件与手绘路径已分开管理。"}</p><button class="text-action" data-delete-all-imports="1" type="button">${en ? "Delete all imports" : "删除全部导入"}</button></article>
    <div class="import-manager-toolbar"><input data-import-search type="search" value="${escapeHtml(importManagerQuery)}" placeholder="${en ? "Search files, check-ins, or paths" : "搜索文件、打卡或路径"}" /><select data-import-sort><option value="newest" ${importManagerSort === "newest" ? "selected" : ""}>${en ? "Newest" : "最新优先"}</option><option value="oldest" ${importManagerSort === "oldest" ? "selected" : ""}>${en ? "Oldest" : "最早优先"}</option><option value="name" ${importManagerSort === "name" ? "selected" : ""}>${en ? "Name" : "名称排序"}</option></select></div>
    <details class="import-manager-group" data-import-group="files" ${open("files")}><summary><strong>${en ? "Imported files" : "导入文件"}</strong><span>${regularFiles.length}</span></summary><div class="import-compact-list">${fileRows || `<p class="muted small">${en ? "No matching imported files" : "没有匹配的导入文件"}</p>`}</div></details>
    <details class="import-manager-group" data-import-group="manualCheckins" ${open("manualCheckins")}><summary><strong>${en ? "Manual check-ins" : "手动打卡"}</strong><span>${manualCheckins.length}</span></summary><div class="manual-path-bulk"><label><input type="checkbox" data-select-visible-checkins ${allVisibleCheckinsSelected ? "checked" : ""} /> ${checkinPageCount > 1 ? (en ? "Select this page" : "选择本页") : (en ? "Select all" : "全选")}</label><button class="table-action danger" data-delete-selected-checkins type="button" ${selectedManualCheckinIds.size ? "" : "disabled"}>${en ? `Delete selected (${selectedManualCheckinIds.size})` : `删除所选（${selectedManualCheckinIds.size}）`}</button></div><div class="import-compact-list">${checkinRows || `<p class="muted small">${en ? "No matching manual check-ins" : "没有匹配的手动打卡"}</p>`}</div>${checkinPageCount > 1 ? renderImportPagination("checkins", manualCheckinPage, checkinPageCount, en) : ""}</details>
    <details class="import-manager-group" data-import-group="paths" ${open("paths")}><summary><strong>${en ? "Manual paths" : "手动路径"}</strong><span>${manualPaths.length}</span></summary><div class="manual-path-bulk"><label><input type="checkbox" data-select-visible-paths ${allVisiblePathsSelected ? "checked" : ""} /> ${pathPageCount > 1 ? (en ? "Select this page" : "选择本页") : (en ? "Select all" : "全选")}</label><button class="table-action danger" data-delete-selected-paths type="button" ${selectedManualPathIds.size ? "" : "disabled"}>${en ? `Delete selected (${selectedManualPathIds.size})` : `删除所选（${selectedManualPathIds.size}）`}</button></div><div class="import-compact-list">${pathRows || `<p class="muted small">${en ? "No matching manual paths" : "没有匹配的手动路径"}</p>`}</div>${pathPageCount > 1 ? renderImportPagination("paths", manualPathPage, pathPageCount, en) : ""}</details>
    <details class="import-manager-group" data-import-group="flights" ${open("flights")}><summary><strong>${en ? "Flight imports" : "航班导入"}</strong><span>${flightFiles.length}</span></summary><div class="import-compact-list">${flightRows || `<p class="muted small">${en ? "No matching flight imports" : "没有匹配的航班导入"}</p>`}</div></details>
    <details class="import-manager-group" data-import-group="checkins" ${open("checkins")}><summary><strong>${en ? "Light-up / checklist data" : "点亮/打卡数据"}</strong><span>${nonImportedVisits.length}</span></summary><div class="import-group-note"><p class="muted">${en ? "Clears manual countries, administrative units, map-click points, and checklist marks. Imports are kept." : "清除手动国家、行政区、地图点击点和打卡清单；导入文件与轨迹会保留。"}</p><button class="text-action" data-clear-checkins="1" type="button">${en ? "Clear light-up / checklist points" : "清除点亮/打卡点"}</button></div></details>`;
}

function inventorySourceLabel(visit) {
  const raw = String(visit?.tripId || "");
  const place = visit?.place || {};
  if (place.imported || place.importId || place.sourceFile || raw.startsWith("import-")) {
    return place.sourceFile
      ? currentLanguage === "en" ? `Imported place: ${place.sourceFile}` : `已导入地点：${place.sourceFile}`
      : currentLanguage === "en" ? "Imported place" : "已导入地点";
  }
  if (raw === "map-click") return currentLanguage === "en" ? "Map click" : "地图点击";
  if (raw === "manual-country") return currentLanguage === "en" ? "Manual country" : "手动点亮国家";
  if (raw === "manual-admin") return currentLanguage === "en" ? "Manual administrative unit" : "手动点亮行政区";
  if (raw === "checklist") return currentLanguage === "en" ? "Checklist" : "清单打卡";
  if (place.checklistOnly) return currentLanguage === "en" ? "Checklist" : "清单打卡";
  if (place.manualCountry) return currentLanguage === "en" ? "Manual country" : "手动点亮国家";
  if (place.manualAdmin) return currentLanguage === "en" ? "Manual administrative unit" : "手动点亮行政区";
  return raw || (currentLanguage === "en" ? "Check-in" : "打卡");
}

function inventoryTypeLabel(place) {
  if (place.shapeOnly) return currentLanguage === "en" ? "Imported track" : "已导入轨迹";
  if (place.imported || place.importId || place.sourceFile) return currentLanguage === "en" ? "Imported place" : "已导入地点";
  if (place.checklistOnly) return currentLanguage === "en" ? "Checklist point" : "清单打卡";
  if (place.manualCountry) return currentLanguage === "en" ? "Manual country" : "手动国家";
  if (place.manualAdmin) return currentLanguage === "en" ? "Manual administrative unit" : "手动行政区";
  if (place.id?.startsWith("map-click-")) return currentLanguage === "en" ? "Map click" : "地图点击";
  return currentLanguage === "en" ? "Check-in point" : "打卡点";
}

function isImportedObject(place) {
  return Boolean(place?.imported || place?.importId || place?.sourceFile);
}

function isImportedTrack(place) {
  return Boolean(isImportedObject(place) && place.shapeOnly);
}

function isImportedPoint(place) {
  return Boolean(isImportedObject(place) && !place.shapeOnly);
}

function isManualAdministrativePlace(place) {
  return Boolean(place?.manualCountry || place?.manualAdmin);
}

function isLitPlaceVisit(visit) {
  const place = visit?.place;
  return Boolean(place && !place.shapeOnly && !isManualAdministrativePlace(place));
}

function isLitAdministrativeVisit(visit) {
  return Boolean(isManualAdministrativePlace(visit?.place));
}

function deleteInventoryVisit(placeId) {
  const place = getPlace(placeId);
  if (!place) return;
  if (isManualAdministrativePlace(place)) {
    state.visits = state.visits.filter((visit) => visit.placeId !== placeId);
    places = places.filter((candidate) => candidate.id !== placeId);
    closeMapPopupsAndDetail();
    recomputeCoverage();
    invalidateMapGeoJsonCacheOnly();
    saveState();
    renderAfterCheckinChange();
    renderImportSummary();
    renderDataInventory();
    showToast(`${place.name} ${currentLanguage === "en" ? "deleted" : "已删除"}`);
    return;
  }
  unvisitPlace(placeId);
}

function inventoryLevelLabel(place) {
  if (place?.manualCountry) return currentLanguage === "en" ? "Country / region" : "国家/地区";
  if (place?.manualAdmin && place.subunit) return currentLanguage === "en" ? "City level" : "市级";
  if (place?.manualAdmin) return currentLanguage === "en" ? "Province level" : "省级";
  return currentLanguage === "en" ? "Place" : "地点";
}

function inventoryVisitedLabel(place, visitedIdSet) {
  return visitedIdSet.has(place.id)
    ? (currentLanguage === "en" ? "Lit" : "已点亮")
    : (currentLanguage === "en" ? "Not lit" : "未点亮");
}

function deleteInventoryObject(placeId) {
  const place = getPlace(placeId);
  if (!place) return;
  const wasImported = place.imported || place.importId || place.sourceFile;
  state.visits = state.visits.filter((visit) => visit.placeId !== placeId);
  places = places.filter((candidate) => candidate.id !== placeId);
  if (wasImported) {
    state.importedFiles = (state.importedFiles || []).map((record) => {
      const ids = (record.ids || []).filter((id) => id !== placeId);
      const count = places.filter((candidate) =>
        candidate.importId === record.id || (!record.id && candidate.sourceFile === record.name)
      ).length;
      return { ...record, ids, count: count || ids.length };
    }).filter((record) => record.count > 0 || (record.ids || []).length > 0);
  }
  closeMapPopupsAndDetail();
  recomputeCoverage();
  invalidateMapGeoJsonCacheOnly();
  saveState();
  renderMetrics();
  renderDashboardAchievements();
  renderNextStops();
  renderImportSummary();
  renderDataInventory();
  if (document.querySelector('[data-page="checkins"]')?.classList.contains("active")) renderCheckinsPage();
  if (document.querySelector('[data-page="achievements"]')?.classList.contains("active")) renderAchievements();
  if (isMapPageActive() && !refreshMapLibreDataOnly()) scheduleGeoMapRender();
  showToast(`${place.name} ${currentLanguage === "en" ? "deleted" : "已删除"}`);
}

function deleteImportedObjects(placeIds) {
  const ids = new Set(placeIds || []);
  if (!ids.size) return;
  state.visits = state.visits.filter((visit) => !ids.has(visit.placeId));
  places = places.filter((place) => !ids.has(place.id));
  state.importedFiles = (state.importedFiles || []).map((record) => {
    const recordIds = (record.ids || []).filter((id) => !ids.has(id));
    const count = places.filter((place) => place.importId === record.id || (!record.id && place.sourceFile === record.name)).length;
    return { ...record, ids: recordIds, count: count || recordIds.length };
  }).filter((record) => record.count > 0 || (record.ids || []).length > 0);
  ids.forEach((id) => selectedManualPathIds.delete(id));
  closeMapPopupsAndDetail();
  recomputeCoverage();
  invalidateMapCaches();
  invalidateDerivedStatsCache();
  saveState();
  renderMetrics();
  renderImportSummary();
  renderDataInventory();
  if (isMapPageActive() && !refreshMapLibreDataOnly()) scheduleGeoMapRender();
  showToast(currentLanguage === "en" ? `${ids.size} paths deleted` : `已删除 ${ids.size} 条路径`);
}

function locateManualPath(placeId) {
  const place = getPlace(placeId);
  const center = geometryCenter(place?.importedGeometry);
  if (!place || !center?.every(Number.isFinite)) return;
  state.mapViewport = { center: [center[0], center[1]], zoom: Math.max(5, normalizeMapViewport(state.mapViewport)?.zoom || 5) };
  history.replaceState(null, "", "#world");
  showPage("world", "");
  window.setTimeout(() => {
    if (mapLibreMap) mapLibreMap.jumpTo({ center, zoom: state.mapViewport.zoom });
    if (leafletMap) leafletMap.setView([center[1], center[0]], state.mapViewport.zoom, { animate: false });
  }, 120);
}

function renameManualPath(placeId) {
  const place = getPlace(placeId);
  if (!place) return;
  const name = window.prompt(currentLanguage === "en" ? "New path name" : "新的路径名称", place.name);
  if (!String(name || "").trim()) return;
  const oldSourceFile = place.sourceFile;
  place.name = String(name).trim();
  place.sourceFile = place.name;
  state.importedFiles = (state.importedFiles || []).map((record) => record.id === place.importId
    ? { ...record, name: place.name }
    : record);
  places.forEach((candidate) => {
    if (candidate !== place && candidate.importId === place.importId && candidate.sourceFile === oldSourceFile) candidate.sourceFile = place.name;
  });
  invalidateMapCaches();
  saveState();
  renderImportSummary();
  renderDataInventory();
  if (isMapPageActive() && !refreshMapLibreDataOnly()) scheduleGeoMapRender();
  showToast(currentLanguage === "en" ? "Path renamed" : "路径已重命名");
}

function locateManualCheckin(placeId) {
  const place = getPlace(placeId);
  if (!place || !Number.isFinite(place.lng) || !Number.isFinite(place.lat)) return;
  const zoom = Math.max(7, normalizeMapViewport(state.mapViewport)?.zoom || 7);
  state.mapViewport = { center: [place.lng, place.lat], zoom };
  state.focusPlaceId = place.id;
  history.replaceState(null, "", "#world");
  showPage("world", "");
  window.setTimeout(() => {
    if (mapLibreMap) mapLibreMap.jumpTo({ center: [place.lng, place.lat], zoom });
    if (leafletMap) leafletMap.setView([place.lat, place.lng], zoom, { animate: false });
    renderPlaceDetail(place.id);
  }, 120);
}

function renameManualCheckin(placeId) {
  const place = getPlace(placeId);
  if (!place) return;
  const name = window.prompt(currentLanguage === "en" ? "New check-in name" : "新的打卡名称", place.name);
  if (!String(name || "").trim()) return;
  place.name = String(name).trim();
  invalidateMapPointRenderCache();
  saveState();
  renderImportSummary();
  renderDataInventory();
  if (isMapPageActive() && !refreshMapLibreDataOnly()) scheduleGeoMapRender();
  showToast(currentLanguage === "en" ? "Check-in renamed" : "打卡已重命名");
}

function deleteManualCheckin(placeId) {
  const place = getPlace(placeId);
  if (!place) return;
  state.visits = state.visits.filter((visit) => visit.placeId !== placeId);
  places = places.filter((candidate) => candidate.id !== placeId);
  selectedManualCheckinIds.delete(placeId);
  if (state.focusPlaceId === placeId) state.focusPlaceId = "";
  closeMapPopupsAndDetail();
  recomputeCoverage();
  invalidateMapCaches();
  invalidateDerivedStatsCache();
  saveState();
  renderMetrics();
  renderDashboardAchievements();
  renderImportSummary();
  renderDataInventory();
  if (document.querySelector('[data-page="checkins"]')?.classList.contains("active")) renderCheckinsPage();
  if (isMapPageActive() && !refreshMapLibreDataOnly()) scheduleGeoMapRender();
  showToast(`${place.name} ${currentLanguage === "en" ? "deleted" : "已删除"}`);
}

function deleteManualCheckins(placeIds) {
  const ids = new Set(placeIds || []);
  if (!ids.size) return;
  state.visits = state.visits.filter((visit) => !ids.has(visit.placeId));
  places = places.filter((place) => !ids.has(place.id));
  if (ids.has(state.focusPlaceId)) state.focusPlaceId = "";
  ids.forEach((id) => selectedManualCheckinIds.delete(id));
  closeMapPopupsAndDetail();
  recomputeCoverage();
  invalidateMapCaches();
  invalidateDerivedStatsCache();
  saveState();
  renderMetrics();
  renderDashboardAchievements();
  renderImportSummary();
  renderDataInventory();
  if (document.querySelector('[data-page="checkins"]')?.classList.contains("active")) renderCheckinsPage();
  if (isMapPageActive() && !refreshMapLibreDataOnly()) scheduleGeoMapRender();
  showToast(currentLanguage === "en" ? `${ids.size} check-ins deleted` : `已删除 ${ids.size} 个手动打卡`);
}

function deleteFlightRecord(flightKey) {
  const flight = (state.flights || []).find((candidate) => candidate.key === flightKey);
  if (!flight) return;
  state.flights = (state.flights || []).filter((candidate) => candidate.key !== flightKey);
  state.flightImports = (state.flightImports || []).map((record) => {
    if (record.id !== flight.importId) return record;
    const count = state.flights.filter((candidate) => candidate.importId === record.id).length;
    return { ...record, count };
  }).filter((record) => record.count > 0);
  invalidateMapCaches();
  invalidateDerivedStatsCache();
  saveState();
  renderImportSummary();
  renderDataInventory();
  refreshFlightRoutesOnMap();
  if (isMapPageActive()) renderGeoMap();
  showToast(`${flight.flightNo || flight.key} ${currentLanguage === "en" ? "deleted" : "已删除"}`);
}

function renderDataInventory() {
  const target = $("#dataInventory");
  if (!target) return;
  const openSections = new Set(Array.from(target.querySelectorAll(".data-table-block[data-inventory-section]"))
    .filter((details) => details.open)
    .map((details) => details.dataset.inventorySection));
  const en = currentLanguage === "en";
  const counts = dataCounts();
  const visitedIdSet = new Set((state.visits || []).map((visit) => visit.placeId));
  const imported = places
    .map((place, index) => ({ place, index }))
    .filter(({ place }) => isImportedObject(place))
    .sort((left, right) => (right.place.importedAt || "").localeCompare(left.place.importedAt || "") || right.index - left.index)
    .map(({ place }) => place);
  const importedPoints = imported.filter(isImportedPoint);
  const importedTracks = imported.filter(isImportedTrack);
  const flights = sanitizeFlights(state.flights || [])
    .sort((left, right) => (right.importedAt || right.date || "").localeCompare(left.importedAt || left.date || ""));
  const visited = visitedPlaces()
    .map((visit, index) => ({ visit, index }))
    .sort((left, right) => (right.visit.updatedAt || right.visit.date || "").localeCompare(left.visit.updatedAt || left.visit.date || "") || right.index - left.index)
    .map(({ visit }) => visit);
  const litPlaceVisits = visited.filter(isLitPlaceVisit);
  const litAdministrativeVisits = visited.filter(isLitAdministrativeVisit);
  const rows = [
    [en ? "Lit places" : "已点亮地点", counts.litPlaces],
    [en ? "Lit administrative units" : "已点亮行政区", counts.litAdministrativeUnits],
    [en ? "Imported places" : "已导入地点", counts.importedPoints],
    [en ? "Imported tracks" : "已导入轨迹", counts.importedTracks],
    [en ? "Imported flights" : "已导入航班", counts.importedFlights],
  ];
  const deleteLabel = en ? "Delete" : "删除";
  const placeLocationText = (place) => [
    getCountry(place.country).name,
    [place.unit, place.subunit].filter(Boolean).join(" / "),
  ].filter(Boolean).join(" · ");
  const emptyRow = (text, columns = 3) => `<tr><td colspan="${columns}">${escapeHtml(text)}</td></tr>`;
  const litPlaceRows = litPlaceVisits.map((visit) => `
    <tr>
      <td data-label="${en ? "Name" : "名称"}">${escapeHtml(visit.place.name)}</td>
      <td data-label="${en ? "Location" : "位置"}"><strong>${escapeHtml(placeLocationText(visit.place))}</strong></td>
      <td data-label="${en ? "Source" : "来源"}">${escapeHtml(inventorySourceLabel(visit))}</td>
      <td><button class="table-action danger" data-delete-inventory-visit="${escapeHtml(visit.place.id)}" type="button">${deleteLabel}</button></td>
    </tr>`).join("");
  const litAdministrativeRows = litAdministrativeVisits.map((visit) => `
    <tr>
      <td data-label="${en ? "Name" : "名称"}">${escapeHtml(visit.place.name)}</td>
      <td data-label="${en ? "Level" : "级别"}">${escapeHtml(inventoryLevelLabel(visit.place))}</td>
      <td data-label="${en ? "Country / region" : "国家/地区"}"><strong>${escapeHtml(getCountry(visit.place.country).name)}</strong><span>${escapeHtml([visit.place.unit, visit.place.subunit].filter(Boolean).join(" / "))}</span></td>
      <td data-label="${en ? "Source" : "来源"}">${escapeHtml(inventorySourceLabel(visit))}</td>
      <td><button class="table-action danger" data-delete-inventory-visit="${escapeHtml(visit.place.id)}" type="button">${deleteLabel}</button></td>
    </tr>`).join("");
  const importedPointRows = importedPoints.map((place) => `
    <tr>
      <td data-label="${en ? "Name" : "名称"}">${escapeHtml(place.name)}</td>
      <td data-label="${en ? "Location" : "位置"}"><strong>${escapeHtml(placeLocationText(place))}</strong></td>
      <td data-label="${en ? "File" : "文件"}">${escapeHtml(place.sourceFile || "")}</td>
      <td data-label="${en ? "Light-up" : "点亮"}">${escapeHtml(inventoryVisitedLabel(place, visitedIdSet))}</td>
      <td><button class="table-action danger" data-delete-inventory-object="${escapeHtml(place.id)}" type="button">${deleteLabel}</button></td>
    </tr>`).join("");
  const importedTrackRows = importedTracks.map((place) => `
    <tr>
      <td data-label="${en ? "Name" : "名称"}">${escapeHtml(place.name)}</td>
      <td data-label="${en ? "Geometry" : "几何类型"}"><strong>${escapeHtml(place.importedGeometry?.type || place.type || "")}</strong></td>
      <td data-label="${en ? "File" : "文件"}">${escapeHtml(place.sourceFile || "")}</td>
      <td>${isEditablePath(place) ? `<button class="table-action" data-edit-imported-path="${escapeHtml(place.id)}" type="button">${t("editMapPath")}</button>` : ""}<button class="table-action danger" data-delete-inventory-object="${escapeHtml(place.id)}" type="button">${deleteLabel}</button></td>
    </tr>`).join("");
  const flightRows = flights.map((flight) => {
    const from = findAirport(flight.fromAirport);
    const to = findAirport(flight.toAirport);
    const route = `${flight.fromAirport}${from?.iata ? ` (${from.iata})` : ""} → ${flight.toAirport}${to?.iata ? ` (${to.iata})` : ""}`;
    return `
    <tr>
      <td data-label="${en ? "Date" : "日期"}">${escapeHtml(flight.date)}</td>
      <td data-label="${en ? "Flight" : "航班"}"><strong>${escapeHtml([flight.airline, flight.flightNo].filter(Boolean).join(" "))}</strong></td>
      <td data-label="${en ? "Route" : "航线"}">${escapeHtml(route)}</td>
      <td data-label="${en ? "Status" : "状态"}">${escapeHtml(flight.ticketStatus || "")}</td>
      <td data-label="${en ? "File" : "文件"}">${escapeHtml(flight.sourceFile || "")}</td>
      <td><button class="table-action danger" data-delete-inventory-flight="${escapeHtml(flight.key)}" type="button">${deleteLabel}</button></td>
    </tr>`;
  }).join("");
  const isOpen = (section) => openSections.has(section) ? "open" : "";
  target.innerHTML = `
    <div class="inventory-metrics">${rows.map(([label, value]) => `<span><strong>${value}</strong><em>${label}</em></span>`).join("")}</div>
    <details class="data-table-block" data-inventory-section="litPlaces" ${isOpen("litPlaces")}>
      <summary><span>${en ? "Lit places" : "已点亮地点"}</span><em>${litPlaceVisits.length}</em></summary>
      <table><thead><tr><th>${en ? "Name" : "名称"}</th><th>${en ? "Location" : "位置"}</th><th>${en ? "Source" : "来源"}</th><th>${en ? "Action" : "操作"}</th></tr></thead><tbody>${litPlaceRows || emptyRow(en ? "No lit places" : "暂无已点亮地点", 4)}</tbody></table>
    </details>
    <details class="data-table-block" data-inventory-section="litAdministrativeUnits" ${isOpen("litAdministrativeUnits")}>
      <summary><span>${en ? "Lit administrative units" : "已点亮行政区"}</span><em>${litAdministrativeVisits.length}</em></summary>
      <table><thead><tr><th>${en ? "Name" : "名称"}</th><th>${en ? "Level" : "级别"}</th><th>${en ? "Country / region" : "国家/地区"}</th><th>${en ? "Source" : "来源"}</th><th>${en ? "Action" : "操作"}</th></tr></thead><tbody>${litAdministrativeRows || emptyRow(en ? "No manually lit administrative units" : "暂无已点亮行政区", 5)}</tbody></table>
    </details>
    <details class="data-table-block" data-inventory-section="importedPlaces" ${isOpen("importedPlaces")}>
      <summary><span>${en ? "Imported places" : "已导入地点"}</span><em>${importedPoints.length}</em></summary>
      <table><thead><tr><th>${en ? "Name" : "名称"}</th><th>${en ? "Location" : "位置"}</th><th>${en ? "File" : "文件"}</th><th>${en ? "Light-up" : "点亮"}</th><th>${en ? "Action" : "操作"}</th></tr></thead><tbody>${importedPointRows || emptyRow(en ? "No imported places" : "暂无已导入地点", 5)}</tbody></table>
    </details>
    <details class="data-table-block" data-inventory-section="importedTracks" ${isOpen("importedTracks")}>
      <summary><span>${en ? "Imported tracks" : "已导入轨迹"}</span><em>${importedTracks.length}</em></summary>
      <table><thead><tr><th>${en ? "Name" : "名称"}</th><th>${en ? "Geometry" : "几何类型"}</th><th>${en ? "File" : "文件"}</th><th>${en ? "Action" : "操作"}</th></tr></thead><tbody>${importedTrackRows || emptyRow(en ? "No imported tracks" : "暂无已导入轨迹", 4)}</tbody></table>
    </details>
    <details class="data-table-block" data-inventory-section="importedFlights" ${isOpen("importedFlights")}>
      <summary><span>${en ? "Imported flights" : "已导入航班"}</span><em>${flights.length}</em></summary>
      <table><thead><tr><th>${en ? "Date" : "日期"}</th><th>${en ? "Flight" : "航班"}</th><th>${en ? "Route" : "航线"}</th><th>${en ? "Status" : "状态"}</th><th>${en ? "File" : "文件"}</th><th>${en ? "Action" : "操作"}</th></tr></thead><tbody>${flightRows || emptyRow(en ? "No imported flights" : "暂无已导入航班", 6)}</tbody></table>
    </details>`;
}

function renderAchievements() {
  $("#achievementList").innerHTML = `
    <nav class="checklist-nav checklist-page-nav manual-view-tabs">
      <button type="button" data-checklist-jump="achievement-section-china5a">${currentLanguage === "en" ? "5A scenic areas" : "5A 景区"}</button>
      <button type="button" data-checklist-jump="achievement-section-ancientCapitals">${currentLanguage === "en" ? "Ancient capitals" : "中国古都"}</button>
      <button type="button" data-checklist-jump="achievement-section-usNationalParks">${currentLanguage === "en" ? "U.S. National Parks" : "美国国家公园"}</button>
      <button type="button" data-checklist-jump="achievement-section-worldHeritage">${currentLanguage === "en" ? "World Heritage" : "世界遗产"}</button>
      <button type="button" data-checklist-jump="achievement-section-highAltitude">${currentLanguage === "en" ? "High altitude" : "高海拔挑战"}</button>
    </nav>
    <details id="achievement-section-china5a" class="achievement-group" data-achievement-section="china5a">
      <summary><strong>${currentLanguage === "en" ? "China 5A scenic areas" : "中国 5A 景区"}</strong><span data-achievement-count="china5a">${checklistDoneCount("china5a")}/${checklistTotalCount("china5a")}</span></summary>
      <div class="achievement-section-placeholder"><p class="muted small">${currentLanguage === "en" ? "Expand to load this checklist." : "展开后加载该清单。"}</p></div>
    </details>
    <details id="achievement-section-ancientCapitals" class="achievement-group" data-achievement-section="ancientCapitals">
      <summary><strong>${currentLanguage === "en" ? "Ancient Chinese capitals" : "中国古都"}</strong><span data-achievement-count="chinaAncientCapitals">${checklistDoneCount("chinaAncientCapitals")}/${checklistTotalCount("chinaAncientCapitals")}</span></summary>
      <div class="achievement-section-placeholder"><p class="muted small">${currentLanguage === "en" ? "Expand to load this checklist." : "展开后加载该清单。"}</p></div>
    </details>
    <details id="achievement-section-usNationalParks" class="achievement-group" data-achievement-section="usNationalParks">
      <summary><strong>${currentLanguage === "en" ? "U.S. National Parks" : "美国国家公园"}</strong><span data-achievement-count="usNationalParks">${checklistDoneCount("usNationalParks")}/${checklistTotalCount("usNationalParks")}</span></summary>
      <div class="achievement-section-placeholder"><p class="muted small">${currentLanguage === "en" ? "Expand to load this checklist." : "展开后加载该清单。"}</p></div>
    </details>
    <details id="achievement-section-worldHeritage" class="achievement-group" data-achievement-section="worldHeritage">
      <summary><strong>${currentLanguage === "en" ? "World Heritage" : "世界遗产"}</strong><span data-achievement-count="worldHeritage">${checklistDoneCount("worldHeritage")}/${checklistTotalCount("worldHeritage")}</span></summary>
      <div class="achievement-section-placeholder"><p class="muted small">${currentLanguage === "en" ? "Expand to load this checklist." : "展开后加载该清单。"}</p></div>
    </details>
    <details id="achievement-section-highAltitude" class="achievement-group" data-achievement-section="highAltitude">
      <summary><strong>${currentLanguage === "en" ? "Global High-Altitude Travel Challenge" : "全球高海拔旅行挑战"}</strong><span data-achievement-count="chinaHighAltitude">${checklistDoneCount("chinaHighAltitude")}/${checklistTotalCount("chinaHighAltitude")}</span></summary>
      <div class="achievement-section-placeholder"><p class="muted small">${currentLanguage === "en" ? "Expand to load this checklist." : "展开后加载该清单。"}</p></div>
    </details>`;
  scheduleChecklistNavSpy();
}

function renderDashboardAchievements() {
  const target = $("#dashboardAchievements");
  if (!target) return;
  const achievements = coreAchievementModels();
  target.innerHTML = `
    <div class="section-head dashboard-achievement-head">
      <div>
        <p class="eyebrow">${t("coreCheckinsEyebrow")}</p>
        <h3>${t("coreCheckins")}</h3>
      </div>
      <a class="tag" href="#achievements">${t("viewChecklist")}</a>
    </div>
    <div class="achievement-card-grid">${achievements.map(renderAchievementCard).join("")}</div>`;
}

function fillAchievementSection(details) {
  const placeholder = details?.querySelector?.(".achievement-section-placeholder");
  if (!placeholder) return;
  const section = details.dataset.achievementSection;
  if (section === "china5a") {
    placeholder.outerHTML = renderChina5aSection();
    return;
  }
  if (section === "ancientCapitals") {
    loadChinaAncientCapitals().then(() => {
      if (placeholder.isConnected) placeholder.outerHTML = renderAncientCapitalsSection();
    });
    return;
  }
  if (section === "worldHeritage") {
    placeholder.outerHTML = renderChecklistSection("worldHeritage", checklistCatalog.worldHeritage);
    return;
  }
  if (section === "usNationalParks") {
    loadUsNpsCatalog().then(() => {
      if (placeholder.isConnected) placeholder.outerHTML = renderChecklistSection("usNationalParks", checklistCatalog.usNationalParks);
    });
    return;
  }
  if (section === "highAltitude") {
    placeholder.outerHTML = renderHighAltitudeInlineSection("chinaHighAltitude", checklistCatalog.chinaHighAltitude);
  }
}

function scheduleFillAchievementSection(details) {
  const placeholder = details?.querySelector?.(".achievement-section-placeholder");
  if (!placeholder || placeholder.dataset.loading === "1") return;
  placeholder.dataset.loading = "1";
  placeholder.innerHTML = `<p class="muted small">${currentLanguage === "en" ? "Loading..." : "正在加载..."}</p>`;
  requestAnimationFrame(() => {
    window.setTimeout(() => fillAchievementSection(details), 0);
  });
}

function coreAchievementModels() {
  const stats = dashboardStats();
  const chinaCount = stats.chinaRegions;
  const chinaTotal = regionSets.china.total;
  const chinaPrefectureCount = stats.chinaSubregions;
  const chinaPrefectureTotalValue = stats.chinaSubregionTotal;
  const countryCount = stats.countries;
  const china5aDone = stats.china5aDone;
  const worldHeritageDone = stats.worldHeritageDone;
  const worldHeritageTotal = stats.worldHeritageTotal;
  const en = currentLanguage === "en";
  return [
    achievementModel(en ? "World footprint" : "世界足迹", countryCount, worldCountryTotal, en ? "Countries and regions visited" : "去过的国家/地区", [
      [en ? "First world steps" : "世界初见", 2],
      [en ? "Cross-border traveler" : "跨境旅人", 5],
      [en ? "Ten-country trail" : "十国足迹", 10],
      [en ? "World traveler" : "世界行者", 20],
      [en ? "Global explorer" : "全球探索家", 50],
    ]),
    achievementModel(en ? "China map" : "中国版图", chinaCount, chinaTotal, en ? "Province-level China units, including Hong Kong, Macau, and Taiwan" : "中国省/自治区/直辖市/港澳台", [
      [en ? "First province" : "山河初见", 1],
      [en ? "Four directions" : "四方初识", 4],
      [en ? "Ten provinces" : "十省初成", 10],
      [en ? "Twenty provinces" : "二十省纵横", 20],
      [en ? "All China" : "华夏遍行", 34],
    ]),
    achievementModel(en ? "City footprint" : "城市足迹", chinaPrefectureCount, chinaPrefectureTotalValue, en ? "China prefecture-level cities and similar units" : "中国地级市/自治州/地区等", [
      [en ? "First city" : "一城启程", 1],
      [en ? "Ten-city trail" : "十城足迹", 10],
      [en ? "Fifty-city traveler" : "五十城行者", 50],
      [en ? "Hundred-city traveler" : "百城行者", 100],
      [en ? "Three-hundred-city journey" : "三百城纵横", 300],
    ]),
    achievementModel(en ? "5A scenic areas" : "5A 景区", china5aDone, stats.china5aTotal, en ? "Scenic area check-ins" : "打卡景区", [
      [en ? "First 5A" : "5A 初见", 1],
      [en ? "5A starter" : "5A 入门", 5],
      [en ? "Scenic pilgrim" : "名胜巡礼", 20],
      [en ? "Hundred-scenery traveler" : "百景行者", 100],
      [en ? "Landscape archivist" : "山河典藏家", 200],
    ]),
    achievementModel(en ? "World Heritage" : "世界遗产", worldHeritageDone, worldHeritageTotal, en ? "World Heritage checklist" : "世界遗产清单", [
      [en ? "First heritage site" : "遗产初见", 1],
      [en ? "Heritage collector" : "遗产收藏家", 10],
      [en ? "Heritage pilgrim" : "遗产巡礼者", 40],
      [en ? "Heritage deep traveler" : "遗产深游者", 100],
      [en ? "World heritage master" : "世界遗产大师", 200],
    ]),
  ];
}

function renderAchievementCard(item) {
  return `
    <article class="achievement ${item.done ? "done" : "locked"}">
      <div class="achievement-ring" style="--progress:${item.percent}">
        <strong>${item.percent}%</strong>
      </div>
      <div class="achievement-body">
        <header><strong>${item.name}</strong><span>${item.done ? (currentLanguage === "en" ? "Unlocked" : "已解锁") : item.level}</span></header>
        <p>${item.category}</p>
        <strong class="achievement-value">${item.doneCount}/${item.total}</strong>
        <div class="bar"><i style="width:${item.percent}%"></i></div>
        ${renderAchievementLevels(item)}
      </div>
    </article>`;
}

function renderAchievementLevels(item) {
  return `<ol class="achievement-levels">
    ${item.levels.map((level) => `<li class="${level.active ? "active" : ""} ${level.reached ? "reached" : ""}">
      <strong>${level.name}</strong><span>${level.targetText}</span>
    </li>`).join("")}
  </ol>`;
}

function renderChina5aSection() {
  const list = checklistCatalog.china5a;
  const groups = Object.entries(list.byRegion || {});
  const localRecordCount = groups.reduce((total, [, items]) => total + items.length, 0);
  const done = checklistDoneCount("china5a");
  const groupStats = new Map(groups.map(([region, items]) => [
    region,
    {
      total: items.length,
      done: items.filter((item) => isChecklistItemDone("china5a", item, region)).length,
    },
  ]));
  const nav = groups.map(([region, items]) => {
    const stats = groupStats.get(region) || { done: 0, total: items.length };
    return `<button type="button" data-checklist-jump="${checklistDomId("china5a", region)}">${checklistGroupDisplayName("china5a", region)} ${stats.done}/${stats.total}</button>`;
  }).join("");
  const blocks = groups.map(([region, items]) => {
    const displayItems = displayChecklistItems("china5a", items);
    const stats = groupStats.get(region) || { done: 0, total: displayItems.length };
    const groupId = checklistGroupId("china5a", region);
    return `<details id="${checklistDomId("china5a", region)}" class="country-checklist china5a-province" data-checklist-group="${groupId}">
      <summary><strong>${checklistGroupDisplayName("china5a", region)}</strong><span>${stats.done}/${displayItems.length}</span></summary>
      <div class="check-chip-grid checklist-lazy-placeholder" data-lazy-checklist="china5a" data-lazy-group="${escapeHtml(region)}"><p class="muted small">${currentLanguage === "en" ? "Expand to load this province." : "展开后加载该省份。"}</p></div>
    </details>`;
  }).join("");
  return `<section class="theme-checklist featured-checklist china5a-checklist">
    <div class="checklist-health">
      <span>${currentLanguage === "en" ? `${localRecordCount} 5A scenic areas` : `${localRecordCount} 个 5A 景区`}</span>
      <span>${currentLanguage === "en" ? `${Object.keys(china5aCoordinates || {}).length} mapped coordinates` : `${Object.keys(china5aCoordinates || {}).length} 个有地图坐标`}</span>
    </div>
    <nav class="checklist-nav">${nav}</nav>
    <div class="country-checklist-list">${blocks}</div>
  </section>`;
}

function checklistDomId(key, group) {
  return `checklist-${key}-${canonicalPlaceKey(group)}`;
}

function chinaCapitalDoneCount() {
  return chinaProvincialCapitals.filter((capital) => coverageHasSubregion("china2", capital)).length;
}

function achievementModel(name, doneCount, total, category, levels) {
  const safeTotal = Math.max(Number(total) || 1, 1);
  const percent = Math.min(100, Math.round((doneCount / safeTotal) * 100));
  const normalizedLevels = levels.map(([levelName, target]) => ({
    name: levelName,
    target,
    targetText: currentLanguage === "en" ? `Visited ${target}` : `去过 ${target} 个`,
    reached: doneCount >= target,
    active: false,
  }));
  const reachedLevels = normalizedLevels.filter((item) => item.reached);
  const activeLevel = reachedLevels.at(-1) || normalizedLevels.find((item) => !item.reached) || normalizedLevels.at(-1);
  if (activeLevel) activeLevel.active = true;
  return {
    name,
    doneCount,
    total: safeTotal,
    category,
    level: reachedLevels.at(-1)?.name || (currentLanguage === "en" ? "In progress" : "进行中"),
    levels: normalizedLevels,
    percent,
    done: doneCount >= safeTotal,
  };
}

function renderChecklistSection(key, list) {
  if (key === "usNationalParks") return renderUsNationalParksSection(key, list);
  if (key === "chinaHighAltitude") return renderHighAltitudeSection(key, list);
  if (list.byRegion) return renderRegionChecklistSection(key, list);
  if (list.byCountry) return renderCountryChecklistSection(key, list);
  const done = checklistDoneCount(key);
  return `<section class="theme-checklist">
    <header><strong>${checklistLabel(key, list)}</strong><span>${done}/${list.items.length}</span></header>
    ${renderChecklistChipGrid(key, list.items)}
  </section>`;
}

function displayChecklistItems(key, items) {
  return items || [];
}

function renderChecklistChipGrid(key, items, group = "") {
  return `<div class="check-chip-grid">
    ${(items || []).map((item) => renderChecklistChipButton(key, item, group)).join("")}
  </div>`;
}

function renderChecklistChipButton(key, item, group = "") {
  const checked = isChecklistItemDone(key, item, group);
  const label = `${checked ? `${t("checked")} · ` : ""}${checklistItemDisplayName(key, item)}`;
  return `<button class="check-chip ${checked ? "done" : ""}" data-checklist="${escapeHtml(key)}" data-item="${escapeHtml(item)}" data-group="${escapeHtml(group)}" type="button">${escapeHtml(label)}</button>`;
}

function renderUsNationalParksSection(key, list) {
  if (usNpsUnits.length) return renderUsNpsUnitsSection(key, list);
  const done = checklistDoneCount(key);
  const items = list.items || [];
  return `<section class="theme-checklist us-parks-checklist">
    <div class="us-park-grid">
      ${items.map((item) => renderUsParkCard(key, item)).join("")}
    </div>
  </section>`;
}

function renderUsNpsUnitsSection(key, list) {
  if (!usNpsUnits.length) {
    return `<section class="theme-checklist"><p class="muted small">${currentLanguage === "en" ? "Loading the complete NPS catalog..." : "正在加载完整 NPS 园区清单…"}</p></section>`;
  }
  const boundaryCount = usNpsUnits.filter((unit) => unit.hasBoundary).length;
  const groups = [...usNpsGroups].sort((left, right) => {
    if (left.id === "parks") return -1;
    if (right.id === "parks") return 1;
    return 0;
  }).map((group) => {
    const items = (group.items || []).filter((id) => usNpsUnitById.has(id));
    const done = items.filter((id) => isChecklistItemDone(key, id)).length;
    const groupId = checklistGroupId(key, group.id);
    const isOpen = isChecklistGroupOpen(groupId);
    return `<details class="country-checklist nps-unit-group" data-checklist-group="${escapeHtml(groupId)}" ${isOpen ? "open" : ""}>
      <summary><strong>${escapeHtml(currentLanguage === "en" ? group.label : usNpsDesignationChinese(group.label))}</strong><span>${done}/${items.length}</span></summary>
      <div class="us-park-grid nps-unit-grid">${items.map((id) => renderUsNpsUnitCard(key, id)).join("")}</div>
    </details>`;
  }).join("");
  return `<section class="theme-checklist us-nps-checklist">
    <div class="checklist-health">
      <span>${currentLanguage === "en" ? "Official NPS system catalog" : "NPS 官方完整系统清单"}</span>
      <span>${usNpsUnitTotal} ${currentLanguage === "en" ? "units" : "个园区"} · ${boundaryCount} ${currentLanguage === "en" ? "with map boundaries" : "个含地图边界"}</span>
      <span>${currentLanguage === "en" ? "Checking a unit lights every polygon sharing its park code." : "勾选园区后，同一园区代码下的所有 polygon 会同时点亮。"}</span>
    </div>
    <div class="country-checklist-list">${groups}</div>
  </section>`;
}

function renderUsNpsUnitCard(key, itemId) {
  const unit = usNpsUnitById.get(itemId);
  if (!unit) return "";
  const checked = isChecklistItemDone(key, itemId);
  const primary = currentLanguage === "en" ? unit.name : unit.zhName || unit.name;
  const secondary = currentLanguage === "en" ? unit.zhName || usNpsDesignationChinese(unit.designation) : unit.name;
  const sourceLabel = usNpsTranslationSourceLabel(unit.zhNameSource);
  return `<button class="us-park-card nps-unit-card ${checked ? "done" : ""}" data-checklist="${escapeHtml(key)}" data-item="${escapeHtml(itemId)}" title="${escapeHtml(sourceLabel)}" type="button">
    <span class="us-park-card-main">${escapeHtml(primary)}</span>
    <span class="us-park-card-sub">${escapeHtml(secondary)}</span>
    <span class="us-park-card-status">${checked ? t("checked") : unit.hasBoundary ? t("unvisited") : (currentLanguage === "en" ? "No boundary" : "暂无边界")}</span>
  </button>`;
}

function usNpsTranslationSourceLabel(source) {
  const labels = currentLanguage === "en"
    ? { "nps-official": "NPS Chinese", common: "Common Chinese name", "project-rule": "Project translation" }
    : { "nps-official": "NPS 官方中文", common: "通行中文译名", "project-rule": "项目统一译名" };
  return labels[source] || (currentLanguage === "en" ? "Chinese translation" : "中文译名");
}

function legacyUsNationalParkItemForUnit(unit) {
  if (!unit || unit.designation !== "National Parks") return "";
  return legacyUsNationalParkItems.find((item) => canonicalPlaceKey(englishNameInParentheses(item) || item) === canonicalPlaceKey(unit.name)) || "";
}

function usNpsDesignationChinese(designation) {
  return ({
    "Battlefields and Military Parks": "战场与军事园区",
    "Historic Sites and Memorials": "历史遗址与纪念园区",
    "Nature and Recreation Areas": "自然保护与休闲园区",
    "Other NPS Units": "其他 NPS 园区",
    "National Parks": "国家公园",
    "National Monuments": "国家纪念地",
    "National Historic Sites": "国家历史遗址",
    "National Historical Parks": "国家历史公园",
    "National Memorials": "国家纪念园",
    "National Recreation Areas": "国家休闲区",
    "National Preserves": "国家保护区",
    "National Seashores": "国家海岸",
    "National Lakeshores": "国家湖岸",
    "National Battlefields": "国家战场",
    "National Battlefield Parks": "国家战场公园",
    "National Battlefield Sites": "国家战场遗址",
    "National Military Parks": "国家军事公园",
    "National Rivers": "国家河流",
    "National Wild and Scenic Rivers": "国家野生与风景河流",
    "National Parkways": "国家公园大道",
    "National Scenic Trails": "国家风景步道",
    "National Historic Trails": "国家历史步道",
    "National Reserves": "国家保留地",
    "International Historic Sites": "国际历史遗址",
  })[designation] || designation;
}

function splitBilingualParkName(item) {
  const match = String(item || "").match(/^(.*?)（([^（）]+)）$/);
  if (!match) return { primary: item, secondary: "" };
  return currentLanguage === "en"
    ? { primary: match[2], secondary: match[1] }
    : { primary: match[1], secondary: match[2] };
}

function renderUsParkCard(key, item) {
  const checked = isChecklistItemDone(key, item);
  const name = splitBilingualParkName(item);
  return `<button class="us-park-card ${checked ? "done" : ""}" data-checklist="${escapeHtml(key)}" data-item="${escapeHtml(item)}" type="button">
    <span class="us-park-card-main">${escapeHtml(name.primary)}</span>
    ${name.secondary ? `<span class="us-park-card-sub">${escapeHtml(name.secondary)}</span>` : ""}
    <span class="us-park-card-status">${checked ? t("checked") : t("unvisited")}</span>
  </button>`;
}

function renderHighAltitudeSection(key, list) {
  const body = renderHighAltitudeBody(key, list);
  return `<section class="theme-checklist high-altitude-checklist">${body}</section>`;
}

function highAltitudeVisibleItems(list) {
  return (list.items || [])
    .filter((item) => highAltitudeFilters[highAltitudeFilterKeyFor(item)] !== false)
    .slice()
    .sort((a, b) => highAltitudeMetaFor(b).altitude - highAltitudeMetaFor(a).altitude);
}

function renderHighAltitudeBody(key, list) {
  const items = highAltitudeVisibleItems(list);
  const done = items.filter((item) => isChecklistItemDone(key, item)).length;
  const groupId = checklistGroupId(key, "all");
  const isOpen = isChecklistGroupOpen(groupId);
  const grouped = highAltitudeContinentGroups(items);
  return `<details class="high-altitude-details" data-checklist-group="${groupId}" ${isOpen ? "open" : ""}>
      <summary><strong>${checklistLabel(key, list)}</strong><span>${done}/${items.length}</span></summary>
      ${renderHighAltitudeFilterBar()}
      <div class="high-altitude-region-list">
        ${grouped.map(([continent, groupItems]) => renderHighAltitudeContinentGroup(key, continent, groupItems)).join("")}
      </div>
    </details>`;
}

function renderHighAltitudeInlineSection(key, list) {
  const items = highAltitudeVisibleItems(list);
  return `<div class="theme-checklist high-altitude-checklist high-altitude-inline">
    ${renderHighAltitudeFilterBar()}
    <div class="high-altitude-region-list">
      ${highAltitudeContinentGroups(items).map(([continent, groupItems]) => renderHighAltitudeContinentGroup(key, continent, groupItems)).join("")}
    </div>
  </div>`;
}

function highAltitudeContinentGroups(items) {
  const order = ["中国", "亚洲", "欧洲", "北美", "南美", "非洲", "大洋洲"];
  const groups = new Map(order.map((name) => [name, []]));
  (items || []).forEach((item) => {
    const continent = highAltitudeMetaFor(item).continent || "中国";
    if (!groups.has(continent)) groups.set(continent, []);
    groups.get(continent).push(item);
  });
  return Array.from(groups.entries()).filter(([, groupItems]) => groupItems.length);
}

function renderHighAltitudeContinentGroup(key, continent, items) {
  const groupId = checklistGroupId(key, `continent:${continent}`);
  const isOpen = isChecklistGroupOpen(groupId);
  const done = items.filter((item) => isChecklistItemDone(key, item)).length;
  const label = highAltitudeContinentLabel(continent);
  return `<details class="high-altitude-continent" data-checklist-group="${groupId}" ${isOpen ? "open" : ""}>
    <summary><strong>${escapeHtml(label)}</strong><span>${done}/${items.length}</span></summary>
    <div class="us-park-grid high-altitude-grid">
      ${items.map((item) => renderHighAltitudeCard(key, item)).join("")}
    </div>
  </details>`;
}

function highAltitudeContinentLabel(continent) {
  if (currentLanguage !== "en") return continent;
  return {
    中国: "China",
    亚洲: "Asia",
    欧洲: "Europe",
    北美: "North America",
    南美: "South America",
    非洲: "Africa",
    大洋洲: "Oceania",
  }[continent] || continent;
}

function renderHighAltitudeFilterBar() {
  const options = [
    ["threeMountains", currentLanguage === "en" ? "Three Mountains" : "三山"],
    ["fiveMountains", currentLanguage === "en" ? "Five Great Mountains" : "五岳"],
    ["buddhistMountains", currentLanguage === "en" ? "Buddhist Mountains" : "佛教名山"],
    ["taoistMountains", currentLanguage === "en" ? "Taoist Mountains" : "道教名山"],
    ["other", currentLanguage === "en" ? "Other high-altitude places" : "其他"],
  ];
  return `<div class="high-altitude-filter-bar">
    ${options.map(([key, label]) => `<label><input type="checkbox" data-high-altitude-filter="${key}" ${highAltitudeFilters[key] === false ? "" : "checked"}>${escapeHtml(label)}</label>`).join("")}
  </div>`;
}

function highAltitudeFilterKeyFor(item) {
  const type = highAltitudeMetaFor(item).type;
  if (type === "三山") return "threeMountains";
  if (type === "五岳") return "fiveMountains";
  if (type === "佛教名山") return "buddhistMountains";
  if (type === "道教名山") return "taoistMountains";
  return "other";
}

function parseHighAltitudeItem(item) {
  const parts = String(item || "").split("·").map((part) => part.trim()).filter(Boolean);
  const altitudeText = parts.at(-1) || "";
  const altitude = Number((altitudeText.match(/\d+/) || [""])[0]) || 0;
  return {
    name: parts[0] || item,
    point: parts.slice(1, -1).join(" · "),
    altitude,
    altitudeText,
  };
}

function highAltitudeMetaFor(item) {
  const parsed = parseHighAltitudeItem(item);
  const meta = checklistCatalog.chinaHighAltitude?.meta?.[item] || {};
  return {
    country: "中国",
    countryId: "cn",
    province: "",
    geoUnit: "",
    point: parsed.point,
    altitude: parsed.altitude,
    type: "",
    continent: "中国",
    ...meta,
  };
}

const highAltitudeTypeEnglish = {
  "垭口": "Pass",
  "公路山口": "Road pass",
  "徒步山口": "Trekking pass",
  "公路高点": "Road high point",
  "公路观景": "Road viewpoint",
  "公路观景点": "Road viewpoint",
  "山岳公路": "Mountain road",
  "高原湖泊": "Highland lake",
  "高山湖泊": "Alpine lake",
  "高山湖区": "Alpine lakes",
  "高原盐湖": "Highland salt flat",
  "高原地热": "Highland geothermal area",
  "高原城市": "Highland city",
  "高原保护地": "Highland reserve",
  "高原文化点": "Highland cultural site",
  "雪山观景": "Snow mountain viewpoint",
  "雪山景区": "Snow mountain area",
  "雪山徒步": "Snow mountain trek",
  "雪山观景/徒步": "Snow mountain viewpoint / trek",
  "冰川景区": "Glacier area",
  "冰川观景": "Glacier viewpoint",
  "缆车高点": "Cable car high point",
  "缆车观景": "Cable car viewpoint",
  "缆车/地铁高点": "Cable car / alpine metro",
  "缆车/冰川观景": "Cable car / glacier viewpoint",
  "登山铁路": "Mountain railway",
  "登山铁路高点": "Mountain railway",
  "名山": "Famous mountain",
  "名山/公路": "Famous mountain / road",
  "名山/铁路": "Famous mountain / railway",
  "名山/徒步": "Famous mountain / trek",
  "名山/缆车": "Famous mountain / cable car",
  "名山/高山": "Famous mountain",
  "名山/遗址": "Famous mountain / heritage site",
  "名山/朝圣": "Famous mountain / pilgrimage",
  "名山/缆车徒步": "Famous mountain / cable car trek",
  "国家最高峰/徒步": "National high point / trek",
  "国家高点/徒步": "National high point / trek",
  "国家公园徒步": "National park trek",
  "国家公园观景": "National park viewpoint",
  "国家公园公路": "National park road",
  "国家公园名山": "National park mountain",
  "国家纪念地观景": "National monument viewpoint",
  "世界级名山观景": "Iconic mountain viewpoint",
  "火山/公路": "Volcano / road",
  "火山/徒步": "Volcano / trek",
  "火山/缆车": "Volcano / cable car",
  "火山/山屋": "Volcano / mountain hut",
  "火山景区": "Volcano area",
  "火山观景": "Volcano viewpoint",
  "火山湖": "Crater lake",
  "峡谷观景": "Canyon viewpoint",
  "峡谷/徒步": "Canyon / trek",
  "滑雪区": "Ski area",
  "滑雪/缆车": "Ski area / cable car",
  "佛教名山": "Buddhist mountain",
  "道教名山": "Taoist mountain",
  "三山": "Classic Chinese mountain",
  "五岳": "Five Great Mountains",
  "神山": "Sacred mountain",
  "国门/口岸": "Border pass",
};

function highAltitudeTypeDisplay(type) {
  if (!type) return "";
  if (currentLanguage !== "en") return type;
  return highAltitudeTypeEnglish[type] || String(type).replace(/[^\x00-\x7F]+/g, "").trim() || "Travel high point";
}

function renderHighAltitudeFact(label, value, className = "") {
  return value ? `<span class="${className}"><b>${escapeHtml(label)}</b><em>${escapeHtml(value)}</em></span>` : "";
}

function renderHighAltitudeCard(key, item) {
  const checked = isChecklistItemDone(key, item);
  const meta = highAltitudeMetaFor(item);
  const localized = currentLanguage === "en"
    ? parseHighAltitudeItem(checklistItemDisplayName(key, item))
    : parseHighAltitudeItem(item);
  const labelCountry = currentLanguage === "en" ? "Country/region" : "国家/地区";
  const labelProvince = currentLanguage === "en" ? "Area" : "省区";
  const labelGeo = currentLanguage === "en" ? "Geo unit" : "关联山体/地理单元";
  const labelPoint = currentLanguage === "en" ? "Reachable point" : "可达点";
  const labelType = currentLanguage === "en" ? "Type" : "类型";
  const altitudeText = `${meta.altitude || localized.altitude}m`;
  const countryText = currentLanguage === "en" && meta.countryId ? countryDisplayName(meta.countryId) : meta.country;
  const factRows = currentLanguage === "en"
    ? [
        renderHighAltitudeFact(labelCountry, countryText || "-"),
        renderHighAltitudeFact(labelGeo, localized.name || "-", "wide"),
        renderHighAltitudeFact(labelPoint, localized.point || "-"),
        renderHighAltitudeFact(labelType, highAltitudeTypeDisplay(meta.type) || "-"),
      ]
    : [
        renderHighAltitudeFact(labelCountry, countryText || "-"),
        renderHighAltitudeFact(labelProvince, meta.province || "-"),
        renderHighAltitudeFact(labelGeo, meta.geoUnit || "-", "wide"),
        renderHighAltitudeFact(labelPoint, meta.point || localized.point || "-"),
        renderHighAltitudeFact(labelType, meta.type || "-"),
      ];
  return `<button class="us-park-card high-altitude-card ${checked ? "done" : ""}" data-checklist="${escapeHtml(key)}" data-item="${escapeHtml(item)}" type="button">
    <span class="high-altitude-head">
      <span class="us-park-card-main">${escapeHtml(localized.name)}</span>
      <span class="high-altitude-badges">
        <span class="high-altitude-meter">${escapeHtml(altitudeText)}</span>
        <span class="us-park-card-status">${checked ? t("checked") : t("unvisited")}</span>
      </span>
    </span>
    <span class="high-altitude-facts">
      ${factRows.join("")}
    </span>
  </button>`;
}

const ancientCapitalEraOrder = [
  "上古与夏商周",
  "春秋战国",
  "秦汉及同期",
  "三国两晋",
  "十六国",
  "南北朝",
  "隋唐及同期",
  "五代十国",
  "宋辽夏金及同期",
  "元及元末",
  "明清及同期",
  "边疆与并立政权",
  "近现代",
];

function ancientCapitalDisplayEra(era) {
  if (era === "上古与夏商周") return currentLanguage === "en" ? "Xia, Shang and Zhou" : "夏商周";
  return era || (currentLanguage === "en" ? "Unassigned" : "未分时代");
}

function ancientCapitalPrimaryEra(item) {
  if (item?.era) return item.era;
  if (item?.sourceEra) return item.sourceEra;
  const eras = item?.eras || [];
  return eras.slice().sort((left, right) => ancientCapitalEraIndex(left) - ancientCapitalEraIndex(right))[0] || (currentLanguage === "en" ? "Unassigned" : "未分时代");
}

function ancientCapitalEraIndex(era) {
  const index = ancientCapitalEraOrder.indexOf(era);
  return index === -1 ? ancientCapitalEraOrder.length : index;
}

function ancientCapitalYearText(item, field) {
  if (field === "都城年代（原文）" && item?.capitalYears) return escapeHtml(item.capitalYears);
  if (field === "政权年代（原文）" && item?.regimeYears) return escapeHtml(item.regimeYears);
  const values = (item?.records || []).map((record) => record?.[field]).filter(Boolean);
  return compactInlineValues(Array.from(new Set(values)), 4);
}

function ancientCapitalCoordinateKey(lng, lat) {
  const safeLng = Number(lng);
  const safeLat = Number(lat);
  if (!Number.isFinite(safeLng) || !Number.isFinite(safeLat)) return "";
  return `${safeLng.toFixed(5)},${safeLat.toFixed(5)}`;
}

function uniqueTextValues(values) {
  const seen = new Set();
  return (values || [])
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => String(value || "").trim())
    .filter((value) => {
      const key = canonicalPlaceKey(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function compactMapLabelValues(values, limit = 3, separator = " · ") {
  const list = uniqueTextValues(values);
  const shown = list.slice(0, limit);
  const suffix = list.length > shown.length ? ` +${list.length - shown.length}` : "";
  return `${shown.join(separator)}${suffix}`;
}

function ancientCapitalMapTitle(item) {
  return ancientCapitalCurrentDisplayName(item) || item?.name || "";
}

function ancientCapitalMapSubtitle(item) {
  const eras = compactMapLabelValues((item?.eras || []).map(ancientCapitalDisplayEra), 2, "、");
  const recordCount = Number(item?.recordCount) || (Array.isArray(item?.records) ? item.records.length : 0);
  const count = recordCount > 1
    ? (currentLanguage === "en" ? `${recordCount} records` : `${recordCount} 条记录`)
    : "";
  return [eras, count].filter(Boolean).join(" · ");
}

function ancientCapitalMetaForPlace(place) {
  if (!place) return null;
  if (place.checklistKey !== "chinaAncientCapitals" && !chinaAncientCapitalMeta[canonicalPlaceKey(place.name)]) return null;
  const meta = chinaAncientCapitalMeta[canonicalPlaceKey(place.name)] || null;
  return ancientCapitalMergedMeta(meta) || meta;
}

function ancientCapitalMergedMeta(meta) {
  if (!meta?.siteKey || meta.isMergedSite) return meta || null;
  return Object.values(chinaAncientCapitalMeta)
    .find((candidate) => candidate?.isMergedSite && candidate.siteKey === meta.siteKey) || meta;
}

function mapCheckinTitle(place) {
  const capitalMeta = ancientCapitalMetaForPlace(place);
  if (capitalMeta) return ancientCapitalMapTitle(capitalMeta);
  if (place?.checklistKey) return checklistItemDisplayName(place.checklistKey, place.name);
  return place?.name || "";
}

function mapCheckinSubtitle(place) {
  const capitalMeta = ancientCapitalMetaForPlace(place);
  if (capitalMeta) return ancientCapitalMapSubtitle(capitalMeta) || checklistCatalog.chinaAncientCapitals.label;
  return `${getCountry(place?.country).name} · ${place?.unit || t("unassigned")}`;
}

function ancientCapitalSourceOrder(item) {
  const order = Number(item?.sourceOrder);
  return Number.isFinite(order) ? order : Number.POSITIVE_INFINITY;
}

function ancientCapitalSiteKeyForItem(item) {
  if (!item) return "";
  if (typeof item === "object") {
    if (item.siteKey) return item.siteKey;
    if (item.currentKey) return item.currentKey;
    const current = ancientCapitalCurrentDisplayName(item);
    if (current) return `ancient-current:${canonicalPlaceKey(current)}`;
    return item.siteName ? `ancient-site:${canonicalPlaceKey(item.siteName)}` : "";
  }
  const meta = chinaAncientCapitalMeta[canonicalPlaceKey(item)];
  if (meta?.siteKey) return meta.siteKey;
  if (meta?.currentKey) return meta.currentKey;
  const current = ancientCapitalCurrentDisplayName(meta);
  if (current) return `ancient-current:${canonicalPlaceKey(current)}`;
  return meta?.siteName ? `ancient-site:${canonicalPlaceKey(meta.siteName)}` : "";
}

function ancientCapitalStartYear(item) {
  const candidates = (item?.records || [])
    .flatMap((record) => [record?.["都城年代（原文）"], record?.["政权年代（原文）"]])
    .map(extractAncientYear)
    .filter(Number.isFinite);
  return candidates.length ? Math.min(...candidates) : Number.POSITIVE_INFINITY;
}

function extractAncientYear(value) {
  const text = String(value || "").trim();
  if (!text) return Number.NaN;
  const match = text.match(/(?:公元前|前|BC|BCE)?\s*(\d{1,4})/i);
  if (!match) return Number.NaN;
  const year = Number(match[1]);
  return /公元前|前|BC|BCE/i.test(match[0]) || /公元前|前/.test(text.slice(0, match.index + match[0].length))
    ? -year
    : year;
}

function renderAncientCapitalsSection() {
  const key = "chinaAncientCapitals";
  const items = Array.isArray(chinaAncientCapitals?.recordItems) && chinaAncientCapitals.recordItems.length
    ? chinaAncientCapitals.recordItems
    : (Array.isArray(chinaAncientCapitals?.items) ? chinaAncientCapitals.items : []);
  const done = checklistDoneCount(key);
  const groups = new Map();
  items
    .slice()
    .sort((left, right) => {
      const eraDiff = ancientCapitalEraIndex(ancientCapitalPrimaryEra(left)) - ancientCapitalEraIndex(ancientCapitalPrimaryEra(right));
      if (eraDiff) return eraDiff;
      const orderDiff = ancientCapitalSourceOrder(left) - ancientCapitalSourceOrder(right);
      if (Number.isFinite(orderDiff) && orderDiff) return orderDiff;
      const yearDiff = ancientCapitalStartYear(left) - ancientCapitalStartYear(right);
      if (Number.isFinite(yearDiff) && yearDiff) return yearDiff;
      return left.name.localeCompare(right.name, "zh-Hans-CN");
    })
    .forEach((item) => {
      const era = ancientCapitalPrimaryEra(item);
      if (!groups.has(era)) groups.set(era, []);
      groups.get(era).push(item);
    });
  const blocks = Array.from(groups.entries()).map(([era, groupItems]) => {
    const groupDone = groupItems.filter((item) => isChecklistItemDone(key, item.name)).length;
    const groupId = checklistGroupId(key, era);
    const isOpen = isChecklistGroupOpen(groupId);
    return `<details class="country-checklist ancient-capital-era" data-checklist-group="${groupId}" data-ancient-era="${escapeHtml(era)}" ${isOpen ? "open" : ""}>
      <summary><strong>${escapeHtml(ancientCapitalDisplayEra(era))}</strong><span>${groupDone}/${groupItems.length}</span></summary>
      <div class="ancient-capital-grid">${groupItems.map((item) => renderAncientCapitalCard(key, item)).join("")}</div>
    </details>`;
  }).join("");
  const sourceText = currentLanguage === "en"
    ? `${items.length} source records, ${chinaAncientCapitals?.siteCount || 0} map places`
    : `${items.length} 条原表记录，${chinaAncientCapitals?.siteCount || 0} 个地图地点`;
  return `<section class="theme-checklist ancient-capitals-checklist">
    <div class="checklist-health"><span>${sourceText}</span><span>${currentLanguage === "en" ? "Grouped by era" : "按时代排列"}</span></div>
    <div class="country-checklist-list">${blocks}</div>
  </section>`;
}

function renderAncientCapitalCard(key, item) {
  const checked = isChecklistItemDone(key, item.name);
  const labels = currentLanguage === "en"
    ? { dynasty: "Dynasty", capitalYears: "Capital years", regimeYears: "Regime years", site: "Source place", admin: "Current area", type: "Capital type", confidence: "Confidence" }
    : { dynasty: "政权", capitalYears: "都城年代", regimeYears: "政权年代", site: "口径", admin: "今属", type: "都城类型", confidence: "置信度" };
  const dynasty = item.dynasty || compactInlineValues(item.dynasties, 4);
  const siteNote = renderAncientCapitalSiteNote(item, labels.site);
  return `<button class="ancient-capital-card ${checked ? "done" : ""}" data-checklist="${escapeHtml(key)}" data-item="${escapeHtml(item.name)}" type="button">
    <span class="ancient-capital-card-head">
      <strong>${renderAncientCapitalTitle(item)}</strong>
      <span class="us-park-card-status">${checked ? t("checked") : t("unvisited")}</span>
    </span>
    <span class="ancient-capital-card-row"><b>${labels.dynasty}</b><em>${escapeHtml(dynasty || t("none"))}</em></span>
    <span class="ancient-capital-card-row wide"><b>${labels.capitalYears}</b><em>${ancientCapitalYearText(item, "都城年代（原文）")}</em></span>
    <span class="ancient-capital-card-row wide"><b>${labels.regimeYears}</b><em>${ancientCapitalYearText(item, "政权年代（原文）")}</em></span>
    ${siteNote}
    <span class="ancient-capital-card-row wide"><b>${labels.admin}</b><em>${escapeHtml(item.admin || t("none"))}</em></span>
    <span class="ancient-capital-card-row wide"><b>${labels.type}</b><em>${escapeHtml(item.capitalType || compactInlineValues(item.capitalTypes) || t("none"))}</em></span>
    <span class="ancient-capital-card-row"><b>${labels.confidence}</b><em>${escapeHtml(item.confidence || t("none"))}</em></span>
  </button>`;
}

function renderAncientCapitalTitle(item) {
  const ancient = item?.ancientName || item?.name || "";
  const current = ancientCapitalCurrentDisplayName(item);
  const labels = currentLanguage === "en"
    ? ["Ancient", "Current place"]
    : ["古称", "今址"];
  return `<span class="ancient-capital-title-pair"><span><em>${labels[0]}</em>${escapeHtml(ancient)}</span><span><em>${labels[1]}</em>${escapeHtml(current)}</span></span>`;
}

function renderAncientCapitalSiteNote(item, label) {
  const site = item?.siteName || item?.parentName || "";
  if (!site || sameAdminName(site, ancientCapitalCurrentDisplayName(item))) return "";
  return `<span class="ancient-capital-card-row wide"><b>${label}</b><em>${escapeHtml(site)}</em></span>`;
}

function ancientCapitalCurrentDisplayName(item) {
  if (item?.currentPlace) return item.currentPlace;
  const site = item?.siteName || item?.parentName || item?.name || "";
  const admin = item?.admin || "";
  const overrides = {
    南京析津: "北京",
    天京: "南京",
    汴州: "开封",
    幽州: "北京",
    兴庆府: "银川",
    毫州: "亳州",
    平江: "苏州",
  };
  if (overrides[site]) return overrides[site];
  if (site === item?.ancientName) {
    const adminCity = ancientCapitalAdminCity(admin);
    if (adminCity) return adminCity;
  }
  return site;
}

function ancientCapitalAdminCity(admin) {
  const text = String(admin || "");
  const direct = text.match(/^(北京|上海|天津|重庆)市/);
  if (direct) return direct[1];
  const city = text.match(/([^省自治区特别行政区]+市)/);
  if (city) return city[1].replace(/市$/, "");
  const county = text.match(/([^省自治区特别行政区]+县)/);
  if (county) return county[1].replace(/县$/, "");
  return "";
}

function compactInlineValues(values, limit = 6) {
  const list = (values || []).filter(Boolean).slice(0, limit);
  if (!list.length) return escapeHtml(t("none"));
  return list.map((value) => escapeHtml(value)).join("、");
}

function renderRegionChecklistSection(key, list) {
  const blocks = Object.entries(list.byRegion).map(([region, items]) => {
    const displayItems = displayChecklistItems(key, items);
    const done = displayItems.filter((item) => isChecklistItemDone(key, item, region)).length;
    const groupId = checklistGroupId(key, region);
    return `<details class="country-checklist" data-checklist-group="${groupId}">
      <summary><strong>${checklistGroupDisplayName(key, region)}</strong><span>${done}/${displayItems.length}</span></summary>
      ${renderChecklistChipGrid(key, displayItems, region)}
    </details>`;
  }).join("");
  return `<section class="theme-checklist featured-checklist">
    <header><strong>${checklistLabel(key, list)}</strong><span>${checklistDoneCount(key)}/${checklistTotalCount(key)}</span></header>
    <div class="country-checklist-list">${blocks}</div>
  </section>`;
}

function renderCountryChecklistSection(key, list) {
  const heritageCountryCount = Object.keys(checklistCatalog.worldHeritage.byCountry || {}).length;
  const heritageLoaded = Object.keys(worldHeritageCoordinates || {}).length > 0;
  const visitedHeritageCountries = key === "worldHeritage" ? visitedWorldHeritageCountryNames(list.byCountry) : null;
  const heritageHealth = currentLanguage === "en"
    ? [
      heritageLoaded ? "Local Wikidata catalog" : "Built-in fallback catalog",
      `${worldHeritageCatalogStatus.total || checklistTotalCount("worldHeritage")} records, showing ${visitedHeritageCountries?.size || 0}/${heritageCountryCount} visited countries/regions`,
    ]
    : [
      heritageLoaded ? "本地 Wikidata 清单" : "内置备用清单",
      `${worldHeritageCatalogStatus.total || checklistTotalCount("worldHeritage")} 条记录，仅显示已点亮国家/地区：${visitedHeritageCountries?.size || 0}/${heritageCountryCount}`,
    ];
  const health = key === "worldHeritage" ? `<div class="checklist-health">
      <span>${heritageHealth[0]}</span>
      <span>${heritageHealth[1]}</span>
      <span>${currentLanguage === "en" ? "Light up a country first to show its World Heritage list here." : "需要先在点亮页或地图点亮国家/地区，才会显示对应世界遗产清单。"}</span>
    </div>` : "";
  const countryEntries = Object.entries(list.byCountry)
    .filter(([country]) => key !== "worldHeritage" || visitedHeritageCountries.has(country))
    .map(([country, items]) => {
      const displayItems = displayChecklistItems(key, items);
      return {
        country,
        displayItems,
        done: displayItems.filter((item) => isChecklistItemDone(key, item)).length,
      };
    })
    .filter(({ displayItems }) => key !== "worldHeritage" || displayItems.length)
    .sort((left, right) => {
      const leftCountry = left.country;
      const rightCountry = right.country;
      const leftIsChina = leftCountry === "中国" ? 1 : 0;
      const rightIsChina = rightCountry === "中国" ? 1 : 0;
      if (leftIsChina !== rightIsChina) return rightIsChina - leftIsChina;
      if (key === "worldHeritage") {
        const leftSpecial = ["澳门", "香港", "台湾"].includes(leftCountry) ? 1 : 0;
        const rightSpecial = ["澳门", "香港", "台湾"].includes(rightCountry) ? 1 : 0;
        if (leftSpecial !== rightSpecial) return rightSpecial - leftSpecial;
        if (left.done !== right.done) return right.done - left.done;
        return leftCountry.localeCompare(rightCountry, "zh-Hans-CN");
      }
      if (left.done !== right.done) return right.done - left.done;
      if (left.displayItems.length !== right.displayItems.length) return right.displayItems.length - left.displayItems.length;
      return leftCountry.localeCompare(rightCountry, "zh-Hans-CN");
    });
  const countryBlocks = countryEntries.map(({ country, displayItems, done }) => {
    const groupId = checklistGroupId(key, country);
    const isOpen = key !== "worldHeritage" && isChecklistGroupOpen(groupId);
    const summaryCount = `${done}/${displayItems.length}`;
    const itemButtons = isOpen
      ? renderChecklistChipGrid(key, displayItems)
      : `<div class="check-chip-grid checklist-lazy-placeholder" data-lazy-checklist="${escapeHtml(key)}" data-lazy-country="${escapeHtml(country)}"><p class="muted small">${currentLanguage === "en" ? "Expand to load this list." : "展开后加载该分组。"}</p></div>`;
    return `<details class="country-checklist" data-checklist-group="${groupId}" ${isOpen ? "open" : ""}>
      <summary><strong>${checklistGroupDisplayName(key, country)}</strong><span data-checklist-summary-count>${summaryCount}</span></summary>
      ${itemButtons}
    </details>`;
  }).join("");
  const emptyWorldHeritage = key === "worldHeritage" && !countryBlocks
    ? `<p class="muted small">${currentLanguage === "en" ? "No country is lit yet. Go to Light Up or click a country on the map first." : "还没有可显示的世界遗产国家清单。请先到“点亮”页面，或在地图上点亮国家/地区。"}</p>`
    : "";
  return `<section class="theme-checklist">
    ${health}
    ${emptyWorldHeritage}
    <div class="country-checklist-list">${countryBlocks}</div>
  </section>`;
}

function checklistDoneCount(key) {
  if (key === "worldHeritage") return worldHeritageDoneCount();
  const list = checklistCatalog[key] || {};
  const entries = list.byRegion
    ? Object.entries(list.byRegion).flatMap(([group, items]) => items.map((item) => ({ item, group })))
    : checklistItemsFor(key).map((item) => ({ item, group: "" }));
  return entries.filter(({ item, group }) => isChecklistItemDone(key, item, group)).length;
}

function worldHeritageMainKey(item) {
  const itemKey = canonicalPlaceKey(item);
  return worldHeritageParentKeys[itemKey] || itemKey;
}

function worldHeritageDoneCount() {
  const doneMainKeys = new Set();
  checklistItemsFor("worldHeritage").forEach((item) => {
    const mainKey = worldHeritageMainKey(item);
    if (isChecklistItemDone("worldHeritage", item)) doneMainKeys.add(mainKey);
  });
  return doneMainKeys.size;
}

function checklistTotalCount(key) {
  if (Object.prototype.hasOwnProperty.call(fixedChecklistTotals, key)) return fixedChecklistTotals[key];
  return checklistItemsFor(key).length;
}

function checklistItemsFor(key) {
  const list = checklistCatalog[key];
  if (list.byRegion) return Object.values(list.byRegion).flat();
  if (list.byCountry) return Object.values(list.byCountry).flat();
  return list.items;
}

function isChecklistEntryDirectlyDone(key, item, group = "") {
  const itemKey = checklistItemKey(key, item, group);
  const legacyKey = canonicalPlaceKey(item);
  const canonicalKey = checklistCanonicalKey(item);
  const coordinateKey = checklistCoordinateKeyForItem(key, item, group);
  const { marked, visited } = checklistStatusKeys();
  if (
    marked.has(itemKey)
    || visited.has(itemKey)
    || (canonicalKey && (marked.has(canonicalKey) || visited.has(canonicalKey)))
    || (coordinateKey && (marked.has(coordinateKey) || visited.has(coordinateKey)))
    || (!isAmbiguousChecklistItem(key, item) && (marked.has(legacyKey) || visited.has(legacyKey)))
  ) return true;
  if (key === "chinaHighAltitude") {
    const baseKey = canonicalPlaceKey(parseHighAltitudeItem(item).name);
    if (baseKey && (marked.has(baseKey) || visited.has(baseKey))) return true;
  }
  if (key === "usNationalParks" && usNpsUnitById.has(String(item || ""))) {
    const legacyItem = legacyUsNationalParkItemForUnit(usNpsUnitById.get(item));
    const legacyItemKey = legacyItem ? checklistItemKey(key, legacyItem) : "";
    const legacyNameKey = legacyItem ? canonicalPlaceKey(legacyItem) : "";
    if ((legacyItemKey && (marked.has(legacyItemKey) || visited.has(legacyItemKey))) || (legacyNameKey && (marked.has(legacyNameKey) || visited.has(legacyNameKey)))) return true;
  }
  return false;
}

function isChecklistItemDone(key, item, group = "") {
  if (key !== "usNationalParks" && key !== "worldHeritage") return isChecklistEntryDirectlyDone(key, item, group);
  const index = buildUnifiedParkHeritageIndex();
  const entityId = index.byEntry.get(checklistEntryIdentity(key, item, group)) || parkHeritageEntityId(key, item);
  if (!entityId) return isChecklistEntryDirectlyDone(key, item, group);
  const status = checklistStatusKeys();
  if (unifiedParkHeritageDoneCache.signature !== status.signature) {
    unifiedParkHeritageDoneCache = { signature: status.signature, values: new Map() };
  }
  if (!unifiedParkHeritageDoneCache.values.has(entityId)) {
    const entries = index.byEntity.get(entityId) || [{ key, item, group }];
    unifiedParkHeritageDoneCache.values.set(entityId, entries.some((entry) => isChecklistEntryDirectlyDone(entry.key, entry.item, entry.group || "")));
  }
  return unifiedParkHeritageDoneCache.values.get(entityId);
}

function checklistId(key, item, group = "") {
  return `${key}:${checklistItemKey(key, item, group)}`;
}

function checklistItemKey(key, item, context = null) {
  if (key === "usNationalParks" && usNpsUnitById.has(String(item || ""))) return canonicalPlaceKey(String(item || ""));
  const itemKey = canonicalPlaceKey(item);
  if (key === "chinaAncientCapitals") return ancientCapitalSiteKeyForItem(item) || itemKey;
  const canonical = checklistCanonicalKey(item);
  if (canonical) return canonical;
  if (key !== "china5a") return itemKey;
  const region = typeof context === "string" ? context : (context?.unit || checklistCoordinateFor(item)?.[2] || china5aRegionForItem(item));
  const regionKey = canonicalPlaceKey(region);
  return regionKey ? `${regionKey}:${itemKey}` : itemKey;
}

function china5aRegionForItem(item) {
  const itemKey = canonicalPlaceKey(item);
  for (const [region, items] of Object.entries(checklistCatalog.china5a?.byRegion || {})) {
    if (items.some((candidate) => canonicalPlaceKey(candidate) === itemKey)) return region;
  }
  return "";
}

function isAmbiguousChecklistItem(key, item) {
  if (key !== "china5a") return false;
  const itemKey = canonicalPlaceKey(item);
  let count = 0;
  for (const items of Object.values(checklistCatalog.china5a?.byRegion || {})) {
    count += items.filter((candidate) => canonicalPlaceKey(candidate) === itemKey).length;
    if (count > 1) return true;
  }
  return false;
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

function fillLazyChecklistGroup(details) {
  const placeholder = details?.querySelector?.("[data-lazy-checklist]");
  if (!placeholder) return;
  const key = placeholder.dataset.lazyChecklist;
  const group = placeholder.dataset.lazyCountry || placeholder.dataset.lazyGroup || "";
  const catalog = checklistCatalog[key] || {};
  const items = displayChecklistItems(key, catalog.byCountry?.[group] || catalog.byRegion?.[group] || []);
  const summaryCount = details.querySelector?.("[data-checklist-summary-count]");
  if (summaryCount) {
    const done = items.filter((item) => isChecklistItemDone(key, item, group)).length;
    summaryCount.textContent = `${done}/${items.length}`;
  }
  placeholder.outerHTML = renderChecklistChipGrid(key, items, group);
}

function scheduleFillLazyChecklistGroup(details, afterFill) {
  const placeholder = details?.querySelector?.("[data-lazy-checklist]");
  if (!placeholder) {
    if (typeof afterFill === "function") afterFill();
    return;
  }
  if (placeholder.dataset.loading === "1") {
    if (typeof afterFill === "function") window.setTimeout(afterFill, 80);
    return;
  }
  placeholder.dataset.loading = "1";
  placeholder.innerHTML = `<p class="muted small">${currentLanguage === "en" ? "Loading this group..." : "正在加载该分组..."}</p>`;
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      fillLazyChecklistGroup(details);
      if (typeof afterFill === "function") afterFill();
    }, 0);
  });
}

async function toggleChecklistItem(key, item, group = "") {
  const id = checklistId(key, item, group);
  const itemKey = checklistItemKey(key, item, group);
  const legacyKey = canonicalPlaceKey(item);
  const canonicalKey = checklistCanonicalKey(item);
  const coordinateKey = checklistCoordinateKeyForItem(key, item, group);
  const removalKeys = relatedChecklistRemovalKeys(key, item, group);
  const highAltitudeBaseKey = key === "chinaHighAltitude" ? canonicalPlaceKey(parseHighAltitudeItem(item).name) : "";
  const legacyUsParkItem = key === "usNationalParks" ? legacyUsNationalParkItemForUnit(usNpsUnitById.get(item)) : "";
  const legacyUsParkKeys = new Set([
    legacyUsParkItem ? checklistItemKey(key, legacyUsParkItem) : "",
    legacyUsParkItem ? canonicalPlaceKey(legacyUsParkItem) : "",
  ].filter(Boolean));
  const marks = new Set(state.checklistMarks || []);
  const wasDone = isChecklistItemDone(key, item, group);
  if (wasDone) {
    Array.from(marks).forEach((mark) => {
      const markRawKey = mark.split(":").slice(1).join(":");
      const markKey = canonicalPlaceKey(markRawKey);
      if (
        markRawKey === itemKey
        || markKey === itemKey
        || (canonicalKey && markRawKey === canonicalKey)
        || (canonicalKey && markKey === canonicalKey)
        || (coordinateKey && markRawKey === coordinateKey)
        || removalKeys.raw.has(markRawKey)
        || removalKeys.normalized.has(markKey)
        || (!isAmbiguousChecklistItem(key, item) && markKey === legacyKey)
        || (highAltitudeBaseKey && markKey === highAltitudeBaseKey)
        || legacyUsParkKeys.has(markRawKey)
        || legacyUsParkKeys.has(markKey)
      ) marks.delete(mark);
    });
    const linkedEntries = relatedChecklistEntriesForItem(key, item, group);
    (linkedEntries.length ? linkedEntries : [{ key, item, group }]).forEach((entry) => {
      unvisitChecklistItem(entry.key, entry.item, entry.group || "");
    });
    if (highAltitudeBaseKey) {
      const ids = new Set(places.filter((place) => canonicalPlaceKey(place.name) === highAltitudeBaseKey).map((place) => place.id));
      state.visits = state.visits.filter((visit) => !ids.has(visit.placeId));
      places = places.filter((place) => !(place.checklistOnly && ids.has(place.id)));
    }
  } else {
    marks.add(id);
    const place = ensureChecklistPlace(key, item, group);
    if (Number.isFinite(place?.lng) && Number.isFinite(place?.lat)) {
      if (!canUseChecklistCatalogGeography(key, item)) await ensureBoundaryLayersForPoint(place.country, place.lng, place.lat);
      applyChecklistGeography(place, key, checklistCoordinateFor(item, group));
    }
  }
  state.checklistMarks = Array.from(marks);
  checklistStatusCache.signature = "";
  unifiedParkHeritageDoneCache = { signature: "", values: new Map() };
  rebuildCoverageFromSavedVisits();
  invalidateCoverageMapGeoJsonCache();
  saveStateSoon();
  renderAfterChecklistChange(key, item, group, wasDone);
  if (document.querySelector('[data-page="imports"]')?.classList.contains("active")) renderDataInventory();
}

function renderAfterChecklistChange(key, item, group = "", wasDone = null) {
  invalidateMapPointRenderCache();
  const refreshedSection = refreshRenderedChecklistSectionMarkup(key);
  if (!refreshedSection || checklistCanonicalKey(item)) updateChecklistButtonsForItem(key, item, group);
  const relatedEntries = relatedChecklistEntriesForItem(key, item, group);
  const relatedKeys = new Set([key, ...relatedEntries.map((entry) => entry.key)]);
  if ((key === "usNationalParks" || key === "worldHeritage") && typeof wasDone === "boolean") {
    const delta = wasDone ? -1 : 1;
    relatedKeys.forEach((relatedKey) => adjustRenderedChecklistCount(relatedKey, delta));
    const relatedGroups = new Set(relatedEntries.map((entry) => {
      if (entry.key === "usNationalParks") return `${entry.key}:${usNpsUnitById.get(entry.item)?.designationId || ""}`;
      return `${entry.key}:${entry.group || ""}`;
    }).filter((value) => !value.endsWith(":")));
    relatedGroups.forEach((value) => {
      const separator = value.indexOf(":");
      refreshRenderedChecklistGroupStat(value.slice(0, separator), value.slice(separator + 1));
    });
  } else {
    relatedKeys.forEach((relatedKey) => {
      const relatedEntry = relatedEntries.find((entry) => entry.key === relatedKey);
      const statsGroup = relatedKey === "usNationalParks"
        ? (usNpsUnitById.get(relatedEntry?.item || item)?.designationId || group)
        : (relatedEntry?.group || (relatedKey === key ? group : ""));
      refreshRenderedChecklistStats(relatedKey, statsGroup);
    });
  }
  if (key !== "usNationalParks" && key !== "worldHeritage") refreshCanonicalChecklistStats(item);
  if (document.querySelector('[data-page="dashboard"]')?.classList.contains("active")) {
    renderMetrics();
    renderDashboardAchievements();
    renderNextStops();
  }
  if (document.querySelector('[data-page="checkins"]')?.classList.contains("active") && !canRefreshChecklistChangeLocally(key)) renderCheckinsPage();
  if (!$("#mapDetail")?.classList.contains("hidden")) renderChecklistMapDetail(key, item);
  if (document.querySelector('[data-page="imports"]')?.classList.contains("active")) renderDataInventory();
  const linkedToUsNationalPark = key === "usNationalParks"
    || relatedEntries.some((entry) => entry.key === "usNationalParks");
  if (isMapPageActive()) {
    const affectedNpsCodes = new Set();
    const addUnitCodes = (unit) => {
      if (!unit) return;
      [unit.code, ...(unit.alternateCodes || [])].forEach((code) => affectedNpsCodes.add(String(code).toUpperCase()));
    };
    if (key === "usNationalParks") addUnitCodes(usNpsUnitById.get(item));
    relatedEntries.forEach((entry) => {
      if (entry.key === "usNationalParks") addUnitCodes(usNpsUnitById.get(entry.item));
    });
    const shapeRefreshed = linkedToUsNationalPark ? refreshUsNpsBoundaryState(affectedNpsCodes) : false;
    if (mapLibreMap && (shapeRefreshed || mapLibreMap.isStyleLoaded())) renderMapLibreMarkers();
    scheduleCoverageMapRefresh(linkedToUsNationalPark ? 16 : 180);
  }
}

function adjustRenderedChecklistCount(key, delta) {
  const update = (node) => {
    const match = String(node?.textContent || "").match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return;
    node.textContent = `${Math.max(0, Math.min(Number(match[2]), Number(match[1]) + delta))}/${match[2]}`;
  };
  document.querySelectorAll(`[data-achievement-count="${key}"]`).forEach(update);
  document.querySelectorAll(`.theme-checklist [data-checklist="${key}"]`).forEach((button) => {
    update(button.closest(".theme-checklist")?.querySelector(":scope > header span"));
  });
}

function refreshRenderedChecklistGroupStat(key, group) {
  const list = checklistCatalog[key] || {};
  const groupId = checklistGroupId(key, group);
  const details = Array.from(document.querySelectorAll("[data-checklist-group]"))
    .find((candidate) => candidate.dataset.checklistGroup === groupId);
  const summaryCount = details?.querySelector(":scope > summary span");
  const items = key === "usNationalParks"
    ? (usNpsGroups.find((entry) => entry.id === group)?.items || [])
    : (list.byRegion?.[group] || list.byCountry?.[group] || []);
  if (!summaryCount || !items.length) return;
  const displayItems = displayChecklistItems(key, items);
  summaryCount.textContent = `${displayItems.filter((entry) => isChecklistItemDone(key, entry, group)).length}/${displayItems.length}`;
}

function refreshUsNpsBoundaryState(affectedCodes = null) {
  if (ensureMapLibreUsNpsSourceAndLayers()) {
    const doneFilter = usNpsDoneFilterExpression();
    if (mapLibreMap.getLayer("us-nps-done-fill")) mapLibreMap.setFilter("us-nps-done-fill", doneFilter);
    if (mapLibreMap.getLayer("us-nps-done-line")) mapLibreMap.setFilter("us-nps-done-line", doneFilter);
    const firstPointLayer = ["map-points-shadow", "map-points-stroke", "map-points-circle", "map-points-label", "map-points-label-full"]
      .find((layerId) => mapLibreMap.getLayer(layerId));
    ["us-nps-fill", "us-nps-done-fill", "us-nps-line", "us-nps-done-line", "us-nps-hit-line"].forEach((layerId) => {
      if (firstPointLayer && mapLibreMap.getLayer(layerId)) mapLibreMap.moveLayer(layerId, firstPointLayer);
    });
    mapLibreMap.triggerRepaint();
    return true;
  }
  if (leafletMap && window.L) {
    renderLeafletLayers();
    return true;
  }
  scheduleGeoMapRender();
  return false;
}

function canRefreshChecklistChangeLocally(key) {
  return key === "chinaAncientCapitals" || key === "chinaHighAltitude" || key === "usNationalParks";
}

function shouldRefreshMapMarkersForChecklist(key) {
  if (key === "chinaAncientCapitals") return Boolean(state.mapOverlays?.chinaAncientCapitals || state.mapOverlays?.checkins);
  if (key === "china5a") return Boolean(state.mapOverlays?.china5a || state.mapOverlays?.checkins);
  if (key === "usNationalParks") return Boolean(state.mapOverlays?.china5a || state.mapOverlays?.checkins);
  if (key === "chinaHighAltitude") return Boolean(state.mapOverlays?.highAltitude || state.mapOverlays?.checkins);
  if (key === "worldHeritage") return Boolean(state.mapOverlays?.worldHeritage || state.mapOverlays?.checkins);
  return true;
}

function updateChecklistButtonsForItem(key, item, group = "") {
  const done = isChecklistItemDone(key, item, group);
  const itemKey = checklistItemKey(key, item, group);
  const legacyKey = canonicalPlaceKey(item);
  const canonicalKey = checklistCanonicalKey(item);
  const mergeKey = checklistMergeKeyForEntry({ key, item, group });
  const relatedEntries = mergeKey ? relatedChecklistEntriesForItem(key, item, group) : [];
  const escapeSelectorValue = (value) => window.CSS?.escape ? window.CSS.escape(String(value || "")) : String(value || "").replace(/["\\]/g, "\\$&");
  const relatedItems = Array.from(new Set([item, ...relatedEntries.map((entry) => entry.item)].filter(Boolean)));
  const selector = mergeKey
    ? relatedItems.map((relatedItem) => `[data-item="${escapeSelectorValue(relatedItem)}"]`).join(",")
    : `[data-checklist="${key}"], [data-checklist-map="${key}"]`;
  document.querySelectorAll(selector).forEach((button) => {
    const buttonChecklistKey = button.dataset.checklist || button.dataset.checklistMap || key;
    const buttonItem = button.dataset.item || "";
    const buttonKey = checklistItemKey(buttonChecklistKey, buttonItem, button.dataset.group || "");
    const buttonMergeKey = checklistMergeKeyForEntry({ key: buttonChecklistKey, item: buttonItem, group: button.dataset.group || "" });
    const linked = Boolean(mergeKey && buttonMergeKey === mergeKey);
    if (buttonKey !== itemKey && !linked && (!isAmbiguousChecklistItem(key, item) || canonicalPlaceKey(buttonItem) !== legacyKey)) return;
    const buttonDone = linked ? isChecklistItemDone(buttonChecklistKey, buttonItem, button.dataset.group || "") : done;
    button.classList.toggle("done", buttonDone);
    const status = button.querySelector(".us-park-card-status");
    if (status) {
      const npsUnit = buttonChecklistKey === "usNationalParks" ? usNpsUnitById.get(buttonItem) : null;
      status.textContent = buttonDone
        ? t("checked")
        : npsUnit && !npsUnit.hasBoundary
          ? (currentLanguage === "en" ? "No boundary" : "暂无边界")
          : t("unvisited");
      return;
    }
    if (button.dataset.checklistMap) {
      button.textContent = buttonDone ? t("unvisit") : t("markVisited");
      return;
    }
    button.textContent = buttonDone ? `${t("checked")} · ${checklistItemDisplayName(buttonChecklistKey, buttonItem)}` : checklistItemDisplayName(buttonChecklistKey, buttonItem);
  });
}

function refreshRenderedChecklistSectionMarkup(key) {
  if (key !== "chinaHighAltitude" && key !== "chinaAncientCapitals") return false;
  const button = document.querySelector(`.theme-checklist [data-checklist="${key}"]`);
  const section = button?.closest(".theme-checklist");
  const list = checklistCatalog[key];
  if (!section || !list) return false;
  if (key === "chinaAncientCapitals") {
    return false;
  }
  if (key === "chinaHighAltitude") {
    section.querySelectorAll("[data-checklist-group]").forEach((details) => {
      setChecklistGroupOpen(details.dataset.checklistGroup, details.open);
    });
    section.outerHTML = section.classList.contains("high-altitude-inline")
      ? renderHighAltitudeInlineSection(key, list)
      : renderHighAltitudeSection(key, list);
    return true;
  }
  return false;
}

function refreshRenderedChecklistStats(key, group = "") {
  const list = checklistCatalog[key];
  if (!list) return;
  refreshAchievementChecklistCount(key);
  if (key === "chinaAncientCapitals") refreshAncientCapitalEraStats();
  document.querySelectorAll(`.theme-checklist [data-checklist="${key}"]`).forEach((button) => {
    const section = button.closest(".theme-checklist");
    const total = checklistTotalCount(key);
    const count = checklistDoneCount(key);
    const countNode = section?.querySelector(":scope > header span");
    if (countNode) countNode.textContent = `${count}/${total}`;
  });
  if (!group) return;
  const groupId = checklistGroupId(key, group);
  const details = Array.from(document.querySelectorAll("[data-checklist-group]"))
    .find((candidate) => candidate.dataset.checklistGroup === groupId);
  const summaryCount = details?.querySelector(":scope > summary span");
  const items = key === "usNationalParks"
    ? (usNpsGroups.find((entry) => entry.id === group)?.items || [])
    : (list.byRegion?.[group] || list.byCountry?.[group] || []);
  if (summaryCount && items.length) {
    const done = displayChecklistItems(key, items).filter((entry) => isChecklistItemDone(key, entry, group)).length;
    summaryCount.textContent = `${done}/${displayChecklistItems(key, items).length}`;
  }
}

function refreshCanonicalChecklistStats(item) {
  if (!checklistCanonicalKey(item)) return;
  ["china5a", "usNationalParks", "worldHeritage", "chinaHighAltitude"].forEach((linkedKey) => {
    if (checklistCatalog[linkedKey]) refreshRenderedChecklistStats(linkedKey);
  });
}

function refreshAncientCapitalEraStats() {
  document.querySelectorAll(".ancient-capital-era[data-ancient-era]").forEach((details) => {
    const era = details.dataset.ancientEra || "";
    const items = (chinaAncientCapitals.recordItems || []).filter((item) => ancientCapitalPrimaryEra(item) === era);
    const summaryCount = details.querySelector(":scope > summary span");
    if (summaryCount && items.length) {
      const done = items.filter((item) => isChecklistItemDone("chinaAncientCapitals", item.name)).length;
      summaryCount.textContent = `${done}/${items.length}`;
    }
  });
}

function refreshAchievementChecklistCount(key) {
  const countNode = document.querySelector(`[data-achievement-count="${key}"]`);
  if (!countNode) return;
  countNode.textContent = `${checklistDoneCount(key)}/${checklistTotalCount(key)}`;
}

function checklistPlaceMatchesItem(key, item, place, group = "") {
  if (!place) return false;
  const itemKey = checklistItemKey(key, item, group);
  if (key === "usNationalParks" && usNpsUnitById.has(String(item || "")) && place.checklistKey === key) {
    if (checklistItemKey(key, place.checklistItemId || "") === itemKey) return true;
    const unit = usNpsUnitById.get(item);
    const legacyItem = legacyUsNationalParkItemForUnit(unit);
    return placeMatchesName(place, legacyItem || unit.name);
  }
  if (place.checklistKey === key && checklistItemKey(key, place.name, place) === itemKey) return true;
  if (isAmbiguousChecklistItem(key, item)) return false;
  return placeMatchesName(place, item);
}

function findChecklistPlace(key, item, group = "") {
  return places.find((place) => checklistPlaceMatchesItem(key, item, place, group));
}

function unvisitChecklistItem(key, item, group = "") {
  const ids = new Set(places.filter((place) => checklistPlaceMatchesItem(key, item, place, group)).map((place) => place.id));
  if (!ids.size) return;
  state.visits = state.visits.filter((visit) => !ids.has(visit.placeId));
  places = places.filter((place) => !(place.checklistOnly && ids.has(place.id)));
  checklistStatusCache.signature = "";
}

function ensureChecklistPlace(key, item, group = "") {
  const listLabel = checklistCatalog[key].label;
  const coords = checklistCoordinateFor(item, group);
  const existing = findChecklistPlace(key, item, group);
  if (existing) {
    existing.checklist = Array.from(new Set([...(existing.checklist || []), listLabel]));
    existing.checklistKey ||= key;
    if (key === "usNationalParks" && usNpsUnitById.has(String(item || ""))) {
      const npsUnit = usNpsUnitById.get(item);
      existing.checklistKey = key;
      existing.checklistItemId = item;
      existing.name = npsUnit.name;
    }
    applyChecklistCoordinates(existing, coords, key);
    upsertVisit(existing.id, 1, { tripId: "checklist", save: false });
    state.focusPlaceId = existing.id;
    return existing;
  }
  const id = `checklist-${slugify(key)}-${slugify(checklistItemKey(key, item, group))}`;
  const defaultCountry = key === "usNationalParks" ? "us" : key === "worldHeritage" ? "imported" : "cn";
  const npsUnit = key === "usNationalParks" ? usNpsUnitById.get(item) : null;
  const place = {
    id,
    name: npsUnit?.name || item,
    country: defaultCountry,
    unit: key === "worldHeritage" ? "" : (npsUnit?.location || coords?.[2] || group || ""),
    city: "",
    type: listLabel,
    lat: coords?.[0] ?? null,
    lng: coords?.[1] ?? null,
    tags: [listLabel],
    checklist: [listLabel],
    checklistKey: key,
    checklistItemId: npsUnit?.id || "",
    checklistOnly: true,
  };
  applyChecklistGeography(place, key, coords);
  places.push(place);
  upsertVisit(id, 1, { tripId: "checklist", save: false });
  state.focusPlaceId = id;
  return place;
}

function applyChecklistCoordinates(place, coords, key) {
  const shouldUseCatalogCoordinates =
    key === "worldHeritage"
    || place.checklistOnly
    || place.checklistKey === key
    || String(place.id || "").startsWith(`checklist-${slugify(key)}-`)
    || !(Number.isFinite(place.lat) && Number.isFinite(place.lng));
  if (coords && shouldUseCatalogCoordinates) {
    place.lat = coords[0];
    place.lng = coords[1];
    if (key !== "worldHeritage") place.unit = place.unit || coords[2] || "";
  }
  applyChecklistGeography(place, key, coords);
}

function applyChecklistGeography(place, key, coords) {
  if (key === "china5a") {
    place.country = "cn";
    if (coords?.[2]) place.unit = coords[2];
  }
  if (key === "chinaAncientCapitals") {
    place.country = "cn";
    applyAncientCapitalAdminGeography(place);
  }
  if (key === "chinaHighAltitude") {
    const meta = highAltitudeMetaFor(place.name);
    place.country = meta.countryId || place.country || "cn";
    if (coords?.[2]) place.unit = coords[2];
    if (meta.province) place.unit = meta.province;
  }
  if (key === "worldHeritage") {
    const countryId = coords?.[2] ? worldHeritageCountryCoverageId(coords[2]) : "";
    if (countryId) place.country = countryId;
    if (coords?.[2] && sameAdminName(place.unit, coords[2])) place.unit = "";
  }
  if (!(Number.isFinite(place.lat) && Number.isFinite(place.lng))) return;
  if (key !== "china5a" && key !== "chinaAncientCapitals") {
    const country = inferCountry(place.lng, place.lat);
    if (country?.id) place.country = country.id;
  }
  if (key === "chinaAncientCapitals" && place.unit && place.subunit) return;
  const region = inferRegion(place.country, place.lng, place.lat);
  if (region?.name) place.unit = region.name;
  const subregion = inferSubregion(place.country, place.lng, place.lat);
  if (subregion?.name) place.subunit = subregion.name;
}

function canUseChecklistCatalogGeography(key, item) {
  if (key === "usNationalParks") return usNpsUnitById.has(String(item || ""));
  if (key === "worldHeritage") return Boolean(checklistCoordinateFor(item));
  if (key !== "chinaAncientCapitals") return false;
  const meta = typeof item === "object" ? item : chinaAncientCapitalMeta[canonicalPlaceKey(item)];
  return Boolean(parseChinaAdminText(meta?.admin).province);
}

function applyAncientCapitalAdminGeography(place) {
  const meta = chinaAncientCapitalMeta[canonicalPlaceKey(place.name)];
  const parsed = parseChinaAdminText(meta?.admin || place.admin || "");
  if (parsed.province) place.unit = parsed.province;
  if (parsed.city) place.subunit = parsed.city;
}

function parseChinaAdminText(value) {
  const text = String(value || "").trim();
  if (!text) return { province: "", city: "" };
  if (/^(北京市|上海市|天津市|重庆市)/.test(text)) {
    const city = RegExp.$1.replace(/市$/, "");
    return { province: city, city };
  }
  if (/^(香港|澳门|台湾)/.test(text)) {
    return { province: RegExp.$1, city: RegExp.$1 };
  }
  const provinceMatch = text.match(/^(.+?(?:省|自治区|特别行政区))/);
  const province = provinceMatch ? provinceMatch[1]
    .replace(/省$|自治区$|特别行政区$/g, "")
    .replace(/壮族|回族|维吾尔/g, "") : "";
  const rest = provinceMatch ? text.slice(provinceMatch[1].length) : text;
  const cityMatch = rest.match(/^(.+?(?:市|地区|自治州|盟))/);
  const city = cityMatch ? cityMatch[1] : province;
  return { province, city };
}

function cleanChecklistName(value) {
  return String(value || "").replace(/景区|旅游区|风景区|国家公园|历史城区/g, "").trim();
}

function checklistCoordinateFor(item, group = "") {
  const lookup = checklistCoordinateLookup();
  const canonical = checklistCanonicalPlaceForItem(item);
  const npsUnit = usNpsUnitById.get(String(item || ""));
  const legacyUsParkItem = legacyUsNationalParkItemForUnit(npsUnit);
  const candidates = [
    item,
    npsUnit?.name,
    legacyUsParkItem,
    cleanChecklistName(item),
    cleanChecklistName(npsUnit?.name),
    englishNameInParentheses(item),
    englishNameInParentheses(legacyUsParkItem),
    cleanEnglishParkName(englishNameInParentheses(item)),
    cleanEnglishParkName(npsUnit?.name),
    ...(canonical?.aliases || []),
  ].filter(Boolean);
  const coords = candidates.map((name) => lookup.get(canonicalPlaceKey(name))).find(Boolean);
  if (group && checklistCatalog.china5a?.byRegion?.[group] && coords?.[2] && !sameAdminName(group, coords[2])) return null;
  return coords;
}

function checklistCoordinateLookup() {
  if (
    checklistCoordinateLookupCache.china5a === china5aCoordinates
    && checklistCoordinateLookupCache.ancientCapitals === chinaAncientCapitalCoordinates
    && checklistCoordinateLookupCache.highAltitude === chinaHighAltitudeCoordinates
    && checklistCoordinateLookupCache.worldHeritage === worldHeritageCoordinates
    && checklistCoordinateLookupCache.englishNames === worldHeritageEnglishNames
  ) {
    return checklistCoordinateLookupCache.map;
  }
  const map = new Map();
  const add = (name, coords) => {
    if (!name || !Array.isArray(coords)) return;
    const key = canonicalPlaceKey(name);
    if (key && !map.has(key)) map.set(key, coords);
    const canonical = checklistCanonicalPlaceForItem(name);
    canonical?.aliases?.forEach((alias) => {
      const aliasKey = canonicalPlaceKey(alias);
      if (aliasKey && !map.has(aliasKey)) map.set(aliasKey, coords);
    });
    if (canonical?.id) {
      const canonicalKey = canonicalPlaceKey(`place:${canonical.id}`);
      if (canonicalKey && !map.has(canonicalKey)) map.set(canonicalKey, coords);
    }
  };
  Object.entries(checklistPlaceCoordinates || {}).forEach(([name, coords]) => add(name, coords));
  Object.entries(china5aCoordinates || {}).forEach(([name, coords]) => {
    add(name, coords);
    add(cleanChecklistName(name), coords);
  });
  Object.entries(chinaAncientCapitalCoordinates || {}).forEach(([name, coords]) => {
    add(name, coords);
    add(cleanChecklistName(name), coords);
  });
  Object.entries(chinaHighAltitudeCoordinates || {}).forEach(([name, coords]) => {
    add(name, coords);
    add(parseHighAltitudeItem(name).name, coords);
  });
  Object.entries(worldHeritageCoordinates || {}).forEach(([name, coords]) => {
    add(name, coords);
    add(cleanChecklistName(name), coords);
    add(worldHeritageEnglishNames[name], coords);
  });
  checklistCoordinateLookupCache = {
    china5a: china5aCoordinates,
    ancientCapitals: chinaAncientCapitalCoordinates,
    highAltitude: chinaHighAltitudeCoordinates,
    worldHeritage: worldHeritageCoordinates,
    englishNames: worldHeritageEnglishNames,
    map,
  };
  return map;
}

function englishNameInParentheses(value) {
  return String(value || "").match(/（([^（）]+)）/)?.[1] || String(value || "").match(/\(([^()]+)\)/)?.[1] || "";
}

function cleanEnglishParkName(value) {
  return String(value || "").replace(/\bNational Park\b/g, "").trim();
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
  const ids = new Set(places.filter((place) => canonicalPlaceKey(place.name) === key || placeMatchesName(place, item)).map((place) => place.id));
  state.visits = state.visits.filter((visit) => !ids.has(visit.placeId));
  places = places.filter((place) => !(place.checklistOnly && ids.has(place.id)));
  checklistStatusCache.signature = "";
}

function renderNextStops() {
  const missingChina = missingVisitedRegions("china");
  const cityMissing = Math.max(chinaPrefectureTotal() - countVisitedSubregions("china2"), 0);
  const countryMissing = Math.max(worldCountryTotal - uniqueVisitedCountries().size, 0);
  const recommendations = currentLanguage === "en" ? [
    ["Light up countries", `${countryMissing} countries/regions are still unlit. Start with places you know well.`, "Light up", "#checkins:manual-section-country"],
    ["Complete China provinces", missingChina.length ? `Remaining province-level units: ${missingChina.slice(0, 6).join(", ")}${missingChina.length > 6 ? "..." : ""}` : "China province level is complete.", "Light up", "#checkins:manual-section-china"],
    ["Complete China cities", `About ${cityMissing} prefecture-level units remain. Work province by province.`, "Light up", "#checkins:manual-section-china-city"],
    ["Check in 5A / World Heritage", "Checklist marks sync to map points and core check-in levels.", "Check in", "#achievements:achievement-section-china5a"],
    ["Import places or tracks", "GeoJSON, KML, and CSV imports can update light-up results automatically.", "Import", "#imports"],
  ] : [
    ["手动点亮国家/地区", `还有 ${countryMissing} 个国家/地区未点亮。可以先从常去国家开始补。`, "点亮", "#checkins:manual-section-country"],
    ["补中国省级", missingChina.length ? `中国省级还差：${missingChina.slice(0, 6).join("、")}${missingChina.length > 6 ? "…" : ""}` : "中国省级已完成。", "点亮", "#checkins:manual-section-china"],
    ["补中国地级市", `中国地级尺度还差约 ${cityMissing} 个。适合按省逐步补。`, "点亮", "#checkins:manual-section-china-city"],
    ["打卡 5A / 世界遗产", "在清单里勾选后，会同步到地图点和核心打卡等级。", "打卡", "#achievements:achievement-section-china5a"],
    ["导入地点/轨迹文件", "已有 GeoJSON、KML 或 CSV 时，可以导入并自动更新点亮结果。", "导入", "#imports"],
  ];
  $("#nextStops").innerHTML = recommendations.map(([title, body, goal, href]) => `
    <article class="next-card"><header><strong>${title}</strong><a class="tag" href="${href}">${goal}</a></header><p class="muted">${body}</p></article>`).join("");
}

async function handleImport(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  try {
    if (files.some((file) => file.name.split(".").pop().toLowerCase() === "xls")) {
      await loadAirportData();
    }
    const jobs = [];
    const flightJobs = [];
    const photoPlaces = [];
    let skippedPhotos = 0;
    let restoredArchives = 0;
    for (const file of files) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (extension === "xls") {
        flightJobs.push({ fileName: file.name, flights: parseHanglvXls(await file.arrayBuffer()) });
        continue;
      }
      if (isPhotoFile(file, extension)) {
        const photoPlace = await parsePhotoFile(file);
        if (!photoPlace) {
          skippedPhotos += 1;
          continue;
        }
        photoPlaces.push(photoPlace);
        continue;
      }
      const text = await file.text();
      if (extension === "json") {
        const maybeArchive = JSON.parse(text);
        if (isArchivePayload(maybeArchive)) {
          restoreArchivePayload(maybeArchive);
          saveState();
          renderAll();
          restoredArchives += 1;
          continue;
        }
      }
      jobs.push({ places: parseImportFile(text, extension), extension, fileName: file.name });
    }
    if (photoPlaces.length) {
      jobs.push({ places: photoPlaces, extension: "photo", fileName: photoImportBatchName(photoPlaces.length) });
    }
    const visiblePointCount = jobs.flatMap((job) => sanitizeImportedPlaces(job.places)).filter((place) => !place.shapeOnly).length;
    if (Number.isFinite(maxImportVisiblePoints) && visiblePointCount > maxImportVisiblePoints) {
      throw new Error(`一次导入包含 ${visiblePointCount} 个可显示点，超过上限 ${maxImportVisiblePoints}。请只导入需要显示的点，或分批导入。`);
    }
    let totalImported = 0;
    jobs.forEach((job) => {
      const imported = importPlaces(job.places, job.extension, job.fileName, 1);
      totalImported += imported.length;
    });
    let flightStats = { added: 0, duplicates: 0, unrecognized: 0 };
    flightJobs.forEach((job) => {
      const result = importFlights(job.flights, job.fileName);
      flightStats = {
        added: flightStats.added + result.added,
        duplicates: flightStats.duplicates + result.duplicates,
        unrecognized: flightStats.unrecognized + result.unrecognized,
      };
    });
    const skippedText = skippedPhotos ? `，${skippedPhotos} 张照片没有 GPS 已跳过` : "";
    const archiveText = restoredArchives ? `，已恢复 ${restoredArchives} 个存档` : "";
    const flightText = flightJobs.length ? `；航班新增 ${flightStats.added} 条，重复跳过 ${flightStats.duplicates} 条，机场未识别 ${flightStats.unrecognized} 条` : "";
    showToast(`已导入 ${totalImported} 个地点/轨迹${skippedText}${archiveText}${flightText}，地点会自动点亮相应地区`);
  } catch (error) {
    showToast(`导入失败：${error.message}`);
  } finally {
    event.target.value = "";
  }
}

function photoImportBatchName(count) {
  const date = new Date().toISOString().slice(0, 10);
  return `照片导入 ${date}（${count} 张有 GPS）`;
}

function importPlacesFromText(text, extension, fileName = `import.${extension}`, depth = 1) {
  const imported = parseImportFile(text, extension);
  return importPlaces(imported, extension, fileName, depth);
}

function importFlights(importedFlights, fileName) {
  const parsedFlights = sanitizeFlights(importedFlights);
  if (!parsedFlights.length) return { added: 0, duplicates: 0, unrecognized: 0 };
  state.flights = sanitizeFlights(state.flights || []);
  state.flightImports = Array.isArray(state.flightImports) ? state.flightImports : [];
  const existingKeys = new Set(state.flights.map((flight) => flight.key));
  const importId = `flight-import-${slugify(fileName)}-${Date.now()}`;
  const importedAt = new Date().toISOString();
  const addedFlights = [];
  let duplicates = 0;
  parsedFlights.forEach((flight) => {
    if (existingKeys.has(flight.key)) {
      duplicates += 1;
      return;
    }
    existingKeys.add(flight.key);
    addedFlights.push({ ...flight, sourceFile: fileName, importId, importedAt });
  });
  state.flights.push(...addedFlights);
  const unrecognized = parsedFlights.filter((flight) => !findAirport(flight.fromAirport) || !findAirport(flight.toAirport)).length;
  state.flightImports.unshift({
    id: importId,
    name: fileName,
    count: addedFlights.length,
    total: parsedFlights.length,
    duplicates,
    unrecognized,
    format: "XLS",
    importedAt,
  });
  if (addedFlights.length) {
    invalidateMapCaches();
    invalidateDerivedStatsCache();
  }
  saveState();
  renderAll();
  refreshFlightRoutesOnMap();
  return { added: addedFlights.length, duplicates, unrecognized };
}

function parseHanglvXls(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  if (bytes.length < 512 || bytes[0] !== 0xd0 || bytes[1] !== 0xcf) throw new Error("航旅纵横文件需要是老式 .xls 格式");
  const workbookStream = extractOleWorkbookStream(bytes);
  const sheets = parseBiffSheets(workbookStream).filter((sheet) => !/无效|invalid/i.test(sheet.name || ""));
  const flights = sheets.flatMap((sheet) => parseHanglvRows(sheet.rows));
  if (!flights.length) throw new Error("未找到航旅纵横表头");
  return flights;
}

function parseHanglvRows(rows) {
  const headerRow = rows.find((row) => row.some((cell) => String(cell || "").includes("航班号")));
  if (!headerRow) return [];
  const headerIndex = rows.indexOf(headerRow);
  const headers = headerRow.map((cell) => String(cell || "").trim());
  const col = (name) => headers.findIndex((header) => header === name || header.includes(name));
  const columns = {
    date: col("日期"),
    airline: col("航空公司"),
    flightNo: col("航班号"),
    fromAirport: col("出发城市"),
    fromTime: col("出发时间"),
    toAirport: col("到达城市"),
    toTime: col("到达时间"),
    distanceKm: col("里程数"),
    ticketNo: col("客票号"),
    ticketStatus: col("客票状态"),
  };
  if (Object.values(columns).some((index) => index < 0)) return [];
  return rows.slice(headerIndex + 1)
    .map((row) => {
      const text = (key) => String(row[columns[key]] ?? "").trim();
      const distanceText = text("distanceKm");
      return normalizeFlightRecord({
        date: normalizeFlightDate(row[columns.date]),
        airline: text("airline"),
        flightNo: text("flightNo"),
        fromAirport: text("fromAirport"),
        fromTime: normalizeFlightTime(row[columns.fromTime]),
        toAirport: text("toAirport"),
        toTime: normalizeFlightTime(row[columns.toTime]),
        distanceKm: Number(String(distanceText).replace(/[^\d.]/g, "")) || 0,
        ticketNo: text("ticketNo"),
        ticketStatus: text("ticketStatus"),
      });
    })
    .filter((flight) => flight.date && flight.flightNo && flight.fromAirport && flight.toAirport);
}

function extractOleWorkbookStream(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const sectorSize = 1 << view.getUint16(30, true);
  const firstDirSector = view.getInt32(48, true);
  const sectorOffset = (sector) => 512 + sector * sectorSize;
  const fatSectors = [];
  for (let index = 0; index < 109; index += 1) {
    const sector = view.getUint32(76 + index * 4, true);
    if (sector < 0xfffffff0) fatSectors.push(sector);
  }
  const fat = [];
  fatSectors.forEach((sector) => {
    const offset = sectorOffset(sector);
    for (let cursor = 0; cursor < sectorSize; cursor += 4) fat.push(view.getUint32(offset + cursor, true));
  });
  const readChain = (startSector, size = Infinity) => {
    const chunks = [];
    const seen = new Set();
    let sector = startSector;
    let remaining = size;
    while (sector >= 0 && sector < 0xfffffff0 && !seen.has(sector) && remaining > 0) {
      seen.add(sector);
      const offset = sectorOffset(sector);
      const take = Math.min(sectorSize, remaining);
      chunks.push(bytes.slice(offset, offset + take));
      remaining -= take;
      sector = fat[sector] ?? 0xfffffffe;
    }
    const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const output = new Uint8Array(length);
    let offset = 0;
    chunks.forEach((chunk) => {
      output.set(chunk, offset);
      offset += chunk.length;
    });
    return output;
  };
  const directory = readChain(firstDirSector);
  for (let offset = 0; offset + 128 <= directory.length; offset += 128) {
    const entry = new DataView(directory.buffer, directory.byteOffset + offset, 128);
    const nameLength = entry.getUint16(64, true);
    if (nameLength < 2) continue;
    const nameBytes = directory.slice(offset, offset + nameLength - 2);
    const name = new TextDecoder("utf-16le").decode(nameBytes);
    if (name !== "Workbook" && name !== "Book") continue;
    const start = entry.getUint32(116, true);
    const size = Number(entry.getBigUint64(120, true));
    return readChain(start, size);
  }
  throw new Error("未找到 .xls Workbook 数据流");
}

function parseBiffRecords(stream) {
  const view = new DataView(stream.buffer, stream.byteOffset, stream.byteLength);
  const records = [];
  for (let offset = 0; offset + 4 <= stream.length;) {
    const id = view.getUint16(offset, true);
    const length = view.getUint16(offset + 2, true);
    records.push({ id, offset, body: stream.slice(offset + 4, offset + 4 + length) });
    offset += 4 + length;
  }
  return records;
}

function parseBiffSheets(stream) {
  const records = parseBiffRecords(stream);
  const strings = parseBiffSharedStrings(records);
  const sheetRecords = records.filter((record) => record.id === 0x0085).map((record) => {
    const view = new DataView(record.body.buffer, record.body.byteOffset, record.body.byteLength);
    const offset = view.getUint32(0, true);
    const nameLength = record.body[6] || 0;
    const flags = record.body[7] || 0;
    const raw = record.body.slice(8, 8 + nameLength * (flags & 0x01 ? 2 : 1));
    return {
      name: decodeBiffStringBytes(raw, Boolean(flags & 0x01)),
      offset,
    };
  }).sort((left, right) => left.offset - right.offset);
  if (!sheetRecords.length) return [{ name: "", rows: parseBiffRowsFromRecords(records, strings) }];
  return sheetRecords.map((sheet, index) => ({
    name: sheet.name,
    rows: parseBiffRowsFromRecords(
      records.filter((record) => record.offset >= sheet.offset && record.offset < (sheetRecords[index + 1]?.offset ?? Infinity)),
      strings,
    ),
  }));
}

function parseBiffRows(stream) {
  return parseBiffSheets(stream).flatMap((sheet) => sheet.rows);
}

function parseBiffRowsFromRecords(records, strings) {
  const rows = [];
  const setCell = (row, col, value) => {
    rows[row] ||= [];
    rows[row][col] = value;
  };
  records.forEach(({ id, body }) => {
    const data = new DataView(body.buffer, body.byteOffset, body.byteLength);
    if (id === 0x00fd && body.length >= 10) {
      setCell(data.getUint16(0, true), data.getUint16(2, true), strings[data.getUint32(6, true)] || "");
    } else if (id === 0x0203 && body.length >= 14) {
      setCell(data.getUint16(0, true), data.getUint16(2, true), data.getFloat64(6, true));
    } else if (id === 0x027e && body.length >= 10) {
      setCell(data.getUint16(0, true), data.getUint16(2, true), decodeBiffRk(data.getUint32(6, true)));
    } else if (id === 0x00bd && body.length >= 8) {
      const row = data.getUint16(0, true);
      let col = data.getUint16(2, true);
      for (let offset = 4; offset + 6 <= body.length - 2; offset += 6) {
        setCell(row, col, decodeBiffRk(data.getUint32(offset + 2, true)));
        col += 1;
      }
    }
  });
  return rows;
}

function parseBiffSharedStrings(records) {
  const strings = [];
  const sstIndex = records.findIndex((record) => record.id === 0x00fc);
  if (sstIndex < 0) return strings;
  const parts = [records[sstIndex].body];
  for (let index = sstIndex + 1; index < records.length && records[index].id === 0x003c; index += 1) parts.push(records[index].body);
  const reader = makeBiffPartReader(parts, 8);
  const unique = new DataView(parts[0].buffer, parts[0].byteOffset, parts[0].byteLength).getUint32(4, true);
  for (let index = 0; index < unique && !reader.done(); index += 1) strings.push(readBiffSstString(reader));
  return strings;
}

function makeBiffPartReader(parts, initialOffset = 0) {
  let partIndex = 0;
  let offset = initialOffset;
  const advance = () => {
    while (partIndex < parts.length && offset >= parts[partIndex].length) {
      partIndex += 1;
      offset = 0;
    }
  };
  const readBytes = (length) => {
    const output = new Uint8Array(length);
    let written = 0;
    while (written < length && partIndex < parts.length) {
      advance();
      if (partIndex >= parts.length) break;
      const available = Math.min(length - written, parts[partIndex].length - offset);
      output.set(parts[partIndex].slice(offset, offset + available), written);
      offset += available;
      written += available;
    }
    return written === length ? output : output.slice(0, written);
  };
  return {
    done() {
      advance();
      return partIndex >= parts.length;
    },
    remainingInPart() {
      return partIndex < parts.length ? parts[partIndex].length - offset : 0;
    },
    readByte() {
      const bytes = readBytes(1);
      return bytes.length ? bytes[0] : 0;
    },
    readUInt16() {
      const bytes = readBytes(2);
      return bytes.length === 2 ? new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(0, true) : 0;
    },
    readUInt32() {
      const bytes = readBytes(4);
      return bytes.length === 4 ? new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true) : 0;
    },
    readBytes,
    skip(length) {
      readBytes(length);
    },
  };
}

function decodeBiffStringBytes(bytes, isUtf16) {
  if (!bytes.length) return "";
  const decoderName = isUtf16 ? "utf-16le" : "gbk";
  try {
    return new TextDecoder(decoderName).decode(bytes).replace(/\0+$/g, "");
  } catch {
    return new TextDecoder(isUtf16 ? "utf-16le" : "latin1").decode(bytes).replace(/\0+$/g, "");
  }
}

function readBiffSstString(reader) {
  const charCount = reader.readUInt16();
  let flags = reader.readByte();
  let isUtf16 = Boolean(flags & 0x01);
  const hasRichText = Boolean(flags & 0x08);
  const hasPhonetic = Boolean(flags & 0x04);
  const richTextRuns = hasRichText ? reader.readUInt16() : 0;
  const phoneticBytes = hasPhonetic ? reader.readUInt32() : 0;
  let remainingChars = charCount;
  let output = "";
  while (remainingChars > 0 && !reader.done()) {
    if (reader.remainingInPart() === 0) {
      flags = reader.readByte();
      isUtf16 = Boolean(flags & 0x01);
    }
    const bytesPerChar = isUtf16 ? 2 : 1;
    const charsAvailable = Math.floor(reader.remainingInPart() / bytesPerChar);
    if (!charsAvailable) {
      flags = reader.readByte();
      isUtf16 = Boolean(flags & 0x01);
      continue;
    }
    const takeChars = Math.min(remainingChars, charsAvailable);
    output += decodeBiffStringBytes(reader.readBytes(takeChars * bytesPerChar), isUtf16);
    remainingChars -= takeChars;
  }
  if (richTextRuns) reader.skip(richTextRuns * 4);
  if (phoneticBytes) reader.skip(phoneticBytes);
  return output;
}

function decodeBiffRk(value) {
  const multiplied = Boolean(value & 0x01);
  const isInteger = Boolean(value & 0x02);
  const raw = value & 0xfffffffc;
  let result;
  if (isInteger) {
    result = (raw & 0x80000000 ? raw - 0x100000000 : raw) >> 2;
  } else {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(0, 0, true);
    view.setUint32(4, raw, true);
    result = view.getFloat64(0, true);
  }
  return multiplied ? result / 100 : result;
}

function normalizeFlightDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value || "").trim();
  const match = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (match) return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(text)) {
    const [year, month, day] = text.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  if (Number.isFinite(Number(value)) && Number(value) > 20000) {
    const date = new Date(Math.round((Number(value) - 25569) * 86400 * 1000));
    return date.toISOString().slice(0, 10);
  }
  return text;
}

function normalizeFlightTime(value) {
  if (value instanceof Date) {
    return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    const fraction = ((numeric % 1) + 1) % 1;
    if (numeric < 1 || fraction > 0) {
      const totalMinutes = Math.round(fraction * 24 * 60) % (24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }
  const text = String(value || "").trim();
  const match = text.match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : text;
}

function importPlaces(imported, extension, fileName, depth = 1) {
  const normalizedImported = sanitizeImportedPlaces(imported);
  if (!normalizedImported.length) return normalizedImported;
  const createdIds = [];
  const importId = `import-${slugify(fileName)}-${Date.now()}`;
  const importedAt = new Date().toISOString();
  normalizedImported.forEach((place) => {
    const idBase = slugify(`${place.country}-${place.unit}-${place.name}`);
    let id = `import-${idBase}`;
    let suffix = 2;
    while (places.some((existing) => existing.id === id)) {
      id = `import-${idBase}-${suffix}`;
      suffix += 1;
    }
    places.push({ ...place, id, imported: true, importId, sourceFile: fileName, importedAt });
    createdIds.push(id);
  });
  if (depth > 0) {
    createdIds
      .filter((id) => !getPlace(id)?.shapeOnly)
      .forEach((id) => upsertVisit(id, depth, { tripId: `import-${slugify(fileName)}` }));
  }
  const firstPointId = createdIds.find((id) => !getPlace(id)?.shapeOnly);
  if (firstPointId) state.focusPlaceId = firstPointId;
  state.importedFiles.unshift({ id: importId, name: fileName, count: normalizedImported.length, format: extension.toUpperCase(), marked: depth > 0, ids: createdIds, importedAt });
  saveState();
  renderAll();
  preloadBoundaryData(false, ["country", "admin1", "china2", "tw2"]).then(() => {
    refreshInferredLocations();
    saveState();
    renderAll();
  });
  return normalizedImported;
}

function sanitizeImportedPlaces(imported) {
  return (Array.isArray(imported) ? imported : [])
    .filter((place) => place && typeof place === "object")
    .map((place, index) => ({
      ...place,
      name: String(place.name || `Imported ${index + 1}`).trim(),
      country: normalizeCountry(place.country || ""),
      unit: String(place.unit || "").trim(),
      subunit: String(place.subunit || "").trim(),
      city: String(place.city || "").trim(),
      type: String(place.type || place.geometryType || "Imported").trim(),
      tags: Array.isArray(place.tags) ? place.tags : normalizeTags(place.tags),
      checklist: Array.isArray(place.checklist) ? place.checklist : normalizeChecklist(place),
      shapeOnly: Boolean(place.shapeOnly),
    }));
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
  recomputeCoverage();
  invalidateMapCaches();
  saveState();
  renderAll();
  showToast(`${record.name} 已删除`);
}

function deleteFlightImportBatch(importId) {
  const record = (state.flightImports || []).find((file) => file.id === importId);
  if (!record) return;
  state.flights = (state.flights || []).filter((flight) => flight.importId !== record.id);
  state.flightImports = (state.flightImports || []).filter((file) => file !== record);
  invalidateMapCaches();
  invalidateDerivedStatsCache();
  saveState();
  renderAll();
  refreshFlightRoutesOnMap();
  showToast(`${record.name} 已删除`);
}

function deleteAllImportedData() {
  const ids = new Set();
  places.forEach((place) => {
    if (place.imported || place.importId || place.sourceFile) ids.add(place.id);
  });
  state.importedFiles.forEach((file) => (file.ids || []).forEach((id) => ids.add(id)));
  state.visits = state.visits.filter((visit) => !ids.has(visit.placeId));
  places = places.filter((place) => !ids.has(place.id));
  state.importedFiles = [];
  state.flights = [];
  state.flightImports = [];
  sanitizeDataStore();
  closeMapPopupsAndDetail();
  recomputeCoverage();
  invalidateMapCaches();
  invalidateDerivedStatsCache();
  saveState();
  renderAll();
  refreshFlightRoutesOnMap();
  showToast("导入数据已全部删除");
}

function clearAllUserData() {
  places = places.filter((place) =>
    !place.imported
    && !place.importId
    && !place.sourceFile
    && !place.checklistOnly
    && !place.manualAdmin
    && !place.manualCountry
    && !place.id?.startsWith("map-click-")
    && !place.id?.startsWith("import-")
  );
  state.visits = [];
  state.importedFiles = [];
  state.flights = [];
  state.flightImports = [];
  state.checklistMarks = [];
  state.openChecklistGroups = [];
  state.coverage = { countries: [], regions: {}, subregions: {}, updatedAt: new Date().toISOString() };
  invalidateDerivedStatsCache();
  state.focusPlaceId = "";
  closeMapPopupsAndDetail();
  invalidateMapCaches();
  saveState();
  renderAll();
  showToast("所有点亮、导入和打卡勾选已清空");
}

function clearCheckinsAndAchievementPoints() {
  const importedIds = new Set(places.filter((place) => place.imported || place.importId || place.sourceFile).map((place) => place.id));
  places = places.filter((place) => !place.checklistOnly && !place.manualAdmin);
  state.visits = state.visits.filter((visit) => importedIds.has(visit.placeId));
  state.checklistMarks = [];
  state.coverage = { countries: [], regions: {}, subregions: {}, updatedAt: new Date().toISOString() };
  invalidateDerivedStatsCache();
  recomputeCoverage();
  state.focusPlaceId = state.visits[0]?.placeId || "";
  closeMapPopupsAndDetail();
  invalidateMapCaches();
  saveState();
  renderAll();
  showToast("点亮和打卡点已清除，导入文件保留");
}

function dataCounts() {
  const stats = dashboardStats();
  return {
    places: stats.places,
    visits: stats.visits,
    visitedPlaces: stats.visitedPlaces,
    litPlaces: stats.litPlaces,
    litAdministrativeUnits: stats.litAdministrativeUnits,
    importedObjects: stats.importedObjects,
    importedPoints: stats.importedPoints,
    importedTracks: stats.importedShapes,
    importedFlights: (state.flights || []).length,
    countries: stats.countries,
    chinaRegions: stats.chinaRegions,
    chinaSubregions: stats.chinaSubregions,
    japanRegions: stats.japanRegions,
    japanPrefectures: stats.japanPrefectures,
  };
}

function parseImportFile(text, extension) {
  if (extension === "geojson" || extension === "json") return parseGeoJson(text);
  if (extension === "kml") return parseKml(text);
  if (extension === "csv") return parseCsv(text);
  throw new Error("暂不支持该格式");
}

function isPhotoFile(file, extension = "") {
  return file.type?.startsWith("image/")
    || ["jpg", "jpeg", "tif", "tiff", "heic", "heif"].includes(String(extension || "").toLowerCase());
}

async function parsePhotoFile(file) {
  const buffer = await file.arrayBuffer();
  const gps = readExifGps(buffer);
  if (!gps) return null;
  return normalizeImportedPlace({
    name: file.name.replace(/\.[^.]+$/, "") || "照片地点",
    country: "",
    unit: "",
    city: "",
    type: "照片",
    lat: gps.lat,
    lng: gps.lng,
    tags: "照片",
    checklist: "",
    geometryType: "Photo EXIF GPS",
  });
}

function readExifGps(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 12) return null;
  if (view.getUint16(0, false) === 0xffd8) return readJpegExifGps(view);
  const tiffGps = readTiffGps(view, 0);
  if (tiffGps) return tiffGps;
  if (asciiFromView(view, 4, 4) === "ftyp") return readEmbeddedExifGps(view);
  return null;
}

function readEmbeddedExifGps(view) {
  // HEIC/HEIF stores an ordinary EXIF/TIFF payload inside an ISO-BMFF item.
  // Searching the local buffer also handles files whose Exif item is in idat
  // or mdat without needing to decode the image pixels.
  for (let offset = 0; offset + 8 <= view.byteLength; offset += 1) {
    if (view.getUint8(offset) === 0x45 && view.getUint8(offset + 1) === 0x78
      && view.getUint8(offset + 2) === 0x69 && view.getUint8(offset + 3) === 0x66
      && view.getUint8(offset + 4) === 0 && view.getUint8(offset + 5) === 0) {
      const gps = readTiffGps(view, offset + 6);
      if (gps) return gps;
      offset += 5;
      continue;
    }
    const littleTiff = view.getUint8(offset) === 0x49 && view.getUint8(offset + 1) === 0x49
      && view.getUint16(offset + 2, true) === 42;
    const bigTiff = view.getUint8(offset) === 0x4d && view.getUint8(offset + 1) === 0x4d
      && view.getUint16(offset + 2, false) === 42;
    if (littleTiff || bigTiff) {
      const gps = readTiffGps(view, offset);
      if (gps) return gps;
      offset += 3;
    }
  }
  return null;
}

function readJpegExifGps(view) {
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) return null;
    const marker = view.getUint8(offset + 1);
    const size = view.getUint16(offset + 2, false);
    if (marker === 0xe1 && offset + 4 + size <= view.byteLength) {
      const exifHeader = asciiFromView(view, offset + 4, 6);
      if (exifHeader === "Exif\0\0") {
        return readTiffGps(view, offset + 10);
      }
    }
    offset += 2 + size;
  }
  return null;
}

function readTiffGps(view, tiffOffset) {
  if (tiffOffset + 8 > view.byteLength) return null;
  const endian = asciiFromView(view, tiffOffset, 2);
  const littleEndian = endian === "II";
  if (!littleEndian && endian !== "MM") return null;
  if (view.getUint16(tiffOffset + 2, littleEndian) !== 42) return null;
  const ifd0Offset = view.getUint32(tiffOffset + 4, littleEndian);
  if (ifd0Offset < 8 || tiffOffset + ifd0Offset + 2 > view.byteLength) return null;
  const gpsIfdOffset = readIfdValue(view, tiffOffset, tiffOffset + ifd0Offset, 0x8825, littleEndian)?.valueOffset;
  if (!gpsIfdOffset) return null;
  const gpsIfd = tiffOffset + gpsIfdOffset;
  if (gpsIfd + 2 > view.byteLength) return null;
  const latRef = readExifAsciiValue(view, tiffOffset, gpsIfd, 1, littleEndian);
  const lat = readExifRationalTriplet(view, tiffOffset, gpsIfd, 2, littleEndian);
  const lngRef = readExifAsciiValue(view, tiffOffset, gpsIfd, 3, littleEndian);
  const lng = readExifRationalTriplet(view, tiffOffset, gpsIfd, 4, littleEndian);
  if (!lat || !lng) return null;
  const latitude = dmsToDecimal(lat) * (latRef === "S" ? -1 : 1);
  const longitude = dmsToDecimal(lng) * (lngRef === "W" ? -1 : 1);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { lat: latitude, lng: longitude };
}

function readIfdValue(view, tiffOffset, ifdOffset, targetTag, littleEndian) {
  if (ifdOffset + 2 > view.byteLength) return null;
  const count = view.getUint16(ifdOffset, littleEndian);
  for (let index = 0; index < count; index += 1) {
    const entry = ifdOffset + 2 + index * 12;
    if (entry + 12 > view.byteLength) return null;
    const tag = view.getUint16(entry, littleEndian);
    if (tag !== targetTag) continue;
    const type = view.getUint16(entry + 2, littleEndian);
    const itemCount = view.getUint32(entry + 4, littleEndian);
    const valueOffset = view.getUint32(entry + 8, littleEndian);
    return { type, itemCount, valueOffset, entryValueOffset: entry + 8 };
  }
  return null;
}

function readExifAsciiValue(view, tiffOffset, ifdOffset, tag, littleEndian) {
  const entry = readIfdValue(view, tiffOffset, ifdOffset, tag, littleEndian);
  if (!entry) return "";
  const offset = entry.itemCount <= 4 ? entry.entryValueOffset : tiffOffset + entry.valueOffset;
  return asciiFromView(view, offset, entry.itemCount).replace(/\0/g, "").trim();
}

function readExifRationalTriplet(view, tiffOffset, ifdOffset, tag, littleEndian) {
  const entry = readIfdValue(view, tiffOffset, ifdOffset, tag, littleEndian);
  if (!entry || entry.type !== 5 || entry.itemCount < 3) return null;
  const offset = tiffOffset + entry.valueOffset;
  if (offset + 24 > view.byteLength) return null;
  return [0, 1, 2].map((index) => {
    const base = offset + index * 8;
    const numerator = view.getUint32(base, littleEndian);
    const denominator = view.getUint32(base + 4, littleEndian);
    return denominator ? numerator / denominator : 0;
  });
}

function dmsToDecimal(values) {
  return values[0] + values[1] / 60 + values[2] / 3600;
}

function asciiFromView(view, offset, length) {
  if (offset < 0 || offset + length > view.byteLength) return "";
  let output = "";
  for (let index = 0; index < length; index += 1) output += String.fromCharCode(view.getUint8(offset + index));
  return output;
}

function parseGeoJson(text) {
  const data = JSON.parse(text);
  if (isArchivePayload(data)) throw new Error("这是拓界足迹存档，请使用“导入存档”或直接在导入入口恢复");
  const features = geoJsonImportFeatures(data);
  if (!features.length) throw new Error("JSON 不是可导入的 GeoJSON");
  const places = features.map((feature, index) => {
    const props = feature.properties && typeof feature.properties === "object" ? feature.properties : {};
    const coordinate = geoJsonGeometryCenter(feature.geometry);
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
  }).filter((place) => place.importedGeometry || Number.isFinite(place.lat) || Number.isFinite(place.lng));
  if (!places.length) throw new Error("GeoJSON 没有可导入的 geometry");
  return places;
}

function geoJsonImportFeatures(data) {
  if (Array.isArray(data)) return data.flatMap(geoJsonImportFeatures);
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data.features)) return data.features.flatMap(geoJsonImportFeatures);
  if (data.type === "Feature") {
    const props = data.properties || {};
    if (data.geometry?.type === "GeometryCollection") {
      return (data.geometry.geometries || []).map((geometry, index) => ({
        type: "Feature",
        properties: { ...props, name: props.name || props.NAME || props.title || `GeoJSON Geometry ${index + 1}` },
        geometry,
      })).filter((feature) => feature.geometry);
    }
    return data.geometry ? [data] : [];
  }
  if (data.type === "GeometryCollection") {
    return (data.geometries || []).map((geometry, index) => ({
      type: "Feature",
      properties: { name: `GeoJSON Geometry ${index + 1}` },
      geometry,
    })).filter((feature) => feature.geometry);
  }
  if (data.type && data.coordinates) {
    return [{ type: "Feature", properties: data.properties || {}, geometry: data }];
  }
  return [];
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
  const headers = rows[0].map((header) => normalizeCsvHeader(header));
  return rows.slice(1).map((row, index) => {
    const record = Object.fromEntries(headers.map((header, cellIndex) => [header, row[cellIndex] || ""]));
    const lat = csvNumber(record.lat);
    const lng = csvNumber(record.lng);
    return normalizeImportedPlace({
      name: record.name || `CSV Place ${index + 1}`,
      country: "",
      unit: "",
      city: "",
      type: "CSV",
      lat,
      lng,
      tags: "",
      checklist: "",
      geometryType: "CSV Row",
    });
  }).filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng));
}

function normalizeCsvHeader(header) {
  const value = String(header || "").trim().toLowerCase().replace(/\s+/g, "");
  const aliases = {
    name: "name",
    名称: "name",
    名字: "name",
    地点: "name",
    地名: "name",
    place: "name",
    title: "name",
    lat: "lat",
    latitude: "lat",
    纬度: "lat",
    lng: "lng",
    lon: "lng",
    long: "lng",
    longitude: "lng",
    经度: "lng",
  };
  return aliases[value] || value;
}

function csvNumber(value) {
  const number = Number(String(value || "").trim());
  return Number.isFinite(number) ? number : null;
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

function geoJsonGeometryCenter(geometry) {
  if (!geometry) return null;
  if (geometry.type === "GeometryCollection") {
    const centers = (geometry.geometries || []).map(geoJsonGeometryCenter).filter(Boolean);
    return centers.length ? geometryCenter({ type: "MultiPoint", coordinates: centers }) : null;
  }
  if (geometry.type === "Point") return Array.isArray(geometry.coordinates) ? geometry.coordinates : null;
  return geometryCenter(geometry);
}

function flattenCoordinates(coordinates) {
  if (!Array.isArray(coordinates)) return [];
  if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") return [coordinates];
  return coordinates.flatMap(flattenCoordinates);
}

function normalizeImportedPlace(raw) {
  const lat = coordinateNumber(raw.lat);
  const lng = coordinateNumber(raw.lng);
  const inferredCountry = Number.isFinite(lat) && Number.isFinite(lng) ? inferCountry(lng, lat) : null;
  const countryId = normalizeCountry(raw.country || inferredCountry?.id || "");
  const inferredRegion = Number.isFinite(lat) && Number.isFinite(lng) ? inferRegion(countryId, lng, lat) : null;
  const inferredSubregion = Number.isFinite(lat) && Number.isFinite(lng) ? inferSubregion(countryId, lng, lat) : null;
  const place = {
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
    sourceType: String(raw.sourceType || "").trim(),
  };
  normalizeJapanPlaceHierarchy(place);
  return place;
}

function coordinateNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") return NaN;
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
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
    hongkong: "hk",
    "hong kong": "hk",
    hkg: "hk",
    hk: "hk",
    香港: "hk",
    macao: "mo",
    macau: "mo",
    mo: "mo",
    澳门: "mo",
    taiwan: "tw",
    "cn-tw": "tw",
    tw: "tw",
    twn: "tw",
    台湾: "tw",
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
  const activePage = document.querySelector("[data-page].active")?.dataset.page || "world";
  renderMapControls();
  renderPlaceSelect();
  if (isMapPageActive()) renderGeoMap();
  if (activePage === "dashboard") {
    renderMetrics();
    renderDashboardAchievements();
    renderNextStops();
  }
  if (activePage === "imports") {
    renderImportSummary();
    renderDataInventory();
  }
  if (activePage === "checkins") renderCheckinsPage();
  if (activePage === "achievements") renderAchievements();
}

function renderAfterCheckinChange() {
  checklistStatusCache.signature = "";
  unifiedParkHeritageDoneCache = { signature: "", values: new Map() };
  invalidateMapPointRenderCache();
  if (pendingCheckinRender) return;
  pendingCheckinRender = window.requestAnimationFrame(() => {
    pendingCheckinRender = null;
    renderMetrics();
    renderDashboardAchievements();
    renderNextStops();
    if (document.querySelector('[data-page="checkins"]')?.classList.contains("active")) renderCheckinsPage();
    if (document.querySelector('[data-page="achievements"]')?.classList.contains("active")) renderAchievements();
    if (document.querySelector('[data-page="imports"]')?.classList.contains("active")) renderDataInventory();
    if (isMapPageActive()) {
      if (mapLibreMap && mapLibreMap.isStyleLoaded()) renderMapLibreMarkers();
      scheduleCoverageMapRefresh();
    }
  });
}

function preloadDashboardStats() {
  Promise.allSettled([
    loadChina5aCatalog(),
    loadUsNpsCatalog(),
    loadCatalogData(),
    loadBoundaryData("china2", { renderOnLoad: false }),
    loadBoundaryData("chinaDirect", { renderOnLoad: false }),
    loadBoundaryData("tw2", { renderOnLoad: false }),
  ]).then(() => {
    refreshInferredSubregionsForVisitedPlaces();
    rebuildCoverageFromSavedVisits();
    renderMetrics();
    renderDashboardAchievements();
    renderNextStops();
    if (document.querySelector('[data-page="checkins"]')?.classList.contains("active")) renderCheckinsPage();
    if (document.querySelector('[data-page="achievements"]')?.classList.contains("active")) renderAchievements();
  });
}

function scheduleCoverageMapRefresh(delay = 180) {
  if (pendingCoverageMapRefresh) {
    if (delay >= 180) return;
    window.clearTimeout(pendingCoverageMapRefresh);
    pendingCoverageMapRefresh = null;
  }
  const refresh = (allowRetry = true) => {
    pendingCoverageMapRefresh = null;
    if (!isMapPageActive()) return;
    const pending = isLightOverlayEnabled() ? ensureBoundaryDataForLevel(state.boundaryLevel || "country") : [];
    if (pending.length) {
      Promise.all(pending).finally(() => {
        if (!isMapPageActive()) return;
        if (!refreshMapLibreDataOnly({ updateImports: false, updateMarkers: false })) scheduleGeoMapRender();
      });
      return;
    }
    if (refreshMapLibreDataOnly({ updateImports: false, updateMarkers: false })) return;
    if (allowRetry && mapLibreMap) {
      pendingCoverageMapRefresh = window.setTimeout(() => refresh(false), 64);
      return;
    }
    scheduleGeoMapRender();
  };
  pendingCoverageMapRefresh = window.setTimeout(refresh, delay);
}

function isMapPageActive() {
  return document.querySelector('[data-page="world"]')?.classList.contains("active");
}

function renderMapControls() {
  const panel = document.querySelector(".map-control-panel");
  const toggle = $("#toggleMapControls");
  panel?.classList.toggle("collapsed", mapControlsCollapsed);
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(!mapControlsCollapsed));
    toggle.dataset.i18n = mapControlsCollapsed ? "showMapControls" : "hideMapControls";
    toggle.textContent = t(toggle.dataset.i18n);
    toggle.setAttribute("aria-label", t(toggle.dataset.i18n));
  }
  const level = $("#boundaryLevel");
  if (level) level.value = state.boundaryLevel || "country";
  const provider = $("#mapProvider");
  if (provider) provider.value = normalizeMapProviderMode(state.mapProviderMode);
  const baseOpacity = $("#mapBaseOpacity");
  if (baseOpacity) {
    const value = normalizeMapBaseOpacity(state.mapBaseOpacity);
    baseOpacity.value = String(value);
    baseOpacity.style.setProperty("--opacity-progress", `${value}%`);
    baseOpacity.title = `${currentLanguage === "en" ? "Basemap opacity" : "底图透明度"}：${value}%`;
    baseOpacity.setAttribute("aria-label", currentLanguage === "en" ? "Basemap opacity" : "底图透明度");
    baseOpacity.setAttribute("aria-valuetext", `${value}%`);
    const opacityLabel = $("#mapBaseOpacityLabel");
    const opacityValue = $("#mapBaseOpacityValue");
    if (opacityLabel) opacityLabel.textContent = currentLanguage === "en" ? "Basemap opacity" : "底图透明度";
    if (opacityValue) opacityValue.textContent = `${value}%`;
  }
  applyMapBaseOpacity();
  const overlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays = overlays;
  const showLight = $("#showLightOnMap");
  const showCheckins = $("#showCheckinsOnMap");
  const showTracks = $("#showTracksOnMap");
  const showFlights = $("#showFlightsOnMap");
  const show3d = $("#show3dMap");
  const showChina5a = $("#showChina5aOnMap");
  const showAncientCapitals = $("#showAncientCapitalsOnMap");
  const showWorldHeritage = $("#showWorldHeritageOnMap");
  const showHighAltitude = $("#showHighAltitudeOnMap");
  if (showLight) showLight.checked = Boolean(overlays.light);
  if (showCheckins) showCheckins.checked = Boolean(overlays.checkins);
  if (showTracks) showTracks.checked = Boolean(overlays.paths);
  if (showFlights) showFlights.checked = Boolean(overlays.flights);
  if (show3d) show3d.checked = Boolean(state.map3d);
  if (showChina5a) showChina5a.checked = Boolean(overlays.china5a);
  if (showAncientCapitals) showAncientCapitals.checked = Boolean(overlays.chinaAncientCapitals);
  if (showWorldHeritage) showWorldHeritage.checked = Boolean(overlays.worldHeritage);
  if (showHighAltitude) showHighAltitude.checked = Boolean(overlays.highAltitude);
  $("#addMapPoint")?.classList.toggle("active", mapAddMode);
  $("#addMapPath")?.classList.toggle("active", mapPathMode);
  document.querySelectorAll("[data-region-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.regionView === state.selectedRegionView);
  });
  scheduleMapOverlayInsets();
}

let mapOverlayInsetFrame = 0;
function scheduleMapOverlayInsets() {
  if (mapOverlayInsetFrame) cancelAnimationFrame(mapOverlayInsetFrame);
  mapOverlayInsetFrame = requestAnimationFrame(() => {
    mapOverlayInsetFrame = 0;
    updateMapOverlayInsets();
  });
}

function updateMapOverlayInsets() {
  const mapSurface = document.querySelector(".map-surface");
  const controlPanel = document.querySelector(".map-toolbar > .map-control-panel");
  if (!mapSurface || !controlPanel || window.matchMedia("(max-width: 1100px)").matches) {
    document.documentElement.style.removeProperty("--map-detail-top");
    return;
  }
  const surfaceRect = mapSurface.getBoundingClientRect();
  const panelRect = controlPanel.getBoundingClientRect();
  const panelOverlapsMap = panelRect.bottom > surfaceRect.top && panelRect.top < surfaceRect.bottom;
  const top = panelOverlapsMap ? Math.max(12, Math.ceil(panelRect.bottom - surfaceRect.top + 12)) : 12;
  document.documentElement.style.setProperty("--map-detail-top", `${top}px`);
}

function ensureCheckinOverlayVisible() {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}), checkins: true };
  const showCheckins = $("#showCheckinsOnMap");
  if (showCheckins) showCheckins.checked = true;
}

function ensureTrackOverlayVisible() {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}), paths: true };
  const showTracks = $("#showTracksOnMap");
  if (showTracks) showTracks.checked = true;
}

function moveMapLevelControlToToolbar() {
  const toolbar = document.querySelector(".map-toolbar");
  const firstBlock = toolbar?.firstElementChild;
  const control = document.querySelector(".map-level-control");
  if (!toolbar || !firstBlock || !control) return;
  if (toolbar.querySelector(".map-control-panel")) return;
  let row = toolbar.querySelector(".map-title-row");
  if (!row) {
    row = document.createElement("div");
    row.className = "map-title-row";
    toolbar.insertBefore(row, firstBlock);
    row.appendChild(firstBlock);
  }
  if (!control.closest(".map-toolbar")) row.appendChild(control);
}

function parsePageHash(hash = location.hash) {
  const raw = String(hash || "").replace(/^#/, "") || "world";
  const [pageId, targetId = ""] = raw.split(":");
  return { pageId: pageId || "world", targetId };
}

function scrollToPageTarget(pageId, targetId) {
  if (!targetId) return;
  const target = document.getElementById(targetId);
  if (!target) return;
  if (pageId === "checkins") {
    const details = target.querySelector?.(".manual-section-details");
    if (details && !details.open) {
      details.open = true;
      renderManualSection(details.dataset.manualSection);
    }
    document.querySelectorAll("[data-manual-jump]").forEach((button) => button.classList.toggle("active", button.dataset.manualJump === targetId));
    target.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth" });
    window.setTimeout(updateManualNavActiveByScroll, 260);
    return;
  }
  if (pageId === "achievements") {
    if (target.matches("[data-achievement-section]")) {
      target.open = true;
      scheduleFillAchievementSection(target);
      document.querySelectorAll("[data-checklist-jump]").forEach((button) => button.classList.toggle("active", button.dataset.checklistJump === targetId));
      target.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth" });
      window.setTimeout(updateChecklistNavActiveByScroll, 260);
      return;
    }
    if (target.matches("details")) {
      target.open = true;
      scheduleFillLazyChecklistGroup(target, () => {
        target.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth" });
        window.setTimeout(updateChecklistNavActiveByScroll, 260);
      });
      return;
    }
  }
  target.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth" });
}

function showPage(pageId, targetId = "") {
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
    if (state.mapOverlays?.china5a) {
      Promise.all([loadChina5aCatalog(), loadChina5aCoordinates(), loadUsNpsCatalog(), loadUsNpsBoundaries()])
        .finally(synchronizeUsNpsMapState);
    }
    if (state.mapOverlays?.chinaAncientCapitals || hasAncientCapitalCheckins()) loadChinaAncientCapitals().finally(renderGeoMap);
    if (state.mapOverlays?.worldHeritage) loadCatalogData();
    if (state.mapOverlays?.flights) loadAirportData().then(refreshFlightRoutesOnMap);
    if (state.mapOverlays?.highAltitude) renderGeoMap();
    setTimeout(() => {
      if (mapLibreMap) mapLibreMap.resize();
      if (leafletMap) leafletMap.invalidateSize();
      renderGeoMap();
    }, 80);
  }
  if (target === "dashboard") {
    renderMetrics();
    renderDashboardAchievements();
    renderNextStops();
    Promise.allSettled([loadChina5aCatalog(), loadUsNpsCatalog(), loadCatalogData()]).then(() => {
      if (!document.querySelector('[data-page="dashboard"]')?.classList.contains("active")) return;
      renderMetrics();
      renderDashboardAchievements();
      renderNextStops();
    });
  }
  if (target === "checkins") {
    preloadBoundaryData(false, ["country", "china", "admin1", "china2", "chinaDirect", "tw2"]).finally(() => {
      renderCheckinsPage();
      scrollToPageTarget(target, targetId);
    });
  }
  if (target === "achievements") {
    renderAchievements();
    loadCatalogData();
    Promise.all([loadChina5aCatalog(), loadChina5aCoordinates()]);
    loadUsNpsCatalog();
    scheduleChecklistNavSpy();
    window.setTimeout(() => scrollToPageTarget(target, targetId), 80);
  }
  if (target === "imports") {
    renderImportSummary();
    renderDataInventory();
    scrollToPageTarget(target, targetId);
  }
}

setLoadingDebug("读取本地快速状态", "pending");
loadState();
setLoadingDebug("读取本地快速状态", "done");
moveMapLevelControlToToolbar();
applyLanguage();
renderMapControls();
renderLegend();
{
  const { pageId, targetId } = parsePageHash();
  showPage(pageId, targetId);
}
detectMapProviderByIp();
ensureBoundaryDataForLevel(state.boundaryLevel || "country");
setLoadingDebug("读取完整旅行数据", "pending");
loadStateFromIndexedDb().finally(() => {
  fullStateLoaded = true;
  setLoadingDebug("读取完整旅行数据", "done");
  checklistStatusCache.signature = "";
  unifiedParkHeritageDoneCache = { signature: "", values: new Map() };
  invalidateMapPointRenderCache();
  renderLegend();
  rebuildCoverageFromSavedVisits();
  restoreStoredMapViewport();
  ensureBoundaryDataForLevel(state.boundaryLevel || "country");
  preloadDashboardStats();
  renderAll();
  showPage(location.hash.replace("#", "") || "world");
  detectMapProviderByIp();
  clearLoadingDebugSoon();
});

window.travelMapApp = {
  importPlacesFromText,
  parseImportFile,
  parseHanglvXls,
  places: () => places,
  visits: () => state.visits,
  flights: () => state.flights,
  flightImports: () => state.flightImports,
  flightRoutes: () => flightRouteGeoJson(),
};

$("#quickAddForm").addEventListener("submit", addVisit);
$("#importFile").addEventListener("change", handleImport);
$("#exportArchive").addEventListener("click", exportArchive);
$("#archiveFile").addEventListener("change", importArchiveFile);
$("#clearAllData")?.addEventListener("click", () => {
  if (window.confirm("确认清空所有点亮、导入、手动行政区和打卡勾选？")) clearAllUserData();
});
$("#importSummary").addEventListener("click", (event) => {
  if (event.target.closest("[data-clear-checkins]")) {
    if (window.confirm("确认清除所有点亮、打卡勾选和手动行政区？导入文件和轨迹会保留。")) clearCheckinsAndAchievementPoints();
    return;
  }
  if (event.target.closest("[data-delete-all-imports]")) {
    deleteAllImportedData();
    return;
  }
  const locateCheckinButton = event.target.closest("[data-locate-manual-checkin]");
  if (locateCheckinButton) {
    locateManualCheckin(locateCheckinButton.dataset.locateManualCheckin);
    return;
  }
  const renameCheckinButton = event.target.closest("[data-rename-manual-checkin]");
  if (renameCheckinButton) {
    renameManualCheckin(renameCheckinButton.dataset.renameManualCheckin);
    return;
  }
  const deleteCheckinButton = event.target.closest("[data-delete-manual-checkin]");
  if (deleteCheckinButton) {
    deleteManualCheckin(deleteCheckinButton.dataset.deleteManualCheckin);
    return;
  }
  if (event.target.closest("[data-delete-selected-checkins]")) {
    if (selectedManualCheckinIds.size && window.confirm(currentLanguage === "en" ? `Delete ${selectedManualCheckinIds.size} selected check-ins?` : `确认删除所选的 ${selectedManualCheckinIds.size} 个手动打卡？`)) {
      deleteManualCheckins([...selectedManualCheckinIds]);
    }
    return;
  }
  const locatePathButton = event.target.closest("[data-locate-manual-path]");
  if (locatePathButton) {
    locateManualPath(locatePathButton.dataset.locateManualPath);
    return;
  }
  const editPathButton = event.target.closest("[data-edit-manual-path]");
  if (editPathButton) {
    const placeId = editPathButton.dataset.editManualPath;
    locateManualPath(placeId);
    window.setTimeout(() => editManualPath(placeId), 160);
    return;
  }
  const renamePathButton = event.target.closest("[data-rename-manual-path]");
  if (renamePathButton) {
    renameManualPath(renamePathButton.dataset.renameManualPath);
    return;
  }
  const deletePathButton = event.target.closest("[data-delete-inventory-object]");
  if (deletePathButton) {
    deleteInventoryObject(deletePathButton.dataset.deleteInventoryObject);
    return;
  }
  if (event.target.closest("[data-delete-selected-paths]")) {
    if (selectedManualPathIds.size && window.confirm(currentLanguage === "en" ? `Delete ${selectedManualPathIds.size} selected paths?` : `确认删除所选的 ${selectedManualPathIds.size} 条路径？`)) {
      deleteImportedObjects([...selectedManualPathIds]);
    }
    return;
  }
  const pageButton = event.target.closest("[data-import-page]");
  if (pageButton && !pageButton.disabled) {
    const delta = Number(pageButton.dataset.pageDelta) || 0;
    if (pageButton.dataset.importPage === "checkins") manualCheckinPage += delta;
    if (pageButton.dataset.importPage === "paths") manualPathPage += delta;
    renderImportSummary();
    return;
  }
  const button = event.target.closest("[data-delete-import]");
  if (button) {
    deleteImportedBatch(button.dataset.deleteImport, Number(button.dataset.importIndex));
    return;
  }
  const flightButton = event.target.closest("[data-delete-flight-import]");
  if (flightButton) deleteFlightImportBatch(flightButton.dataset.deleteFlightImport);
});
$("#importSummary").addEventListener("input", (event) => {
  if (!event.target.matches("[data-import-search]")) return;
  importManagerQuery = event.target.value;
  manualCheckinPage = 0;
  manualPathPage = 0;
  if (importManagerSearchTimer) clearTimeout(importManagerSearchTimer);
  importManagerSearchTimer = window.setTimeout(() => {
    importManagerSearchTimer = null;
    const input = $("#importSummary [data-import-search]");
    const selectionStart = input?.selectionStart ?? importManagerQuery.length;
    renderImportSummary();
    const nextInput = $("#importSummary [data-import-search]");
    nextInput?.focus();
    nextInput?.setSelectionRange(selectionStart, selectionStart);
  }, 180);
});
$("#importSummary").addEventListener("change", (event) => {
  if (event.target.matches("[data-import-sort]")) {
    importManagerSort = event.target.value;
    manualCheckinPage = 0;
    manualPathPage = 0;
    renderImportSummary();
    return;
  }
  if (event.target.matches("[data-select-manual-path]")) {
    const id = event.target.dataset.selectManualPath;
    if (event.target.checked) selectedManualPathIds.add(id);
    else selectedManualPathIds.delete(id);
    renderImportSummary();
    return;
  }
  if (event.target.matches("[data-select-manual-checkin]")) {
    const id = event.target.dataset.selectManualCheckin;
    if (event.target.checked) selectedManualCheckinIds.add(id);
    else selectedManualCheckinIds.delete(id);
    renderImportSummary();
    return;
  }
  if (event.target.matches("[data-select-visible-checkins]")) {
    document.querySelectorAll("#importSummary [data-select-manual-checkin]").forEach((checkbox) => {
      checkbox.checked = event.target.checked;
      if (event.target.checked) selectedManualCheckinIds.add(checkbox.dataset.selectManualCheckin);
      else selectedManualCheckinIds.delete(checkbox.dataset.selectManualCheckin);
    });
    renderImportSummary();
    return;
  }
  if (event.target.matches("[data-select-visible-paths]")) {
    document.querySelectorAll("#importSummary [data-select-manual-path]").forEach((checkbox) => {
      checkbox.checked = event.target.checked;
      if (event.target.checked) selectedManualPathIds.add(checkbox.dataset.selectManualPath);
      else selectedManualPathIds.delete(checkbox.dataset.selectManualPath);
    });
    renderImportSummary();
  }
});
$("#dataInventory")?.addEventListener("click", (event) => {
  const editPathButton = event.target.closest("[data-edit-imported-path]");
  if (editPathButton) {
    const placeId = editPathButton.dataset.editImportedPath;
    locateManualPath(placeId);
    window.setTimeout(() => editManualPath(placeId), 160);
    return;
  }
  const visitButton = event.target.closest("[data-delete-inventory-visit]");
  if (visitButton) {
    deleteInventoryVisit(visitButton.dataset.deleteInventoryVisit);
    return;
  }
  const objectButton = event.target.closest("[data-delete-inventory-object]");
  if (objectButton) {
    deleteInventoryObject(objectButton.dataset.deleteInventoryObject);
    return;
  }
  const flightButton = event.target.closest("[data-delete-inventory-flight]");
  if (flightButton) deleteFlightRecord(flightButton.dataset.deleteInventoryFlight);
});
$("#checkins")?.addEventListener("click", (event) => {
  const jumpButton = event.target.closest("[data-manual-jump]");
  if (jumpButton) {
    const target = document.getElementById(jumpButton.dataset.manualJump);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelectorAll("[data-manual-jump]").forEach((button) => button.classList.toggle("active", button === jumpButton));
    window.setTimeout(updateManualNavActiveByScroll, 260);
    return;
  }
  const button = event.target.closest("[data-manual-action]");
  if (!button || button.disabled) return;
  const [type, countryId, encodedName, subadminFlag] = button.dataset.manualAction.split(":");
  if (type === "country") {
    toggleManualCountry(countryId);
    return;
  }
  if (type === "admin") {
    const regionName = decodeURIComponent(encodedName || "");
    const isSubadmin = subadminFlag === "1";
    const center = manualAdminCenter(countryId, regionName, isSubadmin);
    toggleManualAdminRegion(countryId, regionName, isSubadmin, center || null);
  }
});
$("#checkins")?.addEventListener("toggle", (event) => {
  const details = event.target;
  if (!details?.classList?.contains("manual-section-details")) return;
  if (!details) return;
  if (details.open) {
    renderManualSection(details.dataset.manualSection);
    return;
  }
  const target = details.querySelector(".manual-grid, .manual-country-groups, .license-plate-grid");
  if (target) target.innerHTML = "";
}, true);
$("#checkins")?.addEventListener("scroll", scheduleManualNavSpy, { passive: true });
$("#boundaryLevel").addEventListener("change", (event) => {
  state.boundaryLevel = event.target.value;
  renderMapControls();
  const pending = isLightOverlayEnabled() ? ensureBoundaryDataForLevel(state.boundaryLevel || "country") : [];
  if (!pending.length) renderGeoMap();
  saveUiStateSoon();
});
$("#mapProvider")?.addEventListener("change", (event) => {
  state.mapProviderMode = normalizeMapProviderMode(event.target.value);
  renderMapControls();
  renderGeoMap();
  saveUiStateSoon();
});
$("#mapBaseOpacity")?.addEventListener("input", (event) => {
  state.mapBaseOpacity = normalizeMapBaseOpacity(event.target.value);
  event.target.style.setProperty("--opacity-progress", `${state.mapBaseOpacity}%`);
  event.target.title = `${currentLanguage === "en" ? "Basemap opacity" : "底图透明度"}：${state.mapBaseOpacity}%`;
  event.target.setAttribute("aria-valuetext", `${state.mapBaseOpacity}%`);
  const opacityValue = $("#mapBaseOpacityValue");
  if (opacityValue) opacityValue.textContent = `${state.mapBaseOpacity}%`;
  applyMapBaseOpacity();
  saveUiStateSoon();
});
$("#showLightOnMap")?.addEventListener("change", (event) => {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays.light = event.target.checked;
  saveUiStateSoon();
  if (event.target.checked) {
    const pending = ensureBoundaryDataForLevel(state.boundaryLevel || "country");
    if (!pending.length) renderGeoMap();
  } else {
    renderGeoMap();
  }
});
$("#showCheckinsOnMap")?.addEventListener("change", (event) => {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays.checkins = event.target.checked;
  saveUiStateSoon();
  renderGeoMap();
});
$("#showTracksOnMap")?.addEventListener("change", (event) => {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays.paths = event.target.checked;
  saveUiStateSoon();
  renderGeoMap();
});
$("#showFlightsOnMap")?.addEventListener("change", (event) => {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays.flights = event.target.checked;
  saveUiStateSoon();
  renderGeoMap();
});
$("#show3dMap")?.addEventListener("change", (event) => {
  applyMap3dToggle(event.target.checked);
  renderMapControls();
  saveUiStateSoon();
});
$("#showChina5aOnMap")?.addEventListener("change", (event) => {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays.china5a = event.target.checked;
  saveUiStateSoon();
  const refresh = () => {
    checklistOverlayCache.signature = "";
    if (event.target.checked) synchronizeUsNpsMapState();
    else renderGeoMap();
  };
  if (event.target.checked) Promise.all([loadChina5aCatalog(), loadChina5aCoordinates(), loadUsNpsCatalog(), loadUsNpsBoundaries()]).finally(refresh);
  else refresh();
});
$("#showAncientCapitalsOnMap")?.addEventListener("change", (event) => {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays.chinaAncientCapitals = event.target.checked;
  saveUiStateSoon();
  const refresh = () => {
    checklistOverlayCache.signature = "";
    if (mapLibreMap) renderMapLibreMarkers();
    else renderGeoMap();
  };
  if (event.target.checked) loadChinaAncientCapitals().finally(refresh);
  else refresh();
});
$("#showWorldHeritageOnMap")?.addEventListener("change", (event) => {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays.worldHeritage = event.target.checked;
  saveUiStateSoon();
  const refresh = () => {
    checklistOverlayCache.signature = "";
    if (mapLibreMap) renderMapLibreMarkers();
    else renderGeoMap();
  };
  if (event.target.checked) loadCatalogData().finally(refresh);
  else refresh();
});
$("#showHighAltitudeOnMap")?.addEventListener("change", (event) => {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays.highAltitude = event.target.checked;
  saveUiStateSoon();
  checklistOverlayCache.signature = "";
  if (mapLibreMap) renderMapLibreMarkers();
  else renderGeoMap();
});
bindMapPathBoxSelection();
$("#addMapPoint")?.addEventListener("click", () => {
  if (mapAddMode) {
    setMapAddMode(false);
    closeMapPopupsAndDetail();
  } else {
    setMapAddMode(true);
  }
});
$("#toggleMapControls")?.addEventListener("click", () => {
  mapControlsCollapsed = !mapControlsCollapsed;
  localStorage.setItem(mapControlsStorageKey, mapControlsCollapsed ? "1" : "0");
  renderMapControls();
  scheduleActiveMapResize();
});
$("#addMapPath")?.addEventListener("click", () => {
  if (mapPathMode) {
    setMapPathMode(false, false);
    closeMapPopupsAndDetail();
    refreshMapPathPreview();
  } else {
    setMapPathMode(true);
    openMapPathForm();
  }
});
document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});
$("#achievementList").addEventListener("click", (event) => {
  const jump = event.target.closest("[data-checklist-jump]");
  if (jump) {
    event.preventDefault();
    event.stopPropagation();
    document.querySelectorAll("[data-checklist-jump]").forEach((button) => button.classList.toggle("active", button === jump));
    const target = document.getElementById(jump.dataset.checklistJump);
    if (target) {
      target.open = true;
      if (target.matches("[data-achievement-section]")) {
        scheduleFillAchievementSection(target);
        target.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth" });
        window.setTimeout(updateChecklistNavActiveByScroll, 260);
      } else {
        scheduleFillLazyChecklistGroup(target, () => {
          target.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth" });
          window.setTimeout(updateChecklistNavActiveByScroll, 260);
        });
      }
    }
    return;
  }
  const highAltitudeFilter = event.target.closest("[data-high-altitude-filter]");
  if (highAltitudeFilter) {
    highAltitudeFilters[highAltitudeFilter.dataset.highAltitudeFilter] = highAltitudeFilter.checked;
    const section = highAltitudeFilter.closest(".theme-checklist");
    if (section) {
      section.outerHTML = section.classList.contains("high-altitude-inline")
        ? renderHighAltitudeInlineSection("chinaHighAltitude", checklistCatalog.chinaHighAltitude)
        : renderHighAltitudeSection("chinaHighAltitude", checklistCatalog.chinaHighAltitude);
    }
    return;
  }
  const button = event.target.closest("[data-checklist]");
  if (!button) return;
  rememberChecklistGroupForElement(button);
  toggleChecklistItem(button.dataset.checklist, button.dataset.item, button.dataset.group || "");
});
$("#achievementList").addEventListener("toggle", (event) => {
  if (event.target?.matches?.("[data-achievement-section]")) {
    if (event.target.open) scheduleFillAchievementSection(event.target);
    return;
  }
  const details = event.target.closest?.("[data-checklist-group]");
  if (!details) return;
  if (details.dataset.checklistGroup?.startsWith("worldHeritage:") || details.dataset.checklistGroup?.startsWith("china5a:")) {
    if (details.open) scheduleFillLazyChecklistGroup(details);
    return;
  }
  setChecklistGroupOpen(details.dataset.checklistGroup, details.open);
  if (details.open) scheduleFillLazyChecklistGroup(details);
}, true);
$("#achievements")?.addEventListener("scroll", scheduleChecklistNavSpy, { passive: true });
$("#leafletMap").addEventListener("click", (event) => {
  if (event.target.closest("[data-close-popup]")) {
    closeMapPopupsAndDetail();
    return;
  }
  const checklistButton = event.target.closest("[data-checklist-map]");
  if (checklistButton) {
    toggleChecklistItem(checklistButton.dataset.checklistMap, checklistButton.dataset.item);
    return;
  }
  const button = event.target.closest("[data-unvisit]");
  if (!button) return;
  unvisitPlace(button.dataset.unvisit);
});
$("#mapDetail").addEventListener("click", (event) => {
  if (event.target.closest("[data-close-detail]")) {
    setMapAddMode(false);
    closeMapPopupsAndDetail();
    return;
  }
  if (event.target.closest("[data-cancel-map-point]")) {
    setMapAddMode(false);
    closeMapPopupsAndDetail();
    return;
  }
  const checklistButton = event.target.closest("[data-checklist-map]");
  if (checklistButton) {
    toggleChecklistItem(checklistButton.dataset.checklistMap, checklistButton.dataset.item);
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
  const countryButton = event.target.closest("[data-country-toggle]");
  if (countryButton) {
    toggleManualCountry(countryButton.dataset.countryToggle);
    return;
  }
  const button = event.target.closest("[data-unvisit]");
  if (!button) return;
  unvisitPlace(button.dataset.unvisit);
});
$("#mapDetail").addEventListener("submit", (event) => {
  if (event.target.closest("#mapPathForm")) {
    event.preventDefault();
    saveMapPath(new FormData(event.target).get("name"));
    return;
  }
  if (!event.target.closest("#mapPointForm")) return;
  event.preventDefault();
  if (!pendingMapClickPoint) return;
  const data = new FormData(event.target);
  createMapClickCheckin({
    name: data.get("name"),
    lng: pendingMapClickPoint.lng,
    lat: pendingMapClickPoint.lat,
  });
});
$("#mapDetail").addEventListener("click", (event) => {
  const toolButton = event.target.closest("[data-map-path-tool]");
  if (toolButton) {
    setMapPathEditTool(toolButton.dataset.mapPathTool);
    return;
  }
  if (event.target.closest("[data-undo-map-path-edit]")) {
    undoMapPathEdit();
    return;
  }
  if (event.target.closest("[data-redo-map-path-edit]")) {
    redoMapPathEdit();
    return;
  }
  if (event.target.closest("[data-simplify-map-path]")) {
    simplifyPendingMapPath();
    return;
  }
  if (event.target.closest("[data-delete-selected-map-path]")) {
    deleteSelectedMapPathVertices();
    return;
  }
  if (event.target.closest("[data-delete-map-path]")) {
    deleteEditingMapPath();
    return;
  }
  if (event.target.closest("[data-cancel-map-path]")) {
    setMapPathMode(false, false);
    closeMapPopupsAndDetail();
    refreshMapPathPreview();
  }
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
  preloadBoundaryData(true, boundaryKeysForLevel(state.boundaryLevel)).finally(() => {
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
    showPage(pageId, "");
  });
});
let mapViewportResizeTimer = null;
function scheduleActiveMapResize() {
  if (!isMapPageActive()) return;
  if (mapViewportResizeTimer) clearTimeout(mapViewportResizeTimer);
  mapViewportResizeTimer = setTimeout(() => {
    mapViewportResizeTimer = null;
    if (mapLibreMap) mapLibreMap.resize();
    if (leafletMap) leafletMap.invalidateSize();
    updateMapOverlayInsets();
  }, 120);
}
$(".import-guide")?.addEventListener("toggle", () => {
  if (syncingImportGuideOpenState) return;
  importGuideUserToggled = true;
});
window.addEventListener("resize", () => {
  scheduleActiveMapResize();
  scheduleMapOverlayInsets();
  syncImportGuideOpenState();
});
window.addEventListener("orientationchange", () => {
  scheduleActiveMapResize();
  scheduleMapOverlayInsets();
});
window.visualViewport?.addEventListener("resize", () => {
  scheduleActiveMapResize();
  scheduleMapOverlayInsets();
});
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js?v=467").catch((error) => console.warn("Service Worker registration failed", error));
  });
}
window.addEventListener("hashchange", () => {
  const { pageId, targetId } = parsePageHash();
  if (document.querySelector(`[data-page="${pageId}"]`)) showPage(pageId, targetId);
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
