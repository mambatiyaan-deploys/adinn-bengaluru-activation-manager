# ADINN Bengaluru Activation Manager GPS - V5 Enhanced

This is the stable V5-based version with a corrected Excel importer and professional ADINN red/white UI.

## Why this version exists

The later dynamic versions became too complex and interpreted the Bengaluru Excel incorrectly. This build goes back to the stable V5 base and enhances only what matters:

- Correct category-wise Excel interpretation.
- Clean professional UI.
- Permanent Supabase storage.
- CRUD, category tabs, filters, pagination and sorting.
- Flexible upload for future Excel files with different column names or extra dimensions.

## Completed modules

- Dashboard
- Locations Master Database
- Category tabs
- Search and filters
- Ascending/descending sorting
- Pagination
- Add, edit and delete records
- CSV export
- Proposal Builder
- Data Management / Excel import
- Supabase permanent database
- Render backend config
- Vercel frontend config

## Corrected Excel mapping

This build correctly maps the uploaded Bengaluru Excel:

- Apartments: Name, Area, Pincode, Direction, Units, Occupied, Occupancy, GST, Contact, Address.
- IT Parks: IT park name, contact person, phone, headcount/footfall, Google link and company notes.
- Malls: mall name, location/area, phone, landline, contact person, rate and email.
- Vendors: vendor/company name, vendor category, contact person and phone.
- Gyms: gym name, phone, rental per day, Google link/location and footfall.
- Retail stores: detects row 2 as header and maps store name, area, pincode, contact person and phone.
- CST Canteen/Govt: treats URL inside Direction as Google link, not zone.
- Hotels: hotel name, Google link, contact person, phone, email, basic rate and banquet/capacity notes.

Extra columns are saved in the `extra` JSON field so future Excel columns are not lost.

## Local setup

Use Node 20 LTS.

```bash
cd ~/Desktop/Adinn/Adinn-Projects
rm -rf bengaluru-activation-manager-v5-enhanced
unzip ~/Downloads/bengaluru-activation-manager-v5-enhanced.zip -d .
cd bengaluru-activation-manager-v5-enhanced
```

### Supabase schema

```bash
supabase link --project-ref gbrnmlcmdtgvekuftauv
supabase db push
```

### Backend

```bash
cd backend
cp .env.example .env
nano .env
npm install
npm run seed
npm run dev
```

### Frontend

Open a new terminal:

```bash
cd ~/Desktop/Adinn/Adinn-Projects/bengaluru-activation-manager-v5-enhanced/frontend
printf "VITE_API_BASE_URL=http://localhost:5001\n" > .env
npm install
npm run dev
```

Open:

```bash
open http://localhost:5173
```

## Important for your current database

Because your earlier import created wrongly interpreted rows, run this once from the enhanced backend:

```bash
npm run seed
```

This replaces the old imported rows with correctly mapped records.

## Deployment

See:

- `docs/DEPLOYMENT_READY.md`
- `docs/IMPORT_MAPPING.md`

## GPS / Map Location Support

This enhanced GPS build adds:

- `latitude`, `longitude`, and `gps_location` fields in Supabase.
- GPS fields in Add/Edit CRUD modal.
- GPS / Maps column in the Master Database table.
- CSV export with GPS columns.
- Proposal Builder map links.
- Excel import support for columns such as `Latitude`, `Longitude`, `Lat`, `Lng`, `GPS`, `GPS Location`, `Coordinates`, and Google Maps URLs containing coordinates.
- Automatic Google Maps search URL generation when exact coordinates are not available.

Important: true latitude/longitude can only be auto-filled when the Excel file already contains coordinates or the Google Maps URL contains coordinates. Short links such as `share.google/...` cannot expose coordinates without resolving them through Google/Maps. The app still creates a usable Google Maps search/open link for every record.
