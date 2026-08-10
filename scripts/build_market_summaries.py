"""One-time build: market stats in -> docs/market_summaries.md out

The RAG index needs the market reports as a file on disk, so this calls
market.py directly (no FastAPI needed) for a handful of high-inventory cities
and writes one markdown section per city. Re-run to refresh before the demo —
the summaries are date-stamped and go stale as sales data ages.

Run:  python -m scripts.build_market_summaries   (needs .env + DB)
      -m, not a path -> otherwise the repo root isn't on sys.path.
"""

from market import get_market_summary, get_price_trend
from pathlib import Path

CITIES = ["San Francisco", "Los Angeles", "San Diego", "San Jose", "Riverside", "Irvine", "Santa Cruz"]
MONTHS = 7
OUT = Path(__file__).parent.parent / "rag_docs" / "market_summaries.md"


def build_city_section(city):
  summary = get_market_summary(city, MONTHS)
  trends = get_price_trend(city, MONTHS)

  if summary is None:
    return f"## {city}\n\nNo recent sales data.\n"
  if trends is None:
    return f"## {city}\n\nNo recent trends data.\n"

  s = summary[0]
  t_ = []
  s_ = f"summary: {s["soldCount"]}, {s["avgDom"]}, {s["avgClosePrice"]}, {s["avgPricePerSqft"]}, {s["listToClosePct"]}"
  for t in trends:
    t_.append(f"{t["month"]}, {t["sales"]}, {t["avgPrice"]}\n")

  combined =  f"## {city}\n" + s_ + "trends: " + "".join(t_) # convert list to string
  return combined
  
