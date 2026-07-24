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
const languageStorageKey = "travel-map-language";
const idbName = "travel-map-db";
const idbStore = "archives";
const idbStateKey = "state";
const appVersion = "1.8.2";
const worldCountryTotal = 195;
const china5aOfficialTotal = 359;
const chinaAncientCapitalTotal = 146;
const worldHeritageCatalogTotal = 1248;
const dataCacheVersion = "20260723-ancient-capitals";
const fixedChecklistTotals = {
  china5a: china5aOfficialTotal,
  chinaAncientCapitals: chinaAncientCapitalTotal,
  worldHeritage: worldHeritageCatalogTotal,
};
const maxImportVisiblePoints = Infinity;
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
let mapLibreLayerHandlersBound = { country: false, admin: false, subadmin: false, points: false };
let bingMapLibreProtocolRegistered = false;
let mapProviderDetectionPromise = null;
let leafletDidInitialFit = false;
let catalogDataRequested = false;
let catalogDataPromise = null;
let china5aCatalogPromise = null;
let china5aCoordinatesPromise = null;
let chinaAncientCapitalsPromise = null;
let china5aCatalogStatus = { source: "本地清单", detail: `${china5aOfficialTotal} 个 5A 景区`, total: china5aOfficialTotal };
let china5aCoordinates = {};
let chinaAncientCapitals = {};
let chinaAncientCapitalCoordinates = {};
let chinaAncientCapitalMeta = {};
let worldHeritageCatalogStatus = { source: "本地清单", detail: `${worldHeritageCatalogTotal} 条记录`, total: worldHeritageCatalogTotal };
let worldHeritageCoordinates = {};
let worldHeritageEnglishNames = {};
let worldHeritageCountryIds = {};
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
let pendingCheckinRender = null;
let pendingCoverageMapRefresh = null;
let pendingManualNavSpy = null;
let pendingChecklistNavSpy = null;
let restoringMapViewport = false;
let checklistStatusCache = { signature: "", marked: new Set(), visited: new Set() };
let checklistOverlayCache = { signature: "", items: [], keySet: new Set() };
let checklistCoordinateLookupCache = { china5a: null, ancientCapitals: null, worldHeritage: null, englishNames: null, map: new Map() };
let derivedStatsRevision = 0;
let dashboardStatsCache = { signature: "", stats: null };
let mapAddMode = false;
let pendingMapClickPoint = null;
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
    levelCountry: "国家级",
    levelAdmin: "省级",
    levelCity: "市级",
    overlayLight: "我的点亮",
    overlayCheckins: "我的打卡",
    overlayTracks: "我的轨迹",
    overlay5a: "5A 景区",
    overlayAncientCapitals: "中国古都",
    overlayHeritage: "世界遗产",
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
    csvHelp: "支持 GeoJSON/JSON、KML、CSV 和照片。GeoJSON/KML 的点会作为导入地点，线和面会作为轨迹/Shape 显示，不会自动变成地点；CSV 建议只保留名称、纬度、经度三列，也支持英文列名：name、lat/latitude、lng/lon/longitude。其他列会忽略。照片只读取本地文件名和 EXIF GPS，不上传照片。当前不限制导入点数，但点太多会影响浏览器渲染，建议只导入确实需要显示的点。",
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
    importedPoints: "导入地点",
    importedTracks: "导入轨迹/Shape",
    trackLength: "轨迹长度",
    checked: "已去",
    unvisited: "未去过",
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
    addingMapPoint: "点击地图空白处添加打卡点",
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
    overlay5a: "5A scenic areas",
    overlayAncientCapitals: "Ancient Chinese Capitals",
    overlayHeritage: "World Heritage",
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
    csvHelp: "GeoJSON/JSON, KML, CSV, and photos are supported. GeoJSON/KML points become imported places; lines and polygons become tracks/shapes and do not create extra points. CSV works best with only name, latitude, and longitude. Supported headers are 名称/name, 纬度/lat/latitude, and 经度/lng/lon/longitude; extra columns are ignored. Photos only read local filename and EXIF GPS without uploading files. There is no hard import limit now, but very large point sets can slow browser rendering.",
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
    importedPoints: "Imported points",
    importedTracks: "Imported tracks / shapes",
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
    addingMapPoint: "Click an empty spot on the map to add a check-in point",
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
  return { light: true, checkins: true, paths: true, china5a: false, chinaAncientCapitals: false, worldHeritage: false };
}

function normalizeMapOverlays(overlays = {}) {
  return {
    ...defaultMapOverlays(),
    ...overlays,
    china5a: false,
    chinaAncientCapitals: false,
    worldHeritage: false,
  };
}

function isLightOverlayEnabled() {
  return Boolean(({ ...defaultMapOverlays(), ...(state.mapOverlays || {}) }).light);
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

function normalizeDetectedMapProvider(value) {
  return ["gaode", "google"].includes(value) ? value : "";
}

function activeMapProvider() {
  const mode = normalizeMapProviderMode(state.mapProviderMode);
  if (mode !== "auto") return mode;
  return normalizeDetectedMapProvider(state.detectedMapProvider) || fallbackMapProviderFromLocale();
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
  buddhistMountains: "Four Sacred Buddhist Mountains",
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
  莫高窟: "Mogao Caves",
  云冈石窟: "Yungang Grottoes",
  龙门石窟: "Longmen Grottoes",
  麦积山石窟: "Maijishan Grottoes",
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

function checklistItemDisplayName(key, item) {
  if (currentLanguage !== "en") return item;
  if (key === "worldHeritage" && worldHeritageEnglishNames[item]) return worldHeritageEnglishNames[item];
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
  ["北京", "京", "皇城中轴", "Imperial Axis"],
  ["上海", "沪", "海派都会", "Haipai Metropolis"],
  ["天津", "津", "海河津门", "Haihe Gateway"],
  ["重庆", "渝", "山城雾都", "Mountain City"],
  ["河北", "冀", "燕赵大地", "Yan-Zhao Heartland"],
  ["山西", "晋", "表里山河", "Mountains and Rivers"],
  ["内蒙古", "蒙", "草原故乡", "Grassland Homeland"],
  ["辽宁", "辽", "辽海门户", "Liaohai Gateway"],
  ["吉林", "吉", "长白林海", "Changbai Forests"],
  ["黑龙江", "黑", "北国边疆", "Northern Frontier"],
  ["山东", "鲁", "齐鲁大地", "Qilu Heartland"],
  ["河南", "豫", "中原腹地", "Central Plains"],
  ["湖北", "鄂", "荆楚水乡", "Jingchu Lakes"],
  ["湖南", "湘", "潇湘大地", "Xiaoxiang Land"],
  ["广东", "粤", "岭南大地", "Lingnan South"],
  ["广西", "桂", "八桂山水", "Bagui Landscapes"],
  ["海南", "琼", "椰风海韵", "Tropical Island"],
  ["陕西", "秦", "三秦大地", "Three Qin Lands"],
  ["甘肃", "陇", "丝路走廊", "Silk Road Corridor"],
  ["青海", "青", "三江之源", "Source of Three Rivers"],
  ["宁夏", "宁", "塞上江南", "Oasis Beyond the Wall"],
  ["新疆", "新", "丝路天山", "Tianshan Silk Road"],
  ["云南", "滇", "彩云之南", "South of Colorful Clouds"],
  ["贵州", "黔", "山地公园", "Mountain Parkland"],
  ["四川", "川", "天府之国", "Land of Abundance"],
  ["安徽", "皖", "江淮山水", "Jianghuai Landscapes"],
  ["福建", "闽", "八闽山海", "Fujian Mountains and Sea"],
  ["江西", "赣", "赣鄱山水", "Ganpo Landscapes"],
  ["浙江", "浙", "诗画江南", "Poetic Jiangnan"],
  ["江苏", "苏", "吴韵水乡", "Wu Water Towns"],
  ["西藏", "藏", "雪域高原", "Snowy Plateau"],
  ["台湾", "台", "宝岛山海", "Island Mountains and Sea"],
  ["香港", "港", "东方之珠", "Pearl of the Orient"],
  ["澳门", "澳", "海上花园", "Garden by the Sea"],
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
      "卡尔斯巴德洞窟国家公园（Carlsbad Caverns National Park）",
      "海峡群岛国家公园（Channel Islands National Park）",
      "康加里国家公园（Congaree National Park）",
      "火山口湖国家公园（Crater Lake National Park）",
      "凯霍加谷国家公园（Cuyahoga Valley National Park）",
      "死亡谷国家公园（Death Valley National Park）",
      "德纳里国家公园（Denali National Park）",
      "干龟岛国家公园（Dry Tortugas National Park）",
      "大沼泽地国家公园（Everglades National Park）",
      "北极之门国家公园（Gates of the Arctic National Park）",
      "门户拱门国家公园（Gateway Arch National Park）",
      "冰川国家公园（Glacier National Park）",
      "冰川湾国家公园（Glacier Bay National Park）",
      "大峡谷国家公园（Grand Canyon National Park）",
      "大提顿国家公园（Grand Teton National Park）",
      "大盆地国家公园（Great Basin National Park）",
      "大沙丘国家公园（Great Sand Dunes National Park）",
      "大烟山国家公园（Great Smoky Mountains National Park）",
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
      "红木国家公园（Redwood National Park）",
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
  长隆旅游度假区: [23.005, 113.324, "广东"], 丹霞山: [25.04, 113.75, "广东"], 罗浮山: [23.279, 114.047, "广东"], 西樵山: [22.933, 112.985, "广东"],
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
};

let state = {
  visits: [],
  trips: [],
  importedFiles: [],
  checklistMarks: [],
  openChecklistGroups: [],
  coverage: { countries: [], regions: {}, subregions: {} },
  selectedRegionView: "china",
  boundaryLevel: "country",
  mapProviderMode: "auto",
  detectedMapProvider: "",
  mapOverlays: { light: true, checkins: true, paths: true, china5a: false, chinaAncientCapitals: false, worldHeritage: false },
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

function placeMatchesName(place, name) {
  const target = canonicalPlaceKey(name);
  return canonicalPlaceKey(place.name) === target || canonicalPlaceKey(place.type) === target || place.checklist?.some((item) => canonicalPlaceKey(item) === target);
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
    });
  });
  return keys;
}

function checklistMarkKeys() {
  return new Set((state.checklistMarks || []).map((mark) => canonicalPlaceKey(mark.split(":").slice(1).join(":"))).filter(Boolean));
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
  pendingMapClickPoint = null;
  $("#addMapPoint")?.classList.toggle("active", mapAddMode);
  $("#leafletMap")?.classList.toggle("adding-map-point", mapAddMode);
  if (mapLibreMap) mapLibreMap.getCanvas().style.cursor = mapAddMode ? "crosshair" : "";
  if (mapAddMode) showToast(t("addingMapPoint"));
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
  saveState();
  setMapAddMode(false);
  closeMapPopupsAndDetail();
  renderPlaceDetail(id);
  renderAfterCheckinChange();
  showToast(`${finalName} ${t("mapPointAdded")}`);
}

function handleMapCanvasClick(lng, lat, originalEvent = null) {
  if (originalEvent?._travelMapHandled) return;
  if (!mapAddMode) {
    closeMapPopupsAndDetail();
    return;
  }
  openMapClickCheckinForm(lng, lat);
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
  return mapLibreMap.queryRenderedFeatures(event.point, { layers: ["map-points-circle"] }).length > 0;
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
  renderMapControls();
}

function setLanguage(language) {
  currentLanguage = language === "en" ? "en" : "zh";
  localStorage.setItem(languageStorageKey, currentLanguage);
  applyLanguage();
  renderLanguageSensitiveViews();
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

function normalizeMapViewport(viewport) {
  if (!viewport || !Array.isArray(viewport.center)) return null;
  const [lng, lat] = viewport.center.map(Number);
  const zoom = Number(viewport.zoom);
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || !Number.isFinite(zoom)) return null;
  return {
    center: [Math.max(-180, Math.min(180, lng)), Math.max(-85, Math.min(85, lat))],
    zoom: Math.max(1, Math.min(18, zoom)),
  };
}

function rememberMapViewportSoon() {
  if (restoringMapViewport) return;
  let viewport = null;
  if (mapLibreMap) {
    const center = mapLibreMap.getCenter();
    viewport = normalizeMapViewport({ center: [center.lng, center.lat], zoom: mapLibreMap.getZoom() });
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
      checklistMarks: saved.state.checklistMarks || [],
      openChecklistGroups: saved.state.openChecklistGroups || [],
      mapProviderMode: normalizeMapProviderMode(saved.state.mapProviderMode || state.mapProviderMode),
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
    applyChecklistGeography(place, checklistKey, checklistCoordinateFor(place.name));
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
      const nameAliases = collectWorldHeritageNameAliases(data.byCountry);
      if (Array.isArray(data.items) && data.items.length) {
        data.items.forEach((item) => {
          const sourceName = stripHtmlTags(item.zhName || (/^Q\d+$/.test(item.name || "") ? item.enName : item.name) || item.enName);
          const normalizedItem = normalizeWorldHeritageItemName(sourceName, nameAliases);
          if (!normalizedItem) return;
          const itemCountries = (Array.isArray(item.countries) && item.countries.length ? item.countries : [item.country]).map(stripHtmlTags);
          const itemCountryIds = Array.isArray(item.countryIds) ? item.countryIds : [];
          if (item.enName) englishNames[normalizedItem] = stripHtmlTags(item.enName);
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
      worldHeritageEnglishNames = {};
      worldHeritageCountryIds = {};
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

function loadChinaAncientCapitals() {
  if (chinaAncientCapitalsPromise) return chinaAncientCapitalsPromise;
  chinaAncientCapitalsPromise = fetchJson("data/china-ancient-capitals.json")
    .then((data) => {
      const items = Array.isArray(data?.items) ? data.items : [];
      if (!items.length) throw new Error("invalid ancient capitals catalog");
      chinaAncientCapitals = data;
      chinaAncientCapitalCoordinates = {};
      chinaAncientCapitalMeta = {};
      checklistCatalog.chinaAncientCapitals.items = items.map((item) => item.name);
      items.forEach((item) => {
        if (!item?.name || !Number.isFinite(item.lat) || !Number.isFinite(item.lng)) return;
        const coords = [item.lat, item.lng, "中国"];
        chinaAncientCapitalCoordinates[item.name] = coords;
        chinaAncientCapitalMeta[canonicalPlaceKey(item.name)] = item;
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

function totalImportedPathLengthKm() {
  return importedPathGeoJson().features.reduce((total, feature) => total + geometryLineLengthKm(feature.geometry), 0);
}

function invalidateDerivedStatsCache() {
  derivedStatsRevision += 1;
  dashboardStatsCache.signature = "";
  dashboardStatsCache.stats = null;
}

function dashboardStatsSignature() {
  const coverage = state.coverage || {};
  return [
    derivedStatsRevision,
    places.length,
    state.visits.length,
    (state.checklistMarks || []).length,
    coverage.updatedAt || "",
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
  const stats = {
    places: places.length,
    visits: state.visits.length,
    visitedPlaces: visitedIds.size,
    visitedPointCount: visited.filter((visit) => !visit.place.shapeOnly && !visit.place.manualAdmin).length,
    importedObjects: imported.length,
    importedPoints: importedPoints.length,
    importedShapes: importedShapes.length,
    pathLengthKm: totalImportedPathLengthKm(),
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
  const metrics = [
    [t("totalCheckins"), stats.visitedPointCount],
    [t("importedPoints"), stats.importedPoints],
    [t("importedTracks"), stats.importedShapes],
    [t("trackLength"), stats.pathLengthKm ? `${Math.round(stats.pathLengthKm).toLocaleString(currentLanguage === "en" ? "en-US" : "zh-CN")} km` : "0 km"],
  ];
  $("#metrics").innerHTML = metrics.map(([label, value]) => `<article class="metric"><strong>${value}</strong><span>${label}</span></article>`).join("");
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
    }))("", { maxZoom: 18, updateWhenZooming: false, attribution: provider.attribution })
    : L.tileLayer(provider.tiles[0], {
      maxZoom: 18,
      updateWhenZooming: false,
      attribution: provider.attribution,
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
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: true,
      style: mapLibreBaseStyle(provider),
    });
    mapLibreMap.dragRotate?.disable();
    mapLibreMap.touchZoomRotate?.disableRotation();
    mapLibreMap._travelMapProvider = provider;
    mapLibreMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    mapLibreMap.on("click", (event) => {
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
  if (mapLibreMap.getBearing?.() !== 0) mapLibreMap.setBearing(0);
  if (mapLibreMap.getPitch?.() !== 0) mapLibreMap.setPitch(0);
  applyMapLibreProvider(provider);
  mapLibreMap.resize();
  if (mapLibreMap.isStyleLoaded()) renderMapLibreLayers();
}

function mapLibreBaseStyle(providerId) {
  if (providerId.startsWith("bing")) registerBingMapLibreProtocol();
  const provider = mapProviders[providerId] || mapProviders.osm;
  return {
    version: 8,
    sources: {
      basemap: {
        type: "raster",
        tiles: provider.tiles,
        tileSize: 256,
        attribution: provider.attribution,
      },
    },
    layers: [{ id: "basemap", type: "raster", source: "basemap" }],
  };
}

function applyMapLibreProvider(provider) {
  if (!mapLibreMap || mapLibreMap._travelMapProvider === provider) return;
  mapLibreMap._travelMapProvider = provider;
  mapLibreLayerHandlersBound = { country: false, admin: false, subadmin: false, points: false };
  mapLibreSourceDataRefs.clear();
  clearMapLibreMarkers();
  mapLibreMap.setStyle(mapLibreBaseStyle(provider));
  const rerender = () => renderMapLibreLayersWhenReady();
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
    mapLibreMap.addSource(id, { type: "geojson", data });
  }
  mapLibreSourceDataRefs.set(id, data);
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

function invalidateMapCaches() {
  mapDataVersion += 1;
  mapGeoJsonCache.clear();
  mapLibreSourceDataRefs.clear();
}

function invalidateMapGeoJsonCacheOnly() {
  mapDataVersion += 1;
  mapGeoJsonCache.clear();
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
  removeMapLibreLayer("visited-regions-line");
  removeMapLibreLayer("visited-regions-fill");
  removeMapLibreLayer("visited-region-group-outlines-line");
  removeMapLibreLayer("us-county-reference-line");
  removeMapLibreLayer("visited-subadmin-line");
  removeMapLibreLayer("visited-subadmin-fill");
  removeMapLibreLayer("map-points-shadow");
  removeMapLibreLayer("map-points-stroke");
  removeMapLibreLayer("map-points-circle");
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
  removeMapLibreSource("visited-regions");
  removeMapLibreSource("visited-region-group-outlines");
  removeMapLibreSource("us-county-reference");
  removeMapLibreSource("visited-subadmin");
  removeMapLibreSource("map-points");
  removeMapLibreSource("admin-country-context");
  removeMapLibreSource("map-background-context");
  removeMapLibreSource("visited-countries");
  removeMapLibreSource("country-click");
  perfStageStartedAt = logRenderStage("remove", perfStageStartedAt);

  setMapLibreSource("map-background-context", overlays.light ? cachedMapGeoJson("map-background-context", mapBackgroundContextGeoJson) : emptyFeatureCollection());
  addMapLibreFillLayer("map-background-context", "map-background-context-fill", "map-background-context-line", 0.18, 1);
  perfStageStartedAt = logRenderStage("background", perfStageStartedAt);

  if (overlays.light && state.boundaryLevel === "country") {
    setMapLibreSource("country-click", cachedMapGeoJson("country-click", allCountryClickGeoJson));
    addMapLibreClickFillLayer("country-click", "country-click-fill");
    setMapLibreSource("visited-countries", cachedMapGeoJson("countries", countryGeoJson));
    addMapLibreFillLayer("visited-countries", "visited-countries-fill", "visited-countries-line", 0.2, 1.15);
    perfStageStartedAt = logRenderStage("country", perfStageStartedAt);
  }

  if (overlays.light && state.boundaryLevel === "admin") {
    const adminStageStartedAt = perfNow();
    let adminSubstageStartedAt = adminStageStartedAt;
    setMapLibreSource("visited-regions", cachedMapGeoJson("regions", regionGeoJson));
    addMapLibreFillLayer("visited-regions", "visited-regions-fill", "visited-regions-line", 0.24, boundaryIndex ? 0 : 1.4);
    adminSubstageStartedAt = logRenderStage("admin-regions", adminSubstageStartedAt);
    setMapLibreSource("visited-region-group-outlines", cachedMapGeoJson("region-outlines", provinceOutlineGeoJson));
    addMapLibreLineLayer("visited-region-group-outlines", "visited-region-group-outlines-line", 1.55);
    adminSubstageStartedAt = logRenderStage("admin-outlines", adminSubstageStartedAt);
    setMapLibreSource("admin-country-context", cachedMapGeoJson("admin-country-context", adminCountryContextGeoJson));
    addMapLibreFillLayer("admin-country-context", "admin-country-context-fill", "admin-country-context-line", 0.18, 1);
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
      addMapLibreFillLayer("admin-country-context", "admin-country-context-fill", "admin-country-context-line", 0.18, 1);
    }
    subadminSubstageStartedAt = logRenderStage("subadmin-context", subadminSubstageStartedAt);
    if (subadminKeys.length) {
      setMapLibreSource("visited-subadmin", cachedMapGeoJson("subadmin", subadminGeoJson));
      addMapLibreFillLayer("visited-subadmin", "visited-subadmin-fill", "visited-subadmin-line", 0.24, 0.55);
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
  perfStageStartedAt = logRenderStage("imports", perfStageStartedAt);
  bindMapLibreLayerHandlers();
  renderMapLibreMarkers(overlays);
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
  if (updateMarkers) renderMapLibreMarkers(overlays);
  logSlowStep("refreshMapLibreDataOnly", perfStartedAt);
  return true;
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
        const el = document.createElement("button");
        el.className = "maplibre-marker";
        el.style.background = depthColors[1];
        el.title = visit.place.name;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          event._travelMapHandled = true;
          renderPlaceDetail(visit.place.id);
        });
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([visit.place.lng, visit.place.lat])
          .setPopup(new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(mapPopupHtml(`<strong>${escapeHtml(visit.place.name)}</strong><br>${escapeHtml(getCountry(visit.place.country).name)} · ${escapeHtml(visit.place.unit || "未分区")}<br><button class="popup-action" data-unvisit="${escapeHtml(visit.place.id)}" type="button">${t("unvisit")}</button>`)))
          .addTo(mapLibreMap);
        mapLibreMarkers.push(marker);
      });
  }
  checklistOverlayPlaces().forEach((entry) => {
    const el = document.createElement("button");
    el.className = `maplibre-marker checklist-marker checklist-${entry.key} ${entry.done ? "done" : ""}`;
    el.title = entry.item;
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      event._travelMapHandled = true;
      renderChecklistMapDetail(entry.key, entry.item);
    });
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([entry.lng, entry.lat])
      .setPopup(new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(mapPopupHtml(`<strong>${escapeHtml(entry.item)}</strong><br>${escapeHtml(checklistCatalog[entry.key].label)}<br><button class="popup-action" data-checklist-map="${escapeHtml(entry.key)}" data-item="${escapeHtml(entry.item)}" type="button">${entry.done ? t("unvisit") : t("markVisited")}</button>`)))
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
    checklistTotalCount("chinaAncientCapitals"),
    checklistTotalCount("worldHeritage"),
    Object.keys(china5aCoordinates || {}).length,
    Object.keys(chinaAncientCapitalCoordinates || {}).length,
    Object.keys(worldHeritageCoordinates || {}).length,
  ].join("#");
  return JSON.stringify({
    language: currentLanguage,
    checkins: Boolean(overlays.checkins),
    china5a: Boolean(overlays.china5a),
    chinaAncientCapitals: Boolean(overlays.chinaAncientCapitals),
    worldHeritage: Boolean(overlays.worldHeritage),
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
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [visit.place.lng, visit.place.lat] },
          properties: {
            kind: "checkin",
            placeId: visit.place.id,
            title: visit.place.name,
            subtitle: `${getCountry(visit.place.country).name} · ${visit.place.unit || t("unassigned")}`,
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
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [entry.lng, entry.lat] },
      properties: {
        kind: "checklist",
        checklistKey: entry.key,
        item: entry.item,
        title: entry.item,
        subtitle: checklistCatalog[entry.key]?.label || t("checklistFallback"),
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
}

function bindMapLibrePointHandlers() {
  if (mapLibreLayerHandlersBound.points || !mapLibreMap.getLayer("map-points-circle")) return;
  mapLibreLayerHandlersBound.points = true;
  mapLibreMap.on("click", "map-points-circle", (event) => {
    markMapEventHandled(event);
    const feature = event.features?.[0];
    if (!feature) return;
    renderMapLibrePointDetail(feature);
    showMapLibrePointPopup(feature, event.lngLat);
  });
  mapLibreMap.on("mouseenter", "map-points-circle", () => {
    mapLibreMap.getCanvas().style.cursor = "pointer";
  });
  mapLibreMap.on("mouseleave", "map-points-circle", () => {
    mapLibreMap.getCanvas().style.cursor = "";
  });
}

function renderMapLibrePointDetail(feature) {
  const props = feature.properties || {};
  if (props.kind === "checkin" && props.placeId) renderPlaceDetail(props.placeId);
  if (props.kind === "checklist" && props.checklistKey && props.item) renderChecklistMapDetail(props.checklistKey, props.item);
}

function showMapLibrePointPopup(feature, lngLat) {
  const props = feature.properties || {};
  const title = escapeHtml(props.title || "");
  const subtitle = escapeHtml(props.subtitle || "");
  const button = props.kind === "checkin"
    ? `<button class="popup-action" data-unvisit="${escapeHtml(props.placeId)}" type="button">${t("unvisit")}</button>`
    : `<button class="popup-action" data-checklist-map="${escapeHtml(props.checklistKey)}" data-item="${escapeHtml(props.item)}" type="button">${props.done ? t("unvisit") : t("markVisited")}</button>`;
  new maplibregl.Popup({ offset: 12, closeButton: false })
    .setLngLat(lngLat)
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
    Object.keys(worldHeritageCoordinates || {}).length,
  ].join("#");
  if (checklistOverlayCache.signature === signature) return checklistOverlayCache.items;
  const marked = checklistMarkKeys();
  const visited = visitedChecklistKeys();
  const ambiguous5a = keys.includes("china5a") ? ambiguousChecklistItemKeys("china5a") : new Set();
  const seen = new Set(visitedPlaces()
    .filter((visit) => Number.isFinite(visit.place.lat) && Number.isFinite(visit.place.lng))
    .flatMap((visit) => [
      canonicalPlaceKey(visit.place.name),
      visit.place.checklistKey ? checklistItemKey(visit.place.checklistKey, visit.place.name, visit.place) : "",
    ].filter(Boolean)));
  const allOverlayItems = keys.flatMap(checklistOverlayEntriesFor);
  const items = allOverlayItems.map(({ key, item, group, itemKey, legacyKey }) => {
    const coords = checklistCoordinateFor(item, key === "china5a" ? group : "");
    if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) return null;
    const done = marked.has(itemKey)
      || visited.has(itemKey)
      || (!ambiguous5a.has(legacyKey) && (marked.has(legacyKey) || visited.has(legacyKey)));
    if (seen.has(itemKey) && !done) return null;
    if (seen.has(legacyKey) && !done) return null;
    return { key, item, lat: coords[0], lng: coords[1], done };
  }).filter(Boolean);
  checklistOverlayCache = {
    signature,
    items,
    keySet: new Set(allOverlayItems.flatMap((entry) => [entry.itemKey, entry.legacyKey]).filter(Boolean)),
  };
  logSlowStep("checklistOverlayPlaces", perfStartedAt);
  return items;
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
  if (list.byRegion) {
    return Object.entries(list.byRegion).flatMap(([group, items]) =>
      items.map((item) => ({
        key,
        group,
        item,
        itemKey: checklistItemKey(key, item, group),
        legacyKey: canonicalPlaceKey(item),
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
      })));
  }
  return (list.items || []).map((item) => ({
    key,
    group: "",
    item,
    itemKey: checklistItemKey(key, item),
    legacyKey: canonicalPlaceKey(item),
  }));
}

function activeChecklistOverlayKeys() {
  const overlays = state.mapOverlays || {};
  return [
    overlays.china5a ? "china5a" : "",
    overlays.chinaAncientCapitals ? "chinaAncientCapitals" : "",
    overlays.worldHeritage ? "worldHeritage" : "",
  ].filter(Boolean);
}

function placeBelongsToActiveChecklistOverlay(place) {
  if (!place) return false;
  if (!activeChecklistOverlayKeys().length) return false;
  checklistOverlayPlaces();
  const placeKey = canonicalPlaceKey(place.name);
  const exactKey = place.checklistKey ? checklistItemKey(place.checklistKey, place.name, place) : "";
  return checklistOverlayCache.keySet.has(exactKey) || checklistOverlayCache.keySet.has(placeKey);
}

function checklistMapItemsFor(key) {
  return checklistItemsFor(key);
}

function renderChecklistMapDetail(key, item) {
  const done = isChecklistItemDone(key, item);
  const capitalMeta = key === "chinaAncientCapitals" ? chinaAncientCapitalMeta[canonicalPlaceKey(item)] : null;
  if (capitalMeta) {
    renderAncientCapitalDetail(key, item, capitalMeta, done);
    return;
  }
  $("#mapDetail").classList.remove("hidden");
  resetMapDetailClass();
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">${checklistCatalog[key]?.label || t("checklistFallback")}</p>
    <h3>${item}</h3>
    <dl>
      <div><dt>${t("status")}</dt><dd>${done ? t("checked") : t("unvisited")}</dd></div>
    </dl>
    <button class="detail-action" data-checklist-map="${key}" data-item="${item}" type="button">${done ? t("unvisit") : t("markVisited")}</button>`;
}

function renderAncientCapitalDetail(key, item, capitalMeta, done) {
  $("#mapDetail").classList.remove("hidden");
  $("#mapDetail").classList.add("ancient-capital-detail");
  const dynastyCount = capitalMeta.dynasties?.length || 0;
  const dynastyCountLabel = currentLanguage === "en" ? `${dynastyCount} linked` : `${dynastyCount} 个`;
  $("#mapDetail").innerHTML = `
    <p class="eyebrow">${checklistCatalog[key]?.label || t("checklistFallback")}</p>
    <h3>${item}</h3>
    <div class="capital-facts">
      <section>
        <header><strong>${currentLanguage === "en" ? "Ancient names" : "古称"}</strong></header>
        ${renderCompactValueList(capitalMeta.ancientNames)}
      </section>
      <section>
        <header><strong>${currentLanguage === "en" ? "Dynasties" : "关联政权"}</strong><em>${dynastyCountLabel}</em></header>
        ${renderCompactValueList(capitalMeta.dynasties)}
      </section>
      <section>
        <header><strong>${currentLanguage === "en" ? "Eras" : "时代"}</strong></header>
        ${renderCompactValueList(capitalMeta.eras)}
      </section>
      <section class="capital-meta-line">
        <span>${escapeHtml(capitalMeta.admin || t("none"))}</span>
        <span>${currentLanguage === "en" ? "Confidence" : "置信度"} ${escapeHtml(capitalMeta.confidence || t("none"))}</span>
        <span>${done ? t("checked") : t("unvisited")}</span>
      </section>
    </div>
    <button class="detail-action" data-checklist-map="${key}" data-item="${item}" type="button">${done ? t("unvisit") : t("markVisited")}</button>`;
}

function renderCompactValueList(values) {
  const list = (values || []).filter(Boolean);
  if (!list.length) return escapeHtml(t("none"));
  return `<span class="compact-value-list">${list.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</span>`;
}

function bindMapLibreLayerHandlers() {
  if (!mapLibreLayerHandlersBound.country && mapLibreMap.getLayer("country-click-fill")) {
    mapLibreLayerHandlersBound.country = true;
    mapLibreMap.on("click", "country-click-fill", (event) => {
      if (mapAddMode) return;
      if (event.originalEvent?._travelMapHandled || mapEventHitsPoint(event)) return;
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
      if (mapAddMode) return;
      if (event.originalEvent?._travelMapHandled || mapEventHitsPoint(event)) return;
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
      if (mapAddMode) return;
      if (event.originalEvent?._travelMapHandled || mapEventHitsPoint(event)) return;
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
      style: (feature) => ({ ...leafletBoundaryStyle(feature), fillOpacity: 0.18, weight: 1 }),
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
          if (mapAddMode) return;
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
          if (mapAddMode) return;
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
          if (mapAddMode) return;
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
      style: (feature) => ({ ...leafletBoundaryStyle(feature), fillOpacity: 0.18, weight: 1 }),
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
        style: (feature) => ({ ...leafletBoundaryStyle(feature), fillOpacity: 0.18, weight: 1 }),
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
            if (mapAddMode) return;
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

  L.geoJSON(importedPolygonGeoJson(), {
    style: leafletBoundaryStyle,
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.name, { sticky: true });
    },
  }).addTo(leafletLayers);

  if (overlays.paths) {
    L.geoJSON(importedPathGeoJson(), {
      style: () => ({ color: depthColors[1], weight: 3, opacity: 0.95 }),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.name, { sticky: true });
      },
    }).addTo(leafletLayers);
  }

  if (overlays.checkins) {
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
        marker.bindPopup(mapPopupHtml(`<strong>${escapeHtml(visit.place.name)}</strong><br>${escapeHtml(getCountry(visit.place.country).name)} · ${escapeHtml(visit.place.unit || "未分区")}<br><button class="popup-action" data-unvisit="${escapeHtml(visit.place.id)}" type="button">${t("unvisit")}</button>`), { closeButton: false });
        marker.on("click", (event) => {
          if (event.originalEvent) event.originalEvent._travelMapHandled = true;
          renderPlaceDetail(visit.place.id);
        });
        marker.addTo(leafletLayers);
      });
  }

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
  const seen = new Set();
  const mainland = (boundaryData.china2?.features || []).map((feature) => {
    const name = subadminNameFromFeature(feature);
    if (!name) return null;
    const key = cleanAdminName(name);
    if (seen.has(key)) return null;
    seen.add(key);
    return { province: provinceNameForChinaSubadminFeature(feature), name, center: geometryCenter(feature.geometry) };
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
  return total || (337 + 30 + taiwanSubadminUnits.length);
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

function renderImportSummary() {
  const files = state.importedFiles;
  const nonImportedVisits = visitedPlaces().filter((visit) => !visit.place.imported && !visit.place.importId && !visit.place.sourceFile);
  const en = currentLanguage === "en";
  $("#importSummary").innerHTML = files.length
    ? `<article class="check-item import-management-card"><header><strong>${en ? "All imported data" : "全部导入数据"}</strong><span>${places.filter((place) => place.imported).length} ${en ? "objects" : "个对象"}</span></header><p class="muted">${en ? "Deletes imported points, tracks, and shapes. Checklist and manual light-up data are kept." : "删除所有导入地点、轨迹和 Shape；打卡清单与手动点亮会保留。"}</p><button class="text-action" data-delete-all-imports="1" type="button">${en ? "Delete all imports" : "删除全部导入"}</button></article>${files.map((file, index) => `<article class="check-item import-batch-card"><header><strong>${file.name}</strong><span>${file.count} ${en ? "items" : "条"}</span></header><p class="muted">${file.format} · ${file.importedAt ? new Date(file.importedAt).toLocaleString(en ? "en-US" : "zh-CN") : (en ? "Imported" : "已导入")}</p><button class="text-action" data-delete-import="${file.id || ""}" data-import-index="${index}" type="button">${en ? "Delete this import" : "删除这批导入"}</button></article>`).join("")}`
    : `<p class="muted">${en ? "No imported files yet. Imported points, countries/regions, and administrative coverage will update automatically." : "还没有导入文件。导入后，地图点、国家/地区覆盖率、行政区覆盖率会自动刷新。"}</p>`;
  $("#importSummary").insertAdjacentHTML("beforeend", `
    <article class="check-item import-management-card">
      <header><strong>${en ? "Light-up / checklist data" : "点亮/打卡数据"}</strong><span>${nonImportedVisits.length} ${en ? "records" : "条"}</span></header>
      <p class="muted">${en ? "Clears manual countries, manual administrative units, map-click points, and checklist marks. Imported files and tracks are kept." : "清除手动国家、手动行政区、地图点击点和打卡清单；导入文件和轨迹会保留。"}</p>
      <button class="text-action" data-clear-checkins="1" type="button">${en ? "Clear light-up / checklist points" : "清除点亮/打卡点"}</button>
    </article>`);
}

function inventorySourceLabel(visit) {
  const raw = String(visit?.tripId || "");
  const place = visit?.place || {};
  if (place.imported || place.importId || place.sourceFile || raw.startsWith("import-")) {
    return place.sourceFile
      ? currentLanguage === "en" ? `Import: ${place.sourceFile}` : `导入：${place.sourceFile}`
      : currentLanguage === "en" ? "Import" : "导入";
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
  if (place.shapeOnly) return currentLanguage === "en" ? "Track / Shape" : "轨迹/形状";
  if (place.imported || place.importId || place.sourceFile) return currentLanguage === "en" ? "Imported point" : "导入点";
  if (place.checklistOnly) return currentLanguage === "en" ? "Checklist point" : "清单打卡";
  if (place.manualCountry) return currentLanguage === "en" ? "Manual country" : "手动国家";
  if (place.manualAdmin) return currentLanguage === "en" ? "Manual administrative unit" : "手动行政区";
  if (place.id?.startsWith("map-click-")) return currentLanguage === "en" ? "Map click" : "地图点击";
  return currentLanguage === "en" ? "Check-in point" : "打卡点";
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

function renderDataInventory() {
  const target = $("#dataInventory");
  if (!target) return;
  const en = currentLanguage === "en";
  const counts = dataCounts();
  const imported = places
    .map((place, index) => ({ place, index }))
    .filter(({ place }) => place.imported || place.importId || place.sourceFile)
    .sort((left, right) => (right.place.importedAt || "").localeCompare(left.place.importedAt || "") || right.index - left.index)
    .map(({ place }) => place);
  const importedPoints = imported.filter((place) => !place.shapeOnly);
  const importedShapes = imported.filter((place) => place.shapeOnly);
  const visited = visitedPlaces()
    .map((visit, index) => ({ visit, index }))
    .sort((left, right) => (right.visit.updatedAt || right.visit.date || "").localeCompare(left.visit.updatedAt || left.visit.date || "") || right.index - left.index)
    .map(({ visit }) => visit);
  const rows = [
    [en ? "Light-up records" : "点亮记录", counts.visits],
    [en ? "Lit places" : "已点亮地点", counts.visitedPlaces],
    [en ? "Imported points" : "导入点", counts.importedPoints],
    [en ? "Imported tracks / shapes" : "导入轨迹/形状", counts.importedShapes],
    [en ? "Countries / Regions" : "国家/地区", counts.countries],
    [en ? "China province-level units" : "中国一级行政区", `${counts.chinaRegions}/34`],
    [en ? "China prefecture-level units" : "中国二级行政区", `${counts.chinaSubregions}/${chinaPrefectureTotal()}`],
  ];
  const deleteLabel = en ? "Delete" : "删除";
  const placeLocationText = (place) => [
    getCountry(place.country).name,
    [place.unit, place.subunit].filter(Boolean).join(" / "),
  ].filter(Boolean).join(" · ");
  const importedPointRows = importedPoints.map((place) => `
    <tr>
      <td data-label="${en ? "Name" : "名称"}">${escapeHtml(place.name)}</td>
      <td data-label="${en ? "Location / File" : "位置/文件"}"><strong>${escapeHtml(placeLocationText(place))}</strong><span>${escapeHtml(place.sourceFile || "")}</span></td>
      <td><button class="table-action danger" data-delete-inventory-object="${escapeHtml(place.id)}" type="button">${deleteLabel}</button></td>
    </tr>`).join("");
  const importedShapeRows = importedShapes.map((place) => `
    <tr>
      <td data-label="${en ? "Name" : "名称"}">${escapeHtml(place.name)}</td>
      <td data-label="${en ? "Geometry / File" : "几何/文件"}"><strong>${escapeHtml(place.importedGeometry?.type || place.type || "")}</strong><span>${escapeHtml(place.sourceFile || "")}</span></td>
      <td><button class="table-action danger" data-delete-inventory-object="${escapeHtml(place.id)}" type="button">${deleteLabel}</button></td>
    </tr>`).join("");
  const visitRows = visited.map((visit) => `
    <tr>
      <td data-label="${en ? "Name" : "名称"}">${escapeHtml(visit.place.name)}</td>
      <td data-label="${en ? "Location / Source" : "位置/来源"}"><strong>${escapeHtml(placeLocationText(visit.place))}</strong><span>${escapeHtml(inventorySourceLabel(visit))}</span></td>
      <td><button class="table-action danger" data-delete-inventory-visit="${escapeHtml(visit.place.id)}" type="button">${deleteLabel}</button></td>
    </tr>`).join("");
  target.innerHTML = `
    <div class="inventory-metrics">${rows.map(([label, value]) => `<span><strong>${value}</strong><em>${label}</em></span>`).join("")}</div>
    <details class="data-table-block">
      <summary><span>${en ? "Lit records" : "已点亮记录"}</span><em>${visited.length}</em></summary>
      <table><thead><tr><th>${en ? "Name" : "名称"}</th><th>${en ? "Location / Source" : "位置/来源"}</th><th>${en ? "Action" : "操作"}</th></tr></thead><tbody>${visitRows || `<tr><td colspan="3">${en ? "No lit data" : "暂无点亮数据"}</td></tr>`}</tbody></table>
    </details>
    <details class="data-table-block">
      <summary><span>${en ? "Imported points" : "已导入地点"}</span><em>${importedPoints.length}</em></summary>
      <table><thead><tr><th>${en ? "Name" : "名称"}</th><th>${en ? "Location / File" : "位置/文件"}</th><th>${en ? "Action" : "操作"}</th></tr></thead><tbody>${importedPointRows || `<tr><td colspan="3">${en ? "No imported points" : "暂无导入地点"}</td></tr>`}</tbody></table>
    </details>
    <details class="data-table-block">
      <summary><span>${en ? "Imported tracks / shapes" : "已导入轨迹/Shape"}</span><em>${importedShapes.length}</em></summary>
      <table><thead><tr><th>${en ? "Name" : "名称"}</th><th>${en ? "Geometry / File" : "几何/文件"}</th><th>${en ? "Action" : "操作"}</th></tr></thead><tbody>${importedShapeRows || `<tr><td colspan="3">${en ? "No imported tracks or shapes" : "暂无导入轨迹或 Shape"}</td></tr>`}</tbody></table>
    </details>`;
}

function renderAchievements() {
  $("#achievementList").innerHTML = `
    <nav class="checklist-nav checklist-page-nav manual-view-tabs">
      <button type="button" data-checklist-jump="achievement-section-china5a">${currentLanguage === "en" ? "5A scenic areas" : "5A 景区"}</button>
      <button type="button" data-checklist-jump="achievement-section-usNationalParks">${currentLanguage === "en" ? "U.S. National Parks" : "美国国家公园"}</button>
      <button type="button" data-checklist-jump="achievement-section-worldHeritage">${currentLanguage === "en" ? "World Heritage" : "世界遗产"}</button>
      <button type="button" data-checklist-jump="achievement-section-referenceLists">${currentLanguage === "en" ? "Reference lists" : "参考清单"}</button>
    </nav>
    <details id="achievement-section-china5a" class="achievement-group" data-achievement-section="china5a">
      <summary>${currentLanguage === "en" ? "China 5A scenic areas" : "中国 5A 景区"}</summary>
      <div class="achievement-section-placeholder"><p class="muted small">${currentLanguage === "en" ? "Expand to load this checklist." : "展开后加载该清单。"}</p></div>
    </details>
    <details id="achievement-section-usNationalParks" class="achievement-group" data-achievement-section="usNationalParks">
      <summary>${currentLanguage === "en" ? "U.S. National Parks" : "美国国家公园"}</summary>
      <div class="achievement-section-placeholder"><p class="muted small">${currentLanguage === "en" ? "Expand to load this checklist." : "展开后加载该清单。"}</p></div>
    </details>
    <details id="achievement-section-worldHeritage" class="achievement-group" data-achievement-section="worldHeritage">
      <summary>${currentLanguage === "en" ? "World Heritage by country" : "世界遗产（按国家）"}</summary>
      <div class="achievement-section-placeholder"><p class="muted small">${currentLanguage === "en" ? "Expand to load this checklist." : "展开后加载该清单。"}</p></div>
    </details>
    <details id="achievement-section-referenceLists" class="achievement-group" data-achievement-section="referenceLists">
      <summary>${currentLanguage === "en" ? "Other reference lists" : "其他参考清单"}</summary>
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
  if (section === "worldHeritage") {
    placeholder.outerHTML = renderChecklistSection("worldHeritage", checklistCatalog.worldHeritage);
    return;
  }
  if (section === "usNationalParks") {
    placeholder.outerHTML = renderChecklistSection("usNationalParks", checklistCatalog.usNationalParks);
    return;
  }
  if (section === "referenceLists") {
    const referenceOrder = ["threeMountains", "fiveMountains", "buddhistMountains", "grottoes"];
    const checklistHtml = referenceOrder
      .filter((key) => checklistCatalog[key])
      .map((key) => [key, checklistCatalog[key]])
      .map(([key, list]) => renderChecklistSection(key, list))
      .join("");
    placeholder.outerHTML = `<div class="theme-checklists">${checklistHtml}</div>`;
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
    <header><strong>${checklistLabel("china5a", list)}</strong><span>${done}/${checklistTotalCount("china5a")}</span></header>
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
  const done = checklistDoneCount(key);
  const items = list.items || [];
  return `<section class="theme-checklist us-parks-checklist">
    <header><strong>${checklistLabel(key, list)}</strong><span>${done}/${items.length}</span></header>
    <div class="us-park-grid">
      ${items.map((item) => renderUsParkCard(key, item)).join("")}
    </div>
  </section>`;
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
    <header><strong>${checklistLabel(key, list)}</strong><span>${checklistDoneCount(key)}/${checklistTotalCount(key)}</span></header>
    ${health}
    ${emptyWorldHeritage}
    <div class="country-checklist-list">${countryBlocks}</div>
  </section>`;
}

function checklistDoneCount(key) {
  const { marked, visited } = checklistStatusKeys();
  const list = checklistCatalog[key] || {};
  const entries = list.byRegion
    ? Object.entries(list.byRegion).flatMap(([group, items]) => items.map((item) => ({ item, group })))
    : checklistItemsFor(key).map((item) => ({ item, group: "" }));
  return entries.filter(({ item, group }) => {
    const itemKey = checklistItemKey(key, item, group);
    const legacyKey = canonicalPlaceKey(item);
    return marked.has(itemKey) || visited.has(itemKey) || (!isAmbiguousChecklistItem(key, item) && (marked.has(legacyKey) || visited.has(legacyKey)));
  }).length;
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

function isChecklistItemDone(key, item, group = "") {
  const itemKey = checklistItemKey(key, item, group);
  const legacyKey = canonicalPlaceKey(item);
  const { marked, visited } = checklistStatusKeys();
  return marked.has(itemKey) || visited.has(itemKey) || (!isAmbiguousChecklistItem(key, item) && (marked.has(legacyKey) || visited.has(legacyKey)));
}

function checklistId(key, item, group = "") {
  return `${key}:${checklistItemKey(key, item, group)}`;
}

function checklistItemKey(key, item, context = null) {
  const itemKey = canonicalPlaceKey(item);
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
  const marks = new Set(state.checklistMarks || []);
  const wasDone = isChecklistItemDone(key, item, group);
  if (wasDone) {
    Array.from(marks).forEach((mark) => {
      const markKey = canonicalPlaceKey(mark.split(":").slice(1).join(":"));
      if (markKey === itemKey || (!isAmbiguousChecklistItem(key, item) && markKey === legacyKey)) marks.delete(mark);
    });
    unvisitChecklistItem(key, item, group);
  } else {
    marks.add(id);
    const place = ensureChecklistPlace(key, item, group);
    if (Number.isFinite(place?.lng) && Number.isFinite(place?.lat)) {
      await ensureBoundaryLayersForPoint(place.country, place.lng, place.lat);
      applyChecklistGeography(place, key, checklistCoordinateFor(item, group));
    }
  }
  state.checklistMarks = Array.from(marks);
  rebuildCoverageFromSavedVisits();
  saveStateSoon();
  renderAfterChecklistChange(key, item, group);
  if (document.querySelector('[data-page="imports"]')?.classList.contains("active")) renderDataInventory();
}

function renderAfterChecklistChange(key, item, group = "") {
  invalidateMapPointRenderCache();
  updateChecklistButtonsForItem(key, item, group);
  renderMetrics();
  renderDashboardAchievements();
  renderNextStops();
  if (document.querySelector('[data-page="checkins"]')?.classList.contains("active")) renderCheckinsPage();
  if (!$("#mapDetail")?.classList.contains("hidden")) renderChecklistMapDetail(key, item);
  if (document.querySelector('[data-page="imports"]')?.classList.contains("active")) renderDataInventory();
  if (isMapPageActive()) {
    if (mapLibreMap && mapLibreMap.isStyleLoaded()) renderMapLibreMarkers();
    scheduleCoverageMapRefresh();
  }
}

function updateChecklistButtonsForItem(key, item, group = "") {
  const done = isChecklistItemDone(key, item, group);
  const itemKey = checklistItemKey(key, item, group);
  const legacyKey = canonicalPlaceKey(item);
  document.querySelectorAll(`[data-checklist="${key}"], [data-checklist-map="${key}"]`).forEach((button) => {
    const buttonItem = button.dataset.item || "";
    const buttonKey = checklistItemKey(key, buttonItem, button.dataset.group || "");
    if (buttonKey !== itemKey && (!isAmbiguousChecklistItem(key, item) || canonicalPlaceKey(buttonItem) !== legacyKey)) return;
    button.classList.toggle("done", done);
    button.textContent = done ? `${t("checked")} · ${buttonItem}` : buttonItem;
    if (button.dataset.checklistMap) button.textContent = done ? t("unvisit") : t("markVisited");
  });
}

function checklistPlaceMatchesItem(key, item, place, group = "") {
  if (!place) return false;
  const itemKey = checklistItemKey(key, item, group);
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
    applyChecklistCoordinates(existing, coords, key);
    upsertVisit(existing.id, 1, { tripId: "checklist", save: false });
    state.focusPlaceId = existing.id;
    return existing;
  }
  const id = `checklist-${slugify(key)}-${slugify(checklistItemKey(key, item, group))}`;
  const defaultCountry = key === "usNationalParks" ? "us" : key === "worldHeritage" ? "imported" : "cn";
  const place = {
    id,
    name: item,
    country: defaultCountry,
    unit: key === "worldHeritage" ? "" : (coords?.[2] || group || ""),
    city: "",
    type: listLabel,
    lat: coords?.[0] ?? null,
    lng: coords?.[1] ?? null,
    tags: [listLabel],
    checklist: [listLabel],
    checklistKey: key,
    checklistOnly: true,
  };
  applyChecklistGeography(place, key, coords);
  places.push(place);
  upsertVisit(id, 1, { tripId: "checklist", save: false });
  state.focusPlaceId = id;
  return place;
}

function applyChecklistCoordinates(place, coords, key) {
  if (coords && (key === "worldHeritage" || !(Number.isFinite(place.lat) && Number.isFinite(place.lng)))) {
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
  const region = inferRegion(place.country, place.lng, place.lat);
  if (region?.name) place.unit = region.name;
  const subregion = inferSubregion(place.country, place.lng, place.lat);
  if (subregion?.name) place.subunit = subregion.name;
}

function cleanChecklistName(value) {
  return String(value || "").replace(/景区|旅游区|风景区|国家公园|历史城区/g, "").trim();
}

function checklistCoordinateFor(item, group = "") {
  const lookup = checklistCoordinateLookup();
  const candidates = [
    item,
    cleanChecklistName(item),
    englishNameInParentheses(item),
    cleanEnglishParkName(englishNameInParentheses(item)),
  ].filter(Boolean);
  const coords = candidates.map((name) => lookup.get(canonicalPlaceKey(name))).find(Boolean);
  if (group && coords?.[2] && !sameAdminName(group, coords[2])) return null;
  return coords;
}

function checklistCoordinateLookup() {
  if (
    checklistCoordinateLookupCache.china5a === china5aCoordinates
    && checklistCoordinateLookupCache.ancientCapitals === chinaAncientCapitalCoordinates
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
  Object.entries(worldHeritageCoordinates || {}).forEach(([name, coords]) => {
    add(name, coords);
    add(cleanChecklistName(name), coords);
    add(worldHeritageEnglishNames[name], coords);
  });
  checklistCoordinateLookupCache = {
    china5a: china5aCoordinates,
    ancientCapitals: chinaAncientCapitalCoordinates,
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
    ["Light up countries", `${countryMissing} countries/regions are still unlit. Start with places you know well.`, "Light up", "#checkins"],
    ["Complete China provinces", missingChina.length ? `Remaining province-level units: ${missingChina.slice(0, 6).join(", ")}${missingChina.length > 6 ? "..." : ""}` : "China province level is complete.", "Light up", "#checkins"],
    ["Complete China cities", `About ${cityMissing} prefecture-level units remain. Work province by province.`, "Light up", "#checkins"],
    ["Check in 5A / World Heritage", "Checklist marks sync to map points and core check-in levels.", "Check in", "#achievements"],
    ["Import places or tracks", "GeoJSON, KML, and CSV imports can update light-up results automatically.", "Import", "#imports"],
  ] : [
    ["手动点亮国家/地区", `还有 ${countryMissing} 个国家/地区未点亮。可以先从常去国家开始补。`, "点亮", "#checkins"],
    ["补中国省级", missingChina.length ? `中国省级还差：${missingChina.slice(0, 6).join("、")}${missingChina.length > 6 ? "…" : ""}` : "中国省级已完成。", "点亮", "#checkins"],
    ["补中国地级市", `中国地级尺度还差约 ${cityMissing} 个。适合按省逐步补。`, "点亮", "#checkins"],
    ["打卡 5A / 世界遗产", "在清单里勾选后，会同步到地图点和核心打卡等级。", "打卡", "#achievements"],
    ["导入地点/轨迹文件", "已有 GeoJSON、KML 或 CSV 时，可以导入并自动更新点亮结果。", "导入", "#imports"],
  ];
  $("#nextStops").innerHTML = recommendations.map(([title, body, goal, href]) => `
    <article class="next-card"><header><strong>${title}</strong><a class="tag" href="${href}">${goal}</a></header><p class="muted">${body}</p></article>`).join("");
}

async function handleImport(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  try {
    const jobs = [];
    const photoPlaces = [];
    let skippedPhotos = 0;
    let restoredArchives = 0;
    for (const file of files) {
      const extension = file.name.split(".").pop().toLowerCase();
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
    const skippedText = skippedPhotos ? `，${skippedPhotos} 张照片没有 GPS 已跳过` : "";
    const archiveText = restoredArchives ? `，已恢复 ${restoredArchives} 个存档` : "";
    showToast(`已导入 ${totalImported} 个地点/shape${skippedText}${archiveText}，并自动点亮相应地区`);
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

function deleteAllImportedData() {
  const ids = new Set();
  places.forEach((place) => {
    if (place.imported || place.importId || place.sourceFile) ids.add(place.id);
  });
  state.importedFiles.forEach((file) => (file.ids || []).forEach((id) => ids.add(id)));
  state.visits = state.visits.filter((visit) => !ids.has(visit.placeId));
  places = places.filter((place) => !ids.has(place.id));
  state.importedFiles = [];
  sanitizeDataStore();
  closeMapPopupsAndDetail();
  recomputeCoverage();
  saveState();
  renderAll();
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
    importedObjects: stats.importedObjects,
    importedPoints: stats.importedPoints,
    importedShapes: stats.importedShapes,
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
  return tiffGps;
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
  const gpsIfdOffset = readIfdValue(view, tiffOffset, tiffOffset + ifd0Offset, 0x8825, littleEndian)?.valueOffset;
  if (!gpsIfdOffset) return null;
  const gpsIfd = tiffOffset + gpsIfdOffset;
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
  renderMetrics();
  renderDashboardAchievements();
  if (isMapPageActive()) renderGeoMap();
  if (activePage === "imports") {
    renderImportSummary();
    renderDataInventory();
  }
  if (activePage === "checkins") renderCheckinsPage();
  if (activePage === "achievements") renderAchievements();
  renderNextStops();
}

function preloadDashboardStats() {
  Promise.allSettled([
    loadChina5aCatalog(),
    loadCatalogData(),
    loadBoundaryData("china2", { renderOnLoad: false }),
    loadBoundaryData("chinaDirect", { renderOnLoad: false }),
    loadBoundaryData("tw2", { renderOnLoad: false }),
  ]).then(() => {
    rebuildCoverageFromSavedVisits();
    renderMetrics();
    renderDashboardAchievements();
    renderNextStops();
    if (document.querySelector('[data-page="checkins"]')?.classList.contains("active")) renderCheckinsPage();
    if (document.querySelector('[data-page="achievements"]')?.classList.contains("active")) renderAchievements();
  });
}

function renderAfterCheckinChange() {
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

function scheduleCoverageMapRefresh() {
  if (pendingCoverageMapRefresh) return;
  pendingCoverageMapRefresh = window.setTimeout(() => {
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
    if (!refreshMapLibreDataOnly({ updateImports: false, updateMarkers: false })) scheduleGeoMapRender();
  }, 180);
}

function isMapPageActive() {
  return document.querySelector('[data-page="world"]')?.classList.contains("active");
}

function renderMapControls() {
  const level = $("#boundaryLevel");
  if (level) level.value = state.boundaryLevel || "country";
  const provider = $("#mapProvider");
  if (provider) provider.value = normalizeMapProviderMode(state.mapProviderMode);
  const overlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays = overlays;
  const showLight = $("#showLightOnMap");
  const showCheckins = $("#showCheckinsOnMap");
  const showTracks = $("#showTracksOnMap");
  const showChina5a = $("#showChina5aOnMap");
  const showAncientCapitals = $("#showAncientCapitalsOnMap");
  const showWorldHeritage = $("#showWorldHeritageOnMap");
  if (showLight) showLight.checked = Boolean(overlays.light);
  if (showCheckins) showCheckins.checked = Boolean(overlays.checkins);
  if (showTracks) showTracks.checked = Boolean(overlays.paths);
  if (showChina5a) showChina5a.checked = Boolean(overlays.china5a);
  if (showAncientCapitals) showAncientCapitals.checked = Boolean(overlays.chinaAncientCapitals);
  if (showWorldHeritage) showWorldHeritage.checked = Boolean(overlays.worldHeritage);
  $("#addMapPoint")?.classList.toggle("active", mapAddMode);
  document.querySelectorAll("[data-region-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.regionView === state.selectedRegionView);
  });
}

function ensureCheckinOverlayVisible() {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}), checkins: true };
  const showCheckins = $("#showCheckinsOnMap");
  if (showCheckins) showCheckins.checked = true;
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
    if (state.mapOverlays?.china5a) Promise.all([loadChina5aCatalog(), loadChina5aCoordinates()]).finally(renderGeoMap);
    if (state.mapOverlays?.chinaAncientCapitals) loadChinaAncientCapitals().finally(renderGeoMap);
    if (state.mapOverlays?.worldHeritage) loadCatalogData();
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
  }
  if (target === "checkins") {
    preloadBoundaryData(false, ["country", "china", "admin1", "china2", "chinaDirect", "tw2"]).finally(renderCheckinsPage);
  }
  if (target === "achievements") {
    loadCatalogData();
    Promise.all([loadChina5aCatalog(), loadChina5aCoordinates()]);
    scheduleChecklistNavSpy();
  }
  if (target === "imports") {
    renderImportSummary();
    renderDataInventory();
  }
}

setLoadingDebug("读取本地快速状态", "pending");
loadState();
setLoadingDebug("读取本地快速状态", "done");
moveMapLevelControlToToolbar();
applyLanguage();
renderMapControls();
renderLegend();
renderMetrics();
renderDashboardAchievements();
renderNextStops();
showPage(location.hash.replace("#", "") || "world");
detectMapProviderByIp();
ensureBoundaryDataForLevel(state.boundaryLevel || "country");
setLoadingDebug("读取完整旅行数据", "pending");
loadStateFromIndexedDb().finally(() => {
  setLoadingDebug("读取完整旅行数据", "done");
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
  places: () => places,
  visits: () => state.visits,
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
  const button = event.target.closest("[data-delete-import]");
  if (!button) return;
  deleteImportedBatch(button.dataset.deleteImport, Number(button.dataset.importIndex));
});
$("#dataInventory")?.addEventListener("click", (event) => {
  const visitButton = event.target.closest("[data-delete-inventory-visit]");
  if (visitButton) {
    unvisitPlace(visitButton.dataset.deleteInventoryVisit);
    return;
  }
  const objectButton = event.target.closest("[data-delete-inventory-object]");
  if (objectButton) deleteInventoryObject(objectButton.dataset.deleteInventoryObject);
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
$("#showChina5aOnMap")?.addEventListener("change", (event) => {
  state.mapOverlays = { ...defaultMapOverlays(), ...(state.mapOverlays || {}) };
  state.mapOverlays.china5a = event.target.checked;
  saveUiStateSoon();
  const refresh = () => {
    checklistOverlayCache.signature = "";
    if (mapLibreMap) renderMapLibreMarkers();
    else renderGeoMap();
  };
  if (event.target.checked) Promise.all([loadChina5aCatalog(), loadChina5aCoordinates()]).finally(refresh);
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
$("#addMapPoint")?.addEventListener("click", () => {
  if (mapAddMode) {
    setMapAddMode(false);
    closeMapPopupsAndDetail();
  } else {
    setMapAddMode(true);
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
    showPage(pageId);
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
  }, 120);
}
window.addEventListener("resize", scheduleActiveMapResize);
window.addEventListener("orientationchange", scheduleActiveMapResize);
window.visualViewport?.addEventListener("resize", scheduleActiveMapResize);
window.addEventListener("hashchange", () => {
  const pageId = location.hash.replace("#", "") || "world";
  if (document.querySelector(`[data-page="${pageId}"]`)) showPage(pageId);
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
