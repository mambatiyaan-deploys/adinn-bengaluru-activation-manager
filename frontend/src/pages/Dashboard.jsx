import React, { useEffect, useState } from 'react';
import { Building2, Database, Layers3, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import { dateTime, number } from '../utils/format.js';

export default function Dashboard({ setPage }) {
  const [stats, setStats] = useState(null);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, locationsResponse] = await Promise.all([
        api.stats(),
        api.locations({ page: 1, pageSize: 8, sortBy: 'updated_at', order: 'desc' })
      ]);
      setStats(statsResponse);
      setLatest(locationsResponse.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const byCategory = stats?.byCategory || {};

  return (
    <div>
      <PageHeader
        eyebrow="ADINN Bengaluru Database"
        title="Activation Location Manager"
        description="A permanent Supabase-powered master database for apartments, gyms, malls, IT parks, hotels, retail stores, canteens, government locations and vendors. Upload is optional after the first import."
        actions={<button onClick={load} className="btn-light"><RefreshCw size={18} /> Refresh</button>}
      />

      {error && <div className="mb-6 rounded-3xl border border-red-100 bg-red-50 p-5 font-bold text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Records" value={loading ? '...' : number(stats?.total || 0)} note="Stored permanently in Supabase" icon={Database} />
        <StatCard label="Categories" value={loading ? '...' : Object.keys(byCategory).length} note="Client-ready activation types" icon={Layers3} />
        <StatCard label="Latest Update" value={stats?.latestUpdatedAt ? dateTime(stats.latestUpdatedAt).split(',')[0] : '—'} note={stats?.latestUpdatedAt ? dateTime(stats.latestUpdatedAt) : 'No data yet'} icon={ShieldCheck} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <div className="premium-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Category Split</p>
              <h2 className="mt-2 text-2xl font-black text-adinn-black">Activation Inventory</h2>
            </div>
            <Badge tone="red">Live Database</Badge>
          </div>
          <div className="mt-6 space-y-3">
            {Object.entries(byCategory).length === 0 && !loading ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center">
                <p className="font-black text-slate-800">No master data found yet.</p>
                <p className="mt-2 text-sm font-semibold text-slate-500">Go to Data Management and click Load Bengaluru Master Data.</p>
                <button onClick={() => setPage('import')} className="btn-primary mt-5">Load Data</button>
              </div>
            ) : Object.entries(byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-red-50 p-2 text-adinn-red"><Building2 size={17} /></div>
                  <p className="font-black text-slate-800">{category}</p>
                </div>
                <p className="text-lg font-black text-adinn-red">{number(count)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Recently Updated</p>
              <h2 className="mt-2 text-2xl font-black text-adinn-black">Latest Locations</h2>
            </div>
            <button onClick={() => setPage('locations')} className="btn-dark">View CRUD</button>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Area</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="table-td"><p className="font-black text-slate-900">{row.name}</p><p className="mt-1 text-xs font-bold text-slate-500">{row.phone || row.email || 'Contact not updated'}</p></td>
                    <td className="table-td"><Badge tone="gray">{row.category}</Badge></td>
                    <td className="table-td">{row.area || '—'}</td>
                    <td className="table-td"><Badge tone={row.status === 'Active' ? 'green' : row.status === 'Pending' ? 'amber' : 'gray'}>{row.status || 'Active'}</Badge></td>
                  </tr>
                ))}
                {!latest.length && !loading && <tr><td className="table-td text-center font-bold" colSpan="4">No data yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
