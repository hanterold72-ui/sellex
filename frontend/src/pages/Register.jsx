import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Пароль должен быть не менее 8 символов');
      return;
    }
    setLoading(true);
    try {
      const data = await register(form.email, form.password, form.fullName);
      if (data.success) {
        toast.success('Регистрация успешна!');
        navigate('/dashboard');
      } else {
        toast.error(data.detail || 'Ошибка регистрации');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-6">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-10">
        <div className="flex justify-center mb-8">
          <Logo size={60} />
        </div>
        
        <h1 className="text-3xl font-black text-center mb-2">Регистрация</h1>
        <p className="text-white/60 text-center mb-8">100 кредитов бесплатно</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Имя</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input"
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Пароль</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
              placeholder="Минимум 8 символов"
              required
              minLength={8}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-4">
            {loading ? 'Создание...' : '💎 Создать аккаунт'}
          </button>
        </form>

        <p className="text-center text-white/60 mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-primary-500 hover:underline font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}