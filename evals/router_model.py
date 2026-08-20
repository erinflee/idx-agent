"""Benchmark candidate 2 — trained router: MiniLM embeddings + logistic regression

The one trained-model artifact. Embeds each query with the local model
(embeddings.py, same as search/RAG) and fits scikit-learn LogisticRegression on
the answers.jsonl labels. Unlike the keyword ladders' binary word lists, learned
weights are graded — so it can weigh "condo" weakly and "show me" strongly,
which is exactly where the ladder's misroutes live.

Ships only if it beats the keyword ladder (0.712 on answers.jsonl at time of
writing) on heldout overall AND wins the no-lexical-signal misroutes — bar set
before training.

Contract: classify(query: str) -> intent str, per router_benchmark.
Train once: python -m evals.router_model   (fits + saves the model artifact)
"""

import joblib 
from pathlib import Path
from embeddings import get_embedding, embed_batch
from .load_answers import load_cases
from sklearn.linear_model import LogisticRegression

MODEL_FILE = Path(__file__).with_name("router_model.joblib")
_model = joblib.load(MODEL_FILE)

def build_features(queries):
  embeddings = embed_batch(queries)
  return embeddings


def train_router():
  train = load_cases()
  train_queries = [t.query for t in train]
  train_intents = [t.intent for t in train]
  train_embeddings = build_features(train_queries)

  model = LogisticRegression(max_iter=1000)
  model.fit(train_embeddings, train_intents)
  accuracy = model.score(train_embeddings, train_intents)
  print(f"Training Accuracy: {accuracy * 100:.2f}%")
  joblib.dump(model, MODEL_FILE)

