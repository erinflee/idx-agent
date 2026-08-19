---
name: orchestrator
description: The default entry point for ANY real-estate question — routes it to the right capability automatically. Handles listing search ("3 bed condos in Irvine under 800k"), market stats ("average price in Fresno"), recommendations ("more like id 1170038764"), terminology and schema questions ("what does DOM mean?"), and mixed queries ("find homes in Oroville and tell me if prices are rising"). Prefer this over the individual skills unless the user explicitly names one.
user-invocable: true
metadata:
  { "openclaw": { "emoji": "🎛️" } }
---

# Orchestrator

One entry point for the whole suite. It classifies the user's intent
(search / market / recommend / knowledge / mixed) and dispatches to the
matching skill — mixed queries fan out to search AND market stats in
parallel and return both blocks.

## How to run

Pass the user's message as a single quoted argument:

```
/Users/erinlee/Desktop/nlp-internship/bin/orchestrator "<question>"
```

- Pass ONE quoted string — the user's message, lightly cleaned up is fine.
- Keep listing ids intact when the user references one ("more like id
  1170038764") — the recommend route extracts the id from the text.

## Returning results

- Relay the output as-is — property cards, market stats, and knowledge
  answers arrive pre-formatted (knowledge answers end with a "Source:" line;
  keep it).
- If it prints a clarifying question ("Which city are you asking about?",
  "Tell me which listing id"), relay that question to the user and re-run
  with their answer appended.
- If it prints "I'm not sure how to help with that...", relay it — do NOT
  answer from your own knowledge.

## Notes

- Search queries hit MySQL directly; market, knowledge, and recommend routes
  need the local FastAPI service running (`uvicorn service:app --reload`).
- Read-only: never writes to the databases.
- The individual skills (property-search, market-stats, rag, recommendations,
  semantic-search) remain available for explicit requests, but this skill is
  the preferred default.
