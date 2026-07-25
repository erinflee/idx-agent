"""Week 6 — semantic search over the listing embeddings

Free-text query -> top-k similar listings from rets_property.
Thin TS skill calls this over HTTP (same pattern as market.py).
PERF: normalize once at load, score with one matmul — not per-row cosine.
"""

import numpy as np
from pathlib import Path
from embeddings import get_embedding

PATH = Path(__file__).parent/"listing_embeddings.npz"

_data = np.load(PATH)
_ids = _data['ids']
_embeddings = _data['embeddings']


def find_similar_listings(query, k=5):
  q = get_embedding(query)
  scores = _embeddings @ q
  idx = np.argpartition(-scores, kth=k)[:k]
  top_k_index = idx[np.argsort(-scores[idx])]

  return [{"id": str(_ids[id]), "score": float(scores[id])} for id in top_k_index]



