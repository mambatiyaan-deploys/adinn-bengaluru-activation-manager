import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { supabase } from './supabaseClient.js';
import { parseExcelBuffer } from './excelImporter.js';
import { importExcelFile } from './seedFromExcel.js';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const PORT = Number(process.env.PORT || 5001);

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: false }));
app.use(express.json({ limit: '5mb' }));

function ok(res, data = {}) {
  return res.json({ success: true, ...data });
}

function fail(res, status, message, details) {
  console.error(message, details || '');
  return res.status(status).json({ success: false, message, details: String(details || '').includes('schema cache') || String(details || '').includes('Could not find') ? `${details}. Run the V4 database migration with: supabase db push, then restart backend.` : details });
}

function pageParams(req) {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 25), 5), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

function toNullableNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(number) ? number : null;
}

const editableFields = [
  'category', 'city', 'status', 'direction', 'name', 'area', 'address', 'pincode', 'google_link',
  'latitude', 'longitude', 'gps_location',
  'contact_name', 'phone', 'email', 'rate', 'footfall', 'units', 'occupied', 'occupancy',
  'gst_applicable', 'activity_suitability', 'notes', 'extra'
];

function sanitizePayload(input = {}) {
  const payload = {};
  editableFields.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(input, key)) payload[key] = input[key];
  });
  ['footfall', 'units', 'occupied', 'latitude', 'longitude'].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) payload[key] = toNullableNumber(payload[key]);
  });
  ['name', 'category', 'city', 'status'].forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== null) payload[key] = String(payload[key]).trim();
  });
  if (!payload.city) payload.city = 'Bengaluru';
  if (!payload.status) payload.status = 'Active';
  return payload;
}

async function seedIfNeeded() {
  if (String(process.env.AUTO_SEED_ON_START).toLowerCase() !== 'true') return;
  const { count, error } = await supabase.from('locations').select('id', { count: 'exact', head: true });
  if (error) {
    console.warn('Auto-seed check failed:', error.message);
    return;
  }
  if ((count || 0) === 0) {
    console.log('No locations found. Auto-seeding ADINN Bengaluru master data...');
    const result = await importExcelFile({ replaceExisting: false });
    console.log(`Auto-seed complete. Imported ${result.imported} records.`);
  }
}

app.get('/health', (_req, res) => {
  ok(res, { message: 'ADINN API is running', time: new Date().toISOString() });
});

app.get('/api/stats', async (_req, res) => {
  try {
    const { count, error } = await supabase.from('locations').select('id', { count: 'exact', head: true });
    if (error) throw error;

    const { data: categoryRows, error: categoryError } = await supabase
      .from('locations')
      .select('category,status,updated_at')
      .limit(5000);
    if (categoryError) throw categoryError;

    const byCategory = {};
    const byStatus = {};
    let latestUpdatedAt = null;
    for (const row of categoryRows || []) {
      const category = row.category || 'Other';
      const status = row.status || 'Active';
      byCategory[category] = (byCategory[category] || 0) + 1;
      byStatus[status] = (byStatus[status] || 0) + 1;
      if (row.updated_at && (!latestUpdatedAt || row.updated_at > latestUpdatedAt)) latestUpdatedAt = row.updated_at;
    }

    ok(res, { total: count || 0, byCategory, byStatus, latestUpdatedAt });
  } catch (error) {
    fail(res, 500, 'Failed to load dashboard stats', error.message);
  }
});

app.get('/api/filters', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('locations').select('category,area,direction,status').limit(5000);
    if (error) throw error;
    const makeList = (key) => [...new Set((data || []).map((row) => row[key]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
    ok(res, {
      categories: makeList('category'),
      areas: makeList('area'),
      directions: makeList('direction'),
      statuses: makeList('status')
    });
  } catch (error) {
    fail(res, 500, 'Failed to load filters', error.message);
  }
});

app.get('/api/locations', async (req, res) => {
  try {
    const { category, search, area, direction, status, sortBy = 'updated_at', order = 'desc' } = req.query;
    const { page, pageSize, from, to } = pageParams(req);

    const allowedSort = [
      'id', 'category', 'city', 'status', 'direction', 'name', 'area', 'address', 'pincode', 'google_link',
      'latitude', 'longitude', 'gps_location',
      'contact_name', 'phone', 'email', 'rate', 'footfall', 'units', 'occupied', 'occupancy',
      'gst_applicable', 'activity_suitability', 'notes', 'source_sheet', 'source_row', 'created_at', 'updated_at'
    ];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'updated_at';

    let query = supabase
      .from('locations')
      .select('*', { count: 'exact' })
      .order(sortColumn, { ascending: order === 'asc', nullsFirst: false })
      .range(from, to);

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (area) query = query.ilike('area', `%${area}%`);
    if (direction) query = query.eq('direction', direction);
    if (search) {
      const term = `%${String(search).replace(/[%_]/g, '')}%`;
      query = query.or([
        `name.ilike.${term}`,
        `area.ilike.${term}`,
        `address.ilike.${term}`,
        `pincode.ilike.${term}`,
        `contact_name.ilike.${term}`,
        `phone.ilike.${term}`,
        `email.ilike.${term}`,
        `notes.ilike.${term}`,
        `activity_suitability.ilike.${term}`,
        `gps_location.ilike.${term}`
      ].join(','));
    }

    const { data, error, count } = await query;
    if (error) throw error;
    ok(res, { data: data || [], page, pageSize, total: count || 0, totalPages: Math.ceil((count || 0) / pageSize) });
  } catch (error) {
    fail(res, 500, 'Failed to load locations', error.message);
  }
});

app.get('/api/locations/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('locations').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    ok(res, { data });
  } catch (error) {
    fail(res, 500, 'Failed to load location', error.message);
  }
});

app.post('/api/locations', async (req, res) => {
  try {
    const payload = sanitizePayload(req.body);
    if (!payload.name) return fail(res, 400, 'Location name is required');
    if (!payload.category) return fail(res, 400, 'Category is required');
    const { data, error } = await supabase.from('locations').insert(payload).select('*').single();
    if (error) throw error;
    ok(res, { data });
  } catch (error) {
    fail(res, 500, 'Failed to create location', error.message);
  }
});

app.put('/api/locations/:id', async (req, res) => {
  try {
    const payload = sanitizePayload(req.body);
    const { data, error } = await supabase.from('locations').update(payload).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    ok(res, { data });
  } catch (error) {
    fail(res, 500, 'Failed to update location', error.message);
  }
});

app.delete('/api/locations/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('locations').delete().eq('id', req.params.id);
    if (error) throw error;
    ok(res, { deleted: true });
  } catch (error) {
    fail(res, 500, 'Failed to delete location', error.message);
  }
});

app.post('/api/locations/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return fail(res, 400, 'ids array is required');
    const { error } = await supabase.from('locations').delete().in('id', ids);
    if (error) throw error;
    ok(res, { deleted: ids.length });
  } catch (error) {
    fail(res, 500, 'Failed to delete selected locations', error.message);
  }
});

app.post('/api/import/excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return fail(res, 400, 'Excel file is required');
    const replaceExisting = String(req.body.replaceExisting || 'false') === 'true';
    const { records, sheetSummaries } = parseExcelBuffer(req.file.buffer);
    if (!records.length) return fail(res, 400, 'No usable rows found in this Excel file', sheetSummaries);

    if (replaceExisting) {
      const { error: deleteError } = await supabase
        .from('locations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (deleteError) throw deleteError;
    }

    const batchSize = 400;
    let imported = 0;
    for (let i = 0; i < records.length; i += batchSize) {
      const { error } = await supabase.from('locations').insert(records.slice(i, i + batchSize));
      if (error) throw error;
      imported += Math.min(batchSize, records.length - i);
    }
    ok(res, { imported, sheetSummaries, replaceExisting });
  } catch (error) {
    fail(res, 500, 'Excel import failed', error.message || error);
  }
});

app.post('/api/import/seed', async (req, res) => {
  try {
    const replaceExisting = req.body?.replaceExisting !== false;
    const result = await importExcelFile({ replaceExisting });
    ok(res, result);
  } catch (error) {
    fail(res, 500, 'Bundled Bengaluru master import failed', error.message || error);
  }
});

app.listen(PORT, async () => {
  console.log(`ADINN API running on http://localhost:${PORT}`);
  try {
    await seedIfNeeded();
  } catch (error) {
    console.warn('Auto-seed failed:', error.message);
  }
});
