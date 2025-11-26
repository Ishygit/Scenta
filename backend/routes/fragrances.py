from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from backend.database import get_db
from backend.models import User, Fragrance, Favorite
from backend.schemas import FragranceResponse, FragranceListResponse
from backend.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/fragrances", tags=["Fragrances"])


def fragrance_to_response(fragrance: Fragrance, is_favorite: bool = False) -> FragranceResponse:
    return FragranceResponse(
        id=fragrance.id,
        name=fragrance.name,
        brand=fragrance.brand,
        description=fragrance.description,
        image_url=fragrance.image_url,
        top_notes=fragrance.top_notes or [],
        mid_notes=fragrance.mid_notes or [],
        base_notes=fragrance.base_notes or [],
        concentration=fragrance.concentration,
        gender=fragrance.gender,
        year_released=fragrance.year_released,
        longevity_hours=fragrance.longevity_hours,
        projection=fragrance.projection,
        price_min=fragrance.price_min,
        price_max=fragrance.price_max,
        price_url=fragrance.price_url,
        avg_rating=fragrance.avg_rating or 0.0,
        review_count=fragrance.review_count or 0,
        created_at=fragrance.created_at,
        is_favorite=is_favorite
    )


def fragrance_to_list_response(fragrance: Fragrance, is_favorite: bool = False) -> FragranceListResponse:
    return FragranceListResponse(
        id=fragrance.id,
        name=fragrance.name,
        brand=fragrance.brand,
        image_url=fragrance.image_url,
        top_notes=fragrance.top_notes or [],
        concentration=fragrance.concentration,
        avg_rating=fragrance.avg_rating or 0.0,
        is_favorite=is_favorite
    )


@router.get("/", response_model=List[FragranceListResponse])
async def list_fragrances(
    q: Optional[str] = None,
    brand: Optional[str] = None,
    gender: Optional[str] = None,
    concentration: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    offset: int = 0,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    query = db.query(Fragrance)
    
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Fragrance.name.ilike(search_term),
                Fragrance.brand.ilike(search_term),
                Fragrance.description.ilike(search_term)
            )
        )
    
    if brand:
        query = query.filter(Fragrance.brand.ilike(f"%{brand}%"))
    
    if gender:
        query = query.filter(Fragrance.gender == gender)
    
    if concentration:
        query = query.filter(Fragrance.concentration == concentration)
    
    fragrances = query.order_by(Fragrance.avg_rating.desc()).offset(offset).limit(limit).all()
    
    user_favorite_ids = set()
    if current_user:
        for fav in current_user.favorites:
            user_favorite_ids.add(fav.fragrance_id)
    
    return [
        fragrance_to_list_response(f, f.id in user_favorite_ids)
        for f in fragrances
    ]


@router.get("/brands", response_model=List[str])
async def list_brands(db: Session = Depends(get_db)):
    brands = db.query(Fragrance.brand).distinct().order_by(Fragrance.brand).all()
    return [b[0] for b in brands if b[0]]


@router.get("/popular", response_model=List[FragranceListResponse])
async def get_popular_fragrances(
    limit: int = Query(default=10, le=50),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    fragrances = db.query(Fragrance).order_by(
        Fragrance.avg_rating.desc(),
        Fragrance.review_count.desc()
    ).limit(limit).all()
    
    user_favorite_ids = set()
    if current_user:
        for fav in current_user.favorites:
            user_favorite_ids.add(fav.fragrance_id)
    
    return [
        fragrance_to_list_response(f, f.id in user_favorite_ids)
        for f in fragrances
    ]


@router.get("/{fragrance_id}", response_model=FragranceResponse)
async def get_fragrance(
    fragrance_id: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    fragrance = db.query(Fragrance).filter(Fragrance.id == fragrance_id).first()
    
    if not fragrance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fragrance not found"
        )
    
    is_favorite = False
    if current_user:
        favorite = db.query(Favorite).filter(
            Favorite.user_id == current_user.id,
            Favorite.fragrance_id == fragrance_id
        ).first()
        is_favorite = favorite is not None
    
    return fragrance_to_response(fragrance, is_favorite)


@router.get("/{fragrance_id}/similar", response_model=List[FragranceListResponse])
async def get_similar_fragrances(
    fragrance_id: str,
    limit: int = Query(default=5, le=20),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    fragrance = db.query(Fragrance).filter(Fragrance.id == fragrance_id).first()
    
    if not fragrance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fragrance not found"
        )
    
    similar = db.query(Fragrance).filter(
        Fragrance.id != fragrance_id,
        or_(
            Fragrance.brand == fragrance.brand,
            Fragrance.gender == fragrance.gender
        )
    ).order_by(Fragrance.avg_rating.desc()).limit(limit).all()
    
    user_favorite_ids = set()
    if current_user:
        for fav in current_user.favorites:
            user_favorite_ids.add(fav.fragrance_id)
    
    return [
        fragrance_to_list_response(f, f.id in user_favorite_ids)
        for f in similar
    ]
