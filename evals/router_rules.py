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

