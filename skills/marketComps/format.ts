// Week 5 — turn MarketSummary results into readable property cards
//
// DB layer returns raw rows -> agent uses this step before sending results back to the user

import type { MarketSummary } from "./stats";


export function formatMarketSummary(city: string, summary: MarketSummary): string {
  return `soldCount: ${summary.soldCount} • avgDom: ${summary.avgDom} • avgClosePrice: ${summary.avgClosePrice} • avgPricePerSqft: ${summary.avgPricePerSqft} • listToClosePct: ${summary.listToClosePct}`
}
