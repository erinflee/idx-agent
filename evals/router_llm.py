"""Benchmark candidate 3 — LLM router: Gemini classifies the intent per query

The expensive candidate: one gemini-2.5-flash call per query (reuses rag.py's
CLIENT/MODEL), prompted to reply with a single intent word as strict JSON.
Parse failures and off-vocabulary replies fall back to "unknown" rather than
crashing the benchmark. Expected to win the no-lexical-signal tail the other
candidates can't reach — the benchmark prices that win in latency (~1s/query
vs ~0ms) and per-query cost.

Prompt tuned on answers.jsonl only; heldout stays untouched until the final run.

Contract: classify(query: str) -> intent str, per router_benchmark.
Benchmark runs make ~118 flash calls — pace for the free tier or run on paid.
"""

import json
from rag import CLIENT, MODEL
from .rulebook import INTENTS

PROMPT = """You route real-estate queries to one intent. Reply with JSON only, 
no other text: {"intent": "<one word>"}

Intents:
- search: user wants listings matching constraints ("show me 3bd condos in irvine under 800k")
- market: user wants stats or trends computed from sales data ("avg price in fresno", "should i buy now?")
- recommend: user wants listings similar to one they've seen ("more like the last one")
- knowledge: user asks what a term or field means ("what does DOM mean?")
- mixed: user wants listings AND market stats in one query ("find homes in oroville and are prices rising")
- unknown: none of the above / not about real estate
"""

def classify(query):
  response = CLIENT.chat.completions.create(
    model=MODEL,
    messages = [
      {"role": "system", "content": PROMPT},
      {"role": "user", "content": query}
    ]
  )
  text = (response.choices[0].message.content or "").strip()
  text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

  try:
    intent = json.loads(text)["intent"]

  except (json.JSONDecodeError, KeyError, TypeError):
    return "unknown"
  
  return intent if intent in INTENTS or intent == "unknown" else "unknown"