const importers = require("../../utils/importers");
const store = require("../../utils/store");
const coverage = require("../../utils/coverage");
const PHOTO_EXTENSIONS = ["jpg", "jpeg", "tif", "tiff", "heic", "heif"];

Page({
  data: { files: [], fileCount: 0, pointCount: 0, lineCount: 0, checkinCount: 0 },

  onShow() {
    this.getTabBar()?.setSelected?.(4);
    this.refresh();
  },

  refresh() {
    const state = getApp().getState();
    this.setData({
      files: state.importedFiles,
      fileCount: state.importedFiles.length,
      pointCount: state.importedPoints.length,
      lineCount: state.importedLines.length,
      checkinCount: state.checkins.length
    });
  },

  chooseFiles() {
    wx.chooseMessageFile({
      count: 10,
      type: "file",
      extension: ["geojson", "json", "kml", "csv", ...PHOTO_EXTENSIONS],
      success: ({ tempFiles }) => this.importFiles(tempFiles)
    });
  },

  importFiles(files) {
    const fs = wx.getFileSystemManager();
    const state = getApp().getState();
    const importedPoints = state.importedPoints.slice();
    const importedLines = state.importedLines.slice();
    const importedFiles = state.importedFiles.slice();
    let failed = 0;

    files.forEach((file) => {
      try {
        const extension = file.name.split(".").pop().toLowerCase();
        let result;
        if (PHOTO_EXTENSIONS.includes(extension)) {
          const point = importers.parsePhoto(file.name, fs.readFileSync(file.path));
          if (!point) throw new Error("NO_GPS");
          result = { points: [{ ...point, id: `photo-${Date.now()}-${Math.random()}` }], lines: [] };
        } else {
          result = importers.parseFile(file.name, fs.readFileSync(file.path, "utf8"));
        }
        const fileId = `file-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const points = result.points.slice(0, 1000);
        importedPoints.push(...points.map((item) => ({ ...item, fileId })));
        importedLines.push(...result.lines.map((item) => ({ ...item, fileId })));
        importedFiles.unshift({
          id: fileId,
          name: file.name,
          type: extension.toUpperCase(),
          points: points.length,
          lines: result.lines.length,
          importedAt: new Date().toISOString()
        });
      } catch (error) {
        failed += 1;
      }
    });

    const next = { ...state, importedPoints, importedLines, importedFiles };
    getApp().updateState({
      importedPoints,
      importedLines,
      importedFiles,
      ...coverage.recomputeCoverage(next)
    });
    this.refresh();
    wx.showToast({ title: failed ? `${failed} 个文件未导入` : "导入完成", icon: failed ? "none" : "success" });
  },

  deleteFile(event) {
    const fileId = event.currentTarget.dataset.id;
    const state = getApp().getState();
    const file = state.importedFiles.find((item) => item.id === fileId);
    if (!file) return;
    wx.showModal({
      title: "删除导入文件",
      content: `同时删除“${file.name}”导入的地点和路径。`,
      confirmText: "删除",
      confirmColor: "#a43e32",
      success: ({ confirm }) => {
        if (!confirm) return;
        const next = {
          ...state,
          importedFiles: state.importedFiles.filter((item) => item.id !== fileId),
          importedPoints: state.importedPoints.filter((item) => item.fileId !== fileId),
          importedLines: state.importedLines.filter((item) => item.fileId !== fileId)
        };
        getApp().updateState({
          importedFiles: next.importedFiles,
          importedPoints: next.importedPoints,
          importedLines: next.importedLines,
          ...coverage.recomputeCoverage(next)
        });
        this.refresh();
      }
    });
  },

  exportArchive() {
    const payload = JSON.stringify({
      format: "travel-map-mini-v1",
      exportedAt: new Date().toISOString(),
      state: getApp().getState()
    }, null, 2);
    const fileName = `travel-map-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const path = `${wx.env.USER_DATA_PATH}/${fileName}`;
    wx.getFileSystemManager().writeFileSync(path, payload, "utf8");
    if (wx.shareFileMessage) wx.shareFileMessage({ filePath: path, fileName });
    else wx.setClipboardData({ data: payload });
  },

  chooseArchive() {
    wx.chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["json"],
      success: ({ tempFiles }) => {
        try {
          const payload = JSON.parse(wx.getFileSystemManager().readFileSync(tempFiles[0].path, "utf8"));
          if (payload.format !== "travel-map-mini-v1" || !payload.state) throw new Error("INVALID");
          const restored = store.saveState(payload.state);
          getApp().globalData.state = store.saveState({ ...restored, ...coverage.recomputeCoverage(restored) });
          this.refresh();
          wx.showToast({ title: "存档已恢复", icon: "success" });
        } catch (error) {
          wx.showToast({ title: "存档结构不正确", icon: "none" });
        }
      }
    });
  },

  clearAllData() {
    wx.showModal({
      title: "清空全部数据",
      content: "点亮地点、打卡记录、清单勾选和导入对象都会被删除。此操作不可撤销。",
      confirmText: "清空",
      confirmColor: "#a43e32",
      success: ({ confirm }) => {
        if (!confirm) return;
        getApp().globalData.state = store.saveState({});
        this.refresh();
      }
    });
  }
});
