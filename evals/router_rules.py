"""Benchmark candidate 1 — Python port of the production keyword router

Mirrors classifyIntent() in skills/orchestrator/orchestrator.ts: same word
lists, same mixed -> recommend -> knowledge -> search -> market -> unknown
ladder. Kept in lockstep by hand — edit both together; the parity check below
asserts the port matches the TS ladder's expected routes on the shared test
queries, so the benchmark grades the router we actually ship.

Contract: classify(query: str) -> intent str, per router_benchmark.
"""

SEARCH = ["show me", "find", "under", "bed", "bath", "sqft", "sq ft", "pool", "view", "single family", "townhouse", "hoa"]
MARKET = ["avg", "average", "price", "market", "trend", "deal", "rate", "ratio", "dropping", "overpriced", "how fast", "good time"]
RECOMMEND = ["similar", "more like", "like this", "like that", "like the last", "compare", "recommend", "cheaper than"]
KNOWLEDGE = ["what does", "explain", "mean", "difference", "define", "columns", "what is"]


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
