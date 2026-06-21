import React, { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import api from "../api/client"; 

const AVAILABLE_METRICS = [
  "roe",
  "roce",
  "pe_ratio",
  "pb_ratio",
  "market_cap",
];

export default function Configure() {
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const [config, setConfig] = useState({
    start_date: "",
    end_date: "",
    frequency: "monthly",
    portfolio_size: 20,
    initial_capital: 100000,

    filters: {
      mkt_cap_min: null,
      mkt_cap_max: null,
      roce_min: null,
      pat_positive: false,
    },

    ranking: {
      metrics: [],
      composite_rank: true,
    },

    sizing_method: "equal",
    sizing_metric: "roe", 
  });

  // ✅ STEP 10.6 — Form Validation Core Logic Engine
  const validateConfig = () => {
    if (!config.start_date || !config.end_date) {
      return "Start date and End date must be fully defined";
    }

    const start = new Date(config.start_date);
    const end = new Date(config.end_date);

    if (end <= start) {
      return "End date must be after start date";
    }

    if (config.initial_capital <= 0) {
      return "Capital must be positive";
    }

    if (config.portfolio_size < 1 || config.portfolio_size > 100) {
      return "Portfolio size must be 1-100";
    }

    return null;
  };

  const handleRunBacktest = async () => {
    setValidationError(null);
    
    const errorMsg = validateConfig();
    if (errorMsg) {
      setValidationError(errorMsg);
      return; 
    }

    try {
      setLoading(true);

      // ⏳ TEMPORARY LATENCY ADDITION FOR STEP 10.7 TESTING
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const response = await api.post("/run-backtest", config);
      console.log("BACKTEST PIPELINE DATA:", response.data);
    } catch (err) {
      console.error("ENGINE EXECUTION FAULT:", err);
    } finally {
      setLoading(false);
    }
  };

  const addMetric = () => {
    if (config.ranking.metrics.length >= 3) return;

    setConfig({
      ...config,
      ranking: {
        ...config.ranking,
        metrics: [
          ...config.ranking.metrics,
          {
            field: "roe",
            ascending: false,
          },
        ],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Structural Page Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Strategy Configuration
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Define financial parameters, allocation models, and structural screening filters.
        </p>
      </div>
      
      {/* Date & Frequency Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-4 bg-emerald-400 rounded-full"></div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Date & Frequency
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          {/* Start Date */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">Start Date</label>
            <input
              type="date"
              value={config.start_date}
              onChange={(e) => setConfig({ ...config, start_date: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">End Date</label>
            <input
              type="date"
              value={config.end_date}
              onChange={(e) => setConfig({ ...config, end_date: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>

          {/* Frequency Dropdown */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">Frequency</label>
            <select 
              value={config.frequency}
              onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Portfolio Size */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">Portfolio Size</label>
            <input
              type="number"
              value={config.portfolio_size}
              onChange={(e) => setConfig({ ...config, portfolio_size: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              placeholder="e.g. 20"
            />
          </div>

          {/* Initial Capital */}
          <div className="md:col-span-2">
            <label className="block text-zinc-400 font-medium mb-1.5">Initial Capital (₹)</label>
            <input
              type="number"
              value={config.initial_capital}
              onChange={(e) => setConfig({ ...config, initial_capital: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              placeholder="e.g. 100000"
            />
          </div>
        </div>
      </div>
      
      {/* Bound Filters Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-4 bg-emerald-400 rounded-full"></div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          {/* Market Cap Min */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">Market Cap Min (Cr)</label>
            <input
              type="number"
              value={config.filters.mkt_cap_min ?? ""}
              onChange={(e) => setConfig({
                ...config,
                filters: { ...config.filters, mkt_cap_min: e.target.value === '' ? null : Number(e.target.value) }
              })}
              placeholder="e.g. 500"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>

          {/* Market Cap Max */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">Market Cap Max (Cr)</label>
            <input
              type="number"
              value={config.filters.mkt_cap_max ?? ""}
              onChange={(e) => setConfig({
                ...config,
                filters: { ...config.filters, mkt_cap_max: e.target.value === '' ? null : Number(e.target.value) }
              })}
              placeholder="e.g. 50000"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>

          {/* ROCE Minimum */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">ROCE Minimum %</label>
            <input
              type="number"
              value={config.filters.roce_min ?? ""}
              onChange={(e) => setConfig({
                ...config,
                filters: { ...config.filters, roce_min: e.target.value === '' ? null : Number(e.target.value) }
              })}
              placeholder="e.g. 15"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>

          {/* PAT Positive Checkbox */}
          <div className="flex items-center h-full pt-6">
            <label className="flex items-center space-x-3 text-zinc-300 font-medium cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={config.filters.pat_positive}
                onChange={(e) => setConfig({
                  ...config,
                  filters: { ...config.filters, pat_positive: e.target.checked }
                })}
                className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 accent-emerald-500 cursor-pointer"
              />
              <span>PAT Positive</span>
            </label>
          </div>
        </div>
      </div>

      {/* Ranking Builder Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-4 bg-emerald-400 rounded-full"></div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Ranking Strategy Builder
            </h2>
          </div>
          <button
            onClick={addMetric}
            disabled={config.ranking.metrics.length >= 3}
            className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500 disabled:opacity-40 disabled:hover:border-zinc-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors shadow-sm uppercase tracking-wider font-mono"
          >
            + Add Metric Factor ({config.ranking.metrics.length}/3)
          </button>
        </div>

        {/* Composite Rank Toggle Control Node */}
        <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-lg p-3 flex items-center text-sm">
          <label className="flex items-center space-x-3 text-zinc-300 font-medium cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={config.ranking.composite_rank}
              onChange={(e) => setConfig({
                ...config,
                ranking: {
                  ...config.ranking,
                  composite_rank: e.target.checked
                }
              })}
              className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 accent-emerald-500 cursor-pointer"
            />
            <div>
              <span className="text-white block font-semibold text-xs uppercase tracking-wider">Composite Rank</span>
              <span className="text-zinc-500 text-xs font-normal">Combine factor rankings mathematically into a unified composite metric score.</span>
            </div>
          </label>
        </div>

        {config.ranking.metrics.length === 0 ? (
          <p className="text-zinc-500 text-sm italic py-2">
            No factor sorting rules injected. Strategy will execute using baseline dataset screening ordering defaults.
          </p>
        ) : (
          <div className="space-y-3">
            {config.ranking.metrics.map((metric, idx) => {
              // ✅ Dynamic Action Dispatcher for Array Modification
              const handleMetricChange = (field, value) => {
                const updatedMetrics = [...config.ranking.metrics];
                updatedMetrics[idx] = { ...updatedMetrics[idx], [field]: value };
                setConfig({
                  ...config,
                  ranking: { ...config.ranking, metrics: updatedMetrics }
                });
              };

              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3 animate-fadeIn"
                >
                  <div className="text-xs font-mono text-zinc-500 w-6 text-center">
                    #{idx + 1}
                  </div>
                  
                  <div className="flex-1">
                    <select 
                      value={metric.field}
                      onChange={(e) => handleMetricChange("field", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none text-sm font-mono uppercase"
                    >
                      {AVAILABLE_METRICS.map((m) => (
                        <option key={m} value={m}>
                          {m.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-32">
                    <select 
                      value={String(metric.ascending)}
                      onChange={(e) => handleMetricChange("ascending", e.target.value === "true")}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none text-sm font-mono font-bold text-center"
                    >
                      <option value="false">DESC (High → Low)</option>
                      <option value="true">ASC (Low → High)</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Position Sizing Layout Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <div className="w-1 h-4 bg-emerald-400 rounded-full"></div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Position Sizing Allocation Model
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-sm">
          {/* Equal Weighted Radio */}
          <label className="flex items-center space-x-3 text-zinc-300 font-medium cursor-pointer select-none">
            <input
              type="radio"
              name="sizing"
              value="equal"
              checked={config.sizing_method === "equal"}
              onChange={(e) => setConfig({ ...config, sizing_method: e.target.value })}
              className="w-4 h-4 bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 accent-emerald-500 cursor-pointer"
            />
            <span>Equal Weighted</span>
          </label>

          {/* Market Cap Weighted Radio */}
          <label className="flex items-center space-x-3 text-zinc-300 font-medium cursor-pointer select-none">
            <input
              type="radio"
              name="sizing"
              value="market_cap"
              checked={config.sizing_method === "market_cap"}
              onChange={(e) => setConfig({ ...config, sizing_method: e.target.value })}
              className="w-4 h-4 bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 accent-emerald-500 cursor-pointer"
            />
            <span>Market Cap Weighted</span>
          </label>

          {/* Metric Weighted Radio */}
          <label className="flex items-center space-x-3 text-zinc-300 font-medium cursor-pointer select-none">
            <input
              type="radio"
              name="sizing"
              value="metric_weighted"
              checked={config.sizing_method === "metric_weighted"}
              onChange={(e) => setConfig({ ...config, sizing_method: e.target.value })}
              className="w-4 h-4 bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 accent-emerald-500 cursor-pointer"
            />
            <span>Metric Weighted</span>
          </label>

          {config.sizing_method === "metric_weighted" && (
            <div className="flex-1 max-w-xs animate-fadeIn sm:ml-auto">
              <select
                value={config.sizing_metric}
                onChange={(e) => setConfig({ ...config, sizing_metric: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none text-xs font-mono uppercase font-bold text-emerald-400"
              >
                <option value="roe">ROE Allocation Model</option>
                <option value="roce">ROCE Allocation Model</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ✅ STEP 10.6 Dynamic Error Banner UI Overlay Component */}
      {validationError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3 text-red-400 animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-sm text-white">Configuration Error</h5>
            <p className="text-xs text-red-400/90 mt-0.5">{validationError}</p>
          </div>
        </div>
      )}
    
      {/* Action Submit Trigger */}
      <div className="pt-2">
        <button
          onClick={handleRunBacktest}
          disabled={loading}
          className="w-full sm:w-auto bg-[#00e676] hover:bg-[#00c862] disabled:opacity-50 text-black font-mono font-bold tracking-wider uppercase text-sm px-8 py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-3 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Executing Backtest Engine...</span>
            </>
          ) : (
            <span>Run Backtest Suite</span>
          )}
        </button>
      </div>

      {/* Live State Terminal Debug Window */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-6 font-mono space-y-3">
        <div className="flex items-center space-x-2 border-b border-zinc-900 pb-2 text-xs text-zinc-500 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Live State Tracker Registry</span>
        </div>
        <pre className="text-xs text-emerald-400 overflow-x-auto p-2 bg-black/40 rounded">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  );
}