"""Week 8 — retrieval + grounded answers over the doc index

query -> top-k chunks by cosine -> Gemini answers from them, with sources.
Thin TS skill calls this over HTTP (same pattern as semantic.py).
"""

import os
import json
import numpy as np
from pathlib import Path
from embeddings import get_embedding
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).parent
_records = [json.loads(l) for l in open(ROOT / "rag_docs" / "chunks.jsonl", "r", encoding="utf-8")]
_embeddings = np.load(ROOT / "rag_docs" / "doc_embeddings.npy")

model = "gemini-2.5-flash"
MIN_SCORE = 0.3


def retrieve(query, k=4):
  q = np.array(get_embedding(query)) # converts (384,) -> (384, 1)
  scores = _embeddings @ q # (133, 384) x (384, 1)
  idx = np.argsort(-scores)[:k]
  top_k = [{**_records[i], "score": float(scores[i])} for i in idx]
  return top_k
