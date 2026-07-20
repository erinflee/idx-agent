// Week 5 — turn MarketSummary results into readable property cards
//
// DB layer returns raw rows -> agent uses this step before sending results back to the user

import type { MarketSummary, PriceTrendMonth } from "./marketStats";


export function formatMarketSummary(city: string, months: number, summary: MarketSummary | null): string {
  if (summary === null) return `No recent sales data for ${city}`;

  return `${city} - single family homes, last ${months} months
${summary.soldCount.toLocaleString()} sales • ${summary.avgDom} days on market • $${summary.avgClosePrice.toLocaleString()} avg • $${summary.avgPricePerSqft}/sqft • ${summary.listToClosePct}% of list`
}

export function formatPriceTrendMonth(city: string, months: number, trend: PriceTrendMonth | null): string {
  if (trend === null) return `No trends data for ${city}`;
  return `${trend.month} • ${trend.sales} sales • $${trend.avgPrice.toLocaleString()} avg • ${trend.priceChangePct}% change`
}

