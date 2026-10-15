/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Open Orders, Trigger Orders & Trade History Desk
 */

import React, { useState } from 'react';
import { Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ExchangeOrder } from '../types.ts';

interface ActiveOrdersProps {
  orders: ExchangeOrder[];
  onCancelOrder: (orderId: string) => void;
  onCancelAll: () => void;
}

export const ActiveOrders: React.FC<ActiveOrdersProps> = ({
  orders,
  onCancelOrder,
  onCancelAll,
}) => {
  const [activeTab, setActiveTab] = useState<'open' | 'trigger' | 'history'>('open');

  const openOrders = orders.filter((o) => o.status === 'open' && o.type !== 'stop_limit');
  const triggerOrders = orders.filter((o) => o.status === 'open' && o.type === 'stop_limit');
  const historyOrders = orders.filter((o) => o.status === 'filled' || o.status === 'canceled');

  const displayOrders =
    activeTab === 'open' ? openOrders : activeTab === 'trigger' ? triggerOrders : historyOrders;

  return (
    <div className="w-full bg-[#0a0d14] border-t border-[#18202f] flex flex-col text-xs font-mono">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#18202f]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('open')}
            className={`pb-1 transition-colors ${
              activeTab === 'open'
                ? 'text-[#00f59b] font-bold border-b-2 border-[#00f59b]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Open Orders ({openOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('trigger')}
            className={`pb-1 transition-colors ${
              activeTab === 'trigger'
                ? 'text-[#00f59b] font-bold border-b-2 border-[#00f59b]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trigger Orders ({triggerOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-1 transition-colors ${
              activeTab === 'history'
                ? 'text-[#00f59b] font-bold border-b-2 border-[#00f59b]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Order History ({historyOrders.length})
          </button>
        </div>

        {activeTab === 'open' && openOrders.length > 0 && (
          <button
            onClick={onCancelAll}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-sans font-medium flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Cancel All ({openOrders.length})</span>
          </button>
        )}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto min-h-[140px] max-h-[220px]">
        {displayOrders.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-500 font-sans">
            <AlertCircle className="w-6 h-6 mb-1 text-slate-600" />
            <p className="text-xs">No active {activeTab} orders found.</p>
          </div>
        ) : (
          <table className="w-full text-left divide-y divide-[#141b28]">
            <thead className="text-[10px] text-slate-400 uppercase bg-[#0d111a]">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Pair</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Side</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-right">Filled</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121722] text-[11px]">
              {displayOrders.map((ord) => {
                const isBuy = ord.side === 'buy';
                const date = new Date(ord.createdAt);
                const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date
                  .getMinutes()
                  .toString()
                  .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

                return (
                  <tr key={ord.id} className="hover:bg-[#111724] transition-colors">
                    <td className="px-4 py-2 text-slate-400 whitespace-nowrap">{timeStr}</td>
                    <td className="px-4 py-2 font-bold text-white whitespace-nowrap">
                      {ord.symbol}
                      {ord.isPaper && (
                        <span className="ml-1 text-[9px] text-[#00e5ff] font-normal">Paper</span>
                      )}
                    </td>
                    <td className="px-4 py-2 uppercase text-slate-300 whitespace-nowrap">
                      {ord.type.replace('_', ' ')}
                    </td>
                    <td
                      className={`px-4 py-2 font-bold uppercase whitespace-nowrap ${
                        isBuy ? 'text-[#00f59b]' : 'text-[#f43f5e]'
                      }`}
                    >
                      {ord.side}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-slate-200">
                      ${ord.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-slate-300">
                      {ord.amount}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-slate-300">
                      {((ord.filled / ord.amount) * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-white font-semibold">
                      ${(ord.price * ord.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-sans uppercase font-medium ${
                          ord.status === 'open'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : ord.status === 'filled'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {ord.status === 'open' ? (
                        <button
                          onClick={() => onCancelOrder(ord.id)}
                          className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
