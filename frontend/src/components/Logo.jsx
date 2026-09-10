import React from 'react';

export default function Logo({ size = 40, withText = true, textSize = 'text-2xl' }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path fill="#10B981" fillRule="evenodd" d="
          M 50 0 L 100 25 L 100 50 L 50 100 L 0 50 L 0 25 Z
          M 50 15 L 20 30 L 20 40 L 50 25 Z
          M 50 15 L 80 30 L 80 40 L 50 25 Z
          M 20 50 L 50 65 L 50 75 L 20 60 Z
          M 80 50 L 50 65 L 50 55 L 80 40 Z
          M 50 75 L 35 67 L 50 90 L 65 67 Z
        "/>
      </svg>
      {withText && (
        <span className={`${textSize} font-extrabold text-primary-500 tracking-tight`}>
          sellex
        </span>
      )}
    </div>
  );
}