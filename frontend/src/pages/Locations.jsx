import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, ArrowDownUp, ArrowUpAZ, Download, Edit3, ExternalLink, Filter, MapPin, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import LocationFormModal from '../components/LocationFormModal.jsx';
import { CATEGORIES, DIRECTIONS, STATUSES } from '../utils/constants.js';
import { csvEscape, number } from '../utils/format.js';

const sortableColumns = [
  { key: 'name', label: 'Location' },
  { key: 'category', label: 'Category' },
  { key: 'area', label: 'Area' },
  { key: 'direction', label: 'Zone' },
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
  { key: 'units', label: 'Units' },
  { key: 'footfall', label: 'Footfall' },
  { key: 'contact_name', label: 'Contact' },
  { key: 'rate', label: 'Rate' },
  { key: 'status', label: 'Status' },
  { key: 'updated_at', label: 'Updated' }
];

function SortIcon({ active, order }) {
  if (!active) return <ArrowDownUp size={13} className="text-slate-300" />;
  return order === 'asc' ? <ArrowUpAZ size={14} className="text-adinn-red" /> : <ArrowDownAZ size={14} className="text-adinn-red" />;
}

function Truncated({ children, className = '' }) {
  return <span className={`block max-w-[360px] truncate ${className}`}>{children || '—'}</span>;
}

function mapUrl(row) {
  if (row.latitude !== null && row.latitude !== undefined && row.latitude !== '' && row.longitude !== null && row.longitude !== undefined && row.longitude !== '') {
    return `https://www.google.com/maps/search/?api=1&query=${row.latitude},${row.longitude}`;
  }
  return row.google_link || row.gps_location || '';
}

function gpsLabel(row) {
  if (row.latitude !== null && row.latitude !== undefined && row.latitude !== '' && row.longitude !== null && row.longitude !== undefined && row.longitude !== '') {
    return `${Number(row.latitude).toFixed(6)}, ${Number(row.longitude).toFixed(6)}`;
  }
  if (row.gps_location && !String(row.gps_location).startsWith('http')) return row.gps_location;
  return row.google_link || row.gps_location ? 'Map available' : 'Not updated';
}

export default function Locations() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', area: '', direction: '', status: '', page: 1, pageSize: 25, sortBy: 'updated_at', order: 'desc' });
  const [filterOptions, setFilterOptions] = useState({ categories: [], areas: [], directions: [], statuses: [] });
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const categories = useMemo(() => ['All', ...new Set([...CATEGORIES, ...(filterOptions.categories || [])].filter(Boolean))], [filterOptions.categories]);
  const queryFilters = useMemo(() => filters, [filters]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api.locations(queryFilters);
      setRows(response.data || []);
      setMeta({ total: response.total || 0, totalPages: response.totalPages || 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadFilters() {
    try {
      const response = await api.filters();
      setFilterOptions(response);
    } catch {
      // filters are helpful, but not blocking
    }
  }

  useEffect(() => { loadFilters(); }, []);
  useEffect(() => { load(); }, [queryFilters]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  }

  function setCategory(category) {
    updateFilter('category', category === 'All' ? '' : category);
  }

  function sortBy(column) {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      order: prev.sortBy === column && prev.order === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  }

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (editing?.id) await api.updateLocation(editing.id, payload);
      else await api.createLocation(payload);
      setModalOpen(false);
      setEditing(null);
      await Promise.all([load(), loadFilters()]);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (!confirm(`Delete ${row.name}?`)) return;
    try {
      await api.deleteLocation(row.id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function exportCsv() {
    const response = await api.locations({ ...filters, page: 1, pageSize: 100 });
    const exportRows = response.data || rows;
    const headers = ['category', 'status', 'name', 'area', 'direction', 'address', 'pincode', 'latitude', 'longitude', 'gps_location', 'google_link', 'contact_name', 'phone', 'email', 'rate', 'units', 'occupied', 'occupancy', 'footfall', 'notes'];
    const csv = [headers.join(','), ...exportRows.map((row) => headers.map((key) => csvEscape(row[key])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'adinn-bengaluru-locations.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const headerButton = (key, label) => (
    <button className="table-th-button" onClick={() => sortBy(key)}>
      {label}
      <SortIcon active={filters.sortBy === key} order={filters.order} />
    </button>
  );

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Bengaluru Location Intelligence"
        title="Locations Master Database"
        description="Clean category-wise tabs, CRUD, filters, pagination and ascending or descending sort for every important column. Data is stored permanently in Supabase."
        actions={(
          <>
            <button onClick={load} className="btn-light"><RefreshCw size={18} /> Refresh</button>
            <button onClick={exportCsv} className="btn-light"><Download size={18} /> Export CSV</button>
            <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary"><Plus size={18} /> Add Location</button>
          </>
        )}
      />

      <div className="premium-card p-4 no-print">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-800"><Filter size={17} className="text-adinn-red" /> Category tabs</div>
          <p className="text-xs font-bold text-slate-500">Click a tab to view one category at a time</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = (category === 'All' && !filters.category) || filters.category === category;
            return (
              <button key={category} onClick={() => setCategory(category)} className={`btn-tab ${active ? 'btn-tab-active' : ''}`}>
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="premium-card p-4 no-print">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
          <div className="xl:col-span-3">
            <label className="label">Search</label>
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" placeholder="Name, area, phone, email..." value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} />
            </div>
          </div>
          <div className="xl:col-span-2">
            <label className="label">Area</label>
            <input className="input" list="area-options" placeholder="Type area" value={filters.area} onChange={(e) => updateFilter('area', e.target.value)} />
            <datalist id="area-options">{(filterOptions.areas || []).map((item) => <option key={item} value={item} />)}</datalist>
          </div>
          <div className="xl:col-span-2">
            <label className="label">Zone</label>
            <select className="input" value={filters.direction} onChange={(e) => updateFilter('direction', e.target.value)}>
              <option value="">All zones</option>
              {[...new Set([...DIRECTIONS, ...(filterOptions.directions || [])].filter(Boolean))].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="xl:col-span-2">
            <label className="label">Status</label>
            <select className="input" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
              <option value="">All statuses</option>
              {[...new Set([...STATUSES, ...(filterOptions.statuses || [])])].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="xl:col-span-2">
            <label className="label">Sort by</label>
            <select className="input" value={filters.sortBy} onChange={(e) => updateFilter('sortBy', e.target.value)}>
              {sortableColumns.map((col) => <option key={col.key} value={col.key}>{col.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Rows</label>
            <select className="input" value={filters.pageSize} onChange={(e) => updateFilter('pageSize', Number(e.target.value))}>
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <button className="btn-light" onClick={() => setFilters({ search: '', category: '', area: '', direction: '', status: '', page: 1, pageSize: 25, sortBy: 'updated_at', order: 'desc' })}>Clear filters</button>
          <button className="btn-light" onClick={() => updateFilter('order', filters.order === 'asc' ? 'desc' : 'asc')}>
            {filters.order === 'asc' ? <ArrowUpAZ size={17} /> : <ArrowDownAZ size={17} />}
            {filters.order === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 font-bold text-red-700">{error}</div>}

      <div className="premium-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-black text-slate-950">{loading ? 'Loading records...' : `${number(meta.total)} records found`}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">Sorted by {sortableColumns.find((col) => col.key === filters.sortBy)?.label || filters.sortBy} · {filters.order === 'asc' ? 'ascending' : 'descending'}</p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button className="btn-light" disabled={filters.page <= 1} onClick={() => updateFilter('page', filters.page - 1)}>Previous</button>
            <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black">Page {filters.page} / {meta.totalPages || 1}</span>
            <button className="btn-light" disabled={filters.page >= meta.totalPages} onClick={() => updateFilter('page', filters.page + 1)}>Next</button>
          </div>
        </div>

        <div className="max-h-[68vh] overflow-auto">
          <table className="w-full min-w-[1360px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="table-th">{headerButton('name', 'Location')}</th>
                <th className="table-th">{headerButton('category', 'Category')}</th>
                <th className="table-th">{headerButton('area', 'Area')}</th>
                <th className="table-th">{headerButton('direction', 'Zone')}</th>
                <th className="table-th">GPS / Maps</th>
                <th className="table-th">{headerButton('units', 'Units')}</th>
                <th className="table-th">{headerButton('footfall', 'Footfall')}</th>
                <th className="table-th">{headerButton('contact_name', 'Contact')}</th>
                <th className="table-th">{headerButton('rate', 'Rate')}</th>
                <th className="table-th">{headerButton('status', 'Status')}</th>
                <th className="table-th no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="bg-white hover:bg-red-50/30">
                  <td className="table-td">
                    <Truncated className="font-black text-slate-950">{row.name}</Truncated>
                    <Truncated className="mt-1 text-xs font-semibold text-slate-500">{row.address || row.activity_suitability}</Truncated>
                  </td>
                  <td className="table-td"><Badge tone="red">{row.category || 'Other'}</Badge></td>
                  <td className="table-td"><Truncated className="font-bold">{row.area}</Truncated><p className="mt-1 text-xs font-semibold text-slate-500">{row.pincode || '—'}</p></td>
                  <td className="table-td font-bold">{row.direction || '—'}</td>
                  <td className="table-td">
                    <div className="flex min-w-[190px] items-center gap-2">
                      <MapPin size={16} className="text-adinn-red" />
                      <div>
                        <p className="max-w-[160px] truncate text-xs font-black text-slate-800">{gpsLabel(row)}</p>
                        {mapUrl(row) ? <a className="mt-1 inline-flex items-center gap-1 text-xs font-black text-adinn-red hover:underline" href={mapUrl(row)} target="_blank" rel="noreferrer">Open map <ExternalLink size={12} /></a> : <span className="text-xs font-bold text-slate-400">No map link</span>}
                      </div>
                    </div>
                  </td>
                  <td className="table-td font-black text-slate-950">{number(row.units)}</td>
                  <td className="table-td font-black text-slate-950">{number(row.footfall)}</td>
                  <td className="table-td"><Truncated className="font-bold">{row.contact_name}</Truncated><Truncated className="mt-1 text-xs font-semibold text-slate-500">{row.phone || row.email || 'Not updated'}</Truncated></td>
                  <td className="table-td font-bold">{row.rate || '—'}</td>
                  <td className="table-td"><Badge tone={row.status === 'Active' ? 'green' : row.status === 'Pending' ? 'amber' : 'gray'}>{row.status || 'Active'}</Badge></td>
                  <td className="table-td no-print">
                    <div className="flex gap-2">
                      <button className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50" onClick={() => { setEditing(row); setModalOpen(true); }} title="Edit"><Edit3 size={17} /></button>
                      <button className="rounded-xl border border-red-100 bg-white p-2 text-adinn-red hover:bg-red-50" onClick={() => handleDelete(row)} title="Delete"><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && !loading && <tr><td className="table-td text-center font-black" colSpan="11">No matching data found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <LocationFormModal open={modalOpen} initialData={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} saving={saving} />
    </div>
  );
}
