const store = require("./utils/store");
const coverage = require("./utils/coverage");

App({
  globalData: {
    state: null
  },

  onLaunch() {
    const state = store.loadState();
    this.globalData.state = store.saveState({
      ...state,
      ...coverage.reconcileCoverage(state)
    });
  },

  getState() {
    if (!this.globalData.state) {
      this.globalData.state = store.loadState();
    }
    return this.globalData.state;
  },

  updateState(patch) {
    this.globalData.state = store.saveState({
      ...this.getState(),
      ...patch
    });
    return this.globalData.state;
  }
});
