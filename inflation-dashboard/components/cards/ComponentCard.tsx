'use client';
import type { ComponentDetail } from '@/types';
import { SubBar } from '@/components/ui/SubBar';

const KEY_META: Record<string, { color: string; bg: string; border: string }> = {
  P: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  E: { color: 'text-sky-400',   bg: 'bg-sky-500/10',   border: 'border-sky-500/30' },
  D: { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  F: { color: 'text-rose-400',  bg: 'bg-rose-500/10',  border: 'border-rose-500/30' },
  N: { color: 'text-teal-400',  bg: 'bg-teal-500/10',  border: 'border-teal-500/30' },
};

export function ComponentCard({ data }: { data: ComponentDetail }) {
  const meta = KEY_META[data.key];
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-mono font-bold ${meta.color}`}>{data.key}</span>
            <span className="text-xs text-slate-400">{data.label_zh}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{data.label}</div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-mono font-semibold ${meta.color}`}>{data.score}</div>
          <div className="text-[10px] text-slate-500">权重 {(data.weight * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Headline */}
      <div className="text-[11px] text-slate-300 leading-relaxed mb-3 min-h-[2.2rem]">
        {data.headline}
      </div>

      {/* Sub-factor bars */}
      <div className="space-y-1.5 mb-3">
        {data.sub_factors.map(f => (
          <SubBar
            key={f.key}
            label={f.label}
            value={f.value}
            score={f.score}
            unit={f.unit}
            tone={f.tone}
          />
        ))}
      </div>

      {/* Annotation */}
      <div className={`text-[10px] p-2 rounded ${meta.bg} ${meta.border} border ${meta.color} leading-relaxed`}>
        {data.annotation}
      </div>
    </div>
  );
}
