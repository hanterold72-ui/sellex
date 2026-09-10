import os
import uuid
import subprocess
import tempfile
from typing import Dict, List

class VideoGenerator:
    def generate(self, data: Dict) -> Dict:
        """Генерация видео из изображений"""
        images = data.get("images", [])
        duration = data.get("duration", 15)
        template = data.get("video_template", "modern")
        
        if not images:
            raise Exception("Необходимо хотя бы одно изображение")
        
        output_dir = os.getenv("GENERATED_DIR", "/app/generated")
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"video_{uuid.uuid4().hex[:12]}.mp4"
        output_path = os.path.join(output_dir, filename)
        
        # Создаём видео из изображений через ffmpeg
        with tempfile.TemporaryDirectory() as tmpdir:
            # Скачиваем изображения
            image_paths = []
            for i, url in enumerate(images):
                path = os.path.join(tmpdir, f"img_{i:03d}.jpg")
                if url.startswith("http"):
                    import httpx
                    response = httpx.get(url, timeout=10)
                    with open(path, "wb") as f:
                        f.write(response.content)
                else:
                    path = url
                image_paths.append(path)
            
            # Длительность каждого кадра
            frame_duration = duration / len(image_paths)
            
            # ffmpeg команда
            cmd = [
                "ffmpeg", "-y",
                "-framerate", f"1/{frame_duration}",
                "-i", os.path.join(tmpdir, "img_%03d.jpg"),
                "-c:v", "libx264",
                "-pix_fmt", "yuv420p",
                "-vf", "scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2",
                "-t", str(duration),
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, timeout=300)
            
            if result.returncode != 0:
                raise Exception(f"FFmpeg error: {result.stderr.decode()[:500]}")
        
        return {
            "url": f"/generated/{filename}",
            "path": output_path,
            "duration": duration
        }