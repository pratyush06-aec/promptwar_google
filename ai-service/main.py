from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="Nexus Predictive AI Service")

class HardwareTelemetry(BaseModel):
    sector_id: str
    current_occupancy: int
    flow_rate: float

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python ML Service"}

@app.post("/predict_crowd")
def predict_crowd(telemetry: HardwareTelemetry):
    # Mock ML inference logic based on historical + live telemetry
    projected_occupancy = telemetry.current_occupancy + (telemetry.flow_rate * 15) # predict 15 mins out
    risk_level = "low"
    
    if projected_occupancy > 500:
        risk_level = "high"
    elif projected_occupancy > 300:
        risk_level = "medium"
        
    return {
        "sector_id": telemetry.sector_id,
        "projected_occupancy": int(projected_occupancy),
        "risk_warning": risk_level,
        "reroute_recommended": risk_level == "high"
    }
