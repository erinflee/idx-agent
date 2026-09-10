// feed sample data to the formatters to output cards
//
// the branch worth covering: the month-over-month sign — a positive change gets
// an explicit "+", a negative one keeps its own "-", and the first month has no
// prior to compare against
//
// run:  npm run test-market-format
//      (no DB / server needed)

import { formatMarketSummary, formatPriceTrendMonth } from "./format";
import type { MarketSummary, PriceTrendMonth } from "./marketStats";


const summary: MarketSummary = {
  soldCount: 1234,
  avgDom: 28,
  avgClosePrice: 985000,
  medClosePrice: 850000,
  avgPricePerSqft: 642,
  listToClosePct: 99,
};

const trend: PriceTrendMonth[] = [
  { month: "2025-12", sales: 90,  avgPrice: 900000, priceChangePct: null }, // first month: null by design
  { month: "2026-01", sales: 110, avgPrice: 925000, priceChangePct: 2.8 },
  { month: "2026-02", sales: 130, avgPrice: 910000, priceChangePct: -1.6 },
];


function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}


// fixed "today" so the month window is deterministic: 7 months ending 2026-03
// -> 2025-09 .. 2026-03, of which only 2025-12 .. 2026-02 have data
const NOW = new Date(2026, 2, 15);


function main() {
  const validSummary = formatMarketSummary("Los Angeles", 7, summary);
  const validTrend = formatPriceTrendMonth("Los Angeles", 7, trend, NOW);

  const invalidSummary = formatMarketSummary("Boston", 7, null);
  const invalidTrend = formatPriceTrendMonth("Boston", 7, null);

  assert(validSummary.includes("Los Angeles - single family homes, last 7 months"), "bad summary header");
  assert(validSummary.includes("1,234 sales"), "soldCount not comma-formatted");
  assert(validSummary.includes("28 days on market"), "avgDom missing");
  assert(validSummary.includes("$985,000 avg"), "avgClosePrice not comma-formatted");
  assert(validSummary.includes("$850,000 median"), "medClosePrice not comma-formatted");
  assert(validSummary.includes("$642/sqft"), "avgPricePerSqft missing");
  assert(validSummary.includes("99% of list"), "listToClosePct missing");
  assert(!validSummary.includes("null"), "null leaked into summary");

  assert(validTrend.includes("Price trend (month • sales • avg price • vs. prior)"), "bad trend header");
  assert(validTrend.split("\n").length === 8, "expected header + 7 rows (every month in the window)");
  assert(validTrend.includes("$900,000"), "avgPrice not comma-formatted");

  // months with no sales get a placeholder row, in order, with the same bullet count
  const trendLines = validTrend.split("\n");
  assert(trendLines[1] === "2025-09 • 0 • no sales recorded • n/a", "first empty month missing its placeholder");
  assert(trendLines[3] === "2025-11 • 0 • no sales recorded • n/a", "gap before the data missing its placeholder");
  assert(trendLines[4].startsWith("2025-12 • 90"), "data rows should sit in month order among the placeholders");
  assert(trendLines[7] === "2026-03 • 0 • no sales recorded • n/a", "current month missing its placeholder");

  // a month outside the window (partial first month at the SQL boundary) is kept, not dropped
  const early: PriceTrendMonth[] = [{ month: "2025-08", sales: 5, avgPrice: 800000, priceChangePct: null }, ...trend];
  const withEarly = formatPriceTrendMonth("Los Angeles", 7, early, NOW);
  assert(withEarly.split("\n").length === 9, "out-of-window month should be added, not dropped");
  assert(withEarly.split("\n")[1].startsWith("2025-08 • 5"), "out-of-window month should sort first");

  // magnitude keeps its own minus, gains get an explicit "+"
  assert(validTrend.includes("+2.8%"), "gain missing +");
  assert(validTrend.includes("-1.6%"), "drop missing -");
  assert(!validTrend.includes("+-1.6%"), "drop got both + and -");
  assert(validTrend.includes("2025-12 • 90 • $900,000 • n/a"), "first month not n/a");
  assert(!validTrend.includes("null"), "null leaked into trend");

  assert(invalidSummary === "No recent sales data for Boston", "bad null summary message");
  assert(invalidTrend === "No trends data for Boston", "bad null trend message");

  console.log("PASS - format functions produce correct market cards");
}


main();
