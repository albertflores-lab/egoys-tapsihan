# 🍲 Egoy's Tapsihan — Deployment Guide
### Vercel (Frontend + API) + Supabase (Database)

---

## ✅ WHAT YOU'LL NEED (All Free)

| Tool | Purpose | Sign Up |
|------|---------|---------|
| **GitHub** | Store your code | github.com |
| **Supabase** | Free PostgreSQL database | supabase.com |
| **Vercel** | Host everything (frontend + API) | vercel.com |

---

## ⏱️ ESTIMATED TIME: 20–30 minutes

---

# PART 1 — SET UP SUPABASE DATABASE

## Step 1: Create a Supabase Account
1. Go to **https://supabase.com**
2. Click **Start your project**
3. Sign up with **GitHub** (easiest) or email
4. Verify your email if needed

## Step 2: Create a New Project
1. After logging in, click **New project**
2. Fill in:
   - **Organization:** your personal org (already there)
   - **Name:** `egoys-tapsihan`
   - **Database Password:** type a strong password — **write this down!**
   - **Region:** Southeast Asia (Singapore) — closest to Philippines
3. Click **Create new project**
4. ⏳ Wait about 1 minute for it to set up (green progress bar)

## Step 3: Run the Database Setup SQL
> ✅ Unlike Aiven, Supabase SQL Editor supports the ENTIRE file at once — no splitting needed!

1. In your Supabase project, click **SQL Editor** in the left sidebar (looks like `>_`)
2. Click **New query** (or the `+` button)
3. Open the file `supabase_setup.sql` from the project folder
4. **Select ALL text** (Ctrl+A) and **copy it** (Ctrl+C)
5. **Paste** into the Supabase SQL Editor (Ctrl+V)
6. Click the green **Run** button (or press Ctrl+Enter)
7. ✅ You should see: **"Success. No rows returned"** — all 6 tables and data are created!

## Step 4: Get Your Database Connection String
1. In Supabase, click **Settings** (gear icon, bottom left)
2. Click **Database** in the settings menu
3. Scroll down to **Connection string**
4. Select the **URI** tab
5. You'll see something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcxyz.supabase.co:5432/postgres
   ```
6. Click **Copy** — this is your `DATABASE_URL`
7. ⚠️ Replace `[YOUR-PASSWORD]` with the password you set in Step 2

---

# PART 2 — UPLOAD CODE TO GITHUB

## Step 5: Create a GitHub Account (skip if you have one)
1. Go to **https://github.com** → **Sign up** → it's free

## Step 6: Create a New Repository
1. Click **+** (top right) → **New repository**
2. Fill in:
   - **Repository name:** `egoys-tapsihan`
   - **Visibility:** ✅ Public
   - ❌ Do NOT check "Add README" or any other files
3. Click **Create repository**

## Step 7: Upload Your Project Files
1. On the new repository page, click **uploading an existing file**
2. Open your `egoys_vercel` folder on your computer
3. **Select ALL files and folders** inside it:
   - `api/` folder
   - `public/` folder
   - `package.json`
   - `vercel.json`
   - `.gitignore`
   - `.env.example`
   - `supabase_setup.sql`
   - `DEPLOYMENT_GUIDE.md`
4. Drag them all into the GitHub upload area
5. At the bottom, type: `Initial commit`
6. Click **Commit changes**
7. ✅ Your files are now on GitHub!

---

# PART 3 — DEPLOY ON VERCEL

## Step 8: Create a Vercel Account
1. Go to **https://vercel.com**
2. Click **Sign Up**
3. Choose **Continue with GitHub** — this links your GitHub account automatically
4. Authorize Vercel

## Step 9: Import Your Project
1. On the Vercel dashboard, click **Add New...** → **Project**
2. You'll see your GitHub repositories listed
3. Find **egoys-tapsihan** and click **Import**

## Step 10: Configure the Project
On the configuration screen:

- **Framework Preset:** leave as `Other` (don't change it)
- **Root Directory:** leave as `.` (default)
- **Build Command:** leave empty or type `echo done`
- **Output Directory:** type `public`
- **Install Command:** `npm install`

### ⚠️ IMPORTANT: Add Environment Variables
Scroll down to **Environment Variables** and add these TWO variables:

**Variable 1:**
- Name: `DATABASE_URL`
- Value: Paste your full Supabase URI from Step 4
  ```
  postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
  ```

**Variable 2:**
- Name: `JWT_SECRET`
- Value: Type any random text like: `egoys2024tapsihansecretjwt_abc123xyz`

Click **Add** after each variable.

## Step 11: Deploy!
1. Click the **Deploy** button
2. ⏳ Wait 1–2 minutes while Vercel builds and deploys
3. ✅ You'll see **"Congratulations!"** with confetti
4. Click **Visit** to open your live website!

Your website URL will be something like:
```
https://egoys-tapsihan.vercel.app
```

---

# PART 4 — TEST YOUR LIVE WEBSITE

## Step 12: Verify Everything Works

Open your Vercel URL and test:

| Test | What to do |
|------|-----------|
| ✅ Site loads | Open your `.vercel.app` URL |
| ✅ API works | Visit `your-url.vercel.app/api/health` — should show `{"status":"ok","db":"connected"}` |
| ✅ Menu loads | Click **Menu** — 8 items should appear from the database |
| ✅ Login works | Login → **admin@egoys.com** / **admin123** |
| ✅ Admin panel | After admin login → click **Manage Content** |
| ✅ Place an order | Add items → Order → GCash → Simulate Payment |
| ✅ Database saves | In Supabase → Table Editor → orders table shows your order |

---

# 🛠️ TROUBLESHOOTING

### Site shows blank page or 404
- Check Vercel → Project → Settings → General → **Output Directory** is set to `public`
- Redeploy: Vercel → Deployments → click the three dots → Redeploy

### `/api/health` shows "db: disconnected"
- Check your `DATABASE_URL` in Vercel → Settings → Environment Variables
- Make sure the password in the URL is correct (no special characters unescaped)
- Go to Supabase → Settings → Database → make sure your project is active

### "Invalid email or password" even with correct credentials
- The SQL setup might not have run — go to Supabase → SQL Editor → run `supabase_setup.sql` again
- Check: `SELECT * FROM users;` in Supabase SQL Editor — should show 2 rows

### Menu is empty (shows local fallback data only)
- Check `/api/health` first — if DB is disconnected, fix that first
- Check Supabase → Table Editor → `menu_items` — should have 8 rows
- If empty, re-run `supabase_setup.sql`

### Changes not updating after edit
- Vercel auto-redeploys when you push to GitHub
- Go to GitHub → edit the file → commit → Vercel redeploys automatically

---

# 📁 PROJECT STRUCTURE EXPLAINED

```
egoys_vercel/
│
├── public/                    ← Your entire website (served as static files)
│   ├── index.html             ← The whole frontend app (one file)
│   ├── manifest.json          ← PWA installable app config
│   └── sw.js                  ← Service worker (offline support)
│
├── api/                       ← Backend API (Vercel Serverless Functions)
│   ├── _db.js                 ← Supabase database connection (shared)
│   ├── _auth.js               ← JWT authentication helpers (shared)
│   ├── health.js              ← GET  /api/health
│   ├── auth.js                ← POST /api/auth (login + register)
│   ├── menu.js                ← GET/POST/PUT/DELETE /api/menu
│   ├── menu-image.js          ← POST /api/menu-image (upload image)
│   ├── orders.js              ← GET/POST/PUT /api/orders
│   ├── config.js              ← GET/POST /api/config
│   └── analytics.js           ← GET /api/analytics
│
├── package.json               ← Node.js dependencies
├── vercel.json                ← Vercel deployment configuration
├── .env.example               ← Environment variables template
├── .gitignore                 ← Files to ignore in git
└── supabase_setup.sql         ← Run once in Supabase SQL Editor
```

---

# 🔑 QUICK REFERENCE

| What | Details |
|------|---------|
| Admin login | admin@egoys.com / admin123 |
| Guest login | guest@egoys.com / guest123 |
| Live website | `https://egoys-tapsihan.vercel.app` |
| API health | `https://egoys-tapsihan.vercel.app/api/health` |
| Supabase dashboard | https://supabase.com/dashboard |
| Vercel dashboard | https://vercel.com/dashboard |

---

# 🚀 HOW UPDATES WORK (After Deployment)

Once deployed, making changes is simple:
1. Edit any file in your project folder
2. Go to GitHub → your repo → click the file → click ✏️ edit icon
3. Make your changes → click **Commit changes**
4. Vercel **automatically detects** the change and redeploys in ~1 minute
5. ✅ Your live site is updated!

---

*Egoy's Tapsihan Lugawan — Semestral Project 2026*
*Stack: Vercel (Serverless) + Supabase (PostgreSQL)*
