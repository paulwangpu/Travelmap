const coverage = require("../../utils/coverage");

Page({
  data: {
    checkins: [],
    count: 0,
    draftDate: "",
    draftLatitude: null,
    draftLongitude: null,
    draftName: ""
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const state = getApp().getState();
    this.setData({
      checkins: state.checkins.map((item) => ({
        ...item,
        hasLocation: Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
      })),
      count: state.checkins.length
    });
  },

  updateName(event) {
    this.setData({ draftName: event.detail.value });
  },

  updateDate(event) {
    this.setData({ draftDate: event.detail.value });
  },

  useLocation() {
    wx.getLocation({
      type: "gcj02",
      success: ({ latitude, longitude }) => {
        this.setData({
          draftLatitude: latitude,
          draftLongitude: longitude
        });
        wx.showToast({ title: "已记录当前位置", icon: "success" });
      },
      fail: () => {
        wx.showToast({ title: "未获得定位权限", icon: "none" });
      }
    });
  },

  addCheckin() {
    const name = this.data.draftName.trim();
    if (!name) {
      wx.showToast({ title: "请输入地点名称", icon: "none" });
      return;
    }

    const state = getApp().getState();
    const checkin = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      date: this.data.draftDate,
      latitude: this.data.draftLatitude,
      longitude: this.data.draftLongitude,
      createdAt: new Date().toISOString()
    };
    const coveragePatch = coverage.inferCoverage(state, [checkin]);
    getApp().updateState({
      checkins: [checkin].concat(state.checkins),
      ...coveragePatch
    });
    this.setData({
      draftName: "",
      draftDate: "",
      draftLatitude: null,
      draftLongitude: null
    });
    this.refresh();
    wx.showToast({ title: "打卡成功", icon: "success" });
  },

  deleteCheckin(event) {
    const id = event.currentTarget.dataset.id;
    const item = getApp().getState().checkins.find((candidate) => candidate.id === id);
    if (!item) return;
    wx.showModal({
      title: "删除打卡点",
      content: `确定删除“${item.name}”吗？`,
      confirmText: "删除",
      confirmColor: "#a43e36",
      success: ({ confirm }) => {
        if (!confirm) return;
        const state = getApp().getState();
        const nextState = {
          ...state,
          checkins: state.checkins.filter((candidate) => candidate.id !== id)
        };
        getApp().updateState({
          checkins: nextState.checkins,
          ...coverage.recomputeCoverage(nextState)
        });
        this.refresh();
        wx.showToast({ title: "已删除", icon: "success" });
      }
    });
  }
});
