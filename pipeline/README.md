# InflationMonitor · Pipeline

Python 端的数据获取 + 评分 + 输出 JSON. 前端 (`inflation-dashboard`) 的 API 路由直接读这些 JSON.

## 使用

```bash
cd InflationMonitor
python3 -m venv .venv && source .venv/bin/activate
pip install -r pipeline/requirements.txt

# 可选：把 FRED API key 放到环境变量（无 key 则 FRED 数据回落到 prior）
export FRED_API_KEY=xxxxxxxxxx

python -m pipeline.run_daily
```

输出：

```
pipeline/output/
├── score.json         # Π 综合评分 + 五分项
├── components.json    # P/E/D/F/N 子因子明细 (前端 ComponentCard 直接消费)
├── assets.json        # 四资产方向信号
├── scenarios.json     # 四情景剧本 + 转移概率
└── fomc.json          # FOMC 时间线 + 鹰鸽 (v1.0 静态)

inflation-dashboard/data/pipeline/   # 前端读取目录 (自动镜像)
```

## 模块

| 文件 | 职责 |
|------|------|
| `config.py`        | 权重、regime 阈值、FRED series / Yahoo ticker / 资产 β / Regime override |
| `fetch_data.py`    | FRED HTTP 拉取 + Yahoo chart API; 无 API key 时优雅失败 |
| `scoring.py`       | P/E/D/F/N 五分项评分；F/N 当前走 prior，后续接入爬虫/NLP |
| `asset_mapping.py` | Π → 四资产方向 / 置信度 / 建议仓位 |
| `scenarios.py`     | 四情景剧本 + 马尔可夫转移矩阵 |
| `nlp_fomc.py`      | FOMC/发言鹰鸽打分编排器 — 有 `_source_text` 的条目交给 Claude (v1.1), 否则回落到静态 |
| `nlp/`             | v1.1 NLP 层: `hawkdove.py` (结构化打分 + 缓存 rubric), `cache.py` (doc-hash 磁盘缓存), `client.py` (Anthropic SDK) |
| `run_daily.py`     | 日度入口，串起全流程并写 JSON |

## 已知: 本地代理 (Clash / Surge 等) 抓包的兼容问题

Python 通过本地 HTTP 代理访问外网时，连续多次请求 FRED / Yahoo 容易 `ReadTimeout`
或 `HTTP/2 INTERNAL_ERROR`——即便 shell 里 `curl` 同样的 URL 完全正常。我们做过的缓解:

- `Accept-Encoding: identity` (关掉 gzip)
- `Connection: close` (不复用 keep-alive)
- 改用 `curl --http1.1` 子进程 + 3 次重试 + 1.2s 请求间隔

在代理状态"好"的时候这些都有效；但代理偶尔会陷入一种"对 Python 派生的进程全部拒绝"
的奇怪状态。**推荐路径**: 把 pipeline 跑在 GitHub Actions / Vercel Cron 上 (干净网络)，
每日写入 `inflation-dashboard/data/pipeline/*.json` 并触发重新部署。本地开发时任何
分项 fetch 失败都会自动回落到 prior，前端照样跑，只是指标是静态的。

## Phase 2 TODO

- [ ] FRED API key 管理 (支持 `.env`)
- [ ] BLS / BEA / Treasury 拉取 (MTS, Daily Treasury Statement)
- [ ] Truflation 实时通胀接入
- [x] Claude 鹰鸽结构化打分 (Anthropic SDK + Pydantic + prompt cache) — `pipeline/nlp/hawkdove.py`
- [ ] FOMC 声明 + 官员发言爬虫 (federalreserve.gov) — 把文档全文填进 `_source_text`
- [ ] 新闻叙事指数 (GDELT 或自爬) + Google Trends
- [ ] Π `delta_1d` / `delta_7d` 计算 (需要历史快照存储)
- [ ] GitHub Actions 日度定时运行 + 事件触发更新
- [ ] 前端 API Route 改读 `data/pipeline/*.json`
