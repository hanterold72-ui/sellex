import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

export default function Dashboard() {
  const { user, updateCredits } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [statsRes, genRes, creditsRes] = await Promise.all([
        api.getStats(),
        api.getGenerations(),
        api.getCredits(),
      ]);
      setStats(statsRes.data);
      setGenerations(genRes.data);
      updateCredits(creditsRes.data.credits);
    } catch (err) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Toaster position="top-right" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-10">
          <h1 className="text-4xl font-black mb-2">
            Привет, <span className="gradient-text">{user?.full_name || user?.email}</span>
          </h1>
          <p className="text-white/60">Управляйте генерациями и следите за статистикой</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          {[
            { icon: '💰', value: stats?.credits, label: 'Кредитов' },
            { icon: '🖼️', value: stats?.cards_generated, label: 'Карточек' },
            { icon: '🎬', value: stats?.videos_generated, label: 'Видео' },
            { icon: '📊', value: stats?.total_generations, label: 'Всего' },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="text-3xl font-black text-primary-500">{s.value || 0}</div>
              <div className="text-sm text-white/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          <Link to="/generator?type=card" className="card hover:border-primary-500/50 hover:-translate-y-1 transition-all group">
            <div className="text-5xl mb-3">🖼️</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary-500 transition-colors">Создать карточку</h3>
            <p className="text-white/60">Для Ozon, Wildberries, Яндекс.Маркет</p>
          </Link>
          <Link to="/generator?type=video" className="card hover:border-primary-500/50 hover:-translate-y-1 transition-all group">
            <div className="text-5xl mb-3">🎬</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary-500 transition-colors">Создать видео</h3>
            <p className="text-white/60">Из ваших изображений</p>
          </Link>
        </div>

        {/* Generations */}
        <div>
          <h2 className="text-2xl font-bold mb-5">Последние генерации</h2>
          {generations.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-5">У вас пока нет генераций</p>
              <Link to="/generator" className="btn btn-primary">Создать первую</Link>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-white/60 font-medium">ID</th>
                    <th className="text-left px-6 py-4 text-white/60 font-medium">Тип</th>
                    <th className="text-left px-6 py-4 text-white/60 font-medium">Статус</th>
                    <th className="text-left px-6 py-4 text-white/60 font-medium">Дата</th>
                    <th className="text-left px-6 py-4 text-white/60 font-medium">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {generations.map((g) => (
                    <tr key={g.id} className="border-t border-white/5">
                      <td className="px-6 py-4">#{g.id}</td>
                      <td className="px-6 py-4">{g.type === 'card' ? '🖼️ Карточка' : '🎬 Видео'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          g.status === 'completed' ? 'bg-primary-500/20 text-primary-500' :
                          g.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {new Date(g.created_at).toLocaleString('ru')}
                      </td>
                      <td className="px-6 py-4">
                        {g.result_url && (
                          <a href={g.result_url} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                            Скачать
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}