"""Week 8 — retrieval + grounded answers over the doc index

query -> top-k chunks by cosine -> Gemini answers from them, with sources.
Thin TS skill calls this over HTTP (same pattern as semantic.py).
"""

import json
import numpy as np
from pathlib import Path
from embeddings import get_embedding


ROOT = Path(__file__).parent
_records = [json.loads(l) for l in open(ROOT / "rag_docs" / "chunks.jsonl", "r", encoding="utf-8")]
_embeddings = np.load(ROOT / "rag_docs" / "doc_embeddings.npy")


