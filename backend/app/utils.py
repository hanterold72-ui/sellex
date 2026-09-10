import secrets
import hashlib
from datetime import datetime

def generate_api_key() -> str:
    return secrets.token_urlsafe(32)

def hash_string(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()

def format_currency(amount: float, currency: str = "RUB") -> str:
    symbols = {"RUB": "₽", "USD": "$", "EUR": "€"}
    return f"{amount:.2f} {symbols.get(currency, currency)}"

def utcnow() -> datetime:
    return datetime.utcnow()