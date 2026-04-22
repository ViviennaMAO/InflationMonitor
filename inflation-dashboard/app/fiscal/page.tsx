'use client';
import Link from 'next/link';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { StatusBar } from '@/components/layout/StatusBar';
import { useFiscal } from '@/lib/useInflationData';

const IMPACT_STYLES: Record<string, string> = {
  push:     'bg-red-500/15 text-red-400 border-red-500/30',
  neutral:  'bg-slate-500/15 text-slate-300 border-slate-500/30',
  suppress: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

export default function FiscalPage() {
  const { data } = useFiscal();

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col pb-8">
      <header className="sticky top-0 z-50 bg-[#0a0e1a]/90 border-b border-slate-800 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center gap-3 h-12">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">← 首页</Link>
          <span className="text-slate-700">|</span>
          <span className="text-sm font-medium text-slate-200">财政脉冲</span>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-400">F 分项深度页</span>
          <span className="ml-auto text-[10px] text-slate-600 font-mono">Inflation Monitor · Fiscal Impulse</span>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: '赤字/GDP',       value: `${data.deficit_gdp_pct.toFixed(1)}%`,   tone: 'text-red-400' },
            { label: '财政支出 YoY',   value: `${data.spending_yoy.toFixed(1)}%`,      tone: 'text-red-400' },
            { label: '净发债 (月)',    value: `$${data.net_issuance_b}B`,              tone: 'text-orange-400' },
            { label: 'TGA Δ',          value: `${data.tga_delta_b}B`,                  tone: 'text-emerald-400' },
            { label: 'F 分项评分',     value: data.score.toString(),                    tone: 'text-rose-400' },
          ].map(k => (
            <div key={k.label} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 mb-1">{k.label}</div>
              <div className={`font-mono font-semibold text-sm ${k.tone}`}>{k.value}</div>
            </div>
          ))}
        </section>

        {/* History chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">赤字 / GDP + 财政支出 YoY · 24 月</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data.history} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#fb7185' }} tickLine={false} axisLine={false} domain={[0, 10]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
              <ReferenceLine yAxisId="left" y={4} stroke="#334155" strokeDasharray="2 2" />
              <Line yAxisId="left" type="monotone" dataKey="deficit_gdp" stroke="#fb7185" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="spending_yoy" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-2 text-[10px] text-slate-500">
            <span><span className="inline-block w-3 h-0.5 bg-rose-400 mr-1" />赤字/GDP (%)</span>
            <span><span className="inline-block w-3 h-0.5 bg-slate-400 mr-1" />财政支出 YoY</span>
          </div>
        </div>

        {/* Events */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">重大财政事件时间线</h3>
          <div className="space-y-2">
            {data.events.map(e => (
              <div key={e.date} className="flex items-center gap-3 text-xs">
                <span className="font-mono text-slate-500 w-20">{e.date}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${IMPACT_STYLES[e.impact]}`}>
                  {e.impact === 'push' ? '推升通胀' : e.impact === 'suppress' ? '压制通胀' : '中性'}
                </span>
                <span className="text-slate-300">{e.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-300">
          🔍 <span className="text-rose-400 font-semibold">综合:</span> {data.annotation}
        </div>
      </main>

      <StatusBar warnings={1} messages={4} lastUpdate="16:02" modelOnline wsConnected />
    </div>
  );
}
