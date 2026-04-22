'use client';
import { Header } from '@/components/layout/Header';
import { StatusBar } from '@/components/layout/StatusBar';
import { InflationGauge } from '@/components/gauge/InflationGauge';
import { AssetSignalTower } from '@/components/cards/AssetSignalTower';
import { ComponentCard } from '@/components/cards/ComponentCard';
import { InflationTypeCard } from '@/components/cards/InflationTypeCard';
import { EventInterceptor } from '@/components/cards/EventInterceptor';
import { ScenarioPlaybook } from '@/components/cards/ScenarioPlaybook';
import { FomcSummaryCard } from '@/components/cards/FomcSummaryCard';
import { SignalTimeline } from '@/components/cards/SignalTimeline';
import { InflationHistory } from '@/components/charts/InflationHistory';
import {
  useScore, useComponents, useAssets, useScenarios, useDiagnosis,
  useFomc, useHistory, useSignalTimeline, useEventWindow,
} from '@/lib/useInflationData';

function LiveIndicator({ loading }: { loading: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
      <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
      {loading ? '更新中...' : '实时数据'}
    </div>
  );
}

export default function Dashboard() {
  const { data: score, isLoading: scoreLoading } = useScore();
  const { data: components } = useComponents();
  const { data: assets } = useAssets();
  const { data: scenarios } = useScenarios();
  const { data: diagnosis } = useDiagnosis();
  const { data: fomc } = useFomc();
  const { data: history } = useHistory();
  const { data: signalTimeline } = useSignalTimeline();
  const { data: eventWindow } = useEventWindow();

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <Header score={score} />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <div className="flex justify-end">
          <LiveIndicator loading={scoreLoading} />
        </div>

        {/* ═══ Row 1: Event interceptor ═══ */}
        <EventInterceptor data={eventWindow} />

        {/* ═══ Row 2: 四资产信号塔 (核心交付) ═══ */}
        <AssetSignalTower data={assets} />

        {/* ═══ Row 3: Gauge + 分项进度 + 历史 + 通胀体制 ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Gauge */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center">
            <div className="text-xs text-slate-500 font-mono mb-1">IPS — 综合评分</div>
            <div className="text-[10px] text-slate-600 mb-2">Inflation Pressure Score · 通胀压力评分</div>
            <InflationGauge score={score.pi} regime={score.regime} />
            <div className="mt-4 w-full space-y-1.5">
              {[
                { label: 'P 价格 (25%)',     score: score.components.P, color: 'bg-amber-500' },
                { label: 'E 预期 (20%)',     score: score.components.E, color: 'bg-sky-500' },
                { label: 'D 驱动 (20%)',     score: score.components.D, color: 'bg-violet-500' },
                { label: 'F 财政 (15%)',     score: score.components.F, color: 'bg-rose-500' },
                { label: 'N 叙事 (20%)',     score: score.components.N, color: 'bg-teal-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-20 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} opacity-70`} style={{ width: `${item.score}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{item.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* History chart */}
          <div className="lg:col-span-6">
            <InflationHistory data={history} />
          </div>

          {/* Inflation Type */}
          <div className="lg:col-span-3">
            <InflationTypeCard data={diagnosis} />
          </div>
        </section>

        {/* ═══ Row 4: 五分项卡片 P E D F N ═══ */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500 tracking-widest uppercase">
              IPS 五分项 · Price / Expectations / Drivers / Fiscal / Narrative
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            {components.map(c => <ComponentCard key={c.key} data={c} />)}
          </div>
        </section>

        {/* ═══ Row 5: 场景化剧本 ═══ */}
        <ScenarioPlaybook data={scenarios} />

        {/* ═══ Row 6: FOMC 摘要 + Signal Timeline ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FomcSummaryCard data={fomc} />
          <SignalTimeline data={signalTimeline} />
        </section>
      </main>

      <StatusBar warnings={1} messages={4} lastUpdate="16:02" modelOnline wsConnected />
    </div>
  );
}
