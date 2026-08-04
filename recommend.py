"""Week 7 — hybrid recommendation over active listings

Listing id in -> top-k similar rets_property rows out, comp-checked vs california_sold.
Structured score + embedding similarity. Thin TS skill calls over HTTP.
"""

import numpy as np
import pandas as pd
from db import engine
from sqlalchemy import text
from pathlib import Path
from semantic import fetch_listing_details

PATH = Path(__file__).parent / "listing_embeddings.npz"

try:
    _data = np.load(PATH)
except FileNotFoundError:
    print("Unable to load embeddings")

_ids = _data["ids"]
_embeddings = _data["embeddings"]


def calculate_similarity_score(target, candidate, target_emb, candidate_emb): 
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

    if target_emb is None or candidate_emb is None:
        return round(score, 2)
    
    cosine_similarity = np.array(target_emb) @ np.array(candidate_emb) # embeddings already normalized by length (unit norm) 
    score += cosine_similarity * 40
    return round(score, 2)


def get_embedding_by_id(listing_id):
    i = np.where(_ids == listing_id)
    embedding = _embeddings[i]
    if not embedding:
        return None
    return embedding


def validate_with_comps(city, sqft, price):
    sql = text(""" 
        SELECT 
            COUNT(*) AS compCount,
            AVG( ClosePrice / NULLIF(LivingArea, 0)) as avgPricePerSqft

        FROM california_sold 

        WHERE City = :city
            AND LivingArea <= :sqft * 1.2
            AND LivingArea >= :sqft * 0.8
            AND CloseDate <= CURDATE()
            AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            AND PropertySubType = 'SingleFamilyResidence';
    """)

    df = pd.read_sql(sql, con=engine, params={"city": city, "sqft": sqft})

    if df["compCount"].iloc[0] == 0:
        return None

    comp_count = df["compCount"].iloc[0]
    avg_price_per_sqft = df["avgPricePerSqft"].iloc[0]
    comp_price = sqft * avg_price_per_sqft
    delta_percentage = (price - comp_price) / comp_price * 100
    return {
        "price": price,
        "comp_price": round(comp_price),
        "comp_count": comp_count,
        "delta_percentage": round(delta_percentage, 1)
    }


def get_recommendations(listing_id, k=5): # listing_id is what user likes and wants more recs for
    target_emb = get_embedding_by_id(listing_id)
    scores = _embeddings @ target_emb # (53k, 384) x (384, 1)
    idx = np.argpartition(-scores, kth=k)[:k]
    sorted_idx = idx[np.argsort(-scores[idx])]
    top_k_ids = _ids[sorted_idx].tolist()
    dicts = fetch_listing_details([listing_id] + top_k_ids)
    target = dicts[listing_id]
    results = []

    for i in top_k_ids:
        candidate = dicts[i] 
        candidate_emb = get_embedding_by_id(i)
        score = calculate_similarity_score(target, candidate, target_emb, candidate_emb)
        comp = validate_with_comps(candidate["city"], candidate["sqft"], candidate["price"])
        results.append({**candidate, "score": score, "comp": comp})

    return results