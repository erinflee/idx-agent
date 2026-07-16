// Week 5 — market statistics over california_sold
//
// given a city, return aggregate market stats (not raw rows like comps.ts) ->
// agents can answer "what's the market like in Pasadena?" with real numbers

import { query } from "../shared/db";

// one row of aggregate stats for a single city
export interface MarketSummary {
  soldCount: number;
  avgDom: number;
  avgClosePrice: number;
  avgPricePerSqft: number;
  listToClosePct: number;
}

export async function getMarketSummary(city: string, months = 12): Promise<MarketSummary | null> {
  const sql = `
    SELECT 
      COUNT(*) as soldCount,
      ROUND(AVG(DaysOnMarket), 1) as avgDom,
      ROUND(AVG(ClosePrice), 0) as avgClosePrice,
      ROUND(AVG(ClosePrice / NULLIF(LivingArea, 0))) as avgPricePerSqft,
      ROUND(AVG(ClosePrice / NULLIF(ListPrice, 0)), 1) as listToClosePct,

    FROM california_sold

    WHERE City = ?
      AND PropertySubType = 'SingleFamilyResidence
      AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      AND CloseDate <= CURDATE()
      AND LivingArea > 0
  `;

  return await query<MarketSummary>(sql, [city, months]);
}