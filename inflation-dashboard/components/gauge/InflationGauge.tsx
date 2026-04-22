'use client';
import { useEffect, useRef } from 'react';
import { REGIME_META } from '@/types';
import type { InflationRegime } from '@/types';

const BAND_COLORS = [
  { from: 0,   to: 20,  color: '#3b82f6' },  // 蓝: 通缩
  { from: 20,  to: 35,  color: '#10b981' },  // 绿: 回落
  { from: 35,  to: 55,  color: '#eab308' },  // 黄: 温和
  { from: 55,  to: 70,  color: '#f97316' },  // 橙: 粘性
  { from: 70,  to: 100, color: '#ef4444' },  // 红: 再加速
];

export function InflationGauge({ score, regime }: { score: number; regime: InflationRegime }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = 240, H = 240;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2 + 10, radius = 90;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;

    // Bands
    BAND_COLORS.forEach(b => {
      const a1 = startAngle + (b.from / 100) * totalAngle;
      const a2 = startAngle + (b.to / 100) * totalAngle;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, a1, a2);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 16;
      ctx.lineCap = 'butt';
      ctx.globalAlpha = 0.35;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Needle
    const clamped = Math.max(0, Math.min(100, score));
    const angle = startAngle + (clamped / 100) * totalAngle;
    const needleLen = radius - 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * needleLen, cy + Math.sin(angle) * needleLen);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Hub
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0e1a';
    ctx.fill();
  }, [score]);

  const meta = REGIME_META[regime];

  return (
    <div className="relative flex flex-col items-center">
      <canvas ref={canvasRef} />
      <div className="absolute top-[88px] text-center">
        <div className="text-4xl font-mono font-bold text-[#fbbf24] leading-none">{score}</div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">/100</div>
      </div>
      <div className={`mt-1 px-2 py-0.5 rounded border text-xs font-medium ${meta.bg} ${meta.color}`}>
        {meta.emoji} {meta.label}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[9px] text-slate-500">
        <span>🔵 &lt;20</span>
        <span>🟢 20-35</span>
        <span>🟡 35-55</span>
        <span>🟠 55-70</span>
        <span>🔴 &gt;70</span>
      </div>
    </div>
  );
}
