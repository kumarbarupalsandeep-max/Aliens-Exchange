/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Aliens Exchange Main Application Entry Point
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { MarketTickerBar } from './components/MarketTickerBar.tsx';
import { CandleChart } from './components/CandleChart.tsx';
import { OrderBook } from './components/OrderBook.tsx';
import { OrderDesk } from './components/OrderDesk.tsx';
import { ActiveOrders } from './components/ActiveOrders.tsx';
import { SmartOrderPreviewModal } from './components/SmartOrderPreviewModal.tsx';
import { AIMarketModal } from './components/AIMarketModal.tsx';
import { PaperTradingBacktestModal } from './components/PaperTradingBacktestModal.tsx';
import { TradingJournalModal } from './components/TradingJournalModal.tsx';
import { PortfolioRiskView } from './components/PortfolioRiskView.tsx';
import { TradingBotsView } from './components/TradingBotsView.tsx';
import { ProofOfReservesView } from './components/ProofOfReservesView.tsx';
import { SecurityView } from './components/SecurityView.tsx';
import { DeveloperSandboxView } from './components/DeveloperSandboxView.tsx';
import { CompetitorResearchView } from './components/CompetitorResearchView.tsx';
import { EmergencyLockModal } from './components/EmergencyLockModal.tsx';
import {
  MarketTicker,
  CandleStick,
  TradeTapeItem,
  ExchangeOrder,
  OrderType,
  OrderSide,
} from './types.ts';
import { OrderImpactResult, Orderbook } from './utils/engine.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('trade');
  const [isPaperMode, setIsPaperMode] = useState<boolean>(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [timeframe, setTimeframe] = useState<string>('15m');

  // Market & Trading State
  const [markets, setMarkets] = useState<MarketTicker[]>([]);
  const [klines, setKlines] = useState<CandleStick[]>([]);
  const [orderbook, setOrderbook] = useState<Orderbook>({ bids: [], asks: [] });
  const [trades, setTrades] = useState<TradeTapeItem[]>([]);
  const [orders, setOrders] = useState<ExchangeOrder[]>([]);
  const [userBalances, setUserBalances] = useState<Record<string, { available: number; locked: number }>>({});
  const [paperBalances, setPaperBalances] = useState<Record<string, number>>({
    USDT: 50000,
    BTC: 1.0,
    ETH: 10.0,
    SOL: 50.0,
    ALIEN: 20000.0,
  });

  // Modals & Selected interactions
  const [selectedPriceFromBook, setSelectedPriceFromBook] = useState<number | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<{
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    impact: OrderImpactResult;
  } | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [emergencyLockOpen, setEmergencyLockOpen] = useState<boolean>(false);

  // Fetch initial market data
  const fetchMarketData = useCallback(async () => {
    try {
      const [mRes, obRes, trRes] = await Promise.all([
        fetch('/api/markets'),
        fetch(`/api/orderbook?symbol=${encodeURIComponent(selectedSymbol)}`),
        fetch(`/api/trades?symbol=${encodeURIComponent(selectedSymbol)}`),
      ]);
      const mJson = await mRes.json();
      const obJson = await obRes.json();
      const trJson = await trRes.json();

      setMarkets(mJson.markets || []);
      setOrderbook({ bids: obJson.bids || [], asks: obJson.asks || [] });
      setTrades(trJson.trades || []);
    } catch (err) {
      console.error('Error fetching market ticks:', err);
    }
  }, [selectedSymbol]);

  // Fetch Klines
  const fetchKlines = useCallback(async () => {
    try {
      const res = await fetch(`/api/ohlcv?symbol=${encodeURIComponent(selectedSymbol)}&timeframe=${timeframe}`);
      const data = await res.json();
      setKlines(data.klines || []);
    } catch (err) {
      console.error('Error fetching klines:', err);
    }
  }, [selectedSymbol, timeframe]);

  // Fetch User Orders & Balances
  const fetchUserData = useCallback(async () => {
    try {
      const [ordRes, ledgRes, papRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/ledger'),
        fetch('/api/paper-trading'),
      ]);
      const ordJson = await ordRes.json();
      const ledgJson = await ledgRes.json();
      const papJson = await papRes.json();

      setOrders(ordJson.orders || []);
      setUserBalances(ledgJson.balances || {});
      if (papJson.paperBalance) setPaperBalances(papJson.paperBalance);
    } catch (err) {
      console.error('Error fetching user orders & ledger:', err);
    }
  }, []);

  // Poll tickers every 3s
  useEffect(() => {
    fetchMarketData();
    fetchKlines();
    fetchUserData();

    const interval = setInterval(() => {
      fetchMarketData();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchMarketData, fetchKlines, fetchUserData]);

  // When timeframe or symbol changes, re-fetch klines
  useEffect(() => {
    fetchKlines();
  }, [fetchKlines]);

  const currentMarket = markets.find((m) => m.symbol === selectedSymbol) || markets[0] || {
    symbol: 'BTC/USDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    lastPrice: 65420.5,
    change24h: 1845.2,
    change24hPercent: 2.9,
  };

  // Place Order Handler
  const handlePlaceOrder = async (orderPayload: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    triggerPrice?: number;
    isPaper: boolean;
  }) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (data.success) {
        fetchUserData();
        fetchMarketData();
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
    }
  };

  // Cancel Order Handler
  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchUserData();
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  // Cancel All Handler
  const handleCancelAll = async () => {
    const openOrders = orders.filter((o) => o.status === 'open');
    for (const o of openOrders) {
      await handleCancelOrder(o.id);
    }
  };

  // Reset Paper Balances
  const handleResetPaper = async () => {
    try {
      const res = await fetch('/api/paper-trading/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPaperBalances(data.paperBalance);
      }
    } catch (err) {
      console.error('Failed to reset paper balance:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-200 flex flex-col selection:bg-[#00f59b]/20 selection:text-[#00f59b]">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPaperMode={isPaperMode}
        setIsPaperMode={setIsPaperMode}
        onOpenEmergencyLock={() => setEmergencyLockOpen(true)}
        onOpenAIInsight={() => setAiModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'trade' && (
          <div className="flex-1 flex flex-col">
            {/* Live Ticker Bar */}
            <MarketTickerBar
              markets={markets}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={(sym) => setSelectedSymbol(sym)}
              onOpenAIInsight={() => setAiModalOpen(true)}
            />

            {/* Trading Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
              {/* Candlestick Chart (7 cols on Desktop) */}
              <div className="lg:col-span-6 xl:col-span-7 border-r border-[#18202f] flex flex-col min-h-[380px] lg:min-h-full">
                <CandleChart
                  symbol={selectedSymbol}
                  klines={klines}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                  currentPrice={currentMarket.lastPrice}
                />
              </div>

              {/* Order Book & Trade Tape (3 cols) */}
              <div className="lg:col-span-3 xl:col-span-2 border-r border-[#18202f] flex flex-col min-h-[320px] lg:min-h-full">
                <OrderBook
                  orderbook={orderbook}
                  trades={trades}
                  currentPrice={currentMarket.lastPrice}
                  baseAsset={currentMarket.baseAsset}
                  quoteAsset={currentMarket.quoteAsset}
                  onPriceSelect={(p) => setSelectedPriceFromBook(p)}
                />
              </div>

              {/* Order Execution Desk (3 cols) */}
              <div className="lg:col-span-3 xl:col-span-3 flex flex-col min-h-[360px] lg:min-h-full">
                <OrderDesk
                  symbol={selectedSymbol}
                  baseAsset={currentMarket.baseAsset}
                  quoteAsset={currentMarket.quoteAsset}
                  currentPrice={currentMarket.lastPrice}
                  orderbook={orderbook}
                  userBalances={userBalances}
                  isPaperMode={isPaperMode}
                  paperBalances={paperBalances}
                  onPlaceOrder={handlePlaceOrder}
                  onOpenPreview={(data) => {
                    setPreviewData(data);
                    setPreviewModalOpen(true);
                  }}
                  selectedPriceFromBook={selectedPriceFromBook}
                />
              </div>
            </div>

            {/* Active Orders Desk */}
            <ActiveOrders
              orders={orders}
              onCancelOrder={handleCancelOrder}
              onCancelAll={handleCancelAll}
            />
          </div>
        )}

        {activeTab === 'backtest' && (
          <PaperTradingBacktestModal
            currentSymbol={selectedSymbol}
            paperBalances={paperBalances}
            onResetPaperBalance={handleResetPaper}
            onTradeInPaper={() => {
              setIsPaperMode(true);
              setActiveTab('trade');
            }}
          />
        )}

        {activeTab === 'bots' && <TradingBotsView />}

        {activeTab === 'journal' && <TradingJournalModal />}

        {activeTab === 'risk-ledger' && (
          <PortfolioRiskView onRefreshLedger={fetchUserData} />
        )}

        {activeTab === 'reserves' && <ProofOfReservesView />}

        {activeTab === 'security' && (
          <SecurityView onTriggerEmergencyLock={() => setEmergencyLockOpen(true)} />
        )}

        {activeTab === 'developer' && <DeveloperSandboxView />}

        {activeTab === 'research' && <CompetitorResearchView />}
      </main>

      {/* Flagship Modals */}
      <SmartOrderPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onConfirmOrder={() => {
          if (previewData) {
            handlePlaceOrder({
              symbol: selectedSymbol,
              side: previewData.side,
              type: previewData.type,
              price: previewData.price,
              amount: previewData.amount,
              isPaper: isPaperMode,
            });
          }
        }}
        symbol={selectedSymbol}
        side={previewData?.side || 'buy'}
        type={previewData?.type || 'limit'}
        amount={previewData?.amount || 0}
        price={previewData?.price || currentMarket.lastPrice}
        impact={previewData?.impact || null}
        baseAsset={currentMarket.baseAsset}
        quoteAsset={currentMarket.quoteAsset}
        isPaper={isPaperMode}
      />

      <AIMarketModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        symbol={selectedSymbol}
        lastPrice={currentMarket.lastPrice}
        change24hPercent={currentMarket.change24hPercent}
      />

      <EmergencyLockModal
        isOpen={emergencyLockOpen}
        onClose={() => setEmergencyLockOpen(false)}
        onLockConfirmed={() => {
          fetchUserData();
        }}
      />
    </div>
  );
}
