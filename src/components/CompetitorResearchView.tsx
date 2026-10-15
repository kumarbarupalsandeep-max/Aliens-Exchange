/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Competitor Research & Aliens Exchange 30+ Feature Matrix Hub
 */

import React, { useState } from 'react';
import {
  COMPETITOR_PROFILES,
  FEATURE_COMPARISON_MATRIX,
  ALIENS_30_PLUS_FEATURES,
  CompetitorProfile,
} from '../data/competitorResearch.ts';
import { Shield, CheckCircle2, AlertTriangle, Layers, Zap, Cpu, Award } from 'lucide-react';

export const CompetitorResearchView: React.FC = () => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('binance');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const profile = COMPETITOR_PROFILES[selectedCompetitor];

  const categories = ['All', 'Trading Engine', 'Financial Core', 'Security & Trust', 'Risk Management', 'Education & Testing', 'AI & Analytics', 'Automation'];

  const filteredMatrix =
    categoryFilter === 'All'
      ? FEATURE_COMPARISON_MATRIX
      : FEATURE_COMPARISON_MATRIX.filter((f) => f.category === categoryFilter);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-8">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0d131f] via-[#101826] to-[#0c121e] border border-[#1e2a3f] rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-[#00f59b] font-mono uppercase tracking-wider block font-bold">
            Verified Exchange Architecture & Competitor Matrix
          </span>
          <h2 className="text-2xl font-bold font-['Outfit'] text-white">Competitor Deep Research & Aliens 30+ Feature Hub</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
            In-depth analysis of Binance, OKX, Coinbase, and CoinDCX based on public documentation, API specifications, and verified exchange workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-[#121a28] border border-[#1d293d] rounded-lg text-xs font-mono">
            <span className="text-slate-400 text-[10px] block">Evaluated Features</span>
            <span className="text-[#00f59b] font-bold text-base tabular-nums">32 Implemented</span>
          </div>
        </div>
      </div>

      {/* Competitor Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#18202f] pb-2 overflow-x-auto">
          {Object.entries(COMPETITOR_PROFILES).map(([key, comp]) => (
            <button
              key={key}
              onClick={() => setSelectedCompetitor(key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-['Outfit'] transition-all whitespace-nowrap cursor-pointer ${
                selectedCompetitor === key
                  ? 'bg-[#00f59b] text-slate-950 shadow-md shadow-[#00f59b]/20'
                  : 'bg-[#0e131d] text-slate-400 hover:text-white hover:bg-[#161f2e]'
              }`}
            >
              {comp.name} Analysis
            </button>
          ))}
        </div>

        {/* Selected Competitor Profile Card */}
        <div className="p-6 bg-[#0a0d14] border border-[#18202f] rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* Overview */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Platform</span>
              <h3 className="text-lg font-bold text-white font-['Outfit']">{profile.name}</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">{profile.hq} (Est. {profile.foundingYear})</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Daily Reported Volume</span>
              <span className="text-white font-bold">{profile.dailyVolumeEstimated}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">API Architecture</span>
              <p className="text-slate-300 font-sans text-xs leading-relaxed mt-0.5">{profile.apiArchitecture}</p>
            </div>
          </div>

          {/* Strengths & Limitations */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">Key Strengths</span>
              <ul className="space-y-1.5 text-slate-300 font-sans text-xs">
                {profile.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] text-rose-400 font-bold uppercase block mb-1">Limitations</span>
              <ul className="space-y-1 text-slate-400 font-sans text-xs">
                {profile.limitations.map((l, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400">·</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* User Pain Points & Aliens Exchange Solution */}
          <div className="space-y-4 p-4 bg-[#0d131f] border border-[#192437] rounded-xl">
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">Documented User Pain Points</span>
              <ul className="space-y-1.5 text-slate-300 font-sans text-xs">
                {profile.userPainPoints.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-[#1a2538]">
              <span className="text-[10px] text-[#00f59b] font-bold uppercase block mb-1">How Aliens Solves This</span>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                By integrating a real-time orderbook fill depth simulator, built-in paper trading, double-entry audit trails, and an AI trading psychology coach directly into the primary terminal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="p-6 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#18202f] pb-4">
          <div>
            <h3 className="text-lg font-bold font-['Outfit'] text-white">Feature Comparison Matrix</h3>
            <p className="text-xs text-slate-400 font-sans">
              Head-to-head capability comparison against Binance, OKX, Coinbase, and CoinDCX.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#00f59b]/20 text-[#00f59b] border border-[#00f59b]/40 font-bold'
                    : 'bg-[#111724] text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-[#18202f] font-mono text-xs">
            <thead className="text-[10px] text-slate-400 uppercase bg-[#0e131d]">
              <tr>
                <th className="px-4 py-3">Feature Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Binance</th>
                <th className="px-4 py-3">OKX</th>
                <th className="px-4 py-3">Coinbase</th>
                <th className="px-4 py-3">CoinDCX</th>
                <th className="px-4 py-3 text-[#00f59b] bg-[#00f59b]/5">Aliens Exchange Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#131a27] text-[11px]">
              {filteredMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#111724] transition-colors">
                  <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{item.featureName}</td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{item.category}</td>
                  <td className="px-4 py-3 text-slate-300 font-sans text-xs">{item.binance}</td>
                  <td className="px-4 py-3 text-slate-300 font-sans text-xs">{item.okx}</td>
                  <td className="px-4 py-3 text-slate-300 font-sans text-xs">{item.coinbase}</td>
                  <td className="px-4 py-3 text-slate-300 font-sans text-xs">{item.coindcx}</td>
                  <td className="px-4 py-3 bg-[#00f59b]/5 text-[#00f59b] font-sans text-xs font-semibold">
                    {item.aliensAdvantage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aliens Exchange 32 Features Complete Inventory */}
      <div className="p-6 bg-[#0a0d14] border border-[#18202f] rounded-xl space-y-4">
        <div className="border-b border-[#18202f] pb-3">
          <h3 className="text-lg font-bold font-['Outfit'] text-white">
            Aliens Exchange 32 Next-Generation Features Evaluated & Implemented
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Full inventory of enterprise capabilities addressing user pain points identified in competitor research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALIENS_30_PLUS_FEATURES.map((feat) => (
            <div
              key={feat.id}
              className="p-3.5 bg-[#0e1420] border border-[#162133] rounded-lg space-y-1.5 hover:border-[#00f59b]/40 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 font-bold">#{feat.id} {feat.category}</span>
                <span className="text-[#00f59b] text-[10px] font-semibold bg-[#00f59b]/10 px-2 py-0.5 rounded border border-[#00f59b]/30">
                  {feat.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white font-['Outfit']">{feat.title}</h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
