const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8'),calls=[];
const context={currentLanguage:'zh',checklistOverlayCache:{signature:'old'},mapLibreMarkerSignature:'old',mapLibreMap:{getSource:()=>true},mapLibreStyleReady:true,state:{mapOverlays:{}},
 syncMapLibreArcgisWaterOverlay(){},syncMapLibreRailwayOverlay(){},renderMapLibreMarkers(){calls.push('markers');},
 ancientCapitalCurrentDisplayName:item=>item.name,checklistItemDisplayName:(_key,name)=>name,chinaProvinceEnglishNames:{北京:'Beijing'},chineseToPinyinTitle:()=> 'Luoyang'};
for(const name of ['AncientCapitalWalls','AngkorSites','LuoyangCapitalEvolution','BeijingCapitalEvolution'])context[name]={sync(){calls.push(name);}};
vm.runInNewContext(source.slice(source.indexOf('function refreshMapLabelsForLanguage('),source.indexOf('function captureLanguageSwitchViewState(')),context);
vm.runInNewContext(source.slice(source.indexOf('function ancientCapitalMapTitle('),source.indexOf('function ancientCapitalMapSubtitle(')),context);
assert.equal(context.ancientCapitalMapTitle({name:'北京'}),'北京');context.currentLanguage='en';
assert.equal(context.ancientCapitalMapTitle({name:'北京'}),'Beijing');assert.equal(context.ancientCapitalMapTitle({name:'洛阳'}),'Luoyang');
context.refreshMapLabelsForLanguage();assert.deepEqual(calls,['AncientCapitalWalls','AngkorSites','LuoyangCapitalEvolution','BeijingCapitalEvolution','markers']);
console.log('PASS: bilingual ancient-capital names and refresh of every historical map module');
