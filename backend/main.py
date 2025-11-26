import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager

from backend.database import engine, Base, SessionLocal
from backend.routes import auth_router, scans_router, fragrances_router, favorites_router, feedback_router
from backend.ml_model import get_model
from backend.seed_data import seed_fragrances


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    
    seed_fragrances()
    
    db = SessionLocal()
    try:
        model = get_model()
        model.fit(db)
        print("ML model fitted successfully!")
    except Exception as e:
        print(f"Warning: Could not fit ML model: {e}")
    finally:
        db.close()
    
    yield


app = FastAPI(
    title="ScentID API",
    description="Shazam for Scents - Fragrance Recognition API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(scans_router, prefix="/api")
app.include_router(fragrances_router, prefix="/api")
app.include_router(favorites_router, prefix="/api")
app.include_router(feedback_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ScentID API"}


@app.get("/api/sensor/simulate")
async def simulate_sensor_data():
    import numpy as np
    import random
    
    base_vectors = [
        [0.8, 0.6, 0.2, 0.3, 0.7, 0.5, 0.4, 0.2, 0.6, 0.3, 0.5, 0.2, 0.4, 0.3, 0.5, 0.4],
        [0.3, 0.2, 0.8, 0.7, 0.2, 0.3, 0.5, 0.6, 0.4, 0.5, 0.2, 0.1, 0.3, 0.4, 0.6, 0.7],
        [0.5, 0.4, 0.3, 0.2, 0.8, 0.9, 0.3, 0.2, 0.4, 0.3, 0.2, 0.5, 0.3, 0.2, 0.7, 0.8],
        [0.2, 0.3, 0.5, 0.4, 0.3, 0.4, 0.8, 0.7, 0.3, 0.4, 0.6, 0.5, 0.2, 0.3, 0.4, 0.5],
        [0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.5, 0.4, 0.8, 0.7, 0.4, 0.3, 0.5, 0.6, 0.3, 0.2],
    ]
    
    base = random.choice(base_vectors)
    noise = np.random.uniform(-0.1, 0.1, len(base))
    vector = np.clip(np.array(base) + noise, 0, 1).tolist()
    
    return {
        "voc_vector": vector,
        "device_id": "simulator-001",
        "temperature": round(random.uniform(20, 30), 1),
        "humidity": round(random.uniform(30, 70), 1),
        "timestamp": "simulated"
    }


if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        if full_path.startswith("api/"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        return FileResponse("frontend/dist/index.html")
else:
    @app.get("/")
    async def root():
        return {"message": "ScentID API is running. Frontend not built yet."}
