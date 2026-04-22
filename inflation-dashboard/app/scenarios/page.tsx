'use client';
import Link from 'next/link';
import { StatusBar } from '@/components/layout/StatusBar';
import { ScenarioPlaybook } from '@/components/cards/ScenarioPlaybook';
import { useScenarios } from '@/lib/useInflationData';
import { REGIME_META } from '@/types';

export default function ScenariosPage() {
  const { data } = useScenarios();

  const transition = data.transition_next_month;

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col pb-8">
      <header className="sticky top-0 z-50 bg-[#0a0e1a]/90 border-b border-slate-800 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center gap-3 h-12">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">← 首页</Link>
          <span className="text-slate-700">|</span>
          <span className="text-sm font-medium text-slate-200">情景深度</span>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-400">四种通胀体制剧本与转移概率</span>
          <span className="ml-auto text-[10px] text-slate-600 font-mono">Inflation Monitor · Scenarios</span>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Transition probabilities */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">下月情景转移概率</h3>
          <div className="space-y-2">
            {(Object.entries(transition) as Array<[keyof typeof transition, number]>).map(([key, prob]) => {
              const meta = REGIME_META[key];
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className={`text-xs font-medium w-24 ${meta.color}`}>{meta.emoji} {meta.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${prob * 100}%`,
                        background: {
                          reflation_surge: '#ef4444',
                          sticky_inflation: '#f97316',
                          goldilocks: '#eab308',
                          disinflation: '#10b981',
                          deflation_risk: '#3b82f6',
                        }[key],
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-300 w-14 text-right">
                    {(prob * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[10px] text-slate-500">
            基于过去 20 年月度数据估计的马尔可夫转移矩阵。
          </div>
        </div>

        {/* Full playbook */}
        <ScenarioPlaybook data={data} />
      </main>

      <StatusBar warnings={1} messages={4} lastUpdate="16:02" modelOnline wsConnected />
    </div>
  );
}
