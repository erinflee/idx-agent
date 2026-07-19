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
      COUNT(*) AS soldCount,
      ROUND( AVG( CAST(DaysOnMarket AS DOUBLE) ), 1) AS avgDom,
      ROUND( AVG(ClosePrice), 0) AS avgClosePrice,
      ROUND( AVG(ClosePrice / NULLIF(LivingArea, 0) ) ) AS avgPricePerSqft,
      ROUND( AVG(ClosePrice / NULLIF(ListPrice, 0) ) * 100, 1) AS listToClosePct

    FROM california_sold

    WHERE City = ?
      AND PropertySubType = 'SingleFamilyResidence'
      AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      AND CloseDate <= CURDATE()
      AND LivingArea > 0
  `;

  const rows = await query<MarketSummary>(sql, [city, months]);
  if (rows.length === 0 || rows[0].soldCount === 0) return null;
  return rows[0];
}



export interface PriceTrendMonth {
  month: string;
  sales: number;
  avgPrice: number;
}

export async function getPriceTrendMonth(city: string, month = 12): Promise<PriceTrendMonth[]> {

  const sql = `
    SELECT
      DATE_FORMAT( CloseDate, '%Y-%m' ) AS month,
      COUNT(*) AS sales,
      ROUND( AVG(ClosePrice), 0) AS avgPrice

    FROM california_sold

    WHERE City = ?
    AND PropertySubType = "SingleFamilyResidence"
    AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    AND CloseDate <= CURDATE()
    AND LivingArea > 0

    ORDER BY ASC month
    GROUP BY month
  `;

  const rows = await query<PriceTrendMonth>(sql, [city, month]);
  return rows;
}