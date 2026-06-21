import os
import sys
import pandas as pd
import numpy as np

# Adjust Python path for direct script testing execution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

def compute_weights(portfolio_df: pd.DataFrame, method: str = "equal", weight_metric: str = "mkt_cap") -> dict:
    """
    Computes lookahead-safe portfolio target allocations.
    Returns a dictionary mapping tickers to their fractional weight values.
    
    CRITICAL CHECK #3 Enforcement: Guarantees the sum of all allocation elements 
    converges strictly to 1.0 (100%) across all input vectors.
    """
    if portfolio_df.empty:
        return {}

    tickers = portfolio_df["ticker"].tolist()
    n = len(tickers)

    if n == 0:
        return {}

    # 1. EQUAL WEIGHTING METHOD
    if method == "equal":
        w = 1.0 / n
        return {t: float(w) for t in tickers}

    # 2. MARKET CAP WEIGHTING METHOD
    elif method == "market_cap":
        # Handle field mismatches by unifying frontend 'mkt_cap' or filter naming conventions
        cap_col = "mkt_cap" if "mkt_cap" in portfolio_df.columns else "market_cap"
        
        if cap_col not in portfolio_df.columns:
            return {t: float(1.0 / n) for t in tickers}
            
        caps = portfolio_df[cap_col].fillna(0).astype(float).values
        # Clamp negative values to protect calculation limits
        caps = np.clip(caps, a_min=0, a_max=None)
        total_cap = np.sum(caps)
        
        # If total asset weight distribution is zero, fallback gracefully to equal weights
        if total_cap <= 0:
            return {t: float(1.0 / n) for t in tickers}
            
        return {row["ticker"]: float(max(0, float(row[cap_col])) / total_cap) for _, row in portfolio_df.iterrows()}

    # 3. CUSTOM METRIC WEIGHTING METHOD (e.g., ROE / ROCE)
    elif method == "metric" or method == "metric_weighted":
        metric_col = weight_metric
        if metric_col not in portfolio_df.columns:
            return {t: float(1.0 / n) for t in tickers}
            
        # Ensure values are numeric and replace negative/null values with 0
        metrics = portfolio_df[metric_col].fillna(0).astype(float).values
        metrics = np.clip(metrics, a_min=0, a_max=None)
        total_metric = np.sum(metrics)
        
        # If all filtered metrics are 0 or negative, allocate equally to maintain safety bounds
        if total_metric <= 0:
            return {t: float(1.0 / n) for t in tickers}
            
        return {tickers[i]: float(metrics[i] / total_metric) for i in range(n)}

    # General Safe Fallback Core
    return {t: float(1.0 / n) for t in tickers}


if __name__ == "__main__":
    print("\n--- Running Position Sizer Weighting Verification ---")
    
    # Mock data setup containing an edge case: Ticker C has a negative calculation score!
    df = pd.DataFrame({
        "ticker": ["A", "B", "C"],
        "mkt_cap": [500000.0, 300000.0, 200000.0],
        "roe": [25.0, 15.0, -5.0]  # Ticker C has negative ROE
    })
    
    # Test 1: Equal Weight Calculation
    eq_weights = compute_weights(df, method="equal")
    print("\n⚖️ [EQUAL WEIGHT METHOD]")
    for t, w in eq_weights.items():
        print(f"   Ticker {t}: {w:.4f}")
    print(f"   → Total Sum: {sum(eq_weights.values()):.4f}")
    assert abs(sum(eq_weights.values()) - 1.0) < 1e-6
    
    # Test 2: Market Cap Weight Calculation
    mc_weights = compute_weights(df, method="market_cap")
    print("\n🏢 [MARKET CAP WEIGHT METHOD]")
    for t, w in mc_weights.items():
        print(f"   Ticker {t}: {w:.4f}")
    print(f"   → Total Sum: {sum(mc_weights.values()):.4f}")
    assert abs(sum(mc_weights.values()) - 1.0) < 1e-6

    # Test 3: Metric Weight Calculation handling extreme negative values
    mt_weights = compute_weights(df, method="metric", weight_metric="roe")
    print("\n📊 [METRIC WEIGHT METHOD (ROE with negative clamp handling)]")
    for t, w in mt_weights.items():
        print(f"   Ticker {t}: {w:.4f}")
    print(f"   → Total Sum: {sum(mt_weights.values()):.4f}")
    
    # Final Critical Convergence Check Assertion
    assert abs(sum(mt_weights.values()) - 1.0) < 1e-6, "❌ Weight Sum Deviation detected!"
    print("\n✅ PASS CRITERIA VERIFIED: Weights sum perfectly to 1.0 (100%) under all validation routines.")
    print("----------------------------------------------------------------------")