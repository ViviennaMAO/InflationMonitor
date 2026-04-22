'use client';
import Link from 'next/link';
import { REGIME_META } from '@/types';
import type { InflationScore } from '@/types';

export function Header({ score }: { score: InflationScore }) {
  const meta = REGIME_META[score.regime];
  return (
    <header className="sticky top-0 z-50 bg-[#0a0e1a]/95 border-b border-slate-800 backdrop-blur-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        {/* Row 1 */}
        <div className="flex items-center gap-3 h-11 flex-wrap">
          <span
            className="text-[#fbbf24] font-mono text-sm font-semibold tracking-wider cursor-help"
            title="IPS = Inflation Pressure Score (通胀压力综合评分)"
          >
            IPS = P + E + D + F + N
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-[10px] text-slate-500">Inflation Pressure Score</span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">Inflation Monitor</span>
          <span className="text-slate-700 text-xs">v1.0</span>
          <span className="ml-auto text-[10px] text-slate-500 font-mono">
            {score.as_of} · 16:00 ET
          </span>
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-4 h-12 border-t border-slate-800/60 flex-wrap">
          {/* Score */}
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] text-slate-500 cursor-help"
              title="Inflation Pressure Score"
            >
              IPS
            </span>
            <span className="text-xl font-mono font-semibold text-[#fbbf24]">
              {score.pi}
            </span>
            <span className="text-[10px] text-slate-500">/100</span>
            <span className={`text-[10px] font-mono ${score.delta_1d >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {score.delta_1d >= 0 ? '+' : ''}{score.delta_1d.toFixed(1)}
            </span>
          </div>

          {/* Regime */}
          <span className={`text-xs px-2 py-1 rounded border font-medium ${meta.bg} ${meta.color}`}>
            {meta.emoji} {meta.label}
          </span>

          {/* Nav */}
          <nav className="ml-auto flex items-center gap-3 text-[11px]">
            <NavLink href="/">概览</NavLink>
            <NavLink href="/fomc">FOMC</NavLink>
            <NavLink href="/fiscal">财政</NavLink>
            <NavLink href="/narrative">叙事</NavLink>
            <NavLink href="/scenarios">情景</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-slate-400 hover:text-slate-100 transition-colors px-2 py-0.5 rounded hover:bg-slate-800/60"
    >
      {children}
    </Link>
  );
}
