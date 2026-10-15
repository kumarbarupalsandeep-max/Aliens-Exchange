/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Smart Order Preview & Price-Impact Simulator Modal
 */

import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, Check, X, ArrowRight, Zap, Info } from 'lucide-react';
import { OrderImpactResult } from '../utils/engine.ts';

interface SmartOrderPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: () => void;
  symbol: string;
  side: 'buy' | 'sell';
  type: string;
  amount: number;
  price: number;
  impact: OrderImpactResult | null;
  baseAsset: string;
  quoteAsset: string;
  isPaper: boolean;
}

export const SmartOrderPreviewModal: React.FC<SmartOrderPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirmOrder,
  symbol,
  side,
  type,
  amount,
  price,
  impact,
  baseAsset,
  quoteAsset,
  isPaper,
}) => {
  const [payWithAlienDiscount, setPayWithAlienDiscount] = useState(true);

  if (!isOpen || !impact) return null;

  const isBuy = side === 'buy';
  const slippage = impact.slippagePercent;
  const isHighSlippage = slippage > 0.5;
  const isModerateSlippage = slippage > 0.1 && slippage <= 0.5;

  // Fee calculation with 25% ALIEN discount
  const baseFee = impact.estimatedFee;
  const finalFee = payWithAlienDiscount ? baseFee * 0.75 : baseFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d121c] border border-[#212b3e] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#18202f] flex items-center justify-between bg-[#090c13]">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${isBuy ? 'bg-[#00f59b]/10 text-[#00f59b]' : 'bg-[#f43f5e]/10 text-[#f43f5e]'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">Smart Order Execution Preview</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-Time Orderbook Fill & Slippage Simulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1a2334] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slippage Warning Alert if high */}
        {isHighSlippage && (
          <div className="px-5 py-2.5 bg-rose-950/40 border-b border-rose-900/40 flex items-start gap-2.5 text-xs text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-rose-200">High Price Impact Warning: </span>
              Your requested order size consumes {impact.levelsExhausted} depth levels, resulting in{' '}
              <span className="font-mono font-bold text-rose-300">{slippage.toFixed(2)}%</span> estimated slippage from best price.
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#121824] rounded-lg border border-[#1b2436]">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Order Direction</span>
              <span className={`text-sm font-bold ${isBuy ? 'text-[#00f59b]' : 'text-[#f43f5e]'}`}>
                {isBuy ? 'BUY' : 'SELL'} {symbol} ({type.toUpperCase()})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Requested Amount</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {amount} {baseAsset}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Top of Book (Best)</span>
              <span className="text-sm text-slate-300 tabular-nums">
                ${impact.bestPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Avg Simulated Fill</span>
              <span className={`text-sm font-bold tabular-nums ${isBuy ? 'text-[#00f59b]' : 'text-slate-100'}`}>
                ${impact.averageFillPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Slippage & Depth Metrics */}
          <div className="space-y-2 divide-y divide-[#18202f]">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <span>Estimated Price Slippage</span>
                <Info className="w-3 h-3 text-slate-400" />
              </span>
              <span
                className={`font-bold tabular-nums ${
                  isHighSlippage
                    ? 'text-[#f43f5e]'
                    : isModerateSlippage
                    ? 'text-amber-400'
                    : 'text-[#00f59b]'
                }`}
              >
                {slippage.toFixed(4)}%
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Orderbook Levels Exhausted</span>
              <span className="text-slate-200 tabular-nums">{impact.levelsExhausted} levels</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Total Order Value</span>
              <span className="text-white font-bold tabular-nums">
                ${impact.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} {quoteAsset}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Estimated Trading Fee (0.1%)</span>
              </div>
              <span className="text-slate-200 tabular-nums">
                ${finalFee.toFixed(4)} {quoteAsset}
              </span>
            </div>
          </div>

          {/* Pay with ALIEN Token 25% Discount checkbox */}
          <div className="p-3 bg-[#111724] rounded-lg border border-[#1b2539] flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={payWithAlienDiscount}
                onChange={(e) => setPayWithAlienDiscount(e.target.checked)}
                className="accent-[#00f59b] w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-slate-300 text-[11px]">
                Pay fees with <span className="text-[#00f59b] font-bold">$ALIEN</span> (25% fee discount applied)
              </span>
            </label>
            <span className="text-[10px] font-mono text-[#00f59b] font-semibold bg-[#00f59b]/10 px-2 py-0.5 rounded border border-[#00f59b]/30">
              SAVING 25%
            </span>
          </div>

          {/* Environment notice */}
          <div className="text-[11px] text-slate-400 font-sans">
            Executing in{' '}
            <span className={isPaper ? 'text-[#00e5ff] font-semibold' : 'text-emerald-400 font-semibold'}>
              {isPaper ? 'Paper Trading Sandbox (Zero Risk)' : 'Production Live Spot Ledger'}
            </span>
            . Double-entry audit hash will be generated upon confirmation.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3.5 bg-[#090c13] border-t border-[#18202f] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-[#131926] hover:bg-[#1a2335] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmOrder();
              onClose();
            }}
            className={`px-5 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-lg flex items-center gap-1.5 ${
              isBuy
                ? 'bg-[#00f59b] hover:bg-[#00d888] text-slate-950 shadow-[#00f59b]/20'
                : 'bg-[#f43f5e] hover:bg-[#e11d48] text-white shadow-[#f43f5e]/20'
            }`}
          >
            <span>Confirm & Execute {isBuy ? 'BUY' : 'SELL'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
