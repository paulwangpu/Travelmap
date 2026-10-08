const fs=require('fs'),clip=require('polygon-clipping');
const d=JSON.parse(fs.readFileSync('data/language-areas.geojson'));
const russian=d.features.find(f=>f.properties.languageId==='russ1263');
const evenki=d.features.find(f=>f.properties.languageId==='even1259');
russian.properties.paintExclusionIds=['even1259'];
russian.properties.overlapResidualGeometry={type:'MultiPolygon',coordinates:clip.difference(russian.geometry.coordinates,evenki.geometry.coordinates)};
fs.writeFileSync('data/language-areas.geojson',JSON.stringify(d));
console.log('Prepared Russian fill excluding overlapping Evenki area; original geometry retained.');
