"""Week 8 — RAG eval: retrieval quality, refusal accuracy, and groundedness

Only 2 of the 9 must-refuse cases in rag_cases.jsonl score below MIN_SCORE;
refusing the other 7 rests on the system prompt. The deterministic metrics
(recall@k, context precision, refusal accuracy) are free and offline; the
LLM-judged groundedness check measures the prompt-level guard — ~37 flash
calls per run, so pace for the free tier (sleep between calls, retry on 429).

Run:  python -m evals.rag_evals   (needs the rag index built; no DB)
"""

import json
from pathlib import Path
from rag import retrieve, rag_answer

CASES = Path(__file__).parent / "rag_cases.jsonl"


def load_rag_cases():
  cases = []
  with open(CASES, "r", encoding="utf-8") as file:
    for line in file:
      line = line.strip()
      if not line or line.startswith("#"):
        continue
      cases.append(json.loads(line))

  return cases


def score_retrieval(case, k=4):
  query = case["query"]
  source = case["source"]  
  predictions = retrieve(query, k)
  p_sources = [p["source"] for p in predictions]
  top_score = predictions[0]["score"]
  if source is None:
    return {"top_score": top_score}
  
  return {"top_score": top_score, "recall": source in p_sources, "precision": p_sources.count(source)/k}


def run_rag_eval():
  cases = load_rag_cases()
  rk_cases = []
  for case in cases:
    result = score_retrieval(case)
    print(case["id"], result)
    if "recall" in result.keys():
      rk_cases.append(result)

  recall_rate = sum(r["recall"] for r in rk_cases) / len(rk_cases)
  mean_precision = sum(r["precision"] for r in rk_cases) / len(rk_cases)
  print("recall rate:", recall_rate)
  print("mean precision:", mean_precision)
  