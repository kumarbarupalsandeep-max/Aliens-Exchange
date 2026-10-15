/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Aliens Exchange Top Bar Navigation adhering to Universal Top Bar Contract
 */

import React from 'react';
import { Shield, Zap, Terminal, AlertTriangle, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPaperMode: boolean;
  setIsPaperMode: (mode: boolean) => void;
  onOpenEmergencyLock: () => void;
  onOpenAIInsight: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isPaperMode,
  setIsPaperMode,
  onOpenEmergencyLock,
  onOpenAIInsight,
}) => {
  const navItems = [
    { id: 'trade', label: 'Trade Desk' },
    { id: 'backtest', label: 'Backtester' },
    { id: 'bots', label: 'Trading Bots' },
    { id: 'journal', label: 'Journal' },
    { id: 'risk-ledger', label: 'Risk & Ledger' },
    { id: 'reserves', label: 'Proof of Reserves' },
    { id: 'security', label: 'Security' },
    { id: 'developer', label: 'API Sandbox' },
    { id: 'research', label: 'Competitor Hub' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090e]/95 backdrop-blur-md border-b border-[#18202f] px-4 lg:px-6 h-14 flex items-center justify-between gap-6">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveTab('trade')}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f59b]/20 to-[#00e5ff]/20 border border-[#00f59b]/40 flex items-center justify-center text-[#00f59b] font-bold text-lg shadow-[0_0_12px_rgba(0,245,155,0.2)]">
            <span className="font-mono tracking-tighter">⍙</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold font-['Outfit'] tracking-tight text-white group-hover:text-[#00f59b] transition-colors whitespace-nowrap">
              Aliens Exchange
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider -mt-1 hidden sm:block">
              INSTITUTIONAL GRADE
            </span>
          </div>
        </button>

        {/* Live System Health indicator */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 pl-3 border-l border-[#1e293b]">
          <Activity className="w-3.5 h-3.5 text-[#00f59b]" />
          <span className="font-mono text-[11px] text-slate-300">Matching Engine: 1.2ms</span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Single-Line, No Pills) */}
      <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-medium text-slate-300 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded transition-all whitespace-nowrap shrink-0 text-xs ${
                isActive
                  ? 'text-[#00f59b] bg-[#00f59b]/10 font-semibold border-b-2 border-[#00f59b]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions (Paper Mode Switch + AI Intelligence + Emergency Lockdown) */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Paper Trading Mode Segmented Toggle */}
        <div className="flex items-center bg-[#101622] p-0.5 rounded border border-[#1e2a3e]">
          <button
            onClick={() => setIsPaperMode(false)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
              !isPaperMode
                ? 'bg-[#1a2334] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Desk
          </button>
          <button
            onClick={() => setIsPaperMode(true)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
              isPaperMode
                ? 'bg-[#00f59b]/20 text-[#00f59b] font-semibold border border-[#00f59b]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paper $50K
          </button>
        </div>

        {/* AI Market Intelligence Trigger */}
        <button
          onClick={onOpenAIInsight}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#00e5ff] bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 border border-[#00e5ff]/30 rounded transition-colors whitespace-nowrap"
          title="Open AI Market Analysis powered by Gemini"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Analysis</span>
        </button>

        {/* Emergency Kill Switch */}
        <button
          onClick={onOpenEmergencyLock}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 rounded transition-colors whitespace-nowrap"
          title="Emergency Account Lockdown"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Emergency Lock</span>
        </button>
      </div>
    </header>
  );
};
