/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * High-Density Orderbook & Public Trade Tape Component
 */

import React, { useState } from 'react';
import { TradeTapeItem } from '../types.ts';
import { Orderbook } from '../utils/engine.ts';

interface OrderBookProps {
  orderbook: Orderbook;
  trades: TradeTapeItem[];
  currentPrice: number;
  baseAsset: string;
  quoteAsset: string;
  onPriceSelect: (price: number) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  orderbook,
  trades,
  currentPrice,
  baseAsset,
  quoteAsset,
  onPriceSelect,
}) => {
  const [viewMode, setViewMode] = useState<'book' | 'trades'>('book');
  const [precision, setPrecision] = useState<'0.1' | '1' | '10'>('0.1');

  const asks = [...orderbook.asks].slice(0, 11).reverse();
  const bids = [...orderbook.bids].slice(0, 11);

  // Calculate highest cumulative total for depth visualization
  const maxAskTotal = asks.length > 0 ? asks[0]?.total || 10 : 10;
  const maxBidTotal = bids.length > 0 ? bids[bids.length - 1]?.total || 10 : 10;
  const maxDepth = Math.max(maxAskTotal, maxBidTotal, 1);

  const bestAsk = orderbook.asks[0]?.price || currentPrice;
  const bestBid = orderbook.bids[0]?.price || currentPrice;
  const spread = Math.max(0, bestAsk - bestBid);
  const spreadPercent = bestPricePercent(spread, currentPrice);

  function bestPricePercent(s: number, p: number) {
    if (p <= 0) return 0;
    return (s / p) * 100;
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] border-l border-[#18202f] text-xs select-none">
      {/* Header controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#18202f]">
        <div className="flex items-center gap-1 bg-[#111622] p-0.5 rounded">
          <button
            onClick={() => setViewMode('book')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              viewMode === 'book' ? 'bg-[#1b2333] text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Order Book
          </button>
          <button
            onClick={() => setViewMode('trades')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              viewMode === 'trades' ? 'bg-[#1b2333] text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Recent Trades
          </button>
        </div>

        {viewMode === 'book' && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <span>Tick:</span>
            <select
              value={precision}
              onChange={(e) => setPrecision(e.target.value as any)}
              className="bg-[#111622] border border-[#1f293d] rounded px-1.5 py-0.5 text-slate-300"
            >
              <option value="0.1">0.1</option>
              <option value="1">1.0</option>
              <option value="10">10</option>
            </select>
          </div>
        )}
      </div>

      {viewMode === 'book' ? (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Table Headers */}
          <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-[#18202f]">
            <div>Price ({quoteAsset})</div>
            <div className="text-right">Size ({baseAsset})</div>
            <div className="text-right">Total</div>
          </div>

          {/* Asks (Sell Orders - Red) */}
          <div className="flex-1 flex flex-col justify-end overflow-hidden space-y-0.5 py-1">
            {asks.map((ask, idx) => {
              const depthPct = Math.min(100, ((ask.total || 1) / maxDepth) * 100);
              return (
                <div
                  key={`ask-${idx}`}
                  onClick={() => onPriceSelect(ask.price)}
                  className="relative grid grid-cols-3 px-3 py-0.5 text-[11px] font-mono hover:bg-[#1b2230] cursor-pointer transition-colors"
                >
                  {/* Depth Background Bar */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />
                  <div className="text-[#f43f5e] font-semibold tabular-nums relative z-10">
                    {ask.price.toFixed(ask.price > 100 ? 2 : 4)}
                  </div>
                  <div className="text-right text-slate-300 tabular-nums relative z-10">
                    {ask.size.toFixed(4)}
                  </div>
                  <div className="text-right text-slate-400 tabular-nums relative z-10">
                    {(ask.total || ask.size).toFixed(3)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spread & Current Mark Price Divider */}
          <div className="px-3 py-2 my-1 bg-[#0e131d] border-y border-[#18202f] flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tabular-nums">
                ${currentPrice.toFixed(currentPrice > 100 ? 2 : 4)}
              </span>
              <span className="text-[10px] text-slate-400">Spread: ${spread.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-slate-400 tabular-nums">
              {spreadPercent.toFixed(3)}%
            </span>
          </div>

          {/* Bids (Buy Orders - Green) */}
          <div className="flex-1 flex flex-col justify-start overflow-hidden space-y-0.5 py-1">
            {bids.map((bid, idx) => {
              const depthPct = Math.min(100, ((bid.total || 1) / maxDepth) * 100);
              return (
                <div
                  key={`bid-${idx}`}
                  onClick={() => onPriceSelect(bid.price)}
                  className="relative grid grid-cols-3 px-3 py-0.5 text-[11px] font-mono hover:bg-[#1b2230] cursor-pointer transition-colors"
                >
                  {/* Depth Background Bar */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#00f59b]/10 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />
                  <div className="text-[#00f59b] font-semibold tabular-nums relative z-10">
                    {bid.price.toFixed(bid.price > 100 ? 2 : 4)}
                  </div>
                  <div className="text-right text-slate-300 tabular-nums relative z-10">
                    {bid.size.toFixed(4)}
                  </div>
                  <div className="text-right text-slate-400 tabular-nums relative z-10">
                    {(bid.total || bid.size).toFixed(3)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Recent Trades Tape View */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-[#18202f]">
            <div>Price ({quoteAsset})</div>
            <div className="text-right">Size ({baseAsset})</div>
            <div className="text-right">Time</div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#121824]">
            {trades.map((tr) => {
              const isBuy = tr.side === 'buy';
              const date = new Date(tr.time);
              const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date
                .getMinutes()
                .toString()
                .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
              return (
                <div key={tr.id} className="grid grid-cols-3 px-3 py-1 text-[11px] font-mono hover:bg-[#131926]">
                  <div className={isBuy ? 'text-[#00f59b] font-semibold' : 'text-[#f43f5e] font-semibold'}>
                    ${tr.price.toFixed(tr.price > 100 ? 2 : 4)}
                  </div>
                  <div className="text-right text-slate-200 tabular-nums">{tr.size.toFixed(4)}</div>
                  <div className="text-right text-slate-400 tabular-nums text-[10px]">{timeStr}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
