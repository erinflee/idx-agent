"""Tests for recommend.py — structured similarity score

Unit tests, no DB. Fixture listing pairs → assert price/beds/city/sqft
point buckets. Embeddings and comps come later.

Run: pytest tests/test_recommend.py -v
"""

import pytest
from recommend import calculate_similarity_score


def test_calculate_similarity_score():
    target = {
        "city": "Berkeley",
        "price": 1300000,
        "beds": 3,
        "sqft": 694,
    }
    candidate = {
        "city": "Berkeley",
        "price": 1280000,
        "beds": 3,
        "sqft": 724,
    }
    score = calculate_similarity_score(target, candidate)
    assert score == 60.0, "incorrect score"

