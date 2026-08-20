"""Tests for recommend.py — structured similarity score

Unit tests, no DB. Fixture listing pairs → assert price/beds/city/sqft
point buckets. Embeddings and comps come later.

Run: pytest tests/test_recommend.py -v
"""

from recommend import calculate_similarity_score, validate_with_comps


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
    target_emb = [1, 0]
    candidate_emb = [1, 0]

    score = calculate_similarity_score(target, candidate, target_emb, candidate_emb)
    assert score == 100, "incorrect score"


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
    target_emb = [1, 0]
    candidate_emb = [0, 1]

    score = calculate_similarity_score(target, candidate, target_emb, candidate_emb)
    assert score == 0, "incorrect score"


def test_validate_with_comps():
    city = "Berkeley"
    sqft = 700
    property = "SingleFamilyResidence"
    price = 1300000
    validated = validate_with_comps(city, sqft, property, price)
    assert validated is not None
    assert validated.keys() == {"price", "comp_count", "comp_price", "delta_percentage"} # set is orderless
    assert validated["comp_count"] > 0
    assert validated["comp_price"] > 0


def test_not_validate_with_comps():
    city = "Boston"
    sqft = 700
    property = "SingleFamilyResidence"
    price = 1300000
    validated = validate_with_comps(city, sqft, property, price)
    assert validated is None
