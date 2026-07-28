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
    output = find_similar_listings(query, k)
    assert len(output) == k


def test_scores_descending():
    query = "spanish architecture with big rooms"
    output = find_similar_listings(query)
    scores = [out["score"] for out in output]
    assert sorted(scores, reverse=True) == scores


def test_hit_shape():
    query = "spanish architecture with big rooms"
    output = find_similar_listings(query)
    required = {"id", "score", "address", "city", "price", "beds", "baths", "sqft"}
    for out in output:
        assert required <= out.keys() # checks string exactness, but out has properties that aren't required too 
        assert isinstance(out["id"] , str) and out["id"]
        assert isinstance(out["score"] , float)
