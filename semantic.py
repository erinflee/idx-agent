"""Week 6 — semantic search over the listing embeddings

Free-text query -> top-k similar listings from rets_property.
Thin TS skill calls this over HTTP (same pattern as market.py).
PERF: normalize once at load, score with one matmul — not per-row cosine.
"""

import numpy as np
from pathlib import Path
from db import engine
from sqlalchemy import text, bindparam
from embeddings import get_embedding

PATH = Path(__file__).parent/"listing_embeddings.npz"

try:
  _data = np.load(PATH)
except FileNotFoundError:
  raise FileNotFoundError(f"{PATH} not found - run: python -m scripts.build_embeddings")

_ids = _data['ids']
_embeddings = _data['embeddings']


def find_similar_listings(query, k=5):
  q = get_embedding(query)
  scores = _embeddings @ q
  idx = np.argpartition(-scores, kth=k)[:k]
  top_k_index = idx[np.argsort(-scores[idx])]

  return [{"id": str(_ids[id]), "score": float(scores[id])} for id in top_k_index]


def fetch_listing_details(ids):
  query = text("""
    SELECT 
      L_ListingID AS id,
      L_Address AS address,
      L_Type_ AS propertyType,
      L_City AS city,
      L_Keyword2 AS beds,
      LM_Dec_3 AS baths,
      LM_Int2_3 AS sqft,
      YearBuilt AS year,
      L_SystemPrice AS price,
      L_Remarks AS description
    
    FROM rets_property

    WHERE L_ListingID IN :ids
  """)

  query = query.bindparams(bindparam("ids", expanding=True)) # fill in parameter with list's values
  with engine.connect() as conn:
    results = conn.execute(query, {"ids": ids})
    rows = results.mappings().all()

  return {r["id"]: dict(r) for r in rows}
