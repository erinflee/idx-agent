"""Week 5 — FastAPI service exposing market.py over HTTP

Endpoints the thin TS skill calls. Run: uvicorn service:app --reload
"""

from fastapi import FastAPI
from market import get_market_summary, get_price_trend

app = FastAPI()

@app.get("/health")
def health():
  return {"status": "ok"}

@app.get("/market/summary")
def marketSummary(city: str):
  return get_market_summary(city)

@app.get("/market/trends")
def marketTrends(city: str):
  return get_price_trend(city)