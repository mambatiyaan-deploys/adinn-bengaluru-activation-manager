# Deployment Ready Notes

## Backend on Render

Root directory: `backend`

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variables:

```env
NODE_VERSION=20
PORT=10000
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
FRONTEND_URL=https://YOUR_VERCEL_FRONTEND_URL
AUTO_SEED_ON_START=false
```

## Frontend on Vercel

Root directory: `frontend`

Environment variable:

```env
VITE_API_BASE_URL=https://YOUR_RENDER_BACKEND_URL
```

## Before deployment

Run locally:

```bash
cd backend
npm install
npm run seed
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run build
npm run dev
```

Use Data Management only for first import or future master Excel refresh. Daily usage should happen from Locations Master Database and Proposal Builder.
