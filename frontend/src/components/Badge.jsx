import React from 'react';

export default function Badge({ children, tone = 'dark' }) {
  const tones = {
    dark: 'bg-slate-950 text-white',
    red: 'bg-red-50 text-adinn-red ring-1 ring-red-100',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    gray: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    outline: 'bg-white text-slate-700 ring-1 ring-slate-200'
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${tones[tone] || tones.dark}`}>{children}</span>;
}
