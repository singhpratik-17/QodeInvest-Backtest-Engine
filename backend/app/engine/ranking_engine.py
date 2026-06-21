import os
import sys
import pandas as pd

# Adjust Python path for direct script testing execution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

def rank_stocks(filtered_df: pd.DataFrame, ranking_config: dict) -> pd.DataFrame:
    """
    Ranks filtered stocks using a multi-factor calculation ruleset.
    Calculates numerical ranking benchmarks and sorts by global composite average.
    
    CRITICAL SAFETY IMPLEMENTATION: Protects ranking evaluation scales from 
    distorting factor weights if certain parameters contain sparse records.
    """
    if filtered_df.empty:
        return filtered_df

    if not ranking_config or not ranking_config.get("metrics"):
        # Fallback cleanly to a default copy index structure if no metrics config exists
        return filtered_df.copy().reset_index(drop=True)

    df = filtered_df.copy()
    rank_cols = []

    for metric in ranking_config["metrics"]:
        col = metric["field"]
        
        # Flexibly handle column key differences between frontend configuration styles
        if col not in df.columns:
            if col == "market_cap" and "mkt_cap" in df.columns:
                col = "mkt_cap"
            elif col == "mkt_cap" and "market_cap" in df.columns:
                col = "market_cap"
            else:
                continue
            
        ascending = metric.get("ascending", False)
        rank_name = f"{col}_rank"

        # Generate fractional ranking metrics to ensure score normalization across metrics
        # Higher/lower values resolve onto standard [0, 1] relative bounds
        df[rank_name] = df[col].astype(float).rank(ascending=ascending, method="min", pct=True)
        rank_cols.append(rank_name)

    if rank_cols:
        # Compute the composite average across valid factor scoring profiles
        df["composite_rank"] = df[rank_cols].mean(axis=1)
        return df.sort_values("composite_rank").reset_index(drop=True)
        
    return df.reset_index(drop=True)


if __name__ == "__main__":
    print("\n--- Running Ranking Engine Verification ---")
    print("----------------------------------------------------------------------")
    
    # Mock data layout mapping multiple competing metrics
    df = pd.DataFrame([
        {"ticker": "INFY", "roe": 20.0, "mkt_cap": 80000},
        {"ticker": "TCS", "roe": 30.0, "mkt_cap": 120000},
        {"ticker": "WIPRO", "roe": 15.0, "mkt_cap": 40000},
    ])

    config = {
        "metrics": [
            {"field": "roe", "ascending": False},       # Higher ROE is better (TCS -> INFY -> WIPRO)
            {"field": "market_cap", "ascending": False} # Higher Cap is better (maps to mkt_cap)
        ]
    }

    ranked_df = rank_stocks(df, config)
    print("🚀 Balanced Multi-Factor Ranked Output:")
    print(ranked_df[["ticker", "roe", "mkt_cap", "composite_rank"]])

    # Assert structural safety behaviors
    assert ranked_df["ticker"].iloc[0] == "TCS", "❌ Ranking engine failed sorting priorities."
    assert "composite_rank" in ranked_df.columns, "❌ Composite column score trace vector was not generated."
    print("\n✅ PASS CRITERIA VERIFIED: Dynamic metric keys map and sort cleanly onto standard index scales.")