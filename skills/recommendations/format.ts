// Week 7 — turn Recommendation results into readable listing cards
//
// each rec carries a hybrid score plus a comp check that can be null (no recent
// sales matched), so pricing context is shown by degree — not every card gets it

import type { Recommendation } from "./recommend";


export function formatRecommendations(hits: Recommendation[] | null): string {
	if (!hits || hits.length === 0) return "No similar listings available";

	const rows = hits.map(h => { 
		return `${h.score.toFixed(1)} • ${h.address ?? "Address not available"}, ${h.city ?? "N/A"} • $${h.comp.price?.toLocaleString() ?? "N/A"} • ${h.beds ?? "N/A"} bd / ${h.baths ?? "N/A"} ba
	comps: $${h.comp.compPrice?.toLocaleString() ?? "N/A"} from ${h.comp.compCount ?? "N/A"} recent sales • ${h.comp?.deltaPercentage ?? "N/A"}% 
	${h.description}`;
	});

	return rows.join("\n\n");
}