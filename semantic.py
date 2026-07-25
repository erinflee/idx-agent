"""Week 6 — semantic search over the listing embeddings

Free-text query -> top-k similar listings from rets_property.
Thin TS skill calls this over HTTP (same pattern as market.py).
PERF: normalize once at load, score with one matmul — not per-row cosine.
"""
