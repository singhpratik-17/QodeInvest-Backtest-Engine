import api from "./client";

/**
 * Fetches the historical close index vector map for Nifty 50 baseline performance tracking.
 * @param {string} start - Temporal execution floor bound (YYYY-MM-DD)
 * @param {string} end - Temporal execution ceiling bound (YYYY-MM-DD)
 * @returns {Promise<Object>} Dictionary mapping date string nodes to index asset close prices.
 */

/**
 * Normalizes raw date-value benchmark dictionaries into structured array records.
 * @param {Object} benchmarkData - Raw JSON mapping of date strings to index close positions.
 * @returns {Array<{date: string, benchmark: number}>} Flattened series for charting.
 */



/**
 * Scales raw benchmark index price points into an absolute portfolio equity series curve.
 * @param {Array<{date: string, benchmark: number}>} benchmarkData - Array series from normalizeBenchmark.
 * @param {number} initialCapital - Starting portfolio cash standard (e.g., 100000).
 * @returns {Array<{date: string, benchmark: number}>} Re-indexed benchmark sequence tracking curve.
 */

export async function getBenchmark(start, end) {
  const response = await api.get("/benchmark/nifty50", {
    params: {
      start,
      end,
    },
  });

  return response.data;
}


export function normalizeBenchmark(benchmarkData) {
  if (!benchmarkData) return [];
  
  return Object.entries(benchmarkData).map(([date, value]) => ({
    date,
    benchmark: Number(value),
  }));
}

export function scaleBenchmark(benchmarkData, initialCapital) {
  if (!benchmarkData || benchmarkData.length === 0) return [];
  
  const firstValue = benchmarkData[0].benchmark;

  return benchmarkData.map((row) => ({
    ...row,
    benchmark: (row.benchmark / firstValue) * initialCapital,
  }));
}