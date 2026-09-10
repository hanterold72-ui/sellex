import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import Navbar from '../components/Navbar';

export default function Generator() {
  const [params] = useSearchParams();
  const type = params.get('type') || 'card';
  const navigate = useNavigate();
  const { user, updateCredits } = useAuth();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [cardForm, setCardForm] = useState({
    product_name: '',
    description: '',
    price: '',
    marketplace: 'ozon',
    template: 'modern',
    badges: '',
    use_ai: false,
  });

  const [videoForm, setVideoForm] = useState({
    product_name: '',
    video_template: 'modern',
    duration: 15,
    music: false,
  });

  const [images, setImages] = useState([]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    });
    const results = await Promise.all(readers);
    setImages((prev) => [...prev, ...results]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    if (user.credits < 5) {
      toast.error('Недостаточно кредитов');
      return;
    }
    setLoading(true);
    try {
      const data = {
        product_name: cardForm.product_name,
        description: cardForm.description,
        price: parseFloat(cardForm.price),
        marketplace: cardForm.marketplace,
        template: cardForm.template,
        badges: cardForm.badges.split(',').map((b) => b.trim()).filter(Boolean),
        images,
        use_ai: cardForm.use_ai,
      };
      const res = await api.generateCard(data);
      toast.success('Карточка создана!');
      updateCredits(res.data.credits_left);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка генерации');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    if (user.credits < 20) {
      toast.error('Недостаточно кредитов');
      return;
    }
    setLoading(true);
    try {
      const data = {
        product_name: videoForm.product_name,
        video_template: videoForm.video_template,
        duration: videoForm.duration,
        music: videoForm.music,
        images,
      };
      const res = await api.generateVideo(data);
      toast.success('Видео создано!');
      updateCredits(res.data.credits_left);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка генерации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Toaster position="top-right" />
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">
            {type === 'card' ? '🖼️ Генератор карточек' : '🎬 Генератор видео'}
          </h1>
          <p className="text-white/60">💰 Ваш баланс: {user?.credits} кредитов</p>
        </div>

        {/* Type switcher */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => navigate('/generator?type=card')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              type === 'card' ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            🖼️ Карточка
          </button>
          <button
            onClick={() => navigate('/generator?type=video')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              type === 'video' ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            🎬 Видео
          </button>
        </div>

        {result && (
          <div className="card mb-8 border-primary-500/50">
            <h3 className="text-xl font-bold mb-3 text-primary-500">✅ Готово!</h3>
            {result.result_url && (
              <div className="space-y-3">
                <img src={result.result_url} alt="Result" className="max-w-full rounded-lg" />
                <a
                  href={`${process.env.REACT_APP_API_URL}${result.result_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="btn btn-primary inline-block"
                >
                  💾 Скачать
                </a>
              </div>
            )}
          </div>
        )}

        {type === 'card' ? (
          <form onSubmit={handleCardSubmit} className="card space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Название товара *</label>
              <input
                type="text"
                value={cardForm.product_name}
                onChange={(e) => setCardForm({ ...cardForm, product_name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Описание</label>
              <textarea
                value={cardForm.description}
                onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                className="input"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Цена (₽) *</label>
                <input
                  type="number"
                  value={cardForm.price}
                  onChange={(e) => setCardForm({ ...cardForm, price: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Маркетплейс</label>
                <select
                  value={cardForm.marketplace}
                  onChange={(e) => setCardForm({ ...cardForm, marketplace: e.target.value })}
                  className="input"
                >
                  <option value="ozon">Ozon</option>
                  <option value="wildberries">Wildberries</option>
                  <option value="yandex_market">Яндекс.Маркет</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Шаблон</label>
                <select
                  value={cardForm.template}
                  onChange={(e) => setCardForm({ ...cardForm, template: e.target.value })}
                  className="input"
                >
                  <option value="modern">Современный</option>
                  <option value="minimal">Минимализм</option>
                  <option value="colorful">Яркий</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Бейджи (через запятую)</label>
                <input
                  type="text"
                  value={cardForm.badges}
                  onChange={(e) => setCardForm({ ...cardForm, badges: e.target.value })}
                  className="input"
                  placeholder="Хит, Новинка"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Изображения товара</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="input file:bg-primary-500 file:border-0 file:text-white file:px-4 file:py-2 file:rounded-lg file:mr-4"
              />
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={cardForm.use_ai}
                onChange={(e) => setCardForm({ ...cardForm, use_ai: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span>🤖 Использовать AI для оптимизации</span>
            </label>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-4 text-lg">
              {loading ? '⏳ Генерация...' : '🚀 Создать карточку (5 кредитов)'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVideoSubmit} className="card space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Название товара *</label>
              <input
                type="text"
                value={videoForm.product_name}
                onChange={(e) => setVideoForm({ ...videoForm, product_name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Шаблон</label>
                <select
                  value={videoForm.video_template}
                  onChange={(e) => setVideoForm({ ...videoForm, video_template: e.target.value })}
                  className="input"
                >
                  <option value="modern">Современный</option>
                  <option value="dynamic">Динамичный</option>
                  <option value="minimal">Минимализм</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Длительность (сек)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={videoForm.duration}
                  onChange={(e) => setVideoForm({ ...videoForm, duration: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Изображения для видео</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="input file:bg-primary-500 file:border-0 file:text-white file:px-4 file:py-2 file:rounded-lg file:mr-4"
              />
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={videoForm.music}
                onChange={(e) => setVideoForm({ ...videoForm, music: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span>🎵 Добавить музыку</span>
            </label>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-4 text-lg">
              {loading ? '⏳ Генерация...' : '🎬 Создать видео (20 кредитов)'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}