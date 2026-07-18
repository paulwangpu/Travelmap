const catalog = require("../../utils/catalog");
const boundaries = require("../../data/boundaries");
const coverage = require("../../utils/coverage");

Page({
  data: {
    activeLabel: "国家/地区",
    activeTab: "country",
    keyword: "",
    provinceIndex: 2,
    provinceNames: catalog.provinces.map((item) => item.name),
    tabs: [
      { key: "country", label: "国家" },
      { key: "province", label: "中国省级" },
      { key: "city", label: "中国市级" },
      { key: "us", label: "美国州" },
      { key: "japan", label: "日本" }
    ],
    totalCount: 0,
    visibleItems: [],
    visitedCount: 0,
    emptyText: "没有匹配的行政区"
  },

  onShow() {
    this.refresh();
  },

  changeTab(event) {
    const activeTab = event.currentTarget.dataset.tab;
    const provinceIndex = activeTab === "city" ? this.defaultCityProvinceIndex() : this.data.provinceIndex;
    const labels = {
      country: "国家/地区",
      province: "中国省/自治区/直辖市/港澳台",
      city: `${this.data.provinceNames[provinceIndex]}市级行政区`,
      us: "美国州与特区",
      japan: "日本都道府县"
    };
    this.setData({
      activeTab,
      activeLabel: labels[activeTab],
      provinceIndex,
      keyword: ""
    }, () => this.refresh());
  },

  changeProvince(event) {
    const provinceIndex = Number(event.detail.value);
    this.setData({
      provinceIndex,
      activeLabel: `${this.data.provinceNames[provinceIndex]}市级行政区`
    }, () => this.refresh());
  },

  search(event) {
    this.setData({ keyword: event.detail.value }, () => this.refresh());
  },

  sourceItems() {
    if (this.data.activeTab === "country") {
      return boundaries.countryRegions.map((item) => ({
        ...item,
        name: catalog.countryName(item.id, item.name)
      }));
    }
    if (this.data.activeTab === "province") return catalog.provinces;
    if (this.data.activeTab === "us") return boundaries.usRegions;
    if (this.data.activeTab === "japan") return boundaries.japanRegions;
    const province = catalog.provinces[this.data.provinceIndex];
    const unique = new Map();
    boundaries.cityBoundaries
      .filter((item) => item.provinceId === province.id)
      .forEach((item) => {
        if (!unique.has(item.regionId)) unique.set(item.regionId, { id: item.regionId, name: item.name });
      });
    return Array.from(unique.values());
  },

  defaultCityProvinceIndex() {
    const state = getApp().getState();
    const candidateIds = state.visitedProvinces.concat("hebei");
    const provinceId = candidateIds.find((id) => boundaries.cityBoundaries.some((item) => item.provinceId === id));
    const index = catalog.provinces.findIndex((item) => item.id === provinceId);
    return index >= 0 ? index : 2;
  },

  stateKey() {
    return this.data.activeTab === "country"
      ? "visitedCountries"
      : this.data.activeTab === "province"
        ? "visitedProvinces"
        : this.data.activeTab === "us"
          ? "visitedUsStates"
          : this.data.activeTab === "japan"
            ? "visitedJapanRegions"
            : "visitedCities";
  },

  refresh() {
    const source = this.sourceItems();
    const visited = new Set(getApp().getState()[this.stateKey()]);
    const keyword = this.data.keyword.trim().toLowerCase();
    const visibleItems = source
      .filter((item) => !keyword || item.name.toLowerCase().includes(keyword))
      .map((item) => ({
        id: item.id,
        name: item.name,
        visited: visited.has(item.id)
      }));
    this.setData({
      visibleItems,
      totalCount: source.length,
      visitedCount: source.filter((item) => visited.has(item.id)).length,
      emptyText: source.length ? "没有匹配的行政区" : "该地区暂无可用的市级边界数据"
    });
  },

  toggleRegion(event) {
    const state = getApp().getState();
    const id = event.currentTarget.dataset.id;
    getApp().updateState(coverage.toggleRegion(state, this.data.activeTab, id));
    this.refresh();
  }
});
