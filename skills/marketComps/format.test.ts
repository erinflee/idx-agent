// feed sample data to the formatters to output cards

// run:  npx tsx skills/marketComps/format.check.ts   
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

console.log("=== summary ===");
console.log(formatMarketSummary("Los Angeles", 7, summary));
console.log(formatMarketSummary("Boston", 7, null)); // null path

console.log("\n=== trend ===");
console.log(formatPriceTrendMonth("Los Angeles", 7, trend)); // one call, whole array
console.log(formatPriceTrendMonth("Boston", 7, null)); // null path
