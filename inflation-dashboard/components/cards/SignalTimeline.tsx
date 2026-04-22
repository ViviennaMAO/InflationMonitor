'use client';
import type { SignalTimelineEntry } from '@/types';
import { REGIME_META } from '@/types';

const DELTA_COLOR: Record<string, string> = {
  '↑': 'text-red-400',
  '↓': 'text-emerald-400',
  '↔': 'text-slate-400',
};

export function SignalTimeline({ data }: { data: SignalTimelineEntry[] }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200">IPS 信号历史时间线</h3>
        <span className="text-[10px] text-slate-500">近 7 次信号变化</span>
      </div>
      <div className="space-y-2.5">
        {data.map((e, i) => {
          const meta = REGIME_META[e.regime];
          const dc = DELTA_COLOR[e.delta_label];
          return (
            <div key={i} className="flex items-start gap-3 text-xs">
              <span className="font-mono text-slate-500 w-20 flex-shrink-0 pt-0.5">{e.date}</span>
              <span className="font-mono text-[#fbbf24] w-10 flex-shrink-0 pt-0.5">{e.pi}</span>
              <span className={`w-6 flex-shrink-0 pt-0.5 font-mono font-bold ${dc}`}>
                {e.delta_label}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color} flex-shrink-0`}>
                {meta.label}
              </span>
              <span className="text-slate-300 flex-1 leading-relaxed">{e.note}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
