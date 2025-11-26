import numpy as np
from typing import List, Tuple, Optional, Union
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sqlalchemy.orm import Session
from backend.models import Fragrance
import json


class ScentRecognitionModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.nn_model = None
        self.fragrance_ids = []
        self.is_fitted = False
        self.vector_size = 16
    
    def _parse_vector(self, raw_vector: Union[str, List[float], None]) -> Optional[List[float]]:
        if raw_vector is None:
            return None
        if isinstance(raw_vector, str):
            try:
                parsed = json.loads(raw_vector)
                if isinstance(parsed, list):
                    return [float(x) for x in parsed]
            except (json.JSONDecodeError, ValueError):
                return None
        if isinstance(raw_vector, list):
            try:
                return [float(x) for x in raw_vector]
            except (ValueError, TypeError):
                return None
        return None
    
    def preprocess_voc_vector(self, raw_vector: Union[str, List[float]]) -> Optional[np.ndarray]:
        parsed = self._parse_vector(raw_vector)
        if parsed is None:
            return None
            
        vector = np.array(parsed, dtype=np.float32)
        
        if len(vector) < self.vector_size:
            vector = np.pad(vector, (0, self.vector_size - len(vector)), mode='constant')
        elif len(vector) > self.vector_size:
            vector = vector[:self.vector_size]
        
        vector = np.clip(vector, 0, 10000)
        
        if np.max(vector) > 0:
            vector = vector / np.max(vector)
        
        return vector
    
    def fit(self, db: Session):
        fragrances = db.query(Fragrance).filter(
            Fragrance.voc_signature_vector.isnot(None)
        ).all()
        
        if len(fragrances) < 2:
            self.is_fitted = False
            return False
        
        vectors = []
        self.fragrance_ids = []
        
        for fragrance in fragrances:
            if fragrance.voc_signature_vector:
                vector = self.preprocess_voc_vector(fragrance.voc_signature_vector)
                if vector is not None:
                    vectors.append(vector)
                    self.fragrance_ids.append(fragrance.id)
        
        if len(vectors) < 2:
            self.is_fitted = False
            return False
        
        X = np.array(vectors)
        
        self.scaler.fit(X)
        X_scaled = self.scaler.transform(X)
        
        n_neighbors = min(5, len(vectors))
        self.nn_model = NearestNeighbors(n_neighbors=n_neighbors, metric='cosine')
        self.nn_model.fit(X_scaled)
        
        self.is_fitted = True
        return True
    
    def predict(self, voc_vector: Union[str, List[float]], top_k: int = 5) -> List[Tuple[str, float]]:
        if not self.is_fitted or self.nn_model is None:
            return []
        
        processed = self.preprocess_voc_vector(voc_vector)
        if processed is None:
            return []
            
        processed = processed.reshape(1, -1)
        
        scaled = self.scaler.transform(processed)
        
        distances, indices = self.nn_model.kneighbors(scaled)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            confidence = max(0, 1 - dist)
            fragrance_id = self.fragrance_ids[idx]
            results.append((fragrance_id, float(confidence)))
        
        return results[:top_k]
    
    def generate_synthetic_vector(self, notes_profile: dict) -> List[float]:
        vector = np.zeros(self.vector_size)
        
        note_mappings = {
            'citrus': [0, 1],
            'lemon': [0],
            'bergamot': [0, 1],
            'orange': [1],
            'grapefruit': [0, 1],
            'floral': [2, 3],
            'rose': [2],
            'jasmine': [2, 3],
            'lavender': [3],
            'violet': [2],
            'woody': [4, 5],
            'sandalwood': [4],
            'cedar': [5],
            'oud': [4, 5],
            'vetiver': [5],
            'spicy': [6, 7],
            'pepper': [6],
            'cinnamon': [7],
            'cardamom': [6, 7],
            'vanilla': [8, 9],
            'amber': [8],
            'musk': [9],
            'fresh': [10, 11],
            'aquatic': [10],
            'marine': [10, 11],
            'green': [11],
            'fruity': [12, 13],
            'apple': [12],
            'peach': [13],
            'berry': [12, 13],
            'oriental': [14, 15],
            'incense': [14],
            'tobacco': [15],
            'leather': [14, 15],
        }
        
        all_notes = []
        if notes_profile.get('top_notes'):
            all_notes.extend([(n, 1.0) for n in notes_profile['top_notes']])
        if notes_profile.get('mid_notes'):
            all_notes.extend([(n, 0.8) for n in notes_profile['mid_notes']])
        if notes_profile.get('base_notes'):
            all_notes.extend([(n, 0.6) for n in notes_profile['base_notes']])
        
        for note, weight in all_notes:
            note_lower = note.lower()
            for key, indices in note_mappings.items():
                if key in note_lower:
                    for idx in indices:
                        vector[idx] += weight * np.random.uniform(0.5, 1.0)
        
        vector += np.random.uniform(0, 0.1, self.vector_size)
        
        if np.max(vector) > 0:
            vector = vector / np.max(vector)
        
        return vector.tolist()


model = ScentRecognitionModel()


def get_model() -> ScentRecognitionModel:
    return model
