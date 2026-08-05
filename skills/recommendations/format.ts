// Week 7 — turn Recommendation results into readable listing cards
//
// each rec carries a hybrid score plus a comp check that can be null (no recent
// sales matched), so pricing context is shown by degree — not every card gets it

import type { Recommendation } from "./recommend";


export function formatRecommendations(hits: Recommendation[] | null): string {
	if (!hits || hits.length === 0) return "No similar listings available";

	const rows = hits.map(h => { 
		return `${h.score} • ${h.address}, ${h.city} • $${h.comp.price?.toLocaleString()} • ${h.beds} bd / ${h.baths} ba
	comps: $${h.comp.compPrice.toLocaleString()} from ${h.comp.compCount} recent sales • ${h.comp?.deltaPercentage}% 
	${h.description}`;
	});

	return rows.join("\n\n");
}