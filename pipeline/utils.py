"""Scoring utilities."""
from __future__ import annotations


def normalize(x: float, lo: float, hi: float) -> float:
    """Clamp & scale to [0, 1]."""
    if hi == lo:
        return 0.0
    return max(0.0, min(1.0, (x - lo) / (hi - lo)))


def n100(x: float, lo: float, hi: float) -> float:
    """Same as normalize but to [0, 100]."""
    return normalize(x, lo, hi) * 100


def yoy(series: list[float]) -> float | None:
    """Year-over-year % change from a monthly series (expects ≥13 months)."""
    if not series or len(series) < 13:
        return None
    now, then = series[-1], series[-13]
    if then == 0:
        return None
    return (now / then - 1) * 100


def regime_from_pi(pi: float) -> str:
    from .config import REGIME_THRESHOLDS
    for thresh, name in REGIME_THRESHOLDS:
        if pi >= thresh:
            return name
    return "deflation_risk"
