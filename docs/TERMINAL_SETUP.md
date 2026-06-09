# Terminal Setup for Mac

```bash
cd ~/Desktop/Adinn/Adinn-Projects
rm -rf bengaluru-activation-manager-v3
unzip ~/Downloads/bengaluru-activation-manager-v3.zip -d .
cd bengaluru-activation-manager-v3
```

If your Supabase project is already linked from an older folder, link again in this new folder:

```bash
supabase link --project-ref gbrnmlcmdtgvekuftauv
supabase db push
```

Backend:

```bash
cd backend
npm install
cp .env.example .env
nano .env
```

Use:

```env
PORT=5001
SUPABASE_URL=https://gbrnmlcmdtgvekuftauv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE
FRONTEND_URL=http://localhost:5173
AUTO_SEED_ON_START=false
```

Import bundled data permanently:

```bash
npm run seed
npm run dev
```

Frontend in a second terminal:

```bash
cd ~/Desktop/Adinn/Adinn-Projects/bengaluru-activation-manager-v3/frontend
npm install
cp .env.example .env
printf "VITE_API_BASE_URL=http://localhost:5001\n" > .env
npm run dev
open http://localhost:5173
```
