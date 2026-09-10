import os
import httpx
from typing import List, Dict, Optional

class AIService:
    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "openrouter")
        self.providers = self._init_providers()
    
    def _init_providers(self) -> Dict:
        providers = {}
        
        if os.getenv("OPENAI_API_KEY"):
            providers["openai"] = {
                "key": os.getenv("OPENAI_API_KEY"),
                "base": "https://api.openai.com/v1",
                "model": "gpt-4o-mini"
            }
        
        if os.getenv("GEMINI_API_KEY"):
            providers["gemini"] = {
                "key": os.getenv("GEMINI_API_KEY"),
                "base": "https://generativelanguage.googleapis.com/v1beta",
                "model": "gemini-1.5-flash"
            }
        
        if os.getenv("OPENROUTER_API_KEY"):
            providers["openrouter"] = {
                "key": os.getenv("OPENROUTER_API_KEY"),
                "base": "https://openrouter.ai/api/v1",
                "model": "anthropic/claude-3.5-sonnet"
            }
        
        return providers
    
    async def chat(self, messages: List[Dict], model: str = None) -> str:
        provider_config = self.providers.get(self.provider)
        if not provider_config:
            raise Exception(f"Provider {self.provider} not configured")
        
        if self.provider == "gemini":
            return await self._chat_gemini(messages, provider_config, model)
        else:
            return await self._chat_openai(messages, provider_config, model)
    
    async def _chat_openai(self, messages: List[Dict], config: Dict, model: str = None) -> str:
        headers = {
            "Authorization": f"Bearer {config['key']}",
            "Content-Type": "application/json"
        }
        
        if self.provider == "openrouter":
            headers["HTTP-Referer"] = os.getenv("APP_URL", "https://sellex.ru")
            headers["X-Title"] = "Sellex"
        
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{config['base']}/chat/completions",
                headers=headers,
                json={
                    "model": model or config["model"],
                    "messages": messages,
                    "max_tokens": 1000,
                    "temperature": 0.7
                }
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _chat_gemini(self, messages: List[Dict], config: Dict, model: str = None) -> str:
        contents = [
            {
                "role": "model" if m["role"] == "assistant" else "user",
                "parts": [{"text": m["content"]}]
            }
            for m in messages
        ]
        
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{config['base']}/models/{model or config['model']}:generateContent",
                headers={"x-goog-api-key": config["key"]},
                json={
                    "contents": contents,
                    "generationConfig": {"maxOutputTokens": 1000, "temperature": 0.7}
                }
            )
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    
    async def generate_description(self, product_name: str, features: List[str] = None) -> str:
        messages = [
            {"role": "system", "content": "Ты копирайтер для маркетплейсов. Создавай продающие описания."},
            {"role": "user", "content": f"Создай описание товара: {product_name}\nОсобенности: {', '.join(features or [])}"}
        ]
        return await self.chat(messages)
    
    async def generate_title(self, product_name: str, keywords: List[str] = None) -> str:
        messages = [
            {"role": "user", "content": f"Создай SEO-заголовок для: {product_name}\nКлючи: {', '.join(keywords or [])}"}
        ]
        return await self.chat(messages)
    
    async def generate_tags(self, product_name: str, description: str = "") -> List[str]:
        messages = [
            {"role": "user", "content": f"Создай 10 тегов для '{product_name}'. Через запятую."}
        ]
        result = await self.chat(messages)
        return [t.strip() for t in result.split(',') if t.strip()]