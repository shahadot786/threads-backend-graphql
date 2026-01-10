# Deployment Guide

Deploy the Threads App to production using Supabase (database + auth), Render (backend), and Vercel (frontend).

## Prerequisites

- [Supabase](https://supabase.com) account (free tier works)
- [Render](https://render.com) account
- [Vercel](https://vercel.com) account
- GitHub repository with your code

---

## Step 1: Supabase Setup

Supabase provides both PostgreSQL database and authentication.

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a strong database password (save it!)
3. Select a region close to your users

### 1.2 Get API Keys

Navigate to **Settings → API** and copy:

| Key | Use In | Variable Name |
|-----|--------|---------------|
| Project URL | Backend + Frontend | `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` public | Frontend only | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` secret | Backend only | `SUPABASE_SERVICE_ROLE_KEY` |

### 1.3 Get Database URL

Navigate to **Settings → Database** and copy:

- **Connection string** (URI format) → `DATABASE_URL`
- Make sure to replace `[YOUR-PASSWORD]` with your database password

### 1.4 Configure Auth Settings

Navigate to **Authentication → URL Configuration**:

1. Set **Site URL**: `https://threads-clone-three-nu.vercel.app`
2. Add **Redirect URLs**:
   - `https://threads-clone-three-nu.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### 1.5 Configure Email Templates (Optional)

Navigate to **Authentication → Email Templates** to customize:
- Confirm signup email
- Reset password email

---

## Step 2: Render Backend Deployment

### 2.1 Create Render Web Service

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repository
3. Configure the service:

| Setting | Value |
|---------|-------|
| Name | `threads-clone-backend` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `yarn install && npx prisma generate && npx prisma migrate deploy && yarn build` |
| Start Command | `yarn start` |

### 2.2 Add Environment Variables

In your Render service **Environment** tab, add:

```env
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase Auth
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Server
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://threads-clone-three-nu.vercel.app
```

### 2.3 Deploy

Click **Create Web Service** to start the initial deployment. Render will:
1. Clone your repository
2. Run the build command
3. Start your server

> [!TIP]
> Render automatically redeploys when you push to your connected branch, or you can set up a Deploy Hook for GitHub Actions.

### 2.4 Get Backend URL

After deployment:
1. Go to your service dashboard in Render
2. Copy the URL (e.g., `https://threads-clone-6i41.onrender.com`)

---

## Step 3: Vercel Frontend Deployment

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com) and click **Add New → Project**
2. Import your GitHub repository
3. > [!IMPORTANT]
   > Set **Root Directory**: `frontend`
   > If you didn't do this during import, go to **Project Settings → General → Root Directory** and set it to `frontend`.
4. Framework Preset: **Next.js** (auto-detected)

### 3.2 Add Environment Variables

Add these in Vercel's **Environment Variables** section:

```env
# Backend API
NEXT_PUBLIC_GRAPHQL_URL=https://threads-clone-6i41.onrender.com/graphql
NEXT_PUBLIC_API_URL=https://threads-clone-6i41.onrender.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3.3 Deploy

Click **Deploy** and wait for the build to complete.

### 3.4 Update Supabase Redirect URLs

After Vercel assigns your domain, go back to **Supabase → Authentication → URL Configuration** and update:

- Site URL: `https://threads-clone-three-nu.vercel.app`
- Redirect URLs: Add `https://threads-clone-three-nu.vercel.app/auth/callback`

---

## Environment Variables Reference

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role secret key |
| `PORT` | ❌ | Server port (default: 8000) |
| `NODE_ENV` | ✅ | Set to `production` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS |

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GRAPHQL_URL` | ✅ | Backend GraphQL endpoint |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API for file uploads |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase public anon key |

---

## Post-Deployment Checklist

- [ ] Backend health check: `GET /` returns `{"message": "Hello, Threads App Backend!"}`
- [ ] GraphQL endpoint accessible: `POST /graphql`
- [ ] Frontend loads without errors
- [ ] User registration works (check email)
- [ ] Login/logout works
- [ ] Post creation works
- [ ] Image uploads work

---

## Troubleshooting

### "CORS Error"
- Ensure `FRONTEND_URL` in backend matches your Vercel domain exactly
- Check if both use HTTPS

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check Supabase is not paused (free tier pauses after inactivity)

### "Auth not working"
- Verify Supabase redirect URLs match your deployed frontend
- Check `NEXT_PUBLIC_SUPABASE_*` variables are set correctly

### "Prisma client not generated"
- Ensure build command includes `npx prisma generate`
- Check if `node_modules/.prisma` exists

---

## Custom Domain (Optional)

### Render
1. Go to **Settings → Custom Domains**
2. Add your custom domain
3. Configure DNS (CNAME to Render)

### Vercel
1. Go to **Settings → Domains**
2. Add your custom domain
3. Configure DNS (follow Vercel instructions)

---

## Monitoring Recommendations

| Service | Purpose |
|---------|---------|
| [Sentry](https://sentry.io) | Error tracking |
| [Axiom](https://axiom.co) | Logging |
| [UptimeRobot](https://uptimerobot.com) | Uptime monitoring |
| Render Metrics | Built-in CPU/Memory monitoring |
