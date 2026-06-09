import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, MapPin, Plus, Printer, Search, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { number } from '../utils/format.js';

const STORAGE_KEY = 'adinn-proposal-selection-v3';

function mapUrl(row) {
  if (row.latitude !== null && row.latitude !== undefined && row.latitude !== '' && row.longitude !== null && row.longitude !== undefined && row.longitude !== '') {
    return `https://www.google.com/maps/search/?api=1&query=${row.latitude},${row.longitude}`;
  }
  return row.google_link || row.gps_location || '';
}

export default function ProposalBuilder() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', area: '', status: 'Active', page: 1, pageSize: 20 });
  const [selected, setSelected] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(selected)); }, [selected]);

  async function load() {
    setLoading(true);
    try {
      const response = await api.locations(filters);
      setRows(response.data || []);
      setMeta({ total: response.total || 0, totalPages: response.totalPages || 1 });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters]);

  const ids = useMemo(() => new Set(selected.map((item) => item.id)), [selected]);

  function add(row) {
    if (ids.has(row.id)) return;
    setSelected((prev) => [...prev, row]);
  }

  function remove(id) {
    setSelected((prev) => prev.filter((item) => item.id !== id));
  }

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Client Presentation"
        title="Apartment Activity Proposal Builder"
        description="Filter suitable locations, add them to a client-ready proposal list and print/save as PDF. Contact-sensitive data can be edited or hidden before presenting."
        actions={<button onClick={() => window.print()} className="btn-primary"><Printer size={18} /> Print / Save PDF</button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="premium-card overflow-hidden no-print">
          <div className="border-b border-slate-100 p-5">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="label">Search</label>
                <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="input pl-11" placeholder="Search locations" value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} /></div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
                  <option value="">All</option><option>Apartment</option><option>Gym</option><option>Mall</option><option>IT Park</option><option>Hotel</option><option>Retail Store</option>
                </select>
              </div>
              <div>
                <label className="label">Area</label>
                <input className="input" value={filters.area} onChange={(e) => updateFilter('area', e.target.value)} placeholder="Area" />
              </div>
            </div>
          </div>
          <div className="max-h-[650px] overflow-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-slate-50"><tr><th className="table-th">Location</th><th className="table-th">Reach</th><th className="table-th">Add</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="table-td"><p className="font-black text-slate-950">{row.name}</p><p className="text-xs font-bold text-slate-500">{row.category} • {row.area || 'Area not set'}</p>{mapUrl(row) && <a className="mt-1 inline-flex items-center gap-1 text-xs font-black text-adinn-red hover:underline" href={mapUrl(row)} target="_blank" rel="noreferrer"><MapPin size={12} /> Map <ExternalLink size={11} /></a>}</td>
                    <td className="table-td"><p>Units: <b>{number(row.units)}</b></p><p>Footfall: <b>{number(row.footfall)}</b></p></td>
                    <td className="table-td"><button className="btn-light" disabled={ids.has(row.id)} onClick={() => add(row)}><Plus size={16} /> {ids.has(row.id) ? 'Added' : 'Add'}</button></td>
                  </tr>
                ))}
                {!rows.length && !loading && <tr><td className="table-td text-center font-black" colSpan="3">No locations found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 p-4">
            <p className="text-sm font-bold text-slate-500">{meta.total} records</p>
            <div className="flex gap-2"><button className="btn-light" disabled={filters.page <= 1} onClick={() => updateFilter('page', filters.page - 1)}>Prev</button><button className="btn-light" disabled={filters.page >= meta.totalPages} onClick={() => updateFilter('page', filters.page + 1)}>Next</button></div>
          </div>
        </div>

        <div className="premium-card overflow-hidden bg-white">
          <div className="border-b border-red-100 bg-red-50 p-6 text-slate-950">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-2"><img src="/adinn-logo.png" alt="ADINN" className="h-12 w-16 object-contain" /></div>
              <div><p className="text-xs font-black uppercase tracking-[0.25em] text-adinn-red">ADINN Advertising Services Ltd.</p><h2 className="mt-1 text-2xl font-black">Bengaluru Activation Proposal</h2></div>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">Curated apartment/activity-ready locations selected from the ADINN Bengaluru master database.</p>
          </div>
          <div className="p-6">
            <div className="mb-5 flex items-center justify-between"><Badge tone="red">{selected.length} Selected</Badge><button className="btn-light no-print" onClick={() => setSelected([])}>Clear</button></div>
            <div className="space-y-4">
              {selected.map((row, index) => (
                <div key={row.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs font-black text-adinn-red">#{index + 1} • {row.category}</p><h3 className="mt-1 text-xl font-black text-adinn-black">{row.name}</h3><p className="mt-1 text-sm font-bold text-slate-500">{row.area || 'Bengaluru'} {row.direction ? `• ${row.direction}` : ''}</p>{mapUrl(row) && <a className="mt-2 inline-flex items-center gap-1 text-xs font-black text-adinn-red hover:underline no-print" href={mapUrl(row)} target="_blank" rel="noreferrer"><MapPin size={13} /> Open GPS / Map</a>}</div>
                    <button className="rounded-xl border border-red-100 p-2 text-adinn-red hover:bg-red-50 no-print" onClick={() => remove(row.id)}><Trash2 size={17} /></button>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 md:grid-cols-3"><p><b>Units:</b> {number(row.units)}</p><p><b>Footfall:</b> {number(row.footfall)}</p><p><b>Rate:</b> {row.rate || 'On request'}</p></div>
                  {row.activity_suitability && <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">{row.activity_suitability}</p>}
                </div>
              ))}
              {!selected.length && <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center"><p className="font-black text-slate-800">No proposal locations selected yet.</p><p className="mt-2 text-sm font-semibold text-slate-500">Add locations from the left panel.</p></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
