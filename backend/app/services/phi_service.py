"""
Pipeline Health Index (PHI) Service for AquaGuard AI.

PHI is a 0–100 score where:
    90–100  → Healthy
    75–89   → Warning
    60–74   → High Risk
    <60     → Critical

The formula is intentionally isolated here so it can be revised or
replaced with an ML-derived output without touching any route or model.

Current formula (rule-based prototype):
    PHI = 100 - weighted_risk

    weighted_risk components:
        - leak_risk   weight 0.55  (primary signal)
        - pressure    weight 0.25  (deviation from nominal 1.0 MPa)
        - flow        weight 0.20  (deviation from nominal 40 L/min)
"""


# ---------------------------------------------------------------------------
# Nominal operating values (tune these as real-world data comes in)
# ---------------------------------------------------------------------------
NOMINAL_PRESSURE_MPA = 1.0       # MPa
NOMINAL_FLOW_LPM = 40.0          # L/min

# Caps for deviation contribution (prevents extreme readings from dominating)
MAX_PRESSURE_DEVIATION_CONTRIBUTION = 25.0
MAX_FLOW_DEVIATION_CONTRIBUTION = 20.0


def calculate_phi(
    leak_risk: float,
    pressure: float,
    flow: float,
) -> float:
    """
    Calculate the Pipeline Health Index for a single pipeline.

    Parameters
    ----------
    leak_risk : float
        AI-predicted leak risk score (0–100).
    pressure : float
        Current pressure reading in MPa.
    flow : float
        Current flow reading in L/min.

    Returns
    -------
    float
        PHI value rounded to 1 decimal place, clamped to [0, 100].

    Notes
    -----
    Replace this function body with ML model output when available.
    The function signature (inputs / output type) should remain stable.
    """
    # Component 1: leak risk contribution (primary)
    leak_component = leak_risk * 0.55

    # Component 2: pressure deviation from nominal
    pressure_deviation_pct = abs(NOMINAL_PRESSURE_MPA - pressure) / NOMINAL_PRESSURE_MPA * 100
    pressure_component = min(pressure_deviation_pct * 0.25, MAX_PRESSURE_DEVIATION_CONTRIBUTION)

    # Component 3: flow deviation from nominal
    flow_deviation_pct = abs(NOMINAL_FLOW_LPM - flow) / NOMINAL_FLOW_LPM * 100
    flow_component = min(flow_deviation_pct * 0.20, MAX_FLOW_DEVIATION_CONTRIBUTION)

    weighted_risk = leak_component + pressure_component + flow_component
    phi = 100.0 - weighted_risk

    return round(max(0.0, min(100.0, phi)), 1)


def phi_to_status(phi: float) -> str:
    """
    Convert a PHI value to a human-readable pipeline status label.

    Parameters
    ----------
    phi : float
        PHI value (0–100).

    Returns
    -------
    str
        One of: "Healthy", "Warning", "High Risk", "Critical".
    """
    if phi >= 90:
        return "Healthy"
    if phi >= 75:
        return "Warning"
    if phi >= 60:
        return "High Risk"
    return "Critical"
