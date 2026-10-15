/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Aliens Exchange Full-Stack Production Express Server
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  calculateOrderImpact,
  DoubleEntryLedger,
  buildProofOfReservesMerkle,
  calculatePortfolioRisk,
  type Orderbook,
} from './src/utils/engine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb', strict: true }));
app.use((_req: Request, res: Response, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// This application is a demo, not a custody or live-trading service.

// Initialize Gemini Client server-side
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Initialize Server In-Memory Exchange State with Double-Entry Ledger
const ledger = new DoubleEntryLedger();

// Seed Initial Balances via double-entry
ledger.transfer('EXTERNAL_NETWORK', 'user_live', 'USDT', 25000, 'Initial verified deposit');
ledger.transfer('EXTERNAL_NETWORK', 'user_live', 'BTC', 0.85, 'Initial verified deposit');
ledger.transfer('EXTERNAL_NETWORK', 'user_live', 'ETH', 6.5, 'Initial verified deposit');
ledger.transfer('EXTERNAL_NETWORK', 'user_live', 'SOL', 45, 'Initial verified deposit');
ledger.transfer('EXTERNAL_NETWORK', 'user_live', 'ALIEN', 12500, 'Airdrop grant');

// Paper Trading Virtual Balance
let paperBalance = {
  USDT: 50000,
  BTC: 1.0,
  ETH: 10.0,
  SOL: 50.0,
  ALIEN: 20000.0,
};

// Market Tickers Seed
const MARKETS = [
  {
    symbol: 'BTC/USDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    lastPrice: 65420.5,
    change24h: 1845.2,
    change24hPercent: 2.90,
    high24h: 66100.0,
    low24h: 63250.0,
    volume24h: 18420.45,
    quoteVolume24h: 1198540200,
    fundingRate: 0.0001,
    nextFundingIn: '03:42:15',
  },
  {
    symbol: 'ETH/USDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    lastPrice: 3485.2,
    change24h: -42.8,
    change24hPercent: -1.21,
    high24h: 3560.0,
    low24h: 3410.0,
    volume24h: 142850.1,
    quoteVolume24h: 498210300,
    fundingRate: 0.00008,
    nextFundingIn: '03:42:15',
  },
  {
    symbol: 'SOL/USDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    lastPrice: 154.8,
    change24h: 7.6,
    change24hPercent: 5.16,
    high24h: 158.4,
    low24h: 145.2,
    volume24h: 845210.0,
    quoteVolume24h: 129480000,
    fundingRate: 0.00015,
    nextFundingIn: '03:42:15',
  },
  {
    symbol: 'ALIEN/USDT',
    baseAsset: 'ALIEN',
    quoteAsset: 'USDT',
    lastPrice: 4.82,
    change24h: 0.68,
    change24hPercent: 16.42,
    high24h: 5.20,
    low24h: 4.05,
    volume24h: 4120900.0,
    quoteVolume24h: 19860000,
    fundingRate: 0.0002,
    nextFundingIn: '03:42:15',
  },
  {
    symbol: 'XRP/USDT',
    baseAsset: 'XRP',
    quoteAsset: 'USDT',
    lastPrice: 0.584,
    change24h: 0.018,
    change24hPercent: 3.18,
    high24h: 0.602,
    low24h: 0.561,
    volume24h: 15400000.0,
    quoteVolume24h: 8993600,
    fundingRate: 0.0001,
    nextFundingIn: '03:42:15',
  },
  {
    symbol: 'AVAX/USDT',
    baseAsset: 'AVAX',
    quoteAsset: 'USDT',
    lastPrice: 28.45,
    change24h: -0.85,
    change24hPercent: -2.90,
    high24h: 29.8,
    low24h: 27.9,
    volume24h: 620400.0,
    quoteVolume24h: 17650000,
    fundingRate: 0.0001,
    nextFundingIn: '03:42:15',
  },
];

// Generate dynamic orderbook depth around current market price
function getDynamicOrderbook(symbol: string): Orderbook {
  const market = MARKETS.find((m) => m.symbol === symbol) || MARKETS[0];
  const centerPrice = market.lastPrice;
  const tickStep = centerPrice > 1000 ? 5 : centerPrice > 10 ? 0.05 : 0.001;

  const bids = [];
  const asks = [];

  let cumBidSize = 0;
  for (let i = 1; i <= 15; i++) {
    const price = Number((centerPrice - i * tickStep).toFixed(centerPrice > 100 ? 2 : 4));
    const size = Number((Math.random() * 2 + 0.2 * i).toFixed(4));
    cumBidSize += size;
    bids.push({ price, size, total: Number(cumBidSize.toFixed(4)) });
  }

  let cumAskSize = 0;
  for (let i = 1; i <= 15; i++) {
    const price = Number((centerPrice + i * tickStep).toFixed(centerPrice > 100 ? 2 : 4));
    const size = Number((Math.random() * 2 + 0.2 * i).toFixed(4));
    cumAskSize += size;
    asks.push({ price, size, total: Number(cumAskSize.toFixed(4)) });
  }

  return { bids, asks };
}

// Generate realistic klines (OHLCV)
function generateKlines(symbol: string, timeframe: string, count = 60) {
  const market = MARKETS.find((m) => m.symbol === symbol) || MARKETS[0];
  const base = market.lastPrice;
  const klines = [];
  const intervalMs =
    timeframe === '1m'
      ? 60 * 1000
      : timeframe === '5m'
      ? 5 * 60 * 1000
      : timeframe === '15m'
      ? 15 * 60 * 1000
      : timeframe === '1h'
      ? 60 * 60 * 1000
      : timeframe === '4h'
      ? 4 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

  const now = Date.now();
  let currClose = base * 0.94;

  for (let i = count; i >= 0; i--) {
    const time = now - i * intervalMs;
    const volatility = base * 0.008;
    const open = currClose;
    const delta = (Math.random() - 0.48) * volatility;
    const close = Math.max(open * 0.8, open + delta);
    const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.5);
    const volume = Math.random() * 45 + 5;
    currClose = close;

    klines.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(volume.toFixed(2)),
    });
  }

  // Ensure last candle close equals current market price
  klines[klines.length - 1].close = market.lastPrice;
  return klines;
}

// Open Orders store
let userOrders: any[] = [
  {
    id: 'ORD-98214',
    symbol: 'BTC/USDT',
    side: 'buy',
    type: 'limit',
    price: 64200.0,
    amount: 0.25,
    filled: 0,
    remaining: 0.25,
    status: 'open',
    createdAt: Date.now() - 1000 * 60 * 42,
    feePaid: 0,
    isPaper: true,
  },
  {
    id: 'ORD-97431',
    symbol: 'ETH/USDT',
    side: 'sell',
    type: 'stop_limit',
    price: 3600.0,
    triggerPrice: 3580.0,
    amount: 1.5,
    filled: 0,
    remaining: 1.5,
    status: 'open',
    createdAt: Date.now() - 1000 * 60 * 120,
    feePaid: 0,
    isPaper: true,
  },
];

// Trading Bots store
let activeBots = [
  {
    id: 'BOT-GRID-01',
    name: 'BTC Spot Neutral Grid',
    type: 'grid',
    symbol: 'BTC/USDT',
    status: 'active',
    investmentUSDT: 5000,
    unrealizedPnL: 142.5,
    realizedPnL: 384.2,
    roiPercent: 10.53,
    runtimeHours: 96,
    tradesCompleted: 42,
    config: {
      lowerPrice: 60000,
      upperPrice: 70000,
      gridCount: 12,
    },
  },
  {
    id: 'BOT-DCA-02',
    name: 'ETH Long-Term Accumulator',
    type: 'dca',
    symbol: 'ETH/USDT',
    status: 'active',
    investmentUSDT: 2500,
    unrealizedPnL: 68.4,
    realizedPnL: 95.1,
    roiPercent: 6.54,
    runtimeHours: 168,
    tradesCompleted: 14,
    config: {
      intervalHours: 12,
      dcaAmount: 150,
    },
  },
];

// API Keys Store
let apiKeys = [
  {
    id: 'KEY-PRO-01',
    name: 'Quant Trading Algo (AWS)',
    keyPrefix: 'alien_live_9f8a2...',
    permissions: ['read', 'trade'],
    ipWhitelistEnabled: true,
    whitelistedIps: ['54.210.84.12', '18.192.44.201'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    lastUsed: '2 minutes ago',
  },
];

// Active Sessions Store
let activeSessions = [
  {
    id: 'SESS-01',
    device: 'MacBook Pro 16" (macOS 15.3)',
    browser: 'Chrome 134.0',
    ipAddress: '103.24.89.12',
    location: 'Singapore (Singtel AP)',
    lastActive: 'Active Now',
    isCurrent: true,
  },
  {
    id: 'SESS-02',
    device: 'iPhone 16 Pro (iOS 18.2)',
    browser: 'Aliens Exchange Mobile App',
    ipAddress: '157.48.21.90',
    location: 'Mumbai, India',
    lastActive: '3 hours ago',
    isCurrent: false,
  },
];

// Webhook simulation logs
let webhookLogs: any[] = [
  {
    id: 'WH-01',
    event: 'order.filled',
    timestamp: Date.now() - 1000 * 60 * 15,
    targetUrl: 'https://api.quantbot.internal/webhooks/aliens',
    statusCode: 200,
    payload: JSON.stringify({ event: 'order.filled', orderId: 'ORD-98214', symbol: 'BTC/USDT', price: 65400, size: 0.1 }),
  },
];

/* ------------------- REST API ROUTES ------------------- */

// 1. Markets list
app.get('/api/markets', (req: Request, res: Response) => {
  // Add small micro-tick movement for realistic activity
  MARKETS.forEach((m) => {
    const nudge = (Math.random() - 0.49) * (m.lastPrice * 0.0004);
    m.lastPrice = Number((m.lastPrice + nudge).toFixed(m.lastPrice > 100 ? 2 : 4));
  });
  res.json({ markets: MARKETS, serverTime: Date.now() });
});

// 2. Candlestick OHLCV data
app.get('/api/ohlcv', (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string) || 'BTC/USDT';
  const timeframe = (req.query.timeframe as string) || '15m';
  const klines = generateKlines(symbol, timeframe, 80);
  res.json({ symbol, timeframe, klines });
});

// 3. Orderbook depth
app.get('/api/orderbook', (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string) || 'BTC/USDT';
  const orderbook = getDynamicOrderbook(symbol);
  res.json({ symbol, ...orderbook, timestamp: Date.now() });
});

// 4. Recent public trade tape
app.get('/api/trades', (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string) || 'BTC/USDT';
  const market = MARKETS.find((m) => m.symbol === symbol) || MARKETS[0];
  const now = Date.now();
  const trades = [];
  for (let i = 0; i < 20; i++) {
    const side: 'buy' | 'sell' = Math.random() > 0.48 ? 'buy' : 'sell';
    const delta = (Math.random() - 0.5) * (market.lastPrice * 0.001);
    trades.push({
      id: `TR-${now - i * 1200}`,
      price: Number((market.lastPrice + delta).toFixed(market.lastPrice > 100 ? 2 : 4)),
      size: Number((Math.random() * 1.5 + 0.05).toFixed(4)),
      time: now - i * 1800,
      side,
    });
  }
  res.json({ symbol, trades });
});

// 5. Smart Order Preview & Slippage Estimator
app.post('/api/order-impact', (req: Request, res: Response) => {
  const { symbol, side, size } = req.body;
  if (!symbol || !side || !size || size <= 0) {
    return res.status(400).json({ error: 'Invalid parameters: symbol, side and positive size are required' });
  }

  const orderbook = getDynamicOrderbook(symbol);
  const impact = calculateOrderImpact(orderbook, side, Number(size));
  res.json({ symbol, impact });
});

// 6. User Balances & Ledger
app.get('/api/ledger', (req: Request, res: Response) => {
  const balances = ledger.getAllBalances('user_live');
  const history = ledger.getHistory();
  const integrity = ledger.verifyIntegrity('USDT');
  res.json({
    userId: 'user_live',
    balances,
    history,
    ledgerSolvent: integrity.valid,
    serverTime: Date.now(),
  });
});

// 7. Orders Management
app.get('/api/orders', (req: Request, res: Response) => {
  res.json({ orders: userOrders });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { symbol, side, type, price, amount, triggerPrice, isPaper } = req.body ?? {};
  const supportedSymbols = new Set(MARKETS.map((market) => market.symbol));
  const supportedTypes = new Set(['limit', 'market', 'stop_limit', 'trailing_stop']);
  const parsedAmount = Number(amount);
  const parsedPrice = Number(price);
  const parsedTriggerPrice = triggerPrice === undefined ? undefined : Number(triggerPrice);
  if (
    typeof symbol !== 'string' || !supportedSymbols.has(symbol) ||
    (side !== 'buy' && side !== 'sell') ||
    typeof type !== 'string' || !supportedTypes.has(type) ||
    !Number.isFinite(parsedAmount) || parsedAmount <= 0 ||
    !Number.isFinite(parsedPrice) || parsedPrice <= 0 ||
    (parsedTriggerPrice !== undefined && (!Number.isFinite(parsedTriggerPrice) || parsedTriggerPrice <= 0)) ||
    typeof isPaper !== 'boolean'
  ) {
    return res.status(400).json({ error: 'Invalid order: check symbol, side, type, positive finite price/amount, trigger price, and paper-mode flag' });
  }

  if (isPaper) {
    // Paper trading path
    const orderCost = parsedPrice * parsedAmount;
    const [paperBase, paperQuote] = symbol.split('/');
    const requiredPaperAsset = side === 'buy' ? paperQuote : paperBase;
    const requiredPaperAmount = side === 'buy' ? orderCost * 1.001 : parsedAmount;
    const availablePaperBalance = paperBalance[requiredPaperAsset as keyof typeof paperBalance] || 0;
    if (availablePaperBalance < requiredPaperAmount) {
      return res.status(400).json({ error: `Insufficient paper ${requiredPaperAsset} balance` });
    }

    const orderId = `PORD-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: orderId,
      symbol,
      side,
      type,
      price: parsedPrice,
      amount: parsedAmount,
      filled: type === 'market' ? parsedAmount : 0,
      remaining: type === 'market' ? 0 : parsedAmount,
      status: type === 'market' ? 'filled' : 'open',
      createdAt: Date.now(),
      triggerPrice: triggerPrice ? Number(triggerPrice) : undefined,
      feePaid: type === 'market' ? orderCost * 0.001 : 0,
      isPaper: true,
    };

    if (type === 'market') {
      const fee = orderCost * 0.001;
      if (side === 'buy') {
        paperBalance.USDT -= orderCost + fee;
        paperBalance[paperBase as keyof typeof paperBalance] = (paperBalance[paperBase as keyof typeof paperBalance] || 0) + parsedAmount;
      } else {
        paperBalance[paperBase as keyof typeof paperBalance] = (paperBalance[paperBase as keyof typeof paperBalance] || 0) - parsedAmount;
        paperBalance.USDT += orderCost - fee;
      }
      newOrder.feePaid = fee;
    }

    userOrders.unshift(newOrder);
    return res.json({ success: true, order: newOrder, message: 'Paper order submitted successfully' });
  }

  return res.status(403).json({ error: 'Live trading is disabled: authentication, persistent accounting, and a verified exchange adapter are not configured. Use paper mode.' });
});

app.delete('/api/orders/:id', (req: Request, res: Response) => {
  const orderId = req.params.id;
  const orderIndex = userOrders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const order = userOrders[orderIndex];
  if (order.status !== 'open') {
    return res.status(400).json({ error: 'Order cannot be canceled because it is not open' });
  }

  // Release locked funds if live
  if (!order.isPaper) {
    const [base, quote] = order.symbol.split('/');
    const lockedAsset = order.side === 'buy' ? quote : base;
    const lockedAmount = order.side === 'buy' ? order.price * order.remaining : order.remaining;
    ledger.releaseLockedFunds('user_live', lockedAsset, lockedAmount);
  }

  order.status = 'canceled';
  res.json({ success: true, canceledOrder: order });
});

// 8. Deposits and withdrawals remain disabled until chain verification and custody integrations exist.
app.post('/api/deposit', (_req: Request, res: Response) => {
  return res.status(403).json({ error: 'Deposits are disabled. This demo does not verify on-chain transactions.' });
});

app.post('/api/withdraw', (_req: Request, res: Response) => {
  return res.status(403).json({ error: 'Withdrawals are disabled. This demo cannot submit or verify blockchain transfers.' });
});

// 10. Paper Trading virtual balance reset
app.get('/api/paper-trading', (req: Request, res: Response) => {
  res.json({ paperBalance });
});

app.post('/api/paper-trading/reset', (req: Request, res: Response) => {
  paperBalance = {
    USDT: 50000,
    BTC: 1.0,
    ETH: 10.0,
    SOL: 50.0,
    ALIEN: 20000.0,
  };
  res.json({ success: true, paperBalance });
});

// 11. Strategy Backtesting Engine
app.post('/api/backtest', (req: Request, res: Response) => {
  const { strategy, symbol, timeframe, initialBalance } = req.body;
  const initial = Number(initialBalance) || 10000;
  const selectedSymbol = symbol || 'BTC/USDT';

  // Deterministic backtest execution simulating 180 bars
  const winRate = strategy === 'rsi_mean_reversion' ? 64.2 : strategy === 'ema_crossover' ? 58.5 : 52.8;
  const totalTrades = 42;
  const winningTrades = Math.round((totalTrades * winRate) / 100);
  const losingTrades = totalTrades - winningTrades;
  const returnPercent = strategy === 'rsi_mean_reversion' ? 34.6 : strategy === 'ema_crossover' ? 26.8 : 18.2;
  const netProfitUSDT = Number(((initial * returnPercent) / 100).toFixed(2));
  const finalBalance = initial + netProfitUSDT;

  const equityCurve = [];
  let currentEquity = initial;
  const days = 30;
  for (let i = 0; i <= days; i++) {
    const progress = i / days;
    const noise = (Math.random() - 0.35) * (initial * 0.02);
    currentEquity = Math.round(initial + netProfitUSDT * progress + noise);
    equityCurve.push({
      time: `Day ${i + 1}`,
      equity: Math.max(initial * 0.85, currentEquity),
    });
  }

  res.json({
    strategyName:
      strategy === 'rsi_mean_reversion'
        ? 'RSI (14) Dynamic Oversold Mean-Reversion'
        : strategy === 'ema_crossover'
        ? 'EMA (20 / 50) Trend-Follow Momentum'
        : 'Bollinger Band Dynamic Breakout',
    symbol: selectedSymbol,
    timeframe: timeframe || '1h',
    initialBalance: initial,
    finalBalance,
    netProfitUSDT,
    returnPercent,
    totalTrades,
    winningTrades,
    losingTrades,
    winRatePercent: winRate,
    profitFactor: 2.15,
    maxDrawdownPercent: 7.4,
    sharpeRatio: 1.84,
    equityCurve,
    simulation: {
      isSimulated: true,
      warning: 'Illustrative output only. This endpoint does not run a historical-data backtest and must not be used to predict returns.',
    },
  });
});

// 12. Trading Bots
app.get('/api/bots', (req: Request, res: Response) => {
  res.json({ bots: activeBots });
});

app.post('/api/bots', (req: Request, res: Response) => {
  const { name, type, symbol, investmentUSDT, config } = req.body;
  const newBot = {
    id: `BOT-${Date.now().toString().slice(-6)}`,
    name: name || `${symbol} ${type.toUpperCase()} Bot`,
    type: type || 'grid',
    symbol: symbol || 'BTC/USDT',
    status: 'active',
    investmentUSDT: Number(investmentUSDT) || 2000,
    unrealizedPnL: 0,
    realizedPnL: 0,
    roiPercent: 0,
    runtimeHours: 0.1,
    tradesCompleted: 0,
    config: config || {},
  };
  activeBots.unshift(newBot);
  res.json({ success: true, bot: newBot });
});

app.patch('/api/bots/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const bot = activeBots.find((b) => b.id === id);
  if (!bot) return res.status(404).json({ error: 'Bot not found' });
  if (status) bot.status = status;
  res.json({ success: true, bot });
});

// 13. Proof of Reserves API
app.get('/api/proof-of-reserves', (req: Request, res: Response) => {
  const users = [
    { id: 'user_live', balanceUSDT: 25000 },
    { id: 'user_institutional_01', balanceUSDT: 4850000 },
    { id: 'user_institutional_02', balanceUSDT: 12400000 },
    { id: 'user_retail_batch_a', balanceUSDT: 8900000 },
    { id: 'user_retail_batch_b', balanceUSDT: 15300000 },
  ];

  const merkle = buildProofOfReservesMerkle(users);
  const coldWalletReserveUSDT = 45200000;
  const hotWalletReserveUSDT = 6800000;
  const totalReservesUSDT = coldWalletReserveUSDT + hotWalletReserveUSDT;
  const reserveRatioPercent = Number(((totalReservesUSDT / merkle.totalUserLiabilities) * 100).toFixed(2));

  res.json({
    merkleRoot: merkle.rootHash,
    totalLiabilitiesUSDT: merkle.totalUserLiabilities,
    coldWalletReserveUSDT,
    hotWalletReserveUSDT,
    totalReservesUSDT,
    reserveRatioPercent,
    isFullyCollateralized: reserveRatioPercent >= 100,
    lastAuditDate: 'Demo data — no audit performed',
    auditor: 'Not audited — sample data only',
    dataSource: 'simulated_demo_data',
    isAudited: false,
    userProof: {
      userId: 'user_live',
      balanceUSDT: 25000,
      merkleLeafHash: merkle.leaves[0].hash,
      includedInRoot: true,
    },
  });
});

// 14. Portfolio Risk Assessment
app.get('/api/risk-monitor', (req: Request, res: Response) => {
  const positions = [
    { asset: 'BTC', amount: 0.85, currentPrice: 65420.5, dailyVolatility: 0.032 },
    { asset: 'ETH', amount: 6.5, currentPrice: 3485.2, dailyVolatility: 0.041 },
    { asset: 'SOL', amount: 45, currentPrice: 154.8, dailyVolatility: 0.055 },
    { asset: 'ALIEN', amount: 12500, currentPrice: 4.82, dailyVolatility: 0.075 },
    { asset: 'USDT', amount: 25000, currentPrice: 1.0, dailyVolatility: 0.001 },
  ];

  const risk = calculatePortfolioRisk(positions);
  res.json({ positions, risk });
});

// 15. Security & Sessions
app.get('/api/security', (req: Request, res: Response) => {
  res.json({
    mode: 'demo',
    isSimulated: true,
    sessions: activeSessions,
    twoFactorEnabled: false,
    antiPhishingCode: null,
    whitelistEnabled: false,
    withdrawalDelayHours: 0,
  });
});

app.post('/api/security/emergency-lock', (req: Request, res: Response) => {
  // Cancel all open orders
  userOrders.forEach((o) => {
    if (o.status === 'open') o.status = 'canceled';
  });
  // Terminate secondary sessions
  activeSessions = activeSessions.filter((s) => s.isCurrent);
  res.json({
    success: true,
    message: 'Emergency lockdown executed: all open orders canceled, external sessions terminated, withdrawals locked.',
  });
});

// 16. Developer API Keys & Webhooks
app.get('/api/developer/keys', (req: Request, res: Response) => {
  res.json({ keys: apiKeys });
});

app.post('/api/developer/keys', (req: Request, res: Response) => {
  const { name, permissions, ipWhitelist } = req.body;
  const newKey = {
    id: `KEY-${Date.now().toString().slice(-6)}`,
    name: name || 'API Trading Key',
    keyPrefix: `alien_live_${Math.random().toString(36).substring(2, 9)}...`,
    permissions: permissions || ['read'],
    ipWhitelistEnabled: !!ipWhitelist,
    whitelistedIps: ipWhitelist ? ipWhitelist.split(',').map((ip: string) => ip.trim()) : [],
    createdAt: Date.now(),
    lastUsed: 'Never',
  };
  apiKeys.push(newKey);
  res.json({ success: true, key: newKey });
});

app.get('/api/developer/webhooks', (req: Request, res: Response) => {
  res.json({ logs: webhookLogs });
});

app.post('/api/developer/webhook-test', (req: Request, res: Response) => {
  const { event, targetUrl } = req.body;
  const log = {
    id: `WH-${Date.now().toString().slice(-6)}`,
    event: event || 'order.filled',
    timestamp: Date.now(),
    targetUrl: targetUrl || 'https://webhook.site/aliens-demo',
    statusCode: 200,
    payload: JSON.stringify({
      event: event || 'order.filled',
      exchange: 'Aliens Exchange',
      orderId: 'ORD-TEST-99',
      symbol: 'BTC/USDT',
      status: 'FILLED',
      timestamp: Date.now(),
    }),
  };
  webhookLogs.unshift(log);
  res.json({ success: true, log });
});

// 17. Server-Side Gemini AI Market Intelligence
app.post('/api/gemini/market-analysis', async (req: Request, res: Response) => {
  const { symbol, lastPrice, change24hPercent, timeframe } = req.body;
  const pair = symbol || 'BTC/USDT';

  if (!ai) {
    // High-fidelity fallback heuristic analysis when GEMINI_API_KEY is not configured
    return res.json({
      analysis: {
        summary: `${pair} is consolidating around $${lastPrice || '65,420'} with a 24-hour shift of ${change24hPercent || '+2.9'}%. Orderbook depth shows solid buyer absorption near immediate support.`,
        keyLevels: {
          support: [(Number(lastPrice || 65000) * 0.975).toFixed(2), (Number(lastPrice || 65000) * 0.95).toFixed(2)],
          resistance: [(Number(lastPrice || 65000) * 1.025).toFixed(2), (Number(lastPrice || 65000) * 1.05).toFixed(2)],
        },
        marketStructure: 'Bullish Continuation within Ascending Channel',
        rsiCondition: 'Neutral / Moderately Bullish (58.4)',
        tradeRecommendation: 'Wait for retest of nearest support or breakout confirmation with high volume before scaling entries.',
        confidencePercent: 84,
      },
      source: 'heuristic',
    });
  }

  try {
    const prompt = `You are the lead quantitative risk analyst and market intelligence engine for Aliens Exchange, a top-tier cryptocurrency trading platform.
Analyze the following crypto market state:
- Asset Pair: ${pair}
- Current Mark Price: $${lastPrice}
- 24h Change: ${change24hPercent}%
- Timeframe: ${timeframe || '15m'}

Provide a structured financial briefing:
1. Concise executive summary of market structure and immediate momentum.
2. Estimated primary support and resistance levels.
3. Market structure status (e.g. Bullish Breakout, Accumulation, Bearish Retracement, Rangebound).
4. Relative Strength / momentum condition.
5. Actionable risk recommendation (stop loss placement, position sizing caution).

Keep tone professional, institutional, and concise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '';
    res.json({
      analysis: {
        summary: text,
        marketStructure: 'Dynamic AI Evaluated',
        confidencePercent: 88,
      },
      source: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Gemini API call failed, falling back to heuristic:', err?.message);
    res.json({
      analysis: {
        summary: `${pair} is testing key liquidity zones near $${lastPrice}. Moving averages indicate strong trend continuation with controlled volume slippage.`,
        keyLevels: {
          support: [(Number(lastPrice || 65000) * 0.975).toFixed(2)],
          resistance: [(Number(lastPrice || 65000) * 1.025).toFixed(2)],
        },
        marketStructure: 'Trend Continuation',
        tradeRecommendation: 'Maintain tight invalidation stops below key support levels.',
        confidencePercent: 80,
      },
      source: 'heuristic_fallback',
    });
  }
});

/* ------------------- VITE / STATIC INTEGRATION ------------------- */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Aliens Exchange server running on http://localhost:${PORT}`);
  });
}

startServer();
