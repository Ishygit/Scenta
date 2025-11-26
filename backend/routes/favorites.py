from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User, Fragrance, Favorite
from backend.schemas import FavoriteResponse, FragranceListResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])


def fragrance_to_list_response(fragrance: Fragrance, is_favorite: bool = True) -> FragranceListResponse:
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


@router.get("/", response_model=List[FavoriteResponse])
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).all()
    
    return [
        FavoriteResponse(
            id=fav.id,
            fragrance=fragrance_to_list_response(fav.fragrance),
            created_at=fav.created_at
        )
        for fav in favorites if fav.fragrance
    ]


@router.post("/{fragrance_id}", response_model=FavoriteResponse)
async def add_favorite(
    fragrance_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fragrance = db.query(Fragrance).filter(Fragrance.id == fragrance_id).first()
    
    if not fragrance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fragrance not found"
        )
    
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.fragrance_id == fragrance_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fragrance already in favorites"
        )
    
    favorite = Favorite(
        user_id=current_user.id,
        fragrance_id=fragrance_id
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    
    return FavoriteResponse(
        id=favorite.id,
        fragrance=fragrance_to_list_response(fragrance),
        created_at=favorite.created_at
    )


@router.delete("/{fragrance_id}")
async def remove_favorite(
    fragrance_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.fragrance_id == fragrance_id
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Favorite removed successfully"}


@router.get("/check/{fragrance_id}")
async def check_favorite(
    fragrance_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.fragrance_id == fragrance_id
    ).first()
    
    return {"is_favorite": favorite is not None}
