import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('YOUR_')) {
  console.warn('[ADINN API] Supabase environment is not fully configured. Update backend/.env before using database features.');
}

export const supabase = createClient(supabaseUrl || 'http://localhost:54321', serviceRoleKey || 'missing-key', {
  auth: { persistSession: false, autoRefreshToken: false }
});
