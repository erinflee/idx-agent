// Week 9 — orchestrator: one entry point routing queries across the five skills
//
// free-text query in -> classifyIntent() -> route to skill(s) -> formatted reply
// mixed intent fans out to two skills in parallel and merges their replies
//
// composes the existing agents (propertySearch, marketComps, semanticSearch,
// recommendations, rag) — adds routing only, no new capability

import { propertySearchSkill } from "../propertySearch/index";
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

