/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trading Journal & Psychological Mistake Tagger Component
 */

import React, { useState } from 'react';
import { BookOpen, PlusCircle, CheckCircle2, AlertTriangle, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';
import { JournalEntry } from '../types.ts';

export const TradingJournalModal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: 'JRN-01',
      timestamp: Date.now() - 1000 * 60 * 60 * 18,
      symbol: 'BTC/USDT',
      side: 'BUY',
      entryPrice: 63800,
      exitPrice: 65200,
      size: 0.5,
      pnlUSDT: 700,
      emotionalTag: 'Disciplined',
      mistakeTag: 'None',
      notes: 'Waited for 1h Bullish Order Block retest. Set strict invalidation stop below $63,200. Scaled out at first resistance.',
      aiFeedback: 'Exemplary trade execution. Position sizing matched risk tolerance; take-profit respected structural resistance.',
    },
    {
      id: 'JRN-02',
      timestamp: Date.now() - 1000 * 60 * 60 * 42,
      symbol: 'SOL/USDT',
      side: 'BUY',
      entryPrice: 158.2,
      exitPrice: 151.4,
      size: 20,
      pnlUSDT: -136,
      emotionalTag: 'FOMO',
      mistakeTag: 'Chased Entry',
      notes: 'Saw Twitter hype around ecosystem launch and bought market order without waiting for 15m pullback.',
      aiFeedback: 'Classic late entry into exhaustion wick. Next time, set limit bids at the 0.618 Fibonacci retracement instead of buying green candles.',
    },
    {
      id: 'JRN-03',
      timestamp: Date.now() - 1000 * 60 * 60 * 96,
      symbol: 'ETH/USDT',
      side: 'SELL',
      entryPrice: 3520,
      exitPrice: 3420,
      size: 2.0,
      pnlUSDT: 200,
      emotionalTag: 'Calm',
      mistakeTag: 'None',
      notes: 'Bearish divergence on 4h RSI. Clean rejection at $3,540 overhead supply.',
      aiFeedback: 'Well-timed short entry. Invalidation was tight, yielding 3.2:1 reward-to-risk.',
    },
  ]);

  const [symbol, setSymbol] = useState('BTC/USDT');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('65000');
  const [exitPrice, setExitPrice] = useState('65800');
  const [size, setSize] = useState('0.2');
  const [emotionalTag, setEmotionalTag] = useState<JournalEntry['emotionalTag']>('Disciplined');
  const [mistakeTag, setMistakeTag] = useState<JournalEntry['mistakeTag']>('None');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Compute metrics
  const totalPnL = entries.reduce((acc, curr) => acc + curr.pnlUSDT, 0);
  const disciplinedTrades = entries.filter((e) => e.emotionalTag === 'Disciplined' || e.emotionalTag === 'Calm').length;
  const adherenceRate = Math.round((disciplinedTrades / (entries.length || 1)) * 100);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entryP = Number(entryPrice);
    const exitP = Number(exitPrice);
    const sz = Number(size);
    const pnl = side === 'BUY' ? (exitP - entryP) * sz : (entryP - exitP) * sz;

    const newEntry: JournalEntry = {
      id: `JRN-${Date.now().toString().slice(-4)}`,
      timestamp: Date.now(),
      symbol,
      side,
      entryPrice: entryP,
      exitPrice: exitP,
      size: sz,
      pnlUSDT: Number(pnl.toFixed(2)),
      emotionalTag,
      mistakeTag,
      notes: notes || 'Manual journal log',
      aiFeedback:
        mistakeTag === 'None'
          ? 'Great adherence to your defined trading rules. Protecting capital and managing drawdowns is the hallmark of longevity.'
          : `Noted behavioral leak (${mistakeTag}). Logged for pattern tracking in your monthly performance audit.`,
    };

    setEntries([newEntry, ...entries]);
    setIsAdding(false);
    setNotes('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header and PnL metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl">
        <div>
          <span className="text-[10px] text-[#00f59b] font-mono uppercase tracking-wider block font-bold">
            Behavioral Performance & Psychology
          </span>
          <h2 className="text-xl font-bold font-['Outfit'] text-white">Trading Journal & Mistake Tracker</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Identify emotional trading leaks, track discipline adherence, and receive AI coaching on trade executions.
          </p>
        </div>

        {/* Adherence and PnL strips */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 bg-[#101622] border border-[#192336] rounded-lg">
            <span className="text-[10px] text-slate-400 block">Total Journal PnL</span>
            <span className={`text-base font-bold tabular-nums ${totalPnL >= 0 ? 'text-[#00f59b]' : 'text-[#f43f5e]'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </span>
          </div>

          <div className="px-3 py-1.5 bg-[#101622] border border-[#192336] rounded-lg">
            <span className="text-[10px] text-slate-400 block">Rule Adherence</span>
            <span className="text-base font-bold text-[#00e5ff] tabular-nums">
              {adherenceRate}%
            </span>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#00f59b] hover:bg-[#00d888] text-slate-950 font-bold font-sans text-xs rounded-lg transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Trade Reflection</span>
          </button>
        </div>
      </div>

      {/* Add New Entry Form Accordion */}
      {isAdding && (
        <form onSubmit={handleAddEntry} className="p-5 bg-[#0e131d] border border-[#212b3e] rounded-xl space-y-4 text-xs font-mono">
          <div className="flex justify-between items-center border-b border-[#18202f] pb-2">
            <h3 className="font-bold text-white font-['Outfit'] text-sm">New Trade Journal Entry</h3>
            <span className="text-slate-400 text-[11px]">Attach Emotional & Tactical Metadata</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">PAIR</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-[#131a27] border border-[#202c3f] rounded px-3 py-1.5 text-white"
              >
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="ETH/USDT">ETH/USDT</option>
                <option value="SOL/USDT">SOL/USDT</option>
                <option value="ALIEN/USDT">ALIEN/USDT</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">DIRECTION</label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as any)}
                className="w-full bg-[#131a27] border border-[#202c3f] rounded px-3 py-1.5 text-white font-bold"
              >
                <option value="BUY">BUY / LONG</option>
                <option value="SELL">SELL / SHORT</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ENTRY PRICE ($)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-[#131a27] border border-[#202c3f] rounded px-3 py-1.5 text-white tabular-nums"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">EXIT PRICE ($)</label>
              <input
                type="number"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="w-full bg-[#131a27] border border-[#202c3f] rounded px-3 py-1.5 text-white tabular-nums"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">POSITION SIZE</label>
              <input
                type="number"
                step="any"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-[#131a27] border border-[#202c3f] rounded px-3 py-1.5 text-white tabular-nums"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">EMOTIONAL MINDSET</label>
              <select
                value={emotionalTag}
                onChange={(e) => setEmotionalTag(e.target.value as any)}
                className="w-full bg-[#131a27] border border-[#202c3f] rounded px-3 py-1.5 text-white"
              >
                <option value="Disciplined">Disciplined</option>
                <option value="Calm">Calm</option>
                <option value="FOMO">FOMO (Fear of Missing Out)</option>
                <option value="Revenge">Revenge Trading</option>
                <option value="Hesitant">Hesitant / Second-Guessing</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400 block mb-1">IDENTIFIED MISTAKE (IF ANY)</label>
              <select
                value={mistakeTag}
                onChange={(e) => setMistakeTag(e.target.value as any)}
                className="w-full bg-[#131a27] border border-[#202c3f] rounded px-3 py-1.5 text-white"
              >
                <option value="None">None (Followed Plan Exactly)</option>
                <option value="Chased Entry">Chased Entry on Green Wick</option>
                <option value="Early Exit">Exited Prematurely Before Target</option>
                <option value="Overleveraged">Overleveraged / Position Too Large</option>
                <option value="Violated Strategy">Violated Technical Invalidation Rule</option>
                <option value="Moved Stop">Moved Stop-Loss Further Back</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">TRADE RATIONALE & REFLECTIONS</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain the setup, catalyst, support/resistance level, and what went right or wrong..."
              rows={2}
              className="w-full bg-[#131a27] border border-[#202c3f] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f59b] font-sans"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-[#182132] text-slate-300 rounded hover:bg-[#202c42]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#00f59b] hover:bg-[#00d888] text-slate-950 font-bold rounded"
            >
              Save Journal Entry
            </button>
          </div>
        </form>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {entries.map((entry) => {
          const isProfitable = entry.pnlUSDT >= 0;
          const isDisciplined = entry.emotionalTag === 'Disciplined' || entry.emotionalTag === 'Calm';

          return (
            <div
              key={entry.id}
              className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-3 font-mono text-xs hover:border-[#24334a] transition-all"
            >
              {/* Top row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141b28] pb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    entry.side === 'BUY' ? 'bg-[#00f59b]/10 text-[#00f59b] border border-[#00f59b]/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {entry.side} {entry.symbol}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(entry.timestamp).toLocaleDateString()} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase">Mindset:</span>
                    <span className={`font-bold ${isDisciplined ? 'text-[#00f59b]' : 'text-amber-400'}`}>
                      {entry.emotionalTag}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase">PnL:</span>
                    <span className={`text-sm font-bold tabular-nums ${isProfitable ? 'text-[#00f59b]' : 'text-[#f43f5e]'}`}>
                      {isProfitable ? '+' : ''}${entry.pnlUSDT.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trade execution specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 bg-[#0e131d] p-2.5 rounded border border-[#141b28]">
                <div>Entry: <span className="text-white font-bold">${entry.entryPrice.toLocaleString()}</span></div>
                <div>Exit: <span className="text-white font-bold">${entry.exitPrice.toLocaleString()}</span></div>
                <div>Size: <span className="text-white font-bold">{entry.size}</span></div>
                <div>Mistake: <span className={entry.mistakeTag === 'None' ? 'text-slate-400' : 'text-rose-400 font-bold'}>{entry.mistakeTag}</span></div>
              </div>

              {/* Trader's notes */}
              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                "{entry.notes}"
              </p>

              {/* AI Coach Feedback */}
              {entry.aiFeedback && (
                <div className="p-3 bg-[#0c1624] border border-[#18283e] rounded-lg flex items-start gap-2.5 text-xs">
                  <Sparkles className="w-4 h-4 text-[#00e5ff] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-[#00e5ff] uppercase font-bold block">
                      AI Performance Coach Evaluation
                    </span>
                    <p className="text-slate-300 font-sans text-xs mt-0.5">{entry.aiFeedback}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
