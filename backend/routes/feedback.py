from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User, Feedback, Scan
from backend.schemas import FeedbackCreate, FeedbackResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(
        Scan.id == feedback_data.scan_id,
        Scan.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    existing_feedback = db.query(Feedback).filter(
        Feedback.scan_id == feedback_data.scan_id,
        Feedback.user_id == current_user.id
    ).first()
    
    if existing_feedback:
        existing_feedback.is_correct = feedback_data.is_correct
        existing_feedback.correct_fragrance_name = feedback_data.correct_fragrance_name
        existing_feedback.notes = feedback_data.notes
        db.commit()
        db.refresh(existing_feedback)
        return FeedbackResponse.model_validate(existing_feedback)
    
    feedback = Feedback(
        user_id=current_user.id,
        fragrance_id=feedback_data.fragrance_id,
        scan_id=feedback_data.scan_id,
        is_correct=feedback_data.is_correct,
        correct_fragrance_name=feedback_data.correct_fragrance_name,
        notes=feedback_data.notes
    )
    
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    return FeedbackResponse.model_validate(feedback)


@router.get("/", response_model=List[FeedbackResponse])
async def get_my_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    feedback_list = db.query(Feedback).filter(
        Feedback.user_id == current_user.id
    ).order_by(Feedback.created_at.desc()).all()
    
    return [FeedbackResponse.model_validate(f) for f in feedback_list]
