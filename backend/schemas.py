from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class FragranceBase(BaseModel):
    name: str
    brand: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    top_notes: Optional[List[str]] = None
    mid_notes: Optional[List[str]] = None
    base_notes: Optional[List[str]] = None
    concentration: Optional[str] = None
    gender: Optional[str] = None
    year_released: Optional[int] = None
    longevity_hours: Optional[float] = None
    projection: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    price_url: Optional[str] = None


class FragranceResponse(FragranceBase):
    id: str
    avg_rating: float
    review_count: int
    created_at: datetime
    is_favorite: Optional[bool] = False
    
    class Config:
        from_attributes = True


class FragranceListResponse(BaseModel):
    id: str
    name: str
    brand: str
    image_url: Optional[str]
    top_notes: Optional[List[str]]
    concentration: Optional[str]
    avg_rating: float
    is_favorite: Optional[bool] = False
    
    class Config:
        from_attributes = True


class ScanRequest(BaseModel):
    voc_vector: List[float]
    device_id: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None


class ScanMatch(BaseModel):
    fragrance: FragranceResponse
    confidence_score: float


class ScanResponse(BaseModel):
    id: str
    best_match: Optional[ScanMatch]
    alternatives: List[ScanMatch]
    scanned_at: datetime
    
    class Config:
        from_attributes = True


class ScanHistoryItem(BaseModel):
    id: str
    fragrance: Optional[FragranceListResponse]
    confidence_score: float
    scanned_at: datetime
    
    class Config:
        from_attributes = True


class FavoriteResponse(BaseModel):
    id: str
    fragrance: FragranceListResponse
    created_at: datetime
    
    class Config:
        from_attributes = True


class FeedbackCreate(BaseModel):
    scan_id: str
    fragrance_id: str
    is_correct: bool
    correct_fragrance_name: Optional[str] = None
    notes: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    is_correct: bool
    correct_fragrance_name: Optional[str]
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    per_page: int
    pages: int


class SearchQuery(BaseModel):
    q: Optional[str] = None
    brand: Optional[str] = None
    gender: Optional[str] = None
    notes: Optional[List[str]] = None
    page: int = 1
    per_page: int = 20
