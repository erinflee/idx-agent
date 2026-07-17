// Week 5 — turn MarketSummary results into readable property cards
//
// DB layer returns raw rows -> agent uses this step before sending results back to the user

import type { MarketSummary } from "./stats";


export function formatMarketSummary(city: string, summary: MarketSummary): string {
  if (summary === null) return `No recent sale for ${city}`;
  return `${summary.soldCount.toLocaleString()} sales • ${summary.avgDom} days on market • $${summary.avgClosePrice.toLocaleString()} avg • $${summary.avgPricePerSqft}/sqft • ${summary.listToClosePct}% of list`
}
