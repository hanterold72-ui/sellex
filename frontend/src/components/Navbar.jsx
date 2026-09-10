import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-900/95 backdrop-blur-xl border-b border-primary-500/20">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo size={40} />
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <a href="/#features" className="text-white/80 hover:text-primary-500 transition-colors">Возможности</a>
          <a href="/#pricing" className="text-white/80 hover:text-primary-500 transition-colors">Тарифы</a>
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-white/80 hover:text-primary-500">Кабинет</Link>
              <span className="text-accent-500 font-bold">💰 {user.credits}</span>
              <button onClick={handleLogout} className="btn btn-secondary text-sm py-2 px-4">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white/80 hover:text-primary-500">Войти</Link>
              <Link to="/register" className="btn btn-primary text-sm py-2 px-5">
                Начать
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}