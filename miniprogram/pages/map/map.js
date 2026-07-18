const catalog = require("../../utils/catalog");
const boundaries = require("../../data/boundaries");
const checklists = require("../../data/checklists");
const coverage = require("../../utils/coverage");

const LEVELS = ["country", "province", "city"];

Page({
  data: {
    mapCenter: { latitude: 35.5, longitude: 104.5 },
    mapScale: 3,
    addMode: false,
    pendingPoint: null,
    selectedCheckin: null,
    draftName: "",
    draftDate: "",
    markers: [],
    polygons: [],
    polylines: [],
    visitedCount: 0,
    checkinCount: 0,
    stripItems: [],
    levelLabels: ["国家", "省级", "市级"],
    levelIndex: 1,
    levelSummary: "省级已点亮",
    provinceIndex: 2,
    provinceNames: catalog.provinces.map((item) => item.name),
    overlays: {
      checkins: true,
      tracks: true,
      china5a: false,
      worldHeritage: false
    },
    overlayOptions: []
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const state = getApp().getState();
    const visited = new Set(state.visitedProvinces);
    const visitedCountries = new Set(state.visitedCountries);
    const visitedCities = new Set(state.visitedCities);
    const level = LEVELS[this.data.levelIndex];
    const selectedProvince = catalog.provinces[this.data.provinceIndex] || catalog.provinces[0];
    const checkinMarkerIds = {};
    const checkinMarkers = state.checkins
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
      .map((item, index) => {
        const markerId = 1000 + index;
        checkinMarkerIds[markerId] = item.id;
        return {
          id: markerId,
          latitude: item.latitude,
          longitude: item.longitude,
          iconPath: "/assets/checkin-pin.png",
          width: 24,
          height: 30,
          callout: {
            content: item.name,
            display: "BYCLICK",
            padding: 6,
            borderRadius: 4
          }
        };
      });
    this.checkinMarkerIds = checkinMarkerIds;
    const importedMarkers = state.importedPoints
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
      .map((item, index) => ({
        id: 3000 + index,
        latitude: item.latitude,
        longitude: item.longitude,
        iconPath: "/assets/checkin-pin.png",
        width: 20,
        height: 25,
        callout: {
          content: item.name || "导入地点",
          display: "BYCLICK",
          padding: 6,
          borderRadius: 4
        }
      }));
    const china5aMarks = new Set(state.checklistMarks.china5a);
    const heritageMarks = new Set(state.checklistMarks.worldHeritage);
    const china5aMarkers = checklists.china5a
      .filter((item) => china5aMarks.has(item.id) && Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
      .map((item, index) => ({
        id: 5000 + index,
        latitude: item.latitude,
        longitude: item.longitude,
        iconPath: "/assets/checkin-pin.png",
        width: 20,
        height: 25,
        callout: { content: item.name, display: "BYCLICK", padding: 6, borderRadius: 4 }
      }));
    const heritageMarkers = checklists.worldHeritage
      .filter((item) => heritageMarks.has(item.id) && Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
      .map((item, index) => ({
        id: 7000 + index,
        latitude: item.latitude,
        longitude: item.longitude,
        iconPath: "/assets/checkin-pin.png",
        width: 20,
        height: 25,
        callout: { content: item.name, display: "BYCLICK", padding: 6, borderRadius: 4 }
      }));

    let polygons = [];
    let stripItems = catalog.provinces.map((item) => ({
      id: item.id,
      name: item.name,
      visited: visited.has(item.id)
    }));
    let visitedCount = visited.size;
    let levelSummary = "省级已点亮";

    if (level === "province") {
      this.polygonRegionIds = boundaries.provinceBoundaries.map((item) => item.regionId);
      polygons = boundaries.provinceBoundaries.map((item, index) => ({
        id: index + 1,
        points: item.points,
        strokeWidth: 1,
        strokeColor: visited.has(item.regionId) ? "#155f4e" : "#9ba8a1",
        fillColor: visited.has(item.regionId) ? "#36a37f99" : "#f4f7f466",
        zIndex: visited.has(item.regionId) ? 2 : 1
      }));
    } else if (level === "city") {
      const cityItems = boundaries.cityBoundaries.filter((item) => item.provinceId === selectedProvince.id);
      this.polygonRegionIds = cityItems.map((item) => item.regionId);
      const uniqueCities = new Map();
      cityItems.forEach((item) => {
        if (!uniqueCities.has(item.regionId)) {
          uniqueCities.set(item.regionId, {
            id: item.regionId,
            name: item.name,
            visited: visitedCities.has(item.regionId)
          });
        }
      });
      stripItems = Array.from(uniqueCities.values());
      visitedCount = stripItems.filter((item) => item.visited).length;
      levelSummary = `${selectedProvince.name}市级`;
      polygons = cityItems.map((item, index) => ({
        id: index + 1,
        points: item.points,
        strokeWidth: 1,
        strokeColor: visitedCities.has(item.regionId) ? "#155f4e" : "#9ba8a1",
        fillColor: visitedCities.has(item.regionId) ? "#36a37f99" : "#f4f7f466",
        zIndex: visitedCities.has(item.regionId) ? 2 : 1
      }));
    } else {
      this.polygonRegionIds = boundaries.countryBoundaries.map((item) => item.regionId);
      levelSummary = "国家已点亮";
      stripItems = boundaries.countryRegions.map((item) => ({
        id: item.id,
        name: item.name,
        visited: visitedCountries.has(item.id)
      }));
      visitedCount = stripItems.filter((item) => item.visited).length;
      polygons = boundaries.countryBoundaries.map((item, index) => ({
        id: index + 1,
        points: item.points,
        strokeWidth: 1,
        strokeColor: visitedCountries.has(item.regionId) ? "#155f4e" : "#9ba8a1",
        fillColor: visitedCountries.has(item.regionId) ? "#36a37f99" : "#f4f7f466",
        zIndex: visitedCountries.has(item.regionId) ? 2 : 1
      }));
    }

    this.setData({
      markers: []
        .concat(this.data.overlays.checkins ? checkinMarkers : [])
        .concat(this.data.overlays.tracks ? importedMarkers : [])
        .concat(this.data.overlays.china5a ? china5aMarkers : [])
        .concat(this.data.overlays.worldHeritage ? heritageMarkers : []),
      polygons,
      polylines: this.data.overlays.tracks
        ? state.importedLines.map((item) => ({
            points: item.points,
            color: "#d9480f",
            width: 4,
            arrowLine: false
          }))
        : [],
      visitedCount,
      checkinCount: state.checkins.length,
      stripItems,
      levelSummary,
      overlayOptions: [
        { key: "checkins", label: "我的打卡", checked: this.data.overlays.checkins },
        { key: "tracks", label: "我的足迹", checked: this.data.overlays.tracks },
        { key: "china5a", label: "5A 景区", checked: this.data.overlays.china5a },
        { key: "worldHeritage", label: "世界遗产", checked: this.data.overlays.worldHeritage }
      ]
    });
  },

  openLightPage() {
    wx.switchTab({ url: "/pages/light/light" });
  },

  openCheckins() {
    wx.navigateTo({ url: "/pages/checkins/checkins" });
  },

  toggleAddMode() {
    this.setData({
      addMode: !this.data.addMode,
      pendingPoint: null,
      selectedCheckin: null,
      draftName: "",
      draftDate: ""
    });
  },

  toggleOverlay(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({
      overlays: {
        ...this.data.overlays,
        [key]: !this.data.overlays[key]
      }
    }, () => this.refresh());
  },

  changeLevel(event) {
    const levelIndex = Number(event.detail.value);
    const mapScale = levelIndex === 0 ? 3 : levelIndex === 1 ? 4 : 6;
    this.setData({ levelIndex, mapScale }, () => this.refresh());
  },

  changeProvince(event) {
    const provinceIndex = Number(event.detail.value);
    const province = catalog.provinces[provinceIndex];
    this.setData({
      provinceIndex,
      mapCenter: { latitude: province.latitude, longitude: province.longitude },
      mapScale: 6
    }, () => this.refresh());
  },

  toggleMarkerRegion(event) {
    const markerId = Number(event.detail.markerId);
    const checkinId = this.checkinMarkerIds && this.checkinMarkerIds[markerId];
    if (!checkinId) return;
    const checkin = getApp().getState().checkins.find((item) => item.id === checkinId);
    if (checkin) this.setData({ selectedCheckin: checkin, addMode: false, pendingPoint: null });
  },

  handleMapTap(event) {
    const longitude = Number(event.detail.longitude);
    const latitude = Number(event.detail.latitude);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

    if (this.data.addMode) {
      const matches = coverage.inferPoint(longitude, latitude);
      const area = [matches.countryName, matches.provinceName, matches.cityName].filter(Boolean).join(" / ");
      this.setData({
        pendingPoint: { longitude, latitude, area: area || "未识别行政区" },
        draftName: area ? `${area}打卡点` : "地图打卡点"
      });
      return;
    }

    const level = LEVELS[this.data.levelIndex];
    const province = catalog.provinces[this.data.provinceIndex];
    const regionId = coverage.regionAtPoint(level, longitude, latitude, province?.id);
    if (regionId) this.toggleRegion(regionId);
  },

  updateDraftName(event) {
    this.setData({ draftName: event.detail.value });
  },

  updateDraftDate(event) {
    this.setData({ draftDate: event.detail.value });
  },

  cancelPoint() {
    this.setData({ pendingPoint: null, draftName: "", draftDate: "" });
  },

  closeCheckinDetail() {
    this.setData({ selectedCheckin: null });
  },

  deleteSelectedCheckin() {
    const selected = this.data.selectedCheckin;
    if (!selected) return;
    wx.showModal({
      title: "删除打卡点",
      content: `确定删除“${selected.name}”吗？`,
      confirmText: "删除",
      confirmColor: "#a43e36",
      success: ({ confirm }) => {
        if (!confirm) return;
        const state = getApp().getState();
        const nextState = {
          ...state,
          checkins: state.checkins.filter((item) => item.id !== selected.id)
        };
        getApp().updateState({
          checkins: nextState.checkins,
          ...coverage.recomputeCoverage(nextState)
        });
        this.setData({ selectedCheckin: null }, () => this.refresh());
        wx.showToast({ title: "已删除", icon: "success" });
      }
    });
  },

  saveMapCheckin() {
    const name = this.data.draftName.trim();
    if (!name || !this.data.pendingPoint) {
      wx.showToast({ title: "请输入地点名称", icon: "none" });
      return;
    }
    const state = getApp().getState();
    const point = this.data.pendingPoint;
    const checkin = {
      id: `map-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      date: this.data.draftDate,
      latitude: point.latitude,
      longitude: point.longitude,
      createdAt: new Date().toISOString(),
      source: "map"
    };
    getApp().updateState({
      checkins: [checkin].concat(state.checkins),
      ...coverage.inferCoverage(state, [checkin])
    });
    this.setData({
      addMode: false,
      pendingPoint: null,
      draftName: "",
      draftDate: ""
    }, () => this.refresh());
    wx.showToast({ title: "打卡成功", icon: "success" });
  },

  toggleStripRegion(event) {
    this.toggleRegion(event.currentTarget.dataset.id);
  },

  toggleRegion(id) {
    const state = getApp().getState();
    const level = LEVELS[this.data.levelIndex];
    getApp().updateState(coverage.toggleRegion(state, level, id));
    this.refresh();
  }
});
