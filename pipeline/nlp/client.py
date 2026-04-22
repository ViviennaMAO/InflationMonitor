"""Lazy-initialised Anthropic client.

Honours the project's `.env` (loaded by `pipeline.config`). Returns `None` if
`ANTHROPIC_API_KEY` is not set — callers must handle this and fall back to
priors. We deliberately do NOT raise on missing key so the pipeline still
produces JSON output (with static hawkdove scores) when the key is absent —
the site degrades rather than breaks.
"""
from __future__ import annotations
import os

import anthropic

from .. import config  # noqa: F401  — triggers .env load as side-effect


# Opus 4.7 is the default per Anthropic guidance. Override via env when you
# explicitly want a cheaper tier for volume / cost reasons.
DEFAULT_MODEL = os.getenv("INFLATION_MONITOR_NLP_MODEL", "claude-opus-4-7")


_client: anthropic.Anthropic | None = None


def get_client() -> anthropic.Anthropic | None:
    global _client
    if _client is not None:
        return _client
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        return None
    _client = anthropic.Anthropic(api_key=key)
    return _client


def get_model() -> str:
    return DEFAULT_MODEL
