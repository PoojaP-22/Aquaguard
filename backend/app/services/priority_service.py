"""
Repair Priority Service for AquaGuard AI.

Ranks pipelines by maintenance urgency using a rule-based scoring formula.
When the ML model is integrated, this service can be updated to accept
ML-derived risk scores instead of database fields — no route changes needed.

Priority Score formula (0–100):
    score = (leak_risk * 0.5) + ((100 - phi) * 0.3) + (ttf_urgency * 0.2)

    ttf_urgency values:
        "18 hours" → 100
        "3 days"   → 70
        "7 days"   → 40
        other      → 10
"""

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


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_TTF_URGENCY: dict[str, float] = {
    "18 hours": 100.0,
    "3 days": 70.0,
    "7 days": 40.0,
}


def _ttf_urgency(time_to_failure: Optional[str]) -> float:
    if time_to_failure is None:
        return 10.0
    return _TTF_URGENCY.get(time_to_failure, 10.0)


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
        "High":     f"Schedule inspection of {pipeline_id} within 24–48 hours.",
        "Medium":   f"Monitor {pipeline_id} closely. Plan inspection this week.",
        "Low":      f"Log {pipeline_id} for routine next-cycle inspection.",
    }
    return actions.get(priority, "Review pipeline condition.")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def calculate_repair_priority(pipelines: List[PriorityInput]) -> List[PriorityResult]:
    """
    Rank a list of pipelines by repair urgency.

    Parameters
    ----------
    pipelines : list of PriorityInput
        Each dict must contain pipeline_id, zone, leak_risk, phi,
        time_to_failure, and status.

    Returns
    -------
    list of PriorityResult
        Sorted highest-priority first, with 1-based rank assigned.
    """
    scored: List[dict] = []

    for p in pipelines:
        urgency = _ttf_urgency(p["time_to_failure"])
        score = (
            p["leak_risk"] * 0.50
            + (100.0 - p["phi"]) * 0.30
            + urgency * 0.20
        )
        score = round(min(100.0, max(0.0, score)), 2)
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

    # Sort by descending priority score
    scored.sort(key=lambda x: x["priority_score"], reverse=True)

    # Assign 1-based ranks
    results: List[PriorityResult] = []
    for i, item in enumerate(scored, start=1):
        results.append(PriorityResult(rank=i, **item))

    return results
