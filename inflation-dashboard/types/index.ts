// ───────── 通胀体制 ─────────
export type InflationRegime =
  | 'reflation_surge'    // 🔴 再加速 Π ≥ 70
  | 'sticky_inflation'   // 🟠 粘性通胀 55-70
  | 'goldilocks'         // 🟡 温和 35-55
  | 'disinflation'       // 🟢 回落 20-35
  | 'deflation_risk';    // 🔵 通缩 <20

export const REGIME_META: Record<InflationRegime, {
  label: string; color: string; bg: string; dot: string; emoji: string;
}> = {
  reflation_surge:  { label: '再加速',     color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/30',    dot: 'bg-red-500',    emoji: '🔴' },
  sticky_inflation: { label: '粘性通胀',   color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30', dot: 'bg-orange-500', emoji: '🟠' },
  goldilocks:       { label: '温和通胀',   color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30', dot: 'bg-yellow-500', emoji: '🟡' },
  disinflation:     { label: '通胀回落',   color: 'text-emerald-400',bg: 'bg-emerald-500/15 border-emerald-500/30', dot: 'bg-emerald-500', emoji: '🟢' },
  deflation_risk:   { label: '通缩风险',   color: 'text-blue-400',   bg: 'bg-blue-500/15 border-blue-500/30', dot: 'bg-blue-500', emoji: '🔵' },
};

// ───────── 综合评分 ─────────
export interface InflationScore {
  as_of: string;
  pi: number;                 // 0-100
  regime: InflationRegime;
  components: {
    P: number; E: number; D: number; F: number; N: number;
  };
  delta_1d: number;
  delta_7d: number;
}

// ───────── 子因子明细 ─────────
export interface SubFactor {
  key: string;
  label: string;
  value: number;
  unit?: string;
  weight: number;    // 0-1
  score: number;     // 0-100 归一化
  tone?: 'push' | 'neutral' | 'suppress';
}

export interface ComponentDetail {
  key: 'P' | 'E' | 'D' | 'F' | 'N';
  label: string;        // "Price Levels"
  label_zh: string;     // "价格水平"
  score: number;        // 0-100
  weight: number;       // 0-1
  headline: string;
  sub_factors: SubFactor[];
  annotation: string;
}

// ───────── 四资产信号 ─────────
export type AssetKey = 'gold' | 'usd' | 'ust' | 'spx';
export type Direction = 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'NEU_BULL' | 'NEU_BEAR';

export interface AssetSignal {
  key: AssetKey;
  name_zh: string;
  ticker: string;
  emoji: string;
  direction: Direction;
  confidence: number;           // 0-100
  headline: string;             // 一句话
  sensitivity: number;          // 通胀敏感性 0-1
  rationale_chain: string;      // "A↑ → B → C↑"
  historical_analog: { period: string; similarity: number };
  risk: string;
  suggested_weight: { current: number; neutral: number; delta_pp: number };
  beta: { cpi: number; bei: number; fomc_hawk: number };
}

export interface AssetSignalBundle {
  as_of: string;
  pi_score: number;
  regime: InflationRegime;
  assets: AssetSignal[];
}

// ───────── 四情景剧本 ─────────
export interface ScenarioPerformance {
  asset: AssetKey;
  return_range: [number, number];   // [-4, 2] 表示 -4% ~ +2%
  direction: Direction;
}

export interface ScenarioWeight {
  asset: AssetKey;
  current: number;
  neutral: number;
  delta_pp: number;
  note: string;
}

export interface Scenario {
  key: InflationRegime;
  label: string;
  emoji: string;
  probability: number;              // 0-1
  is_current: boolean;
  description: string;
  historical_analog: string[];      // "1967-1968", "2022H2"
  median_duration_months: number;
  exit_paths: Array<{ path: string; weight: number }>;
  performance: ScenarioPerformance[];
  weights: ScenarioWeight[];
  key_risks: string;
}

export interface ScenarioBundle {
  as_of: string;
  current_regime: InflationRegime;
  scenarios: Scenario[];
  transition_next_month: Record<InflationRegime, number>;
}

// ───────── 通胀体制诊断 ─────────
export type InflationType =
  | 'demand_pull'
  | 'cost_push'
  | 'wage_price'
  | 'fiscal_driven'
  | 'mixed';

export interface InflationDiagnosis {
  as_of: string;
  dominant_type: InflationType;
  dominant_weight: number;          // 0-1
  breakdown: Array<{ type: InflationType; weight: number }>;
  persistence: 'low' | 'medium' | 'high';
  duration_estimate_months: number;
  policy_responsiveness: 'low' | 'medium' | 'high';
  historical_anchor: string;
}

// ───────── FOMC ─────────
export type HawkDoveScore = -2 | -1 | 0 | 1 | 2;

export interface FomcEntry {
  date: string;
  type: 'meeting' | 'minutes' | 'speech';
  speaker?: string;
  title: string;
  summary: string;
  hawkdove: HawkDoveScore;
  has_vote: boolean;
  key_quotes?: string[];
}

export interface FomcBundle {
  timeline: FomcEntry[];
  hawkdove_trend: Array<{ date: string; score: HawkDoveScore; ma5: number }>;
  current_rate: number;
  next_meeting: string;
  dot_plot_median: number;
  assessment: string;
}

// ───────── 财政脉冲 ─────────
export interface FiscalBundle {
  deficit_gdp_pct: number;
  spending_yoy: number;
  net_issuance_b: number;
  tga_delta_b: number;
  score: number;
  history: Array<{ date: string; deficit_gdp: number; spending_yoy: number }>;
  events: Array<{ date: string; title: string; impact: 'push' | 'neutral' | 'suppress' }>;
  annotation: string;
}

// ───────── 叙事 ─────────
export interface NarrativeBundle {
  narrative_index: number;     // 0-100
  search_trends: number;       // 0-100
  social_sentiment: number;    // -1 ~ 1
  hawkdove_ma5: number;
  top_keywords: Array<{ word: string; weight: number }>;
  search_history: Array<{ date: string; value: number }>;
  annotation: string;
}

// ───────── 价格 & 预期 ─────────
export interface PriceDecompEntry {
  date: string;
  core: number;
  food: number;
  energy: number;
  shelter: number;
  headline: number;
}

export interface ExpectationsBundle {
  bei_curve: Array<{ tenor: string; value: number }>;  // 1Y/2Y/5Y/10Y/5Y5Y
  michigan_1y: number;
  spf_10y: number;
  realized_cpi: number;
  anchored: boolean;
}

// ───────── 历史信号 ─────────
export interface InflationHistoryEntry {
  date: string;
  pi: number;
  cpi_yoy: number;
  regime: InflationRegime;
}

export interface SignalTimelineEntry {
  date: string;
  pi: number;
  regime: InflationRegime;
  delta_label: '↑' | '↓' | '↔';
  note: string;
}

// ───────── 事件拦截 ─────────
export interface EventWindow {
  active: boolean;
  next_event: string;        // "CPI 2026-05-14"
  days_until: number;
  message: string;
  type: 'cpi' | 'pce' | 'ppi' | 'fomc' | 'payrolls' | 'none';
}
