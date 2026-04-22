"""Π 五分项评分引擎 — 对齐 PRD §5."""
from __future__ import annotations
from .utils import n100, regime_from_pi
from . import config


# ── P: Price Levels (25%) ─────────────────────────────────
def score_P(d: dict) -> tuple[float, dict]:
    cpi      = d.get("cpi", {}).get("yoy")
    core_cpi = d.get("core_cpi", {}).get("yoy")
    pce      = d.get("pce", {}).get("yoy")
    core_pce = d.get("core_pce", {}).get("yoy")
    ppi      = d.get("ppi", {}).get("yoy")
    # Truflation mock (no public feed without API key)
    truflation = 2.6

    parts = {
        "cpi":        (cpi,        3.2, 0.20, 0, 6),
        "core_cpi":   (core_cpi,   3.8, 0.25, 0, 6),
        "pce":        (pce,        2.9, 0.15, 0, 6),
        "core_pce":   (core_pce,   3.3, 0.20, 0, 6),
        "ppi":        (ppi,        2.1, 0.10, -3, 10),
        "truflation": (truflation, 2.6, 0.10, 0, 6),
    }

    score = 0.0
    detail = {}
    for key, (val, fallback, w, lo, hi) in parts.items():
        v = fallback if val is None else val
        s = n100(v, lo, hi)
        score += w * s
        detail[key] = {"value": round(v, 2), "score": round(s, 1), "weight": w}

    return score, detail


# ── E: Expectations (20%) ─────────────────────────────────
def score_E(d: dict) -> tuple[float, dict]:
    bei5    = d.get("bei5", {}).get("latest")
    bei10   = d.get("bei10", {}).get("latest")
    fwd5y5y = d.get("fwd5y5y", {}).get("latest")
    mich1y  = d.get("mich1y", {}).get("latest")
    spf10   = 2.20   # Philly Fed SPF, updated quarterly — mock for v1
    sep_long= 2.00

    parts = {
        "bei5":     (bei5,     2.35, 0.25, 1,   4),
        "bei10":    (bei10,    2.40, 0.25, 1,   4),
        "fwd5y5y":  (fwd5y5y,  2.45, 0.20, 1.5, 3.5),
        "mich1y":   (mich1y,   3.80, 0.15, 1,   6),
        "spf10":    (spf10,    2.20, 0.10, 1,   3),
        "sep_long": (sep_long, 2.00, 0.05, 1.5, 2.5),
    }
    score = 0.0
    detail = {}
    for key, (val, fb, w, lo, hi) in parts.items():
        v = fb if val is None else val
        s = n100(v, lo, hi)
        score += w * s
        detail[key] = {"value": round(v, 2), "score": round(s, 1), "weight": w}
    return score, detail


# ── D: Drivers (20%) ──────────────────────────────────────
def score_D(d: dict) -> tuple[float, dict]:
    wti_yoy  = d.get("yf_wti",  {}).get("yoy")
    dxy_yoy  = d.get("yf_dxy",  {}).get("yoy")
    wage_yoy = d.get("wage",    {}).get("yoy")

    # 非直接可得：rent/crb/gscpi 用 priors
    crb_yoy  = 9.0
    rent_yoy = 4.8
    gscpi    = -0.3

    parts = {
        "wti":   (wti_yoy,  18, 0.20, -30, 60, False),
        "crb":   (crb_yoy,   9, 0.15, -20, 40, False),
        "wage":  (wage_yoy, 4.1, 0.20, 2,   6,  False),
        "rent":  (rent_yoy, 4.8, 0.20, 0,  10,  False),
        "dxy":   (dxy_yoy,  -2, 0.10, -10, 15, True),   # 反向
        "gscpi": (gscpi,   -0.3, 0.15, -2,  4, False),
    }
    score = 0.0
    detail = {}
    for key, (val, fb, w, lo, hi, invert) in parts.items():
        v = fb if val is None else val
        s = n100(v, lo, hi)
        if invert:
            s = 100 - s
        score += w * s
        detail[key] = {"value": round(v, 2), "score": round(s, 1), "weight": w}
    return score, detail


# ── F: Fiscal Impulse (15%) ───────────────────────────────
# v1.0: 数据源多半需要 Treasury MTS + Fed H.4.1 爬虫，pipeline 用 priors
def score_F(_d: dict) -> tuple[float, dict]:
    priors = {
        "deficit_gdp_pct":  (6.3, 0.30, 0, 8),
        "spending_yoy":     (8.5, 0.20, 0, 15),
        "net_issuance_b":   (1800, 0.15, 0, 2500),
        "tga_delta_b":      (-220, 0.15, -500, 500),   # 反向
        "fiscal_mult":      (0.9, 0.10, 0.5, 1.5),
        "reconcil":         (0.4, 0.10, 0, 1),
    }
    score = 0.0
    detail = {}
    for key, (v, w, lo, hi) in priors.items():
        s = n100(v, lo, hi)
        if key == "tga_delta_b":
            s = 100 - s  # TGA 下降 = 释放 = 推升
        score += w * s
        detail[key] = {"value": v, "score": round(s, 1), "weight": w}
    return score, detail


# ── N: Narrative + Policy Reflection (20%) ────────────────
# v1.0 priors; 真实数据由 nlp_fomc.py + narrative scraper 填充
def score_N(_d: dict) -> tuple[float, dict]:
    priors = {
        "hawkdove_ma5":       (0.6,  0.30, -2,  2),
        "market_cut_pricing": (2.1,  0.25, 0,   6),   # 反向：越多降息 → 越压制
        "narrative_index":    (72,   0.20, 0,   100),
        "search_trends":      (68,   0.15, 0,   100),
        "social_sentiment":   (0.25, 0.10, -0.5, 0.5),
    }
    score = 0.0
    detail = {}
    for key, (v, w, lo, hi) in priors.items():
        s = n100(v, lo, hi)
        if key == "market_cut_pricing":
            s = 100 - s
        score += w * s
        detail[key] = {"value": v, "score": round(s, 1), "weight": w}
    return score, detail


# ── 综合 Π ─────────────────────────────────────────────────
def score_pi(d: dict) -> dict:
    P, pd_ = score_P(d)
    E, ed_ = score_E(d)
    D, dd_ = score_D(d)
    F, fd_ = score_F(d)
    N, nd_ = score_N(d)

    pi = (config.WEIGHTS["P"] * P + config.WEIGHTS["E"] * E + config.WEIGHTS["D"] * D
          + config.WEIGHTS["F"] * F + config.WEIGHTS["N"] * N)
    pi = max(0.0, min(100.0, pi))
    regime = regime_from_pi(pi)

    return {
        "pi": round(pi, 1),
        "regime": regime,
        "components": {
            "P": round(P, 1), "E": round(E, 1), "D": round(D, 1),
            "F": round(F, 1), "N": round(N, 1),
        },
        "detail": {"P": pd_, "E": ed_, "D": dd_, "F": fd_, "N": nd_},
    }
