"""日度 pipeline 入口 —— 拉数 → 评分 → 映射资产 → 输出 JSON.

用法:
    python -m pipeline.run_daily

输出:
    pipeline/output/*.json                 （规范归档）
    inflation-dashboard/data/pipeline/*    （前端 API 直读目录）
"""
from __future__ import annotations
import json
import shutil
import datetime as dt
from pathlib import Path

from . import config
from .fetch_data import fetch_all
from .scoring import score_pi
from .asset_mapping import map_assets
from .scenarios import build_scenarios
from .nlp_fomc import build_fomc_bundle


def _mirror_to_dashboard(path: Path) -> None:
    """Copy a JSON from pipeline/output → dashboard/data/pipeline."""
    target = config.DASHBOARD_DATA_DIR / path.name
    shutil.copy2(path, target)


def write_json(name: str, payload: dict | list) -> Path:
    out = config.OUTPUT_DIR / name
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    _mirror_to_dashboard(out)
    return out


def main() -> None:
    as_of = dt.date.today().isoformat()
    print(f"=== InflationMonitor pipeline · {as_of} ===")

    # 1. Fetch
    print("[1/5] Fetching data...")
    data = fetch_all()
    sources = data.get("sources", [])
    print(f"      resolved {len(sources)} live sources" + (f" (falling back to priors)" if not sources else ""))

    # 2. Score IPS
    print("[2/5] Scoring IPS...")
    pi = score_pi(data)
    print(f"      IPS = {pi['pi']:.1f} · regime = {pi['regime']}")
    print(f"      components: {pi['components']}")

    # 3. Map assets
    print("[3/5] Mapping 4-asset signals...")
    assets = map_assets(pi, as_of)

    # 4. Scenarios
    print("[4/5] Building scenarios...")
    scenarios = build_scenarios(pi["regime"], as_of)

    # 5. FOMC
    print("[5/5] Loading FOMC bundle...")
    fomc = build_fomc_bundle()

    # ── 输出 ──
    score_json = {
        "as_of": as_of,
        "pi": pi["pi"],
        "regime": pi["regime"],
        "components": pi["components"],
        "delta_1d": 0.0,   # v1.0 占位，后续与前值对比
        "delta_7d": 0.0,
    }
    components_json = _to_component_cards(pi, as_of)

    write_json("score.json", score_json)
    write_json("components.json", components_json)
    write_json("assets.json", assets)
    write_json("scenarios.json", scenarios)
    write_json("fomc.json", fomc)

    print(f"\n✓ Done. Output at {config.OUTPUT_DIR}")
    print(f"✓ Mirrored to {config.DASHBOARD_DATA_DIR}")


# ── 把 scoring detail 转成前端 ComponentCard 结构 ──────────
_CARD_META = {
    "P": {"label": "Price Levels",      "label_zh": "价格水平"},
    "E": {"label": "Expectations",      "label_zh": "通胀预期"},
    "D": {"label": "Drivers",           "label_zh": "驱动因子"},
    "F": {"label": "Fiscal Impulse",    "label_zh": "财政脉冲"},
    "N": {"label": "Narrative / Policy Reflection", "label_zh": "叙事+政策反射"},
}

_SUB_LABELS = {
    # P
    "cpi": "CPI YoY", "core_cpi": "Core CPI YoY", "pce": "PCE YoY",
    "core_pce": "Core PCE YoY", "ppi": "PPI YoY", "truflation": "Truflation",
    # E
    "bei5": "5Y BEI", "bei10": "10Y BEI", "fwd5y5y": "5Y5Y Forward",
    "mich1y": "Michigan 1Y", "spf10": "SPF 10Y Core PCE", "sep_long": "Fed SEP 长期",
    # D
    "wti": "WTI YoY", "crb": "CRB YoY", "wage": "AHE YoY",
    "rent": "Zillow Rent YoY", "dxy": "DXY YoY", "gscpi": "NY Fed GSCPI",
    # F
    "deficit_gdp_pct": "赤字/GDP", "spending_yoy": "财政支出 YoY",
    "net_issuance_b": "净发债 (M)", "tga_delta_b": "TGA Δ",
    "fiscal_mult": "财政乘数", "reconcil": "税改/调解脉冲",
    # N
    "hawkdove_ma5": "FOMC 鹰鸽 MA5", "market_cut_pricing": "市场隐含降息次数",
    "narrative_index": "媒体通胀指数", "search_trends": "Google Trends",
    "social_sentiment": "社媒情绪",
}

_HEADLINES = {
    "P": "Core CPI 仍高于目标，服务与住房粘性顽固",
    "E": "长期 BEI 锚定良好，短期 Michigan 有上行风险",
    "D": "油价 + 工资双推升，住房粘性延后回落",
    "F": "赤字高位，TGA 释放叠加发债扩张",
    "N": "鹰鸽转中性偏鹰，叙事热度回升",
}

_ANNOTATIONS = {
    "P": "Headline CPI 受能源拖累回落，但 Core 持续高于目标，服务项 3m 年化 3.2%。",
    "E": "预期仍然 well-anchored，但 Michigan 家庭端有脱锚迹象需警惕。",
    "D": "供应链压力指数中性，但工资—房租传导链尚未断裂。",
    "F": '财政"暗刺激"仍在运行——单看货币视角会低估通胀韧性。',
    "N": "媒体与市场共同强化'粘性通胀'叙事，自我实现风险升温。",
}

def _unit_for(sub_key: str) -> str:
    if sub_key == "net_issuance_b" or sub_key == "tga_delta_b":
        return "B"
    if sub_key in ("fiscal_mult", "reconcil", "hawkdove_ma5", "market_cut_pricing",
                   "narrative_index", "search_trends", "social_sentiment", "gscpi"):
        return ""
    return "%"


def _tone_for(score: float) -> str:
    if score >= 65: return "push"
    if score <= 35: return "suppress"
    return "neutral"


def _to_component_cards(pi_result: dict, as_of: str) -> list[dict]:
    out = []
    for k in ("P", "E", "D", "F", "N"):
        sub_detail = pi_result["detail"][k]
        sub_factors = []
        for sub_key, sub in sub_detail.items():
            sub_factors.append({
                "key": sub_key,
                "label": _SUB_LABELS.get(sub_key, sub_key),
                "value": sub["value"],
                "unit": _unit_for(sub_key),
                "weight": sub["weight"],
                "score": sub["score"],
                "tone": _tone_for(sub["score"]),
            })
        out.append({
            "key": k,
            **_CARD_META[k],
            "score": pi_result["components"][k],
            "weight": config.WEIGHTS[k],
            "headline": _HEADLINES[k],
            "sub_factors": sub_factors,
            "annotation": _ANNOTATIONS[k],
        })
    return out


if __name__ == "__main__":
    main()
