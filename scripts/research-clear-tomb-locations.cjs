const fs=require('node:fs');
(async()=>{
const query='[out:json][timeout:45];nwr["name"~"北洞山|驮篮山|卧牛山汉墓|南洞山|九龙山汉墓|红土山|灵圣湖|任城王陵|唐建陵|益门村|虚粮冢|九女台|蔡侯墓|大武齐王"](20,73,54,135);out center tags;';
const response=await fetch('https://overpass.kumi.systems/api/interpreter',{headers:{'User-Agent':'TravelMap-CulturalHeritageResearch/1.0 (public heritage location verification)'},method:'POST',body:'data='+encodeURIComponent(query)});
if(!response.ok)throw Error(response.status);
const data=await response.json();fs.writeFileSync('data/imperial-tombs/clear-location-osm-research.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify(data.elements));
})().catch(e=>{console.error(e.message);process.exit(1)});
