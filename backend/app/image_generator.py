from PIL import Image, ImageDraw, ImageFont
import os
import uuid
import httpx
from io import BytesIO
from typing import Dict, List

class ImageGenerator:
    TEMPLATES = {
        "modern": {
            "bg": (6, 78, 59),
            "primary": (16, 185, 129),
            "accent": (245, 158, 11),
            "text": (255, 255, 255)
        },
        "minimal": {
            "bg": (248, 248, 248),
            "primary": (6, 78, 59),
            "accent": (16, 185, 129),
            "text": (30, 41, 59)
        },
        "colorful": {
            "bg": (16, 185, 129),
            "primary": (245, 158, 11),
            "accent": (255, 255, 255),
            "text": (255, 255, 255)
        }
    }
    
    SIZES = {
        "ozon": (900, 1200),
        "wildberries": (900, 1200),
        "yandex_market": (800, 800)
    }
    
    def generate(self, data: Dict) -> Dict:
        template_name = data.get("template", "modern")
        marketplace = data.get("marketplace", "ozon")
        
        template = self.TEMPLATES.get(template_name, self.TEMPLATES["modern"])
        size = self.SIZES.get(marketplace, self.SIZES["ozon"])
        
        img = Image.new("RGB", size, template["bg"])
        draw = ImageDraw.Draw(img)
        
        # Простой градиент
        for y in range(size[1]):
            ratio = y / size[1]
            color = tuple(
                int(template["bg"][i] * (1 - ratio) + template["primary"][i] * ratio)
                for i in range(3)
            )
            draw.line([(0, y), (size[0], y)], fill=color)
        
        # Товарное изображение
        if data.get("images"):
            try:
                product_img = self._load_image(data["images"][0])
                product_img = self._resize_cover(product_img, size[0] - 100, size[1] // 2)
                img.paste(product_img, (50, 50))
            except Exception:
                pass
        
        # Название
        try:
            font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
            font_price = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
        except Exception:
            font_title = ImageFont.load_default()
            font_price = ImageFont.load_default()
        
        title = data.get("product_name", "")[:60]
        draw.text((50, size[1] // 2 + 80), title, fill=template["text"], font=font_title)
        
        # Цена
        price_text = f"{data.get('price', 0)} ₽"
        draw.text((50, size[1] - 150), price_text, fill=template["accent"], font=font_price)
        
        # Бейджи
        badges = data.get("badges", [])
        for i, badge in enumerate(badges[:3]):
            draw.text((size[0] - 300, 50 + i * 50), f"✓ {badge}", fill=template["accent"], font=font_title)
        
        # Сохранение
        output_dir = os.getenv("GENERATED_DIR", "/app/generated")
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"card_{uuid.uuid4().hex[:12]}.png"
        filepath = os.path.join(output_dir, filename)
        img.save(filepath, "PNG", optimize=True)
        
        return {
            "url": f"/generated/{filename}",
            "path": filepath,
            "width": size[0],
            "height": size[1]
        }
    
    def _load_image(self, url: str) -> Image.Image:
        if url.startswith("http"):
            response = httpx.get(url, timeout=10)
            return Image.open(BytesIO(response.content))
        return Image.open(url)
    
    def _resize_cover(self, img: Image.Image, width: int, height: int) -> Image.Image:
        ratio = max(width / img.width, height / img.height)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        left = (img.width - width) // 2
        top = (img.height - height) // 2
        return img.crop((left, top, left + width, top + height))