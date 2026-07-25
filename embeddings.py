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
  embedding = _model.encode(text)
  return embedding.tolist()


def embed_batch(texts):
  embeddings = _model.encode(texts, batch_size=32)
  return embeddings


FIELDS = [
  ("L_Type_", "{}"),
  ("L_City", "{}"),
  ("L_Keyword2", "{} beds"),
  ("LM_Dec_3", "{} baths"),
  ("LM_Int2_3", "{} sqft"),
  ("YearBuilt", "{}"),
  ("L_SystemPrice", "${}"),
  ("L_Remarks", "{}")
]

def build_listing_text(row):
  valid = []
  for field, template in FIELDS:
    if row.get(field):
      valid.append(template.format(row[field]))

  text = " ".join(valid)

  return text


