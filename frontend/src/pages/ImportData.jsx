import React, { useState } from 'react';
import { CheckCircle2, Database, FileSpreadsheet, RefreshCw, UploadCloud } from 'lucide-react';
import { api } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';

function friendlyError(message = '') {
  if (/schema cache|column.*not.*found|Could not find/i.test(message)) {
    return `${message}. Run the V4 Supabase migration once: supabase db push. Then restart backend.`;
  }
  return message;
}

export default function ImportData({ setPage }) {
  const [file, setFile] = useState(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState([]);

  async function runSeed() {
    const shouldRun = confirm('This will replace the current database with the bundled ADINN Bengaluru master data. Continue?');
    if (!shouldRun) return;
    setLoading(true);
    setError('');
    setMessage('');
    setSummary([]);
    try {
      const response = await api.importSeed(true);
      setMessage(`Imported ${response.imported} records successfully. Your data is now permanently stored in Supabase.`);
      setSummary(response.sheetSummaries || []);
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  }

  async function uploadExcel() {
    if (!file) {
      setError('Choose an Excel file first.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    setSummary([]);
    try {
      const response = await api.importExcel(file, replaceExisting);
      setMessage(`Imported ${response.imported} records successfully. You only need this page again when you receive a new master Excel.`);
      setSummary(response.sheetSummaries || []);
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Permanent Data Management"
        title="Permanent Data Management"
        description="Excel is only for first setup or future refresh. This enhanced V5 importer correctly maps apartments, IT parks, malls, vendors, gyms, retail stores, canteens, government locations and hotels. Extra Excel columns are safely stored as record details. GPS latitude, longitude, GPS Location and Google Maps links are also imported when present."
        actions={<button onClick={() => setPage('locations')} className="btn-primary">Go to CRUD</button>}
      />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="premium-card overflow-hidden">
          <div className="border-b border-red-100 bg-red-50 p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-3xl bg-white p-3 text-adinn-red shadow-soft"><Database size={28} /></div>
              <div>
                <Badge tone="red">Recommended setup</Badge>
                <h2 className="mt-3 text-2xl font-black text-slate-950">Use Bundled ADINN Bengaluru Master Data</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">This project includes the corrected ADINN Bengaluru Excel importer and bundled master file. Use this once to replace wrongly imported rows with clean records.</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-2xl font-black text-adinn-red">1</p>
                <p className="mt-2 text-sm font-bold text-slate-700">Click Load Master Data once.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-2xl font-black text-adinn-red">2</p>
                <p className="mt-2 text-sm font-bold text-slate-700">Records are inserted into Supabase.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-2xl font-black text-adinn-red">3</p>
                <p className="mt-2 text-sm font-bold text-slate-700">Use CRUD without uploading again.</p>
              </div>
            </div>
            <button onClick={runSeed} disabled={loading} className="btn-primary mt-6">
              <RefreshCw size={18} /> {loading ? 'Importing...' : 'Load Master Data'}
            </button>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-3xl bg-slate-50 p-3 text-slate-800"><FileSpreadsheet size={26} /></div>
            <div className="min-w-0 flex-1">
              <Badge tone="outline">Optional future refresh</Badge>
              <h2 className="mt-3 text-2xl font-black text-slate-950">Upload Any Updated Excel Later</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Use this when you receive a new master sheet. Extra columns are stored in the record details, so the Excel does not need to match the old format exactly. If the sheet contains Latitude/Longitude/GPS columns, they will be saved into GPS fields automatically.</p>
              <div className="mt-5 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-5">
                <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm font-bold text-slate-700" />
                {file && <p className="mt-3 break-words text-sm font-black text-slate-700">Selected: {file.name}</p>}
                <label className="mt-4 flex items-start gap-3 text-sm font-bold text-slate-600">
                  <input className="mt-1" type="checkbox" checked={replaceExisting} onChange={(e) => setReplaceExisting(e.target.checked)} />
                  <span>Replace existing database records before import</span>
                </label>
              </div>
              <button onClick={uploadExcel} disabled={loading || !file} className="btn-dark mt-6">
                <UploadCloud size={18} /> {loading ? 'Uploading...' : 'Import Uploaded Excel'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && <div className="mt-6 flex items-start gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-5 font-black text-emerald-700"><CheckCircle2 size={22} /> <span>{message}</span></div>}
      {error && <div className="mt-6 rounded-3xl border border-red-100 bg-red-50 p-5 font-black text-red-700">{error}</div>}

      {!!summary.length && (
        <div className="premium-card mt-6 overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Import Summary</p>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full">
              <thead><tr><th className="table-th">Sheet</th><th className="table-th">Category</th><th className="table-th">Header Row</th><th className="table-th">Imported Rows</th><th className="table-th">Skipped Rows</th></tr></thead>
              <tbody>{summary.map((row) => <tr key={row.sheet}><td className="table-td font-black">{row.sheet}</td><td className="table-td">{row.category}</td><td className="table-td">{row.headerRow}</td><td className="table-td font-black text-adinn-red">{row.importedRows}</td><td className="table-td">{row.skippedRows || 0}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
