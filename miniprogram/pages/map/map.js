const boundaries = require("../../data/boundaries");
const webCatalog = require("../../data/web-catalog");
const checklists = require("../../data/checklists");
const coverage = require("../../utils/coverage");
const catalog = require("../../utils/catalog");

const LEVELS = ["country", "province", "city"];
const LEVEL_LABELS = ["国家级", "省级", "市级（仅中国）"];
const PROVIDERS = [
  "自动底图", "OpenStreetMap", "高德", "高德卫星", "Google 街道",
  "Google 卫星", "Google 地形", "Esri 卫星", "Bing 地图", "Bing 卫星"
];

Page({
  data: {
    mapCenter: { latitude: 35.5, longitude: 104.5 },
    mapScale: 3,
    markers: [],
    polygons: [],
    polylines: [],
    enableSatellite: false,
    providerLabels: PROVIDERS,
    providerIndex: 0,
    levelLabels: LEVEL_LABELS,
    levelIndex: 0,
    overlays: {
      checkins: true,
      tracks: true,
      china5a: false,
      worldHeritage: false
    },
    overlayOptions: [],
    addMode: false,
    pendingPoint: null,
    selectedDetail: null,
    draftName: "",
    draftDate: ""
  },

  onShow() {
    this.getTabBar()?.setSelected?.(0);
    if (getApp().globalData.suppressMapDetailOnce) {
      getApp().globalData.suppressMapDetailOnce = false;
      this.setData({ selectedDetail: null, pendingPoint: null, addMode: false });
    }
    this.refresh();
  },

  refresh() {
    const state = getApp().getState();
    const level = LEVELS[this.data.levelIndex];
    const visited = this.visitedSet(state, level);
    const shapeItems = level === "country"
      ? boundaries.countryBoundaries
      : level === "province"
        ? boundaries.provinceBoundaries
        : boundaries.cityBoundaries;
    const polygons = shapeItems.map((item, index) => {
      const regionId = item.regionId;
      const done = visited.has(regionId);
      return {
        id: index + 1,
        points: item.points,
        strokeWidth: 1,
        strokeColor: done ? "#d9480f" : "#b43d16",
        fillColor: done ? "#d9480f55" : "#f2a58a38",
        zIndex: done ? 2 : 1
      };
    });

    const markerDetails = {};
    let markerId = 1000;
    const markerFor = (item, kind, size = 24) => {
      markerId += 1;
      markerDetails[markerId] = { item, kind };
      return {
        id: markerId,
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        iconPath: "/assets/checkin-pin.png",
        width: size,
        height: Math.round(size * 1.25),
        callout: {
          content: item.name || "打卡点",
          display: "BYCLICK",
          padding: 6,
          borderRadius: 4
        }
      };
    };
    const valid = (item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude));
    const markers = [];
    if (this.data.overlays.checkins) {
      state.checkins.filter(valid).forEach((item) => markers.push(markerFor(item, "checkin", 24)));
    }
    if (this.data.overlays.tracks) {
      state.importedPoints.filter(valid).forEach((item) => markers.push(markerFor(item, "imported", 20)));
    }
    if (this.data.overlays.china5a) {
      const marks = new Set(state.checklistMarks.china5a);
      checklists.china5a.filter((item) => marks.has(item.id) && valid(item))
        .forEach((item) => markers.push(markerFor(item, "china5a", 20)));
    }
    if (this.data.overlays.worldHeritage) {
      const marks = new Set(state.checklistMarks.worldHeritage);
      checklists.worldHeritage.filter((item) => marks.has(item.id) && valid(item))
        .forEach((item) => markers.push(markerFor(item, "worldHeritage", 20)));
    }
    this.markerDetails = markerDetails;

    this.setData({
      polygons,
      markers,
      polylines: this.data.overlays.tracks
        ? state.importedLines.map((line) => ({
            points: line.points,
            color: "#d9480f",
            width: 4,
            arrowLine: false
          }))
        : [],
      overlayOptions: [
        { key: "checkins", label: "我的打卡", checked: this.data.overlays.checkins },
        { key: "tracks", label: "我的足迹", checked: this.data.overlays.tracks },
        { key: "china5a", label: "5A 景区", checked: this.data.overlays.china5a },
        { key: "worldHeritage", label: "世界遗产", checked: this.data.overlays.worldHeritage }
      ]
    });
  },

  visitedSet(state, level) {
    if (level === "country") return new Set(state.visitedCountries);
    if (level === "city") return new Set(state.visitedCities);
    return new Set(state.visitedProvinces);
  },

  manualSet(state, level) {
    if (level === "country") return new Set(state.manualVisitedCountries);
    if (level === "city") return new Set(state.manualVisitedCities);
    return new Set(state.manualVisitedProvinces);
  },

  changeProvider(event) {
    const providerIndex = Number(event.detail.value);
    const label = PROVIDERS[providerIndex];
    this.setData({
      providerIndex,
      enableSatellite: /卫星|Aerial/i.test(label)
    });
  },

  changeLevel(event) {
    const levelIndex = Number(event.detail.value);
    this.setData({
      levelIndex,
      mapCenter: levelIndex === 0
        ? { latitude: 25, longitude: 15 }
        : { latitude: 35.5, longitude: 104.5 },
      mapScale: levelIndex === 0 ? 2 : levelIndex === 1 ? 3 : 4,
      selectedDetail: null,
      addMode: false,
      pendingPoint: null
    }, () => this.refresh());
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

  toggleAddMode() {
    this.setData({
      addMode: !this.data.addMode,
      pendingPoint: null,
      selectedDetail: null,
      draftName: "",
      draftDate: ""
    });
  },

  handleMapTap(event) {
    const longitude = Number(event.detail.longitude);
    const latitude = Number(event.detail.latitude);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;
    if (this.data.addMode) {
      const point = coverage.inferPoint(longitude, latitude);
      const area = [point.countryName, point.provinceName, point.cityName].filter(Boolean).join(" / ");
      this.setData({
        pendingPoint: {
          longitude,
          latitude,
          coordinateText: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          area: area || "未分区"
        },
        draftName: `地图打卡点 ${this.timeStamp()}`
      });
      return;
    }
    this.showRegionDetail(longitude, latitude);
  },

  showRegionDetail(longitude, latitude) {
    const state = getApp().getState();
    const level = LEVELS[this.data.levelIndex];
    const id = coverage.regionAtPoint(level, longitude, latitude);
    if (!id) return;
    const name = this.regionName(level, id);
    const visited = this.visitedSet(state, level).has(id);
    const manual = this.manualSet(state, level).has(id);
    const evidence = this.regionEvidence(state, level, id);
    this.setData({
      selectedDetail: {
        kind: "region",
        level,
        id,
        name,
        eyebrow: level === "country" ? "国家/地区" : "行政区",
        rows: [
          { label: "状态", value: visited ? "已点亮" : "未去过" },
          { label: "证据", value: `${evidence.length} 个地点` }
        ],
        tags: evidence.slice(0, 12).map((item) => item.name),
        action: !visited ? "标记去过" : manual ? "取消点亮" : ""
      }
    });
  },

  regionName(level, id) {
    if (level === "country") {
      return webCatalog.countries.find((item) => item.id === id)?.name || id.toUpperCase();
    }
    if (level === "city") {
      return webCatalog.cityRegions.find((item) => item.id === id)?.name
        || boundaries.cityBoundaries.find((item) => item.regionId === id)?.name
        || id;
    }
    return catalog.provinces.find((item) => item.id === id)?.name || id;
  },

  regionEvidence(state, level, id) {
    return state.checkins.concat(state.importedPoints).filter((item) => {
      const longitude = Number(item.longitude);
      const latitude = Number(item.latitude);
      return Number.isFinite(longitude)
        && Number.isFinite(latitude)
        && coverage.regionAtPoint(level, longitude, latitude) === id;
    });
  },

  toggleSelectedDetail() {
    const detail = this.data.selectedDetail;
    if (!detail) return;
    const state = getApp().getState();
    if (detail.kind === "checkin") {
      const nextState = {
        ...state,
        checkins: state.checkins.filter((item) => item.id !== detail.id)
      };
      getApp().updateState({
        checkins: nextState.checkins,
        ...coverage.recomputeCoverage(nextState)
      });
      this.setData({ selectedDetail: null }, () => this.refresh());
      wx.showToast({ title: "已取消点亮", icon: "success" });
      return;
    }
    if (detail.kind !== "region") return;
    getApp().updateState(coverage.toggleRegion(state, detail.level, detail.id));
    this.setData({ selectedDetail: null }, () => this.refresh());
  },

  showMarkerDetail(event) {
    const marker = this.markerDetails?.[Number(event.detail.markerId)];
    if (!marker) return;
    const item = marker.item;
    const point = coverage.inferPoint(Number(item.longitude), Number(item.latitude));
    this.setData({
      addMode: false,
      pendingPoint: null,
      selectedDetail: {
        kind: marker.kind,
        id: item.id,
        name: item.name,
        eyebrow: "地图点",
        rows: [
          { label: "国家/地区", value: point.countryName || "未分类" },
          { label: "行政区", value: [point.provinceName, point.cityName].filter(Boolean).join(" / ") || "未分区" },
          { label: "状态", value: "已点亮" },
          { label: "坐标", value: `${Number(item.latitude).toFixed(2)}, ${Number(item.longitude).toFixed(2)}` }
        ],
        tags: [marker.kind === "checkin" ? "地图点击" : marker.kind],
        action: marker.kind === "checkin" ? "取消点亮" : ""
      }
    });
  },

  closeDetail() {
    this.setData({ selectedDetail: null });
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

  saveMapCheckin() {
    const name = this.data.draftName.trim();
    const point = this.data.pendingPoint;
    if (!name || !point) {
      wx.showToast({ title: "请输入地点名称", icon: "none" });
      return;
    }
    const state = getApp().getState();
    const checkin = {
      id: `map-click-${Date.now()}`,
      name,
      date: this.data.draftDate,
      latitude: point.latitude,
      longitude: point.longitude,
      source: "map-click",
      createdAt: new Date().toISOString()
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
    wx.showToast({ title: "打卡点已添加", icon: "success" });
  },

  timeStamp() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
});
