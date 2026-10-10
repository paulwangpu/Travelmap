const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('app.js','utf8');
const code=source.slice(source.indexOf('const capitalWallSelectionKeys ='),source.indexOf('function renderAncientCapitalLegend()'));
const state={mapOverlays:{ancientCapitalWallYear:1866,ancientCapitalPeriods:{周:false},chinaAncientCapitals:true}};
const context=vm.createContext({state});vm.runInContext(code,context);
const keys=vm.runInContext('capitalWallSelectionKeys',context);
for(const checked of [false,true,false,true]) {context.updateCapitalWallSelection('ancientCapitalWalls',checked);assert.equal(state.mapOverlays.ancientCapitalWalls,checked);for(const key of keys)assert.equal(state.mapOverlays[key],checked);}
for(const key of keys)context.updateCapitalWallSelection(key,false);
assert.equal(state.mapOverlays.ancientCapitalWalls,false);
context.updateCapitalWallSelection('ancientCapitalTangWalls',true);assert.equal(state.mapOverlays.ancientCapitalWalls,true);assert.equal(keys.filter(k=>state.mapOverlays[k]).length,1);
assert.equal(state.mapOverlays.ancientCapitalWallYear,1866);assert.equal(state.mapOverlays.ancientCapitalPeriods.周,false);assert.equal(state.mapOverlays.chinaAncientCapitals,true);
console.log('PASS: wall select-all, partial selection and independent capital controls');
