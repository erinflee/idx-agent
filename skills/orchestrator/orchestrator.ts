// Week 9 — orchestrator: one entry point routing queries across the five skills
//
// free-text query in -> classifyIntent() -> route to skill(s) -> formatted reply
// mixed intent fans out to two skills in parallel and merges their replies
//
// composes the existing agents (propertySearch, marketComps, semanticSearch,
// recommendations, rag) — adds routing only, no new capability

import { propertySearchSkill } from "../propertySearch/index";
import { parsePropertyQuery } from "../propertySearch/parse";
import { handleTurn } from "../propertySearch/conversation";
import { getSession } from "../propertySearch/session";
import { searchActiveListings } from "../propertySearch/search";
import { marketStatsAgent, getPriceTrendMonth } from "../marketComps/marketStats";
import { formatMixed } from "./format";
import { ragAgent } from "../rag/rag";
import { recommendAgent } from "../recommendations/recommend";
import { semanticSearchAgent } from "../semanticSearch/semanticSearch";

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

// MULTI_TURN words go straight to the session (paginate / reset)
// FOLLOW_UP pointer words reuse the last search's top result, anything else is a description -> semantic search
const MULTI_TURN = /\b(show more|see more|next|start over|restart|new search)\b/i;
const FOLLOW_UP = /\b(last|first|second|third|that one|the one|those|these|recs|like (this|that|it))\b/i;


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


export async function orchestrate(query: string, userId?: string): Promise<string> {
  if (userId && MULTI_TURN.test(query)) {
    return await handleTurn(userId, query);
  }
  // mid-conversation: the last reply was a question, so this message is the answer
  if (userId && getSession(userId).conversationStep === 1) {
    return await handleTurn(userId, query);
  }
  const intent = classifyIntent(query);
  const filter = parsePropertyQuery(query);

  if (userId && intent === "unknown" && getSession(userId).city && Object.keys(filter).length > 0) {
    return await handleTurn(userId, query);
  }
  
  try {
    switch (intent) {
      case "search":
        // on WhatsApp we know the sender -> multi-turn session
        if (userId) return await handleTurn(userId, query);
        return await propertySearchSkill(query);

      case "market":
        if (!filter.city) return "Which city are you asking about?"; 
        return await marketStatsAgent(filter.city);

      case "recommend":
        try {
          // 1. an explicit id in the message wins
          const listing_id = query.match(/(\d{5,})/);
          if (listing_id) return await recommendAgent(listing_id[1]);

          // 2. a follow-up that points back at an earlier result -> first result of the last search
          const last = userId ? getSession(userId).lastResults?.[0] : undefined;
          if (FOLLOW_UP.test(query) && last?.id) return await recommendAgent(String(last.id));
          
          // 3. otherwise the user is describing what they want -> semantic search
          return await semanticSearchAgent(query);
        } catch (err) {
          console.error(err);
          return "I couldn't find a listing with that id";
        }

      case "knowledge":
        return await ragAgent(query);

      case "mixed": {
        if (!filter.city) return propertySearchSkill(query);
        const [rows, stats, trend] = await Promise.all([
          searchActiveListings(filter, 1, 5),
          marketStatsAgent(filter.city),
          getPriceTrendMonth(filter.city)
        ]);
        return formatMixed(filter.city, filter.maxPrice, rows, trend, stats);
      }

      default:
        return "I'm not sure how to help with that. Try asking about properties or market trends.";
    }
  } catch (err) {
    console.error(err);
    return "Something went wrong, try again.";
  }
}