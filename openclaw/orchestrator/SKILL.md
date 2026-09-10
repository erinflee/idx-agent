---
name: orchestrator
description: The default entry point for ANY real-estate question — routes it to the right capability automatically. Handles listing search ("3 bed condos in Irvine under 800k"), market stats ("average price in Fresno"), recommendations ("more like id 1170038764"), terminology and schema questions ("what does DOM mean?"), and mixed queries ("find homes in Oroville and tell me if prices are rising"). Prefer this over the individual skills unless the user explicitly names one.
user-invocable: true
metadata: { "openclaw": { "emoji": "🎛️" } }
---

# Orchestrator

One entry point for the whole suite. It classifies the user's intent
(search / market / recommend / knowledge / mixed) and dispatches to the
matching skill — mixed queries fan out to search AND market stats in
parallel and return both blocks.

## How to run

Pass the user's message as a single quoted argument:

```
/Users/erinlee/Desktop/nlp-internship/bin/orchestrator --user "<sender id>" "<question>"
```

- Always pass the WhatsApp sender's id as `--user` — property searches then remember city,
  budget, and type across messages and ask follow-up questions when something is missing.
  Use the sender's phone number if you know it; otherwise use the fixed id `whatsapp-user`
  for every message in this chat. Never pass the literal text `<sender id>`.
- Pass ONE quoted string — the user's message, lightly cleaned up is fine.
- Keep listing ids intact when the user references one ("more like id
  1170038764") — the recommend route extracts the id from the text.

## Returning results

- Relay the output VERBATIM — copy the command's stdout exactly, first line to
  last. Property cards, market stats, and knowledge answers arrive
  pre-formatted. Do NOT add an intro sentence, do NOT number or bullet the
  cards, do NOT drop the header line (e.g. "Concord • under $1,400,000 — top
  5:") or the trailer ("Reply \"show more\"..."), and keep the "Source:" line
  on knowledge answers.
- If it prints a clarifying question ("What is your budget?", "Which city are
  you asking about?"), relay it to the user, then pass their next message as
  the new question. The session remembers earlier answers.
- "start over", "restart", "new search": ALWAYS run the command with that exact
  message. Never answer these yourself — the command clears the saved search
  and prints the first question ("Which city?"), which you relay verbatim.
- If it prints "I'm not sure how to help with that...", relay it — do NOT
  answer from your own knowledge.

## Notes

- Search queries hit MySQL directly; market, knowledge, and recommend routes
  need the local FastAPI service running (`uvicorn service:app --reload`).
- Read-only: never writes to the databases.
- The individual skills (property-search, market-stats, rag, recommendations,
  semantic-search) remain available for explicit requests, but this skill is
  the preferred default.
