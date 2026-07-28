"""Tests for embeddings.py — vector shape + listing text construction

Unit tests, no DB. Assert invariants (384 dims, same text -> same vector,
similar text scores higher), never exact floats.

Run: pytest tests/test_embeddings.py -v
"""

import get_embedding, build_listing_text


def test_embedding_shape():
    query = "nice view of the city in a high rise"
    embedding = get_embedding(query)
    assert embedding.shape() == (384,)