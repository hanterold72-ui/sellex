from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.models import User, Generation, Payment, SessionLocal
from app.auth import require_admin

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stats")
async def get_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_generations = db.query(Generation).count()
    completed = db.query(Generation).filter(Generation.status == "completed").count()
    
    revenue = db.query(func.sum(Payment.amount)).filter(Payment.status == "completed").scalar() or 0
    
    today = datetime.utcnow().date()
    today_gen = db.query(Generation).filter(Generation.created_at >= today).count()
    
    return {
        "total": {
            "users": total_users,
            "active_users": active_users,
            "generations": total_generations,
            "completed": completed,
            "revenue": float(revenue)
        },
        "today": {
            "generations": today_gen
        }
    }

@router.get("/users")
async def list_users(
    skip: int = 0,
    limit: int = 50,
    search: str = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "plan": u.plan,
                "credits": u.credits,
                "is_active": u.is_active,
                "created_at": u.created_at
            }
            for u in users
        ]
    }

@router.post("/users/{user_id}/credits")
async def add_credits(
    user_id: int,
    data: dict,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    amount = int(data.get("amount", 0))
    user.credits += amount
    db.commit()
    
    return {"success": True, "new_balance": user.credits}

@router.put("/users/{user_id}/toggle")
async def toggle_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    
    return {"success": True, "is_active": user.is_active}