const webCatalog = require("../../data/web-catalog");

Page({
  data: {
    metrics: [],
    achievements: [],
    nextStops: []
  },

  onShow() {
    this.getTabBar()?.setSelected?.(1);
    this.refresh();
  },

  refresh() {
    const state = getApp().getState();
    const countryCount = state.visitedCountries.filter((id) =>
      webCatalog.countries.some((country) => country.id === id)
    ).length;
    const provinceCount = state.visitedProvinces.length;
    const cityCount = state.visitedCities.filter((id) =>
      webCatalog.cityRegions.some((city) => city.id === id)
    ).length;
    const china5aCount = state.checklistMarks.china5a.length;
    const heritageCount = state.checklistMarks.worldHeritage.length;
    const pathLength = this.pathLength(state.importedLines);

    this.setData({
      metrics: [
        { key: "checkins", value: state.checkins.length, label: "总打卡地点" },
        { key: "points", value: state.importedPoints.length, label: "导入地点" },
        { key: "tracks", value: state.importedLines.length, label: "导入路径/形状" },
        { key: "distance", value: pathLength ? `${Math.round(pathLength)} km` : "0 km", label: "路径长度" }
      ],
      achievements: [
        this.achievement("world", "世界足迹", countryCount, 195, "去过的国家/地区", [
          ["世界初见", 2], ["跨境旅人", 5], ["十国足迹", 10], ["世界行者", 20], ["全球探索家", 50]
        ]),
        this.achievement("province", "中国版图", provinceCount, 34, "中国省/自治区/直辖市/港澳台", [
          ["山河初见", 1], ["四方初识", 4], ["十省初成", 10], ["二十省纵横", 20], ["华夏遍行", 34]
        ]),
        this.achievement("city", "城市足迹", cityCount, webCatalog.cityRegions.length, "中国地级市/自治州/地区等", [
          ["一城启程", 1], ["十城足迹", 10], ["五十城行者", 50], ["百城行者", 100], ["三百城纵横", 300]
        ]),
        this.achievement("china5a", "5A 景区", china5aCount, 359, "打卡景区", [
          ["5A 初见", 1], ["5A 入门", 5], ["名胜巡礼", 20], ["百景行者", 100], ["山河典藏家", 200]
        ]),
        this.achievement("heritage", "世界遗产", heritageCount, 1248, "世界遗产清单", [
          ["遗产初见", 1], ["遗产收藏家", 5], ["遗产巡礼者", 20], ["遗产深游者", 50], ["世界遗产大师", 100]
        ])
      ],
      nextStops: this.nextStops(countryCount, provinceCount, cityCount, state)
    });
  },

  achievement(key, name, doneCount, total, category, levels) {
    const percent = Math.min(100, Math.round((doneCount / total) * 100));
    const levelModels = levels.map(([levelName, target]) => ({
      name: levelName,
      target,
      targetText: `去过 ${target} 个`,
      reached: doneCount >= target
    }));
    const reached = levelModels.filter((item) => item.reached);
    const active = reached[reached.length - 1] || levelModels.find((item) => !item.reached);
    return {
      key,
      name,
      doneCount,
      total,
      category,
      percent,
      status: doneCount >= total ? "已解锁" : active?.name || "",
      levels: levelModels.map((item) => ({ ...item, active: item === active }))
    };
  },

  nextStops(countryCount, provinceCount, cityCount) {
    const missingProvinces = 34 - provinceCount;
    const missingCities = webCatalog.cityRegions.length - cityCount;
    return [
      { key: "country", title: "手动点亮国家/地区", body: `还有 ${Math.max(0, 195 - countryCount)} 个国家/地区未点亮。可以先从常去国家开始补。`, action: "点亮", page: "light" },
      { key: "province", title: "补中国省级", body: missingProvinces > 0 ? `中国省级还差 ${missingProvinces} 个。` : "中国省级已完成。", action: "点亮", page: "light" },
      { key: "city", title: "补中国地级市", body: `中国地级尺度还差约 ${Math.max(0, missingCities)} 个。适合按省逐步补。`, action: "点亮", page: "light" },
      { key: "checklist", title: "打卡 5A / 世界遗产", body: "在清单里勾选后，会同步到地图点和核心打卡等级。", action: "打卡", page: "checklists" },
      { key: "import", title: "导入地点/路径文件", body: "已有 GeoJSON、KML 或 CSV 时，可以导入并自动更新点亮结果。", action: "导入", page: "imports" }
    ];
  },

  openChecklist() {
    wx.switchTab({ url: "/pages/checklists/checklists" });
  },

  openPage(event) {
    const paths = {
      light: "/pages/light/light",
      checklists: "/pages/checklists/checklists",
      imports: "/pages/imports/imports"
    };
    wx.switchTab({ url: paths[event.currentTarget.dataset.page] });
  },

  pathLength(lines) {
    const radians = (value) => value * Math.PI / 180;
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
  }
});
