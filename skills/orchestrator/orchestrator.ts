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
const SEARCH_STRONG = ["show me", "find", "listing", "for sale", "looking for", "got any", "anything", "somewhere", "under", "below", "near", "<", "$"];
const SEARCH_WEAK = ["bed", "bath", "sqft", "sq ft", "pool", "view", "single family", "townhouse", "hoa",
                     "home", "house", "condo", "apartment", "townhome", "property", "properties", "sfr", "bd", "ba "];
const CONJUNCTIONS = [" and ", " plus ", " also ", " & "];
const MARKET = ["avg", "average", "price", "market", "trend", "deal", "rate", "ratio", "dropping", "overpriced", "how fast", "good time", "how much", "going for", "should i buy", "above asking", "which is cheaper", "comps",
                "per sqft", "per sq ft", "per square foot", "cost", "how long", "over asking", "time to sell", "time to buy", "sit "];
const RECOMMEND = ["similar", "more like", "like this", "like that", "like the last", "compare", "recommend", "cheaper than",
                   "comparable", "like the one", "recs", "next best", "same thing", "anything else", "other options", "suggest", "like listing", "comps to", "more of"];
const KNOWLEDGE = ["what does", "explain", "mean", "difference", "define", "columns", "what is", "wut is", "whats a", "escrow",
                   "how is", "calculated", "what fields", "table", "same as"];

export function classifyIntent(query: string): Intent {
  const q = query.toLowerCase();
  const strongSearch = SEARCH_STRONG.some((w) => q.includes(w));
  const weakSearch = SEARCH_WEAK.some((w) => q.includes(w));
  const conjunction = CONJUNCTIONS.some((w) => q.includes(w));
  const hasMarket = MARKET.some((w) => q.includes(w));
  const hasRecommend = RECOMMEND.some((w) => q.includes(w));
  const hasKnowledge = KNOWLEDGE.some((w) => q.includes(w));

  const hasSearch = strongSearch || weakSearch;
  // weak words (nouns, attributes) show up inside plain market asks, so they only
  // make a query mixed when a conjunction joins two asks
  const hasMixed = hasMarket && (strongSearch || (weakSearch && conjunction));

  if (hasMixed) return "mixed";
  if (hasRecommend) return "recommend";
  if (hasKnowledge) return "knowledge";
  if (hasMarket) return "market";
  if (hasSearch) return "search";
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