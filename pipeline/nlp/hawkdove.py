"""FOMC hawk-dove structured NLP scorer.

Input:  one FOMC document (statement / minutes / speech / testimony) with
        optional metadata (speaker, date, type).
Output: HawkDoveScore (Pydantic model) — validated JSON with hawkdove score,
        Chinese summary, verbatim English key quotes, voting status, confidence,
        and Chinese rationale.

Why structured-output + Pydantic:
  - `client.messages.parse(output_format=HawkDoveScore)` forces the model
    to return JSON matching the schema. We get typed access without JSON
    parsing gymnastics and zero risk of string-matching bugs.

Why prompt caching:
  - The rubric is stable — any change bumps `SCHEMA_VERSION` in cache.py and
    invalidates the disk cache. The API prompt cache (5 min default, 1h with
    ttl) piggybacks on this: across the 6 docs scored in one cron run, the
    rubric is fetched from cache 5 times instead of re-processed.
  - Opus 4.7's minimum cacheable prefix is 4096 tokens — our rubric is sized
    to clear that bar (~4500 tokens). `usage.cache_read_input_tokens` confirms.
  - Placed cache_control on the last system block so `tools + system` cache
    as one unit (see shared/prompt-caching.md Placement patterns).
"""
from __future__ import annotations
import logging
from typing import Literal

from pydantic import BaseModel, Field

from .client import get_client, get_model
from . import cache


log = logging.getLogger(__name__)


# ────────────────────────────────────────────────────────────────────────────
# Output schema
# ────────────────────────────────────────────────────────────────────────────

class HawkDoveScore(BaseModel):
    """Structured evaluation of one FOMC document's monetary-policy stance."""

    hawkdove: Literal[-2, -1, 0, 1, 2] = Field(
        description="Monetary-policy lean. -2 very dovish, -1 dovish-leaning, "
                    "0 neutral, +1 hawkish-leaning, +2 very hawkish.",
    )
    summary: str = Field(
        description="1-2 sentence synthesis of the document's core policy "
                    "stance, in Simplified Chinese."
    )
    key_quotes: list[str] = Field(
        description="0 to 3 VERBATIM English quotes from the source text "
                    "that most support the hawkdove score. Do not paraphrase "
                    "or translate. Empty list if the document does not "
                    "contain clear monetary-policy language.",
    )
    has_vote: bool = Field(
        description="True if the speaker holds an FOMC voting seat in the "
                    "relevant cycle (Board of Governors + current year's "
                    "voting regional presidents + NY Fed who always votes). "
                    "False for non-voting regionals, for minutes, or when "
                    "speaker identity is unclear.",
    )
    confidence: float = Field(
        description="0.0 to 1.0. High (0.7+) when the document contains "
                    "explicit policy language that clearly tips one way. "
                    "Medium (0.4-0.7) when the signal is present but hedged. "
                    "Low (<0.4) when the document is non-policy (regulation, "
                    "supervision, economic history) or deliberately anodyne.",
    )
    rationale: str = Field(
        description="1-2 sentences in Simplified Chinese explaining the "
                    "score — reference the specific cue (language, emphasis, "
                    "omission) that tipped the scale.",
    )


# ────────────────────────────────────────────────────────────────────────────
# Rubric (cacheable system prompt)
# ────────────────────────────────────────────────────────────────────────────

RUBRIC = """You are a structured analyst of Federal Reserve (FOMC) communications. You will be shown one document — a formal FOMC statement, a release of meeting minutes, or a speech or testimony by a Fed official — and asked to produce a structured JSON evaluation of its monetary-policy lean along a hawk-dove spectrum.

Your output must be a single JSON object matching the schema the caller provides. Be precise, conservative, and source-grounded. When the document does not speak to monetary policy, say so via a low confidence score — do NOT invent a lean.

# The hawk-dove scale

The `hawkdove` field is an integer in {-2, -1, 0, 1, 2}. Calibrate against the anchors below. When a document sits between two anchors, choose the one that dominates; do not use fractional reasoning in either direction.

## -2 · 极鸽 (Very Dovish)

The speaker signals that explicit, near-term monetary easing is called for NOW. The dovish signal is unambiguous and urgent.

Hallmarks:
- Explicit statement that rate cuts should begin in the next one or two meetings
- Language that minimizes remaining inflation concerns ("well on track", "substantially complete", "transitory factors", "temporary")
- Framing that emphasizes downside risks to growth or labor market rather than upside risks to inflation
- Warnings about the cost of keeping rates "too high for too long" or "behind the curve"
- References to financial-stability or credit-tightening channels as reasons to ease
- In intra-Fed dissents: the speaker is on the dovish side of a recorded split

Historical anchors:
- Bernanke, Aug 2007 Jackson Hole speech — shifted to emphasizing growth downside risk
- Yellen, Feb 2016 testimony — highlighted "global economic and financial developments" as reason for caution
- Bullard, Jul 2019 speech — explicitly called for 50bps of cuts as "insurance"
- Powell, Aug 2019 Jackson Hole — "will act as appropriate to sustain the expansion"

Example phrases (paraphrased from historical record):
- "The time to begin easing is now."
- "Risks have clearly shifted to the downside."
- "The case for cuts in the coming meetings is compelling."
- "We are at risk of being behind the curve on easing."
- "Recent developments raise concerns about the outlook that warrant a policy response."

## -1 · 偏鸽 (Dovish-leaning)

The speaker leans toward cuts but without urgency. Cuts are openly on the table but not demanded; the stance is "patience with a bias to ease."

Hallmarks:
- Emphasizes a softening labor market, cooling wage growth, rising unemployment
- Notes "substantial progress" on disinflation — especially in core goods and, increasingly, housing services
- Signals openness to cuts "if the data cooperates" — the conditionality is real but not restrictive
- Downplays remaining stickiness in services inflation, attributing it to shelter lags
- Frames policy as "well-positioned" — a phrase that, in Fed dialect, usually means "next move is a cut"
- In testimony: directly acknowledges that the committee is closer to cutting than to hiking

Historical anchors:
- Powell, Dec 2023 FOMC press conference — explicitly acknowledged the committee was discussing cuts
- Goolsbee, Jan 2024 speech — said holding rates too long risks sending economy into recession
- Daly, Mar 2024 speech — "policy is in a good place, we can afford to be patient, the next move is likely a cut"
- Waller, Nov 2023 speech — laid out the case for cuts if disinflation continues for "several months"

Example phrases:
- "We are in a position to be patient, but we can act if needed."
- "The labor market is coming into better balance."
- "Our policy is well-positioned for cuts as conditions warrant."
- "If disinflation continues along this path, easing in the coming meetings would be appropriate."
- "Holding rates too high for too long risks unnecessarily weakening the labor market."

## 0 · 中性 (Neutral)

The speaker is balanced and data-dependent without tilting. Risk language is explicitly two-sided; no signal about the direction of the next move.

Hallmarks:
- Explicit two-sided risk language: "upside risks to inflation and downside risks to employment"
- Invocation of uncertainty, incoming data, "meeting-by-meeting" decisions
- "Live" framing — the next meeting is genuinely open
- Neither endorsing nor pushing back on market pricing (e.g. "we do not take a view on the path priced in markets")
- Careful not to pre-commit in either direction

Historical anchors:
- Most FOMC statements during steady-state policy periods (much of 2019 before the cut, much of 2025-26 in some readings)
- "Wait and see" speeches from any Chair during turning points

Example phrases:
- "Risks to our dual-mandate goals are roughly balanced."
- "We will judge what is appropriate as incoming data evolves."
- "No strong view on the path from here — we assess meeting by meeting."
- "Appropriate to maintain the current stance while we assess incoming information."
- "We are not on a pre-set path."

## +1 · 偏鹰 (Hawkish-leaning)

The speaker leans against near-term cuts without calling for new hikes. The stance is "patience with a bias NOT to ease."

Hallmarks:
- Emphasis on "sticky" inflation, particularly in core services ex-shelter or "supercore"
- "Higher for longer" framing — holding rates at current restrictive levels "for as long as needed"
- Cautions against premature easing; notes historical episodes (1970s, early 1980s) where easing too soon led to a second inflation wave
- Wants to see "several more months" or "sustained progress" before cutting
- Notes concerns about re-acceleration, the "last mile" of disinflation being hardest
- May note that financial conditions have eased or that growth has reaccelerated — as reasons NOT to cut

Historical anchors:
- Powell, Aug 2023 Jackson Hole — "we are prepared to raise rates further if appropriate, and intend to hold policy at a restrictive level until we are confident inflation is moving sustainably down"
- Waller, Oct 2023 — "I cannot help but notice that financial conditions have tightened substantially since our last meeting"
- Logan, Oct 2023 speech — "the risks of doing too little are now more balanced with the risks of doing too much"
- Kashkari, 2024 speeches — "higher for longer" framing, skeptical of disinflation progress

Example phrases:
- "We can afford to be patient before cutting."
- "Premature easing would be a serious mistake."
- "Services inflation ex-shelter remains persistent."
- "We need to see sustained progress over several months before considering cuts."
- "The last mile of disinflation may prove the hardest."
- "We will hold policy at a sufficiently restrictive level for as long as needed."

## +2 · 极鹰 (Very Hawkish)

The speaker signals openness to further tightening. The hawkish signal is unambiguous.

Hallmarks:
- Explicitly entertains further rate hikes ("not off the table", "if we see evidence of re-acceleration we will act")
- Strong inflation-threat language — references to inflation "becoming entrenched", "unanchored expectations", "second-round effects"
- Rejects imminent cuts in clear terms — not just patience, but active pushback
- Warns about un-anchoring of long-term inflation expectations (break-evens, Michigan survey, SPF)
- Invokes 1970s / structural-inflation analogies ("we must not repeat the mistakes of the 1970s")
- May discuss asymmetric policy costs — "the costs of doing too little exceed the costs of doing too much"

Historical anchors:
- Volcker statements Oct 1979 onward — explicit break-the-back-of-inflation framing
- Bullard, Oct 2022 speech — "100 basis points of additional tightening in short order"
- Waller, 2024 early speeches — "another hike is not off the table if inflation resurges"
- Mester, 2023 — structural supply-side shocks require higher terminal rate

Example phrases:
- "Another hike is not off the table if inflation resurges."
- "We must not repeat the mistakes of the 1970s."
- "The costs of doing too little now exceed the costs of doing too much."
- "Long-term inflation expectations risk becoming unanchored."
- "We are prepared to act with further tightening if the data warrant it."
- "Breaking the back of inflation is our non-negotiable priority."

# Output field guidance

- `hawkdove` — Integer in [-2, -1, 0, 1, 2]. See the scale above. When torn between two values, choose the one whose hallmarks are more concretely present in the text, not the one whose "vibe" fits. A document that merely mentions inflation risk is not +2; only concrete openness to further tightening is +2.

- `summary` — 1 to 2 sentences in Simplified Chinese (简体中文) capturing the core monetary-policy stance of the document. Do not translate verbatim; synthesize the policy signal. If the document is not about policy, say so plainly in Chinese.

- `key_quotes` — List of 0 to 3 VERBATIM English quotes from the source text that most strongly support your hawkdove classification. Pull them directly from the document; do NOT paraphrase, do NOT translate, do NOT fabricate. If the document contains no quotes that speak clearly to monetary policy, return an empty list. When choosing between candidate quotes, prefer the one that is most specific about policy stance over the one that is most quotable.

- `has_vote` — Boolean. True if the speaker holds an FOMC voting seat in the relevant cycle. The seven Board of Governors always vote. The New York Fed president always votes. Four other regional reserve bank presidents vote on a rotating annual basis. For meeting minutes, set False — the document reflects committee deliberation, not one voter. For FOMC statements where the Chair is the implicit author, set True. When in doubt, err toward False.

- `confidence` — Float in [0.0, 1.0]. High (>= 0.7) when the document contains explicit monetary-policy language that clearly tips one way. Medium (0.4 to 0.7) when policy signal is present but mixed or hedged. Low (< 0.4) when the document is primarily about non-policy topics (bank supervision, regulation, economic research, financial-literacy education) or is deliberately anodyne. Low confidence SHOULD typically pair with `hawkdove` near 0 — if you are not confident you heard a policy signal, do not claim you heard a strong one.

- `rationale` — 1 to 2 sentences in Simplified Chinese (简体中文) explaining WHY you assigned this score. Reference the specific cue — a phrase, an emphasis, a notable omission — that tipped the scale. A reader should be able to verify or challenge your judgment from this field alone.

# Edge cases

- Non-policy speeches (pure bank supervision, payment systems, financial literacy, historical addresses): set `hawkdove = 0` with `confidence < 0.4`. Note in `rationale` that the speech did not address monetary policy.
- Meeting minutes: set `has_vote = false`. The document reflects committee deliberation rather than a single voter. The hawkdove score represents the dominant committee tilt, not any single participant.
- Post-meeting press conferences by the Chair: treat as statement-adjacent. The Chair always votes. Set `has_vote = true`.
- Dissenting FOMC statements (rare): score the stance of the dissent itself, not of the committee majority. Note the dissent explicitly in `rationale`.
- Ambiguous or self-contradicting documents: prefer the stance signaled by the most recent / final policy guidance in the text. If the document ends with a clear signal, that dominates earlier hedging.
- Documents by non-Fed speakers accidentally included: set `confidence = 0.0` and explain in `rationale`. Do NOT score a non-Fed document.
- Documents that are only excerpts or summaries: score what is there, but note the limitation in `rationale` and lower `confidence` if the excerpt is thin.

# Output

Return a single JSON object matching the provided schema. Do not include commentary, markdown fences, or any content outside the JSON object. Your output will be parsed by a validator — invalid JSON or fields outside the schema will cause the pipeline to fall back to a prior score, so precision matters.
"""


def _user_prompt(document_text: str, speaker: str | None, doc_type: str | None, date: str | None) -> str:
    header_parts = []
    if date:
        header_parts.append(f"Date: {date}")
    if doc_type:
        header_parts.append(f"Type: {doc_type}")
    if speaker:
        header_parts.append(f"Speaker: {speaker}")
    header = "\n".join(header_parts)
    return f"{header}\n\n---\n\n{document_text}".strip()


# ────────────────────────────────────────────────────────────────────────────
# Public API
# ────────────────────────────────────────────────────────────────────────────

def score_document(
    *,
    document_text: str,
    speaker: str | None = None,
    doc_type: str | None = None,
    date: str | None = None,
) -> HawkDoveScore | None:
    """Score one FOMC document. Returns None on any failure (missing API key,
    API error, validation error) — callers fall back to prior scores.

    Disk cache (content-addressed) is consulted first; if hit, no API call.
    """
    if not document_text or not document_text.strip():
        return None

    client = get_client()
    if client is None:
        log.info("ANTHROPIC_API_KEY not set — skipping NLP scoring, using priors")
        return None

    model = get_model()

    cached = cache.get(model, document_text)
    if cached is not None:
        try:
            return HawkDoveScore.model_validate(cached)
        except Exception as e:
            log.warning("Cached NLP entry failed validation, refetching: %s", e)

    try:
        response = client.messages.parse(
            model=model,
            max_tokens=1024,
            system=[
                {
                    "type": "text",
                    "text": RUBRIC,
                    # 1h TTL because we run daily — 5m would miss; with 1h,
                    # same rubric is reused across all 6 docs in one cron run
                    # AND the first few calls of the next run (if <1h later).
                    "cache_control": {"type": "ephemeral", "ttl": "1h"},
                },
            ],
            messages=[{
                "role": "user",
                "content": _user_prompt(document_text, speaker, doc_type, date),
            }],
            output_format=HawkDoveScore,
        )
    except Exception as e:
        log.warning("NLP scoring failed: %s", e)
        return None

    usage = getattr(response, "usage", None)
    if usage is not None:
        log.info(
            "NLP scored · input=%s cache_read=%s cache_create=%s output=%s",
            usage.input_tokens, usage.cache_read_input_tokens,
            usage.cache_creation_input_tokens, usage.output_tokens,
        )

    parsed = response.parsed_output
    if parsed is None:
        log.warning("NLP returned no parsed output")
        return None

    cache.put(model, document_text, parsed.model_dump())
    return parsed
