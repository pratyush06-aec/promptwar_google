# Contributing to Nexus Smart Venue Management

Thank you for considering contributing to Nexus Venue! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **npm** ≥ 9.x
- **Expo CLI** (`npx expo`)
- **Git**

### Local Development Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/<your-username>/promptwar_google.git
   cd promptwar_google
   ```

2. **Install Dependencies**
   ```bash
   # Gateway
   cd services/gateway && npm install

   # AI Engine
   cd services/ai-engine && pip install -r requirements.txt

   # Client
   cd client && npm install
   ```

3. **Run the Full Stack** (4 terminals)
   ```bash
   # Terminal 1 — AI Engine
   cd services/ai-engine && python -m uvicorn main:app --port 8000

   # Terminal 2 — API Gateway
   cd services/gateway && node index.js

   # Terminal 3 — Hardware Simulator
   cd services/hardware-simulator && node sim_cameras.js

   # Terminal 4 — Client (Expo Web)
   cd client && npx expo start -c --web
   ```

## 📁 Project Structure

```
promptwar_google/
├── client/                    # React Native / Expo attendee app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Contexts (Auth, Theme)
│   │   ├── screens/           # Full-screen views
│   │   └── themes/            # Color palettes
│   └── __tests__/             # Client test suite
├── services/
│   ├── gateway/               # Node.js API Gateway + WebSocket
│   │   ├── routes/            # Express route handlers
│   │   └── tests/             # Gateway test suite
│   ├── ai-engine/             # Python FastAPI AI service
│   │   └── tests/             # AI test suite
│   └── hardware-simulator/    # IoT telemetry mock
├── dashboard-preview/         # Static HTML/CSS/JS prototype
└── docs/                      # Logo, demo recordings
```

## 🌿 Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/<short-description>` | `feature/mapbox-integration` |
| Bug fix | `fix/<short-description>` | `fix/websocket-reconnect` |
| Docs | `docs/<short-description>` | `docs/api-reference` |
| Refactor | `refactor/<short-description>` | `refactor/extract-components` |

## 📝 Pull Request Checklist

Before submitting a PR, please ensure:

- [ ] Code compiles/runs without errors
- [ ] All existing tests pass (`npm test` / `pytest`)
- [ ] New features include tests
- [ ] No `console.log` statements left in production code
- [ ] README updated if introducing new features or changing setup steps
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)

## 🧪 Running Tests

```bash
# AI Engine
cd services/ai-engine && python -m pytest tests/ -v

# Gateway
cd services/gateway && npm test

# Client
cd client && npm test
```

## 🐛 Reporting Issues

When reporting issues, please include:
1. **Description** — what happened vs. what you expected
2. **Steps to reproduce** — minimal reproduction steps
3. **Environment** — OS, Node version, Python version, browser
4. **Logs/Screenshots** — any relevant terminal output or screenshots

## 💡 Code Style

- **JavaScript:** Use `const`/`let` (no `var`), arrow functions, template literals
- **Python:** Follow PEP 8, type hints encouraged
- **React Native:** Functional components only, hooks for state management
- **Naming:** `camelCase` for JS, `snake_case` for Python

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
