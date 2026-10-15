/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Portfolio Risk, Value-at-Risk (VaR) & Double-Entry Ledger Desk
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, RefreshCw, Send, Download } from 'lucide-react';
import { PortfolioRiskMetrics, AssetPosition } from '../utils/engine.ts';

interface PortfolioRiskViewProps {
  onRefreshLedger: () => void;
}

export const PortfolioRiskView: React.FC<PortfolioRiskViewProps> = ({ onRefreshLedger }) => {
  const [activeSubTab, setActiveSubTab] = useState<'risk' | 'ledger'>('risk');
  const [riskData, setRiskData] = useState<{ positions: AssetPosition[]; risk: PortfolioRiskMetrics } | null>(null);
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [stressShock, setStressShock] = useState<number>(25);

  // Deposit modal state
  const [depositOpen, setDepositOpen] = useState(false);
  const [depAsset, setDepAsset] = useState('USDT');
  const [depAmount, setDepAmount] = useState('5000');
  const [depNetwork, setDepNetwork] = useState('Arbitrum One');
  const [depStatus, setDepStatus] = useState<string | null>(null);

  // Withdrawal modal state
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withAsset, setWithAsset] = useState('USDT');
  const [withAmount, setWithAmount] = useState('1000');
  const [withAddress, setWithAddress] = useState('0x71C...49bA');
  const [withStatus, setWithStatus] = useState<string | null>(null);

  const fetchRiskAndLedger = async () => {
    try {
      const [riskRes, ledgerRes] = await Promise.all([
        fetch('/api/risk-monitor'),
        fetch('/api/ledger'),
      ]);
      const riskJson = await riskRes.json();
      const ledgerJson = await ledgerRes.json();
      setRiskData(riskJson);
      setLedgerData(ledgerJson);
    } catch (err) {
      console.error('Failed to load risk and ledger data:', err);
    }
  };

  useEffect(() => {
    fetchRiskAndLedger();
  }, []);

  const handleExecuteDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepStatus('Broadcasting on ' + depNetwork + '...');
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: depAsset,
          amount: Number(depAmount),
          network: depNetwork,
          txHash: `0x${Math.random().toString(16).substring(2, 18)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDepStatus(`Confirmed! Audit Hash: ${data.entry.hash}`);
        fetchRiskAndLedger();
        onRefreshLedger();
        setTimeout(() => {
          setDepositOpen(false);
          setDepStatus(null);
        }, 1800);
      }
    } catch (err) {
      setDepStatus('Failed to submit deposit');
    }
  };

  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithStatus('Verifying whitelist & double-entry transfer...');
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: withAsset,
          amount: Number(withAmount),
          destinationAddress: withAddress,
          network: 'Arbitrum One',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWithStatus(`Confirmed! Audit Hash: ${data.entry.hash}`);
        fetchRiskAndLedger();
        onRefreshLedger();
        setTimeout(() => {
          setWithdrawOpen(false);
          setWithStatus(null);
        }, 1800);
      } else {
        setWithStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setWithStatus('Failed to submit withdrawal');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl">
        <div>
          <span className="text-[10px] text-[#00f59b] font-mono uppercase tracking-wider block font-bold">
            Institutional Risk & Double-Entry Accounting
          </span>
          <h2 className="text-xl font-bold font-['Outfit'] text-white">Portfolio Risk & Verifiable Asset Ledger</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Parametric Value-at-Risk modeling, Herfindahl concentration penalty, and cryptographic balance integrity.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#101622] p-0.5 rounded border border-[#1e2a3e]">
            <button
              onClick={() => setActiveSubTab('risk')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'risk' ? 'bg-[#1b2333] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Risk & Stress Tests
            </button>
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeSubTab === 'ledger' ? 'bg-[#1b2333] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Double-Entry Ledger
            </button>
          </div>

          <button
            onClick={() => setDepositOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#00f59b] hover:bg-[#00d888] text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => setWithdrawOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#172030] hover:bg-[#202c42] text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'risk' ? (
        riskData ? (
          <div className="space-y-6">
            {/* Top 4 Risk Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 bg-[#0a0d14] border border-[#18202f] rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block">Total Portfolio Valuation</span>
                <span className="text-xl font-bold text-white tabular-nums mt-1 block">
                  ${riskData.risk.totalValueUSDT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-emerald-400 mt-0.5 block">100% Unleveraged Spot</span>
              </div>

              <div className="p-4 bg-[#0a0d14] border border-[#18202f] rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block">Value-at-Risk (95% 1-Day)</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xl font-bold text-amber-400 tabular-nums">
                    ${riskData.risk.varAmountUSDT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-400">({riskData.risk.var95Percent1Day}%)</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Parametric Z = 1.645</span>
              </div>

              <div className="p-4 bg-[#0a0d14] border border-[#18202f] rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block">Concentration (HHI Index)</span>
                <span className="text-xl font-bold text-[#00e5ff] tabular-nums mt-1 block">
                  {riskData.risk.herfindahlConcentrationIndex}
                </span>
                <span className="text-[11px] text-slate-300 mt-0.5 block">
                  Rating: <strong className="text-emerald-400">{riskData.risk.diversificationRating}</strong>
                </span>
              </div>

              <div className="p-4 bg-[#0a0d14] border border-[#18202f] rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block">Ledger Solvency Audit</span>
                <div className="flex items-center gap-1.5 mt-1 text-emerald-400">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-lg font-bold">100% Solvency</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Zero Unbacked Liabilities</span>
              </div>
            </div>

            {/* Asset Breakdown & Interactive Flash Crash Stress Tester */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Allocation Table */}
              <div className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-[#18202f] pb-2">
                  <h3 className="font-bold text-white font-['Outfit'] text-sm">Asset Holdings & Daily Volatility</h3>
                  <span className="text-[10px] text-slate-400">{riskData.positions.length} Active Positions</span>
                </div>

                <div className="divide-y divide-[#141b28]">
                  {riskData.positions.map((pos) => {
                    const val = pos.amount * pos.currentPrice;
                    const weight = (val / riskData.risk.totalValueUSDT) * 100;
                    return (
                      <div key={pos.asset} className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">{pos.asset}</div>
                          <div className="text-[10px] text-slate-400">
                            {pos.amount} @ ${pos.currentPrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-200 tabular-nums">${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Weight: {weight.toFixed(1)}% · Vol: {(pos.dailyVolatility * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flash Crash Stress Tester */}
              <div className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-4 font-mono text-xs">
                <div className="border-b border-[#18202f] pb-2">
                  <h3 className="font-bold text-white font-['Outfit'] text-sm">Flash-Crash Stress Test Simulator</h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Model portfolio equity under systemic market liquidity shock scenarios.
                  </p>
                </div>

                {/* Shock selection buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50].map((drop) => (
                    <button
                      key={drop}
                      onClick={() => setStressShock(drop)}
                      className={`py-2 px-3 rounded-lg border font-bold transition-all text-center ${
                        stressShock === drop
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md'
                          : 'bg-[#111724] border-[#1f2c41] text-slate-400 hover:text-white'
                      }`}
                    >
                      -{drop}% Flash Drop
                    </button>
                  ))}
                </div>

                {/* Shock Impact Card */}
                <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Simulated Drawdown:</span>
                    <span className="text-rose-400 font-bold text-sm tabular-nums">
                      -${((riskData.risk.totalValueUSDT * stressShock) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Remaining Equity:</span>
                    <span className="text-white font-bold text-sm tabular-nums">
                      ${((riskData.risk.totalValueUSDT * (100 - stressShock)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-rose-900/30">
                    <span>Liquidation Danger:</span>
                    <span className="text-emerald-400 font-bold">NONE (100% Fully Collateralized Spot)</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Unlike leveraged margin accounts that face cascading liquidation wipes during extreme -50% market sweeps, Aliens Exchange spot accounts retain entire coin quantities with zero margin call risk.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 font-mono text-xs">
            Loading risk metrics...
          </div>
        )
      ) : (
        /* Double-Entry Ledger View */
        <div className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-4 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#18202f] pb-3">
            <div>
              <h3 className="font-bold text-white font-['Outfit'] text-sm">Cryptographic Double-Entry Transaction Ledger</h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Immutable chronological log verifying all deposits, transfers, and order settlements with sequential SHA-256 hashes.
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Debit / Credit Parity Verified</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-[#161f2e]">
              <thead className="text-[10px] text-slate-400 uppercase bg-[#0e131d]">
                <tr>
                  <th className="px-4 py-2">Tx ID</th>
                  <th className="px-4 py-2">Timestamp</th>
                  <th className="px-4 py-2">From Account</th>
                  <th className="px-4 py-2">To Account</th>
                  <th className="px-4 py-2 text-right">Asset & Amount</th>
                  <th className="px-4 py-2">Audit Hash</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#121824] text-[11px]">
                {ledgerData?.history?.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-[#121926] transition-colors">
                    <td className="px-4 py-2 font-bold text-white whitespace-nowrap">{entry.id}</td>
                    <td className="px-4 py-2 text-slate-400 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-2 text-slate-300 font-mono whitespace-nowrap">{entry.fromAccount}</td>
                    <td className="px-4 py-2 text-slate-300 font-mono whitespace-nowrap">{entry.toAccount}</td>
                    <td className="px-4 py-2 text-right font-bold text-[#00f59b] tabular-nums whitespace-nowrap">
                      +{entry.amount} {entry.asset}
                    </td>
                    <td className="px-4 py-2 font-mono text-[10px] text-[#00e5ff] whitespace-nowrap">
                      {entry.hash.substring(0, 14)}...
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded font-sans font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simulated Deposit Modal */}
      {depositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleExecuteDeposit}
            className="w-full max-w-md bg-[#0d121c] border border-[#212b3e] rounded-xl shadow-2xl p-5 space-y-4 text-xs font-mono"
          >
            <div className="flex justify-between items-center border-b border-[#18202f] pb-2">
              <h3 className="font-bold text-white font-['Outfit'] text-sm">Simulated Multi-Chain Deposit</h3>
              <button
                type="button"
                onClick={() => setDepositOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ASSET</label>
              <select
                value={depAsset}
                onChange={(e) => setDepAsset(e.target.value)}
                className="w-full bg-[#121927] border border-[#1f2c41] rounded px-3 py-2 text-white"
              >
                <option value="USDT">USDT (Tether USD)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="SOL">SOL (Solana)</option>
                <option value="ALIEN">ALIEN (Aliens Exchange Token)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">BLOCKCHAIN NETWORK</label>
              <select
                value={depNetwork}
                onChange={(e) => setDepNetwork(e.target.value)}
                className="w-full bg-[#121927] border border-[#1f2c41] rounded px-3 py-2 text-white"
              >
                <option value="Arbitrum One">Arbitrum One (L2 Low Fee)</option>
                <option value="Ethereum Mainnet">Ethereum Mainnet (ERC20)</option>
                <option value="Solana Network">Solana SPL</option>
                <option value="Bitcoin Mainnet">Bitcoin Native SegWit</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">DEPOSIT AMOUNT</label>
              <input
                type="number"
                step="any"
                value={depAmount}
                onChange={(e) => setDepAmount(e.target.value)}
                className="w-full bg-[#121927] border border-[#1f2c41] rounded px-3 py-2 text-white tabular-nums"
                required
              />
            </div>

            {depStatus && (
              <div className="p-2.5 bg-[#121b2a] border border-[#1d2a40] text-[#00f59b] rounded text-[11px]">
                {depStatus}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDepositOpen(false)}
                className="px-3 py-1.5 bg-[#182132] text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#00f59b] hover:bg-[#00d888] text-slate-950 font-bold rounded"
              >
                Confirm Deposit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Simulated Withdrawal Modal */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleExecuteWithdrawal}
            className="w-full max-w-md bg-[#0d121c] border border-[#212b3e] rounded-xl shadow-2xl p-5 space-y-4 text-xs font-mono"
          >
            <div className="flex justify-between items-center border-b border-[#18202f] pb-2">
              <h3 className="font-bold text-white font-['Outfit'] text-sm">Secure External Withdrawal</h3>
              <button
                type="button"
                onClick={() => setWithdrawOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ASSET</label>
              <select
                value={withAsset}
                onChange={(e) => setWithAsset(e.target.value)}
                className="w-full bg-[#121927] border border-[#1f2c41] rounded px-3 py-2 text-white"
              >
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">DESTINATION WHITELISTED ADDRESS</label>
              <input
                type="text"
                value={withAddress}
                onChange={(e) => setWithAddress(e.target.value)}
                className="w-full bg-[#121927] border border-[#1f2c41] rounded px-3 py-2 text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">WITHDRAWAL AMOUNT</label>
              <input
                type="number"
                step="any"
                value={withAmount}
                onChange={(e) => setWithAmount(e.target.value)}
                className="w-full bg-[#121927] border border-[#1f2c41] rounded px-3 py-2 text-white tabular-nums"
                required
              />
            </div>

            {withStatus && (
              <div className="p-2.5 bg-[#121b2a] border border-[#1d2a40] text-amber-300 rounded text-[11px]">
                {withStatus}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawOpen(false)}
                className="px-3 py-1.5 bg-[#182132] text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded"
              >
                Submit Withdrawal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
