'use client';
import type { InflationDiagnosis, InflationType } from '@/types';

const TYPE_META: Record<InflationType, { label: string; color: string }> = {
  demand_pull:   { label: '需求拉动', color: '#ef4444' },
  cost_push:     { label: '成本推动', color: '#f97316' },
  wage_price:    { label: '工资-物价螺旋', color: '#eab308' },
  fiscal_driven: { label: '财政驱动', color: '#8b5cf6' },
  mixed:         { label: '混合型',   color: '#64748b' },
};

const PERSISTENCE: Record<string, { label: string; color: string }> = {
  low:    { label: '低',   color: 'text-emerald-400' },
  medium: { label: '中等', color: 'text-amber-400' },
  high:   { label: '高',   color: 'text-red-400' },
};

export function InflationTypeCard({ data }: { data: InflationDiagnosis }) {
  const dominant = TYPE_META[data.dominant_type];
  const p = PERSISTENCE[data.persistence];
  const r = PERSISTENCE[data.policy_responsiveness];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-semibold text-slate-200">通胀体制诊断</div>
          <div className="text-[10px] text-slate-500">Inflation Type · 主导驱动</div>
        </div>
      </div>

      {/* Dominant type */}
      <div className="mb-3">
        <div className="text-[10px] text-slate-500 mb-1">主导类型</div>
        <div className="text-lg font-semibold" style={{ color: dominant.color }}>
          {dominant.label}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          贡献度 <span className="font-mono text-slate-300">{(data.dominant_weight * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-1.5 mb-3">
        {data.breakdown.map(b => {
          const m = TYPE_META[b.type];
          return (
            <div key={b.type} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 w-20 truncate">{m.label}</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${b.weight * 100}%`, background: m.color, opacity: 0.7 }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-300 w-10 text-right">
                {(b.weight * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-[10px]">
        <div>
          <div className="text-slate-500">持久性</div>
          <div className={`font-semibold ${p.color}`}>{p.label}</div>
        </div>
        <div>
          <div className="text-slate-500">预计持续</div>
          <div className="font-mono text-slate-300">{data.duration_estimate_months}月</div>
        </div>
        <div>
          <div className="text-slate-500">政策响应度</div>
          <div className={`font-semibold ${r.color}`}>{r.label}</div>
        </div>
        <div>
          <div className="text-slate-500">历史锚点</div>
          <div className="text-slate-300 text-[9px] truncate">{data.historical_anchor}</div>
        </div>
      </div>
    </div>
  );
}
