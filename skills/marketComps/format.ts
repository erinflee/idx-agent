// Week 5 — turn MarketSummary results into readable property cards
//
// DB layer returns raw rows -> agent uses this step before sending results back to the user

import type { MarketSummary, PriceTrendMonth } from "./marketStats";


export function formatMarketSummary(city: string, months: number, summary: MarketSummary | null): string {
  if (summary === null) return `No recent sales data for ${city}`;

  return `${city} - single family homes, last ${months} months
${summary.soldCount.toLocaleString()} sales • ${summary.avgDom} days on market • $${summary.avgClosePrice.toLocaleString()} avg • $${summary.medClosePrice.toLocaleString()} median • $${summary.avgPricePerSqft}/sqft • ${summary.listToClosePct}% of list`
}

// "YYYY-MM" keys for the n calendar months ending at `now`, oldest first
function lastMonths(n: number, now: Date): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);   // negative months roll back a year on their own
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    keys.push(`${d.getFullYear()}-${mm}`);
  }
  return keys;
}

// the service only returns months that had sales, so every month in the window
// is listed here and the gaps get a placeholder row — the coverage is visible
// instead of hidden. `now` is injectable so the test is deterministic.
export function formatPriceTrendMonth(city: string, months: number, trend: PriceTrendMonth[] | null, now: Date = new Date()): string {
  if (trend === null) return `No trends data for ${city}`;

  const keys = lastMonths(months, now);
  const byMonth: Record<string, PriceTrendMonth> = {};
  for (const t of trend) {
    byMonth[t.month] = t;
    if (!keys.includes(t.month)) keys.push(t.month);   // partial boundary month: keep, don't drop
  }
  keys.sort();

  const rows: string[] = [];
  for (const key of keys) {
    const t = byMonth[key];
    if (t === undefined) {
      rows.push(`${key} • 0 • no sales recorded • n/a`);
      continue;
    }
    const pctChange = (t.priceChangePct === null) ? "n/a" : (`${t.priceChangePct >= 0 ? "+" : ""}${t.priceChangePct.toFixed(1)}%`);
    rows.push(`${t.month} • ${t.sales} • $${t.avgPrice.toLocaleString()} • ${pctChange}`);
  }

  return `Price trend (month • sales • avg price • vs. prior)\n` + rows.join("\n");
}
