"""Tests for market.py — summary + price trend queries

Integration tests: they hit the real california_sold DB (needs DB access)
Assert invariants (soldCount > 0, first trend pct is None, months ordered,
fake city -> None), not brittle exact numbers

Run: pytest tests/test_market.py -v
"""
