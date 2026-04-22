"""Shared config for InflationMonitor pipeline."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = ROOT.parent
OUTPUT_DIR = ROOT / "output"
OUTPUT_DIR.mkdir(exist_ok=True)


def _load_dotenv(path: Path) -> None:
    """Tiny .env loader — sets env vars from KEY=VALUE lines, without overwriting existing ones."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k, v = k.strip(), v.strip().strip('"').strip("'")
        os.environ.setdefault(k, v)


_load_dotenv(PROJECT_ROOT / ".env")
_load_dotenv(PROJECT_ROOT / ".env.local")

# Dashboard API reads from this path if env is set
DASHBOARD_DATA_DIR = Path(
    os.getenv(
        "DASHBOARD_DATA_DIR",
        str(PROJECT_ROOT / "inflation-dashboard" / "data" / "pipeline"),
    )
)
DASHBOARD_DATA_DIR.mkdir(parents=True, exist_ok=True)

FRED_API_KEY = os.getenv("FRED_API_KEY", "")  # https://fred.stlouisfed.org/docs/api/api_key.html

# ──────────────────────────────────────────────────────────
#  IPS 公式权重 (对齐 PRD v1.0)
# ──────────────────────────────────────────────────────────
WEIGHTS = {"P": 0.25, "E": 0.20, "D": 0.20, "F": 0.15, "N": 0.20}

# Regime 阈值
REGIME_THRESHOLDS = [
    (70, "reflation_surge"),
    (55, "sticky_inflation"),
    (35, "goldilocks"),
    (20, "disinflation"),
    (0,  "deflation_risk"),
]

# FRED series
FRED_SERIES = {
    # P
    "cpi":        "CPIAUCSL",
    "core_cpi":   "CPILFESL",
    "pce":        "PCEPI",
    "core_pce":   "PCEPILFE",
    "ppi":        "PPIACO",
    # E
    "bei5":       "T5YIE",
    "bei10":      "T10YIE",
    "fwd5y5y":    "T5YIFR",
    "mich1y":     "MICH",
    # D
    "wage":       "CES0500000003",
    "dxy":        "DTWEXBGS",
    # D + N rates
    "fedfunds":   "FEDFUNDS",
    "tips10y":    "DFII10",
    "dgs2":       "DGS2",
    "dgs10":      "DGS10",
}

# Yahoo tickers (fallback for oil, DXY realtime etc.)
YAHOO_TICKERS = {
    "wti":  "CL=F",
    "brent": "BZ=F",
    "dxy":  "DX-Y.NYB",
    "gold": "GC=F",
    "spx":  "^GSPC",
    "tlt":  "TLT",
}

# 资产 β (CPI, BEI, FOMC_hawk)  —— PRD §3.4
ASSET_BETAS = {
    "gold":  (0.55,  0.55, -0.35),
    "usd":   (0.15, -0.20,  0.60),
    "ust":   (-0.65, -0.50, -0.70),
    "spx":   (-0.30, -0.25, -0.40),
}

# Regime → asset direction override (PRD §5.7)
REGIME_OVERRIDE = {
    "reflation_surge":  {"gold": "BULLISH", "usd": "BULLISH", "ust": "BEARISH", "spx": "BEARISH"},
    "sticky_inflation": {"gold": "BULLISH", "usd": "NEUTRAL", "ust": "BEARISH", "spx": "NEU_BEAR"},
    "goldilocks":       {"gold": "NEUTRAL", "usd": "NEUTRAL", "ust": "NEUTRAL",  "spx": "BULLISH"},
    "disinflation":     {"gold": "BULLISH", "usd": "BEARISH", "ust": "BULLISH",  "spx": "BULLISH"},
    "deflation_risk":   {"gold": "NEU_BULL","usd": "BEARISH", "ust": "BULLISH",  "spx": "BEARISH"},
}
