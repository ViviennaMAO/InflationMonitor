'use client';
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { InflationHistoryEntry } from '@/types';

export function InflationHistory({ data }: { data: InflationHistoryEntry[] }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-200">Π 评分 vs CPI 同比</h3>
        <span className="text-[10px] text-slate-500">近 90 日</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="piGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v.slice(5)}
            interval={14}
          />
          <YAxis
            yAxisId="pi"
            orientation="left"
            tick={{ fontSize: 9, fill: '#fbbf24' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <YAxis
            yAxisId="cpi"
            orientation="right"
            tick={{ fontSize: 9, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            domain={[1, 5]}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
            formatter={(val, name) => {
              if (name === 'pi') return [Number(val).toFixed(0), 'Π 评分'];
              if (name === 'cpi_yoy') return [`${Number(val).toFixed(2)}%`, 'CPI YoY'];
              return [val, name];
            }}
          />
          <ReferenceLine yAxisId="pi" y={55} stroke="#f97316" strokeDasharray="2 2" strokeOpacity={0.4} />
          <ReferenceLine yAxisId="pi" y={70} stroke="#ef4444" strokeDasharray="2 2" strokeOpacity={0.4} />
          <Area
            yAxisId="pi"
            type="monotone"
            dataKey="pi"
            stroke="#fbbf24"
            strokeWidth={2}
            fill="url(#piGradient)"
          />
          <Line
            yAxisId="cpi"
            type="monotone"
            dataKey="cpi_yoy"
            stroke="#64748b"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#fbbf24]" />Π 评分</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-400 border-dashed" />CPI YoY</span>
        <span className="ml-auto">阈值: <span className="text-orange-400">55</span> · <span className="text-red-400">70</span></span>
      </div>
    </div>
  );
}
