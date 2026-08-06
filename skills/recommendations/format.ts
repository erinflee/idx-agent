// Week 7 — turn Recommendation results into readable listing cards
//
// each rec carries a hybrid score plus a comp check that can be null (no recent
// sales matched), so pricing context is shown by degree — not every card gets it

import type { Recommendation, CompCheck } from "./recommend";


function preview(description: string | null, maxChar: number = 90): string {
	if (!description) return "";
	const d = description.replace(/\s+/g, " ").trim();

	if (d.length <= maxChar) return d;
	return d.slice(0, maxChar) + "...";
}


function compLine(comp: CompCheck | null): string {
	if (!comp) return "";
	const c = `comps: $${comp.compPrice.toLocaleString()} from ${comp.compCount} recent sales`;
	
	const digit = Math.abs(comp.deltaPercentage);
	const suffix = (comp.deltaPercentage >= 0) ? "above" : "below";
	return c + ` • ${Math.abs(comp.deltaPercentage)}% ${suffix}`;
}


export function formatRecommendations(listing_id: string, hits: Recommendation[] | null): string {
	if (!hits || hits.length === 0) return "No similar listings available";

	const rows = hits.map(h => { 
		return [
			`match: ${h.score.toFixed(1)} • ${h.address ?? "Address not available"}, ${h.city ?? "N/A"} • $${h.price?.toLocaleString() ?? "N/A"} • ${h.beds ?? "N/A"} bd / ${h.baths ?? "N/A"} ba • ${h.sqft?.toLocaleString() ?? "N/A"} sqft`,
			compLine(h.comp),
			preview(h.description),
		].filter(Boolean).join("\n");
	});

	return `Listings similar to ${listing_id}\n\n` + rows.join("\n\n");
}