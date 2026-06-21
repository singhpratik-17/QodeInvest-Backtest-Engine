import os
import sys
import yfinance as yf
from datetime import date
from sqlalchemy import text  # Imported to handle raw SQL execution safely
from app.database import SessionLocal


# Adjust Python path so it can find the app module if run directly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

def get_yfinance_fundamentals(ticker: str) -> dict:
    """
    Fetches core fundamental metrics for a given ticker from Yahoo Finance.
    """
    try:
        print(f"Fetching structural fundamentals from yfinance for {ticker}...")
        stock = yf.Ticker(ticker)
        info = stock.info

        return {
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "pb_ratio": info.get("priceToBook"),
            "roe": info.get("returnOnEquity"),
            "revenue": info.get("totalRevenue")
        }
    except Exception as e:
        print(f"❌ Error fetching fundamentals for {ticker}: {e}")
        return {
            "market_cap": None,
            "pe_ratio": None,
            "pb_ratio": None,
            "roe": None,
            "revenue": None
        }
    


def save_fundamental_snapshot(ticker: str, data: dict, period_date: date):
    """
    Saves a point-in-time fundamental snapshot to prevent lookahead bias.
    """
    db = SessionLocal()
    clean_ticker = ticker.replace(".NS", "")
    
    try:
        existing = db.execute(
            text("""
                SELECT id FROM fundamentals 
                WHERE ticker = :ticker AND period_date = :period_date;
            """),
            {"ticker": clean_ticker, "period_date": period_date}
        ).fetchone()

        if existing:
            db.execute(
                text("""
                    UPDATE fundamentals 
                    SET market_cap = :market_cap, pe_ratio = :pe_ratio, roe = :roe, roce = :roce
                    WHERE id = :id;
                """),
                {
                    "id": existing.id,
                    "market_cap": data.get("market_cap"),
                    "pe_ratio": data.get("pe_ratio"),
                    "roe": data.get("roe"),
                    "roce": data.get("roce") # <-- Included in update
                }
            )
            print(f"🔄 Updated fundamental snapshot for {clean_ticker} on {period_date}")
        else:
            db.execute(
                text("""
                    INSERT INTO fundamentals (ticker, period_date, period_type, market_cap, pe_ratio, roe, roce)
                    VALUES (:ticker, :period_date, :period_type, :market_cap, :pe_ratio, :roe, :roce);
                """),
                {
                    "ticker": clean_ticker,
                    "period_date": period_date,
                    "period_type": "annual",
                    "market_cap": data.get("market_cap"),
                    "pe_ratio": data.get("pe_ratio"),
                    "roe": data.get("roe"),
                    "roce": data.get("roce") # <-- Included in insert
                }
            )
            print(f"✅ Inserted new fundamental snapshot for {clean_ticker} on {period_date}")
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Failed to save snapshot for {clean_ticker} on {period_date}: {e}")
    finally:
        db.close()