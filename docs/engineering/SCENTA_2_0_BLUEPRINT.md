# Scenta 2.0 — Engineering Blueprint

**Status:** Phase 1 — Foundation and baseline audit  
**Product direction:** Hybrid fragrance intelligence platform + electronic nose  
**Clients:** Web, iOS, Android  
**Principle:** Build useful software first; validate chemical sensing independently before presenting it as a working identification capability.

## 1. Product definition

Scenta is a fragrance intelligence product with two connected but independently testable capabilities:

1. **Consumer software:** fragrance search and discovery, bottle/label recognition, personal collection, fragrance journaling, comparisons, and personalized recommendations.
2. **Electronic nose:** a portable sensor device that samples volatile compounds, records sensor responses and environmental context, and sends measurements to Scenta for experimental classification.

A phone camera can identify visible packaging and text; it cannot directly measure a fragrance's airborne chemical composition. Chemical identification requires external sensing hardware or laboratory-grade analytical equipment. The product must distinguish these modalities in both its UI and its data model.

## 2. Current repository baseline

The default branch currently contains:

- React 18 + Vite web client, using React Router and Framer Motion.
- FastAPI backend with SQLAlchemy ORM and SQLite fallback.
- JWT authentication and bcrypt password hashing.
- Scikit-learn NearestNeighbors using cosine distance and a 16-value vector.
- Fragrance, user, scan, favorite, feedback, sensor-data, and training-data models.
- A sensor simulation endpoint and a web scan flow that calls that simulator.

### Confirmed limitations from source inspection

- backend/seed_data.py generates each fragrance's stored VOC signature vector from fragrance-note metadata with random values. These are synthetic demonstration features, not measured VOC fingerprints.
- backend/main.py fits the global recognition model during application startup and calls Base.metadata.create_all() and the seed routine from the lifespan handler.
- backend/ml_model.py pads short vectors and truncates long vectors to 16 values. This can silently turn malformed or incompatible readings into apparently valid inputs.
- The preprocessing divides each vector by its own maximum before fitting/transforming with StandardScaler, removing absolute response magnitude. That may discard useful concentration or response-strength information and must be evaluated, not assumed correct.
- The model's max(0, 1 - cosine_distance) output is a similarity score, not a calibrated probability of correct identification. API/UI naming should not call it probability or verified confidence.
- backend/routes/scans.py accepts a vector and optional device metadata but does not establish a validated device protocol, sampling session, sensor schema, or provenance.
- backend/routes/feedback.py verifies that a scan belongs to the current user, but accepts a fragrance_id independently of the scan's prediction and does not verify that the supplied fragrance exists or that the feedback label is internally consistent.
- backend/auth.py contains a fallback JWT secret, sets seven-day access-token expiry, and truncates passwords to 72 characters before bcrypt hashing. Production secrets and password policy need deliberate treatment.
- backend/main.py configures wildcard CORS together with credentials.
- The web client stores the bearer token in localStorage. This is a known XSS-sensitive tradeoff and should be revisited before production.
- frontend/src/pages/ScanPage.jsx directly calls the simulator, waits two seconds, then submits the generated vector. The current scan experience is therefore demo simulation, not live chemical detection.
- frontend/vite.config.js has allowedHosts: true; this is a development configuration and should not be copied into production deployment.
- Root pyproject.toml is the visible Python dependency manifest; the README's requirements.txt installation instructions do not match the files found during this audit.
- Root package.json appears to be an unrelated placeholder with a failing test script. The actual web package is frontend/package.json.
- README naming and setup instructions are stale/inconsistent (ScentID vs Scenta, placeholder clone URL, and missing Python requirements file).

This is a source-level audit only. No local install, application startup, automated tests, dependency vulnerability scan, or hardware test has been run yet.

## 3. Target architecture

### Client applications

- **Web:** retain React + Vite initially; use it for public discovery, account/collection management, and an internal research/admin workspace.
- **Mobile:** add a separate Expo + React Native + TypeScript app for iOS and Android. Use Expo development builds once native modules such as Bluetooth LE are required; Expo Go alone is not the target runtime for custom native integrations.
- **Shared contracts:** define API schemas and generated/validated TypeScript types so web and mobile use the same API contract.

### Backend and data

- Retain FastAPI as the API boundary.
- Move toward PostgreSQL for shared/production persistence; keep SQLite for isolated local tests if useful.
- Add Alembic migrations before evolving production schemas.
- Separate API routes, domain/services, persistence, device ingestion, and ML inference responsibilities.
- Add explicit configuration via environment variables and fail fast when required production secrets are missing.
- Add object storage for raw sensor sessions and model artifacts when dataset volume warrants it; do not put large time-series blobs into ordinary relational JSON fields indefinitely.
- Add background processing only when there is a measured need (for example, longer inference, image processing, or dataset jobs).

### ML lifecycle

- Keep a simple classical-ML baseline before deep learning.
- Build a reproducible dataset format with labels, sample/session IDs, device/sensor IDs, timestamps, environmental context, protocol version, and provenance.
- Compare KNN, SVM, and Random Forest on real, grouped holdout data before evaluating boosted trees or neural models.
- Track dataset versions, code revision, preprocessing, hyperparameters, metrics, and artifacts. MLflow is a candidate for experiment tracking/model registry, not a substitute for data quality.
- Use an explicit unknown/reject option and calibrated uncertainty; do not force a fragrance label when evidence is weak.
- Prevent leakage by splitting by physical sample/session, collection day, or batch—not by randomly splitting correlated rows from the same sampling run.

### Electronic nose

- Start with a repeatable sampling chamber and a small, documented sensor array.
- Record raw sensor time series plus temperature, humidity, device identity, warm-up/baseline, sampling duration, and calibration metadata.
- Evaluate sensor technologies based on selectivity, response/recovery time, stability, repeatability, power, cost, and availability. Do not assume MQ-series modules or BME680 alone can identify perfume brands.
- Use BLE as the initial phone-to-device transport where appropriate; design a versioned device protocol and test reconnection, packet loss, and firmware compatibility.
- Treat humidity compensation, sensor drift, contamination/carryover, and sampling repeatability as first-class research problems.

## 4. Product scope and sequencing

### MVP software

1. Searchable fragrance catalog with trustworthy source/provenance fields.
2. Bottle/label recognition using camera + OCR/vision, with user confirmation and a manual-search fallback.
3. Personal fragrance wardrobe, favorites, ratings, and wear journal.
4. Content-based recommendations from structured fragrance attributes; add collaborative filtering only after enough consented user interaction data exists.
5. Clear scan modes: **Bottle scan**, **Electronic nose (connected device)**, and **Demo simulation**. Never present simulated results as real sensor identification.

### Research prototype

1. Sensor bench and sampling protocol.
2. Versioned sensor-data capture and labeling.
3. Repeatability and baseline studies.
4. Classical ML baselines with grouped evaluation.
5. Mobile BLE integration after the data protocol is stable.
6. Field validation across devices, sessions, humidity, and fragrance batches.

## 5. Phase plan and exit criteria

### Phase 1 — Foundation and baseline (current)

- [x] Inspect key backend, ML, data, auth, and frontend files.
- [x] Record source-level findings and target architecture.
- [ ] Reproduce local setup from a clean checkout.
- [ ] Establish automated backend and frontend test commands.
- [ ] Add CI for lint/build/test.
- [ ] Replace stale setup documentation with verified instructions.
- [ ] Define environment configuration and secrets policy.
- [ ] Add explicit demo-vs-real data provenance to scan contracts.
- [ ] Create an API contract baseline before mobile work.

**Exit criteria:** clean setup is reproducible; tests and build run in CI; production configuration fails safely; demo data cannot be mistaken for measured sensor data; scan inputs are validated rather than silently reshaped.

### Phase 2 — Consumer product MVP

- Mobile Expo app and shared design system.
- Catalog, search, bottle OCR/recognition, collection, journal, and content-based recommendations.
- Authentication and privacy review.
- Accessibility, analytics consent, and app-store readiness.

**Exit criteria:** users can discover and manage fragrances without hardware; camera recognition has a visible confirmation/fallback path; web and mobile share stable API contracts.

### Phase 3 — Sensor research and ML validation

- Controlled sample chamber and sensor selection.
- Data capture, labeling, quality checks, and dataset versioning.
- KNN/SVM/Random Forest baselines and grouped evaluation.
- Drift, humidity, carryover, and unknown-class evaluation.

**Exit criteria:** repeatable collection protocol; documented dataset; held-out evaluation across sessions/batches; published limitations and error analysis.

### Phase 4 — Connected hardware beta

- ESP32 firmware and versioned BLE protocol.
- Device pairing, status, calibration, sampling, and transfer UX.
- End-to-end integration with mobile app and inference service.
- Pilot tests with real users and controlled conditions.

**Exit criteria:** reliable device communication and repeatable sensor measurements; model performance meets predeclared acceptance thresholds on independent samples; uncertain/unsupported samples are rejected honestly.

## 6. Engineering standards

- No secrets committed to source control.
- No wildcard credentialed CORS in production.
- Database changes use migrations.
- API inputs have explicit schemas, bounds, and provenance.
- Authentication, authorization, and ownership checks are tested.
- No training/evaluation leakage across correlated sensor sessions.
- Model outputs distinguish similarity from calibrated probability.
- Every scan records modality and provenance: simulation, camera/OCR, or physical sensor.
- Every model artifact records model version, preprocessing version, and dataset version.
- Every hardware sample records device and sensor identity plus environmental context.
- CI must pass before merging; changes should be small and reviewable.

## 7. Immediate next implementation tasks

1. Reproduce the existing application from a clean checkout and record exact commands/versions.
2. Add a minimal test harness around health, authentication, scan validation, and ML preprocessing.
3. Introduce explicit source_mode / measurement_protocol_version metadata for scans, keeping existing demo behavior clearly labeled.
4. Reject malformed vector lengths and non-finite values rather than silently padding/truncating.
5. Rename similarity fields in a versioned API change; do not silently break the existing client.
6. Add Alembic and a first migration only after schema baseline and backup strategy are established.
7. Harden production configuration and authentication in separate, tested changes.

## 8. Decisions intentionally deferred

- Final sensor bill of materials and sensor chemistry.
- Exact model architecture beyond baseline comparisons.
- Cloud provider and managed database vendor.
- Recommendation model beyond content-based baseline.
- Paid subscription design and retailer integrations.
- Production confidence thresholds until representative validation data exists.

These decisions depend on measurements, user research, or operating requirements and should not be selected by fashion.
