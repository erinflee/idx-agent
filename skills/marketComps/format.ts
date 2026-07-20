// Week 5 — turn MarketSummary results into readable property cards
//
// DB layer returns raw rows -> agent uses this step before sending results back to the user

import type { MarketSummary, PriceTrendMonth } from "./marketStats";
import { getMarketSummary, getPriceTrendMonth } from "./marketStats";


export function formatMarketSummary(city: string, months: number, summary: MarketSummary | null): string {
  if (summary === null) return `No recent sales data for ${city}`;

  return `${city} - single family homes, last ${months} months
${summary.soldCount.toLocaleString()} sales • ${summary.avgDom} days on market • $${summary.avgClosePrice.toLocaleString()} avg • $${summary.avgPricePerSqft}/sqft • ${summary.listToClosePct}% of list`
}

export function formatPriceTrendMonth(city: string, months: number, trend: PriceTrendMonth[] | null): string {
  if (trend === null) return `No trends data for ${city}`;

  const rows = trend.map(t => {
    const pctChange = (t.priceChangePct === null) ? "-" : `${t.priceChangePct.toFixed(1)}%`;
    return `${t.month} • ${t.sales} sales • $${t.avgPrice.toLocaleString()} avg • ${pctChange} change`
  });
 
  return `${city} - single family homes, last ${months} months\n` + rows.join("\n");
}

export async function marketStatsAgent(city: string): Promise<string> {
  const summary = await getMarketSummary(city);
  const trend = await getPriceTrendMonth(city);
  return formatMarketSummary(city, 12, summary?.[0] ?? null) + "\n\n" + formatPriceTrendMonth(city, 12, trend);
}