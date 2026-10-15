/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Strategy Backtester & Paper Trading Sandbox Engine
 */

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, TrendingUp, BarChart2, ShieldCheck, DollarSign, Award, ArrowUpRight } from 'lucide-react';
import { BacktestResult } from '../types.ts';

interface PaperTradingBacktestModalProps {
  currentSymbol: string;
  paperBalances: Record<string, number>;
  onResetPaperBalance: () => void;
  onTradeInPaper: () => void;
}

export const PaperTradingBacktestModal: React.FC<PaperTradingBacktestModalProps> = ({
  currentSymbol,
  paperBalances,
  onResetPaperBalance,
  onTradeInPaper,
}) => {
  const [strategy, setStrategy] = useState<'rsi_mean_reversion' | 'ema_crossover' | 'bollinger_breakout'>('rsi_mean_reversion');
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [timeframe, setTimeframe] = useState<string>('1h');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const runBacktest = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy,
          symbol: currentSymbol,
          timeframe,
          initialBalance: initialCapital,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to run backtest:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runBacktest();
  }, [strategy, currentSymbol, timeframe]);

  // Equity Curve min/max for SVG rendering
  const minEquity = result ? Math.min(...result.equityCurve.map((e) => e.equity)) * 0.98 : 0;
  const maxEquity = result ? Math.max(...result.equityCurve.map((e) => e.equity)) * 1.02 : 1;
  const equityRange = maxEquity - minEquity || 1;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Top Banner: Paper Trading Wallet Status */}
      <div className="p-5 bg-gradient-to-r from-[#0d131f] via-[#101826] to-[#0c121e] border border-[#1e2a3f] rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-[#00e5ff] font-mono uppercase tracking-wider block font-bold">
            Simulated Sandbox Environment
          </span>
          <h2 className="text-xl font-bold font-['Outfit'] text-white">Paper Trading & Strategy Backtesting Engine</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Test institutional execution algorithms and custom strategies with zero financial risk.
          </p>
        </div>

        {/* Paper Balances Strip */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#141d2d] border border-[#202d44] rounded-lg font-mono text-xs">
            <span className="text-slate-400 text-[10px] block">Virtual USDT</span>
            <span className="text-[#00f59b] font-bold text-sm tabular-nums">
              ${(paperBalances.USDT || 50000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={onResetPaperBalance}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1b2537] hover:bg-[#223048] text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Reset paper funds to default $50,000"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Reset $50K</span>
          </button>

          <button
            onClick={onTradeInPaper}
            className="px-4 py-2 bg-[#00f59b] hover:bg-[#00d888] text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-[#00f59b]/20 cursor-pointer"
          >
            Trade In Paper Mode
          </button>
        </div>
      </div>

      {/* Main Grid: Control Panel + Backtest Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backtest Configuration */}
        <div className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#18202f] pb-3">
            <h3 className="font-bold text-white font-['Outfit'] text-sm">Strategy Parameters</h3>
            <span className="text-[10px] text-slate-400">180 Bars Sampled</span>
          </div>

          {/* Strategy Selector */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 uppercase">Quantitative Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as any)}
              className="w-full bg-[#111724] border border-[#1f2c41] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f59b]"
            >
              <option value="rsi_mean_reversion">RSI (14) Dynamic Oversold Mean-Reversion</option>
              <option value="ema_crossover">EMA (20 / 50) Trend-Follow Momentum</option>
              <option value="bollinger_breakout">Bollinger Bands (20, 2) Volatility Breakout</option>
            </select>
          </div>

          {/* Initial Capital */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 uppercase">Starting Capital (USDT)</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-[#111724] border border-[#1f2c41] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f59b] tabular-nums"
            />
          </div>

          {/* Timeframe */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 uppercase">Bar Resolution</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['15m', '1h', '4h', '1D'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`py-1.5 rounded text-[11px] transition-colors ${
                    timeframe === tf
                      ? 'bg-[#00f59b]/20 text-[#00f59b] font-bold border border-[#00f59b]/40'
                      : 'bg-[#111724] text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Pair info */}
          <div className="p-3 bg-[#111724] rounded-lg border border-[#1a2436] flex justify-between items-center text-slate-300">
            <span>Selected Pair:</span>
            <span className="font-bold text-white">{currentSymbol}</span>
          </div>

          {/* Run Button */}
          <button
            onClick={runBacktest}
            disabled={isRunning}
            className="w-full py-2.5 bg-[#00e5ff] hover:bg-[#00c8df] text-slate-950 font-bold font-sans rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
            <span>{isRunning ? 'Calculating Simulation...' : 'Run Quantitative Backtest'}</span>
          </button>
        </div>

        {/* Results Metrics & Equity Chart */}
        <div className="lg:col-span-2 p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-5">
          {result ? (
            <>
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#101623] border border-[#192437] rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase block">Net Return</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-base font-bold text-[#00f59b] tabular-nums">
                      +{result.returnPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400">(+${result.netProfitUSDT.toLocaleString()})</span>
                  </div>
                </div>

                <div className="p-3 bg-[#101623] border border-[#192437] rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase block">Win Rate</span>
                  <div className="text-base font-bold text-white tabular-nums mt-0.5">
                    {result.winRatePercent}%
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      ({result.winningTrades}W / {result.losingTrades}L)
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#101623] border border-[#192437] rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase block">Profit Factor</span>
                  <div className="text-base font-bold text-[#00e5ff] tabular-nums mt-0.5">
                    {result.profitFactor}x
                  </div>
                </div>

                <div className="p-3 bg-[#101623] border border-[#192437] rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase block">Max Drawdown</span>
                  <div className="text-base font-bold text-[#f43f5e] tabular-nums mt-0.5">
                    -{result.maxDrawdownPercent}%
                  </div>
                </div>
              </div>

              {/* Equity Curve SVG Chart */}
              <div className="p-4 bg-[#080b10] border border-[#161f2e] rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-300">Simulated 30-Day Equity Curve</span>
                  <span className="text-[10px] text-slate-400">
                    Sharpe Ratio: <strong className="text-white">{result.sharpeRatio}</strong> · Ending: <strong className="text-[#00f59b]">${result.finalBalance.toLocaleString()}</strong>
                  </span>
                </div>

                {/* SVG Visualizer */}
                <div className="h-44 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="40" x2="600" y2="40" stroke="#141c2b" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="600" y2="80" stroke="#141c2b" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="120" x2="600" y2="120" stroke="#141c2b" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Gradient Area */}
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f59b" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#00f59b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <polygon
                      points={`0,160 ${result.equityCurve
                        .map((pt, idx) => {
                          const x = (idx / (result.equityCurve.length - 1)) * 600;
                          const y = 160 - ((pt.equity - minEquity) / equityRange) * 150;
                          return `${x},${y}`;
                        })
                        .join(' ')} 600,160`}
                      fill="url(#equityGrad)"
                    />

                    {/* Line stroke */}
                    <polyline
                      points={result.equityCurve
                        .map((pt, idx) => {
                          const x = (idx / (result.equityCurve.length - 1)) * 600;
                          const y = 160 - ((pt.equity - minEquity) / equityRange) * 150;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#00f59b"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>Day 1 (Start)</span>
                  <span>Day 15</span>
                  <span>Day 30 (Conclusion)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 font-mono text-xs">
              Initializing backtesting model...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
