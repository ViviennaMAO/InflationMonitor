"""FOMC 声明 / 官员发言 NLP 鹰鸽打分.

v1.0: 静态 STATIC_BUNDLE (完全没有 API 依赖).
v1.1: 如果设置了 ANTHROPIC_API_KEY, 凡有 `_source_text` 的条目会被
      Claude (pipeline.nlp.hawkdove) 打分, 覆盖静态 hawkdove/summary/
      key_quotes/rationale. 否则 STATIC_BUNDLE 原样返回.

未来 (v1.2+):
  1. 爬取 federalreserve.gov/monetarypolicy/fomccalendars.htm 的会议 / 纪要 / 发言
  2. 拉全文并填入每条的 `_source_text`
  3. Claude 自动打分, 生成带鹰鸽趋势的 bundle
"""
from __future__ import annotations
import logging
from typing import Any

from .nlp.hawkdove import score_document


log = logging.getLogger(__name__)


# ────────────────────────────────────────────────────────────────────────────
# v1.0 静态快照 (无 API key 时使用)
# v1.1: 部分条目带 `_source_text` — 有 key 时由 Claude 重新打分
# ────────────────────────────────────────────────────────────────────────────

STATIC_BUNDLE: dict[str, Any] = {
    "current_rate": 4.375,
    "next_meeting": "2026-05-07",
    "dot_plot_median": 4.125,
    "assessment": (
        'Powell 最新发言继续强调 "stay restrictive for longer"。'
        "委员分化：Waller / Logan 偏鹰，Goolsbee / Daly 偏鸽。"
        "点阵图隐含 2026 降息 2 次，市场定价 2.1 次基本一致。"
        "近期 Jackson Hole 讲话预计不会松口。"
    ),
    "hawkdove_trend": [
        {"date": "2026-02-10", "score":  1, "ma5": 0.2},
        {"date": "2026-02-17", "score":  0, "ma5": 0.2},
        {"date": "2026-02-24", "score":  1, "ma5": 0.4},
        {"date": "2026-03-03", "score":  2, "ma5": 0.8},
        {"date": "2026-03-10", "score":  1, "ma5": 1.0},
        {"date": "2026-03-17", "score":  0, "ma5": 0.8},
        {"date": "2026-03-24", "score":  1, "ma5": 1.0},
        {"date": "2026-03-31", "score":  1, "ma5": 1.0},
        {"date": "2026-04-07", "score":  0, "ma5": 0.6},
        {"date": "2026-04-14", "score":  1, "ma5": 0.6},
        {"date": "2026-04-21", "score":  1, "ma5": 0.8},
    ],
    "timeline": [
        {
            "date": "2026-04-18", "type": "speech", "speaker": "Powell",
            "title": "在 NABE 年会主旨演讲",
            "summary": "重申通胀回到 2% 之前不急于降息，关注服务通胀和工资增长的持续性。",
            "hawkdove": 1, "has_vote": True,
            "key_quotes": ['"We can afford to be patient"', '"Services inflation remains sticky"'],
            # Short representative excerpt — in production, a scraper would
            # populate this with the full speech body.
            "_source_text": (
                "Thank you. Today I want to speak to the outlook for monetary policy.\n\n"
                "Inflation has made substantial progress from its peak, but the last mile "
                "remains the hardest. Core services inflation excluding shelter has been "
                "more persistent than we anticipated, and wage growth — while decelerating "
                "— continues to run above levels consistent with our 2 percent target.\n\n"
                "Let me be clear on what this means for policy. We can afford to be patient. "
                "The labor market, while softening, remains resilient. Financial conditions "
                "are neither materially loose nor materially tight. Our policy is well positioned "
                "to respond to the range of plausible outcomes ahead. What we are not positioned "
                "to do, and what we will not do, is ease prematurely and risk undoing the "
                "progress that has been made.\n\n"
                "Services inflation remains sticky. Until we see sustained evidence that "
                "inflation is moving down toward 2 percent on a lasting basis, we will hold "
                "policy at its current restrictive level."
            ),
        },
        {
            "date": "2026-04-14", "type": "speech", "speaker": "Waller",
            "title": "AEI 智库圆桌发言",
            "summary": "若未来两次 CPI 都出现上行意外，不排除进一步加息 25bps 的可能。",
            "hawkdove": 2, "has_vote": True,
            "key_quotes": ['"Another hike is not off the table"'],
            "_source_text": (
                "Let me share my current reading of the inflation picture and what it implies "
                "for policy.\n\n"
                "The recent CPI releases have been disappointing. Core goods prices have stopped "
                "falling. Housing services are decelerating more slowly than the private-sector "
                "rent data predicted. And supercore — services ex-shelter — has reaccelerated "
                "in two of the last three months. This is not consistent with inflation "
                "sustainably returning to 2 percent.\n\n"
                "If the next two CPI prints confirm this pattern, I believe we would need to "
                "seriously consider whether the current policy rate is in fact restrictive "
                "enough. I want to be direct: another hike is not off the table. I hope we "
                "will not need to take that step. But I am not willing to trade our 2 percent "
                "inflation commitment for short-term comfort in financial markets."
            ),
        },
        {
            "date": "2026-04-09", "type": "minutes",
            "title": "3 月 FOMC 会议纪要",
            "summary": "与会成员普遍认为降息时点推迟，部分委员担心'最后一英里'通胀回落更慢。",
            "hawkdove": 1, "has_vote": False,
            "_source_text": (
                "In their discussion of the economic outlook, participants generally observed "
                "that the process of returning inflation to 2 percent had slowed and that the "
                "disinflation path was likely to be uneven. A number of participants noted that "
                "recent readings on inflation had been higher than expected. Participants "
                "generally judged that the appropriate stance of monetary policy was to "
                "maintain the current target range for the federal funds rate.\n\n"
                "Participants expected that it would likely take longer than previously "
                "anticipated to gain greater confidence that inflation was moving sustainably "
                "toward 2 percent. Several participants commented on the 'last mile' of "
                "disinflation, noting that services inflation excluding housing had been "
                "persistent. Most participants expected that they would want to see further "
                "evidence of a sustained disinflationary trend before beginning to reduce "
                "the policy rate."
            ),
        },
        {
            "date": "2026-04-07", "type": "speech", "speaker": "Goolsbee",
            "title": "芝加哥经济俱乐部",
            "summary": "认为住房通胀将在下半年明显回落，对 2 次降息路径仍有信心。",
            "hawkdove": -1, "has_vote": False,
            "_source_text": (
                "Thanks for having me. Let me spend most of my time on the housing-inflation "
                "channel, because I think this is where the most misreading is happening.\n\n"
                "The private-sector data on new lease rents has been close to zero growth for "
                "several quarters now. Because of the way CPI and PCE measure shelter — through "
                "lagged rent rolls — this has not yet shown up in the official series. But it "
                "will. The gap between new-lease inflation and CPI shelter inflation has "
                "historically closed over roughly 12 to 18 months. I expect housing services "
                "inflation to step down materially in the back half of this year.\n\n"
                "If that happens, as I expect it will, the path toward 2 percent PCE inflation "
                "becomes clearer than many of my colleagues currently think. In that world, "
                "two rate cuts this year remains entirely appropriate. And frankly, holding "
                "rates at the current restrictive level for much longer than needed risks "
                "unnecessary damage to the labor market."
            ),
        },
        {
            "date": "2026-03-19", "type": "meeting",
            "title": "3 月 FOMC 议息决议",
            "summary": "维持 4.25-4.50%。点阵图中位数 4.125%，隐含年内 2 次降息。SEP 上调 Core PCE 预测 0.2pp。",
            "hawkdove": 1, "has_vote": True,
            "key_quotes": ['"Inflation has made progress but remains elevated"'],
            "_source_text": (
                "Recent indicators suggest that economic activity has continued to expand at "
                "a solid pace. Job gains have remained strong, and the unemployment rate has "
                "stayed low. Inflation has made progress toward the Committee's 2 percent "
                "objective but remains elevated.\n\n"
                "The Committee decided to maintain the target range for the federal funds rate "
                "at 4-1/4 to 4-1/2 percent. In considering any adjustments to the target range, "
                "the Committee will carefully assess incoming data, the evolving outlook, and "
                "the balance of risks. The Committee does not expect it will be appropriate "
                "to reduce the target range until it has gained greater confidence that "
                "inflation is moving sustainably toward 2 percent."
            ),
        },
        {
            "date": "2026-03-10", "type": "speech", "speaker": "Daly",
            "title": "Stanford 发言",
            "summary": "劳动力市场降温迹象明显，为 Q3 开始降息创造条件。",
            "hawkdove": -1, "has_vote": True,
            "_source_text": (
                "Let me begin with the labor market, which is where I see the most important "
                "signal right now. The unemployment rate has drifted up roughly 0.4 percentage "
                "points over the past year. Hiring rates have cooled to pre-pandemic norms. "
                "Job openings per unemployed worker, while still above one, have moved "
                "decisively off their extreme highs. Wage growth has decelerated to a pace "
                "consistent with our 2 percent inflation objective assuming reasonable "
                "productivity.\n\n"
                "These are the conditions in which, historically, the Committee has begun to "
                "normalize policy. My reading is that a first rate cut in the third quarter, "
                "followed by gradual further cuts as data confirm the path, would be appropriate. "
                "Holding policy at its current restrictive level beyond that risks turning a "
                "soft landing into something more costly than it needs to be."
            ),
        },
    ],
}


def _is_idempotent_ma5(trend: list[dict]) -> bool:
    """Cheap check: are the ma5 values already pre-computed? (They are in STATIC_BUNDLE.)"""
    return all("ma5" in entry for entry in trend)


def _recompute_ma5(trend: list[dict]) -> list[dict]:
    """Rolling 5-point mean of hawkdove score; left edge uses whatever is available."""
    out = []
    for i, entry in enumerate(trend):
        window = trend[max(0, i - 4) : i + 1]
        ma5 = sum(e["score"] for e in window) / len(window)
        out.append({**entry, "ma5": round(ma5, 2)})
    return out


def _enrich_with_nlp(bundle: dict[str, Any]) -> tuple[dict[str, Any], int]:
    """Walk the timeline, re-score any entry that has `_source_text` via Claude.
    Mutates the bundle in place (also strips the `_source_text` keys before return).
    Returns (enriched_bundle, count_of_successful_rescorings).
    """
    enriched_count = 0
    for entry in bundle["timeline"]:
        text = entry.get("_source_text")
        if not text:
            continue
        result = score_document(
            document_text=text,
            speaker=entry.get("speaker"),
            doc_type=entry.get("type"),
            date=entry.get("date"),
        )
        if result is None:
            continue  # fall through to static values
        entry["hawkdove"] = int(result.hawkdove)
        entry["summary"] = result.summary
        if result.key_quotes:
            entry["key_quotes"] = list(result.key_quotes)
        entry["has_vote"] = bool(result.has_vote)
        entry["rationale"] = result.rationale
        entry["confidence"] = round(float(result.confidence), 2)
        enriched_count += 1

    for entry in bundle["timeline"]:
        entry.pop("_source_text", None)

    return bundle, enriched_count


def build_fomc_bundle() -> dict[str, Any]:
    """Return a FomcBundle dict.

    Behaviour:
      - No ANTHROPIC_API_KEY → returns STATIC_BUNDLE unchanged (v1.0 behaviour).
      - ANTHROPIC_API_KEY set → entries with `_source_text` are re-scored by Claude;
        hawkdove_trend is recomputed from the fresh scores where they differ from
        the static ones. Falls back entry-by-entry on any API error.
    """
    # Deep-ish copy so the module-level constant is never mutated.
    import copy
    bundle = copy.deepcopy(STATIC_BUNDLE)

    bundle, enriched = _enrich_with_nlp(bundle)

    if enriched > 0:
        log.info("NLP re-scored %d FOMC documents", enriched)
        # Rebuild trend from re-scored timeline entries that happen to be in the
        # hawkdove_trend window. We match on date.
        trend_by_date = {e["date"]: e for e in bundle["hawkdove_trend"]}
        for entry in bundle["timeline"]:
            if entry["date"] in trend_by_date:
                trend_by_date[entry["date"]]["score"] = entry["hawkdove"]
        bundle["hawkdove_trend"] = _recompute_ma5(list(trend_by_date.values()))

    return bundle


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s · %(message)s")
    import json
    print(json.dumps(build_fomc_bundle(), ensure_ascii=False, indent=2))
