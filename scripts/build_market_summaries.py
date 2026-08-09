"""Week 8 — one-time build: Week 5 market stats in -> docs/market_summaries.md out

The RAG index needs the Week 5 market reports as a file on disk, so this calls
market.py directly (no FastAPI needed) for a handful of high-inventory cities
and writes one markdown section per city. Re-run to refresh before the demo —
the summaries are date-stamped and go stale as sales data ages.

Run:  python -m scripts.build_market_summaries   (needs .env + DB)
      -m, not a path -> otherwise the repo root isn't on sys.path.
"""
