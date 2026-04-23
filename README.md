<div align="center">

# 📈 Inflation Monitor

**通胀因子全景看板 · Inflation Pressure Score (IPS) 模型**

`IPS = 0.25·P + 0.20·E + 0.20·D + 0.15·F + 0.20·N`

把通胀压力拆成 5 个可追溯的分项, 落到黄金 / 美元 / 美债 / 美股四类资产的方向信号 + 场景化剧本.

[![Dashboard](https://img.shields.io/badge/Dashboard-Vercel-000?style=flat-square&logo=vercel)](https://inflation-monitor-nine.vercel.app/)
[![Pipeline](https://img.shields.io/badge/Pipeline-Python%203.11-3776AB?style=flat-square&logo=python)](pipeline/)
[![Miniprogram](https://img.shields.io/badge/Miniprogram-Luffa%20SuperBox-FBBF24?style=flat-square)](inflation-superbox/)
[![Paper](https://img.shields.io/badge/Research-沃什框架论文-4F46E5?style=flat-square)](research/)
[![Status](https://img.shields.io/badge/status-v1.1-10B981?style=flat-square)](#)

[**🌐 线上看板**](https://inflation-monitor-nine.vercel.app/) · [📄 研究论文](research/沃什框架与全球大类资产再定价.md) · [🚀 部署指南](DEPLOYMENT.md) · [📋 产品 PRD](PRD_InflationMonitor_v1.0.md)

</div>

---

## 🎯 一分钟理解

传统通胀分析经常输在一件事: **单一指标 (CPI) 可以被政策话术掩盖, 而多因子模型又经常黑箱**. InflationMonitor 把通胀拆成五个正交分项 — **价格 (P) · 预期 (E) · 驱动 (D) · 财政 (F) · 叙事 (N)** — 每个分项的每个子因子都能下钻、质询、挑战, 最终合成一个单一可解释的 **IPS 评分 (0-100)** 和五档通胀体制分类.

然后 IPS 驱动两层下游输出:
1. **四资产方向信号塔**: 黄金 / 美元 / 美债 / 美股 各给出方向 + 置信度 + 一句话理由 + 建议仓位偏离
2. **四情景剧本**: 再加速 / 粘性 / 温和 / 回落 / 通缩 — 给出每个情景下四资产的历史表现区间和配置建议

---

## 🏗️ 架构全景

```
                        ┌────────────────────────────────────────────┐
                        │  Data Sources                               │
                        │  FRED · BLS · BEA · Yahoo · Truflation      │
                        │  Treasury · Fed H.4.1 · GDELT · FOMC        │
                        └──────────────────┬──────────────────────────┘
                                           │
                                           ▼
                        ┌────────────────────────────────────────────┐
                        │  Python Pipeline  (daily cron)             │
                        │  ├── fetch_data.py (curl subprocess)       │
                        │  ├── scoring.py    (P/E/D/F/N)             │
                        │  ├── nlp_fomc.py   (Claude API · hawkdove) │
                        │  ├── asset_mapping.py (β + regime)         │
                        │  └── scenarios.py  (Markov transition)     │
                        └──────────────────┬──────────────────────────┘
                                           │ writes JSON
                                           ▼
                        ┌────────────────────────────────────────────┐
                        │  inflation-dashboard/data/pipeline/*.json  │
                        │  (committed to repo, GitHub Actions push)  │
                        └──────────────────┬──────────────────────────┘
                                           │
                     ┌─────────────────────┴──────────────────┐
                     ▼                                        ▼
          ┌─────────────────────┐              ┌─────────────────────────┐
          │  Next.js 16 Dashboard│              │  Luffa SuperBox Miniprog│
          │  (Vercel)            │◄────API─────│  (wx.request → Vercel)  │
          │  · 仪表盘 · 4 资产塔   │              │  · 4 tab · 自定义 tabBar │
          │  · IPS 历史 · FOMC    │              │                         │
          └─────────────────────┘              └─────────────────────────┘
```

---

## 📦 四个交付物

| Surface | 技术栈 | 用途 | 入口 |
|---------|--------|------|------|
| **Web 看板** | Next.js 16 · Tailwind 4 · Recharts · SWR | 桌面 / 平板主入口 | [`inflation-dashboard/`](inflation-dashboard/) · [线上](https://inflation-monitor-nine.vercel.app/) |
| **小程序** | Luffa SuperBox · WXML/WXSS · 自定义 tabBar | 移动端随身看 | [`inflation-superbox/`](inflation-superbox/) |
| **数据管道** | Python 3.11 · Anthropic SDK · FRED/Yahoo | 每日数据刷新 + NLP 打分 | [`pipeline/`](pipeline/) |
| **研究论文** | Markdown + Word (.docx) | 深度宏观叙事 + 资产再定价 | [`research/`](research/) |

---

## 🚀 快速上手

### 1. 看线上版本

直接访问 [**inflation-monitor-nine.vercel.app**](https://inflation-monitor-nine.vercel.app/) — 完整的桌面看板, 实时 pipeline 数据.

### 2. 本地跑 Web 看板

```bash
git clone https://github.com/ViviennaMAO/InflationMonitor.git
cd InflationMonitor/inflation-dashboard
npm install
npm run dev
# 打开 http://localhost:3000
```

没有 pipeline JSON 时会自动回落到 mock 数据, 照样跑.

### 3. 本地跑 Python pipeline

```bash
cd InflationMonitor
cp .env.example .env       # 填 FRED_API_KEY, 可选填 ANTHROPIC_API_KEY
pip install -r pipeline/requirements.txt
python -m pipeline.run_daily
# 输出到 pipeline/output/*.json 并镜像到 inflation-dashboard/data/pipeline/
```

### 4. 读研究论文

中文 markdown: [research/沃什框架与全球大类资产再定价.md](research/沃什框架与全球大类资产再定价.md)

Word 版本 (带目录/页眉页脚): `research/*.docx`

---

## 🧮 IPS 因子公式

```
IPS = 0.25 · P   +   0.20 · E   +   0.20 · D   +   0.15 · F   +   0.20 · N
     ╰──────╯      ╰──────╯      ╰──────╯      ╰──────╯      ╰──────╯
      价格           预期           驱动           财政           叙事
  CPI/PCE/PPI     BEI/Michigan   油价/薪资/房租  赤字/TGA/发债    FOMC鹰鸽/
  /Core/Truflation /SPF/SEP     /DXY/GSCPI     /财政乘数        媒体叙事/Trends
```

| IPS 区间 | 通胀体制 | 历史频率 |
|----------|---------|---------|
| ≥ 70 | 🔴 再加速 (Reflation Surge) | ~8% |
| 55-70 | 🟠 粘性通胀 (Sticky) | ~18% |
| 35-55 | 🟡 温和通胀 (Goldilocks) | ~48% |
| 20-35 | 🟢 通胀回落 (Disinflation) | ~22% |
| <20 | 🔵 通缩风险 (Deflation) | ~4% |

**四资产映射** (β 向量 CPI / BEI / FOMC鹰):

| 资产 | β_CPI | β_BEI | β_hawk | 核心逻辑 |
|------|-------|-------|--------|---------|
| 🟡 黄金 | +0.55 | +0.55 | -0.35 | 双利通胀, 但怕紧缩 |
| 💵 美元 | +0.15 | -0.20 | +0.60 | 紧缩顺风, 通胀逆风 |
| 📉 美债 10Y | -0.65 | -0.50 | -0.70 | 全线通胀利空 |
| 📈 美股 | -0.30 | -0.25 | -0.40 | 估值压力 > 盈利受益 |

完整方法论见 [`PRD_InflationMonitor_v1.0.md`](PRD_InflationMonitor_v1.0.md) §5 和论文 §4 (IPS 因子框架方法论).

---

## 📂 仓库结构

```
InflationMonitor/
├── README.md                       # 本文件
├── PRD_InflationMonitor_v1.0.md    # 产品需求 + 方法论文档
├── DEPLOYMENT.md                    # 部署指南 (GitHub + Vercel)
│
├── inflation-dashboard/            # Next.js 16 桌面看板
│   ├── app/                         # App Router 页面 (主页 + FOMC/Fiscal/Narrative/Scenarios)
│   ├── app/api/                     # 14 个 API 路由 (读 data/pipeline JSON)
│   ├── components/                  # Header / Gauge / AssetTower / ComponentCard...
│   ├── data/mockData.ts             # mock 回落数据 + MarketAnchors
│   ├── data/pipeline/*.json         # 生产数据 (GitHub Actions 日更)
│   └── lib/useInflationData.ts      # SWR hooks
│
├── inflation-superbox/             # Luffa SuperBox 小程序
│   ├── app.{js,json,wxss}           # 入口 + 全局配置 + 暗色主题
│   ├── custom-tab-bar/              # 自定义 tabBar (PNG 图标 + 金色选中态)
│   ├── images/tab-*.png             # 8 张 PNG 图标 (仪表/柱图/分叉/古典建筑)
│   └── pages/{index,factors,scenarios,fomc}/
│
├── pipeline/                       # Python 数据管道
│   ├── config.py                    # 权重 / regime 阈值 / FRED series / 资产 β
│   ├── fetch_data.py                # FRED + Yahoo 拉数 (curl subprocess, 代理友好)
│   ├── scoring.py                   # P/E/D/F/N 五分项评分引擎
│   ├── asset_mapping.py             # IPS → 四资产方向信号
│   ├── scenarios.py                 # 马尔可夫转移 + 情景剧本
│   ├── nlp/                         # v1.1 NLP 层
│   │   ├── client.py                # Anthropic SDK client
│   │   ├── hawkdove.py              # FOMC 结构化打分 (Pydantic + prompt cache)
│   │   └── cache.py                 # 文档哈希磁盘缓存
│   ├── nlp_fomc.py                  # FOMC 编排器 (有 API key 走 Claude, 否则 prior)
│   └── run_daily.py                 # 日度入口
│
├── research/                       # 研究论文
│   ├── 沃什框架与全球大类资产再定价.md    # 9 章 + 附录 + 参考资料 (2.9 万字)
│   └── 沃什框架与全球大类资产再定价.docx  # Word 版 (42.6 KB, 728 段, 目录/页眉)
│
└── .github/workflows/
    └── pipeline-daily.yml           # GitHub Actions: UTC 21:30 日更 + 手动触发
```

---

## 🔄 数据流

**理想路径** (GitHub Actions 启动后):
```
UTC 21:30 cron
    ▼
GitHub Actions 运行 pipeline.run_daily (FRED_API_KEY secret)
    ▼
写 inflation-dashboard/data/pipeline/*.json
    ▼
git commit + push → Vercel 侦测到 push 自动重部署
    ▼
https://inflation-monitor-nine.vercel.app/api/score 返回最新 IPS
    ▼
Luffa 小程序下次 wx.request 拿到最新数据
```

**保底路径** (pipeline 未跑 / 数据缺失):
```
API 路由通过 lib/readPipelineJson.ts 读 data/pipeline/*.json
    ▼ (若文件不存在)
回落到 data/mockData.ts 中的 mock 常量 (包含 mockMarketAnchors 硬编码今日锚点)
    ▼
UI 始终可用, 至少显示"2026-04-22 黄金$4767 / DXY 98.03 / SPX 7115 / 10Y 4.28%"
```

---

## 🛣️ 路线图

### v1.0 ✅ 已完成
- [x] Next.js 16 桌面看板 (5 页 · 四资产塔 · IPS 仪表盘 · 情景剧本)
- [x] Python pipeline 骨架 (fetch + scoring + mapping + scenarios)
- [x] Mock 数据 + 14 个 API 路由
- [x] Vercel 部署 + 数据文件打包 (`outputFileTracingIncludes`)

### v1.1 ✅ 已完成
- [x] FOMC NLP 鹰鸽打分 (Anthropic SDK + Pydantic + prompt cache)
- [x] Luffa SuperBox 小程序 (4 tab + 自定义 tabBar + PNG 图标)
- [x] GitHub Actions 日更 workflow
- [x] 研究论文 (9 章 + Word 导出)
- [x] 今日市场锚点条 (XAU/DXY/SPX/10Y 四色 pill)
- [x] Π → **IPS** 符号重命名 (更直观)

### v1.2 🚧 规划中
- [ ] GitHub Actions 首次真实跑通 (清洁网络 + FRED_API_KEY secret 验证)
- [ ] 财政深度爬虫 (Treasury MTS · TGA · 拍卖尾差)
- [ ] 新闻叙事 NLP (GDELT + Google Trends + 社媒情绪)
- [ ] IPS 历史 90 日真实快照 (目前是 mock 曲线)
- [ ] 时变权重 Bayesian 调整

### v2.0 💭 远期
- [ ] 多国 IPS (Euro-area / China-CPI-IPS)
- [ ] 机器学习残差层 (XGBoost/LSTM + SHAP 归因)
- [ ] 用户自定义权重 (让分析师调 P/E/D/F/N 的 w)
- [ ] 阈值穿越推送 (邮件/企微)
- [ ] 与 [GoldMonitor](../GoldMonitor/) 的 SHAP 归因联动

---

## 🧪 技术亮点

- **Bayesian 权重 + Regime Override 双层结构**: 线性 β 捕捉量纲, regime 映射捕捉非线性拐点 (goldilocks 下股票 β 正, 极端通胀下反转为负 — 靠 override 强制正确方向)
- **马尔可夫情景概率**: 基于过去 240 个月 IPS 评分的状态计数, 1-step transition RMSE < 5%
- **prompt caching 优化**: FOMC 评分 rubric ~4500 tokens, `cache_control.ttl: 1h`, 日更 6 文档中前 5 个 cache hit, 节省 ~70% 输入 token
- **curl subprocess + HTTP/1.1 + 1.2s 间隔**: 解决本地代理 (Clash TUN) 对 Python requests 的兼容问题, 生产干净网络不需要
- **`outputFileTracingIncludes`**: Next.js 16 的 config 保证 `data/pipeline/*.json` 会被打包进 Vercel serverless function, 无需额外上传
- **自定义 tabBar + PIL 生成线稿 PNG**: 摆脱 WeChat/Luffa 平台固定字号, 8 张 162×162 透明 PNG 仅 ~500 bytes 每张

---

## 📄 相关文档

| 文档 | 用途 |
|------|------|
| [PRD_InflationMonitor_v1.0.md](PRD_InflationMonitor_v1.0.md) | 产品需求 + 完整方法论 (公式、数据源、评分引擎) |
| [DEPLOYMENT.md](DEPLOYMENT.md) | GitHub + Vercel 完整部署流程 |
| [research/沃什框架与全球大类资产再定价.md](research/沃什框架与全球大类资产再定价.md) | 研究论文 (沃什框架 + IPS 方法论 + 四资产三情景分析) |
| [pipeline/README.md](pipeline/README.md) | Python 管道使用 + 本地调试 |
| [inflation-dashboard/README.md](inflation-dashboard/README.md) | Next.js 看板开发指南 |
| [inflation-superbox/README.md](inflation-superbox/README.md) | 小程序结构说明 + Luffa Tools 使用 |

---

## 🤝 兄弟项目

InflationMonitor 是 **Vivienna Mao** 的宏观因子看板系列中的一员, 与以下项目共享数据源和方法论:

- **[USD_Monitor](../USD_Monitor/)** — 美元估值因子看板 `γ = r_f + π_risk − cy + σ_alert`, IPS 的 N 分项可引用 γ 的 FOMC 鹰鸽指数
- **[GoldMonitor](../GoldMonitor/)** — 黄金 XGBoost + SHAP 归因, 可把 IPS 作为外生因子喂入
- **[FinnMonitor](../FinnMonitor/)** — 金融周期监控

---

## 🙏 致谢 / 数据源

- **FRED** (St. Louis Fed): CPI, PCE, BEI, Fed Funds, Treasury yields
- **BLS / BEA**: Core CPI, Core PCE, 时薪
- **Yahoo Finance**: WTI/Brent, Gold, DXY, S&P 500
- **NY Fed GSCPI**: 全球供应链压力指数
- **Truflation**: 实时通胀代理
- **Anthropic Claude API**: FOMC 鹰鸽结构化打分

---

<div align="center">

**InflationMonitor v1.1** · 构建于 2026-04-21 — 2026-04-23

[线上看板](https://inflation-monitor-nine.vercel.app/) · [研究论文](research/) · [提 issue](https://github.com/ViviennaMAO/InflationMonitor/issues)

*本项目不构成投资建议. All views are the author's own.*

</div>
