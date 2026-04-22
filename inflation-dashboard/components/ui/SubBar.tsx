export function SubBar({
  label, value, score, unit, tone,
}: {
  label: string;
  value: number;
  score: number;
  unit?: string;
  tone?: 'push' | 'neutral' | 'suppress';
}) {
  const barColor =
    tone === 'push' ? 'bg-red-500/70'
    : tone === 'suppress' ? 'bg-emerald-500/70'
    : 'bg-amber-500/60';
  const sign = value >= 0 ? '+' : '';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-400 w-24 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, score)}%` }} />
      </div>
      <span className="text-[11px] font-mono text-slate-300 w-16 text-right">
        {typeof value === 'number' && Number.isFinite(value)
          ? `${sign}${value.toFixed(unit === '' ? 2 : value >= 100 ? 0 : 2)}${unit || ''}`
          : '-'}
      </span>
    </div>
  );
}
