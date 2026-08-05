// Week 7 — turn Recommendation results into readable listing cards
//
// each rec carries a hybrid score plus a comp check that can be null (no recent
// sales matched), so pricing context is shown by degree — not every card gets it

import type { Recommendation } from "./recommend";

function preview(description: string | null, maxChar: number = 90): string {
	if (!description) return "";
	const d = description.replace(/\s+/g, " ").trim();

	if (d.length <= maxChar) return d;
	return d.slice(0, maxChar) + "...";
}

export function formatRecommendations(hits: Recommendation[] | null): string {
	if (!hits || hits.length === 0) return "No similar listings available";

	const rows = hits.map(h => { 
		const comps: string = h.comp ? `comps: $${h.comp.compPrice?.toLocaleString()} from ${h.comp.compCount} recent sales • ${h.comp?.deltaPercentage}%` : "";

		return [
			`\n${h.score.toFixed(1)} • ${h.address ?? "Address not available"}, ${h.city ?? "N/A"} • $${h.price?.toLocaleString() ?? "N/A"} • ${h.beds ?? "N/A"} bd / ${h.baths ?? "N/A"} ba`,
			comps,
			preview(h.description),
		].filter(Boolean).join("\n");
	});

	return rows.join("\n");
}