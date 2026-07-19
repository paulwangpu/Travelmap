const items = [
  { pagePath: "/pages/map/map", text: "地图" },
  { pagePath: "/pages/dashboard/dashboard", text: "总览" },
  { pagePath: "/pages/light/light", text: "点亮" },
  { pagePath: "/pages/checklists/checklists", text: "打卡" },
  { pagePath: "/pages/imports/imports", text: "导入" }
];

Component({
  data: {
    items,
    selected: 0,
    languageTarget: "EN",
    version: "v1.31"
  },

  lifetimes: {
    attached() {
      const route = `/${getCurrentPages().slice(-1)[0]?.route || ""}`;
      const selected = items.findIndex((item) => item.pagePath === route);
      const language = getApp().getState().language || "zh";
      this.setData({
        selected: selected >= 0 ? selected : 0,
        languageTarget: language === "zh" ? "EN" : "中"
      });
    }
  },

  methods: {
    setSelected(index) {
      const nextIndex = Number(index);
      if (Number.isInteger(nextIndex) && nextIndex >= 0 && nextIndex < items.length) {
        this.setData({ selected: nextIndex });
      }
    },

    switchPage(event) {
      const index = Number(event.currentTarget.dataset.index);
      const item = items[index];
      if (!item) return;
      this.setData({ selected: index });
      wx.switchTab({
        url: item.pagePath,
        fail: () => {
          const route = `/${getCurrentPages().slice(-1)[0]?.route || ""}`;
          const selected = items.findIndex((candidate) => candidate.pagePath === route);
          this.setData({ selected: selected >= 0 ? selected : 0 });
        }
      });
    },

    switchLanguage() {
      const state = getApp().getState();
      const language = state.language === "en" ? "zh" : "en";
      getApp().updateState({ language });
      this.setData({ languageTarget: language === "zh" ? "EN" : "中" });
      const page = getCurrentPages().slice(-1)[0];
      if (page?.refreshLanguage) page.refreshLanguage();
    }
  }
});
