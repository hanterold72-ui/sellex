import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.plan !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.adminStats(),
        api.adminUsers({ limit: 100 }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch (err) {
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async (userId) => {
    const amount = prompt('Сколько кредитов начислить?');
    if (!amount) return;
    try {
      await api.adminAddCredits(userId, parseInt(amount));
      toast.success('Кредиты начислены');
      loadData();
    } catch (err) {
      toast.error('Ошибка');
    }
  };

  const handleToggle = async (userId) => {
    try {
      await api.adminToggleUser(userId);
      toast.success('Статус изменён');
      loadData();
    } catch (err) {
      toast.error('Ошибка');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Toaster position="top-right" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-4xl font-black mb-8">🔐 Админ-панель</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Пользователей', value: stats?.total.users },
            { label: 'Активных', value: stats?.total.active_users },
            { label: 'Генераций', value: stats?.total.generations },
            { label: 'Доход', value: `${stats?.total.revenue} ₽` },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl font-black text-primary-500">{s.value || 0}</div>
              <div className="text-sm text-white/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-white/60">ID</th>
                <th className="text-left px-6 py-4 text-white/60">Email</th>
                <th className="text-left px-6 py-4 text-white/60">План</th>
                <th className="text-left px-6 py-4 text-white/60">Кредиты</th>
                <th className="text-left px-6 py-4 text-white/60">Статус</th>
                <th className="text-left px-6 py-4 text-white/60">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="px-6 py-4">{u.id}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.plan}</td>
                  <td className="px-6 py-4">{u.credits}</td>
                  <td className="px-6 py-4">
                    <span className={u.is_active ? 'text-primary-500' : 'text-red-400'}>
                      {u.is_active ? 'Активен' : 'Заблокирован'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => handleAddCredits(u.id)} className="text-primary-500 hover:underline text-sm">
                      💰
                    </button>
                    <button onClick={() => handleToggle(u.id)} className="text-red-400 hover:underline text-sm">
                      {u.is_active ? '🚫' : '✅'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}