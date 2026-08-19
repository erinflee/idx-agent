"""Benchmark candidate 1 — Python port of the production keyword router

Mirrors classifyIntent() in skills/orchestrator/orchestrator.ts: same word
lists, same mixed -> recommend -> knowledge -> search -> market -> unknown
ladder. Kept in lockstep by hand — edit both together; the parity check below
asserts the port matches the TS ladder's expected routes on the shared test
queries, so the benchmark grades the router we actually ship.

Contract: classify(query: str) -> intent str, per router_benchmark.
"""

SEARCH = ["show me", "find", "under", "bed", "bath", "sqft", "sq ft", "pool", "view", "single family", "townhouse", "hoa"]
MARKET = ["avg", "average", "price", "market", "trend", "deal", "rate", "ratio", "dropping", "overpriced", "how fast", "good time", "how much", "going for", "should i buy", "above asking", "which is cheaper", "comps"]
RECOMMEND = ["similar", "more like", "like this", "like that", "like the last", "compare", "recommend", "cheaper than"]
KNOWLEDGE = ["what does", "explain", "mean", "difference", "define", "columns", "what is", "wut is", "whats a", "escrow",]


def classify(query):
  q = query.lower()
  has_search = any(word in q for word in SEARCH)
  has_market = any(word in q for word in MARKET)
  has_recommend = any(word in q for word in RECOMMEND)
  has_knowledge = any(word in q for word in KNOWLEDGE)

  if has_search and has_market: return "mixed" 
  if has_recommend: return "recommend" 
  if has_knowledge: return "knowledge" 
  if has_search: return "search" 
  if has_market: return "market" 
  return "unknown"


def main():
  search_intent = classify("find a 3b2b sfr with a pool in cupertino")
  market_intent = classify("market trends in palo alto")
  recommend_intent = classify("show me similar listings")
  knowledge_intent = classify("what is price per square foot?")
  mixed_intent1 = classify("find homes in san francisco and tell me if prices are rising")
  mixed_intent2 = classify("whats the going rate per sqft in oakland")
  unknown_intent = classify("i am sad")

  assert search_intent == "search"
  assert market_intent == "market"
  assert recommend_intent == "recommend"
  assert knowledge_intent == "knowledge"
  assert mixed_intent1 == "mixed"
  assert mixed_intent2 == "mixed"
  assert unknown_intent == "unknown"


if __name__ == "__main__":
  main()
