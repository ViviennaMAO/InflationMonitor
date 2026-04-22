# InflationMonitor · Dashboard

通胀因子全景看板 · `Π = P + E + D + F + N` · 终点落到黄金 / 美元 / 美债 / 美股四类资产的方向信号 + 场景化剧本。

- 产品需求文档: [`../PRD_InflationMonitor_v1.0.md`](../PRD_InflationMonitor_v1.0.md)
- 技术栈: Next.js 16 (App Router) + React 19 + Tailwind 4 + Recharts + SWR
- 当前状态: **v1.0 前端原型 (Mock Data)** — 所有 API 路由返回 `data/mockData.ts` 中的模拟数据。

## 快速开始

```bash
cd inflation-dashboard
npm install
npm run dev
# open http://localhost:3000
```

## 页面

| 路径 | 模块 |
|------|------|
| `/` | 主看板：事件拦截 · 四资产信号塔 · Π 仪表盘 · 五分项卡 · 场景剧本 · FOMC 摘要 · 信号时间线 |
| `/fomc` | FOMC 深度：声明 / 纪要 / 官员发言 + 鹰鸽指数 MA5 |
| `/fiscal` | 财政脉冲：赤字/GDP · 财政支出 · TGA · 重大立法事件 |
| `/narrative` | 叙事与媒体：热词云 · Google Trends · 社媒情绪 |
| `/scenarios` | 情景深度：四体制剧本 + 马尔可夫转移概率 |

## 目录

```
inflation-dashboard/
├── app/
│   ├── page.tsx                主看板
│   ├── fomc/fiscal/narrative/scenarios/    子页面
│   └── api/*/route.ts          Mock 数据路由
├── components/
│   ├── layout/{Header,StatusBar}.tsx
│   ├── gauge/InflationGauge.tsx
│   ├── cards/{AssetSignalTower,ComponentCard,ScenarioPlaybook,
│   │         InflationTypeCard,EventInterceptor,FomcSummaryCard,
│   │         SignalTimeline}.tsx
│   ├── charts/InflationHistory.tsx
│   └── ui/{Badge,SubBar}.tsx
├── lib/useInflationData.ts     SWR Hooks (mock fallback)
├── data/mockData.ts
├── types/index.ts
└── package.json
```

## 下一步 (Phase 2 — Python Pipeline)

参考 PRD §5 / §6。需接入：

- FRED / BLS / BEA / Treasury / Fed H.4.1
- FOMC 声明 + 官员发言爬虫 + Claude/GPT 鹰鸽 NLP 打分
- 新闻语料 (GDELT) + Google Trends + 社媒情绪
- Truflation 实时通胀
- 输出 JSON 文件到 `pipeline/output/`，前端 API 路由直接读取。

## 下一步 (Phase 3 — 小程序)

v1.1 版本跟进。参考 USD_Monitor 的 `miniprogram/` 结构。
