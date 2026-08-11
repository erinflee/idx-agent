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


def rag_answer(query): 
  client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=os.environ["GOOGLE_API_KEY"]
  )

  prompt = """You are a real-estate knowledge assistant for an MLS data platform. You answer
  questions using ONLY the source excerpts provided in each message.

  Rules:
  - Base every claim on the provided excerpts. Do not add outside knowledge, even
    if you know the answer.
  - End your answer with a line "Source: <name>" naming the excerpt(s) you used.
  - If the excerpts do not contain the answer, reply exactly:
    "That isn't covered in my source documents." — with no other text.
  - Keep answers to 2-4 sentences in plain language. Expand acronyms once.
  """
  hits = retrieve(query) 
  if hits[0]["score"] < MIN_SCORE:   # return default answer if top embedding doesn't have sufficient score
    return "That isn't covered in my source documents."
  context = "\n\n".join(f"Source: {h["source"]}\n{h["chunk"]}" for h in hits) 
  context += f"\n\nQuestion: {query}"

  response = client.chat.completions.create(
    model=model,
    messages = [
      {"role": "system", "content": prompt},
      {"role": "user", "content": context}
    ]
  )

  return response.choices[0].message.content