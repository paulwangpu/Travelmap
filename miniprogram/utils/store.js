const STORAGE_KEY = "travel-map-mini-state-v1";

const defaultState = {
  visitedCountries: [],
  visitedProvinces: [],
  visitedCities: [],
  visitedUsStates: [],
  visitedJapanRegions: [],
  manualVisitedCountries: [],
  manualVisitedProvinces: [],
  manualVisitedCities: [],
  manualVisitedUsStates: [],
  manualVisitedJapanRegions: [],
  language: "zh",
  checkins: [],
  importedPoints: [],
  importedLines: [],
  importedFiles: [],
  checklistMarks: {
    china5a: [],
    worldHeritage: [],
    referenceLists: []
  }
};

function normalizeState(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    ...defaultState,
    ...source,
    visitedCountries: Array.isArray(source.visitedCountries) ? source.visitedCountries : [],
    visitedProvinces: Array.isArray(source.visitedProvinces) ? source.visitedProvinces : [],
    visitedCities: Array.isArray(source.visitedCities) ? source.visitedCities : [],
    visitedUsStates: Array.isArray(source.visitedUsStates) ? source.visitedUsStates : [],
    visitedJapanRegions: Array.isArray(source.visitedJapanRegions) ? source.visitedJapanRegions : [],
    manualVisitedCountries: Array.isArray(source.manualVisitedCountries)
      ? source.manualVisitedCountries
      : (Array.isArray(source.visitedCountries) ? source.visitedCountries : []),
    manualVisitedProvinces: Array.isArray(source.manualVisitedProvinces)
      ? source.manualVisitedProvinces
      : (Array.isArray(source.visitedProvinces) ? source.visitedProvinces : []),
    manualVisitedCities: Array.isArray(source.manualVisitedCities)
      ? source.manualVisitedCities
      : (Array.isArray(source.visitedCities) ? source.visitedCities : []),
    manualVisitedUsStates: Array.isArray(source.manualVisitedUsStates)
      ? source.manualVisitedUsStates
      : (Array.isArray(source.visitedUsStates) ? source.visitedUsStates : []),
    manualVisitedJapanRegions: Array.isArray(source.manualVisitedJapanRegions)
      ? source.manualVisitedJapanRegions
      : (Array.isArray(source.visitedJapanRegions) ? source.visitedJapanRegions : []),
    language: source.language === "en" ? "en" : "zh",
    checkins: Array.isArray(source.checkins) ? source.checkins : [],
    importedPoints: Array.isArray(source.importedPoints) ? source.importedPoints : [],
    importedLines: Array.isArray(source.importedLines) ? source.importedLines : [],
    importedFiles: Array.isArray(source.importedFiles) ? source.importedFiles : [],
    checklistMarks: {
      china5a: Array.isArray(source.checklistMarks?.china5a) ? source.checklistMarks.china5a : [],
      worldHeritage: Array.isArray(source.checklistMarks?.worldHeritage) ? source.checklistMarks.worldHeritage : [],
      referenceLists: Array.isArray(source.checklistMarks?.referenceLists) ? source.checklistMarks.referenceLists : []
    }
  };
}

function loadState() {
  try {
    return normalizeState(wx.getStorageSync(STORAGE_KEY));
  } catch (error) {
    return normalizeState();
  }
}

function saveState(state) {
  const normalized = normalizeState(state);
  wx.setStorageSync(STORAGE_KEY, normalized);
  return normalized;
}

module.exports = {
  loadState,
  saveState
};
