/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Automated Trading Bots & Strategy Execution Dashboard
 */

import React, { useState, useEffect } from 'react';
import { Bot, Play, Pause, Square, PlusCircle, TrendingUp, Cpu, Activity, CheckCircle2 } from 'lucide-react';
import { TradingBot } from '../types.ts';
import { generateGridLevels } from '../utils/engine.ts';

export const TradingBotsView: React.FC = () => {
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [botName, setBotName] = useState('BTC Volatility Grid Bot');
  const [botType, setBotType] = useState<'grid' | 'dca' | 'arbitrage'>('grid');
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [investment, setInvestment] = useState(3000);
  const [lowerPrice, setLowerPrice] = useState(62000);
  const [upperPrice, setUpperPrice] = useState(68000);
  const [gridCount, setGridCount] = useState(10);

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/bots');
      const data = await res.json();
      setBots(data.bots || []);
    } catch (err) {
      console.error('Failed to fetch bots:', err);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleToggleBot = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await fetch(`/api/bots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchBots();
    } catch (err) {
      console.error('Failed to update bot:', err);
    }
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: botName,
          type: botType,
          symbol,
          investmentUSDT: investment,
          config: {
            lowerPrice,
            upperPrice,
            gridCount,
          },
        }),
      });
      setIsCreating(false);
      fetchBots();
    } catch (err) {
      console.error('Failed to create bot:', err);
    }
  };

  // Live grid calculation preview
  const gridPreview =
    botType === 'grid' && lowerPrice < upperPrice && gridCount >= 2
      ? generateGridLevels(lowerPrice, upperPrice, gridCount, 65000, investment)
      : null;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl">
        <div>
          <span className="text-[10px] text-[#00f59b] font-mono uppercase tracking-wider block font-bold">
            Algorithmic Strategy Automation
          </span>
          <h2 className="text-xl font-bold font-['Outfit'] text-white">Trading Bot Command Center</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Deploy high-frequency Grid Trading, Dollar-Cost Averaging (DCA), and Arbitrage spread bots with 24/7 autonomous execution.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00f59b] hover:bg-[#00d888] text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-[#00f59b]/20 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Deploy New Bot</span>
        </button>
      </div>

      {/* Create Bot Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateBot}
            className="w-full max-w-lg bg-[#0d121c] border border-[#212b3e] rounded-xl shadow-2xl p-6 space-y-4 text-xs font-mono"
          >
            <div className="flex justify-between items-center border-b border-[#18202f] pb-3">
              <h3 className="font-bold text-white font-['Outfit'] text-sm">Deploy Autonomous Trading Bot</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">BOT NAME</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full bg-[#121927] border border-[#1f2c41] rounded px-3 py-2 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">STRATEGY TYPE</label>
                <select
                  value={botType}
                  onChange={(e) => setBotType(e.target.value as any)}
                  className="w-full bg-[#121927] border border-[#1f2c41] rounded px-3 py-2 text-white"
                >
                  <option value="grid">Spot Neutral Grid</option>
                  <option value="dca">Dollar Cost Averaging (DCA)</option>
                  <option value="arbitrage">Cross-Venue Arbitrage Prober</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">TARGET PAIR</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-[#121927] border border-[#1f2c41] rounded px-3 py-2 text-white"
                >
                  <option value="BTC/USDT">BTC/USDT</option>
                  <option value="ETH/USDT">ETH/USDT</option>
                  <option value="SOL/USDT">SOL/USDT</option>
                  <option value="ALIEN/USDT">ALIEN/USDT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ALLOCATED CAPITAL (USDT)</label>
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
                className="w-full bg-[#121927] border border-[#1f2c41] rounded px-3 py-2 text-white tabular-nums"
                required
              />
            </div>

            {botType === 'grid' && (
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#111724] border border-[#1b2538] rounded-lg">
                <div>
                  <label className="text-[9px] text-slate-400 block mb-1">LOWER PRICE</label>
                  <input
                    type="number"
                    value={lowerPrice}
                    onChange={(e) => setLowerPrice(Number(e.target.value))}
                    className="w-full bg-[#0d121c] border border-[#1f2c41] rounded px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block mb-1">UPPER PRICE</label>
                  <input
                    type="number"
                    value={upperPrice}
                    onChange={(e) => setUpperPrice(Number(e.target.value))}
                    className="w-full bg-[#0d121c] border border-[#1f2c41] rounded px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block mb-1">GRID LEVELS</label>
                  <input
                    type="number"
                    value={gridCount}
                    onChange={(e) => setGridCount(Number(e.target.value))}
                    className="w-full bg-[#0d121c] border border-[#1f2c41] rounded px-2 py-1.5 text-white"
                  />
                </div>
              </div>
            )}

            {gridPreview && (
              <div className="p-3 bg-[#0c1624] border border-[#192b45] rounded-lg text-[11px] text-[#00e5ff] flex justify-between">
                <span>Profit per Grid: <strong>{gridPreview.profitPerGridPercent}%</strong></span>
                <span>Amount / Grid: <strong>${gridPreview.amountPerGrid}</strong></span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 bg-[#182132] text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#00f59b] hover:bg-[#00d888] text-slate-950 font-bold rounded"
              >
                Launch Bot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {bots.map((bot) => {
          const isActive = bot.status === 'active';
          return (
            <div
              key={bot.id}
              className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-4 hover:border-[#223147] transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#141b28] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-[#00f59b]/10 text-[#00f59b]' : 'bg-slate-800 text-slate-400'}`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white font-['Outfit'] text-sm">{bot.name}</h3>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Pair: {bot.symbol} · Type: <span className="uppercase text-[#00e5ff]">{bot.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-sans uppercase font-bold ${
                      isActive ? 'bg-[#00f59b]/10 text-[#00f59b] border border-[#00f59b]/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {bot.status}
                  </span>
                  <button
                    onClick={() => handleToggleBot(bot.id, bot.status)}
                    className="p-1.5 bg-[#131b29] hover:bg-[#1a2538] text-slate-300 rounded cursor-pointer"
                    title={isActive ? 'Pause bot' : 'Resume bot'}
                  >
                    {isActive ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-[#00f59b]" />}
                  </button>
                </div>
              </div>

              {/* Bot Performance Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[#0d121c] rounded-lg border border-[#141b28]">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Investment</span>
                  <span className="text-xs font-bold text-white tabular-nums">
                    ${bot.investmentUSDT.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Total PnL</span>
                  <span className="text-xs font-bold text-[#00f59b] tabular-nums">
                    +${(bot.realizedPnL + bot.unrealizedPnL).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">ROI</span>
                  <span className="text-xs font-bold text-[#00e5ff] tabular-nums">
                    +{bot.roiPercent}%
                  </span>
                </div>
              </div>

              {/* Runtime and fills */}
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Runtime: <strong className="text-white">{bot.runtimeHours} hours</strong></span>
                <span>Fills Completed: <strong className="text-white">{bot.tradesCompleted}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
