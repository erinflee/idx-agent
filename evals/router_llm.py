"""Benchmark candidate 3 — LLM router: Gemini classifies the intent per query

The expensive candidate: one gemini-2.5-flash call per query (reuses rag.py's
CLIENT/MODEL), prompted to reply with a single intent word as strict JSON.
Parse failures and off-vocabulary replies fall back to "unknown" rather than
crashing the benchmark. Expected to win the no-lexical-signal tail the other
candidates can't reach — the benchmark prices that win in latency (~1s/query
vs ~0ms) and per-query cost.

Prompt tuned on answers.jsonl only; heldout stays untouched until the final run.

Contract: classify(query: str) -> intent str, per router_benchmark.
Benchmark runs make ~118 flash calls — pace for the free tier or run on paid.
"""
