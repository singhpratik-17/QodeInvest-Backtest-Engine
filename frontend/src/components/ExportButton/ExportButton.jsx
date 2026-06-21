import React from "react";
import * as XLSX from "xlsx";

export default function ExportButton({ logs = [], metrics = {} }) {
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // 🟢 STEP 9.4 — Flatten array structures so Excel renders clean text cells
    const cleanLogsForExcel = logs.map((item) => ({
      date: item.date,
      holdings: Array.isArray(item.holdings) ? item.holdings.join(", ") : item.holdings,
      weights: item.weights,
      return: item.return,
    }));

    // Generate sheet objects cleanly
    const logSheet = XLSX.utils.json_to_sheet(cleanLogsForExcel);
    const metricsSheet = XLSX.utils.json_to_sheet([metrics]);

    // Append sheets to workbook matching exact naming specs
    XLSX.utils.book_append_sheet(workbook, logSheet, "Portfolio Log");
    XLSX.utils.book_append_sheet(workbook, metricsSheet, "Metrics");

    // Save out workbook binary package
    XLSX.writeFile(workbook, "backtest_results.xlsx");
  };

  return (
    <button
      onClick={exportToExcel}
      className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-[#00e676] hover:text-emerald-300 border border-zinc-800 hover:border-zinc-700 font-mono text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md cursor-pointer active:scale-[0.98]"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      <span>EXPORT EXCEL</span>
    </button>
  );
}