<div align="center">
  <img src="./docs/logo.png" width="200" alt="Nexus Venue Logo">
  <h1>Nexus Smart Venue Management</h1>
  <p>A production-ready microservices architecture optimizing physical event experiences using Predictive AI, Liquid Glass Mobile UIs, and real-time IoT Gateways.</p>
</div>

## ✨ Project Overview
Built for the Google Promptwars Virtual Challenge, this framework drastically improves the attendee physical event experience at large-scale sporting venues through predictive queue management, smart facility routing, and actionable crowd navigation. 

We transitioned our initial architectural mockup into a completely live, fully-functioning local multi-terminal fleet consisting of 4 dedicated node architectures.

## 🎯 Features
- **Liquid Glass Motion UI:** Built cross-platform beautifully using `react-native-reanimated`, `moti`, and `expo-blur`.
- **Live Queue Prediction:** Simulated hardware sensors ping localized node gateways to calculate congestion.
- **Predictive AI Engine:** FastApi backend processes streaming matrices to dynamically issue routing redirects.
- **Zero-Latency WebSockets:** The entire loop completes in real-time, bridging hardware streams directly to the Attendee’s mobile device.

---

## 📽️ End-To-End Live Demo
Observe the newly integrated GSAP-style staggered presentation physics intersecting with the simulated hardware flow data:

![React Native Live Demo](./promptwar_google/docs/demo.webp)

---

## 🏗️ Detailed System Architecture
This diagram outlines the complete multi-terminal local deployment architecture that drives this app natively and locally:

```mermaid
graph TD
    subgraph Frontend [React Native Attendee App]
        UI[Liquid Glass UI & Moti]
        Context[React Event State]
    end

    subgraph Internal_Gateway [Node.js Edge ]
        WS[WebSocket Distributer]
        Proxy[Async Express Bridge]
    end

    subgraph AI_Engine [Python FastAPI]
        Model[NumPy Flow Algorithims]
        Risk[Risk Tolerance Emitter]
    end

    subgraph IoT_Hardware [Hardware Mock Layer]
        Sensors[Cameras / WiFi Positioning]
    end

    %% Data Flow
    Sensors -- "JSON Telemetry Stream\n(Capacity & Wait Times)" --> Proxy
    Proxy -- "Deep Telemetry Inspection" --> Model
    Model -- "AI Sector Risk Calculation" --> Risk
    Risk -- "Aggregated JSON Overhaul" --> Proxy
    Proxy -- "Subscribed Connection Pool" --> WS
    WS -- "Real-Time WSS Beam" --> Context
    Context -- "State Trigger" --> UI
```

---

## 💻 Tech Stack
1. **Frontend:** React Native (Expo), Moti (Reanimated 3), React DOM.
2. **Gateway:** Node.js, Express, `ws` (WebSockets Webpack).
3. **AI Backend:** Python 3, FastAPI, Uvicorn, NumPy, Pydantic.
4. **IoT Simulator:** Node Vanilla Scripts.

## 🚀 How to Run Locally 
To boot this exact implementation frame upon your local machine:
1. **Boot Python Backend:** `cd ai-service` -> `pip install -r requirements.txt` -> `python -m uvicorn main:app --port 8000`
2. **Boot API Gateway:** `cd backend-service` -> `node index.js`
3. **Boot Hardware Simulator:** `cd hardware-mocks` -> `node sim_cameras.js`
4. **Boot App Interface:** `cd mobile-app` -> `npx expo start -c --web`
