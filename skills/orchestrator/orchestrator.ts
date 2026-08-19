// Week 9 — orchestrator: one entry point routing queries across the five skills
//
// free-text query in -> classifyIntent() -> route to skill(s) -> formatted reply
// mixed intent fans out to two skills in parallel and merges their replies
//
// composes the existing agents (propertySearch, marketComps, semanticSearch,
// recommendations, rag) — adds routing only, no new capability

import { propertySearchSkill } from "../propertySearch/index";
import { parsePropertyQuery } from "../propertySearch/parse";
import { formatListing } from "../propertySearch/format";
import { marketStatsAgent } from "../marketComps/marketStats";
import { ragAgent } from "../rag/rag";
import { recommendAgent } from "../recommendations/recommend";

type Intent = "search" | "market" | "recommend" | "knowledge" | "mixed" | "unknown";
const SEARCH = ["show me", "find", "under", "bed", "bath", "sqft", "sq ft", "pool", "view", "single family", "townhouse", "hoa"];
const MARKET = ["avg", "average", "price", "market", "trend", "deal", "rate", "ratio", "dropping", "overpriced", "how fast", "good time"];
const RECOMMEND = ["similar", "more like", "like this", "like that", "like the last", "compare", "recommend", "cheaper than"];
const KNOWLEDGE = ["what does", "explain", "mean", "difference", "define", "columns", "what is"];


export function classifyIntent(query: string): Intent {
  const q = query.toLowerCase();
  const hasSearch = SEARCH.some((w) => q.includes(w));
  const hasMarket = MARKET.some((w) => q.includes(w));
  const hasRecommend = RECOMMEND.some((w) => q.includes(w));
  const hasKnowledge = KNOWLEDGE.some((w) => q.includes(w));

  if (hasSearch && hasMarket) return "mixed";
  if (hasRecommend) return "recommend";
  if (hasKnowledge) return "knowledge";
  if (hasSearch) return "search";
  if (hasMarket) return "market";
  return "unknown";
}


export async function orchestrate(query: string): Promise<string> {
  const intent = classifyIntent(query);
  const filter = parsePropertyQuery(query);

  try {
    switch (intent) {
      case "search":
        return await propertySearchSkill(query);

      case "market":
        if (!filter.city) return "Which city are you asking about?"; 
        return await marketStatsAgent(filter.city);

      case "recommend":
        try {
          const listing_id = query.match(/(\d{5,})/);
          if (!listing_id) return "Tell me which listing id";
          return await recommendAgent(listing_id[1]);
        } catch (err) {
          console.error(err);
          return "I couldn't find a listing with that id";
        }

      case "knowledge":
        return await ragAgent(query);

      case "mixed":
        if (!filter.city) return propertySearchSkill(query);
        const [listings, stats] = await Promise.all([
          propertySearchSkill(query),
          marketStatsAgent(filter.city)
        ]);
        return listings + "\n\n" + stats; // "".join("\n\n") is python

      default:
        return "I'm not sure how to help with that. Try asking about properties or market trends.";
    }
  } catch (err) {
    console.error(err);
    return "Something went wrong, try again.";
  }
}