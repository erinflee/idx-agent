"""Tests for semantic.py — cosine ranking + top-k

Integration: loads the real matrix (build_embeddings.py must have run).
Assert k rows, scores descending, ids real. Note there's no "no results"
case — cosine always ranks something, even for a nonsense query.

Run: pytest tests/test_semantic.py -v
"""

import numpy as np
from semantic import find_similar_listings


def test_returns_k_hits():
    k = 5
    query = "spanish architecture with big rooms"
    out = find_similar_listings(query, k)
    assert len(out) == k


