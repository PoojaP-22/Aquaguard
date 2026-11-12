"""
Repair Priority Service for AquaGuard AI.

Ranks pipelines by maintenance urgency combining ML-predicted leak risk,
inverse pipeline health index (PHI), and parsed time-to-failure urgency.

Priority Score formula (0–100):
    score = (leak_risk * 0.50) + ((100 - phi) * 0.30) + (ttf_urgency * 0.20)
"""

import re
from typing import List, TypedDict, Optional


class PriorityInput(TypedDict):
    pipeline_id: str
    zone: str
    leak_risk: float
    phi: float
    time_to_failure: Optional[str]
    status: str


class PriorityResult(TypedDict):
    rank: int
    pipeline_id: str
    zone: str
    risk: float
    phi: float
    time_to_failure: Optional[str]
    priority: str
    recommended_action: str
    priority_score: float


def _parse_ttf_hours(ttf_str: Optional[str]) -> float:
    if not ttf_str:
        return 720.0  # 30 days default
    s = ttf_str.strip().lower()
    # Extract first numeric match
    match = re.search(r"(\d+(?:\.\d+)?)", s)
    if not match:
        return 720.0
    val = float(match.group(1))
    if "hour" in s:
        return val
    if "day" in s:
        return val * 24.0
    if "week" in s:
        return val * 168.0
    return val


def _ttf_urgency(time_to_failure: Optional[str]) -> float:
    hours = _parse_ttf_hours(time_to_failure)
    if hours <= 24.0:
        return 100.0
    if hours <= 72.0:
        return 70.0
    if hours <= 168.0:
        return 40.0
    if hours <= 360.0:
        return 25.0
    return 10.0


def _priority_label(score: float) -> str:
    if score >= 75:
        return "Critical"
    if score >= 50:
        return "High"
    if score >= 25:
        return "Medium"
    return "Low"


def _recommended_action(priority: str, pipeline_id: str, ttf: Optional[str]) -> str:
    ttf_str = f" within {ttf}" if ttf else ""
    actions = {
        "Critical": f"Dispatch maintenance crew to {pipeline_id} immediately{ttf_str}.",
        "High": f"Schedule inspection of {pipeline_id} within 24–48 hours.",
        "Medium": f"Monitor {pipeline_id} closely. Plan inspection this week.",
        "Low": f"Log {pipeline_id} for routine next-cycle inspection.",
    }
    return actions.get(priority, "Review pipeline condition.")


def calculate_repair_priority(pipelines: List[PriorityInput]) -> List[PriorityResult]:
    """
    Rank pipelines by repair urgency.
    """
    scored: List[dict] = []

    for p in pipelines:
        urgency = _ttf_urgency(p["time_to_failure"])
        score = (
            p["leak_risk"] * 0.50
            + (100.0 - p["phi"]) * 0.30
            + urgency * 0.20
        )
        score = round(min(100.0, max(0.0, score)), 1)
        priority = _priority_label(score)

        scored.append({
            "pipeline_id": p["pipeline_id"],
            "zone": p["zone"],
            "risk": p["leak_risk"],
            "phi": p["phi"],
            "time_to_failure": p["time_to_failure"],
            "priority": priority,
            "recommended_action": _recommended_action(priority, p["pipeline_id"], p["time_to_failure"]),
            "priority_score": score,
        })

    # Sort descending by priority_score
    scored.sort(key=lambda x: x["priority_score"], reverse=True)

    results: List[PriorityResult] = []
    for i, item in enumerate(scored, start=1):
        results.append(PriorityResult(rank=i, **item))

    return results
