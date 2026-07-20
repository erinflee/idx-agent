// Week 5 — market statistics over california_sold
//
// given a city, return aggregate market stats (not raw rows like comps.ts) ->
// agents can answer "what's the market like in Pasadena?" with real numbers


const BASE = "http://127.0.0.1:8000";

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
  priceChangePct: number | null;
}

export async function getMarketSummary(city: string): Promise<MarketSummary[] | null> {
  const response = await fetch(`${BASE}/market/summary?city=${encodeURIComponent(city)}`);
  return response.json();
}



