"""Tests for the SchemaValidator

Use a small injected city set so these don't depend on ca_cities.txt:
    V = SchemaValidator(known_cities={"Concord", "Berkeley"})

Run: pytest tests/test_rulebook.py -v
"""

from evals.rulebook import SchemaValidator

def test_valid_filters_pass():
    # A well-formed filter object should produce zero errors
    V = SchemaValidator(known_cities={"Concord", "Berkeley"})
    assert V.validate({"city": "Berkeley", "beds": 4, "pool": "1", "maxPrice": 1000000}) == []


def test_negative_price_rejected():
    # maxPrice < 0 should produce at least one error
    V = SchemaValidator(known_cities={"Concord", "Berkeley"})
    assert V.validate({"maxPrice": -10}) != []


def test_unknown_city_rejected():
    # A city not in known_cities should produce an error
    V = SchemaValidator(known_cities={"Concord", "Berkeley"})
    assert V.validate({"city": "Brooklyn"}) != []


def test_bad_property_type_rejected():
    # property not in PROPERTY_TYPES should produce an error
    V = SchemaValidator(known_cities={"Concord", "Berkeley"})
    assert V.validate({"property": "Apartment"}) != []
