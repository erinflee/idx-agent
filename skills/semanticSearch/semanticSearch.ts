// Week 6 — semantic property search over listing embeddings
//
// free-text description in -> top 5 similar listings out -> agents can answer
// "charming craftsman with mountain views" where search.ts filters find nothing
//
// thin HTTP wrapper over semantic.py (same shape as marketStats.ts)


const BASE = "http://127.0.0.1:8000"


export interface SemanticHits {
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

export async function semanticSearchAgent(query: string): Promise<SemanticHits[]> {
  const response = await fetch(`${BASE}/search/semantic/?query=${encodeURIComponent(query)}`);
  const hits: SemanticHits[] = response.json()
  return formatSemanticHits(query, hits);}

