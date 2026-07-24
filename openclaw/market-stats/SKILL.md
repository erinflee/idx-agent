---
name: market-stats
description: Answer market questions about a California city — recent sold-price trends, average sale price, price per sqft, days on market, and list-to-close ratio. Use when the user asks about the market, price trends, averages, or whether it's a good time to buy or sell in a city (as opposed to searching for specific listings).
user-invocable: true
metadata:
  { "openclaw": { "emoji": "📊" } }
---

# Market Stats

Use this skill when the user asks about the *market* in a California city rather
than searching for specific listings — for example: "how's the market in Los
Angeles?", "what's the average price per sqft in Pasadena?", or "is now a good
time to buy in San Diego?".

## How to run

Extract the **city name** from the user's question and pass it as the single
quoted argument — NOT the full question:

```
/Users/erinlee/Desktop/nlp-internship/bin/market-stats "<city>"
```

- Pass ONLY the city (e.g. "Los Angeles", "San Diego") — the command expects a
  city name, not the user's full sentence.
- The command fetches recent single-family sold-market stats plus a monthly
  price trend for that city and prints a formatted card to stdout.

## Returning results

- Relay the printed card to the user as-is (summary line + price trend).
- For "is it a good time to buy?"-style questions, interpret the card for them:
  rising prices with a high list-to-close ratio suggest a seller's market;
  falling prices with longer days-on-market suggest more buyer leverage. Base
  any judgment ONLY on the printed numbers — never guess.
- If it prints "No recent sales data" or "No trends data", tell the user there
  is no market data for that city.
- Never invent numbers. Report only what the command prints.

## Notes

- Read-only analytics over historical sold data. It never modifies anything.
- Data covers recent months of single-family sales; small cities can have sparse
  or noisy trends, so treat big-city numbers as the most reliable.
