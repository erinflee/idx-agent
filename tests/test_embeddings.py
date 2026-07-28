"""Tests for embeddings.py — vector shape + listing text construction

Unit tests, no DB. Assert invariants (384 dims, same text -> same vector,
similar text scores higher), never exact floats.

Run: pytest tests/test_embeddings.py -v
"""
