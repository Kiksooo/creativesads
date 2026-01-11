# Environment Variables

## For Next.js Web (Vercel Deployment)

### Required Variables

- **JWT_SECRET** (required only if using `/api/auth/*` routes)
  - Description: Secret key for JWT token signing
  - Example: `a93f1d8c7e2b4a0f9c6d1e7b3a8c2f5a1d9e6c7b4a0f3d8c1e2b6a9f7c5d4e1`
  - Used in: `src/lib/auth/jwt.ts`
  - Note: Only required if you use local auth routes (`/api/auth/register`, `/api/auth/login`)

### Optional Variables

- **API_INTERNAL_BASE_URL** (recommended for production)
  - Description: URL of the backend API service (Render backend)
  - Example: `https://creativesads-api.onrender.com`
  - Used in: `app/api/v1/[...path]/route.ts` (proxy route)
  - Note: If not set, proxy routes will return 500 error

- **JWT_EXPIRES_IN** (optional, default: `7d`)
  - Description: JWT token expiration time
  - Example: `7d`, `30d`, `1h`
  - Used in: `src/lib/auth/jwt.ts`

- **NODE_ENV** (optional, default: `development`)
  - Description: Node environment
  - Values: `development`, `production`
  - Used in: Various places

- **PORT** (optional, default: `3000`)
  - Description: Server port (for `next start`)
  - Example: `3000`
  - Note: Vercel sets this automatically

- **NEXT_PUBLIC_SITE_URL** (optional)
  - Description: Public site URL for sitemap and robots.txt
  - Example: `https://creativesads.vercel.app`
  - Used in: `app/sitemap.xml/route.ts`, `app/robots.txt/route.ts`

- **NEXT_PUBLIC_SUPABASE_URL** (optional, for Supabase adapter)
  - Description: Supabase project URL
  - Used in: `src/lib/db/supabase.ts`
  - Note: Only needed if using Supabase database adapter

- **SUPABASE_SERVICE_ROLE_KEY** (optional, for Supabase adapter)
  - Description: Supabase service role key
  - Used in: `src/lib/db/supabase.ts`
  - Note: Only needed if using Supabase database adapter

- **OPENAI_API_KEY** (optional, for AI analysis)
  - Description: OpenAI API key for image/video analysis
  - Used in: `src/lib/ai/analyze.ts`

- **ANTHROPIC_API_KEY** (optional, for AI analysis)
  - Description: Anthropic API key for image/video analysis
  - Used in: `src/lib/ai/analyze.ts`

## For Backend API (Render Deployment)

See `../server/README.md` for backend environment variables:

- **DATABASE_URL** (required)
- **JWT_SECRET** (required)
- **NODE_ENV** (optional, default: `production`)
- **PORT** (optional, default: `10000`)
- **CORS_ORIGIN** (optional, default: `*`)

## Vercel Setup

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables:
   - `API_INTERNAL_BASE_URL` = `https://creativesads-api.onrender.com` (your Render backend URL)
   - `JWT_SECRET` = (your secret key, only if using local auth routes)
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.vercel.app` (optional)
3. Deploy or redeploy

## Render Setup (Backend API)

1. Go to Render Dashboard → Your Web Service → Environment
2. Add variables (see `../server/README.md` for details):
   - `DATABASE_URL` = (from PostgreSQL service)
   - `JWT_SECRET` = (generate strong random string)
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `*` (or specific domains)
   - `PORT` = `10000`

