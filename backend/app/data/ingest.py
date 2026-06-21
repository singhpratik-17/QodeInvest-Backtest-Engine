import os
import sys

# Adjust Python path so it can find the app module if run directly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from app.data.fetch_prices import store_prices
from app.data.scrape_screener import parse_and_save_screener_metrics

# Validation Tickers (Phase 3 Spec)
TICKERS_MAP = {
    "TCS.NS": "TCS",
    "INFY.NS": "INFY",
    "RELIANCE.NS": "RELIANCE"
}

def run_master_ingestion():
    print("🚀 Starting Master Seed Ingestion Pipeline...")
    
    for yf_ticker, screener_slug in TICKERS_MAP.items():
        print(f"\n==================================================")
        print(f"🔄 Processing Core Ingestion for: {yf_ticker}")
        print(f"==================================================")
        
        # 1. Daily Historical Price Matrix Ingestion
        try:
            store_prices(yf_ticker, start="2015-01-01")
            print(f"📈 Prices successfully populated for {yf_ticker}")
        except Exception as e:
            print(f"❌ PRICE SEED FAILURE for {yf_ticker}: {e}")

        # 2. Point-in-Time Fundamental Matrix Ingestion
        try:
            success = parse_and_save_screener_metrics(screener_slug)
            if success:
                print(f"📋 Fundamentals snapshot successfully synced for {screener_slug}")
            else:
                print(f"⚠️ Fundamentals scraping encountered limitations for {screener_slug}")
        except Exception as e:
            print(f"❌ FUNDAMENTAL SEED FAILURE for {screener_slug}: {e}")

    print("\n✅ Master Seed Pipeline Process Completed.")

if __name__ == "__main__":
    run_master_ingestion()