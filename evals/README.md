# Evals — Answer Key, Graders & Benchmarks

The answer key + auto-grader for every agent built in later weeks (Week 1), the
RAG retrieval eval (Week 8), and the router benchmark (Week 9).

## Files

| File                    | What it is                                                                                                                            | Source                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `answers.jsonl`         | **The answer key** — labeled query → correct intent + filters. Tuning/training set for everything.                                    | hand-curated (118 cases)                   |
| `heldout.jsonl`         | Parser held-out set — search queries only; measures parser generalization. Not tuned against.                                         | hand-labeled (30 cases)                    |
| `heldout_intents.jsonl` | Router held-out set — ~11 cases per intent; the benchmark's final exam. Not tuned against.                                            | hand-reviewed labels (55 cases)            |
| `ca_cities.txt`         | Valid CA cities for the validator.                                                                                                    | generated from DB via `generate_cities.py` |
| `rulebook.py`           | `PropertyFilters` + `SchemaValidator` (rejects bad input).                                                                            | hand-written                               |
| `load_answers.py`       | Loads `answers.jsonl` into `EvalCase` objects.                                                                                        | hand-written                               |
| `grader.py`             | The grader: `score_case`, `run_suite`, `task_success_rate`.                                                                           | hand-written                               |
| `rag_cases.jsonl`       | RAG eval cases — query → gold source doc + answerable label (Week 8).                                                                 | hand-curated (23 cases)                    |
| `rag_evals.py`          | RAG retrieval eval: recall@k + context precision (Week 8).                                                                            | hand-written                               |
| `router_benchmark.py`   | The router referee: accuracy, per-intent, misroutes, F1, latency (Week 9).                                                            | hand-written                               |
| `router_rules.py`       | Candidate 1 — Python port of the production keyword router (a sync test asserts both route identically).                              | hand-written                               |
| `router_model.py`       | Candidate 2 — MiniLM embeddings + logistic regression (`router_model.joblib`, untracked; retrain via `python -m evals.router_model`). | hand-written                               |
| `router_llm.py`         | Candidate 3 — gemini-2.5-flash intent prompt.                                                                                         | hand-written                               |
| `../tests/`             | pytest checks for the validator, the dataset, and the grader.                                                                         | hand-written                               |

## How to run

```bash
pip install -r requirements.txt   # installs pytest
pytest                            # from the repo root
```

---

# Week 8 — RAG Retrieval Eval

`python -m evals.rag_evals` — recall@4 and context precision over
`rag_cases.jsonl` (23 labeled cases); offline, no API calls, ~10s.

Latest run: **recall@4 = 1.00, mean context precision = 0.80** (gold source is
document-level, so precision undercounts cross-document overlap — e.g. the
schema reference also describing a Trestle field). Answerability + LLM-judged
groundedness are planned but deferred; note that only 2 of 9 must-refuse cases
score below `MIN_SCORE` — the rest rely on the prompt-level guard, which is
what the LLM-judged half will measure.

---

# Week 9 — Router Benchmark

One harness (`router_benchmark.py`) scores any `query -> intent` callable:
overall accuracy, per-intent tallies, misroutes, confusion matrix + F1, and
mean latency. Candidates were tuned on `answers.jsonl` (118 cases) only;
`heldout_intents.jsonl` (55 cases, ~11 per intent) was scored **once** per
candidate and never tuned against.

```bash
python -m evals.router_model                    # train + save the classifier (one-time)
python -m evals.router_benchmark                # dev run on answers.jsonl
python -m evals.router_benchmark --heldout      # the reported numbers (LLM row costs ~$0.01)
```

## Results (heldout, 2026-08-20 — locked)

| candidate                    | file                  | heldout acc | macro F1 | mean latency | cost/query | verdict                               |
| ---------------------------- | --------------------- | ----------- | -------- | ------------ | ---------- | ------------------------------------- |
| always-search baseline       | `router_benchmark.py` | 0.22        | —        | ~0 ms        | $0         | floor (majority class)                |
| keyword router (prod port)   | `router_rules.py`     | 0.62        | 0.58     | 0.006 ms     | $0         | **ships** — current production router |
| MiniLM + logistic regression | `router_model.py`     | 0.64        | 0.62     | 30 ms        | $0         | pre-committed bar **not met**         |
| gemini-2.5-flash             | `router_llm.py`       | 0.98        | 0.98     | 847 ms       | ~$0.0001   | best accuracy, priced in latency      |

n = 55, so one query ≈ 1.8 points — differences inside that are noise.

## Findings

1. **The trained model ties the keyword router overall (+1 query) but its mixed-intent
   detection collapses: 1/11 vs the keyword router's 7/11.** Train accuracy was 0.84 vs
   0.64 heldout — a textbook overfit gap at n=118. Compositional intent
   ("listings AND stats") is invisible to a single averaged embedding, while the
   keyword router's `hasSearch && hasMarket` rule encodes the composition explicitly.
   Per the bar set before training, the keyword router stays in production.
2. **The LLM router is near-perfect (54/55; its one miss, "find comps to the
   first listing" -> search, is genuinely ambiguous) at ~850 ms and ~$0.0001 per
   query — 5 orders of magnitude slower than the keyword router.** It is the only
   candidate that handles the no-lexical-signal tail ("should i buy now?").
3. **The keyword router's heldout weakness is recommend recall (3/9) and
   over-refusing (11 unknowns)** — unseen phrasings no word list anticipates.
   This suggests tiered routing as future work: keyword router first, escalate to the
   LLM only on `unknown` (~20% of queries buys most of the LLM's wins).

Caveats: the heldout set is curated test data (hard cases deliberately
included) rather than real user queries. The keyword
router is a hand-synced Python port of the production TS router, held identical by
a sync test. The LLM row's latency includes network variance.
