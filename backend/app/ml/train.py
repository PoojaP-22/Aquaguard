"""Train AquaGuard predictive-maintenance models on reproducible synthetic data.

Provides:
- Strict asset-level train/validation/test split (no data leakage).
- Supervised Random Forest Classifier for leak risk & failure prediction.
- Random Forest Regressor for Remaining Useful Life (RUL hours).
- Random Forest Classifier for fault severity (0-3).
- Unsupervised Isolation Forest for real-time anomaly detection.
- Comparison against Heuristic and Logistic Regression baselines.
- Comprehensive evaluation metrics (ROC-AUC, PR-AUC, Precision, Recall, F1, Confusion Matrix, RUL MAE).
"""
from pathlib import Path
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    confusion_matrix,
    mean_absolute_error,
    root_mean_squared_error,
)
import joblib

ROOT = Path(__file__).resolve().parent
ART = ROOT / "artifacts"
ART.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(42)

FEATURES = [
    "pressure_in_bar",
    "pressure_out_bar",
    "pressure_gradient_bar",
    "flow_lpm",
    "vibration_rms",
    "acoustic_rms",
    "turbidity_ntu",
    "ambient_temp_c",
    "demand_index",
    "pipe_age_years",
    "diameter_mm",
    "corrosion_index",
    "sensor_missing_count",
]


def make_data(n_assets=240, hours=240):
    """Generate realistic synthetic hydraulic degradation telemetry across assets."""
    rows = []
    for asset in range(1, n_assets + 1):
        age = RNG.uniform(3, 35)
        diameter = RNG.choice([100, 150, 200, 250, 300])
        material = RNG.choice([0, 1, 2])
        corrosion = np.clip(RNG.beta(2, 5) + max(age - 15, 0) / 60, 0, 1)
        base_pressure = RNG.normal(1.10, 0.06)
        base_flow = RNG.normal(45, 5)
        event_start = int(RNG.integers(120, 220)) if RNG.random() < 0.72 else 9999
        event_strength = RNG.uniform(0.45, 1.0)
        for h in range(hours):
            phase = h / hours * 2 * np.pi
            degradation = (
                max(0, (h - event_start) / max(1, hours - event_start)) * event_strength
                if h >= event_start
                else 0
            )
            demand = np.clip(0.85 + 0.18 * np.sin(phase) + RNG.normal(0, 0.05), 0.4, 1.3)
            p_in = base_pressure + 0.035 * np.sin(phase) + RNG.normal(0, 0.025) - 0.08 * degradation
            p_out = p_in - 0.06 - 0.32 * degradation + RNG.normal(0, 0.02)
            grad = max(0, p_in - p_out)
            flow = base_flow * demand * (1 - 0.20 * degradation) + RNG.normal(0, 1.8)
            vibration = max(0, RNG.normal(2.1, 0.45) + 7.0 * degradation + 0.7 * corrosion)
            acoustic = max(0, RNG.normal(3.0, 0.65) + 10.0 * degradation + 1.0 * corrosion)
            turbidity = max(0, RNG.normal(2.0, 0.5) + 12 * degradation + 2 * corrosion)
            temp = 25 + 5 * np.sin(phase) + RNG.normal(0, 1)
            missing = int(RNG.random() < 0.035) + int(RNG.random() < 0.012)
            risk = np.clip(
                0.10
                + 0.42 * degradation
                + 0.16 * corrosion
                + 0.10 * (age / 35)
                + 0.10 * np.clip((grad - 0.10) / 0.28, 0, 1)
                + 0.07 * np.clip((vibration - 3) / 7, 0, 1)
                + 0.05 * np.clip((acoustic - 5) / 10, 0, 1)
                + 0.04 * np.clip((turbidity - 4) / 14, 0, 1)
                + 0.04 * np.clip(abs(flow - 45) / 20, 0, 1)
                + RNG.normal(0, 0.018),
                0,
                1,
            )
            fail = int(risk >= 0.58)
            severity = 0 if risk < 0.35 else (1 if risk < 0.55 else (2 if risk < 0.75 else 3))
            rul = float(np.clip(168 * (1 - risk) + RNG.normal(0, 8), 4, 168))
            rows.append(
                [
                    asset,
                    p_in,
                    p_out,
                    grad,
                    flow,
                    vibration,
                    acoustic,
                    turbidity,
                    temp,
                    demand,
                    age,
                    diameter,
                    corrosion,
                    missing,
                    fail,
                    severity,
                    rul,
                ]
            )
    cols = ["asset_id"] + FEATURES + ["maintenance_required_24h", "severity", "rul_hours"]
    return pd.DataFrame(rows, columns=cols)


def main():
    print("[1/5] Generating synthetic multi-sensor dataset with asset-level disjoint partitioning...")
    df = make_data()

    # Asset-level split prevents temporal data leakage across observations from the same asset
    train_assets = set(range(1, 169))
    val_assets = set(range(169, 205))
    test_assets = set(range(205, 241))

    train = df[df.asset_id.isin(train_assets)].copy()
    val = df[df.asset_id.isin(val_assets)].copy()
    test = df[df.asset_id.isin(test_assets)].copy()

    Xtr = train[FEATURES]
    ytr = train.maintenance_required_24h
    Xval = val[FEATURES]
    yval = val.maintenance_required_24h
    Xte = test[FEATURES]
    yte = test.maintenance_required_24h

    # 1. Baseline 1: Simple Heuristic Rule (Threshold on pressure gradient & drop)
    print("[2/5] Evaluating Baseline 1 (Heuristic Threshold) and Baseline 2 (Logistic Regression)...")
    heuristic_pred = ((Xte["pressure_gradient_bar"] > 0.14) | (Xte["pressure_in_bar"] < 0.95)).astype(int)
    base_prec = precision_score(yte, heuristic_pred, zero_division=0)
    base_rec = recall_score(yte, heuristic_pred, zero_division=0)
    base_f1 = f1_score(yte, heuristic_pred, zero_division=0)

    # 2. Baseline 2: Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(Xtr, ytr)
    lr_probs = lr.predict_proba(Xte)[:, 1]
    lr_pred = (lr_probs >= 0.5).astype(int)
    lr_auc = roc_auc_score(yte, lr_probs)
    lr_pr = average_precision_score(yte, lr_probs)
    lr_prec = precision_score(yte, lr_pred, zero_division=0)
    lr_rec = recall_score(yte, lr_pred, zero_division=0)
    lr_f1 = f1_score(yte, lr_pred, zero_division=0)

    # 3. Supervised Model: Random Forest Classifier for 24h failure risk
    print("[3/5] Fitting supervised Random Forest Risk, Severity & RUL models...")
    risk = RandomForestClassifier(
        n_estimators=90,
        max_depth=12,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    risk.fit(Xtr, ytr)

    sev = RandomForestClassifier(
        n_estimators=70,
        max_depth=12,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    sev.fit(Xtr, train.severity)

    rul = RandomForestRegressor(
        n_estimators=70,
        max_depth=14,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1,
    )
    rul.fit(Xtr, train.rul_hours)

    # 4. Unsupervised Model: Isolation Forest for Anomaly Detection (fit on healthy normal state)
    print("[4/5] Fitting Isolation Forest on nominal baseline telemetry...")
    normal = train[train.maintenance_required_24h == 0][FEATURES]
    anomaly = IsolationForest(n_estimators=80, contamination=0.08, random_state=42, n_jobs=-1)
    anomaly.fit(normal)

    # 5. Model Evaluation
    print("[5/5] Computing final evaluation metrics and persisting model artifacts...")
    probs = risk.predict_proba(Xte)[:, 1]
    pred = (probs >= 0.5).astype(int)

    auc = roc_auc_score(yte, probs)
    ap = average_precision_score(yte, probs)
    prec = precision_score(yte, pred, zero_division=0)
    rec = recall_score(yte, pred, zero_division=0)
    f1 = f1_score(yte, pred, zero_division=0)
    cm = confusion_matrix(yte, pred).tolist()  # [[TN, FP], [FN, TP]]

    rul_pred = rul.predict(Xte)
    mae = mean_absolute_error(test.rul_hours, rul_pred)
    rmse = root_mean_squared_error(test.rul_hours, rul_pred)

    # Feature importances
    importances = dict(
        sorted(
            {feat: round(float(imp), 4) for feat, imp in zip(FEATURES, risk.feature_importances_)}.items(),
            key=lambda x: x[1],
            reverse=True,
        )
    )

    # Persist joblib artifacts
    joblib.dump(risk, ART / "risk_model.joblib")
    joblib.dump(sev, ART / "severity_model.joblib")
    joblib.dump(rul, ART / "rul_model.joblib")
    joblib.dump(anomaly, ART / "anomaly_model.joblib")

    metrics = {
        "model_version": "AquaGuard-ML-1.1",
        "random_seed": 42,
        "dataset": {
            "source": "Synthetic multi-sensor hydraulic degradation simulation",
            "asset_split_strategy": "Asset-level disjoint partitioning (168 train, 36 val, 36 test)",
            "leakage_prevention": "Strict asset-level separation ensures no temporal or asset-specific leakage between train and test sets.",
            "limitations": "Model trained on synthetic physics-informed degradation; field validation requires empirical water utility telemetry.",
            "dataset_rows": int(len(df)),
            "train_rows": int(len(train)),
            "validation_rows": int(len(val)),
            "test_rows": int(len(test)),
        },
        "baseline_comparison": {
            "heuristic_threshold": {
                "description": "Rule-based baseline flagging failure when pressure gradient > 0.14 bar or inlet pressure < 0.95 bar",
                "test_precision": round(float(base_prec), 4),
                "test_recall": round(float(base_rec), 4),
                "test_f1": round(float(base_f1), 4),
            },
            "logistic_regression": {
                "test_roc_auc": round(float(lr_auc), 4),
                "test_pr_auc": round(float(lr_pr), 4),
                "test_precision": round(float(lr_prec), 4),
                "test_recall": round(float(lr_rec), 4),
                "test_f1": round(float(lr_f1), 4),
            },
            "random_forest_risk_model": {
                "test_roc_auc": round(float(auc), 4),
                "test_pr_auc": round(float(ap), 4),
                "test_precision": round(float(prec), 4),
                "test_recall": round(float(rec), 4),
                "test_f1": round(float(f1), 4),
                "confusion_matrix": {
                    "true_negatives": cm[0][0],
                    "false_positives": cm[0][1],
                    "false_negatives": cm[1][0],
                    "true_positives": cm[1][1],
                },
            },
        },
        "rul_model": {
            "test_rul_mae_hours": round(float(mae), 2),
            "test_rul_rmse_hours": round(float(rmse), 2),
        },
        "feature_importances": importances,
        "technical_distinctions": {
            "anomaly_detection": "Isolation Forest detects instantaneous out-of-distribution sensor anomalies.",
            "leak_detection": "Random Forest Classifier estimates the current degradation and vulnerability probability.",
            "future_failure_prediction": "Random Forest Regressor predicts remaining useful life (RUL in hours) before total breach.",
            "explainability": "TreeSHAP decomposes risk into segment-specific sensor and structural feature attributions.",
        },
    }

    ART.joinpath("metrics.json").write_text(json.dumps(metrics, indent=2))
    ART.joinpath("feature_config.json").write_text(
        json.dumps({"features": FEATURES, "model_version": "AquaGuard-ML-1.1"}, indent=2)
    )
    df.sample(min(10000, len(df)), random_state=42).to_csv(ART / "synthetic_sample.csv", index=False)

    print("\nTraining completed successfully! Summary:")
    print(f"- Heuristic Baseline F1: {base_f1:.4f}")
    print(f"- Logistic Regression F1: {lr_f1:.4f} (ROC-AUC: {lr_auc:.4f})")
    print(f"- Random Forest F1: {f1:.4f} (ROC-AUC: {auc:.4f}, PR-AUC: {ap:.4f})")
    print(f"- RUL MAE: {mae:.2f} hours")
    print(f"- Top 3 Features: {list(importances.keys())[:3]}")


if __name__ == "__main__":
    main()
