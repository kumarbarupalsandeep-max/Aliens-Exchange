/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * High-Performance Interactive HTML5 Canvas Candlestick Chart
 * Renders OHLCV bars, EMA(20), EMA(50), volume histogram, and crosshairs
 */

import React, { useEffect, useRef, useState } from 'react';
import { CandleStick } from '../types.ts';

interface CandleChartProps {
  symbol: string;
  klines: CandleStick[];
  timeframe: string;
  setTimeframe: (tf: string) => void;
  currentPrice: number;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  symbol,
  klines,
  timeframe,
  setTimeframe,
  currentPrice,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<CandleStick | null>(null);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D'];

  // Calculate Exponential Moving Average
  function calculateEMA(data: CandleStick[], period: number): (number | null)[] {
    const k = 2 / (period + 1);
    const emaArray: (number | null)[] = [];
    let prevEMA: number | null = null;

    for (let i = 0; i < data.length; i++) {
      const close = data[i].close;
      if (i < period - 1) {
        emaArray.push(null);
      } else if (i === period - 1) {
        let sum = 0;
        for (let j = 0; j < period; j++) sum += data[j].close;
        prevEMA = sum / period;
        emaArray.push(prevEMA);
      } else {
        prevEMA = close * k + prevEMA! * (1 - k);
        emaArray.push(prevEMA);
      }
    }
    return emaArray;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || klines.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Padding settings
    const paddingRight = 65; // Price scale width
    const paddingBottom = 26; // Time scale height
    const paddingTop = 20;
    const chartWidth = width - paddingRight;
    const chartHeight = height - paddingBottom - paddingTop;
    const volumeHeight = chartHeight * 0.22;
    const priceChartHeight = chartHeight - volumeHeight;

    // Clear canvas
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, width, height);

    // Find min/max price & volume
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    klines.forEach((k) => {
      if (k.low < minPrice) minPrice = k.low;
      if (k.high > maxPrice) maxPrice = k.high;
      if (k.volume > maxVolume) maxVolume = k.volume;
    });

    const priceBuffer = (maxPrice - minPrice) * 0.05 || 10;
    minPrice -= priceBuffer;
    maxPrice += priceBuffer;
    const priceRange = maxPrice - minPrice || 1;

    // Draw subtle grid lines
    ctx.strokeStyle = '#121824';
    ctx.lineWidth = 1;

    // Horizontal price grid lines (5 levels)
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const y = paddingTop + (priceChartHeight / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      const priceVal = maxPrice - (priceRange / gridSteps) * i;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(
        `$${priceVal.toFixed(priceVal > 100 ? 2 : 4)}`,
        chartWidth + 6,
        y + 3
      );
    }

    // Candle widths and spacing
    const candleCount = klines.length;
    const barWidth = Math.max(3, (chartWidth / candleCount) * 0.75);
    const step = chartWidth / candleCount;

    const ema20 = calculateEMA(klines, 20);
    const ema50 = calculateEMA(klines, 50);

    // Draw Volume Bars
    klines.forEach((k, idx) => {
      const x = idx * step + step / 2;
      const isUp = k.close >= k.open;
      const volBarH = (k.volume / (maxVolume || 1)) * (volumeHeight - 5);
      const volY = paddingTop + priceChartHeight + (volumeHeight - volBarH);

      ctx.fillStyle = isUp ? 'rgba(0, 245, 155, 0.2)' : 'rgba(244, 63, 94, 0.2)';
      ctx.fillRect(x - barWidth / 2, volY, barWidth, volBarH);
    });

    // Draw Candlesticks
    klines.forEach((k, idx) => {
      const x = idx * step + step / 2;
      const isUp = k.close >= k.open;

      const openY = paddingTop + (1 - (k.open - minPrice) / priceRange) * priceChartHeight;
      const closeY = paddingTop + (1 - (k.close - minPrice) / priceRange) * priceChartHeight;
      const highY = paddingTop + (1 - (k.high - minPrice) / priceRange) * priceChartHeight;
      const lowY = paddingTop + (1 - (k.low - minPrice) / priceRange) * priceChartHeight;

      const candleColor = isUp ? '#00f59b' : '#f43f5e';
      ctx.strokeStyle = candleColor;
      ctx.fillStyle = candleColor;

      // Draw wick
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw candle body
      const topY = Math.min(openY, closeY);
      const bodyH = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - barWidth / 2, topY, barWidth, bodyH);
    });

    // Draw EMA 20
    if (showEMA20) {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      ema20.forEach((val, idx) => {
        if (val === null) return;
        const x = idx * step + step / 2;
        const y = paddingTop + (1 - (val - minPrice) / priceRange) * priceChartHeight;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw EMA 50
    if (showEMA50) {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      ema50.forEach((val, idx) => {
        if (val === null) return;
        const x = idx * step + step / 2;
        const y = paddingTop + (1 - (val - minPrice) / priceRange) * priceChartHeight;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw current market price line
    const curY = paddingTop + (1 - (currentPrice - minPrice) / priceRange) * priceChartHeight;
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = '#00f59b';
    ctx.beginPath();
    ctx.moveTo(0, curY);
    ctx.lineTo(chartWidth, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price tag badge
    ctx.fillStyle = '#00f59b';
    ctx.fillRect(chartWidth + 2, curY - 9, paddingRight - 4, 18);
    ctx.fillStyle = '#080a0f';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.fillText(
      `$${currentPrice.toFixed(currentPrice > 100 ? 2 : 4)}`,
      chartWidth + 5,
      curY + 3
    );

    // Bottom time labels
    ctx.fillStyle = '#64748b';
    ctx.font = '9px JetBrains Mono';
    ctx.textAlign = 'center';
    const timeStep = Math.floor(candleCount / 5);
    for (let i = 0; i < candleCount; i += timeStep) {
      const x = i * step + step / 2;
      const date = new Date(klines[i].time);
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      ctx.fillText(timeStr, x, height - 8);
    }
  }, [klines, currentPrice, showEMA20, showEMA50]);

  return (
    <div className="flex flex-col h-full bg-[#080a0f] relative select-none">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#18202f] text-xs">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                timeframe === tf
                  ? 'bg-[#182335] text-[#00f59b] font-semibold border border-[#00f59b]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicators and Stats */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <label className="flex items-center gap-1 cursor-pointer text-[#00e5ff]">
            <input
              type="checkbox"
              checked={showEMA20}
              onChange={(e) => setShowEMA20(e.target.checked)}
              className="accent-[#00e5ff] rounded"
            />
            <span>EMA 20</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer text-amber-400">
            <input
              type="checkbox"
              checked={showEMA50}
              onChange={(e) => setShowEMA50(e.target.checked)}
              className="accent-amber-400 rounded"
            />
            <span>EMA 50</span>
          </label>

          {hoveredCandle && (
            <div className="hidden lg:flex items-center gap-2 text-slate-300 pl-2 border-l border-[#1f293d]">
              <span>O: <span className="text-white">${hoveredCandle.open}</span></span>
              <span>H: <span className="text-white">${hoveredCandle.high}</span></span>
              <span>L: <span className="text-white">${hoveredCandle.low}</span></span>
              <span>C: <span className="text-white">${hoveredCandle.close}</span></span>
              <span>Vol: <span className="text-white">{hoveredCandle.volume.toFixed(1)}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Canvas container */}
      <div ref={containerRef} className="flex-1 w-full min-h-[360px] relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
      </div>
    </div>
  );
};
