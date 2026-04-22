"""Data acquisition — FRED (primary) + Yahoo Finance (fallback / realtime).

HTTP layer uses curl via subprocess because local proxies (e.g. Clash on macOS)
flake out on Python `requests` after a few calls in a row. curl is more robust
and universally available — we lose nothing meaningful by using it.
"""
from __future__ import annotations
import json
import subprocess
import time
import urllib.parse
from typing import Any

from . import config
from .utils import yoy


FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"


def _curl_once(url: str, timeout: int) -> dict:
    r = subprocess.run(
        ["curl", "-sSf", "--http1.1", "--max-time", str(timeout),
         "-A", "InflationMonitor/0.1", url],
        capture_output=True, timeout=timeout + 5,
    )
    if r.returncode != 0:
        err_lines = r.stderr.decode(errors="replace").strip().splitlines()
        raise RuntimeError(err_lines[-1] if err_lines else f"curl exit {r.returncode}")
    return json.loads(r.stdout)


def _curl_get(url: str, params: dict | None = None, timeout: int = 20,
              retries: int = 3, backoff: float = 2.0) -> dict:
    """GET `url?params` via curl with retry/backoff for flaky local proxies.

    Raises RuntimeError after all attempts fail.
    """
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    last = None
    for attempt in range(retries):
        try:
            return _curl_once(url, timeout)
        except Exception as e:
            last = e
            if attempt < retries - 1:
                time.sleep(backoff * (attempt + 1))
    raise RuntimeError(str(last))


def fetch_fred(series_id: str, limit: int = 60) -> list[dict]:
    """Return list of {date, value} dicts from FRED (chronological order).

    `limit` caps the number of recent observations — kept small so responses fit
    through slow proxies. 60 monthly points ≈ 5Y (enough for YoY + history chart),
    60 daily points ≈ 3M (enough for latest + short recency trend).
    """
    if not config.FRED_API_KEY:
        return []
    try:
        j = _curl_get(FRED_BASE, {
            "series_id": series_id,
            "api_key": config.FRED_API_KEY,
            "file_type": "json",
            "sort_order": "desc",
            "limit": limit,
        })
        obs = (j or {}).get("observations", [])
        rows = [
            {"date": o["date"], "value": float(o["value"])}
            for o in obs if o.get("value") not in (None, ".", "")
        ]
        rows.reverse()   # chronological
        return rows
    except Exception as e:
        print(f"[FRED] {series_id} failed: {e}")
        return []


def fetch_yahoo_history(ticker: str, range_: str = "3mo") -> list[dict]:
    """Minimal Yahoo chart endpoint; returns list of {date, close}. Handles common failures silently."""
    url = f"https://query1.finance.yahoo.com/v7/finance/chart/{urllib.parse.quote(ticker)}"
    try:
        j = _curl_get(url, {"range": range_, "interval": "1d"})
        result = j["chart"]["result"][0]
        ts = result["timestamp"]
        closes = result["indicators"]["quote"][0]["close"]
        out = []
        for t, c in zip(ts, closes):
            if c is None:
                continue
            out.append({"date": time.strftime("%Y-%m-%d", time.gmtime(t)), "value": float(c)})
        return out
    except Exception as e:
        print(f"[Yahoo] {ticker} failed: {e}")
        return []


def fetch_all() -> dict[str, Any]:
    """Pull everything we need — returns a dict suitable for the scoring engine.

    Fall back to neutral priors when a source is unavailable (e.g. no FRED key).
    """
    data: dict[str, Any] = {"sources": []}

    # ---- FRED series (monthly / daily) ----
    for key, sid in config.FRED_SERIES.items():
        rows = fetch_fred(sid)
        time.sleep(1.2)    # give the local proxy a moment to recover between calls    # space requests out (respect proxy + FRED rate limits)
        values = [r["value"] for r in rows]
        data[key] = {
            "latest": values[-1] if values else None,
            "yoy": yoy(values),
            "series": rows[-36:],
        }
        if rows:
            data["sources"].append(f"FRED:{sid}")

    # ---- Yahoo tickers ----
    for key, tkr in config.YAHOO_TICKERS.items():
        rows = fetch_yahoo_history(tkr)
        time.sleep(1.2)    # give the local proxy a moment to recover between calls
        values = [r["value"] for r in rows]
        data[f"yf_{key}"] = {
            "latest": values[-1] if values else None,
            "yoy": ((values[-1] / values[0] - 1) * 100) if len(values) >= 2 else None,
            "series": rows[-252:],
        }
        if rows:
            data["sources"].append(f"Yahoo:{tkr}")

    return data


if __name__ == "__main__":
    import pprint
    pprint.pp({k: v if not isinstance(v, dict) else {kk: (vv if kk != "series" else f"<{len(vv)} pts>") for kk, vv in v.items()} for k, v in fetch_all().items()})
