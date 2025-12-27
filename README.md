# ScentID - Shazam for Scents 👃✨

ScentID is a cross-platform mobile-first web application that identifies fragrances using VOC (Volatile Organic Compound) sensor data. Just like Shazam identifies songs by their sound, ScentID identifies perfumes, colognes, and scents by their chemical "fingerprint."

![ScentID Preview](screenshot2.png)

## 🚀 Key Features

- **Scent Scanning**: Real-time fragrance detection using machine learning.
- **ML Recognition**: Custom-built KNN model using 16-dimensional VOC vectors for high-accuracy matching.
- **Fragrance Database**: Includes 48+ premium fragrances (Chanel, Dior, Tom Ford, etc.) with detailed notes pyramids.
- **Smart Recommendations**: Suggests similar fragrances based on scent profiles.
- **Scan History & Favorites**: Keep track of everything you've discovered.
- **Interactive UI**: Mobile-first design with smooth Framer Motion animations and scanning visualizations.

## 🛠️ Technical Architecture

### Backend
- **Framework**: Python FastAPI
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: JWT with direct Bcrypt hashing
- **ML Model**: Scikit-learn NearestNeighbors (Cosine Similarity)

### Frontend
- **Framework**: React 18 (Vite)
- **Animations**: Framer Motion
- **Styles**: Modern CSS with mobile-first responsiveness

## 🧪 Machine Learning Details

The app uses a 16-dimensional vector to represent VOC (Volatile Organic Compound) signatures. 
- **Preprocessing**: StandardScaler normalization.
- **Metric**: Cosine Similarity to identify the closest match in the fragrance database.
- **Data**: Seeded with authentic fragrance data including top, middle, and base notes.

## 📱 Hardware Integration

ScentID is designed to interface with:
- **MQ-series Gas Sensors** (MQ-135, MQ-3, MQ-9)
- **BME680** Environmental Sensors
- **ESP32/Arduino** microcontrollers via Bluetooth/WiFi

*Note: In demo mode, the app simulates sensor data for testing and development.*

## 🏁 Getting Started

### Prerequisites
- Python 3.10+
- Node.js & npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/scentid.git
   cd scentid
   ```

2. **Set up the backend**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

4. **Run the application**
   ```bash
   python run.py
   ```

The app will be available at `http://localhost:5000`.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
Built with ❤️
