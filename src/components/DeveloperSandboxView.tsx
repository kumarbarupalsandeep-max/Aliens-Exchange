/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Developer Sandbox, API Permissions & Webhook Dispatcher Desk
 */

import React, { useState, useEffect } from 'react';
import { Terminal, Key, Webhook, Play, CheckCircle2, Copy, PlusCircle, ShieldCheck } from 'lucide-react';
import { ApiKeyItem, WebhookLog } from '../types.ts';

export const DeveloperSandboxView: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);

  // API Key creation
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [keyName, setKeyName] = useState('Production HFT Algo');
  const [canTrade, setCanTrade] = useState(true);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState('');

  // Interactive REST Runner
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/markets');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [requestBody, setRequestBody] = useState('{\n  "symbol": "BTC/USDT",\n  "side": "buy",\n  "size": 1.5\n}');
  const [responseOutput, setResponseOutput] = useState<string>('// Response will appear here after execution');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [executing, setExecuting] = useState(false);

  const fetchKeysAndLogs = async () => {
    try {
      const [kRes, wRes] = await Promise.all([
        fetch('/api/developer/keys'),
        fetch('/api/developer/webhooks'),
      ]);
      const kData = await kRes.json();
      const wData = await wRes.json();
      setKeys(kData.keys || []);
      setWebhooks(wData.logs || []);
    } catch (err) {
      console.error('Failed to load developer keys/logs:', err);
    }
  };

  useEffect(() => {
    fetchKeysAndLogs();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const permissions: ('read' | 'trade' | 'withdraw')[] = ['read'];
    if (canTrade) permissions.push('trade');
    if (canWithdraw) permissions.push('withdraw');

    try {
      await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyName,
          permissions,
          ipWhitelist,
        }),
      });
      setIsCreatingKey(false);
      fetchKeysAndLogs();
    } catch (err) {
      console.error('Failed to create key:', err);
    }
  };

  const handleExecuteApi = async () => {
    setExecuting(true);
    const start = performance.now();
    try {
      const options: RequestInit = {
        method: apiMethod,
        headers: { 'Content-Type': 'application/json' },
      };
      if (apiMethod === 'POST') {
        options.body = requestBody;
      }
      const res = await fetch(selectedEndpoint, options);
      const end = performance.now();
      const json = await res.json();
      setResponseStatus(res.status);
      setResponseLatency(Math.round(end - start));
      setResponseOutput(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setExecuting(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      await fetch('/api/developer/webhook-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order.filled',
          targetUrl: 'https://webhook.site/aliens-demo',
        }),
      });
      fetchKeysAndLogs();
    } catch (err) {
      console.error('Failed to dispatch webhook:', err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl">
        <div>
          <span className="text-[10px] text-[#00f59b] font-mono uppercase tracking-wider block font-bold">
            Developer Ecosystem & High-Frequency API
          </span>
          <h2 className="text-xl font-bold font-['Outfit'] text-white">Developer Sandbox & Webhook Simulator</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Test institutional REST endpoints, scope API keys with fine-grained permissions, and test real-time webhook subscriptions.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingKey(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00f59b] hover:bg-[#00d888] text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-md cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* Key Generator Modal */}
      {isCreatingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateKey}
            className="w-full max-w-md bg-[#0d121c] border border-[#212b3e] rounded-xl shadow-2xl p-5 space-y-4 text-xs font-mono"
          >
            <div className="flex justify-between items-center border-b border-[#18202f] pb-2">
              <h3 className="font-bold text-white font-['Outfit'] text-sm">Create Scoped API Key</h3>
              <button
                type="button"
                onClick={() => setIsCreatingKey(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">KEY LABEL</label>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full bg-[#111724] border border-[#1f2c41] rounded px-3 py-1.5 text-white"
                required
              />
            </div>

            <div className="space-y-2 p-3 bg-[#111724] rounded-lg border border-[#1b2538]">
              <span className="text-[10px] text-slate-400 block uppercase">Permissions</span>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input type="checkbox" checked disabled className="accent-[#00f59b]" />
                <span>Read Account & Order Information (Mandatory)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={canTrade}
                  onChange={(e) => setCanTrade(e.target.checked)}
                  className="accent-[#00f59b]"
                />
                <span>Enable Spot Order Placement & Cancellation</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-rose-300">
                <input
                  type="checkbox"
                  checked={canWithdraw}
                  onChange={(e) => setCanWithdraw(e.target.checked)}
                  className="accent-rose-500"
                />
                <span>Enable External Withdrawals (Strictly Guarded)</span>
              </label>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">IP ACCESS RESTRICTION (RECOMMENDED)</label>
              <input
                type="text"
                placeholder="e.g. 192.168.1.1, 54.210.84.12"
                value={ipWhitelist}
                onChange={(e) => setIpWhitelist(e.target.value)}
                className="w-full bg-[#111724] border border-[#1f2c41] rounded px-3 py-1.5 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingKey(false)}
                className="px-3 py-1.5 bg-[#182132] text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#00f59b] hover:bg-[#00d888] text-slate-950 font-bold rounded"
              >
                Create Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interactive REST Runner + API Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Interactive In-Browser REST Sandbox */}
        <div className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#18202f] pb-3">
            <h3 className="font-bold text-white font-['Outfit'] text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00e5ff]" />
              <span>Interactive REST API Runner</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Rate Limit: 1200 req/min</span>
          </div>

          <div className="flex gap-2">
            <select
              value={apiMethod}
              onChange={(e) => setApiMethod(e.target.value as any)}
              className="bg-[#111724] border border-[#1f2c41] rounded px-2.5 py-1.5 text-white font-bold"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>

            <select
              value={selectedEndpoint}
              onChange={(e) => {
                const ep = e.target.value;
                setSelectedEndpoint(ep);
                if (ep === '/api/order-impact') {
                  setApiMethod('POST');
                } else {
                  setApiMethod('GET');
                }
              }}
              className="flex-1 bg-[#111724] border border-[#1f2c41] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#00f59b]"
            >
              <option value="/api/markets">/api/markets (Public 24h Tickers)</option>
              <option value="/api/orderbook?symbol=BTC/USDT">/api/orderbook?symbol=BTC/USDT (Depth)</option>
              <option value="/api/ledger">/api/ledger (Double-Entry Balances)</option>
              <option value="/api/order-impact">/api/order-impact (Smart Slippage Estimator)</option>
              <option value="/api/proof-of-reserves">/api/proof-of-reserves (Merkle PoR Root)</option>
            </select>

            <button
              onClick={handleExecuteApi}
              disabled={executing}
              className="px-4 py-1.5 bg-[#00e5ff] hover:bg-[#00c8df] text-slate-950 font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </button>
          </div>

          {apiMethod === 'POST' && (
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">REQUEST JSON PAYLOAD</label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={3}
                className="w-full bg-[#0d121c] border border-[#1b2538] rounded p-2 text-[11px] text-[#00f59b] font-mono focus:outline-none"
              />
            </div>
          )}

          {/* Response Inspector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>RESPONSE PAYLOAD</span>
              {responseStatus !== null && (
                <div className="flex items-center gap-2">
                  <span className={responseStatus === 200 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    STATUS: {responseStatus} OK
                  </span>
                  <span>· {responseLatency}ms</span>
                </div>
              )}
            </div>
            <pre className="p-3 bg-[#080b10] border border-[#151c29] rounded-lg text-[10.5px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              {responseOutput}
            </pre>
          </div>
        </div>

        {/* API Keys List & Webhook Simulator */}
        <div className="space-y-6">
          {/* Active API Keys */}
          <div className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-3">
            <h3 className="font-bold text-white font-['Outfit'] text-sm flex items-center gap-2 border-b border-[#18202f] pb-2">
              <Key className="w-4 h-4 text-[#00f59b]" />
              <span>Active API Credentials</span>
            </h3>

            <div className="space-y-2.5">
              {keys.map((k) => (
                <div key={k.id} className="p-3 bg-[#111724] border border-[#1b2538] rounded-lg space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs">{k.name}</span>
                    <span className="text-[10px] text-slate-400 font-sans">Last used: {k.lastUsed}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#00e5ff]">
                    <span>{k.keyPrefix}</span>
                    <div className="flex gap-1 text-[9px] uppercase">
                      {k.permissions.map((p) => (
                        <span key={p} className="bg-[#1b263b] text-slate-300 px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Events */}
          <div className="p-5 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-[#18202f] pb-2">
              <h3 className="font-bold text-white font-['Outfit'] text-sm flex items-center gap-2">
                <Webhook className="w-4 h-4 text-purple-400" />
                <span>Webhook Delivery Simulator</span>
              </h3>
              <button
                onClick={handleTestWebhook}
                className="px-2.5 py-1 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/40 rounded text-[11px] transition-colors cursor-pointer"
              >
                Fire Test Webhook
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {webhooks.map((wh) => (
                <div key={wh.id} className="p-2.5 bg-[#0f1420] border border-[#182235] rounded text-[10.5px]">
                  <div className="flex justify-between text-slate-400">
                    <span className="text-white font-bold">{wh.event}</span>
                    <span className="text-emerald-400">Status: {wh.statusCode} OK</span>
                  </div>
                  <div className="text-slate-400 truncate mt-0.5">{wh.targetUrl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
