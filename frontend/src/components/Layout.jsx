import React from 'react';
import { BarChart3, Building2, Database, FileSpreadsheet, Presentation } from 'lucide-react';

const nav = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'locations', label: 'Locations', sub: 'CRUD + filters', icon: Building2 },
  { key: 'proposal', label: 'Proposal Builder', icon: Presentation },
  { key: 'import', label: 'Data Management', icon: FileSpreadsheet }
];

export default function Layout({ page, setPage, children }) {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950 lg:flex">
      <aside className="no-print bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-r lg:border-slate-200">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <img src="/adinn-logo.png" alt="ADINN" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-adinn-red">ADINN</p>
              <p className="truncate text-lg font-black leading-tight text-slate-950">Activation Manager</p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3">
            <Database size={18} className="mt-0.5 shrink-0 text-adinn-red" />
            <div>
              <p className="text-sm font-black text-slate-900">Bengaluru master database</p>
              <p className="mt-0.5 text-xs font-bold text-slate-500">Permanent Supabase storage</p>
            </div>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 px-4 py-3 lg:block lg:space-y-1.5 lg:border-b-0 lg:p-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition lg:w-full ${active ? 'bg-adinn-red text-white shadow-redButton' : 'text-slate-700 hover:bg-red-50 hover:text-adinn-red'}`}
              >
                <Icon size={18} />
                <span className="min-w-0">
                  <span className="block whitespace-nowrap">{item.label}</span>
                  {item.sub && <span className={`block text-[11px] font-bold ${active ? 'text-white/80' : 'text-slate-400'}`}>{item.sub}</span>}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="w-full px-4 py-5 sm:px-6 lg:ml-72 lg:px-8 xl:px-9">
        <div className="mx-auto max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
