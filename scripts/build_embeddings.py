"""Week 6 — one-time backfill: embed every active listing, save vectors + ids

Run:  python -m scripts.build_embeddings   (~53k rows, ~12 min; needs .env + DB)
      -m, not a direct path -> otherwise the repo root isn't on sys.path and
      `from embeddings import ...` fails.
Batch the encode (batch_size=64). The .npy is ~81MB — gitignore it.
"""

import numpy as np
import pandas as pd
from db import engine
from sqlalchemy import text
from embeddings import build_listing_text, embed_batch

