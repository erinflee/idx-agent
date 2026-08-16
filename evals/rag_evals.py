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

CASES = Path(__file__).parent / "rag_cases.jsonl"


def load_rag_cases():
  cases = []
  with open(CASES, "r", encoding="utf-8") as file:
    for line in file:
      line = line.strip()
      if line.startswith("#"):
        continue
      cases.append(json.loads(line))

  return cases