# InflationMonitor · 部署指南

本文档描述如何把 InflationMonitor 部署到 **Vercel** (前端) + **GitHub Actions** (日度数据刷新)。

> 架构: GitHub Actions 每日跑 Python pipeline → 把 JSON 提交回 main 分支 → Vercel 自动重新部署 → 网站显示最新数据。

---

## 1. 初始化 Git 仓库 (如果还没推到 GitHub)

```bash
cd /Users/vivienna/Desktop/VibeCoding/InflationMonitor
git init
git add -A
git commit -m "feat: InflationMonitor v1.0 — dashboard + pipeline + deploy config"

# 在 GitHub 上创建 repo 后：
git remote add origin git@github.com:<your-username>/InflationMonitor.git
git push -u origin main
```

**重要**: `.env` 已在 `.gitignore` 里，不会把 FRED key 泄漏到 repo。

---

## 2. 配置 GitHub Actions Secret

把 FRED API key 存到 GitHub Actions 作为 secret：

1. GitHub repo → Settings → Secrets and variables → Actions → **New repository secret**
2. Name: `FRED_API_KEY`, value: `6060765156e13c928200d3eeab885e01` (你当前的 key)
3. **(可选)** Name: `ANTHROPIC_API_KEY`, value: 你的 Claude API key — 启用 v1.1 FOMC 鹰鸽 NLP 打分. 不配这条 pipeline 也能跑, 只是 FOMC 打分回落到静态值.

Workflow 文件: [`.github/workflows/pipeline-daily.yml`](.github/workflows/pipeline-daily.yml)

**调度**:
- 自动: 每天 UTC 21:30 (美东 16:30 / 北京次日 05:30)
- 手动: Actions → "Pipeline · Daily Data Refresh" → Run workflow

---

## 3. 部署到 Vercel

### 3.1 首次导入项目

1. 登录 https://vercel.com → New Project → Import Git Repository → 选中你的 InflationMonitor repo
2. **关键配置**:
   - **Root Directory**: `inflation-dashboard` *(不是 repo 根目录!)*
   - **Framework Preset**: Next.js (会自动识别)
   - **Build Command**: `npm run build` (默认)
   - **Output Directory**: `.next` (默认)
   - **Install Command**: `npm install` (默认)
3. 点 Deploy

### 3.2 环境变量 (前端用)

前端 API 路由当前不需要任何 env var (它只是读文件系统). 所以 Vercel 侧 **无需配置**任何 env var.

如果后续接入 NLP / Claude API，可以在 Vercel → Project → Settings → Environment Variables 里加 `ANTHROPIC_API_KEY` 等。

### 3.3 自动重部署

每次 GitHub Actions 把新 JSON commit 到 main，Vercel 会自动触发新部署。**不需要配 webhook**，Vercel 原生监听 Git push。

---

## 4. 本地开发 vs 生产对齐

| 场景 | 数据来源 |
|------|---------|
| 本地开发 (`npm run dev`) | 若 `inflation-dashboard/data/pipeline/*.json` 存在则读它, 否则用 `data/mockData.ts` |
| 本地跑 pipeline (`python -m pipeline.run_daily`) | 拉 FRED+Yahoo, 写 `pipeline/output/*.json` **和** `inflation-dashboard/data/pipeline/*.json` |
| 生产 (Vercel) | 读 `data/pipeline/*.json` (GitHub Actions 日更) |

`next.config.ts` 里 `outputFileTracingIncludes` 保证了这些 JSON 会被打包进 serverless function, `fs.readFileSync` 在生产环境能正确命中。

---

## 5. 常见坑

### 5.1 GitHub Actions 首次跑成功但没触发 Vercel 重部署？

Vercel 默认会忽略 **仅 data 变更的 commit** 吗? 不会 — 只要 push 到连接的分支, Vercel 就会 build.

检查: Vercel → Project → Settings → Git → 确认 "Production Branch" = main，且 "Ignored Build Step" 没配排除规则。

### 5.2 pipeline 在 Actions 里挂了 (FRED 超时)?

GitHub Actions 的 runner (Azure 网络) 访问 FRED / Yahoo 非常稳. 如果真挂了, pipeline 会 graceful 回落到 prior, 站点仍然显示上次的数据. 多次连续失败就去 Actions 日志看具体哪个 series 挂了.

### 5.3 想看 Vercel 是不是真的读到 pipeline JSON?

访问 `https://<your-domain>/api/score` 手动拉一下, `pi` 字段不是 62 (mock) 就说明是 pipeline 数据了.

---

## 6. 后续 (v1.1)

- [ ] 接入 Claude API 做 FOMC NLP 鹰鸽打分 → Actions secret 里加 `ANTHROPIC_API_KEY`
- [ ] 接入新闻 / GDELT 叙事指数
- [ ] 接入 Truflation 实时通胀 (需要 API key)
- [ ] 小程序端 (参考 USD_Monitor 的 miniprogram)
- [ ] 历史快照: pipeline 把每日 score 追加到一个长期表, 用于 IPS 90 日趋势图的真实数据
