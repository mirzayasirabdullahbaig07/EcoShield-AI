import assert from "node:assert/strict";
import { localToday, parseForecast, parseRiverPeak, rankAreas, summarise } from "../src/lib/climate-logic";

// Payload shaped like the Open-Meteo docs: 3 past days, 4 forecast days, one null value.
const payload = {
  utc_offset_seconds: 18000,
  daily: {
    time: ["2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18", "2026-10-19", "2026-10-20"],
    precipitation_sum: [1, 0, 3.2, 4, 22.5, null, 55.1],
    precipitation_probability_max: [10, 0, 30, 40, 80, null, 95],
  },
};
const pts = parseForecast(payload, "2026-10-17");
assert.equal(pts.length, 7);
assert.equal(pts.filter((p) => p.isForecast).length, 4);
const s = summarise(pts)!;
assert.equal(s.level, "high");
assert.equal(s.peakDate, "2026-10-20");
assert.equal(s.maxProbPct, 95);
assert.ok(Math.abs(s.totalMm - 81.6) < 1e-9);

const mild = summarise(parseForecast({ daily: { time: ["2026-10-17", "2026-10-18"], precipitation_sum: [5, 21] } }, "2026-10-17"))!;
assert.equal(mild.level, "medium");
assert.equal(mild.maxProbPct, null);
assert.equal(summarise(parseForecast({ daily: { time: ["2026-10-17"], precipitation_sum: [19.9] } }, "2026-10-17"))!.level, "low");
assert.equal(summarise(parseForecast({ daily: { time: ["2026-10-17"], precipitation_sum: [null] } }, "2026-10-17")), null);

assert.throws(() => parseForecast({ nope: 1 }, "2026-10-17"));
assert.throws(() => parseForecast({ daily: { time: ["a"], precipitation_sum: [] } }, "2026-10-17"));
assert.equal(parseRiverPeak({ daily: { river_discharge: [1.5, null, 7.25] } }), 7.25);
assert.equal(parseRiverPeak({ daily: { river_discharge: [null] } }), null);
assert.equal(parseRiverPeak({}), null);
assert.equal(localToday(18000, Date.UTC(2026, 9, 17, 20, 0)), "2026-10-18");
const ranked = rankAreas([{ n: "a", peakMm: 5 }, { n: "b", peakMm: null }, { n: "c", peakMm: 60 }, { n: "d", peakMm: 5 }, { n: "e", peakMm: null }]);
assert.deepEqual(ranked.map((r) => r.n), ["c", "a", "d", "b", "e"], "wettest first, ties and missing data keep their order");
console.log("climate-logic: all assertions passed");
