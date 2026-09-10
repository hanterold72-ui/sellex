import os
import time
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.celery_app import celery_app
from app.models import SessionLocal, Generation, User
from app.auth import get_current_user, get_db
from app.image_generator import ImageGenerator
from app.video_generator import VideoGenerator
from app.ai_service import AIService

router = APIRouter()

# ============================================
# Celery tasks
# ============================================

@celery_app.task(bind=True, name="generate_card_task", max_retries=3)
def generate_card_task(self, generation_id: int, parameters: dict):
    db = SessionLocal()
    try:
        generation = db.query(Generation).filter(Generation.id == generation_id).first()
        if not generation:
            return {"error": "Generation not found"}
        
        generation.status = "processing"
        db.commit()
        
        start = time.time()
        generator = ImageGenerator()
        result = generator.generate(parameters)
        duration = time.time() - start
        
        generation.status = "completed"
        generation.result_url = result["url"]
        generation.completed_at = datetime.utcnow()
        generation.duration = duration
        db.commit()
        
        return {"status": "success", "url": result["url"]}
    
    except Exception as e:
        generation.status = "failed"
        generation.error_message = str(e)[:500]
        db.commit()
        raise self.retry(exc=e, countdown=60)
    finally:
        db.close()

@celery_app.task(bind=True, name="generate_video_task", max_retries=3)
def generate_video_task(self, generation_id: int, parameters: dict):
    db = SessionLocal()
    try:
        generation = db.query(Generation).filter(Generation.id == generation_id).first()
        if not generation:
            return {"error": "Generation not found"}
        
        generation.status = "processing"
        db.commit()
        
        start = time.time()
        generator = VideoGenerator()
        result = generator.generate(parameters)
        duration = time.time() - start
        
        generation.status = "completed"
        generation.result_url = result["url"]
        generation.completed_at = datetime.utcnow()
        generation.duration = duration
        db.commit()
        
        return {"status": "success", "url": result["url"]}
    
    except Exception as e:
        generation.status = "failed"
        generation.error_message = str(e)[:500]
        db.commit()
        raise self.retry(exc=e, countdown=60)
    finally:
        db.close()

@celery_app.task(name="cleanup_old_files")
def cleanup_old_files():
    generated_dir = os.getenv("GENERATED_DIR", "/app/generated")
    if not os.path.isdir(generated_dir):
        return
    
    cutoff = time.time() - 7 * 24 * 3600
    for filename in os.listdir(generated_dir):
        filepath = os.path.join(generated_dir, filename)
        if os.path.isfile(filepath) and os.path.getmtime(filepath) < cutoff:
            try:
                os.remove(filepath)
            except Exception:
                pass

# ============================================
# API endpoints
# ============================================

class CardRequest(BaseModel):
    product_name: str
    description: str = ""
    price: float
    images: list = []
    marketplace: str = "ozon"
    template: str = "modern"
    badges: list = []
    use_ai: bool = False
    keywords: list = []

class VideoRequest(BaseModel):
    product_name: str
    images: list = []
    video_template: str = "modern"
    duration: int = 15
    music: bool = False

@router.post("/generate/card")
async def generate_card(
    request: CardRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.credits < 5:
        raise HTTPException(status_code=402, detail="Недостаточно кредитов")
    
    params = request.dict()
    
    # AI оптимизация
    if request.use_ai:
        try:
            ai = AIService()
            if not params.get("description"):
                params["description"] = await ai.generate_description(request.product_name)
            params["ai_title"] = await ai.generate_title(request.product_name, request.keywords)
            params["tags"] = await ai.generate_tags(request.product_name, params["description"])
        except Exception as e:
            print(f"AI error: {e}")
    
    generation = Generation(
        user_id=user.id,
        type="card",
        status="pending",
        parameters=params,
        cost=5,
        marketplace=request.marketplace
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)
    
    # Отправляем задачу
    task = generate_card_task.delay(generation.id, params)
    
    # Списываем кредиты
    user.credits -= 5
    db.commit()
    
    return {
        "success": True,
        "generation_id": generation.id,
        "task_id": task.id,
        "status": "pending",
        "credits_left": user.credits
    }

@router.post("/generate/video")
async def generate_video(
    request: VideoRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.credits < 20:
        raise HTTPException(status_code=402, detail="Недостаточно кредитов")
    
    params = request.dict()
    
    generation = Generation(
        user_id=user.id,
        type="video",
        status="pending",
        parameters=params,
        cost=20
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)
    
    task = generate_video_task.delay(generation.id, params)
    
    user.credits -= 20
    db.commit()
    
    return {
        "success": True,
        "generation_id": generation.id,
        "task_id": task.id,
        "status": "pending",
        "credits_left": user.credits
    }

@router.get("/generation/{generation_id}")
async def get_generation(
    generation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gen = db.query(Generation).filter(
        Generation.id == generation_id,
        Generation.user_id == user.id
    ).first()
    
    if not gen:
        raise HTTPException(status_code=404, detail="Not found")
    
    return {
        "id": gen.id,
        "type": gen.type,
        "status": gen.status,
        "result_url": gen.result_url,
        "error": gen.error_message,
        "created_at": gen.created_at,
        "completed_at": gen.completed_at
    }

@router.post("/ai/generate-description")
async def ai_description(
    data: dict,
    user: User = Depends(get_current_user)
):
    ai = AIService()
    description = await ai.generate_description(
        data.get("product_name", ""),
        data.get("features", [])
    )
    return {"success": True, "description": description}