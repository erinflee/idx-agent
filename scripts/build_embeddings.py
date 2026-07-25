"""Week 6 — one-time backfill: embed every active listing, save vectors + ids

Run:  python -m scripts.build_embeddings   (~53k rows, ~12 min; needs .env + DB)
      -m, not a direct path -> otherwise the repo root isn't on sys.path and
      `from embeddings import ...` fails.
Batch the encode (batch_size=32). The .npz is ~81MB — gitignore it.
"""

import numpy as np
import pandas as pd
from db import engine
from sqlalchemy import text
from embeddings import build_listing_text, embed_batch


def get_info():
  query = text("""
    SELECT 
      L_ListingID AS id,
      L_Type_ AS propertyType,
      L_City AS city,
      L_Keyword2 AS beds,
      LM_Dec_3 AS baths,
      LM_Int2_3 AS sqft,
      YearBuilt AS year,
      L_SystemPrice AS price,
      L_Remarks AS description

    FROM rets_property
    
    WHERE L_Status = 'Active'
      AND L_SystemPrice >= 10000;
  """)

  records = pd.read_sql(query, con=engine)
  if records.empty or len(records) == 0:
    return []

  records = records.astype(object).where(records.notna(), None)
  return records.to_dict(orient="records")


if __name__ == "__main__":
  rows = get_info()
  ids = [r["id"] for r in rows]
  texts = [build_listing_text(r) for r in rows]
  embeddings = embed_batch(texts)

