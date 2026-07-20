"""Week 5 — market stats over california_sold (Python port of stats.ts)

Aggregate stats per city -> a thin TS skill calls this over HTTP later
"""


import pandas as pd
from sqlalchemy import text
from db import engine


def get_market_summary(city, month=12):
  query = text("""
    SELECT 
      COUNT(*) AS soldCount,
      ROUND( AVG( CAST(DaysOnMarket AS DOUBLE) ), 1) AS avgDom,
      ROUND( AVG(ClosePrice), 0) AS avgClosePrice,
      ROUND( AVG(ClosePrice / NULLIF(LivingArea, 0) ) ) AS avgPricePerSqft,
      ROUND( AVG(ClosePrice / NULLIF(ListPrice, 0) ) * 100, 1) AS listToClosePct

    FROM california_sold

    WHERE City = :city
      AND PropertySubType = 'SingleFamilyResidence'
      AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL :month MONTH)
      AND CloseDate <= CURDATE()
      AND LivingArea > 0
  """)

  df = pd.read_sql(query, con=engine, params={"city": city, "month": month})
  if df.empty or df["soldCount"].iloc[0] == 0:
    return None
  return df
