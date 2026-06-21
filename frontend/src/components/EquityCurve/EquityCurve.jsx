import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function EquityCurve({ data, liveBenchmark = [] }) {
  // Format numeric values into localized Indian Currency notation for clean Y-Axis readouts
  const formatCurrency = (val) => {
    return `₹${(val / 1000).toFixed(0)}k`;
  };

  // STEP 9B.7 — Merge Strategy + Benchmark Series smoothly on the timeline
  // If liveBenchmark is available, map strategy points and attach matching benchmark elements
  const combinedChartData = liveBenchmark.length > 0 
    ? liveBenchmark.map((benchNode) => {
        // Find if there's an explicit strategy plot for this date
        const strategyMatch = data.find((strat) => strat.date === benchNode.date);
        return {
          date: benchNode.date,
          benchmark: benchNode.benchmark,
          // If no specific strategy data points exist for this micro-timestamp, Recharts handles it gracefully
          value: strategyMatch ? strategyMatch.value : undefined,
        };
      })
    : data; // Fallback to raw strategy input vector if benchmark data stream hasn't arrived

  // If we merged with detailed benchmark tracking, fill down missing strategy spots to prevent line breaks
  let lastKnownValue = data[0]?.value || 100000;
  const finalizedChartData = liveBenchmark.length > 0
    ? combinedChartData.map((node) => {
        if (node.value !== undefined) {
          lastKnownValue = node.value;
        }
        return {
          ...node,
          value: lastKnownValue,
        };
      })
    : combinedChartData;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-md font-bold tracking-tight text-white">Strategy Growth vs Benchmark</h3>
        <p className="text-xs text-zinc-500 font-mono">Historical performance tracking matrix</p>
      </div>

      <div className="h-[400px] w-full text-xs font-mono">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={finalizedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              tickFormatter={formatCurrency}
              dx={-5}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: "#09090b",
                borderColor: "#27272a",
                borderRadius: "8px",
                color: "#ffffff"
              }}
              formatter={(value, name) => [`₹${Math.round(value).toLocaleString()}`, name]}
            />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ paddingTop: '0px' }}
            />

            {/* Strategy Track Vector - Glowing Emerald */}
            <Line
              type="monotone"
              dataKey="value"
              name="My Strategy"
              stroke="#00e676"
              strokeWidth={3}
              dot={liveBenchmark.length > 0 ? false : { fill: "#00e676", strokeWidth: 1, r: 4 }} // Turn off heavy dots for dense daily series
              activeDot={{ r: 6, strokeWidth: 0 }}
            />

            {/* Benchmark Track Vector - Clean Desaturated Slate Muted Line */}
            <Line
              type="monotone"
              dataKey="benchmark"
              name="Nifty 50"
              stroke="#71717a"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false} // Clean rendering for 400+ entries
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}