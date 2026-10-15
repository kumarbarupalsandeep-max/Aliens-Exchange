# Aliens Exchange

Aliens Exchange is a **demo trading-terminal project** built with React, Vite, TypeScript, and Express.

> **Safety notice:** This repository is not a production cryptocurrency exchange. Market prices, order books, trade tape, portfolio values, bot statistics, and proof-of-reserves figures are demo/simulated data. Live trading, deposits, and withdrawals are disabled in the server. Do not use this project to custody funds or connect real exchange credentials.

## Requirements

- Node.js 22.12 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Quality checks

```bash
npm run lint
npm test
npm run build
# or run all checks in sequence
npm run check
```

## Deployment notes

The application currently starts an Express server from `server.ts` and serves the Vite build from `dist/` in production. It is **not a static-only Vite deployment**. Before deploying to Vercel, configure a supported serverless Express entry point and verify every API route, or deploy the combined Express process to a Node.js host that supports long-running servers. Do not configure Vercel to serve only `dist/` if you expect `/api/*` routes to work.

Required deployment checks:
1. Set Node.js to 22.12+.
2. Build with `npm run build`.
3. Start the Node server with `npm start` on the platform-provided `PORT`.
4. Check `/api/markets`, `/api/orderbook?symbol=BTC%2FUSDT`, and `/api/paper-trading`.
5. Confirm `POST /api/deposit` and `POST /api/withdraw` return HTTP 403, and that non-paper order submission is rejected.
6. Configure `GEMINI_API_KEY` only as a server-side secret if you want the optional AI analysis integration. Never commit secrets to Git.

## Current limitations

- Server state is in memory and resets on restart.
- Market data and candlesticks are simulated, not an exchange feed.
- Bots are not connected to an execution engine.
- Backtest output is illustrative, not historical performance.
- The proof-of-reserves endpoint returns sample figures, not an audit or attestation.
- Authentication, authorization, durable storage, real exchange integration, chain verification, monitoring, and independent security review are required before any production financial use.
