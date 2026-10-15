/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Ultra Mode Fast-Feedback Unit Tests
 * Testing Pure Financial Engine, Ledger, and Mathematical Algorithms
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderImpact,
  DoubleEntryLedger,
  generateGridLevels,
  calculatePortfolioRisk,
  buildProofOfReservesMerkle,
  type Orderbook,
} from './engine.ts';

test('DoubleEntryLedger deposits, transfers, and overdraw prevention', () => {
  const ledger = new DoubleEntryLedger();

  // 1. Initial Deposit via EXTERNAL_NETWORK
  const depRes = ledger.transfer('EXTERNAL_NETWORK', 'user_1', 'USDT', 10000, 'Blockchain deposit confirmation');
  assert.equal(depRes.success, true);
  assert.ok(depRes.entry?.hash.startsWith('0x'));

  const userBal = ledger.getBalance('user_1', 'USDT');
  assert.equal(userBal.available, 10000);
  assert.equal(userBal.locked, 0);

  // 2. Overdraw rejection test
  const overdrawRes = ledger.transfer('user_1', 'user_2', 'USDT', 15000, 'Attempted invalid overdraw');
  assert.equal(overdrawRes.success, false);
  assert.match(overdrawRes.error!, /Insufficient available balance/);

  // 3. Valid user transfer
  const validTransfer = ledger.transfer('user_1', 'user_2', 'USDT', 2500, 'Spot trade settlement');
  assert.equal(validTransfer.success, true);
  assert.equal(ledger.getBalance('user_1', 'USDT').available, 7500);
  assert.equal(ledger.getBalance('user_2', 'USDT').available, 2500);

  // 4. Lock funds for open order and release
  const locked = ledger.lockFunds('user_1', 'USDT', 3000);
  assert.equal(locked, true);
  assert.equal(ledger.getBalance('user_1', 'USDT').available, 4500);
  assert.equal(ledger.getBalance('user_1', 'USDT').locked, 3000);

  const released = ledger.releaseLockedFunds('user_1', 'USDT', 1000);
  assert.equal(released, true);
  assert.equal(ledger.getBalance('user_1', 'USDT').available, 5500);
  assert.equal(ledger.getBalance('user_1', 'USDT').locked, 2000);

  // 5. Audit history integrity check
  const history = ledger.getHistory();
  assert.equal(history.length, 2);
  assert.equal(history[0].asset, 'USDT');
});

test('calculateOrderImpact computes weighted average fill price and slippage correctly', () => {
  const mockOrderbook: Orderbook = {
    bids: [
      { price: 65000, size: 1.0 },
      { price: 64900, size: 2.0 },
      { price: 64800, size: 3.0 },
    ],
    asks: [
      { price: 65100, size: 1.0 },
      { price: 65200, size: 2.0 },
      { price: 65300, size: 3.0 },
    ],
  };

  // Buy order of 0.5 BTC fills entirely at top of book ($65,100)
  const smallBuy = calculateOrderImpact(mockOrderbook, 'buy', 0.5);
  assert.equal(smallBuy.filledSize, 0.5);
  assert.equal(smallBuy.averageFillPrice, 65100);
  assert.equal(smallBuy.slippagePercent, 0);
  assert.equal(smallBuy.isPartialFill, false);
  assert.equal(smallBuy.levelsExhausted, 1);

  // Buy order of 2.5 BTC walks the book: 1.0 @ 65100 + 1.5 @ 65200 = 65100 + 97800 = 162900 / 2.5 = 65160
  const largeBuy = calculateOrderImpact(mockOrderbook, 'buy', 2.5);
  assert.equal(largeBuy.filledSize, 2.5);
  assert.equal(largeBuy.averageFillPrice, 65160);
  assert.ok(largeBuy.slippagePercent > 0.09 && largeBuy.slippagePercent < 0.10);
  assert.equal(largeBuy.levelsExhausted, 2);

  // Sell order of 1.5 BTC: 1.0 @ 65000 + 0.5 @ 64900 = 65000 + 32450 = 97450 / 1.5 = 64966.6667
  const sellImpact = calculateOrderImpact(mockOrderbook, 'sell', 1.5);
  assert.equal(sellImpact.filledSize, 1.5);
  assert.equal(Math.round(sellImpact.averageFillPrice), 64967);
  assert.ok(sellImpact.slippagePercent > 0);
});

test('generateGridLevels computes uniform price intervals and profit per grid', () => {
  const result = generateGridLevels(60000, 70000, 6, 65000, 1000);
  assert.equal(result.levels.length, 6);
  assert.equal(result.levels[0].price, 60000);
  assert.equal(result.levels[5].price, 70000);
  assert.equal(result.levels[0].side, 'buy');
  assert.equal(result.levels[5].side, 'sell');
  assert.ok(result.profitPerGridPercent > 0);
  assert.equal(result.amountPerGrid, 166.67);
});

test('calculatePortfolioRisk computes correct VaR and concentration metrics', () => {
  const positions = [
    { asset: 'BTC', amount: 1, currentPrice: 65000, dailyVolatility: 0.035 },
    { asset: 'ETH', amount: 5, currentPrice: 3500, dailyVolatility: 0.045 },
    { asset: 'USDT', amount: 15000, currentPrice: 1, dailyVolatility: 0.001 },
  ];

  const risk = calculatePortfolioRisk(positions);
  const expectedTotal = 65000 + 17500 + 15000;
  assert.equal(risk.totalValueUSDT, expectedTotal);
  assert.ok(risk.var95Percent1Day > 0);
  assert.ok(risk.varAmountUSDT > 0);
  assert.ok(risk.herfindahlConcentrationIndex > 0 && risk.herfindahlConcentrationIndex <= 1);
  assert.equal(risk.stressTest50PercentDrop, expectedTotal * 0.5);
});

test('buildProofOfReservesMerkle generates root hash and calculates total liabilities', () => {
  const users = [
    { id: 'user_alpha', balanceUSDT: 5000 },
    { id: 'user_beta', balanceUSDT: 12000 },
    { id: 'user_gamma', balanceUSDT: 3500 },
    { id: 'user_delta', balanceUSDT: 9500 },
  ];

  const proof = buildProofOfReservesMerkle(users);
  assert.equal(proof.leafCount, 4);
  assert.equal(proof.totalUserLiabilities, 30000);
  assert.ok(proof.rootHash.startsWith('0x'));
  assert.equal(proof.leaves.length, 4);
});
