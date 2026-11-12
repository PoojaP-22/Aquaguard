import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pipeline import Pipeline
from app.services.prediction_service import predict_pipeline_risk, MODEL_VERSION, FEATURES
from app.services.phi_service import calculate_phi, phi_to_status

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


@router.get("/model/info", summary="Get model architecture, features, and evaluation metrics")
def get_model_info():
    art = Path(__file__).resolve().parent.parent / "ml" / "artifacts"
    metrics = json.loads((art / "metrics.json").read_text())
    return {
        "model_version": MODEL_VERSION,
        "model_type": "Random Forest + Isolation Forest hybrid",
        "features": FEATURES,
        "evaluation": metrics,
    }


@router.get("/{pipeline_id}", summary="Run live ML inference for a pipeline")
def get_prediction(pipeline_id: str, db: Session = Depends(get_db)):
    pipeline = db.query(Pipeline).filter(Pipeline.pipeline_id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail=f"Pipeline '{pipeline_id}' not found")
    result = predict_pipeline_risk(pipeline.pipeline_id, pipeline.pressure, pipeline.flow)
    pipeline.leak_risk = result["risk_score"]
    pipeline.time_to_failure = result["time_to_failure"]
    pipeline.phi = calculate_phi(result["risk_score"], pipeline.pressure, pipeline.flow)
    pipeline.status = phi_to_status(pipeline.phi)
    db.commit()
    return result


@router.get("", summary="Run live ML inference across all pipelines")
def get_all_predictions(db: Session = Depends(get_db)):
    pipelines = db.query(Pipeline).order_by(Pipeline.pipeline_id).all()
    results = []
    for p in pipelines:
        result = predict_pipeline_risk(p.pipeline_id, p.pressure, p.flow)
        p.leak_risk = result["risk_score"]
        p.time_to_failure = result["time_to_failure"]
        p.phi = calculate_phi(result["risk_score"], p.pressure, p.flow)
        p.status = phi_to_status(p.phi)
        results.append(result)
    db.commit()
    return results
