import React from "react";

export default function MetricsCards({ metrics }) {
  const cards = [
    {
      label: "CAGR",
      value: `${(metrics.cagr * 100).toFixed(2)}%`,
      desc: "Compound annual growth rate",
      color: "text-emerald-400"
    },
    {
      label: "Sharpe Ratio",
      value: metrics.sharpe.toFixed(2),
      desc: "Risk-adjusted performance",
      color: "text-white"
    },
    {
      label: "Max Drawdown",
      value: `${(metrics.max_drawdown * 100).toFixed(2)}%`,
      desc: "Peak-to-trough maximum drop",
      color: "text-rose-500"
    },
    {
      label: "Final Value",
      value: `₹${metrics.final_value.toLocaleString()}`,
      desc: "Ending portfolio value",
      color: "text-[#00e676]"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-1"
        >
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 uppercase block">
            {card.label}
          </span>

          <h2 className={`text-2xl font-black tracking-tight font-mono ${card.color}`}>
            {card.value}
          </h2>
          
          <p className="text-[11px] text-zinc-600 truncate">
            {card.desc}
          </p>
        </div>
      ))}
    </div>
  );
}