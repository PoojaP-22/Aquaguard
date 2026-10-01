"""Train AquaGuard predictive-maintenance models on reproducible synthetic data."""
from pathlib import Path
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, IsolationForest
from sklearn.metrics import roc_auc_score, average_precision_score, f1_score, mean_absolute_error
from sklearn.model_selection import train_test_split
import joblib

ROOT = Path(__file__).resolve().parent
ART = ROOT / "artifacts"
ART.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(42)
FEATURES = [
    "pressure_in_bar","pressure_out_bar","pressure_gradient_bar","flow_lpm",
    "vibration_rms","acoustic_rms","turbidity_ntu","ambient_temp_c",
    "demand_index","pipe_age_years","diameter_mm","corrosion_index",
    "sensor_missing_count"
]

def make_data(n_assets=240, hours=240):
    rows=[]
    for asset in range(1,n_assets+1):
        age=RNG.uniform(3,35); diameter=RNG.choice([100,150,200,250,300]); material=RNG.choice([0,1,2])
        corrosion=np.clip(RNG.beta(2,5)+max(age-15,0)/60,0,1)
        base_pressure=RNG.normal(1.10,0.06); base_flow=RNG.normal(45,5)
        event_start=int(RNG.integers(120,220)) if RNG.random()<0.72 else 9999
        event_strength=RNG.uniform(0.45,1.0)
        for h in range(hours):
            phase=h/hours*2*np.pi
            degradation=max(0,(h-event_start)/max(1,hours-event_start))*event_strength if h>=event_start else 0
            demand=np.clip(0.85+0.18*np.sin(phase)+RNG.normal(0,0.05),0.4,1.3)
            p_in=base_pressure+0.035*np.sin(phase)+RNG.normal(0,0.025)-0.08*degradation
            p_out=p_in-0.06-0.32*degradation+RNG.normal(0,0.02)
            grad=max(0,p_in-p_out)
            flow=base_flow*demand*(1-0.20*degradation)+RNG.normal(0,1.8)
            vibration=max(0,RNG.normal(2.1,0.45)+7.0*degradation+0.7*corrosion)
            acoustic=max(0,RNG.normal(3.0,0.65)+10.0*degradation+1.0*corrosion)
            turbidity=max(0,RNG.normal(2.0,0.5)+12*degradation+2*corrosion)
            temp=25+5*np.sin(phase)+RNG.normal(0,1)
            missing=int(RNG.random()<0.035)+int(RNG.random()<0.012)
            risk=np.clip(0.10 + 0.42*degradation + 0.16*corrosion + 0.10*(age/35) +
                         0.10*np.clip((grad-0.10)/0.28,0,1) + 0.07*np.clip((vibration-3)/7,0,1)+
                         0.05*np.clip((acoustic-5)/10,0,1)+0.04*np.clip((turbidity-4)/14,0,1)+
                         0.04*np.clip(abs(flow-45)/20,0,1)+RNG.normal(0,0.018),0,1)
            fail=int(risk>=0.58)
            severity=0 if risk<0.35 else (1 if risk<0.55 else (2 if risk<0.75 else 3))
            rul=float(np.clip(168*(1-risk)+RNG.normal(0,8),4,168))
            rows.append([asset,p_in,p_out,grad,flow,vibration,acoustic,turbidity,temp,demand,age,diameter,corrosion,missing,fail,severity,rul])
    cols=["asset_id"]+FEATURES[:-1]+["sensor_missing_count","maintenance_required_24h","severity","rul_hours"]
    # FEATURES already includes sensor_missing_count; build exact columns explicitly
    cols=["asset_id"]+FEATURES+ ["maintenance_required_24h","severity","rul_hours"]
    return pd.DataFrame(rows,columns=cols)

def main():
    df=make_data()
    train_assets=set(range(1,169)); val_assets=set(range(169,205)); test_assets=set(range(205,241))
    train=df[df.asset_id.isin(train_assets)].copy(); val=df[df.asset_id.isin(val_assets)].copy(); test=df[df.asset_id.isin(test_assets)].copy()
    Xtr=train[FEATURES]; ytr=train.maintenance_required_24h
    Xte=test[FEATURES]; yte=test.maintenance_required_24h
    risk=RandomForestClassifier(n_estimators=90,max_depth=12,min_samples_leaf=3,class_weight="balanced",random_state=42,n_jobs=-1)
    risk.fit(Xtr,ytr)
    sev=RandomForestClassifier(n_estimators=70,max_depth=12,min_samples_leaf=3,class_weight="balanced",random_state=42,n_jobs=-1)
    sev.fit(Xtr,train.severity)
    rul=RandomForestRegressor(n_estimators=70,max_depth=14,min_samples_leaf=3,random_state=42,n_jobs=-1)
    rul.fit(Xtr,train.rul_hours)
    normal=train[train.maintenance_required_24h==0][FEATURES]
    anomaly=IsolationForest(n_estimators=80,contamination=0.08,random_state=42,n_jobs=-1)
    anomaly.fit(normal)
    ART.joinpath("risk_model.joblib").write_bytes(joblib.dumps(risk)) if hasattr(joblib,'dumps') else joblib.dump(risk,ART/"risk_model.joblib")
    joblib.dump(sev,ART/"severity_model.joblib"); joblib.dump(rul,ART/"rul_model.joblib"); joblib.dump(anomaly,ART/"anomaly_model.joblib")
    probs=risk.predict_proba(Xte)[:,1]; pred=(probs>=0.5).astype(int)
    auc=roc_auc_score(yte,probs); ap=average_precision_score(yte,probs); f1=f1_score(yte,pred)
    rul_pred=rul.predict(Xte); mae=mean_absolute_error(test.rul_hours,rul_pred)
    metrics={"dataset_rows":int(len(df)),"train_rows":int(len(train)),"validation_rows":int(len(val)),"test_rows":int(len(test)),"test_roc_auc":round(float(auc),4),"test_pr_auc":round(float(ap),4),"test_f1":round(float(f1),4),"test_rul_mae_hours":round(float(mae),2),"random_seed":42,"model_version":"AquaGuard-ML-1.0"}
    ART.joinpath("metrics.json").write_text(json.dumps(metrics,indent=2))
    ART.joinpath("feature_config.json").write_text(json.dumps({"features":FEATURES,"model_version":"AquaGuard-ML-1.0"},indent=2))
    df.sample(min(10000,len(df)),random_state=42).to_csv(ART/"synthetic_sample.csv",index=False)
    print(json.dumps(metrics,indent=2))

if __name__=='__main__': main()
