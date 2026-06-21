from datetime import datetime
import pandas as pd
import yfinance as yf
from sqlalchemy import text # Imported to handle raw SQL execution safely

from app.database import SessionLocal
from app.models.db_models import StockPrice


def fetch_price_dataframe(ticker: str, start="2015-01-01"):
    df = yf.download(
        ticker,
        start=start,
        auto_adjust=True,
        progress=False
    )

    if df.empty:
        return pd.DataFrame()

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df.reset_index(inplace=True)
    return df


def store_prices(ticker: str, start="2015-01-01"):
    df = fetch_price_dataframe(ticker, start=start)

    if df.empty:
        print(f"No data for {ticker}")
        return

    db = SessionLocal()
    clean_ticker = ticker.replace(".NS", "")

    try:
        # FIX: Ensure the ticker exists in the parent 'stocks' table first
        # This prevents the foreign key constraint from throwing an error.
        # FIX: Provide a value for 'company_name' to satisfy the NOT NULL constraint
        print(f"Ensuring master stock record exists for {clean_ticker}...")
        db.execute(
            text("""
                INSERT INTO stocks (ticker, company_name) 
                VALUES (:ticker, :company_name) 
                ON CONFLICT (ticker) DO NOTHING;
            """),
            {"ticker": clean_ticker, "company_name": clean_ticker}
        )
        db.commit()

        print(f"Processing {len(df)} rows for {clean_ticker}...")

        for _, row in df.iterrows():
            raw_date = row["Date"]
            clean_date_str = str(raw_date).split()[0]
            row_date = datetime.strptime(clean_date_str, "%Y-%m-%d").date()

            price = StockPrice(
                ticker=clean_ticker,
                date=row_date,
                open=float(row["Open"]),
                high=float(row["High"]),
                low=float(row["Low"]),
                close=float(row["Close"]),
                adj_close=float(row["Close"]),
                volume=int(row["Volume"])
            )

            db.merge(price)

        db.commit()
        print(f"✅ Successfully inserted and verified {clean_ticker}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error occurred: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    store_prices("TCS.NS")