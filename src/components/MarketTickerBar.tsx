/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Live Market Ticker & Statistics Bar
 */

import React, { useState } from 'react';
import { ChevronDown, ArrowUpRight, ArrowDownRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MarketTicker } from '../types.ts';

interface MarketTickerBarProps {
  markets: MarketTicker[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onOpenAIInsight: () => void;
}

export const MarketTickerBar: React.FC<MarketTickerBarProps> = ({
  markets,
  selectedSymbol,
  onSelectSymbol,
  onOpenAIInsight,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentMarket = markets.find((m) => m.symbol === selectedSymbol) || markets[0];
  const isPositive = (currentMarket?.change24hPercent ?? 0) >= 0;

  return (
    <div className="w-full bg-[#0a0d14] border-b border-[#18202f] px-4 py-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs text-slate-300">
      {/* Pair Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111723] hover:bg-[#172030] border border-[#212b3e] text-white font-semibold cursor-pointer transition-colors"
        >
          <span className="font-['Outfit'] text-sm tracking-wide">{currentMarket?.symbol}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-[#0d121c] border border-[#212b3e] rounded-lg shadow-2xl z-50 py-1 divide-y divide-[#18202f]">
            {markets.map((m) => {
              const pos = m.change24hPercent >= 0;
              return (
                <button
                  key={m.symbol}
                  onClick={() => {
                    onSelectSymbol(m.symbol);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#161f2e] transition-colors ${
                    m.symbol === selectedSymbol ? 'bg-[#00f59b]/5 text-[#00f59b]' : 'text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-medium text-xs text-white">{m.symbol}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Vol: ${(m.quoteVolume24h / 1e6).toFixed(1)}M</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono tabular-nums text-xs font-semibold text-slate-100">
                      ${m.lastPrice.toLocaleString(undefined, { minimumFractionDigits: m.lastPrice > 100 ? 2 : 4 })}
                    </div>
                    <div className={`text-[10px] font-mono tabular-nums ${pos ? 'text-[#00f59b]' : 'text-[#f43f5e]'}`}>
                      {pos ? '+' : ''}{m.change24hPercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Primary Price & Metrics */}
      <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-mono">Mark Price</span>
          <span className={`text-base font-bold font-mono tabular-nums ${isPositive ? 'text-[#00f59b]' : 'text-[#f43f5e]'}`}>
            ${currentMarket?.lastPrice.toLocaleString(undefined, { minimumFractionDigits: currentMarket?.lastPrice > 100 ? 2 : 4 })}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-mono">24h Change</span>
          <div className={`flex items-center gap-0.5 font-mono tabular-nums font-medium ${isPositive ? 'text-[#00f59b]' : 'text-[#f43f5e]'}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{isPositive ? '+' : ''}{currentMarket?.change24hPercent.toFixed(2)}%</span>
            <span className="text-[11px] text-slate-400 ml-1">(${currentMarket?.change24h > 0 ? '+' : ''}{currentMarket?.change24h.toFixed(2)})</span>
          </div>
        </div>

        <div className="hidden sm:block">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">24h High</span>
          <span className="font-mono tabular-nums text-slate-200">
            ${currentMarket?.high24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="hidden sm:block">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">24h Low</span>
          <span className="font-mono tabular-nums text-slate-200">
            ${currentMarket?.low24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="hidden md:block">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">24h Volume ({currentMarket?.baseAsset})</span>
          <span className="font-mono tabular-nums text-slate-200">
            {currentMarket?.volume24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="hidden xl:block">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">Funding / Countdown</span>
          <div className="flex items-center gap-1 font-mono tabular-nums text-slate-200">
            <span className="text-amber-400">{((currentMarket?.fundingRate ?? 0) * 100).toFixed(4)}%</span>
            <span className="text-slate-400">/ {currentMarket?.nextFundingIn}</span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="hidden lg:flex items-center gap-3">
        <button
          onClick={onOpenAIInsight}
          className="flex items-center gap-1 text-[11px] font-mono text-[#00e5ff] hover:underline cursor-pointer"
        >
          <span>AI Sentiment: </span>
          <span className="font-bold text-white bg-[#00e5ff]/10 px-1.5 py-0.5 rounded border border-[#00e5ff]/30">
            {isPositive ? 'Bullish Absorption' : 'Pullback Retest'}
          </span>
        </button>

        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ledger Solvency 100%</span>
        </div>
      </div>
    </div>
  );
};
