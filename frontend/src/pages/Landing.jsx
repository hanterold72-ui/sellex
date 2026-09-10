import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

export default function Landing() {
  const { user } = useAuth();

  const features = [
    { icon: '🎨', title: 'Умный дизайн', desc: 'Карточки, которые выделяются среди конкурентов' },
    { icon: '🤖', title: 'AI-оптимизация', desc: 'Идеальные заголовки и описания автоматически' },
    { icon: '⚡', title: 'Мгновенно', desc: 'Контент за секунды, а не часы' },
    { icon: '📈', title: 'Аналитика', desc: 'Отслеживайте эффективность каждой карточки' },
  ];

  const plans = [
    {
      name: 'Старт',
      price: '0 ₽',
      features: ['100 кредитов', '5 карточек', '1 видео', 'Базовые шаблоны'],
      popular: false,
      cta: 'Начать',
    },
    {
      name: 'Про',
      price: '990 ₽',
      period: '/мес',
      features: ['1000 кредитов', '50 карточек', '10 видео', 'AI-оптимизация', 'Все шаблоны'],
      popular: true,
      cta: 'Выбрать',
    },
    {
      name: 'Бизнес',
      price: '4990 ₽',
      period: '/мес',
      features: ['10000 кредитов', '500 карточек', '100 видео', 'API доступ', 'Приоритет'],
      popular: false,
      cta: 'Связаться',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 overflow-hidden pt-20">
        {/* Orbs */}
        <div className="absolute w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-60 -top-24 -left-24 animate-float" />
        <div className="absolute w-72 h-72 bg-accent-500 rounded-full blur-3xl opacity-60 -bottom-12 -right-12 animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 text-center max-w-4xl px-6">
          <div className="flex justify-center mb-10 animate-fade-up">
            <Logo size={100} />
          </div>

          <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-primary-500/30 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            ⚡ <span className="gradient-text font-bold">Продавай правильно</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Карточки, которые<br />
            <span className="bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
              продают
            </span>
          </h1>

          <p className="text-xl text-white/80 mb-10 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            Sellex — сервис генерации продающих карточек и видео
            для Ozon, Wildberries и Яндекс.Маркет
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.7s' }}>
            <Link to={user ? '/generator' : '/register'} className="btn btn-primary text-lg px-8 py-4 animate-glow">
              💎 {user ? 'Создать карточку' : 'Начать бесплатно'}
            </Link>
            <a href="#features" className="btn btn-secondary text-lg px-8 py-4">
              ▶ Смотреть демо
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.9s' }}>
            {[
              { num: '50K+', label: 'Карточек создано' },
              { num: '25K+', label: 'Видео сгенерировано' },
              { num: '3x', label: 'Рост продаж' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-black gradient-text">{s.num}</div>
                <div className="text-sm text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 gradient-text">Почему Sellex?</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Мы знаем, что нужно для успешных продаж на маркетплейсах
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-primary-500/50 hover:-translate-y-2 transition-all duration-300 text-center">
                <div className="text-6xl mb-5">{f.icon}</div>
                <h3 className="text-xl font-bold text-primary-500 mb-3">{f.title}</h3>
                <p className="text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] to-primary-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 gradient-text">Тарифы</h2>
            <p className="text-white/60 text-lg">Выберите план под ваши задачи</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-primary-500 to-primary-700 animate-glow'
                    : 'bg-white/5 border border-white/10 backdrop-blur-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent-500 to-accent-600 px-5 py-2 rounded-full text-sm font-bold text-black">
                    🔥 Популярный
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-5 text-center">{plan.name}</h3>
                <div className="text-5xl font-black text-center mb-8">
                  {plan.price}
                  {plan.period && <span className="text-base font-normal text-white/60">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-white/80">
                      <span className="text-primary-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.name === 'Бизнес' ? '/contact' : `/register?plan=${plan.name.toLowerCase()}`}
                  className={`btn w-full justify-center ${plan.popular ? 'bg-white text-primary-700 hover:bg-white/90' : 'btn-secondary'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary-500 to-primary-700 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6">Готовы увеличить продажи?</h2>
        <p className="text-xl text-white/90 mb-10">Присоединяйтесь к тысячам продавцов, которые уже используют Sellex</p>
        <Link
          to={user ? '/generator' : '/register'}
          className="inline-block bg-white text-primary-700 font-bold px-12 py-5 rounded-full text-xl hover:scale-105 transition-transform"
        >
          💎 Начать бесплатно
        </Link>
      </section>

      <Footer />
    </div>
  );
}