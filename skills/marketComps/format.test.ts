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


function main() {
  const validSummary = formatMarketSummary("Los Angeles", 7, summary);
  const validTrend = formatPriceTrendMonth("Los Angeles", 7, trend);

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
  assert(validTrend.split("\n").length === 4, "expected header + 3 rows");
  assert(validTrend.includes("$900,000"), "avgPrice not comma-formatted");

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



