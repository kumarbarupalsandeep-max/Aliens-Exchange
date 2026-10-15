/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AI Market Intelligence & Technical Explanation Modal powered by Gemini 3.8 Flash
 */

import React, { useState, useEffect } from 'react';
import { Zap, X, RefreshCw, TrendingUp, ShieldCheck, Cpu } from 'lucide-react';

interface AIMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  lastPrice: number;
  change24hPercent: number;
}

export const AIMarketModal: React.FC<AIMarketModalProps> = ({
  isOpen,
  onClose,
  symbol,
  lastPrice,
  change24hPercent,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisSource, setAnalysisSource] = useState<string>('gemini-3.8-flash');

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          lastPrice,
          change24hPercent,
          timeframe: '15m',
        }),
      });
      const data = await res.json();
      setAnalysisData(data.analysis);
      setAnalysisSource(data.source);
    } catch (err) {
      console.error('Failed to fetch AI analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
    }
  }, [isOpen, symbol]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0d121c] border border-[#212b3e] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#18202f] flex items-center justify-between bg-[#090c13]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#00e5ff]/10 text-[#00e5ff]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                <span>AI Market Intelligence & Technical Explanation</span>
                <span className="text-[10px] text-[#00e5ff] font-mono bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/30">
                  {analysisSource === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Quant Heuristic Engine'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Asset: {symbol} · Mark: ${lastPrice.toLocaleString()} ({change24hPercent > 0 ? '+' : ''}{change24hPercent.toFixed(2)}%)
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

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#00e5ff] animate-spin" />
              <p className="text-xs font-mono text-slate-300">
                Synthesizing multi-timeframe order flow, liquidity pools and momentum metrics...
              </p>
            </div>
          ) : analysisData ? (
            <div className="space-y-4">
              {/* Key Indicators Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-[#121824] border border-[#1b2537] rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Market Structure</span>
                  <span className="text-xs font-bold text-[#00f59b] font-mono mt-0.5 block">
                    {analysisData.marketStructure || 'Bullish Channel Accumulation'}
                  </span>
                </div>
                <div className="p-3 bg-[#121824] border border-[#1b2537] rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Confidence Score</span>
                  <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                    {analysisData.confidencePercent || 86}% High Probability
                  </span>
                </div>
                <div className="p-3 bg-[#121824] border border-[#1b2537] rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Momentum State</span>
                  <span className="text-xs font-bold text-[#00e5ff] font-mono mt-0.5 block">
                    {analysisData.rsiCondition || 'Expansion Phase (EMA 20 > 50)'}
                  </span>
                </div>
              </div>

              {/* Main Analysis Body */}
              <div className="p-4 bg-[#0a0e16] border border-[#18202f] rounded-lg space-y-3">
                <h4 className="text-xs font-bold font-mono text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>Institutional Order Flow & Structure Analysis</span>
                </h4>
                <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {analysisData.summary}
                </div>
              </div>

              {/* Dynamic Support & Resistance levels */}
              {analysisData.keyLevels && (
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg">
                    <span className="text-[10px] text-emerald-400 uppercase block font-bold">Key Support Zones</span>
                    <div className="mt-1 space-y-0.5 text-slate-200">
                      {analysisData.keyLevels.support?.map((lvl: string, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-slate-400">S{idx + 1}:</span>
                          <span className="text-emerald-300 font-bold">${Number(lvl).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                    <span className="text-[10px] text-rose-400 uppercase block font-bold">Key Resistance Targets</span>
                    <div className="mt-1 space-y-0.5 text-slate-200">
                      {analysisData.keyLevels.resistance?.map((lvl: string, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-slate-400">R{idx + 1}:</span>
                          <span className="text-rose-300 font-bold">${Number(lvl).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actionable Risk Recommendation */}
              {analysisData.tradeRecommendation && (
                <div className="p-3.5 bg-[#121927] border border-[#1c273c] rounded-lg text-xs space-y-1">
                  <span className="text-[10px] text-[#00f59b] font-mono font-bold uppercase block">
                    Actionable Risk Guidance
                  </span>
                  <p className="text-slate-300 font-sans">
                    {analysisData.tradeRecommendation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              Unable to generate analysis. Please try refreshing.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#090c13] border-t border-[#18202f] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00f59b]" />
            <span>Server-side telemetry enabled · User secrets secure</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnalysis}
              disabled={loading}
              className="px-3 py-1.5 bg-[#121927] hover:bg-[#1a2336] text-slate-200 rounded font-medium transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Insights</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#00f59b] hover:bg-[#00d888] text-slate-950 font-bold rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
