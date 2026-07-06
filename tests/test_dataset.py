"""Tests that guard the answer key itself (cases.jsonl) against typos. 

Run: pytest tests/test_dataset.py -v 
"""

from evals.dataset import load_cases
from evals.schema import INTENTS, SchemaValidator


def test_cases_load():
    # load_cases() should return a non-empty list
    assert load_cases()


def test_ids_unique():
    # No two cases share an id.
    c = set()
    cases = load_cases()
    ids = [case.id for case in cases]
    for id in ids:
        c.add(id)
    
    assert len(ids) == len(c)


def test_intents_valid():
    # Every case.intent is one of INTENTS.
    cases = load_cases()
    for case in cases:
        assert case.intent in INTENTS


def test_filters_consistent_with_must_error():
    # Property test on your own labels:
    #   - non-must_error cases: their filters should PASS the validator
    #   - must_error cases:     their filters should FAIL the validator
    # Use a validator seeded from the real ca_cities.txt: SchemaValidator()
    V = SchemaValidator()
    cases = load_cases()

    for case in cases:
        errors = V.validate(case.filters)
        if case.must_error:
            assert errors != []

        else:
            assert errors == []
