import os
import sys
import re
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from app.data.fetch_fundamentals import save_fundamental_snapshot

# Adjust Python path so it can find the app module if run directly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

def scrape_screener(company_slug: str) -> BeautifulSoup:
    """
    Fetches the raw HTML structure of a company profile from Screener.in.
    """
    url = f"https://www.screener.in/company/{company_slug}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
    }

    try:
        print(f"Requesting Screener.in profile for slug: {company_slug}...")
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 403:
            print("❌ Screener returned a 403 Forbidden Error. Cloudflare or user-agent throttling triggered.")
            return None
            
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")

    except Exception as e:
        print(f"❌ Scraping error occurred for {company_slug}: {e}")
        return None

def parse_and_save_screener_metrics(company_slug: str):
    """
    Parses historical annual ratios (like ROCE) from Screener.in's 
    HTML tables and registers each snapshot cleanly with its corresponding period_date.
    """
    soup = scrape_screener(company_slug)
    if not soup:
        print(f"❌ Could not retrieve soup matrix for {company_slug}")
        return False

    try:
        # Locate the Ratios section table
        ratios_section = soup.find("section", {"id": "ratios"})
        if not ratios_section:
            print(f"⚠️ Ratios section not found for {company_slug}")
            return False
            
        table = ratios_section.find("table")
        if not table:
            print(f"⚠️ Ratios table structure missing for {company_slug}")
            return False

        headers = [th.text.strip() for th in table.find_all("th") if th.text.strip()]
        
        # Extract calendar periods from headers (e.g., "Mar 2024")
        years = []
        for h in headers:
            match = re.search(r'(Mar|Dec)\s+(\d{4})', h)
            if match:
                month = "03" if match.group(1) == "Mar" else "12"
                years.append(f"{match.group(2)}-{month}-31")
        
        # Extract specific fundamental matrix parameters (ROCE row example)
        rows = table.find_all("tr")
        for row in rows:
            cols = row.find_all("td")
            if cols and "ROCE" in cols[0].text:
                values = [c.text.strip().replace("%", "") for c in cols[1:]]
                
                for idx, period_str in enumerate(years):
                    if idx < len(values):
                        try:
                            val_str = values[idx]
                            roce_val = float(val_str) if val_str and val_str != "0" else None
                            
                            snapshot_data = {
                                "pe_ratio": None,
                                "market_cap": None,
                                "roe": None,
                                "roce": roce_val
                            }
                            
                            period_date = datetime.strptime(period_str, "%Y-%m-%d").date()
                            save_fundamental_snapshot(company_slug, snapshot_data, period_date)
                        except ValueError:
                            continue
        return True
    except Exception as e:
        print(f"❌ Error compiling historical parse matrix for {company_slug}: {e}")
        return False

if __name__ == "__main__":
    print("Starting Screener parsing validation...")
    parse_and_save_screener_metrics("TCS")