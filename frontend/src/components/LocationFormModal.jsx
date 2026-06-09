import React, { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { CATEGORIES, DIRECTIONS, STATUSES, emptyLocation } from '../utils/constants.js';

const fields = [
  ['name', 'Location / Property Name', 'text'],
  ['area', 'Area', 'text'],
  ['address', 'Address', 'textarea'],
  ['pincode', 'Pincode', 'text'],
  ['contact_name', 'Contact Person', 'text'],
  ['phone', 'Phone', 'text'],
  ['email', 'Email', 'email'],
  ['rate', 'Rate / Rental / Commercial', 'text'],
  ['units', 'Units', 'number'],
  ['occupied', 'Occupied', 'number'],
  ['occupancy', 'Occupancy', 'text'],
  ['footfall', 'Footfall', 'number'],
  ['gst_applicable', 'GST Applicable', 'text'],
  ['google_link', 'Google Map Link', 'text'],
  ['latitude', 'Latitude', 'number'],
  ['longitude', 'Longitude', 'number'],
  ['gps_location', 'GPS Location / Map URL', 'text'],
  ['activity_suitability', 'Activity Suitability', 'text'],
  ['notes', 'Internal Notes', 'textarea']
];

function prettyJson(value) {
  try {
    return JSON.stringify(value || {}, null, 2);
  } catch {
    return '{}';
  }
}

export default function LocationFormModal({ open, initialData, onClose, onSave, saving }) {
  const [form, setForm] = useState(emptyLocation);
  const [extraJson, setExtraJson] = useState('{}');

  useEffect(() => {
    if (open) {
      const nextForm = { ...emptyLocation, ...(initialData || {}) };
      setForm(nextForm);
      setExtraJson(prettyJson(nextForm.extra));
    }
  }, [open, initialData]);

  if (!open) return null;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function submit(event) {
    event.preventDefault();
    let extra = {};
    try {
      extra = extraJson.trim() ? JSON.parse(extraJson) : {};
    } catch {
      alert('Extra imported columns must be valid JSON. Please fix that section or clear it.');
      return;
    }
    onSave({ ...form, extra });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-slate-950/60 p-4 backdrop-blur-sm no-print">
      <div className="mt-4 w-full max-w-5xl rounded-[1.5rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-adinn-red">CRUD Manager</p>
            <h2 className="mt-1 text-2xl font-black text-adinn-black">{initialData?.id ? 'Edit Location' : 'Add New Location'}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50"><X /></button>
        </div>
        <form className="p-5" onSubmit={submit}>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category || ''} onChange={(e) => update('category', e.target.value)} required>
                {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status || 'Active'} onChange={(e) => update('status', e.target.value)}>
                {STATUSES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Zone</label>
              <select className="input" value={form.direction || ''} onChange={(e) => update('direction', e.target.value)}>
                <option value="">Not set</option>
                {DIRECTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="label">City</label>
              <input className="input" value={form.city || 'Bengaluru'} onChange={(e) => update('city', e.target.value)} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {fields.map(([key, label, type]) => (
              <div key={key} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="label">{label}</label>
                {type === 'textarea' ? (
                  <textarea className="input min-h-20" value={form[key] || ''} onChange={(e) => update(key, e.target.value)} />
                ) : (
                  <input className="input" type={type} value={form[key] || ''} onChange={(e) => update(key, e.target.value)} required={key === 'name'} />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="label">Extra imported Excel columns</label>
            <p className="mb-3 text-xs font-bold text-slate-500">When you upload Excel files with extra columns, those columns are saved here as JSON so no information is lost.</p>
            <textarea className="input min-h-40 font-mono text-xs" value={extraJson} onChange={(e) => setExtraJson(e.target.value)} />
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-light">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary"><Save size={18} /> {saving ? 'Saving...' : 'Save Location'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
