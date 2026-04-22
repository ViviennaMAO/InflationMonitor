import type {
  InflationScore, ComponentDetail, AssetSignalBundle, ScenarioBundle,
  InflationDiagnosis, FomcBundle, FiscalBundle, NarrativeBundle,
  PriceDecompEntry, ExpectationsBundle, InflationHistoryEntry,
  SignalTimelineEntry, EventWindow,
} from '@/types';

// ───────── Π 综合评分 ─────────
export const mockScore: InflationScore = {
  as_of: '2026-04-21',
  pi: 62,
  regime: 'sticky_inflation',
  components: { P: 58, E: 52, D: 68, F: 74, N: 65 },
  delta_1d: +1.2,
  delta_7d: -0.8,
};

// ───────── 五分项明细 ─────────
export const mockComponents: ComponentDetail[] = [
  {
    key: 'P',
    label: 'Price Levels',
    label_zh: '价格水平',
    score: 58,
    weight: 0.25,
    headline: 'Core CPI 3.8% 仍高于目标，服务与住房粘性顽固',
    sub_factors: [
      { key: 'cpi',        label: 'CPI YoY',        value: 3.2, unit: '%', weight: 0.20, score: 60, tone: 'push' },
      { key: 'core_cpi',   label: 'Core CPI YoY',   value: 3.8, unit: '%', weight: 0.25, score: 68, tone: 'push' },
      { key: 'pce',        label: 'PCE YoY',        value: 2.9, unit: '%', weight: 0.15, score: 55, tone: 'push' },
      { key: 'core_pce',   label: 'Core PCE YoY',   value: 3.3, unit: '%', weight: 0.20, score: 62, tone: 'push' },
      { key: 'ppi',        label: 'PPI YoY',        value: 2.1, unit: '%', weight: 0.10, score: 42, tone: 'neutral' },
      { key: 'truflation', label: 'Truflation',     value: 2.6, unit: '%', weight: 0.10, score: 48, tone: 'neutral' },
    ],
    annotation: 'Headline CPI 受能源拖累回落，但 Core 持续高于目标，服务项 3m 年化 3.2%。',
  },
  {
    key: 'E',
    label: 'Expectations',
    label_zh: '通胀预期',
    score: 52,
    weight: 0.20,
    headline: '长期 BEI 锚定良好，短期 Michigan 有上行风险',
    sub_factors: [
      { key: 'bei5',      label: '5Y BEI',             value: 2.35, unit: '%', weight: 0.25, score: 55, tone: 'neutral' },
      { key: 'bei10',     label: '10Y BEI',            value: 2.40, unit: '%', weight: 0.25, score: 50, tone: 'neutral' },
      { key: 'fwd5y5y',   label: '5Y5Y Forward',       value: 2.45, unit: '%', weight: 0.20, score: 48, tone: 'neutral' },
      { key: 'mich1y',    label: 'Michigan 1Y',        value: 3.80, unit: '%', weight: 0.15, score: 62, tone: 'push' },
      { key: 'spf10',     label: 'SPF 10Y Core PCE',   value: 2.20, unit: '%', weight: 0.10, score: 42, tone: 'neutral' },
      { key: 'sep_long',  label: 'Fed SEP 长期',       value: 2.00, unit: '%', weight: 0.05, score: 35, tone: 'suppress' },
    ],
    annotation: '预期仍然 well-anchored，但 Michigan 家庭端有脱锚迹象需警惕。',
  },
  {
    key: 'D',
    label: 'Drivers',
    label_zh: '驱动因子',
    score: 68,
    weight: 0.20,
    headline: '油价 + 工资双推升，住房粘性延后回落',
    sub_factors: [
      { key: 'wti',       label: 'WTI YoY',            value: +18, unit: '%', weight: 0.20, score: 72, tone: 'push' },
      { key: 'crb',       label: 'CRB YoY',            value: +9,  unit: '%', weight: 0.15, score: 60, tone: 'push' },
      { key: 'wage',      label: 'AHE YoY',            value: 4.1, unit: '%', weight: 0.20, score: 70, tone: 'push' },
      { key: 'rent',      label: 'Zillow Rent YoY',    value: 4.8, unit: '%', weight: 0.20, score: 75, tone: 'push' },
      { key: 'dxy',       label: 'DXY YoY',            value: -2,  unit: '%', weight: 0.10, score: 58, tone: 'push' },
      { key: 'gscpi',     label: 'NY Fed GSCPI',       value: -0.3, unit: '',  weight: 0.15, score: 40, tone: 'neutral' },
    ],
    annotation: '供应链压力指数中性，但工资—房租传导链尚未断裂。',
  },
  {
    key: 'F',
    label: 'Fiscal Impulse',
    label_zh: '财政脉冲',
    score: 74,
    weight: 0.15,
    headline: '赤字 6.3% 高位，TGA 释放叠加发债扩张',
    sub_factors: [
      { key: 'deficit',     label: '赤字/GDP',           value: 6.3, unit: '%', weight: 0.30, score: 78, tone: 'push' },
      { key: 'spending',    label: '财政支出 YoY',       value: 8.5, unit: '%', weight: 0.20, score: 72, tone: 'push' },
      { key: 'net_issue',   label: '净发债 (M)',         value: 1800, unit: 'B', weight: 0.15, score: 80, tone: 'push' },
      { key: 'tga',         label: 'TGA Δ',              value: -220, unit: 'B', weight: 0.15, score: 75, tone: 'push' },
      { key: 'mult',        label: '财政乘数',           value: 0.9, unit: '',  weight: 0.10, score: 60, tone: 'neutral' },
      { key: 'reconcil',    label: '税改/调解脉冲',      value: 0.4, unit: '',  weight: 0.10, score: 55, tone: 'neutral' },
    ],
    annotation: '财政"暗刺激"仍在运行——单看货币视角会低估通胀韧性。',
  },
  {
    key: 'N',
    label: 'Narrative / Policy Reflection',
    label_zh: '叙事+政策反射',
    score: 65,
    weight: 0.20,
    headline: '鹰鸽转中性偏鹰，叙事热度回升，滞胀关键词 +32%',
    sub_factors: [
      { key: 'hawk',       label: 'FOMC 鹰鸽 MA5',      value: 0.6, unit: 'σ', weight: 0.30, score: 68, tone: 'push' },
      { key: 'mkt_cut',    label: '市场隐含降息次数',   value: 2.1, unit: '次', weight: 0.25, score: 55, tone: 'neutral' },
      { key: 'narrative',  label: '媒体通胀指数',       value: 72,  unit: '',  weight: 0.20, score: 72, tone: 'push' },
      { key: 'trends',     label: 'Google Trends',      value: 68,  unit: '',  weight: 0.15, score: 68, tone: 'push' },
      { key: 'social',     label: '社媒情绪',           value: 0.25, unit: '',  weight: 0.10, score: 62, tone: 'push' },
    ],
    annotation: '媒体与市场共同强化"粘性通胀"叙事，自我实现风险升温。',
  },
];

// ───────── 四资产信号 ─────────
export const mockAssets: AssetSignalBundle = {
  as_of: '2026-04-21',
  pi_score: 62,
  regime: 'sticky_inflation',
  assets: [
    {
      key: 'gold', name_zh: '黄金', ticker: 'XAU', emoji: '🟡',
      direction: 'BULLISH', confidence: 72,
      headline: '粘性通胀 + 实际利率见顶，做多黄金优先级最高',
      sensitivity: 0.72,
      rationale_chain: '服务粘性↑ → 实际利率→ 黄金↑',
      historical_analog: { period: '1970s', similarity: 0.62 },
      risk: '若 FOMC 超鹰 → 短期回撤',
      suggested_weight: { current: 0.15, neutral: 0.10, delta_pp: +5 },
      beta: { cpi: 0.55, bei: 0.55, fomc_hawk: -0.35 },
    },
    {
      key: 'usd', name_zh: '美元', ticker: 'DXY', emoji: '💵',
      direction: 'NEUTRAL', confidence: 48,
      headline: '紧缩预期支撑 vs 滞胀担忧拖累，方向胶着',
      sensitivity: 0.35,
      rationale_chain: 'FOMC 鹰→ 利差扩 → 美元+ | 滞胀→ 美元-',
      historical_analog: { period: '1979-1980', similarity: 0.41 },
      risk: '若外部风险事件 → 避险飞涨',
      suggested_weight: { current: 0.15, neutral: 0.15, delta_pp: 0 },
      beta: { cpi: 0.15, bei: -0.20, fomc_hawk: 0.60 },
    },
    {
      key: 'ust', name_zh: '美债 10Y', ticker: 'UST', emoji: '📉',
      direction: 'BEARISH', confidence: 66,
      headline: '实际利率高位 + 供给压力，长端价格承压',
      sensitivity: 0.68,
      rationale_chain: 'CPI 粘性→ 实际利率 → UST 价格↓',
      historical_analog: { period: '2022-2023', similarity: 0.78 },
      risk: '避险事件 → 短期反弹',
      suggested_weight: { current: 0.20, neutral: 0.25, delta_pp: -5 },
      beta: { cpi: -0.65, bei: -0.50, fomc_hawk: -0.70 },
    },
    {
      key: 'spx', name_zh: '美股 S&P', ticker: 'SPX', emoji: '📈',
      direction: 'NEU_BEAR', confidence: 52,
      headline: '盈利受益部分抵消估值压力，警惕利率敏感板块',
      sensitivity: 0.45,
      rationale_chain: '通胀粘性→ 估值多头 + 盈利↑（能源/金融）',
      historical_analog: { period: '2022H2', similarity: 0.56 },
      risk: 'Breadth 恶化 + 高估值科技股回撤',
      suggested_weight: { current: 0.40, neutral: 0.45, delta_pp: -5 },
      beta: { cpi: -0.30, bei: -0.25, fomc_hawk: -0.40 },
    },
  ],
};

// ───────── 通胀体制诊断 ─────────
export const mockDiagnosis: InflationDiagnosis = {
  as_of: '2026-04-21',
  dominant_type: 'wage_price',
  dominant_weight: 0.42,
  breakdown: [
    { type: 'wage_price',    weight: 0.42 },
    { type: 'fiscal_driven', weight: 0.28 },
    { type: 'demand_pull',   weight: 0.18 },
    { type: 'cost_push',     weight: 0.12 },
  ],
  persistence: 'high',
  duration_estimate_months: 9,
  policy_responsiveness: 'medium',
  historical_anchor: '1970s 粘性 + 2022 供给侧混合',
};

// ───────── 四情景剧本 ─────────
export const mockScenarios: ScenarioBundle = {
  as_of: '2026-04-21',
  current_regime: 'sticky_inflation',
  transition_next_month: {
    reflation_surge: 0.15,
    sticky_inflation: 0.52,
    goldilocks: 0.23,
    disinflation: 0.08,
    deflation_risk: 0.02,
  },
  scenarios: [
    {
      key: 'reflation_surge',
      label: '再加速',
      emoji: '🔴',
      probability: 0.15,
      is_current: false,
      description: '驱动 + 预期同步上行，通胀风险阶段性支配市场。',
      historical_analog: ['1973-1974', '1979-1980', '2021H2'],
      median_duration_months: 8,
      exit_paths: [
        { path: '需求破坏（衰退）', weight: 0.45 },
        { path: '紧缩过度', weight: 0.35 },
        { path: '供给恢复', weight: 0.20 },
      ],
      performance: [
        { asset: 'gold', return_range: [12, 25],  direction: 'BULLISH' },
        { asset: 'usd',  return_range: [2, 8],    direction: 'NEU_BULL' },
        { asset: 'ust',  return_range: [-12, -4], direction: 'BEARISH' },
        { asset: 'spx',  return_range: [-12, -2], direction: 'BEARISH' },
      ],
      weights: [
        { asset: 'gold', current: 0.20, neutral: 0.10, delta_pp: +10, note: '首选抗通胀' },
        { asset: 'usd',  current: 0.20, neutral: 0.15, delta_pp: +5,  note: '短端T-Bill' },
        { asset: 'ust',  current: 0.10, neutral: 0.25, delta_pp: -15, note: '只保留短端' },
        { asset: 'spx',  current: 0.30, neutral: 0.45, delta_pp: -15, note: '能源/物资/金融' },
      ],
      key_risks: '若 FOMC 快速 50bps 加息 → 黄金回撤，但中期仍有支撑。',
    },
    {
      key: 'sticky_inflation',
      label: '粘性通胀',
      emoji: '🟠',
      probability: 0.52,
      is_current: true,
      description: '核心服务 + 房租粘性，头条通胀波动但核心顽固。',
      historical_analog: ['1967-1968', '2006-2007', '2022H2-2023H1'],
      median_duration_months: 9,
      exit_paths: [
        { path: '需求缓慢破坏', weight: 0.60 },
        { path: '供给恢复', weight: 0.25 },
        { path: '结构性调整', weight: 0.15 },
      ],
      performance: [
        { asset: 'gold', return_range: [8, 15],  direction: 'BULLISH' },
        { asset: 'usd',  return_range: [-3, 3],  direction: 'NEUTRAL' },
        { asset: 'ust',  return_range: [-4, 2],  direction: 'BEARISH' },
        { asset: 'spx',  return_range: [-2, 6],  direction: 'NEU_BEAR' },
      ],
      weights: [
        { asset: 'gold', current: 0.15, neutral: 0.10, delta_pp: +5, note: '中配，抗实际利率' },
        { asset: 'usd',  current: 0.15, neutral: 0.15, delta_pp: 0,  note: '短端锚定' },
        { asset: 'ust',  current: 0.20, neutral: 0.25, delta_pp: -5, note: '偏短端' },
        { asset: 'spx',  current: 0.40, neutral: 0.45, delta_pp: -5, note: '高分红低估值' },
      ],
      key_risks: 'FOMC 意外鹰派 → 短期黄金回撤，美元冲高。',
    },
    {
      key: 'goldilocks',
      label: '温和通胀',
      emoji: '🟡',
      probability: 0.23,
      is_current: false,
      description: '接近 2% 目标走廊，政策可耐心等待。',
      historical_analog: ['2015-2019', '1995-1999'],
      median_duration_months: 18,
      exit_paths: [
        { path: '维持稳定', weight: 0.50 },
        { path: '温和加速', weight: 0.30 },
        { path: '放缓回落', weight: 0.20 },
      ],
      performance: [
        { asset: 'gold', return_range: [-2, 8],  direction: 'NEUTRAL' },
        { asset: 'usd',  return_range: [-3, 3],  direction: 'NEUTRAL' },
        { asset: 'ust',  return_range: [2, 8],   direction: 'NEU_BULL' },
        { asset: 'spx',  return_range: [8, 20],  direction: 'BULLISH' },
      ],
      weights: [
        { asset: 'gold', current: 0.10, neutral: 0.10, delta_pp: 0,   note: '维持' },
        { asset: 'usd',  current: 0.10, neutral: 0.15, delta_pp: -5,  note: '低配' },
        { asset: 'ust',  current: 0.25, neutral: 0.25, delta_pp: 0,   note: '维持久期' },
        { asset: 'spx',  current: 0.55, neutral: 0.45, delta_pp: +10, note: '超配，偏成长' },
      ],
      key_risks: '美联储过早宽松 → 重新滑入再加速。',
    },
    {
      key: 'disinflation',
      label: '通胀回落',
      emoji: '🟢',
      probability: 0.08,
      is_current: false,
      description: '同比和环比同步放缓，降息预期定价增强。',
      historical_analog: ['1984-1986', '2011-2013'],
      median_duration_months: 12,
      exit_paths: [
        { path: '回到 goldilocks', weight: 0.55 },
        { path: '滑入通缩', weight: 0.15 },
        { path: '再通胀', weight: 0.30 },
      ],
      performance: [
        { asset: 'gold', return_range: [5, 15],  direction: 'BULLISH' },
        { asset: 'usd',  return_range: [-8, -2], direction: 'BEARISH' },
        { asset: 'ust',  return_range: [6, 12],  direction: 'BULLISH' },
        { asset: 'spx',  return_range: [10, 20], direction: 'BULLISH' },
      ],
      weights: [
        { asset: 'gold', current: 0.12, neutral: 0.10, delta_pp: +2,  note: '受益降息' },
        { asset: 'usd',  current: 0.08, neutral: 0.15, delta_pp: -7,  note: '低配' },
        { asset: 'ust',  current: 0.35, neutral: 0.25, delta_pp: +10, note: '拉长久期' },
        { asset: 'spx',  current: 0.45, neutral: 0.45, delta_pp: 0,   note: '成长回归' },
      ],
      key_risks: '财政脉冲重启 → 通胀 V 型反弹。',
    },
    {
      key: 'deflation_risk',
      label: '通缩风险',
      emoji: '🔵',
      probability: 0.02,
      is_current: false,
      description: '价格负增长 + 预期崩塌，需要大幅宽松。',
      historical_analog: ['2008-2009', '2020 Q2'],
      median_duration_months: 6,
      exit_paths: [
        { path: '央行大规模刺激', weight: 0.70 },
        { path: '财政救援', weight: 0.25 },
        { path: '结构性萧条', weight: 0.05 },
      ],
      performance: [
        { asset: 'gold', return_range: [-5, 20],  direction: 'NEU_BULL' },
        { asset: 'usd',  return_range: [-10, -2], direction: 'BEARISH' },
        { asset: 'ust',  return_range: [10, 25],  direction: 'BULLISH' },
        { asset: 'spx',  return_range: [-25, -5], direction: 'BEARISH' },
      ],
      weights: [
        { asset: 'gold', current: 0.15, neutral: 0.10, delta_pp: +5,  note: '避险 + 降息' },
        { asset: 'usd',  current: 0.05, neutral: 0.15, delta_pp: -10, note: '反向操作' },
        { asset: 'ust',  current: 0.50, neutral: 0.25, delta_pp: +25, note: '重仓长端' },
        { asset: 'spx',  current: 0.30, neutral: 0.45, delta_pp: -15, note: '防御板块' },
      ],
      key_risks: '恶性通缩预期自我实现 → 资产价格螺旋。',
    },
  ],
};

// ───────── FOMC ─────────
export const mockFomc: FomcBundle = {
  current_rate: 4.375,
  next_meeting: '2026-05-07',
  dot_plot_median: 4.125,
  assessment:
    'Powell 最新发言继续强调 "stay restrictive for longer"。委员分化：Waller / Logan 偏鹰，Goolsbee / Daly 偏鸽。点阵图隐含 2026 降息 2 次，市场定价 2.1 次基本一致。近期 Jackson Hole 讲话预计不会松口。',
  hawkdove_trend: [
    { date: '2026-02-10', score: +1, ma5: 0.2 },
    { date: '2026-02-17', score:  0, ma5: 0.2 },
    { date: '2026-02-24', score: +1, ma5: 0.4 },
    { date: '2026-03-03', score: +2, ma5: 0.8 },
    { date: '2026-03-10', score: +1, ma5: 1.0 },
    { date: '2026-03-17', score:  0, ma5: 0.8 },
    { date: '2026-03-24', score: +1, ma5: 1.0 },
    { date: '2026-03-31', score: +1, ma5: 1.0 },
    { date: '2026-04-07', score:  0, ma5: 0.6 },
    { date: '2026-04-14', score: +1, ma5: 0.6 },
    { date: '2026-04-21', score: +1, ma5: 0.8 },
  ],
  timeline: [
    {
      date: '2026-04-18', type: 'speech', speaker: 'Powell',
      title: '在 NABE 年会主旨演讲',
      summary: '重申通胀回到 2% 之前不急于降息，关注服务通胀和工资增长的持续性。',
      hawkdove: +1, has_vote: true,
      key_quotes: ['"We can afford to be patient"', '"Services inflation remains sticky"'],
    },
    {
      date: '2026-04-14', type: 'speech', speaker: 'Waller',
      title: 'AEI 智库圆桌发言',
      summary: '若未来两次 CPI 都出现上行意外，不排除进一步加息 25bps 的可能。',
      hawkdove: +2, has_vote: true,
      key_quotes: ['"Another hike is not off the table"'],
    },
    {
      date: '2026-04-09', type: 'minutes', title: '3 月 FOMC 会议纪要',
      summary: '与会成员普遍认为降息时点推迟，部分委员担心"最后一英里"通胀回落更慢。',
      hawkdove: +1, has_vote: false,
    },
    {
      date: '2026-04-07', type: 'speech', speaker: 'Goolsbee',
      title: '芝加哥经济俱乐部',
      summary: '认为住房通胀将在下半年明显回落，对 2 次降息路径仍有信心。',
      hawkdove: -1, has_vote: false,
    },
    {
      date: '2026-03-19', type: 'meeting', title: '3 月 FOMC 议息决议',
      summary: '维持 4.25-4.50%。点阵图中位数 4.125%，隐含年内 2 次降息。SEP 上调 Core PCE 预测 0.2pp。',
      hawkdove: +1, has_vote: true,
      key_quotes: ['"Inflation has made progress but remains elevated"'],
    },
    {
      date: '2026-03-10', type: 'speech', speaker: 'Daly',
      title: 'Stanford 发言',
      summary: '劳动力市场降温迹象明显，为 Q3 开始降息创造条件。',
      hawkdove: -1, has_vote: true,
    },
  ],
};

// ───────── 财政 ─────────
export const mockFiscal: FiscalBundle = {
  deficit_gdp_pct: 6.3,
  spending_yoy: 8.5,
  net_issuance_b: 1800,
  tga_delta_b: -220,
  score: 74,
  history: Array.from({ length: 24 }, (_, i) => {
    const month = 1 + i;
    const year = 2024 + Math.floor((month - 1) / 12);
    const m = ((month - 1) % 12) + 1;
    return {
      date: `${year}-${String(m).padStart(2, '0')}`,
      deficit_gdp: 5.2 + Math.sin(i / 3) * 0.8 + i * 0.03,
      spending_yoy: 4 + Math.cos(i / 4) * 2 + i * 0.1,
    };
  }),
  events: [
    { date: '2024-06', title: 'IRA 补贴阶段性落地', impact: 'push' },
    { date: '2024-10', title: 'CHIPS 首批拨款', impact: 'push' },
    { date: '2025-02', title: '预算法延续', impact: 'neutral' },
    { date: '2025-11', title: '一次性国防支出法案', impact: 'push' },
    { date: '2026-03', title: '医保支付调整', impact: 'suppress' },
  ],
  annotation: '赤字 6.3% 处于战后非战争期高位，财政脉冲对通胀持续构成"暗刺激"。',
};

// ───────── 叙事 ─────────
export const mockNarrative: NarrativeBundle = {
  narrative_index: 72,
  search_trends: 68,
  social_sentiment: 0.25,
  hawkdove_ma5: 0.8,
  top_keywords: [
    { word: '滞胀', weight: 0.92 },
    { word: '粘性通胀', weight: 0.85 },
    { word: 'Fed 独立性', weight: 0.71 },
    { word: '工资-物价螺旋', weight: 0.64 },
    { word: '软着陆', weight: 0.55 },
    { word: '房租回落', weight: 0.48 },
    { word: '财政主导', weight: 0.45 },
    { word: '能源冲击', weight: 0.38 },
  ],
  search_history: Array.from({ length: 30 }, (_, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, '0')}`.replace('-31', '-30'),
    value: 50 + Math.sin(i / 4) * 12 + i * 0.6,
  })),
  annotation: '"滞胀"搜索关注度 30 日 +32%，媒体与社媒同步强化粘性通胀叙事。',
};

// ───────── 价格分解 ─────────
export const mockPriceDecomp: PriceDecompEntry[] = Array.from({ length: 24 }, (_, i) => {
  const year = 2024 + Math.floor(i / 12);
  const m = (i % 12) + 1;
  return {
    date: `${year}-${String(m).padStart(2, '0')}`,
    core: 2.5 + Math.sin(i / 5) * 0.3 + 0.4 * Math.cos(i / 3),
    food: 0.4 + Math.cos(i / 4) * 0.2,
    energy: Math.sin(i / 3) * 0.6,
    shelter: 0.8 + Math.cos(i / 6) * 0.1,
    headline: 3 + Math.sin(i / 4) * 0.5 + Math.cos(i / 6) * 0.3,
  };
});

// ───────── 预期 ─────────
export const mockExpectations: ExpectationsBundle = {
  bei_curve: [
    { tenor: '1Y', value: 2.15 },
    { tenor: '2Y', value: 2.28 },
    { tenor: '5Y', value: 2.35 },
    { tenor: '10Y', value: 2.40 },
    { tenor: '5Y5Y', value: 2.45 },
  ],
  michigan_1y: 3.80,
  spf_10y: 2.20,
  realized_cpi: 3.20,
  anchored: true,
};

// ───────── Π 历史 ─────────
export const mockHistory: InflationHistoryEntry[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date('2026-01-22');
  d.setDate(d.getDate() + i);
  const pi = 55 + Math.sin(i / 8) * 8 + Math.cos(i / 14) * 4;
  let regime: InflationHistoryEntry['regime'] = 'sticky_inflation';
  if (pi >= 70) regime = 'reflation_surge';
  else if (pi >= 55) regime = 'sticky_inflation';
  else if (pi >= 35) regime = 'goldilocks';
  else if (pi >= 20) regime = 'disinflation';
  else regime = 'deflation_risk';
  return {
    date: d.toISOString().slice(0, 10),
    pi: Math.round(pi),
    cpi_yoy: 3.0 + Math.sin(i / 10) * 0.4,
    regime,
  };
});

// ───────── 信号时间线 ─────────
export const mockSignalTimeline: SignalTimelineEntry[] = [
  { date: '2026-04-21', pi: 62, regime: 'sticky_inflation', delta_label: '↑', note: 'Core CPI 3.8%，服务项 3m 年化 +0.3pp' },
  { date: '2026-04-15', pi: 60, regime: 'sticky_inflation', delta_label: '↑', note: 'Waller 发言偏鹰，鹰鸽指数走高' },
  { date: '2026-04-10', pi: 58, regime: 'sticky_inflation', delta_label: '↓', note: 'PPI 温和，短期驱动回落' },
  { date: '2026-04-03', pi: 61, regime: 'sticky_inflation', delta_label: '↔', note: 'BEI 稳定，预期锚定' },
  { date: '2026-03-28', pi: 60, regime: 'sticky_inflation', delta_label: '↑', note: '油价月内 +6%，D 分项走高' },
  { date: '2026-03-20', pi: 57, regime: 'sticky_inflation', delta_label: '↓', note: 'FOMC 点阵图中性偏鸽' },
  { date: '2026-03-13', pi: 59, regime: 'sticky_inflation', delta_label: '↑', note: 'CPI 3.2% 高于预期' },
];

// ───────── 事件窗口 ─────────
export const mockEventWindow: EventWindow = {
  active: true,
  next_event: 'CPI · 2026-05-14',
  days_until: 23,
  type: 'cpi',
  message: '距下次 CPI 披露 23 天。历史规律：发布前 3 日通胀敏感资产波动率 +40%。',
};
