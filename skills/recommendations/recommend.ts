// Week 7 — hybrid recommendations over active listings
//
// listing id in -> top 5 similar rets_property rows out, each stamped with
// california_sold comp validation (comp_price / delta) -> agents can answer
// "more like this" after a search hit
//
// thin HTTP wrapper over recommend.py 

import { formatRecommendations } from "./format";

const BASE = "http://127.0.0.1:8000";


export interface Recommendation {
    id: string;
    address: string | null;
    propertyType: string | null;
    city: string | null;
    beds: number | null;
    baths: number | null;
    sqft: number | null;
    year: number | null;
    price: number | null;
    description: string | null;
    score: number;
    comp: CompCheck | null;
}

export interface CompCheck {
    price: number;
    compPrice: number;
    compCount: number;
    deltaPercentage: number;
}


export async function recommendAgent(listing_id: string): Promise<string> { // async function always returns promise<>
    const response = await fetch(`${BASE}/recommend?listing_id=${encodeURIComponent(listing_id)}&k=5`);
    const hits: Recommendation[] = await response.json();
    return formatRecommendations(listing_id, hits);
}

