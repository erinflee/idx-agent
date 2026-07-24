---
name: property-search
description: Search active California MLS listings by natural language — city, price, beds, baths, square footage, property type, pool, view, or HOA. Use when the user asks to find, search, browse, or show homes/condos/listings for sale.
user-invocable: true
metadata:
  { "openclaw": { "emoji": "🏠" } }
---

# Property Search

Use this skill whenever the user wants to find active real-estate listings for
sale in California — for example: "show me 3 bed condos in Irvine under $1.2M
with a pool" or "any houses in Pasadena under 900k".

## How to run

Run this exact command, substituting the user's full request (verbatim) as the
single quoted query argument:

```
/Users/erinlee/Desktop/nlp-internship/bin/property-search "<user query>"
```

- Pass the user's natural-language request as ONE quoted string.
- The command parses the query, searches the live `rets_property` MLS table,
  and prints formatted property cards to stdout.

## Returning results

- Relay the printed cards to the user as-is — they are already formatted
  (address, price, beds/baths, sqft, property type).
- If the command prints nothing or "No matching listings found", tell the user
  no active listings matched and suggest loosening a filter (raise price, fewer
  beds, or a different city).
- Never invent or embellish listings. Report only what the command prints.

## Notes

- Read-only search over active listings. It never modifies the database.
- Results are capped at ~50 listings per query.
