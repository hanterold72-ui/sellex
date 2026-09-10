import os
import uuid
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.models import User, Role, SessionLocal

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "change_me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 дней

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hash: str) -> bool:
    return pwd_context.verify(password, hash)

def create_token(user_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "email": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Универсальная авторизация: JWT или API key"""
    token = credentials.credentials
    
    # Пробуем как JWT
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if user:
            return user
    except JWTError:
        pass
    
    # Пробуем как API key
    user = db.query(User).filter(User.api_key == token, User.is_active == True).first()
    if user:
        return user
    
    raise HTTPException(status_code=401, detail="Invalid authentication")

@router.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        api_key=secrets.token_urlsafe(32),
        full_name=request.full_name,
        plan="free",
        credits=100,
        is_active=True,
        is_verified=True
    )
    
    # Добавляем роль user
    user_role = db.query(Role).filter(Role.name == "user").first()
    if user_role:
        user.roles.append(user_role)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "user_id": user.id,
        "api_key": user.api_key,
        "token": create_token(user.id, user.email),
        "credits": user.credits
    }

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    
    user.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "user_id": user.id,
        "token": create_token(user.id, user.email),
        "api_key": user.api_key,
        "email": user.email,
        "full_name": user.full_name,
        "plan": user.plan,
        "credits": user.credits
    }

@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "plan": user.plan,
        "credits": user.credits,
        "created_at": user.created_at
    }

def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.plan != "admin" and not any(r.name == "admin" for r in user.roles):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user