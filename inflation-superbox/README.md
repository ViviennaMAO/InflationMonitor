# InflationMonitor · Luffa SuperBox

通胀因子看板的 Luffa SuperBox 小程序版本. 数据源 = 已部署的 Vercel Next.js 后端 (`https://inflation-monitor-nine.vercel.app/api`).

## 项目结构

```
inflation-superbox/
├── app.js / app.json / app.wxss    # 入口 + 全局配置 + 暗色主题
├── project.config.json              # LuffaTools 配置
├── sitemap.json
├── utils/
│   ├── api.js                       # wx.request 封装, 指向 Vercel API
│   └── util.js                      # 格式化 + 体制/方向/鹰鸽 meta
└── pages/
    ├── index/                       # 看板: Π 评分 + 四资产信号塔 + 体制诊断
    ├── factors/                     # 因子: P/E/D/F/N 五分项明细
    ├── scenarios/                   # 情景: 四情景剧本切换 + 建议配置
    └── fomc/                        # FOMC: 鹰鸽指数 + 声明/发言时间线
```

## 使用

1. 用 **Luffa SuperBox 开发者工具** 打开 `inflation-superbox/` 目录
2. 确认 `app.js` 里 `apiBase` 指向你实际的 Vercel 部署域名
3. 在开发者工具里预览 / 上传

## Tab 设计

| Tab | 内容 | 主要 API |
|-----|------|---------|
| 看板 | Π 综合分 + 体制徽章 + 四资产信号塔 + 通胀类型诊断 | `/score` `/assets` `/diagnosis` |
| 因子 | P (价格) / E (预期) / D (驱动) / F (财政) / N (叙事) 五分项 + 子因子进度条 | `/components` |
| 情景 | 四情景 (再加速 / 粘性 / 温和 / 回落 / 通缩) Tab 切换, 各情景历史表现 + 建议配置 + 关键风险 | `/scenarios` |
| FOMC | 当前利率 / 点阵图 / 下次会议 / 鹰鸽 MA5 + 声明&发言时间线 + v1.1 NLP 理由 | `/fomc` |

## 设计风格

与 Next.js 网页端完全一致:
- 背景 `#050810`, 卡片 `linear-gradient(…rgba(15,23,42,.95), rgba(10,14,26,.95))`
- 强调色金色 `#FBBF24` (公式 / Π 评分)
- 体制五色: 🔴 再加速 / 🟠 粘性 / 🟡 温和 / 🟢 回落 / 🔵 通缩
- 资产方向五色: 看多 (绿) / 偏多 / 中性 / 偏空 / 看空 (红)

## 下一步 (v1.1+)

- [ ] 底部 Tab 图标 (`images/icon-*.png`) — 目前 tabBar 只用文字
- [ ] Canvas 绘制 Π 仪表盘 (参考 USD_Monitor 的 gaugeCanvas)
- [ ] 事件拦截卡 (CPI/PCE/FOMC 日历)
- [ ] 叙事热词云 + Google Trends 图
