"""Tests for recommend.py — structured similarity score

Unit tests, no DB. Fixture listing pairs → assert price/beds/city/sqft
point buckets. Embeddings and comps come later.

Run: pytest tests/test_recommend.py -v
"""

from recommend import calculate_similarity_score


def test_similar_listings():
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


def test_unrelated_listings():
    target = {
        "city": "Berkeley",
        "price": 1300000,
        "beds": 3,
        "sqft": 700,
    }
    candidate = {
        "city": "San Diego",
        "price": 2000000,
        "beds": 5,
        "sqft": 1630,
    }
    score = calculate_similarity_score(target, candidate)
    assert score2 == 0, "incorrect score"

