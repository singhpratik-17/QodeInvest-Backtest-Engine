import React from "react";

function WinnersLosers({ winners, losers }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Top Winners Card Block */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 mb-4 font-mono uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Top Alpha Drivers (Winners)
        </h3>

        <div className="space-y-2 font-mono text-xs">
          {winners.map((w) => (
            <div 
              key={w.ticker} 
              className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/50 rounded-lg hover:border-zinc-700/60 transition-colors"
            >
              <span className="text-zinc-200 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {w.ticker}
              </span>
              <span className="text-emerald-400 font-bold">
                +{w.return.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers Card Block */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 mb-4 font-mono uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Risk Underperformers (Losers)
        </h3>

        <div className="space-y-2 font-mono text-xs">
          {losers.map((l) => (
            <div 
              key={l.ticker} 
              className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/50 rounded-lg hover:border-zinc-700/60 transition-colors"
            >
              <span className="text-zinc-200 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {l.ticker}
              </span>
              <span className="text-rose-500 font-bold">
                {l.return.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default WinnersLosers;