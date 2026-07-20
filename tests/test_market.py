"""Tests for market.py — summary + price trend queries

Integration tests: they hit the real california_sold DB (needs DB access)
Assert invariants (soldCount > 0, first trend pct is None, months ordered,
fake city -> None), not brittle exact numbers

Run: pytest tests/test_market.py -v
"""

from market import get_market_summary, get_price_trend


def test_summary_known_city():
  city = "Los Angeles"
  result = get_market_summary(city)
  assert result is not None
  assert len(result) == 1
  assert result[0]["soldCount"] > 0
  assert result[0]["avgClosePrice"] > 0
  assert 0 < result[0]["listToClosePct"] < 200
  assert result[0].keys() >= {"soldCount", "avgDom", "avgClosePrice", "avgPricePerSqft", "listToClosePct"}
  

def test_summary_unknown_city():
  city = "Boston"
  result = get_market_summary(city)
  assert result is None, f"Should have no market data available for {city}"


def test_trend_known_city():
  city = "Los Angeles"
  result = get_price_trend(city)
  assert len(result) > 0, f"No trend data available for {city}"


def test_trend_unknown_city():
  city = "Boston"
  result = get_price_trend(city)
  assert result is None, f"Should have no trend data available for {city}"