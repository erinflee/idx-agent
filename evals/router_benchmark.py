"""Week 9 — router benchmark: score any query->intent router against the answer key

A router is any callable: query (str) -> intent (str, one of rulebook.INTENTS).
Rule-based, trained-classifier, and LLM candidates all wrap to this contract, so
one harness compares them: overall accuracy, per-intent breakdown, misroutes,
and mean latency. Tune on answers.jsonl; heldout.jsonl is scored once per
candidate and never tuned against.

Run:  python -m evals.router_benchmark   (offline; LLM candidate needs GOOGLE_API_KEY)
"""

from .load_answers import load_cases
from .rulebook import INTENTS


def score_router(router, cases):
  correct = 0
  for c in cases:
    output = router(c.query)
    if output == c.intent:
      correct += 1

  return {"accuracy": correct / len(cases)}

