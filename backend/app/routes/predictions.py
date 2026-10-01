from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.pipeline import Pipeline
from app.services.prediction_service import predict_pipeline_risk, MODEL_VERSION, FEATURES

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

@router.get("/model/info")
def get_model_info():
    import json
    from pathlib import Path
    art = Path(__file__).resolve().parent.parent / "ml" / "artifacts"
    metrics = json.loads((art / "metrics.json").read_text())
    return {"model_version": MODEL_VERSION, "model_type": "Random Forest + Isolation Forest hybrid", "features": FEATURES, "training": metrics}

@router.get("/{pipeline_id}")
def get_prediction(pipeline_id: str, db: Session = Depends(get_db)):
    pipeline = db.query(Pipeline).filter(Pipeline.pipeline_id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail=f"Pipeline '{pipeline_id}' not found")
    result = predict_pipeline_risk(pipeline.pipeline_id, pipeline.pressure, pipeline.flow)
    pipeline.leak_risk = result["risk_score"]
    pipeline.time_to_failure = result["time_to_failure"]
    pipeline.status = {"Low":"Healthy", "Medium":"Warning", "High":"High Risk", "Critical":"Critical"}[result["risk_level"]]
    pipeline.phi = round(100 - result["risk_score"], 1)
    db.commit()
    return result

@router.get("")
def get_all_predictions(db: Session = Depends(get_db)):
    pipelines = db.query(Pipeline).order_by(Pipeline.pipeline_id).all()
    results = []
    for p in pipelines:
        result = predict_pipeline_risk(p.pipeline_id, p.pressure, p.flow)
        p.leak_risk = result["risk_score"]
        p.time_to_failure = result["time_to_failure"]
        p.status = {"Low":"Healthy", "Medium":"Warning", "High":"High Risk", "Critical":"Critical"}[result["risk_level"]]
        p.phi = round(100 - result["risk_score"], 1)
        results.append(result)
    db.commit()
    return results
