'use client';

export function StatusBar({
  warnings = 0, messages = 0, lastUpdate, modelOnline = true, wsConnected = true,
}: {
  warnings?: number; messages?: number; lastUpdate?: string;
  modelOnline?: boolean; wsConnected?: boolean;
}) {
  return (
    <footer className="border-t border-slate-800 bg-[#0d1117] mt-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-4 flex-wrap text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          系统正常
        </span>
        <span className="text-slate-700">|</span>
        <span>NLP 引擎 · {modelOnline ? '在线' : '离线'}</span>
        <span className="text-slate-700">|</span>
        <span>FRED+BLS+BEA+Truflation · {lastUpdate ?? '--:--'}</span>
        <span className="text-slate-700">|</span>
        <span>WebSocket · {wsConnected ? '已连接' : '连接中'}</span>

        <span className="ml-auto flex items-center gap-3">
          {warnings > 0 && <span className="text-amber-400">△ {warnings} 警告</span>}
          <span className="text-blue-400">🔔 {messages} 条消息</span>
        </span>
      </div>
    </footer>
  );
}
