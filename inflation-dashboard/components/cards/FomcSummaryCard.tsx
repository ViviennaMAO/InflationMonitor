'use client';
import Link from 'next/link';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import type { FomcBundle, HawkDoveScore } from '@/types';

const HAWK_COLORS: Record<number, string> = {
  [-2]: '#3b82f6', [-1]: '#06b6d4', [0]: '#64748b', [1]: '#f59e0b', [2]: '#ef4444',
};

const HAWK_LABEL: Record<HawkDoveScore, { text: string; color: string }> = {
  [-2]: { text: '极鸽', color: 'text-blue-400' },
  [-1]: { text: '偏鸽', color: 'text-cyan-400' },
  [0]:  { text: '中性', color: 'text-slate-400' },
  [1]:  { text: '偏鹰', color: 'text-amber-400' },
  [2]:  { text: '极鹰', color: 'text-red-400' },
};

export function FomcSummaryCard({ data }: { data: FomcBundle }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">FOMC · 鹰鸽指数</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            声明 / 纪要 / 官员发言 NLP 打分 · MA5 趋势
          </p>
        </div>
        <Link href="/fomc" className="text-[10px] text-sky-400 hover:text-sky-300">
          查看完整 →
        </Link>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {[
          { label: '当前利率',     value: `${data.current_rate.toFixed(3)}%`,     color: 'text-blue-400' },
          { label: '点阵图中位数', value: `${data.dot_plot_median.toFixed(3)}%`,  color: 'text-amber-400' },
          { label: '下次会议',     value: data.next_meeting,                       color: 'text-emerald-400' },
          {
            label: '鹰鸽均值 MA5',
            value: `${data.hawkdove_trend[data.hawkdove_trend.length - 1].ma5 >= 0 ? '+' : ''}${data.hawkdove_trend[data.hawkdove_trend.length - 1].ma5.toFixed(1)}`,
            color: data.hawkdove_trend[data.hawkdove_trend.length - 1].ma5 > 0 ? 'text-red-400' : 'text-blue-400',
          },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/40 rounded p-2">
            <div className="text-[9px] text-slate-500 mb-0.5">{s.label}</div>
            <div className={`text-xs font-mono font-semibold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Hawkdove trend chart */}
      <ResponsiveContainer width="100%" height={140}>
        <ComposedChart data={data.hawkdove_trend} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            domain={[-2.5, 2.5]}
            ticks={[-2, 0, 2]}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
          />
          <ReferenceLine y={0} stroke="#334155" strokeDasharray="2 2" />
          <Bar dataKey="score" barSize={10} radius={[2, 2, 0, 0]}>
            {data.hawkdove_trend.map((e, idx) => (
              <Cell key={idx} fill={HAWK_COLORS[e.score] ?? '#64748b'} fillOpacity={0.6} />
            ))}
          </Bar>
          <Line dataKey="ma5" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Recent 3 events */}
      <div className="mt-3 space-y-2">
        {data.timeline.slice(0, 3).map((e, i) => {
          const hd = HAWK_LABEL[e.hawkdove];
          return (
            <div key={i} className="flex items-start gap-2 text-[10px]">
              <span className="font-mono text-slate-500 w-16 flex-shrink-0">{e.date}</span>
              <span className={`px-1.5 rounded bg-slate-800 ${hd.color}`}>{hd.text}</span>
              <span className="text-slate-300 truncate">
                {e.speaker && <span className="text-sky-400">{e.speaker}: </span>}
                {e.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Assessment */}
      <div className="mt-3 p-2 rounded bg-slate-800/40 border border-slate-700 text-[11px] text-slate-300 leading-relaxed">
        <span className="text-[10px] text-amber-400 mr-1">🔍 综合:</span>{data.assessment}
      </div>
    </div>
  );
}
