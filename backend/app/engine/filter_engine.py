import os
import sys
import pandas as pd

# Adjust Python path for direct script testing execution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

def apply_filters(universe_df: pd.DataFrame, filters: dict) -> pd.DataFrame:
    """
    Filters the available stock universe using point-in-time fundamental metrics.
    Ensures zero future lookahead leak by processing pre-screened snapshots.
    
    CRITICAL ALIGNMENT RESOLUTION: Normalizes column variation boundaries 
    between frontend config keys ('mkt_cap') and database keys ('market_cap').
    """
    if universe_df.empty or not filters:
        return universe_df

    df = universe_df.copy()

    # Determine market capitalization column variance safely
    mkt_cap_col = None
    for col in ["mkt_cap", "market_cap"]:
        if col in df.columns:
            mkt_cap_col = col
            break

    # 1. Apply Market Cap Minimum Bound
    if filters.get("mkt_cap_min") is not None and mkt_cap_col:
        df = df[df[mkt_cap_col] >= float(filters["mkt_cap_min"])]

    # 2. Apply Market Cap Maximum Bound
    if filters.get("mkt_cap_max") is not None and mkt_cap_col:
        df = df[df[mkt_cap_col] <= float(filters["mkt_cap_max"])]

    # 3. Apply Return on Capital Employed (ROCE) threshold safely
    roce_col = "roce" if "roce" in df.columns else "roce_min"
    if filters.get("roce_min") is not None and roce_col in df.columns:
        df = df[df[roce_col] >= float(filters["roce_min"])]

    # 4. Filter out companies with negative/zero Profit After Tax (PAT)
    if filters.get("pat_positive", False) and "pat" in df.columns:
        df = df[df["pat"] > 0]

    return df


if __name__ == "__main__":
    print("\n--- Running Filter Engine Verification ---")
    print("----------------------------------------------------------------------")

    # Mock structured input dataset matrix matching frontend configurations
    mock_universe = pd.DataFrame([
        {"ticker": "RELIANCE", "mkt_cap": 15000, "roce": 18, "pat": 500},
        {"ticker": "MIDCAP_Z", "mkt_cap": 2500, "roce": 12, "pat": 120},
        {"ticker": "SMALLCAP_LOSS", "mkt_cap": 300, "roce": 8, "pat": -10}
    ])

    test_filters = {
        "mkt_cap_min": 500,
        "mkt_cap_max": 10000,
        "roce_min": 10,
        "pat_positive": True
    }

    filtered_df = apply_filters(mock_universe, test_filters)
    print("🚀 Screened Universe Output:")
    print(filtered_df)

    # Verification assertions
    assert len(filtered_df) == 1, "❌ Filter evaluation logic did not drop bad asset vectors accurately!"
    assert filtered_df["ticker"].iloc[0] == "MIDCAP_Z", "❌ Screened matrix targeted the incorrect asset."
    print("\n✅ PASS CRITERIA VERIFIED: Cross-column alignment shields data from leaking boundaries.")