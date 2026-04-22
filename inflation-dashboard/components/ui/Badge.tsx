import type { Direction } from '@/types';

const DIRECTION_STYLES: Record<Direction, { label: string; className: string }> = {
  BULLISH:  { label: '看多',    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  NEU_BULL: { label: '偏多',    className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  NEUTRAL:  { label: '中性',    className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  NEU_BEAR: { label: '偏空',    className: 'bg-red-500/10 text-red-300 border-red-500/30' },
  BEARISH:  { label: '看空',    className: 'bg-red-500/20 text-red-400 border-red-500/40' },
};

export function DirectionBadge({ direction, size = 'md' }: { direction: Direction; size?: 'sm' | 'md' }) {
  const s = DIRECTION_STYLES[direction];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span className={`${sizeClass} rounded border font-medium ${s.className}`}>{s.label}</span>
  );
}
