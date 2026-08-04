"""Week 7 — hybrid recommendation over active listings

Listing id in -> top-k similar rets_property rows out, comp-checked vs california_sold.
Structured score + embedding similarity. Thin TS skill calls over HTTP.
"""

import numpy as np
import pandas as pd
from db import engine
from sqlalchemy import text
from pathlib import Path

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
    candidate_emb = _embeddings[i]
    if not candidate_emb:
        return None
    return candidate_emb


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
        "comp_price": comp_price,
        "comp_count": comp_count,
        "delta_percentage": delta_percentage
    }
