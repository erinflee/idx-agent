"""Week 6 — local embeddings (all-MiniLM-L6-v2), text in -> 384-dim vector out

Runs on-device: no API key, no cost. Model loads once at import.
build_listing_text(row) -> the string; embed_batch(texts) -> array, for the
backfill. get_embedding(text) is the query path — one string, JSON-safe list.
GOTCHA: 256 word-piece cap, not chars — put structured facts first so what
survives truncation is what matters.
"""

from sentence_transformers import SentenceTransformer


_model = SentenceTransformer("all-MiniLM-L6-v2") 

# keys must match scripts/build_embeddings.py SQL aliases (not raw MLS column names)
FIELDS = [
  ("propertyType", "{}"),
  ("city", "{}"),
  ("beds", "{} beds"),
  ("baths", "{} baths"),
  ("sqft", "{} sqft"),
  ("year", "{}"),
  ("price", "${}"),
  ("description", "{}"),
]

def get_embedding(text):
  embedding = _model.encode(text, normalize_embeddings=True) # unit norm
  return embedding.tolist() # fastapi can't read np.array, convert to list


def embed_batch(texts):
  # 32 measured fastest here (76/s); 128+ falls off a cliff — 256 is 19x slower
  # no .tolist() -> np.save wants the raw float32, converting doubles the file
  embeddings = _model.encode(texts, batch_size=32, normalize_embeddings=True) # unit norm
  return embeddings


def build_listing_text(row):
  valid = []
  for field, template in FIELDS:
    if row.get(field):
      valid.append(template.format(row[field]))

  text = " ".join(valid)

  return text


