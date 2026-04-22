'use client';
import Link from 'next/link';
import { StatusBar } from '@/components/layout/StatusBar';
import { FomcSummaryCard } from '@/components/cards/FomcSummaryCard';
import { useFomc } from '@/lib/useInflationData';
import type { HawkDoveScore } from '@/types';

const HAWK_LABEL: Record<HawkDoveScore, { text: string; bg: string }> = {
  [-2]: { text: '极鸽', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  [-1]: { text: '偏鸽', bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  [0]:  { text: '中性', bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  [1]:  { text: '偏鹰', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  [2]:  { text: '极鹰', bg: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const TYPE_LABEL: Record<string, { text: string; bg: string }> = {
  meeting:  { text: 'FOMC会议', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  minutes:  { text: '会议纪要', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  speech:   { text: '官员发言', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export default function FomcPage() {
  const { data } = useFomc();

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col pb-8">
      <header className="sticky top-0 z-50 bg-[#0a0e1a]/90 border-b border-slate-800 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center gap-3 h-12">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">← 首页</Link>
          <span className="text-slate-700">|</span>
          <span className="text-sm font-medium text-slate-200">FOMC 追踪</span>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-400">鹰鸽指数 · N.1 子因子</span>
          <span className="ml-auto text-[10px] text-slate-600 font-mono">Inflation Monitor · Fed Watch</span>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <FomcSummaryCard data={data} />

        {/* Full timeline */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">完整事件时间线</h3>
          <div className="space-y-4">
            {data.timeline.map((e, i) => {
              const hd = HAWK_LABEL[e.hawkdove];
              const t = TYPE_LABEL[e.type];
              return (
                <div key={i} className="relative pl-6 border-l-2 border-slate-700/50 pb-2">
                  <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${
                    e.type === 'meeting' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono text-slate-500">{e.date}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${t.bg}`}>{t.text}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${hd.bg}`}>{hd.text}</span>
                    {e.has_vote && <span className="text-[9px] text-emerald-500/70">有投票权</span>}
                  </div>
                  <div className="text-xs font-medium text-slate-200 mb-1">
                    {e.speaker && <span className="text-blue-400">{e.speaker}: </span>}
                    {e.title}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{e.summary}</p>
                  {e.key_quotes && e.key_quotes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {e.key_quotes.map((q, j) => (
                        <blockquote key={j} className="text-[10px] text-slate-500 italic border-l-2 border-slate-700 pl-2">
                          {q}
                        </blockquote>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <StatusBar warnings={1} messages={4} lastUpdate="16:02" modelOnline wsConnected />
    </div>
  );
}
