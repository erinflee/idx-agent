"""Week 9 — router benchmark: score any query->intent router against the answer key

A router is any callable: query (str) -> intent (str, one of rulebook.INTENTS).
Rule-based, trained-classifier, and LLM candidates all wrap to this contract, so
one harness compares them: overall accuracy, per-intent breakdown, misroutes,
and mean latency. Tune on answers.jsonl; heldout.jsonl is scored once per
candidate and never tuned against.

Run:  python -m evals.router_benchmark   (offline; LLM candidate needs GOOGLE_API_KEY)
"""

import sys
import time
from pathlib import Path
from .router_rules import classify as classify_intent
from .router_model import classify as classify_model
from .router_llm import classify as classify_llm
from .load_answers import load_cases
from sklearn.metrics import classification_report, confusion_matrix

HELDOUT = Path(__file__).parent / "heldout_intents.jsonl"

def score_router(router, cases):
  correct = 0
  misroutes = []
  latencies = []
  y_true = []
  y_pred = []
  per_intent = {} # [correct, total]

  for c in cases:
    if c.intent not in per_intent:
      per_intent[c.intent] = [0,0]
  
    start = time.perf_counter()
    output = router(c.query)
    latencies.append(time.perf_counter() - start)
    y_true.append(c.intent)
    y_pred.append(output)

    if output == c.intent:
      per_intent[c.intent][0] += 1 
      correct += 1
    else:
      misroutes.append((c.query, c.intent, output))
    per_intent[c.intent][1] += 1

  return {
    "accuracy": correct / len(cases), 
    "per_intent": per_intent, 
    "misroutes": misroutes, 
    "mean_latency_s": sum(latencies) / len(latencies),
    "y_true": y_true,
    "y_pred": y_pred
  }


def always_search(query):
  return "search"


def main():
  cases = load_cases(HELDOUT) if "--heldout" in sys.argv else load_cases()
  baseline = score_router(always_search, cases)
  keyword = score_router(classify_intent, cases)
  model = score_router(classify_model, cases)
  llm = score_router(classify_llm, cases)
  print(f"baseline: {baseline}")
  print(f"keyword: {keyword}")
  print(f"model: {model}")
  print(f"llm: {llm}")

  for label, r in [("keyword", keyword), ("model", model), ("llm", llm)]:
    print(f"\n{label}")
    print(classification_report(r["y_true"], r["y_pred"], zero_division=0))
    print(confusion_matrix(r["y_true"], r["y_pred"], labels=sorted(set(r["y_true"]) | set(r["y_pred"]))))


if __name__ == "__main__":
  main()