from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import User, Scan, Fragrance, SensorData
from backend.schemas import ScanRequest, ScanResponse, ScanMatch, ScanHistoryItem, FragranceResponse, FragranceListResponse
from backend.auth import get_current_user, get_optional_user
from backend.ml_model import get_model

router = APIRouter(prefix="/scans", tags=["Scans"])


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


@router.post("/", response_model=ScanResponse)
async def create_scan(
    scan_data: ScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    model = get_model()
    
    if not model.is_fitted:
        model.fit(db)
    
    if scan_data.device_id:
        sensor_record = SensorData(
            device_id=scan_data.device_id,
            raw_readings=scan_data.voc_vector,
            processed_vector=scan_data.voc_vector,
            temperature=scan_data.temperature,
            humidity=scan_data.humidity
        )
        db.add(sensor_record)
    
    predictions = model.predict(scan_data.voc_vector, top_k=5)
    
    best_match = None
    alternatives = []
    best_fragrance_id = None
    best_confidence = 0.0
    
    user_favorite_ids = set()
    for fav in current_user.favorites:
        user_favorite_ids.add(fav.fragrance_id)
    
    for i, (fragrance_id, confidence) in enumerate(predictions):
        fragrance = db.query(Fragrance).filter(Fragrance.id == fragrance_id).first()
        if fragrance:
            is_favorite = fragrance.id in user_favorite_ids
            match = ScanMatch(
                fragrance=fragrance_to_response(fragrance, is_favorite),
                confidence_score=confidence
            )
            if i == 0:
                best_match = match
                best_fragrance_id = fragrance_id
                best_confidence = confidence
            else:
                alternatives.append(match)
    
    scan = Scan(
        user_id=current_user.id,
        fragrance_id=best_fragrance_id,
        raw_voc_vector=scan_data.voc_vector,
        confidence_score=best_confidence,
        alternative_matches=[{"id": f_id, "confidence": conf} for f_id, conf in predictions[1:]]
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    return ScanResponse(
        id=scan.id,
        best_match=best_match,
        alternatives=alternatives,
        scanned_at=scan.scanned_at
    )


@router.get("/history", response_model=List[ScanHistoryItem])
async def get_scan_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scans = db.query(Scan).filter(
        Scan.user_id == current_user.id
    ).order_by(Scan.scanned_at.desc()).offset(offset).limit(limit).all()
    
    user_favorite_ids = set()
    for fav in current_user.favorites:
        user_favorite_ids.add(fav.fragrance_id)
    
    results = []
    for scan in scans:
        fragrance_response = None
        if scan.fragrance:
            is_favorite = scan.fragrance.id in user_favorite_ids
            fragrance_response = fragrance_to_list_response(scan.fragrance, is_favorite)
        
        results.append(ScanHistoryItem(
            id=scan.id,
            fragrance=fragrance_response,
            confidence_score=scan.confidence_score,
            scanned_at=scan.scanned_at
        ))
    
    return results


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(
        Scan.id == scan_id,
        Scan.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    user_favorite_ids = set()
    for fav in current_user.favorites:
        user_favorite_ids.add(fav.fragrance_id)
    
    best_match = None
    if scan.fragrance:
        is_favorite = scan.fragrance.id in user_favorite_ids
        best_match = ScanMatch(
            fragrance=fragrance_to_response(scan.fragrance, is_favorite),
            confidence_score=scan.confidence_score
        )
    
    alternatives = []
    if scan.alternative_matches:
        for alt in scan.alternative_matches:
            fragrance = db.query(Fragrance).filter(Fragrance.id == alt["id"]).first()
            if fragrance:
                is_favorite = fragrance.id in user_favorite_ids
                alternatives.append(ScanMatch(
                    fragrance=fragrance_to_response(fragrance, is_favorite),
                    confidence_score=alt["confidence"]
                ))
    
    return ScanResponse(
        id=scan.id,
        best_match=best_match,
        alternatives=alternatives,
        scanned_at=scan.scanned_at
    )


@router.delete("/{scan_id}")
async def delete_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(
        Scan.id == scan_id,
        Scan.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    db.delete(scan)
    db.commit()
    
    return {"message": "Scan deleted successfully"}
