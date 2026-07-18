Page({
  data: {
    achievements: [],
    checkinCount: 0,
    cityCount: 0,
    provincePercent: 0,
    visitedCount: 0,
    metrics: [],
    nextStops: []
  },

  onShow() {
    const state = getApp().getState();
    const visitedCount = state.visitedProvinces.length;
    const cityCount = state.visitedCities.length;
    const checkinCount = state.checkins.length;
    const provincePercent = Math.round((visitedCount / 34) * 100);
    const checkinPercent = Math.min(100, Math.round((checkinCount / 100) * 100));
    const cityPercent = Math.min(100, Math.round((cityCount / 337) * 100));
    const china5aCount = state.checklistMarks.china5a.length;
    const heritageCount = state.checklistMarks.worldHeritage.length;
    const countryCount = state.visitedCountries.length;
    const pathLength = this.pathLength(state.importedLines);

    this.setData({
      visitedCount,
      cityCount,
      checkinCount,
      provincePercent,
      metrics: [
        { key: "checkins", value: checkinCount, label: "总打卡地点" },
        { key: "points", value: state.importedPoints.length, label: "导入地点" },
        { key: "lines", value: state.importedLines.length, label: "路径/Shape" },
        { key: "distance", value: `${Math.round(pathLength)} km`, label: "路径长度" },
        { key: "countries", value: countryCount, label: "国家/地区" },
        { key: "provinces", value: `${visitedCount}/34`, label: "中国省级" }
      ],
      achievements: [
        {
          key: "world",
          name: "世界足迹",
          value: `${countryCount}/195`,
          percent: Math.min(100, Math.round((countryCount / 195) * 100)),
          note: this.levelText(countryCount, [2, 5, 20, 80, 195])
        },
        {
          key: "province",
          name: "中国版图",
          value: `${visitedCount}/34`,
          percent: provincePercent,
          note: this.levelText(visitedCount, [1, 5, 15, 25, 34])
        },
        {
          key: "city",
          name: "二级行政区",
          value: `${cityCount}/337`,
          percent: cityPercent,
          note: this.levelText(cityCount, [1, 10, 50, 150, 337])
        },
        {
          key: "china5a",
          name: "5A 景区",
          value: `${china5aCount}/359`,
          percent: Math.min(100, Math.round((china5aCount / 359) * 100)),
          note: this.levelText(china5aCount, [1, 10, 30, 100, 359])
        },
        {
          key: "heritage",
          name: "世界遗产",
          value: `${heritageCount}/1248`,
          percent: Math.min(100, Math.round((heritageCount / 1248) * 100)),
          note: this.levelText(heritageCount, [1, 10, 50, 200, 1248])
        }
      ],
      nextStops: [
        { key: "country", title: "手动点亮国家/地区", note: `还有 ${Math.max(0, 195 - countryCount)} 个未点亮`, action: "点亮", page: "light" },
        { key: "province", title: "补中国省级", note: `还差 ${Math.max(0, 34 - visitedCount)} 个省级单位`, action: "点亮", page: "light" },
        { key: "city", title: "补中国地级市", note: `当前已点亮 ${cityCount} 个市级单位`, action: "点亮", page: "light" },
        { key: "list", title: "打卡 5A / 世界遗产", note: "清单勾选后同步更新核心等级", action: "打卡", page: "checklists" },
        { key: "import", title: "导入地点/路径文件", note: "支持 GeoJSON、KML 和 CSV", action: "导入", page: "imports" }
      ]
    });
  },

  pathLength(lines) {
    const radians = (value) => (value * Math.PI) / 180;
    let total = 0;
    lines.forEach((line) => {
      for (let index = 1; index < line.points.length; index += 1) {
        const start = line.points[index - 1];
        const end = line.points[index];
        const dLat = radians(end.latitude - start.latitude);
        const dLng = radians(end.longitude - start.longitude);
        const a = Math.sin(dLat / 2) ** 2
          + Math.cos(radians(start.latitude)) * Math.cos(radians(end.latitude)) * Math.sin(dLng / 2) ** 2;
        total += 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }
    });
    return total;
  },

  levelText(value, thresholds) {
    const names = ["初见", "行者", "探索家", "远征者", "全境大师"];
    let level = 0;
    thresholds.forEach((threshold, index) => {
      if (value >= threshold) level = index + 1;
    });
    if (level >= thresholds.length) return `${names[names.length - 1]} · 已完成最高等级`;
    return `${level ? names[level - 1] : "未起步"} · 下一级 ${thresholds[level]}`;
  },

  openChecklists() {
    wx.switchTab({ url: "/pages/checklists/checklists" });
  },

  openImports() {
    wx.switchTab({ url: "/pages/imports/imports" });
  },

  openPage(event) {
    const pages = {
      light: "/pages/light/light",
      checklists: "/pages/checklists/checklists",
      imports: "/pages/imports/imports"
    };
    wx.switchTab({ url: pages[event.currentTarget.dataset.page] });
  }
});
