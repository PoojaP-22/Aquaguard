# AquaGuard AI 2.0 — Semester Delivery Pack

## Product scope
AquaGuard is an explainable predictive-maintenance decision-support prototype for water distribution assets. It combines telemetry ingestion, ML inference, condition scoring, alert workflows and maintenance prioritisation.

## Implemented in this branch
- Operations Command Center with backend-driven KPIs, alert list and maintenance queue.
- GIS Network Map workspace with live pipeline records, status colouring, search, asset inspector and navigation to asset details.
- API client methods for backend dashboard history and simulation endpoints.
- Dashboard trend chart now consumes GET /api/dashboard/history rather than synthesising a sinusoidal frontend history.
- Consistent dark navy / teal operations shell and a light GIS asset workspace.

## Important data-integrity boundaries
- The GIS view is a schematic topology illustration because the current backend does not expose surveyed coordinates or GeoJSON pipe geometry. Do not use schematic positions for field dispatch.
- Telemetry is simulated unless a physical sensor gateway is actually connected. The UI labels this mode explicitly.
- The ML artifacts are trained on synthetic observations. Reported metrics are synthetic test-set metrics, not field-validated accuracy.
- RUL is learned from a synthetic target generated from the risk function; it is not yet a field-calibrated rupture-time forecast.
- The persistence component currently has a default derived from model probability when no external persistence feature is supplied.

## Local verification
Frontend: cd frontend && npm install && npm run build && npm run lint
Backend: install backend/requirements.txt, then run uvicorn app.main:app --app-dir backend --reload
API docs: http://127.0.0.1:8000/docs

## Remaining engineering milestones
1. Add surveyed pipeline coordinates and GeoJSON geometry, then integrate a true GIS renderer and map provider.
2. Standardise pressure/flow units across schemas, simulator, training data, feature config and inference; retrain artifacts after any feature/unit changes.
3. Connect remaining pages to real APIs and remove mock/placeholder records.
4. Add secure authentication, role-based access, audit logs and deployment secrets management.
5. Integrate physical sensor gateways over MQTT/HTTPS with device identity, timestamps and data-quality flags.
6. Validate model calibration and generalisation using utility field data and temporal/asset holdouts.

## Semester presentation outline
1. Title and project overview
2. Water distribution maintenance problem
3. Existing approaches and research gap
4. Proposed AquaGuard workflow
5. Novelty and project contribution
6. System architecture
7. Dataset and feature engineering
8. Random Forest risk classification
9. Isolation Forest anomaly detection
10. Severity and RUL modelling
11. Hybrid risk scoring and PHI
12. SHAP explainability
13. Alert lifecycle and repair prioritisation
14. Application demonstration
15. Synthetic test results and baseline comparison
16. Real-world relevance and potential impact
17. Limitations and research validity
18. Future enhancements and conclusion
## Simulation Lab
The /simulation workspace exposes controlled demo actions through the existing FastAPI simulation API:
- Inject a leak_pressure_drop fault for a selected pipeline with severity between 0.10 and 1.00.
- Inspect active in-memory faults and current pipeline condition values.
- Advance one simulation tick across the network.
- Clear a selected fault or reset the entire simulated network.
Reset is intentionally guarded with a confirmation dialog because it restores nominal telemetry and resolves active/acknowledged alerts.

## Automated quality checks
The GitHub Actions workflow at .github/workflows/quality.yml runs on pull requests to main and pushes to main/aquaguard-2.0. It installs locked frontend dependencies, runs Oxlint and Vite production build, installs backend requirements on Python 3.11, compiles backend modules and runs pip check.

## Sensor Telemetry workspace (2.0 follow-up)

The Sensor Telemetry page now reads actual records from the backend instead of importing the frontend mock dataset. It requests the latest record per sensor from `GET /api/sensors` and the newest 100 readings from `GET /api/sensors/recent/all`. The page derives online/offline counts from returned records, shows loading and API-error states, and offers CSV export through `GET /api/sensors/export/csv`. The gateway panel is deliberately labelled as backend telemetry-service status; the database does not currently provide a physical ESP32 heartbeat, so the UI does not claim that a hardware gateway is online.

### Sensor telemetry verification

1. Start the backend and confirm the database seed has run.
2. Open Sensor Telemetry and verify the sensor count matches `GET /api/sensors`.
3. Ingest a pressure or flow record using `POST /api/sensors`, refresh the page, and confirm the new reading appears at the top of Recent Sensor Readings.
4. Use Export CSV and confirm the downloaded file contains the API's timestamp, sensor ID, pipeline ID, sensor type, value, unit, and status columns.
5. Stop the backend and verify the page displays an API error rather than presenting stale mock readings as live telemetry.

The readings are application/database telemetry and may be seeded or simulated; they are not evidence of a deployed physical sensor network.

## Maintenance workflow (2.0 follow-up)

Maintenance Logs now reads and writes through the FastAPI maintenance endpoints rather than the frontend-only sample log state. The page loads records from `GET /api/maintenance`, creates records with `POST /api/maintenance`, and updates status with `PUT /api/maintenance/{id}`. It displays the persisted pipeline, issue, priority, action, assigned engineer and status fields. Completing a record uses the backend's existing completion behaviour, including resolving outstanding alerts for that pipeline.

### Maintenance workflow verification

1. Open Maintenance Logs with the backend running and confirm records match `GET /api/maintenance`.
2. Add a record and verify it is returned by the API and remains visible after a page refresh.
3. Change a record from Pending or In Progress to Completed and verify `completed_at` is populated by the backend.
4. If the pipeline has an active alert, verify the backend completion workflow resolves it.
5. Stop the backend and confirm the page shows an API error rather than displaying frontend sample maintenance records.
