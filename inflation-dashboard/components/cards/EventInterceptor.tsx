'use client';
import type { EventWindow } from '@/types';

const TYPE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  cpi:     { label: 'CPI',      color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/30' },
  pce:     { label: 'PCE',      color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  ppi:     { label: 'PPI',      color: 'text-amber-400',  bg: 'bg-amber-500/15 border-amber-500/30' },
  fomc:    { label: 'FOMC',     color: 'text-sky-400',    bg: 'bg-sky-500/15 border-sky-500/30' },
  payrolls:{ label: '非农',     color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/30' },
  none:    { label: '-',        color: 'text-slate-400',  bg: 'bg-slate-500/15 border-slate-500/30' },
};

export function EventInterceptor({ data }: { data: EventWindow }) {
  if (!data.active) return null;
  const s = TYPE_STYLES[data.type];
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/40 to-transparent border border-amber-500/20 rounded-lg p-3 flex items-center gap-3">
      <span className={`text-[10px] px-2 py-1 rounded border font-semibold ${s.bg} ${s.color}`}>
        事件拦截 · {s.label}
      </span>
      <span className="text-xs text-slate-300">{data.next_event}</span>
      <span className="text-[10px] text-amber-400 font-mono">T-{data.days_until}</span>
      <span className="text-[10px] text-slate-400 truncate">{data.message}</span>
    </div>
  );
}
