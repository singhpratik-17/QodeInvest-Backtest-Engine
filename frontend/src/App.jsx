import React, { useEffect, useState } from 'react';
import Results from './pages/Results'; 
// 1. ✅ Import your newly updated Configure component
import Configure from './pages/Configure'; // Adjust path if it's inside /pages instead of /components
import { getBenchmark, normalizeBenchmark, scaleBenchmark } from './api/benchmark';

export default function App() {
  const [liveBenchmark, setLiveBenchmark] = useState([]);

  useEffect(() => {
    getBenchmark("2020-01-01", "2022-01-01")
      .then((data) => {
        const normalized = normalizeBenchmark(data);
        const scaled = scaleBenchmark(normalized, 100000);
        setLiveBenchmark(scaled); 
      })
      .catch((err) => {
        console.error("❌ BENCHMARK TRACKING ERROR:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00e676] selection:text-black antialiased">
      {/* Structural Global Container Grid */}
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        
        {/* Terminal Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              QodeInvest Platform
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Quantitative Portfolio Backtesting & Multi-Factor Strategy Engine
            </p>
          </div>
          
          {/* Status Metric Badge */}
          <div className="flex items-center space-x-2 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse"></span>
            <span className="text-zinc-400">ENGINE CORE:</span>
            <span className="text-white font-bold">ONLINE</span>
          </div>
        </div>

        {/* 2. ✅ Dashboard Content Node Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input Settings configuration mapping */}
          <div className="space-y-6">
            <Configure />
          </div>

          {/* Right Column: Historical Analytical Tracking charts & stats */}
          <div className="space-y-6">
            <Results />
          </div>

        </div>

      </div>
    </div>
  );
}