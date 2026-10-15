/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Advanced Spot Trading Order Desk Component
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Info, ChevronDown, Check } from 'lucide-react';
import { OrderType, OrderSide } from '../types.ts';
import { calculateOrderImpact, OrderImpactResult, Orderbook } from '../utils/engine.ts';

interface OrderDeskProps {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  currentPrice: number;
  orderbook: Orderbook;
  userBalances: Record<string, { available: number; locked: number }>;
  isPaperMode: boolean;
  paperBalances: Record<string, number>;
  onPlaceOrder: (order: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    triggerPrice?: number;
    isPaper: boolean;
  }) => void;
  onOpenPreview: (data: {
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    impact: OrderImpactResult;
  }) => void;
  selectedPriceFromBook: number | null;
}

export const OrderDesk: React.FC<OrderDeskProps> = ({
  symbol,
  baseAsset,
  quoteAsset,
  currentPrice,
  orderbook,
  userBalances,
  isPaperMode,
  paperBalances,
  onPlaceOrder,
  onOpenPreview,
  selectedPriceFromBook,
}) => {
  const [side, setSide] = useState<OrderSide>('buy');
  const [type, setType] = useState<OrderType>('limit');
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [triggerPrice, setTriggerPrice] = useState<string>('');
  const [trailingOffset, setTrailingOffset] = useState<string>('1.5');
  const [amount, setAmount] = useState<string>('');
  const [showTPSL, setShowTPSL] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [quickPercentage, setQuickPercentage] = useState<number | null>(null);

  // Sync price when user clicks on orderbook level
  useEffect(() => {
    if (selectedPriceFromBook !== null) {
      setPrice(selectedPriceFromBook.toString());
    }
  }, [selectedPriceFromBook]);

  // Sync initial price if empty
  useEffect(() => {
    if (!price || price === '0') {
      setPrice(currentPrice.toString());
    }
  }, [currentPrice]);

  // Determine available balance based on mode & side
  const availableQuote = isPaperMode
    ? paperBalances[quoteAsset] || 50000
    : userBalances[quoteAsset]?.available || 0;

  const availableBase = isPaperMode
    ? paperBalances[baseAsset] || 1
    : userBalances[baseAsset]?.available || 0;

  const availableForCurrentSide = side === 'buy' ? availableQuote : availableBase;

  // Handle percentage presets
  const handlePercentClick = (pct: number) => {
    setQuickPercentage(pct);
    const numPrice = type === 'market' ? currentPrice : Number(price) || currentPrice;
    if (side === 'buy') {
      if (numPrice <= 0) return;
      const budget = (availableQuote * (pct / 100)) * 0.999; // account for fee
      const calculatedAmount = budget / numPrice;
      setAmount(calculatedAmount.toFixed(4));
    } else {
      const calculatedAmount = availableBase * (pct / 100);
      setAmount(calculatedAmount.toFixed(4));
    }
  };

  const numAmount = Number(amount) || 0;
  const numPrice = type === 'market' ? currentPrice : Number(price) || currentPrice;
  const totalValue = numAmount * numPrice;

  // Real-time inline impact computation
  const liveImpact = calculateOrderImpact(orderbook, side, numAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    onPlaceOrder({
      symbol,
      side,
      type,
      price: numPrice,
      amount: numAmount,
      triggerPrice: triggerPrice ? Number(triggerPrice) : undefined,
      isPaper: isPaperMode,
    });

    // Reset amount
    setAmount('');
    setQuickPercentage(null);
  };

  const handleOpenSmartPreview = () => {
    if (numAmount <= 0) return;
    onOpenPreview({
      side,
      type,
      price: numPrice,
      amount: numAmount,
      impact: liveImpact,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] border-l border-[#18202f] p-4 text-xs font-mono">
      {/* Side Selector (BUY vs SELL) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#101521] rounded-lg border border-[#1b2333] mb-3">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`py-2 text-xs font-bold rounded font-sans transition-all ${
            side === 'buy'
              ? 'bg-[#00f59b] text-slate-950 shadow-md shadow-[#00f59b]/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          BUY {baseAsset}
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`py-2 text-xs font-bold rounded font-sans transition-all ${
            side === 'sell'
              ? 'bg-[#f43f5e] text-white shadow-md shadow-[#f43f5e]/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          SELL {baseAsset}
        </button>
      </div>

      {/* Order Type Tabs */}
      <div className="flex items-center justify-between border-b border-[#18202f] pb-2 mb-3 text-[11px]">
        {(['limit', 'market', 'stop_limit', 'trailing_stop'] as OrderType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`pb-1 uppercase tracking-tight transition-colors ${
              type === t
                ? 'text-[#00f59b] font-bold border-b-2 border-[#00f59b]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Available Balance row */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 bg-[#0d121c] p-2 rounded border border-[#18202f]">
        <span>Avail Balance:</span>
        <button
          onClick={() => handlePercentClick(100)}
          className="text-slate-200 font-bold hover:text-[#00f59b] transition-colors tabular-nums flex items-center gap-1 cursor-pointer"
          title="Click to fill 100%"
        >
          <span>
            {availableForCurrentSide.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </span>
          <span className="text-[10px] text-slate-400">{side === 'buy' ? quoteAsset : baseAsset}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Trigger Price (if Stop Limit) */}
          {type === 'stop_limit' && (
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">TRIGGER PRICE</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  placeholder={`e.g. ${(currentPrice * 0.98).toFixed(2)}`}
                  className="w-full bg-[#111724] border border-[#202c3f] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f59b] tabular-nums"
                  required
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-400">{quoteAsset}</span>
              </div>
            </div>
          )}

          {/* Trailing Offset (if Trailing Stop) */}
          {type === 'trailing_stop' && (
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">TRAIL DELTA %</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={trailingOffset}
                  onChange={(e) => setTrailingOffset(e.target.value)}
                  placeholder="1.5"
                  className="w-full bg-[#111724] border border-[#202c3f] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f59b] tabular-nums"
                  required
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-400">%</span>
              </div>
            </div>
          )}

          {/* Order Price (disabled if market) */}
          {type !== 'market' ? (
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ORDER PRICE</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#111724] border border-[#202c3f] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f59b] tabular-nums"
                  required
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-400">{quoteAsset}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#111724] border border-[#202c3f] rounded px-3 py-2 text-slate-400 text-xs flex justify-between items-center">
              <span>Execution:</span>
              <span className="text-[#00e5ff] font-bold">Best Market Depth</span>
            </div>
          )}

          {/* Order Amount */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">AMOUNT</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setQuickPercentage(null);
                }}
                placeholder="0.00"
                className="w-full bg-[#111724] border border-[#202c3f] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f59b] tabular-nums"
                required
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-400">{baseAsset}</span>
            </div>
          </div>

          {/* Percentage buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentClick(pct)}
                className={`py-1 text-[10px] rounded transition-colors ${
                  quickPercentage === pct
                    ? 'bg-[#00f59b]/20 text-[#00f59b] border border-[#00f59b]/40 font-bold'
                    : 'bg-[#111724] text-slate-400 hover:text-white hover:bg-[#182133]'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* TP / SL Accordion Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowTPSL(!showTPSL)}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-between w-full py-1 border-t border-[#18202f]"
            >
              <span>Take Profit / Stop Loss (Bracket)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTPSL ? 'rotate-180' : ''}`} />
            </button>

            {showTPSL && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-[#141b28]">
                <div>
                  <label className="text-[9px] text-[#00f59b] block">TP TARGET</label>
                  <input
                    type="number"
                    step="any"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    placeholder={(currentPrice * 1.05).toFixed(2)}
                    className="w-full bg-[#111724] border border-[#202c3f] rounded px-2 py-1 text-[11px] text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#f43f5e] block">SL LIMIT</label>
                  <input
                    type="number"
                    step="any"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    placeholder={(currentPrice * 0.95).toFixed(2)}
                    className="w-full bg-[#111724] border border-[#202c3f] rounded px-2 py-1 text-[11px] text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Total & Inline Impact Summary */}
          <div className="p-2.5 bg-[#0e131d] rounded border border-[#18202f] space-y-1">
            <div className="flex justify-between items-center text-slate-400">
              <span>Order Value:</span>
              <span className="text-white font-bold tabular-nums">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {quoteAsset}
              </span>
            </div>

            {numAmount > 0 && (
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-[#141b28]">
                <span>Est. Slippage:</span>
                <span className={`font-bold tabular-nums ${liveImpact.slippagePercent > 0.5 ? 'text-[#f43f5e]' : 'text-[#00f59b]'}`}>
                  {liveImpact.slippagePercent.toFixed(3)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Smart Preview + Execute */}
        <div className="space-y-2 pt-2">
          {/* Smart Order Preview Trigger (Next-Gen Flagship Feature) */}
          <button
            type="button"
            onClick={handleOpenSmartPreview}
            disabled={numAmount <= 0}
            className="w-full py-2 px-3 text-xs font-semibold rounded bg-[#101b2a] hover:bg-[#152338] text-[#00e5ff] border border-[#00e5ff]/30 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Smart Order Preview & Impact</span>
          </button>

          {/* Direct Placement Button */}
          <button
            type="submit"
            disabled={numAmount <= 0}
            className={`w-full py-2.5 px-4 text-xs font-bold rounded-lg font-sans transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              side === 'buy'
                ? 'bg-[#00f59b] hover:bg-[#00d888] text-slate-950 shadow-[#00f59b]/20'
                : 'bg-[#f43f5e] hover:bg-[#e11d48] text-white shadow-[#f43f5e]/20'
            }`}
          >
            {side === 'buy' ? 'BUY' : 'SELL'} {baseAsset} {isPaperMode ? '(Paper)' : ''}
          </button>
        </div>
      </form>
    </div>
  );
};
