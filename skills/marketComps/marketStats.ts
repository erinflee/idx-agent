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

export interface PriceTrendMonth {
  month: string;
  sales: number;
  avgPrice: number;
}
