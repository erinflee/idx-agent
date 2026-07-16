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
.
├── docs/             Architecture reference
│   └── architecture.md/.d2  architecture diagram (Week 1 deliverable)
├── skills/           OpenClaw TypeScript skills the agent loads (see skills/README.md)
│   ├── propertySearch.ts       Week 2 NL property-search parser
│   ├── propertySearch.test.ts  15 labeled query→filter cases (npm test)
│   ├── cities.json             CA city lookup table the parser matches against
│   └── handlerDemo.ts          keyword→skill message-router scaffold
├── db.py             MySQL connection layer
└── requirements.txt
```

## Week → deliverable map

| Week | Deliverable                             | Location                       | Status      |
| ---- | --------------------------------------- | ------------------------------ | ----------- |
| 0    | Env setup · DB import · WhatsApp · keys | infra (`~/.openclaw`)          | done        |
| 1    | Architecture diagram                    | `docs/architecture.md` · `.d2` | done        |
| 2    | NL property-search parser               | `skills/propertySearch.ts`     | done        |
| 3    | Parameterized MySQL query layer         | `db.py`                        | done        |
| 4    | Multi-turn conversational agent         | `skills/`                      | done        |
| 5    | Market analytics                        | `skills/marketStats.ts`        | in progress |
| 6    | Embeddings & vector search              | local `sentence-transformers`  | —           |
| 7    | Recommendation engine                   | `skills/recommend.ts`          | —           |
| 8    | RAG pipeline                            | `skills/rag.ts`                | —           |
| 9    | Multi-agent orchestration               | `skills/orchestrator.ts`       | —           |
| 10   | WhatsApp layer                          | OpenClaw channel               | wired       |
| 11   | Email + safety guardrails               | `skills/email.ts`              | —           |
| 12   | Capstone demo                           | —                              | —           |

_(Skill filenames for Weeks 3+ are placeholders for upcoming work.)_

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env        # fill in MySQL creds + GOOGLE_API_KEY (Gemini)
pytest                      # run the eval/test suite
```

OpenClaw itself is installed separately (`npm install -g openclaw`) and runs as a background
gateway; see the Week 0 setup notes.
