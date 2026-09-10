# Agentic AI Real Estate Assistant

A multi-agent AI assistant over California MLS data (CRMLS), built on **OpenClaw**.
Natural-language property search, market analytics, semantic recommendations, RAG
knowledge retrieval, and WhatsApp + email communication.

## Stack

- **Runtime:** OpenClaw (multi-agent orchestration) → WhatsApp channel
- **LLM:** Google **Gemini** (`gemini-2.5-flash`) via its OpenAI-compatible endpoint
- **Embeddings:** local **`sentence-transformers`** (`all-MiniLM-L6-v2`) — no API key
- **Data:** MySQL `idx_exchange` — `rets_property` (active listings) + `california_sold` (sold comps)

## Repo layout

Organized **by component, not by week** — code is reused across weeks, so it lives once and
evolves. Git history records the timeline; the table below maps weeks → files.

```
TypeScript (OpenClaw skills)
  skills/
    shared/db.ts        read-only MySQL helper
    propertySearch/     parse → search → format, multi-turn session   (Wk 2–4)
    marketComps/        market stats + sold comps                     (Wk 5)
    semanticSearch/     embedding search over L_Remarks               (Wk 6)
    recommendations/    hybrid recs + comp validation                 (Wk 7)
    rag/                grounded Q&A                                  (Wk 8)
    orchestrator/       intent router → skill dispatch                (Wk 9)
    email/              draft → approve → send                        (Wk 11)
  bin/                  one allowlisted wrapper per skill
  openclaw/             SKILL.md per skill

Python (backends behind service.py)
  service.py            FastAPI on 127.0.0.1:8000 — market, semantic, recommend, rag
  db.py                 MySQL connection
  market.py             stats + monthly trend                          (Wk 5)
  embeddings.py         all-MiniLM-L6-v2 encoder                       (Wk 6)
  semantic.py           vector search                                  (Wk 6)
  recommend.py          hybrid scoring + comps                         (Wk 7)
  chunking.py, rag.py   chunk, retrieve, answer                        (Wk 8)
  rag_docs/             RAG corpus (md tracked; PDFs + index untracked)
  scripts/              build_embeddings, build_market_summaries, build_rag_index, test-all.sh
  generate_cities.py    city gazetteer → cities.json + ca_cities.txt

Evals & tests
  evals/                answer key, router benchmark, RAG judge, safety, task success
  tests/                pytest for backends + task-success floors
  docs/                 architecture.md, lifecycle.md, reflection.md
```

The TypeScript skills own parsing, sessions, formatting, and the MySQL queries for
property search and comps. The heavier Python backends (embeddings, recommendations,
RAG) sit behind `service.py`, and the matching TS skill is a thin HTTP client.
See `docs/architecture.md` for the diagram.

## Week → deliverable map

| Week | Deliverable                             | Location                                                                                                                                    | Status |
| ---- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | Env setup · DB import · WhatsApp · keys | infra (`~/.openclaw`)                                                                                                                       | done   |
| 1    | Architecture diagram                    | `docs/architecture.md`                                                                                                                      | done   |
| 2    | NL property-search parser               | `skills/propertySearch/parse.ts`                                                                                                            | done   |
| 3    | Parameterized MySQL query layer         | `skills/shared/db.ts` · `db.py`                                                                                                             | done   |
| 4    | Multi-turn conversational agent         | `skills/propertySearch/session.ts` · `conversation.ts` · `openclaw/property-conversation/`                                                  | done   |
| 5    | Market analytics                        | `skills/marketComps/` · `market.py` (trend is 7 months, not 12 — that's all `california_sold` covers)                                        | done   |
| 6    | Embeddings & vector search              | `skills/semanticSearch/` · `semantic.py`                                                                                                    | done   |
| 7    | Recommendation engine                   | `skills/recommendations/` · `recommend.py`                                                                                                  | done   |
| 8    | RAG pipeline                            | `skills/rag/` · `rag.py` · `rag_docs/`                                                                                                      | done   |
| 9    | Multi-agent orchestration               | `skills/orchestrator/` · `openclaw/orchestrator/` · `evals/router_*.py` (email is routed by OpenClaw, not here — its approve step spans turns) | done   |
| 10   | WhatsApp layer + safety eval            | OpenClaw WhatsApp channel → `bin/*` wrappers · `evals/safety_eval.py` · `safety_cases.jsonl`                                                | done   |
| 11   | Email + approval guardrails             | `skills/email/` · `bin/email` · `openclaw/email/`                                                                                           | done   |
| 12   | Capstone demo + end-to-end task success | `evals/dump_system.ts` · `evals/replay_system.py` · `tests/test_task_success.py` · live WhatsApp demo · backup video · `docs/reflection.md` | done   |

## Capstone deliverables

| Deliverable          | Where                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture diagram | `docs/architecture.md` (mermaid, both databases) · `docs/lifecycle.md` (query lifecycle)                                                                              |
| Schema annotation    | `rag_docs/schema_reference.md` — field-usage notes for `rets_property` / `california_sold`, verified against the Trestle RESO metadata; also indexed by the RAG skill |
| Live demo            | 5-minute WhatsApp walkthrough: multi-turn search → mixed intent (search + market) → semantic → recommend → RAG → email draft & approve                                |
| Demo video (backup)  | not yet recorded                                                                                                                                                      |
| Written reflection   | `docs/reflection.md`                                                                                                                                                  |
| Evals                | `evals/README.md` — router benchmark, RAG judge, safety suite, end-to-end task success                                                                                |

## Setup

```bash
pip install -r requirements.txt   # Python: db.py + skill backends
npm install                       # TypeScript: tsx runner + mysql2
cp .env.example .env              # fill in MySQL creds + GOOGLE_API_KEY (Gemini)
```

Weeks 2–4 run against MySQL directly. Weeks 6–9 also need the artifacts below,
which are gitignored and rebuilt once per clone:

```bash
python -m scripts.build_embeddings        # Week 6+: listing_embeddings.npz (~53k rows, ~12 min, needs DB)
python -m scripts.build_market_summaries  # Week 8:  rag_docs/market_summaries.md (needs DB)
python -m scripts.build_rag_index         # Week 8:  rag_docs/chunks.jsonl + doc_embeddings.npy (no DB)
```

`build_rag_index` needs both source PDFs (Real Estate Primer, Trestle Property Metadata)
in `rag_docs/`; they are licensed and untracked. `evals/router_model.joblib` (benchmark
only) is retrained with `python -m evals.router_model`.

Then start the FastAPI service. The market, semantic-search, recommendation, and RAG
skills (and the orchestrator when it routes to them) call it over HTTP, so Weeks 5–9
fail without it:

```bash
uvicorn service:app --host 127.0.0.1 --port 8000
curl http://127.0.0.1:8000/health
```

## Tests

Two suites, run separately:

```bash
pytest        # Python — skill backend tests
npm test      # TypeScript — full skill suite (scripts/test-all.sh)
```

`npm test` runs the no-DB unit tests first, then the integration tests that hit
live MySQL — so it needs `.env` filled in and the database running. Individual suites are in `package.json` (e.g.
`npm run test-property-parse`).

`pytest` includes `tests/test_task_success.py`, which scores the real pipeline
end-to-end from a recording. Regenerate the recording after a pipeline change
with `npm run dump-system` (needs the DB); see `evals/README.md`.

OpenClaw itself is installed separately (`npm install -g openclaw`) and runs as a background
gateway. `bin/demo-reset` syncs the skills into it and restarts everything.
