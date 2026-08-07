---
name: recommendations
description: Given one listing the user likes, find the top 5 most similar active California MLS listings and price-check each against recent nearby sales — e.g. "more like this one", "show me similar homes", "anything else like the second listing". Use only when the user is referring to a SPECIFIC listing already shown to them, not for a fresh search.
user-invocable: true
metadata: { "openclaw": { "emoji": "🏘️" } }
---

# Recommendations

Use this skill when the user points at a listing they have already been shown
and asks for more like it — "more like this", "similar homes to that one",
"anything else in that style and price range".

This skill needs a **listing id**. It cannot start from a description or a set
of filters. If you do not have an id for the listing the user means, do not
guess one — ask which listing they mean, or run a search first.

Prefer **semantic-search** when the user describes a vibe in prose but has not
been shown a listing yet. Prefer **property-conversation** or
**property-search** for filter-style queries (city, price, beds/baths). Prefer
**market-stats** for city-level market questions rather than individual homes.

## How to run

Pass the listing id as the single quoted argument:

```
/Users/erinlee/Desktop/nlp-internship/bin/recommendations "<listing_id>"
```

- Pass ONE quoted string (the MLS listing id of the property the user likes).
- The id must come from an active listing previously shown in this conversation.
- The command ranks active listings by a hybrid of structured similarity
  (price, beds, city, sqft) and embedding similarity, then prints the top 5.
- Needs the local FastAPI service running (`uvicorn service:app --reload`) and
  embeddings already built.

## Returning results

- Relay the printed cards to the user as-is. Each has a match score, address,
  price, beds/baths, sqft, a comp check, and a short description preview.
- The `comps:` line is a rough sanity check, not an appraisal — it averages
  price per square foot for recent same-city sales of a similar size. Large
  percentages usually mean the home differs from its comps in lot size or
  quality, not that it is mispriced. Say so rather than calling a listing
  overpriced or a bargain.
- A card with no `comps:` line means no recent comparable sales matched — say
  the price could not be checked, do not treat it as a problem with the listing.
- If it prints "No similar listings available", tell the user nothing ranked.
- If it prints an HTTP 404 error, the listing id was not found among active
  listings — it may be a sold property or a typo. Ask the user to confirm which
  listing they meant.
- Never invent listings, prices, scores, or comp figures — only what the command
  prints.

## Notes

- Read-only. It never modifies the database.
- Recommendations come from active listings in `rets_property`; the comp check
  reads recent closed sales from `california_sold`. Sold properties can never be
  returned as recommendations, and a sold-listing id will not work as input.
- Returns a small top-k set (default 5) chosen from a wider pool of 50 nearest
  candidates, so results are not simply the closest text matches.
