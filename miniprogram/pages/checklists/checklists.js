const checklists = require("../../data/checklists");

const PAGE_SIZE = 80;

Page({
  data: {
    activeLabel: "5A 景区",
    activeType: "china5a",
    doneCount: 0,
    hasMore: false,
    keyword: "",
    limit: PAGE_SIZE,
    percent: 0,
    tabs: [
      { key: "china5a", label: "5A 景区" },
      { key: "worldHeritage", label: "世界遗产" },
      { key: "referenceLists", label: "其他清单" }
    ],
    totalCount: 0,
    visibleItems: []
  },

  onLoad() {
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  changeType(event) {
    const activeType = event.currentTarget.dataset.type;
    const labels = {
      china5a: "5A 景区",
      worldHeritage: "世界遗产",
      referenceLists: "其他参考清单"
    };
    this.setData({
      activeType,
      activeLabel: labels[activeType],
      keyword: "",
      limit: PAGE_SIZE
    }, () => this.refresh());
  },

  search(event) {
    this.setData({
      keyword: event.detail.value,
      limit: PAGE_SIZE
    }, () => this.refresh());
  },

  loadMore() {
    this.setData({ limit: this.data.limit + PAGE_SIZE }, () => this.refresh());
  },

  toggleItem(event) {
    const id = event.currentTarget.dataset.id;
    const state = getApp().getState();
    const marks = new Set(state.checklistMarks[this.data.activeType] || []);
    if (marks.has(id)) marks.delete(id);
    else marks.add(id);
    getApp().updateState({
      checklistMarks: {
        ...state.checklistMarks,
        [this.data.activeType]: Array.from(marks)
      }
    });
    this.refresh();
  },

  refresh() {
    const type = this.data.activeType;
    const source = checklists[type] || [];
    const keyword = this.data.keyword.trim().toLowerCase();
    const filtered = keyword
      ? source.filter((item) => `${item.name} ${item.area}`.toLowerCase().includes(keyword))
      : source;
    const validIds = new Set(source.map((item) => item.id));
    const marks = new Set(
      (getApp().getState().checklistMarks[type] || []).filter((id) => validIds.has(id))
    );
    const visibleItems = filtered.slice(0, this.data.limit).map((item) => ({
      ...item,
      done: marks.has(item.id)
    }));

    this.setData({
      doneCount: marks.size,
      totalCount: source.length,
      percent: source.length ? Math.round((marks.size / source.length) * 100) : 0,
      visibleItems,
      hasMore: filtered.length > visibleItems.length
    });
  }
});
