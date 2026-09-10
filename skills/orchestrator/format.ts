// Week 9 — turn a mixed-intent result (listings + market stats) into one readable reply
//
// the orchestrator is the only place that holds both halves, so the layout that joins
// them lives here rather than in propertySearch/format.ts or marketComps/format.ts

import type { ListingRow } from "../propertySearch/search";
import type { PriceTrendMonth } from "../marketComps/marketStats";
import { formatResults } from "../propertySearch/format";

const DIVIDER = "-----------------------";


// one-line answer to "are prices rising?" from the monthly trend
export function trendVerdict(trend: PriceTrendMonth[] | null): string {
  if (!trend || trend.length < 2) return "Not enough monthly sales to call a trend.";
  const first = trend[0];
  const last = trend[trend.length - 1];
  const pct = (last.avgPrice - first.avgPrice) / first.avgPrice * 100;
  const direction = pct > 2 ? "rising" : pct < -2 ? "falling" : "flat";
  const sign = pct >= 0 ? "+" : "";
  return `Prices are ${direction}: avg sale price $${first.avgPrice.toLocaleString()} (${first.month}) -> $${last.avgPrice.toLocaleString()} (${last.month}), ${sign}${pct.toFixed(1)}%`;
}


// header + numbered cards, divider, verdict line, then the market stats block as printed by marketStatsAgent
export function formatMixed(city: string, maxPrice: number | undefined, rows: ListingRow[], trend: PriceTrendMonth[] | null, stats: string): string {
  const priceNote = maxPrice ? ` under $${maxPrice.toLocaleString()}` : "";
  return `Top ${rows.length} listings in ${city}${priceNote}\n${DIVIDER}\n${formatResults(rows, 0)}\n\n` +
         `${DIVIDER}\n${trendVerdict(trend)}\n\n${stats}`;
}
