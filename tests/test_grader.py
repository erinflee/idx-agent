"""Tests that the GRADER works, using the perfect oracle test-double. 

Run - python3 -m pytest tests/ -q

If the oracle does not score 1.0, the bug is in the scorer/validator, not the
pipeline. The real pipeline is scored in test_task_success.py.
"""

from evals.grader import run_suite, task_success_rate, oracle_system
from evals.rulebook import SchemaValidator


def test_oracle_scores_perfect():
    # A perfect system must yield task_success_rate == 1.0 over the whole suite.
    validator = SchemaValidator()
    results = run_suite(oracle_system(validator))
    assert task_success_rate(results) == 1.0
    