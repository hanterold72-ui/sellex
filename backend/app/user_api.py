from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import User, Generation, Payment, Notification, SessionLocal
from app.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/profile")
async def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "company_name": user.company_name,
        "phone": user.phone,
        "avatar_url": user.avatar_url,
        "plan": user.plan,
        "credits": user.credits,
        "created_at": user.created_at,
        "settings": user.settings or {}
    }

@router.put("/profile")
async def update_profile(
    data: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed = ["full_name", "company_name", "phone", "settings"]
    for field in allowed:
        if field in data:
            setattr(user, field, data[field])
    db.commit()
    return {"success": True}

@router.get("/stats")
async def get_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = db.query(Generation).filter(Generation.user_id == user.id).count()
    cards = db.query(Generation).filter(
        Generation.user_id == user.id,
        Generation.type == "card"
    ).count()
    videos = db.query(Generation).filter(
        Generation.user_id == user.id,
        Generation.type == "video"
    ).count()
    
    return {
        "total_generations": total,
        "cards_generated": cards,
        "videos_generated": videos,
        "credits": user.credits,
        "plan": user.plan
    }

@router.get("/generations")
async def get_generations(
    skip: int = 0,
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gens = db.query(Generation).filter(
        Generation.user_id == user.id
    ).order_by(Generation.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": g.id,
            "type": g.type,
            "status": g.status,
            "result_url": g.result_url,
            "created_at": g.created_at
        }
        for g in gens
    ]

@router.get("/notifications")
async def get_notifications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at
        }
        for n in notifs
    ]

@router.get("/credits")
async def get_credits(user: User = Depends(get_current_user)):
    return {"credits": user.credits, "plan": user.plan}