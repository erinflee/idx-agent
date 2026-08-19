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
