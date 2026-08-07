// Week 6 — turn semantic hits into readable listing cards
//
// show the similarity score: unlike a SQL filter every result is a match by
// degree, so the user needs to see how close each one actually is

import type { SemanticHit } from "./semanticSearch";


function preview(description: string | null, max = 90): string {

    if (!description) return "";
    const d = description.replace(/\s+/g, " ").trim();

    if (d.length <= max) return d;
    return d.slice(0,max) + "...";
}


export function formatSemanticHits(query: string, hits: SemanticHit[] | null): string {
    if (!hits || hits.length === 0) return `No similar listings found for ${query}`;

    const rows = hits.map(h => {
        return `${h.score.toFixed(3)} • ${h.address ?? "N/A"}, ${h.city ?? "N/A"} • $${h.price?.toLocaleString() ?? "N/A"} • ${h.beds ?? "N/A"} bd / ${h.baths ?? "N/A"} ba • ${h.sqft ?? "N/A"} sqft • id: ${h.id}
${preview(h.description)}`;
    });

  return `Matches for "${query}"\n\n` + rows.join("\n\n");
}
