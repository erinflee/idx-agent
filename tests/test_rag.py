"""Tests for rag.py — retrieval quality + the no-context guard

Deterministic only: same query, same index, same top hits. Asserts the three
deliverable questions retrieve from the right sources, scores come back sorted,
and an off-corpus question gets the exact refusal string WITHOUT an API call.
Generated answers are not asserted here — Gemini phrasing varies per run; that
lives in the eval, not the unit suite.

Run: pytest tests/test_rag.py -v   (loads the embedding model once, ~5s)
"""
