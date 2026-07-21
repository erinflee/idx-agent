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

  price = text("""
    SELECT ClosePrice 
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
  
  price_df = pd.read_sql(price, con=engine, params={"city": city, "month": month})
  medianPrice = round(price_df["ClosePrice"].median())
  records = df.to_dict(orient='records')
  records[0]["medClosePrice"] = medianPrice
  return records



def get_price_trend(city, month=12):
  query = text("""
    SELECT
      DATE_FORMAT( CloseDate, '%Y-%m' ) AS month,
      COUNT(*) AS sales,
      ROUND( AVG(ClosePrice), 0) AS avgPrice

    FROM california_sold

    WHERE City = :city
    AND PropertySubType = 'SingleFamilyResidence'
    AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL :month MONTH)
    AND CloseDate <= CURDATE()
    AND LivingArea > 0

    GROUP BY month
    ORDER BY month
  """)
  df = pd.read_sql(query, con=engine, params={"city": city, "month": month})
  if df.empty:
    return None
  
  df['priceChangePct'] = df["avgPrice"].pct_change() * 100
  df = df.astype(object).where(pd.notnull(df), None)
  return df.to_dict(orient='records')


def main():
  df = get_market_summary("Los Angeles")
  print(df)


if __name__ == "__main__":
  main()

