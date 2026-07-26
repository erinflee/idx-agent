// Week 6 — semantic property search over listing embeddings
//
// free-text description in -> top 5 similar listings out -> agents can answer
// "charming craftsman with mountain views" where search.ts filters find nothing
//
// thin HTTP wrapper over semantic.py (same shape as marketStats.ts)


const BASE = "http://127.0.0.1:8000"

export async function semanticSearchAgent(query: string) {
  const hits = await fetch(`${BASE}/search/semantic/?query=${encodeURIComponent(query)}`);
  return formatSemanticHits(query, hits);
}

