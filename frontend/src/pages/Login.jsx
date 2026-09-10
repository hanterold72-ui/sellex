import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        toast.success('Добро пожаловать!');
        navigate('/dashboard');
      } else {
        toast.error(data.detail || 'Ошибка входа');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка входа');
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
        
        <h1 className="text-3xl font-black text-center mb-2">Вход</h1>
        <p className="text-white/60 text-center mb-8">Войдите в аккаунт Sellex</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-4">
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-white/60 mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-primary-500 hover:underline font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}