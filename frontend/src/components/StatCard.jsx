import React from 'react';

export default function StatCard({ label, value, note, icon: Icon }) {
  return (
    <div className="premium-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">{value}</p>
          {note && <p className="mt-2 text-sm font-bold text-slate-500">{note}</p>}
        </div>
        {Icon && <div className="rounded-2xl bg-red-50 p-3 text-adinn-red"><Icon size={22} /></div>}
      </div>
    </div>
  );
}
