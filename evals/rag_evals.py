"""Week 8 — RAG eval: retrieval quality, refusal accuracy, and groundedness

Only 2 of the 9 must-refuse cases in rag_cases.jsonl score below MIN_SCORE;
refusing the other 7 rests on the system prompt. The deterministic metrics
(recall@k, context precision, refusal accuracy) are free and offline; the
LLM-judged groundedness check measures the prompt-level guard — ~37 flash
calls per run, so pace for the free tier (sleep between calls, retry on 429).

Run:  python -m evals.rag_evals   (needs the rag index built; no DB)
"""

import sys
import json
from pathlib import Path
from rag import retrieve, rag_answer, CLIENT, MODEL

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


def check_answerability(case, answer):
  refused = answer == "That isn't covered in my source documents."
  correct = refused == (not case["answerable"])
  return {
    "refused": refused,
    "correct": correct
  }


def judge_relevance(query, hits):
  PROMPT = """You are auditing a retrieval system. Given a user query 
  and 4 numbered excerpts, decide which excerpts contain information 
  that helps answer the query. Reply with JSON only, no other text: 
  {"relevant": [list of excerpt numbers, possibly empty]}
  """
  chunks = "\n\n".join(f"[{index}] {h['chunk']}" for index, h in enumerate(hits, 1))

  response = CLIENT.chat.completions.create(
    model=MODEL,
    messages=[
      {"role": "system", "content": PROMPT},
      {"role": "user", "content": f"Query: {query}\n\nExcerpts:\n{chunks}"}
  ])

  text = (response.choices[0].message.content or "").strip()
  text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

  try:
    parsed = json.loads(text)["relevant"]

  except (json.JSONDecodeError, KeyError, TypeError):
    return None
  return len(parsed) / len(hits)


def judge_groundedness(query, answer, hits):
  PROMPT = """Is every claim in the answer supported by the excerpts?
  Outside knowledge or advice is not grounded even if true. JSON only:
  {"grounded": true|false, "reason": "<one sentence>"}
  """

  chunks = "\n\n".join(f"[{index}] {h["chunk"]}" for index, h in enumerate(hits, 1))

  response = CLIENT.chat.completions.create(
    model=MODEL,
    messages=[
      {"role": "system", "content": PROMPT},
      {"role": "user", "content": f"Query: {query}\n\nExcerpts:\n{chunks}\n\nAnswer: {answer}"}
    ]
  )

  text = (response.choices[0].message.content or "").strip()
  text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

  try:
    parsed = json.loads(text)

  except (json.JSONDecodeError, KeyError, TypeError):
    return {"grounded": None}
  return parsed
  

def run_rag_eval():
  judge = "--judge" in sys.argv
  cases = load_rag_cases()
  rk_cases = []
  answerability = []
  relevances = []
  groundedness = []

  for case in cases:
    result = score_retrieval(case)
    print(case["id"], result)
    if "recall" in result.keys():
      rk_cases.append(result)

    if judge:
      answer = rag_answer(case["query"])
      ans = check_answerability(case, answer)
      answerability.append((case, ans))
      print("  ", "refused" if ans["refused"] else "answered", "correct:", ans["correct"])
      if case["answerable"] and not ans["refused"]:
        hits = retrieve(case["query"], 4)
        relevances.append(judge_relevance(case["query"], hits))
        groundedness.append(judge_groundedness(case["query"], answer, hits)["grounded"])


  recall_rate = sum(r["recall"] for r in rk_cases) / len(rk_cases)
  mean_precision = sum(r["precision"] for r in rk_cases) / len(rk_cases)
  print("recall rate:", recall_rate)
  print("mean precision:", mean_precision)

  if judge:
    acc = sum(a["correct"] for _, a in answerability) / len(answerability)
    rx = [a for c, a in answerability if not c["answerable"]]
    rx_acc = sum(a["correct"] for a in rx) / len(rx)
    judged = [r for r in relevances if r is not None]
    grounded_known = [g for g in groundedness if g is not None]
    print("answerability accuracy:", acc)
    print("refusal accuracy (rx slice):", rx_acc)
    print("mean judged relevance:", sum(judged) / len(judged))
    print("groundedness rate:", sum(1 for g in grounded_known if g) / len(grounded_known),
          f"({len(groundedness) - len(grounded_known)} judge failures)")


if __name__ == "__main__":
  run_rag_eval()
