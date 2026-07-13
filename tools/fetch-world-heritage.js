const fs = require("fs/promises");
const path = require("path");

const endpoint = "https://query.wikidata.org/sparql";
const outputPath = path.join(__dirname, "..", "data", "world-heritage.json");

const baseQuery = `
SELECT ?site ?country ?coord WHERE {
  ?site wdt:P1435 wd:Q9259.
  FILTER NOT EXISTS { ?site wdt:P361 ?parent. ?parent wdt:P1435 wd:Q9259. }
  OPTIONAL { ?site wdt:P17 ?country. }
  OPTIONAL { ?site wdt:P625 ?coord. }
}
ORDER BY ?site`;

function value(binding, key) {
  return binding[key]?.value || "";
}

function qid(uri) {
  return String(uri || "").split("/").pop();
}

function parsePoint(point) {
  const match = String(point || "").match(/Point\(([-\d.]+) ([-\d.]+)\)/);
  if (!match) return null;
  return { lng: Number(match[1]), lat: Number(match[2]) };
}

function displayName(zh, en) {
  if (zh && en && zh !== en) return `${zh}（${en}）`;
  return zh || en || "";
}

const countryNameAliases = {
  美國: "美国",
  美利坚合众国: "美国",
  大韩民国: "韩国",
  韓國: "韩国",
  朝鲜民主主义人民共和国: "朝鲜",
  臺灣: "台湾",
  台灣: "台湾",
  香港特別行政區: "香港",
  澳門特別行政區: "澳门",
  亞美尼亞: "亚美尼亚",
  克羅地亞: "克罗地亚",
  蒙特內哥羅: "黑山",
  白俄羅斯: "白俄罗斯",
  法國: "法国",
  德國: "德国",
  義大利: "意大利",
  荷蘭: "荷兰",
  波蘭: "波兰",
  烏克蘭: "乌克兰",
  愛爾蘭共和國: "爱尔兰",
  愛沙尼亞: "爱沙尼亚",
  拉脫維亞: "拉脱维亚",
  羅馬尼亞: "罗马尼亚",
  斯洛文尼亞: "斯洛文尼亚",
  塞爾維亞: "塞尔维亚",
  阿爾巴尼亞: "阿尔巴尼亚",
  阿爾及利亞: "阿尔及利亚",
  敘利亞: "叙利亚",
  突尼西亞: "突尼斯",
  馬來西亞: "马来西亚",
  泰國: "泰国",
  芬蘭: "芬兰",
  馬爾他: "马耳他",
  馬耳他: "马耳他",
  馬達加斯加: "马达加斯加",
  馬拉威: "马拉维",
  馬紹爾群島: "马绍尔群岛",
  尼泊爾: "尼泊尔",
  索馬里: "索马里",
  厄立特里亞: "厄立特里亚",
  毛里塔尼亞: "毛里塔尼亚",
  玻利維亞: "玻利维亚",
  薩爾瓦多: "萨尔瓦多",
  贊比亞: "赞比亚",
  坦桑尼亞: "坦桑尼亚",
  奈及利亞: "尼日利亚",
  岡比亞: "冈比亚",
  畿內亞比紹: "几内亚比绍",
  剛果共和國: "刚果共和国",
  中非共和國: "中非共和国",
  布吉納法索: "布基纳法索",
  梵蒂岡城國: "梵蒂冈",
  蒙古國: "蒙古",
  孟加拉國: "孟加拉国",
  朝鮮民主主義人民共和國: "朝鲜",
  德意志联邦共和国: "德国",
  法兰西共和国: "法国",
  大不列颠及北爱尔兰联合王国: "英国",
  俄罗斯帝国: "俄罗斯",
};

function normalizeCountryName(name) {
  const value = String(name || "").trim();
  return countryNameAliases[value] || value || "未分国家";
}

async function fetchSparqlPage(offset, limit) {
  const query = `${baseQuery}\nLIMIT ${limit}\nOFFSET ${offset}`;
  const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
  const response = await fetch(url, {
    headers: {
      "accept": "application/sparql-results+json",
      "user-agent": "TravelMapLocalDataBuilder/1.0 (local personal app)",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchRows() {
  const limit = 250;
  const rows = [];
  for (let offset = 0; ; offset += limit) {
    const data = await fetchSparqlPage(offset, limit);
    const page = data.results.bindings;
    rows.push(...page);
    console.log(`Fetched ${rows.length} World Heritage rows`);
    if (page.length < limit) return rows;
  }
}

async function fetchLabels(ids) {
  const labels = new Map();
  const chunks = [];
  for (let index = 0; index < ids.length; index += 25) chunks.push(ids.slice(index, index + 25));
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex];
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${chunk.join("|")}&props=labels&languages=zh-hans|zh|en&format=json`;
    let response = null;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      response = await fetch(url, {
        headers: { "user-agent": "TravelMapLocalDataBuilder/1.0 (local personal app)" },
      });
      if (response.ok) break;
      if (response.status !== 429) throw new Error(`${response.status} ${response.statusText}`);
      const waitMs = 20000 + attempt * 10000;
      console.warn(`Wikidata label API rate limited at ${chunkIndex + 1}/${chunks.length}; waiting ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    if (!response?.ok) throw new Error(`${response?.status} ${response?.statusText}`);
    const data = await response.json();
    Object.entries(data.entities || {}).forEach(([id, entity]) => {
      labels.set(id, {
        zh: entity.labels?.["zh-hans"]?.value || entity.labels?.zh?.value || "",
        en: entity.labels?.en?.value || "",
      });
    });
    if ((chunkIndex + 1) % 10 === 0) console.log(`Fetched labels ${chunkIndex + 1}/${chunks.length}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return labels;
}

async function main() {
  const rows = await fetchRows();
  const ids = Array.from(new Set(rows.flatMap((row) => [qid(value(row, "site")), qid(value(row, "country"))]).filter(Boolean)));
  const labels = await fetchLabels(ids);
  const sites = new Map();
  for (const row of rows) {
    const id = qid(value(row, "site"));
    if (!id) continue;
    const siteZh = labels.get(id)?.zh || "";
    const siteEn = labels.get(id)?.en || "";
    const countryId = qid(value(row, "country"));
    const countryZh = labels.get(countryId)?.zh || "";
    const countryEn = labels.get(countryId)?.en || "";
    const countryName = normalizeCountryName(countryZh || countryEn);
    const coord = parsePoint(value(row, "coord"));
    if (!sites.has(id)) {
      sites.set(id, {
        id,
        name: displayName(siteZh, siteEn) || id,
        zhName: siteZh,
        enName: siteEn,
        countries: [],
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
      });
    }
    const site = sites.get(id);
    if (coord && !Number.isFinite(site.lat)) {
      site.lat = coord.lat;
      site.lng = coord.lng;
    }
    if (countryName && !site.countries.includes(countryName)) site.countries.push(countryName);
  }

  const items = Array.from(sites.values()).sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
  const byCountry = {};
  items.forEach((site) => {
    const countries = site.countries.length ? site.countries : ["未分国家"];
    countries.forEach((country) => {
      byCountry[country] ||= [];
      byCountry[country].push(site.name);
    });
  });
  Object.keys(byCountry).forEach((country) => byCountry[country].sort((a, b) => a.localeCompare(b, "zh-Hans-CN")));

  const coordinates = {};
  items.forEach((site) => {
    if (!Number.isFinite(site.lat) || !Number.isFinite(site.lng)) return;
    coordinates[site.name] = [site.lat, site.lng, site.countries[0] || ""];
    if (site.zhName) coordinates[site.zhName] = [site.lat, site.lng, site.countries[0] || ""];
    if (site.enName) coordinates[site.enName] = [site.lat, site.lng, site.countries[0] || ""];
  });

  await fs.writeFile(outputPath, JSON.stringify({
    source: "Wikidata SPARQL: heritage designation UNESCO World Heritage Site (Q9259), excluding items that are part of another World Heritage item via P361",
    generatedAt: new Date().toISOString(),
    total: items.length,
    items,
    byCountry,
    coordinates,
  }), "utf8");
  console.log(`Wrote ${items.length} World Heritage entries to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
