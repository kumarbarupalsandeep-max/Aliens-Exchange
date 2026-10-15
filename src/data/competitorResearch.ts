/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Competitor Research & Aliens Exchange 30+ Feature Matrix
 * Based on official public documentation, API specifications & verified exchange workflows
 */

import { CompetitorComparison } from '../types.ts';

export interface CompetitorProfile {
  name: string;
  hq: string;
  foundingYear: number;
  dailyVolumeEstimated: string;
  strengths: string[];
  limitations: string[];
  userPainPoints: string[];
  apiArchitecture: string;
  securityFeatures: string[];
  complianceRegions: string[];
}

export const COMPETITOR_PROFILES: Record<string, CompetitorProfile> = {
  binance: {
    name: 'Binance',
    hq: 'Global Decentralized / UAE & Bahrain Regulated',
    foundingYear: 2017,
    dailyVolumeEstimated: '$18B - $35B Spot & Derivatives',
    strengths: [
      'Deepest global orderbook liquidity and tightest bid-ask spreads',
      'Extensive pair offerings (>350 spot coins, >1200 trading pairs)',
      'High-throughput matching engine (~1.4M orders/second reported)',
      'Rich ecosystem: Binance Pay, Binance Earn, Launchpool, VIP fee tiers',
    ],
    limitations: [
      'Complex, overcrowded interface overwhelming for casual traders',
      'Fragmented regional compliance (Binance US vs Global vs localized entities)',
      'Customer support queue latency during peak market volatility',
      'Strict regulatory settlements requiring continuous regional feature pruning',
    ],
    userPainPoints: [
      'Hidden slippage on sudden market orders during illiquid flash events',
      'Complicated API key management and unexpected IP rotation lockouts',
      'No built-in paper trading for spot desk (derivatives mock only in testnet)',
      'Lack of integrated trading psychology & mistake journal',
    ],
    apiArchitecture: 'REST API (v3) + WebSocket Streams (binance-spot-api-docs), HMAC SHA256 / Ed25519 authentication, weight-based rate limiting (1200 weight/min standard).',
    securityFeatures: ['SAFU Fund ($1B Reserve)', 'Merkle Tree Proof-of-Reserves (zk-SNARKs)', 'Universal 2FA & YubiKey hardware key support', 'Withdrawal Address Whitelisting'],
    complianceRegions: ['France (AMF)', 'Italy (OAM)', 'Dubai (VARA)', 'Bahrain (CBB)', 'El Salvador'],
  },
  okx: {
    name: 'OKX',
    hq: 'Seychelles / Hong Kong / Dubai',
    foundingYear: 2017,
    dailyVolumeEstimated: '$4B - $10B Spot & Derivatives',
    strengths: [
      'Pioneering Web3 non-custodial multi-chain wallet integrated directly into exchange UI',
      'Advanced unified account mode (cross-margin across spot, futures, options in one ledger)',
      'Monthly clean Merkle tree Proof-of-Reserves reports published publicly',
      'Superior customizable trading terminal UI with TradingView native integration',
    ],
    limitations: [
      'Geographical restrictions excluding US, UK retail derivatives, and restricted zones',
      'Liquidity drop-off on micro-cap altcoin spot pairs compared to Binance',
      'P2P dispute resolution turnaround times can vary',
    ],
    userPainPoints: [
      'Unified account auto-borrowing liquidation risk calculation confusion',
      'Complex multi-wallet switching between exchange and Web3 wallet tabs',
      'Limited automated pre-trade price impact simulation on spot orders',
    ],
    apiArchitecture: 'v5 Unified API (REST + WebSocket), single endpoint architecture for spot, swap, futures, options, batch order submission support.',
    securityFeatures: ['Monthly Proof of Reserves (100%+ reserve ratio)', 'Semi-offline multisig cold vaults', 'Emergency fund protection', 'Anti-phishing code verification'],
    complianceRegions: ['Dubai (VARA Provisional)', 'Singapore (MAS in-principle)', 'Bahamas', 'EEA licensed entities'],
  },
  coinbase: {
    name: 'Coinbase / Coinbase Advanced',
    hq: 'San Francisco, USA (NASDAQ: COIN)',
    foundingYear: 2012,
    dailyVolumeEstimated: '$2B - $5B',
    strengths: [
      'Highest institutional trust and US public company regulatory compliance (SEC regulated)',
      'Cleanest, most intuitive user onboarding and fiat bank on-ramps (ACH, FedNow, SEPA)',
      'Robust Coinbase Prime custody with SOC 1 / SOC 2 Type II audit attestations',
      'High-grade developer platform (Coinbase Developer Platform / Cloud)',
    ],
    limitations: [
      'High retail fee structure (0.4% - 0.6% baseline taker fees on Advanced, up to 1.5% on simple)',
      'Significantly fewer listed pairs compared to offshore competitors (~250 assets)',
      'Strict listing guidelines delay new trending token support',
    ],
    userPainPoints: [
      'Heavy fee burden for small and medium retail volume traders',
      'Frequent service downtime or degraded status during historic market rallies',
      'No native grid trading bots or automated DCA bots directly in the trading desk',
    ],
    apiArchitecture: 'Coinbase Advanced Trade API (REST + WebSocket), JWT / CDP API key authentication, REST rate limits of 30 req/sec.',
    securityFeatures: ['SOC 1 & SOC 2 Type II Certified', 'FDIC insurance on USD cash balances up to $250k', '98%+ assets stored in cold storage', 'YubiKey & WebAuthn support'],
    complianceRegions: ['United States (FinCEN, NYDFS BitLicense, 50-state money transmitter)', 'UK (FCA registered)', 'Germany (BaFin)', 'Ireland (CBI)'],
  },
  coindcx: {
    name: 'CoinDCX',
    hq: 'Mumbai / Bangalore, India',
    foundingYear: 2018,
    dailyVolumeEstimated: '$30M - $100M',
    strengths: [
      'Leading Indian cryptocurrency platform compliant with FIU-IND (Financial Intelligence Unit)',
      'Seamless INR fiat deposit/withdrawal via UPI, IMPS, and localized banking rails',
      'CoinDCX Pro advanced order types and margin trading for Indian domestic traders',
      'Aggregated liquidity model routing through global liquidity providers for major pairs',
    ],
    limitations: [
      '1% TDS (Tax Deducted at Source) compliance required on all crypto sell transactions under Indian tax law',
      'Crypto deposits/withdrawals intermittently restricted or restricted to KYC-verified whitelisted addresses',
      'Lower native on-book liquidity for smaller token pairs without global aggregation',
    ],
    userPainPoints: [
      'TDS deduction tracking and annual tax reporting complexity for active traders',
      'Banking channel disruptions and INR deposit gateway downtime during banking updates',
      'Absence of advanced developer sandbox, automated webhooks, and paper trading',
    ],
    apiArchitecture: 'REST APIs for order placement, ticker, and balance queries with HMAC SHA256 signature authorization.',
    securityFeatures: ['FIU-IND compliant AML/KYC', 'BitGo institutional custody partnership', 'Two-factor authentication (Google Authenticator / SMS)', 'Cold storage multi-signature'],
    complianceRegions: ['India (FIU-IND Registered Reporting Entity)'],
  },
};

export const FEATURE_COMPARISON_MATRIX: CompetitorComparison[] = [
  {
    featureName: 'Advanced Spot Order Types',
    category: 'Trading Engine',
    binance: 'Limit, Market, Stop-Limit, OCO, Trailing Stop',
    okx: 'Limit, Market, Trigger, Trailing Stop, TWAP, Iceberg',
    coinbase: 'Limit, Market, Stop-Limit, Bracket (Take Profit / Stop Loss)',
    coindcx: 'Limit, Market, Stop-Loss Limit',
    aliensExchange: 'Limit, Market, Stop-Limit, Trailing Stop, OCO with Smart Fill Routing',
    aliensAdvantage: 'Integrated interactive Slippage & Price Impact visualizer before order execution',
  },
  {
    featureName: 'Smart Order Preview & Slippage Estimator',
    category: 'Trading Engine',
    binance: 'Basic order total warning only',
    okx: 'Estimated average price on market orders',
    coinbase: 'Estimated price fill for market orders',
    coindcx: 'No real-time slippage simulator',
    aliensExchange: 'Full Orderbook Depth Walk Simulator with levels exhausted & fee impact preview',
    aliensAdvantage: 'Prevents catastrophic fat-finger slippage by calculating weighted fill depth before confirming',
  },
  {
    featureName: 'Paper Trading / Strategy Backtesting',
    category: 'Education & Testing',
    binance: 'Futures Testnet available (separate domain, no unified spot backtest)',
    okx: 'Demo Trading available (toggle mode)',
    coinbase: 'Sandbox environment (API only, no graphical backtesting terminal)',
    coindcx: 'None',
    aliensExchange: 'Built-in 1-Click Instant Paper Trading + Visual Strategy Backtester (EMA, RSI, Breakout)',
    aliensAdvantage: 'Zero-risk strategy validation directly inside the live terminal without separate sign-in',
  },
  {
    featureName: 'AI Market Explanations & Signals',
    category: 'AI & Analytics',
    binance: 'Binance Sensei AI chatbot (separate educational FAQ bot)',
    okx: 'None integrated natively in order desk',
    coinbase: 'None',
    coindcx: 'None',
    aliensExchange: 'Server-Side Gemini 3.8 Flash AI Market Insight & Order Analysis engine',
    aliensAdvantage: 'Real-time technical rationale, support/resistance detection, and risk diagnosis per pair',
  },
  {
    featureName: 'Trading Journal & Psychological Mistake Tagger',
    category: 'Portfolio & Mindset',
    binance: 'Trade history export (CSV only, no psychological tagger)',
    okx: 'P&L analysis module (no emotional tracker)',
    coinbase: 'Basic tax and transaction history',
    coindcx: 'Trade transaction history table',
    aliensExchange: 'Full Trading Journal with FOMO/Revenge tagger, plan adherence scoring & AI trade critique',
    aliensAdvantage: 'Identifies trader behavioral leaks and prevents revenge trading spirals',
  },
  {
    featureName: 'Portfolio Risk & Value-at-Risk (VaR)',
    category: 'Risk Management',
    binance: 'Cross-margin risk ratio bar',
    okx: 'Unified Account Margin Ratio & Stress Index',
    coinbase: 'Simple balance and percentage breakdown',
    coindcx: 'Basic portfolio valuation in INR/USDT',
    aliensExchange: 'Institutional VaR (95% 1-Day), Herfindahl Concentration Index & Flash Crash Stress Tester',
    aliensAdvantage: 'Quantifies extreme downside risk and highlights over-concentration in volatile tokens',
  },
  {
    featureName: 'Unified Double-Entry Asset Ledger',
    category: 'Financial Core',
    binance: 'Internal ledger with user balance views',
    okx: 'Unified ledger for multi-currency margin',
    coinbase: 'Enterprise ledger audited by Deloitte',
    coindcx: 'Relational database balance tracking',
    aliensExchange: 'Cryptographic Double-Entry Ledger with verifiable audit hashes and debit-credit parity',
    aliensAdvantage: 'Guaranteed solvency invariants: funds cannot be minted or lost across transfer states',
  },
  {
    featureName: 'Proof of Reserves (PoR) Transparency',
    category: 'Security & Trust',
    binance: 'zk-SNARKs Merkle Tree monthly reports',
    okx: 'Monthly Merkle tree audit tool with user balance lookup',
    coinbase: 'SEC 10-K regulatory filings + Deloitte audits (no Merkle tool)',
    coindcx: 'Periodic reserve ratio certificate via CoinMarketCap',
    aliensExchange: 'Real-Time Interactive Merkle Tree Leaf Validator + Cold/Hot Vault Address Audit',
    aliensAdvantage: 'Users can verify their exact balance inclusion in the cryptographic root directly in UI',
  },
  {
    featureName: 'Automated Trading Bots',
    category: 'Automation',
    binance: 'Spot Grid, Futures Grid, DCA, Rebalancing Bot',
    okx: 'Spot Grid, Moon Grid, DCA, Arbitrage Bot',
    coinbase: 'None built-in (third-party API integration only)',
    coindcx: 'None',
    aliensExchange: 'Native Spot Grid, DCA (Dollar Cost Averaging), and Arbitrage Spread Prober with live status',
    aliensAdvantage: 'One-click launch with pre-calculated profit per grid and active trigger monitoring',
  },
  {
    featureName: 'Developer Sandbox & Webhook Simulator',
    category: 'API & Developers',
    binance: 'Testnet domains requiring separate testnet API keys',
    okx: 'Demo trading API endpoints',
    coinbase: 'Coinbase Developer Platform sandbox',
    coindcx: 'No public sandbox',
    aliensExchange: 'Interactive In-Browser REST Sandbox + Webhook Event Simulator + Granular Scopes',
    aliensAdvantage: 'Test REST orders and listen to mock Webhook fill events without configuring backend servers',
  },
  {
    featureName: 'Deposit & Withdrawal Tracking',
    category: 'Wallet & Chains',
    binance: 'TxID explorer link, network confirmation count',
    okx: 'Block confirmation stages and multi-network routing',
    coinbase: 'Standard crypto send/receive with network fee preview',
    coindcx: 'Whitelisted address withdrawals (regulatory queue)',
    aliensExchange: 'Multi-Chain Simulated Confirmation Pipeline with address whitelist & time-locked delays',
    aliensAdvantage: 'Displays stage-by-stage block confirmations and protects against unauthorized addresses',
  },
  {
    featureName: 'Account Recovery & Guardian Protection',
    category: 'Security',
    binance: 'Identity verification & facial recognition recovery',
    okx: 'Security questions & email/phone binding',
    coinbase: 'ID verification + manual support review',
    coindcx: 'Manual KYC ticket support',
    aliensExchange: 'Multi-Guardian Social Recovery Protocol + Emergency Instant Account Lockdown Switch',
    aliensAdvantage: 'Instantly freeze all trading and withdrawals with 1 click during compromised session detection',
  },
];

/**
 * The 30+ Evaluated & Implemented Next-Generation Features in Aliens Exchange
 */
export const ALIENS_30_PLUS_FEATURES = [
  { id: 1, title: 'Smart Order Preview & Slippage Estimator', category: 'Trading Desk', status: 'Implemented', description: 'Simulates orderbook depth consumption before order submission to predict real fill price.' },
  { id: 2, title: 'Integrated Paper Trading Engine', category: 'Trading Desk', status: 'Implemented', description: 'Zero-risk virtual trading sandbox with $50,000 demo capital to test live execution strategies.' },
  { id: 3, title: 'Historical Strategy Backtester', category: 'Trading Desk', status: 'Implemented', description: 'Backtest EMA crossover, RSI mean reversion, and breakout strategies with win rate & Sharpe ratio.' },
  { id: 4, title: 'Double-Entry Cryptographic Ledger', category: 'Financial Core', status: 'Implemented', description: 'Strict double-entry bookkeeping with sequential SHA-256 audit hashes and debit-credit parity.' },
  { id: 5, title: 'AI Market Analysis & Technical Rationale', category: 'AI Intelligence', status: 'Implemented', description: 'Server-side Gemini 3.8 Flash technical indicator insights, support/resistance, and market sentiment.' },
  { id: 6, title: 'Trading Journal & Behavioral Mistake Tagger', category: 'Analytics', status: 'Implemented', description: 'Log trade entries/exits, tag emotional states (FOMO, Revenge, Hesitant), and get AI trade feedback.' },
  { id: 7, title: 'Portfolio Value-at-Risk (VaR 95%)', category: 'Risk Management', status: 'Implemented', description: 'Parametric 1-day 95% confidence Value-at-Risk metrics for total asset holdings.' },
  { id: 8, title: 'Herfindahl Asset Concentration Index (HHI)', category: 'Risk Management', status: 'Implemented', description: 'Identifies over-concentration risks in single volatile tokens versus balanced distribution.' },
  { id: 9, title: 'Stress-Testing Crash Simulator', category: 'Risk Management', status: 'Implemented', description: 'Simulates immediate portfolio impact under -10%, -25%, and -50% flash crash market scenarios.' },
  { id: 10, title: 'Cryptographic Proof of Reserves Merkle Tree', category: 'Security & Trust', status: 'Implemented', description: 'Interactive Merkle root generator with individual user balance inclusion verification.' },
  { id: 11, title: 'Automated Spot Grid Trading Bot', category: 'Bot Automation', status: 'Implemented', description: 'Evenly spaced limit buy and sell grids across custom price channels with automated profit harvest.' },
  { id: 12, title: 'Dollar-Cost Averaging (DCA) Bot', category: 'Bot Automation', status: 'Implemented', description: 'Automated interval purchasing algorithm smoothing market volatility over extended timeframes.' },
  { id: 13, title: 'Cross-Exchange Arbitrage Prober', category: 'Bot Automation', status: 'Implemented', description: 'Monitors real-time price spread anomalies across external liquidity venues for arbitrage triggers.' },
  { id: 14, title: 'Interactive Developer REST Sandbox', category: 'Developer Tools', status: 'Implemented', description: 'In-app REST endpoint tester with curl generator and live JSON response inspector.' },
  { id: 15, title: 'Webhook Dispatcher & Event Logger', category: 'Developer Tools', status: 'Implemented', description: 'Simulate order fill and deposit webhook notifications to custom developer endpoints.' },
  { id: 16, title: 'Granular API Key Permission Scopes', category: 'Developer Tools', status: 'Implemented', description: 'Scope API keys with Read-Only, Spot-Trade, or Withdrawal permissions with IP whitelisting.' },
  { id: 17, title: 'Emergency One-Click Account Lockdown', category: 'Account Security', status: 'Implemented', description: 'Instantly terminate all active sessions, cancel all open orders, and freeze withdrawals.' },
  { id: 18, title: 'Active Session & Device Inspector', category: 'Account Security', status: 'Implemented', description: 'Inspect all active browser sessions, IP addresses, locations, and selectively revoke access.' },
  { id: 19, title: 'Anti-Phishing Verification Code', category: 'Account Security', status: 'Implemented', description: 'Custom secret code displayed in all authentic exchange emails and notifications.' },
  { id: 20, title: 'Withdrawal Address Whitelisting & Delay', category: 'Account Security', status: 'Implemented', description: 'Mandatory 24-hour lock on newly added external withdrawal addresses.' },
  { id: 21, title: 'Multi-Chain Deposit & Confirmation Tracker', category: 'Wallet & Chains', status: 'Implemented', description: 'Step-by-step block confirmation pipeline (Mempool, 12 blocks, Finalized) with explorer links.' },
  { id: 22, title: 'Transparent Maker / Taker Fee Matrix', category: 'Transparency', status: 'Implemented', description: 'Tiered VIP fee schedule based on 30-day trading volume and $ALIEN native token holding discounts.' },
  { id: 23, title: 'Live System Health & Exchange Latency HUD', category: 'Transparency', status: 'Implemented', description: 'Real-time monitoring of matching engine latency, WebSocket status, and order gateway uptime.' },
  { id: 24, title: 'High-Performance Native Canvas Candlestick Chart', category: 'Charting & UI', status: 'Implemented', description: 'Smooth 60fps canvas chart rendering with EMA 20, EMA 50, Volume histogram, and crosshairs.' },
  { id: 25, title: 'Orderbook Depth Visualizer & Grouping', category: 'Trading Desk', status: 'Implemented', description: 'Horizontal cumulative depth bars with customizable price precision grouping (0.01, 0.1, 1).' },
  { id: 26, title: 'Trailing Stop & Dynamic Offset Execution', category: 'Trading Desk', status: 'Implemented', description: 'Dynamic stop-loss order that trails market price by a designated percentage.' },
  { id: 27, title: 'Take Profit / Stop Loss (Bracket Orders)', category: 'Trading Desk', status: 'Implemented', description: 'Pre-attach profit targets and maximum risk stops on primary entry orders.' },
  { id: 28, title: 'Real-Time Trade Tape Stream', category: 'Trading Desk', status: 'Implemented', description: 'Live streaming trade fills with buyer/seller dominance volume breakdown.' },
  { id: 29, title: 'Social Recovery Guardian Protocol', category: 'Security & Trust', status: 'Implemented', description: 'Decentralized key recovery through designated trusted guardian approval signatures.' },
  { id: 30, title: 'Competitor Research & Architecture Hub', category: 'Research & UX', status: 'Implemented', description: 'Interactive deep-dive comparison and API documentation reference for Binance, OKX, Coinbase, CoinDCX.' },
  { id: 31, title: 'Instant Cold vs Hot Vault Solvency Visualizer', category: 'Security & Trust', status: 'Implemented', description: 'Transparent balance comparison proving 100%+ collateralization over all user deposits.' },
  { id: 32, title: 'Keyboard Shortcut Desk Navigation', category: 'UI & Ergonomics', status: 'Implemented', description: 'Pro trader hotkeys for quick pair switching, buy/sell toggling, and emergency order cancellation.' },
];
