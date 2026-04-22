"""Π → 四资产方向信号映射 (PRD §5.7)."""
from __future__ import annotations
from . import config


HEADLINES = {
    "gold": {
        "BULLISH":  "粘性通胀 + 实际利率见顶，做多黄金优先级最高",
        "NEU_BULL": "黄金结构性受益，战术上仍要看美元联动",
        "NEUTRAL":  "通胀中性 + 实际利率走廊，黄金方向不明",
        "NEU_BEAR": "通胀回落 + 实际利率企稳，黄金阶段性承压",
        "BEARISH":  "disinflation + 实际利率上行，黄金短期不利",
    },
    "usd": {
        "BULLISH":  "紧缩预期强化 + 全球避险，美元偏多",
        "NEU_BULL": "利差扩张利好美元，但滞胀担忧部分抵消",
        "NEUTRAL":  "紧缩预期支撑 vs 滞胀担忧拖累，方向胶着",
        "NEU_BEAR": "降息预期增强 + 财政脉冲，美元阶段性承压",
        "BEARISH":  "降息周期 + 去美元化，美元多头失守",
    },
    "ust": {
        "BULLISH":  "通胀回落 + 避险需求推升长端债券",
        "NEU_BULL": "紧缩末期，长端久期开始具备吸引力",
        "NEUTRAL":  "通胀与货币政策僵持，长端区间波动",
        "NEU_BEAR": "通胀粘性 + 供给压力，长端仍不宜超配",
        "BEARISH":  "实际利率高位 + 供给压力，长端价格承压",
    },
    "spx": {
        "BULLISH":  "通胀回落 + 盈利修复，股指上行动能强",
        "NEU_BULL": "通胀软着陆预期 + 估值扩张，温和偏多",
        "NEUTRAL":  "通胀中性，板块分化，整体中性",
        "NEU_BEAR": "盈利受益部分抵消估值压力，警惕利率敏感板块",
        "BEARISH":  "紧缩 + 估值压力 + 盈利承压，股指下行",
    },
}

# 方向 → 置信度基准 (后续按 Π 偏离度动态调整)
DIR_BASE_CONF = {
    "BULLISH":  72, "NEU_BULL": 60, "NEUTRAL": 48, "NEU_BEAR": 58, "BEARISH":  68,
}

WEIGHT_DELTAS = {
    # (neutral, current, delta_pp) per regime/asset
    ("reflation_surge", "gold"):  (0.10, 0.20, +10),
    ("reflation_surge", "usd"):   (0.15, 0.20,  +5),
    ("reflation_surge", "ust"):   (0.25, 0.10, -15),
    ("reflation_surge", "spx"):   (0.45, 0.30, -15),
    ("sticky_inflation", "gold"): (0.10, 0.15,  +5),
    ("sticky_inflation", "usd"):  (0.15, 0.15,   0),
    ("sticky_inflation", "ust"):  (0.25, 0.20,  -5),
    ("sticky_inflation", "spx"):  (0.45, 0.40,  -5),
    ("goldilocks", "gold"):       (0.10, 0.10,   0),
    ("goldilocks", "usd"):        (0.15, 0.10,  -5),
    ("goldilocks", "ust"):        (0.25, 0.25,   0),
    ("goldilocks", "spx"):        (0.45, 0.55, +10),
    ("disinflation", "gold"):     (0.10, 0.12,  +2),
    ("disinflation", "usd"):      (0.15, 0.08,  -7),
    ("disinflation", "ust"):      (0.25, 0.35, +10),
    ("disinflation", "spx"):      (0.45, 0.45,   0),
    ("deflation_risk", "gold"):   (0.10, 0.15,  +5),
    ("deflation_risk", "usd"):    (0.15, 0.05, -10),
    ("deflation_risk", "ust"):    (0.25, 0.50, +25),
    ("deflation_risk", "spx"):    (0.45, 0.30, -15),
}


def map_assets(pi_result: dict, as_of: str) -> dict:
    regime = pi_result["regime"]
    pi = pi_result["pi"]
    comps = pi_result["components"]

    directions = config.REGIME_OVERRIDE[regime]
    assets = []
    for key in ("gold", "usd", "ust", "spx"):
        direction = directions[key]
        b_cpi, b_bei, b_hawk = config.ASSET_BETAS[key]

        # β 合成的偏离量 (对 50 中性的偏离)
        raw = (b_cpi * (comps["P"] - 50) + b_bei * (comps["E"] - 50)
               + b_hawk * (comps["N"] - 50)) / 50
        # 置信度 = 基准 + 10 × |raw|, 截断到 [30, 95]
        conf = max(30, min(95, DIR_BASE_CONF[direction] + round(abs(raw) * 10)))

        neutral, current, delta = WEIGHT_DELTAS[(regime, key)]

        assets.append({
            "key": key,
            "name_zh": {"gold": "黄金", "usd": "美元", "ust": "美债 10Y", "spx": "美股 S&P"}[key],
            "ticker":  {"gold": "XAU", "usd": "DXY", "ust": "UST", "spx": "SPX"}[key],
            "emoji":   {"gold": "🟡", "usd": "💵", "ust": "📉", "spx": "📈"}[key],
            "direction": direction,
            "confidence": conf,
            "headline": HEADLINES[key][direction],
            "sensitivity": round(abs(b_cpi) * 0.5 + abs(b_bei) * 0.3 + abs(b_hawk) * 0.2, 2),
            "rationale_chain": _rationale(key, regime),
            "historical_analog": _analog(regime),
            "risk": _risk(key, regime),
            "suggested_weight": {"current": current, "neutral": neutral, "delta_pp": delta},
            "beta": {"cpi": b_cpi, "bei": b_bei, "fomc_hawk": b_hawk},
        })

    return {
        "as_of": as_of,
        "pi_score": pi,
        "regime": regime,
        "assets": assets,
    }


def _rationale(asset: str, regime: str) -> str:
    table = {
        ("gold", "sticky_inflation"):   "服务粘性↑ → 实际利率→ 黄金↑",
        ("usd",  "sticky_inflation"):   "FOMC 鹰→ 利差扩 → 美元+ | 滞胀→ 美元-",
        ("ust",  "sticky_inflation"):   "CPI 粘性→ 实际利率 → UST 价格↓",
        ("spx",  "sticky_inflation"):   "通胀粘性→ 估值多头 + 盈利↑（能源/金融）",
    }
    return table.get((asset, regime), f"{asset}·{regime} 默认传导链")


def _analog(regime: str) -> dict:
    mapping = {
        "reflation_surge":  ("1973-1974", 0.58),
        "sticky_inflation": ("1970s",     0.62),
        "goldilocks":       ("2015-2019", 0.55),
        "disinflation":     ("1984-1986", 0.60),
        "deflation_risk":   ("2008-2009", 0.65),
    }
    p, s = mapping[regime]
    return {"period": p, "similarity": s}


def _risk(asset: str, regime: str) -> str:
    if regime == "sticky_inflation":
        return {
            "gold": "若 FOMC 超鹰 → 短期回撤",
            "usd":  "若外部风险事件 → 避险飞涨",
            "ust":  "避险事件 → 短期反弹",
            "spx":  "Breadth 恶化 + 高估值科技股回撤",
        }[asset]
    return "宏观拐点 / 政策意外"
