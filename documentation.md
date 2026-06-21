# Engineering Documentation: Quantitative Backtesting Engine Strategy Suite

This document outlines the design decisions, component modules, and baseline assumptions applied to satisfy safety compliance benchmarks.

---

## 🏛️ Module Breakdown

### 1. Master Orchestrator Loop (`backtest_orchestrator.py`)
* **Role:** Central transaction engine tracking step execution lines across sequential rebalance anchors. 
* **Key Feature:** Combines lookahead data shielding with forward-window pricing metrics, applying strict assertion checkpoints to ensure matrix integrity before calling down-stream reporting loops.

### 2. Filter Engine (`filter_engine.py`)
* **Role:** Processes raw inputs through configured asset constraints.
* **Key Feature:** Automatically maps structural frontend key string variants (`mkt_cap_min`) directly to the underlying database schema columns (`market_cap`) to ensure filtering criteria are applied safely.

### 3. Factor Ranking Engine (`ranking_engine.py`)
* **Role:** Evaluates multiple performance variables simultaneously using a composite grading algorithm.
* **Key Feature:** Standardizes varied scale values (e.g., fractional ratios versus large financial sums) into consistent percentile values (`pct=True`) between `0.0` and `1.0` before averaging final ranks.

### 4. Position Weight Sizer (`position_sizer.py`)
* **Role:** Translates raw ranks into precise capital tracking percentages.
* **Key Feature:** Mathematically clamps negative values and fills null records dynamically, guaranteeing that final output asset arrays always sum perfectly to a $1.0$ ($100\%$) vector allocation.

### 5. Historical Rebalancer (`rebalancer.py`)
* **Role:** Establishes execution checkpoint timelines across the strategy lifespan.
* **Key Feature:** Utilizes Business Frequency Offsets (`BMS`, `BQS`, `BYS`) to align processing anchor days strictly with open market dates, eliminating calendar weekend data anomalies.

### 6. Dynamic Metrics Calculator (`metrics.py`)
* **Role:** Generates risk and reward indicators from portfolio equity value historical arrays.
* **Key Feature:** Automatically measures the day count gap between execution steps to scale volatility and Sharpe ratio calculations correctly based on the selected frequency, avoiding reliance on hardcoded daily constants.

---

## 🔬 Operational Core Assumptions
* **Filing Timestamps:** To eliminate structural lookahead bias, corporate fundamentals are checked exclusively via true public file timestamps (`publication_date`), effectively preventing the use of information that was unknown on the rebalance day.
* **Price Continuity:** Standard calculations assume transactions are fully cleared using adjusted corporate close numbers, and any assets with unresolvable or missing data records default seamlessly to a stable cash reserve profile.