"""Benchmark candidate 1 — Python port of the production keyword router

Mirrors classifyIntent() in skills/orchestrator/orchestrator.ts: same word
lists, same mixed -> recommend -> knowledge -> market -> search -> unknown
ladder. Kept in lockstep by hand — edit both together; the parity check below
asserts the port matches the TS ladder's expected routes on the shared test
queries, so the benchmark grades the router we actually ship.

Search signals come in two strengths. STRONG words are search verbs ("find",
"show me", "under") — on their own they make a query a search, and paired with
a market word they make it mixed. WEAK words are property nouns and attributes
("condo", "3 bed") — they appear inside plain market questions too ("avg condo
price in X"), so they only count toward mixed when a conjunction joins two asks.

Contract: classify(query: str) -> intent str, per router_benchmark.
"""

SEARCH_STRONG = ["show me", "find", "listing", "for sale", "looking for", "got any", "anything", "somewhere", "under", "below", "near", "<", "$"]
SEARCH_WEAK = ["bed", "bath", "sqft", "sq ft", "pool", "view", "single family", "townhouse", "hoa",
               "home", "house", "condo", "apartment", "townhome", "property", "properties", "sfr", "bd", "ba "]
CONJUNCTIONS = [" and ", " plus ", " also ", " & "]
MARKET = ["avg", "average", "price", "market", "trend", "deal", "rate", "ratio", "dropping", "overpriced", "how fast", "good time", "how much", "going for", "should i buy", "above asking", "which is cheaper", "comps",
          "per sqft", "per sq ft", "per square foot", "cost", "how long", "over asking", "time to sell", "time to buy", "sit "]
RECOMMEND = ["similar", "more like", "like this", "like that", "like the last", "compare", "recommend", "cheaper than",
             "comparable", "like the one", "recs", "next best", "same thing", "anything else", "other options", "suggest", "like listing", "comps to", "more of"]
KNOWLEDGE = ["what does", "explain", "mean", "difference", "define", "columns", "what is", "wut is", "whats a", "escrow",
             "how is", "calculated", "what fields", "table", "same as"]


def contains_any(text, words):
  for word in words:
    if word in text:
      return True
  return False


def keyword_features(query):
  q = query.lower()
  strong_search = contains_any(q, SEARCH_STRONG)
  weak_search = contains_any(q, SEARCH_WEAK)
  conjunction = contains_any(q, CONJUNCTIONS)
  has_market = contains_any(q, MARKET)
  has_recommend = contains_any(q, RECOMMEND)
  has_knowledge = contains_any(q, KNOWLEDGE)

  has_search = strong_search or weak_search
  has_mixed = has_market and (strong_search or (weak_search and conjunction))
  return [int(has_search), int(has_market), int(has_recommend), int(has_knowledge), int(has_mixed)]


def classify(query):
  has_search, has_market, has_recommend, has_knowledge, has_mixed = keyword_features(query)

  if has_mixed: return "mixed"
  if has_recommend: return "recommend"
  if has_knowledge: return "knowledge"
  if has_market: return "market"
  if has_search: return "search"
  return "unknown"


def main():
  search_intent = classify("find a 3b2b sfr with a pool in cupertino")
  market_intent = classify("market trends in palo alto")
  market_intent = classify("should i buy in irvine right now?")
  recommend_intent = classify("show me similar listings")
  knowledge_intent = classify("what is price per square foot?")
  mixed_intent1 = classify("find homes in san francisco and tell me if prices are rising")
  mixed_intent2 = classify("condos in oakland and whats the going rate per sqft")
  weak_market_intent = classify("whats the going rate per sqft in oakland")   # attribute inside a market ask, no conjunction
  unknown_intent = classify("i am sad")

  assert search_intent == "search"
  assert market_intent == "market"
  assert recommend_intent == "recommend"
  assert knowledge_intent == "knowledge"
  assert mixed_intent1 == "mixed"
  assert mixed_intent2 == "mixed"
  assert weak_market_intent == "market"
  assert unknown_intent == "unknown"


if __name__ == "__main__":
  main()
