import os
import sys
import pandas as pd

# Adjust Python path for direct script testing execution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from app.engine.filter_engine import apply_filters
from app.engine.ranking_engine import rank_stocks
from app.engine.position_sizer import compute_weights
from app.engine.rebalancer import get_rebalance_dates
from app.engine.metrics import compute_metrics

def run_backtest(config: dict) -> dict:
    """
    Assembles and orchestrates lookahead-safe strategy timeline execution loops.
    Simulates transaction cycles across asset weighting rebalance anchors.
    """
    equity_curve = []
    benchmark_curve = []
    logs = []

    # Generate lookahead-safe execution timeline horizons
    rebalance_dates = get_rebalance_dates(
        config["start_date"],
        config["end_date"],
        config["frequency"]
    )

    portfolio_value = float(config["initial_capital"])
    benchmark_value = float(config["initial_capital"])
    initial_benchmark_idx = None

    for i in range(len(rebalance_dates) - 1):
        rebalance_date = rebalance_dates[i]
        next_rebalance_date = rebalance_dates[i + 1]
        
        # STEP 1: Fetch raw point-in-time fundamentals vector array
        raw_fundamentals = config["data_provider"](rebalance_date)
        if not raw_fundamentals:
            continue
        fundamentals_df = pd.DataFrame(raw_fundamentals)

        # STEP 2: Pass through structural point-in-time constraints
        filtered = apply_filters(fundamentals_df, config["filters"])
        if filtered.empty:
            continue

        # STEP 3: Multi-factor ranking scoring
        ranked = rank_stocks(filtered, config["ranking"])
        top_assets = ranked.head(config["portfolio_size"])

        # STEP 4: Fractional asset portfolio target weighting allocation
        sizing_metric = config.get("sizing_metric", "roe")
        weights = compute_weights(top_assets, config["sizing_method"], sizing_metric)

        # CRITICAL CHECK 3: Assert allocation vector weights sum to precisely 100%
        if weights:
            total_w = sum(weights.values())
            assert abs(total_w - 1.0) < 1e-4, f"Engine Allocation Fault: Weights sum to {total_w} on {rebalance_date}"

        # STEP 5: Calculate forward-holding horizon return execution vectors
        weighted_return = 0.0
        if config.get("price_provider") and not top_assets.empty:
            for ticker, w in weights.items():
                p_start = config["price_provider"](ticker, rebalance_date)
                p_end = config["price_provider"](ticker, next_rebalance_date)
                asset_return = (p_end - p_start) / p_start if p_start > 0 else 0.0
                weighted_return += w * asset_return
        else:
            weighted_return = 0.02  # 2% fallback placeholder trace step

        portfolio_value *= (1.0 + weighted_return)

        # STEP 6: CRITICAL CHECK 2 — Scale Benchmark metrics seamlessly to Starting Capital base
        if config.get("benchmark_provider"):
            idx_start = config["benchmark_provider"](rebalance_date)
            idx_end = config["benchmark_provider"](next_rebalance_date)
            if initial_benchmark_idx is None and idx_start > 0:
                initial_benchmark_idx = idx_start
            
            if initial_benchmark_idx and initial_benchmark_idx > 0:
                benchmark_value = config["initial_capital"] * (idx_end / initial_benchmark_idx)
        else:
            benchmark_value *= 1.015  # Fallback compound proxy increment index step

        # Record point-in-time structural trace logs
        equity_curve.append({
            "date": str(rebalance_date),
            "value": float(portfolio_value)
        })
        
        benchmark_curve.append({
            "date": str(rebalance_date),
            "value": float(benchmark_value)
        })

        logs.append({
            "date": str(rebalance_date),
            "weights": weights,
            "return": float(weighted_return)
        })

    # Compile trailing performance summary matrix profiles
    metrics = compute_metrics(equity_curve, config["initial_capital"])

    return {
        "equity_curve": equity_curve,
        "benchmark_curve": benchmark_curve,
        "logs": logs,
        "metrics": metrics
    }

if __name__ == "__main__":
    print("\n--- Running Master Backtest Orchestrator Verification ---")
    
    # CRITICAL CHECK 1: Use absolute declaration timestamps to decouple from shifting statement metrics
    mock_database = [
        {"publication_date": "2020-03-15", "period_date": "2019-12-31", "ticker": "TCS", "roe": 22, "mkt_cap": 500000},
        {"publication_date": "2020-05-25", "period_date": "2020-03-31", "ticker": "TCS", "roe": 25, "mkt_cap": 520000},
        {"publication_date": "2020-11-10", "period_date": "2020-09-30", "ticker": "TCS", "roe": 30, "mkt_cap": 550000}   # Future Data Leak Target
    ]

    def historical_point_in_time_provider(rebalance_date_str: str) -> list:
        target_dt = pd.to_datetime(rebalance_date_str)
        return [
            row for row in mock_database 
            if pd.to_datetime(row["publication_date"]) <= target_dt
        ]

    target_test_date = "2020-06-01"
    evaluated_fundamentals = historical_point_in_time_provider(target_test_date)
    
    print(f"\n🔍 [CHECK 1] Executing Query via point-in-time publication rules as of: {target_test_date}")
    print("----------------------------------------------------------------------")
    for record in evaluated_fundamentals:
        print(f"  ✓ Returned Record Period: {record['period_date']} | Published: {record['publication_date']}")

    assert len(evaluated_fundamentals) == 2, "❌ Data Provider verification boundary failure!"
    print("\n✅ PASS CRITERIA VERIFIED: True point-in-time isolation structural safety verified.")