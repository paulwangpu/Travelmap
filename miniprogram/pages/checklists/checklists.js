const checklists = require("../../data/checklists");
const coverage = require("../../utils/coverage");

const sections = [
  { key: "china5a", label: "中国 5A 景区" },
  { key: "worldHeritage", label: "世界遗产（按国家）" },
  { key: "referenceLists", label: "其他参考清单" }
];

Page({
  data: {
    sections: sections.map((item) => ({ ...item, open: false, groups: [] }))
  },

  onShow() {
    this.getTabBar()?.setSelected?.(3);
    this.refresh();
  },

  refresh() {
    const state = getApp().getState();
    const openMap = new Map(this.data.sections.map((section) => [section.key, section]));
    this.setData({
      sections: sections.map((section) => {
        const previous = openMap.get(section.key);
        const open = previous?.open || false;
        return {
          ...section,
          open,
          groups: open ? this.groupsFor(section.key, state, previous?.groups || []) : [],
          done: state.checklistMarks[section.key].length,
          total: checklists[section.key].length
        };
      })
    });
  },

  groupsFor(key, state, previousGroups) {
    const openMap = new Map(previousGroups.map((group) => [group.name, group.open]));
    const marks = new Set(state.checklistMarks[key]);
    const grouped = checklists[key].reduce((groups, item) => {
      const name = item.area || "其他";
      groups[name] ||= [];
      groups[name].push({
        ...item,
        done: marks.has(item.id)
      });
      return groups;
    }, {});
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      items,
      done: items.filter((item) => item.done).length,
      open: openMap.get(name) || false
    }));
  },

  toggleSection(event) {
    const key = event.currentTarget.dataset.key;
    const state = getApp().getState();
    this.setData({
      sections: this.data.sections.map((section) => {
        if (section.key !== key) return section;
        const open = !section.open;
        return {
          ...section,
          open,
          groups: open ? this.groupsFor(key, state, section.groups) : []
        };
      })
    });
  },

  toggleGroup(event) {
    const sectionKey = event.currentTarget.dataset.section;
    const groupName = event.currentTarget.dataset.group;
    this.setData({
      sections: this.data.sections.map((section) => ({
        ...section,
        groups: section.key === sectionKey
          ? section.groups.map((group) => ({
              ...group,
              open: group.name === groupName ? !group.open : group.open
            }))
          : section.groups
      }))
    });
  },

  toggleItem(event) {
    const key = event.currentTarget.dataset.section;
    const id = event.currentTarget.dataset.id;
    const state = getApp().getState();
    const marks = new Set(state.checklistMarks[key]);
    if (marks.has(id)) marks.delete(id);
    else marks.add(id);
    const nextState = {
      ...state,
      checklistMarks: {
        ...state.checklistMarks,
        [key]: Array.from(marks)
      }
    };
    getApp().updateState({
      checklistMarks: nextState.checklistMarks,
      ...coverage.recomputeCoverage(nextState)
    });
    this.refresh();
  }
});
