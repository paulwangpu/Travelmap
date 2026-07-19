const catalog = require("../../utils/catalog");
const webCatalog = require("../../data/web-catalog");
const coverage = require("../../utils/coverage");

Page({
  data: {
    activeView: "province",
    viewTabs: [
      { key: "province", label: "省级", count: "" },
      { key: "city", label: "地级市", count: "" },
      { key: "country", label: "国家/地区", count: "" }
    ],
    allCitiesOpen: false,
    provinceCount: "",
    provinces: [],
    cityCount: "",
    cityGroups: [],
    countryCount: "",
    countryGroups: []
  },

  onShow() {
    this.getTabBar()?.setSelected?.(2);
    this.refresh();
  },

  refresh() {
    const state = getApp().getState();
    const visitedCountries = new Set(state.visitedCountries);
    const visitedProvinces = new Set(state.visitedProvinces);
    const visitedCities = new Set(state.visitedCities);
    const manualCountries = new Set(state.manualVisitedCountries);
    const manualProvinces = new Set(state.manualVisitedProvinces);
    const manualCities = new Set(state.manualVisitedCities);
    const previousCityOpen = new Map(this.data.cityGroups.map((group) => [group.province, group.open]));
    const previousCountryOpen = new Map(this.data.countryGroups.map((group) => [group.continent, group.open]));

    const provinces = catalog.provinces.map((item) =>
      this.buttonModel(item, visitedProvinces, manualProvinces)
    );
    const cityGroups = webCatalog.cityGroups.map((group) => {
      const items = group.items.map((item) => this.buttonModel(item, visitedCities, manualCities));
      return {
        ...group,
        items,
        done: items.filter((item) => item.visited).length,
        open: previousCityOpen.has(group.province) ? previousCityOpen.get(group.province) : items.some((item) => item.visited)
      };
    });
    const countryGroups = webCatalog.countryGroups.map((group) => {
      const items = group.items.map((item) => this.buttonModel(item, visitedCountries, manualCountries));
      const done = items.filter((item) => item.visited).length;
      return {
        ...group,
        items,
        done,
        open: previousCountryOpen.has(group.continent) ? previousCountryOpen.get(group.continent) : done > 0
      };
    });

    const provinceCount = `${provinces.filter((item) => item.visited).length}/${provinces.length}`;
    const cityCount = `${webCatalog.cityRegions.filter((item) => visitedCities.has(item.id)).length}/${webCatalog.cityRegions.length}`;
    const countryCount = `${webCatalog.countries.filter((item) => visitedCountries.has(item.id)).length}/${webCatalog.countries.length}`;
    this.setData({
      provinces,
      provinceCount,
      cityGroups,
      cityCount,
      countryGroups,
      countryCount,
      viewTabs: [
        { key: "province", label: "省级", count: provinceCount },
        { key: "city", label: "地级市", count: cityCount },
        { key: "country", label: "国家/地区", count: countryCount }
      ],
      allCitiesOpen: cityGroups.every((group) => group.open)
    });
  },

  switchView(event) {
    this.setData({ activeView: event.currentTarget.dataset.view });
  },

  toggleAllCities() {
    const open = !this.data.allCitiesOpen;
    this.setData({
      allCitiesOpen: open,
      cityGroups: this.data.cityGroups.map((group) => ({ ...group, open }))
    });
  },

  buttonModel(item, visitedSet, manualSet) {
    const visited = visitedSet.has(item.id);
    const manual = manualSet.has(item.id);
    return {
      ...item,
      visited,
      manual,
      disabled: visited && !manual,
      status: visited ? (manual ? "手动点亮" : "已点亮") : "未点亮"
    };
  },

  toggleGroup(event) {
    const type = event.currentTarget.dataset.type;
    const key = event.currentTarget.dataset.key;
    const dataKey = type === "city" ? "cityGroups" : "countryGroups";
    const groups = this.data[dataKey].map((group) => ({
        ...group,
        open: (group.province || group.continent) === key ? !group.open : group.open
      }));
    this.setData({
      [dataKey]: groups,
      ...(type === "city" ? { allCitiesOpen: groups.every((group) => group.open) } : {})
    });
  },

  toggleProvince(event) {
    this.toggleRegion("province", event.currentTarget.dataset.id);
  },

  toggleCity(event) {
    this.toggleRegion("city", event.currentTarget.dataset.id);
  },

  toggleCountry(event) {
    this.toggleRegion("country", event.currentTarget.dataset.id);
  },

  toggleRegion(level, id) {
    const state = getApp().getState();
    getApp().updateState(coverage.toggleRegion(state, level, id));
    getApp().globalData.suppressMapDetailOnce = true;
    this.refresh();
  }
});
