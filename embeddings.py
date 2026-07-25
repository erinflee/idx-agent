"""Week 6 — local embeddings (all-MiniLM-L6-v2), text in -> 384-dim vector out

Runs on-device: no API key, no cost. Model loads once at import.
get_embedding(text) for any string; build_listing_embedding(row) for a listing.
GOTCHA: 256 word-piece cap, not chars — put structured facts first so what
survives truncation is what matters.
"""

from sentence_transformer import SentenceTransformer
import numpy as np