// Week 6 — turn semantic hits into readable listing cards
//
// show the similarity score: unlike a SQL filter every result is a match by
// degree, so the user needs to see how close each one actually is


import { SemanticHits } from "./semanticSearch"


export function formatSemanticHits(query: string, hits: SemanticHits[] | null): string {

    if (hits == null) return `No similar listings found for ${query}`;

    const rows = hits.map(h => {
        return `${h.score} • ${h.address}, ${h.city} • $${h.price.toLocaleString()} • ${h.beds} bd / ${h.baths} ba • ${h.sqft} sqft
        ${h.description}`;
    });

    return `Matches for "${query}"\n` + rows.join("\n");
}
