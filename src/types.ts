/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Aliens Exchange Types Definition
 */

export interface MarketTicker {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  fundingRate: number;
  nextFundingIn: string;
}

export interface CandleStick {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradeTapeItem {
  id: string;
  price: number;
  size: number;
  time: number;
  side: 'buy' | 'sell';
}

export type OrderType = 'limit' | 'market' | 'stop_limit' | 'trailing_stop';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'open' | 'partially_filled' | 'filled' | 'canceled';

export interface ExchangeOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  filled: number;
  remaining: number;
  status: OrderStatus;
  createdAt: number;
  triggerPrice?: number;
  trailOffsetPercent?: number;
  feePaid: number;
  isPaper: boolean;
}

export interface TradingBot {
  id: string;
  name: string;
  type: 'grid' | 'dca' | 'arbitrage';
  symbol: string;
  status: 'active' | 'paused' | 'stopped';
  investmentUSDT: number;
  unrealizedPnL: number;
  realizedPnL: number;
  roiPercent: number;
  runtimeHours: number;
  tradesCompleted: number;
  config: {
    lowerPrice?: number;
    upperPrice?: number;
    gridCount?: number;
    intervalHours?: number;
    dcaAmount?: number;
    arbitrageSpreadThreshold?: number;
  };
}

export interface BacktestResult {
  strategyName: string;
  symbol: string;
  timeframe: string;
  initialBalance: number;
  finalBalance: number;
  netProfitUSDT: number;
  returnPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePercent: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  equityCurve: { time: string; equity: number }[];
  trades: {
    entryTime: string;
    exitTime: string;
    type: 'LONG' | 'SHORT';
    entryPrice: number;
    exitPrice: number;
    pnlPercent: number;
    pnlUSDT: number;
  }[];
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnlUSDT: number;
  emotionalTag: 'Disciplined' | 'FOMO' | 'Revenge' | 'Hesitant' | 'Calm';
  mistakeTag: 'None' | 'Chased Entry' | 'Early Exit' | 'Overleveraged' | 'Violated Strategy' | 'Moved Stop';
  notes: string;
  aiFeedback?: string;
}

export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: ('read' | 'trade' | 'withdraw')[];
  ipWhitelistEnabled: boolean;
  whitelistedIps: string[];
  createdAt: number;
  lastUsed: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  timestamp: number;
  targetUrl: string;
  statusCode: number;
  payload: string;
}

export interface CompetitorComparison {
  featureName: string;
  category: string;
  binance: string;
  okx: string;
  coinbase: string;
  coindcx: string;
  aliensExchange: string;
  aliensAdvantage: string;
}
