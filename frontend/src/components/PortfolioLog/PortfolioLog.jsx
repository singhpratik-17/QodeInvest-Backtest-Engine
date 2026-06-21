import React, { useState } from "react";

function PortfolioLog({ logs }) {
  // Pagination State Indexes
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Compute boundaries for array subdivision
  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const paginatedLogs = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-md font-bold tracking-tight text-white">Historical Portfolio Log</h3>
          <p className="text-xs text-zinc-500 font-mono">Periodic rebalancing actions and transaction allocation telemetry</p>
        </div>
        {/* Page status telemetry readout badge */}
        <div className="text-xs font-mono text-zinc-500 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md self-start sm:self-auto">
          Page {page} of {totalPages || 1}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <th className="pb-3 font-medium">Rebalance Date</th>
              <th className="pb-3 font-medium">Allocated Holdings</th>
              <th className="pb-3 font-medium text-right">Position Weights</th>
              <th className="pb-3 font-medium text-right">Period Return</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
            {paginatedLogs.map((row, idx) => {
              const isPositive = row.return >= 0;
              return (
                <tr key={idx} className="hover:bg-zinc-950/40 transition-colors">
                  <td className="py-3.5 text-zinc-300 font-medium">{row.date}</td>
                  <td className="py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {row.holdings.map((ticker) => (
                        <span key={ticker} className="bg-zinc-950 border border-zinc-800 text-zinc-200 px-2 py-0.5 rounded text-[11px] font-bold">
                          {ticker}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 text-right text-zinc-400">{row.weights}</td>
                  <td className={`py-3.5 text-right font-bold ${isPositive ? "text-emerald-400" : "text-rose-500"}`}>
                    {isPositive ? `+${row.return.toFixed(2)}%` : `${row.return.toFixed(2)}%`}
                  </td>
                </tr>
              );
            })}
            
            {logs.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-zinc-600 font-mono text-xs">
                  No execution log entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Action Controls Grid Segment Wrapper */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-lg transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-lg transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default PortfolioLog;