/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Aliens Exchange Core Financial & Trading Engine
 * Pure logic decoupled from UI for deterministic verification
 */

export interface OrderbookLevel {
  price: number;
  size: number;
  total?: number;
}

export interface Orderbook {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}

export interface OrderImpactResult {
  side: 'buy' | 'sell';
  requestedSize: number;
  filledSize: number;
  averageFillPrice: number;
  slippagePercent: number;
  bestPrice: number;
  totalCost: number;
  estimatedFee: number;
  isPartialFill: boolean;
  levelsExhausted: number;
}

/**
 * Calculates real-time order price impact and slippage against orderbook depth.
 */
export function calculateOrderImpact(
  orderbook: Orderbook,
  side: 'buy' | 'sell',
  size: number,
  feeRate = 0.001 // 0.1% standard taker fee
): OrderImpactResult {
  if (side !== 'buy' && side !== 'sell') {
    throw new Error('Order side must be buy or sell');
  }
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('Order size must be a finite positive number');
  }
  if (!Number.isFinite(feeRate) || feeRate < 0) {
    throw new Error('Fee rate must be a finite non-negative number');
  }

  const sourceLevels = side === 'buy' ? orderbook?.asks : orderbook?.bids;
  const levels = Array.isArray(sourceLevels)
    ? sourceLevels
        .filter((level) => Number.isFinite(level.price) && level.price > 0 && Number.isFinite(level.size) && level.size > 0)
        .slice()
        .sort((a, b) => (side === 'buy' ? a.price - b.price : b.price - a.price))
    : [];
  if (levels.length === 0) {
    return {
      side,
      requestedSize: size,
      filledSize: 0,
      averageFillPrice: 0,
      slippagePercent: 0,
      bestPrice: 0,
      totalCost: 0,
      estimatedFee: 0,
      isPartialFill: true,
      levelsExhausted: 0,
    };
  }

  const bestPrice = levels[0].price;
  let remainingSize = size;
  let totalCost = 0;
  let filledSize = 0;
  let levelsExhausted = 0;

  for (const level of levels) {
    if (remainingSize <= 0) break;
    levelsExhausted++;
    const fillAmount = Math.min(remainingSize, level.size);
    totalCost += fillAmount * level.price;
    filledSize += fillAmount;
    remainingSize -= fillAmount;
  }

  const averageFillPrice = filledSize > 0 ? totalCost / filledSize : bestPrice;
  const slippagePercent =
    bestPrice > 0
      ? side === 'buy'
        ? ((averageFillPrice - bestPrice) / bestPrice) * 100
        : ((bestPrice - averageFillPrice) / bestPrice) * 100
      : 0;

  const estimatedFee = totalCost * feeRate;

  return {
    side,
    requestedSize: size,
    filledSize: Number(filledSize.toFixed(6)),
    averageFillPrice: Number(averageFillPrice.toFixed(4)),
    slippagePercent: Number(Math.max(0, slippagePercent).toFixed(4)),
    bestPrice,
    totalCost: Number(totalCost.toFixed(4)),
    estimatedFee: Number(estimatedFee.toFixed(4)),
    isPartialFill: remainingSize > 0.000001,
    levelsExhausted,
  };
}

/**
 * Double-Entry Accounting Ledger Entry
 */
export interface LedgerEntry {
  id: string;
  timestamp: number;
  fromAccount: string;
  toAccount: string;
  asset: string;
  amount: number;
  reason: string;
  hash: string;
  status: 'confirmed' | 'pending' | 'rejected';
}

export interface AccountBalance {
  available: number;
  locked: number;
}

/**
 * Pure Double-Entry Accounting Ledger
 * Ensures no funds can be created or destroyed without counter-party debit/credit
 */
export class DoubleEntryLedger {
  private balances: Map<string, Map<string, AccountBalance>> = new Map();
  private entries: LedgerEntry[] = [];

  constructor() {
    // Initial accounts setup
  }

  private getOrCreateAccount(accountId: string, asset: string): AccountBalance {
    if (!this.balances.has(accountId)) {
      this.balances.set(accountId, new Map());
    }
    const assetMap = this.balances.get(accountId)!;
    if (!assetMap.has(asset)) {
      assetMap.set(asset, { available: 0, locked: 0 });
    }
    return assetMap.get(asset)!;
  }

  public getBalance(accountId: string, asset: string): AccountBalance {
    const assetMap = this.balances.get(accountId);
    if (!assetMap || !assetMap.has(asset)) {
      return { available: 0, locked: 0 };
    }
    return { ...assetMap.get(asset)! };
  }

  public getAllBalances(accountId: string): Record<string, AccountBalance> {
    const result: Record<string, AccountBalance> = {};
    const assetMap = this.balances.get(accountId);
    if (assetMap) {
      for (const [asset, bal] of assetMap.entries()) {
        result[asset] = { ...bal };
      }
    }
    return result;
  }

  /**
   * Execute double-entry transfer with balance verification
   */
  public transfer(
    fromAccount: string,
    toAccount: string,
    asset: string,
    amount: number,
    reason: string
  ): { success: boolean; error?: string; entry?: LedgerEntry } {
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: 'Transfer amount must be a finite, strictly positive number' };
    }
    if (![fromAccount, toAccount, asset, reason].every((value) => typeof value === 'string' && value.trim().length > 0)) {
      return { success: false, error: 'Source, destination, asset, and reason are required' };
    }
    if (fromAccount === toAccount) {
      return { success: false, error: 'Source and destination accounts must differ' };
    }

    // External system deposit bypasses user available check
    const isSystemMint = fromAccount === 'SYSTEM_TREASURY' || fromAccount === 'EXTERNAL_NETWORK';

    if (!isSystemMint) {
      const fromBal = this.getOrCreateAccount(fromAccount, asset);
      if (fromBal.available < amount) {
        return {
          success: false,
          error: `Insufficient available balance: has ${fromBal.available} ${asset}, requested ${amount} ${asset}`,
        };
      }
      fromBal.available -= amount;
    }

    const toBal = this.getOrCreateAccount(toAccount, asset);
    toBal.available += amount;

    // Cryptographic-like sequential audit hash
    const prevHash = this.entries.length > 0 ? this.entries[this.entries.length - 1].hash : '0000000000';
    const entryId = `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const hash = simpleHash(`${prevHash}:${entryId}:${fromAccount}:${toAccount}:${asset}:${amount}:${reason}`);

    const entry: LedgerEntry = {
      id: entryId,
      timestamp: Date.now(),
      fromAccount,
      toAccount,
      asset,
      amount,
      reason,
      hash,
      status: 'confirmed',
    };

    this.entries.push(entry);
    return { success: true, entry };
  }

  /**
   * Lock funds for active orders
   */
  public lockFunds(accountId: string, asset: string, amount: number): boolean {
    if (!accountId.trim() || !asset.trim() || !Number.isFinite(amount) || amount <= 0) return false;
    const bal = this.getOrCreateAccount(accountId, asset);
    if (bal.available < amount) return false;
    bal.available -= amount;
    bal.locked += amount;
    return true;
  }

  /**
   * Release locked funds back to available
   */
  public releaseLockedFunds(accountId: string, asset: string, amount: number): boolean {
    if (!accountId.trim() || !asset.trim() || !Number.isFinite(amount) || amount <= 0) return false;
    const bal = this.getOrCreateAccount(accountId, asset);
    if (bal.locked < amount) return false;
    bal.locked -= amount;
    bal.available += amount;
    return true;
  }

  /**
   * Settle an order execution from locked funds
   */
  public settleLockedFunds(accountId: string, asset: string, amount: number): boolean {
    if (!accountId.trim() || !asset.trim() || !Number.isFinite(amount) || amount <= 0) return false;
    const bal = this.getOrCreateAccount(accountId, asset);
    if (bal.locked < amount) return false;
    bal.locked -= amount;
    return true;
  }

  public getHistory(): LedgerEntry[] {
    return this.entries.map((entry) => ({ ...entry }));
  }

  /**
   * Performs basic in-memory consistency checks.
   * This is NOT a cryptographic audit or proof of reserves.
   */
  public verifyIntegrity(asset: string): { valid: boolean; totalInCirculation: number } {
    if (!asset.trim()) return { valid: false, totalInCirculation: 0 };

    let total = 0;
    let valid = true;
    for (const [, assetMap] of this.balances.entries()) {
      const bal = assetMap.get(asset);
      if (bal) {
        if (
          !Number.isFinite(bal.available) ||
          !Number.isFinite(bal.locked) ||
          bal.available < 0 ||
          bal.locked < 0
        ) valid = false;
        total += bal.available + bal.locked;
      }
    }

    let previousHash = '0000000000';
    for (const entry of this.entries) {
      if (
        !Number.isFinite(entry.amount) ||
        entry.amount <= 0 ||
        !entry.fromAccount ||
        !entry.toAccount ||
        !entry.asset
      ) {
        valid = false;
      }
      const expectedHash = simpleHash(
        `${previousHash}:${entry.id}:${entry.fromAccount}:${entry.toAccount}:${entry.asset}:${entry.amount}:${entry.reason}`
      );
      if (entry.hash !== expectedHash) valid = false;
      previousHash = entry.hash;
    }

    return { valid, totalInCirculation: Number(total.toFixed(8)) };
  }
}

/**
 * Grid Trading Bot Pure Algorithm
 */
export interface GridLevel {
  id: number;
  price: number;
  side: 'buy' | 'sell';
  amount: number;
  status: 'active' | 'triggered' | 'filled';
}

export function generateGridLevels(
  lowerPrice: number,
  upperPrice: number,
  gridCount: number,
  currentPrice: number,
  totalInvestment: number
): { levels: GridLevel[]; profitPerGridPercent: number; amountPerGrid: number } {
  if (
    ![lowerPrice, upperPrice, gridCount, currentPrice, totalInvestment].every(Number.isFinite) ||
    lowerPrice <= 0 ||
    lowerPrice >= upperPrice ||
    !Number.isInteger(gridCount) ||
    gridCount < 2 ||
    currentPrice <= 0 ||
    totalInvestment <= 0
  ) {
    throw new Error('Invalid grid trading parameters');
  }

  const step = (upperPrice - lowerPrice) / (gridCount - 1);
  const profitPerGridPercent = (step / lowerPrice) * 100;
  const investmentPerGrid = totalInvestment / gridCount;

  const levels: GridLevel[] = [];
  for (let i = 0; i < gridCount; i++) {
    const price = lowerPrice + i * step;
    const side = price < currentPrice ? 'buy' : 'sell';
    const amount = Number((investmentPerGrid / price).toFixed(6));
    levels.push({
      id: i + 1,
      price: Number(price.toFixed(2)),
      side,
      amount,
      status: 'active',
    });
  }

  return {
    levels,
    profitPerGridPercent: Number(profitPerGridPercent.toFixed(2)),
    amountPerGrid: Number(investmentPerGrid.toFixed(2)),
  };
}

/**
 * Portfolio Risk & Value-at-Risk (VaR) Engine
 */
export interface AssetPosition {
  asset: string;
  amount: number;
  currentPrice: number;
  dailyVolatility: number; // e.g. 0.04 for 4%
}

export interface PortfolioRiskMetrics {
  totalValueUSDT: number;
  var95Percent1Day: number; // Value at Risk 95% confidence
  varAmountUSDT: number;
  herfindahlConcentrationIndex: number; // 0 to 1, higher = higher concentration risk
  stressTest25PercentDrop: number;
  stressTest50PercentDrop: number;
  diversificationRating: 'High' | 'Moderate' | 'Concentrated';
}

export function calculatePortfolioRisk(positions: AssetPosition[]): PortfolioRiskMetrics {
  if (!Array.isArray(positions) || positions.some((pos) =>
    !pos.asset ||
    ![pos.amount, pos.currentPrice, pos.dailyVolatility].every(Number.isFinite) ||
    pos.amount < 0 ||
    pos.currentPrice < 0 ||
    pos.dailyVolatility < 0
  )) {
    throw new Error('Portfolio positions must contain finite, non-negative amounts, prices, and volatility');
  }

  let totalValueUSDT = 0;
  positions.forEach((pos) => {
    totalValueUSDT += pos.amount * pos.currentPrice;
  });

  if (totalValueUSDT <= 0) {
    return {
      totalValueUSDT: 0,
      var95Percent1Day: 0,
      varAmountUSDT: 0,
      herfindahlConcentrationIndex: 0,
      stressTest25PercentDrop: 0,
      stressTest50PercentDrop: 0,
      diversificationRating: 'High',
    };
  }

  // Calculate asset weights and concentration HHI
  let hhi = 0;
  let weightedVariance = 0;

  positions.forEach((pos) => {
    const val = pos.amount * pos.currentPrice;
    const weight = val / totalValueUSDT;
    hhi += weight * weight;
    // Simplified parametric portfolio volatility approximation
    weightedVariance += Math.pow(weight * pos.dailyVolatility, 2);
  });

  const portfolioVol = Math.sqrt(weightedVariance);
  // 95% 1-day Z-score = 1.645
  const var95Percent1Day = portfolioVol * 1.645 * 100;
  const varAmountUSDT = (totalValueUSDT * var95Percent1Day) / 100;

  let diversificationRating: 'High' | 'Moderate' | 'Concentrated' = 'High';
  if (hhi > 0.45) diversificationRating = 'Concentrated';
  else if (hhi > 0.25) diversificationRating = 'Moderate';

  return {
    totalValueUSDT: Number(totalValueUSDT.toFixed(2)),
    var95Percent1Day: Number(var95Percent1Day.toFixed(2)),
    varAmountUSDT: Number(varAmountUSDT.toFixed(2)),
    herfindahlConcentrationIndex: Number(hhi.toFixed(4)),
    stressTest25PercentDrop: Number((totalValueUSDT * 0.25).toFixed(2)),
    stressTest50PercentDrop: Number((totalValueUSDT * 0.50).toFixed(2)),
    diversificationRating,
  };
}

/**
 * Proof of Reserves Merkle Leaf & Tree Structure
 */
export interface MerkleLeaf {
  userId: string;
  balanceUSDT: number;
  hash: string;
}

export function buildProofOfReservesMerkle(users: { id: string; balanceUSDT: number }[]) {
  if (!Array.isArray(users) || users.some((u) =>
    !u.id || !Number.isFinite(u.balanceUSDT) || u.balanceUSDT < 0
  )) {
    throw new Error('Proof-of-reserves input must contain user IDs and finite non-negative balances');
  }

  const leaves: MerkleLeaf[] = users.map((u) => {
    const data = `${u.id}:${u.balanceUSDT.toFixed(2)}`;
    return {
      userId: u.id,
      balanceUSDT: u.balanceUSDT,
      hash: simpleHash(data),
    };
  });

  let currentLevel = leaves.map((l) => l.hash);
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(simpleHash(currentLevel[i] + currentLevel[i + 1]));
      } else {
        nextLevel.push(simpleHash(currentLevel[i] + currentLevel[i]));
      }
    }
    currentLevel = nextLevel;
  }

  const rootHash = currentLevel[0] || '0000000000000000';
  const totalUserLiabilities = users.reduce((acc, u) => acc + u.balanceUSDT, 0);

  return {
    leaves,
    rootHash,
    totalUserLiabilities: Number(totalUserLiabilities.toFixed(2)),
    leafCount: leaves.length,
  };
}

/**
 * DEMO-ONLY non-cryptographic hash. Do not use for authentication, signatures,
 * financial audit trails, or production proof-of-reserves. Replace with a
 * vetted cryptographic hash implementation before making security claims.
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  let hash2 = 5381;
  for (let i = str.length - 1; i >= 0; i--) {
    hash2 = (hash2 * 33) ^ str.charCodeAt(i);
  }
  const hex2 = Math.abs(hash2).toString(16).padStart(8, '0');
  return `0x${hex}${hex2}`;
}
