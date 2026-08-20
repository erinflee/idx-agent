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

# Week 8 — RAG Eval

Two modes, one file (`rag_evals.py`):

```bash
python -m evals.rag_evals            # retrieval metrics — offline, free, ~10s
python -m evals.rag_evals --judge    # + answerability & LLM-judged metrics (~60 flash calls, cents)
```

## Results (23 cases, --judge run 2026-08-20)

| metric | value | what it measures |
| --- | --- | --- |
| recall@4 | 1.00 | gold document reached the top-4 on every answerable case |
| context precision (doc-level) | 0.80 | fraction of top-4 chunks from the gold document |
| judged relevance (chunk-level) | 0.46 | fraction of top-4 chunks an LLM judge says actually help |
| answerability accuracy | 0.87 | answered when it should, refused when it should (20/23) |
| **refusal accuracy (must-refuse slice)** | **0.89** | the prompt-level guard held on 8 of 9 |
| groundedness | 1.00 | every answer fully supported by its excerpts (0 judge failures) |

## Findings

1. **The prompt-level guard works where it matters most.** Only 2 of 9
   must-refuse cases are stopped by the `MIN_SCORE` threshold; the other 7
   retrieve confidently and rely on the system prompt — which refused all the
   advice-with-domain-vocabulary cases (market timing, negotiation,
   condo-vs-SFR). The single leak: "explain cap rate," a definition-shaped
   query whose corpus coverage is only passing mentions — the model stitched
   an answer from fragments.
2. **Doc-level precision flatters retrieval ~2x.** The chunk-reading judge
   scores relevance at 0.46 vs the 0.80 document-level proxy: coming from the
   right document does not make a chunk useful. Both numbers are kept — the
   proxy is free and stable, the judged number is the truer one.
3. **The failure mode is answering-when-it-shouldn't, never inventing facts.**
   Groundedness is 1.00 across every answered case; the errors are one refusal
   leak and two false refusals on answerable cases.

Caveat: relevance and groundedness are LLM-judged (gemini-2.5-flash judging
its own pipeline's outputs) from a single run over 23 hand-curated cases —
directional, not precise.

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
