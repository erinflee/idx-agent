---
name: rag
description: Answer conceptual and definitional real-estate questions from indexed source documents — e.g. "what does DOM mean?", "what is a list-to-close ratio?", "what columns are in california_sold?", "explain escrow". Use for questions about terminology, metrics, or the MLS data schema — NOT for finding listings or computing market stats.
user-invocable: true
metadata:
  { "openclaw": { "emoji": "📚" } }
---

# RAG Knowledge Assistant

Use this skill when the user asks what something *means* or how something
*works* — real-estate terminology (DOM, escrow, comps, list-to-close),
MLS field definitions, or what the databases contain.

Prefer **property-conversation** / **property-search** when the user wants
actual listings. Prefer **market-stats** when they want numbers computed from
sales data ("average price in San Diego") — this skill explains *what* a metric
is, market-stats computes its *value*. Prefer **recommendations** for "more
like this listing".

## How to run

Pass the user's question as a single quoted argument:

```
/Users/erinlee/Desktop/nlp-internship/bin/rag "<question>"
```

- Pass ONE quoted string (the question, lightly cleaned up is fine).
- The command retrieves the most relevant passages from the indexed documents
  (analyst primer, MLS field metadata, schema notes, market summaries) and has
  an LLM answer strictly from them.
- Needs the local FastAPI service running (`uvicorn service:app --reload`) and
  the rag index already built.

## Returning results

- Relay the answer to the user as-is — it is already short prose and ends with
  a "Source:" line naming the document it came from. Keep that line.
- If it prints "That isn't covered in my source documents.", tell the user the
  knowledge base doesn't cover that topic — do NOT answer from your own
  knowledge instead; staying grounded is the point of this skill.
- Never invent definitions, field names, or figures — only what the command
  prints.

## Notes

- Read-only over a local document index. It never touches the MySQL databases.
- Answers are grounded in: the Real Estate Data Analyst Primer, the Trestle
  RESO field metadata, the project's schema reference notes, and generated
  market summaries.
