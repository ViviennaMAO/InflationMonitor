'use client';
import type { AssetSignalBundle, AssetSignal } from '@/types';
import { DirectionBadge } from '@/components/ui/Badge';

export function AssetSignalTower({ data }: { data: AssetSignalBundle }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-xs text-slate-500 tracking-widest uppercase">
          通胀 Π {data.pi_score} → 四资产信号塔
        </span>
        <div className="h-px flex-1 bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {data.assets.map(a => <AssetCard key={a.key} asset={a} />)}
      </div>
    </div>
  );
}

const DIRECTION_BORDER: Record<string, string> = {
  BULLISH:  'border-emerald-500/40 hover:border-emerald-400/60',
  NEU_BULL: 'border-emerald-500/25 hover:border-emerald-400/40',
  NEUTRAL:  'border-slate-700 hover:border-slate-600',
  NEU_BEAR: 'border-red-500/25 hover:border-red-400/40',
  BEARISH:  'border-red-500/40 hover:border-red-400/60',
};

function AssetCard({ asset }: { asset: AssetSignal }) {
  const delta = asset.suggested_weight.delta_pp;
  const deltaColor = delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-slate-400';
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <div className={`bg-slate-900/60 border rounded-xl p-4 transition-colors ${DIRECTION_BORDER[asset.direction]}`}>
      {/* Top */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{asset.emoji}</span>
          <span className="text-sm font-semibold text-slate-100">{asset.name_zh}</span>
          <span className="text-[10px] text-slate-500 font-mono">{asset.ticker}</span>
        </div>
        <DirectionBadge direction={asset.direction} />
      </div>

      {/* Headline */}
      <div className="text-xs text-slate-300 leading-relaxed mb-3 min-h-[2.5rem]">
        {asset.headline}
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-slate-500 w-14">置信度</span>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500/70 rounded-full"
            style={{ width: `${asset.confidence}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-300 w-8 text-right">{asset.confidence}</span>
      </div>

      {/* Sensitivity */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-slate-500 w-14">通胀敏感</span>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500/70 rounded-full"
            style={{ width: `${asset.sensitivity * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-300 w-8 text-right">
          {asset.sensitivity.toFixed(2)}
        </span>
      </div>

      {/* Chain */}
      <div className="text-[10px] text-slate-400 bg-slate-800/40 rounded px-2 py-1.5 mb-2 font-mono">
        <span className="text-slate-500">链: </span>{asset.rationale_chain}
      </div>

      {/* Historical + Risk */}
      <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
        <div>
          <div className="text-slate-500">历史对照</div>
          <div className="text-slate-300 mt-0.5">
            {asset.historical_analog.period}
            <span className="text-slate-500 ml-1 font-mono">
              ρ={asset.historical_analog.similarity.toFixed(2)}
            </span>
          </div>
        </div>
        <div>
          <div className="text-slate-500">主要风险</div>
          <div className="text-slate-300 mt-0.5 truncate">{asset.risk}</div>
        </div>
      </div>

      {/* Suggested weight */}
      <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">建议仓位</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-200">
            {(asset.suggested_weight.current * 100).toFixed(0)}%
          </span>
          <span className="text-slate-600 text-[9px]">
            基准 {(asset.suggested_weight.neutral * 100).toFixed(0)}%
          </span>
          <span className={`font-mono font-semibold ${deltaColor}`}>
            {deltaSign}{delta}pp
          </span>
        </div>
      </div>
    </div>
  );
}
