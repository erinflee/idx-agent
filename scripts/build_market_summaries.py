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
from datetime import date

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
  s_ = f"single-family homes, last {MONTHS} months: {s['soldCount']:,} sales, {s['avgDom']} days on market (DOM), average close ${s['avgClosePrice']:,.0f}, median close ${s['medClosePrice']:,.0f}, ${s['avgPricePerSqft']:,.0f}/sqft, {s['listToClosePct']}% of list (list-to-close ratio)\n"
  for t in trends:
    t_.append(f"- {t['month']}: {t['sales']} sales, avg close ${t['avgPrice']:,.0f}\n")

  combined =  f"## {city}\n" + s_ + "trends by month:\n" + "".join(t_) # convert list to string
  return combined
  

def main():
  cities_info = []
  for city in CITIES:
    cities_info.append(build_city_section(city))

  OUT.parent.mkdir(exist_ok=True)
  cur_date = date.today().isoformat()

  header = f"""# California Market Summaries\nGenerated {cur_date} from california_sold - last {MONTHS} months of closed single-family sales.\n\n"""
  OUT.write_text(header + "\n".join(cities_info))


if __name__ == "__main__":
  main()
