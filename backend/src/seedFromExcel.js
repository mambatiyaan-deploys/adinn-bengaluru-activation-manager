import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { supabase } from './supabaseClient.js';
import { parseExcelBuffer } from './excelImporter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultPath = path.resolve(__dirname, '../data/bengaluru-master.xlsx');

export async function importExcelFile({ filePath = defaultPath, replaceExisting = true } = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found: ${filePath}`);
  }
  const buffer = fs.readFileSync(filePath);
  const { records, sheetSummaries } = parseExcelBuffer(buffer);
  if (!records.length) {
    throw new Error('No records found in the Excel file.');
  }

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
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('locations').insert(batch);
    if (error) {
      error.message = `${error.message}. Failed at batch starting row ${i + 1}. If this mentions schema cache or a missing column, run: supabase db push, then restart backend.`;
      throw error;
    }
    imported += batch.length;
  }

  return { imported, sheetSummaries, replaceExisting };
}

if (process.argv[1] === __filename) {
  const keepExisting = process.argv.includes('--keep-existing');
  const customPath = process.argv.find((arg) => arg.endsWith('.xlsx'));
  importExcelFile({ filePath: customPath || defaultPath, replaceExisting: !keepExisting })
    .then((result) => {
      console.log('ADINN Bengaluru master data imported successfully.');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error.message);
      if (error.details) console.error(error.details);
      process.exit(1);
    });
}
