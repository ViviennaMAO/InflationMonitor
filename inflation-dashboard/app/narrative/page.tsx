'use client';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StatusBar } from '@/components/layout/StatusBar';
import { useNarrative } from '@/lib/useInflationData';

export default function NarrativePage() {
  const { data } = useNarrative();

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col pb-8">
      <header className="sticky top-0 z-50 bg-[#0a0e1a]/90 border-b border-slate-800 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center gap-3 h-12">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">← 首页</Link>
          <span className="text-slate-700">|</span>
          <span className="text-sm font-medium text-slate-200">叙事与媒体</span>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-400">N.3 子因子</span>
          <span className="ml-auto text-[10px] text-slate-600 font-mono">Inflation Monitor · Narrative</span>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '媒体叙事指数', value: data.narrative_index.toString(), tone: 'text-teal-400' },
            { label: 'Google Trends', value: data.search_trends.toString(), tone: 'text-sky-400' },
            { label: '社媒情绪', value: data.social_sentiment.toFixed(2), tone: data.social_sentiment > 0 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'FOMC 鹰鸽 MA5', value: `${data.hawkdove_ma5 >= 0 ? '+' : ''}${data.hawkdove_ma5.toFixed(1)}`, tone: 'text-amber-400' },
          ].map(k => (
            <div key={k.label} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 mb-1">{k.label}</div>
              <div className={`font-mono font-semibold text-sm ${k.tone}`}>{k.value}</div>
            </div>
          ))}
        </section>

        {/* Keyword cloud */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">热词云 · 通胀语义关联度</h3>
          <div className="flex flex-wrap gap-2 items-baseline">
            {data.top_keywords.map(k => (
              <span
                key={k.word}
                className="rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 transition-all"
                style={{
                  fontSize: `${11 + k.weight * 14}px`,
                  padding: `${2 + k.weight * 4}px ${6 + k.weight * 8}px`,
                  opacity: 0.6 + k.weight * 0.4,
                }}
              >
                {k.word}
                <span className="ml-1 text-[9px] font-mono opacity-60">{(k.weight * 100).toFixed(0)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">"inflation" 搜索趋势 · 30 日</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.search_history} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="narrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={2} fill="url(#narrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-300">
          🔍 <span className="text-teal-400 font-semibold">综合:</span> {data.annotation}
        </div>
      </main>

      <StatusBar warnings={1} messages={4} lastUpdate="16:02" modelOnline wsConnected />
    </div>
  );
}
