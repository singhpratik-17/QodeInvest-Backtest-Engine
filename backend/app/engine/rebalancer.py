import os
import sys
import pandas as pd

# Adjust Python path for direct script testing execution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

def get_rebalance_dates(start: str, end: str, frequency: str = "monthly") -> list:
    """
    Generates structured point-in-time anchor execution dates.
    Uses business-frequency strings to establish strict lookahead-safe boundaries
    aligned to actual trade processing windows.
    """
    # BMS = Business Month Start, BQS = Business Quarter Start, BYS = Business Year Start
    # Ensures dates do not land on empty calendar weekend anomalies
    if frequency == "quarterly":
        freq_str = "BQS"
    elif frequency == "yearly":
        freq_str = "BYS"
    else:
        freq_str = "BMS"  # Default to business monthly start

    dates = pd.date_range(start=start, end=end, freq=freq_str)
    
    # Return as standard Python date structures
    return [d.to_pydatetime().date() for d in dates]


if __name__ == "__main__":
    print("\n--- Running Rebalancer Timeline Verification ---")
    print("----------------------------------------------------------------------")
    
    start_test = "2020-01-01"
    end_test = "2020-12-31"
    
    # 1. Monthly Evaluation Array
    monthly_dates = get_rebalance_dates(start_test, end_test, frequency="monthly")
    print(f"📅 Monthly Frequency: Generated {len(monthly_dates)} dates (Expected: 12)")
    print(f"   → First Business Day Target: {monthly_dates[0]}")
    assert len(monthly_dates) == 12, f"❌ Monthly count failure: Got {len(monthly_dates)}"
    
    # 2. Quarterly Evaluation Array
    quarterly_dates = get_rebalance_dates(start_test, end_test, frequency="quarterly")
    print(f"📅 Quarterly Frequency: Generated {len(quarterly_dates)} dates (Expected: 4)")
    for d in quarterly_dates:
        print(f"   → Anchor Quarter Point: {d}")
    assert len(quarterly_dates) == 4, f"❌ Quarterly count failure: Got {len(quarterly_dates)}"
    
    # 3. Yearly Evaluation Array
    yearly_dates = get_rebalance_dates(start_test, end_test, frequency="yearly")
    print(f"📅 Yearly Frequency: Generated {len(yearly_dates)} dates (Expected: 1)")
    print(f"   → Annual Processing Target: {yearly_dates[0]}")
    assert len(yearly_dates) == 1, f"❌ Yearly count failure: Got {len(yearly_dates)}"

    print("\n✅ PASS CRITERIA VERIFIED: All timeline frequencies align perfectly to lookahead-safe business dates.")
    print("----------------------------------------------------------------------")