---
name: semantic-search
description: Find active California MLS listings by vibe or free-text description using embedding similarity — e.g. "charming craftsman with mountain views", "bright open kitchen near the beach". Use when the user describes feel, style, or features in prose rather than structured filters like city/price/beds.
user-invocable: true
metadata:
  { "openclaw": { "emoji": "🔎" } }
---

# Semantic Search

Use this skill when the user wants homes that *feel* like a description — style,
atmosphere, or prose features — for example: "charming craftsman with mountain
views", "quiet cul-de-sac with a big backyard", or "modern loft vibes near the
coast".

Prefer **property-conversation** on WhatsApp when the ask is mostly filters
(city, price, beds/baths, sqft, pool, HOA) — it remembers context across
messages. Use **property-search** only for complete one-shot filter queries.
Prefer **market-stats** for city-level market questions (averages, trends), not
individual listings.

## How to run

Pass the user's free-text description as the single quoted argument — you may
tighten wording slightly, but keep the vibe intact:

```
/Users/erinlee/Desktop/nlp-internship/bin/semantic-search "<description>"
```

- Pass ONE quoted string (the description / vibe query).
- The command embeds the query, ranks active listings by cosine similarity, and
  prints the top matches with scores to stdout.
- Needs the local FastAPI service running (`uvicorn service:app --reload`) and
  embeddings already built.

## Returning results

- Relay the printed cards to the user as-is — each has a similarity score plus
  address, price, beds/baths, sqft, and a short description preview.
- Scores are relative similarity (higher = closer match), not a guarantee the
  listing has every requested feature. Say so if results look only loosely related.
- If it prints "No similar listings found", tell the user nothing ranked and
  suggest a broader or different description.
- Never invent listings, prices, or scores — only what the command prints.

## Notes

- Read-only search over active listings via local embeddings. It never modifies
  the database.
- Returns a small top-k set (default 5), ranked by semantic similarity — not
  SQL keyword filters.
