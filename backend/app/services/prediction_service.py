"""Trained ML inference service for AquaGuard AI."""
from pathlib import Path
from typing import TypedDict, List, Optional
import json
import numpy as np
import joblib
import pandas as pd

ART = Path(__file__).resolve().parent.parent / "ml" / "artifacts"
FEATURES = json.loads((ART / "feature_config.json").read_text())["features"]
MODEL_VERSION = json.loads((ART / "feature_config.json").read_text())["model_version"]

risk_model = joblib.load(ART / "risk_model.joblib")
severity_model = joblib.load(ART / "severity_model.joblib")
rul_model = joblib.load(ART / "rul_model.joblib")
anomaly_model = joblib.load(ART / "anomaly_model.joblib")

# Cache TreeExplainer at module level to avoid 1-2s overhead on every single inference
_cached_explainer = None


def get_tree_explainer():
    global _cached_explainer
    if _cached_explainer is None:
        try:
            import shap
            _cached_explainer = shap.TreeExplainer(risk_model)
        except Exception:
            _cached_explainer = False
    return _cached_explainer


class ShapFeatureDict(TypedDict):
    feature: str
    impact: float


class PredictionResult(TypedDict):
    pipeline_id: str
    risk_score: float
    risk_level: str
    time_to_failure: str
    confidence: float
    severity: int
    estimated_rul_hours: float
    recommended_action: str
    shap_explanation: List[ShapFeatureDict]
    model_version: str
    model_probability: float
    anomaly_score: float
    persistence_score: float
    model_type: str


def _classify_risk(score):
    if score >= 80:
        return "Critical"
    if score >= 60:
        return "High"
    if score >= 35:
        return "Medium"
    return "Low"


def _action(level, pid):
    return {
        "Critical": f"Prioritize immediate inspection and maintenance of {pid}.",
        "High": f"Schedule inspection of {pid} within 24–48 hours.",
        "Medium": f"Increase monitoring of {pid} and plan inspection this week.",
        "Low": f"Continue monitoring {pid} during the routine maintenance cycle.",
    }[level]


def _ttf(rul):
    if rul <= 24:
        return f"{round(rul)} hours"
    if rul <= 72:
        return f"{round(rul / 24, 1)} days"
    return f"{round(rul / 24, 1)} days"


def _vector(pressure, flow, features):
    p_in = float(pressure)
    pressure_deficit = max(0.0, 1.10 - p_in)
    p_out = p_in - (0.08 + 0.90 * pressure_deficit)
    grad = max(0.0, p_in - p_out)
    vibration = float(features.get("vibration_rms", 2.2 + 25 * pressure_deficit))
    acoustic = float(features.get("acoustic_rms", 3.2 + 35 * pressure_deficit))
    turbidity = float(features.get("turbidity_ntu", 2.2 + 35 * pressure_deficit))
    age = float(features.get("pipe_age_years", 18.0))
    corrosion = float(features.get("corrosion_index", 0.20))
    demand = float(features.get("demand_index", 0.95))
    temp = float(features.get("ambient_temp_c", 25.0))
    diameter = float(features.get("diameter_mm", 200))
    missing = float(features.get("sensor_missing_count", 0))
    return pd.DataFrame(
        [[p_in, p_out, grad, float(flow), vibration, acoustic, turbidity, temp, demand, age, diameter, corrosion, missing]],
        columns=FEATURES,
    )


def predict_pipeline_risk(pipeline_id: str, pressure: float, flow: float, **features) -> PredictionResult:
    X = _vector(pressure, flow, features)
    model_probability = float(risk_model.predict_proba(X)[0, 1])
    raw_anomaly = float(-anomaly_model.decision_function(X)[0])
    anomaly_score = float(np.clip((raw_anomaly + 0.10) / 0.25, 0, 1))
    persistence = float(np.clip(features.get("persistence_score", model_probability * 0.85), 0, 1))
    hybrid = float(np.clip(0.65 * model_probability + 0.25 * anomaly_score + 0.10 * persistence, 0, 1))
    score = round(hybrid * 100, 1)
    level = _classify_risk(score)
    severity = int(severity_model.predict(X)[0])
    rul = round(float(np.clip(rul_model.predict(X)[0], 4, 168)), 1)
    missing = float(features.get("sensor_missing_count", 0))
    confidence = round(float(np.clip(94 - 8 * missing - abs(model_probability - anomaly_score) * 12, 55, 97)), 1)

    # Use cached TreeSHAP when available; fall back to feature importance
    explainer = get_tree_explainer()
    explanation = []
    if explainer:
        try:
            sv = explainer(X)
            vals = np.asarray(sv.values)
            if vals.ndim == 3:
                vals = vals[0, :, 1]
            elif vals.ndim == 2:
                vals = vals[0]
            weights = np.abs(vals)
            order = np.argsort(weights)[::-1][:5]
            total = float(weights[order].sum()) or 1.0
            explanation = [
                {"feature": FEATURES[i].replace("_", " ").title(), "impact": round(float(weights[i] / total), 3)}
                for i in order
            ]
        except Exception:
            pass

    if not explanation:
        importances = getattr(risk_model, "feature_importances_", np.ones(len(FEATURES)) / len(FEATURES))
        weights = importances * np.abs(X.iloc[0].to_numpy())
        order = np.argsort(weights)[::-1][:5]
        total = float(weights[order].sum()) or 1.0
        explanation = [
            {"feature": FEATURES[i].replace("_", " ").title(), "impact": round(float(weights[i] / total), 3)}
            for i in order
        ]

    return PredictionResult(
        pipeline_id=pipeline_id,
        risk_score=score,
        risk_level=level,
        time_to_failure=_ttf(rul),
        confidence=confidence,
        severity=severity,
        estimated_rul_hours=rul,
        recommended_action=_action(level, pipeline_id),
        shap_explanation=explanation,
        model_version=MODEL_VERSION,
        model_probability=round(model_probability, 4),
        anomaly_score=round(anomaly_score, 4),
        persistence_score=round(persistence, 4),
        model_type="Random Forest + Isolation Forest hybrid",
    )
