# Inflation Monitor — PRD v1.0

> **项目代号**: InflationMonitor
> **版本**: v1.0
> **日期**: 2026-04-21
> **参考**: USDMonitor (γ 因子打分模型) · GoldMonitor (XGBoost 因子分解)
> **定位**: 通胀因子全景看板，终点落到 **黄金 / 美元 / 美债 / 美股** 四类资产的方向信号 + 场景化剧本

---

## 1. 项目概述

### 1.1 背景与差异化

**与 USD Monitor 的关系**:
- USD Monitor 回答 "美元会怎么动"（γ = r_f + π_risk − cy + σ_alert）
- **Inflation Monitor 回答 "通胀会怎么动，以及四类资产会如何反应"**
- 两者可以共存、互相引用（InflationMonitor 的 IPS 评分可以作为 USD Monitor 的外生输入，反之 USD Monitor 的 FOMC 鹰鸽指数也是本看板 N 分项的关键输入）

**与 Gold Monitor 的关系**:
- Gold Monitor 单标的（XAUUSD）深度建模
- Inflation Monitor 是"因子源头"，下游接四个标的的方向信号，不做深度回测

### 1.2 核心公式

```
IPS (Inflation Pressure Score) = w_P·P + w_E·E + w_D·D + w_F·F + w_N·N
```

| 分项 | 名称 | 权重 | 含义 |
|------|------|------|------|
| **P** | Price Levels | 25% | 实际价格水平：CPI / Core CPI / PCE / Core PCE / PPI / Truflation |
| **E** | Expectations | 20% | 通胀预期：5Y/10Y BEI、Michigan、SPF、Fed SEP |
| **D** | Drivers | 20% | 驱动因子：油价、CRB、薪资、房租、美元、供应链压力 |
| **F** | Fiscal Impulse | 15% | 财政脉冲：赤字/GDP、TGA 余额、净发债、财政支出同比 |
| **N** | Narrative / Policy Reflection | 20% | 叙事+政策反射：FOMC 鹰鸽指数、官员发言分析、市场隐含路径、媒体叙事强度 |

> **权重约束**: 五个分项权重和 = 100%。w_P/w_E 偏重"事实与预期"，w_N/w_F 偏重"政策与叙事"，w_D 作为中介。

### 1.3 信号阈值（通胀体制分型）

| IPS 区间 | 通胀体制 | 简述 |
|--------|----------|------|
| **≥ 70** | 🔴 再加速 (Reflation Surge) | 驱动+预期同步上行，通胀风险阶段性支配 |
| **55 ~ 70** | 🟠 粘性通胀 (Sticky Inflation) | 核心项目 3m 年化 > 3%，服务与房租顽固 |
| **35 ~ 55** | 🟡 温和通胀 (Goldilocks) | 接近目标 2% 走廊，政策可耐心等待 |
| **20 ~ 35** | 🟢 通胀回落 (Disinflation) | 同比与环比同步放缓，预期收敛 |
| **< 20** | 🔵 通缩风险 (Deflation Risk) | 负通胀 + 预期崩塌，需要宽松应对 |

### 1.4 最终交付形态（双层输出）

**第一层 — 方向信号 (a)**:
四类资产（黄金 / 美元 / 美债 / 美股），每个给出 `BULLISH / NEUTRAL / BEARISH` 徽章 + 信心分（0-100）+ 一句话理由。

**第二层 — 场景化剧本 (c)**:
把当前 IPS 读数映射到四种"通胀体制"下四类资产的表现剧本，提供"如果切换到 X 体制 → 资产 Y 会怎样"的预案。

### 1.5 非功能诉求

- **数据刷新**: CPI/PCE 月度；BEI/油价/预期/鹰鸽打分日度；Truflation 分钟级 (v1.1)
- **响应式**: Desktop / Tablet / Mobile 三档
- **深色主题**: 与 USDMonitor / GoldMonitor 统一 (`#0a0e1a` 底 + 金色强调)
- **数据可追溯**: 每个因子都能点进去看原始序列图 + 权威来源链接

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 16 (App Router) | TypeScript, React 19 |
| UI | Tailwind CSS 4 | 深色主题复用 USDMonitor tokens |
| 图表 | Recharts + Canvas Gauge | 折线 / 堆叠柱 / 仪表盘 / 热力图 |
| 数据获取 | SWR | 5 分钟轮询 |
| 后端数据 | Python Pipeline | FRED + BLS + BEA + NY Fed + Truflation + 新闻 NLP |
| NLP | OpenAI / Claude API | FOMC 声明、官员发言、媒体标题鹰鸽打分 |
| 部署 | Vercel + GitHub Actions | 每日 + 事件触发更新 |
| 小程序 | 微信 WXML/WXSS | **v1.1 跟进**（本版本先搁置） |

### 2.2 目录结构

```
InflationMonitor/
├── PRD_InflationMonitor_v1.0.md        # 本文件
├── inflation-dashboard/                # Next.js 前端 (v1.0)
│   ├── app/
│   │   ├── page.tsx                    # 主页
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── fomc/page.tsx               # FOMC / 官员发言子页
│   │   ├── fiscal/page.tsx             # 财政脉冲子页
│   │   ├── narrative/page.tsx          # 叙事 / 媒体情绪子页
│   │   ├── scenarios/page.tsx          # 四情景剧本子页
│   │   └── api/
│   │       ├── score/route.ts          # IPS 综合评分
│   │       ├── components/route.ts     # P/E/D/F/N 五分项
│   │       ├── assets/route.ts         # 四资产方向信号
│   │       ├── scenarios/route.ts      # 四情景剧本数据
│   │       ├── fomc/route.ts           # FOMC 时间线 + 鹰鸽
│   │       ├── fiscal/route.ts         # 财政脉冲
│   │       ├── narrative/route.ts      # 媒体叙事指数
│   │       ├── prices/route.ts         # CPI/PCE/PPI 历史
│   │       ├── expectations/route.ts   # BEI/Michigan/SPF
│   │       └── history/route.ts        # IPS 信号历史
│   ├── components/
│   │   ├── layout/{Header,Footer,StatusBar}.tsx
│   │   ├── gauge/InflationGauge.tsx    # IPS 仪表盘 5 色区间
│   │   ├── cards/
│   │   │   ├── ComponentCard.tsx       # P/E/D/F/N 通用卡
│   │   │   ├── AssetSignalTower.tsx    # 四资产信号塔
│   │   │   ├── ScenarioPlaybook.tsx    # 情景切换剧本
│   │   │   ├── InflationTypeCard.tsx   # 通胀体制诊断
│   │   │   ├── FiscalPulseCard.tsx     # 财政脉冲
│   │   │   ├── NarrativeCard.tsx       # 叙事指数
│   │   │   └── FomcSummaryCard.tsx     # FOMC 摘要（嵌入主页）
│   │   ├── charts/
│   │   │   ├── InflationHistory.tsx    # IPS 评分 + CPI 双轴
│   │   │   ├── PriceDecomp.tsx         # 核心/非核心/食品/能源堆叠
│   │   │   ├── ExpectationsChart.tsx   # BEI 曲线 vs 实现通胀
│   │   │   ├── DriversHeatmap.tsx      # 驱动因子热力图
│   │   │   ├── FomcTimeline.tsx        # 借鉴 USDMonitor
│   │   │   └── FiscalImpulseChart.tsx
│   │   └── ui/{Badge,SubBar,DataRow,SignalChip}.tsx
│   ├── lib/
│   │   ├── useInflationData.ts         # SWR Hooks
│   │   └── readPipelineJson.ts
│   ├── data/mockData.ts
│   ├── types/index.ts
│   ├── public/
│   └── package.json / tsconfig.json / tailwind.config.ts
├── pipeline/                           # Python 后端 (v1.0 可后跟)
│   ├── fetch_data.py
│   ├── nlp_fomc.py                     # FOMC 声明 + 发言 NLP 鹰鸽打分
│   ├── nlp_narrative.py                # 新闻/社媒叙事强度
│   ├── scoring_P.py / scoring_E.py / scoring_D.py
│   ├── scoring_F.py / scoring_N.py
│   ├── asset_mapping.py                # IPS → 四资产信号
│   ├── scenarios.py                    # 四情景历史参照构造
│   ├── run_daily.py
│   └── output/*.json
└── miniprogram/                        # v1.1 占位
```

---

## 3. 页面模块设计

### 3.1 主页 — Dashboard (`/`)

页面自上而下分为 **7 个 section**：

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: 公式 IPS = P+E+D+F+N · 当前体制徽章 · 日期 · 综合评分        │
├──────────────────────────────────────────────────────────────────┤
│  Section 1 — EventInterceptor 事件拦截 (CPI/PCE/FOMC T-N 日)      │
├──────────────────────────────────────────────────────────────────┤
│  Section 2 — 通胀体制诊断 + 综合信号灯 (InflationTypeCard)         │
├──────────────────────────────────────────────────────────────────┤
│  Section 3 — 四资产信号塔 (AssetSignalTower) · 主视觉              │
│     · 黄金 / 美元 / 美债 / 美股 各一张卡 · 方向 + 置信度 + 一句话   │
├──────────────────────────────────────────────────────────────────┤
│  Section 4 — IPS 仪表盘 + 五分项进度条 + IPS 历史曲线                  │
├──────────────────────────────────────────────────────────────────┤
│  Section 5 — 五分项卡片 P / E / D / F / N (五张平铺)               │
├──────────────────────────────────────────────────────────────────┤
│  Section 6 — 场景化剧本预览 (ScenarioPlaybook) · 4 情景切换         │
├──────────────────────────────────────────────────────────────────┤
│  Section 7 — FOMC 摘要 + 信号历史时间线                            │
├──────────────────────────────────────────────────────────────────┤
│  StatusBar: 数据源状态 · 最后更新时间 · 警告数                      │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Header

| 元素 | 内容 |
|------|------|
| 公式 | `IPS = P + E + D + F + N` （金色） |
| 副标题 | Inflation Monitor · v1.0 |
| 日期 | 2026-04-21 · 16:00 ET |
| 综合评分 | `IPS = 62/100` |
| 体制徽章 | `🟠 粘性通胀` / `🔴 再加速` 等 |
| 子页导航 | FOMC / 财政 / 叙事 / 情景 |

### 3.3 Section 2 — 通胀体制诊断

参考 USD Monitor 的 `InflationTypeCard`。结构化呈现：

| 字段 | 值例 | 说明 |
|------|------|------|
| 主导类型 | **需求拉动型** | demand-pull / cost-push / wage-price / fiscal-driven |
| 驱动强度 | 68% | 当前主导通胀类型的贡献度 |
| 持久性 | 高 (6-9 月) | 基于 Core 粘性测算 |
| 对政策响应度 | 中等 | 若美联储收紧是否有效 |
| 历史锚点 | "1970s 粘性 + 2022 供给侧" | |

### 3.4 Section 3 — 四资产信号塔 (核心交付)

每张卡片结构：

```
┌────────────────────────────────────────────┐
│  🟡 黄金 XAU                               │
│  ──────────────────────────────────────── │
│  方向:  🟢 BULLISH              置信度 72  │
│  短评:  "粘性通胀 + 实际利率见顶,          │
│          做多黄金优先级最高"                │
│  ──────────────────────────────────────── │
│  通胀敏感性: ████░░ 0.72 (高)              │
│  当前驱动链: 服务粘性↑ → 实际利率→ 黄金↑    │
│  历史对比:   1970s × 0.62 相似度           │
│  风险:       若 FOMC 超鹰 → 短期回撤        │
│  建议仓位:   上调至 15-20% (中性 10%)       │
└────────────────────────────────────────────┘
```

**四资产参数表** (每类资产的"通胀反应函数")：

| 资产 | 与 CPI β (3Y) | 与 BEI β | 与 FOMC 鹰 β | 核心逻辑 |
|------|--------------|----------|-------------|---------|
| **黄金 XAU** | +0.4 ~ +0.7 | +0.55 | -0.35 | 实际利率/抗通胀双通道 |
| **美元 DXY** | ±（双向）| -0.2 | +0.6 | 紧缩预期利好 vs 滞胀利空 |
| **美债 UST (10Y 价格)** | -0.65 | -0.50 | -0.70 | 通胀与利率反向 |
| **美股 SPX** | -0.3（高通胀段）| -0.25 | -0.4 | 估值压力 > 盈利受益 |

> 这些 β 来自历史回归 + 人工专家修正，pipeline 每月更新一次。

### 3.5 Section 4 — IPS 仪表盘

- **270° 环形仪表盘** (Canvas)
- **五色区间**: 🔵蓝 (0-20) → 🟢绿 (20-35) → 🟡黄 (35-55) → 🟠橙 (55-70) → 🔴红 (70-100)
- **中心**: `IPS = 62` + 当前体制文字
- **左侧边栏**: P/E/D/F/N 五个水平进度条 + 占比标签
- **右侧**: `InflationHistory` 折线图，双轴：IPS 评分（左）+ CPI 同比（右虚线），时间范围 24 个月

### 3.6 Section 5 — 五分项卡片

#### 3.6.1 P — Price Levels（价格水平）

**子因子**:
| 子因子 | 数据源 | 权重 | 当前值例 |
|--------|--------|------|--------|
| CPI YoY | BLS: CPIAUCSL | 20% | 3.2% |
| Core CPI YoY | BLS: CPILFESL | 25% | 3.8% |
| PCE YoY | BEA: PCEPI | 15% | 2.9% |
| Core PCE YoY | BEA: PCEPILFE | 20% | 3.3% |
| PPI YoY | BLS: PPIACO | 10% | 2.1% |
| Truflation Index | Truflation API | 10% | 2.6% (实时) |

**卡片底部**: 堆叠柱状图 `PriceDecomp` — 核心 / 食品 / 能源 / 住房 四个成分对 CPI 同比的贡献。

#### 3.6.2 E — Expectations（通胀预期）

| 子因子 | 数据源 | 权重 |
|--------|--------|------|
| 5Y BEI | FRED: T5YIE | 25% |
| 10Y BEI | FRED: T10YIE | 25% |
| 5Y5Y Forward BEI | FRED: T5YIFR | 20% |
| Michigan 1Y | FRED: MICH | 15% |
| SPF 10Y Core PCE | Philly Fed SPF | 10% |
| Fed SEP 长期 | FOMC SEP | 5% |

**卡片底部**: 预期曲线图 `ExpectationsChart` — BEI 期限结构（1Y/2Y/5Y/10Y/5Y5Y），与同期实现通胀对比，`well-anchored` vs `unanchored` 状态灯。

#### 3.6.3 D — Drivers（驱动因子）

**子因子**:
| 子因子 | 数据源 | 作用方向 |
|--------|--------|----------|
| WTI 油价 YoY | Yahoo: CL=F | 能源通胀 |
| Brent 油价 YoY | Yahoo: BZ=F | 全球能源 |
| CRB 大宗指数 | FRED | 原材料广谱 |
| 平均时薪 YoY | BLS: AHETPI | 服务/工资通胀 |
| Zillow Rent YoY | Zillow API | 住房粘性（领先 Shelter 9-12 月）|
| DXY | Yahoo | 进口通胀（负相关）|
| NY Fed Supply Chain Pressure | NY Fed GSCPI | 供给侧压力 |

**卡片底部**: `DriversHeatmap` — 7 × 12 月热力图，单元格颜色 = z-score，一眼看出哪个驱动在加速。

#### 3.6.4 F — Fiscal Impulse（财政脉冲）★ 新增

**子因子**:
| 子因子 | 数据源 | 权重 | 作用逻辑 |
|--------|--------|------|----------|
| 赤字/GDP (12M rolling) | Treasury + BEA | 30% | 总需求刺激 → 通胀上行压力 |
| 财政支出 YoY | Treasury Daily Statement | 20% | 短期脉冲 |
| 净发债 (T-Bills) | Treasury | 15% | 流动性释放节奏 |
| TGA 余额变化 | Fed H.4.1 | 15% | TGA↓ = 流动性释放 |
| 财政乘数 (估计) | 内部估算 | 10% | 支出 → GDP 传导效率 |
| Reconciliation / 税改脉冲 | 国会预算办公室 CBO | 10% | 一次性冲击 |

**卡片底部**: `FiscalImpulseChart` — 近 24 月赤字/GDP 折线 + 重大财政事件标注（IRA、CHIPS、减税延期等）。

> **设计理由（Why fiscal?）**: 2020+ 的通胀复辟有强财政成分，纯货币视角会错过"财政主导"的隐患——这是 USDMonitor 圆桌讨论沉淀下来的关键共识。

#### 3.6.5 N — Narrative / Policy Reflection（叙事+政策反射）★ 新增

这是本看板**最差异化**的分项，细分为三个子模块：

**N.1 — FOMC 鹰鸽指数** (直接复用 USDMonitor 的 `FomcTimeline` 组件)
- 鹰鸽打分: `-2 (极鸽)` ~ `+2 (极鹰)`
- 数据: FOMC 声明、会议纪要、官员发言，用 GPT/Claude 做结构化打分
- 滚动 MA5 时序

**N.2 — 市场隐含通胀路径**
| 子因子 | 数据源 | 说明 |
|--------|--------|------|
| Fed Funds 期货曲线 | CME FedWatch | 市场定价降息时点 |
| OIS 曲线 | ICE BVAL | 隔夜指数掉期期限结构 |
| TIPS 收益率曲线 | FRED | 实际利率结构 |
| 2Y BEI vs 10Y BEI 差 | FRED | 通胀预期曲线形态 |

**N.3 — 媒体与社媒叙事强度**
| 子因子 | 数据源 | 权重 |
|--------|--------|------|
| 通胀新闻计数 (WSJ/FT/Bloomberg) | GDELT / 爬虫 | 30% |
| 通胀搜索指数 | Google Trends "inflation" | 20% |
| 社媒情绪 (Reddit / X) | Reddit API | 20% |
| 关键词共现 (滞胀/工资-物价/联储独立性) | NLP | 30% |

**卡片布局**: 三列小卡片（鹰鸽 / 市场路径 / 叙事指数）+ 底部摘要框。

> **设计理由（Why narrative?）**: 2022-2024 的经验是——通胀叙事本身会反哺通胀预期（自我实现）。单看 CPI 滞后 2-3 个月，必须用前瞻性的叙事信号对冲。

### 3.7 Section 6 — 场景化剧本 (ScenarioPlaybook)

**4 × 4 矩阵**，可切换 Tab：

| Tab | 条件 | 当前概率 |
|-----|------|---------|
| 🔴 再加速 | IPS ≥ 70，驱动+预期同步上行 | 15% |
| 🟠 粘性通胀 | 55 ≤ IPS < 70，核心服务粘性 | **52%** (当前) |
| 🟢 回落 | 20 ≤ IPS < 55，同环比放缓 | 28% |
| 🔵 通缩 | IPS < 20，负增长 | 5% |

每个 Tab 内容（以"粘性通胀"为例）：

```
┌─────────────────────────────────────────────────────────────┐
│  🟠 粘性通胀剧本 (52% 概率)                                  │
│  ──────────────────────────────────────────────────────── │
│  历史对照: 1967-1968、2006-2007、2022H2-2023H1             │
│  持续时长: 中位数 9 月                                      │
│  退出路径: (a) 需求破坏 60% | (b) 供给恢复 25% | (c) 结构性 15% │
│  ──────────────────────────────────────────────────────── │
│  资产表现 (历史年化，中位数):                                │
│    🟡 黄金:    +8% ~ +15%   ████████░░  Bullish             │
│    💵 美元:    ±3%          █████░░░░░  Neutral             │
│    📉 美债 10Y: -4% ~ +2%    ██░░░░░░░░  Bearish            │
│    📈 美股:    -2% ~ +6%    ████░░░░░░  Neutral-Bearish     │
│  ──────────────────────────────────────────────────────── │
│  建议配置 (vs 中性基准):                                    │
│    黄金: 15% (中性 10%) +5pp ↑                             │
│    美元现金: 15% 短端 T-Bill 锚定                            │
│    美债: 减配 —5pp, 集中短端                                │
│    美股: 中性偏低, 配高分红低估值                            │
│  ──────────────────────────────────────────────────────── │
│  关键风险: FOMC 意外鹰派 → 短期黄金回撤, 美元冲高             │
└─────────────────────────────────────────────────────────────┘
```

### 3.8 子页面

#### `/fomc` — FOMC / 官员发言深度页
- 完整 `FomcTimeline`（过去 90 日）
- 鹰鸽散点图（按 FOMC 委员分组，看鸽鹰阵营分布）
- 下次 FOMC 会议预期：点阵图 vs 市场曲线偏离度

#### `/fiscal` — 财政深度页
- 赤字 / GDP 3 年曲线
- 净发债日历（未来 4 周 T-Bill / Note / Bond 拍卖预告）
- 主要立法事件时间线（IRA / CHIPS / Tax Cuts）
- 与通胀的滞后相关性散点

#### `/narrative` — 叙事深度页
- 新闻词云 + 关键词趋势（滞胀 / 工资-物价螺旋 / 软着陆）
- Google Trends "inflation" vs CPI 同比双轴
- 社媒情绪 30 日趋势
- 重大"叙事翻转"事件标注

#### `/scenarios` — 情景深度页
- 四情景完整对比表（P/E/D/F/N 各分项在不同情景下的均值）
- 历史情景持续期分布箱型图
- 情景切换的转移概率矩阵（马尔可夫）

---

## 4. 数据源规划

### 4.1 FRED（免费 API）

| 数据 | Series ID | 用途 |
|------|-----------|------|
| CPI YoY | CPIAUCSL | P |
| Core CPI | CPILFESL | P |
| PCE | PCEPI | P |
| Core PCE | PCEPILFE | P |
| PPI | PPIACO | P |
| 5Y BEI | T5YIE | E |
| 10Y BEI | T10YIE | E |
| 5Y5Y Forward | T5YIFR | E |
| Michigan 1Y | MICH | E |
| TIPS 10Y | DFII10 | E, N |
| Fed Funds | FEDFUNDS | N |
| 2Y Treasury | DGS2 | N |
| 10Y Treasury | DGS10 | N |
| 平均时薪 | AHETPI | D |
| 失业率 | UNRATE | D (context) |
| CRB | PPICRM | D |
| DXY | DTWEXBGS | D |
| GSCPI | NY Fed GSCPI | D |

### 4.2 Yahoo Finance

| Ticker | 用途 |
|--------|------|
| CL=F / BZ=F | WTI / Brent 油价 (D) |
| ^VIX / ^MOVE | 风险 context |
| GC=F | 黄金 (资产信号验证) |
| DX-Y.NYB | 美元 (资产信号验证) |
| TLT / ^TNX | 美债代理 |
| ^GSPC | 美股 |

### 4.3 BLS / BEA / Treasury / Fed

| 数据 | 来源 | 频率 |
|------|------|------|
| CPI 详细分项（Shelter、Services less shelter） | BLS | 月 |
| PCE 详细分项 | BEA | 月 |
| 财政月报 (MTS) | Treasury Fiscal Data | 月 |
| Daily Treasury Statement | Treasury | 日 |
| TGA 余额 | Fed H.4.1 | 周 |
| 发债日历 | Treasury TreasuryDirect | 滚动 |
| Fed SEP（点阵图） | FOMC | 季度 |

### 4.4 第三方与 NLP

| 数据 | 来源 | 说明 |
|------|------|------|
| Truflation Index | Truflation API | 实时通胀代理 |
| CME FedWatch | CME 公开页面 | Fed Funds 期货曲线 |
| Zillow Rent Index | Zillow API | 住房通胀领先 |
| FOMC 声明全文 | federalreserve.gov | 爬虫 |
| 官员发言 | Fed 网站 RSS | 爬虫 |
| 新闻语料 | GDELT / 路透 | 叙事打分 |
| Google Trends | pytrends | 搜索指数 |
| FOMC / 发言鹰鸽打分 | Claude / GPT-4 | 结构化 NLP，0-shot 分类 |

---

## 5. 评分引擎（Python Pipeline）

### 5.1 P 分项（0-100）

```python
def score_P(cpi_yoy, core_cpi, pce, core_pce, ppi, truflation):
    # 以 2% 为中性锚，每 +1pp 加 10 分
    cpi_score        = normalize(cpi_yoy,        0, 6) * 100
    core_cpi_score   = normalize(core_cpi,       0, 6) * 100
    pce_score        = normalize(pce,            0, 6) * 100
    core_pce_score   = normalize(core_pce,       0, 6) * 100
    ppi_score        = normalize(ppi,            -3, 10) * 100
    truflation_score = normalize(truflation,     0, 6) * 100
    return (0.20*cpi_score + 0.25*core_cpi_score + 0.15*pce_score
            + 0.20*core_pce_score + 0.10*ppi_score + 0.10*truflation_score)
```

### 5.2 E 分项（0-100）

```python
def score_E(bei5, bei10, fwd5y5y, mich1y, spf10, sep_long):
    # 以 2% 为锚
    return (0.25*normalize(bei5, 1, 4)*100
          + 0.25*normalize(bei10, 1, 4)*100
          + 0.20*normalize(fwd5y5y, 1.5, 3.5)*100  # 长期锚定最关键
          + 0.15*normalize(mich1y, 1, 6)*100
          + 0.10*normalize(spf10, 1, 3)*100
          + 0.05*normalize(sep_long, 1.5, 2.5)*100)
```

### 5.3 D 分项（0-100）

```python
def score_D(oil_yoy, crb_yoy, wage_yoy, rent_yoy, dxy_yoy, gscpi):
    # DXY 反向（强美元 → 进口通胀下降 → 分数低）
    return (0.20*normalize(oil_yoy, -30, 60)*100
          + 0.15*normalize(crb_yoy, -20, 40)*100
          + 0.20*normalize(wage_yoy, 2, 6)*100
          + 0.20*normalize(rent_yoy, 0, 10)*100
          + 0.10*(100 - normalize(dxy_yoy, -10, 15)*100)
          + 0.15*normalize(gscpi, -2, 4)*100)
```

### 5.4 F 分项（0-100）— 财政脉冲

```python
def score_F(deficit_gdp, spending_yoy, net_issuance, tga_delta, fiscal_mult, reconcil):
    # 赤字/GDP 正常区间 2-4%，>6% 高压
    return (0.30*normalize(deficit_gdp, 0, 8)*100
          + 0.20*normalize(spending_yoy, 0, 15)*100
          + 0.15*normalize(net_issuance, 0, 2500)*100  # B USD
          + 0.15*normalize(-tga_delta, -500, 500)*100  # TGA 下降 = 释放
          + 0.10*normalize(fiscal_mult, 0.5, 1.5)*100
          + 0.10*normalize(reconcil, 0, 1)*100)
```

### 5.5 N 分项（0-100）— 叙事+政策反射

```python
def score_N(hawkdove_ma5, market_cut_pricing, narrative_index, search_trends, social_sentiment):
    """
    hawkdove_ma5       : [-2, 2]  鹰鸽滚动 MA5（鹰派 = 抗通胀意愿强 → 压制未来通胀, 但短期"政策紧缩 = 通胀已高"的信号）
    market_cut_pricing : 2026 年底市场隐含降息次数（降息多 = 市场预期通胀回落）
    narrative_index    : [0, 100] 媒体通胀关注度
    search_trends      : [0, 100] Google Trends
    social_sentiment   : [-1, 1]  Reddit/X 通胀担忧
    """
    # 注意符号：鹰派 MA5 上行 = 通胀已高 → N 分数上行
    hawk_score = normalize(hawkdove_ma5, -2, 2) * 100
    # 市场降息定价越多 → 通胀压力越低 → 反向
    market_score = (1 - normalize(market_cut_pricing, 0, 6)) * 100
    narrative_score = narrative_index  # 0-100
    trends_score = search_trends       # 0-100
    social_score = normalize(social_sentiment, -0.5, 0.5) * 100

    return (0.30*hawk_score
          + 0.25*market_score
          + 0.20*narrative_score
          + 0.15*trends_score
          + 0.10*social_score)
```

### 5.6 综合 IPS

```python
def pi_score(P, E, D, F, N):
    pi = 0.25*P + 0.20*E + 0.20*D + 0.15*F + 0.20*N
    return max(0, min(100, pi))

def regime_from_pi(pi):
    if pi >= 70: return "reflation_surge"
    if pi >= 55: return "sticky_inflation"
    if pi >= 35: return "goldilocks"
    if pi >= 20: return "disinflation"
    return "deflation_risk"
```

### 5.7 四资产信号映射

```python
ASSET_BETAS = {
    # (β_CPI, β_BEI, β_FOMC_hawk)
    "gold":  (0.55, 0.55, -0.35),
    "usd":   (0.15, -0.20, 0.60),
    "ust":   (-0.65, -0.50, -0.70),  # 10Y 价格
    "spx":   (-0.30, -0.25, -0.40),
}

REGIME_OVERRIDE = {
    "reflation_surge":   {"gold": "BULL", "usd": "BULL", "ust": "BEAR", "spx": "BEAR"},
    "sticky_inflation":  {"gold": "BULL", "usd": "NEU",  "ust": "BEAR", "spx": "NEU_BEAR"},
    "goldilocks":        {"gold": "NEU",  "usd": "NEU",  "ust": "NEU",  "spx": "BULL"},
    "disinflation":      {"gold": "BULL", "usd": "BEAR", "ust": "BULL", "spx": "BULL"},
    "deflation_risk":    {"gold": "BULL", "usd": "BEAR", "ust": "BULL", "spx": "BEAR"},
}

def asset_signal(asset, pi, regime, components):
    # 1) 先用 β 合成基准分
    b_cpi, b_bei, b_hawk = ASSET_BETAS[asset]
    raw = (b_cpi * components["P"]
         + b_bei * components["E"]
         + b_hawk * components["N"])
    # 2) 叠加 regime override 偏置
    bias = REGIME_OVERRIDE[regime][asset]
    # 3) 输出方向 + 置信度
    return {"direction": ..., "confidence": ..., "rationale": ...}
```

### 5.8 场景概率（马尔可夫）

```python
# 基于过去 20 年月度数据估算的转移矩阵
P_TRANS = [
    # from\to       Reflation Sticky Gold Disinf Defl
    [0.50, 0.35, 0.12, 0.03, 0.00],  # reflation_surge
    [0.15, 0.55, 0.25, 0.05, 0.00],  # sticky
    [0.05, 0.20, 0.60, 0.13, 0.02],  # goldilocks
    [0.02, 0.08, 0.35, 0.50, 0.05],  # disinflation
    [0.00, 0.02, 0.10, 0.28, 0.60],  # deflation
]
# 下月各情景概率 = 当前 state vector × P_TRANS
```

---

## 6. Pipeline JSON 输出规范

| 文件 | 内容 | 对应组件 |
|------|------|---------|
| `score.json` | IPS + 五分项 + regime + 时间戳 | Gauge, Header |
| `components.json` | P/E/D/F/N 子因子明细 | ComponentCard × 5 |
| `assets.json` | 四资产方向信号 | AssetSignalTower |
| `scenarios.json` | 四情景当前概率 + 剧本文本 + 历史表现 | ScenarioPlaybook |
| `fomc.json` | FOMC 时间线 + 鹰鸽 | FomcTimeline |
| `fiscal.json` | 财政脉冲序列 + 事件标注 | FiscalPulseCard |
| `narrative.json` | 叙事指数 + 词云 + 搜索趋势 | NarrativeCard |
| `prices.json` | CPI/PCE/PPI 24 月序列 + 分项 | PriceDecomp |
| `expectations.json` | BEI 曲线 + Michigan + SPF | ExpectationsChart |
| `drivers.json` | 驱动因子热力图数据 | DriversHeatmap |
| `history.json` | IPS 信号历史（90 日） | SignalTimeline |

示例 — `assets.json`:
```json
{
  "as_of": "2026-04-21",
  "pi_score": 62,
  "regime": "sticky_inflation",
  "assets": [
    {
      "key": "gold",
      "name_zh": "黄金",
      "ticker": "XAU",
      "direction": "BULLISH",
      "confidence": 72,
      "headline": "粘性通胀 + 实际利率见顶, 做多黄金优先级最高",
      "sensitivity": 0.72,
      "rationale_chain": "服务粘性↑ → 实际利率→ 黄金↑",
      "historical_analog": { "period": "1970s", "similarity": 0.62 },
      "risk": "若 FOMC 超鹰 → 短期回撤",
      "suggested_weight": { "current": 0.15, "neutral": 0.10, "delta_pp": 5 }
    },
    { "key": "usd", ... },
    { "key": "ust", ... },
    { "key": "spx", ... }
  ]
}
```

---

## 7. 响应式设计

| 断点 | 布局 |
|------|------|
| **Desktop ≥1280px** | 四资产信号塔 4 列；P/E/D/F/N 5 列（或 3+2） |
| **Tablet 768-1279px** | 资产塔 2×2；P/E/D/F/N 2+2+1 |
| **Mobile <768px** | 全部单列；仪表盘居中；情景 Tab 可滑动 |

---

## 8. 开发阶段

### Phase 1 — 前端 UI + Mock 数据（本版本起点）
- [ ] 项目初始化（Next.js 16 + Tailwind 4）
- [ ] 类型定义 `types/index.ts`
- [ ] Mock 数据 `data/mockData.ts`
- [ ] Header / Footer / StatusBar
- [ ] InflationGauge 五色仪表盘
- [ ] 四资产信号塔 AssetSignalTower
- [ ] P/E/D/F/N 五张 ComponentCard
- [ ] ScenarioPlaybook 四情景 Tab
- [ ] FomcSummaryCard（主页嵌入）+ `/fomc` 子页
- [ ] FiscalPulseCard + `/fiscal`
- [ ] NarrativeCard + `/narrative`
- [ ] `/scenarios` 深度页
- [ ] 深色主题 + 响应式适配

### Phase 2 — Python Pipeline
- [ ] FRED / BLS / BEA 数据拉取
- [ ] FOMC 声明 + 发言爬虫
- [ ] Claude/GPT 鹰鸽打分
- [ ] 新闻 + Trends 叙事打分
- [ ] 五分项评分引擎
- [ ] 四资产信号生成
- [ ] 情景概率（马尔可夫）
- [ ] JSON 输出 + GitHub Actions 日更

### Phase 3 — 前后端集成
- [ ] Next.js API Routes 接 pipeline JSON
- [ ] SWR Hooks 替换 Mock
- [ ] Vercel 部署

### Phase 4 — 小程序（v1.1）
- [ ] 主页简化版
- [ ] 资产信号塔 + 情景剧本
- [ ] FOMC 提醒推送

---

## 9. 与 USD Monitor 的协同

| 维度 | USD Monitor | Inflation Monitor |
|------|-------------|-------------------|
| 核心标的 | DXY | 通胀本身 + 四类资产 |
| 公式 | γ = r_f + π_risk − cy + σ_alert | IPS = P + E + D + F + N |
| FOMC | 有鹰鸽指数 | **复用** USDMonitor 的 FomcTimeline |
| 输出 | BULLISH/NEUTRAL/BEARISH（单标的） | 四资产方向 + 情景剧本 |
| 叙事 | 暂无 | **本看板首创** NLP 叙事强度 |
| 财政 | 暂无（隐含在 cy） | **本看板首创** 独立 F 分项 |
| 跨引用 | USD 看板可引用 IPS 的 N 分项 | 通胀看板可引用 USD γ 作为外生输入 |

---

## 10. 验收标准

1. 主页一屏内能看到 **IPS 评分 + 当前通胀体制 + 四资产方向信号**（不刷即见）
2. 五分项卡片内数字与子因子进度条一致，可点击下钻到原始序列图
3. 情景剧本 Tab 可切换，四情景概率和 = 100%
4. FOMC 时间线可展示最近 10 条事件 + 鹰鸽打分时序
5. 财政脉冲图与主要立法事件标注对齐
6. 叙事模块同时展示词云 / 趋势 / 情绪 / 鹰鸽四维度
7. 移动端布局无水平溢出，资产塔四张卡清晰可读
8. Pipeline 输出 JSON 后，前端无需代码改动即可读到真实数据

---

## 11. 设计风格

- **主色**: `#0a0e1a` 深蓝黑（与 USDMonitor/GoldMonitor 统一）
- **强调色**: 金色 `#fbbf24`（公式、IPS 评分）
- **体制色**: 🔵 `#3b82f6` / 🟢 `#10b981` / 🟡 `#eab308` / 🟠 `#f97316` / 🔴 `#ef4444`
- **信号色**: Bullish `#10b981` / Neutral `#64748b` / Bearish `#ef4444`
- **字体**: Inter（正文）+ JetBrains Mono（数据）
- **卡片**: 圆角 12px，细描边 `border-slate-800`，hover `border-slate-700`

---

## 12. 未来演进（v1.1+）

- 实时通胀（Truflation 分钟级接入）
- 四资产的联动回测（组合净值 + Sharpe）
- 用户自定义权重（让用户调整 P/E/D/F/N 的 w）
- 通胀预警推送（IPS 穿越阈值触发邮件/企微）
- 与 GoldMonitor 的 SHAP 归因联动（把 IPS 当做一个外生因子喂进 XGBoost）
- 小程序端完整实现

---

*本 PRD 遵循 USDMonitor 的文档规范，可作为 v1.0 开发的唯一参考。*
