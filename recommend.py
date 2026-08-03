"""Week 7 — hybrid recommendation over active listings

Listing id in -> top-k similar rets_property rows out, comp-checked vs california_sold.
Structured score + embedding similarity. Thin TS skill calls over HTTP.
"""


def calculate_similarity_score(target, candidate): 

    price_diff = target["price"] - candidate["price"]
    score = 0

    if price_diff < 50000: score += 20
    elif price_diff < 150000: score += 12
    elif price_diff < 300000: score += 5
    return round(score, 2)
