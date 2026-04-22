'use client';
import { useState } from 'react';
import type { ScenarioBundle, Scenario, AssetKey } from '@/types';
import { DirectionBadge } from '@/components/ui/Badge';

const ASSET_META: Record<AssetKey, { label: string; emoji: string }> = {
  gold: { label: '黄金', emoji: '🟡' },
  usd:  { label: '美元', emoji: '💵' },
  ust:  { label: '美债', emoji: '📉' },
  spx:  { label: '美股', emoji: '📈' },
};

export function ScenarioPlaybook({ data }: { data: ScenarioBundle }) {
  const [active, setActive] = useState<string>(data.current_regime);
  const current = data.scenarios.find(s => s.key === active) ?? data.scenarios[0];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">场景化剧本</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            四种通胀体制下四类资产的表现剧本 · 当前体制标记 ●
          </p>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">{data.as_of}</div>
      </div>

      {/* Scenario tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {data.scenarios.map(s => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              active === s.key
                ? 'bg-slate-800 border-amber-500/40 text-amber-400'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {s.emoji} {s.label}
            <span className="ml-1.5 text-[10px] opacity-70 font-mono">
              {(s.probability * 100).toFixed(0)}%
            </span>
            {s.is_current && <span className="ml-1 text-emerald-400">●</span>}
          </button>
        ))}
      </div>

      {/* Active scenario detail */}
      <ScenarioDetail scenario={current} />
    </div>
  );
}

function ScenarioDetail({ scenario }: { scenario: Scenario }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Col 1: Description + history + exit */}
      <div className="space-y-3">
        <div>
          <div className="text-[10px] text-slate-500 mb-1">剧本描述</div>
          <div className="text-xs text-slate-300 leading-relaxed">{scenario.description}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">历史对照</div>
          <div className="flex flex-wrap gap-1">
            {scenario.historical_analog.map(a => (
              <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {a}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">
            中位数持续 <span className="text-slate-300 font-mono">{scenario.median_duration_months}月</span>
          </div>
          <div className="text-[10px] text-slate-500 mb-1">退出路径</div>
          <div className="space-y-1">
            {scenario.exit_paths.map(p => (
              <div key={p.path} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-24 truncate">{p.path}</span>
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500/60 rounded-full" style={{ width: `${p.weight * 100}%` }} />
                </div>
                <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                  {(p.weight * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Col 2: Asset performance */}
      <div>
        <div className="text-[10px] text-slate-500 mb-2">资产历史年化表现 (中位数区间)</div>
        <div className="space-y-2">
          {scenario.performance.map(p => {
            const meta = ASSET_META[p.asset];
            const width = Math.abs(p.return_range[1] - p.return_range[0]);
            const isPositive = p.return_range[1] > 0;
            const isNegative = p.return_range[0] < 0;
            const barColor =
              isPositive && !isNegative ? 'bg-emerald-500/50'
              : isNegative && !isPositive ? 'bg-red-500/50'
              : 'bg-amber-500/40';
            return (
              <div key={p.asset} className="bg-slate-800/40 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-200">{meta.emoji} {meta.label}</span>
                  <DirectionBadge direction={p.direction} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 w-16 text-right">
                    {p.return_range[0] > 0 ? '+' : ''}{p.return_range[0]}%
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-900/80 rounded-full overflow-hidden relative">
                    <div
                      className={`absolute top-0 bottom-0 ${barColor}`}
                      style={{
                        left: `${Math.max(0, (p.return_range[0] + 25) / 50 * 100)}%`,
                        width: `${Math.min(100, width / 50 * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 w-16">
                    {p.return_range[1] > 0 ? '+' : ''}{p.return_range[1]}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Col 3: Allocation */}
      <div>
        <div className="text-[10px] text-slate-500 mb-2">建议配置 (vs 中性基准)</div>
        <div className="space-y-2">
          {scenario.weights.map(w => {
            const meta = ASSET_META[w.asset];
            const sign = w.delta_pp > 0 ? '+' : '';
            const deltaColor =
              w.delta_pp > 0 ? 'text-emerald-400'
              : w.delta_pp < 0 ? 'text-red-400'
              : 'text-slate-400';
            return (
              <div key={w.asset} className="bg-slate-800/40 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-200">{meta.emoji} {meta.label}</span>
                  <span className={`text-[11px] font-mono font-semibold ${deltaColor}`}>
                    {sign}{w.delta_pp}pp
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span>当前 {(w.current * 100).toFixed(0)}%</span>
                  <span className="text-slate-600">|</span>
                  <span>基准 {(w.neutral * 100).toFixed(0)}%</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{w.note}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-2 rounded bg-red-500/10 border border-red-500/30 text-[10px] text-red-300">
          ⚠ {scenario.key_risks}
        </div>
      </div>
    </div>
  );
}
