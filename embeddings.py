"""Week 6 — local embeddings (all-MiniLM-L6-v2), text in -> 384-dim vector out

Runs on-device: no API key, no cost. Model loads once at import.
get_embedding(text) for any string; build_listing_embedding(row) for a listing.
GOTCHA: 256 word-piece cap, not chars — put structured facts first so what
survives truncation is what matters.
"""

from sentence_transformers import SentenceTransformer
import numpy as np


_model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text):
  text = text.replace("\n", "").strip()[:8000]
  embeddings = _model.encode(text)
  return embeddings.tolist()


def build_listing_embedding(row):
  text = f"""
  {row["L_Type_"]} in
  {row["L_City"]}, CA.
  {row["L_Keyword2"]} beds,
  {row["LM_Dec_3"]} baths.
  {row["LM_Int2_3"]} sqft.
  Built {row["YearBuilt"]}.
  Price: ${row["L_SystemPrice"]}.
  {row.get("L_Remarks","")}
  """.strip()

  return get_embedding(text)