# ScentID - Shazam for Scents

## Overview
ScentID is a cross-platform mobile-first web application that replicates the functionality of Shazam, but for scent recognition. The app detects fragrances using VOC (Volatile Organic Compound) data from external sensors and uses machine learning to identify perfumes, colognes, and other fragrances.

## Current State
- **Backend**: Python FastAPI with SQLite database (PostgreSQL-ready)
- **Frontend**: React with Vite, mobile-first responsive design
- **ML Model**: Nearest-neighbor classification using VOC vectors
- **Demo Mode**: Simulated sensor data for testing

## Project Structure
```
/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application entry
│   ├── database.py         # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── auth.py             # JWT authentication
│   ├── schemas.py          # Pydantic schemas
│   ├── ml_model.py         # Scent recognition ML model
│   ├── seed_data.py        # 50+ fragrances seed data
│   └── routes/             # API route handlers
│       ├── auth.py         # Authentication endpoints
│       ├── scans.py        # Scan endpoints
│       ├── fragrances.py   # Fragrance database endpoints
│       ├── favorites.py    # User favorites endpoints
│       └── feedback.py     # User feedback endpoints
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS styles
│   │   └── utils/          # API client and auth context
│   └── package.json
└── run.py                  # Application entry point
```

## Core Features
1. **Scent Scanning**: Tap scan button, app communicates with sensor (simulated in demo mode)
2. **ML Recognition**: VOC vector processed through nearest-neighbor model
3. **Detailed Results**: Product name, brand, notes pyramid, similar fragrances
4. **Scan History**: Track all past scans
5. **Favorites**: Save and manage favorite fragrances
6. **Fragrance Search**: Browse and search 50+ fragrances
7. **User Feedback**: Help improve accuracy by confirming matches

## API Endpoints
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/scans/` - Create new scan
- `GET /api/scans/history` - Get scan history
- `GET /api/fragrances/` - Search fragrances
- `GET /api/fragrances/popular` - Get popular fragrances
- `POST /api/favorites/{id}` - Add to favorites
- `POST /api/feedback/` - Submit feedback

## Technical Details
- **Database**: SQLite (development), PostgreSQL-ready for production
- **Authentication**: JWT tokens with 7-day expiry
- **ML Model**: KNN with cosine similarity on 16-dimensional VOC vectors
- **Frontend**: React 18 + Vite + Framer Motion animations

## Hardware Integration (Future)
The app is designed to work with:
- MQ-series gas sensors (MQ-135, MQ-3, MQ-9)
- BME680 environmental sensors
- ESP32 microcontroller via Bluetooth/WiFi

## Running the App
```bash
python run.py
```
Runs on port 5000 with hot-reload enabled.
