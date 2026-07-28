"""Tests for embeddings.py — vector shape + listing text construction

Unit tests, no DB. Assert invariants (384 dims, same text -> same vector,
similar text scores higher), never exact floats.

Run: pytest tests/test_embeddings.py -v
"""

import numpy as np
from embeddings import get_embedding, build_listing_text 


def test_embedding_shape():
    query = "nice view of the city in a high rise"
    embedding = get_embedding(query)
    assert len(embedding) == 384 # returns list, .shape() doesn't work here
    assert all(isinstance(x, float) for x in embedding)


def test_same_text_same_vector():
    q1 = "nice view of the city in a high rise"
    e1 = get_embedding(q1)
    e2 = get_embedding(q1)
    assert np.allclose(e1, e2) # check approximately equal


def test_similar_beats_unrelated():
    q1 = "beach town with a nice view of the sunset"
    q2 = "home in a beach town with nice sunset views"
    q3 = "a european style condo outside the city"
    e1 = get_embedding(q1)
    e2 = get_embedding(q2)
    e3 = get_embedding(q3)
    e1, e2, e3 = map(np.array, (e1, e2, e3)) # not np.array() -> will execute with no arguments
    assert e1 @ e2 > e1 @ e3 # use cosine similarity
    assert e1 @ e2 > e2 @ e3 # MiniLM is already unit-length...

