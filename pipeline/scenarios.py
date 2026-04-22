"""四情景剧本 + 马尔可夫转移概率."""
from __future__ import annotations
import numpy as np


# 行/列顺序
STATES = ["reflation_surge", "sticky_inflation", "goldilocks", "disinflation", "deflation_risk"]

# 历史转移矩阵 (PRD §5.8)
TRANSITION = np.array([
    [0.50, 0.35, 0.12, 0.03, 0.00],
    [0.15, 0.55, 0.25, 0.05, 0.00],
    [0.05, 0.20, 0.60, 0.13, 0.02],
    [0.02, 0.08, 0.35, 0.50, 0.05],
    [0.00, 0.02, 0.10, 0.28, 0.60],
])


SCENARIO_LIBRARY = {
    "reflation_surge": {
        "label": "再加速", "emoji": "🔴",
        "description": "驱动 + 预期同步上行，通胀风险阶段性支配市场。",
        "historical_analog": ["1973-1974", "1979-1980", "2021H2"],
        "median_duration_months": 8,
        "exit_paths": [
            {"path": "需求破坏（衰退）", "weight": 0.45},
            {"path": "紧缩过度",         "weight": 0.35},
            {"path": "供给恢复",         "weight": 0.20},
        ],
        "performance": [
            {"asset": "gold", "return_range": [12, 25],  "direction": "BULLISH"},
            {"asset": "usd",  "return_range": [2, 8],    "direction": "NEU_BULL"},
            {"asset": "ust",  "return_range": [-12, -4], "direction": "BEARISH"},
            {"asset": "spx",  "return_range": [-12, -2], "direction": "BEARISH"},
        ],
        "weights": [
            {"asset": "gold", "current": 0.20, "neutral": 0.10, "delta_pp": +10, "note": "首选抗通胀"},
            {"asset": "usd",  "current": 0.20, "neutral": 0.15, "delta_pp":  +5, "note": "短端T-Bill"},
            {"asset": "ust",  "current": 0.10, "neutral": 0.25, "delta_pp": -15, "note": "只保留短端"},
            {"asset": "spx",  "current": 0.30, "neutral": 0.45, "delta_pp": -15, "note": "能源/物资/金融"},
        ],
        "key_risks": "若 FOMC 快速 50bps 加息 → 黄金回撤，但中期仍有支撑。",
    },
    "sticky_inflation": {
        "label": "粘性通胀", "emoji": "🟠",
        "description": "核心服务 + 房租粘性，头条通胀波动但核心顽固。",
        "historical_analog": ["1967-1968", "2006-2007", "2022H2-2023H1"],
        "median_duration_months": 9,
        "exit_paths": [
            {"path": "需求缓慢破坏", "weight": 0.60},
            {"path": "供给恢复",     "weight": 0.25},
            {"path": "结构性调整",   "weight": 0.15},
        ],
        "performance": [
            {"asset": "gold", "return_range": [8, 15], "direction": "BULLISH"},
            {"asset": "usd",  "return_range": [-3, 3], "direction": "NEUTRAL"},
            {"asset": "ust",  "return_range": [-4, 2], "direction": "BEARISH"},
            {"asset": "spx",  "return_range": [-2, 6], "direction": "NEU_BEAR"},
        ],
        "weights": [
            {"asset": "gold", "current": 0.15, "neutral": 0.10, "delta_pp": +5, "note": "中配，抗实际利率"},
            {"asset": "usd",  "current": 0.15, "neutral": 0.15, "delta_pp":  0, "note": "短端锚定"},
            {"asset": "ust",  "current": 0.20, "neutral": 0.25, "delta_pp": -5, "note": "偏短端"},
            {"asset": "spx",  "current": 0.40, "neutral": 0.45, "delta_pp": -5, "note": "高分红低估值"},
        ],
        "key_risks": "FOMC 意外鹰派 → 短期黄金回撤，美元冲高。",
    },
    "goldilocks": {
        "label": "温和通胀", "emoji": "🟡",
        "description": "接近 2% 目标走廊，政策可耐心等待。",
        "historical_analog": ["2015-2019", "1995-1999"],
        "median_duration_months": 18,
        "exit_paths": [
            {"path": "维持稳定", "weight": 0.50},
            {"path": "温和加速", "weight": 0.30},
            {"path": "放缓回落", "weight": 0.20},
        ],
        "performance": [
            {"asset": "gold", "return_range": [-2, 8],  "direction": "NEUTRAL"},
            {"asset": "usd",  "return_range": [-3, 3],  "direction": "NEUTRAL"},
            {"asset": "ust",  "return_range": [2, 8],   "direction": "NEU_BULL"},
            {"asset": "spx",  "return_range": [8, 20],  "direction": "BULLISH"},
        ],
        "weights": [
            {"asset": "gold", "current": 0.10, "neutral": 0.10, "delta_pp":   0, "note": "维持"},
            {"asset": "usd",  "current": 0.10, "neutral": 0.15, "delta_pp":  -5, "note": "低配"},
            {"asset": "ust",  "current": 0.25, "neutral": 0.25, "delta_pp":   0, "note": "维持久期"},
            {"asset": "spx",  "current": 0.55, "neutral": 0.45, "delta_pp": +10, "note": "超配，偏成长"},
        ],
        "key_risks": "美联储过早宽松 → 重新滑入再加速。",
    },
    "disinflation": {
        "label": "通胀回落", "emoji": "🟢",
        "description": "同比和环比同步放缓，降息预期定价增强。",
        "historical_analog": ["1984-1986", "2011-2013"],
        "median_duration_months": 12,
        "exit_paths": [
            {"path": "回到 goldilocks", "weight": 0.55},
            {"path": "滑入通缩",        "weight": 0.15},
            {"path": "再通胀",          "weight": 0.30},
        ],
        "performance": [
            {"asset": "gold", "return_range": [5, 15],  "direction": "BULLISH"},
            {"asset": "usd",  "return_range": [-8, -2], "direction": "BEARISH"},
            {"asset": "ust",  "return_range": [6, 12],  "direction": "BULLISH"},
            {"asset": "spx",  "return_range": [10, 20], "direction": "BULLISH"},
        ],
        "weights": [
            {"asset": "gold", "current": 0.12, "neutral": 0.10, "delta_pp":  +2, "note": "受益降息"},
            {"asset": "usd",  "current": 0.08, "neutral": 0.15, "delta_pp":  -7, "note": "低配"},
            {"asset": "ust",  "current": 0.35, "neutral": 0.25, "delta_pp": +10, "note": "拉长久期"},
            {"asset": "spx",  "current": 0.45, "neutral": 0.45, "delta_pp":   0, "note": "成长回归"},
        ],
        "key_risks": "财政脉冲重启 → 通胀 V 型反弹。",
    },
    "deflation_risk": {
        "label": "通缩风险", "emoji": "🔵",
        "description": "价格负增长 + 预期崩塌，需要大幅宽松。",
        "historical_analog": ["2008-2009", "2020 Q2"],
        "median_duration_months": 6,
        "exit_paths": [
            {"path": "央行大规模刺激", "weight": 0.70},
            {"path": "财政救援",       "weight": 0.25},
            {"path": "结构性萧条",     "weight": 0.05},
        ],
        "performance": [
            {"asset": "gold", "return_range": [-5, 20],  "direction": "NEU_BULL"},
            {"asset": "usd",  "return_range": [-10, -2], "direction": "BEARISH"},
            {"asset": "ust",  "return_range": [10, 25],  "direction": "BULLISH"},
            {"asset": "spx",  "return_range": [-25, -5], "direction": "BEARISH"},
        ],
        "weights": [
            {"asset": "gold", "current": 0.15, "neutral": 0.10, "delta_pp":  +5, "note": "避险 + 降息"},
            {"asset": "usd",  "current": 0.05, "neutral": 0.15, "delta_pp": -10, "note": "反向操作"},
            {"asset": "ust",  "current": 0.50, "neutral": 0.25, "delta_pp": +25, "note": "重仓长端"},
            {"asset": "spx",  "current": 0.30, "neutral": 0.45, "delta_pp": -15, "note": "防御板块"},
        ],
        "key_risks": "恶性通缩预期自我实现 → 资产价格螺旋。",
    },
}


def build_scenarios(current_regime: str, as_of: str) -> dict:
    idx = STATES.index(current_regime)
    next_probs = TRANSITION[idx]
    transition_map = dict(zip(STATES, [round(float(x), 2) for x in next_probs]))

    scenarios = []
    for s_key in STATES:
        lib = SCENARIO_LIBRARY[s_key]
        scenarios.append({
            "key": s_key,
            "is_current": s_key == current_regime,
            "probability": transition_map[s_key],
            **lib,
        })

    return {
        "as_of": as_of,
        "current_regime": current_regime,
        "scenarios": scenarios,
        "transition_next_month": transition_map,
    }
