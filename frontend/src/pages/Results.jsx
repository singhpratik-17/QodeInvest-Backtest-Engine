import React, { useState, useEffect } from "react";
import MetricsCards from "../components/MetricsCards/MetricsCards";
import EquityCurve from "../components/EquityCurve/EquityCurve";
import DrawdownChart from "../components/DrawdownChart/DrawdownChart";
import PortfolioLog from "../components/PortfolioLog/PortfolioLog.jsx";
import WinnersLosers from "../components/WinnersLosers/WinnersLosers.jsx";
import ExportButton from "../components/ExportButton/ExportButton.jsx";

// Import your verified benchmark data services
import { getBenchmark, normalizeBenchmark, scaleBenchmark } from "../api/benchmark";

// ==========================================
// QUANTITATIVE BACKTEST MOCK DATASET VECTORS
// ==========================================
const mockMetrics = {
  cagr: 0.18,
  sharpe: 1.45,
  max_drawdown: -0.12,
  final_value: 285000,
};

// Base strategy curve vector
const mockEquityCurve = [
  { date: "2020-01-01", value: 100000 },
  { date: "2020-06-01", value: 120000 },
  { date: "2021-01-01", value: 150000 },
  { date: "2021-12-31", value: 285000 },
];

const mockDrawdown = [
  { date: "2020-01", drawdown: 0 },
  { date: "2020-06", drawdown: -0.05 },
  { date: "2021-01", drawdown: -0.12 }, // Maximum drawdown peak point
  { date: "2022-01", drawdown: -0.03 },
];

const mockLogs = [
  { date: "2022-01-01", holdings: ["TCS", "INFY"], weights: "50%, 50%", return: 4.50 },
  { date: "2022-02-01", holdings: ["RELIANCE", "HDFC"], weights: "60%, 40%", return: -1.20 },
  { date: "2022-03-01", holdings: ["ICICI", "SBIN"], weights: "30%, 70%", return: 2.85 },
  { date: "2022-04-01", holdings: ["BHARTIARTL", "ITC"], weights: "55%, 45%", return: 5.10 },
  { date: "2022-05-01", holdings: ["TATASTEEL", "LT"], weights: "40%, 60%", return: -3.40 },
  { date: "2022-06-01", holdings: ["MARUTI", "M&M"], weights: "50%, 50%", return: 0.90 },
  { date: "2022-07-01", holdings: ["HINDUNILVR", "AXISBANK"], weights: "65%, 35%", return: 1.65 },
  { date: "2022-08-01", holdings: ["WIPRO", "HCLTECH"], weights: "45%, 55%", return: -2.10 },
  { date: "2022-09-01", holdings: ["ASIANPAINT", "KOTAKBANK"], weights: "50%, 50%", return: 3.40 },
  { date: "2022-10-01", holdings: ["SUNPHARMA", "CIPLA"], weights: "40%, 60%", return: 4.25 },
  { date: "2022-11-01", holdings: ["NTPC", "POWERGRID"], weights: "70%, 30%", return: 1.15 },
  { date: "2022-12-01", holdings: ["ONGC", "COALINDIA"], weights: "50%, 50%", return: -0.75 }
];

const mockWinners = [
  { ticker: "TCS", return: 145.00 },
];

const mockLosers = [
  { ticker: "XYZ", return: -28.00 },
];

// ==========================================
//          CORE RESULTS DASHBOARD
// ==========================================
export default function Results() {
  // STEP 9B.6 — State node container for historical tracking series
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function loadBenchmark() {
      try {
        // Use the EXACT date range that successfully prints in App.jsx
        const startDate = "2020-01-01";
        const endDate = "2022-01-01"; // Changed from 2021-12-31 to 2022-01-01
        const initialCapital = 100000;

        // 1. Fetch raw points from API
        const raw = await getBenchmark(startDate, endDate);

        // 2. Normalize dictionary to array rows
        const normalized = normalizeBenchmark(raw);

        // 3. Re-index values from the initial capital foundation
        const scaledBenchmark = scaleBenchmark(normalized, initialCapital);

        // 4. Merge live benchmark dates into our strategy equity curve points
        const mergedTimeline = scaledBenchmark.map((benchPoint) => {
          const strategyMatch = mockEquityCurve.find((strat) => strat.date === benchPoint.date);
          
          return {
            date: benchPoint.date,
            benchmark: benchPoint.benchmark,
            value: strategyMatch ? strategyMatch.value : undefined,
          };
        });

        // Fill down missing strategy values for sequential rendering
        let lastKnownValue = initialCapital;
        const fullyPopulatedData = mergedTimeline.map((node) => {
          if (node.value !== undefined) {
            lastKnownValue = node.value;
          }
          return {
            ...node,
            value: lastKnownValue,
          };
        });

        setChartData(fullyPopulatedData);
      } catch (err) {
        console.error("❌ Failed auto-loading real engine benchmarks:", err);
        setChartData(mockEquityCurve);
      }
    }

    loadBenchmark();
  }, []);


  return (
    <div className="space-y-6">
      {/* Integrated Dashboard Title & Export Row */}
      <div className="border-b border-zinc-800 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Backtest Results
          </h1>
          <p className="text-sm text-zinc-500 mt-1 hidden sm:block">
            Analytical telemetry, risk attribution matrices, and historical execution performance logs.
          </p>
        </div>

        <ExportButton logs={mockLogs} metrics={mockMetrics} />
      </div>

      {/* Summary Analytics Deck */}
      <MetricsCards metrics={mockMetrics} />

      {/* Charts Side-by-Side Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        <EquityCurve data={mockEquityCurve} liveBenchmark={chartData} />
        <DrawdownChart data={mockDrawdown} />
      </div>
      {/* Transaction Rebalance Execution Table */}
      <PortfolioLog logs={mockLogs} />

      {/* Winners & Losers Distribution Blocks */}
      <WinnersLosers winners={mockWinners} losers={mockLosers} />
    </div>
  );
}