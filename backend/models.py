import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON, Boolean, Integer
from sqlalchemy.orm import relationship
from backend.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")


class Fragrance(Base):
    __tablename__ = "fragrances"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(200), nullable=False, index=True)
    brand = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    image_url = Column(String(500))
    
    voc_signature_vector = Column(JSON)
    
    top_notes = Column(JSON)
    mid_notes = Column(JSON)
    base_notes = Column(JSON)
    
    concentration = Column(String(50))
    gender = Column(String(20))
    year_released = Column(Integer)
    
    longevity_hours = Column(Float)
    projection = Column(String(50))
    
    price_min = Column(Float)
    price_max = Column(Float)
    price_url = Column(String(500))
    
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    scans = relationship("Scan", back_populates="fragrance")
    favorites = relationship("Favorite", back_populates="fragrance", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="fragrance")


class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    fragrance_id = Column(String(36), ForeignKey("fragrances.id", ondelete="SET NULL"))
    
    raw_voc_vector = Column(JSON, nullable=False)
    confidence_score = Column(Float, nullable=False)
    
    alternative_matches = Column(JSON)
    
    scanned_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="scans")
    fragrance = relationship("Fragrance", back_populates="scans")


class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    fragrance_id = Column(String(36), ForeignKey("fragrances.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="favorites")
    fragrance = relationship("Fragrance", back_populates="favorites")


class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    fragrance_id = Column(String(36), ForeignKey("fragrances.id", ondelete="SET NULL"))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="SET NULL"))
    
    is_correct = Column(Boolean, nullable=False)
    correct_fragrance_name = Column(String(200))
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="feedback")
    fragrance = relationship("Fragrance", back_populates="feedback")


class SensorData(Base):
    __tablename__ = "sensor_data"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    device_id = Column(String(100))
    raw_readings = Column(JSON, nullable=False)
    processed_vector = Column(JSON)
    temperature = Column(Float)
    humidity = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)


class TrainingData(Base):
    __tablename__ = "training_data"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    fragrance_id = Column(String(36), ForeignKey("fragrances.id", ondelete="CASCADE"), nullable=False)
    voc_vector = Column(JSON, nullable=False)
    source = Column(String(50))
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
