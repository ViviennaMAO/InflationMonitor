"""Content-addressed disk cache for NLP scoring results.

We run a daily cron that re-fetches the same FOMC documents until new ones
land. Without caching, each cron run re-spends API credits on unchanged docs.
The cache is keyed on `sha256(model + schema_version + document_text)` — any
change to the model, the output schema, or the document invalidates the entry
automatically. Cache hits are logged so we can confirm savings.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from typing import Any

from ..config import ROOT


CACHE_DIR = ROOT / "cache" / "nlp"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Bump when HawkDoveScore schema OR the rubric prompt change in a way that
# should invalidate existing cache entries.
SCHEMA_VERSION = "v1"


def _key(model: str, document_text: str) -> str:
    h = hashlib.sha256()
    h.update(model.encode("utf-8"))
    h.update(b"\x00")
    h.update(SCHEMA_VERSION.encode("utf-8"))
    h.update(b"\x00")
    h.update(document_text.encode("utf-8"))
    return h.hexdigest()


def get(model: str, document_text: str) -> dict[str, Any] | None:
    path = CACHE_DIR / f"{_key(model, document_text)}.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def put(model: str, document_text: str, payload: dict[str, Any]) -> None:
    path = CACHE_DIR / f"{_key(model, document_text)}.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
