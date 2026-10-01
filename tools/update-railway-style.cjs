// Fetch fixed upstream assets only; never railway tiles.
const fs = require('node:fs/promises');
const path = require('node:path');
async function main() {
  const target = path.resolve(__dirname, '../vendor/openrailwaymap');
  await fs.mkdir(target, { recursive: true });
  for (const [name, url] of [
    ['style.json', 'https://openrailwaymap.app/style.json'],
    ['legend.json', 'https://openrailwaymap.app/legend.json'],
    ['COPYING', 'https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/COPYING'],
  ]) {
    const response = await fetch(url, { headers: { 'User-Agent': 'TravelMap railway asset updater (https://github.com/paulwangpu/Travelmap)' } });
    if (!response.ok) throw new Error(url + ': ' + response.status);
    await fs.writeFile(path.join(target, name), new Uint8Array(await response.arrayBuffer()));
  }
  const ui = await (await fetch('https://openrailwaymap.app/js/ui.js')).text();
  const start = ui.indexOf('async function transposeImageData(');
  const end = ui.indexOf('const generatedImages =', start);
  if (start < 0 || end < start) throw new Error('Upstream image helper structure changed');
  const helper = ui.slice(start, end);
  await fs.writeFile(path.join(target, 'composite.js'), `/* Adapted from OpenRailwayMap UI, © Hidde Wieringa; GPL-3.0-or-later. See COPYING. */\nfunction railwayCompositeImages(map) {\n${helper}\nreturn composeImages;\n}\n`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
