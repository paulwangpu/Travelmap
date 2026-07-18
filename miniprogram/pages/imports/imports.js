const importers = require("../../utils/importers");
const store = require("../../utils/store");
const coverage = require("../../utils/coverage");

Page({
  data: {
    fileCount: 0,
    files: [],
    lineCount: 0,
    pointCount: 0
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const state = getApp().getState();
    this.setData({
      files: state.importedFiles,
      fileCount: state.importedFiles.length,
      pointCount: state.importedPoints.length,
      lineCount: state.importedLines.length
    });
  },

  chooseFiles() {
    wx.chooseMessageFile({
      count: 10,
      type: "file",
      extension: ["geojson", "json", "kml", "csv"],
      success: ({ tempFiles }) => this.importFiles(tempFiles)
    });
  },

  importFiles(files) {
    const fileSystem = wx.getFileSystemManager();
    const state = getApp().getState();
    const importedPoints = state.importedPoints.slice();
    const importedLines = state.importedLines.slice();
    const importedFiles = state.importedFiles.slice();
    let remaining = files.length;
    let failed = 0;

    files.forEach((file) => {
      fileSystem.readFile({
        filePath: file.path,
        encoding: "utf8",
        success: ({ data }) => {
          try {
            const result = importers.parseFile(file.name, data);
            const fileId = `file-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            importedPoints.push(...result.points.map((item) => ({ ...item, fileId })));
            importedLines.push(...result.lines.map((item) => ({ ...item, fileId })));
            importedFiles.unshift({
              id: fileId,
              name: file.name,
              type: file.name.split(".").pop().toUpperCase(),
              points: result.points.length,
              lines: result.lines.length,
              importedAt: new Date().toISOString()
            });
          } catch (error) {
            failed += 1;
          }
        },
        fail: () => {
          failed += 1;
        },
        complete: () => {
          remaining -= 1;
          if (remaining > 0) return;
          const sampledLinePoints = importedLines.flatMap((line) =>
            line.points.filter((point, index) => index === 0 || index === line.points.length - 1 || index % 20 === 0)
          );
          const coveragePatch = coverage.inferCoverage(state, importedPoints.concat(sampledLinePoints));
          getApp().updateState({
            importedPoints,
            importedLines,
            importedFiles,
            ...coveragePatch
          });
          this.refresh();
          wx.showToast({
            title: failed ? `${failed} 个文件失败` : "导入完成",
            icon: failed ? "none" : "success"
          });
        }
      });
    });
  },

  deleteFile(event) {
    const fileId = event.currentTarget.dataset.id;
    const file = getApp().getState().importedFiles.find((item) => item.id === fileId);
    if (!file) return;
    wx.showModal({
      title: "删除导入文件",
      content: `将同时删除“${file.name}”导入的地点和路径。`,
      confirmText: "删除",
      confirmColor: "#a43e32",
      success: ({ confirm }) => {
        if (!confirm) return;
        const state = getApp().getState();
        const nextState = {
          ...state,
          importedFiles: state.importedFiles.filter((item) => item.id !== fileId),
          importedPoints: state.importedPoints.filter((item) => item.fileId !== fileId),
          importedLines: state.importedLines.filter((item) => item.fileId !== fileId)
        };
        getApp().updateState({
          importedFiles: nextState.importedFiles,
          importedPoints: nextState.importedPoints,
          importedLines: nextState.importedLines,
          ...coverage.recomputeCoverage(nextState)
        });
        this.refresh();
        wx.showToast({ title: "已删除", icon: "success" });
      }
    });
  },

  clearImports() {
    wx.showModal({
      title: "清空导入数据",
      content: "手动点亮和打卡记录不会被删除。",
      confirmText: "清空",
      confirmColor: "#a43e32",
      success: (result) => {
        if (!result.confirm) return;
        const state = getApp().getState();
        const nextState = {
          ...state,
          importedFiles: [],
          importedPoints: [],
          importedLines: []
        };
        getApp().updateState({
          importedFiles: [],
          importedPoints: [],
          importedLines: [],
          ...coverage.recomputeCoverage(nextState)
        });
        this.refresh();
      }
    });
  },

  exportBackup() {
    const data = JSON.stringify({
      format: "travel-map-mini-v1",
      exportedAt: new Date().toISOString(),
      state: getApp().getState()
    });
    wx.setClipboardData({ data });
  },

  importBackup() {
    wx.getClipboardData({
      success: ({ data }) => {
        try {
          const payload = JSON.parse(data);
          if (payload.format !== "travel-map-mini-v1" || !payload.state) throw new Error("INVALID");
          const restored = store.saveState(payload.state);
          getApp().globalData.state = store.saveState({
            ...restored,
            ...coverage.reconcileCoverage(restored)
          });
          this.refresh();
          wx.showToast({ title: "恢复成功", icon: "success" });
        } catch (error) {
          wx.showToast({ title: "没有有效备份", icon: "none" });
        }
      }
    });
  }
});
