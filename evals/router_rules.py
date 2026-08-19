"""Benchmark candidate 1 — Python port of the production keyword router

Mirrors classifyIntent() in skills/orchestrator/orchestrator.ts: same word
lists, same mixed -> recommend -> knowledge -> search -> market -> unknown
ladder. Kept in lockstep by hand — edit both together; the parity check below
asserts the port matches the TS ladder's expected routes on the shared test
queries, so the benchmark grades the router we actually ship.

Contract: classify(query: str) -> intent str, per router_benchmark.
"""
