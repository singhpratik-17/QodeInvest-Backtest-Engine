# QodeInvest Backtesting Engine Strategy Suite

An engineered, point-in-time (PIT) financial backtesting application designed to simulate multi-factor screening and portfolio asset allocation strategies across custom frequency horizons. Built specifically to eliminate data lookahead bias, enforce perfect position-weight convergence, and normalize index benchmark tracking performance cleanly against your initial capital parameter baselines.

---

## 🎬 Submission Deliverables

* **Video Demonstration:** [INSERT YOUR LOOM/YOUTUBE LINK HERE]

---

## 🏛️ Architecture Blueprint

```text
                  +-------------------------------------------+
                  |         React Frontend Dashboard          |
                  +---------------------+---------------------+
                                        | HTTP REST (JSON)
                                        v
                  +---------------------+---------------------+
                  |           FastAPI / Python API            |
                  +---------------------+---------------------+
                                        | Orchestrates
                                        v
+---------------------------------------+---------------------------------------+
|                             Backtest Engine Pipeline                          |
|                                                                               |
|  +--------------------+      +--------------------+      +-----------------+  |
|  |   Rebalance Loop   | ---> |   Filter Engine    | ---> | Ranking Engine  |  |
|  |  (Business Dates)  |      |   (PIT Checking)   |      | (Multi-Factor)  |  |
|  +--------------------+      +--------------------+      +-----------------+  |
|                                                                   |           |
|  +--------------------+      +--------------------+               |           |
|  |   Metrics Engine   | <--- |   Position Sizer   | <-------------+           |
|  |  (Dynamic Scaling) |      | (Weight Sums = 1.0)|                           |
|  +--------------------+      +--------------------+                           |
+-------------------------------------------------------------------------------+



1. Backend Engine Construction
Navigate to your backend workspace folder to prepare the Python environment:

Bash
# Move to the engine app workspace
cd backend

# Create an isolated python environment structure
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

# Install performance handling dependency packages
pip install --upgrade pip
pip install -r requirements.txt

# Run the master engine orchestrator unit verification suite directly
python app/engine/backtest_orchestrator.py
2. Frontend Interface Deployment
Navigate to your web repository shell to establish client component runtimes:

Bash
# Move to the dashboard interface folder
cd frontend

# Install package dependencies
npm install

# Initialize your local interface development engine
npm run dev
💾 Seeding Historical Testing Data
To populate your database with point-in-time financial metrics, execute the pipeline seed automation handler:

Bash
cd backend
python -m app.database.seed_pipeline --source=historical_PIT_bundle.csv



Strategy Configuration Controls
The frontend UI provides explicit modular controls to feed the strategy processing engine:

Date & Horizon Windows: User-defined historical horizons featuring automatic parsing step constraints.

Structural Screening Filters: Lower and upper bound boundaries covering Market Capitalization (mkt_cap_min/mkt_cap_max), minimum Return on Capital Employed (roce_min), and positive Profit After Tax (pat_positive) flags.

Ranking Strategy Builder: Multi-factor matrix grading loops utilizing up to 3 unified financial variables simultaneously (e.g., ROE, ROCE, P/E Ratio, P/B Ratio) with dynamic ascending or descending tracking flags.

Allocation Sizing Models: Toggle options between Equal Weight, Market Cap Weight, or Custom Metric Weight modes.



Mathematical Design Assumptions
To preserve the integrity of performance simulation profiles, the execution engine enforces three strict architectural axioms.
1. True Point-in-Time IsolationFundamental variables are queried and integrated exclusively via financial statement publication_date tracking arrays, rather than calendar period ending points. This guarantees:$$\text{fundamentals.date} \le \text{rebalance\_date}$$
2. Benchmark Capital NormalizationHistorical benchmark comparative indexes (e.g., Nifty 50) are scaled dynamically to avoid initialization offsets, forcing both strategy and benchmark to start at precisely $\sim$ ₹100,000:$$\text{Scaled Benchmark Asset Value}_t = \text{Initial Capital} \times \left( \frac{\text{Index Closing Price}_t}{\text{Index Closing Price}_0} \right)$$
3. Weight Allocation ConvergenceAll target allocation arrays calculated via individual or multi-factor metrics are passed through clamp vectors ensuring total weight sums converge precisely to $1.0$ ($100\%$):$$\sum_{i=1}^{N} W_i = 1.0$$
Weight Allocation
 ConvergenceAll target allocation arrays calculated via individual or multi-factor metrics are passed through clamp vectors ensuring total weight sums converge precisely to $1.0$ ($100\%$):$$\sum_{i=1}^{N} W_i = 1.0$$














