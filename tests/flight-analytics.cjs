const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const functions = source.slice(source.indexOf('function validFlightDate('), source.indexOf('function flightDurationMinutes('));
const airports = new Map([
  ['北京', { name: '北京首都国际机场', iata: 'PEK', city: '北京' }],
  ['PEK', { name: '北京首都国际机场', iata: 'PEK', city: '北京' }],
  ['上海', { name: '上海虹桥国际机场', iata: 'SHA', city: '上海' }],
  ['SHA', { name: '上海虹桥国际机场', iata: 'SHA', city: '上海' }],
  ['PKX', { name: '北京大兴国际机场', iata: 'PKX', city: '北京' }],
]);
const context = {
  Date,
  Map,
  Number,
  String,
  Intl,
  findAirport: (value) => airports.get(String(value || '').trim()) || null,
  normalizeAirportName: (value) => String(value || '').trim().toLocaleLowerCase(),
  flightRouteEndpointName: (airport) => airport.city || airport.name,
};
vm.createContext(context);
vm.runInContext(`${functions}\nthis.validFlightDate = validFlightDate; this.sortFlightsChronologically = sortFlightsChronologically; this.flightAnalyticsSummary = flightAnalyticsSummary; this.flightCityStatEntry = flightCityStatEntry; this.flightRankingPercent = flightRankingPercent; this.flightHeatLevel = flightHeatLevel;`, context);

assert.equal(context.validFlightDate('2024-02-29'), '2024-02-29');
assert.equal(context.validFlightDate('2023-02-29'), '');
assert.equal(context.validFlightDate('not-a-date'), '');

const flights = [
  { key: 'latest', date: '2024-02-02', fromTime: '09:00', fromAirport: '北京', toAirport: '上海', airline: '示例航空', importedAt: '2025-01-04' },
  { key: 'same-day-late', date: '2023-01-02', fromTime: '18:30', fromAirport: 'SHA', toAirport: 'PEK', airline: '示例航空', importedAt: '2025-01-03' },
  { key: 'unknown-late', date: '日期未知', fromTime: '07:00', fromAirport: '未知机场', toAirport: '北京', airline: '', importedAt: '2025-01-02' },
  { key: 'same-day-early', date: '2023-01-02', fromTime: '08:15', fromAirport: 'PEK', toAirport: '上海', airline: '另一航空', importedAt: '2025-01-01' },
];

assert.deepEqual(
  Array.from(context.sortFlightsChronologically(flights), (flight) => flight.key),
  ['same-day-early', 'same-day-late', 'latest', 'unknown-late'],
);

const stats = context.flightAnalyticsSummary(flights, 'zh-CN');
assert.equal(stats.flights, 4);
assert.deepEqual(Array.from(stats.airports, ({ label, count }) => [label, count]), [
  ['北京 (PEK)', 4],
  ['上海 (SHA)', 3],
  ['未知机场', 1],
]);
assert.equal(stats.routes[0].count, 3, 'opposite directions share one route');
assert.match(stats.routes[0].label, /北京 \(PEK\).*上海 \(SHA\)|上海 \(SHA\).*北京 \(PEK\)/);
assert.deepEqual(Array.from(stats.airlines, ({ label, count }) => [label, count]), [
  ['示例航空', 2],
  ['', 1],
  ['另一航空', 1],
]);
assert.deepEqual(Array.from(stats.calendar, ({ year, months }) => [year, Array.from(months)]), [
  [2023, [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  [2024, [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
]);
assert.equal(stats.maxMonthlyFlights, 2);
assert.equal(stats.unknownDates, 1);

assert.equal(context.flightRankingPercent(10, 10), 100);
assert.equal(context.flightRankingPercent(5, 10), 50);
assert.equal(context.flightRankingPercent(20, 10), 100);
assert.equal(context.flightRankingPercent(0, 10), 0);
assert.equal(context.flightRankingPercent(5, 0), 0);

assert.equal(context.flightHeatLevel(0, 8), 0);
assert.equal(context.flightHeatLevel(1, 8), 1);
assert.equal(context.flightHeatLevel(3, 8), 2);
assert.equal(context.flightHeatLevel(5, 8), 3);
assert.equal(context.flightHeatLevel(8, 8), 4);
assert.equal(context.flightHeatLevel(3, 0), 0);

const beijingHome = context.flightCityStatEntry('PEK').key;
const shanghaiHome = context.flightCityStatEntry('SHA').key;
const destinationFlights = [
  { date: '2025-01-02', fromAirport: 'PEK', toAirport: 'SHA', airline: 'A' },
  { date: '2025-01-05', fromAirport: 'SHA', toAirport: 'PKX', airline: 'A' },
  { date: '2025-02-01', fromAirport: 'SHA', toAirport: '未知机场', airline: 'B' },
  { date: '日期未知', fromAirport: 'PEK', toAirport: '广州', airline: 'B' },
];
const homeStats = context.flightAnalyticsSummary(destinationFlights, 'zh-CN', [beijingHome]);
assert.deepEqual(Array.from(homeStats.calendar[0].destinations[0], ({ label, count }) => [label, count]), [['上海', 2]]);
assert.deepEqual(Array.from(homeStats.calendar[0].destinations[1], ({ label, count }) => [label, count]), [['上海', 1], ['未知机场', 1]]);
const multipleHomeStats = context.flightAnalyticsSummary(destinationFlights, 'zh-CN', [beijingHome, shanghaiHome]);
assert.deepEqual(Array.from(multipleHomeStats.calendar[0].destinations[0]), []);
assert.deepEqual(Array.from(multipleHomeStats.calendar[0].destinations[1], ({ label, count }) => [label, count]), [['未知机场', 1]]);
assert.ok(homeStats.cityCandidates.some(({ label }) => label === '北京'), 'same-city airports merge into one home candidate');

console.log('PASS: flight chronology, analytics aggregation, home cities, destinations, ranking scales, and heat levels');
