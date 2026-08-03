"""Week 7 — hybrid recommendation over active listings

Listing id in -> top-k similar rets_property rows out, comp-checked vs california_sold.
Structured score + embedding similarity. Thin TS skill calls over HTTP.
"""

import numpy as np
from pathlib import Path

PATH = Path(__file__).parent / "listing_embeddings.npz"

try:
    _data = np.load(PATH)
except FileNotFoundError:
    print("Unable to load embeddings")

_ids = _data["ids"]
_embeddings = _data["embeddings"]


def calculate_similarity_score(target, candidate): 

    price_diff = abs(target["price"] - candidate["price"])
    score = 0

    if price_diff < 50000: score += 20
    elif price_diff < 150000: score += 12
    elif price_diff < 300000: score += 5

    if target["beds"] == candidate["beds"]: score += 15
    if target["city"] == candidate["city"]: score += 15

    sqft_diff = abs(target["sqft"] - candidate["sqft"])
    if sqft_diff < 300: score += 10
    elif sqft_diff < 700: score += 5

    return round(score, 2)


def get_embedding_by_id(listing_id):
    i = np.where(_ids == listing_id)
    candidate_emb = _embeddings[i]
    if not candidate_emb:
        return None
    return candidate_emb