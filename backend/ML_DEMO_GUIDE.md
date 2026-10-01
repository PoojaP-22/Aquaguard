# AquaGuard AI — ML Demo Guide

## What is trained
- 57,600 synthetic multi-sensor observations from 240 pipeline assets × 240 hours.
- Asset-level split: 168 train assets, 36 validation assets, 36 test assets.
- Risk model: Random Forest classifier.
- Anomaly model: Isolation Forest.
- Severity model: Random Forest classifier.
- RUL model: Random Forest regressor.
- Hybrid risk: 65% supervised probability + 25% anomaly score + 10% persistence.
- SHAP TreeExplainer is used for feature contributions when available.

## Validation snapshot
- ROC-AUC: 0.999
- PR-AUC: 0.9686
- F1: 0.8964
- RUL MAE: 6.98 hours

These are synthetic-data validation results and should not be presented as field performance.

## Train from scratch
From `backend`:

```powershell
py -3.12 -m pip install -r requirements.txt
py -3.12 -m app.ml.train
py -3.12 -m app.seed
py -3.12 -m uvicorn app.main:app --reload
```

## Demo endpoints
- `/health`
- `/api/predictions/model/info`
- `/api/predictions/P04`
- `/docs`

## Suggested mentor demo
1. Open the dashboard and show the `AquaGuard-ML-1.0` badge.
2. Open P04 and show Critical risk.
3. Show model probability, anomaly score, RUL, and SHAP features.
4. Open `/api/predictions/model/info` to show the trained model metadata and validation metrics.
5. Explain that the current data is synthetic and the next research step is validation with real sensor streams.
