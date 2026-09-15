import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`bg-slate-900/70 border border-slate-800/80 rounded-2xl ${padding} backdrop-blur-sm shadow-sm ${
        hover ? 'hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
