"""
Tests for the Nexus AI Engine (FastAPI).
Run with: python -m pytest tests/ -v
"""
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path so we can import main
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

client = TestClient(app)


class TestHealthEndpoint:
    def test_health_returns_200(self):
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_returns_service_name(self):
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "ok"
        assert "service" in data


class TestPredictCrowd:
    def test_low_risk_prediction(self):
        """Low occupancy + low flow rate should yield 'low' risk."""
        response = client.post("/predict_crowd", json={
            "sector_id": "sectorA",
            "current_occupancy": 100,
            "flow_rate": 2.0
        })
        assert response.status_code == 200
        data = response.json()
        assert data["sector_id"] == "sectorA"
        assert data["risk_warning"] == "low"
        assert data["reroute_recommended"] is False

    def test_medium_risk_prediction(self):
        """Medium occupancy should yield 'medium' risk."""
        response = client.post("/predict_crowd", json={
            "sector_id": "sectorB",
            "current_occupancy": 280,
            "flow_rate": 2.0
        })
        assert response.status_code == 200
        data = response.json()
        assert data["risk_warning"] == "medium"
        assert data["reroute_recommended"] is False

    def test_high_risk_prediction(self):
        """High occupancy + high flow should yield 'high' risk and reroute."""
        response = client.post("/predict_crowd", json={
            "sector_id": "sectorC",
            "current_occupancy": 500,
            "flow_rate": 3.0
        })
        assert response.status_code == 200
        data = response.json()
        assert data["risk_warning"] == "high"
        assert data["reroute_recommended"] is True

    def test_projected_occupancy_calculation(self):
        """Verify the projection formula: current + (flow_rate * 15)."""
        response = client.post("/predict_crowd", json={
            "sector_id": "test",
            "current_occupancy": 200,
            "flow_rate": 4.0
        })
        data = response.json()
        assert data["projected_occupancy"] == 260  # 200 + (4.0 * 15)

    def test_zero_occupancy(self):
        """Edge case: zero occupancy."""
        response = client.post("/predict_crowd", json={
            "sector_id": "empty",
            "current_occupancy": 0,
            "flow_rate": 0.0
        })
        assert response.status_code == 200
        data = response.json()
        assert data["projected_occupancy"] == 0
        assert data["risk_warning"] == "low"

    def test_invalid_payload_missing_fields(self):
        """Missing required fields should return 422."""
        response = client.post("/predict_crowd", json={
            "sector_id": "incomplete"
        })
        assert response.status_code == 422
