import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

export default function DrawdownChart({ data }) {
  // Format numeric percentage ratios to readable strings (e.g., -12.00%)
  const formatPercentage = (val) => {
    return `${(val * 100).toFixed(0)}%`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-md font-bold tracking-tight text-white">Historical Drawdown %</h3>
        <p className="text-xs text-zinc-500 font-mono">Underwater exposure and risk duration matrices</p>
      </div>

      <div className="h-[300px] w-full text-xs font-mono">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" vertical={false} />
            
            <XAxis 
              dataKey="date" 
              stroke="#52525b" 
              tickLine={false}
              dy={10}
            />
            
            <YAxis 
              stroke="#52525b" 
              tickLine={false} 
              tickFormatter={formatPercentage}
              dx={-5}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: "#09090b",
                borderColor: "#27272a",
                borderRadius: "8px",
                color: "#ffffff"
              }}
              formatter={(value) => [`${(value * 100).toFixed(2)}%`, "Drawdown"]}
            />

            {/* Risk Area Track Vector — Muted Crimson to Dark Gradient Fill */}
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#drawdownColor)"
            />

            {/* Highlighted Maximum Risk Stress Zone Node */}
            <ReferenceArea
              x1="2020-06"
              x2="2021-01"
              fill="#f43f5e"
              fillOpacity={0.12}
            />

            {/* Gradient Vector Definition Definitions Node */}
            <defs>
              <linearGradient id="drawdownColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}