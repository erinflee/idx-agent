// Week 6 — semantic property search over listing embeddings
//
// free-text description in -> top 5 similar listings out -> agents can answer
// "charming craftsman with mountain views" where search.ts filters find nothing
//
// thin HTTP wrapper over semantic.py (same shape as marketStats.ts)


import { formatSemanticHits } from "./format"

const BASE = "http://127.0.0.1:8000";


export interface SemanticHit {
    id: string;
    score: number;
    address: string | null;
    propertyType: string | null;
    city: string | null;
    beds: number | null;
    baths: number | null;
    sqft: number | null;
    year: number | null;
    price: number | null;
    description: string | null;
}

// raw hits, so the orchestrator can remember what was shown (for "more like the first one")
export async function fetchSemanticHits(query: string): Promise<SemanticHit[]> {
    const response = await fetch(`${BASE}/search/semantic?query=${encodeURIComponent(query)}&k=5`);
    return response.json();
}

export async function semanticSearchAgent(query: string): Promise<string> {
    const hits = await fetchSemanticHits(query);
    return formatSemanticHits(query, hits);
}

