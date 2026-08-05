// Week 7 — hybrid recommendations over active listings
//
// listing id in -> top 5 similar rets_property rows out, each stamped with
// california_sold comp validation (comp_price / delta) -> agents can answer
// "more like this" after a search hit
//
// thin HTTP wrapper over recommend.py 


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
    comp: {} | null;
}

export interface CompCheck {
    price: number;
    compPrice: number;
    compCount: number;
    deltaPercentage: number;
}

