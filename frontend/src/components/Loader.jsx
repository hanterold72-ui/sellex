import React from 'react';

export default function Loader({ text = 'Загрузка...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      <p className="text-white/60">{text}</p>
    </div>
  );
}