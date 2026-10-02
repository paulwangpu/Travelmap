const fs=require('node:fs'),path=require('node:path');
const {parseKmz}=require('./build-great-wall.cjs');
const eras={ '春秋戦国':['spring-autumn','春秋战国','Spring and Autumn / Warring States'], '秦代':['qin','秦代','Qin'], '漢代':['han','汉代','Han'], '北魏':['northern-wei','北魏','Northern Wei'], '遼・金':['liao-jin','辽金','Liao / Jin'], '明代':['ming','明代','Ming'] };
function build(buffer) {
  const features=parseKmz(buffer).map((f,index)=>{
    const era=eras[f.properties.originalPath.split('/').at(-1)];if(!era)throw new Error('Unknown era '+f.properties.originalPath);
    if(f.geometry.type!=='LineString')throw new Error('Unexpected geometry');
    const number=(f.properties.name.match(/\d+/)?.[0]||String(index+1)).padStart(2,'0'),branch=/支線/.test(f.properties.name);
    return {...f,id:'wiki-history-'+index,properties:{...f.properties,originalName:f.properties.name,originalId:index,name:era[1]+'长城'+(branch?'支线':'')+' · '+number,nameEn:era[2]+' Great Wall'+(branch?' branch':'')+' · '+number,category:'wall',source:'wikipedia-kmz',dynasty:era[0],dynastyZh:era[1],dynastyEn:era[2],approximate:true}};
  });
  return {type:'FeatureCollection',features};
}
if(require.main===module){const d=build(fs.readFileSync(process.argv[2]));fs.writeFileSync(path.join(__dirname,'../data/great-wall/history.geojson'),JSON.stringify(d));console.log(JSON.stringify({features:d.features.length,vertices:d.features.reduce((n,f)=>n+f.geometry.coordinates.length,0)}));}
module.exports={build};
