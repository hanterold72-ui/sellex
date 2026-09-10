import React from 'react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-black py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Logo size={40} />
        </div>
        <div className="flex justify-center gap-8 mb-6 text-white/60">
          <a href="/#features" className="hover:text-primary-500 transition-colors">Возможности</a>
          <a href="/#pricing" className="hover:text-primary-500 transition-colors">Тарифы</a>
          <a href="/docs" className="hover:text-primary-500 transition-colors">API</a>
          <a href="mailto:support@sellex.ru" className="hover:text-primary-500 transition-colors">Поддержка</a>
        </div>
        <p className="text-white/40 text-sm">
          © {new Date().getFullYear()} Sellex. Все права защищены.
        </p>
      </div>
    </footer>
  );
}