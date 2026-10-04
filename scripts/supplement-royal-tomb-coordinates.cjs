module.exports=({items,source,set,gcjToWgs})=>{
 for(const [id,lng,lat,url,target] of [
 ['qin-gong-1',107.362683,34.465512,'https://www.amap.com/place/B039501OBW','秦公一号大墓遗址POI参考点'],
 ['chu-xiongjia',112.013563,30.612767,'https://ditu.amap.com/place/B0FFG7TOVD','熊家冢楚王车马阵景区参考点（非主墓墓室）']
 ]){const sid='geo-amap-'+id;source(sid,'高德陵墓遗址POI：'+id,'高德地图',url,'GCJ-02坐标经项目迭代反解为WGS84，机构历史资料核对遗址名与行政区。');const p=gcjToWgs(lng,lat);set(id,p[0],p[1],sid,target,`${lng}, ${lat}; GCJ-02`,'高德POI经项目GCJ-02迭代反解为WGS84；区域参考点，不是现场测绘',0.000001);}
 for(const [id,node,lng,lat,target] of [
 ['yin-kings','W503149933',114.30281,36.13954,'殷墟西北冈王陵遗址参考点（与小屯妇好墓分开）'],
 ['qing-cixi','W506485651',117.6396,40.18784,'菩陀峪慈禧陵区域参考点'],
 ['ming-shaowu','N9831084912',113.25883,23.1416,'越秀公园南秀湖畔绍武君臣冢现址参考点'],
 ['nanyue-wen','W298795705',113.25561,23.14072,'象岗山南越王墓原址保护展示馆区域（非王宫展区）']
 ]){const sid='geo-osm-'+node;source(sid,'陵墓实体参考点：OSM '+node,'OpenStreetMap地理数据（Mapcarta索引）','https://mapcarta.com/'+node,'OSM为WGS84；索引坐标与机构所述地点核对，未实测墓室中心。');set(id,lng,lat,sid,target,`${lat}, ${lng}; OSM ${node}`,'OSM实体索引坐标，结合机构资料核对现存陵墓或原址展示区',0.00001);}
 const sid='geo-zhou-ling';source(sid,'周灵王陵：地理坐标字段','Wikimedia地理数据','https://zh.wikipedia.org/wiki/靈王陵','只用于地点线索；墓主认定采用河南文化旅游部门和东周王城研究资料。');
 set('zhou-ling',112.37527778,34.62583333,sid,'周山西端传统灵王陵封土区域参考点','34.62583333, 112.37527778; MediaWiki Earth GeoData','MediaWiki Earth GeoData（WGS84约定）；与周山西端位置及三王陵东部区别核对',1/3600);
 source('geo-kinmen-luwang','鲁王墓园：机构景点经纬度','金门县政府观光处（观光署开放资料）','https://media.taiwan.net.tw/zh-tw/portal/travel/details/attraction_371020000a_000689','机构开放旅游经纬度与金门县迁葬资料核对，非墓室实测。');
 set('ming-luwang',118.3871,24.44769,'geo-kinmen-luwang','金门小径鲁王新墓园区域参考点','24.44769, 118.3871; tourism open-data','观光机构旅游开放数据经纬度按WGS84约定，与小径现墓行政区交叉核对',0.00001);
 const lu=items.find(x=>x.id==='ming-luwang');lu.disputes.push('同名山东明鲁王墓不是朱以海墓；索引误匹配35.4767,117.0056已拒绝。');
 for(const [id,target] of [['wu-helv','虎丘疑似阖闾墓所在景区参考点（约千米级，非剑池墓门）'],['jin-hou','北赵晋侯墓地原址保护展示区域参考点（非整个曲村天马遗址边界）']])items.find(x=>x.id===id).coordinates.target=target;
};
