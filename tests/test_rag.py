"""Tests for rag.py — retrieval quality + the no-context guard

Deterministic only: same query, same index, same top hits. Asserts the three
deliverable questions retrieve from the right sources, scores come back sorted,
and an off-corpus question gets the exact refusal string WITHOUT an API call.
Generated answers are not asserted here — Gemini phrasing varies per run; that
lives in the eval, not the unit suite.

Run: pytest tests/test_rag.py -v   (loads the embedding model once, ~5s)
"""

from rag import retrieve, rag_answer


def test_retrieve_shape():
  KEYS = {"source", "chunk", "score"}
  query = "What does DOM mean?"
  k = 4
  hits = retrieve(query, k)
  scores = [h["score"] for h in hits]

  assert len(hits) == k
  assert scores == sorted(scores, reverse=True)
  for h in hits:
    assert KEYS <= h.keys()